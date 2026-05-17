import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFirstAccess } from "@/hooks/useFirstAccess";
import { 
  Target, 
  Zap, 
  ArrowRight, 
  Sparkles,
  BarChart3,
  Wallet
} from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Metas Inteligentes",
    description: "Defina objetivos financeiros claros e acompanhe seu progresso em tempo real.",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Projeções Avançadas",
    description: "Simule cenários de investimento e descubra o caminho mais rápido para seus objetivos.",
    color: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
  },
  {
    icon: Wallet,
    title: "Controle Completo",
    description: "Registre receitas e despesas com categorização automática e insights personalizados.",
    color: "from-primary/20 to-accent/5",
    iconColor: "text-primary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const { markAsSeen } = useFirstAccess();

  const handleStart = () => {
    markAsSeen();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/6 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-accent/4 rounded-full blur-[100px]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(217,91%,60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217,91%,60%) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Logo */}
          <motion.div
            className="inline-flex items-center gap-2 mb-6"
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0.2)",
                "0 0 30px 6px hsl(var(--primary) / 0.1)",
                "0 0 0 0 hsl(var(--primary) / 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              Meta<span className="text-primary">Finance</span>
            </h1>
          </motion.div>

          {/* Welcome badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Bem-vindo ao seu novo começo</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
          >
            Seu patrimônio
            <br />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              engenheirado.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base sm:text-lg text-white/50 max-w-xl mx-auto leading-relaxed"
          >
            O MetaFinance é seu laboratório financeiro pessoal. 
            Simule, planeje e construa seu futuro com precisão.
          </motion.p>
        </motion.div>

        {/* Benefits cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`h-12 w-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                
                <p className="text-sm text-white/40 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Corner accent */}
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-12 sm:mb-16"
        >
          {[
            { value: "3", label: "Cenários de projeção" },
            { value: "∞", label: "Possibilidades" },
            { value: "100%", label: "Seguro e privado" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={handleStart}
            size="lg"
            className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 transition-all group"
          >
            Começar Agora
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="mt-4 text-sm text-white/30">
            Você pode revisitar esta tela a qualquer momento
          </p>
        </motion.div>
      </div>
    </div>
  );
}
