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

// Get student by ID with subjects
export const getStudentById = async (req, res) => {
  const { schoolId } = req.params;
  try {
    // Get student
    const [students] = await studentDB.query(
      'SELECT * FROM students WHERE school_id = ?',
      [schoolId]
    );
    if (!students.length) return res.status(404).json({ message: 'Student not found' });

    const student = students[0];

    // Get pending enrollment info (if any)
    const [pending] = await studentDB.query(
      'SELECT year_level, semester, academic_year_id FROM pending_students WHERE school_id = ? ORDER BY created_at DESC LIMIT 1',
      [schoolId]
    );

    if (pending.length) {
      student.year_level = pending[0].year_level;
      student.semester = pending[0].semester;
      student.academic_year_id = pending[0].academic_year_id;
    }

    // Get enrolled subjects
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


// controllers/studentController.js
export const getStudentByMe = async (req, res) => {
  const userId = req.user?.id || req.user?.userId;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    // Get student
    const [studentRows] = await studentDB.query(
      'SELECT * FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!studentRows.length) return res.status(404).json({ success: false, message: 'Student not found' });
    const student = studentRows[0];

    // Get active academic year
    const [activeYearRows] = await studentDB.query(
      'SELECT id, semester, year FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    const activeYear = activeYearRows.length ? activeYearRows[0] : null;

    // Get all enrollments for this student
    const [subjects] = await studentDB.query(
      `SELECT 
         s.id AS subject_id,
         s.name,
         s.code,
         s.units,
         e.semester,
         e.year_level,
         e.status AS enrollment_status,
         ay.year AS academic_year
       FROM enrollments e
       JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
       WHERE e.student_id = ?`,
      [student.id]
    );

    // Determine max year_level to build full structure
    const maxYear = Math.max(...subjects.map(s => s.year_level), 1);

    const structured = {};
    for (let y = 1; y <= maxYear; y++) {
      const yearLabel = `${y}${y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year`;
      structured[yearLabel] = { "1st Sem": [], "2nd Sem": [] };
    }

    subjects.forEach(subj => {
      const yearLabel = `${subj.year_level}${subj.year_level === 1 ? 'st' : subj.year_level === 2 ? 'nd' : subj.year_level === 3 ? 'rd' : 'th'} Year`;
      const semKey = `${subj.semester} Sem`;
      if (structured[yearLabel][semKey]) {
        structured[yearLabel][semKey].push({
          subject_id: subj.subject_id,
          name: subj.name,
          code: subj.code,
          units: subj.units,
          status: subj.enrollment_status,
          academic_year: subj.academic_year
        });
      }
    });

    // Build semesterStatus object for current academic year
    const semesterStatus = { '1st': 'none', '2nd': 'none' };
    subjects.forEach(e => {
      if (e.academic_year === activeYear?.year) {
        semesterStatus[e.semester] = e.enrollment_status;
      }
    });

    res.json({
      success: true,
      data: {
        id: student.id,
        full_name: student.full_name,
        school_id: student.school_id,
        enrollment_type: student.enrollment_type,
        semesterStatus,
        activeYear,
        subjects: structured
      }
    });
  } catch (err) {
    console.error('❌ Error in getStudentByMe:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const approveStudent = async (req, res) => {
  const { schoolId, subjects } = req.body;
  if (!schoolId || !subjects?.length)
    return res.status(400).json({ success: false, error: "Missing required fields" });

  try {
    // Get student
    const [studentRows] = await studentDB.query(
      'SELECT id FROM students WHERE school_id = ? LIMIT 1',
      [schoolId]
    );
    if (!studentRows.length)
      return res.status(404).json({ success: false, error: "Student not found" });

    const studentId = studentRows[0].id;

    // Active academic year
    const [activeYearRows] = await studentDB.query(
      'SELECT id FROM academic_years WHERE status="open" ORDER BY created_at DESC LIMIT 1'
    );
    const activeYearId = activeYearRows.length ? activeYearRows[0].id : 1;

    // Keep track of failed subjects
    const failedSubjects = [];

    // Enroll current subjects
    for (const s of subjects) {
      const { subjectId, teacherId, semester, yearLevel } = s;

      if (!subjectId || !teacherId || !semester || !yearLevel) {
        failedSubjects.push({ ...s, error: "Missing required fields" });
        continue; // skip this one but continue with others
      }

      try {
        await studentDB.query(
          `INSERT INTO enrollments (
             student_id, school_id, subject_id, teacher_id, academic_year_id, semester, year_level, status
           ) VALUES (?, ?, ?, ?, ?, ?, ?, 'enrolled')
           ON DUPLICATE KEY UPDATE
             status='enrolled',
             year_level=VALUES(year_level),
             teacher_id=VALUES(teacher_id),
             academic_year_id=VALUES(academic_year_id),
             semester=VALUES(semester)`,
          [studentId, schoolId, subjectId, teacherId, activeYearId, semester, yearLevel]
        );
      } catch (err) {
        failedSubjects.push({ ...s, error: err.message });
      }
    }

    // Update student status
    await studentDB.query('UPDATE students SET status="enrolled" WHERE id=?', [studentId]);

    if (failedSubjects.length) {
      return res.status(207).json({
        success: false,
        message: "Some subjects failed to enroll",
        failedSubjects
      });
    }

    await studentDB.query(`
      UPDATE pending_students
      SET status = 'approved' 
      WHERE school_id = ? 
        AND semester IN ('1st', '2nd')
        AND status = 'pending'`,
      [schoolId]
      )

    res.json({ success: true, message: "All subjects enrolled successfully" });

  } catch (err) {
    console.error("❌ Error approving student:", err);
    res.status(500).json({ success: false, error: "Failed to approve/enroll student" });
  }
};


// controllers/studentController.js


export const createStudent = async (req, res) => {
  const { full_name, email, enrollment_type, course_id } = req.body;
  const userId = req.user?.id || req.user?.userId;

  if (!full_name || !email || !enrollment_type || !userId || !course_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1️⃣ Check if student already exists for this user
    const [existing] = await studentDB.query(
      "SELECT * FROM students WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (existing.length) {
      return res.status(400).json({ error: "Student already exists for this account" });
    }

    // 2️⃣ Insert student (school_id will be updated later)
    const [result] = await studentDB.query(
      `INSERT INTO students 
        (full_name, email, school_id, enrollment_type, user_id, course_id, status) 
       VALUES (?, ?, NULL, ?, ?, ?, 'pending')`,
      [full_name, email, enrollment_type, userId, course_id]
    );

    const newId = result.insertId;

    // 3️⃣ Generate school_id based on new ID
    const schoolId = String(newId).padStart(6, "0"); 

    await studentDB.query(
      `UPDATE students SET school_id = ? WHERE id = ?`,
      [schoolId, newId]
    );

    res.status(201).json({
      success: true,
      id: newId,
      school_id: schoolId,
      full_name,
      email,
      enrollment_type,
      status: 'pending',
      user_id: userId,
      course_id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed', details: err.message });
  }
};

// Enroll a single subject (automatic student detection)

export const enrollStudent = async (req, res) => {
  const userId = req.user?.id;
  const { subjectId, semester } = req.body;

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!subjectId || !semester) return res.status(400).json({ message: 'SubjectId and semester are required' });

  try {
    // 1️⃣ Get student by userId
    const [studentRows] = await studentDB.query(
      'SELECT id, school_id, status FROM students WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (!studentRows.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const schoolId = studentRows[0].school_id;

    // 2️⃣ Get active academic year
    const [activeYear] = await studentDB.query(
      'SELECT id FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    if (!activeYear.length) return res.status(400).json({ success: false, message: "No active academic year found" });

    const academic_year_id = activeYear[0].id; // ✅ fixed

    // 3️⃣ Insert or update enrollment
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

    // 4️⃣ Update student's status to enrolled
    if (studentRows[0].status !== 'enrolled') {
      await studentDB.query(
        'UPDATE students SET status = "enrolled" WHERE school_id = ?',
        [schoolId]
      );
    }

    res.json({ success: true, message: 'Enrolled Successfully and student status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database Error', error: err.message });
  }
};


// Get all pending students
// controllers/studentController.js
export const getPendingStudents = async (req, res) => {
  try {
    // 1️⃣ Get active academic year (optional, for fallback)
    const [activeYearRows] = await studentDB.query(
      `SELECT id, semester, year 
       FROM academic_years 
       WHERE status = "open" 
       ORDER BY created_at DESC 
       LIMIT 1`
    );
    const activeYear = activeYearRows.length ? activeYearRows[0] : null;

    // 2️⃣ Get pending students from pending_students table
    const [students] = await studentDB.query(
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
         s.enrollment_type,
         c.name AS course
       FROM pending_students ps
       JOIN students s ON s.id = ps.student_id
       LEFT JOIN courses c ON s.course_id = c.id
       ORDER BY ps.created_at DESC`
    );

    // 3️⃣ Fill in missing semester/academic year if needed
    students.forEach((student) => {
      if (!student.semester && activeYear) student.semester = activeYear.semester;
      if (!student.academic_year_id && activeYear) student.academic_year_id = activeYear.id;
      if (!student.academic_year && activeYear) student.academic_year = activeYear.year;
    });

    res.json({ success: true, data: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// controllers/studentController.js
export const createPendingStudents = async (req, res) => {
  try {
    const { student_id, school_id, academic_year_id, semester, year_level } = req.body;

    if (!student_id || !school_id || !academic_year_id || !semester || !year_level) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // insert into pending_students table
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

// Get all approved/enrolled students
export const getEnrolledStudents = async (req, res) => {
  try {
    // Get active academic year
    const [activeYearRows] = await studentDB.query(
      'SELECT id, semester, year FROM academic_years WHERE status = "open" ORDER BY created_at DESC LIMIT 1'
    );
    const activeYear = activeYearRows.length ? activeYearRows[0] : null;

    const [students] = await studentDB.query(
      `SELECT 
         s.id,
         s.school_id, 
         s.full_name, 
         s.email, 
         s.status, 
         s.enrollment_type, 
         c.name AS course,
         e.semester,
         MIN(e.year_level) AS year_level,
         e.academic_year_id,
         ay.year AS academic_year,
         MIN(e.created_at) AS date_enrolled
       FROM students s
       JOIN courses c ON s.course_id = c.id
       JOIN enrollments e ON e.school_id = s.school_id AND e.status = 'enrolled'
       LEFT JOIN academic_years ay ON ay.id = e.academic_year_id
       WHERE s.status IN ('enrolled', 'active')
       GROUP BY s.id, s.school_id, s.full_name, s.email, s.status, s.enrollment_type, c.name, e.semester, e.academic_year_id, ay.year`
    );

    const data = students.map(student => ({
      ...student,
      semester: student.semester || (activeYear ? activeYear.semester : 'N/A'),
      academic_year: student.academic_year || (activeYear ? activeYear.year : 'N/A'),
      year_level: student.year_level || 1,
      date_enrolled: student.date_enrolled ? new Date(student.date_enrolled) : null,
    }));

    res.json({ success: true, data });
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
        st.school_id, 
        st.full_name,
        g.id AS grade_id,
        g.grade,
        g.remarks,
        e.teacher_id,
        e.academic_year_id
       FROM enrollments e
       JOIN students st ON st.school_id = e.school_id
       LEFT JOIN grades g ON g.school_id = st.school_id AND g.subject_id = e.subject_id
       WHERE e.subject_id = ? AND e.status = 'enrolled'
       ORDER BY st.full_name`,
      [subjectId]
    );

    res.json({ success: true, students: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err });
  }
};
