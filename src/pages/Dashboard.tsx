import { useMemo, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, Wallet, Plus, ChevronLeft, ChevronRight,
  ArrowRight, Target, Sparkles
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";
import { PageShell, PanelCardHeader } from "@/components/layout/page";
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

  const totalReceitas = monthTransactions.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const totalDespesas = monthTransactions.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;

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
  const avgDaily = monthTransactions.length > 0 ? totalDespesas / new Date(selectedYear, selectedMonth + 1, 0).getDate() : 0;
  const topCategory = categoryData[0];

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const cards = [
    {
      label: "Saldo do Mês",
      value: saldo,
      icon: Wallet,
      positive: saldo >= 0,
      gradient: saldo >= 0 ? "from-accent/20 to-accent/5" : "from-destructive/20 to-destructive/5",
      iconBg: saldo >= 0 ? "bg-accent/15" : "bg-destructive/15",
      textColor: saldo >= 0 ? "text-accent" : "text-destructive",
    },
    {
      label: "Receitas",
      value: totalReceitas,
      icon: ArrowUpRight,
      positive: true,
      gradient: "from-accent/20 to-accent/5",
      iconBg: "bg-accent/15",
      textColor: "text-accent",
    },
    {
      label: "Despesas",
      value: totalDespesas,
      icon: ArrowDownRight,
      positive: false,
      gradient: "from-destructive/20 to-destructive/5",
      iconBg: "bg-destructive/15",
      textColor: "text-destructive",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className={type.bodyMuted}>Carregando dados...</p>
        </div>
      </div>
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 30 }}
          className={cn(layout.card, "lg:col-span-2 relative cursor-pointer transition-colors hover:border-primary/40")}
          onClick={() => navigate("/transacoes")}
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
          <p className={cn(type.financialHero, cards[0].textColor)}>
            {fmt(saldo)}
          </p>
          <p className={cn(type.caption, "mt-4")}>
            {saldo >= 0 ? "Saldo positivo este mês" : "Despesas superiores às receitas"}
          </p>
        </motion.div>

        <div className={cn(layout.grid, "grid-cols-2 lg:grid-cols-1")}>
          {cards.slice(1).map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
              className={cn(layout.card, "relative cursor-pointer transition-colors hover:border-primary/40")}
              onClick={() => navigate("/transacoes")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={type.overline}>{c.label}</span>
                <div className={`h-7 w-7 rounded-md ${c.iconBg} flex items-center justify-center`}>
                  <c.icon className={`h-3.5 w-3.5 ${c.textColor}`} />
                </div>
              </div>
              <p className={cn(type.financial, c.textColor)}>{fmt(c.value)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights */}
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
              {goals.slice(0, 4).map((g) => {
                const pct = Math.min((g.valor_atual / g.valor_objetivo) * 100, 100);
                return (
                  <div key={g.id} className="cursor-pointer hover:bg-muted/50 rounded-lg p-3 -mx-3 transition-colors" onClick={() => navigate("/metas")}>
                    <div className="flex justify-between mb-2">
                      <span className={type.body}>{g.nome}</span>
                      <span className={cn(type.financialSm, "text-primary")}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <div className={cn("flex justify-between mt-1.5", type.caption)}>
                      <span className="font-mono-nums tabular-nums">{fmt(g.valor_atual)}</span>
                      <span className="font-mono-nums tabular-nums">{fmt(g.valor_objetivo)}</span>
                    </div>
                  </div>
                );
              })}
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
