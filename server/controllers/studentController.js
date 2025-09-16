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
  const { full_name, student_id, email, enrollment_type, course_id, year_level } = req.body;
  const userId = req.user?.id || req.user?.userId;

  if (!full_name || !email || !enrollment_type || !userId || !course_id || !year_level)
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const generatedStudentId = student_id || `STD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await studentDB.query(
      `INSERT INTO students 
        (full_name, student_id, email, enrollment_type, user_id, course_id, year_level, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, generatedStudentId, email, enrollment_type, userId, course_id, year_level, 'pending']
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
        e.semester_id,
        sem.name AS semester_name,
        e.academic_year_id,
        ay.year AS academic_year
      FROM subjects s
      LEFT JOIN enrollments e ON s.id = e.subject_id AND e.student_id = ?
      LEFT JOIN semesters sem ON e.semester_id = sem.id
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
export const getStudentByMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const [students] = await studentDB.query(
      'SELECT * FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!students.length) return res.status(404).json({ message: 'Student not found' });

    const student = students[0];

    const [subjects] = await studentDB.query(
      `SELECT 
        s.id, s.name, s.code, s.units,
        e.semester_id,
        sem.name AS semester_name,
        e.academic_year_id,
        ay.year AS academic_year
      FROM subjects s
      LEFT JOIN enrollments e ON s.id = e.subject_id AND e.student_id = ?
      LEFT JOIN semesters sem ON e.semester_id = sem.id
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

// Approve student and enroll subjects
export const approveStudent = async (req, res) => {
  const { id } = req.params;
  const { subjects, semester_id: semesterFromFrontend } = req.body;

  try {
    const [activeYear] = await studentDB.query(
      `SELECT id FROM academic_years WHERE status = 'open' ORDER BY created_at DESC LIMIT 1`
    );
    if (!activeYear.length) return res.status(400).json({ success:false, message: "No academic year found" });
    const academic_year_id = activeYear[0].id;

    const [students] = await studentDB.query('SELECT year_level FROM students WHERE id = ?', [id]);
    if (!students.length) return res.status(404).json({ success:false, message: 'Student not found' });
    const year_level = students[0].year_level;

    // Use frontend semester_id if provided, otherwise fallback to active semester
    let semester_id = semesterFromFrontend;
    if (!semester_id) {
      const [activeSemester] = await studentDB.query(
        'SELECT id FROM semesters WHERE status = "open" AND year_level = ? LIMIT 1',
        [year_level]
      );
      if (!activeSemester.length) return res.status(400).json({ success:false, message: 'No active semester found for this year level' });
      semester_id = activeSemester[0].id;
    }

    await studentDB.query('UPDATE students SET status = ? WHERE id = ?', ['enrolled', id]);

    if (Array.isArray(subjects) && subjects.length > 0) {
      const enrollPromises = subjects.map(s =>
        studentDB.query(
          `INSERT INTO enrollments (
            student_id, subject_id, teacher_id, semester_id, academic_year_id, status
          ) VALUES (?, ?, ?, ?, ?, 'enrolled')
          ON DUPLICATE KEY UPDATE 
            teacher_id = VALUES(teacher_id), 
            semester_id = VALUES(semester_id),
            academic_year_id = VALUES(academic_year_id),
            status = 'enrolled'`,
          [id, s.subjectId, s.teacherId, semester_id, academic_year_id]
        )
      );

      const teacherSubjectPromises = subjects.map(s =>
        studentDB.query(
          'INSERT IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES(?, ?)',
          [s.teacherId, s.subjectId]
        )
      );

      await Promise.all([...enrollPromises, ...teacherSubjectPromises]);
    }

    res.json({ success: true, message: 'Student enrolled with teachers' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Enroll a single subject
export const enrollStudent = async (req, res) => {
  const studentId = req.params.id;
  const { subjectId, semester_id } = req.body;

  if (!subjectId || !semester_id) return res.status(400).json({ message: 'SubjectId and semester_id are required' });

  try {
    const [activeYear] = await studentDB.query(
      `SELECT id FROM academic_years WHERE status = 'open' ORDER BY created_at DESC LIMIT 1`
    );
    if (!activeYear.length) return res.status(400).json({ success: false, message: "No active academic year found" });

    const academic_year_id = activeYear[0].id;
    await studentDB.query(
      `INSERT IGNORE INTO enrollments (student_id, subject_id, semester_id, academic_year_id, status) 
       VALUES (?, ?, ?, ?, 'enrolled')`,
      [studentId, subjectId, semester_id, academic_year_id]
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
  COALESCE(e.semester_id, default_sem.id) AS semester_id,
  COALESCE(sem.name, default_sem.name) AS semester_name
FROM students s
LEFT JOIN courses c ON s.course_id = c.id
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN semesters sem ON e.semester_id = sem.id
-- Fallback default open semester
LEFT JOIN (
  SELECT id, name
  FROM semesters
  WHERE status = 'open'
  ORDER BY start_date ASC
  LIMIT 1
) default_sem ON 1=1
WHERE s.status = 'pending';
`
    );

    res.json({ success: true, data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get all approved/enrolled students
export const getEnrolledStudents = async (req, res) => {
  try {
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
  MAX(sem.id) AS semester_id,
  MAX(sem.name) AS semester_name
FROM students s
JOIN courses c ON s.course_id = c.id
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN semesters sem ON e.semester_id = sem.id
WHERE s.status = 'enrolled'
GROUP BY s.id, s.full_name, s.student_id, s.email, s.status, s.enrollment_type, s.year_level, c.name
`
    );

    res.json({ success: true, data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

