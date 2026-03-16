import { useFinance } from "@/contexts/FinanceContext";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "gratuito",
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    features: ["Controle financeiro básico", "Até 3 metas", "Dashboard resumido", "Categorias personalizadas"],
  },
  {
    id: "ouro",
    name: "Ouro",
    price: "R$ 24,99",
    period: "/mês",
    featured: true,
    features: ["Metas ilimitadas", "Projeções financeiras", "Dashboard completo", "Gráficos avançados", "Histórico completo"],
  },
  {
    id: "diamante",
    name: "Diamante",
    price: "R$ 49,99",
    period: "/mês",
    features: ["Tudo do Ouro", "Sugestões de investimento", "Planejamento de aposentadoria", "Relatórios avançados", "Suporte prioritário"],
  },
];

export default function Plans() {
  const { profile, updateProfile } = useFinance();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-display">Planos</h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-ui">
          Escolha o plano ideal para o seu planejamento financeiro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "rounded-xl border p-6 shadow-sm flex flex-col",
              plan.featured ? "border-primary bg-card ring-1 ring-primary/20" : "border-border bg-card"
            )}
          >
            {plan.featured && (
              <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Mais popular</span>
            )}
            <h3 className="text-lg font-bold font-display">{plan.name}</h3>
            <div className="mt-2 mb-6">
              <span className="text-3xl font-bold font-mono-nums">{plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={plan.featured ? "default" : "outline"}
              className="w-full"
              disabled={profile.plano === plan.id}
              onClick={() => updateProfile({ plano: plan.id })}
            >
              {profile.plano === plan.id ? "Plano Atual" : "Selecionar"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
