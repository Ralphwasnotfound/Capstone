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

// REGISTER
export async function registerTeacher(payload){
    try {
        const response = await api.post('/auth/teachers', payload, {
            headers: { 'Content-Type' : 'multipart/form-data' },
            skipAuth: true
        })
        return { success: true, data: response.data}
    } catch (err) {
        console.error('Teacher Registration error:', err)
        return { success: false, error: err.response?.data?.error || 'Teacher registration failed'}
    }
}

export async function registerStudent(payload) {
    try {
        const response = await api.post('/auth/students', payload)
        const { user, token } = response.data
        return { success:true, user, token}
    } catch (err) {
        console.error('Student Registration Error:', err)
        return { success: false, error: err.response?.data?.error || 'Student Registration Failed'}
    }
}

// DELETE USER
export async function deleteUserbyId (id) {
    try {
        const response = await api.delete(`/users/${id}`)
        return { success: true, data: response.data}
    }catch (error) {
        console.log('Delete error:', error)
        return { success: false, error: error.response?.data?.error || 'Deletion failed' }
    }
}

// LOGIN USER
export async function loginUser(payload) {
    try {
        const response = await api.post('/users/login', payload)
        localStorage.setItem('token', response.data.token)
        return { success: true, data: response.data}
    } catch (err) {
        console.error('Login Error:', err)
        return { success: false, error: err.response?.data?.error || 'Login Failed'}
    }
}

