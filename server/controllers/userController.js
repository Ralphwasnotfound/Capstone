import bcrypt from 'bcrypt'
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

        delete user.password
        res.json({ message: 'Login Successful', user})
    } catch (err) {
        console.error('Login Error:', err)
        res.status(500).json({ error: 'Server error'})
    }
}

export const getUsers = async (req, res) => {
    try {
        const [users] = await userDB.query('SELECT id, full_name, email, role, contact, created_at FROM users')
        res.json(users)
    } catch (err) {
        console.error('Fetch users error:', err)
        res.status(500).json({ error: 'Server error while fetching users' })
    }
}

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


