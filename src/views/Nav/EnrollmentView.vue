<template>
    <div class="max-w-xl mx-auto space-y-6">
        <router-link to="/login" >
            <EnrollmentButton/>
        </router-link>
        
    </div>
</template>

<script>
import EnrollmentButton from '@/components/Buttons/EnrollmentButton.vue';

export default{
components:{
        EnrollmentButton
    },
    
}

</script>

<style  scoped>

</style>