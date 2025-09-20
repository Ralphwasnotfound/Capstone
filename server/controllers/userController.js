import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { userDB } from '../db.js' 

export const registerUser = async (req, res) => {
    const { full_name, email, password ,role = 'student', contact } = req.body

    // VALID INPUT
    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'all fields are required'})
    }

    try {
        const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await userDB.query(
            'INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, role, contact]
        )
        
        res.status(201).json({ message: 'Registration Successful'})
    } catch (err) {
        console.error('Registration Error:',err)
        res.status(500).json({ error: 'Server Error' })
    }
}

// LOGIN
export const loginUser = async (req, res) => {
    const { email, password } = req.body

    if(!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required'})
    }

    try {
        const [rows] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
        const user = rows[0]

        if (!user) {
            return res.status(401).json({error: 'Invalid Email or Password'})
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ error: 'Invalid Email or Password'})
        }

        if (user.role === 'teacher') {
            const [teacherRows] = await userDB.query('SELECT id, status FROM teachers WHERE user_id = ?', [user.id])
            const teacher = teacherRows[0]
            if (!teacher || teacher.status !== 'approved') {
                return res.status(403).json({ error: 'Your account is not yet Approved.'})
            }
            user.teacher_id = teacher.id
        }

        const token = jwt.sign(
            { id: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '30d'}
        )

        delete user.password
        res.json({ message: 'Login Successful',token, user})
    } catch (err) {
        console.error('Login Error:', err)
        res.status(500).json({ error: 'Server error'})
    }
}


export const getUsers = async (req, res) => {
    try {
        const [users] = await userDB.query(`
            SELECT
                u.id,
                u.full_name,
                u.email,
                u.role,
                u.contact,
                u.created_at,

                -- Teacher Details
                t.specialization,
                t.credential_url,
                t.status AS teacher_status,

                -- Student details
                s.student_number,
                s.status AS student_status

            FROM users u
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE u.email != 'admin@default.com'

                AND (u.role != 'teacher' OR t.status = 'approved')
            `)

            res.json({ users})
    } catch (err) {
        console.error('Fetch users error:', err)
        res.status(500).json({err:'Server error while fetching users'})
    }
}

// Default ADMIN
export const createDefaultAdmin = async () => {
    const defaultEmail = 'admin@default.com'
    const defaultPassword = 'admin123' // or use environment variable
    const defaultName = 'Default Admin'
    const role = 'admin'
    const contact = '0000-000-0000'

    const [existing] = await userDB.query('SELECT * FROM users WHERE email = ?', [defaultEmail])
    if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)
        await userDB.query(
            'INSERT INTO users (id, full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?, ?)',
            [1 ,defaultName, defaultEmail, hashedPassword, role, contact]
        )
        console.log('Default admin created')
    } else {
        console.log('Default admin already exists')
    }
}


// DELETE USERS
export const deleteUser = async ( req , res ) => {
    const { id } = req.params
    try {
        const [result] = await userDB.query('DELETE FROM users WHERE id = ?', [id])
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not Found'})
        }
        res.json({ message: 'User deleted successfully'})
    } catch (err) {
        console.error('Delete user error:', err)
        res.status(500).json({ error: 'Server error during Deletion'})
    }
}



