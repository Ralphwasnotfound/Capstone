<template>
    <div>
        <table class="w-full border text-sm">
            <thead class="bg-gray-200">
                <tr>
                    <th class="border px-4 py-2">Subject</th>
                    <th class="border px-4 py-2">Prelim</th>
                    <th class="border px-4 py-2">Midterm</th>
                    <th class="border px-4 py-2">Semi-Final</th>
                    <th class="border px-4 py-2">Final</th>
                    <th class="border px-4 py-2">Average</th>
                    <th class="border px-4 py-2">Remarks</th>
                    <th class="border px-4 py-2">Percentage</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="subject in subjects" :key="subject.name">
                    <td class="border px-4 py-2">{{ subject.name }}</td>
                    <td class="border px-4 py-2">{{ subject.grades.prelim }}</td>
                    <td class="border px-4 py-2">{{ subject.grades.midterm }}</td>
                    <td class="border px-4 py-2">{{ subject.grades.semifinal }}</td>
                    <td class="border px-4 py-2">{{ subject.grades.final }}</td>
                    <td class="border px-4 py-2">{{ computeAverage(subject.grades)}}</td>
                    <td class="border px-4 py-2"
                        :class="getRemarks(computeAverage(subject.grades)) === 'Passed' ? 'text-green-600' : 'text-red-500'"
                    >{{ getRemarks(computeAverage(subject.grades)) }}
                    </td>
                    <td class="border px-4 py-2"
                        :class="getRemarks(computeAverage(subject.grades)) === 'Passed' ? 'text-green-600' : 'text-red-500'">
                        {{ getGradeInfo(computeAverage(subject.grades))}}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="py-10">
        <table class="w-full border text-sm">
            <thead class="bg-gray-200">
                <tr>
                    <th class="border px-4 py-2">Grade</th>
                    <th class="border px-4 py-2">Percentage</th>
                    <th class="border px-4 py-2">Description</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="grade in grades" :key="grade">
                    <td class="border px-4 py-2">{{ grade.grades }}</td>
                    <td class="border px-4 py-2">{{ grade.percentage }}</td>
                    <td class="border px-4 py-2">{{ grade.description }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                subjects:[
                    {
                        name: 'Networking',
                        grades:{
                            prelim: 1,
                            midterm: 1,
                            semifinal: 1,
                            final: 1
                        }
                    },
                    {
                        name: 'Data Structures and Algorithm',
                        grades:{
                            prelim: 3,
                            midterm: 3,
                            semifinal: 5,
                            final: 1
                        }
                    },
                    
                    
                ],
                grades:[
                    {
                        grades: 1,
                        percentage: '99-100',
                        description: 'Exellent'
                    },
                    {
                        grades: 1.25,
                        percentage: '96-98',
                        description: 'Outstanding'
                    },
                    {
                        grades: 1.5,
                        percentage: '93-95',
                        description: 'Superior'
                    },
                    {
                        grades: 1.75,
                        percentage: '90-92',
                        description: 'Verry Good'
                    },
                    {
                        grades: 2,
                        percentage: '87-89',
                        description: 'Good'
                    },
                    {
                        grades: 2.25,
                        percentage: '84-86',
                        description: 'Satisfactory'
                    },
                    {
                        grades: 2.5,
                        percentage: '81-83',
                        description: 'Fairly Satisfactory'
                    },
                    {
                        grades: 2.75,
                        percentage: '78-80',
                        description: 'Fair'
                    },
                    {
                        grades: 3,
                        percentage: '75-77',
                        description: 'Pass'
                    },
                    {
                        grades: 5,
                        percentage: '< 75',
                        description: 'Fail'
                    },
                ]
            }
        },
        methods: {
            computeAverage(grades){
                const total = grades.prelim + grades.midterm + grades.semifinal + grades.final
                return (total / 4).toFixed(2)
            },
            getRemarks(average){
                return average <= 3.0 ? 'Passed' : 'Failed'
            },
            // Grade Info FIND
            getGradeInfo(average){
                const grade = this.grades.find(g => average >= parseFloat(g.grades) && average < parseFloat(g.grades) + 0.25)
                return grade ? `${grade.description} (${grade.percentage}%)` : 'Fail'
            }
            
        }
    }
</script>

<style lang="scss" scoped>

</style>