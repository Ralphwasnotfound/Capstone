import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { studentDB } from './db.js'
import { verifyToken } from './middleware/auth.js' 
import { createDefaultAdmin } from './controllers/userController.js'

dotenv.config()

import studentRoutes from './routes/student.js'
import userRoutes from './routes/users.js'

// Middleware
const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


// Routes
app.use('/students', verifyToken, studentRoutes)
app.use('/users', userRoutes)

// Root
app.get('/', (req, res) => {
    res.send('System API is Running')
})


// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is Running at http://localhost:${PORT}`)
    createDefaultAdmin()
})

