import { Router } from "express";
import { authenticateUser, requireRole } from "../middleware/auth.js";
import {
  getDashboardStats,
  getClasses,
  createClass,
  getTeachers,
  getStudents,
  getFees,
  updateFeeStatus,
  getNotices,
  createNotice,
  deleteNotice,
  getSubjects,
} from "../controllers/admin.js";

const router = Router();

router.use(authenticateUser, requireRole(["ADMIN"]));

router.get("/stats", getDashboardStats);
router.get("/classes", getClasses);
router.post("/classes", createClass);
router.get("/teachers", getTeachers);
router.get("/students", getStudents);
router.get("/fees", getFees);
router.patch("/fees/:id", updateFeeStatus);
router.get("/notices", getNotices);
router.post("/notices", createNotice);
router.delete("/notices/:id", deleteNotice);
router.get("/subjects", getSubjects);

export default router;
