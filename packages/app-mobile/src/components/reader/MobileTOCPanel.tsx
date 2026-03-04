/**
 * MobileTOCPanel — bottom sheet TOC with tree structure.
 */
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { MobileTOCItem } from "./MobileFoliateViewer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface MobileTOCPanelProps {
  tocItems: MobileTOCItem[];
  currentChapter: string;
  onGoToChapter: (href: string) => void;
  onClose: () => void;
}

export function MobileTOCPanel({ tocItems, currentChapter, onGoToChapter, onClose }: MobileTOCPanelProps) {
  const { t } = useTranslation();

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">{t("reader.toc")}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto pb-8" style={{ maxHeight: "calc(70vh - 80px)" }}>
          {tocItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("reader.noToc")}</p>
          ) : (
            <div className="space-y-0.5">
              {tocItems.map((item) => (
                <TOCTreeItem
                  key={item.id}
                  item={item}
                  currentChapter={currentChapter}
                  onSelect={onGoToChapter}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TOCTreeItem({
  item,
  currentChapter,
  onSelect,
}: {
  item: MobileTOCItem;
  currentChapter: string;
  onSelect: (href: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.subitems && item.subitems.length > 0;
  const isCurrent = item.title === currentChapter;

  return (
    <div>
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors active:bg-muted ${
          isCurrent ? "bg-primary/10 font-medium text-primary" : "text-foreground"
        }`}
        style={{ paddingLeft: `${12 + item.level * 16}px` }}
        onClick={() => {
          if (item.href) onSelect(item.href);
        }}
      >
        {hasChildren && (
          <button
            type="button"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}
        {!hasChildren && <span className="w-5 shrink-0" />}
        <span className="truncate">{item.title}</span>
      </button>

      {expanded && hasChildren && (
        <div>
          {item.subitems!.map((child) => (
            <TOCTreeItem key={child.id} item={child} currentChapter={currentChapter} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
