import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "./seeders/admin.js";
import { seedSubjects } from "./seeders/subjects.js";
import { seedClasses } from "./seeders/classes.js";
import { seedTeachers } from "./seeders/teachers.js";
import { seedStudents } from "./seeders/students.js";
import { seedAttendance } from "./seeders/attendance.js";
import { seedFees } from "./seeders/fees.js";
import { seedNotifications } from "./seeders/notifications.js";
import { seedExamScores } from "./seeders/scores.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting modular database seeding...");

  // 1. Clear database tables in safe order
  console.log("Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.examScore.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.class.updateMany({ data: { teacherId: null } });
  await prisma.teacherProfile.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  console.log("Database cleared.");

  // 2. Run seeders
  await seedAdmin(prisma);
  const subjectCodeMap = await seedSubjects(prisma);
  const classMap = await seedClasses(prisma);
  await seedTeachers(prisma, classMap);
  const students = await seedStudents(prisma, classMap);
  await seedAttendance(prisma, students);
  await seedFees(prisma, students);
  await seedNotifications(prisma, "secureadmin@school.com");
  await seedExamScores(prisma, students, subjectCodeMap);

  console.log("Modular seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
