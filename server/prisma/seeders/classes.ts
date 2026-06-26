import { PrismaClient } from "@prisma/client";

export async function seedClasses(prisma: PrismaClient): Promise<Map<string, string>> {
  const classMap = new Map<string, string>();

  // Primary (Grades 1-5, Sections A & B)
  for (let grade = 1; grade <= 5; grade++) {
    for (const section of ["A", "B"]) {
      const className = `Grade ${grade}-${section}`;
      const created = await prisma.class.create({ data: { name: className } });
      classMap.set(className, created.id);
    }
  }

  // Secondary (Grades 6-10, Sections A & B)
  for (let grade = 6; grade <= 10; grade++) {
    for (const section of ["A", "B"]) {
      const className = `Grade ${grade}-${section}`;
      const created = await prisma.class.create({ data: { name: className } });
      classMap.set(className, created.id);
    }
  }

  // Senior Secondary (Grades 11-12, Streams Arts, Science, Commerce)
  for (let grade = 11; grade <= 12; grade++) {
    for (const stream of ["Arts", "Science", "Commerce"]) {
      const className = `Grade ${grade}-${stream}`;
      const created = await prisma.class.create({ data: { name: className } });
      classMap.set(className, created.id);
    }
  }

  console.log(`Seeded ${classMap.size} Classes.`);
  return classMap;
}
