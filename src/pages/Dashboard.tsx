import { useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const CHART_COLORS = [
  "hsl(245, 55%, 42%)",
  "hsl(155, 45%, 40%)",
  "hsl(15, 55%, 48%)",
  "hsl(200, 50%, 45%)",
  "hsl(45, 60%, 50%)",
  "hsl(280, 40%, 50%)",
  "hsl(340, 45%, 50%)",
  "hsl(120, 30%, 45%)",
];

export default function Dashboard() {
  const { transactions, categories, goals, profile, loading } = useFinance();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTransactions = useMemo(
    () => transactions.filter((t) => {
      const d = new Date(t.data);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }),
    [transactions, currentMonth, currentYear]
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
    { label: "Saldo do Mês", value: saldo, icon: Wallet, color: saldo >= 0 ? "text-success" : "text-destructive" },
    { label: "Receitas", value: totalReceitas, icon: ArrowUpRight, color: "text-success" },
    { label: "Despesas", value: totalDespesas, icon: ArrowDownRight, color: "text-destructive" },
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
      <div>
        <h1 className="text-3xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-ui">
          {profile.salario ? `Salário: ${fmt(profile.salario)}` : "Configure seu perfil para mais insights"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <p className={`text-2xl font-bold font-mono-nums ${c.color}`}>{fmt(c.value)}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold tracking-ui mb-4">Gastos por Categoria</h2>
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
            <p className="text-sm text-muted-foreground">Nenhuma despesa registrada este mês.</p>
          )}
        </motion.div>

        {/* Goals Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold tracking-ui mb-4">Metas Financeiras</h2>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 4).map((g) => {
                const pct = Math.min((g.valor_atual / g.valor_objetivo) * 100, 100);
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{g.nome}</span>
                      <span className="font-mono-nums text-primary">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-primary"
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
            <p className="text-sm text-muted-foreground">Nenhuma meta criada ainda.</p>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <h2 className="text-sm font-semibold tracking-ui mb-4">Transações Recentes</h2>
        {transactions.length > 0 ? (
          <div className="space-y-0 divide-y divide-border">
            {transactions.slice(0, 8).map((t) => {
              const cat = categories.find((c) => c.id === t.categoria_id);
              return (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{t.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat?.nome ?? "Sem categoria"} · {new Date(t.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`font-mono-nums text-sm font-semibold ${t.tipo === "receita" ? "text-success" : "text-destructive"}`}>
                    {t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma transação registrada.</p>
        )}
      </motion.div>
    </div>
  );
}
