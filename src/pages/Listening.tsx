import { useState, useCallback, useEffect } from "react";
import { Volume2, CheckCircle2, XCircle, ArrowRight, RotateCcw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomWords, type Word } from "@/data/vocabulary";
import { useStudyProgress } from "@/hooks/useStorage";

function speak(text: string, rate = 0.8) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
}

function generateOptions(correctWord: Word, allWords: Word[]): string[] {
  const wrongOptions = allWords
    .filter((w) => w.id !== correctWord.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((w) => w.meaning);
  return [...wrongOptions, correctWord.meaning].sort(() => Math.random() - 0.5);
}

export default function Listening() {
  const [words] = useState(() => getRandomWords(20));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { recordStudy } = useStudyProgress();

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord && !finished) {
      setOptions(generateOptions(currentWord, words));
      setSelectedOption(null);
      // Auto speak after a short delay
      const timer = setTimeout(() => speak(currentWord.word), 300);
      return () => clearTimeout(timer);
    }
  }, [currentWord, finished, words]);

  const handleSpeak = useCallback(() => {
    if (currentWord) {
      speak(currentWord.word);
      // Also speak example if user taps again
      setTimeout(() => speak(currentWord.example, 0.75), 1200);
    }
  }, [currentWord]);

  const handleSelect = useCallback(
    (option: string) => {
      if (selectedOption !== null || !currentWord) return;
      setSelectedOption(option);
      const correct = option === currentWord.meaning;
      if (correct) setScore((s) => s + 1);
      recordStudy(correct, currentWord.word);
    },
    [selectedOption, currentWord, recordStudy]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }, [currentIndex, words.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
  }, []);

  if (finished) {
    const accuracy = Math.round((score / words.length) * 100);
    return (
      <div className="px-5 pt-6 pb-28 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Headphones size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">练习完成！</h2>
          <p className="text-muted-foreground">
            你答对了 {score}/{words.length} 题
          </p>
        </div>

        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">正确率</p>
            <p className="text-4xl font-bold gradient-text mb-2">{accuracy}%</p>
            <div className="w-full bg-muted rounded-full h-2.5 mt-3">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full transition-all duration-700"
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">听力训练</h2>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-1.5 mb-8">
        <div
          className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Word Display */}
      <div className="text-center mb-8">
        <button
          onClick={handleSpeak}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4 active:scale-95 transition-transform shadow-sm"
        >
          <Volume2 size={40} className="text-primary" />
        </button>
        <p className="text-xs text-muted-foreground mb-1">点击播放发音</p>
        {selectedOption !== null && (
          <div className="animate-scale-in">
            <p className="text-2xl font-bold mb-1">{currentWord?.word}</p>
            <p className="text-sm text-muted-foreground">{currentWord?.phonetic}</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isRightAnswer = option === currentWord?.meaning;
          let btnClass = "w-full justify-start text-left h-auto py-4 px-5 rounded-xl font-medium text-sm transition-all duration-200";

          if (selectedOption === null) {
            btnClass += " bg-card hover:bg-accent/50 border border-border";
          } else if (isRightAnswer) {
            btnClass += " bg-success/10 border-2 border-success text-success";
          } else if (isSelected && !isRightAnswer) {
            btnClass += " bg-destructive/10 border-2 border-destructive text-destructive";
          } else {
            btnClass += " bg-card border border-border opacity-50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              disabled={selectedOption !== null}
              className={btnClass}
            >
              <span className="inline-flex items-center gap-3 w-full">
                <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {selectedOption !== null && isRightAnswer && (
                  <CheckCircle2 size={20} className="shrink-0" />
                )}
                {isSelected && !isRightAnswer && (
                  <XCircle size={20} className="shrink-0" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {selectedOption !== null && (
        <div className="mt-6 animate-slide-up">
          <Button variant="gradient" size="lg" className="w-full" onClick={handleNext}>
            {currentIndex < words.length - 1 ? (
              <>
                下一题 <ArrowRight size={18} className="ml-2" />
              </>
            ) : (
              "查看结果"
            )}
          </Button>
        </div>
      )}

      {/* Example sentence shown after answering */}
      {selectedOption !== null && currentWord && (
        <Card className="mt-5 border-0 shadow-sm animate-slide-up">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-primary mb-1.5">例句</p>
            <p className="text-sm text-foreground mb-1">{currentWord.example}</p>
            <p className="text-xs text-muted-foreground">{currentWord.exampleTranslation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
