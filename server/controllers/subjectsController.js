import { studentDB } from '../db.js';

// Get all subjects
export const getSubjects = async (req, res) => {
    const { course_id, year_level, teacher_id, semester } = req.query

    try {
        let query = 'SELECT * FROM subjects WHERE 1=1'
        const params = []

        if (course_id) {
            query += ' AND course_id = ?'
            params.push(course_id)
        }
        if (year_level) {
            query += ' AND year_level = ?'
            params.push(year_level)
        }
        if (semester) {
            query += ' AND semester = ?'
            params.push(semester)
        }
        if (teacher_id) {
            query += ' AND teacher_id = ?';
            params.push(teacher_id);
        }

        const [results] = await studentDB.query(query, params)
        res.json(results)
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
};

// Add a subject
export const createSubject = async (req, res) => {
    const { name, code, units, course_id, year_level, semester } = req.body;
    if (!name || !code || !course_id || !year_level || !semester) 
        return res.status(400).json({ message: 'Missing Required Fields' });

    try {
        const [result] = await studentDB.query('INSERT INTO subjects (name, code, units, course_id, year_level, semester) VALUES ( ?, ?, ?, ?, ?, ?)', 
            [name, code, units || 3, course_id, year_level, semester]);
        res.json({ 
            id: 
            result.insertId, 
            name, 
            code, 
            units: units || 3,
            course_id,
            year_level,
            semester
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
};

export const assignTeacherToSubject = async (req, res) => {
    const { teacher_id, subject_id } = req.body
    if (!teacher_id || !subject_id)
        return res.status(400).json({ message: 'Missing Required Fields' })

    try {
        await studentDB.query(
            `INSERT INTO teacher_subjects (teacher_id, subject_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id)`,
            [teacher_id, subject_id]
        )

        await studentDB.query(
            `UPDATE subjects SET teacher_id = ? WHERE id = ?`,
            [teacher_id, subject_id]
        )

        res.json({ success:true, message: 'Teacher assigned to subject' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'DataBase error' })
    }
}

export const getSubjectsByCourse = async (req, res) => {
    const { courseId } =  req.params
    try {
        const [subjects] = await studentDB.query(
            `SELECT 
            s.id,
            s.name,
            s.code,
            s.units,
            s.course_id,
            s.year_level,
            s.semester,
            t.full_name AS teacher
            FROM subjects s
            LEFT JOIN teacher_subjects ts ON ts.subject_id = s.id
            LEFT JOIN teachers t ON t.id = ts.teacher_id
            WHERE s.course_id = ?`,
            [courseId]
        )
        res.json({ success: true, data: subjects})
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: err.message})
    }
}