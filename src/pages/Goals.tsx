import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, profile } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", valor_objetivo: "", valor_atual: "", prazo: "" });

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGoal({
      nome: form.nome,
      valor_objetivo: parseFloat(form.valor_objetivo),
      valor_atual: parseFloat(form.valor_atual) || 0,
      prazo: form.prazo,
    });
    setForm({ nome: "", valor_objetivo: "", valor_atual: "", prazo: "" });
    setShowForm(false);
  };

  const calcMonthly = (goal: { valor_objetivo: number; valor_atual: number; prazo: string }) => {
    const remaining = goal.valor_objetivo - goal.valor_atual;
    if (remaining <= 0) return 0;
    const months = Math.max(1, Math.ceil((new Date(goal.prazo).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30.44)));
    return remaining / months;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-display">Metas Financeiras</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Fechar" : "Nova Meta"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Meta</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Viagem para Europa" required />
              </div>
              <div>
                <Label>Prazo</Label>
                <Input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} required className="font-mono-nums" />
              </div>
              <div>
                <Label>Valor Objetivo (R$)</Label>
                <Input type="number" step="0.01" min="1" value={form.valor_objetivo} onChange={(e) => setForm({ ...form, valor_objetivo: e.target.value })} required className="font-mono-nums" />
              </div>
              <div>
                <Label>Valor Atual (R$)</Label>
                <Input type="number" step="0.01" min="0" value={form.valor_atual} onChange={(e) => setForm({ ...form, valor_atual: e.target.value })} className="font-mono-nums" />
              </div>
            </div>
            {form.valor_objetivo && form.prazo && (
              <div className="rounded-lg bg-accent/50 p-4 text-sm">
                <span className="text-muted-foreground">Economia mensal necessária: </span>
                <span className="font-mono-nums font-semibold text-primary">
                  {fmt(calcMonthly({ valor_objetivo: parseFloat(form.valor_objetivo) || 0, valor_atual: parseFloat(form.valor_atual) || 0, prazo: form.prazo }))}
                </span>
                {profile.salario && (
                  <span className="text-muted-foreground ml-2">
                    ({((calcMonthly({ valor_objetivo: parseFloat(form.valor_objetivo) || 0, valor_atual: parseFloat(form.valor_atual) || 0, prazo: form.prazo }) / profile.salario) * 100).toFixed(0)}% do salário)
                  </span>
                )}
              </div>
            )}
            <Button type="submit">Criar Meta</Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g, i) => {
          const pct = Math.min((g.valor_atual / g.valor_objetivo) * 100, 100);
          const monthly = calcMonthly(g);
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <button onClick={() => deleteGoal(g.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-opacity">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {new Date(g.prazo).toLocaleDateString("pt-BR")}
                  </p>
                  <h3 className="text-lg font-bold">{g.nome}</h3>
                </div>
                <span className="text-sm font-mono-nums font-bold text-primary">{pct.toFixed(0)}%</span>
              </div>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-mono-nums">{fmt(g.valor_atual)}</span>
                  <span className="text-muted-foreground font-mono-nums">{fmt(g.valor_objetivo)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full bg-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Economizar <span className="font-mono-nums font-medium text-foreground">{fmt(monthly)}</span>/mês
              </p>
              <div className="mt-3">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Atualizar valor atual"
                  className="font-mono-nums h-8 text-xs"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      const val = parseFloat((e.target as HTMLInputElement).value);
                      if (!isNaN(val)) {
                        await updateGoal(g.id, { valor_atual: val });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
            Nenhuma meta criada. Crie sua primeira meta financeira.
          </div>
        )}
      </div>
    </div>
  );
}
