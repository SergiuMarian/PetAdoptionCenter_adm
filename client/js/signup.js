const email = document.getElementById('email')
const reEmail =  document.getElementById('re-email')
const password = document.getElementById('password')
const rePassword =  document.getElementById('re-password')


document.querySelector('form').addEventListener('submit',function(event){
    event.preventDefault()

    if(email.value !== reEmail.value){
        alert('Emails do not match! Try Again!')
        return
    }
    if(password.value !== rePassword.value){
        alert('Passwords do not match! Try Again!')
        return
    }

    console.log('Form completed Successfully!')
    this.submit()
})