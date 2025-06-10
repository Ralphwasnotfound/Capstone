<template>
    <div class="max-w-md mx-auto p-6 bg-white rounded shadow">
        <h2 class="text-2xl font-bold mb-4">Submit a Concern or Contact us</h2>
        <form action="" @submit.prevent="handleSubmit">
            <div>
                <label for="" class="block mb-1 font-medium">Name</label>
                <input v-model="form.name" type="text" class="w-full border p-2 rounded" placeholder="Campus Connect">
            </div>

            <label for="course" class="block mb-1 font-medium">Course</label>
            <input v-model="form.course" type="text" class="w-full border p-2 rounded" placeholder="e.g. BSIT">

            <label for="section" class="block mb-1 font-medium">Section</label>
            <input v-model="form.section" type="text" class="w-full border p-2 rounded" placeholder="e.g. 2-A">

            <div>
                <label for="" class="block mb-1 font-medium">Email</label>
                <input v-model="form.email" type="email" required class="w-full border p-2 rounded" placeholder="CampusConnect@gmail.com">
            </div>

            <div>
                <label for="" class="block mb-1 font-medium">Subject</label>
                <select v-model="form.subject" name="" id="" class="w-full border p-2 rounded">
                    <option disabled value="">Select Subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Feed Back">Feed Back</option>
                    <option value="Others">Others</option>
                </select>
            </div>

            <div>
                <label for="" class="block mb-1 font-medium">Message</label>
                <textarea v-model="form.message" name="" id="" required class="w-full border p-2 rounded" rows="4" placeholder="Write your concern here..."></textarea>
            </div>

            <div class="mb-3">
                <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="enableTeacherSelect" />
                    <span class="font-medium">Contact a specific teacher</span>
                </label>
            </div>  

            <div v-if="enableTeacherSelect" class="mb-3">
                <label for="teacher" class="block mb-1 font-medium">Choose Teacher</label>
                <select v-model="form.teacher" class="w-full border p-2 rounded" required>
                    <option disabled value="">Select a Teacher</option>
                    <option value="Prof. Santos">Prof. Santos</option>
                    <option value="Sir Reyes">Sir Reyes</option>
                    <option value="Ma'am Cruz">Ma'am Cruz</option>
                </select>
            </div>

            <button type="submit" class="bg-[#052e50] text-[#d3b36d] px-4 py-2 rounded hover:bg-[#2e5974]">
                Submit
            </button>
            
            <p v-if="success" class="mt-4 text-green-600 font-semibold">Thank you for contacting us!</p>
            <p v-if="error" class="mt-4 text-red-600 font-semibold">Opps, something went wrong. Please try again.</p>
        </form>

    </div>
</template>

<script>
    export default {
        data(){
            return{
                enableTeacherSelect: false,
                form:{
                    name: '',
                    course: '',
                    section:'',
                    email: '',
                    subject: '',
                    message: ''
                },
                success: false,
                error: false
            }
        },
        methods: {
            handleSubmit(){
                const f = this.form
                const isTeacherValid = !this.enableTeacherSelect || f.teacher

                if(f.name && f.email && f.subject && f.course && f.section && f.message && isTeacherValid){
                    this.success = true
                    this.error = false
                    this.form = { name: '', email: '', subject: '', teacher: '', course: '', section: '', message: '' }
                }else{
                    this.success = false
                    this.error = true
                }
            }
        }
    }
</script>
