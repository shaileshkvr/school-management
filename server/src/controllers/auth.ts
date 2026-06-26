import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { prisma } from "../config/db.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export async function login(req: AuthenticatedRequest, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required credentials." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Keeping message generic to avoid revealing whether the email exists in the system
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Keeping message generic to avoid revealing whether the email exists in the system
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      // Set cookie to expire in 7 days
      // Days * Hours * Minutes * Seconds * Milliseconds
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login verification failed:", error);
    return res.status(500).json({ error: "Internal server authentication error." });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  res.clearCookie("token");
  return res.json({ message: "Session closed successfully." });
}

export async function checkSession(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: "No active login session." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Active profile session could not be resolved." });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Session verification failed:", error);
    return res.status(500).json({ error: "Session validation error." });
  }
}
