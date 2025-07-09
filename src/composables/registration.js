export function registration(form) {
    if(form.password !== form.confirmPassword) {
        alert('The Password did not match')
        return false
    }
    console.log('Registering:', form)
    alert('Registration Submmitted!')
    return true
}

