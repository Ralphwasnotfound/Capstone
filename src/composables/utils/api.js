import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000', 
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    

    if (token && !config.url.startsWith('/auth/')) {
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
    try {
        const res = await api.get('/students/pending')
        return { success: res.data.success, data: res.data.data}
    } catch (err) {
        return { success: false, error: err}
    }
}

export async function fetchEnrolledStudents() {
    try {
        const res = await api.get('/students/enrolled')
        return { success: res.data.success, data: res.data.data }
    } catch (err) {
        return { success: false, error: err}
    }
}

// Grades
// get Grades for a student
export async function fetchGradesByStudent(studentId) {
    try {
        const res = await api.post(`/grades/${studentId}`)
        return { success: true, data: res.data}
    } catch (err) {
        console.err('Fetch grades failed', err)
        return { success: false, error: err}
    }
}

// Teacher adds a grade
export async function createGrade(payload) {
    try {
        const res = await api.post('/grades',payload)
        return {success: true, data: res.data}
    } catch (err) {
        console.error('Create grade failed:', err)
        return { success: false, error: err}
    }
}

// Teacher updates a grade
export async function updateGrade(id, payload) {
    try {
        const res = await api.put(`/grades/${id}`, payload)
        return { success: true, data: res.data}
    } catch (err) {
        console.error('Update gade failed:', err)
        return { success: false, error: err}
    }
}

// Subjects

export async function fetchSubjects() {
    try {
        const res = await api.get('/subjects')
        return { success: true, data:res.data }
    } catch (err) {
        console.error('Fetch Subjects Failed', err)
        return { success: false, error: err}
    }
}

export async function enrollStudent(studentId, subjectId) {
    try {
        const res = await api.post(`/students/${studentId}/enroll`, {subjectId})
        return {success: true, data: res.data}
    } catch (err) {
        console.error('Enrollment Failed', err)
        return { success: false, error: err}
    }
}

export async function fetchSubjectsByCourse(courseId) {
    try {
        const res = await api.get(`/subjects/course/${courseId}`)
        return { success: true, data: res.data}
    } catch (err) {
        console.error('Fetch Subjects By Course Failed', err)
        return { success: false, error: err}
    }
}

export default api