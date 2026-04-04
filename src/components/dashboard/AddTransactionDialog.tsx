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
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setDescricao(""); setValor(""); setTipo("despesa"); setCategoriaId(""); setNewCategory("");
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
        // Category will be available after refresh, use null for now
        catId = null;
      }
      await addTransaction({
        descricao,
        valor: parseFloat(valor),
        tipo,
        categoria_id: catId,
        data,
      });
      toast.success("Transação adicionada!");
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
            {categories.length > 0 ? (
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Criar categoria (ex: Alimentação)" />
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
