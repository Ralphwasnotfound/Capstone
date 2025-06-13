<template>

    <!-- ADMIN -->
    
    <div v-if="role === 'admin'">
        <h1>this is the Admin attendance</h1>
    </div>
    <!-- TEACHER -->
    
    <div v-else-if="role === 'teacher'">
        <h1>this is the teacher attendance</h1>
    </div>

    <!-- STUDENT -->
    <div v-else>
        <div class="p-6 bg-white shadow rounded-xl">
        <h2 class="text-xl font-bolc text-gray-800 mb-4">My Attendance</h2>
        <table class="w-full text-sm border-collapse"> 
            <thead class="bg-gray-100 text-left">
                <tr>
                    <th class="px-4 py-2 border">Subject</th>
                    <th class="px-4 py-2 border">Date</th>
                    <th class="px-4 py-2 border">Status</th>
                    <th class="px-4 py-2 border text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(record, index) in attendance" 
                    :key="index">
                    <td class="px-4 py-2 border">{{ record.subject }}</td>
                    <td class="px-4 py-2 border">{{ record.date}}</td>
                    <td class="px-4 py-2 border">
                        <span :class="statusColor(record.status)">
                            {{ record.status }}
                        </span>
                    </td>
                    <td class="px-4 py-2 border">
                        <button
                        v-if="record.status === 'Present' || record.status === 'Not yet Marked'"
                        @click="markAsAbsent(index)"
                        class="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded">
                        </button>
                        <span v-else class="text-gray-400 text-sm italic">No Action</span>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </div>
</template>

<script>
    export default {
        props:{
            role:{
                type: String,
                required: true
            }
        },
        data(){
            return{
                attendance:[
                    {
                        subject: 'OOP', 
                        date: '2025-06-27',
                        status: 'Present'
                    },
                    {
                        subject: 'POP', 
                        date: '2025-06-27',
                        status: 'Not yet marked'
                    },
                    {
                        subject: 'TTJ', 
                        date: '2025-06-27',
                        status: 'Absent'
                    }
                ]
            }
        },
        methods:{
            markAsAbsent(index){
                this.attendance[index].status = "Marked Absent"
            },
            statusColor(status){
                return {
                    'text-green-600 font:medium': status === 'Present',
                    'text-yellow-500 font-medium': status === 'Not yet marked',
                    'text-red-500 font-medium': status === 'Absent' || status === 'Marked Absent',
                    'italic text-gray-500': status === 'Pending Approval',
                }
            }
        }
    }
</script>

