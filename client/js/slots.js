const slotsContainer = document.getElementById('room');
let selectedCageId = null;
// Fetch data from server
fetch('/cages')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        data.forEach(cage => {
            const cageElement = document.createElement('div');
            cageElement.className = 'cage';
            cageElement.dataset._id = cage._id;
            cageElement.classList.add(cage.id_pet === 0 ? 'available' : 'occupied');
            cageElement.innerHTML = `
        <h3 class="cage-number">Cage #${cage.number}</h3>
        <p>Type: ${cage.type}</p>
        <p>Clean Schedule: ${cage.clean_schedule}</p>
        <p>${cage.id_pet === 0 ? 'Available' : 'Occupied by pet ID ' + cage.id_pet}</p>
    `;
            cageElement.addEventListener('click', () => {
                document.getElementById('editModal').style.display = 'block';
                document.getElementById('number').value = cage.number;
                document.getElementById('type').value = cage.type;
                document.getElementById('cleanSchedule').value = cage.clean_schedule;
                document.getElementById('status').value = cage.status;
                document.getElementById('idPet').value = cage.id_pet;
                // Retineți ID-ul cusăturii selectate pentru a fi utilizat în trimiterile către server
                selectedCageId = cage._id;
            });
            slotsContainer.appendChild(cageElement);
        });


    })
    .catch(error => console.error('Error fetching cages:', error));

// Adăugăm ușa
const doorElement = document.createElement('div');
doorElement.className = 'door';
doorElement.innerText = 'Door';
slotsContainer.appendChild(doorElement);

// Close the modal when clicking the close button
const spans = document.getElementsByClassName('close');
for (let i = 0; i < spans.length; i++) {
    spans[i].onclick = function () {
        document.getElementById('editModal').style.display = 'none';
    };
}

// Close the modal when clicking the close button inside the modal
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

// Prevent closing the modal when clicking outside or pressing Escape key
window.onclick = function (event) {
    if (event.target == document.getElementById('editModal')) {
        document.getElementById('editModal').style.display = 'block';
    }
};

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Opriți comportamentul implicit al formularului

    // Obțineți valorile din formular

    const number = document.getElementById('number').value;
    const type = document.getElementById('type').value;
    const clean_schedule = document.getElementById('cleanSchedule').value;
    const status = document.getElementById('status').value;
    const id_pet = document.getElementById('idPet').value;
    // console.log(selectedCageId);
    // console.log(number);
    // console.log(type);
    // console.log(cleanSchedule);
    // console.log(status);
    // console.log(idPet);

    // Validare
    let valid = true;
    if (!validateNumber(number)) {
        valid = false;
        showError('number', 'Please enter a valid number.');
    } else {
        hideError('number');
    }
    if (!validateType(type)) {
        valid = false;
        showError('type', 'Please enter a valid type.');
    } else {
        hideError('type');
    }
    if (!validateCleanSchedule(clean_schedule)) {
        valid = false;
        showError('cleanSchedule', 'Please enter a valid clean schedule.');
    } else {
        hideError('cleanSchedule');
    }
    if (!validateStatus(status)) {
        valid = false;
        showError('status', 'Please enter a valid status.');
    } else {
        hideError('status');
    }
    if (!validateIdPet(id_pet)) {
        valid = false;
        showError('idPet', 'Please enter a valid pet ID.');
    } else {
        hideError('idPet');
    }

    if (!valid) return;

    try {
        const response = await fetch(`/edit-cage/${selectedCageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number,
                type,
                clean_schedule,
                status,
                id_pet,
            }),
        });
        document.getElementById('editModal').style.display = 'none';
        window.location.reload();

    } catch (error) {
        console.error('Error updating cage:', error);
        alert('Error updating cage. Please try again later.');
    }
})

function validateNumber(number) {
    if(number<100) return  true;
    return false;
}

function validateType(type) {
    let types = ["cage", "aquarium", "terrarium", "kennel", "cattery"];
    if (types.includes(type)) {
        return true;
    } else {
        return false;
    }
}

function validateCleanSchedule(cleanSchedule) {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return daysOfWeek.includes(cleanSchedule.trim());
}


function validateStatus(status) {
    const validStatuses = ["free", "occupied"];
    return validStatuses.includes(status.trim().toLowerCase());
}


function validateIdPet(idPet) {
    return true;
}

// Funcții pentru afișarea și ascunderea mesajelor de eroare
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorLabel = field.nextElementSibling;
    errorLabel.textContent = message;
    errorLabel.style.display = 'block';
}

function hideError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorLabel = field.nextElementSibling;
    errorLabel.textContent = '';
    errorLabel.style.display = 'none';
}
