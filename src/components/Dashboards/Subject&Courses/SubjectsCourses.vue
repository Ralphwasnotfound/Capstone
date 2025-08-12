<template>
    <div>
        <div v-if="status === 'approved' || status === 'enrolled'" class="mb-4 p-3 bg-green-100 text-green-700 rounded">
            ✅ You are officially enrolled!
        </div>
        <div v-else class="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded">
            ⚠️ Your enrollment is not yet approved.
        </div>

        <table class="min-w-full table-auto border-collapse border border-gray-300 mt-4">
            <thead class="bg-gray-100">
                <tr>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Subjects</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Course Code</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Units</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Time</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Day</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Room</th>
                    <th class="border border-gray-300 px-4 py-2 text-left font-semibold">Instructor</th>
                    <th v-if="editable" class="border border-gray-300 px-4 py-2 text-center font-semibold">
                        <button @click="isEditmode = !isEditmode">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="rgba(100,205,138,1)">
                                <path d="M16.7574 2.99678L14.7574 4.99678H5V18.9968H19V9.23943L21 7.23943V19.9968C21 20.5491 20.5523 20.9968 20 20.9968H4C3.44772 20.9968 3 20.5491 3 19.9968V3.99678C3 3.4445 3.44772 2.99678 4 2.99678H16.7574ZM20.4853 2.09729L21.8995 3.5115L12.7071 12.7039L11.2954 12.7064L11.2929 11.2897L20.4853 2.09729Z"></path>
                            </svg>
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(subject, index) in subjects" 
                    :key="index"
                    :class="index % 2 === 0 ? 'bg-white hover:bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'">
                    <td class="border border-gray-300 px-4 py-2">{{ subject.name }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.code }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.units }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.time }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.day }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.room }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ subject.instructor }}</td>
                    <td v-if="editable" class="border border-gray-300 px-4 py-2">
                        <transition name="fade">
                            <button v-if="isEditmode"
                                @click="dropSubject(index)"
                                class="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded">
                                Drop
                            </button>
                        </transition>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    props: {
        editable: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            isEditmode: false,
            status: '',
            subjects: []
        };
    },
    async mounted() {
        await this.fetchEnrollment();
    },
    methods: {
        dropSubject(index) {
            this.subjects.splice(index, 1);
        },
        async enrolled() {
            await axios.post('student/enroll', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            await this.fetchEnrollment();
        },
        async fetchEnrollment() {
            try {
                const res = await axios.get('/students/me', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                this.status = res.data.status || '';
                this.subjects = res.data.subjects || [];
            } catch (err) {
                console.error('Error Fetching enrollment:', err);
            }
        }
    }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>
