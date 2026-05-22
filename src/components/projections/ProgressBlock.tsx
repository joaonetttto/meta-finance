import { Progress } from "@/components/ui/progress";
import { fmt, getProgressStatus, calcYearsNeeded } from "@/lib/projections";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";

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
    <div className={layout.card}>
      <div className={layout.stack}>
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <span className={type.overline}>Progresso da meta</span>
        <span
          className={cn(type.caption, "font-semibold px-2 py-0.5 rounded-full border")}
          style={{ color: status.color, borderColor: status.color }}
        >
          {status.label}
        </span>
      </div>

      <Progress value={pct} className="h-2" />

      {/* Values row */}
      <div className={cn("flex justify-between", type.caption)}>
        <span>
          {valorInicial > 0 ? (
            <>Já investido: <span className={cn(type.financialSm, "text-primary")}>{fmt(valorInicial)}</span></>
          ) : (
            <>Acumulado: <span className={type.financialSm}>{fmt(0)}</span></>
          )}
        </span>
        <span>Faltam: <span className={type.financialSm}>{fmt(remaining)}</span></span>
      </div>

      {yrsNeeded < Infinity && yrsNeeded > 0 && (
        <p className={type.body}>
          Tempo estimado: <span className={cn(type.financialSm, "text-primary")}>{yrsNeeded.toFixed(1)} anos</span>
        </p>
      )}

      {valorInicial === 0 && aporteManual <= 0 && (
        <p className={cn(type.caption, "italic")}>
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
              <div className={cn("rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 font-medium text-accent", type.caption)}>
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
            <div className={cn("rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 font-medium text-primary", type.caption)}>
              Você está no ritmo ideal — conclusão em {yrsNeeded.toFixed(1)} anos.
            </div>
          );
        } else {
          const deficit = recommendedPmt - aporteManual;
          const altYears = yrsNeeded < Infinity ? yrsNeeded : null;
          return (
            <div className={cn("rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 space-y-1", type.caption)}>
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
    </div>
  );
}
