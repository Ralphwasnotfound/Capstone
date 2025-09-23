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


// Get student by token
// Get logged-in student with enrolled subjects
export const getStudentByMe = async (req, res) => {
  const userId = req.user?.id || req.user?.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const [registrations] = await studentDB.query(
      'SELECT * FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!registrations.length) return res.status(404).json({ message: 'Student not found' });

    const student = registrations[0];

    let frontendStatus = 'pending';
    if (student.status === 'enrolled') frontendStatus = 'enrolled';
    else if (student.status === 'registration_rejected') frontendStatus = 'rejected';
    student.status = frontendStatus;

    const [subjects] = await studentDB.query(
      `SELECT 
        s.id AS subject_id,
        s.name AS subject_name,
        s.code AS subject_code,
        s.units,
        e.semester,
        e.academic_year_id,
        ay.year AS academic_year,
        e.status AS enrollment_status
       FROM enrollments e
       JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
       WHERE e.student_id = ?`,
      [student.id]
    );

    student.subjects = subjects || [];
    res.json({ success: true, data: student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// Approve student and enroll subjects (automatic student detection)
export const approveStudent = async (req, res) => {
  const userId = req.user?.id;
  const { subjects } = req.body; // Only send selected subjects

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!Array.isArray(subjects) || subjects.length === 0)
    return res.status(400).json({ success: false, message: "No subjects provided" });

  try {
    // 1️⃣ Get student
    const [studentRows] = await studentDB.query(
      'SELECT id, year_level FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!studentRows.length) return res.status(404).json({ success: false, message: 'Student not found' });
    const studentId = studentRows[0].id;

    // 2️⃣ Get active academic year
    const [activeYearRows] = await studentDB.query(
      'SELECT id, semester FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    if (!activeYearRows.length) return res.status(400).json({ success: false, message: "No active academic year found" });
    const activeYear = activeYearRows[0];

    // 3️⃣ Determine next semester for the student
    const [existingEnrollments] = await studentDB.query(
      'SELECT DISTINCT semester FROM enrollments WHERE student_id = ? AND academic_year_id = ?',
      [studentId, activeYear.id]
    );

    const semesters = ['1st', '2nd', 'Summer'];
    let nextSemester = semesters.find(s => !existingEnrollments.some(e => e.semester === s));
    if (!nextSemester) nextSemester = semesters[0]; // fallback if all semesters exist

    // 4️⃣ Update student status to 'enrolled'
    await studentDB.query('UPDATE students SET status = ? WHERE id = ?', ['enrolled', studentId]);

    // 5️⃣ Enroll subjects
    const enrollPromises = subjects.map(s =>
      studentDB.query(
        `INSERT INTO enrollments (
          student_id, subject_id, teacher_id, semester, academic_year_id, status, year_level
        ) VALUES (?, ?, ?, ?, ?, 'enrolled', ?)
        ON DUPLICATE KEY UPDATE
          teacher_id = VALUES(teacher_id),
          semester = VALUES(semester),
          academic_year_id = VALUES(academic_year_id),
          status = 'enrolled',
          year_level = VALUES(year_level)`,

        [studentId, s.subjectId, s.teacherId, nextSemester, activeYear.id, studentRows[0].year_level]
      )
    );
    await Promise.all(enrollPromises);

    res.json({ success: true, message: `Student enrolled in ${nextSemester} semester!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// Enroll a single subject (automatic student detection)
export const enrollStudent = async (req, res) => {
  const userId = req.user?.id;
  const { subjectId, semester } = req.body;

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!subjectId || !semester) return res.status(400).json({ message: 'SubjectId and semester are required' });

  try {
    const [studentRows] = await studentDB.query(
      'SELECT id FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!studentRows.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const studentId = studentRows[0].id;

    const [activeYear] = await studentDB.query(
      'SELECT id FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    if (!activeYear.length) return res.status(400).json({ success: false, message: "No active academic year found" });
    const academic_year_id = activeYear[0].id;

    await studentDB.query(
      `INSERT INTO enrollments (student_id, subject_id, semester, academic_year_id, status) 
       VALUES (?, ?, ?, ?, 'enrolled')
       ON DUPLICATE KEY UPDATE
       semester = VALUES(semester),
       academic_year_id = VALUES(academic_year_id),
       status = 'enrolled'`,
      [studentId, subjectId, semester, academic_year_id]
    );

    res.json({ success: true, message: 'Enrolled Successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database Error' });
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


