<template>
    <div>
        
        <div class="py-10 flex items-center gap-10">
            <div class="bg-[#7a8e9c] p-[50px] rounded-full w-[5%]"></div>
                <div class="flex flex-col">
                    <h1>Student Name</h1>
                    <h1>Course/Section/Year Lvl</h1>
                </div>
        </div>
        
        
        
        <div v-if="showDetails" class="space-y-8">
            <div class="space-y-8">
                <button @click="toggleEdit"
                class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
                {{ isEditing ? 'Cancel' : 'EditProfile' }}
                </button>
            </div>

            <button v-if="isEditing"
            @click="saveprofile"
            class="mb-4 ml-2 px-4 py-2 bg-green-600 text-white rounded">
            Save Profile
            </button>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Personal Info</h2>
                    <ul class="space-y-2">
                        <li>
                            <label class="block font-semibold">Full Name:</label>
                            <div v-if="!isEditing">{{ student.fullName }}</div>
                            <input v-else v-model="student.fullName" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Student ID:</label>
                            <div v-if="!isEditing">{{ student.id }}</div>
                            <input v-else v-model="student.id" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Gender:</label>
                            <div v-if="!isEditing">{{ student.gender }}</div>
                            <input v-else v-model="student.gender" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li><label class="block font-semibold">Date of Birth:</label>
                            <div v-if="!isEditing">{{ student.birthdate }}</div>
                            <input v-else v-model="student.birthdate" type="text" class="border rounded p-1 w-full"></li>
                        <li>
                            <label class="block font-semibold">Age:</label>
                            <div v-if="!isEditing">{{ student.age }}</div>
                            <input v-else v-model="student.age" type="text" class="border rounded p-1 w-full">
                        </li>
                    </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Academic Info</h2>
                    <ul class="space-y-2">
                        <li>
                            <label class="block font-semibold">Course:</label>
                            <div v-if="!isEditing">{{ student.course }}</div>
                            <input v-else v-model="student.course" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Year Level:</label>
                            <div v-if="!isEditing">{{ student.yearlvl }}</div>
                            <input v-else v-model="student.yearlvl" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Section:</label>
                            <div v-if="!isEditing">{{ student.section }}</div>
                            <input v-else v-model="student.section" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">School Year:</label>
                            <div v-if="!isEditing">{{ student.schoolyear }}</div>
                            <input v-else v-model="student.schoolyear" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Enrollment Status:</label>
                            <div v-if="!isEditing">{{ student.enrollmentStatus }}</div>
                            <input v-else v-model="student.enrollmentStatus" type="text" class="border rounded p-1 w-full">
                        </li>
                    </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Contact Info</h2>
                    <ul class="space-y-2">
                        <li>
                            <label class="block font-semibold">Mobile Number:</label>
                            <div v-if="!isEditing">{{ student.mobileNumber }}</div>
                            <input v-else v-model="student.mobileNumber" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Email Address:</label>
                            <div v-if="!isEditing">{{ student.email }}</div>
                            <input v-else v-model="student.email" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Home Address:</label>
                            <div v-if="!isEditing">{{ student.address }}</div>
                            <input v-else v-model="student.address" type="text" class="border rounded p-1 w-full">
                        </li>
                    </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Guardian Info</h2>
                    <ul class="space-y-2">
                        <li>
                            <label class="block font-semibold">Guardian's Name:</label>
                            <div v-if="!isEditing">{{ student.guardianName }}</div>
                            <input v-else v-model="student.guardianName" type="text" class="border rounded p-1 w-full">
                        </li>
                        <li>
                            <label class="block font-semibold">Guardian's Contact Number:</label>
                            <div v-if="!isEditing">{{ student.guardianNumber }}</div>
                            <input v-else v-model="student.guardianNumber" type="text" class="border rounded p-1 w-full">
                        </li>
                    </ul>
            </section>
        </div>
    </div>
</template>

<script>
    export default {
        props:{
            showDetails:{
                type: Boolean,
                default: true
            }
        },
        data(){
            return{
                isEditing: false,
                student:{
                    // Personal Info
                    fullName: 'John Doe',
                    id: '2023123456',
                    gender: 'Male',
                    birthdate: 'January 1, 2000',
                    age:'23',
                    // Academic Info
                    course:'BS Information Technology',
                    yearlvl: '3rd Year',
                    section: 'Section A',
                    schoolyear: '2024-2025',
                    enrollmentStatus: 'Active',
                    // Contact Info
                    mobileNumber: '09977953461',
                    email:'john.doe@example.com',
                    address: '1234 Main St, City, County',
                    // Guardian Info
                    guardianName: 'Jane Doe',
                    guardianNumber: '09977953461'
                },
                originalStudent: {},
            }
        },
        methods:{
            toggleEdit(){
                if(this.isEditing){
                    this.student = {...this.originalStudent}
                    this.isEditing = false
                }else{
                    this.originalStudent = {...this.student}
                    this.isEditing = true
                }
            },
            saveprofile(){
            localStorage.setItem('studentProfile', JSON.stringify(this.student))
            this.isEditing = false
            alert('Profile Save Locally!!')
            },
            created(){
                const saved = localStorage.getItem('studentProfile')
                if(saved){
                    this.student = JSON.parse(saved)
                }
            }
        }
        
    }
</script>

<style scoped>

</style>