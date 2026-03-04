/**
 * MobileFooterBar — bottom bar with page info, progress slider, nav buttons.
 * Slides in/out based on visibility.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileFooterBarProps {
  visible: boolean;
  progress: number;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onSliderChange: (value: number) => void;
}

export function MobileFooterBar({
  visible,
  progress,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onSliderChange,
}: MobileFooterBarProps) {
  const percent = Math.round(progress * 100);

  return (
    <footer
      className={`absolute bottom-0 left-0 right-0 z-30 transition-transform duration-200 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-gradient-to-t from-black/60 to-transparent pt-6 pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 pb-2">
          {/* Page info */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-white/70">
              {currentPage > 0 && totalPages > 0
                ? `${currentPage} / ${totalPages}`
                : ""}
            </span>
            <span className="text-xs text-white/70">{percent}%</span>
          </div>

          {/* Slider + nav */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white active:bg-white/20"
              onClick={onPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="relative flex-1 py-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={progress}
                onChange={(e) => onSliderChange(Number.parseFloat(e.target.value))}
                className="w-full accent-white h-1 appearance-none rounded-full bg-white/30
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
              />
            </div>

            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white active:bg-white/20"
              onClick={onNext}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
