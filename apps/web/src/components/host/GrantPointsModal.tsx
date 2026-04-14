import { useState } from "react";
import { User, Gift, Send, Loader2, Search, ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GrantPointsModal() {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tier, setTier] = useState("medium");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const pointTiers: Record<string, number> = {
    small: 100,
    medium: 250,
    large: 500,
    vip: 1000
  };

  const handleGrant = async () => {
    if (!selectedUser) return;
    setLoading(true);
    
    // Simulate API delay for granting points
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast({
        title: "Points Granted!",
        description: `Successfully sent ${pointTiers[tier]} Promorang Pts to ${selectedUser.name}.`,
      });
      setSelectedUser(null);
      setTier("medium");
      setSearchQuery("");
    }, 1500);
  };

  const mockUsers = [
    { id: "1", name: "Alex Rivera", avatar: "", handles: "@arivera" },
    { id: "2", name: "Jordan Smith", avatar: "", handles: "@jsmith_99" },
    { id: "3", name: "Sam Chen", avatar: "", handles: "@schen_explorer" },
  ];

  const filteredUsers = searchQuery.length >= 2 
    ? mockUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 bg-primary/5">
            <Gift className="w-4 h-4" />
            Reward Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border overflow-hidden p-0">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="font-serif text-3xl font-bold tracking-tight">Reward <span className="text-primary italic">Participant</span></DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">Verify effort and grant points as community fuel.</DialogDescription>
        </DialogHeader>

        <div className="p-8 pt-0 space-y-6">
          {/* Liquidity Proof Banner */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Liquidity Verified</p>
                <p className="text-[9px] text-emerald-600/70 font-medium">Points granted are backed by active brand sponsorship budget.</p>
            </div>
          </div>

          {!selectedUser ? (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Find Participant</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Enter name or handle..."
                            className="pl-10 h-12"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                            <button 
                                key={u.id}
                                onClick={() => setSelectedUser(u)}
                                className="w-full p-3 flex items-center justify-between rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border border-border">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{u.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm">{u.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{u.handles}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        ))
                    ) : searchQuery.length >= 2 ? (
                        <p className="text-center py-8 text-xs text-muted-foreground italic">No participants found.</p>
                    ) : (
                        <p className="text-center py-8 text-xs text-muted-foreground opacity-50">Search to see explorers...</p>
                    )}
                </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/20 text-primary font-black">{selectedUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-black text-lg">{selectedUser.name}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{selectedUser.handles}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="text-[10px] font-bold uppercase underline">Change</Button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impact Tier</Label>
                        <Select value={tier} onValueChange={setTier}>
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

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Reward Power
                            </span>
                            <span className="text-muted-foreground">3,250 / 5,000 Pts</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '65%' }} />
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tighter">
                            <span className="text-emerald-600">Resets Monday</span>
                            <button className="text-primary hover:underline">Limit Reached? Request Scale-Up</button>
                        </div>
                    </div>
                </div>

                <Button 
                    variant="hero" 
                    className="w-full h-14 font-black text-lg shadow-xl"
                    disabled={loading}
                    onClick={handleGrant}
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                            Send Points
                            <Send className="w-5 h-5" />
                        </span>
                    )}
                </Button>
            </div>
          )}

          <div className="text-center">
             <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase py-1 px-3 border border-border rounded-full bg-muted/30">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                Niche Governance Tool
             </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
