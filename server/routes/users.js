import express from 'express'
import bcrypt from 'bcrypt'
import { userDB } from '../db.js'

const app = express.Router()

// This makes GET /users work
app.get('/', async (req, res) => {
    try {
        const [users] = await userDB.query(`SELECT id, full_name, email, role, contact, created_at FROM users`)
        res.json(users)
    } catch (err) {
        console.error('Fetch users error:', err.message)
        res.status(500).json({ error: 'Server error while fetching users' })
    }
})

// Optional: you can keep this too
app.get('/user', async (req, res) => {
    try {
        const [users] = await userDB.query(`SELECT id, full_name, email, role, contact, created_at FROM users`)
        res.json(users)
    } catch (err) {
        console.error('Fetch users error:', err.message)
        res.status(500).json({ error: 'Server error while fetching users' })
    }
})

// POST/REGISTER
app.post('/register', async (req, res) => {
    const { full_name, email, password, role = 'student' , contact, created_at } = req.body

if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
}

try {
    const [existingUser] = await userDB.query('SELECT * FROM users WHERE email = ?', [email])
    if (existingUser.length > 0) {
        return res.status(409).json({ error: 'Email already in use.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await userDB.query(
        'INSERT INTO users (full_name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)',
        [full_name, email, hashedPassword, role, contact]
    )

        res.status(201).json({ message: 'Registration successful' })
    } catch (err) {
        console.error('Registration Error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

// DELETE a USER
app.delete ('/:id', async (req, res) => {
    const { id } = req.params
    try {
        const [ result ] = await userDB.query('DELETE FROM users WHERE id = ?', [id])

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found'})
        }

        res.json({ message: 'User deleted successfully' })
    } catch (err) {
        console.error('Delete user error:', err)
        res.status(500).json ({ error: 'Server Error during deletion'})
    }
})

export default app
