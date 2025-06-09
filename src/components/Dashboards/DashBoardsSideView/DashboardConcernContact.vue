<template>
    <div class="max-w-md mx-auto p-6 bg-white rounded shadow">
        <h2 class="text-2xl font-bold mb-4">Submit a Concern or Contact us</h2>
        <form action="" @submit.prevent="handleSubmit">
            <div>
                <label for="" class="block mb-1 font-medium">Name</label>
                <input v-model="form.name" type="text" class="w-full border p-2 rounded" placeholder="Campus Connect">
            </div>

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
                form:{
                    name: '',
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
                if(this.form.email && this.form.subject && this.form.message){
                    this.success = true
                    this.error = false
                    this.form = {name: '', email: '', subject: '', message: ''}
                }else{
                    this.success = false
                    this.error = true
                }
            }
        }
    }
</script>
