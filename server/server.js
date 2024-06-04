if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const { ObjectId } = require('mongodb')
const {connectToDb, getDb } = require('./db')
const bcrypt = require('bcrypt')
const path = require('path')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const bodyParser = require('body-parser');

const initializePassport = require('./passport-config')
const { nextTick } = require('process')
initializePassport(
    passport,
    async email => await users.findOne({email: email}),
    async id => await users.findOne({_id: new ObjectId(id)}),
)

const app = express()
app.set('view engine','ejs')
app.set('views', path.join(__dirname,'..', 'client'));
app.use(express.static(path.join(__dirname, '..', 'client'))); // tells Express to serve all static files (CSS, JS, images, etc.) from the client directory.


app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(bodyParser.json());
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


// db connection
let db
let users
let clients
connectToDb((err) => {
    if(!err){
        app.listen(3000, ()=>{
            console.log('app listening on port 3000')
        })
        db = getDb()
        users = db.collection('User')
        clients = db.collection('Client')
    }
})

//routes 

// Route to handle DELETE requests for deleting pets
app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Correct usage of ObjectId constructor with 'new'
        const objectId = new ObjectId(id);

        // Delete pet document from MongoDB using the provided ID
        const result = await db.collection('Pet').deleteOne({ _id: objectId });

        if (result.deletedCount === 1) {
            res.status(200).send('Pet deleted successfully');
        } else {
            res.status(404).send('Pet not found');
        }
    } catch (error) {
        console.error('Error deleting pet:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle UPDATE requests for editing pets
app.put('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, breed, slot, status, medicalProfile } = req.body;
        const result = await db.collection('Pet').updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, breed, slot, status, medicalProfile } }
        );

        if (result.matchedCount === 1) {
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Pet not found' });
        }
    } catch (error) {
        console.error('Error editing pet:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Route to handle ADD requests for adding pets
app.post('/addPet', async (req, res) => {
    try {
        const { name, breed, slot, status, medicalProfile } = req.body;

        // Assuming you have a MongoDB database setup
        const result = await db.collection('Pet').insertOne({
            name,
            breed,
            slot,
            status,
            medicalProfile
        });

        // Check if the pet was successfully added
        console.log(result.insertedId);
        if (result.insertedId) {
            res.status(201).json({ success: true, petId: result.insertedId });
        } else {
            res.status(500).json({ success: false, message: 'Failed to add pet' });
        }
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/',checkAuthenticated, async(req, res) =>{
    let clientName = await clients.findOne({email: req.user.email},'first_name last_name')
    if(clientName){
        clientName = clientName.first_name + ' ' + clientName.last_name
    }
    const collection = db.collection('Pet')
    const pets = await collection.find({}).toArray();
    res.render('pets.ejs',{name: clientName, pets})
})
    

app.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/Pets',  // Redirecționează către pagina 'home' după autentificare
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/signup', checkNotAuthenticated, (req, res)=>{
    res.render('signup.ejs')

})

app.post('/signup', checkNotAuthenticated, async (req, res)=>{   // check if user exists only after add the user to the db
    
    try{
        const userExists =  await checkExists(req, res)
        if(userExists) return

        const {client, user} = await createUser(req)
        
        insertUser(client, user)
        res.redirect('/login')
        
    }catch{
        res.redirect('/signup')
    }

    console.log(users)

})

app.delete('/logout',(req, res, next)=>{
    req.logOut((err) =>{
        if(err){
            return next(err);
        }
        res.redirect('/login')
    });
    
})


//methods

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')

}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }

    next()

}

async function checkExists(req, res){
    try {
        const userExists = await users.findOne({ email: req.body.email });

        if (userExists) {
            console.log('User already exists!');
            return res.status(409).send('User already exists');
        }
        
        return false;

    } catch (error) {
        console.error('Error checking user existence:', error);
        return res.status(500).send('Internal Server Error');
    }
}

async function createUser(req){
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const user = {
        email: req.body.email,
        password: hashedPassword,
        role: "client",
        name: req.body.firstname+" "+req.body.lastname,
        phone: req.body.phone
    }

    const client = {
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        phone_number: req.body.phone,
        email: req.body.email,
        address: req.body.address
    }
    return { client, user }
}

async function insertUser(client, user){

    const resultUser = await users.insertOne(user)
    console.log('User added with _id: ${resultUser.isertedId}')

    const resultClient = await clients.insertOne(client)
    console.log('Client added with _id: ${resultClient.isertedId}')

}
app.get('/home', checkAuthenticated, (req, res) => {
    res.render('home.ejs'); // 'home' refers to 'home.ejs'
});

app.get('/pets', checkAuthenticated, async (req, res) => {
    let clientName = await clients.findOne({ email: req.user.email }, 'first_name last_name');
    if (clientName) {
        clientName = clientName.first_name + ' ' + clientName.last_name;
    }
    const collection = db.collection('Pet');
    const pets = await collection.find({}).toArray();
    res.render('pets', { name: clientName, pets }); // 'pets' refers to 'pets.ejs'
});

app.get('/slots', checkAuthenticated, (req, res) => {
    res.render('slots'); // 'slots' refers to 'slots.ejs'
});

app.get('/profile', checkAuthenticated, (req, res) => {
    // You can fetch and pass user profile data here if needed
    res.render('profile', { name: req.user.name, email: req.user.email, role: req.user.role, phone: req.user.phone }); // 'profile' refers to 'profile.ejs'
});

app.get('/emails', async (req, res) => {
    try {
        const emails = await db.collection('Messages').find({}).toArray();
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pentru a trimite datele pentru slots către client
app.get('/cages', checkAuthenticated, async (req, res) => {
    try {
        const cages = await db.collection('Slot').find({}).toArray();
        res.json(cages);
    } catch (error) {
        console.error('Error fetching cages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/edit-cage/:id', async (req, res) => {
    try {
        console.log(req.params);
        console.log(req.body);
        const { id } = req.params;
        const { number, type, clean_schedule, status, id_pet } = req.body;
        const result = await db.collection('Slot').updateOne(
            { _id: new ObjectId(id) },
            { $set: { number, type, clean_schedule, status, id_pet } }
        );

        if (result.matchedCount === 1) {
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Cage not found' });
        }
    } catch (error) {
        console.error('Error editing cage:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
