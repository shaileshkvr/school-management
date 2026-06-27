import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../config/db.js";

export async function getTeacherDashboard(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        classesLed: {
          include: { _count: { select: { students: true } } },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found." });
    }

    const classCount = teacher.classesLed.length;
    const studentCount = teacher.classesLed.reduce((sum, c) => sum + c._count.students, 0);

    // Get today's attendance stats across all of the teacher's classes
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const studentIds = await prisma.studentProfile.findMany({
      where: { classId: { in: teacher.classesLed.map((c) => c.id) } },
      select: { id: true },
    });
    const ids = studentIds.map((s) => s.id);

    let attendancePercentage = 0;
    if (ids.length > 0) {
      const [totalMarked, presentCount] = await Promise.all([
        prisma.attendance.count({
          where: { studentId: { in: ids }, date: today },
        }),
        prisma.attendance.count({
          where: { studentId: { in: ids }, date: today, status: "PRESENT" },
        }),
      ]);
      attendancePercentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;
    }

    return res.json({
      classCount,
      studentCount,
      attendancePercentage,
      classes: teacher.classesLed,
    });
  } catch (error) {
    console.error("Failed to fetch teacher dashboard:", error);
    return res.status(500).json({ error: "Failed to fetch teacher dashboard." });
  }
}

export async function getMyClasses(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        classesLed: {
          include: {
            students: { include: { user: { select: { email: true } } } },
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found." });
    }

    return res.json(teacher.classesLed);
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return res.status(500).json({ error: "Failed to fetch classes." });
  }
}

export async function getAttendanceByClass(req: AuthenticatedRequest, res: Response) {
  const classId = req.query.classId as string | undefined;
  const date = req.query.date as string | undefined;

  if (!classId || !date) {
    return res.status(400).json({ error: "classId and date query params are required." });
  }

  try {
    const students = await prisma.studentProfile.findMany({
      where: { classId },
      include: { user: { select: { email: true } } },
    });

    const parsedDate = new Date(date);
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: { in: students.map((s) => s.id) },
        date: parsedDate,
      },
    });

    const attendanceMap = new Map(attendanceRecords.map((a) => [a.studentId, a.status]));

    const result = students.map((student) => ({
      ...student,
      attendanceStatus: attendanceMap.get(student.id) ?? null,
    }));

    return res.json(result);
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return res.status(500).json({ error: "Failed to fetch attendance." });
  }
}

export async function markAttendance(req: AuthenticatedRequest, res: Response) {
  const { classId, date, records } = req.body as {
    classId: string;
    date: string;
    records: Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "LATE" }>;
  };

  if (!classId || !date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: "classId, date, and records array are required." });
  }

  try {
    const parsedDate = new Date(date);

    await Promise.all(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: { studentId: record.studentId, date: parsedDate },
          },
          update: { status: record.status },
          create: {
            studentId: record.studentId,
            date: parsedDate,
            status: record.status,
          },
        })
      )
    );

    return res.json({ success: true, count: records.length });
  } catch (error) {
    console.error("Failed to mark attendance:", error);
    return res.status(500).json({ error: "Failed to mark attendance." });
  }
}

export async function getExamScoresByClass(req: AuthenticatedRequest, res: Response) {
  const classId = req.query.classId as string | undefined;
  const examName = req.query.examName as string | undefined;

  if (!classId) {
    return res.status(400).json({ error: "classId query param is required." });
  }

  try {
    const students = await prisma.studentProfile.findMany({
      where: { classId },
      select: { id: true },
    });
    const studentIds = students.map((s) => s.id);

    const scores = await prisma.examScore.findMany({
      where: {
        studentId: { in: studentIds },
        ...(examName ? { examName } : {}),
      },
      include: {
        subject: { select: { name: true } },
        student: { include: { user: { select: { email: true } } } },
      },
    });

    return res.json(scores);
  } catch (error) {
    console.error("Failed to fetch exam scores:", error);
    return res.status(500).json({ error: "Failed to fetch exam scores." });
  }
}

export async function submitExamScores(req: AuthenticatedRequest, res: Response) {
  const { classId, subjectId, examName, maxScore, date, scores } = req.body as {
    classId: string;
    subjectId: string;
    examName: string;
    maxScore: number;
    date: string;
    scores: Array<{ studentId: string; score: number }>;
  };

  if (!classId || !subjectId || !examName || maxScore == null || !date || !Array.isArray(scores)) {
    return res.status(400).json({
      error: "classId, subjectId, examName, maxScore, date, and scores are required.",
    });
  }

  try {
    const result = await prisma.examScore.createMany({
      data: scores.map((s) => ({
        studentId: s.studentId,
        subjectId,
        examName,
        score: s.score,
        maxScore,
        date: new Date(date),
      })),
    });

    return res.status(201).json({ success: true, count: result.count });
  } catch (error) {
    console.error("Failed to submit exam scores:", error);
    return res.status(500).json({ error: "Failed to submit exam scores." });
  }
}

export async function getClassNotices(req: AuthenticatedRequest, res: Response) {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.userId },
      include: { classesLed: { select: { id: true } } },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found." });
    }

    const classIds = teacher.classesLed.map((c) => c.id);

    const notices = await prisma.notification.findMany({
      where: {
        OR: [{ classId: { in: classIds } }, { classId: null }],
      },
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { email: true } } },
    });

    return res.json(notices);
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return res.status(500).json({ error: "Failed to fetch notices." });
  }
}

export async function createClassNotice(req: AuthenticatedRequest, res: Response) {
  const { title, message, classId } = req.body;

  if (!title || !message || !classId) {
    return res.status(400).json({ error: "title, message, and classId are required." });
  }

  try {
    // Verify the teacher actually leads this class
    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: req.user!.userId },
      include: { classesLed: { select: { id: true } } },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher profile not found." });
    }

    const leadsClass = teacher.classesLed.some((c) => c.id === classId);
    if (!leadsClass) {
      return res.status(403).json({ error: "You can only post notices for classes you lead." });
    }

    const notice = await prisma.notification.create({
      data: {
        title,
        message,
        classId,
        createdById: req.user!.userId,
      },
    });

    return res.status(201).json(notice);
  } catch (error) {
    console.error("Failed to create notice:", error);
    return res.status(500).json({ error: "Failed to create notice." });
  }
}
