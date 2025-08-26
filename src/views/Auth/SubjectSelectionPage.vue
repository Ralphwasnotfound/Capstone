<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-black">Student Subjects</h1>
    <p class="text-gray-700">This is the subjects page for a specific student.</p>
  </div>

  <div>
    <SubjectsTable/>
  </div>
</template>


<script>
import SubjectsTable from '@/components/Enrollment/Subjects/SubjectsTable.vue';

    export default {
        components: {
            SubjectsTable
        }
    }
</script>

<style lang="scss" scoped>

</style>