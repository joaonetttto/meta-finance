import { motion } from "framer-motion";
import { Sparkles, ArrowUp, CheckCircle, TrendingUp } from "lucide-react";
import { Recommendation, fmt } from "@/lib/projections";

export function RecommendationBlock({ rec }: { rec: Recommendation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border-2 border-primary bg-primary/5 p-5 sm:p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="relative z-10 space-y-3">
        {/* Line 1: Recommended scenario */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-primary-foreground"
            style={{ background: rec.color }}
          >
            {rec.sufficient ? <CheckCircle className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            {rec.scenarioLabel}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Melhor estratégia
          </span>
        </div>

        {/* Line 2: Clear action (value) */}
        <p className="text-lg font-bold leading-tight">{rec.action}</p>

        {/* Line 3: Benefit */}
        {rec.benefit && (
          <p className="text-sm font-medium text-accent">{rec.benefit}</p>
        )}

        {/* Line 4: Comparisons as compact chips — only concrete data */}
        {rec.comparisons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rec.comparisons.map((c) => {
              if (!c.text) return null;
              return (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  <TrendingUp className="h-3 w-3" />
                  {c.text}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
