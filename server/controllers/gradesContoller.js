import { studentDB } from "../db";

export const getGradesByStudent = async (req, res) => {
    const studentId = req.params.studentId

    try {
        const [results] = await studentDB.query(`
            SELECT e.id AS enrollment_id,
                sub.code AS subject_code,
                sub.name AS subject_name,
                g.grade,
                g.remarks
            FROM enrollments e
            JOIN subjects sub ON e.subject_id = sub.id
            LEFT JOIN grades g ON g.enrollment_id = e.id
            WHERE e.student_id = ?`,
            [studentId]
        )

        res.json(results)
    } catch (err) {
        console.error('DB Query err:', err)
        res.status(500).json({ error: 'Failed to fetch grades'})
    }
}

// Teacher adds a grade
export const createGrade = async (req, res) => {
    const { enrollment_id, teacher_id, grade, remarks } = req.body;

    if (!enrollment_id || !teacher_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [results] = await studentDB.query(`
            INSERT INTO grades (enrollment_id, teacher_id, grade, remarks)
            VALUES (?, ?, ?, ?)`,
            [enrollment_id, teacher_id, grade || null, remarks || null]
        );

        res.status(201).json({ success: true, id: results.insertId });
    } catch (err) {
        console.error('Insert Error:', err);
        res.status(500).json({ error: 'Failed to add grade' });
    }
};

// Teacher updates a grade
export const updateGrade = async (req, res) => {
    const { id } = req.params
    const { grade, remarks } = req.body

    try {
        await studentDB.query(
            'UPDATE grades SET grade = ?, remarks = ? WHERE id = ?',
            [grade, remarks, id]
        )

        res.json({ success: true})
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to update grade'})
    }
}