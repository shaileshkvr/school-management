import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  };
}

export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No session token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: "ADMIN" | "TEACHER" | "STUDENT" };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Access denied. Invalid or expired session token." });
  }
}

export function requireRole(roles: ("ADMIN" | "TEACHER" | "STUDENT")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient account permissions." });
    }
    next();
  };
}
