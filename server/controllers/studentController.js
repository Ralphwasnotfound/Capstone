import { studentDB } from '../db.js' 

export const getStudents =  async (req, res) => {
    try {
        const [results] = await studentDB.query('SELECT * FROM students')
        res.json(results)
    } catch (err) {
        console.error('DB Query error:', err)
        res.status(500).json({ error: 'Database query failed' })
    }
}

export const createStudent = async (req, res) => {
    const { full_name, student_id, email, enrollment_type } = req.body;

    if (!full_name || !email || !enrollment_type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Support both id and userId in the token
    const userId = req.user.id || req.user.userId;

    if (!userId) {
        return res.status(400).json({ error: 'Invalid token: no user ID found' });
    }

    try {
        const [results] = await studentDB.query(
            `INSERT INTO students (full_name, student_id, email, enrollment_type, user_id) 
            VALUES (?, ?, ?, ?, ?)`,
            [full_name, student_id || null, email, enrollment_type, userId]
        );

        res.status(201).json({
            id: results.insertId,
            full_name,
            student_id,
            email,
            enrollment_type,
            status: 'pending',
            user_id: userId
        });
    } catch (err) {
        console.error('Insert Error:', err);
        res.status(500).json({ error: 'Insert failed' });
    }
};

export const getStudentByMe = async (req, res) => {
    const userId = req.user.id || req.user.userId;
    console.log('Searching student for userId:', userId);

    try {
        const [results] = await studentDB.query(
            'SELECT * FROM students WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (!results.length) {
            console.warn(`No student found for user_id: ${userId}`);
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error querying student by user_id:', err)
        res.status(500).json({ error: 'Server Error while fething student', details: err.message });
    }
};

export const approveStudent = async (req, res) => {
    try {
        const { id } = req.params

        // Update the student's status to approved
        await studentDB.query(
            'UPDATE students SET status = ?, student_id = ? WHERE id = ?',
            [
                'approved',
                `STD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                id
            ]
        )

        res.json({ success: true, message: 'Student approved'})
    } catch(err) {
        console.error(err)
        res.status(500).json({success: false, message: err.message})
    }
    
}

export const getPendingStudents = async (req, res) => {
    try {
        const [results] = await studentDB.query(
            'SELECT * FROM students WHERE status = ?',
            ['pending']
        )
        res.json(results)
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
}

export const getEnrolledStudents = async (req, res) => {
    try {
        const [results] = await studentDB.query(
            'SELECT * FROM students WHERE status = ?',
            ['approved']
        )
        res.json(results)
    } catch (err) {
        res.status(500).json({ error: err.message})
    }
}