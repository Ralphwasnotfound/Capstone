import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
    getTeacherSubjectsWithStudents, 
    updateGrade,
    getStudentsBySubject // <--- add this
} from '../controllers/gradesController.js';

const router = express.Router();

router.get('/:teacherId/subjects-with-students', getTeacherSubjectsWithStudents);
router.post('/update', verifyToken, updateGrade);

// NEW route for frontend fetching
router.get('/subject/:subjectId', verifyToken, getStudentsBySubject);

export default router;
