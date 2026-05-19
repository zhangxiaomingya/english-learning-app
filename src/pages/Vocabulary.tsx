import { useState, useMemo } from "react";
import { Search, Volume2, Bookmark, BookmarkCheck, Library, ChevronDown, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { vocabularyData, type Word } from "@/data/vocabulary";
import { cn } from "@/lib/utils";
import { useStorage } from "@/hooks/useStorage";

function speak(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

type LevelFilter = "All" | Word["level"];

export default function Vocabulary() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useStorage<string[]>("vocab-favorites", []);

  const filteredWords = useMemo(() => {
    return vocabularyData.filter((w) => {
      const matchLevel = levelFilter === "All" || w.level === levelFilter;
      const matchSearch =
        search.trim() === "" ||
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.meaning.includes(search);
      return matchLevel && matchSearch;
    });
  }, [search, levelFilter]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const levels: { label: string; value: LevelFilter; color: string }[] = [
    { label: "全部", value: "All", color: "bg-primary/10 text-primary" },
    { label: "四级", value: "CET-4", color: "bg-sky-100 text-sky-700" },
    { label: "六级", value: "CET-6", color: "bg-violet-100 text-violet-700" },
    { label: "雅思", value: "IELTS", color: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="px-5 pt-4 pb-28 animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <Library size={22} className="text-primary" />
        <h2 className="text-xl font-bold">词库</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          共 {filteredWords.length} 词
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索单词或释义..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Level Filters */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        <Filter size={14} className="text-muted-foreground shrink-0" />
        {levels.map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => setLevelFilter(lvl.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              levelFilter === lvl.value ? lvl.color + " ring-2 ring-offset-1 ring-primary/20" : "bg-muted text-muted-foreground"
            )}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Word List */}
      <div className="space-y-3">
        {filteredWords.map((word) => {
          const isExpanded = expandedId === word.id;
          const isFav = favorites.includes(word.id);

          return (
            <Card
              key={word.id}
              className={cn(
                "border-0 shadow-sm transition-all duration-200",
                isExpanded && "ring-1 ring-primary/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-base font-bold cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : word.id)}
                      >
                        {word.word}
                      </h3>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                          word.level === "CET-4" && "bg-sky-100 text-sky-700",
                          word.level === "CET-6" && "bg-violet-100 text-violet-700",
                          word.level === "IELTS" && "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {word.level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{word.phonetic}</p>
                    <p className="text-sm text-foreground">{word.meaning}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => speak(word.word)}
                      className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Volume2 size={15} className="text-primary" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(word.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    >
                      {isFav ? (
                        <BookmarkCheck size={15} className="text-primary" />
                      ) : (
                        <Bookmark size={15} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border animate-slide-up">
                    <p className="text-xs text-muted-foreground mb-1">例句</p>
                    <p className="text-sm text-foreground mb-1">{word.example}</p>
                    <p className="text-xs text-muted-foreground">{word.exampleTranslation}</p>
                  </div>
                )}

                {!isExpanded && (
                  <button
                    onClick={() => setExpandedId(word.id)}
                    className="flex items-center gap-1 mt-2 text-xs text-muted-foreground"
                  >
                    <ChevronDown size={14} />
                    展开例句
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-12">
          <Library size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">未找到匹配的单词</p>
        </div>
      )}
    </div>
  );
}
