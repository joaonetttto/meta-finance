import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Target, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Início" },
  { to: "/transacoes", icon: ArrowLeftRight, label: "Transações" },
  { to: "/metas", icon: Target, label: "Metas" },
  { to: "/projecoes", icon: TrendingUp, label: "Projeções" },
  { to: "/perfil", icon: User, label: "Perfil" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-sidebar md:hidden">
      {links.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-sidebar-foreground"
            )}
          >
            <div className={cn(
              "rounded-md p-1.5 transition-colors",
              active && "bg-primary/10"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
