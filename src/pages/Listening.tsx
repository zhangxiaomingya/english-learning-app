import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Repeat, Volume2, ChevronLeft, Languages,
  Headphones, Clock, BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  listeningPassages,
  PASSAGE_TYPE_LABELS,
  type ListeningPassage,
  type PassageType,
} from "@/data/listening_passages";

// ─── TTS Player Hook ──────────────────────────────────────────────────────────

function usePassagePlayer(passage: ListeningPassage | null, rate: number, isLooping: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const cancelledRef = useRef(false);
  const currentIdxRef = useRef(0);

  // Sync ref with state
  useEffect(() => {
    currentIdxRef.current = currentSentenceIdx;
  }, [currentSentenceIdx]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  const playSentence = useCallback(
    (idx: number, sentences: string[]) => {
      if (cancelledRef.current) return;
      if (idx >= sentences.length) {
        if (isLooping) {
          setCurrentSentenceIdx(0);
          playSentence(0, sentences);
        } else {
          setIsPlaying(false);
          setCurrentSentenceIdx(0);
        }
        return;
      }
      const utterance = new SpeechSynthesisUtterance(sentences[idx]);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.onstart = () => {
        if (!cancelledRef.current) setCurrentSentenceIdx(idx);
      };
      utterance.onend = () => {
        if (!cancelledRef.current) playSentence(idx + 1, sentences);
      };
      utterance.onerror = () => {
        if (!cancelledRef.current) setIsPlaying(false);
      };
      window.speechSynthesis.speak(utterance);
    },
    [rate, isLooping]
  );

  const play = useCallback(() => {
    if (!passage) return;
    cancelledRef.current = false;
    setIsPlaying(true);
    playSentence(currentIdxRef.current, passage.sentences);
  }, [passage, playSentence]);

  const pause = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, []);

  const restart = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setCurrentSentenceIdx(0);
    currentIdxRef.current = 0;
    setTimeout(() => {
      if (!passage) return;
      cancelledRef.current = false;
      setIsPlaying(true);
      playSentence(0, passage.sentences);
    }, 100);
  }, [passage, playSentence]);

  const playSingle = useCallback(
    (idx: number) => {
      if (!passage) return;
      window.speechSynthesis?.cancel();
      setCurrentSentenceIdx(idx);
      const utterance = new SpeechSynthesisUtterance(passage.sentences[idx]);
      utterance.lang = "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    },
    [passage, rate]
  );

  // Stop playback when passage changes
  useEffect(() => {
    stop();
    setCurrentSentenceIdx(0);
  }, [passage, stop]);

  // When rate changes mid-play, restart from current sentence
  const prevRateRef = useRef(rate);
  useEffect(() => {
    if (prevRateRef.current !== rate) {
      prevRateRef.current = rate;
      if (isPlaying && passage) {
        cancelledRef.current = true;
        window.speechSynthesis?.cancel();
        const idx = currentIdxRef.current;
        setTimeout(() => {
          cancelledRef.current = false;
          playSentence(idx, passage.sentences);
        }, 100);
      }
    }
  }, [rate, isPlaying, passage, playSentence]);

  return { isPlaying, currentSentenceIdx, play, pause, restart, playSingle, stop };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATES = [0.6, 0.8, 1.0, 1.2] as const;
type Rate = (typeof RATES)[number];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const TYPE_COLORS: Record<PassageType, string> = {
  TED: "bg-red-50 text-red-600 border-red-200",
  Celebrity: "bg-violet-50 text-violet-600 border-violet-200",
  Broadcast: "bg-sky-50 text-sky-600 border-sky-200",
  Daily: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}分${s > 0 ? s + "秒" : ""}` : `${s}秒`;
}

// ─── Passage List ─────────────────────────────────────────────────────────────

function PassageList({ onSelect }: { onSelect: (p: ListeningPassage) => void }) {
  const [filter, setFilter] = useState<PassageType | "All">("All");

  const filtered =
    filter === "All" ? listeningPassages : listeningPassages.filter((p) => p.type === filter);

  const filterTabs: Array<PassageType | "All"> = ["All", "TED", "Celebrity", "Broadcast", "Daily"];
  const filterLabels: Record<PassageType | "All", string> = {
    All: "全部",
    ...PASSAGE_TYPE_LABELS,
  };

  return (
    <div className="px-5 pt-4 pb-28 animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Headphones size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">听力练习</h2>
          <p className="text-xs text-muted-foreground">选择一篇开始听</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {filterTabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === t
                ? "bg-primary text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {filterLabels[t]}
          </button>
        ))}
      </div>

      {/* Passage Cards */}
      <div className="space-y-3">
        {filtered.map((passage) => (
          <Card
            key={passage.id}
            className="border-0 shadow-sm active:scale-98 transition-transform cursor-pointer"
            onClick={() => onSelect(passage)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[passage.type]}`}
                    >
                      {PASSAGE_TYPE_LABELS[passage.type]}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLE[passage.difficulty]}`}
                    >
                      {passage.difficulty}
                    </span>
                  </div>
                  <p className="font-semibold text-sm leading-snug mb-1">{passage.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{passage.source}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={11} />
                    <span>{formatDuration(passage.estimatedDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BookOpen size={11} />
                    <span>{passage.sentences.length}句</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Passage Player ───────────────────────────────────────────────────────────

function PassagePlayer({
  passage,
  onBack,
}: {
  passage: ListeningPassage;
  onBack: () => void;
}) {
  const [rate, setRate] = useState<Rate>(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { isPlaying, currentSentenceIdx, play, pause, restart, playSingle } =
    usePassagePlayer(passage, rate, isLooping);

  // Auto-scroll to active sentence
  useEffect(() => {
    const el = sentenceRefs.current[currentSentenceIdx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentSentenceIdx]);

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => { onBack(); }}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight truncate">{passage.title}</p>
          <p className="text-xs text-muted-foreground truncate">{passage.source}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${DIFFICULTY_STYLE[passage.difficulty]}`}>
          {passage.difficulty}
        </span>
      </div>

      {/* Controls Card */}
      <div className="px-4 mb-3 shrink-0">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            {/* Rate selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground mr-1">语速</span>
              {RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(r)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    rate === r
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={restart}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
              >
                <RotateCcw size={18} className="text-muted-foreground" />
              </button>

              <button
                onClick={isPlaying ? pause : play}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause size={26} className="text-white" />
                ) : (
                  <Play size={26} className="text-white ml-1" />
                )}
              </button>

              <button
                onClick={() => setIsLooping((v) => !v)}
                className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
                  isLooping ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                <Repeat size={18} />
              </button>
            </div>

            {/* Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>第 {currentSentenceIdx + 1} / {passage.sentences.length} 句</span>
                <span>{Math.round(((currentSentenceIdx + 1) / passage.sentences.length) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSentenceIdx + 1) / passage.sentences.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Toggle translation */}
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full mb-3 transition-all ${
            showTranslation ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Languages size={13} />
          {showTranslation ? "隐藏译文" : "显示译文"}
        </button>

        <div className="space-y-2 pb-4">
          {passage.sentences.map((sentence, idx) => {
            const isActive = idx === currentSentenceIdx;
            return (
              <div
                key={idx}
                ref={(el) => { sentenceRefs.current[idx] = el; }}
                className={`rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 border-l-4 border-primary"
                    : "bg-card border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground mt-0.5 shrink-0 w-5 text-right">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${isActive ? "text-primary font-medium" : "text-foreground"}`}>
                      {sentence}
                    </p>
                    {showTranslation && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed animate-slide-up">
                        {passage.translations[idx]}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => playSingle(idx)}
                    className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform mt-0.5"
                  >
                    <Volume2 size={13} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Listening() {
  const [selectedPassage, setSelectedPassage] = useState<ListeningPassage | null>(null);

  if (selectedPassage) {
    return (
      <PassagePlayer
        passage={selectedPassage}
        onBack={() => setSelectedPassage(null)}
      />
    );
  }

  return <PassageList onSelect={setSelectedPassage} />;
}
