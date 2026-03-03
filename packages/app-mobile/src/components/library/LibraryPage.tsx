import { BookOpen, Plus, Search } from "lucide-react";
import { useState } from "react";

export function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="shrink-0 px-4 pb-3 pt-3 bg-background">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">书库</h1>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索书籍..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg bg-muted pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </header>

      {/* Book grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">还没有书籍</h2>
          <p className="mb-6 text-sm text-muted-foreground max-w-[240px]">
            点击右上角的 + 按钮导入你的第一本书
          </p>
        </div>
      </div>
    </div>
  );
}
