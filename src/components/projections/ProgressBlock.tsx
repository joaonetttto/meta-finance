import { Progress } from "@/components/ui/progress";
import { fmt, getProgressStatus, calcYearsNeeded } from "@/lib/projections";

export function ProgressBlock({
  valor,
  anos,
  aporteManual,
  recommendedRate,
  recommendedPmt,
  valorInicial = 0,
}: {
  valor: number;
  anos: number;
  aporteManual: number;
  recommendedRate: number;
  recommendedPmt: number;
  valorInicial?: number;
}) {
  const status = getProgressStatus(aporteManual, recommendedPmt);
  const accumulated = valorInicial;
  const pct = valor > 0 ? Math.min((accumulated / valor) * 100, 100) : 0;
  const remaining = valor - accumulated;

  // Estimate time remaining based on aporte
  let tempoRestante = "";
  if (aporteManual > 0) {
    const yrs = calcYearsNeeded(valor, aporteManual, recommendedRate, valorInicial);
    tempoRestante = yrs === Infinity ? "∞" : `${yrs.toFixed(1)} anos restantes`;
  }

  // Feedback messages based on status
  let feedbackMsg = "";
  if (aporteManual > 0 && recommendedPmt > 0) {
    const ratio = aporteManual / recommendedPmt;
    if (ratio >= 1.1) {
      const yrs = calcYearsNeeded(valor, aporteManual, recommendedRate, valorInicial);
      const savedYears = anos - yrs;
      if (savedYears > 0.3) {
        feedbackMsg = `Você pode atingir sua meta ${savedYears.toFixed(1)} anos antes do prazo!`;
      }
    } else if (ratio < 0.9) {
      const yrs = calcYearsNeeded(valor, aporteManual, recommendedRate, valorInicial);
      if (yrs < Infinity) {
        feedbackMsg = `Nesse ritmo, você atingiria sua meta em ${yrs.toFixed(1)} anos.`;
      }
    }
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
        <span>Acumulado{valorInicial > 0 ? " (incl. valor inicial)" : ""}: <span className="font-mono-nums font-semibold text-foreground">{fmt(accumulated)}</span></span>
        <span>Faltam: <span className="font-mono-nums font-semibold text-foreground">{fmt(remaining)}</span></span>
      </div>
      {accumulated === 0 && (
        <p className="text-xs text-muted-foreground italic">Você ainda não começou — defina um valor inicial ou comece a investir!</p>
      )}
      {tempoRestante && (
        <p className="text-xs text-muted-foreground">Tempo estimado: <span className="font-semibold text-primary">{tempoRestante}</span></p>
      )}
      {feedbackMsg && (
        <p className="text-xs font-medium text-accent">{feedbackMsg}</p>
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
