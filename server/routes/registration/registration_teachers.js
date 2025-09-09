// routes/registration_teachers.js
import express from 'express'
import { registerTeacher } from '../../controllers/registration/teacherRegistrationController.js'

const router = express.Router()

router.post('/', registerTeacher)

export default router
