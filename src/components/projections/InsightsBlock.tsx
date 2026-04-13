import { TrendingUp, Shield, Lightbulb, Clock, DollarSign, Zap, AlertTriangle, Sparkles } from "lucide-react";
import { Insight } from "@/lib/projections";

const iconMap: Record<string, typeof Lightbulb> = {
  TrendingUp, Shield, Lightbulb, Clock, DollarSign, Zap, AlertTriangle, Sparkles,
};

export function InsightsBlock({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold">Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.slice(0, 5).map((ins, i) => {
          const Icon = iconMap[ins.icon] ?? Lightbulb;
          return (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{ins.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
