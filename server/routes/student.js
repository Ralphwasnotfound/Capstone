import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { studentDB } from '../db.js';
import {
    getStudents,
    createStudent,
    approveStudent,
    getPendingStudents,
    getEnrolledStudents,
    getStudentByMe
} from '../controllers/studentController.js';

const router = express.Router();

// ----- LISTS -----
router.get('/', verifyToken, getStudents);
router.get('/pending', verifyToken, getPendingStudents);
router.get('/enrolled', verifyToken, getEnrolledStudents);

// ----- SPECIFIC USER -----
router.get('/me', verifyToken, getStudentByMe)


// ----- CREATE / UPDATE -----
router.post('/', verifyToken, createStudent);
router.put('/:id/approve', verifyToken, approveStudent);

export default router;
