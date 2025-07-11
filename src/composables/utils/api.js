import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000', 
})

export async function submitEnrollment(payload) {
    try {
        const response = await api.post('/students', payload)
        console.log('Enrollment Succes:', response.data)
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
export async function fetchUsers() {
    try {
        const response = await api.get('/users')
        return { success: true, data: response.data }
    }catch (error) {
        console.error('Fetch users failed:', error)
        return { success: false, error}
    }
}

export default api