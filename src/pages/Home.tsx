import { useStudyProgress } from "@/hooks/useStorage";
import { Headphones, Mic, BookOpen, PenLine, Flame, Target, TrendingUp, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HomeProps {
  onNavigate: (tab: string) => void;
}

const modules = [
  { id: "listening", label: "听力训练", icon: Headphones, color: "from-sky-400 to-sky-500", desc: "听音辨词" },
  { id: "speaking", label: "口语练习", icon: Mic, color: "from-emerald-400 to-emerald-500", desc: "跟读训练" },
  { id: "reading", label: "阅读理解", icon: BookOpen, color: "from-violet-400 to-violet-500", desc: "短文阅读" },
  { id: "writing", label: "写作翻译", icon: PenLine, color: "from-amber-400 to-amber-500", desc: "中译英" },
];

export default function Home({ onNavigate }: HomeProps) {
  const { progress } = useStudyProgress();
  const accuracy = progress.totalStudied > 0
    ? Math.round((progress.totalCorrect / progress.totalStudied) * 100)
    : 0;

  return (
    <div className="px-5 pt-4 pb-28 animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          早安，学习者 <span className="text-lg">👋</span>
        </h1>
        <p className="text-muted-foreground text-sm">今天也要坚持学习哦</p>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-primary to-accent p-5 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <img
            src="/images/hero-banner.png"
            alt="学习插图"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-medium mb-1">今日目标</p>
          <h2 className="text-xl font-bold mb-3">完成 10 个单词学习</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame size={16} className="text-amber-300" />
              <span className="text-sm font-semibold">{progress.streakDays} 天 streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target size={16} className="text-white/80" />
              <span className="text-sm">{progress.totalStudied} 已学</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">正确率</p>
              <p className="text-lg font-bold">{accuracy}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Award size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">已掌握</p>
              <p className="text-lg font-bold">{progress.vocabularyLearned.length} 词</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <h3 className="text-base font-semibold mb-3">学习模块</h3>
      <div className="grid grid-cols-2 gap-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="group text-left"
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95">
                <CardContent className="p-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-3 shadow-sm`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-sm mb-0.5">{mod.label}</h4>
                  <p className="text-xs text-muted-foreground">{mod.desc}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Quick Tip */}
      <Card className="mt-5 border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-primary mb-1">每日小贴士</p>
          <p className="text-sm text-foreground">
            每天坚持学习15分钟，比周末突击3小时更有效。保持规律的学习节奏是语言学习的关键！
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
