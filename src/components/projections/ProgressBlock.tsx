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

  // Estimate time remaining
  const effectivePmt = aporteManual > 0 ? aporteManual : recommendedPmt;
  const yrsNeeded = effectivePmt > 0 ? calcYearsNeeded(valor, effectivePmt, recommendedRate, valorInicial) : Infinity;

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
        <span>
          {valorInicial > 0 ? (
            <>Já investido: <span className="font-mono-nums font-semibold text-primary">{fmt(accumulated)}</span></>
          ) : (
            <>Acumulado: <span className="font-mono-nums font-semibold text-foreground">{fmt(0)}</span></>
          )}
        </span>
        <span>Faltam: <span className="font-mono-nums font-semibold text-foreground">{fmt(remaining)}</span></span>
      </div>

      {/* Empty state */}
      {accumulated === 0 && aporteManual <= 0 && (
        <p className="text-xs text-muted-foreground italic">
          Você ainda não começou — defina um valor mensal para iniciar seu plano.
        </p>
      )}

      {/* Time estimate - always show when available */}
      {yrsNeeded < Infinity && yrsNeeded > 0 && (
        <p className="text-sm font-medium">
          Tempo estimado: <span className="text-primary font-semibold font-mono-nums">{yrsNeeded.toFixed(1)} anos</span>
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
                Você pode atingir sua meta {savedYears.toFixed(1)} anos antes do prazo!
              </div>
            );
          }
        } else if (ratio < 0.9) {
          const deficit = recommendedPmt - aporteManual;
          return (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs">
              Precisa de <span className="font-semibold text-destructive">+{fmt(deficit)}/mês</span> para atingir no prazo de {anos} anos.
              {yrsNeeded < Infinity && (
                <span className="block mt-0.5 text-muted-foreground">
                  Nesse ritmo → <span className="font-semibold">{yrsNeeded.toFixed(1)} anos</span>
                </span>
              )}
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
