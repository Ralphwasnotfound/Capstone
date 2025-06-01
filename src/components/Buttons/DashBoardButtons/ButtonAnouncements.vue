<template>
    <router-link :to="to" class="block w-full">
        <div class="flex flex-row items-center w-full justify-start gap-2  cursor-pointer hover:bg-[#0e5d9a] p-1 rounded"
        :class="{'bg-[#0e5d9a]': isActive}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(255,255,255,1)"><path d="M22 20H2V18H3V11.0314C3 6.04348 7.02944 2 12 2C16.9706 2 21 6.04348 21 11.0314V18H22V20ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z"></path></svg>
            <h1 class="text-white">Announcements</h1>
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