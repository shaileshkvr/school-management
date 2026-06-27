import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../config/db.js";

export async function getStudentDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const [totalAttendance, presentCount, examScores, outstandingFees, recentNotices] =
      await Promise.all([
        prisma.attendance.count({ where: { studentId: student.id } }),
        prisma.attendance.count({ where: { studentId: student.id, status: "PRESENT" } }),
        prisma.examScore.findMany({
          where: { studentId: student.id },
          select: { examName: true, score: true, maxScore: true },
        }),
        prisma.fee.count({ where: { studentId: student.id, status: { not: "PAID" } } }),
        prisma.notification.findMany({
          where: {
            OR: [{ classId: student.classId }, { classId: null }],
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { createdBy: { select: { email: true } } },
        }),
      ]);

    const attendanceRate = totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

    // Count distinct exam names
    const examNames = new Set(examScores.map((s) => s.examName));
    const completedExams = examNames.size;

    // Calculate average score percentage
    let averageScore = 0;
    if (examScores.length > 0) {
      const totalPercentage = examScores.reduce((sum, s) => {
        const max = Number(s.maxScore);
        return sum + (max > 0 ? (Number(s.score) / max) * 100 : 0);
      }, 0);
      averageScore = Math.round(totalPercentage / examScores.length);
    }

    return res.json({
      attendanceRate,
      completedExams,
      averageScore,
      outstandingFees,
      recentNotices,
    });
  } catch (error) {
    console.error("Failed to fetch student dashboard:", error);
    return res.status(500).json({ error: "Failed to fetch student dashboard." });
  }
}

export async function getMyAttendance(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: "desc" },
      select: { date: true, status: true },
    });

    return res.json(attendance);
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return res.status(500).json({ error: "Failed to fetch attendance." });
  }
}

export async function getMyGrades(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const grades = await prisma.examScore.findMany({
      where: { studentId: student.id },
      include: { subject: { select: { name: true } } },
    });

    return res.json(grades);
  } catch (error) {
    console.error("Failed to fetch grades:", error);
    return res.status(500).json({ error: "Failed to fetch grades." });
  }
}

export async function getMyFees(req: AuthenticatedRequest, res: Response) {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!student) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const fees = await prisma.fee.findMany({
      where: { studentId: student.id },
      orderBy: { dueDate: "desc" },
    });

    return res.json(fees);
  } catch (error) {
    console.error("Failed to fetch fees:", error);
    return res.status(500).json({ error: "Failed to fetch fees." });
  }
}
