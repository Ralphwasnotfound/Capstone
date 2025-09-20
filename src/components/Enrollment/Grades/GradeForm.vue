<template>
  <div class="bg-white p-4 shadow rounded">
    <h3 class="font-bold mb-2">{{ student.full_name }}</h3>

    <form @submit.prevent="submitGrade" class="flex gap-2 items-center">
      <input 
        type="number" 
        v-model.number="localGrade" 
        placeholder="Grade" 
        min="0" 
        max="100" 
        step="0.01"
        class="border px-2 py-1 rounded w-24"
      />

      <select v-model="localRemarks" class="border px-2 py-1 rounded">
        <option value="">Remarks</option>
        <option value="Passed">Passed</option>
        <option value="Failed">Failed</option>
        <option value="Incomplete">Incomplete</option>
      </select>

      <button type="submit" class="bg-blue-500 text-white px-4 py-1 rounded">Save</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    student: { type: Object, required: true },
    teacherId: { type: Number, required: true },
    subjectId: { type: Number, required: true },
    academicYearId: { type: Number, required: true },
  },
  data() {
    return {
      localGrade: this.student.grade ?? '',
      localRemarks: this.student.remarks ?? ''
    }
  },
  methods: {
    async submitGrade() {
      if (!this.teacherId || !this.academicYearId) {
        console.error("Missing teacherId or academicYearId. Cannot submit grade.");
        return;
      }

      const payload = {
        student_id: this.student.id,
        teacher_id: this.teacherId,
        subject_id: this.subjectId,
        grade: this.localGrade,
        remarks: this.localRemarks,
        academic_year_id: this.academicYearId
      }

      try {
        const res = await axios.post(
          'http://localhost:3000/grades/update',
          payload,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        )

        console.log("Payload sent:", payload)

        if (res.data.success) {
          this.$emit('saved', { ...this.student, grade: this.localGrade, remarks: this.localRemarks })
        }
      } catch (err) {
        console.error('Failed to save grade:', err)
      }
    }
  }
}
</script>
