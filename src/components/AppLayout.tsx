import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <main className="relative flex-1 overflow-auto bg-background">
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 md:px-6 md:pb-8">
          <div className="min-h-[calc(100vh-2rem)] rounded-xl border border-border bg-card p-6 md:min-h-[calc(100vh-3rem)] md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
