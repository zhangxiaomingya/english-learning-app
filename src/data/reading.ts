export interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  translation: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
  difficulty: "Easy" | "Medium" | "Hard";
}

export const readingPassages: ReadingPassage[] = [
  {
    id: "r1",
    title: "The Power of Reading",
    content: `Reading is one of the most valuable skills a person can develop. It opens doors to new worlds, ideas, and perspectives. When we read, we exercise our brains, improve our vocabulary, and enhance our ability to focus. Studies have shown that people who read regularly tend to have better memory and stronger analytical skills. Reading also reduces stress levels, often more effectively than other relaxation methods. Whether you prefer fiction or non-fiction, making time for reading each day can significantly improve your overall quality of life.`,
    translation: `阅读是一个人可以培养的最有价值的技能之一。它为我们打开了通往新世界、新想法和新视角的大门。当我们阅读时，我们锻炼大脑，提高词汇量，并增强专注力。研究表明，经常阅读的人往往拥有更好的记忆力和更强的分析能力。阅读还能降低压力水平，其效果通常比其他放松方法更有效。无论你更喜欢小说还是非小说，每天抽出时间阅读都能显著提高你的整体生活质量。`,
    difficulty: "Easy",
    questions: [
      {
        question: "What is one benefit of reading mentioned in the passage?",
        options: [
          "It helps people sleep better",
          "It improves vocabulary and focus",
          "It makes people more athletic",
          "It reduces the need for exercise",
        ],
        correctIndex: 1,
      },
      {
        question: "According to the passage, how does reading compare to other relaxation methods?",
        options: [
          "It is less effective",
          "It is equally effective",
          "It is often more effective at reducing stress",
          "It is not mentioned",
        ],
        correctIndex: 2,
      },
      {
        question: "What type of reading material is mentioned?",
        options: [
          "Only fiction",
          "Only non-fiction",
          "Fiction and non-fiction",
          "Only newspapers",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "r2",
    title: "Urban Gardening",
    content: `Urban gardening has become increasingly popular in cities around the world. As more people move into apartments and small living spaces, finding ways to grow plants in limited areas has become essential. Container gardening, vertical gardens, and rooftop gardens are just a few creative solutions urban gardeners have developed. These green spaces not only provide fresh herbs and vegetables but also help improve air quality and create a sense of community among neighbors. Starting an urban garden requires minimal space and can be done on a small budget.`,
    translation: `城市园艺在世界各地的城市中越来越受欢迎。随着越来越多的人搬入公寓和小型居住空间，在有限区域内种植植物的方法变得至关重要。容器园艺、垂直花园和屋顶花园只是城市园艺者开发的几种创意解决方案。这些绿色空间不仅提供新鲜的香草和蔬菜，还有助于改善空气质量，并在邻居之间营造社区感。开始城市园艺所需的空间很小，而且可以用很少的预算完成。`,
    difficulty: "Easy",
    questions: [
      {
        question: "Why has urban gardening become popular?",
        options: [
          "Because people have more land",
          "Because people live in smaller spaces",
          "Because it is required by law",
          "Because it is very expensive",
        ],
        correctIndex: 1,
      },
      {
        question: "What benefit of urban gardens is NOT mentioned?",
        options: [
          "Fresh herbs and vegetables",
          "Improved air quality",
          "Community building",
          "Increased property prices",
        ],
        correctIndex: 3,
      },
    ],
  },
  {
    id: "r3",
    title: "The Science of Sleep",
    content: `Sleep is a fundamental biological process that affects nearly every aspect of human health. During sleep, the brain consolidates memories, processes emotions, and clears out toxins that accumulate during waking hours. Most adults require between seven and nine hours of sleep per night to function optimally. Chronic sleep deprivation has been linked to numerous health problems, including weakened immune function, increased risk of heart disease, and impaired cognitive performance. Despite its importance, many people sacrifice sleep to meet work deadlines or engage with digital devices.`,
    translation: `睡眠是一个基本的生物过程，几乎影响人类健康的方方面面。在睡眠期间，大脑巩固记忆、处理情绪，并清除清醒时积累的毒素。大多数成年人每晚需要七到九小时的睡眠才能达到最佳状态。长期睡眠不足与许多健康问题有关，包括免疫功能减弱、心脏病风险增加和认知能力下降。尽管睡眠很重要，但许多人为了赶工作截止日期或使用电子设备而牺牲了睡眠。`,
    difficulty: "Medium",
    questions: [
      {
        question: "What does the brain do during sleep?",
        options: [
          "Only rests",
          "Consolidates memories and clears toxins",
          "Stops all activity",
          "Processes food",
        ],
        correctIndex: 1,
      },
      {
        question: "How much sleep do most adults need?",
        options: [
          "5-6 hours",
          "7-9 hours",
          "10-12 hours",
          "4-5 hours",
        ],
        correctIndex: 1,
      },
      {
        question: "Why do people sacrifice sleep according to the passage?",
        options: [
          "Because they don't need it",
          "For work and digital devices",
          "Because they prefer exercising",
          "Because sleep is harmful",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "r4",
    title: "Renewable Energy Transition",
    content: `The global transition to renewable energy is accelerating at an unprecedented pace. Solar and wind power have become the cheapest sources of electricity in most parts of the world. This shift is driven by both environmental concerns and economic factors. Countries that invest heavily in renewable infrastructure are creating millions of green jobs while reducing their dependence on fossil fuel imports. However, the transition faces challenges including energy storage limitations and the need to upgrade electrical grids. Battery technology is rapidly improving, and new solutions for storing excess energy are being developed.`,
    translation: `全球向可再生能源的转型正在以前所未有的速度加速。在世界各地大部分地区，太阳能和风能已成为最便宜的电力来源。这一转变既受环境因素的驱动，也受经济因素的影响。大力投资可再生能源基础设施的国家正在创造数百万个绿色就业岗位，同时减少对化石燃料进口的依赖。然而，这一转型面临着挑战，包括能源存储限制和升级电网的需求。电池技术正在迅速改进，储存多余能源的新解决方案也正在开发中。`,
    difficulty: "Hard",
    questions: [
      {
        question: "What has driven the shift to renewable energy?",
        options: [
          "Only environmental concerns",
          "Only government mandates",
          "Environmental and economic factors",
          "Only public demand",
        ],
        correctIndex: 2,
      },
      {
        question: "What challenge does the renewable transition face?",
        options: [
          "Too much energy production",
          "Energy storage limitations",
          "Lack of public interest",
          "Excessive government funding",
        ],
        correctIndex: 1,
      },
    ],
  },
];

export function getPassageById(id: string): ReadingPassage | undefined {
  return readingPassages.find((p) => p.id === id);
}

export function getPassagesByDifficulty(difficulty: ReadingPassage["difficulty"]): ReadingPassage[] {
  return readingPassages.filter((p) => p.difficulty === difficulty);
}
