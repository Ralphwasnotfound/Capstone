import express from 'express';
import { getSubjects, 
        createSubject,
        getSubjectsByCourse} from '../controllers/subjectsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getSubjects);
router.post('/', verifyToken, createSubject);
router.get('/course/:courseId', verifyToken, getSubjectsByCourse)

export default router;
