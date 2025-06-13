<template>

    <!-- ADMIN -->
    
    <div v-if="role === 'admin'">
        <h1>This is the Admin subject-courses</h1>
    </div>

    <!-- TEACHER -->
    
    <div v-else-if="role === 'teacher'">
        <h1>This is the teacher subject-courses</h1>
    </div>

    <!-- STUDENT -->

    <div v-else> 
        <div v-if="showSubject" class="bg-white p-6 rounded-xl shadow-md text-gray-800">
            <h1 class="text-2xl font-bold mb-2">Bachelor of Information Technology</h1>
            <h2 class="text-lg font-medium">Regular</h2>
            <h2 class="text-lg font-medium text-green-600">Enrolled</h2>
        </div>
        <table class="min-w-full table-auto border-collapse border border-gray-300 mt-4">
            <thead class="bg-gray-100">
                <tr>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Subjects</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Course Code</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Units</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Time</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Day</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Room</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Instructor</th>
                    <th v-if="editable" class="border border-gray-300 px-4 py-2 text-center font-semibold ">
                        <button @click="isEditmode = !isEditmode">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="rgba(100,205,138,1)"><path d="M16.7574 2.99678L14.7574 4.99678H5V18.9968H19V9.23943L21 7.23943V19.9968C21 20.5491 20.5523 20.9968 20 20.9968H4C3.44772 20.9968 3 20.5491 3 19.9968V3.99678C3 3.4445 3.44772 2.99678 4 2.99678H16.7574ZM20.4853 2.09729L21.8995 3.5115L12.7071 12.7039L11.2954 12.7064L11.2929 11.2897L20.4853 2.09729Z"></path></svg>
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(subject, index) in subjects" 
                :key="index"
                :class="index % 2 === 0 ? 'bg-white hover:bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'">
                    <td class="border border-gray-300 px-4 py-2">{{ subject.name }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.code }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.units }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.time }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.day }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.room }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.instructor }}</td>
                    <td v-if="editable" class="border border-gray-300 px-4 py-2">
                    <transition name="fade">
                        <button
                            v-if="isEditmode"
                            @click="dropSubject(index)"
                            class="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded ">
                            Drop
                        </button>
                    </transition>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        props:{
            showSubject:{
                type: Boolean,
                default: true
            },
            editable:{
                type: Boolean,
                default: true
            },
            role: {
                type: String,
                required: true
            }
        },
        data(){
            return{
                isEditmode: false,
                subjects:[
                    {
                        name: 'Networking',
                        code: 'ITAPDC 2',
                        units: '3',
                        time: '2:00 - 3:00 PM',
                        day: 'Sunday',
                        room: 'Computer Lab',
                        instructor: 'Mr.Computer'
                    },
                    {
                        name: "Data Structures and Algorithm",
                        code: "ITAPDC 2",
                        units: 3,
                        time: "2:00 - 3:00 PM",
                        day: "Sunday",
                        room: "Computer Lab",
                        instructor: "Ms. Computer",
                    },
                    {
                        name: "Object Oriented Programming",
                        code: "ITAPDC 2",
                        units: 3,
                        time: "2:00 - 3:00 PM",
                        day: "Sunday",
                        room: "Computer Lab",
                        instructor: "Mrs. Computer",
                    },
                    {
                        name: "Animation",
                        code: "ITAPDC 2",
                        units: 3,
                        time: "2:00 - 3:00 PM",
                        day: "Sunday",
                        room: "Computer Lab",
                        instructor: "Mr. Computer",
                    },
                ]
            }
        },
        methods:{
            dropSubject(index)  {
                this.subjects.splice(index ,1)
            }
        }
    }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>