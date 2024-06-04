function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = formattedTime;
}

setInterval(updateClock, 1000); // Actualizează ceasul în fiecare secundă

// Obține elementul pentru mesaj
const message = document.getElementById('message');

// Funcția pentru afișarea mesajului corespunzător în funcție de ora
function showMessage() {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    if (currentHour < 8) {
        message.textContent = "Prepare for work!";
        message.classList.remove('working', 'free');
        message.classList.add('prepare');
    } else if (currentHour >= 8 && currentHour < 16) {
        const remainingHours = 16 - currentHour;
        message.textContent = `Remaining hours of work: ${remainingHours}`;
        message.classList.remove('prepare', 'free');
        message.classList.add('working');
    } else {
        message.textContent = "You are free!";
        message.classList.remove('prepare', 'working');
        message.classList.add('free');
    }
}

// Apelarea funcției showMessage pentru a afișa mesajul inițial la încărcarea paginii
showMessage();

// Actualizează mesajul și culoarea la fiecare secundă pentru a reflecta ora curentă
setInterval(showMessage, 1000);

// Obține elementul pentru containerul email-urilor
const emailContainer = document.getElementById('email-container');

/// Array-ul de emailuri primite


// Function to fetch emails from the server
function getEmails() {
    fetch('/emails')
        .then(response => response.json())
        .then(emails => {
            // Clear existing emails before adding new ones
            receivedEmails = [];

            // Add new emails to the existing array
            receivedEmails.push(...emails);

            // Display received emails
            showReceivedEmails();
        })
        .catch(error => {
            console.error('Error fetching emails:', error);
        });
}


// Call getEmails function to fetch and display emails when the page loads
getEmails();

// Funcția pentru afișarea emailurilor primite
function showReceivedEmails() {
    // Curăță containerul de emailuri
    emailContainer.innerHTML = '';

    // Parcurge array-ul de emailuri primite și afișează fiecare email în container
    receivedEmails.forEach(email => {
        const emailItem = document.createElement('li');
        emailItem.classList.add('email');
        emailItem.textContent = email.subject;
        emailItem.addEventListener('click', () => {
            showFullEmail(email.subject, email.email, email.message);
        });
        emailContainer.appendChild(emailItem);
    });
}

// Apelarea funcției pentru afișarea emailurilor primite
showReceivedEmails();

// Funcția pentru afișarea conținutului complet al email-ului
function showFullEmail(subject, email, message) {
    // Creează un element div pentru afișarea conținutului complet al email-ului
    const fullEmailDiv = document.createElement('div');
    fullEmailDiv.classList.add('full-email');

    // Adaugă subiectul, email-ul și mesajul la conținutul complet al email-ului
    fullEmailDiv.innerHTML = `
        <h2>${subject}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesaj:</strong> ${message}</p>
    `;

    // Curăță containerul de emailuri
    emailContainer.innerHTML = '';

    // Adaugă conținutul complet al email-ului la container
    emailContainer.appendChild(fullEmailDiv);
}
// Funcția pentru afișarea emailurilor primite
function showReceivedEmails() {
    // Curăță containerul de emailuri
    emailContainer.innerHTML = '';

    // Parcurge array-ul de emailuri primite și afișează fiecare email în container
    receivedEmails.forEach(email => {
        // Creează un element de tip li pentru fiecare email
        const emailItem = document.createElement('li');
        emailItem.classList.add('email');
        emailItem.textContent = email.subject;

        // Creează un container pentru detaliile complete ale emailului
        const emailDetails = document.createElement('div');
        emailDetails.classList.add('email-details');
        emailDetails.innerHTML = `
            <h2>${email.subject}</h2>
            <p><strong>Email:</strong> ${email.email}</p>
            <p><strong>Mesaj:</strong> ${email.message}</p>
        `;
        emailDetails.style.display = 'none'; // Ascunde inițial detaliile complete

        // Adaugă eveniment de clic pe elementul de tip li pentru a afișa detaliile complete
        emailItem.addEventListener('click', () => {
            // Verifică dacă detaliile complete sunt deja afișate
            const isDisplayed = emailDetails.style.display === 'block';

            // Ascunde toate detaliile complete ale emailurilor
            document.querySelectorAll('.email-details').forEach(detail => {
                detail.style.display = 'none';
            });

            // Afișează sau ascunde detaliile complete ale emailului selectat în funcție de starea anterioară
            emailDetails.style.display = isDisplayed ? 'none' : 'block';
        });

        // Adaugă elementul de tip li în containerul de emailuri
        emailContainer.appendChild(emailItem);
        // Adaugă containerul pentru detaliile complete ale emailului în containerul de emailuri
        emailContainer.appendChild(emailDetails);
    });
}

// Apelarea funcției pentru afișarea emailurilor primite
showReceivedEmails();
