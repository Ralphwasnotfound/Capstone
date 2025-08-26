<template>
    <div>
        <div v-if="grade" class="modal bg-white p-4 shadow-lg rounded" >
            <h3 class="text-lg font-bold mb-2">Edit Grade - {{  grade.subject_name }}</h3>

            <form @submit.prevent="submitGrade">
                <div class="mb-2">
                    <label>Grade</label>
                    <input type="number"
                    v-model="localGrade"
                    min="0"
                    max="100"
                    step="0.01"
                    class="border px-2 py-1 rounded">
                </div>

                <div class="mb-2">
                    <label>Remarks:</label>
                    <select v-model="localRemarks" class="border px-2 py-1 rounded">
                        <option value="">Select</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                        <option value="Incomplete">Incomplete</option>
                    </select>
                </div>

                <div class="flex gap-2">
                    <button type="submit" class="bg-blue-500 text-white px-4 py-1 rounded">Submit</button>
                    <button type="button" @click="$emit('close')" class="bg-gray-300 px-4 py-1 rounded">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { updateGrade } from '@/composables/utils/api';

    export default {
        props: {
            grade: Object
        },
        data() {
            return {
                localGrade: '',
                localRemarks: ''
            }
        },
        watch:{
            grade: {
                immediate: true,
                handler(newVal) {
                    if (newVal) {
                        this.localGrade = newVal.grade ?? ''
                        this.localRemarks = newVal.remarks ?? ''
                    }
                }
            }
        },
        methods: {
            async submitGrade() {
                const payload = {
                    grade: this.localGrade, remarks: this.localRemarks
                }
                const res = await updateGrade(this.grade.id, payload)

                if (res.success) {
                    this.$emit('saved', {...this.grade, ...payload})
                }
            }
        }
    }
</script>

<style scoped>
.modal {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -20%);
  width: 300px;
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  border-radius: 0.5rem;
  z-index: 1000;
}

</style>
