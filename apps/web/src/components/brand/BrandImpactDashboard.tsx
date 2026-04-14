import { BarChart3, Users, Camera, TrendingUp, ArrowUpRight, ShieldCheck, Flame, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function BrandImpactDashboard() {
  const stats = [
    { label: "Verified Check-ins", value: "2,842", change: "+14%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "UGC Generated", value: "1,105", change: "+22%", icon: Camera, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Social Reach", value: "142K", change: "+8%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "ROI Multiple", value: "4.2x", change: "+1.2", icon: ChartIcon, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Status */}
      <div className="bg-charcoal text-cream p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-white/10 flex items-center justify-center text-primary shadow-2xl backdrop-blur-md border border-white/10">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-serif font-bold italic">Official ROI Matrix</h2>
            <p className="text-white/60 text-sm">Real-time verification of all brand-funded moments.</p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Export Report</Button>
          <Button variant="hero" className="shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <DollarSign className="w-4 h-4 mr-2" />
            Add Growth Budget
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/60 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-foreground">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart Placeholder */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif">Growth Velocity</CardTitle>
            <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><div className="w-2 h-2 rounded-full bg-primary" /> Active</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Projected</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex items-end gap-2 px-2">
              {[40, 65, 45, 90, 75, 55, 100, 85, 95, 120, 110, 130].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className={cn(
                        "w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110",
                        i > 9 ? "bg-muted-foreground/20" : "bg-gradient-to-t from-orange-600 to-orange-400"
                    )} 
                    style={{ height: `${h}%` }} 
                  />
                  <span className="text-[9px] text-muted-foreground font-medium hidden md:block">M{i+1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actionable Recommendations */}
        <Card className="border-border/60 bg-primary/5 border-primary/20 relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Growth Hacks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span>Market Saturation</span>
                    <span>64%</span>
                </div>
                <Progress value={64} className="h-2" />
            </div>
            
            <div className="p-4 rounded-2xl bg-background/50 border border-primary/10 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                   Your moments in <span className="text-foreground font-bold italic">Kingston</span> have a high viral coefficient. Increase funding by <span className="text-primary font-bold">20%</span> to dominate the weekend cycle.
                </p>
                <Button variant="hero" size="sm" className="w-full text-xs font-bold">Launch Boost</Button>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal text-cream space-y-2">
                <h4 className="text-xs font-bold flex items-center gap-2">
                    <BarChart3 className="w-3 h-3 text-primary" />
                    Projected Impact
                </h4>
                <p className="text-[10px] text-white/50">Increasing budget to $2k/mo will yield an estimated 5,000 new verified check-ins of high-intent participants.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}
