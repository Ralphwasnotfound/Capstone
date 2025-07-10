import express from 'express'
import bcrypt from 'bcrypt'
import db from '../db.js'

const app = express.Router()

app.get('/user' , async (req, res) => {
    try {
        const[ users] = await db.promise().query('SELECT id, full_name, email, role FROM users')
        res.json(users) 
    }catch (err) {
        console.error('Fetch users error:', err.message)
        res.status(500).json({ error: 'Server error while fetching users'})
    }
})

// POST/REGISTER

app.post('/register', async (req, res) =>{
    const { full_name, email, password, role = 'student' } = req.body

    if ( !full_name || !email || !password ) {
        return res.status(400).json({ error: 'All fields are required'})
    }

    try {
        // Check if email already exists
        const [existingUser] = await db.promise().query('SELECT * From users WHERE email = ?', [email])
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Email already in use.'})
        }

        //hash password

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.promise().query(
            'INSERT INTO user (full_name, email, password, role) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role]
        )

        res.status(201).json({ message: 'Registration successfull' })
    } catch (err) {
        console.error('registration Error:', err)
        res.status(500).json({ error: 'Server error' })
    }
})

export default app