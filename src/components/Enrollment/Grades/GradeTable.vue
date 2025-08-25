<template>
    <table class="table-auto border-collapse border border-gray-400">
        <thead>
            <tr>
                <th>Subject</th>
                <th>Grade</th>
                <th>Remarks</th>
                <th v-if="editable">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="g in grades" :key="g.enrollment_id">
                <td>{{ g.subject_name }}</td>
                <td>{{ g.grade ?? 'Not yet graded' }}</td>
                <td>{{ g.remarks ?? '-' }}</td>
                <td v-if="editable">
                    <button @click="$emit('edit', g)">Edit</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
    export default {
        props: {
            grades: Array,
            editable: { type: Boolean, default: false}    // Teacher mode
        }
    }
</script>

<style lang="scss" scoped>

</style>