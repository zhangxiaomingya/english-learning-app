import { Home, Headphones, Mic, BookOpen, PenLine, Library } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "首页", icon: Home },
  { id: "listening", label: "听力", icon: Headphones },
  { id: "speaking", label: "口语", icon: Mic },
  { id: "reading", label: "阅读", icon: BookOpen },
  { id: "writing", label: "写作", icon: PenLine },
  { id: "vocabulary", label: "词库", icon: Library },
];

export default function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-md">
        <div className="glass-card border-t border-border/50 safe-area-bottom">
          <div className="flex items-center justify-around px-1 pt-2 pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 min-w-[56px]",
                    isActive
                      ? "text-primary scale-105"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-xl transition-all duration-200",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all",
                      isActive && "font-semibold"
                    )}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
