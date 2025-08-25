<template>
    <div>
        <h2>Grades</h2>
        <GradeTable :grades="grades" :editable="isTeacher" @edit="openForm"/>

        <GradeForm v-if="showForm"
                :grade="selectedGrade"
                @saved="onGradeSaved"
                @close="showForm = false"
        />
    </div>
</template>

<script>
import GradeTable from '@/components/Enrollment/Grades/GradeTable.vue'
import GradeForm from '@/components/Enrollment/Grades/GradeForm.vue'
import { fetchGradesByStudent, updateGrade } from '../utils/api.js'



    export default {
        components: {
            GradeTable,
            GradeForm
        },
        data() {
            return {
                grades: [],
                showForm: false,
                seleectedGrade: null,
                isTeacher: true
            }
        },
        mounted() {
            const studentId = 1 
            fetchGradesByStudent(studentId)
            .then(res => {
                if (res.success) this.grades = res.data
            })
        },
        methods: {
            saveGrade(gradeId, newGrade, newRemarks) {
                updateGrade(gradeId, { grade: newGrade, remarks: newRemarks})
                .then(res => {
                    if (res.success) {
                        alert('Gradeupdated Successfully!')
                    }
                })
            },
            openForm(grade) {
                this.selectGrade = grade
                this.showForm = true
            },
            onGradeSaved(updateGrade) {
                const index = this.grades.findingIndex(g => g.enrollment_id === updateGrade.enrollment_id)
                if(index !== -1) this.grades[index] = updateGrade
                this.showForm = false
            }
        }
    }
</script>
