// routes/teachers.js
import express from 'express'
import { getPendingTeachers, approveTeacher, rejectTeacher } from '../../controllers/approval/teachersController.js'
import { verifyToken } from '../../middleware/auth.js'

const router = express.Router()

router.get('/pending', verifyToken, getPendingTeachers)
router.put('/:id/approve', verifyToken, approveTeacher)
router.put('/:id/reject', verifyToken, rejectTeacher)

export default router
