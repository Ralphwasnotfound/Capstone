<template>
    <div>
        <div class="w-full h-[80vh]  p-6 bg-white border border-gray-300 rounded-xl shadow-md flex flex-col justify-between">
        <!-- Header -->
            <div class="flex items-center justify-between border-b pb-4">
                <h1 class="text-xl font-bold text-gray-800">Digital Student ID</h1>
                <img src="@/assets/img/Logo.png" alt="Logo" class="w-16 h-16 object-contain" />
            </div>

        <!-- Center Section -->
        <div class="flex justify-around items-center mt-6 mb-6">
            <div class="text-center">
                <p class="text-sm text-gray-600 mb-1">Scan to Validate</p>
                <img src="@/assets/img/qrcode.png" alt="QR Code" class="w-24 h-24 object-contain" />
            </div>
            <img src="@/assets/img/parpar.jpg" alt="Student" class="w-24 h-24 object-cover rounded-md shadow" />
        </div>

        <!-- Info Section -->
        <div class="space-y-2 text-sm text-gray-800">
            <div class="flex justify-between">
                <span class="font-semibold">ID Number:</span>
                <div>
                    <span>000-000-005</span>
                </div>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">Name:</span>
                <span>Ralph Joseph R. Batiancila</span>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">Address:</span>
                <span class="text-right">West Kibawe, Kibawe Bukidnon</span>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">Mobile Number:</span>
                <span>09977953461</span>
            </div>
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