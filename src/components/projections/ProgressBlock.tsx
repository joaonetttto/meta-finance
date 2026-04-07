import { Progress } from "@/components/ui/progress";
import { fmt, getProgressStatus, calcFV, calcYearsNeeded } from "@/lib/projections";

export function ProgressBlock({
  valor,
  anos,
  aporteManual,
  recommendedRate,
  recommendedPmt,
}: {
  valor: number;
  anos: number;
  aporteManual: number;
  recommendedRate: number;
  recommendedPmt: number;
}) {
  const status = getProgressStatus(aporteManual, recommendedPmt);
  const accumulated = 0; // future: pull from real data
  const pct = valor > 0 ? Math.min((accumulated / valor) * 100, 100) : 0;
  const remaining = valor - accumulated;

  // Estimate time remaining based on aporte
  let tempoRestante = "";
  if (aporteManual > 0) {
    const yrs = calcYearsNeeded(remaining, aporteManual, recommendedRate);
    tempoRestante = yrs === Infinity ? "∞" : `${yrs.toFixed(1)} anos restantes`;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progresso da meta</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: status.color, borderColor: status.color }}>
          {status.label}
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Acumulado: <span className="font-mono-nums font-semibold text-foreground">{fmt(accumulated)}</span></span>
        <span>Faltam: <span className="font-mono-nums font-semibold text-foreground">{fmt(remaining)}</span></span>
      </div>
      {tempoRestante && (
        <p className="text-xs text-muted-foreground">Tempo estimado: <span className="font-semibold text-primary">{tempoRestante}</span></p>
      )}

      {aporteManual > 0 && aporteManual < recommendedPmt && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs">
          Com {fmt(aporteManual)}/mês você não atinge a meta em {anos} anos.{" "}
          <span className="font-semibold text-destructive">Precisa de +{fmt(recommendedPmt - aporteManual)}/mês.</span>
        </div>
      )}
    </div>
  );
}
