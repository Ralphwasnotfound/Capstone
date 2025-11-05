<template>
  <div>
    <table class="table-auto border-collapse border border-gray-400 w-full">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1 text-left">Subject</th>
          <th class="border px-2 py-1 text-left">Grade</th>
          <th class="border px-2 py-1 text-left">Remarks</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="g in grades" :key="g.grade_id || g.subject_name">
          <td class="border px-2 py-1">{{ g.subject_name }}</td>
          <td class="border px-2 py-1">{{ g.grade ?? 'Not yet graded' }}</td>
          <td class="border px-2 py-1">{{ g.remarks ?? '-' }}</td>
        </tr>

        <!-- Show a message if there are no grades -->
        <tr v-if="grades.length === 0">
          <td colspan="3" class="border px-2 py-1 text-center text-gray-500">No grades available</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    grades: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>

<style scoped>
/* Optional: make table look nicer */
table {
  border-spacing: 0;
}
th, td {
  border: 1px solid #ccc;
}
</style>
