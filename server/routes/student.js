import express from 'express'
import db from '../db.js'

const router = express.Router()

// GET all students
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM students')
        res.json(results)
    } catch (err) {
        console.error('DB Query error:', err)
        res.status(500).json({ error: 'Database query failed' })
    }
})

// POST new student
router.post('/', async (req, res) => {
    const { full_name, student_id, email, enrollment_type } = req.body

    if (!full_name || !email || !enrollment_type) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        const [results] = await db.query(
            'INSERT INTO students (full_name, student_id, email, enrollment_type) VALUES (?, ?, ?, ?)',
            [full_name, student_id || null, email, enrollment_type]
    )

    res.status(201).json({
        id: results.insertId,
        full_name,
        student_id,
        email,
        enrollment_type,
        status: 'pending',
        })
    } catch (err) {
        console.error('Insert Error:', err)
        res.status(500).json({ error: 'Insert failed' })
    }
})

export default router
