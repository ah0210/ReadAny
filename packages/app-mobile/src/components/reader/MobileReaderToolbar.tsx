/**
 * MobileReaderToolbar — top bar with back, title, TOC, settings.
 * Slides in/out based on visibility.
 */
import { ArrowLeft, List, Search, Settings } from "lucide-react";

interface MobileReaderToolbarProps {
  visible: boolean;
  title: string;
  chapterTitle: string;
  onBack: () => void;
  onToggleToc: () => void;
  onToggleSettings: () => void;
  onToggleSearch: () => void;
}

export function MobileReaderToolbar({
  visible,
  title,
  chapterTitle,
  onBack,
  onToggleToc,
  onToggleSettings,
  onToggleSearch,
}: MobileReaderToolbarProps) {
  return (
    <header
      className={`absolute top-0 left-0 right-0 z-30 transition-transform duration-200 ease-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Gradient bg for readability */}
      <div className="bg-gradient-to-b from-black/60 to-transparent pb-6 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Back */}
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white active:bg-white/20"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{title}</p>
            {chapterTitle && (
              <p className="truncate text-xs text-white/70">{chapterTitle}</p>
            )}
          </div>

          {/* TOC */}
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white active:bg-white/20"
            onClick={onToggleToc}
          >
            <List className="h-5 w-5" />
          </button>

          {/* Search */}
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white active:bg-white/20"
            onClick={onToggleSearch}
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white active:bg-white/20"
            onClick={onToggleSettings}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
