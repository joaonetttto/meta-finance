// Financial calculation utilities for projections

export const SCENARIOS = [
  { key: "conservador", label: "Conservador", tag: "Mais seguro", rate: 0.04, color: "hsl(var(--accent))", icon: "Shield", desc: "Renda fixa, CDBs, Tesouro Selic" },
  { key: "moderado", label: "Moderado", tag: "Equilibrado", rate: 0.07, icon: "BarChart3", color: "hsl(var(--primary))", desc: "Mix balanceado de renda fixa e variável" },
  { key: "agressivo", label: "Agressivo", tag: "Maior retorno", rate: 0.10, icon: "Zap", color: "#f59e0b", desc: "Ações, ETFs, maior exposição a risco" },
] as const;

export type ScenarioKey = typeof SCENARIOS[number]["key"];

export function calcPMT(fv: number, rateAnnual: number, years: number) {
  const n = years * 12;
  const r = rateAnnual / 12;
  if (r === 0) return fv / n;
  return (fv * r) / (Math.pow(1 + r, n) - 1);
}

export function calcFV(pmt: number, rateAnnual: number, years: number) {
  const r = rateAnnual / 12;
  const n = years * 12;
  if (r === 0) return pmt * n;
  return pmt * ((Math.pow(1 + r, n) - 1) / r);
}

export function buildTimeline(pmt: number, rateAnnual: number, years: number) {
  const r = rateAnnual / 12;
  const points: { ano: number; valor: number; investido: number }[] = [];
  let balance = 0;
  let totalInvested = 0;
  for (let m = 0; m <= years * 12; m++) {
    if (m % 12 === 0) {
      points.push({ ano: m / 12, valor: Math.round(balance), investido: Math.round(totalInvested) });
    }
    totalInvested += pmt;
    balance = (balance + pmt) * (1 + r);
  }
  return points;
}

export function calcYearsNeeded(fv: number, pmt: number, rateAnnual: number) {
  if (pmt <= 0) return Infinity;
  const r = rateAnnual / 12;
  if (r === 0) return fv / pmt / 12;
  const n = Math.log((fv * r) / pmt + 1) / Math.log(1 + r);
  return n / 12;
}

export function getAllocation(years: number) {
  if (years <= 3) return { rv: 10, fiis: 10, rf: 80, label: "Conservador", reason: "Prazo curto exige proteção do capital. Priorize liquidez e segurança." };
  if (years <= 7) return { rv: 30, fiis: 25, rf: 45, label: "Balanceado", reason: "Prazo médio permite equilibrar risco e retorno." };
  if (years <= 15) return { rv: 50, fiis: 30, rf: 20, label: "Crescimento", reason: "Horizonte longo permite maior exposição a risco para maximizar retorno." };
  return { rv: 60, fiis: 30, rf: 10, label: "Agressivo", reason: "Prazo muito longo — maximize o crescimento composto." };
}

export const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return fmt(v);
};

export interface ScenarioResult {
  key: string;
  label: string;
  tag: string;
  rate: number;
  color: string;
  icon: string;
  desc: string;
  pmt: number;
  originalPmt: number;
  reduced: boolean;
  timeline: { ano: number; valor: number; investido: number }[];
  effectiveYears: number;
  finalValue: number;
  totalInvested: number;
  totalRendimento: number;
  pctRendimento: number;
  recommended?: boolean;
}

export function buildScenarios(
  valor: number,
  anos: number,
  aporteManual: number,
  delayStart: boolean,
  skipMonths: boolean,
  reducedContrib: boolean
): ScenarioResult[] {
  const results = SCENARIOS.map((s) => {
    let effectiveYears = anos;
    if (delayStart) effectiveYears = Math.max(0.5, anos - 2);

    let pmt = calcPMT(valor, s.rate, effectiveYears);

    if (skipMonths) pmt = pmt * 12 / 11;

    const basePmt = pmt;
    let finalValue = valor;
    let actualPmt = pmt;

    if (reducedContrib) {
      actualPmt = pmt * 0.8;
      const r = s.rate / 12;
      const n = effectiveYears * 12;
      finalValue = r === 0 ? actualPmt * n : actualPmt * ((Math.pow(1 + r, n) - 1) / r);
    }

    const timeline = buildTimeline(actualPmt, s.rate, effectiveYears);
    const totalInvested = actualPmt * effectiveYears * 12;
    const totalRendimento = finalValue - totalInvested;
    const pctRendimento = finalValue > 0 ? (totalRendimento / finalValue) * 100 : 0;

    return {
      ...s,
      icon: s.icon,
      pmt: actualPmt,
      originalPmt: basePmt,
      reduced: reducedContrib,
      timeline,
      effectiveYears,
      finalValue,
      totalInvested,
      totalRendimento,
      pctRendimento,
    } as ScenarioResult;
  });

  // Determine recommendation
  const recommended = getRecommendedScenario(results, aporteManual, anos);
  results.forEach(r => { r.recommended = r.key === recommended; });

  return results;
}

export function getRecommendedScenario(scenarios: ScenarioResult[], aporteManual: number, anos: number): string {
  if (aporteManual > 0) {
    // If user can afford moderado, recommend it. If not, check conservador feasibility.
    const mod = scenarios.find(s => s.key === "moderado")!;
    const con = scenarios.find(s => s.key === "conservador")!;
    const agr = scenarios.find(s => s.key === "agressivo")!;

    if (aporteManual >= mod.pmt * 0.9) return "moderado";
    if (aporteManual >= con.pmt * 0.9) return "conservador";
    // Can't afford any comfortably — still recommend moderado but with adjustment
    return "moderado";
  }

  // No manual input — recommend based on timeframe
  if (anos <= 3) return "conservador";
  if (anos <= 10) return "moderado";
  return "agressivo";
}

