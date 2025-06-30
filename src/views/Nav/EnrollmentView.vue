<template>
    <div>
        <NewStudent/>
        <OldStudent/>
    </div>
</template>

<script>
import NewStudent from '@/components/Enrollment/Form/NewStudent.vue';
import OldStudent from '@/components/Enrollment/Form/OldStudent.vue';


export default{
components:{
        NewStudent,
        OldStudent
    }
}

</script>

<style  scoped>

</style>