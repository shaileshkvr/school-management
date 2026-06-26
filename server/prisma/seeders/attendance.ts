import { PrismaClient, AttendanceStatus } from "@prisma/client";
import type { SeededStudent } from "./students.js";

export async function seedAttendance(
  prisma: PrismaClient,
  students: SeededStudent[]
): Promise<void> {
  console.log("Seeding 30-day attendance history...");

  const attendanceData = [];
  const currentDate = new Date();

  // Seed last 30 days of records
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date();
    targetDate.setDate(currentDate.getDate() - dayOffset);

    // Skip Sundays
    if (targetDate.getDay() === 0) continue;

    for (const student of students) {
      // Determine status with probability distributions:
      // 92% PRESENT, 5% LATE, 3% ABSENT
      const roll = Math.random() * 100;
      let status: AttendanceStatus = AttendanceStatus.PRESENT;

      if (roll > 97) {
        status = AttendanceStatus.ABSENT;
      } else if (roll > 92) {
        status = AttendanceStatus.LATE;
      }

      attendanceData.push({
        studentId: student.id,
        date: targetDate,
        status,
      });
    }
  }

  // Bulk create in chunks to prevent database transaction limits
  const chunkSize = 1000;
  for (let i = 0; i < attendanceData.length; i += chunkSize) {
    const chunk = attendanceData.slice(i, i + chunkSize);
    await prisma.attendance.createMany({
      data: chunk,
    });
  }

  console.log(`Seeded ${attendanceData.length} Attendance logs.`);
}
