import bcrypt from 'bcrypt'
import { userDB } from '../../db.js'

export const registerStudent = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            contact,
            student_number,
            street,
            barangay,
            city,
            province,
            zipcode,
            guardian_name,
            guardian_contact
        } = req.body

        // Validate required fields
        if (!full_name || !email || !password || !student_number) {
            return res.status(400).json({ error: 'All required fields must be filled' })
        }

        // Check if email already exists
        const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 1. Create user (role = student)
        const [userResult] = await userDB.query(
            'INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, 'student', contact || null]
        )

        const userID = userResult.insertId

        // 2. Create student profile
        await userDB.query(
            `INSERT INTO students
            (user_id, student_number, street, barangay, city, province, zipcode, contact, guardian_name, guardian_contact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userID,
                student_number,
                street || null,
                barangay || null,
                city || null,
                province || null,
                zipcode || null,
                contact || null,
                guardian_name || null,
                guardian_contact || null
            ]
        )

        res.status(201).json({ message: 'Student registered successfully' })

    } catch (err) {
        console.error('Student Registration Error:', err)
        res.status(500).json({ error: 'Server error during student registration' })
    }
}
