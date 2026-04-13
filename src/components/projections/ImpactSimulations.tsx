import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { fmt, calcYearsNeeded, ScenarioResult } from "@/lib/projections";

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Simulações de Impacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {impacts.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.label}</p>
                <Switch checked={item.active} onCheckedChange={item.toggle} />
              </div>
              {item.active && (item.result || item.detail) && (
                <div className="mt-2 rounded-lg bg-destructive/5 border border-destructive/15 px-3 py-2 text-xs space-y-0.5">
                  {item.result && <p className="text-destructive font-semibold">{item.result}</p>}
                  {item.detail && <p className="text-muted-foreground">{item.detail}</p>}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {reverseAporte > 0 && reverseYears !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-accent" /> Modo Inverso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              Investindo <span className="font-semibold text-primary font-mono-nums">{fmt(reverseAporte)}/mês</span> a 7% a.a.:
            </p>
            <p className="text-2xl font-bold font-mono-nums text-accent">
              {reverseYears === Infinity ? "∞" : `${Math.round(reverseYears * 10) / 10} anos`}
            </p>
            {anos > 0 && reverseDiff > 0 && (
              <p className="text-xs text-muted-foreground">
                Para o prazo de {anos} anos, faltam{" "}
                <span className="text-destructive font-semibold">{fmt(reverseDiff)}/mês</span>.
              </p>
            )}
            {anos > 0 && reverseDiff <= 0 && (
              <p className="text-xs text-accent font-semibold">✓ Aporte suficiente para atingir a meta no prazo!</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