export interface Recommendation {
  scenarioLabel: string;
  scenarioKey: string;
  color: string;
  action: string;
  detail: string;
  sufficient: boolean;
}

export function getRecommendation(
  scenarios: ScenarioResult[],
  valor: number,
  anos: number,
  aporteManual: number
): Recommendation {
  const rec = scenarios.find(s => s.recommended)!;
  
  if (aporteManual > 0) {
    const diff = rec.pmt - aporteManual;
    if (diff <= 0) {
      // Sufficient
      const yearsNeeded = calcYearsNeeded(valor, aporteManual, rec.rate);
      const savedYears = anos - yearsNeeded;
      return {
        scenarioLabel: rec.label,
        scenarioKey: rec.key,
        color: rec.color,
        action: savedYears > 0.5
          ? `Você pode atingir a meta ${savedYears.toFixed(1)} anos antes do prazo!`
          : "Seu aporte é suficiente para atingir a meta no prazo.",
        detail: `Cenário ${rec.label} com ${fmt(aporteManual)}/mês.`,
        sufficient: true,
      };
    } else {
      return {
        scenarioLabel: rec.label,
        scenarioKey: rec.key,
        color: rec.color,
        action: `Aumente seu aporte em ${fmt(diff)}/mês para atingir a meta.`,
        detail: `No cenário ${rec.label}, você precisa de ${fmt(rec.pmt)}/mês.`,
        sufficient: false,
      };
    }
  }

  return {
    scenarioLabel: rec.label,
    scenarioKey: rec.key,
    color: rec.color,
    action: `Invista ${fmt(rec.pmt)}/mês no cenário ${rec.label}.`,
    detail: `Taxa estimada de ${(rec.rate * 100).toFixed(0)}% a.a. — ${rec.desc}`,
    sufficient: true,
  };
}

export interface Insight {
  icon: string; // icon name
  text: string;
  priority: number; // lower = more important
}

export function generateInsights(
  scenarios: ScenarioResult[],
  valor: number,
  anos: number,
  aporteManual: number,
  salario: number | null
): Insight[] {
  const mod = scenarios.find(s => s.key === "moderado")!;
  const insights: Insight[] = [];

  // Compound interest insight
  if (mod.pctRendimento > 20) {
    insights.push({
      icon: "TrendingUp",
      text: `${mod.pctRendimento.toFixed(0)}% do seu resultado vem dos juros compostos.`,
      priority: 1,
    });
  }

  // Total invested vs earned
  insights.push({
    icon: "DollarSign",
    text: `Você investirá ${fmt(mod.totalInvested)} e ganhará ${fmt(mod.totalRendimento)} em rendimentos.`,
    priority: 2,
  });

  // +R$50 impact
  const pmtPlus50 = mod.pmt + 50;
  const yearsNew = calcYearsNeeded(valor, pmtPlus50, 0.07);
  const saved = anos - yearsNew;
  if (saved > 0.3) {
    insights.push({
      icon: "Lightbulb",
      text: `Aumentar R$50/mês reduz ${saved.toFixed(1)} anos do prazo.`,
      priority: 3,
    });
  }

  // Last years growth
  if (anos >= 5) {
    const timeline = mod.timeline;
    const halfPoint = timeline.find(p => p.ano === Math.round(anos / 2));
    const fullPoint = timeline[timeline.length - 1];
    if (halfPoint && fullPoint) {
      const lastHalfGrowth = fullPoint.valor - halfPoint.valor;
      const pctLastHalf = (lastHalfGrowth / fullPoint.valor) * 100;
      if (pctLastHalf > 55) {
        insights.push({
          icon: "Clock",
          text: `Os últimos ${Math.round(anos / 2)} anos geram ${pctLastHalf.toFixed(0)}% do crescimento total.`,
          priority: 4,
        });
      }
    }
  }

  // Delay impact
  const pmtDelayed = calcPMT(valor, 0.07, Math.max(0.5, anos - 2));
  const increase = pmtDelayed - mod.pmt;
  if (increase > 10) {
    insights.push({
      icon: "Clock",
      text: `Adiar 2 anos aumenta o esforço mensal em ${fmt(increase)}.`,
      priority: 5,
    });
  }

  // Salary proportion
  if (salario && mod.pmt / salario > 0.3) {
    insights.push({
      icon: "DollarSign",
      text: `A meta consome ${((mod.pmt / salario) * 100).toFixed(0)}% do seu salário — considere estender o prazo.`,
      priority: 6,
    });
  }

  // Risk horizon
  if (anos > 10) {
    insights.push({ icon: "TrendingUp", text: "Seu prazo permite maior exposição a risco — considere renda variável.", priority: 7 });
  } else if (anos <= 3) {
    insights.push({ icon: "Shield", text: "Prazo curto — priorize investimentos de baixo risco e alta liquidez.", priority: 7 });
  }

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function getProgressStatus(aporteManual: number, requiredPmt: number): { label: string; color: string } {
  if (aporteManual <= 0) return { label: "Defina seu aporte", color: "hsl(var(--muted-foreground))" };
  const ratio = aporteManual / requiredPmt;
  if (ratio >= 1.1) return { label: "Acima do esperado", color: "hsl(var(--accent))" };
  if (ratio >= 0.9) return { label: "No ritmo ideal", color: "hsl(var(--primary))" };
  return { label: "Abaixo do necessário", color: "hsl(var(--destructive))" };
}
