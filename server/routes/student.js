import express from 'express'
import { verifyToken } from '../middleware/auth.js';
import {
    getStudents,
    createStudent,
    approveStudent
} from '../controllers/studentController.js'

const router = express.Router()
router.get('/',  verifyToken, getStudents)
router.post('/',  verifyToken, createStudent)
// router.patch('/students/enroll/:id', authenticateAdmin, enrollStudent)
router.put('/:id/approve/', verifyToken, approveStudent)

export default router
