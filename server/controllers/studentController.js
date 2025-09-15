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

// Create a student
export const createStudent = async (req, res) => {
    const { full_name, student_id, email, enrollment_type, course_id, year_level, semester } = req.body;
    const userId = req.user.id || req.user.userId;
    if (!full_name || !email || !enrollment_type || !userId || !course_id || !year_level || !semester)
        return res.status(400).json({ error: 'Missing required fields' });

    try {
        // Generate student_id if not provided
        const generatedStudentId = student_id || `STD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const [result] = await studentDB.query(
            'INSERT INTO students (full_name, student_id, email, enrollment_type, user_id, course_id, year_level, semester, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [full_name, generatedStudentId, email, enrollment_type, userId, course_id, year_level,semester ,'pending']
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
            semester
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Insert failed' });
    }
};


// Get student by token
export const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [students] = await studentDB.query('SELECT * FROM students WHERE id = ?', [id]);
    if (!students.length) return res.status(404).json({ message: 'Student not found' });
    const student = students[0];

    const [subjects] = await studentDB.query(
      `SELECT 
      s.id, 
      s.name, 
      s.code, 
      s.units
      FROM subjects s
      INNER JOIN enrollments e ON s.id = e.subject_id
      WHERE e.student_id = ?`,
      [student.id]
    );

    student.subjects = subjects || [];
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get student info for the currently logged-in user
export const getStudentByMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId; // from JWT or session

    // Fetch the student associated with this user
    const [students] = await studentDB.query(
      'SELECT * FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (!students.length) return res.status(404).json({ message: 'Student not found' });

    const student = students[0];

    // Fetch enrolled subjects for this student
    const [subjects] = await studentDB.query(
      `SELECT 
      s.id, 
      s.name, 
      s.code, 
      s.units
      FROM subjects s
      INNER JOIN enrollments e ON 
      s.id = e.subject_id
      WHERE e.student_id = ?`,
      [student.id]
    );

    student.subjects = subjects || [];
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Approve student and optionally enroll in subjects
// Approve student and optionally enroll in subjects
// Expect data like: [{ subjectId: 1, teacherId: 2 }, { subjectId: 3, teacherId: 5 }]
export const approveStudent = async (req, res) => {
    const { id } = req.params;
    const { subjects } = req.body; // array of objects

    try {
        // Update student status
        await studentDB.query('UPDATE students SET status = ? WHERE id = ?', ['approved', id]);

        if (Array.isArray(subjects) && subjects.length > 0) {
            const enrollPromises = subjects.map(s =>
                studentDB.query(
                    `INSERT INTO enrollments (student_id, subject_id, teacher_id, status) 
                    VALUES (?, ?, ?, 'enrolled')
                    ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), status = 'enrolled'`,
                    [id, s.subjectId, s.teacherId]
                )
            );

            const assignTeacherPromises = subjects.map(s =>
                studentDB.query(
                    'UPDATE subjects SET teacher_id = ? WHERE id = ?',
                    [s.teacherId, s.subjectId]
                )
            );

            const teacherSubjectPromises = subjects.map(s => 
              studentDB.query(
                `INSERT IGNORE INTO teacher_subjects (teacher_id, subject_id) VALUES(?, ?)`,
                [s.teacherId, s.subjectId]
              )
            )

            await Promise.all([...enrollPromises, ...assignTeacherPromises, ...teacherSubjectPromises]);
        }

        res.json({ success: true, message: 'Student approved and enrolled with teachers' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};



// Enroll a single subject
export const enrollStudent = async (req, res) => {
    const studentId = req.params.id;
    const { subjectId } = req.body;
    if (!subjectId) return res.status(400).json({ message: 'SubjectId is required' });

    try {
        await studentDB.query('INSERT IGNORE INTO enrollments (student_id, subject_id) VALUES (?, ?)', [studentId, subjectId]);
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
        s.semester,
        c.name AS course
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE s.status = ?`,
      ['pending']
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
        s.semester,
        c.name AS course
      FROM students s
      JOIN courses c ON s.course_id = c.id
      WHERE s.status = ?`,
      ['approved']
    );
    res.json({ success: true, data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

