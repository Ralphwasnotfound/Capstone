<template>
    <!-- REGISTERED USERS -->
        <div>
            <table class="w-full border mt-6">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left">ID</th>
                        <th class="p-2 text-left">Full Name</th>
                        <th class="p-2 text-left">Email</th>
                        <th class="p-2 text-left">Role</th>
                        <th class="p-2 text-left">Date Registered</th>
                        <th class="p-2 text-left">Contact</th>
                        <th class="p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td class="p-2">{{ user.id }}</td>
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
</template>

<script>
import { deleteUserbyId } from '@/composables/registration';



export default {
    name: 'UserTable',
    props: {
        users: {
            type: Array,
            required: true
        }
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
        }
    }
}
</script>

