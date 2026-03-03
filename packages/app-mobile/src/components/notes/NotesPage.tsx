import { NotebookPen } from "lucide-react";

export function NotesPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-4 pb-3 pt-3 border-b border-border bg-background">
        <h1 className="text-2xl font-bold">笔记</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <NotebookPen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-lg font-semibold">还没有笔记</h2>
        <p className="text-sm text-muted-foreground max-w-[260px]">
          阅读时选中文字添加高亮和笔记，所有笔记都会在这里汇总
        </p>
      </div>
    </div>
  );
}
