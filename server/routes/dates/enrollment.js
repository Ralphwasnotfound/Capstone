import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import { 
    getTerms,
    getAcademicYears,
    createAcademicYear,
    getActiveAcademicYear
} from '../../controllers/fordates/enrollmentController.js'

const router = express.Router();

router.get('/terms', verifyToken, getTerms)      // fetch semesters
router.get('/academicYears', verifyToken, getAcademicYears)      // fetch semesters
  // add new semester
router.post('/create/academic-years', verifyToken, createAcademicYear)   // add new semester

router.get('/academic-years/active', verifyToken, getActiveAcademicYear)


export default router;
