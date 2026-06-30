import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../config/db.js";

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const [totalStudents, totalTeachers, totalClasses, pendingFeesAgg, recentNotices] =
      await Promise.all([
        prisma.studentProfile.count(),
        prisma.teacherProfile.count(),
        prisma.class.count(),
        prisma.fee.aggregate({
          _sum: { amount: true },
          where: { status: { not: "PAID" } },
        }),
        prisma.notification.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { createdBy: { select: { email: true } } },
        }),
      ]);

    return res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingFees: pendingFeesAgg._sum.amount ?? 0,
      recentNotices,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
}

export async function getClasses(req: AuthenticatedRequest, res: Response) {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: { include: { user: { select: { email: true } } } },
        _count: { select: { students: true } },
      },
    });
    return res.json(classes);
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return res.status(500).json({ error: "Failed to fetch classes." });
  }
}

export async function createClass(req: AuthenticatedRequest, res: Response) {
  const { name, teacherId } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Class name is required." });
  }

  try {
    const created = await prisma.class.create({
      data: { name, teacherId: teacherId ?? null },
    });
    return res.status(201).json(created);
  } catch (error) {
    console.error("Failed to create class:", error);
    return res.status(500).json({ error: "Failed to create class." });
  }
}

export async function getTeachers(req: AuthenticatedRequest, res: Response) {
  try {
    const teachers = await prisma.teacherProfile.findMany({
      include: {
        user: { select: { email: true } },
        classesLed: {
          select: {
            id: true,
            name: true,
            _count: { select: { students: true } },
          },
        },
      },
    });
    return res.json(teachers);
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    return res.status(500).json({ error: "Failed to fetch teachers." });
  }
}

export async function getStudents(req: AuthenticatedRequest, res: Response) {
  const classId = req.query.classId as string | undefined;

  try {
    const query = {
      include: {
        user: { select: { email: true } },
        class: { select: { name: true } },
      },
      ...(classId ? { where: { classId } } : {}),
    };
    const students = await prisma.studentProfile.findMany(query);
    return res.json(students);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return res.status(500).json({ error: "Failed to fetch students." });
  }
}

export async function getFees(req: AuthenticatedRequest, res: Response) {
  const status = req.query.status as "PAID" | "UNPAID" | "PARTIAL" | undefined;

  try {
    const query = {
      orderBy: { dueDate: "desc" as const },
      include: {
        student: {
          include: {
            user: { select: { email: true } },
            class: { select: { name: true } },
          },
        },
      },
      ...(status ? { where: { status } } : {}),
    };
    const fees = await prisma.fee.findMany(query);
    return res.json(fees);
  } catch (error) {
    console.error("Failed to fetch fees:", error);
    return res.status(500).json({ error: "Failed to fetch fees." });
  }
}

export async function updateFeeStatus(req: AuthenticatedRequest, res: Response) {
  const id = req.params.id as string;
  const { status } = req.body;

  if (!status || !["PAID", "UNPAID", "PARTIAL"].includes(status)) {
    return res.status(400).json({ error: "Status must be PAID, UNPAID, or PARTIAL." });
  }

  try {
    const updated = await prisma.fee.update({
      where: { id },
      data: { status },
    });
    return res.json(updated);
  } catch (error) {
    console.error("Failed to update fee status:", error);
    return res.status(500).json({ error: "Failed to update fee status." });
  }
}

export async function getNotices(req: AuthenticatedRequest, res: Response) {
  try {
    const notices = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { email: true } } },
    });
    return res.json(notices);
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return res.status(500).json({ error: "Failed to fetch notices." });
  }
}

export async function createNotice(req: AuthenticatedRequest, res: Response) {
  const { title, message, classId, classIds } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required." });
  }

  try {
    if (Array.isArray(classIds) && classIds.length > 0) {
      const notices = await Promise.all(
        classIds.map((id) =>
          prisma.notification.create({
            data: {
              title,
              message,
              classId: id,
              createdById: req.user!.userId,
            },
          })
        )
      );
      return res.status(201).json(notices[0]);
    }

    const notice = await prisma.notification.create({
      data: {
        title,
        message,
        classId: classId ?? null,
        createdById: req.user!.userId,
      },
    });
    return res.status(201).json(notice);
  } catch (error) {
    console.error("Failed to create notice:", error);
    return res.status(500).json({ error: "Failed to create notice." });
  }
}

export async function getSubjects(req: AuthenticatedRequest, res: Response) {
  try {
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true },
    });
    return res.json(subjects);
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return res.status(500).json({ error: "Failed to fetch subjects." });
  }
}

export async function deleteNotice(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid notice ID." });
    }

    const notice = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notice) {
      return res.status(404).json({ error: "Notice not found." });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Notice deleted successfully." });
  } catch (error) {
    console.error("Failed to delete notice:", error);
    return res.status(500).json({ error: "Failed to delete notice." });
  }
}
