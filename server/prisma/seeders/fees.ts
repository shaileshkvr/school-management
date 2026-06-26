import { PrismaClient, FeeStatus } from "@prisma/client";
import type { SeededStudent } from "./students.js";

export async function seedFees(
  prisma: PrismaClient,
  students: SeededStudent[]
): Promise<void> {
  console.log("Seeding student fees registry...");

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);

  const nextWeek = new Date();
  nextWeek.setDate(currentDate.getDate() + 7);

  const feesData = [];

  for (const student of students) {
    // 1. Previous term fee (Assigned last month)
    const oldAmount = 5000;
    const oldRoll = Math.random() * 100;
    let oldStatus: FeeStatus = FeeStatus.PAID;
    let oldPaymentDetails = null;

    if (oldRoll > 95) {
      oldStatus = FeeStatus.UNPAID;
    } else if (oldRoll > 85) {
      oldStatus = FeeStatus.PARTIAL;
      oldPaymentDetails = {
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 89999999)}`,
        gateway: "RazorpayMock",
        method: "UPI",
        paidAmount: 2500,
        paymentDate: oneMonthAgo.toISOString(),
      };
    } else {
      oldPaymentDetails = {
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 89999999)}`,
        gateway: "RazorpayMock",
        method: "NetBanking",
        paidAmount: 5000,
        paymentDate: oneMonthAgo.toISOString(),
      };
    }

    feesData.push({
      studentId: student.id,
      amount: oldAmount,
      dueDate: oneMonthAgo,
      status: oldStatus,
      paymentDetails: oldPaymentDetails ? JSON.parse(JSON.stringify(oldPaymentDetails)) : null,
    });

    // 2. Upcoming term fee (Due next week)
    const newAmount = 6000;
    const newRoll = Math.random() * 100;
    let newStatus: FeeStatus = FeeStatus.UNPAID;
    let newPaymentDetails = null;

    if (newRoll > 90) {
      newStatus = FeeStatus.PAID;
      newPaymentDetails = {
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 89999999)}`,
        gateway: "RazorpayMock",
        method: "Card",
        paidAmount: 6000,
        paymentDate: currentDate.toISOString(),
      };
    } else if (newRoll > 75) {
      newStatus = FeeStatus.PARTIAL;
      newPaymentDetails = {
        transactionId: `TXN-${Math.floor(10000000 + Math.random() * 89999999)}`,
        gateway: "RazorpayMock",
        method: "UPI",
        paidAmount: 3000,
        paymentDate: currentDate.toISOString(),
      };
    }

    feesData.push({
      studentId: student.id,
      amount: newAmount,
      dueDate: nextWeek,
      status: newStatus,
      paymentDetails: newPaymentDetails ? JSON.parse(JSON.stringify(newPaymentDetails)) : null,
    });
  }

  // Bulk insert
  for (const fee of feesData) {
    await prisma.fee.create({
      data: fee,
    });
  }

  console.log(`Seeded ${feesData.length} Fees invoices.`);
}
