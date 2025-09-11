// routes/teachers.js
import express from 'express'
import { getPendingTeachers, approveTeacher, rejectTeacher, getApprovedTeachers } from '../../controllers/approval/teachersController.js'
import { verifyToken } from '../../middleware/auth.js'

const router = express.Router()

router.get('/pending', verifyToken, getPendingTeachers)
router.get('/approved',verifyToken, getApprovedTeachers)
router.put('/:id/approve', verifyToken, approveTeacher)
router.put('/:id/reject', verifyToken, rejectTeacher)

export default router
