// Financial calculation utilities for projections

export const SCENARIOS = [
  { key: "conservador", label: "Conservador", tag: "Mais seguro", rate: 0.04, color: "hsl(var(--accent))", icon: "Shield", desc: "Renda fixa, CDBs, Tesouro Selic" },
  { key: "moderado", label: "Moderado", tag: "Equilibrado", rate: 0.07, icon: "BarChart3", color: "hsl(var(--primary))", desc: "Mix balanceado de renda fixa e variável" },
  { key: "agressivo", label: "Agressivo", tag: "Maior retorno", rate: 0.10, icon: "Zap", color: "hsl(var(--chart-warning))", desc: "Ações, ETFs, maior exposição a risco" },
] as const;

export type ScenarioKey = typeof SCENARIOS[number]["key"];

/** Calculate PMT considering present value (initial investment) */
export function calcPMT(fv: number, rateAnnual: number, years: number, pv = 0) {
  const n = years * 12;
  const r = rateAnnual / 12;
  const fvNeeded = fv - pv * Math.pow(1 + r, n);
  if (fvNeeded <= 0) return 0;
  if (r === 0) return fvNeeded / n;
  return (fvNeeded * r) / (Math.pow(1 + r, n) - 1);
}

export function calcFV(pmt: number, rateAnnual: number, years: number, pv = 0) {
  const r = rateAnnual / 12;
  const n = years * 12;
  const pvGrowth = pv * Math.pow(1 + r, n);
  if (r === 0) return pvGrowth + pmt * n;
  return pvGrowth + pmt * ((Math.pow(1 + r, n) - 1) / r);
}

export function buildTimeline(pmt: number, rateAnnual: number, years: number, pv = 0) {
  const r = rateAnnual / 12;
  const points: { ano: number; valor: number; investido: number }[] = [];
  let balance = pv;
  let totalInvested = pv;
  for (let m = 0; m <= years * 12; m++) {
    if (m % 12 === 0) {
      points.push({ ano: m / 12, valor: Math.round(balance), investido: Math.round(totalInvested) });
    }
    totalInvested += pmt;
    balance = (balance + pmt) * (1 + r);
  }
  return points;
}

export function calcYearsNeeded(fv: number, pmt: number, rateAnnual: number, pv = 0) {
  if (pmt <= 0 && pv <= 0) return Infinity;
  const r = rateAnnual / 12;
  const target = fv;
  if (r === 0) {
    if (pmt <= 0) return Infinity;
    return (target - pv) / pmt / 12;
  }
  // Iterative approach for accuracy with PV
  if (pv > 0 || pmt > 0) {
    let balance = pv;
    let months = 0;
    const maxMonths = 100 * 12;
    while (balance < target && months < maxMonths) {
      balance = (balance + pmt) * (1 + r);
      months++;
    }
    return months >= maxMonths ? Infinity : months / 12;
  }
  return Infinity;
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
  yearsNeeded: number;
}

export function buildScenarios(
  valor: number,
  anos: number,
  aporteManual: number,
  delayStart: boolean,
  skipMonths: boolean,
  reducedContrib: boolean,
  valorInicial = 0
): ScenarioResult[] {
  const results = SCENARIOS.map((s) => {
    let effectiveYears = anos;
    if (delayStart) effectiveYears = Math.max(0.5, anos - 2);

    let pmt = calcPMT(valor, s.rate, effectiveYears, valorInicial);

    if (skipMonths) pmt = pmt * 12 / 11;

    const basePmt = pmt;
    let finalValue = valor;
    let actualPmt = pmt;

    if (reducedContrib) {
      actualPmt = pmt * 0.8;
      finalValue = calcFV(actualPmt, s.rate, effectiveYears, valorInicial);
    }

    const timeline = buildTimeline(actualPmt, s.rate, effectiveYears, valorInicial);
    const totalInvested = valorInicial + actualPmt * effectiveYears * 12;
    const totalRendimento = finalValue - totalInvested;
    const pctRendimento = finalValue > 0 ? (totalRendimento / finalValue) * 100 : 0;
    const yearsNeeded = calcYearsNeeded(valor, actualPmt, s.rate, valorInicial);

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
      yearsNeeded,
    } as ScenarioResult;
  });

  const recommended = getRecommendedScenario(results, aporteManual, anos);
  results.forEach(r => { r.recommended = r.key === recommended; });

  return results;
}

export function getRecommendedScenario(scenarios: ScenarioResult[], aporteManual: number, anos: number): string {
  if (aporteManual > 0) {
    const mod = scenarios.find(s => s.key === "moderado")!;
    const con = scenarios.find(s => s.key === "conservador")!;

    if (aporteManual >= mod.pmt * 0.9) return "moderado";
    if (aporteManual >= con.pmt * 0.9) return "conservador";
    return "moderado";
  }

  if (anos <= 3) return "conservador";
  if (anos <= 10) return "moderado";
  return "agressivo";
}

