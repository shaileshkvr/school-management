export function generateBirthDate(minAge: number, maxAge: number): Date {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, birthMonth, birthDay);
}

export function formatBirthDateMMYY(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}${year}`;
}
