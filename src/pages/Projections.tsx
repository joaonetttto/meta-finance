import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";

export default function Projections() {
  const { profile } = useFinance();
  const [valorDesejado, setValorDesejado] = useState("");
  const [prazoAnos, setPrazoAnos] = useState("");
  const [result, setResult] = useState<{ mensal: number; anos: number; tipo: string } | null>(null);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const calcular = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(valorDesejado);
    const anos = parseFloat(prazoAnos);
    if (!valor || !anos) return;
    const meses = anos * 12;
    const mensal = valor / meses;
    const tipo = anos <= 3 ? "curto" : anos <= 10 ? "medio" : "longo";
    setResult({ mensal, anos, tipo });
  };

  const suggestions = {
    curto: {
      icon: Shield,
      title: "Investimentos Conservadores",
      items: ["Tesouro Selic", "CDB de liquidez diária", "Fundos DI", "Poupança"],
      desc: "Para metas de curto prazo, priorize segurança e liquidez.",
    },
    medio: {
      icon: BarChart3,
      title: "Investimentos Balanceados",
      items: ["Tesouro IPCA+", "CDB pré-fixado", "Fundos multimercado", "LCI/LCA"],
      desc: "Equilibre risco e retorno para prazos intermediários.",
    },
    longo: {
      icon: TrendingUp,
      title: "Investimentos de Crescimento",
      items: ["Ações / ETFs", "Fundos de ações", "Fundos imobiliários", "Previdência privada"],
      desc: "Com horizonte longo, explore maior potencial de retorno.",
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Projeções Financeiras</h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-ui">
          Simule cenários e descubra quanto economizar por mês.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={calcular}
          className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <h2 className="text-sm font-semibold tracking-ui">Simulador</h2>
          <div>
            <Label>Valor Desejado (R$)</Label>
            <CurrencyInput value={valorDesejado} onValueChange={setValorDesejado} placeholder="0,00" className="font-mono-nums" required />
          </div>
          <div>
            <Label>Prazo (anos)</Label>
            <Input type="number" step="0.5" min="0.5" value={prazoAnos} onChange={(e) => setPrazoAnos(e.target.value)} className="font-mono-nums" required />
          </div>
          <Button type="submit" className="w-full">Calcular</Button>
        </motion.form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Economia mensal necessária</p>
              <p className="text-3xl font-bold font-mono-nums text-primary mt-1">{fmt(result.mensal)}</p>
              {profile.salario && (
                <p className="text-sm text-muted-foreground mt-1">
                  Isso representa <span className="font-semibold text-foreground">{((result.mensal / profile.salario) * 100).toFixed(1)}%</span> do seu salário.
                  {result.mensal / profile.salario > 0.5 && (
                    <span className="text-destructive ml-1">(Atenção: acima de 50%)</span>
                  )}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              {(() => {
                const s = suggestions[result.tipo as keyof typeof suggestions];
                const Icon = s.icon;
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">{s.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {s.items.map((item) => (
                        <div key={item} className="rounded-lg bg-accent/50 px-3 py-2 text-xs font-medium">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
