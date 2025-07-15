<template>
    <div>
        <div>
        <!-- Profile Settings and Dashboard -->
        <div class="py-10 flex items-center gap-10">
            <div class="relative w-[150px] h-[150px] rounded-full overflow-hidden"
            :class="{'cursor-pointer': isEditing}"
            @click="isEditing ? triggerFileInput() : null"
            @mouseenter="hovering = true"
            @mouseleave="hovering = false">

            <img 
            :src="imageUrl || 'https://via.placeholder.com/150'" 
            alt="Profile"
            class="w-full h-full object-cover bg-[#7a8e9c]"
            @click="handleImageClick"/>

            <input type="file"
                ref="fileInput"
                @change="onFileChange" 
                accept="image/*"
                style="display:none">

            <div v-if="isEditing && hovering" 
                class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-full text-white text-3xl select-none pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="40" 
                height="40" 
                fill="rgba(173,184,194,1)">
                <path d="M20 3C20.5523 3 21 3.44772 21 4V5.757L19 7.757V5H5V13.1L9 9.1005L13.328 13.429L11.9132 14.8422L9 11.9289L5 15.928V19H15.533L16.2414 19.0012L17.57 17.671L18.8995 19H19V16.242L21 14.242V20C21 20.5523 20.5523 21 20 21H4C3.45 21 3 20.55 3 20V4C3 3.44772 3.44772 3 4 3H20ZM21.7782 7.80761L23.1924 9.22183L15.4142 17L13.9979 16.9979L14 15.5858L21.7782 7.80761ZM15.5 7C16.3284 7 17 7.67157 17 8.5C17 9.32843 16.3284 10 15.5 10C14.6716 10 14 9.32843 14 8.5C14 7.67157 14.6716 7 15.5 7Z"></path></svg>
            </div>
        </div>

                <div class="flex flex-col">
                    <h1 class="text-[60px] text-start">{{ teacher.full_name }}</h1>
                    <h1 class="text-[20px] text-start">{{ teacher.department }} <br>{{ teacher.rank }} / {{ teacher.specialization }}</h1>
                </div>
        </div>
        <!-- Profile Settings only -->
        <div v-if="showDetails" class="space-y-8">
            <div class="space-y-8">
                <button @click="toggleEdit"
                class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
                {{ isEditing ? 'Cancel' : 'EditProfile' }}
                </button>
            </div>

            <button v-if="isEditing"
            @click="saveProfile"
            class="mb-4 ml-2 px-4 py-2 bg-green-600 text-white rounded">
            Save Profile
            </button>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Personal Info</h2>
                    <ul class="space-y-2">
                        <!-- Teacher Name -->
                        <li>
                            <label for="name" class="block font-semibold">Full Name:</label>
                            <div v-if="!isEditing">{{ teacher.full_name }}</div>
                            <input v-else v-model="teacher.full_name" id="name" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- Teacher ID -->
                        <li>
                            <label for="id" class="block font-semibold">Employee ID:</label>
                            <div v-if="!isEditing">{{ teacher.id }}</div>
                            <input v-else v-model="teacher.id" id="id" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- Teacher GENDER -->
                        <li>
                            <label for="gender" class="block font-semibold">Gender:</label>
                            <div v-if="!isEditing">{{ teacher.gender }}</div>
                            <input v-else v-model="teacher.gender" id="gender" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- Teacher DATE OF BIRTH -->
                        <li>
                            <label for="birth" class="block font-semibold">Date of Birth:</label>
                            <div v-if="!isEditing">{{ teacher.birthdate }}</div>
                            <input v-else v-model="teacher.birthdate" id="birth" type="date" class="border rounded p-1 w-full">
                        </li>
                            <!-- Teacher AGE -->
                        <li>
                            <label for="age" class="block font-semibold">Age:</label>
                            <div v-if="!isEditing">{{ teacher.age }}</div>
                            <input v-else v-model="teacher.age" 
                            id="age" 
                            type="number" 
                            min="1"
                            max="120"
                            class="border rounded p-1 w-full"
                            @input="validateAge">
                        </li>
                    </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Academic Info</h2>
                    <ul class="space-y-2">
                        <!-- Department -->
                        <li>
                            <label for="department" class="block font-semibold">Department:</label>
                            <div v-if="!isEditing">{{ teacher.department }}</div>
                            <input v-else v-model="teacher.department" id="department" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- Specialization -->
                        <li>
                            <label for="specialization" class="block font-semibold">Specialization:</label>
                            <div v-if="!isEditing">{{ teacher.specialization }}</div>
                            <input v-else v-model="teacher.specialization" id="specialization" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- Rank -->
                        <li>
                            <label for="rank" class="block font-semibold">Rank:</label>
                            <div v-if="!isEditing">{{ teacher.rank }}</div>
                            <input v-else v-model="teacher.rank" id="rank" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- Years Experience -->
                        <li>
                            <label for="year" class="block font-semibold">Years Experience:</label>
                            <div v-if="!isEditing">{{ teacher.yearsExperience }}</div>
                            <input v-else v-model="teacher.yearsExperience" id="year" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- STATUS -->
                        <li>
                            <label for="status" class="block font-semibold">Employment Status:</label>
                            <div v-if="!isEditing">{{ teacher.employmentStatus }}</div>
                            <input v-else v-model="teacher.employmentStatus" id="status" type="text" class="border rounded p-1 w-full">
                        </li>
                    </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Contact Info</h2>
                    <ul class="space-y-2">
                        <!-- MOBILE NUMBER -->
                        <li>
                            <label for="MobileNumber" class="block font-semibold">Mobile Number:</label>
                            <div v-if="!isEditing">{{ teacher.mobileNumber }}</div>
                            <input v-else v-model="teacher.mobileNumber" 
                            id="mobileNumber" 
                            type="text" 
                            maxlength="11"
                            pattern="[0-9]{11}"
                            inputmode="numeric"
                            class="border rounded p-1 w-full"
                            @input="teacher.mobileNumber = teacher.mobileNumber.replace(/\D/g,'')">
                        </li>
                        <!-- EMAIL ADDRESS -->
                        <li>
                            <label for="email" class="block font-semibold">Email Address:</label>
                            <div v-if="!isEditing">{{ teacher.email }}</div>
                            <input v-else v-model="teacher.email" id="email" type="email" class="border rounded p-1 w-full">
                        </li>
                        <!-- HOME ADDRESS -->
                        <li>
                            <label for="address" class="block font-semibold">Home Address:</label>
                            <div v-if="!isEditing">{{ teacher.address }}</div>
                            <input v-else v-model="teacher.address" id="address" type="text" class="border rounded p-1 w-full">
                        </li>
                    </ul>
            </section>

            <section>
                <h2 class="text-xl font-semibold mb-3 border-b border-gray-300 pb-1">Schedule Info</h2>
                    <ul class="space-y-2">
                        <!-- GUARDIAN NAME -->
                        <li>
                            <label for="office" class="block font-semibold">Office Hours:</label>
                            <div v-if="!isEditing">{{ teacher.officeHours }}</div>
                            <input v-else v-model="teacher.officeHours" id="office" type="text" class="border rounded p-1 w-full">
                        </li>
                        <!-- GUARDIAN NUMBER -->
                        <li>
                            <label for="room" class="block font-semibold">Room Assignment:</label>
                            <div v-if="!isEditing">{{ teacher.roomAssignment }}</div>
                            <input v-else v-model="teacher.roomAssignment" 
                            id="room" 
                            type="text" 
                            class="border rounded p-1 w-full">
                        </li>
                    </ul>
            </section>
        </div>
        </div>
    </div>
</template>

<script>
import {useProfile, saveProfile, validateAge, handleImageupload, toggleEdit} from '@/composables/useProfile'

    export default {
    props:{
        role: {
            type: String,
            required: true
        },
        showDetails: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
                imageUrl: null,
                isEditing: false,
                originalData: {},
                teacher: { }
        }   
    },
    created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
        this.teacher = useProfile(user)
    } else {
        this.student = { ...this.teacher, ...user}
    }
    },
    methods: {
    toggleEdit() {
        toggleEdit(this)
    },
    saveProfile() {
        saveProfile(this.teacher)
        this.isEditing = false
    },
    onFileChange(e) {
        handleImageupload(e, (url) => {
            this.imageUrl = url
        })
    },
    validateAge() {
        validateAge(this.teacher)
        }
    }
}
</script>

