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

router.get('/', verifyToken, getStudents);
router.post('/', verifyToken, createStudent);
router.put('/:id/approve', verifyToken, approveStudent);
router.post('/:id/enroll', verifyToken, enrollStudent);
router.get('/pending', verifyToken, getPendingStudents);
router.get('/enrolled', verifyToken, getEnrolledStudents);
router.get('/me', verifyToken, getStudentByMe);
router.get('/:id', verifyToken, getStudentById);

export default router;
