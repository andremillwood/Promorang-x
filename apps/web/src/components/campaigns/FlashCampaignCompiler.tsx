import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
    Zap, 
    Rocket, 
    ArrowRight, 
    Target, 
    Store, 
    MessageCircle,
    Loader2,
    TrendingUp,
    MousePointerClick
} from "lucide-react";

type CampaignType = "CONTENT" | "PURCHASE" | "REFERRAL" | "VISIT";

interface CampaignInput {
    goal: CampaignType;
    businessName: string;
    context?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FlashCampaignCompilerProps {
    adminMode?: boolean;
    onSuccess?: () => void;
}

export const FlashCampaignCompiler = ({ adminMode = false, onSuccess }: FlashCampaignCompilerProps) => {
    const { session } = useAuth();
    const { toast } = useToast();
    const [isLaunching, setIsLaunching] = useState(false);
    
    const [input, setInput] = useState<CampaignInput>({
        goal: "CONTENT",
        businessName: "",
        context: ""
    });

    const [preview, setPreview] = useState<any | null>(null);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const getOutcome = (goal: CampaignType) => {
        switch(goal) {
            case "CONTENT": return { volume: "20–50 actions", reach: "1K–10K", conversionIntent: "Low–Medium" };
            case "PURCHASE": return { volume: "5–20 actions", reach: "Low", conversionIntent: "High" };
            case "REFERRAL": return { volume: "10–30 actions", reach: "Expanding", conversionIntent: "Medium–High" };
            case "VISIT": return { volume: "10–25 actions", reach: "Local", conversionIntent: "Medium" };
        }
    };

    const handleGenerate = () => {
        if (!input.businessName) {
            toast({ title: "Validation Error", description: "Business Name is required.", variant: "destructive" });
            return;
        }
        if (input.context && input.context.split(" ").length > 5) {
            toast({ title: "Validation Error", description: "Context must be 5 words or less.", variant: "destructive" });
            return;
        }

        const goalData: Record<CampaignType, any> = {
            CONTENT: { drop: "Post your experience", moves: ["Try product", "Record/photo", "Post & link"], proof: "Link", reward: 40 },
            PURCHASE: { drop: "Complete your order", moves: ["Order product", "Save receipt", "Upload proof"], proof: "OCR", reward: 70 },
            REFERRAL: { drop: "Refer a friend", moves: ["Share link", "Friend signs up", "Submit proof"], proof: "Link", reward: 90 },
            VISIT: { drop: "Visit the location", moves: ["Go to location", "Take photo", "Upload proof"], proof: "Upload", reward: 50 }
        };

        const config = goalData[input.goal];
        const name = input.context ? `${capitalize(input.context)} – ${input.businessName}` : `${capitalize(input.goal)} – ${input.businessName}`;
        
        setPreview({
            name,
            drop: config.drop,
            moves: config.moves,
            proof: config.proof,
            reward: config.reward,
            outcome: getOutcome(input.goal)
        });
    };

    const handleLaunch = async () => {
        if (!preview) return;
        setIsLaunching(true);
        try {
            const endpoint = adminMode ? '/api/admin/campaigns/compiler-launch' : '/api/campaigns/flash-launch';
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(input)
            });

            if (!res.ok) throw new Error("Launch failed");

            toast({ 
                title: "Flash Launch Success! 🚀", 
                description: adminMode ? "Global campaign is now live." : "Your stakeholder campaign is now active."
            });
            
            setPreview(null);
            setInput({ goal: "CONTENT", businessName: "", context: "" });
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast({ title: "Launch Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6">
                {/* INPUT */}
                <Card className="border-border/50 shadow-lg bg-card/30 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs uppercase tracking-widest font-black flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            {adminMode ? "Admin Compiler" : "Flash Launch"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-70">Goal</Label>
                            <Select value={input.goal} onValueChange={(v: CampaignType) => setInput({ ...input, goal: v })}>
                                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CONTENT">CONTENT — UGC Posts</SelectItem>
                                    <SelectItem value="PURCHASE">PURCHASE — Orders</SelectItem>
                                    <SelectItem value="REFERRAL">REFERRAL — Invites</SelectItem>
                                    <SelectItem value="VISIT">VISIT — Foot Traffic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-70">Business Name</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input className="pl-9 h-10 text-sm" placeholder="e.g. Pasta Ghost" value={input.businessName} onChange={e => setInput({ ...input, businessName: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold opacity-70">Context</Label>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input className="pl-9 h-10 text-sm" placeholder="e.g. First bite reaction" value={input.context || ''} onChange={e => setInput({ ...input, context: e.target.value })} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full h-11 font-bold text-sm" onClick={handleGenerate}>
                            Generate Preview <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* PREVIEW */}
                <div className="h-full">
                    {preview ? (
                        <Card className="border-primary/40 bg-primary/5 shadow-xl h-full flex flex-col animate-in slide-in-from-right-4 duration-500">
                             <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-primary/20 text-primary uppercase text-[7px] tracking-widest py-0">A3 Tier</Badge>
                            </div>
                            <CardHeader className="py-4">
                                <CardTitle className="text-lg font-black italic tracking-tighter truncate">{preview.name}</CardTitle>
                                <CardDescription className="text-xs">{preview.drop}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-[8px] uppercase font-bold text-primary tracking-widest">Moves</h4>
                                    {preview.moves.map((move: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 p-1.5 bg-background/50 rounded-lg border border-border/50 text-[11px]">
                                            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">{i+1}</div>
                                            <span>{move}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-2 bg-secondary/10 rounded-lg border border-border/50">
                                        <h5 className="text-[8px] uppercase font-bold text-muted-foreground mb-0.5">Proof</h5>
                                        <Badge variant="outline" className="text-[9px] py-0">{preview.proof}</Badge>
                                    </div>
                                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/30">
                                        <h5 className="text-[8px] uppercase font-bold text-primary mb-0.5">Reward</h5>
                                        <p className="text-sm font-bold">{preview.reward} Gems</p>
                                    </div>
                                </div>
                                <div className="p-2 bg-muted/30 rounded-xl border border-border/50 space-y-1.5">
                                    <h4 className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                                        <TrendingUp className="w-2 h-2" /> Estimation
                                    </h4>
                                    <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-center">
                                        <div><p>{preview.outcome.volume}</p><p className="opacity-50 text-[7px] font-normal uppercase">Vol</p></div>
                                        <div><p>{preview.outcome.reach}</p><p className="opacity-50 text-[7px] font-normal uppercase">Reach</p></div>
                                        <div><p>{preview.outcome.conversionIntent}</p><p className="opacity-50 text-[7px] font-normal uppercase">Intent</p></div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-black text-sm italic tracking-tighter" onClick={handleLaunch} disabled={isLaunching}>
                                    {isLaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : <>LAUNCH <Rocket className="ml-2 w-4 h-4" /></>}
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl opacity-40">
                            <MousePointerClick className="w-8 h-8 mb-2" />
                            <p className="text-center italic text-xs">Enter intent to compile preview.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
