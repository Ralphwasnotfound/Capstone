<template>

    <!-- ADMIN -->
    
    <div v-if="role === 'admin'">
        <h1>This is the admin Announcements</h1>
    </div>

    <!-- TEACHER -->
    
    <div v-else-if="role === 'teacher'">
        <h1>This is the teacher Announcements</h1>
    </div>

    <!-- STUDENT -->

    <div v-else>
        <!-- Student View: Announcements (Read-Only) -->
        <div class="flex flex-col items-center justify-center gap-10 p-6 bg-gray-50">
        <!-- Teacher Announcement -->
        <section class="border border-black p-6 rounded shadow-md max-w-md bg-white">
            <h2 class="text-xl font-semibold mb-3">Teacher Announcement</h2>
            <p class="text-gray-700 leading-relaxed mb-4">
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Praesentium, repellat sed temporibus porro placeat modi repellendus officia deleniti. Sit earum architecto voluptatum blanditiis eligendi perferendis assumenda repellendus minus doloremque eveniet.
            </p>
            <p class="text-sm text-gray-500 italic">Posted on June 9, 2025 at 2:00 PM</p>
        </section>

        <!-- Admin Announcement -->
        <section class="border border-black p-6 rounded shadow-md max-w-md bg-white">
            <h2 class="text-xl font-semibold mb-3">Admin Announcement</h2>
                <p class="text-gray-700 leading-relaxed mb-4">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Praesentium, repellat sed temporibus porro placeat modi repellendus officia deleniti. Sit earum architecto voluptatum blanditiis eligendi perferendis assumenda repellendus minus doloremque eveniet.
                </p>
                <p class="text-sm text-gray-500 italic">Posted on June 8, 2025 at 5:30 PM</p>
        </section>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        role: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
</style>
