import { Router } from "express";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import {
  getStudentDashboard,
  getMyAttendance,
  getMyGrades,
  getMyFees,
} from "../controllers/student.js";

const router = Router();

router.use(authenticateUser, requireRole(["STUDENT"]));

router.get("/dashboard", getStudentDashboard);
router.get("/attendance", getMyAttendance);
router.get("/grades", getMyGrades);
router.get("/fees", getMyFees);

export default router;
