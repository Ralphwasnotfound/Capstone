// routes/teachers.js
import express from 'express'
import { getPendingStudents, approveStudent, rejectStudent } from '../../controllers/approval/studentsController.js'
import { verifyToken } from '../../middleware/auth.js'

const router = express.Router()

router.get('/pending', verifyToken, getPendingStudents)
router.put('/:id/approve', verifyToken, approveStudent)
router.put('/:id/reject', verifyToken, rejectStudent)

export default router
