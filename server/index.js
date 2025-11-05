import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'

import { verifyToken } from './middleware/auth.js' 
import { createDefaultAdmin } from './controllers/userController.js'

dotenv.config()

import studentRoutes from './routes/student.js'
import userRoutes from './routes/users.js'
import gradesRoutes from './routes/grades.js';
import subjectsRoutes from './routes/subjects.js';
import registerTeacherRoutes from './routes/registration/registration_teachers.js'
import registerStudentRoutes from './routes/registration/registration_students.js'
import teacherRoutes from './routes/approval/teachersApproval.js'
import studentApprovalRoutes from './routes/approval/studentsApproval.js'
import dropboxAuthRouter from './routes/dropbox/dropboxAuth.js'
import teacherUploadsRouter from './routes/dropbox/teacherUploads.js'
import teacherDashboardRoutes from './routes/teachers/teacherDashboard.js'
import enrollmentRoute from './routes/dates/enrollment.js'
import academicYearsRoute from './routes/acadyears/academicYears.js'



// Middleware
const app = express()
app.use(cors({
    origin: ['http://localhost:5173'], 
        methods: 'GET,POST,PUT,DELETE,PATCH',
            allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true,
                    
                    }));
                    app.use(express.json())
                    app.use(express.urlencoded({ extended: true }))
                    app.use(morgan('dev'))

                    // Routes
                    app.use('/students', studentRoutes)
                    app.use('/users', userRoutes)
                    app.use('/grades', gradesRoutes)
                    app.use('/subjects', subjectsRoutes)
                    app.use('/teachers/approval', teacherRoutes)        // for admin approval
                    app.use('/students/approval', studentApprovalRoutes)        // for admin approval
                    app.use('/auth/teachers', registerTeacherRoutes) // for teacher signup
                    app.use('/auth/students', registerStudentRoutes) // for teacher signup
                    app.use('/teachers', teacherDashboardRoutes)
                    app.use('/enrollment', enrollmentRoute)
                    app.use('/academic-years', academicYearsRoute)

                    app.use("/", dropboxAuthRouter)
                    app.use('/dropbox', teacherUploadsRouter)
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

