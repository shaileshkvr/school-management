import { PrismaClient } from "@prisma/client";

export interface SeededSubject {
  id: string;
  name: string;
  code: string;
}

export const primarySubjectsList = [
  { name: "English", code: "KBP-01" },
  { name: "Grammar", code: "KBP-02" },
  { name: "Hindi", code: "KBP-03" },
  { name: "Maths", code: "KBP-04" },
  { name: "Science", code: "KBP-05" },
  { name: "Geography", code: "KBP-06" },
  { name: "General Knowledge", code: "KBP-07" },
  { name: "Computer", code: "KBP-08" },
  { name: "Sports", code: "KBP-09" },
];

export const secondarySubjectsList = [
  { name: "English", code: "KBS-01" },
  { name: "Grammar", code: "KBS-02" },
  { name: "Hindi", code: "KBS-03" },
  { name: "Maths", code: "KBS-04" },
  { name: "Physics", code: "KBS-05" },
  { name: "Chemistry", code: "KBS-06" },
  { name: "Biology", code: "KBS-07" },
  { name: "Social-Science", code: "KBS-08" },
  { name: "General Knowledge", code: "KBS-09" },
  { name: "Computer", code: "KBS-10" },
  { name: "Sports", code: "KBS-11" },
];

export const seniorSecondarySubjectsList = [
  // Arts Stream
  { name: "Arts English", code: "KBSSA-01" },
  { name: "Arts Advance Grammar", code: "KBSSA-02" },
  { name: "History", code: "KBSSA-03" },
  { name: "Political Science", code: "KBSSA-04" },
  { name: "Arts Geography", code: "KBSSA-05" },
  { name: "Sociology", code: "KBSSA-06" },
  { name: "Psychology", code: "KBSSA-07" },
  { name: "Fine Arts", code: "KBSSA-08" },
  { name: "Arts Economics", code: "KBSSA-09" },
  { name: "Home Science", code: "KBSSA-10" },
  { name: "Mass Communication", code: "KBSSA-11" },

  // Science Stream
  { name: "Science English", code: "KBSSS-01" },
  { name: "Science Advance Grammar", code: "KBSSS-02" },
  { name: "Science Physics", code: "KBSSS-03" },
  { name: "Science Chemistry", code: "KBSSS-04" },
  { name: "Science Biology", code: "KBSSS-05" },
  { name: "Science Maths", code: "KBSSS-06" },
  { name: "Science CS/IP", code: "KBSSS-07" },

  // Commerce Stream
  { name: "Commerce English", code: "KBSSC-01" },
  { name: "Commerce Advance Grammar", code: "KBSSC-02" },
  { name: "Accountancy", code: "KBSSC-03" },
  { name: "Business Studies", code: "KBSSC-04" },
  { name: "Commerce Economics", code: "KBSSC-05" },
  { name: "Commerce Maths", code: "KBSSC-06" },
  { name: "Commerce IP", code: "KBSSC-07" },
];

export async function seedSubjects(prisma: PrismaClient): Promise<Map<string, string>> {
  const codeMap = new Map<string, string>();
  const allList = [
    ...primarySubjectsList,
    ...secondarySubjectsList,
    ...seniorSecondarySubjectsList,
  ];

  for (const sub of allList) {
    const created = await prisma.subject.create({
      data: { name: `${sub.name} (${sub.code})` },
    });
    codeMap.set(sub.code, created.id);
  }

  console.log(`Seeded ${allList.length} Subjects.`);
  return codeMap;
}
