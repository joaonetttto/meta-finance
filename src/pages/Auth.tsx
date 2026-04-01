import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, Shield, Target } from "lucide-react";

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Conta criada com sucesso!");
      } else {
        await signIn(email, password);
        toast.success("Bem-vindo de volta!");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(222,30%,8%)] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="font-display text-3xl font-bold text-white">
            Meta<span className="text-primary">Finance</span>
          </h1>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl font-bold text-white leading-tight"
          >
            Seu patrimônio,<br />
            <span className="text-accent">engenheirado.</span>
          </motion.h2>

          <div className="space-y-4">
            {[
              { icon: TrendingUp, text: "Controle total das suas finanças" },
              { icon: Target, text: "Metas inteligentes com projeções" },
              { icon: Shield, text: "Seus dados seguros e protegidos" },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-white/70">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">© 2026 MetaFinance. Todos os direitos reservados.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-2xl font-bold font-display">
              Meta<span className="text-primary">Finance</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Seu patrimônio, engenheirado.</p>
          </div>

          <div className="lg:hidden text-center mb-6">
            <p className="text-sm text-muted-foreground">{isSignUp ? "Crie sua conta" : "Entre na sua conta"}</p>
          </div>
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold font-display">{isSignUp ? "Criar Conta" : "Bem-vindo de volta"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? "Comece a controlar suas finanças" : "Entre para continuar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="h-11 bg-secondary/50 border-border/50 focus:bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="h-11 bg-secondary/50 border-border/50 focus:bg-card"
              />
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-semibold hover:underline">
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
