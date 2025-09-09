import bcrypt  from 'bcrypt'
import { userDB } from '../../db.js'

export const registerTeacher = async (req, res) => {
    const { full_name, email, password, contact, specialization, credentials } = req.body

    if (!full_name || !email || !password) {
        return res.status(400).json({error: 'All fields are required'})
    }

    try {
        // Check if email already exist
        const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        //  1. Create user ( role = teacher)
        const [userResult] = await userDB.query(
            'INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, 'teacher', contact]
        )

        const userId = userResult.insertId

        // 2. Create teacher profile (status = pending by default)
        await userDB.query(
            'INSERT INTO teachers (user_id, full_name, email, specialization, credentials, contact, status) VALUES ( ?, ?, ?, ?, ?, ?, ?)',
            [userId, full_name, email, specialization || null, credentials || null, contact, 'pending']
        )

        res.status(201).json({ message: 'Teacher registered successfully, pending approval'})
    } catch (err) {
        console.error('Teacher registration error:', err)
        res.status(500).json({ error: 'Server error during teacher registration'})
    }

    
}