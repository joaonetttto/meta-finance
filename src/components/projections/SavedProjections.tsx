import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useFinance } from "@/contexts/FinanceContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, PlayCircle, ArrowRightCircle, Check, X, Crown, Shield, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SCENARIOS, calcPMT, fmt } from "@/lib/projections";

interface SavedProjection {
  id: string;
  nome: string;
  valor_desejado: number;
  prazo_anos: number;
  aporte_mensal: number;
  cenario: string;
  convertida: boolean;
  created_at: string;
}

interface Props {
  onReopen: (p: { valorDesejado: string; prazoAnos: string; aporteManual: string }) => void;
}

const PLAN_LIMITS: Record<string, number> = {
  gratuito: 2,
  ouro: Infinity,
  diamante: Infinity,
};

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  conservador: <Shield className="h-3.5 w-3.5" />,
  moderado: <BarChart3 className="h-3.5 w-3.5" />,
  agressivo: <Zap className="h-3.5 w-3.5" />,
};

const SCENARIO_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  conservador: { label: "Mais seguro", variant: "outline" },
  moderado: { label: "Equilibrado", variant: "default" },
  agressivo: { label: "Maior retorno", variant: "secondary" },
};

function getHighlights(projections: SavedProjection[]) {
  if (projections.length < 2) return {};
  const highlights: Record<string, string[]> = {};

  // Find cheapest (lowest monthly)
  let cheapest = projections[0];
  let fastest = projections[0];
  let safest: SavedProjection | null = null;

  projections.forEach((p) => {
    const sc = SCENARIOS.find((s) => s.key === p.cenario);
    const pmt = calcPMT(p.valor_desejado, sc?.rate ?? 0.07, p.prazo_anos);
    const cheapestPmt = calcPMT(cheapest.valor_desejado, SCENARIOS.find(s => s.key === cheapest.cenario)?.rate ?? 0.07, cheapest.prazo_anos);

    if (pmt < cheapestPmt) cheapest = p;
    if (p.prazo_anos < fastest.prazo_anos) fastest = p;
    if (p.cenario === "conservador") safest = p;
  });

  if (cheapest) highlights[cheapest.id] = [...(highlights[cheapest.id] || []), "Mais econômico"];
  if (fastest && fastest.id !== cheapest?.id) highlights[fastest.id] = [...(highlights[fastest.id] || []), "Mais rápido"];
  if (safest && safest.id !== cheapest?.id && safest.id !== fastest?.id)
    highlights[safest.id] = [...(highlights[safest.id] || []), "Mais seguro"];

  return highlights;
}

export function SavedProjections({ onReopen }: Props) {
  const { user } = useAuth();
  const { profile, addGoal } = useFinance();
  const [projections, setProjections] = useState<SavedProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const limit = PLAN_LIMITS[profile.plano] ?? 2;
  const canCreate = projections.filter((p) => !p.convertida).length < limit;

  const fetchProjections = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_projections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setProjections(data as unknown as SavedProjection[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjections();
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from("saved_projections").delete().eq("id", id);
    setProjections((prev) => prev.filter((p) => p.id !== id));
    toast.success("Projeção removida");
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await supabase.from("saved_projections").update({ nome: editName.trim() }).eq("id", id);
    setProjections((prev) => prev.map((p) => (p.id === id ? { ...p, nome: editName.trim() } : p)));
    setEditingId(null);
    toast.success("Nome atualizado");
  };

  const handleConvert = async (p: SavedProjection) => {
    const sc = SCENARIOS.find((s) => s.key === p.cenario);
    const pmt = p.aporte_mensal || calcPMT(p.valor_desejado, sc?.rate ?? 0.07, p.prazo_anos);

    const prazoDate = new Date();
    prazoDate.setFullYear(prazoDate.getFullYear() + Math.floor(p.prazo_anos));
    prazoDate.setMonth(prazoDate.getMonth() + Math.round((p.prazo_anos % 1) * 12));

    await addGoal({
      nome: p.nome,
      valor_objetivo: p.valor_desejado,
      valor_atual: 0,
      prazo: prazoDate.toISOString().split("T")[0],
    });

    await supabase.from("saved_projections").update({ convertida: true }).eq("id", p.id);
    setProjections((prev) => prev.map((x) => (x.id === p.id ? { ...x, convertida: true } : x)));
    toast.success("Meta criada a partir da projeção!");
  };

  const handleReopen = (p: SavedProjection) => {
    onReopen({
      valorDesejado: String(p.valor_desejado),
      prazoAnos: String(p.prazo_anos),
      aporteManual: p.aporte_mensal ? String(p.aporte_mensal) : "",
    });
  };

  const highlights = getHighlights(projections.filter((p) => !p.convertida));

  if (loading) return null;

  const active = projections.filter((p) => !p.convertida);
  const converted = projections.filter((p) => p.convertida);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-display">Projeções Salvas</h2>
          <p className="text-xs text-muted-foreground">
            Simulações guardadas — explore cenários antes de criar metas reais.
          </p>
        </div>
        {limit !== Infinity && (
          <span className="text-xs text-muted-foreground font-mono-nums">
            {active.length}/{limit}
          </span>
        )}
      </div>

      {!canCreate && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            Você atingiu o limite de projeções do seu plano.{" "}
            <a href="/planos" className="text-primary underline">Fazer upgrade</a>
          </span>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {active.length === 0 && !loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground text-center py-6"
          >
            Nenhuma projeção salva. Use o simulador acima e clique em "Salvar projeção".
          </motion.p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {active.map((p, i) => {
            const sc = SCENARIOS.find((s) => s.key === p.cenario);
            const pmt = p.aporte_mensal || calcPMT(p.valor_desejado, sc?.rate ?? 0.07, p.prazo_anos);
            const badge = SCENARIO_BADGES[p.cenario];
            const hl = highlights[p.id];

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group relative rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    {editingId === p.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-7 text-sm"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleRename(p.id)}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(p.id)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-sm truncate">{p.nome}</h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {badge && (
                      <Badge variant={badge.variant} className="text-[10px] gap-1 shrink-0">
                        {SCENARIO_ICONS[p.cenario]}
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Highlights */}
                {hl && (
                  <div className="flex gap-1 mb-2">
                    {hl.map((h) => (
                      <Badge key={h} variant="outline" className="text-[10px] text-accent border-accent/30">
                        {h}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Info */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  <div>
                    <p className="text-muted-foreground">Objetivo</p>
                    <p className="font-mono-nums font-semibold">{fmt(p.valor_desejado)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prazo</p>
                    <p className="font-mono-nums font-semibold">{p.prazo_anos} anos</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mensal</p>
                    <p className="font-mono-nums font-semibold">{fmt(pmt)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs gap-1 flex-1"
                    onClick={() => handleConvert(p)}
                  >
                    <ArrowRightCircle className="h-3.5 w-3.5" />
                    Transformar em meta
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleReopen(p)}>
                    <PlayCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditName(p.nome);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Converted projections */}
        {converted.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">Convertidas em meta</p>
            <div className="space-y-1">
              {converted.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs rounded-lg border border-border/50 bg-card/50 px-3 py-2 opacity-60">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-accent" />
                    <span>{p.nome}</span>
                    <span className="font-mono-nums text-muted-foreground">{fmt(p.valor_desejado)}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
