// routes/teachers/teacherDashboard.js
import express from "express";
import { getTeacherSubjects, getApprovedTeachers, getTeacherSubjectsWithStudents } from "../../controllers/teachers/teacherDashboardController.js";
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

router.get("/:id/subjects", verifyToken, getTeacherSubjects);
router.get("/:id/grades/subjects", verifyToken, getTeacherSubjectsWithStudents);

router.get("/enrollment/approved", verifyToken, getApprovedTeachers);

export default router;
