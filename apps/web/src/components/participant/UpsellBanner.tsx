import React from "react";
import { Link as RouterLink } from "react-router-dom";
const Link = RouterLink as any;
import {
    Award as LucideAward,
    ArrowRight as LucideArrow,
    Sparkles as LucideSparkles,
    Zap as LucideZap,
    TrendingUp as LucideTrending,
    CheckCircle2 as LucideCheck
} from "lucide-react";
const Award = LucideAward as any;
const ArrowRight = LucideArrow as any;
const Sparkles = LucideSparkles as any;
const Zap = LucideZap as any;
const TrendingUp = LucideTrending as any;
const CheckCircle2 = LucideCheck as any;
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const UpsellBanner = () => {
    const { user } = useAuth();

    // Logic: Only show to participants who are not yet PRO or are low rank but active
    // For demonstration, we'll assume rank/tier logic
    const currentRank = 1; // Placeholder
    const isPro = false; // Placeholder

    if (isPro) return null;

    return (
        <div className="relative group overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/5 p-8 transition-all duration-500 hover:shadow-soft-xl">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Tier Visual */}
                <div className="flex-shrink-0 w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center relative shadow-soft">
                    <Zap className="w-12 h-12 text-primary" />
                    <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                        PRO
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
                        <TrendingUp className="w-3 h-3" />
                        Rank Progression Available
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Unlock <span className="text-gradient-primary italic">Priority Access</span> & Rewards
                    </h3>
                    <p className="text-muted-foreground max-w-xl text-sm md:text-base mb-6 font-medium">
                        You've attended 3 moments this month! Verified PRO members earn 2x more points and get first dibs on exclusive brand drops.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Double Points
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Creator Tools
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Early Access
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                    <Button asChild variant="hero" size="lg" className="rounded-2xl px-8 group shadow-soft">
                        <Link to="/pricing" className="flex items-center gap-2">
                            Upgrade to Pro
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <p className="text-center mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        From just $15/mo
                    </p>
                </div>
            </div>
        </div>
    );
};
