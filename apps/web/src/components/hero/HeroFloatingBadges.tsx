import { motion, type MotionValue, useTransform } from "framer-motion";
import { CheckCircle2, Gem, KeyRound, Sparkles } from "lucide-react";

interface HeroFloatingBadgesProps {
  scrollYProgress?: MotionValue<number>;
  reducedMotion?: boolean;
}

export function HeroFloatingBadges({ scrollYProgress, reducedMotion = false }: HeroFloatingBadgesProps) {
  // Use scroll transforms if progress is supplied, otherwise fallback to static values
  const yFast = useTransform(scrollYProgress || { get: () => 0 } as any, [0, 1], [0, -120]);
  const ySlow = useTransform(scrollYProgress || { get: () => 0 } as any, [0, 1], [0, -50]);
  const yMedium = useTransform(scrollYProgress || { get: () => 0 } as any, [0, 1], [0, -80]);

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {/* Floating Badge 1: Gem Reward (Top Right) */}
      <motion.div
        style={{ y: yFast }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -10, 0],
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.8, delay: 0.2 },
          scale: { duration: 0.8, delay: 0.2 },
        }}
        className="absolute right-4 top-24 hidden items-center gap-2.5 rounded-2xl border border-primary/40 bg-black/60 px-4 py-2.5 shadow-[0_12px_30px_rgba(255,106,0,0.25)] backdrop-blur-md lg:flex xl:right-16"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Gem className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Gems Unlocked</p>
          <p className="text-xs font-black text-white">+50 Community Gems</p>
        </div>
        <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
      </motion.div>

      {/* Floating Badge 2: VIP Key (Bottom Left / Center-Left) */}
      <motion.div
        style={{ y: ySlow }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, 12, 0],
          rotate: [0, -3, 0, 3, 0],
        }}
        transition={{
          y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          rotate: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          opacity: { duration: 0.8, delay: 0.4 },
          scale: { duration: 0.8, delay: 0.4 },
        }}
        className="absolute bottom-28 left-6 hidden items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-black/60 px-4 py-2.5 shadow-[0_12px_30px_rgba(16,185,129,0.2)] backdrop-blur-md md:flex lg:left-12 xl:left-24"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <KeyRound className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">VIP Access</p>
          <p className="text-xs font-black text-white">Backstage Key Active</p>
        </div>
      </motion.div>

      {/* Floating Badge 3: Verified Check-in (Middle Right) */}
      <motion.div
        style={{ y: yMedium }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -8, 0],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
          opacity: { duration: 0.8, delay: 0.6 },
          scale: { duration: 0.8, delay: 0.6 },
        }}
        className="absolute right-12 top-[48%] hidden items-center gap-2.5 rounded-2xl border border-sky-500/30 bg-black/60 px-3.5 py-2 shadow-[0_12px_28px_rgba(14,165,233,0.2)] backdrop-blur-md 2xl:flex"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-sky-400">Verified Action</p>
          <p className="text-[11px] font-black text-white">Downtown Artwalk Visit</p>
        </div>
      </motion.div>
    </div>
  );
}
