<template>
  <div class="mt-6">
    <h2 class="text-xl font-bold mb-4">Your Subjects</h2>
    <table class="w-full border">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-2 text-left">Code</th>
          <th class="p-2 text-left">Name</th>
          <th class="p-2 text-left">Units</th>
          <th class="p-2 text-left">Semester</th>
          <th class="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(subject, index) in subjects"
          :key="subject.id"
          :class="index % 2 === 0 ? 'bg-white hover:bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'"
        >
          <td class="p-2">{{ subject.code }}</td>
          <td class="p-2">{{ subject.name }}</td>
          <td class="p-2">{{ subject.units }}</td>
          <td class="p-2">{{ subject.semester || 'N/A' }}</td>
          <td class="p-2">
            <span :class="subject.enrollment_status === 'enrolled' ? 'text-green-600' : 'text-yellow-600'">
              {{ subject.enrollment_status || 'pending' }}
            </span>
          </td>
        </tr>
        <tr v-if="!subjects.length">
          <td colspan="5" class="text-center py-4">No subjects enrolled yet</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'SubjectsCourses',
  props: {
    subjects: {
      type: Array,
      default: () => []
    }
  }
};
</script>
