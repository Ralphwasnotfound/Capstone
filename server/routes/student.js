import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getStudents, 
    createStudent,
     approveStudent, 
     getStudentById, 
     enrollStudent ,
     getStudentByMe,
     getEnrolledStudents, 
     getPendingStudents } from '../controllers/studentController.js';

const router = express.Router();

// Collection routes
router.get('/', verifyToken, getStudents);
router.post('/', verifyToken, createStudent);

// Status-based routes
router.get('/pending', verifyToken, getPendingStudents);
router.get('/enrolled', verifyToken, getEnrolledStudents);

// Authenticated user’s student record
router.get('/me', verifyToken, getStudentByMe);

// Actions on specific student
router.put('/:id/approve', verifyToken, approveStudent);
router.post('/:id/enroll', verifyToken, enrollStudent);
router.get('/:id', verifyToken, getStudentById);


export default router;
