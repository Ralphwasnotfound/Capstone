// routes/registration_teachers.js
import express from 'express'
import { registerStudent } from '../../controllers/registration/studentRegistrationContoller.js'

const router = express.Router()

router.post('/', registerStudent)

export default router
