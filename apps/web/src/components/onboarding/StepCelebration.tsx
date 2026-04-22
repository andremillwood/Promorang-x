import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, Trophy, Star } from "lucide-react";

interface StepCelebrationProps {
  isOpen: boolean;
  stepName: string;
  onClose: () => void;
}

export function StepCelebration({ isOpen, stepName, onClose }: StepCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Confetti Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                y: -20, 
                x: `${particle.x}vw`,
                opacity: 1,
                scale: 0
              }}
              animate={{ 
                y: "100vh",
                opacity: 0,
                scale: [0, 1, 0.5],
                rotate: [0, 360, 720]
              }}
              transition={{ 
                duration: 2,
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute top-0 w-3 h-3 rounded-full"
              style={{
                backgroundColor: [
                  "#FF6B00", // primary
                  "#FF9500", // secondary
                  "#FFCC1A", // accent
                  "#10b981", // success
                  "#3b82f6", // blue
                  "#8b5cf6", // violet
                ][particle.id % 6]
              }}
            />
          ))}

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="relative bg-card border border-border/50 rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-3xl animate-pulse" />
            
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="relative z-10 mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg"
            >
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>

            {/* Sparkles around icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32"
            >
              <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 text-accent" />
              <Star className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 text-primary" />
              <Trophy className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 text-yellow-500" />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <h3 className="text-xl font-bold font-serif mb-2">
                Step Complete!
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                You completed: <span className="text-foreground font-medium">{stepName}</span>
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Keep going!
              </div>
            </motion.div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mt-6">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`w-2 h-2 rounded-full ${
                    i < 3 ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StepCelebration;
