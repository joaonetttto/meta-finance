import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

const phrases = [
  "Organize suas finanças com inteligência",
  "Trace metas e acompanhe seu progresso",
  "Tome decisões financeiras com clareza",
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => {
        if (prev >= phrases.length - 1) {
          clearInterval(phraseInterval);
          setTimeout(() => setShowFinal(true), 400);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    const completeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 600);
    }, 2500);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[hsl(222,30%,4%)]"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" as const }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(hsl(217,91%,60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217,91%,60%) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
        >
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <div className="relative h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Zap className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="font-display text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Meta<span className="text-primary">Finance</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Planejamento Financeiro
        </motion.p>

        {/* Rotating phrases */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!showFinal ? (
              <motion.p
                key={currentPhrase}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-white/50 text-center"
              >
                {phrases[currentPhrase]}
              </motion.p>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-white/70 text-center font-medium"
              >
                Preparando seu ambiente financeiro...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
