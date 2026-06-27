import { Router } from "express";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import {
  getTeacherDashboard,
  getMyClasses,
  getAttendanceByClass,
  markAttendance,
  getExamScoresByClass,
  submitExamScores,
  getClassNotices,
  createClassNotice,
} from "../controllers/teacher.js";
import { getSubjects } from "../controllers/admin.js";

const router = Router();

router.use(authenticateUser, requireRole(["TEACHER"]));

router.get("/dashboard", getTeacherDashboard);
router.get("/classes", getMyClasses);
router.get("/attendance", getAttendanceByClass);
router.post("/attendance", markAttendance);
router.get("/scores", getExamScoresByClass);
router.post("/scores", submitExamScores);
router.get("/notices", getClassNotices);
router.post("/notices", createClassNotice);
router.get("/subjects", getSubjects);

export default router;
