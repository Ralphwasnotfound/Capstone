import express from 'express'
import bcrypt from 'bcrypt'
import { userDB } from '../db.js'

const app = express.Router()

// This makes GET /users work
app.get('/', async (req, res) => {
    try {
        const [users] = await userDB.query('SELECT id, full_name, email, role FROM users')
        res.json(users)
    } catch (err) {
        console.error('Fetch users error:', err.message)
        res.status(500).json({ error: 'Server error while fetching users' })
    }
})

// Optional: you can keep this too
app.get('/user', async (req, res) => {
    try {
        const [users] = await userDB.query('SELECT id, full_name, email, role FROM users')
        res.json(users)
    } catch (err) {
        console.error('Fetch users error:', err.message)
        res.status(500).json({ error: 'Server error while fetching users' })
    }
})

// POST/REGISTER
app.post('/register', async (req, res) => {
    const { full_name, email, password, role = 'student' } = req.body

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
        'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        [full_name, email, hashedPassword, role]
    )

        res.status(201).json({ message: 'Registration successful' })
    } catch (err) {
        console.error('Registration Error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

export default app
