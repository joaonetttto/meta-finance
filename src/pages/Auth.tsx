import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TrendingUp, Shield, Target, Zap, ArrowRight, Loader2 } from "lucide-react";

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

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setEmail("");
    setPassword("");
  };

  const features = [
    { icon: TrendingUp, title: "Controle Total", desc: "Visualize receitas, despesas e saldo em tempo real" },
    { icon: Target, title: "Metas Inteligentes", desc: "Defina metas e acompanhe quanto falta por mês" },
    { icon: Shield, title: "100% Seguro", desc: "Seus dados criptografados e protegidos" },
  ];


  return (
    <div className="min-h-screen flex bg-[hsl(222,30%,4%)]">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        {/* Animated background orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-accent/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(hsl(217,91%,60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217,91%,60%) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center gap-3"
        >
          {/* Logo with animated glow */}
          <motion.div
            className="relative h-10 w-10"
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0.2)",
                "0 0 20px 4px hsl(var(--primary) / 0.15)",
                "0 0 0 0 hsl(var(--primary) / 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-white">
            Meta<span className="text-primary">Finance</span>
          </h1>
        </motion.div>

        <div className="relative z-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Planejamento Financeiro</p>
            <h2 className="font-display text-5xl font-bold text-white leading-[1.1] mb-4">
              Seu patrimônio,<br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">engenheirado.</span>
            </h2>
            <p className="text-base text-white/40 max-w-md leading-relaxed">
              Organize suas finanças, defina metas e tome decisões inteligentes para construir seu futuro financeiro.
            </p>
          </motion.div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                  <p className="text-xs text-white/40">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10 text-xs text-white/20"
        >
          © 2026 MetaFinance. Todos os direitos reservados.
        </motion.p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[hsl(222,30%,6%)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile branding */}
          <div className="text-center mb-8 sm:mb-10 lg:hidden">
            <motion.div 
              className="flex items-center justify-center gap-2 mb-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="relative h-9 w-9"
                animate={{
                  boxShadow: [
                    "0 0 0 0 hsl(var(--primary) / 0.2)",
                    "0 0 20px 4px hsl(var(--primary) / 0.15)",
                    "0 0 0 0 hsl(var(--primary) / 0.2)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </motion.div>
              <h1 className="text-xl font-bold font-display text-white">
                Meta<span className="text-primary">Finance</span>
              </h1>
            </motion.div>
            <p className="text-sm text-white/40">Seu patrimônio, engenheirado.</p>
          </div>

          {/* Form header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-header" : "login-header"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold font-display text-white">
                {isSignUp ? "Criar Conta" : "Bem-vindo de volta"}
              </h2>
              <p className="text-sm text-white/40 mt-2">
                {isSignUp ? "Comece a controlar suas finanças hoje" : "Entre para continuar seu planejamento"}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:bg-white/[0.06] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-white/[0.12]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:bg-white/[0.06] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:border-white/[0.12]"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-semibold text-sm bg-primary hover:bg-primary/90 transition-all group relative overflow-hidden"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-2"
                  >
                    {isSignUp ? "Criar Conta" : "Entrar"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </form>

          <motion.div 
            className="mt-8 pt-6 border-t border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={isSignUp ? "signup-footer" : "login-footer"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-center text-white/40"
              >
                {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
                <button
                  onClick={toggleMode}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors relative group"
                >
                  {isSignUp ? "Entrar" : "Criar conta"}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
                </button>
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
