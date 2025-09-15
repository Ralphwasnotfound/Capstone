// routes/teachers/teacherDashboard.js
import express from "express";
import { getTeacherSubjects, getApprovedTeachers } from "../../controllers/teachers/teacherDashboardController.js";
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

router.get("/:id/subjects", verifyToken, getTeacherSubjects);
router.get("/enrollment/approved", verifyToken, getApprovedTeachers);

export default router;
