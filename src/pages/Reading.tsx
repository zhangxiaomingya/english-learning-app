import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readingPassages, type ReadingPassage } from "@/data/reading";
import { useStudyProgress } from "@/hooks/useStorage";
import { cn } from "@/lib/utils";

export default function Reading() {
  const [passage] = useState<ReadingPassage>(() => {
    return readingPassages[Math.floor(Math.random() * readingPassages.length)];
  });
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(passage.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [score, setScore] = useState(0);
  const { recordStudy } = useStudyProgress();

  const handleSelect = useCallback(
    (questionIdx: number, optionIdx: number) => {
      if (showResults) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[questionIdx] = optionIdx;
        return next;
      });
    },
    [showResults]
  );

  const handleSubmit = useCallback(() => {
    if (answers.some((a) => a === null)) return;
    let correct = 0;
    passage.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++;
    });
    setScore(correct);
    setShowResults(true);
    recordStudy(correct === passage.questions.length);
  }, [answers, passage, recordStudy]);

  const handleRestart = useCallback(() => {
    window.location.reload();
  }, []);

  const allAnswered = answers.every((a) => a !== null);
  const accuracy = passage.questions.length > 0 ? Math.round((score / passage.questions.length) * 100) : 0;

  return (
    <div className="px-5 pt-4 pb-28 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">阅读理解</h2>
        <span
          className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium",
            passage.difficulty === "Easy" && "bg-success/10 text-success",
            passage.difficulty === "Medium" && "bg-warning/10 text-warning",
            passage.difficulty === "Hard" && "bg-destructive/10 text-destructive"
          )}
        >
          {passage.difficulty === "Easy" ? "简单" : passage.difficulty === "Medium" ? "中等" : "困难"}
        </span>
      </div>

      {/* Passage */}
      <Card className="mb-5 border-0 shadow-sm">
        <CardContent className="p-5">
          <h3 className="font-semibold text-base mb-3">{passage.title}</h3>
          <p className="text-sm leading-relaxed text-foreground">{passage.content}</p>

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex items-center gap-1 mt-4 text-xs text-primary font-medium"
          >
            {showTranslation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showTranslation ? "收起译文" : "查看译文"}
          </button>

          {showTranslation && (
            <div className="mt-3 pt-3 border-t border-border animate-slide-up">
              <p className="text-sm leading-relaxed text-muted-foreground">{passage.translation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-5">
        {passage.questions.map((q, qIdx) => (
          <Card key={qIdx} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">
                <span className="text-primary font-bold mr-1">{qIdx + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[qIdx] === oIdx;
                  const isCorrect = oIdx === q.correctIndex;
                  let btnClass =
                    "w-full text-left py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center gap-2";

                  if (!showResults) {
                    btnClass += isSelected
                      ? " bg-primary/10 border-2 border-primary text-primary font-medium"
                      : " bg-muted/50 hover:bg-muted border-2 border-transparent";
                  } else {
                    if (isCorrect) {
                      btnClass += " bg-success/10 border-2 border-success text-success font-medium";
                    } else if (isSelected && !isCorrect) {
                      btnClass += " bg-destructive/10 border-2 border-destructive text-destructive";
                    } else {
                      btnClass += " bg-muted/30 border-2 border-transparent opacity-50";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      disabled={showResults}
                      className={btnClass}
                    >
                      <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {showResults && isCorrect && <CheckCircle2 size={16} />}
                      {showResults && isSelected && !isCorrect && <XCircle size={16} />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit / Results */}
      {!showResults ? (
        <div className="mt-6">
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            提交答案
          </Button>
          {!allAnswered && (
            <p className="text-xs text-center text-muted-foreground mt-2">请回答所有题目后提交</p>
          )}
        </div>
      ) : (
        <div className="mt-6 animate-scale-in">
          <Card className="mb-4 border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">答题结果</p>
              <p className="text-3xl font-bold gradient-text">
                {score}/{passage.questions.length}
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-700"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Button variant="gradient" size="lg" className="w-full" onClick={handleRestart}>
            <RotateCcw size={18} className="mr-2" />
            换一篇文章
          </Button>
        </div>
      )}
    </div>
  );
}
