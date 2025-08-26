import express from 'express';
import { getSubjects, createSubject } from '../controllers/subjectsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getSubjects);
router.post('/', verifyToken, createSubject);

export default router;
