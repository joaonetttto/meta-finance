import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, Percent, CheckCircle } from "lucide-react";
import { ScenarioResult, fmt } from "@/lib/projections";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof Shield> = { Shield, BarChart3, Zap };

export function ScenarioCards({
  scenarios,
  valor,
  salario,
}: {
  scenarios: ScenarioResult[];
  valor: number;
  salario: number | null;
}) {
  return (
    <div className={cn(layout.grid, "grid-cols-1 md:grid-cols-3")}>
      {scenarios.map((s) => {
        const Icon = iconMap[s.icon] ?? BarChart3;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              layout.card,
              "relative overflow-hidden",
              s.recommended ? "border-primary ring-1 ring-primary/25" : ""
            )}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: s.color }} />
            <div className={layout.stack}>

            {s.recommended && (
              <span className={cn("absolute top-3 right-3 flex items-center gap-1", type.caption, "font-semibold text-primary")}>
                <CheckCircle className="h-3.5 w-3.5" /> Recomendado
              </span>
            )}

            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" style={{ color: s.color }} />
              <h3 className={type.panelTitle}>{s.label}</h3>
            </div>
            <span className={cn(type.caption, "rounded-full border border-border px-2 py-0.5 inline-block")}>
              {s.tag}
            </span>

            <p className={type.financialLg} style={{ color: s.color }}>
              {fmt(s.pmt)}
              <span className={cn(type.caption, "font-normal")}>/mês</span>
            </p>

            <div className={cn(type.caption, "space-y-1")}>
              <p>{(s.rate * 100).toFixed(0)}% a.a. — {s.desc}</p>
              <p>
                Total investido: <span className={type.financialSm}>{fmt(s.totalInvested)}</span>
              </p>
              <p>
                Rendimento: <span className={cn(type.financialSm, "text-accent")}>{fmt(s.totalRendimento)}</span>{" "}
                ({s.pctRendimento.toFixed(0)}%)
              </p>
            </div>

            {s.reduced && (
              <div className={cn("rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2", type.caption)}>
                <span className="text-destructive font-semibold">-20%:</span>{" "}
                acumula {fmt(s.finalValue)} ao invés de {fmt(valor)}
              </div>
            )}

            {salario && (
              <p className={type.caption}>
                <Percent className="inline h-3 w-3 mr-1" />
                {((s.pmt / salario) * 100).toFixed(1)}% do salário
              </p>
            )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
