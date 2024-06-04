function openEditModal(pet) {
    document.getElementById('editPetId').value = pet._id;
    document.getElementById('editPetName').value = pet.name;
    document.getElementById('editPetBreed').value = pet.breed;
    document.getElementById('editPetSlot').value = pet.slot;
    document.getElementById('editPetStatus').value = pet.status;
    document.getElementById('editPetMedicalProfile').value = pet.medicalProfile;
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function validateInput(name,breed,slot,status,medicalProfile){
    if(!name || !breed || !slot || !slot || !medicalProfile) {
        alert("Please complete all fields");
        return null;
    }
    if(/^\d+$/.test(slot) == false) {
        alert("Choose a valid slot!");
        return null;
    }
    return 1;
}

function submitEditForm() {
    const petId = document.getElementById('editPetId').value;
    const name = document.getElementById('editPetName').value;
    const breed = document.getElementById('editPetBreed').value;
    const slot = document.getElementById('editPetSlot').value;
    const status = document.getElementById('editPetStatus').value;
    const medicalProfile = document.getElementById('editPetMedicalProfile').value;

    if(validateInput(name,breed,slot,status,medicalProfile)){
        fetch(`/edit/${petId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                breed,
                slot,
                status,
                medicalProfile
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeEditModal(); //hide the modal form
                window.location.reload(); // Reload the page to reflect changes
            } else {
                console.error('Error editing pet:', data.message);
            }
        })
        .catch(error => {
            console.error('Error editing pet:', error);
        });
    }
}

function submitAddForm() {
    const name = document.getElementById('addPetName').value;
    const breed = document.getElementById('addPetBreed').value;
    const slot = document.getElementById('addPetSlot').value;
    const status = document.getElementById('addPetStatus').value;
    const medicalProfile = document.getElementById('addPetMedicalProfile').value;

    if(validateInput(name,breed,slot,status,medicalProfile)){
        fetch(`/addPet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                breed,
                slot,
                status,
                medicalProfile
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Pet added successfully with ID:', data.petId);
                closeEditModal(); //hide the modal form
                window.location.reload(); // Reload the page to reflect changes
            } else {
                console.error('Error adding pet:', data.message);
            }
        })
        .catch(error => {
            console.error('Error adding pet:', error);
        });
    }
}

function deletePet(petId) {
    if (confirm('Are you sure you want to delete this pet?')) {
        fetch(`/delete/${petId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                document.getElementById(petId).remove(); // Remove pet's cell from the table
                location.reload                           //reload page
            } else {
                console.error('Error deleting pet:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error deleting pet:', error);
        });
    }
}