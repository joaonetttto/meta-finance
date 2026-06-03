import { useState } from "react";
import { useFinance, type Transaction } from "@/contexts/FinanceContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageShell, PageHeader } from "@/components/layout/page";
import { layout, type } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface FormData {
  valor: string;
  tipo: "receita" | "despesa";
  categoria_id: string;
  data: string;
  descricao: string;
}

const empty: FormData = { valor: "", tipo: "despesa", categoria_id: "", data: new Date().toISOString().slice(0, 10), descricao: "" };

export default function Transactions() {
  const { transactionsWithSalary: transactions, categories, addTransaction, updateTransaction, deleteTransaction, addCategory } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [newCat, setNewCat] = useState("");

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { valor: parseFloat(form.valor), tipo: form.tipo, categoria_id: form.categoria_id || null, data: form.data, descricao: form.descricao };
    if (editing) {
      await updateTransaction(editing, data);
      setEditing(null);
    } else {
      await addTransaction(data);
    }
    setForm(empty);
    setShowForm(false);
  };

  const startEdit = (t: Transaction) => {
    setForm({ valor: String(t.valor), tipo: t.tipo, categoria_id: t.categoria_id ?? "", data: t.data, descricao: t.descricao });
    setEditing(t.id);
    setShowForm(true);
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    await addCategory(newCat.trim());
    setNewCat("");
  };

  return (
    <PageShell>
      <PageHeader title="Transações">
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(empty); }} size="sm" className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Fechar" : "Nova Transação"}
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
                <Label>Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <CurrencyInput value={form.valor} onValueChange={(v) => setForm({ ...form, valor: v })} placeholder="0,00" className="font-mono-nums" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as "receita" | "despesa" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data</Label>
                <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required className="font-mono-nums" />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.categoria_id} onValueChange={(v) => setForm({ ...form, categoria_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nova Categoria</Label>
                <div className="flex gap-2">
                  <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Ex: Alimentação" />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCategory}>+</Button>
                </div>
              </div>
            </div>
            <Button type="submit">{editing ? "Salvar" : "Adicionar"}</Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className={cn(layout.card, "overflow-hidden p-0")}>
        {transactions.length > 0 ? (
          <div className="divide-y divide-border">
            {transactions.map((t, i) => {
              const cat = categories.find((c) => c.id === t.categoria_id);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn(type.body, "font-medium truncate")}>{t.descricao}</p>
                    <p className={type.caption}>
                      {cat?.nome ?? "Sem categoria"} · {new Date(t.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(type.financialSm, t.tipo === "receita" ? "text-success" : "text-destructive")}>
                      {t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}
                    </span>
                    {t.virtual ? (
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 rounded border border-border/50">
                        <Lock className="h-3 w-3" /> Auto
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button onClick={() => startEdit(t)} className="p-1 rounded hover:bg-accent"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        <button onClick={() => deleteTransaction(t.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className={layout.emptyState}>
            Nenhuma transação registrada. Adicione sua primeira transação.
          </div>
        )}
      </div>
    </PageShell>
  );
}
