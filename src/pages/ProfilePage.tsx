import { useState, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/layout/page";
import { layout } from "@/lib/layout";

export default function ProfilePage() {
  const { profile, updateProfile } = useFinance();
  const { user } = useAuth();
  const [idade, setIdade] = useState("");
  const [salario, setSalario] = useState("");

  useEffect(() => {
    if (profile.idade) setIdade(String(profile.idade));
    if (profile.salario) setSalario(String(profile.salario));
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ idade: parseInt(idade) || null, salario: parseFloat(salario) || null });
    toast.success("Perfil atualizado com sucesso!");
  };

  return (
    <PageShell narrow>
      <PageHeader title="Perfil" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={layout.card}
      >
        <p className="text-sm text-muted-foreground mb-6">{user?.email}</p>

        <form onSubmit={handleSubmit} className={layout.stack}>
          <div>
            <Label>Idade</Label>
            <Input type="number" min="1" max="120" value={idade} onChange={(e) => setIdade(e.target.value)} className="font-mono-nums" />
          </div>
          <div>
            <Label>Salário Mensal (R$)</Label>
            <CurrencyInput value={salario} onValueChange={setSalario} placeholder="0,00" className="font-mono-nums" />
          </div>
          <Button type="submit">Salvar</Button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={layout.card}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Plano Atual</p>
        <p className="text-lg font-bold capitalize">{profile.plano}</p>
      </motion.div>
    </PageShell>
  );
}
