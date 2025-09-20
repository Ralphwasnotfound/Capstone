import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
    getTeacherSubjectsWithStudents , updateGrade
} from '../controllers/gradesController.js';

const router = express.Router();

router.get('/:teacherId/subjects-with-students', getTeacherSubjectsWithStudents)
router.post('/update', verifyToken, updateGrade);


export default router;
