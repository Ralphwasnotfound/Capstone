<template>
    <router-link :to="to" class="block w-full" > 
        <div class="flex flex-row items-center w-full justify-start gap-2 p-1 cursor-pointer hover:bg-[#0e5d9a] rounded"
        :class="{ 'bg-[#0e5d9a]': isActive }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="rgba(255,255,255,1)"><path d="M4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H14C14.5523 21 15 20.5523 15 20V10.6973L17.0215 20.2076C17.1363 20.7479 17.6673 21.0927 18.2075 20.9779L21.142 20.3541C21.6822 20.2393 22.027 19.7083 21.9122 19.1681L19.0015 5.47402C18.8866 4.9338 18.3556 4.58896 17.8154 4.70378L15 5.30221V5C15 4.44772 14.5523 4 14 4H9C9 3.44772 8.55228 3 8 3H4ZM9 6H13V14H9V6ZM13 16V19H9V16H13ZM7 17V19H5V17H7ZM18.7699 18.8137L18.3541 16.8577L19.3323 16.6498L19.748 18.6058L18.7699 18.8137Z"></path></svg>
            <h1 class="text-white">Subjects/Courses</h1>
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
    computed: {
        isActive(){
            return this.$route.path === this.to
        }
    }
}
</script>

<style lang="scss" scoped>

</style>