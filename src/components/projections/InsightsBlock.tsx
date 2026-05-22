import { TrendingUp, Shield, Lightbulb, Clock, DollarSign, Zap, AlertTriangle, Sparkles } from "lucide-react";
import { Insight } from "@/lib/projections";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof Lightbulb> = {
  TrendingUp, Shield, Lightbulb, Clock, DollarSign, Zap, AlertTriangle, Sparkles,
};

export function InsightsBlock({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;

  return (
    <div className={layout.card}>
      <div className={layout.stack}>
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-accent" />
        <h3 className={type.panelTitle}>Insights</h3>
      </div>
      <div className="space-y-2">
        {insights.slice(0, 5).map((ins, i) => {
          const Icon = iconMap[ins.icon] ?? Lightbulb;
          return (
            <div key={i} className={cn("flex items-start gap-2", type.body)}>
              <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className={type.bodyMuted}>{ins.text}</span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
