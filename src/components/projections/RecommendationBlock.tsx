import { motion } from "framer-motion";
import { Sparkles, ArrowUp, CheckCircle, TrendingUp } from "lucide-react";
import { Recommendation, fmt } from "@/lib/projections";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";

export function RecommendationBlock({ rec }: { rec: Recommendation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={layout.card}
    >
      <div className={cn("relative", layout.stack)}>
        {/* Line 1: Recommended scenario */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-primary-foreground"
            style={{ background: rec.color }}
          >
            {rec.sufficient ? <CheckCircle className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            {rec.scenarioLabel}
          </span>
          <span className={cn("flex items-center gap-1", type.caption)}>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Melhor estratégia
          </span>
        </div>

        {/* Line 2: Clear action (value) */}
        <p className={cn(type.financial, "font-bold")}>{rec.action}</p>

        {rec.benefit && (
          <p className={cn(type.body, "font-medium text-accent")}>{rec.benefit}</p>
        )}

        {/* Line 4: Comparisons as compact chips — only concrete data */}
        {rec.comparisons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rec.comparisons.map((c) => {
              if (!c.text) return null;
              return (
                <span
                  key={c.key}
                  className={cn("inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary", type.caption)}
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
