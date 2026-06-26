import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../generators/passwords.js";

export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const adminPasswordHash = await hashPassword("admin-security-key-2816");
  const admin = await prisma.user.create({
    data: {
      email: "secureadmin@school.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Seeded Admin: ${admin.email}`);
}
