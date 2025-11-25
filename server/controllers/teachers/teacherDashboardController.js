// controllers/teachers/teacherDashboardController.js
import { studentDB, userDB } from "../../db.js";

/* =====================================================
   GET TEACHER SUBJECTS BY user_id
===================================================== */
export const getTeacherSubjects = async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: "user_id is required" });
  }

  try {
    // Get teacher internal ID
    const [teacherRows] = await userDB.query(
      "SELECT id FROM teachers WHERE user_id = ?",
      [userId]
    );

    if (!teacherRows.length) {
      return res.status(404).json({ success: false, message: "Teacher not found." });
    }

    const teacherId = teacherRows[0].id;

    // Fetch assigned subjects
    const [subjects] = await studentDB.query(
      `
      SELECT s.id, s.code, s.name, s.units, s.year_level, s.semester
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      WHERE ts.teacher_id = ?
      `,
      [teacherId]
    );

    if (!subjects.length) {
      return res.json({ success: true, data: [] });
    }

    const subjectIds = subjects.map(s => s.id);
    const placeholders = subjectIds.map(() => "?").join(",");

    // Fetch enrolled students WITH real internal ID
    const [students] = await studentDB.query(
      `
      SELECT 
        e.subject_id,
        st.id AS real_student_id,     -- REAL ID (FK to grades)
        st.school_id,
        st.full_name,
        COALESCE(g.grade, '') AS grade,
        COALESCE(g.remarks, '') AS remarks
      FROM enrollments e
      JOIN ${process.env.DB_USERS_NAME}.students st
        ON st.school_id = e.school_id
      LEFT JOIN grades g 
        ON g.student_id = st.id          -- FIXED FK match
       AND g.subject_id = e.subject_id
      WHERE e.subject_id IN (${placeholders})
        AND e.teacher_id = ?
        AND e.status = 'enrolled'
      `,
      [...subjectIds, teacherId]
    );

    // Attach students → with real ID included
    const result = subjects.map(sub => ({
      ...sub,
      students: students
        .filter(s => s.subject_id === sub.id)
        .map(s => ({
          id: s.real_student_id,      // IMPORTANT
          school_id: s.school_id,     // display only
          full_name: s.full_name,
          grade: s.grade,
          remarks: s.remarks
        }))
    }));

    res.json({ success: true, data: result });

  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message
    });
  }
};



/* =====================================================
   GET TEACHER SUBJECTS + STUDENTS (by teacherId)
===================================================== */
export const getTeacherSubjectsWithStudents = async (req, res) => {
  const teacherId = req.params.id;

  try {
    const [rows] = await studentDB.query(
      `
      SELECT 
        s.id AS subject_id,
        s.code AS subject_code,
        s.name AS subject_name,
        s.units,
        s.year_level,
        st.school_id AS student_school_id,
        st.full_name,
        g.grade,
        g.remarks
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      LEFT JOIN enrollments e 
        ON e.subject_id = s.id 
       AND e.teacher_id = ts.teacher_id
       AND e.status = 'enrolled'
      LEFT JOIN ${process.env.DB_USERS_NAME}.students st 
        ON st.school_id = e.school_id
      LEFT JOIN grades g 
        ON g.student_id = st.school_id 
       AND g.subject_id = s.id
      WHERE ts.teacher_id = ?
      ORDER BY s.year_level, s.semester, st.full_name
      `,
      [teacherId]
    );

    const subjects = rows.reduce((acc, row) => {
      let sub = acc.find(x => x.id === row.subject_id);
      if (!sub) {
        sub = {
          id: row.subject_id,
          code: row.subject_code,
          name: row.subject_name,
          units: row.units,
          year_level: row.year_level,
          students: []
        };
        acc.push(sub);
      }

      if (row.student_school_id) {
        sub.students.push({
          school_id: row.student_school_id,
          full_name: row.full_name,
          grade: row.grade ?? '',
          remarks: row.remarks ?? ''
        });
      }

      return acc;
    }, []);

    res.json({ success: true, data: subjects });

  } catch (err) {
    console.error("Error fetching teacher subjects:", err);
    res.status(500).json({ success: false, error: "Failed to fetch teacher subjects" });
  }
};


