<template>
    <div class="max-w-6xl mx-auto mt-8 flex flex-col justify-start items-start">
        <div class="flex justify-center">
            <FrontCardID v-if="!isFlipped"/>
            <BackCardID v-else/>
        </div>

        <button v-if="flippable"
                @click="flipCard"
                class="ml-6 h-fit mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
        {{ isFlipped ? 'Show Front' : 'Show Back' }}
        </button>
    </div>
</template>

<script>
import BackCardID from '@/components/Cards/BackCardID.vue';
import FrontCardID from '@/components/Cards/FrontCardID.vue';



export default {
    components:{
        FrontCardID,
        BackCardID
    },
    props:{
        flippable: {
            type: Boolean,
            default: true
        }
    },
    data(){
        return{
            isFlipped: false
        }
    },
    methods:{
        flipCard(){
            this.isFlipped = !this.isFlipped
        }
    }
}
</script>

<style lang="scss" scoped>

</style>