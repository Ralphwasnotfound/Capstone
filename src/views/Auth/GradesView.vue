<template>
    <div>
        <h2>Grades</h2>

    <!-- Grade Table -->
        <GradeTable 
            :grades="grades" 
            :editable="isTeacher" 
            @edit="openForm"
        />

    <!-- Grade Form (Modal) -->
        <GradeForm 
            v-if="showForm"
            :grade="selectedGrade"
            @saved="onGradeSaved"
            @close="showForm = false"
        />
    </div>
</template>

<script>
import GradeTable from '@/components/Enrollment/Grades/GradeTable.vue'
import GradeForm from '@/components/Enrollment/Grades/GradeForm.vue'
import { fetchGradesByStudent, updateGrade } from '@/composables/utils/api.js'

export default {
    components: {
        GradeTable,
        GradeForm
    },
    data() {
        return {
            grades: [],
            showForm: false,
            selectedGrade: null,
            isTeacher: true
        }
    },
    mounted() {
        const studentId = 1 // Replace with dynamic student ID if needed
        fetchGradesByStudent(studentId)
            .then(res => {
            if (res.success) this.grades = res.data
        })
    },
    methods: {
    // Called by GradeTable when edit button clicked
        openForm(grade) {
            this.selectedGrade = grade
            this.showForm = true
        },

    // Called by GradeForm when grade is saved
    onGradeSaved(updatedGrade) {
        const index = this.grades.findIndex(
            g => g.enrollment_id === updatedGrade.enrollment_id
        )
        if (index !== -1) this.grades[index] = updatedGrade
        this.showForm = false
    },

    // Optional: manual save function (not used if GradeForm handles it)
    saveGrade(gradeId, newGrade, newRemarks) {
        updateGrade(gradeId, { grade: newGrade, remarks: newRemarks })
            .then(res => {
                if (res.success) alert('Grade updated successfully!')
            })
        }
    }
}
</script>

<style scoped>
/* Optional styling for modal or table */
</style>
