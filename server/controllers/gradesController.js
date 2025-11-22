import { studentDB, userDB } from "../db.js";

/* =====================================================
   GET TEACHER SUBJECTS + STUDENTS + GRADES
===================================================== */
export const getTeacherSubjectsWithStudents = async (req, res) => {
  const teacherId = req.params.teacherId;
  if (!teacherId) return res.status(400).json({ success: false, error: "Teacher ID required" });

  try {
    const [rows] = await studentDB.query(
      `
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
          ON e.subject_id = s.id 
          AND e.teacher_id = ts.teacher_id 
          AND e.status='enrolled'
      LEFT JOIN userDB.students st ON st.id = e.student_id
      LEFT JOIN grades g
          ON g.student_id = st.id AND g.subject_id = s.id
      WHERE ts.teacher_id = ?
      ORDER BY s.id, st.full_name
    `.replace("userDB.", ""), // fix alias
      [teacherId]
    );

    const subjects = rows.reduce((acc, row) => {
      let subject = acc.find((sub) => sub.id === row.subject_id);
      if (!subject) {
        subject = {
          id: row.subject_id,
          code: row.subject_code,
          name: row.subject_name,
          units: row.units,
          year_level: row.year_level,
          students: [],
        };
        acc.push(subject);
      }
      if (row.student_id) {
        subject.students.push({
          id: row.student_id,
          full_name: row.full_name,
          grade_id: row.grade_id,
          grade: row.grade,
          remarks: row.remarks,
        });
      }
      return acc;
    }, []);

    res.json({ success: true, data: subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch subjects/students" });
  }
};

/* =====================================================
   UPDATE A SINGLE GRADE
===================================================== */
export const updateGrade = async (req, res) => {
  console.log("Request Body:", req.body);

  const { student_id, subject_id, teacher_id, grade, remarks, academic_year_id } = req.body;

  if (!student_id || !subject_id || !teacher_id || grade === undefined || !academic_year_id) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    await studentDB.query(
      `
      INSERT INTO grades (student_id, subject_id, teacher_id, grade, remarks, academic_year_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE grade = VALUES(grade), remarks = VALUES(remarks)
    `,
      [student_id, subject_id, teacher_id, grade, remarks, academic_year_id]
    );

    res.json({ success: true, message: "Grade saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save grade" });
  }
};

/* =====================================================
   GET STUDENT SUBJECTS + GRADES
===================================================== */
export const getStudentSubjects = async (req, res) => {
  const studentId = req.params.id;

  if (!studentId) return res.status(400).json({ error: "Student ID is required" });

  try {
    const [subjects] = await studentDB.query(
      `
      SELECT 
        s.id AS subject_id, 
        s.code AS subject_code, 
        s.name AS subject_name, 
        s.units, 
        s.year_level 
      FROM subjects s
      JOIN enrollments e ON s.id = e.subject_id
      WHERE e.student_id = ?
    `,
      [studentId]
    );

    if (!subjects.length) {
      return res.json({ success: true, data: [] });
    }

    const subjectIds = subjects.map((s) => s.subject_id);
    let gradesBySubject = {};

    if (subjectIds.length) {
      const placeholders = subjectIds.map(() => "?").join(",");

      const [grades] = await studentDB.query(
        `
        SELECT 
          e.subject_id, 
          g.grade, 
          g.remarks
        FROM grades g
        JOIN enrollments e 
          ON e.student_id = g.student_id AND e.subject_id = g.subject_id
        WHERE g.student_id = ? AND e.subject_id IN (${placeholders})
      `,
        [studentId, ...subjectIds]
      );

      grades.forEach((g) => {
        gradesBySubject[g.subject_id] = {
          grade: g.grade,
          remarks: g.remarks,
        };
      });
    }

    const subjectsWithGrades = subjects.map((s) => ({
      id: s.subject_id,
      code: s.subject_code,
      name: s.subject_name,
      units: s.units,
      year_level: s.year_level,
      grade: gradesBySubject[s.subject_id]?.grade || "",
      remarks: gradesBySubject[s.subject_id]?.remarks || "",
    }));

    res.json({ success: true, data: subjectsWithGrades });
  } catch (err) {
    console.error("Error fetching student subjects:", err);
    res.status(500).json({ success: false, error: "Failed to fetch student subjects" });
  }
};

/* =====================================================
   GET ALL GRADES FOR A STUDENT (FULL VIEW)
===================================================== */
export const getGradesByStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await studentDB.query(
      `
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
      LEFT JOIN userDB.teachers t ON e.teacher_id = t.id
      LEFT JOIN grades g 
        ON g.student_id = e.student_id 
        AND g.subject_id = e.subject_id
        AND g.academic_year_id = e.academic_year_id
      LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
      WHERE e.student_id = ?
    `.replace("userDB.", ""),
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching student grades:", err);
    res.status(500).json({ success: false, error: "Failed to fetch grades" });
  }
};

/* =====================================================
   GET SPECIFIC GRADE FOR ONE STUDENT + ONE SUBJECT
===================================================== */
export const getStudentGradeBySubject = async (req, res) => {
  const { studentId, subjectId } = req.params;

  if (!studentId || !subjectId) {
    return res.status(400).json({ success: false, error: "Student ID and Subject ID are required" });
  }

  try {
    const [rows] = await studentDB.query(
      `
      SELECT 
        s.name AS subject_name,
        g.grade,
        g.remarks,
        g.academic_year_id,
        g.teacher_id
      FROM grades g
      JOIN subjects s ON s.id = g.subject_id
      WHERE g.student_id = ? AND g.subject_id = ?
    `,
      [studentId, subjectId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: null, message: "No grade found yet" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error fetching specific grade:", err);
    res.status(500).json({ success: false, error: "Failed to fetch grade" });
  }
};

/* =====================================================
   BULK UPDATE GRADES
===================================================== */
export const bulkUpdateGrades = async (req, res) => {
  try {
    const { grades } = req.body;

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({ success: false, message: "No grades provided" });
    }

    const updatePromises = grades.map((g) => {
      return studentDB.query(
        `
        INSERT INTO grades (student_id, subject_id, teacher_id, grade, remarks, academic_year_id)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE grade = VALUES(grade), remarks = VALUES(remarks), updated_at = CURRENT_TIMESTAMP
      `,
        [g.student_id, g.subject_id, g.teacher_id, g.grade, g.remarks, g.academic_year_id]
      );
    });

    await Promise.all(updatePromises);

    res.json({ success: true, message: "Grades updated successfully" });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
