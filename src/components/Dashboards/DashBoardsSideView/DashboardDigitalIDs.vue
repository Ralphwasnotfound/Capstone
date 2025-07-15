<template>

    <!-- TEACHER -->
    
    <div v-if="role === 'admin'">
        <h1>This is the admin subject-courses</h1>
    </div>

    <!-- TEACHER -->

    <div v-else-if="role === 'teacher'">
        <h1>this is the teacher digital ID</h1>
    </div>

<!-- STUDENT -->
    <div v-else>
        <div class="max-w-6xl mx-auto mt-8 flex flex-col justify-start items-start">
            <div class="flex justify-center">
                <FrontCardID v-if="!isFlipped"/>
                <BackCardID v-else/>
            </div>
            <button v-if="flippable"
                    @click="flipCard"
                    class="ml-6 h-fit mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="rgba(173,184,194,1)"><path d="M11.9498 7.94975L10.5356 9.36396L8.00079 6.828L8.00004 20H6.00004L6.00079 6.828L3.46451 9.36396L2.05029 7.94975L7.00004 3L11.9498 7.94975ZM21.9498 16.0503L17 21L12.0503 16.0503L13.4645 14.636L16.0008 17.172L16 4H18L18.0008 17.172L20.5356 14.636L21.9498 16.0503Z"></path></svg>
            </button>
        </div>
    </div>
</template>

<script>
import BackCardID from '@/components/Common/Cards/BackCardID.vue';
import FrontCardID from '@/components/Common/Cards/FrontCardID.vue';



export default {
    components:{
        FrontCardID,
        BackCardID
    },
    props:{
        flippable: {
            type: Boolean,
            default: true
        },
        role:{
            type: String,
            required: true
        }
    },
    data(){
        return {
            isFlipped: false
        }
    },
    methods:{
        flipCard(){
            this.isFlipped = !this.isFlipped
        }
    },
    
}
</script>

