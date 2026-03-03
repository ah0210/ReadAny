import { MessageSquare } from "lucide-react";

export function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 px-4 pb-3 pt-3 border-b border-border bg-background">
        <h1 className="text-2xl font-bold">AI 助手</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-lg font-semibold">AI 对话</h2>
        <p className="text-sm text-muted-foreground max-w-[260px]">
          打开一本书后，在阅读器中唤出 AI 助手进行智能对话
        </p>
      </div>
    </div>
  );
}
