import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BarChart3, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import { SavedProjections } from "@/components/projections/SavedProjections";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Legend, ReferenceLine, Line
} from "recharts";
import { FinancialChartTooltip } from "@/components/charts/FinancialChartTooltip";
import { FinancialChartLegend } from "@/components/charts/FinancialChartLegend";
import {
  CHART_COLORS,
  CHART_MARGIN,
  CHART_STROKE_WIDTH,
  CHART_STROKE_WIDTH_SECONDARY,
  chartAxisProps,
  chartAxisTick,
  chartGridProps,
} from "@/lib/chart-theme";

import {
  SCENARIOS, buildScenarios, getRecommendation, generateInsights,
  getAllocation, fmt, fmtShort
} from "@/lib/projections";
import { RecommendationBlock } from "@/components/projections/RecommendationBlock";
import { ScenarioCards } from "@/components/projections/ScenarioCards";
import { ProgressBlock } from "@/components/projections/ProgressBlock";
import { ImpactSimulations } from "@/components/projections/ImpactSimulations";
import { InsightsBlock } from "@/components/projections/InsightsBlock";
import { PageShell, PageHeader, PanelCard, PanelCardHeader } from "@/components/layout/page";
import { layout } from "@/lib/layout";
import { cn } from "@/lib/utils";

