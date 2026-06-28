import { useMemo, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, Wallet, Plus, ChevronLeft, ChevronRight,
  ArrowRight, Target, Sparkles, TrendingUp, TrendingDown, Minus, Lightbulb, FileText, Flag, Info, HelpCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { CountUp } from "@/components/dashboard/CountUp";
import { PageShell, PanelCardHeader } from "@/components/layout/page";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { FinancialChartTooltip } from "@/components/charts/FinancialChartTooltip";
import {
  CHART_CATEGORY_COLORS,
  CHART_COLORS,
  CHART_MARGIN,
  CHART_STROKE_WIDTH,
  CHART_AREA_FILL_OPACITY,
  chartAxisProps,
  chartAxisTick,
  chartGridProps,
  chartTooltipStyle,
  chartTooltipLabelStyle,
  chartTooltipItemStyle,
  chartYAxisFormatter,
} from "@/lib/chart-theme";


const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Dashboard() {
  const { transactionsWithSalary: transactions, categories, goals, profile, loading } = useFinance();
  const navigate = useNavigate();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const monthTransactions = useMemo(
    () => transactions.filter((t) => {
      const d = new Date(t.data);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }),
    [transactions, selectedMonth, selectedYear]
  );

  // Previous month transactions for comparison
  const prevMonthDate = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    return { month: d.getMonth(), year: d.getFullYear() };
  }, [selectedMonth, selectedYear]);

  const prevMonthTransactions = useMemo(
    () => transactions.filter((t) => {
      const d = new Date(t.data);
      return d.getMonth() === prevMonthDate.month && d.getFullYear() === prevMonthDate.year;
    }),
    [transactions, prevMonthDate]
  );

  const totalReceitas = monthTransactions.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const totalDespesas = monthTransactions.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const prevReceitas = prevMonthTransactions.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const prevDespesas = prevMonthTransactions.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  const prevSaldo = prevReceitas - prevDespesas;
  const hasPrev = prevMonthTransactions.length > 0;

  const pctChange = (curr: number, prev: number): number | null => {
    if (!prev || prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions
      .filter((t) => t.tipo === "despesa")
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.categoria_id);
        const name = cat?.nome ?? "Sem categoria";
        map.set(name, (map.get(name) ?? 0) + t.valor);
      });
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthTransactions, categories]);

  // Daily cumulative balance for the selected month
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      receitas: 0,
      despesas: 0,
      saldo: 0,
    }));
    monthTransactions.forEach((t) => {
      const d = new Date(t.data).getDate();
      const idx = d - 1;
      if (!arr[idx]) return;
      if (t.tipo === "receita") arr[idx].receitas += t.valor;
      else arr[idx].despesas += t.valor;
    });
    let acc = 0;
    arr.forEach((d) => {
      acc += d.receitas - d.despesas;
      d.saldo = acc;
    });
    return arr;
  }, [monthTransactions, selectedMonth, selectedYear]);

  // Last 6 months trend
  const trendData = useMemo(() => {
    const out: { mes: string; receitas: number; despesas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const list = transactions.filter((t) => {
        const td = new Date(t.data);
        return td.getMonth() === m && td.getFullYear() === y;
      });
      out.push({
        mes: MONTHS[m].slice(0, 3),
        receitas: list.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0),
        despesas: list.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0),
      });
    }
    return out;
  }, [transactions, selectedMonth, selectedYear]);

  const savingsRate = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const avgDaily = monthTransactions.length > 0 ? totalDespesas / daysInMonth : 0;
  const topCategory = categoryData[0];

  // Projected end-of-month savings based on current pace
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  const elapsedDays = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
  const projectedDespesas = elapsedDays > 0 ? (totalDespesas / elapsedDays) * daysInMonth : totalDespesas;
  const projectedSaldo = totalReceitas - projectedDespesas;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const cards = [
    {
      label: "Saldo do Mês",
      value: saldo,
      prev: prevSaldo,
      icon: Wallet,
      // for saldo, increase is "good"
      positiveIsGood: true,
      iconBg: saldo >= 0 ? "bg-accent/15" : "bg-destructive/15",
      textColor: saldo >= 0 ? "text-accent" : "text-destructive",
    },
    {
      label: "Receitas",
      value: totalReceitas,
      prev: prevReceitas,
      icon: ArrowUpRight,
      positiveIsGood: true,
      iconBg: "bg-accent/15",
      textColor: "text-accent",
    },
    {
      label: "Despesas",
      value: totalDespesas,
      prev: prevDespesas,
      icon: ArrowDownRight,
      positiveIsGood: false, // increase is bad
      iconBg: "bg-destructive/15",
      textColor: "text-destructive",
    },
  ];

  if (loading) {
    return (
      <PageShell>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-72 mx-auto rounded-full" />
        <div className={cn(layout.grid, "grid-cols-1 lg:grid-cols-3")}>
          <Skeleton className="h-40 lg:col-span-2 rounded-xl" />
          <div className={cn(layout.grid, "grid-cols-2 lg:grid-cols-1")}>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
        <div className={cn(layout.gridLg, "grid-cols-1 lg:grid-cols-2")}>
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </PageShell>
    );
  }

  return (

    <PageShell>
      <div className={layout.pageHeader}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className={type.overlineAccent}>Visão Geral</span>
          </div>
          <h1 className={type.pageTitleHero}>Dashboard</h1>
          <p className={cn(type.pageDesc, "mt-2")}>
            {profile.salario ? `Salário mensal · ${fmt(profile.salario)}` : "Configure seu perfil para mais insights"}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2">
          <Button onClick={() => setShowAddTransaction(true)} size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
          <Button onClick={() => navigate("/metas")} variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5">
            <Target className="h-4 w-4" />
            Nova Meta
          </Button>
        </motion.div>
      </div>

      {/* Month selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="bg-card border border-border/50 rounded-full px-6 py-2 min-w-[180px] text-center">
          <span className={cn(type.body, "font-medium")}>
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Hero balance + secondary cards */}
      <div className={cn(layout.grid, "grid-cols-1 lg:grid-cols-3")}>
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 30 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.995 }}
          className={cn(
            layout.card,
            "lg:col-span-2 relative text-left cursor-pointer transition-all hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          )}
          onClick={() => navigate("/transacoes")}
          aria-label="Ver todas as transações"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className={type.overline}>Saldo do Mês</span>
              <p className={cn(type.caption, "mt-1.5")}>
                {MONTHS[selectedMonth]} · {selectedYear}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-lg ${cards[0].iconBg} flex items-center justify-center`}>
              <Wallet className={`h-5 w-5 ${cards[0].textColor}`} />
            </div>
          </div>
          <CountUp value={saldo} format={fmt} className={cn(type.financialHero, cards[0].textColor)} />
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <p className={type.caption}>
              {saldo >= 0 ? "Saldo positivo este mês" : "Despesas superiores às receitas"}
            </p>
            {hasPrev && (
              <DeltaBadge
                pct={pctChange(saldo, prevSaldo)}
                positiveIsGood={cards[0].positiveIsGood}
                label="vs mês anterior"
              />
            )}
          </div>
        </motion.button>

        <div className={cn(layout.grid, "grid-cols-2 lg:grid-cols-1")}>
          {cards.slice(1).map((c, i) => {
            const tipo = c.label === "Receitas" ? "receita" : "despesa";
            return (
              <motion.button
                type="button"
                key={c.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
                className={cn(
                  layout.card,
                  "relative text-left cursor-pointer transition-all hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                )}
                onClick={() => navigate(`/transacoes?tipo=${tipo}`)}
                aria-label={`Ver ${c.label.toLowerCase()} do mês`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={type.overline}>{c.label}</span>
                  <div className={`h-7 w-7 rounded-md ${c.iconBg} flex items-center justify-center`}>
                    <c.icon className={`h-3.5 w-3.5 ${c.textColor}`} />
                  </div>
                </div>
                <CountUp value={c.value} format={fmt} className={cn(type.financial, c.textColor)} />
                {hasPrev && (
                  <div className="mt-2">
                    <DeltaBadge
                      pct={pctChange(c.value, c.prev)}
                      positiveIsGood={c.positiveIsGood}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>


      {/* Insights + Month Summary */}
      <div className={cn(layout.gridLg, "grid-cols-1 lg:grid-cols-2")}>
        <InsightsCard
          monthName={MONTHS[selectedMonth]}
          monthCount={monthTransactions.length}
          totalDespesas={totalDespesas}
          prevDespesas={prevDespesas}
          hasPrev={hasPrev}
          topCategory={topCategory}
          savingsRate={savingsRate}
          projectedSaldo={projectedSaldo}
          isCurrentMonth={isCurrentMonth}
          fmt={fmt}
        />
        <MonthSummaryCard
          monthName={MONTHS[selectedMonth]}
          year={selectedYear}
          totalCount={monthTransactions.length}
          savingsRate={savingsRate}
          totalReceitas={totalReceitas}
          totalDespesas={totalDespesas}
          topCategory={topCategory}
          goals={goals}
          fmt={fmt}
        />
      </div>

      {/* Insights stats */}
      <div className={cn(layout.grid, "grid-cols-2 lg:grid-cols-4")}>
        {[
          {
            label: "Taxa de Poupança",
            value: `${savingsRate.toFixed(1)}%`,
            hint: savingsRate >= 20 ? "Excelente" : savingsRate >= 10 ? "Saudável" : "Pode melhorar",
          },
          {
            label: "Gasto Médio Diário",
            value: fmt(avgDaily),
            hint: `${MONTHS[selectedMonth].slice(0, 3)}/${selectedYear}`,
          },
          {
            label: "Maior Categoria",
            value: topCategory ? topCategory.name : "—",
            hint: topCategory ? fmt(topCategory.value) : "Sem despesas",
          },
          {
            label: "Transações",
            value: String(monthTransactions.length),
            hint: "no mês",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.04 }}
            className={layout.card}
          >
            <span className={type.overline}>{k.label}</span>
            <p className={cn(type.statValue, "mt-3 truncate")}>{k.value}</p>
            <p className={cn(type.statHint, "mt-1.5")}>{k.hint}</p>
          </motion.div>
        ))}
      </div>

      {/* Cumulative balance chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={layout.card}
      >
        <PanelCardHeader
          title="Evolução do Saldo"
          description={`Saldo acumulado dia a dia · ${MONTHS[selectedMonth]}`}
        />
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={dailyData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={CHART_AREA_FILL_OPACITY.top} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={CHART_AREA_FILL_OPACITY.bottom} />
                </linearGradient>
              </defs>
              <CartesianGrid {...chartGridProps} />
              <XAxis dataKey="day" tick={chartAxisTick} {...chartAxisProps} />
              <YAxis tick={chartAxisTick} {...chartAxisProps} width={64} tickFormatter={chartYAxisFormatter} />
              <Tooltip
                content={
                  <FinancialChartTooltip
                    labelFormatter={(l) => `Dia ${l}`}
                    valueFormatter={fmt}
                    nameFormatter={() => "Saldo"}
                  />
                }
                cursor={{ stroke: CHART_COLORS.grid, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke={CHART_COLORS.primary}
                strokeWidth={CHART_STROKE_WIDTH}
                fill="url(#saldoFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.primary }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 6-month trend */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={layout.card}
      >
        <PanelCardHeader title="Receitas vs Despesas" description="Últimos 6 meses" />
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={trendData} margin={CHART_MARGIN} barGap={4} barCategoryGap="20%">
              <CartesianGrid {...chartGridProps} />
              <XAxis dataKey="mes" tick={chartAxisTick} {...chartAxisProps} />
              <YAxis tick={chartAxisTick} {...chartAxisProps} width={64} tickFormatter={chartYAxisFormatter} />
              <Tooltip
                content={
                  <FinancialChartTooltip
                    valueFormatter={fmt}
                    nameFormatter={(n) => (n === "receitas" ? "Receitas" : "Despesas")}
                  />
                }
                cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "hsl(var(--foreground))", paddingBottom: 8 }}
                formatter={(v) => (v === "receitas" ? "Receitas" : "Despesas")}
              />
              <Bar dataKey="receitas" fill={CHART_COLORS.accent} radius={[2, 2, 0, 0]} maxBarSize={32} />
              <Bar dataKey="despesas" fill={CHART_COLORS.destructive} radius={[2, 2, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className={cn(layout.gridLg, "grid-cols-1 lg:grid-cols-2")}>
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={layout.card}
        >
          <PanelCardHeader
            title="Gastos por Categoria"
            description="Distribuição mensal"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("/transacoes")} className="text-xs text-muted-foreground hover:text-primary">
                Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            }
          />
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={44}
                      strokeWidth={1}
                      stroke={CHART_COLORS.card}
                      paddingAngle={1}
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_CATEGORY_COLORS[i % CHART_CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <FinancialChartTooltip
                          valueFormatter={fmt}
                          nameFormatter={(n) => n}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {categoryData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: CHART_CATEGORY_COLORS[i % CHART_CATEGORY_COLORS.length] }} />
                      <span className={type.caption}>{d.name}</span>
                    </div>
                    <span className={type.financialSm}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              message="Nenhuma despesa registrada este mês."
              action="Adicionar despesa"
              onClick={() => setShowAddTransaction(true)}
            />
          )}
        </motion.div>

        {/* Goals Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={layout.card}
        >
          <PanelCardHeader
            title="Metas Financeiras"
            description={`${goals.length} meta${goals.length !== 1 ? "s" : ""} ativa${goals.length !== 1 ? "s" : ""}`}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("/metas")} className="text-xs text-muted-foreground hover:text-primary">
                Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            }
          />
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((g) => (
                <GoalRow key={g.id} goal={g} fmt={fmt} onClick={() => navigate("/metas")} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="Nenhuma meta criada ainda."
              action="Criar meta"
              onClick={() => navigate("/metas")}
            />
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={layout.card}
      >
        <PanelCardHeader
          title="Transações Recentes"
          description={`${transactions.length} transaç${transactions.length !== 1 ? "ões" : "ão"}`}
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate("/transacoes")} className="text-xs text-muted-foreground hover:text-primary">
              Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          }
        />
        {transactions.length > 0 ? (
          <div className="space-y-0 divide-y divide-border/30">
            {transactions.slice(0, 8).map((t) => {
              const cat = categories.find((c) => c.id === t.categoria_id);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-muted/50 rounded-lg px-3 -mx-3 transition-colors"
                  onClick={() => navigate("/transacoes")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.tipo === "receita" ? "bg-accent/10" : "bg-destructive/10"}`}>
                      {t.tipo === "receita" ? (
                        <ArrowUpRight className="h-4 w-4 text-accent" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className={cn(type.body, "font-medium")}>{t.descricao}</p>
                      <p className={type.caption}>
                        {cat?.nome ?? "Sem categoria"} · {new Date(t.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span className={cn(type.financialSm, t.tipo === "receita" ? "text-accent" : "text-destructive")}>
                    {t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            message="Nenhuma transação registrada."
            action="Adicionar transação"
            onClick={() => setShowAddTransaction(true)}
          />
        )}
      </motion.div>

      <AddTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
    </PageShell>
  );
}

function DeltaBadge({
  pct,
  positiveIsGood,
  label,
}: {
  pct: number | null;
  positiveIsGood: boolean;
  label?: string;
}) {
  if (pct === null || !isFinite(pct)) return null;
  const isUp = pct > 0.05;
  const isDown = pct < -0.05;
  const isFlat = !isUp && !isDown;
  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
  const good = isFlat ? false : (isUp ? positiveIsGood : !positiveIsGood);
  const color = isFlat
    ? "text-muted-foreground bg-muted/40 border-border/50"
    : good
      ? "text-accent bg-accent/10 border-accent/20"
      : "text-destructive bg-destructive/10 border-destructive/20";
  const sign = isUp ? "+" : isDown ? "" : "";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium font-mono-nums tabular-nums", color)}>
      <Icon className="h-3 w-3" />
      {sign}{pct.toFixed(1)}%
      {label && <span className="text-muted-foreground font-normal ml-1">{label}</span>}
    </span>
  );
}

function InsightsCard({
  monthName, monthCount, totalDespesas, prevDespesas, hasPrev,
  topCategory, savingsRate, projectedSaldo, isCurrentMonth, fmt,
}: {
  monthName: string;
  monthCount: number;
  totalDespesas: number;
  prevDespesas: number;
  hasPrev: boolean;
  topCategory?: { name: string; value: number };
  savingsRate: number;
  projectedSaldo: number;
  isCurrentMonth: boolean;
  fmt: (v: number) => string;
}) {
  const insights: { text: string; good?: boolean }[] = [];

  if (hasPrev && prevDespesas > 0) {
    const diff = ((totalDespesas - prevDespesas) / prevDespesas) * 100;
    if (Math.abs(diff) >= 1) {
      insights.push({
        text: diff < 0
          ? `Você gastou ${Math.abs(diff).toFixed(1)}% menos que no mês passado.`
          : `Seus gastos aumentaram ${diff.toFixed(1)}% em relação ao mês passado.`,
        good: diff < 0,
      });
    }
  }

  if (topCategory) {
    insights.push({ text: `Sua maior categoria foi ${topCategory.name} (${fmt(topCategory.value)}).` });
  }

  if (monthCount > 0) {
    insights.push({
      text: `Sua taxa de poupança foi ${savingsRate.toFixed(1)}%.`,
      good: savingsRate >= 10,
    });
  }

  if (isCurrentMonth && monthCount > 1) {
    insights.push({
      text: `Mantendo esse ritmo, sua economia prevista será de ${fmt(projectedSaldo)}.`,
      good: projectedSaldo >= 0,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className={layout.card}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            <span className={type.overlineAccent}>Insights Financeiros</span>
          </div>
          <p className={type.panelDesc}>Análise automática do mês de {monthName}</p>
        </div>
      </div>
      {insights.length === 0 ? (
        <p className={cn(type.bodyMuted, "py-4")}>
          Registre mais transações para desbloquear análises automáticas do seu mês.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {insights.map((i, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className={cn(
                "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
                i.good === undefined ? "bg-primary" : i.good ? "bg-accent" : "bg-destructive"
              )} />
              <span className={type.body}>{i.text}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function MonthSummaryCard({
  monthName, year, totalCount, savingsRate, totalReceitas, totalDespesas, topCategory, goals, fmt,
}: {
  monthName: string;
  year: number;
  totalCount: number;
  savingsRate: number;
  totalReceitas: number;
  totalDespesas: number;
  topCategory?: { name: string; value: number };
  goals: { id: string; nome: string; valor_atual: number; valor_objetivo: number }[];
  fmt: (v: number) => string;
}) {
  const saldo = totalReceitas - totalDespesas;
  const mood = saldo > 0 && savingsRate >= 15
    ? `${monthName} foi um ótimo mês.`
    : saldo > 0
      ? `${monthName} fechou no positivo.`
      : totalCount > 0
        ? `${monthName} pediu mais atenção aos gastos.`
        : `${monthName} ainda não tem transações.`;

  const nearGoal = goals
    .map((g) => ({ ...g, pct: g.valor_objetivo > 0 ? (g.valor_atual / g.valor_objetivo) * 100 : 0 }))
    .filter((g) => g.pct >= 80 && g.pct < 100)
    .sort((a, b) => b.pct - a.pct)[0];

  const bullets: string[] = [];
  if (totalCount > 0) bullets.push(`Você realizou ${totalCount} transaç${totalCount === 1 ? "ão" : "ões"}.`);
  if (totalReceitas > 0) bullets.push(`Economizou ${savingsRate.toFixed(0)}% da renda.`);
  if (topCategory) bullets.push(`Sua maior despesa foi ${topCategory.name}.`);
  if (nearGoal) bullets.push(`Está próximo de concluir a meta "${nearGoal.nome}" (${nearGoal.pct.toFixed(0)}%).`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.26 }}
      className={layout.card}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className={type.overlineAccent}>Resumo do Mês</span>
          </div>
          <p className={type.panelDesc}>{monthName} · {year}</p>
        </div>
      </div>
      <p className={cn(type.body, "font-medium mb-3")}>{mood}</p>
      {bullets.length > 0 ? (
        <ul className="space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className={cn(type.bodyMuted, "flex gap-2")}>
              <span className="text-primary">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={type.bodyMuted}>Adicione transações para ver um resumo completo.</p>
      )}
    </motion.div>
  );
}

function GoalRow({
  goal, fmt, onClick,
}: {
  goal: { id: string; nome: string; valor_atual: number; valor_objetivo: number; prazo: string };
  fmt: (v: number) => string;
  onClick: () => void;
}) {
  const pct = goal.valor_objetivo > 0 ? Math.min((goal.valor_atual / goal.valor_objetivo) * 100, 100) : 0;
  const restante = Math.max(goal.valor_objetivo - goal.valor_atual, 0);
  const completed = pct >= 100;
  const almost = !completed && pct >= 80;

  // Forecast completion date (based on linear progress so far)
  let forecast: string | null = null;
  if (!completed && goal.valor_atual > 0 && goal.prazo) {
    const prazoDate = new Date(goal.prazo);
    // simple: if at current pace they reach target on/before deadline → show deadline,
    // otherwise estimate using months elapsed since "now" isn't trackable here, so just show deadline as forecast
    if (!isNaN(prazoDate.getTime())) {
      forecast = prazoDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    }
  }

  return (
    <div className="cursor-pointer hover:bg-muted/50 rounded-lg p-3 -mx-3 transition-colors" onClick={onClick}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn(type.body, "truncate")}>{goal.nome}</span>
          {completed && (
            <span className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              <Flag className="h-2.5 w-2.5" /> Concluída
            </span>
          )}
          {almost && (
            <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Falta pouco
            </span>
          )}
        </div>
        <span className={cn(type.financialSm, "text-primary shrink-0")}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", completed ? "bg-accent" : almost ? "bg-primary" : "bg-primary/80")}
        />
      </div>
      <div className={cn("flex justify-between mt-1.5", type.caption)}>
        <span className="font-mono-nums tabular-nums">{fmt(goal.valor_atual)} / {fmt(goal.valor_objetivo)}</span>
        <span className="font-mono-nums tabular-nums">
          {completed ? "Meta atingida" : `Faltam ${fmt(restante)}`}
        </span>
      </div>
      {forecast && !completed && (
        <p className={cn(type.caption, "mt-1")}>Previsão: {forecast}</p>
      )}
    </div>
  );
}

function EmptyState({ message, action, onClick }: { message: string; action: string; onClick: () => void }) {
  return (
    <div className="text-center py-10">
      <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
        <Plus className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className={cn(type.bodyMuted, "mb-4")}>{message}</p>
      <Button size="sm" variant="outline" onClick={onClick} className="border-border/50 hover:border-primary/40 hover:bg-primary/5">
        <Plus className="h-4 w-4 mr-1" /> {action}
      </Button>
    </div>
  );
}
