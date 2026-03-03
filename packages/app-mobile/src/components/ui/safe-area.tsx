import type { ReactNode } from "react";
import { cn } from "@readany/core/utils";

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

export function SafeArea({
  children,
  className,
  top = true,
  bottom = true,
  left = true,
  right = true,
}: SafeAreaProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{
        paddingTop: top ? "var(--safe-area-top)" : undefined,
        paddingBottom: bottom ? "var(--safe-area-bottom)" : undefined,
        paddingLeft: left ? "var(--safe-area-left)" : undefined,
        paddingRight: right ? "var(--safe-area-right)" : undefined,
      }}
    >
      {children}
    </div>
  );
}