export default function Projections() {
  const { profile } = useFinance();
  const { user } = useAuth();
  const [valorDesejado, setValorDesejado] = useState("");
  const [prazoAnos, setPrazoAnos] = useState("");
  const [aporteManual, setAporteManual] = useState("");
  const [valorInicial, setValorInicial] = useState("");
  const [projName, setProjName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState(0);
  const [tab, setTab] = useState("cenarios");

  const [delayStart, setDelayStart] = useState(false);
  const [skipMonths, setSkipMonths] = useState(false);
  const [reducedContrib, setReducedContrib] = useState(false);

  const valor = parseFloat(valorDesejado) || 0;
  const anos = parseFloat(prazoAnos) || 0;
  const aporte = parseFloat(aporteManual) || 0;
  const pvInicial = parseFloat(valorInicial) || 0;
  const hasResult = valor > 0 && anos > 0;

  const scenarios = useMemo(() => {
    if (!hasResult) return null;
    return buildScenarios(valor, anos, aporte, delayStart, skipMonths, reducedContrib, pvInicial);
  }, [valor, anos, aporte, delayStart, skipMonths, reducedContrib, hasResult, pvInicial]);

  const recommendation = useMemo(() => {
    if (!scenarios) return null;
    return getRecommendation(scenarios, valor, anos, aporte, pvInicial);
  }, [scenarios, valor, anos, aporte, pvInicial]);

  const insights = useMemo(() => {
    if (!scenarios) return [];
    return generateInsights(scenarios, valor, anos, aporte, profile.salario, pvInicial);
  }, [scenarios, valor, anos, aporte, profile.salario, pvInicial]);

  const allocation = useMemo(() => (anos > 0 ? getAllocation(anos) : null), [anos]);

  const handleSave = async () => {
    if (!user || !hasResult) return;
    setSaving(true);
    const recKey = recScenario?.key ?? "moderado";
    const { error } = await supabase.from("saved_projections").insert({
      user_id: user.id,
      nome: projName.trim() || `Projeção ${new Date().toLocaleDateString("pt-BR")}`,
      valor_desejado: valor,
      prazo_anos: anos,
      aporte_mensal: aporte,
      cenario: recKey,
    } as any);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar projeção");
    } else {
      toast.success("Projeção salva!");
      setProjName("");
      setSavedKey((k) => k + 1);
    }
  };

  const handleReopen = (p: { valorDesejado: string; prazoAnos: string; aporteManual: string }) => {
    setValorDesejado(p.valorDesejado);
    setPrazoAnos(p.prazoAnos);
    setAporteManual(p.aporteManual);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chartData = useMemo(() => {
    if (!scenarios) return [];
    const maxLen = Math.max(...scenarios.map((s) => s.timeline.length));
    const data: Record<string, number | string>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const point: Record<string, number | string> = { ano: scenarios[0].timeline[i]?.ano ?? i };
      scenarios.forEach((s) => {
        point[s.key] = s.timeline[i]?.valor ?? 0;
      });
      point["investido"] = scenarios[0].timeline[i]?.investido ?? 0;
      data.push(point);
    }
    return data;
  }, [scenarios]);

  const recScenario = scenarios?.find(s => s.recommended);

  return (
    <PageShell>
      <PageHeader
        title="Projeções Financeiras"
        description="Simule cenários, compare estratégias e descubra o melhor caminho para sua meta."
      />

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={(e) => e.preventDefault()}
        className={layout.card}
      >
        <h2 className={cn(layout.panelTitle, "mb-4 flex items-center gap-2")}>
          <Target className="h-4 w-4 text-primary" /> Simulador
        </h2>
        <div className={cn(layout.grid, "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
          <div>
            <Label>Valor Desejado (R$)</Label>
            <CurrencyInput value={valorDesejado} onValueChange={setValorDesejado} placeholder="0,00" className="font-mono-nums" required />
          </div>
          <div>
            <Label>Prazo (anos)</Label>
            <Input type="number" step="0.5" min="0.5" value={prazoAnos} onChange={(e) => setPrazoAnos(e.target.value)} className="font-mono-nums" required />
          </div>
          <div>
            <Label>Quanto posso investir/mês</Label>
            <CurrencyInput value={aporteManual} onValueChange={setAporteManual} placeholder="0,00" className="font-mono-nums" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-accent" />
              Já tenho investido
            </Label>
            <CurrencyInput value={valorInicial} onValueChange={setValorInicial} placeholder="0,00 (opcional)" className="font-mono-nums" />
          </div>
        </div>
      </motion.form>

      {/* SAVE BUTTON */}
      {hasResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Input
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
            placeholder="Nome da projeção (opcional)"
            className="max-w-xs h-9 text-sm"
          />
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {saving ? "Salvando..." : "Salvar projeção"}
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {hasResult && scenarios && recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={layout.section}
          >
            {/* RECOMMENDATION */}
            <RecommendationBlock rec={recommendation} />

            {/* PROGRESS */}
            <ProgressBlock
              valor={valor}
              anos={anos}
              aporteManual={aporte}
              recommendedRate={recScenario?.rate ?? 0.07}
              recommendedPmt={recScenario?.pmt ?? 0}
              valorInicial={pvInicial}
            />

            {/* TABS */}
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="cenarios">Cenários</TabsTrigger>
                <TabsTrigger value="grafico">Gráfico</TabsTrigger>
                <TabsTrigger value="alocacao">Alocação</TabsTrigger>
                <TabsTrigger value="impacto">Impacto</TabsTrigger>
              </TabsList>

              <TabsContent value="cenarios" className={cn(layout.stack, "mt-4")}>
                <ScenarioCards scenarios={scenarios} valor={valor} salario={profile.salario} />
              </TabsContent>

              <TabsContent value="grafico" className="mt-4">
                <PanelCard>
                  <PanelCardHeader title="Evolução do Patrimônio" />
                  <div>
                    <div className="h-72 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={CHART_MARGIN}>
                          <CartesianGrid {...chartGridProps} />
                          <XAxis
                            dataKey="ano"
                            tick={chartAxisTick}
                            {...chartAxisProps}
                            tickFormatter={(v) => `${v}a`}
                          />
                          <YAxis
                            tick={chartAxisTick}
                            {...chartAxisProps}
                            width={72}
                            tickFormatter={fmtShort}
                          />
                          <Tooltip
                            content={
                              <FinancialChartTooltip
                                labelFormatter={(l) => `Ano ${l}`}
                                valueFormatter={fmt}
                                nameFormatter={(name) => {
                                  if (name === "investido") return "Valor Investido";
                                  return SCENARIOS.find((s) => s.key === name)?.label ?? name;
                                }}
                              />
                            }
                            cursor={{ stroke: CHART_COLORS.grid, strokeWidth: 1 }}
                          />
                          <Legend
                            content={
                              <FinancialChartLegend
                                nameMap={{
                                  investido: "Valor Investido",
                                  ...Object.fromEntries(SCENARIOS.map((s) => [s.key, s.label])),
                                }}
                              />
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="investido"
                            stroke={CHART_COLORS.muted}
                            strokeWidth={CHART_STROKE_WIDTH_SECONDARY}
                            strokeDasharray="6 4"
                            dot={false}
                          />
                          {SCENARIOS.map((s) => (
                            <Line
                              key={s.key}
                              type="monotone"
                              dataKey={s.key}
                              stroke={s.color}
                              strokeWidth={CHART_STROKE_WIDTH}
                              dot={false}
                              activeDot={{ r: 4, strokeWidth: 0, fill: s.color }}
                            />
                          ))}
                          <ReferenceLine
                            y={valor}
                            stroke={CHART_COLORS.accent}
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            strokeOpacity={0.7}
                            label={{
                              value: "Meta",
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 11,
                              position: "insideTopRight",
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-4 px-2">
                      {[0, Math.round(anos * 0.25), Math.round(anos * 0.5), Math.round(anos * 0.75), Math.round(anos)].map((yr, i) => {
                        const modTimeline = scenarios.find(s => s.key === "moderado")!.timeline;
                        const point = modTimeline.find((p) => p.ano === yr);
                        return (
                          <div key={i} className="text-center">
                            <div className="w-2 h-2 rounded-sm bg-primary mx-auto mb-1" />
                            <p className="text-xs font-semibold">Ano {yr}</p>
                            <p className="text-xs text-muted-foreground font-mono-nums">{point ? fmtShort(point.valor) : "—"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </PanelCard>
              </TabsContent>

              <TabsContent value="alocacao" className="mt-4">
                {allocation && (
                  <PanelCard>
                    <PanelCardHeader
                      title={
                        <span className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Alocação Sugerida — Perfil {allocation.label}
                        </span>
                      }
                    />
                    <div className={layout.stack}>
                      <p className="text-sm text-muted-foreground">{allocation.reason}</p>
                      <div className={layout.stack}>
                        {[
                          { label: "Renda Variável", pct: allocation.rv, color: "hsl(var(--primary))" },
                          { label: "Fundos Imobiliários", pct: allocation.fiis, color: "hsl(var(--accent))" },
                          { label: "Renda Fixa", pct: allocation.rf, color: "hsl(var(--muted-foreground))" },
                        ].map((a) => (
                          <div key={a.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{a.label}</span>
                              <span className="font-mono-nums font-semibold">{a.pct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${a.pct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: a.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PanelCard>
                )}
              </TabsContent>

              <TabsContent value="impacto" className="mt-4">
                <ImpactSimulations
                  delayStart={delayStart}
                  skipMonths={skipMonths}
                  reducedContrib={reducedContrib}
                  setDelayStart={setDelayStart}
                  setSkipMonths={setSkipMonths}
                  setReducedContrib={setReducedContrib}
                  baseScenarios={scenarios}
                  valor={valor}
                  anos={anos}
                  aporteManual={aporte}
                />
              </TabsContent>
            </Tabs>

            {/* INSIGHTS */}
            <InsightsBlock insights={insights} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAVED PROJECTIONS */}
      <SavedProjections key={savedKey} onReopen={handleReopen} />
    </PageShell>
  );
}
