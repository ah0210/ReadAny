import { Outlet } from "react-router";
import { BottomTabBar } from "./BottomTabBar";

export function MobileLayout() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <BottomTabBar />
    </div>
  );
}
