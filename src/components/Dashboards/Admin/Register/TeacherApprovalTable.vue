<template>
    <div class="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 class="text-2xl font-bold mb-6 text-center">Pending Teacher for Approvals</h2>

        <table class="w-full border border-gray-200 rounded overflow-hidden">
            <thead class="bg-gray-100 text-left">
                <tr>
                    <th class="px-4 py-2 border">Full Name</th>
                    <th class="px-4 py-2 border">Email</th>
                    <th class="px-4 py-2 border">Specialization</th>
                    <th class="px-4 py-2 border">Contact</th>
                    <th class="px-4 py-2 border">Credential</th>
                    <th class="px-4 py-2 border">ID</th>
                    <th class="px-4 py-2 border text-center">Actions</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="teacher in teachers" :key="teacher.id" class="hover:bg-gray-50">
                    <td class="px-4 py-2 border">{{ teacher.full_name }}</td>
                    <td class="px-4 py-2 border">{{ teacher.email }}</td>
                    <td class="px-4 py-2 border">{{ teacher.specialization || 'N/A' }}</td>
                    <td class="px-4 py-2 border">{{ teacher.contact }}</td>
                    <td class="px-4 py-2 border">
                        <a v-if="teacher.credential_url" :href="teacher.credential_url" target="_blank">View</a>
                        <span v-else>N/A</span>
                    </td>
                    <td class="px-4 py-2 border">
                        <a v-if="teacher.id_url" :href="teacher.id_url" target="_blank">View</a>
                        <span v-else>N/A</span>
                    </td>

                    <td class="px-4 py-2 border text-center">
                        <button 
                        @click="approveTeacher(teacher.id)"
                        class="bg-green-600 text-white px-3 py-1 rounded hover:-bg-green-700 mr-2">
                            Approve
                        </button>

                        <button
                        @click="rejectTeacher(teacher.id)"
                        class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2">
                        Reject
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // this will filled with API
                teachers: [] 
            }
        },
        methods: {
            async fetchTeachers() {
                try {
                    const res = await fetch("http://localhost:3000/teachers/approval/pending", {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    })

                    const data = await res.json()
                    this.teachers = Array.isArray(data.data) ? data.data : []
                } catch (err) {
                    console.error("Error fetching teachers:", err)
                }
            },
            async approveTeacher(id) {
                await fetch(`http://localhost:3000/teachers/approval/${id}/approve`, { method: "PUT",
                    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
                })
                this.fetchTeachers()
            },
            async rejectTeacher(id){
                await fetch(`http://localhost:3000/teachers/approval/${id}/reject`, { method: "PUT",
                    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
                })
                this.fetchTeachers()
            }
        },
        mounted() {
            this.fetchTeachers()
        }
    }
</script>

<style lang="scss" scoped>

</style>