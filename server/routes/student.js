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

router.put('/:schoolId/approve', verifyToken, approveStudent);

router.get('/', getStudentsFiltered);
router.get('/details', verifyToken, getStudentByUserId);

router.post('/create', verifyToken, createStudent);
router.post('/enroll', verifyToken, enrollStudent);

router.get('/pending', verifyToken, getPendingStudents);
router.post('/pending', verifyToken, createPendingStudents);

router.get('/enrolled', verifyToken, getEnrolledStudents);
router.get('/subjects/:subjectId/students', verifyToken, getEnrolledStudentsBySubject);

router.get('/school/:school_id/subjects', verifyToken, getStudentBySubjects);

router.get('/:id/subjects', verifyToken, getStudentSubjects);
router.get('/:school_id/grades', verifyToken, getStudentGrades);

router.post('/update-course', updateStudentCourse);




export default router;
