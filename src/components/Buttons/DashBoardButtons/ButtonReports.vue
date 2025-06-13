<template>
    <router-link :to="to" class="block w-full">
        <div class="flex flex-row items-center w-full justify-start gap-2  cursor-pointer hover:bg-[#0e5d9a] p-1 rounded"
        :class="{'bg-[#0e5d9a]': isActive}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(255,255,255,1)"><path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM8 7V9H16V7H8ZM8 11V13H16V11H8ZM8 15V17H13V15H8Z"></path></svg>
            <h1 class="text-white">Reports</h1>
        </div>
    </router-link>
</template>

<script>
export default {
    props:{
        to:{
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