// controllers/teachers/teacherDashboardController.js
import { studentDB } from '../../db.js';

export const getTeacherSubjects = async (req, res) => {
  const teacherId = req.params.id; // Teacher's ID from the route parameters

  if (!teacherId) {
    return res.status(400).json({ error: "Teacher ID is required" });
  }

  try {
    // Fetch the subjects assigned to the teacher
    const [subjects] = await studentDB.query(`
      SELECT DISTINCT
        s.id AS subject_id,
        s.name AS subject_name,
        s.code AS subject_code,
        s.units,
        s.year_level
      FROM subjects s
      JOIN enrollments e ON s.id = e.subject_id
      WHERE e.teacher_id = ?`, [teacherId]);

    if (!subjects.length) {
      return res.json({ success: true, data: [] }); // If no subjects, return empty
    }

    const subjectIds = subjects.map(s => s.subject_id);
    let studentsBySubject = {};

    if (subjectIds.length) {
      const placeholders = subjectIds.map(() => '?').join(',');
      const [students] = await studentDB.query(`
        SELECT e.subject_id, st.id AS student_id, st.full_name, g.grade, g.remarks
        FROM enrollments e
        JOIN students st ON e.student_id = st.id
        LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = e.subject_id
        WHERE e.subject_id IN (${placeholders}) AND e.status = 'enrolled'`, subjectIds);

      // Group students by subject
      students.forEach(s => {
        if (!studentsBySubject[s.subject_id]) studentsBySubject[s.subject_id] = [];
        studentsBySubject[s.subject_id].push({
          id: s.student_id,
          full_name: s.full_name,
          grade: s.grade || '',
          remarks: s.remarks || ''
        });
      });
    }

    // Prepare the final response to include subjects with enrolled students and their grades
    const subjectsWithStudents = subjects.map(s => ({
      id: s.subject_id,
      code: s.subject_code,
      name: s.subject_name,
      units: s.units,
      year_level: s.year_level,
      students: studentsBySubject[s.subject_id] || []
    }));

    res.json({ success: true, data: subjectsWithStudents });
  } catch (err) {
    console.error("Error fetching teacher subjects:", err);
    res.status(500).json({ success: false, error: 'Failed to fetch teacher subjects' });
  }
};



// Get all subjects assigned to a teacher with their students
export const getTeacherSubjectsWithStudents = async (req, res) => {
  const teacherId = req.params.id;

  try {
    const [rows] = await studentDB.query(`
      SELECT 
        s.id AS subject_id,
        s.code AS subject_code,
        s.name AS subject_name,
        s.units,
        s.year_level,
        st.id AS student_id,
        st.full_name,
        g.grade,
        g.remarks
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN enrollments e ON e.subject_id = s.id AND e.teacher_id = ts.teacher_id
      LEFT JOIN students st ON st.id = e.student_id
      LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = s.id AND g.teacher_id = ts.teacher_id
      WHERE ts.teacher_id = ?
    `, [teacherId]);

    const subjects = rows.reduce((acc, row) => {
      let subject = acc.find(sub => sub.id === row.subject_id);
      if (!subject) {
        subject = {
          id: row.subject_id,
          code: row.subject_code,
          name: row.subject_name,
          units: row.units,
          year_level: row.year_level,
          students: []
        };
        acc.push(subject);
      }
      if (row.student_id) {
        subject.students.push({
          id: row.student_id,
          full_name: row.full_name,
          grade: row.grade ?? '',  // Include grade
          remarks: row.remarks ?? ''  // Include remarks
        });
      }
      return acc;
    }, []);

    res.json({ success: true, data: subjects });
  } catch (err) {
    console.error("Error fetching teacher subjects:", err);
    res.status(500).json({ success: false, error: 'Failed to fetch teacher subjects' });
  }
};

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

