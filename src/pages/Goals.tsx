import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { PageShell, PageHeader } from "@/components/layout/page";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";

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
    <PageShell>
      <PageHeader title="Metas Financeiras">
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Fechar" : "Nova Meta"}
        </Button>
      </PageHeader>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className={cn(layout.card, layout.stack, "overflow-hidden")}
          >
            <div className={cn(layout.grid, "grid-cols-1 sm:grid-cols-2")}>
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
                <CurrencyInput value={form.valor_objetivo} onValueChange={(v) => setForm({ ...form, valor_objetivo: v })} placeholder="0,00" className="font-mono-nums" />
              </div>
              <div>
                <Label>Valor Atual (R$)</Label>
                <CurrencyInput value={form.valor_atual} onValueChange={(v) => setForm({ ...form, valor_atual: v })} placeholder="0,00" className="font-mono-nums" />
              </div>
            </div>
            {form.valor_objetivo && form.prazo && (
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
                <span className={type.bodyMuted}>Economia mensal necessária: </span>
                <span className={cn(type.financialSm, "text-primary")}>
                  {fmt(calcMonthly({ valor_objetivo: parseFloat(form.valor_objetivo) || 0, valor_atual: parseFloat(form.valor_atual) || 0, prazo: form.prazo }))}
                </span>
                {profile.salario && (
                  <span className={cn(type.caption, "ml-2")}>
                    ({((calcMonthly({ valor_objetivo: parseFloat(form.valor_objetivo) || 0, valor_atual: parseFloat(form.valor_atual) || 0, prazo: form.prazo }) / profile.salario) * 100).toFixed(0)}% do salário)
                  </span>
                )}
              </div>
            )}
            <Button type="submit">Criar Meta</Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className={cn(layout.grid, "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
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
              className={cn(layout.card, "group relative overflow-hidden transition-colors hover:border-primary/30")}
            >
              <button onClick={() => deleteGoal(g.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-opacity">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className={type.overline}>
                    {new Date(g.prazo).toLocaleDateString("pt-BR")}
                  </p>
                  <h3 className={type.sectionTitle}>{g.nome}</h3>
                </div>
                <span className={cn(type.financialSm, "text-primary")}>{pct.toFixed(0)}%</span>
              </div>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className={type.financialSm}>{fmt(g.valor_atual)}</span>
                  <span className={cn(type.financialSm, "text-muted-foreground")}>{fmt(g.valor_objetivo)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full bg-primary" />
                </div>
              </div>
              <p className={type.caption}>
                Economizar <span className={cn(type.financialSm, "text-foreground")}>{fmt(monthly)}</span>/mês
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
          <div className={cn("col-span-full", layout.emptyState)}>
            Nenhuma meta criada. Crie sua primeira meta financeira.
          </div>
        )}
      </div>
    </PageShell>
  );
}
