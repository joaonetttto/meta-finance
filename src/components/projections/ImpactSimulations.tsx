import { Switch } from "@/components/ui/switch";
import { ArrowRight } from "lucide-react";
import { fmt, calcYearsNeeded, ScenarioResult } from "@/lib/projections";
import { PanelCard, PanelCardHeader } from "@/components/layout/page";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface Props {
  delayStart: boolean;
  skipMonths: boolean;
  reducedContrib: boolean;
  setDelayStart: (v: boolean) => void;
  setSkipMonths: (v: boolean) => void;
  setReducedContrib: (v: boolean) => void;
  baseScenarios: ScenarioResult[];
  valor: number;
  anos: number;
  aporteManual: number;
}

export function ImpactSimulations({
  delayStart, skipMonths, reducedContrib,
  setDelayStart, setSkipMonths, setReducedContrib,
  baseScenarios, valor, anos, aporteManual,
}: Props) {
  const mod = baseScenarios.find(s => s.key === "moderado")!;

  const impacts = [
    {
      label: "Começar em 2 anos",
      active: delayStart,
      toggle: setDelayStart,
      result: delayStart ? `Aporte sobe para ${fmt(mod.pmt)}/mês` : null,
      detail: delayStart ? `Prazo efetivo: ${mod.effectiveYears} anos` : null,
    },
    {
      label: "Pular 1 mês por ano",
      active: skipMonths,
      toggle: setSkipMonths,
      result: skipMonths ? `Aporte compensa: ${fmt(mod.pmt)}/mês` : null,
      detail: null,
    },
    {
      label: "Reduzir contribuição em 20%",
      active: reducedContrib,
      toggle: setReducedContrib,
      result: reducedContrib ? `Você perderia ${fmt(valor - mod.finalValue)}` : null,
      detail: reducedContrib ? `Acumula apenas ${fmt(mod.finalValue)}` : null,
    },
  ];

  const reverseAporte = aporteManual ? parseFloat(String(aporteManual)) : 0;
  const reverseYears = reverseAporte > 0 ? calcYearsNeeded(valor, reverseAporte, 0.07) : null;
  const reverseDiff = reverseAporte > 0 && anos > 0 ? mod.originalPmt - reverseAporte : 0;

  return (
    <div className={layout.stack}>
      <PanelCard>
        <PanelCardHeader title="Simulações de Impacto" />
        <div className={layout.stack}>
          {impacts.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between">
                <p className={cn(type.body, "font-medium")}>{item.label}</p>
                <Switch checked={item.active} onCheckedChange={item.toggle} />
              </div>
              {item.active && (item.result || item.detail) && (
                <div className={cn("mt-2 rounded-lg bg-destructive/5 border border-destructive/15 px-3 py-2 space-y-0.5", type.caption)}>
                  {item.result && <p className="font-semibold text-destructive">{item.result}</p>}
                  {item.detail && <p className={type.bodyMuted}>{item.detail}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </PanelCard>

      {reverseAporte > 0 && reverseYears !== null && (
        <PanelCard>
          <PanelCardHeader
            title={
              <span className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-accent" /> Modo Inverso
              </span>
            }
          />
          <div className={layout.stack}>
            <p className={type.body}>
              Investindo <span className={cn(type.financialSm, "text-primary")}>{fmt(reverseAporte)}/mês</span> a 7% a.a.:
            </p>
            <p className={cn(type.financialLg, "text-accent")}>
              {reverseYears === Infinity ? "∞" : `${Math.round(reverseYears * 10) / 10} anos`}
            </p>
            {anos > 0 && reverseDiff > 0 && (
              <p className={type.caption}>
                Para o prazo de {anos} anos, faltam{" "}
                <span className="font-semibold text-destructive">{fmt(reverseDiff)}/mês</span>.
              </p>
            )}
            {anos > 0 && reverseDiff <= 0 && (
              <p className={cn(type.caption, "font-semibold text-accent")}>✓ Aporte suficiente para atingir a meta no prazo!</p>
            )}
          </div>
        </PanelCard>
      )}
    </div>
  );
}
