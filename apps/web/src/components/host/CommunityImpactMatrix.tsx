import { Users, Target, Heart, TrendingUp, ShieldCheck, MapPin, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function CommunityImpactMatrix() {
  const metrics = [
    { label: "Community Density", value: "High", score: 92, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Retention Rate", value: "78%", score: 78, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Viral Index", value: "3.4x", score: 85, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Avg. Participant Value", value: "$64", score: 64, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header: Proof of Social Density */}
      <div className="bg-charcoal text-cream p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white mb-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Verified Social Density</span>
            </div>
            <h2 className="text-3xl font-serif font-black italic mb-2">The Community Matrix</h2>
            <p className="text-white/60 text-sm max-w-sm mx-auto">This is how sponsors see your audience value. Real souls, real actions.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-3xl hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{metric.label}</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", metric.bg, metric.color)}>{metric.value}</span>
            </div>
            <div className="space-y-2">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", metric.color.replace('text', 'bg'))} style={{ width: `${metric.score}%` }} />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                    <span>Baseline</span>
                    <span className={metric.color}>Rank {metric.score/10 > 8 ? 'S' : 'A'}</span>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap/Location Proof */}
      <Card className="border-border/60 bg-primary/5 overflow-hidden">
          <CardHeader className="border-b border-primary/10">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Presence Heatmap
              </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
              <div className="h-48 w-full bg-muted/40 rounded-2xl relative overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent animate-pulse" />
                  <div className="relative z-10 text-center space-y-3">
                      <Zap className="w-8 h-8 text-primary mx-auto opacity-50" />
                      <div>
                          <p className="text-xs font-bold text-foreground">Dominant in: <span className="text-primary italic">SoHo, Downtown, Artisan Districts</span></p>
                          <p className="text-[10px] text-muted-foreground mt-1">Your community is concentrated in high-spend retail corridors.</p>
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <div className="p-4 rounded-2xl bg-charcoal text-cream flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                  <Heart className="w-4 h-4 text-primary" />
              </div>
              <div>
                  <p className="text-[10px] font-bold uppercase tracking-tighter">Community Pulse</p>
                  <p className="text-xs text-white/60">Loyalty level is at an all-time high.</p>
              </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs italic">
              <TrendingUp className="w-3 h-3" />
              +14%
          </div>
      </div>
    </div>
  );
}
