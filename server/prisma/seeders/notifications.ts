import { PrismaClient } from "@prisma/client";

export async function seedNotifications(
  prisma: PrismaClient,
  adminEmail: string
): Promise<void> {
  console.log("Seeding notice board notifications...");

  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.error("Admin user not found. Skipping notifications seeding.");
    return;
  }

  const currentDate = new Date();
  
  const notices = [
    {
      title: "Science Exhibition Rescheduling",
      message: "The annual science exhibition has been rescheduled to next Friday. Please contact your physics and chemistry teachers for booth registrations.",
      createdAt: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdById: admin.id,
    },
    {
      title: "Quarterly Fee Submission Notice",
      message: "This is a reminder that the Q2 academic fee payments are due by the end of next week. Invoices can be paid online via the student dashboard payment mock gateway.",
      createdAt: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      createdById: admin.id,
    },
    {
      title: "School Sports Day Trials",
      message: "Trials for track events and football will begin this Monday at the playground. Mandatory registration forms are available in the PE department.",
      createdAt: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      createdById: admin.id,
    },
  ];

  for (const notice of notices) {
    await prisma.notification.create({
      data: notice,
    });
  }

  console.log(`Seeded ${notices.length} Notice Board announcements.`);
}
