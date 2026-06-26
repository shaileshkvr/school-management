import { PrismaClient, Role, TeacherGroup, Gender } from "@prisma/client";
import { generateIndianName } from "../generators/names.js";
import { generateBirthDate, formatBirthDateMMYY } from "../generators/dates.js";
import { generatePassword, hashPassword } from "../generators/passwords.js";
import { primarySubjectsList, secondarySubjectsList, seniorSecondarySubjectsList } from "./subjects.js";

export async function seedTeachers(
  prisma: PrismaClient, 
  classMap: Map<string, string>
): Promise<Map<string, string>> {
  // Maps subject code to TeacherProfile UUID
  const teacherMap = new Map<string, string>();
  let teacherCounter = 1;

  async function createTeacher(
    group: TeacherGroup,
    subjectCode: string,
    isSecondaryExtra: boolean = false,
    overrideCreds?: { email: string; pass: string }
  ): Promise<string> {
    const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const { firstName, lastName } = generateIndianName(gender);
    const birthDate = generateBirthDate(26, 56);
    
    let passwordHash: string;
    let email: string;

    if (overrideCreds) {
      email = overrideCreds.email;
      passwordHash = await hashPassword(overrideCreds.pass);
    } else {
      const rawPassword = generatePassword(firstName, lastName, birthDate);
      passwordHash = await hashPassword(rawPassword);
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${isSecondaryExtra ? "2" : ""}@school.com`;
    }

    const employeeId = `T-${group.slice(0, 3)}-${String(teacherCounter++).padStart(3, "0")}`;

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.TEACHER,
        teacherProfile: {
          create: {
            employeeId,
            group,
            gender,
            birthDate,
          },
        },
      },
      include: { teacherProfile: true },
    });

    const teacherProfileId = created.teacherProfile!.id;
    teacherMap.set(subjectCode, teacherProfileId);
    return teacherProfileId;
  }

  // 1. Seed demo teacher account
  // teacher@school.com / teacher123 (linked to KBS-04 - Secondary Maths)
  const demoTeacherId = await createTeacher(
    TeacherGroup.SECONDARY, 
    "KBS-04", 
    false, 
    { email: "teacher@school.com", pass: "teacher123" }
  );

  // 2. Primary Teachers
  for (const sub of primarySubjectsList) {
    // If it's Maths KBP-04, skip or overwrite, but we'll seed standard
    await createTeacher(TeacherGroup.PRIMARY, sub.code);
  }

  // 3. Secondary Teachers (skip Maths KBS-04 since demo teacher has it)
  for (const sub of secondarySubjectsList) {
    if (sub.code === "KBS-04") continue; // Already seeded by demo teacher
    await createTeacher(TeacherGroup.SECONDARY, sub.code);
    if (sub.code === "KBS-01" || sub.code === "KBS-04") {
      await createTeacher(TeacherGroup.SECONDARY, sub.code, true);
    }
  }

  // 4. Senior Secondary Teachers
  for (const sub of seniorSecondarySubjectsList) {
    await createTeacher(TeacherGroup.SENIOR_SECONDARY, sub.code);
  }

  // 5. Specialist Teachers (Art, Music, PE, CS - mapped as SPECIAL)
  const specialistSubjects = ["Computer", "Sports"];
  for (const spec of specialistSubjects) {
    await createTeacher(TeacherGroup.SPECIAL, `SPECIAL-${spec.toUpperCase()}`);
  }

  // 6. Assign class teachers to some classes
  const classesList = Array.from(classMap.keys());
  const teacherProfiles = Array.from(teacherMap.values());

  for (let i = 0; i < classesList.length; i++) {
    const className = classesList[i]!;
    const classId = classMap.get(className)!;
    const teacherId = teacherProfiles[i % teacherProfiles.length]; // Cycle teachers
    
    if (teacherId) {
      await prisma.class.update({
        where: { id: classId },
        data: { teacherId },
      });
    }
  }

  console.log(`Seeded ${teacherCounter - 1} Teachers and assigned Class Teachers.`);
  return teacherMap;
}
