import express from 'express'
import { verifyToken } from '../middleware/auth.js';
import {
    getStudents,
    createStudent
} from '../controllers/studentController.js'

const router = express.Router()
router.get('/',  verifyToken, getStudents)
router.post('/',  verifyToken, createStudent)





export default router
