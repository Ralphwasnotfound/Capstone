<template>
    <div>
        <div class="w-full h-[80vh]  min-h-[400px] p-6 bg-white border border-gray-300 rounded-xl shadow-md flex flex-col justify-between">
        <!-- Header -->
            <div class="flex items-center  border-b pb-4">
                <img src="@/assets/img/Logo.png" alt="Logo" class="w-14 h-14 object-contain" />
                <div>
                    <h1 class="text-xl font-bold text-gray-800 text-start">Campus Connect</h1>
                    <h2 class="text-[13px] text-start text-gray-600 leading-tight">
                    A Web-Based Integrated System <br />
                    for Student Management
                    </h2>
                </div>
            </div>

        <!-- Center Section -->
            <div class="flex flex-col items-center mt-6 mb-4">
                <p class="text-lg font-semibold text-gray-700 mb-2">Digital Student ID</p>
                    <img src="@/assets/img/qrcode.png" alt="QR Code" class="w-28 h-28 object-contain" />
                <p class="text-sm text-gray-600 mt-1">Scan to Validate</p>
            </div>

        <!-- Details -->
            <div class="text-center mt-4">
                <p class="text-2xl font-semibold text-gray-900 tracking-widest">000-000-005</p>
                <p class="text-lg font-medium text-gray-800 mt-1">Ralph Joseph R. Batiancila</p>
                <p class="text-sm text-gray-600">BSIT - 2nd Year</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

</style>