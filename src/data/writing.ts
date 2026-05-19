export interface WritingExercise {
  id: string;
  chinese: string;
  english: string;
  hint: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const writingExercises: WritingExercise[] = [
  {
    id: "w1",
    chinese: "我喜欢在周末去公园散步。",
    english: "I like to go for a walk in the park on weekends.",
    hint: "like to do sth, go for a walk, on weekends",
    difficulty: "Easy",
  },
  {
    id: "w2",
    chinese: "这本书对我学习英语很有帮助。",
    english: "This book is very helpful for my English learning.",
    hint: "be helpful for, English learning",
    difficulty: "Easy",
  },
  {
    id: "w3",
    chinese: "她每天早上都会喝一杯咖啡。",
    english: "She drinks a cup of coffee every morning.",
    hint: "a cup of coffee, every morning",
    difficulty: "Easy",
  },
  {
    id: "w4",
    chinese: "我们应该保护环境，为未来 generations 着想。",
    english: "We should protect the environment for future generations.",
    hint: "protect the environment, future generations",
    difficulty: "Medium",
  },
  {
    id: "w5",
    chinese: "科技的发展改变了我们的生活方式。",
    english: "The development of technology has changed our way of life.",
    hint: "development of technology, way of life",
    difficulty: "Medium",
  },
  {
    id: "w6",
    chinese: "不管你遇到什么困难，都不要放弃你的梦想。",
    english: "No matter what difficulties you encounter, never give up on your dreams.",
    hint: "No matter what, give up on, encounter difficulties",
    difficulty: "Medium",
  },
  {
    id: "w7",
    chinese: "政府正在采取措施减少空气污染。",
    english: "The government is taking measures to reduce air pollution.",
    hint: "take measures to, air pollution",
    difficulty: "Medium",
  },
  {
    id: "w8",
    chinese: "学习一门外语不仅能开阔视野，还能增加就业机会。",
    english: "Learning a foreign language can not only broaden your horizons but also increase job opportunities.",
    hint: "not only...but also..., broaden horizons, job opportunities",
    difficulty: "Hard",
  },
  {
    id: "w9",
    chinese: "随着全球化的发展，跨文化交流变得越来越重要。",
    english: "With the development of globalization, cross-cultural communication is becoming increasingly important.",
    hint: "With the development of..., cross-cultural communication, increasingly important",
    difficulty: "Hard",
  },
  {
    id: "w10",
    chinese: "在线教育为那些无法进入传统学校的人提供了学习机会。",
    english: "Online education provides learning opportunities for those who cannot access traditional schools.",
    hint: "provide opportunities for, access traditional schools",
    difficulty: "Hard",
  },
];

export function getWritingByDifficulty(difficulty: WritingExercise["difficulty"]): WritingExercise[] {
  return writingExercises.filter((w) => w.difficulty === difficulty);
}

export function getRandomWritingExercises(count: number): WritingExercise[] {
  const shuffled = [...writingExercises].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
