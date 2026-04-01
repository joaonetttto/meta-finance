import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, ArrowLeftRight, Target, TrendingUp, CreditCard, User, LogOut, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transacoes", icon: ArrowLeftRight, label: "Transações" },
  { to: "/metas", icon: Target, label: "Metas" },
  { to: "/projecoes", icon: TrendingUp, label: "Projeções" },
  { to: "/planos", icon: CreditCard, label: "Planos" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar">
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <h1 className="font-display text-lg font-bold text-white">
          Meta<span className="text-primary">Finance</span>
        </h1>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium tracking-ui transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-white shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white/90"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 mx-3 mb-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-border">
        <p className="text-xs text-sidebar-foreground mb-2">Plano Gratuito</p>
        <div className="h-1 w-full rounded-full bg-sidebar-border overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-accent" />
        </div>
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium tracking-ui text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white/90 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
