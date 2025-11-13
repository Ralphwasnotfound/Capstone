import express from "express";
import { 
    getTeacherSubjects, 
    getApprovedTeachers, 
    getTeacherSubjectsWithStudents,
    getTeacherByUserId,
    updateTeacherProfile
 } from "../../controllers/teachers/teacherDashboardController.js";
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

router.get("/", verifyToken, getTeacherByUserId);
router.put("/:userId", verifyToken, updateTeacherProfile);

// ✅ Updated route: use query param instead of URL param
router.get("/subjects", verifyToken, getTeacherSubjects);

// This one stays the same
router.get("/:id/grades/subjects", verifyToken, getTeacherSubjectsWithStudents);
router.get("/enrollment/approved", verifyToken, getApprovedTeachers);

export default router;
