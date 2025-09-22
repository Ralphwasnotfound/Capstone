import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000', 
    headers: { 'Content-Type': 'application/json' }
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
// semesters
export const fetchSemesters = async () => {
  try {
    const res = await api.get('/enrollment/semesters'); 
    const semesters = Array.isArray(res.data.data) ? res.data.data : []
    console.log('API response:', res.data)
    if (semesters.length === 0){
        console.warn('No semesters returned from API')
    }

    return { success: true, data: semesters };
  } catch(err) {
    console.error(err);
    return { success: false, data: [] };
  }
};

// Fetch subjects assigned to a teacher
export async function fetchTeacherSubjects(teacherId) {
    try {
        const res = await api.get(`/teachers/${teacherId}/subjects`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (!res.data.success) {
            return { success: false, error: res.data.error || 'Unknown backend error' }
        }

        if (!res.data.data || res.data.data.length === 0) {
            return { success: false, error: 'No grades found for this student' }
        }

        return { success: true, data: res.data.data }
    } catch (err) {
        console.error('Fetch teacher subjects failed:', err)
        return { success: false, error: err }
    }
}

export const fetchGradesByStudent = async (studentId) => {
  try {
    const res = await api.get(`/grades/student/${studentId}`)
    return { success: true, data: res.data.data}
  } catch (err) {
    console.error('Error fetching grades:', err.response?.data || err.message)
    return { success: false, error: err.message }
  }
}

// ACADEMIC YEARS
export async function fetchAcademicYears() {
  try {
    const res = await api.get('/academic-years')
    return { success: true, data: res.data.data || res.data }
  } catch (err) {
    console.error('Fetch academic years failed:', err)
    return { success: false, error: err.response?.data?.error || err.message }
  }
}

// Create a new academic year
export async function createAcademicYear(payload) {
  try {
    const res = await api.post('/academic-years', payload)
    return { success: true, data: res.data }
  } catch (err) {
    console.error('Create academic year failed:', err)
    return { success: false, error: err.response?.data?.error || err.message }
  }
}


// Toggle enable/disable enrollment
export async function deactivateAcademicYear(id, is_active) {
  try {
    const res = await api.patch(`/academic-years/${id}/deactivate`, { is_active: Number(is_active) })
    return { success: true, data: res.data }
  } catch (err) {
    console.error('Deactivate academic semester failed:', err)
    return { success: false, error: err.response?.data?.error || err.message }
  }
}


// Delete an academic year
export async function deleteAcademicYear(id) {
  try {
    const res = await api.delete(`/academic-years/${id}`)
    return { success: true, data: res.data }
  } catch (err) {
    console.error('Delete academic year failed:', err)
    return { success: false, error: err.response?.data?.error || err.message }
  }
}


export default api