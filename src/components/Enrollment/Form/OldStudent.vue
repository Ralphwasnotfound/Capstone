<template>
<div class="max-w-xl mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Old Student Re-Enrollment Form</h2>
    <form @submit.prevent="submitOldStudentForm" class="space-y-4">
    <div>
        <label class="block mb-1 font-medium">Student ID</label>
        <input v-model="form.student_id" type="text" class="w-full border p-2 rounded" required />
    </div>

    <div>
        <label class="block mb-1 font-medium">Full Name</label>
        <input v-model="form.full_name" type="text" class="w-full border p-2 rounded" required />
    </div>

    <div>
        <label class="block mb-1 font-medium">Email</label>
        <input v-model="form.email" type="email" class="w-full border p-2 rounded" required />
    </div>

        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Re-Enroll</button>
    </form>
</div>
</template>

<script>
export default {
data() {
    return {
        form: {
        student_id: '',
        full_name: '',
        email: '',
    },
    };
},
    methods: {
    submitOldStudentForm() {
    console.log('Submitting old student data:', this.form);
      // TODO: Add API call here
    },
},
};
</script>
