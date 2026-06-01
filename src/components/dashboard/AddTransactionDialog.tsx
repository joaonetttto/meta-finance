import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: Props) {
  const { categories, addTransaction, addCategory } = useFinance();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
  const [categoriaId, setCategoriaId] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [newCategory, setNewCategory] = useState("");
  const [parcelado, setParcelado] = useState(false);
  const [parcelas, setParcelas] = useState("2");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setDescricao(""); setValor(""); setTipo("despesa"); setCategoriaId(""); setNewCategory("");
    setParcelado(false); setParcelas("2");
    setData(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) { toast.error("Preencha todos os campos"); return; }

    setSubmitting(true);
    try {
      let catId = categoriaId || null;
      if (newCategory.trim()) {
        await addCategory(newCategory.trim());
        catId = null;
      }

      const total = parseFloat(valor);
      const n = parcelado ? Math.max(2, Math.min(60, parseInt(parcelas) || 2)) : 1;
      const valorParcela = total / n;
      const [yy, mm, dd] = data.split("-").map(Number);

      for (let i = 0; i < n; i++) {
        const d = new Date(yy, mm - 1 + i, dd);
        const iso = d.toISOString().split("T")[0];
        await addTransaction({
          descricao: n > 1 ? `${descricao} (${i + 1}/${n})` : descricao,
          valor: valorParcela,
          tipo,
          categoria_id: catId,
          data: iso,
        });
      }

      toast.success(n > 1 ? `${n} parcelas adicionadas!` : "Transação adicionada!");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao adicionar transação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Almoço" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <CurrencyInput value={valor} onValueChange={setValor} placeholder="0,00" className="font-mono-nums" />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              <Button type="button" variant={tipo === "despesa" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setTipo("despesa")}>
                Despesa
              </Button>
              <Button type="button" variant={tipo === "receita" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setTipo("receita")}>
                Receita
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            {categories.length > 0 && (
              <Select
                value={categoriaId}
                onValueChange={(v) => { setCategoriaId(v); setNewCategory(""); }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione uma categoria existente..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">ou criar nova</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Input
              value={newCategory}
              onChange={(e) => { setNewCategory(e.target.value); if (e.target.value) setCategoriaId(""); }}
              placeholder="Ex: Alimentação"
            />
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium">Parcelado</p>
                <p className="text-xs text-muted-foreground">Dividir o valor em vários meses</p>
              </div>
              <input
                type="checkbox"
                checked={parcelado}
                onChange={(e) => setParcelado(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
            </label>
            {parcelado && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nº de parcelas</Label>
                  <Input
                    type="number"
                    min={2}
                    max={60}
                    value={parcelas}
                    onChange={(e) => setParcelas(e.target.value)}
                    className="font-mono-nums"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Valor por parcela</Label>
                  <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-background text-sm font-mono-nums text-muted-foreground">
                    {valor && parseInt(parcelas) > 0
                      ? (parseFloat(valor) / parseInt(parcelas)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
