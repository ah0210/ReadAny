import { useMemo, useState } from "react";
import { cn } from "@readany/core/utils";
import { Switch } from "@/components/ui/switch";
import {
  ChevronRight,
  Globe,
  Info,
  Palette,
  Settings,
  Database,
  Puzzle,
  Plus,
  BookOpen,
  Clock,
  Flame,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ── Mock data (replace with real stats service later) ── */

const mockOverall = {
  totalBooks: 12,
  totalReadingTime: 2340,
  currentStreak: 7,
  avgDailyTime: 45,
  longestStreak: 14,
};

function generateMockDailyStats() {
  const stats: Array<{ date: string; time: number }> = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    // Random reading: ~40% chance of reading, 0-120 minutes
    const time = Math.random() > 0.6 ? Math.floor(Math.random() * 120) : 0;
    stats.push({ date: dateStr, time });
  }
  return stats;
}

const mockDailyStats = generateMockDailyStats();

/* ── Skills data ── */

const builtinSkills = [
  { id: "summary", name: "智能摘要", icon: "📝", description: "自动生成章节摘要和全书概述", enabled: true },
  { id: "concept", name: "概念解释", icon: "💡", description: "深入解释书中的概念和术语", enabled: true },
  { id: "argument", name: "论证分析", icon: "⚖️", description: "分析论点的逻辑结构和证据", enabled: true },
  { id: "character", name: "人物追踪", icon: "👥", description: "追踪人物关系和发展", enabled: true },
  { id: "quote", name: "金句收藏", icon: "✨", description: "识别和收藏精彩语句", enabled: true },
  { id: "guide", name: "阅读向导", icon: "📖", description: "提供阅读建议和背景知识", enabled: true },
  { id: "translate", name: "翻译", icon: "🌐", description: "多语言翻译", enabled: true },
  { id: "vocabulary", name: "词汇", icon: "📚", description: "生词释义和词汇积累", enabled: true },
];

/* ── Settings menu ── */

const menuSections = [
  {
    title: "通用",
    items: [
      { icon: Palette, label: "外观", path: "/settings/appearance" },
      { icon: Globe, label: "语言", path: "/settings/language" },
    ],
  },
  {
    title: "数据",
    items: [
      { icon: Database, label: "AI 模型", path: "/settings/ai" },
      { icon: Settings, label: "高级设置", path: "/settings/advanced" },
    ],
  },
  {
    title: "关于",
    items: [
      { icon: Info, label: "关于 ReadAny", path: "/settings/about" },
    ],
  },
];

/* ── Main Page ── */

