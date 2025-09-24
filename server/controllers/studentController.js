import { studentDB } from '../db.js';

// Get all students
export const getStudents = async (req, res) => {
  try {
    const [results] = await studentDB.query('SELECT * FROM students');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
};

// Create a student enrollment
export const createStudent = async (req, res) => {
  const { full_name, student_id, email, enrollment_type, course_id, year_level, semester, academic_year_id } = req.body;
  const userId = req.user?.id || req.user?.userId;

  if (!full_name || !email || !enrollment_type || !userId || !course_id || !year_level || !semester || !academic_year_id )
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const generatedStudentId = student_id || `STD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await studentDB.query(
      `INSERT INTO students 
        (full_name, student_id, email, enrollment_type, user_id, course_id, year_level, status, semester, academic_year_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? , ?)`,
      [full_name, generatedStudentId, email, enrollment_type, userId, course_id, year_level, 'pending', semester, academic_year_id]
    );

    res.status(201).json({
      id: result.insertId,
      full_name,
      student_id: generatedStudentId,
      email,
      enrollment_type,
      status: 'pending',
      user_id: userId,
      course_id,
      year_level,
      semester,
      academic_year_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
};

// Get student by ID with subjects
export const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [students] = await studentDB.query('SELECT * FROM students WHERE id = ?', [id]);
    if (!students.length) return res.status(404).json({ message: 'Student not found' });

    const student = students[0];

    const [subjects] = await studentDB.query(
  `SELECT 
    s.id, s.name, s.code, s.units,
    e.semester,
    e.academic_year_id,
    ay.year AS academic_year
  FROM subjects s
  LEFT JOIN enrollments e ON s.id = e.subject_id AND e.student_id = ?
  LEFT JOIN academic_years ay ON e.academic_year_id = ay.id`,
  [student.id]
);


    student.subjects = subjects || [];
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getStudentByMe = async (req, res) => {
  const userId = req.user?.id || req.user?.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    // 1️⃣ Get student by logged-in user
    const [studentRows] = await studentDB.query(
      'SELECT * FROM students WHERE user_id = ? ORDER BY created_at ASC LIMIT 1',
      [userId]
    );
    if (!studentRows.length) 
      return res.status(404).json({ success: false, message: 'Student not found' });

    const student = studentRows[0];

    // 2️⃣ Get enrollment history
    const [enrollments] = await studentDB.query(
      `SELECT 
         e.semester, 
         e.status AS enrollment_status,
         e.academic_year_id,
         ay.year AS academic_year
       FROM enrollments e
       LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
       WHERE e.student_id = ?`,
      [student.id]
    );

    // Build semester-status map
    const semesterStatus = {};
    enrollments.forEach((e) => {
      if (!semesterStatus[e.semester] || semesterStatus[e.semester] !== 'enrolled') {
        semesterStatus[e.semester] = e.enrollment_status;
      }
    });

    // 3️⃣ Get subjects
    const [subjects] = await studentDB.query(
      `SELECT
         s.id,
         s.name,
         s.code,
         s.units,
         e.semester,
         e.status AS enrollment_status
       FROM enrollments e
       JOIN subjects s ON s.id = e.subject_id
       WHERE e.student_id = ?
         AND e.status = 'enrolled'
       ORDER BY s.name`,
      [student.id]
    );

    // 4️⃣ Return clean response
    res.json({
      success: true,
      data: {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        student_id: student.student_id,
        enrollment_type: student.enrollment_type,
        year_level: student.year_level,
        semesterStatus,
        subjects,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
};


export const approveStudent = async (req, res) => {
  const studentId = req.params.id;
  const { subjectId, teacherId, academicYearId, semester, yearLevel } = req.body;

  if (!studentId || !subjectId || !teacherId || !academicYearId || !semester || !yearLevel) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  try {
    // 1️⃣ Insert or update enrollment
    await studentDB.query(
      `INSERT INTO enrollments (
         student_id,
         subject_id,
         teacher_id,
         academic_year_id,
         semester,
         year_level,
         status
       ) VALUES (?, ?, ?, ?, ?, ?, 'enrolled')
       ON DUPLICATE KEY UPDATE
         status = 'enrolled',
         year_level = VALUES(year_level),
         teacher_id = VALUES(teacher_id),
         academic_year_id = VALUES(academic_year_id),
         semester = VALUES(semester)`,
      [studentId, subjectId, teacherId, academicYearId, semester, yearLevel]
    );

    // 2️⃣ Update student's status to enrolled
    await studentDB.query(
      'UPDATE students SET status = "enrolled" WHERE id = ?',
      [studentId]
    );

    return res.json({
      success: true,
      message: "Student approved and enrolled successfully"
    });
  } catch (err) {
    console.error("❌ Error approving student:", err);
    return res.status(500).json({ success: false, error: "Failed to approve/enroll student" });
  }
};


// Enroll a single subject (automatic student detection)
// Enroll a single subject (automatic student detection)
export const enrollStudent = async (req, res) => {
  const userId = req.user?.id;
  const { subjectId, semester } = req.body;

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!subjectId || !semester) return res.status(400).json({ message: 'SubjectId and semester are required' });

  try {
    // 1️⃣ Get student by userId
    const [studentRows] = await studentDB.query(
      'SELECT id, status FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!studentRows.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const studentId = studentRows[0].id;

    // 2️⃣ Get active academic year
    const [activeYear] = await studentDB.query(
      'SELECT id FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    if (!activeYear.length) return res.status(400).json({ success: false, message: "No active academic year found" });

    const academic_year_id = activeYear[0].id;

    // 3️⃣ Insert or update enrollment
    await studentDB.query(
      `INSERT INTO enrollments (student_id, subject_id, semester, academic_year_id, status) 
       VALUES (?, ?, ?, ?, 'enrolled')
       ON DUPLICATE KEY UPDATE
         semester = VALUES(semester),
         academic_year_id = VALUES(academic_year_id),
         status = 'enrolled'`,
      [studentId, subjectId, semester, academic_year_id]
    );

    // 4️⃣ Update student's status to enrolled (if not already)
    if (studentRows[0].status !== 'enrolled') {
      await studentDB.query(
        'UPDATE students SET status = "enrolled" WHERE id = ?',
        [studentId]
      );
    }

    res.json({ success: true, message: 'Enrolled Successfully and student status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database Error', error: err.message });
  }
};




// Get all pending students
export const getPendingStudents = async (req, res) => {
  try {
    // 1️⃣ Get active academic year (for fallback)
    const [activeYearRows] = await studentDB.query(
      'SELECT id, semester, year FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    const activeYear = activeYearRows.length ? activeYearRows[0] : null;

    // 2️⃣ Get pending students
    const [students] = await studentDB.query(
      `SELECT 
         s.id, 
         s.full_name, 
         s.student_id, 
         s.email, 
         s.status, 
         s.enrollment_type, 
         s.year_level, 
         c.name AS course,
         s.semester,
         s.academic_year_id,
         ay.year AS academic_year
       FROM students s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN academic_years ay  ON s.academic_year_id = ay.id
       WHERE s.status = 'pending'`
    );

    // 3️⃣ Assign semester and academic_year if missing
    for (const student of students) {
      if (!student.semester && activeYear) student.semester = activeYear.semester;
      if (!student.academic_year_id && activeYear) student.academic_year_id = activeYear.id;
    }

    res.json({ success: true, data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};





// Get all approved/enrolled students
export const getEnrolledStudents = async (req, res) => {
  try {
    const [activeYearRows] = await studentDB.query(
      'SELECT id, semester, year FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    const activeYear = activeYearRows.length ? activeYearRows[0] : null;

    const [students] = await studentDB.query(
      `SELECT 
         s.id, s.full_name, s.student_id, s.email, s.status, s.enrollment_type, s.year_level, c.name AS course,
         e.semester, e.academic_year_id,
         ay.year AS academic_year
       FROM students s
       JOIN courses c ON s.course_id = c.id
       LEFT JOIN enrollments e ON e.student_id = s.id
       LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
       WHERE s.status = 'enrolled'`
    );

    // Fill missing semester or academic_year from active year
    for (const student of students) {
      if (!student.semester && activeYear) student.semester = activeYear.semester;
      if (!student.academic_year_id && activeYear) student.academic_year_id = activeYear.id;
      if (!student.academic_year && activeYear) student.academic_year = activeYear.year;
    }

    res.json({ success: true, data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};




// GET /teachers/:teacherId/subjects/:subjectId/students
export const getEnrolledStudentsBySubject = async (req, res) => {
  const { subjectId } = req.params;
  if (!subjectId) {
    return res.status(400).json({ success: false, message: "Missing subjectId" });
  }

  try {
    const [rows] = await studentDB.query(
      `SELECT 
        st.id, 
        st.full_name,
        g.id AS grade_id,
        g.grade,
        g.remarks,
        e.teacher_id,
        e.academic_year_id
       FROM enrollments e
       JOIN students st ON st.id = e.student_id
       LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = e.subject_id
       WHERE e.subject_id = ? AND e.status = 'enrolled'
       ORDER BY st.full_name`,
      [subjectId]
    );

    res.json({ success: true, students: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err });
  }
};
