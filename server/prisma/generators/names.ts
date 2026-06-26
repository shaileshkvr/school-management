import { Gender } from "@prisma/client";

const malePrefixes = ["Aar", "Abhi", "Adit", "Amit", "An", "Arj", "Dev", "Dinesh", "Gaur", "Har", "Ish", "Jay", "Kab", "Kish", "Kri", "Man", "Moh", "Nit", "Pran", "Raj", "Roh", "Sanj", "Shik", "Shiv", "Suh", "Sun", "Sur", "Tan", "Var", "Vih", "Vik", "Yo"];
const maleSuffixes = ["av", "it", "ya", "esh", "an", "un", "ndra", "eep", "ay", "ish", "an", "al", "it", "ish", "as", "oj", "it", "in", "it", "esh", "an", "ay", "ar", "an", "as", "il", "esh", "ay", "un", "aan", "as", "g"];

const femalePrefixes = ["Aan", "An", "Aart", "Aki", "Div", "Geet", "Har", "Jyot", "Kav", "Kee", "Kir", "Mon", "Neh", "Poo", "Priy", "Ree", "Rit", "Rup", "Shw", "Sneh", "Sre", "Suj", "Sun", "Sw", "Tan", "Var", "Yash"];
const femaleSuffixes = ["ya", "a", "i", "lka", "ya", "a", "ini", "i", "ita", "ti", "an", "ika", "a", "ja", "a", "ma", "u", "a", "eta", "a", "e", "ata", "ita", "ati", "ya", "sha", "i"];

const surnamePrefixes = ["Sharm", "Pat", "Verm", "Sing", "Kum", "Gupt", "Meht", "Josh", "Ra", "Na", "Iy", "Red", "Choud", "Da", "Se", "Baner", "Chat", "Mukh", "Gho", "Bo", "Pat", "Desh", "Kulk", "Shin", "Yad", "Mish", "Pand", "Triv", "Chatuv", "Dix", "Shuk", "Dub", "Tiw", "Path", "Dwi", "Vy", "Sh", "Heg", "Alv", "Sal"];
const surnameSuffixes = ["a", "el", "a", "h", "ar", "a", "a", "i", "o", "ir", "er", "dy", "hury", "s", "n", "jee", "erjee", "erjee", "sh", "se", "il", "mukh", "arni", "de", "av", "ra", "ey", "edi", "edi", "it", "la", "ey", "ari", "ak", "edi", "as", "ah", "de", "a", "ian"];

const uniqueFirstNames = new Set<string>();
const uniqueSurnames = new Set<string>();
let totalGeneratedNames = 0;

export function generateFirstName(gender: Gender): string {
  const prefixes = gender === Gender.MALE ? malePrefixes : femalePrefixes;
  const suffixes = gender === Gender.MALE ? maleSuffixes : femaleSuffixes;
  const maxUniqueLimit = Math.floor(totalGeneratedNames * 0.7) + 50;

  while (true) {
    const name = prefixes[Math.floor(Math.random() * prefixes.length)]! +
                 suffixes[Math.floor(Math.random() * suffixes.length)]!;
    if (!uniqueFirstNames.has(name) || uniqueFirstNames.size >= maxUniqueLimit) {
      uniqueFirstNames.add(name);
      return name;
    }
  }
}

export function generateSurname(): string {
  const maxUniqueLimit = Math.floor(totalGeneratedNames * 0.4) + 50;

  while (true) {
    const surname = surnamePrefixes[Math.floor(Math.random() * surnamePrefixes.length)]! +
                    surnameSuffixes[Math.floor(Math.random() * surnameSuffixes.length)]!;
    if (!uniqueSurnames.has(surname) || uniqueSurnames.size >= maxUniqueLimit) {
      uniqueSurnames.add(surname);
      return surname;
    }
  }
}

export function generateIndianName(gender: Gender): { firstName: string; lastName: string } {
  totalGeneratedNames++;
  return {
    firstName: generateFirstName(gender),
    lastName: generateSurname(),
  };
}
