import { PrismaClient } from "@prisma/client";
import type { SeededStudent } from "./students.js";
import { primarySubjectsList, secondarySubjectsList, seniorSecondarySubjectsList } from "./subjects.js";

// Helper to calculate score based on target performance distribution
function generateScore(
  profile: "HIGH" | "AVG" | "WEAK",
  maxScore: number
): number {
  let minPct = 55;
  let maxPct = 85;

  if (profile === "HIGH") {
    minPct = 88;
    maxPct = 100;
  } else if (profile === "WEAK") {
    minPct = 30;
    maxPct = 50;
  }

  const pct = minPct + Math.random() * (maxPct - minPct);
  // Round to nearest half-mark (e.g. 42.5 or 43)
  return Math.round((pct / 100) * maxScore * 2) / 2;
}

export async function seedExamScores(
  prisma: PrismaClient,
  students: SeededStudent[],
  subjectCodeMap: Map<string, string>
): Promise<void> {
  console.log("Seeding student historical exam grades (UT1, Half-Yearly, UT2, Term-End)...");

  const currentYear = new Date().getFullYear();
  const scoresData = [];

  // Define exam dates (assuming typical school calendar)
  const examPhases = [
    { name: "UT1", maxScore: 50, date: new Date(currentYear, 6, 20) }, // July 20
    { name: "Half-yearly", maxScore: 100, date: new Date(currentYear, 9, 15) },    // October 15
    { name: "UT2", maxScore: 50, date: new Date(currentYear, 11, 10) },// December 10
    { name: "Term-end", maxScore: 100, date: new Date(currentYear + 1, 2, 20) },    // March 20 (next year)
  ];

  for (const student of students) {
    // 1. Assign student to an academic profile
    const roll = Math.random() * 100;
    let profile: "HIGH" | "AVG" | "WEAK" = "AVG";

    if (roll > 85) {
      profile = "HIGH";
    } else if (roll < 10) {
      profile = "WEAK";
    }

    // 2. Resolve subjects list matching student's class division
    const className = student.className;
    let applicableSubjectCodes: string[] = [];

    if (
      className.startsWith("Grade 1") ||
      className.startsWith("Grade 2") ||
      className.startsWith("Grade 3") ||
      className.startsWith("Grade 4") ||
      className.startsWith("Grade 5")
    ) {
      applicableSubjectCodes = primarySubjectsList.map((s) => s.code);
    } else if (
      className.startsWith("Grade 6") ||
      className.startsWith("Grade 7") ||
      className.startsWith("Grade 8") ||
      className.startsWith("Grade 9") ||
      className.startsWith("Grade 10")
    ) {
      applicableSubjectCodes = secondarySubjectsList.map((s) => s.code);
    } else if (className.includes("Arts")) {
      applicableSubjectCodes = seniorSecondarySubjectsList
        .filter((s) => s.code.startsWith("KBSSA"))
        .map((s) => s.code);
    } else if (className.includes("Science")) {
      applicableSubjectCodes = seniorSecondarySubjectsList
        .filter((s) => s.code.startsWith("KBSSS"))
        .map((s) => s.code);
    } else if (className.includes("Commerce")) {
      applicableSubjectCodes = seniorSecondarySubjectsList
        .filter((s) => s.code.startsWith("KBSSC"))
        .map((s) => s.code);
    }

    // 3. Seed scores for each subject and exam phase
    for (const code of applicableSubjectCodes) {
      const subjectId = subjectCodeMap.get(code);
      if (!subjectId) continue;

      for (const phase of examPhases) {
        const score = generateScore(profile, phase.maxScore);

        scoresData.push({
          studentId: student.id,
          subjectId,
          examName: phase.name,
          score,
          maxScore: phase.maxScore,
          date: phase.date,
        });
      }
    }
  }

  // Bulk create in chunks
  const chunkSize = 2000;
  for (let i = 0; i < scoresData.length; i += chunkSize) {
    const chunk = scoresData.slice(i, i + chunkSize);
    await prisma.examScore.createMany({
      data: chunk,
    });
  }

  console.log(`Seeded ${scoresData.length} Exam Score records.`);
}
