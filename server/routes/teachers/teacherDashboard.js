// routes/teachers/teacherDashboard.js
import express from "express";
import { getTeacherSubjects } from "../../controllers/teachers/teacherDashboardController.js";
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

router.get("/:id/subjects", verifyToken, getTeacherSubjects);

export default router;
