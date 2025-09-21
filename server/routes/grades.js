import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
    getTeacherSubjectsWithStudents, 
    updateGrade,
    getStudentsBySubject,
    getGradesByStudent // <--- add this
} from '../controllers/gradesController.js';

const router = express.Router();
// NEW route for frontend fetching
router.get('/student/:id', verifyToken, getGradesByStudent);
router.get('/subject/:subjectId', verifyToken, getStudentsBySubject);
router.get('/:teacherId/subjects-with-students', getTeacherSubjectsWithStudents);
router.post('/update', verifyToken, updateGrade);


export default router;