export interface ScenarioComparison {
  key: string;
  label: string;
  yearsDiff: number;
  valueDiff: number;
  text: string;
}

export interface Recommendation {
  scenarioLabel: string;
  scenarioKey: string;
  color: string;
  action: string;
  benefit: string;
  sufficient: boolean;
  comparisons: ScenarioComparison[];
}

export function getRecommendation(
  scenarios: ScenarioResult[],
  valor: number,
  anos: number,
  aporteManual: number,
  valorInicial = 0
): Recommendation {
  const rec = scenarios.find(s => s.recommended)!;

  function compText(s: { label: string; yearsDiff: number; valueDiff: number }): string {
    if (s.yearsDiff > 0.5) return `${s.yearsDiff.toFixed(1)} anos mais rápido que ${s.label}`;
    if (s.valueDiff > 0) return `${fmt(s.valueDiff)} a mais que ${s.label}`;
    if (s.yearsDiff < -0.5) return `${s.label}: ${Math.abs(s.yearsDiff).toFixed(1)} anos a mais`;
    return "";
  }

  const comparisons: ScenarioComparison[] = scenarios
    .filter(s => s.key !== rec.key)
    .map(s => {
      const yearsDiff = s.yearsNeeded - rec.yearsNeeded;
      const valueDiff = rec.finalValue - s.finalValue;
      return {
        key: s.key,
        label: s.label,
        yearsDiff,
        valueDiff,
        text: compText({ label: s.label, yearsDiff, valueDiff }),
      };
    })
    .filter(c => c.text !== "");

  if (aporteManual > 0) {
    const diff = rec.pmt - aporteManual;
    if (diff <= 0) {
      const yearsNeeded = calcYearsNeeded(valor, aporteManual, rec.rate, valorInicial);
      const savedYears = anos - yearsNeeded;
      const benefit = savedYears > 0.5
        ? `Você pode antecipar em ${savedYears.toFixed(1)} anos`
        : `Você atinge a meta no prazo de ${anos} anos`;
      return {
        scenarioLabel: rec.label,
        scenarioKey: rec.key,
        color: rec.color,
        action: `Invista ${fmt(aporteManual)}/mês`,
        benefit,
        sufficient: true,
        comparisons,
      };
    } else {
      return {
        scenarioLabel: rec.label,
        scenarioKey: rec.key,
        color: rec.color,
        action: `Aumente para ${fmt(rec.pmt)}/mês (+${fmt(diff)})`,
        benefit: `Para atingir a meta no prazo de ${anos} anos`,
        sufficient: false,
        comparisons,
      };
    }
  }

  return {
    scenarioLabel: rec.label,
    scenarioKey: rec.key,
    color: rec.color,
    action: `Invista ${fmt(rec.pmt)}/mês`,
    benefit: `Cenário ${rec.label} (${(rec.rate * 100).toFixed(0)}% a.a.) — meta em ${anos} anos`,
    sufficient: true,
    comparisons,
  };
}

export interface Insight {
  icon: string;
  text: string;
  priority: number;
}

export function generateInsights(
  scenarios: ScenarioResult[],
  valor: number,
  anos: number,
  aporteManual: number,
  salario: number | null,
  valorInicial = 0
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
  const yearsNew = calcYearsNeeded(valor, pmtPlus50, 0.07, valorInicial);
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

  // URGENCY: Start today savings
  if (valorInicial === 0) {
    const pmtDelay1 = calcPMT(valor, 0.07, Math.max(0.5, anos - 1), 0);
    const increase1yr = pmtDelay1 - mod.pmt;
    if (increase1yr > 10) {
      insights.push({
        icon: "AlertTriangle",
        text: `Adiar 1 ano aumenta seu esforço mensal em ${fmt(increase1yr)}.`,
        priority: 2.5,
      });
    }
  }

  // Urgency: cost of delay (single insight, not duplicated)
  if (valorInicial === 0 && anos >= 3) {
    const fvToday = calcFV(mod.pmt, 0.07, anos, 0);
    const fvDelay1 = calcFV(mod.pmt, 0.07, anos - 1, 0);
    const lostValue = fvToday - fvDelay1;
    if (lostValue > 100) {
      insights.push({
        icon: "Zap",
        text: `Começar hoje economiza ${fmt(lostValue)} — cada ano de atraso custa caro pelos juros compostos.`,
        priority: 1.5,
      });
    }
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

  // Initial value advantage
  if (valorInicial > 0) {
    const pmtWithout = calcPMT(valor, 0.07, anos, 0);
    const pmtWith = calcPMT(valor, 0.07, anos, valorInicial);
    const saving = pmtWithout - pmtWith;
    if (saving > 10) {
      insights.push({
        icon: "Sparkles",
        text: `Seu capital inicial de ${fmt(valorInicial)} reduz o esforço mensal em ${fmt(saving)}.`,
        priority: 1,
      });
    }
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
