import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, Shield, BarChart3, Zap, Calendar, Target,
  ArrowRight, Lightbulb, Clock, DollarSign, Percent
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Legend
} from "recharts";

const SCENARIOS = [
  { key: "conservador", label: "Conservador", rate: 0.04, color: "hsl(var(--accent))", icon: Shield, desc: "Renda fixa, CDBs, Tesouro Selic" },
  { key: "moderado", label: "Moderado", rate: 0.07, icon: BarChart3, color: "hsl(var(--primary))", desc: "Mix balanceado de renda fixa e variável" },
  { key: "agressivo", label: "Agressivo", rate: 0.10, icon: Zap, color: "#f59e0b", desc: "Ações, ETFs, maior exposição a risco" },
] as const;

function calcPMT(fv: number, rateAnnual: number, years: number) {
  const n = years * 12;
  const r = rateAnnual / 12;
  if (r === 0) return fv / n;
  return (fv * r) / (Math.pow(1 + r, n) - 1);
}

function buildTimeline(pmt: number, rateAnnual: number, years: number) {
  const r = rateAnnual / 12;
  const points: { ano: number; valor: number }[] = [];
  let balance = 0;
  for (let m = 0; m <= years * 12; m++) {
    if (m % 12 === 0) {
      points.push({ ano: m / 12, valor: Math.round(balance) });
    }
    balance = (balance + pmt) * (1 + r);
  }
  return points;
}

function calcYearsNeeded(fv: number, pmt: number, rateAnnual: number) {
  if (pmt <= 0) return Infinity;
  const r = rateAnnual / 12;
  if (r === 0) return fv / pmt / 12;
  const n = Math.log((fv * r) / pmt + 1) / Math.log(1 + r);
  return n / 12;
}

function getAllocation(years: number) {
  if (years <= 3) return { rv: 10, fiis: 10, rf: 80, label: "Conservador", reason: "Prazo curto exige proteção do capital. Priorize liquidez e segurança." };
  if (years <= 7) return { rv: 30, fiis: 25, rf: 45, label: "Balanceado", reason: "Prazo médio permite equilibrar risco e retorno." };
  if (years <= 15) return { rv: 50, fiis: 30, rf: 20, label: "Crescimento", reason: "Horizonte longo permite maior exposição a risco para maximizar retorno." };
  return { rv: 60, fiis: 30, rf: 10, label: "Agressivo", reason: "Prazo muito longo — maximize o crescimento composto." };
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return fmt(v);
};

