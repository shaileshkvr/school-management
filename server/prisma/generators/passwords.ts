import bcrypt from "bcrypt";
import { formatBirthDateMMYY } from "./dates.js";

export function generatePassword(firstName: string, lastName: string, birthDate: Date): string {
  const firstPart = firstName.slice(0, 3).toLowerCase();
  const lastPart = lastName.slice(0, 3).toLowerCase();
  const datePart = formatBirthDateMMYY(birthDate);
  return `${firstPart}@${lastPart}-${datePart}`;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 8); // Seed compromise for faster generation
}
