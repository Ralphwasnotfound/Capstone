import express from 'express';
import { getGradesByStudent, createGrade, updateGrade } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/:studentId', getGradesByStudent);  // get grades for a student
router.post('/', createGrade);                  // add new grade
router.put('/:id', updateGrade);               // update grade

export default router;
