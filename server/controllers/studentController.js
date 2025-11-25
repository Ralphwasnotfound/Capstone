import { userDB, studentDB } from "../db.js";

/* -------------------------------------------------------
   GET ALL STUDENTS (students table → userDB)
-------------------------------------------------------- */
export const getStudents = async (req, res) => {
  try {
    const { user_id, school_id } = req.query;

    let query = "SELECT * FROM students";
    const params = [];

    if (user_id) {
      query += " WHERE user_id = ?";
      params.push(user_id);
    } 
    else if (school_id) {
      query += " WHERE school_id = ?";
      params.push(school_id);
    }

    const [students] = await userDB.query(query, params);
    res.json({ success: true, data: students });

  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success:false, error });
  }
};


/* -------------------------------------------------------
   GET STUDENT BY SCHOOL ID + SUBJECTS
-------------------------------------------------------- */
export const getStudentById = async (req, res) => {
  const { schoolId } = req.params;

  try {
    // Student from userDB
    const [students] = await userDB.query(
      "SELECT * FROM students WHERE school_id = ?",
      [schoolId]
    );
    if (!students.length)
      return res.status(404).json({ message: "Student not found" });

    const student = students[0];

    // Pending info (studentDB)
    const [pending] = await studentDB.query(
      "SELECT year_level, semester, academic_year_id FROM pending_students WHERE school_id = ? ORDER BY created_at DESC LIMIT 1",
      [schoolId]
    );

    if (pending.length) {
      student.year_level = pending[0].year_level;
      student.semester = pending[0].semester;
      student.academic_year_id = pending[0].academic_year_id;
    }

    // Subjects (studentDB)
    const [subjects] = await studentDB.query(
      `SELECT 
        s.id AS subject_id, 
        s.name, 
        s.code, 
        s.units,
        e.school_id,
        e.semester,
        e.academic_year_id,
        ay.year AS academic_year
      FROM subjects s
      LEFT JOIN enrollments e 
        ON s.id = e.subject_id AND e.school_id = ?
      LEFT JOIN academic_years ay 
        ON e.academic_year_id = ay.id`,
      [schoolId]
    );

    student.subjects = subjects || [];

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------------
   GET STUDENT BY USER ID + STRUCTURED SUBJECTS
-------------------------------------------------------- */
export const getStudentByUserId = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id)
    return res
      .status(400)
      .json({ success: false, error: "user_id is required" });

  try {
    // Student from userDB
    const [studentRows] = await userDB.query(
      "SELECT * FROM students WHERE user_id = ?",
      [user_id]
    );
    if (!studentRows.length)
      return res
        .status(404)
        .json({ success: false, error: "Student not found" });

    const student = studentRows[0];

    // Enrolled subjects
    const [enrolledSubjects] = await studentDB.query(
      `SELECT 
         s.id AS subject_id,
         s.name,
         s.code,
         s.units,
         e.semester,
         e.year_level,
         g.grade,
         g.remarks,
         ay.year AS academic_year
       FROM enrollments e
       JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN grades g ON g.student_id = e.student_id AND g.subject_id = s.id
       LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
       WHERE e.student_id = ? AND e.status = 'enrolled'`,
      [student.id]
    );

    // Pending subjects
    const [pendingSubjects] = await studentDB.query(
      `SELECT 
         ps.year_level,
         ps.semester,
         s.id AS subject_id,
         s.name,
         s.code,
         s.units
       FROM pending_students ps
       JOIN subjects s ON s.id = ps.subject_id
       WHERE ps.student_id = ? AND ps.status = 'pending'`,
      [student.id]
    );

    // Build structure
    const maxYear = Math.max(
      ...enrolledSubjects.map((s) => s.year_level),
      ...pendingSubjects.map((p) => p.year_level),
      1
    );

    const structured = {};
    for (let y = 1; y <= maxYear; y++) {
      const yearLabel = `${y}${
        y === 1 ? "st" : y === 2 ? "nd" : y === 3 ? "rd" : "th"
      } Year`;
      structured[yearLabel] = { "1st Sem": [], "2nd Sem": [] };
    }

    // Add enrolled
    enrolledSubjects.forEach((subj) => {
      const yl = `${subj.year_level}${
        subj.year_level === 1
          ? "st"
          : subj.year_level === 2
          ? "nd"
          : subj.year_level === 3
          ? "rd"
          : "th"
      } Year`;
      const sem = `${subj.semester} Sem`;
      structured[yl][sem].push({ ...subj, status: "enrolled" });
    });

    // Add pending
    pendingSubjects.forEach((p) => {
      const yl = `${p.year_level}${
        p.year_level === 1
          ? "st"
          : p.year_level === 2
          ? "nd"
          : p.year_level === 3
          ? "rd"
          : "th"
      } Year`;
      const sem = `${p.semester} Sem`;
      structured[yl][sem].push({
        ...p,
        grade: "",
        remarks: "",
        academic_year: "",
        status: "pending",
      });
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          full_name: student.full_name,
          school_id: student.school_id,
          enrollment_type: student.enrollment_type,
          status: student.status,
        },
        subjects: structured,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* -------------------------------------------------------
   APPROVE STUDENT + ASSIGN SUBJECTS
-------------------------------------------------------- */
export const approveStudent = async (req, res) => {
  const schoolId = req.params.schoolId;
  const { subjects } = req.body;

    console.log("🔥 BACKEND — APPROVE API HIT ===================");
  console.log("URL schoolId:", schoolId);
  console.log("📦 Received body:", req.body);

  if (!subjects || !subjects.length) {
    return res.status(400).json({
      success: false,
      error: "No subjects provided."
    });
  }

  try {
    // 1. Check if student exists in registration.students (userDB)
    const [studentRows] = await userDB.query(
      `SELECT * FROM students WHERE school_id = ? LIMIT 1`,
      [schoolId]
    );

    if (!studentRows.length) {
      return res.status(404).json({
        success: false,
        error: "Student not found in registration students."
      });
    }

    // 2. Get active academic year
    const [activeYear] = await studentDB.query(
      `SELECT id FROM academic_years WHERE status='open' LIMIT 1`
    );

    if (!activeYear.length) {
      return res.status(400).json({
        success: false,
        error: "No active academic year found."
      });
    }

    const activeYearId = activeYear[0].id;

    const failedSubjects = [];

    // 3. Process each subject being approved
    for (const s of subjects) {
      const { subjectId, teacherId, semester, yearLevel } = s;

      const sem = String(semester);
      const yl = Number(yearLevel);

      try {
        // 3A. Insert into enrollments (NO student_id)
        await studentDB.query(
          `INSERT INTO enrollments (
             school_id, subject_id, teacher_id,
             academic_year_id, semester, year_level, status
           )
           VALUES (?, ?, ?, ?, ?, ?, 'enrolled')
           ON DUPLICATE KEY UPDATE
             teacher_id = VALUES(teacher_id),
             semester = VALUES(semester),
             year_level = VALUES(year_level),
             status = 'enrolled'`,
          [
            schoolId,
            subjectId,
            teacherId,
            activeYearId,
            sem,
            yl
          ]
        );

        // 3B. Insert into teacher_subjects
        await studentDB.query(
          `INSERT INTO teacher_subjects (teacher_id, subject_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE 
             teacher_id = VALUES(teacher_id)`,
          [teacherId, subjectId]
        );

      } catch (err) {
        console.error("❌ SUBJECT INSERT ERROR DETAILS:", {
          subjectId,
          teacherId,
          semester: sem,
          yearLevel: yl,
          message: err.message,
          sqlMessage: err.sqlMessage,
        });

        failedSubjects.push({
          subjectId,
          teacherId,
          semester: sem,
          yearLevel: yl,
          error: err.message,
          sqlMessage: err.sqlMessage
        });
      }
    }

    // 4. Update student's registration status
    await userDB.query(
      `UPDATE students SET status='registration_approved' WHERE school_id=?`,
      [schoolId]
    );

    // 5. Final response
    res.json({
      success: true,
      message:
        failedSubjects.length > 0
          ? "Enrollment completed, but some subjects failed."
          : "Enrollment completed successfully.",
      failedSubjects
    });

  } catch (err) {
    console.log("❌ SUBJECT INSERT ERROR:", err.sqlMessage || err.message);

    res.status(500).json({
      success: false,
      error: "Enrollment failed due to server error."
    });
  }
};



/* -------------------------------------------------------
   CREATE STUDENT (after registration)
-------------------------------------------------------- */
export const createStudent = async (req, res) => {
  const { full_name, email, enrollment_type, course_id } = req.body;
  const userId = req.user?.id || req.user?.userId;

  if (!full_name || !email || !enrollment_type || !userId || !course_id)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // Check if exists
    const [existing] = await userDB.query(
      "SELECT * FROM students WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (existing.length)
      return res
        .status(400)
        .json({ error: "Student already exists for this account" });

    // Insert
    const [result] = await userDB.query(
      `INSERT INTO students 
        (full_name, email, school_id, enrollment_type, user_id, course_id, status) 
        VALUES (?, ?, NULL, ?, ?, ?, 'pending')`,
      [full_name, email, enrollment_type, userId, course_id]
    );

    const newId = result.insertId;

    // Generate school_id
    const schoolId = String(newId).padStart(6, "0");

    await userDB.query("UPDATE students SET school_id = ? WHERE id = ?", [
      schoolId,
      newId,
    ]);

    res.status(201).json({
      success: true,
      id: newId,
      school_id: schoolId,
      full_name,
      email,
      enrollment_type,
      status: "pending",
      user_id: userId,
      course_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed", details: err.message });
  }
};

/* -------------------------------------------------------
   ENROLL STUDENT TO ONE SUBJECT
-------------------------------------------------------- */
export const enrollStudent = async (req, res) => {
  const userId = req.user?.id;
  const { subjectId, semester } = req.body;

  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!subjectId || !semester)
    return res
      .status(400)
      .json({ message: "SubjectId and semester are required" });

  try {
    // Student from userDB
    const [studentRows] = await userDB.query(
      "SELECT id, school_id, status FROM students WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!studentRows.length)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    const schoolId = studentRows[0].school_id;

    // Active year
    const [activeYear] = await studentDB.query(
      'SELECT id FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    if (!activeYear.length)
      return res
        .status(400)
        .json({ success: false, message: "No active academic year found" });

    const academic_year_id = activeYear[0].id;

    // Insert enrollment
    await studentDB.query(
      `INSERT INTO enrollments (
        school_id, subject_id, semester, academic_year_id, status
      ) VALUES (?, ?, ?, ?, 'enrolled')
      ON DUPLICATE KEY UPDATE
        semester = VALUES(semester),
        academic_year_id = VALUES(academic_year_id),
        status = 'enrolled'`,
      [schoolId, subjectId, semester, academic_year_id]
    );

    // Update status in userDB
    if (studentRows[0].status !== "enrolled") {
      await userDB.query(
        "UPDATE students SET status = 'enrolled' WHERE school_id = ?",
        [schoolId]
      );
    }

    res.json({
      success: true,
      message: "Enrolled Successfully and student status updated",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database Error",
      error: err.message,
    });
  }
};

/* -------------------------------------------------------
   GET PENDING STUDENTS
-------------------------------------------------------- */
export const getPendingStudents = async (req, res) => {
  try {
    const [pending] = await studentDB.query(
      `SELECT 
          ps.id AS pending_id,
          ps.student_id,
          ps.school_id,
          ps.academic_year_id,
          ps.semester,
          ps.year_level,
          ps.status,
          ps.created_at,
          s.full_name,
          s.email,
          s.course_id
        FROM pending_students ps
        JOIN ${process.env.DB_USERS_NAME}.students s 
             ON s.id = ps.student_id
        ORDER BY ps.created_at DESC`
    );

    res.json({ success: true, data: pending });

  } catch (err) {
    console.error("❌ Get pending students error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


/* -------------------------------------------------------
   CREATE PENDING STUDENT RECORD
-------------------------------------------------------- */
export const createPendingStudents = async (req, res) => {
  try {
    const { student_id, school_id, academic_year_id, semester, year_level } =
      req.body;

    if (!student_id || !school_id || !academic_year_id || !semester || !year_level) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [result] = await studentDB.query(
      `INSERT INTO pending_students 
        (student_id, school_id, academic_year_id, semester, year_level, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')`,
      [student_id, school_id, academic_year_id, semester, year_level]
    );

    res.json({ success: true, pending_id: result.insertId });
  } catch (err) {
    console.error("Create pending error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* -------------------------------------------------------
   GET ENROLLED STUDENTS
-------------------------------------------------------- */
export const getEnrolledStudents = async (req, res) => {
  try {
    const [rows] = await studentDB.query(`
      SELECT
        st.full_name,
        st.school_id,
        st.email,
        st.course_id,
        e.semester,
        e.year_level,
        e.academic_year_id,
        ay.year AS academic_year
      FROM enrollments e

      JOIN ${process.env.DB_USERS_NAME}.students st
        ON st.school_id = e.school_id

      LEFT JOIN academic_years ay 
        ON ay.id = e.academic_year_id

      WHERE e.status = 'enrolled'
      ORDER BY e.year_level, e.semester
    `);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error("GET ENROLLED STUDENTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};





/* -------------------------------------------------------
   TEACHER → THEIR STUDENTS IN A SUBJECT
-------------------------------------------------------- */
export const getEnrolledStudentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const [rows] = await studentDB.query(
      `
      SELECT 
        st.school_id,
        st.full_name,
        g.id AS grade_id,
        g.grade,
        g.remarks,
        e.teacher_id,
        e.academic_year_id,
        s.code AS subject_code,
        s.name AS subject_name
      FROM enrollments e

      JOIN ${process.env.DB_USERS_NAME}.students st
        ON st.school_id = e.school_id

      JOIN subjects s
        ON s.id = e.subject_id

      LEFT JOIN grades g 
        ON g.student_id = st.school_id
       AND g.subject_id = e.subject_id

      WHERE e.subject_id = ?
        AND e.status = 'enrolled'
      ORDER BY st.full_name
      `,
      [subjectId]
    );

    res.json({ success: true, students: rows });

  } catch (err) {
    console.error("Error fetching enrolled students:", err);
    res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message,
    });
  }
};




/* -------------------------------------------------------
   GET STUDENT'S ENROLLED SUBJECTS ONLY
-------------------------------------------------------- */
export const getStudentSubjects = async (req, res) => {
  const schoolId = req.params.id;

  try {
    const [rows] = await studentDB.query(`
      SELECT 
        s.id,
        s.code,
        s.name,
        s.units,
        e.semester,
        e.year_level,
        ay.year AS academic_year
      FROM enrollments e

      JOIN subjects s 
        ON s.id = e.subject_id

      LEFT JOIN academic_years ay
        ON ay.id = e.academic_year_id

      WHERE e.school_id = ?
        AND e.status = 'enrolled'
      ORDER BY e.year_level, e.semester
    `, [schoolId]);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch subjects" });
  }
};


/* -------------------------------------------------------
   GET STUDENT + SUBJECTS (BY SCHOOL ID)
-------------------------------------------------------- */
export const getStudentBySubjects = async (req, res) => {
  const { school_id } = req.params;

  try {
    const [studentRows] = await userDB.query(
      `SELECT id, full_name, school_id
       FROM students 
       WHERE school_id = ?`,
      [school_id]
    );

    if (!studentRows.length) {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    const student = studentRows[0];

    const [subjects] = await studentDB.query(`
      SELECT 
        s.id,
        s.code,
        s.name,
        s.units,
        e.semester,
        e.year_level,
        ay.year AS academic_year
      FROM enrollments e
      JOIN subjects s 
        ON s.id = e.subject_id
      LEFT JOIN academic_years ay 
        ON ay.id = e.academic_year_id
      WHERE e.school_id = ?
        AND e.status = 'enrolled'
      ORDER BY s.year_level, e.semester
    `, [school_id]);

    res.json({ success: true, student, subjects });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


/* -------------------------------------------------------
   FILTERED STUDENTS
-------------------------------------------------------- */
export const getStudentsFiltered = async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = "SELECT * FROM students";
    const params = [];

    if (user_id) {
      query += " WHERE user_id = ?";
      params.push(user_id);
    }

    const [students] = await userDB.query(query, params);

    res.json({ success: true, data: students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------
   GET STUDENT GRADES
-------------------------------------------------------- */
export const getStudentGrades = async (req, res) => {
  const { school_id } = req.params;

  try {
    const [rows] = await studentDB.query(
      `
      SELECT 
          s.id AS subject_id,
          s.code,
          s.name,
          s.units,
          e.year_level,
          e.semester,
          g.grade,
          g.remarks
       FROM enrollments e
       JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN grades g 
         ON g.subject_id = s.id 
        AND g.student_id = e.school_id   -- FIXED
       WHERE e.school_id = ? 
         AND e.status = 'enrolled'
       ORDER BY e.year_level, e.semester
      `,
      [school_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching student grades:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// UPDATE COURSE ID BEFORE ENROLLMENT
export const updateStudentCourse = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({
        success: false,
        error: "student_id and course_id are required",
      });
    }

    // Save selected course into registration.students
    await userDB.query(
      `UPDATE students SET course_id = ? WHERE id = ?`,
      [course_id, student_id]
    );

    res.json({
      success: true,
      message: "Course updated in registration.students",
    });

  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update course_id",
    });
  }
};


