import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000', 
})

export default api

export async function submitEnrollment(payload) {
    try {
        const responce = await api.post('/students', payload)
        console.log('Enrollment Succes:', responce.data)
        return {success: true, data: responce.data
            }
    }catch (error) {
        console.error('Enrollment error', error)
        return { success: false, error}
    }
}