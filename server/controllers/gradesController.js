import { studentDB } from "../db.js";

export const getTeacherSubjectsWithStudents = async (req, res) => {
    const teacherId = req.params.teacherId;
    if (!teacherId) return res.status(400).json({ success: false, error: "Teacher ID required" });

    try {
        const [rows] = await studentDB.query(`
            SELECT
                s.id AS subject_id,
                s.name AS subject_name,
                s.code AS subject_code,
                s.units,
                s.year_level,
                st.id AS student_id,
                st.full_name,
                g.id AS grade_id,
                g.grade,
                g.remarks
            FROM teacher_subjects ts
            JOIN subjects s ON ts.subject_id = s.id
            LEFT JOIN enrollments e
                ON e.subject_id = s.id AND e.teacher_id = ts.teacher_id AND e.status='enrolled'
            LEFT JOIN students st ON st.id = e.student_id
            LEFT JOIN grades g
                ON g.student_id = st.id AND g.subject_id = s.id
            WHERE ts.teacher_id = ?
            ORDER BY s.id, st.full_name
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
                    grade_id: row.grade_id,
                    grade: row.grade,
                    remarks: row.remarks
                });
            }
            return acc;
        }, []);

        res.json({ success: true, data: subjects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch subjects/students' });
    }
};

// gradesController.js
export const updateGrade = async (req, res) => {
     console.log("Request Body:", req.body); 
  const { student_id, subject_id, teacher_id, grade, remarks, academic_year_id } = req.body;

  if (!student_id || !subject_id || !teacher_id || grade === undefined || !academic_year_id) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    await studentDB.query(`
      INSERT INTO grades (student_id, subject_id, teacher_id, grade, remarks, academic_year_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE grade = VALUES(grade), remarks = VALUES(remarks)
    `, [student_id, subject_id, teacher_id, grade, remarks, academic_year_id]);

    res.json({ success: true, message: 'Grade saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save grade' });
  }
};

// Get students enrolled in a specific subject along with their grades
export const getStudentsBySubject = async (req, res) => {
  const subjectId = req.params.subjectId;
  if (!subjectId) return res.status(400).json({ success: false, error: "Subject ID is required" });

  try {
    const [rows] = await studentDB.query(`
  SELECT 
    st.id AS id,
    st.full_name,
    g.id AS grade_id,
    g.grade,
    g.remarks,
    e.teacher_id,
    e.academic_year_id
  FROM enrollments e
  JOIN students st ON st.id = e.student_id
  LEFT JOIN grades g 
    ON g.student_id = st.id AND g.subject_id = e.subject_id
  WHERE e.subject_id = ? AND e.status = 'enrolled'
  ORDER BY st.full_name
`, [subjectId]);


    res.json({ success: true, students: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch students" });
  }
};

// ✅ Get all grades for a specific student (using enrollments)
export const getGradesByStudent = async (req, res) => {
  const { id } = req.params; // student ID

  try {
    const [rows] = await studentDB.query(`
      SELECT 
        e.subject_id,
        sub.name AS subject_name,
        e.teacher_id,
        t.full_name AS teacher_name,
        IFNULL(g.grade, NULL) AS grade,
        IFNULL(g.remarks, '') AS remarks,
        e.academic_year_id,
        ay.year AS academic_year,
        ay.semester
      FROM enrollments e
      JOIN subjects sub ON e.subject_id = sub.id
      LEFT JOIN teachers t ON e.teacher_id = t.id
      LEFT JOIN grades g 
        ON g.student_id = e.student_id 
        AND g.subject_id = e.subject_id
        AND g.academic_year_id = e.academic_year_id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      WHERE e.student_id = ?
    `, [id]);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching student grades:", err);
    res.status(500).json({ success: false, error: "Failed to fetch grades" });
  }
};


export const getStudentGradeBySubject = async (req, res) => {
  const {studentId, subjectId} = req.params

  if (!studentId || !subjectId) {
    return res.status(400).json({ success: false, error: "Student ID and Subject ID are required"})
  }

  try {
    const [rows] = await studentDB.query(`
      SELECT 
        s.name AS subject_name,
        g.grade,
        g.remarks,
        g.academic_year_id,
        g.teacher_id
      FROM grades g
      JOIN subjects s ON s.id = g.subject_id
      WHERE g.student_id = ? AND g.subject_id = ?
      `, [studentId, subjectId])

      if (rows.length === 0) {
        return res.json({ success: true, data: null, message: "No grade found yet" })
      }

      res.json({ success: true, data: rows[0] })
  } catch (err) {
    console.error("Error fetching specific grade:", err)
    res.status(500).json({success: false, error: "Failed to fetch  grade"})
  }
}


export const bulkUpdateGrades = async (req, res) => {
  const { grades } = req.body;

  if (!grades || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ success: false, error: 'No grades provided' });
  }

  try {
    for (const g of grades) {
      const { student_id, subject_id, teacher_id, grade, remarks, academic_year_id } = g;
      if (!student_id || !subject_id || !teacher_id || grade === undefined || !academic_year_id) {
        continue;
      }

      await studentDB.query(
        `
        INSERT INTO grades (student_id, subject_id, teacher_id, grade, remarks, academic_year_id)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          grade = VALUES(grade),
          remarks = VALUES(remarks)
        `,
        [student_id, subject_id, teacher_id, grade, remarks, academic_year_id]
      );
    }

    res.json({ success: true, message: 'All grades saved successfully' });
  } catch (err) {
    console.error('Bulk update error:', err);
    res.status(500).json({ success: false, error: 'Failed to save grades' });
  }
};
