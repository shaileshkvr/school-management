import { PrismaClient, Role, Gender } from "@prisma/client";
import { generateIndianName, generateFirstName } from "../generators/names.js";
import { generateBirthDate } from "../generators/dates.js";
import { generatePassword, hashPassword } from "../generators/passwords.js";

export interface SeededStudent {
  id: string; // StudentProfile UUID
  userId: string; // User UUID
  className: string;
}

export async function seedStudents(
  prisma: PrismaClient,
  classMap: Map<string, string>
): Promise<SeededStudent[]> {
  const seededStudentsList: SeededStudent[] = [];
  let studentCounter = 1;

  async function createStudent(
    className: string,
    birthDateRange: [number, number],
    overrideCreds?: { email: string; pass: string }
  ): Promise<SeededStudent | null> {
    const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const { firstName, lastName } = generateIndianName(gender);
    const birthDate = generateBirthDate(birthDateRange[0], birthDateRange[1]);

    let passwordHash: string;
    let email: string;

    if (overrideCreds) {
      email = overrideCreds.email;
      passwordHash = await hashPassword(overrideCreds.pass);
    } else {
      const rawPassword = generatePassword(firstName, lastName, birthDate);
      passwordHash = await hashPassword(rawPassword);
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentCounter}@student.school.com`;
    }

    const admissionNo = `ADM-2026-${String(studentCounter++).padStart(4, "0")}`;
    const classId = classMap.get(className);

    if (!classId) return null;

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            classId,
            admissionNo,
            parentName: `${generateFirstName(Gender.MALE)} ${lastName}`,
            parentPhone: `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`,
            gender,
            birthDate,
          },
        },
      },
      include: { studentProfile: true },
    });

    const studentInfo = {
      id: created.studentProfile!.id,
      userId: created.id,
      className,
    };
    seededStudentsList.push(studentInfo);
    return studentInfo;
  }

  // 1. Seed demo student account
  // student@school.com / student123 (mapped to Grade 10-A, age 14-15)
  await createStudent(
    "Grade 10-A", 
    [14, 15], 
    { email: "student@school.com", pass: "student123" }
  );

  // 2. Primary Students: Grades 1-5, 10 per section (standard age Grade+4 to Grade+5)
  for (let grade = 1; grade <= 5; grade++) {
    for (const section of ["A", "B"]) {
      const className = `Grade ${grade}-${section}`;
      // Subtract 1 if it's Grade 10-A to avoid adding an 11th student if we already added the demo student, 
      // but for Grade 1-5 A/B it's always 10 new students.
      for (let i = 0; i < 10; i++) {
        await createStudent(className, [grade + 4, grade + 5]);
      }
    }
  }

  // 3. Secondary Students: Grades 6-10, 8 per section (standard age Grade+4 to Grade+5)
  for (let grade = 6; grade <= 10; grade++) {
    for (const section of ["A", "B"]) {
      const className = `Grade ${grade}-${section}`;
      // Adjust loop limit for Grade 10-A since we already seeded the demo student there
      const countLimit = className === "Grade 10-A" ? 7 : 8;
      for (let i = 0; i < countLimit; i++) {
        await createStudent(className, [grade + 4, grade + 5]);
      }
    }
  }

  // 4. Senior Secondary Students: Grades 11-12, 5 per stream class
  for (let grade = 11; grade <= 12; grade++) {
    for (const stream of ["Arts", "Science", "Commerce"]) {
      const className = `Grade ${grade}-${stream}`;
      for (let i = 0; i < 5; i++) {
        await createStudent(className, [grade + 4, grade + 5]);
      }
    }
  }

  console.log(`Seeded ${seededStudentsList.length} Students.`);
  return seededStudentsList;
}
