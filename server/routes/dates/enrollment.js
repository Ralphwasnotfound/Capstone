import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { 
    getSemesters,
    createSemester,
    getAcademicYears,
    createAcademicYear,
    getActiveAcademicYear
} from '../../controllers/fordates/enrollmentController.js'

const router = express.Router();

router.get('/semesters', verifyToken, getSemesters)      // fetch semesters
router.get('/academic-years', verifyToken, getAcademicYears)      // fetch semesters

router.post('/create/semesters', verifyToken, createSemester)   // add new semester
router.post('/create/academic-years', verifyToken, createAcademicYear)   // add new semester

router.get('/academic-years/active', verifyToken, getActiveAcademicYear)


export default router;
