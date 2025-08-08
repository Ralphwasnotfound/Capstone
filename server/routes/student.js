import express from 'express'
import { verifyToken } from '../middleware/auth.js';

import {
    getStudents,
    createStudent,
    approveStudent,
    getPendingStudents,
    getEnrolledStudents
} from '../controllers/studentController.js'

const router = express.Router()
router.get('/',  verifyToken, getStudents)
router.get('/pending', verifyToken, getPendingStudents)
router.get('/enrolled', verifyToken, getEnrolledStudents)

router.post('/',  verifyToken, createStudent)
router.put('/:id/approve/', verifyToken, approveStudent)


export default router
