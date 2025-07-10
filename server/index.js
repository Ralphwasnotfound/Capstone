import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import studentRoutes from './routes/student.js'
import userRoutes from './routes/users.js'

const app = express()
app.use(cors())
app.use(express.json())

// Routes
app.use('/students', studentRoutes)
app.use('/users', userRoutes)

// Root
app.get('/', (req, res) => {
    res.send('Enrollment System API is Running')
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is Running at http://localhost:${PORT}`)
})