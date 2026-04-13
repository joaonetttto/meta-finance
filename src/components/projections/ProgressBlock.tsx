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
  const pct = valor > 0 ? Math.min((valorInicial / valor) * 100, 100) : 0;
  const remaining = valor - valorInicial;

  const effectivePmt = aporteManual > 0 ? aporteManual : recommendedPmt;
  const yrsNeeded = effectivePmt > 0 ? calcYearsNeeded(valor, effectivePmt, recommendedRate, valorInicial) : Infinity;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progresso da meta</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full border"
          style={{ color: status.color, borderColor: status.color }}
        >
          {status.label}
        </span>
      </div>

      <Progress value={pct} className="h-2" />

      {/* Values row */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {valorInicial > 0 ? (
            <>Já investido: <span className="font-mono-nums font-semibold text-primary">{fmt(valorInicial)}</span></>
          ) : (
            <>Acumulado: <span className="font-mono-nums font-semibold text-foreground">{fmt(0)}</span></>
          )}
        </span>
        <span>Faltam: <span className="font-mono-nums font-semibold text-foreground">{fmt(remaining)}</span></span>
      </div>

      {/* Time estimate — always prominent */}
      {yrsNeeded < Infinity && yrsNeeded > 0 && (
        <p className="text-sm font-medium">
          Tempo estimado: <span className="text-primary font-semibold font-mono-nums">{yrsNeeded.toFixed(1)} anos</span>
        </p>
      )}

      {/* Empty state */}
      {valorInicial === 0 && aporteManual <= 0 && (
        <p className="text-xs text-muted-foreground italic">
          Você ainda não começou — comece com qualquer valor mensal para iniciar.
        </p>
      )}

      {/* Actionable feedback */}
      {aporteManual > 0 && recommendedPmt > 0 && (() => {
        const ratio = aporteManual / recommendedPmt;
        if (ratio >= 1.1) {
          const savedYears = anos - yrsNeeded;
          if (savedYears > 0.3) {
            return (
              <div className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 text-xs font-medium text-accent">
                Você pode antecipar em {savedYears.toFixed(1)} anos mantendo esse ritmo.
              </div>
            );
          }
          return (
            <div className="rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 text-xs font-medium text-accent">
              Você está no ritmo ideal — conclusão em {yrsNeeded.toFixed(1)} anos.
            </div>
          );
        } else if (ratio >= 0.9) {
          return (
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-medium text-primary">
              Você está no ritmo ideal — conclusão em {yrsNeeded.toFixed(1)} anos.
            </div>
          );
        } else {
          const deficit = recommendedPmt - aporteManual;
          const altYears = yrsNeeded < Infinity ? yrsNeeded : null;
          return (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs space-y-1">
              <p className="font-semibold text-destructive">Você não atinge a meta no prazo de {anos} anos.</p>
              <p>Precisa de <span className="font-semibold text-destructive">+{fmt(deficit)}/mês</span></p>
              {altYears && (
                <p className="text-muted-foreground">Ou aumente o prazo para <span className="font-semibold">{altYears.toFixed(1)} anos</span></p>
              )}
            </div>
          );
        }
      })()}
    </div>
  );
}
