import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getStudentsFiltered,    // fetch all students or by query
  getStudentByUserId,     // fetch a single student with subjects
  createStudent,
  enrollStudent,
  approveStudent,
  getPendingStudents,
  createPendingStudents,
  getEnrolledStudents,
  getEnrolledStudentsBySubject,
  getStudentSubjects,
  getStudentBySubjects,
  getStudentGrades,
  updateStudentCourse
} from '../controllers/studentController.js';

const router = express.Router();

// ✅ Fetch all students or filtered by ?user_id= (no auth needed)
router.get('/', getStudentsFiltered);

// ✅ Fetch a single student with structured subjects by user_id (requires auth)
router.get('/details', verifyToken, getStudentByUserId);

// ✅ Create a new student (requires auth)
router.post('/create', verifyToken, createStudent);

// ✅ Enroll a student in a subject (automatic detection by user_id, requires auth)
router.post('/enroll', verifyToken, enrollStudent);

// ✅ Approve student pending subjects (requires auth)

router.put('/:schoolId/approve', verifyToken, approveStudent);

// ✅ Get all pending students (requires auth)
router.get('/pending', verifyToken, getPendingStudents);

// ✅ Create pending student entry (requires auth)
router.post('/pending', verifyToken, createPendingStudents);

// ✅ Get all enrolled students (requires auth)
router.get('/enrolled', verifyToken, getEnrolledStudents);

// ✅ Get students for a specific subject (teacher view, requires auth)
router.get('/subjects/:subjectId/students', verifyToken, getEnrolledStudentsBySubject);

// ✅ Get subjects for a student by student ID (requires auth)
router.get('/:id/subjects', verifyToken, getStudentSubjects);

// ✅ Get student and subjects by school_id (requires auth)
router.get('/school/:school_id/subjects', verifyToken, getStudentBySubjects);

router.get('/:school_id/grades', verifyToken, getStudentGrades)

router.post('/update-course', updateStudentCourse);


export default router;
