import { Shield, Sparkles, Zap, Trophy, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function RankPerksGuide() {
    const ranks = [
        {
            level: 0,
            name: "Seeker",
            perks: ["Discovery of Shared Stories", "Standard Point Earnings", "Basic Profile Customization"],
            color: "text-slate-400",
            bg: "bg-slate-400/10",
            border: "border-slate-400/20"
        },
        {
            level: 1,
            name: "Herald",
            perks: ["The Right to Pitch Stories", "Access to Semi-Private Gatherings", "+5% Points Bonus"],
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            level: 2,
            name: "Luminary",
            perks: ["Whispers of the Phoenix Vault", "Early Moment Previews", "+15% Points Bonus"],
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            level: 3,
            name: "Eminence",
            perks: ["A Steward of Community Hosting", "Priority Access to Major Gatherings", "Personal Council with Brand Partners", "+25% Points Bonus"],
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/20"
        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[8px] font-black uppercase tracking-tighter text-primary bg-primary/5 hover:bg-primary/10 rounded-md">
                    What are the Perks?
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-charcoal text-cream border-white/5 p-0 overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-3xl font-black italic flex items-center gap-3">
                            <Shield className="w-8 h-8 text-primary" />
                            Access Rank & Standing
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-white/60 text-sm mt-2">
                        Climbing the Standing ladder isn't just about a number. Higher ranks signify verified social capital, unlocking exclusive brand privileges.
                    </p>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ranks.map((rank) => (
                        <div key={rank.level} className={`p-4 rounded-2xl border ${rank.bg} ${rank.border} space-y-4`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Rank {rank.level}</p>
                                    <h4 className={`text-xl font-bold ${rank.color}`}>{rank.name}</h4>
                                </div>
                                <div className={`w-8 h-8 rounded-lg ${rank.bg} flex items-center justify-center`}>
                                    {rank.level === 3 ? <Sparkles className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                </div>
                            </div>
                            <ul className="space-y-2">
                                {rank.perks.map((perk, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[11px] font-medium text-white/70">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                        {perk}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-white/5 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-primary">
                            <Zap className="w-5 h-5 fill-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold uppercase tracking-wider">Effort == Access</p>
                            <p className="text-[10px] text-white/40">Your check-ins fuel your climb. Consistency is mandatory.</p>
                        </div>
                   </div>
                   <p className="text-[9px] text-white/20 text-right max-w-[150px]">
                      Access Ranks are verified on-chain via the behavioral proof engine.
                   </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
