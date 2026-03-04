/**
 * MobileSearchBar — in-book full-text search using foliate-js async search API.
 * Displays result count and up/down navigation.
 */
import { ChevronDown, ChevronUp, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface MobileSearchBarProps {
  onSearch: (query: string) => void;
  onNavigate: (direction: "prev" | "next") => void;
  onClose: () => void;
  currentIndex: number;
  totalResults: number;
  isSearching: boolean;
}

export function MobileSearchBar({
  onSearch,
  onNavigate,
  onClose,
  currentIndex,
  totalResults,
  isSearching,
}: MobileSearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(value.trim());
      }, 300);
    },
    [onSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-background border-b shadow-sm pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t("reader.searchInBook")}
            className="h-9 w-full rounded-lg bg-muted pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Result count */}
        <div className="flex shrink-0 items-center gap-1">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : query && totalResults > 0 ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentIndex + 1} / {totalResults}
            </span>
          ) : query && !isSearching ? (
            <span className="text-xs text-muted-foreground">0</span>
          ) : null}
        </div>

        {/* Nav buttons */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground active:bg-muted disabled:opacity-30"
          onClick={() => onNavigate("prev")}
          disabled={totalResults === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground active:bg-muted disabled:opacity-30"
          onClick={() => onNavigate("next")}
          disabled={totalResults === 0}
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Close */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground active:bg-muted"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
