// controllers/teachers/teacherDashboardController.js
import { studentDB, userDB } from '../../db.js';

export const getTeacherSubjects = async (req, res) => {
  const userId = req.query.user_id; // get user_id from query

  if (!userId) {
    return res.status(400).json({ success: false, message: "user_id is required" });
  }

  try {
    // Step 1: Get teacher_id from user_id
    const [teacherRows] = await studentDB.query(
      "SELECT id FROM teachers WHERE user_id = ?",
      [userId]
    );

    if (teacherRows.length === 0) {
      return res.status(404).json({ success: false, message: "Teacher not found." });
    }

    const teacherId = teacherRows[0].id;

    // Step 2: Fetch subjects assigned to this teacher
    const [subjects] = await studentDB.query(
      `
      SELECT s.id, s.code, s.name, s.units, s.year_level, s.semester
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      WHERE ts.teacher_id = ?
      `,
      [teacherId]
    );

    // Step 3: Fetch enrolled students per subject
    if (subjects.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const subjectIds = subjects.map(s => s.id);
    const placeholders = subjectIds.map(() => "?").join(",");

    const [students] = await studentDB.query(
      `
      SELECT e.subject_id, st.id, st.full_name, st.school_id,
             COALESCE(g.grade, '') AS grade, COALESCE(g.remarks, '') AS remarks
      FROM enrollments e
      JOIN students st ON e.student_id = st.id
      LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = e.subject_id
      WHERE e.subject_id IN (${placeholders}) AND e.teacher_id = ?
      `,
      [...subjectIds, teacherId]
    );

    // Group students by subject
    const subjectsWithStudents = subjects.map(subject => ({
      ...subject,
      students: students.filter(st => st.subject_id === subject.id)
    }));

    res.json({ success: true, data: subjectsWithStudents });

  } catch (error) {
    console.error("Error fetching teacher subjects:", error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
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

export const getTeacherByUserId = async (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: "user_id is required" });
  }

  try {
    // Step 1: Get teacher info
    const [teacherRows] = await studentDB.query(
      `SELECT 
        id, user_id, full_name, profile_picture, email, contact, address, bio,
        occupation, education, skills, specialization, status
      FROM teachers
      WHERE user_id = ?`,
      [userId]
    );

    if (!teacherRows.length) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const teacher = teacherRows[0];

    // Step 2: Get subjects assigned to this teacher
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

    // Step 3: Fetch students per subject
    if (subjects.length) {
      const subjectIds = subjects.map(s => s.id);
      const placeholders = subjectIds.map(() => "?").join(",");

      const [students] = await studentDB.query(
        `
        SELECT 
          e.subject_id,
          st.id,
          st.full_name,
          st.school_id,
          COALESCE(g.grade, '') AS grade,
          COALESCE(g.remarks, '') AS remarks
        FROM enrollments e
        JOIN students st ON e.student_id = st.id
        LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = e.subject_id
        WHERE e.subject_id IN (${placeholders})
        AND e.teacher_id = ?
        `,
        [...subjectIds, teacher.id]
      );

      // Attach students to their subjects
      subjects.forEach(subject => {
        subject.students = students.filter(st => st.subject_id === subject.id);
      });
    }

    res.json({
      success: true,
      data: {
        teacher,
        subjects
      }
    });

  } catch (err) {
    console.error("Error fetching teacher and subjects:", err);
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
};


export const updateTeacherProfile = async (req, res) => {
  const userId = req.params.userId;

  // Safely destructure req.body to avoid crashing if it's undefined
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
  } = req.body || {}; // <-- fallback to empty object

  // Optional: check if body actually has required fields
  if (!full_name || !email) {
    return res.status(400).json({ success: false, message: "Full name and email are required" });
  }

  try {
    const teacherQuery = `
      UPDATE teachers SET 
        full_name=?, profile_picture=?, email=?, contact=?, address=?, bio=?,
        occupation=?, education=?, skills=?, specialization=?, status=?
      WHERE user_id=?`;

    const teacherParams = [
      full_name, profile_picture, email, contact, address, bio,
      occupation, education, skills, specialization, status,
      userId
    ];

    await studentDB.query(teacherQuery, teacherParams);
    await userDB.query(teacherQuery, teacherParams);

    // Update users table if teacher exists
    const [teacherRows] = await userDB.query(
      `SELECT user_id FROM teachers WHERE user_id = ?`,
      [userId]
    );

    if (teacherRows.length) {
      await userDB.query(
        `UPDATE users SET full_name=?, email=? WHERE id=?`,
        [full_name, email, teacherRows[0].user_id]
      );
    }

    res.json({ success: true, message: "Profile updated successfully in both databases" });
  } catch (err) {
    console.error("Error updating teacher profile:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};






