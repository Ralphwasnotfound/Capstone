import api from './utils/api'

export function registration(form) {
    if(form.password !== form.confirmPassword) {
        alert('The Password did not match')
        return false
    }
    console.log('Registering:', form)
    alert('Registration Submmitted!')
    return true
}

export async function registerUser(payload){
    try {
        const response = await api.post('/users/register', payload)
        return { success: true, data: response.data}
    } catch (err) {
        console.error('Registration error:', err)
        return { success: false, error: err.response?.data?.error || 'Registration failed'}
    }
}

export async function deleteUser (id) {
    try {
        const response = await api.delete(`/users/${id}`)
        return { success: true, data: response.data}
    }catch (error) {
        console.log('Delete error:', error)
        return { success: false, error: error.response?.data?.error || 'Deletion failed' }
    }
}