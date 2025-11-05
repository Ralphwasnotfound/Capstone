import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
    getTeacherSubjectsWithStudents, 
    updateGrade,
    getStudentsBySubject,
    getGradesByStudent, // <--- add this
    getStudentGradeBySubject,
    bulkUpdateGrades
} from '../controllers/gradesController.js';

const router = express.Router();
// NEW route for frontend fetching
router.get('/student/:id', verifyToken, getGradesByStudent);
router.get('/subject/:subjectId', getStudentsBySubject);
router.get('/:teacherId/subjects-with-students', getTeacherSubjectsWithStudents);
router.post('/update', verifyToken, updateGrade);
router.get('/:teacherId/subjects', verifyToken, getTeacherSubjectsWithStudents);
router.get('/student/:studentId/subject/:subjectId', verifyToken, getStudentGradeBySubject)
router.post('/bulk-update', verifyToken, bulkUpdateGrades)


export default router;