export default function Projections() {
  const { profile } = useFinance();
  const [valorDesejado, setValorDesejado] = useState("");
  const [prazoAnos, setPrazoAnos] = useState("");
  const [aporteManual, setAporteManual] = useState("");
  const [tab, setTab] = useState("cenarios");

  // Impact toggles
  const [delayStart, setDelayStart] = useState(false);
  const [skipMonths, setSkipMonths] = useState(false);
  const [reducedContrib, setReducedContrib] = useState(false);

  const valor = parseFloat(valorDesejado) || 0;
  const anos = parseFloat(prazoAnos) || 0;
  const hasResult = valor > 0 && anos > 0;

  const scenarios = useMemo(() => {
    if (!hasResult) return null;
    return SCENARIOS.map((s) => {
      let effectiveYears = anos;
      if (delayStart) effectiveYears = Math.max(0.5, anos - 2);
      
      let pmt = calcPMT(valor, s.rate, effectiveYears);
      
      if (skipMonths) pmt = pmt * 12 / 11; // compensate 1 skipped month/year
      if (reducedContrib) {
        // 20% less contribution → how much less you accumulate
        const reducedPmt = pmt * 0.8;
        // show the reduced pmt but flag impact
        return {
          ...s,
          pmt: reducedPmt,
          originalPmt: pmt,
          reduced: true,
          timeline: buildTimeline(reducedPmt, s.rate, effectiveYears),
          effectiveYears,
          finalValue: (() => {
            const r = s.rate / 12;
            const n = effectiveYears * 12;
            if (r === 0) return reducedPmt * n;
            return reducedPmt * ((Math.pow(1 + r, n) - 1) / r);
          })(),
        };
      }

      return {
        ...s,
        pmt,
        originalPmt: pmt,
        reduced: false,
        timeline: buildTimeline(pmt, s.rate, effectiveYears),
        effectiveYears,
        finalValue: valor,
      };
    });
  }, [valor, anos, delayStart, skipMonths, reducedContrib, hasResult]);

  const allocation = useMemo(() => (anos > 0 ? getAllocation(anos) : null), [anos]);

  // Reverse mode
  const reverseResult = useMemo(() => {
    const aporte = parseFloat(aporteManual) || 0;
    if (!aporte || !valor) return null;
    const moderateRate = 0.07;
    const yearsNeeded = calcYearsNeeded(valor, aporte, moderateRate);
    const diff = anos > 0 ? calcPMT(valor, moderateRate, anos) - aporte : 0;
    return { yearsNeeded: Math.round(yearsNeeded * 10) / 10, diff, aporte };
  }, [aporteManual, valor, anos]);

  // Insights
  const insights = useMemo(() => {
    if (!scenarios) return [];
    const mod = scenarios[1]; // moderado
    const msgs: { icon: typeof Lightbulb; text: string }[] = [];

    if (anos > 10) msgs.push({ icon: TrendingUp, text: "Seu prazo permite maior exposição a risco — considere renda variável." });
    if (anos <= 3) msgs.push({ icon: Shield, text: "Prazo curto — priorize investimentos de baixo risco e alta liquidez." });

    // +R$50 impact
    const pmtPlus50 = mod.pmt + 50;
    const yearsNew = calcYearsNeeded(valor, pmtPlus50, 0.07);
    const saved = anos - yearsNew;
    if (saved > 0.5) msgs.push({ icon: Lightbulb, text: `Aumentar R$50/mês reduz ${saved.toFixed(1)} anos do prazo.` });

    // Delay impact
    const pmtDelayed = calcPMT(valor, 0.07, Math.max(0.5, anos - 2));
    const increase = pmtDelayed - mod.pmt;
    if (increase > 10) msgs.push({ icon: Clock, text: `Adiar 2 anos aumenta o esforço mensal em ${fmt(increase)}.` });

    if (profile.salario && mod.pmt / profile.salario > 0.3) {
      msgs.push({ icon: DollarSign, text: `A meta consome ${((mod.pmt / profile.salario) * 100).toFixed(0)}% do seu salário — considere estender o prazo.` });
    }

    return msgs;
  }, [scenarios, anos, valor, profile.salario]);

  // Chart data combining scenarios
  const chartData = useMemo(() => {
    if (!scenarios) return [];
    const maxLen = Math.max(...scenarios.map((s) => s.timeline.length));
    const data: Record<string, number | string>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const point: Record<string, number | string> = { ano: scenarios[0].timeline[i]?.ano ?? i };
      scenarios.forEach((s) => {
        point[s.key] = s.timeline[i]?.valor ?? 0;
      });
      data.push(point);
    }
    return data;
  }, [scenarios]);

  const calcular = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-display">Projeções Financeiras</h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-ui">
          Simule cenários, compare estratégias e descubra o melhor caminho para sua meta.
        </p>
      </div>

      {/* INPUT FORM */}
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={calcular}
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold tracking-ui mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Simulador
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Valor Desejado (R$)</Label>
            <CurrencyInput value={valorDesejado} onValueChange={setValorDesejado} placeholder="0,00" className="font-mono-nums" required />
          </div>
          <div>
            <Label>Prazo (anos)</Label>
            <Input type="number" step="0.5" min="0.5" value={prazoAnos} onChange={(e) => setPrazoAnos(e.target.value)} className="font-mono-nums" required />
          </div>
          <div>
            <Label>Quanto posso investir/mês (opcional)</Label>
            <CurrencyInput value={aporteManual} onValueChange={setAporteManual} placeholder="0,00" className="font-mono-nums" />
          </div>
        </div>
      </motion.form>

      <AnimatePresence>
        {hasResult && scenarios && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* PROGRESS INDICATOR */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progresso da meta</span>
                  <span className="text-xs font-semibold font-mono-nums">0% de {fmt(valor)}</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Comece a investir para acompanhar sua evolução aqui.</p>
              </CardContent>
            </Card>

            {/* TABS */}
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="cenarios">Cenários</TabsTrigger>
                <TabsTrigger value="grafico">Gráfico</TabsTrigger>
                <TabsTrigger value="alocacao">Alocação</TabsTrigger>
                <TabsTrigger value="impacto">Impacto</TabsTrigger>
              </TabsList>

              {/* SCENARIOS TAB */}
              <TabsContent value="cenarios" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {scenarios.map((s) => {
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={s.key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-border bg-card p-5 space-y-3 relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: s.color }} />
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: s.color }} />
                          <h3 className="text-sm font-semibold">{s.label}</h3>
                          <span className="ml-auto text-xs font-mono-nums text-muted-foreground">{(s.rate * 100).toFixed(0)}% a.a.</span>
                        </div>
                        <p className="text-2xl font-bold font-mono-nums" style={{ color: s.color }}>
                          {fmt(s.pmt)}<span className="text-xs font-normal text-muted-foreground">/mês</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                        {s.reduced && (
                          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs">
                            <span className="text-destructive font-semibold">-20% contribuição:</span>{" "}
                            acumula {fmt(s.finalValue)} ao invés de {fmt(valor)}
                          </div>
                        )}
                        {profile.salario && (
                          <p className="text-xs text-muted-foreground">
                            <Percent className="inline h-3 w-3 mr-1" />
                            {((s.pmt / profile.salario) * 100).toFixed(1)}% do salário
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* CHART TAB */}
              <TabsContent value="grafico" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Evolução do Patrimônio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            {SCENARIOS.map((s) => (
                              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="ano" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}a`} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={fmtShort} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                            formatter={(value: number, name: string) => {
                              const sc = SCENARIOS.find((s) => s.key === name);
                              return [fmt(value), sc?.label ?? name];
                            }}
                            labelFormatter={(l) => `Ano ${l}`}
                          />
                          <Legend formatter={(value) => SCENARIOS.find((s) => s.key === value)?.label ?? value} />
                          {SCENARIOS.map((s) => (
                            <Area
                              key={s.key}
                              type="monotone"
                              dataKey={s.key}
                              stroke={s.color}
                              fill={`url(#grad-${s.key})`}
                              strokeWidth={2}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Milestones */}
                    <div className="flex justify-between mt-4 px-2">
                      {[0, Math.round(anos * 0.25), Math.round(anos * 0.5), Math.round(anos * 0.75), Math.round(anos)].map((yr, i) => {
                        const modTimeline = scenarios[1].timeline;
                        const point = modTimeline.find((p) => p.ano === yr);
                        return (
                          <div key={i} className="text-center">
                            <div className="w-2 h-2 rounded-full bg-primary mx-auto mb-1" />
                            <p className="text-xs font-semibold">Ano {yr}</p>
                            <p className="text-xs text-muted-foreground font-mono-nums">{point ? fmtShort(point.valor) : "—"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ALLOCATION TAB */}
              <TabsContent value="alocacao" className="mt-4">
                {allocation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Alocação Sugerida — Perfil {allocation.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{allocation.reason}</p>
                      <div className="space-y-3">
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
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* IMPACT TAB */}
              <TabsContent value="impacto" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Simulações de Impacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Começar em 2 anos</p>
                        <p className="text-xs text-muted-foreground">Reduz o prazo efetivo de investimento</p>
                      </div>
                      <Switch checked={delayStart} onCheckedChange={setDelayStart} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Pular 1 mês por ano</p>
                        <p className="text-xs text-muted-foreground">Simula falhas de contribuição</p>
                      </div>
                      <Switch checked={skipMonths} onCheckedChange={setSkipMonths} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Reduzir contribuição em 20%</p>
                        <p className="text-xs text-muted-foreground">Mostra quanto a menos você acumularia</p>
                      </div>
                      <Switch checked={reducedContrib} onCheckedChange={setReducedContrib} />
                    </div>
                  </CardContent>
                </Card>

                {/* Reverse mode */}
                {reverseResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-accent" />
                        Modo Inverso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">
                        Investindo <span className="font-semibold text-primary font-mono-nums">{fmt(reverseResult.aporte)}/mês</span> a 7% a.a.:
                      </p>
                      <p className="text-2xl font-bold font-mono-nums text-accent">
                        {reverseResult.yearsNeeded === Infinity ? "∞" : `${reverseResult.yearsNeeded} anos`}
                      </p>
                      {anos > 0 && reverseResult.diff > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Para manter o prazo de {anos} anos, você precisaria de mais <span className="text-destructive font-semibold">{fmt(reverseResult.diff)}/mês</span>.
                        </p>
                      )}
                      {anos > 0 && reverseResult.diff <= 0 && (
                        <p className="text-xs text-accent font-semibold">
                          ✓ Seu aporte é suficiente para atingir a meta dentro do prazo!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* INSIGHTS */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-accent" /> Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.map((ins, i) => {
                      const Icon = ins.icon;
                      return (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{ins.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
