import { Router } from "express";
import { login, logout, checkSession } from "../controllers/auth.js";
import { authenticateUser } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticateUser, checkSession);

export default router;
