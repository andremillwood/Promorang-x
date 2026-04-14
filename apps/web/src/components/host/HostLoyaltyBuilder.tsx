import { useState } from "react";
import { Plus, Trash2, Zap, Trophy, Users, Star, ArrowRight, Sparkles, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface LoyaltyRule {
  id: string;
  trigger: string;
  points: number;
  label: string;
}

export function HostLoyaltyBuilder() {
  const [rules, setRules] = useState<LoyaltyRule[]>([
    { id: "1", trigger: "streak_3", points: 500, label: "3-Moment Streak" },
    { id: "2", trigger: "squad_leader", points: 250, label: "Squad Assembly" }
  ]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newTier, setNewTier] = useState("medium");
  const { toast } = useToast();

  const pointTiers = {
    small: { label: "Small Impact", points: 100 },
    medium: { label: "Medium Impact", points: 250 },
    large: { label: "Large Impact", points: 500 },
    vip: { label: "VIP / Elite", points: 1000 }
  };

  const handleAddRule = () => {
    if (!newTrigger) return;
    const tier = pointTiers[newTier as keyof typeof pointTiers];
    const rule: LoyaltyRule = {
      id: Math.random().toString(36).substring(7),
      trigger: newTrigger,
      points: tier.points,
      label: newTrigger.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    };
    setRules([...rules, rule]);
    setNewTrigger("");
    setNewTier("medium");
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-[2rem] border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-lg">
                <Trophy className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold font-serif italic">Niche Loyalty Builder</h3>
                <p className="text-muted-foreground text-xs uppercase tracking-widest font-black">Define your community rules</p>
            </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Mayors can grant **Promorang Points** for specific behaviors. Choose your triggers and set the stakes.
        </p>

        {/* Create Rule Form */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/50">
            <div className="flex-1 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Behavior Trigger</Label>
                <Select value={newTrigger} onValueChange={setNewTrigger}>
                    <SelectTrigger className="h-12 bg-background">
                        <SelectValue placeholder="Select behavior..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="first_timer">New Explorer (First Visit)</SelectItem>
                        <SelectItem value="serial_explorer">Serial Explorer (5+ Visits)</SelectItem>
                        <SelectItem value="high_ugc">Content Creator (3+ Photos)</SelectItem>
                        <SelectItem value="perfect_attendance">Perfect Month</SelectItem>
                        <SelectItem value="early_bird">Early Arrival</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impact Tier</Label>
                <Select value={newTier} onValueChange={setNewTier}>
                    <SelectTrigger className="h-12 bg-background">
                        <SelectValue placeholder="Select impact..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="small">Small Impact (100 Pts)</SelectItem>
                        <SelectItem value="medium">Medium Impact (250 Pts)</SelectItem>
                        <SelectItem value="large">Large Impact (500 Pts)</SelectItem>
                        <SelectItem value="vip">VIP / Elite (1,000 Pts)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-end">
                <Button variant="hero" onClick={handleAddRule} disabled={!newTrigger} className="h-12 w-full md:w-auto px-8">
                    <Plus className="w-4 h-4 mr-2" />
                    Apply Rule
                </Button>
            </div>
        </div>

        {/* Weekly Power Budget */}
        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase text-emerald-500 tracking-tighter">
                    Resets Monday 12AM
                </div>
            </div>
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    Weekly Reward Power
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground">
                   <span className="text-foreground">3,250</span> / 5,000 Pts Limit
                </p>
            </div>
            <div className="h-1.5 w-full bg-charcoal rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }} />
            </div>
        </div>

        {/* Rules List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
                <Card key={rule.id} className="bg-background border-border hover:border-primary/40 transition-all group">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                {rule.trigger.includes('streak') || rule.trigger.includes('serial') ? <Zap className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight">{rule.label}</h4>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    {rule.points} Promorang Pts
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-6 rounded-2xl border border-dashed border-border bg-muted/20">
          <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-xs font-medium text-muted-foreground tracking-tight">
                  <span className="text-foreground font-bold">Rule Propagation:</span> These rules will automatically apply to all upcoming moments in your niche.
              </p>
          </div>
          <Button variant="outline" size="sm" className="bg-background">
              Learn More
              <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
      </div>
    </div>
  );
}
