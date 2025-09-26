// routes/students.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  getStudents,
  createStudent,
  getEnrolledStudents,
  getPendingStudents,
  createPendingStudents,
  getStudentById,
  enrollStudent,
  approveStudent,
  getStudentByMe,
  getEnrolledStudentsBySubject
} from '../controllers/studentController.js';

const router = express.Router();

// Collection routes
router.get('/', verifyToken, getStudents);
router.post('/create', verifyToken, createStudent);

// Status-based routes
router.get('/pending', verifyToken, getPendingStudents);
router.post('/pending', verifyToken, createPendingStudents);
router.get('/enrolled', verifyToken, getEnrolledStudents);

// New route: students of a specific subject
router.get('/subject/:subjectId', verifyToken, getEnrolledStudentsBySubject);

// Authenticated user’s student record
router.get('/me', verifyToken, getStudentByMe);

// Actions on specific student
router.put('/:schoolId/approve', verifyToken, approveStudent);
router.post('/enroll', verifyToken, enrollStudent);
router.get('/:schoolId', verifyToken, getStudentById);

export default router;
