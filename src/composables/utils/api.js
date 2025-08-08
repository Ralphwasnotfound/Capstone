import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000', 
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
        
    }    
    return config
})

export async function submitEnrollment(payload) {
    try {
        const response = await api.post('/students', payload)
        
        return {success: true, data: response.data
            }
    }catch (error) {
        console.error('Enrollment error', error)
        return { success: false, error}
    }
}

export async function fetchStudents() {
    try {
        const response = await api.get('/students')


        return { success: true, data: response.data}
    } catch (error) {
        console.error('Fetch students error:', error)
        return { success: false, error}
    } 
}

// USERS
export async function fetchUsers() {
    try {
        const response = await api.get('/users')
        return { success: true, data: response.data }
    } catch (error) {
        console.error('Fetch users failed:', error)
        return { success: false, error}
    }
}

// DELETE USER BY ID
export async function deleteUserById(id) {
    try {
        const response = await api.delete(`/users/${id}`)
        return { success: true, data: response.data }
    }catch (error) {
        console.error('Delete Error:', error)
        return { success: false, error: error.response?.data?.error || 'Delete Failed'}
    }
}

export async function approveStudentById(id) {
    try {
        const res = await api.put(`/students/${id}/approve`)
        return res.data
    } catch (err) {
        console.error('Approval Failed:', err)
        throw err
    }
}

export async function fetchPendingStudents() {
    const res = await api.get('/students/pending')
    return { success: true, data: res.data }
}

export async function fetchEnrolledStudents() {
    const res = await api.get('/students/enrolled') 
    return { success: true, data: res.data }
}
// enrollment

export default api