import { studentDB } from "../../db.js"

export const getTeacherSubjects = async (req, res) => {
  const teacherId = req.params.id
  if (!teacherId) return res.status(400).json({ error: "Teacher ID is required" })

  try {
    // Fetch subjects assigned to this teacher via enrollments
    const [subjects] = await studentDB.query(
      `SELECT DISTINCT
         s.id AS subject_id,
         s.name AS subject_name,
         s.code AS subject_code,
         s.units,
         s.year_level
       FROM subjects s
       JOIN enrollments e ON s.id = e.subject_id
       WHERE e.teacher_id = ?`,
      [teacherId]
    )

    if (!subjects.length) {
      return res.json({ success: true, data: [] })
    }

    const subjectIds = subjects.map(s => s.subject_id)
    let studentsBySubject = {}

    if (subjectIds.length) {
      const placeholders = subjectIds.map(() => '?').join(',')
      const [students] = await studentDB.query(
        `SELECT e.subject_id, st.id AS student_id, st.full_name
         FROM enrollments e
         JOIN students st ON e.student_id = st.id
         WHERE e.subject_id IN (${placeholders}) AND e.status = 'enrolled'`,
        subjectIds
      )

      students.forEach(s => {
        if (!studentsBySubject[s.subject_id]) studentsBySubject[s.subject_id] = []
        studentsBySubject[s.subject_id].push({ id: s.student_id, full_name: s.full_name })
      })
    }

    const subjectsWithStudents = subjects.map(s => ({
      id: s.subject_id,
      code: s.subject_code,
      name: s.subject_name,
      units: s.units,
      year_level: s.year_level,
      students: studentsBySubject[s.subject_id] || []
    }))

    res.json({ success: true, data: subjectsWithStudents })
  } catch (err) {
    console.error("Error fetching teacher subjects:", err.sqlMessage || err.message)
    res.status(500).json({ success: false, error: "Failed to fetch teacher subjects" })
  }
}



// ENROLLMENT_SYSTEM
export const getApprovedTeachers = async (req, res) => {
  try {
    const [teachers] = await studentDB.query(
      `SELECT id, full_name, email, specialization
      FROM teachers
      WHERE status = 'approved'`
    )
    res.json({ success:true, data: teachers })
  } catch (err) {
    console.error(err) 
    res.status(500).json({ success: false, message: 'Database error' })
  }
}