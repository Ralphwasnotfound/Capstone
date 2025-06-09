<template>
    <!-- Grid Layout for Front and Back -->
    <div class="grid grid-cols-2 gap-8 max-w-6xl mx-auto mt-8">
    <!-- FRONT SIDE -->
        <div class="p-6 bg-white border border-gray-300 rounded-xl shadow-md w-full h-full flex flex-col justify-between">
        <!-- Header -->
            <div class="flex items-center space-x-4 border-b pb-4">
                <img src="@/assets/img/Logo.png" alt="Logo" class="w-14 h-14 object-contain" />
                <div>
                    <h1 class="text-xl font-bold text-gray-800">Campus Connect</h1>
                    <h2 class="text-sm text-gray-600 leading-tight">
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

    <!-- BACK SIDE -->
        <div class="p-6 bg-white border border-gray-300 rounded-xl shadow-md w-full h-full flex flex-col justify-between">
        <!-- Header -->
            <div class="flex items-center justify-between border-b pb-4">
                <h1 class="text-xl font-bold text-gray-800">Digital Student ID</h1>
                <img src="@/assets/img/Logo.png" alt="Logo" class="w-14 h-14 object-contain" />
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
                <span>000-000-005</span>
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
export default {};
</script>


