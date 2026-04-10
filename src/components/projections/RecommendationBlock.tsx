import { motion } from "framer-motion";
import { Sparkles, ArrowUp, CheckCircle, TrendingUp } from "lucide-react";
import { Recommendation, fmt } from "@/lib/projections";

export function RecommendationBlock({ rec }: { rec: Recommendation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border-2 border-primary bg-primary/5 p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="relative z-10 space-y-4">
        {/* Line 1: Recommended scenario */}
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-primary-foreground"
            style={{ background: rec.color }}
          >
            {rec.sufficient ? <CheckCircle className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            {rec.scenarioLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Melhor estratégia</span>
          </div>
        </div>

        {/* Line 2: Clear action */}
        <p className="text-lg font-bold leading-tight">{rec.action}</p>

        {/* Line 3: Comparisons as compact chips */}
        {rec.comparisons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rec.comparisons.map((c) => {
              let text = "";
              if (c.yearsDiff > 0.5) {
                text = `${c.yearsDiff.toFixed(1)} anos mais rápido que ${c.label}`;
              } else if (c.valueDiff > 0) {
                text = `${fmt(c.valueDiff)} a mais que ${c.label}`;
              } else if (c.yearsDiff < -0.5) {
                text = `${c.label}: ${Math.abs(c.yearsDiff).toFixed(1)} anos a mais, menor risco`;
              } else {
                text = `${c.label}: resultado similar, perfil diferente`;
              }
              return (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  <TrendingUp className="h-3 w-3" />
                  {text}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
