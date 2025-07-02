<template>
    <div class="max-w-xl mx-auto space-y-6">
        <div class="flex space-x-4 justify-center">
            <button 
            @click="selectedForm = 'freshmen'"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Freshmen Enrollment
            </button>

            <button
            @click="selectedForm = 'old'"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Old Student Enrollment
            </button>
        </div>
        <NewStudent v-if="selectedForm === 'freshmen'"/>
        <OldStudent v-if="selectedForm === 'old'"/>
    </div>
</template>

<script>
import NewStudent from '@/components/Enrollment/Form/NewStudent.vue';
import OldStudent from '@/components/Enrollment/Form/OldStudent.vue';


export default{
components:{
        NewStudent,
        OldStudent
    },
    data() {
        return {
            selectedForm: null
        }
    }
}

</script>

<style  scoped>

</style>