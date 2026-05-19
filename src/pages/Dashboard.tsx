import { useMemo, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, Wallet, Plus, ChevronLeft, ChevronRight,
  ArrowRight, TrendingUp, Target, Sparkles
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";

const CHART_COLORS = [
  "hsl(217, 91%, 60%)", "hsl(155, 60%, 45%)", "hsl(45, 70%, 55%)",
  "hsl(200, 65%, 50%)", "hsl(280, 50%, 55%)", "hsl(340, 55%, 50%)",
  "hsl(0, 72%, 55%)", "hsl(120, 40%, 45%)",
];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Dashboard() {
  const { transactions, categories, goals, profile, loading } = useFinance();
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
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 md:space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">Visão Geral</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-xs mt-2">
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
          <span className="text-xs font-semibold tracking-ui">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Hero balance + secondary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 30 }}
          className="lg:col-span-2 relative rounded-2xl border border-border bg-card p-8 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/transacoes")}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Saldo do Mês</span>
              <p className="text-xs text-muted-foreground/70 mt-1.5">
                {MONTHS[selectedMonth]} · {selectedYear}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-lg ${cards[0].iconBg} flex items-center justify-center`}>
              <Wallet className={`h-5 w-5 ${cards[0].textColor}`} />
            </div>
          </div>
          <p className={`text-5xl md:text-6xl font-bold font-mono-nums tracking-tight ${cards[0].textColor}`}>
            {fmt(saldo)}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            {saldo >= 0 ? "Saldo positivo este mês" : "Despesas superiores às receitas"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          {cards.slice(1).map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
              className="relative rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => navigate("/transacoes")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{c.label}</span>
                <div className={`h-7 w-7 rounded-md ${c.iconBg} flex items-center justify-center`}>
                  <c.icon className={`h-3.5 w-3.5 ${c.textColor}`} />
                </div>
              </div>
              <p className={`text-xl font-bold font-mono-nums ${c.textColor}`}>{fmt(c.value)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Transações", icon: ArrowUpRight, to: "/transacoes" },
          { label: "Metas", icon: Target, to: "/metas" },
          { label: "Projeções", icon: TrendingUp, to: "/projecoes" },
          { label: "Perfil", icon: Wallet, to: "/perfil" },
        ].map((action, i) => (
          <motion.div key={action.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.03 }}>
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2 border-border/50 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-200"
              onClick={() => navigate(action.to)}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Gastos por Categoria</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Distribuição mensal</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transacoes")} className="text-xs text-muted-foreground hover:text-primary">
              Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={42} strokeWidth={2} stroke="hsl(var(--card))">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => fmt(v)}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {categoryData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-muted-foreground text-xs">{d.name}</span>
                    </div>
                    <span className="font-mono-nums text-xs font-semibold">{fmt(d.value)}</span>
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
          className="rounded-xl border border-border/50 bg-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Metas Financeiras</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{goals.length} meta{goals.length !== 1 ? "s" : ""} ativa{goals.length !== 1 ? "s" : ""}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/metas")} className="text-xs text-muted-foreground hover:text-primary">
              Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((g) => {
                const pct = Math.min((g.valor_atual / g.valor_objetivo) * 100, 100);
                return (
                  <div key={g.id} className="cursor-pointer hover:bg-muted/50 rounded-lg p-3 -mx-3 transition-colors" onClick={() => navigate("/metas")}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{g.nome}</span>
                      <span className="font-mono-nums text-primary font-semibold text-xs">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                      <span className="font-mono-nums">{fmt(g.valor_atual)}</span>
                      <span className="font-mono-nums">{fmt(g.valor_objetivo)}</span>
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
        className="rounded-xl border border-border/50 bg-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Transações Recentes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{transactions.length} transaç{transactions.length !== 1 ? "ões" : "ão"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/transacoes")} className="text-xs text-muted-foreground hover:text-primary">
            Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
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
                      <p className="text-sm font-medium">{t.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.nome ?? "Sem categoria"} · {new Date(t.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <span className={`font-mono-nums text-sm font-semibold ${t.tipo === "receita" ? "text-accent" : "text-destructive"}`}>
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
    </div>
  );
}

function EmptyState({ message, action, onClick }: { message: string; action: string; onClick: () => void }) {
  return (
    <div className="text-center py-10">
      <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
        <Plus className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <Button size="sm" variant="outline" onClick={onClick} className="border-border/50 hover:border-primary/40 hover:bg-primary/5">
        <Plus className="h-4 w-4 mr-1" /> {action}
      </Button>
    </div>
  );
}