/* =====================================================
   GET APPROVED TEACHERS (FROM userDB)
===================================================== */
export const getApprovedTeachers = async (req, res) => {
  try {
    const [teachers] = await userDB.query(
      `
      SELECT id, full_name, email, specialization
      FROM teachers
      WHERE status = 'approved'
      `
    );

    res.json({ success: true, data: teachers });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

/* =====================================================
   GET TEACHER BY USER_ID + SUBJECTS + STUDENTS
===================================================== */
export const getTeacherByUserId = async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: "user_id is required" });
  }

  try {
    // 1️⃣ Get teacher (FROM userDB)
    const [teacherRows] = await userDB.query(
      `
      SELECT 
        id, 
        user_id, 
        full_name, 
        profile_picture, 
        email, contact, 
        address, 
        bio,
        occupation, 
        education, 
        skills, 
        specialization, 
        status
      FROM teachers
      WHERE user_id = ?
      `,
      [userId]
    );

    if (!teacherRows.length) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const teacher = teacherRows[0];

    // 2️⃣ Get subjects assigned to teacher
    const [subjects] = await studentDB.query(
      `
      SELECT 
        s.id,
        s.code,
        s.name,
        s.units,
        s.year_level,
        s.semester
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      WHERE ts.teacher_id = ?
      `,
      [teacher.id]
    );

    // 3️⃣ Get enrolled students for these subjects (USING school_id)
    if (subjects.length) {
      const subjectIds = subjects.map(s => s.id);
      const placeholders = subjectIds.map(() => "?").join(",");

      const [students] = await studentDB.query(
        `
        SELECT 
          e.subject_id,
          st.id AS real_student_id,
          st.school_id,
          st.full_name,
          COALESCE(g.grade, '') AS grade,
          COALESCE(g.remarks, '') AS remarks
        FROM enrollments e
        JOIN ${process.env.DB_USERS_NAME}.students st 
            ON st.school_id = e.school_id
        LEFT JOIN grades g 
            ON g.student_id = st.school_id
           AND g.subject_id = e.subject_id
        WHERE e.subject_id IN (${placeholders}) 
          AND e.teacher_id = ?
          AND e.status = 'enrolled'
        `,
        [...subjectIds, teacher.id]
      );

      // Attach students to subjects
      subjects.forEach(sub => {
        sub.students = students.filter(st => st.subject_id === sub.id);
      });
    }

    return res.json({
      success: true,
      data: { teacher, subjects }
    });

  } catch (err) {
    console.error("Error fetching teacher and subjects:", err);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message,
    });
  }
};


/* =====================================================
   UPDATE TEACHER PROFILE (userDB only)
===================================================== */
export const updateTeacherProfile = async (req, res) => {
  const userId = req.params.userId;

  const {
    full_name,
    profile_picture,
    email,
    contact,
    address,
    bio,
    occupation,
    education,
    skills,
    specialization,
    status
  } = req.body || {};

  if (!full_name || !email) {
    return res.status(400).json({ success: false, message: "Full name and email are required" });
  }

  try {
    await userDB.query(
      `
      UPDATE teachers SET 
        full_name=?, profile_picture=?, email=?, contact=?, address=?, bio=?,
        occupation=?, education=?, skills=?, specialization=?, status=?
      WHERE user_id=?
      `,
      [
        full_name, profile_picture, email, contact, address, bio,
        occupation, education, skills, specialization, status,
        userId
      ]
    );

    // Update users table
    await userDB.query(
      `UPDATE users SET full_name=?, email=? WHERE id=?`,
      [full_name, email, userId]
    );

    res.json({ success: true, message: "Profile updated successfully" });

  } catch (err) {
    console.error("Error updating teacher profile:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

/* =====================================================
   SUBMIT GRADES
===================================================== */
export const submitGrades = async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "No grade updates provided." });
  }

  try {
    for (const update of updates) {
      const { subject_id, teacher_id, student_id, grade, remarks } = update;

      await studentDB.query(
        `
        INSERT INTO grades (
          subject_id, 
          teacher_id, 
          student_id, 
          grade, 
          remarks
        )
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE grade = VALUES(grade), remarks = VALUES(remarks)
        `,
        [subject_id, teacher_id, student_id, grade, remarks]
      );
    }

    return res.status(200).json({ message: "Grades updated successfully!" });

  } catch (err) {
    console.error("Grade submission error:", err);
    return res.status(500).json({ message: "Failed to update grades." });
  }
};

