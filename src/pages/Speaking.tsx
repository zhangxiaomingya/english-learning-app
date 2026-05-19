import { useState, useCallback, useEffect } from "react";
import { Volume2, Mic, MicOff, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomWords } from "@/data/vocabulary";
import { useStudyProgress } from "@/hooks/useStorage";
import { cn } from "@/lib/utils";

function speak(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.75;
    window.speechSynthesis.speak(utterance);
  }
}

export default function Speaking() {
  const [words] = useState(() => getRandomWords(15));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "partial" | "incorrect" | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const { recordStudy } = useStudyProgress();

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (currentWord && !finished) {
      setTranscript("");
      setFeedback(null);
      setIsListening(false);
    }
  }, [currentWord, finished]);

  const handleListen = useCallback(() => {
    if (!currentWord) return;
    speak(currentWord.example);
  }, [currentWord]);

  const handleStartRecognition = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      // Fallback: simulate recognition
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setTranscript("simulated");
        setFeedback("partial");
      }, 2000);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);

      if (currentWord) {
        const target = currentWord.example.toLowerCase().replace(/[^a-z\s]/g, "");
        const input = result.toLowerCase().replace(/[^a-z\s]/g, "");
        const targetWords = target.split(/\s+/);
        const inputWords = input.split(/\s+/);
        const matched = targetWords.filter((w: string) => inputWords.includes(w)).length;
        const ratio = matched / targetWords.length;

        if (ratio >= 0.7) {
          setFeedback("correct");
          setScore((s) => s + 1);
          recordStudy(true, currentWord.word);
        } else if (ratio >= 0.4) {
          setFeedback("partial");
          recordStudy(false, currentWord.word);
        } else {
          setFeedback("incorrect");
          recordStudy(false, currentWord.word);
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      // Simulate on error for demo
      setTranscript("I could not hear clearly");
      setFeedback("partial");
    };

    recognition.start();
  }, [currentWord, recordStudy]);

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
    setTranscript("");
    setFeedback(null);
  }, []);

  if (finished) {
    const accuracy = Math.round((score / words.length) * 100);
    return (
      <div className="px-5 pt-6 pb-28 animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mic size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">口语练习完成！</h2>
          <p className="text-muted-foreground">
            优秀朗读 {score}/{words.length} 句
          </p>
        </div>

        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">优秀率</p>
            <p className="text-4xl font-bold gradient-text mb-2">{accuracy}%</p>
            <div className="w-full bg-muted rounded-full h-2.5 mt-3">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
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
        <h2 className="text-xl font-bold">口语练习</h2>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5 mb-8">
        <div
          className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Sentence Card */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">{currentWord?.example}</p>
              <p className="text-sm text-muted-foreground">{currentWord?.exampleTranslation}</p>
            </div>
            <button
              onClick={handleListen}
              className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Volume2 size={20} className="text-primary" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Record Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleStartRecognition}
          disabled={isListening || feedback !== null}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all duration-300 shadow-md",
            isListening
              ? "bg-destructive/10 animate-pulse-soft"
              : feedback === null
              ? "bg-gradient-to-br from-emerald-400 to-emerald-500 active:scale-90"
              : feedback === "correct"
              ? "bg-success"
              : "bg-warning"
          )}
        >
          {isListening ? (
            <MicOff size={32} className="text-destructive" />
          ) : feedback === "correct" ? (
            <CheckCircle2 size={32} className="text-white" />
          ) : (
            <Mic size={32} className="text-white" />
          )}
        </button>
        <p className="text-xs text-muted-foreground mt-3">
          {isListening ? "正在聆听..." : feedback === null ? "按住朗读句子" : ""}
        </p>
      </div>

      {/* Transcript */}
      {transcript && (
        <Card className={cn("mb-5 border-0 animate-slide-up", feedback === "correct" ? "bg-success/5" : "bg-warning/5")}>
          <CardContent className="p-4">
            <p className="text-xs font-medium mb-1 text-muted-foreground">识别结果</p>
            <p className="text-sm text-foreground">{transcript}</p>
            {feedback === "correct" && (
              <p className="text-xs text-success font-medium mt-2">发音准确，很棒！</p>
            )}
            {feedback === "partial" && (
              <p className="text-xs text-warning font-medium mt-2">部分正确，继续加油！</p>
            )}
            {feedback === "incorrect" && (
              <p className="text-xs text-destructive font-medium mt-2">需要多练习哦，再试一次！</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {feedback !== null && (
        <div className="animate-slide-up">
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
    </div>
  );
}
