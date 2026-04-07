import { motion } from "framer-motion";
import { Sparkles, ArrowUp, CheckCircle } from "lucide-react";
import { Recommendation } from "@/lib/projections";

export function RecommendationBlock({ rec }: { rec: Recommendation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border-2 border-primary bg-primary/5 p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold tracking-ui">Melhor estratégia para você</h3>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-primary-foreground"
            style={{ background: rec.color }}
          >
            {rec.sufficient ? <CheckCircle className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
            {rec.scenarioLabel}
          </span>
        </div>

        <p className="text-lg font-semibold">{rec.action}</p>
        <p className="text-sm text-muted-foreground">{rec.detail}</p>
      </div>
    </motion.div>
  );
}
