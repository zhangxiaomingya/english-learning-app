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
import { cet6Words } from "./vocab_cet6";
import { ieltsWords } from "./vocab_ielts";
import { extraWords } from "./vocab_extra";

// 合并全部词汇（约3000词）
export const vocabularyData: Word[] = [
  ...cet4Words,
  ...cet6Words,
  ...ieltsWords,
  ...extraWords,
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
