import { studentDB } from "../../db.js"; // enrollment_system DB

export const getTeacherSubjects = async (req, res) => {
  const teacherId = req.params.id;

  if (!teacherId) {
    return res.status(400).json({ error: "Teacher ID is required" });
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
        st.id AS student_id,
        st.full_name AS student_name,
        e.status AS enrollment_status
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN enrollments e 
        ON ts.subject_id = e.subject_id
      LEFT JOIN students st 
        ON e.student_id = st.id AND st.status = 'approved'
      WHERE ts.teacher_id = ?`,
      [teacherId]
    );

    // Group students under each subject
    const subjectsMap = {};
    rows.forEach(row => {
      if (!subjectsMap[row.subject_id]) {
        subjectsMap[row.subject_id] = {
          id: row.subject_id,
          code: row.subject_code,
          name: row.subject_name,
          units: row.units,
          year_level: row.year_level,
          students: []
        };
      }
      if (row.student_id) {
        subjectsMap[row.subject_id].students.push({
          id: row.student_id,
          full_name: row.student_name,
          enrollment_status: row.enrollment_status
        });
      }
    });

    res.json({ success: true, data: Object.values(subjectsMap) });
  } catch (err) {
    console.error("Error fetching teacher subjects:", err.sqlMessage || err.message, err);
    res.status(500).json({ success: false, error: "Failed to fetch teacher subjects" });
  }
};
