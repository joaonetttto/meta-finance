import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <main className="relative flex-1 overflow-auto bg-background">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/12 via-primary/5 to-transparent" />
          <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl p-4 pb-24 md:p-6 md:pb-6">
          <div className="min-h-[calc(100vh-2rem)] rounded-[28px] border border-border/60 bg-card/55 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl md:min-h-[calc(100vh-3rem)] md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
