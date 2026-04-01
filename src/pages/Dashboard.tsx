import { useMemo, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, Wallet, Plus, ChevronLeft, ChevronRight,
  ArrowRight, TrendingUp, Target
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog";

const CHART_COLORS = [
  "hsl(217, 91%, 50%)", "hsl(155, 60%, 42%)", "hsl(0, 72%, 51%)",
  "hsl(200, 65%, 50%)", "hsl(45, 70%, 50%)", "hsl(280, 50%, 55%)",
  "hsl(340, 55%, 50%)", "hsl(120, 40%, 45%)",
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
    { label: "Saldo do Mês", value: saldo, icon: Wallet, color: saldo >= 0 ? "text-accent" : "text-destructive", bg: saldo >= 0 ? "bg-accent/10" : "bg-destructive/10" },
    { label: "Receitas", value: totalReceitas, icon: ArrowUpRight, color: "text-accent", bg: "bg-accent/10" },
    { label: "Despesas", value: totalDespesas, icon: ArrowDownRight, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-ui">
            {profile.salario ? `Salário: ${fmt(profile.salario)}` : "Configure seu perfil para mais insights"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddTransaction(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
          <Button onClick={() => navigate("/metas")} variant="outline" size="sm" className="gap-2">
            <Target className="h-4 w-4" />
            Nova Meta
          </Button>
        </div>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="bg-secondary/80 rounded-full px-5 py-1.5">
          <span className="text-sm font-semibold tracking-ui">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
            className="glass-card rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
            onClick={() => navigate("/transacoes")}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono-nums ${c.color}`}>{fmt(c.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Transações", icon: ArrowUpRight, to: "/transacoes" },
          { label: "Metas", icon: Target, to: "/metas" },
          { label: "Projeções", icon: TrendingUp, to: "/projecoes" },
          { label: "Perfil", icon: Wallet, to: "/perfil" },
        ].map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            onClick={() => navigate(action.to)}
          >
            <action.icon className="h-5 w-5 text-primary" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-ui">Gastos por Categoria</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transacoes")} className="text-xs text-muted-foreground hover:text-primary">
              Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} strokeWidth={2} stroke="hsl(var(--card))">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {categoryData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-mono-nums">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">Nenhuma despesa registrada este mês.</p>
              <Button size="sm" variant="outline" onClick={() => setShowAddTransaction(true)}>
                <Plus className="h-4 w-4" /> Adicionar despesa
              </Button>
            </div>
          )}
        </motion.div>

        {/* Goals Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-ui">Metas Financeiras</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/metas")} className="text-xs text-muted-foreground hover:text-primary">
              Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((g) => {
                const pct = Math.min((g.valor_atual / g.valor_objetivo) * 100, 100);
                return (
                  <div key={g.id} className="cursor-pointer hover:bg-secondary/50 rounded-lg p-2 -mx-2 transition-colors" onClick={() => navigate("/metas")}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{g.nome}</span>
                      <span className="font-mono-nums text-primary font-semibold">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span className="font-mono-nums">{fmt(g.valor_atual)}</span>
                      <span className="font-mono-nums">{fmt(g.valor_objetivo)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">Nenhuma meta criada ainda.</p>
              <Button size="sm" variant="outline" onClick={() => navigate("/metas")}>
                <Target className="h-4 w-4" /> Criar meta
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-ui">Transações Recentes</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/transacoes")} className="text-xs text-muted-foreground hover:text-primary">
            Ver tudo <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        {transactions.length > 0 ? (
          <div className="space-y-0 divide-y divide-border/50">
            {transactions.slice(0, 8).map((t) => {
              const cat = categories.find((c) => c.id === t.categoria_id);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-secondary/50 rounded-lg px-2 -mx-2 transition-colors"
                  onClick={() => navigate("/transacoes")}
                >
                  <div>
                    <p className="text-sm font-medium">{t.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat?.nome ?? "Sem categoria"} · {new Date(t.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`font-mono-nums text-sm font-semibold ${t.tipo === "receita" ? "text-accent" : "text-destructive"}`}>
                    {t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-3">Nenhuma transação registrada.</p>
            <Button size="sm" onClick={() => setShowAddTransaction(true)}>
              <Plus className="h-4 w-4" /> Adicionar transação
            </Button>
          </div>
        )}
      </motion.div>

      <AddTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
    </div>
  );
}
