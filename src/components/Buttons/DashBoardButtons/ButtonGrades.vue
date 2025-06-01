<template>
    <router-link :to="to" class="block w-full" >
        <div class="flex flex-row items-center w-full justify-start gap-2 p-1 cursor-pointer hover:bg-[#0e5d9a] rounded"
        :class="{'bg-[#0e5d9a]': isActive}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(255,255,255,1)"><path d="M2 13H8V21H2V13ZM9 3H15V21H9V3ZM16 8H22V21H16V8Z"></path></svg>
            <h1 class="text-white">Grades</h1>
        </div>
    </router-link>
</template>

<script>
export default {
    props: {
        to: {
            type: String,
            required: true
        }
    },
    computed:{
        isActive(){
            return this.$route.path === this.to
        }
    }
}
</script>

<style lang="scss" scoped>

</style>