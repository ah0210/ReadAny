import { Plus, Puzzle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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

export function SkillsPage() {
  return (
    <div className="flex h-full flex-col">
      <header
        className="shrink-0 px-4 pb-3 pt-3 border-b border-border bg-background"
        style={{ paddingTop: "calc(var(--safe-area-top) + 12px)" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">技能</h1>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4" />
            创建
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Built-in skills */}
        <div className="px-4 pt-4">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            内置技能
          </h2>
          <div className="space-y-2">
            {builtinSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm border border-border"
              >
                <span className="text-2xl shrink-0">{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium">{skill.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {skill.description}
                  </p>
                </div>
                <Switch defaultChecked={skill.enabled} />
              </div>
            ))}
          </div>
        </div>

        {/* Custom skills section */}
        <div className="px-4 pt-6 pb-4">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            自定义技能
          </h2>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Puzzle className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              还没有自定义技能，点击右上角创建
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
