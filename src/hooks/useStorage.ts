import { useState, useCallback } from "react";

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

export interface StudyProgress {
  totalStudied: number;
  totalCorrect: number;
  streakDays: number;
  lastStudyDate: string;
  vocabularyLearned: string[];
}

export function useStudyProgress() {
  const [progress, setProgress] = useStorage<StudyProgress>("study-progress", {
    totalStudied: 0,
    totalCorrect: 0,
    streakDays: 0,
    lastStudyDate: "",
    vocabularyLearned: [],
  });

  const recordStudy = useCallback(
    (correct: boolean, word?: string) => {
      setProgress((prev) => {
        const today = new Date().toISOString().split("T")[0];
        const newStreak =
          prev.lastStudyDate === today
            ? prev.streakDays
            : prev.lastStudyDate === getYesterday()
            ? prev.streakDays + 1
            : 1;

        const learned = word && correct ? [...prev.vocabularyLearned, word] : prev.vocabularyLearned;

        return {
          ...prev,
          totalStudied: prev.totalStudied + 1,
          totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
          streakDays: newStreak,
          lastStudyDate: today,
          vocabularyLearned: learned,
        };
      });
    },
    [setProgress]
  );

  return { progress, recordStudy };
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
