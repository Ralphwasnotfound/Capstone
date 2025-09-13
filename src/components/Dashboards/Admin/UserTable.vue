<template>
    <!-- ACCOUNTS -->
    <div>
        <h1>ACCOUNTS</h1>
        <div>
            <!-- STUDENTS -->
            <table class="w-full border mt-6">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left">Full Name</th>
                        <th class="p-2 text-left">Email</th>
                        <th class="p-2 text-left">Role</th>
                        <th class="p-2 text-left">Date Registered</th>
                        <th class="p-2 text-left">Contact</th>
                        <th class="p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in students" :key="user.id">
                        <td class="p-2">{{ user.full_name }}</td>
                        <td class="p-2">{{ user.email }}</td>
                        <td class="p-2">{{ user.role }}</td>
                        <td class="p-2">{{ formatDate(user.created_at) }}</td>
                        <td class="p-2">{{ user.contact }}</td>
                        <td class="p-2">
                            <button 
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            @click="deleteUser(user.id)"
                            >Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
<!-- TEACHER -->
        <div>
            <table class="w-full border mt-6">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left">Full Name</th>
                        <th class="p-2 text-left">Email</th>
                        <th class="p-2 text-left">Role</th>
                        <th class="p-2 text-left">Date Registered</th>
                        <th class="p-2 text-left">Contact</th>
                        <th class="p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in teachers" :key="user.id">
                        <td class="p-2">{{ user.full_name }}</td>
                        <td class="p-2">{{ user.email }}</td>
                        <td class="p-2">{{ user.role }}</td>
                        <td class="p-2">{{ formatDate(user.created_at) }}</td>
                        <td class="p-2">{{ user.contact }}</td>
                        <td class="p-2">
                            <button 
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            @click="deleteUser(user.id)"
                            >Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    
</template>

<script>
import { deleteUserbyId } from '@/composables/registration';
import axios from 'axios';


export default {
    name: 'UserTable',
    data() {
        return {
            students: [],
            teachers: []
        }
    },
    mounted(){
        this.fetchUsers()
    },
    methods: {
        formatDate(date) {
            if (!date) return 'N/A'
            const parsed = new Date(date)
            return isNaN(parsed.getTime()) ? 'Invalid Date' : parsed.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        },
        async deleteUser(id) {
            const confirmed = confirm('Are you sure you want to delete this user?')
                if (!confirmed) return

        const { success, error } = await deleteUserbyId(id)
            if(success) {
            this.$emit('user-deleted', id)
                alert('User Deleted Succesfully.')
            } else {
                alert(`Deleted failed: ${error}`)
            }
        },
        fetchUsers() {
            
            axios.get('/users')
            .then(res => {
                let allusers = []
                
                if (Array.isArray(res.data)) {
                    allusers = res.data
                } else if (Array.isArray(res.data.users)) {
                    allusers = res.data.users
                } else {
                    console.warn('Unexpected API response format:', res.data)
                }

                // SEPARATE ROLES
                this.students = allusers.filter(u => u.role === 'student' && u.student_status === 'approved')
                this.teachers = allusers.filter(u => u.role === 'teacher' && u.teacher_status === 'approved')
            })
            .catch(err => {
                console.error('FETCH users failed:', err)
            })
        }
    }
}
</script>

