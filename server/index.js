import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mysql from 'mysql2'

const app = express()
app.use(express.json())

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

db.getConnection((err, connection)=>{
    if (err) {
        console.error('Database Connection Failed:', err)
        return
    }
    console.log('Connected to Database!')
    connection.release()
})

app.get('/',(req, res)=>{
    res.send('Enrollment System API is Running')
})

app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if(err){
            console.error('DB Querry error:', err)
            return res.status(500).json({error: 'Database querry failed'})
        }
        res.json(results)
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server Running at http://localhost"${port}`)
})

// API to add a new student to MYSQL
app.post('/students', (req, res) => {
    const { full_name, student_id, email } = req.body
    db.query(
        'INSERT INTO students (full_name, student_id, email) VALUES(?, ?, ?)',
        [full_name, student_id, email],
        (err, results) => {
            if (err) {
                console.log('Insert Error:', err)
                return res.status(500).json({ error: 'Insert failed'})
            }
            res.status(201).json({ id:results.insertId, full_name, student_id, email})
        }
    )
})