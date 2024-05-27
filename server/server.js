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

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


// db connection
let db
let users

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

app.get('/',checkAuthenticated, async(req, res) =>{
    let clientName = await clients.findOne({email: req.user.email},'first_name last_name')
    if(clientName){
         clientName = clientName.first_name + ' ' + clientName.last_name 
    }
    res.render('index.ejs',{name: clientName})
})
    

app.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
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
        role: "client"
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