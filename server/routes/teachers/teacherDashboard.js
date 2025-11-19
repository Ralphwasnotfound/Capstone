import express from "express";
import { 
    getTeacherSubjects, 
    getApprovedTeachers, 
    getTeacherSubjectsWithStudents,
    getTeacherByUserId,
    updateTeacherProfile,
    submitGrades
 } from "../../controllers/teachers/teacherDashboardController.js";
import { verifyToken } from '../../middleware/auth.js';

const router = express.Router();

router.get("/subjects", verifyToken, getTeacherSubjects);

router.get("/enrollment/approved", verifyToken, getApprovedTeachers);
router.get("/:id/grades/subjects", verifyToken, getTeacherSubjectsWithStudents);

router.post("/submit-grades", submitGrades);

router.get("/", verifyToken, getTeacherByUserId);
router.put("/:userId", verifyToken, updateTeacherProfile);

export default router;
