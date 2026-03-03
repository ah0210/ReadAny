import { cn } from "@readany/core/utils";
import {
  BookOpen,
  MessageSquare,
  NotebookPen,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";

interface TabItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  { path: "/library", label: "书库", icon: BookOpen },
  { path: "/chat", label: "AI", icon: MessageSquare },
  { path: "/notes", label: "笔记", icon: NotebookPen },
  { path: "/profile", label: "我的", icon: User },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab =
    tabs.find((t) => location.pathname.startsWith(t.path))?.path ?? "/library";

  return (
    <nav className="flex shrink-0 items-end border-t border-border bg-background/95 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground active:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
