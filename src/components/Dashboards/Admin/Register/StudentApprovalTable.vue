<template>
    <div class="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
        <h2 class="text-2xl font-bold mb-6 text-center">Pending Student for Approvals</h2>

        <table class="w-full border border-gray-200 rounded overflow-hidden">
            <thead class="bg-gray-100 text-left">
                <tr>
                    <th class="px-4 py-2 border">Full Name</th>
                    <th class="px-4 py-2 border">Email</th>
                    <th class="px-4 py-2 border">Contact</th>
                    <th class="px-4 py-2 border text-center">Actions</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50">
                    <td class="px-4 py-2 border">{{ student.full_name }}</td>
                    <td class="px-4 py-2 border">{{ student.email }}</td>
                    <td class="px-4 py-2 border">{{ student.contact }}</td>
                    <td class="px-4 py-2 border text-center">
                        <button 
                        @click="approveStudent(student.id)"
                        class="bg-green-600 text-white px-3 py-1 rounded hover:-bg-green-700 mr-2">
                            Approve
                        </button>

                        <button
                        @click="rejectStudent(student.id)"
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
                students: [] 
            }
        },
        methods: {
            async fetchStudents() {
                try {
                    const res = await fetch("http://localhost:3000/students/approval/pending", {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        }
                    })

                    const data = await res.json()
                    this.students = Array.isArray(data.data) ? data.data : []
                } catch (err) {
                    console.error("Error fetching students:", err)
                }
            },
            async approveStudent(id) {
                await fetch(`http://localhost:3000/students/approval/${id}/approve`, { method: "PUT",
                    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
                })
                this.fetchStudents()
            },
            async rejectStudent(id){
                await fetch(`http://localhost:3000/students/approval/${id}/reject`, { method: "PUT",
                    headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
                })
                this.fetchStudents()
            }
        },
        mounted() {
            this.fetchStudents()
        }
    }
</script>

<style lang="scss" scoped>

</style>