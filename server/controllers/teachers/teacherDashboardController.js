import { studentDB } from "../../db.js"

export const getTeacherSubjects = async (req, res) => {
  const teacherId = req.params.id

  if(!teacherId) {
    return res.status(400).json({ error: "Teacher ID is required"})
  }

  try {
    const [rows] = await studentDB.query(
      `SELECT
        ts.id AS teacher_subject_id,
        s.id AS subject_id,
        s.code AS subject_code,
        s.name AS subject_name,
        s.units,
        s.year_level,
        s.semester,
        st.id AS student_id,
        st.full_name AS student_name,
        st.student_id AS student_no,
        st.email,
        e.status AS enrollment_status,
        e.semester_id,
        e.academic_year_id
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN enrollments e
        ON ts.subject_id = e.subject_id AND ts.teacher_id = e.teacher_id
      LEFT JOIN students st
        ON e.student_id = st.id
      WHERE ts.teacher_id = ?`,
      [teacherId]
    )

    const subjectsMap = {}
    rows.forEach(row => {
      if (!subjectsMap[row.subject_id]) {
        subjectsMap[row.subject_id] = {
          id: row.subject_id,
          code: row.subject_code,
          name: row.subject_name,
          units: row.units,
          year_level: row.year_level,
          semester: row.semester,
          students:[]
        }
      }
      if (row.student_id) {
        subjectsMap[row.subject_id].students.push({
          id: row.student_id,
          full_name: row.student_name,
          student_no: row.student_no,
          email: row.email,
          enrollment_status: row.enrollment_status,
          semester_id: row.semester_id,
          academic_year_id: row.academic_year_id
        })
      }
    })

    res.json({ success: true, data: Object.values(subjectsMap)})
  } catch (err) {
    console.error("Error fetching teacher subject:", err.sqlMessage || err.message)
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