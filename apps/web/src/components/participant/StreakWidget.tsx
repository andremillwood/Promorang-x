import { motion } from "framer-motion";
import { Flame, Zap, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const StreakWidget = ({ count = 3 }: { count?: number }) => {
    // Determine fire intensity based on streak count
    const intensity = count > 10 ? "extreme" : count > 5 ? "high" : count > 2 ? "active" : "low";
    
    const colors = {
        low: "text-orange-400",
        active: "text-orange-500",
        high: "text-orange-600",
        extreme: "text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
    };

    const multiplier = count > 10 ? "2.5x" : count > 5 ? "2.0x" : count > 2 ? "1.5x" : "1.0x";

    return (
        <TooltipProvider>
            <div className="bg-charcoal/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-20 -mr-12 -mt-12 transition-colors duration-1000 ${
                    intensity === "extreme" ? "bg-red-500" : "bg-orange-500"
                }`} />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <motion.div
                                animate={{ 
                                    scale: intensity === "extreme" ? [1, 1.2, 1] : [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${colors[intensity]}`}
                            >
                                <Flame className="w-7 h-7 fill-current" />
                            </motion.div>
                            
                            {/* Particles */}
                            {count > 2 && (
                                <motion.div 
                                    animate={{ y: [-10, -20], opacity: [1, 0], scale: [1, 0.5] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="absolute -top-1 left-1/2 -translate-x-1/2"
                                >
                                    <Zap className="w-2 h-2 text-primary fill-primary" />
                                </motion.div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-black text-white italic">{count} Day Streak</p>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-white/40 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-charcoal text-white border-white/10 p-3 max-w-xs">
                                        <p className="font-bold text-xs uppercase tracking-widest text-primary mb-1">Consistency Yield</p>
                                        <p className="text-[10px] leading-relaxed">
                                            Streaks increase your Access Rank velocity and Key conversion rate. Don't let the fire die.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter bg-orange-500/10 text-orange-400 border-orange-500/20 px-1 py-0 h-4">
                                    Phoenix Fire Active
                                </Badge>
                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Multiplier: <span className="text-primary">{multiplier}</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Next Threshold</p>
                        <div className="flex items-center gap-2 justify-end">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <p className="text-sm font-bold text-white">5 Days <span className="text-emerald-500">(2.0x)</span></p>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / 7) * 100}%` }}
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                    />
                </div>
            </div>
        </TooltipProvider>
    );
};
