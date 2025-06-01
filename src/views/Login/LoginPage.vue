<template>
    <div class="flex min-h-screen">
        <!-- Left Side: Logo or Image -->
        <div class="w-1/2  flex justify-center items-center">
        <img src="@/assets/img/Logo.png" alt="Logo" class="w-2/3 max-w-xs">
    </div>

    <div class="w-1/2 flex justify-center items-center ">
        <form @submit.prevent="handleLogin" class="bg-[#052e50] p-8 rounded shadow-md w-full max-w-md">
            <h2 class="text-2xl font-bold mb-6 text-center text-[#d3b36d]">Log In</h2>
            <div class="mb-4">
                <label class="block mb-1 font-medium text-[#d3b36d]">Username</label>
                <input type="username" v-model="username" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" required>
            </div>

            <div class="mb-6">
                <label class="block mb-1 font-medium text-[#d3b36d]">Password</label>
                <input type="password" v-model="password" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400" required>
            </div>

            <button class="w-full bg-[#2e5974] text-white py-2 rounded hover:bg-blue-600 transition">Login</button>
        </form>
    </div>
</div>
</template>

<script>
export default{
    data(){
        return{
            username: '',
            password: ''
        }
    },
    methods:{
        handleLogin(){
            let role = ''

            if(this.username === 'student' && this.password === '1234'){
                role = 'student'
            }else if (this.username ==='teacher' && this.password ==='1234'){
                role = 'teacher'
            }else if (this.username === 'admin' && this.password ==='1234'){
                role = 'admin'
            }else{
                alert('Invalid Credentials')
                return
            }
            localStorage.setItem('role',role)

            // this.$router.push('/dashboard')
            window.location.href = '/dashboard'
        }
    }

}
</script>

