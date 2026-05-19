import { useState, useCallback } from "react";
import { PenLine, CheckCircle2, RotateCcw, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { writingExercises, type WritingExercise } from "@/data/writing";
import { useStudyProgress } from "@/hooks/useStorage";
import { cn } from "@/lib/utils";

function similarity(s1: string, s2: string): number {
  const a = s1.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
  const b = s2.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export default function Writing() {
  const [exercises] = useState<WritingExercise[]>(() => {
    const shuffled = [...writingExercises].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "partial" | "incorrect" | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const { recordStudy } = useStudyProgress();

  const current = exercises[currentIndex];

  const handleCheck = useCallback(() => {
    if (!input.trim() || !current) return;
    const sim = similarity(input, current.english);
    if (sim >= 0.7) {
      setFeedback("correct");
      setScore((s) => s + 1);
      recordStudy(true);
    } else if (sim >= 0.4) {
      setFeedback("partial");
      recordStudy(false);
    } else {
      setFeedback("incorrect");
      recordStudy(false);
    }
    setShowAnswer(true);
  }, [input, current, recordStudy]);

  const handleNext = useCallback(() => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      setInput("");
      setShowAnswer(false);
      setFeedback(null);
      setShowHint(false);
    } else {
      setFinished(true);
    }
  }, [currentIndex, exercises.length]);

  const handleRestart = useCallback(() => {
    window.location.reload();
  }, []);

  if (finished) {
    const accuracy = Math.round((score / exercises.length) * 100);
    return (
      <div className="px-5 pt-6 pb-28 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <PenLine size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">写作练习完成！</h2>
          <p className="text-muted-foreground">
            准确翻译 {score}/{exercises.length} 句
          </p>
        </div>

        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">准确率</p>
            <p className="text-4xl font-bold gradient-text mb-2">{accuracy}%</p>
            <div className="w-full bg-muted rounded-full h-2.5 mt-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Button variant="gradient" size="lg" className="w-full" onClick={handleRestart}>
          <RotateCcw size={18} className="mr-2" />
          再来一轮
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-28 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">写作翻译</h2>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {exercises.length}
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5 mb-6">
        <div
          className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Chinese Sentence */}
      <Card className="mb-5 border-0 shadow-sm">
        <CardContent className="p-5">
          <p className="text-xs font-medium text-muted-foreground mb-2">请将下列中文翻译成英文</p>
          <p className="text-lg font-semibold text-foreground">{current?.chinese}</p>

          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 mt-3 text-xs text-primary font-medium"
          >
            <Lightbulb size={14} />
            {showHint ? "隐藏提示" : "查看提示"}
          </button>

          {showHint && (
            <div className="mt-3 pt-3 border-t border-border animate-slide-up">
              <p className="text-xs text-muted-foreground">提示词：{current?.hint}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input */}
      <div className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={showAnswer}
          placeholder="在此输入英文翻译..."
          className="w-full min-h-[120px] p-4 rounded-xl bg-card border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-60"
        />
      </div>

      {/* Check / Next Buttons */}
      {!showAnswer ? (
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={!input.trim()}
          onClick={handleCheck}
        >
          检查答案
        </Button>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {/* Feedback */}
          <Card
            className={cn(
              "border-0",
              feedback === "correct" ? "bg-success/5" : "bg-warning/5"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {feedback === "correct" ? (
                  <CheckCircle2 size={18} className="text-success" />
                ) : (
                  <Lightbulb size={18} className="text-warning" />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    feedback === "correct" ? "text-success" : "text-warning"
                  )}
                >
                  {feedback === "correct" ? "翻译正确！" : "参考答案"}
                </span>
              </div>
              <p className="text-sm text-foreground">{current?.english}</p>
              <p className="text-xs text-muted-foreground mt-2">你的答案：{input}</p>
            </CardContent>
          </Card>

          <Button variant="gradient" size="lg" className="w-full" onClick={handleNext}>
            {currentIndex < exercises.length - 1 ? (
              <>
                下一题 <ArrowRight size={18} className="ml-2" />
              </>
            ) : (
              "查看结果"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