export function ProfilePage() {
  const [skillsExpanded, setSkillsExpanded] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-4 pb-3 pt-3 border-b border-border bg-background">
        <h1 className="text-2xl font-bold">我的</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* ── Reading Stats Cards ── */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<BookOpen className="h-4 w-4" />}
              title="已读"
              value={`${mockOverall.totalBooks}`}
              unit="本"
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              title="总时长"
              value={formatTime(mockOverall.totalReadingTime)}
            />
            <StatCard
              icon={<Flame className="h-4 w-4" />}
              title="连续阅读"
              value={`${mockOverall.currentStreak}`}
              unit="天"
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              title="日均"
              value={formatTime(mockOverall.avgDailyTime)}
            />
          </div>
        </div>

        {/* ── Reading Heatmap ── */}
        <div className="mx-4 mt-4 rounded-xl bg-card border border-border p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            阅读活动
          </h2>
          <MobileHeatmap dailyStats={mockDailyStats} />
          <HeatmapLegend />
        </div>

        {/* ── Skills Section (collapsible) ── */}
        <div className="mx-4 mt-4 rounded-xl bg-card border border-border overflow-hidden">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 active:bg-accent transition-colors"
            onClick={() => setSkillsExpanded(!skillsExpanded)}
          >
            <Puzzle className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-base font-medium text-left">技能管理</span>
            {skillsExpanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </button>

          {skillsExpanded && (
            <div className="border-t border-border">
              {/* Built-in skills */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    内置技能
                  </h3>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground active:scale-95 transition-transform"
                  >
                    <Plus className="h-3 w-3" />
                    创建
                  </button>
                </div>
                <div className="space-y-2">
                  {builtinSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3 rounded-lg bg-background p-3"
                    >
                      <span className="text-xl shrink-0">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{skill.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {skill.description}
                        </p>
                      </div>
                      <Switch defaultChecked={skill.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Settings Menu ── */}
        {menuSections.map((section) => (
          <div key={section.title} className="mt-4 px-4">
            <h2 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h2>
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-accent transition-colors"
                    style={
                      idx < section.items.length - 1
                        ? { borderBottom: "1px solid var(--border)" }
                        : undefined
                    }
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-base">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Version info */}
        <p className="mt-8 mb-6 text-center text-xs text-muted-foreground">
          ReadAny Mobile v1.0.0
        </p>
      </div>
    </div>
  );
}

/* ── Stat Card ── */

function StatCard({
  icon,
  title,
  value,
  unit,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{title}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

/* ── Mobile Heatmap (compact, touch-friendly) ── */

function getHeatColor(minutes: number): string {
  if (minutes <= 0) return "bg-neutral-100";
  if (minutes < 15) return "bg-emerald-200";
  if (minutes < 30) return "bg-emerald-400";
  if (minutes < 60) return "bg-emerald-500";
  return "bg-emerald-700";
}

function MobileHeatmap({ dailyStats }: { dailyStats: Array<{ date: string; time: number }> }) {
  const cellSize = 10;
  const gap = 2;
  const unit = cellSize + gap;

  const { weeks, monthLabels } = useMemo(() => {
    const statsMap = new Map<string, number>();
    for (const s of dailyStats) {
      statsMap.set(s.date, s.time);
    }

    const today = new Date();
    const todayDay = today.getDay();
    // Show ~6 months on mobile for compact display
    const totalWeeks = 26;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (totalWeeks * 7 + todayDay - 1));

    const weeksArr: Array<Array<{ date: string; time: number; dayOfWeek: number }>> = [];
    const mLabels: Array<{ label: string; col: number }> = [];
    let currentWeek: Array<{ date: string; time: number; dayOfWeek: number }> = [];
    let lastMonth = -1;
    let weekIdx = 0;

    const cursor = new Date(startDate);

    while (cursor <= today) {
      const dateStr = cursor.toISOString().split("T")[0];
      const dow = cursor.getDay();
      const month = cursor.getMonth();

      if (dow === 0 && currentWeek.length > 0) {
        weeksArr.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }

      if (month !== lastMonth) {
        const monthName = cursor.toLocaleDateString("zh-CN", { month: "short" });
        mLabels.push({ label: monthName, col: weekIdx });
        lastMonth = month;
      }

      currentWeek.push({
        date: dateStr,
        time: statsMap.get(dateStr) || 0,
        dayOfWeek: dow,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    if (currentWeek.length > 0) weeksArr.push(currentWeek);

    return { weeks: weeksArr, monthLabels: mLabels };
  }, [dailyStats]);

  return (
    <div className="w-full overflow-x-auto">
      {/* Month labels */}
      <div className="flex" style={{ paddingLeft: "0px" }}>
        {monthLabels.map((m, i) => {
          const nextCol = i + 1 < monthLabels.length ? monthLabels[i + 1].col : weeks.length;
          const span = nextCol - m.col;
          return (
            <div
              key={`${m.label}-${m.col}`}
              className="text-[10px] text-muted-foreground"
              style={{ width: `${span * unit}px`, minWidth: `${span * unit}px` }}
            >
              {span >= 2 ? m.label : ""}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex" style={{ gap: `${gap}px` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: `${gap}px` }}>
            {week[0] && week[0].dayOfWeek > 0 && wi === 0 &&
              Array.from({ length: week[0].dayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: `${cellSize}px`, width: `${cellSize}px` }} />
              ))}
            {week.map((day) => (
              <div
                key={day.date}
                className={cn("rounded-[2px]", getHeatColor(day.time))}
                style={{ height: `${cellSize}px`, width: `${cellSize}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapLegend() {
  return (
    <div className="mt-2.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
      <span>少</span>
      <div className="h-[10px] w-[10px] rounded-[2px] bg-neutral-100" />
      <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-200" />
      <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-400" />
      <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500" />
      <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-700" />
      <span>多</span>
    </div>
  );
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
}
