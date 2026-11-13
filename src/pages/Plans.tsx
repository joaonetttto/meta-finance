import { useFinance } from "@/contexts/FinanceContext";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageShell, PageHeader } from "@/components/layout/page";
import { layout, type } from "@/lib/layout";

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
  const { profile } = useFinance();

  return (
    <PageShell>
      <PageHeader
        title="Planos"
        description="Escolha o plano ideal para o seu planejamento financeiro."
        className="sm:flex-col sm:items-center sm:text-center"
      />

      <div className={cn(layout.gridLg, "mx-auto max-w-4xl grid-cols-1 md:grid-cols-3")}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              layout.card,
              "flex flex-col",
              plan.featured ? "border-primary ring-1 ring-primary/20" : ""
            )}
          >
            {plan.featured && (
              <span className={cn(type.overlineAccent, "mb-2 block")}>Mais popular</span>
            )}
            <h3 className={type.sectionTitle}>{plan.name}</h3>
            <div className="mt-2 mb-6">
              <span className={type.financialLg}>{plan.price}</span>
              <span className={type.caption}>{plan.period}</span>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className={cn("flex items-start gap-2", type.body)}>
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {profile.plano === plan.id ? (
              <Button variant={plan.featured ? "default" : "outline"} className="w-full" disabled>
                Plano Atual
              </Button>
            ) : plan.id === "gratuito" ? null : (
              <Button
                variant={plan.featured ? "default" : "outline"}
                className="w-full"
                onClick={() => toast.info("Checkout em breve", { description: "A assinatura do plano " + plan.name + " ainda não está disponível." })}
              >
                Em breve
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}
