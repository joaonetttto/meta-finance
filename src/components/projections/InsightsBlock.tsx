import { TrendingUp, Shield, Lightbulb, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Insight } from "@/lib/projections";

const iconMap: Record<string, typeof Lightbulb> = {
  TrendingUp, Shield, Lightbulb, Clock, DollarSign,
};

export function InsightsBlock({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-accent" /> Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {insights.map((ins, i) => {
            const Icon = iconMap[ins.icon] ?? Lightbulb;
            return (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{ins.text}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
