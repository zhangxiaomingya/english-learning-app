export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  level: "CET-4" | "CET-6" | "IELTS";
  category: string;
}

// Import sub-datasets
import { cet4Words } from "./vocab_cet4";
import { cet4Words2 } from "./vocab_cet4_2";
import { cet4Words3 } from "./vocab_cet4_3";
import { cet4Words4 } from "./vocab_cet4_4";
import { cet4Words5 } from "./vocab_cet4_5";
import { cet4Words6 } from "./vocab_cet4_6";
import { cet6Words } from "./vocab_cet6";
import { cet6Words2 } from "./vocab_cet6_2";
import { cet6Words3 } from "./vocab_cet6_3";
import { ieltsWords } from "./vocab_ielts";
import { ieltsWords2 } from "./vocab_ielts_2";
import { ieltsWords3 } from "./vocab_ielts_3";
import { ieltsWords4 } from "./vocab_ielts_4";
import { extraWords } from "./vocab_extra";
import { extraWords2 } from "./vocab_extra2";
import { extraWords3 } from "./vocab_extra3";
import { extraWords4 } from "./vocab_extra4";
import { cet4Words7 } from "./vocab_cet4_7";
import { cet6Words4 } from "./vocab_cet6_4";
import { cet6Words5 } from "./vocab_cet6_5";
import { ieltsWords5 } from "./vocab_ielts_5";
import { ieltsWords6 } from "./vocab_ielts_6";
import { extraWords5 } from "./vocab_extra5";

// 合并全部词汇（约3000词）
export const vocabularyData: Word[] = [
  ...cet4Words,
  ...cet4Words2,
  ...cet4Words3,
  ...cet4Words4,
  ...cet4Words5,
  ...cet4Words6,
  ...cet4Words7,
  ...cet6Words,
  ...cet6Words2,
  ...cet6Words3,
  ...cet6Words4,
  ...cet6Words5,
  ...ieltsWords,
  ...ieltsWords2,
  ...ieltsWords3,
  ...ieltsWords4,
  ...ieltsWords5,
  ...ieltsWords6,
  ...extraWords,
  ...extraWords2,
  ...extraWords3,
  ...extraWords4,
  ...extraWords5,
];

export function getWordsByLevel(level: Word["level"]): Word[] {
  return vocabularyData.filter((w) => w.level === level);
}

export function getRandomWords(count: number, level?: Word["level"]): Word[] {
  const pool = level ? getWordsByLevel(level) : vocabularyData;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getWordById(id: string): Word | undefined {
  return vocabularyData.find((w) => w.id === id);
}

export function searchWords(query: string): Word[] {
  const q = query.toLowerCase().trim();
  if (!q) return vocabularyData;
  return vocabularyData.filter(
    (w) =>
      w.word.toLowerCase().includes(q) ||
      w.meaning.includes(q) ||
      w.category.includes(q)
  );
}

export function getWordStats() {
  return {
    total: vocabularyData.length,
    cet4: getWordsByLevel("CET-4").length,
    cet6: getWordsByLevel("CET-6").length,
    ielts: getWordsByLevel("IELTS").length,
  };
}
