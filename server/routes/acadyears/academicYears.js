import express from 'express';
import { verifyToken } from '../../middleware/auth.js';
import {
  getAcademicYears,
  getActiveAcademicYear,
  createAcademicYear,
  deactivateAcademicYear,
  deleteAcademicYear
} from '../../controllers/years/academicYearsController.js';


const router = express.Router();

// GET all academic years
router.get('/', verifyToken, getAcademicYears);
router.get('/active', verifyToken, getActiveAcademicYear)

// POST a new academic year
router.post('/', verifyToken, createAcademicYear);

// PATCH to enable/disable enrollment
router.patch('/:id/deactivate', verifyToken, deactivateAcademicYear);

// DELETE an academic year
router.delete('/:id', verifyToken, deleteAcademicYear);

export default router;
