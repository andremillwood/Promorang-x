import { Trophy, Crown, Medal, TrendingUp, Users, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PublicStanding() {
  const mayors = [
    { name: "Andres M.", role: "Founding Mayor", impact: "$12,450", moments: 24, avatar: "A" },
    { name: "Sarah L.", role: "Coffee Curator", impact: "$8,200", moments: 18, avatar: "S" },
    { name: "Jason K.", role: "Running Enthusiast", impact: "$5,100", moments: 12, avatar: "J" },
  ];

  const explorers = [
    { name: "Elena Q.", rank: 3, points: "14,500", checkins: 42, avatar: "E" },
    { name: "Marcus T.", rank: 3, points: "11,200", checkins: 38, avatar: "M" },
    { name: "Sia V.", rank: 2, points: "9,800", checkins: 31, avatar: "S" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Mayors - Impact Leaders */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Crown className="w-5 h-5 fill-primary" />
            <h3 className="font-serif text-xl font-bold">Top Mayors</h3>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-primary/5">Impact Leaders</Badge>
        </div>

        <div className="space-y-4">
          {mayors.map((mayor, i) => (
            <div key={i} className="bg-card border border-border/60 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-charcoal text-white font-bold">{mayor.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -left-1 bg-primary text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-card">
                        {i + 1}
                    </div>
                 </div>
                 <div>
                    <h4 className="font-bold text-foreground flex items-center gap-1.5">
                        {mayor.name}
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{mayor.role}</p>
                 </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary italic">{mayor.impact}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase">{mayor.moments} Moments Hosted</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Elite Explorers - Participation Leaders */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500">
            <Trophy className="w-5 h-5" />
            <h3 className="font-serif text-xl font-bold">Elite Explorers</h3>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-amber-500/5">Rank Leaders</Badge>
        </div>

        <div className="space-y-4">
          {explorers.map((explorer, i) => (
            <div key={i} className="bg-card border border-border/60 p-4 rounded-2xl flex items-center justify-between group hover:border-amber-500/40 transition-all">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-amber-500/20">
                        <AvatarFallback className="bg-charcoal text-white font-bold">{explorer.avatar}</AvatarFallback>
                    </Avatar>
                    {i === 0 && (
                        <Star className="absolute -top-2 -right-2 w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                    )}
                 </div>
                 <div>
                    <h4 className="font-bold text-foreground">
                        {explorer.name}
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Rank {explorer.rank} standing</p>
                 </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-amber-500 italic">{explorer.points} pts</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase">{explorer.checkins} Verified Check-ins</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Global Impact CTA */}
      <div className="lg:col-span-2 bg-charcoal rounded-[2rem] p-8 border border-white/5 relative overflow-hidden text-center group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 opacity-50 group-hover:scale-110 transition-transform duration-1000" />
         <div className="relative z-10 space-y-4">
            <h4 className="font-serif text-2xl font-black italic text-white flex items-center justify-center gap-3">
               <TrendingUp className="w-6 h-6 text-primary" />
               $42,500 Total Community Funding
            </h4>
            <p className="text-white/60 text-sm max-w-xl mx-auto">
               You are part of a self-sustaining economy. Every point earned and spent is verified on-chain to ensure authentic community growth.
            </p>
         </div>
      </div>
    </div>
  );
}
