import { useState, useEffect } from "react";
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
    CheckCircle2, 
    ArrowRight, 
    Target, 
    Store, 
    MessageCircle,
    Loader2,
    TrendingUp,
    Users,
    MousePointerClick
} from "lucide-react";

type CampaignType = "CONTENT" | "PURCHASE" | "REFERRAL" | "VISIT";

interface CampaignInput {
    goal: CampaignType;
    businessName: string;
    context?: string;
}

interface CompiledCampaign {
    moment: {
        name: string;
        description: string;
        tier: "A1" | "A2" | "A3" | "A4" | "A5";
    };
    drop: string;
    moves: string[];
    proof: "Upload" | "Link" | "OCR";
    reward: {
        baseGems: number;
    };
    outcome: {
        volume: string;
        reach: string;
        conversionIntent: string;
    };
    compiler_metadata: {
        goal: CampaignType;
        generatedAt: string;
    };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AdminCampaignCompiler = () => {
    const { session } = useAuth();
    const { toast } = useToast();
    const [isLaunching, setIsLaunching] = useState(false);
    
    // 1. INPUT
    const [input, setInput] = useState<CampaignInput>({
        goal: "CONTENT",
        businessName: "",
        context: ""
    });

    const [compiled, setCompiled] = useState<CompiledCampaign | null>(null);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // 4. NAMING LOGIC
    const generateMomentName = (inp: CampaignInput): string => {
        if (inp.context) {
            return `${capitalize(inp.context)} – ${inp.businessName}`;
        }

        switch (inp.goal) {
            case "CONTENT": return `Share Your Experience – ${inp.businessName}`;
            case "PURCHASE": return `Order Now – ${inp.businessName}`;
            case "REFERRAL": return `Invite & Earn – ${inp.businessName}`;
            case "VISIT": return `Visit & Snap – ${inp.businessName}`;
        }
    };

    // 8. OUTCOME ESTIMATION
    const estimateOutcome = (goal: CampaignType) => {
        switch(goal) {
            case "CONTENT":
                return {
                    volume: "20–50 actions",
                    reach: "1K–10K",
                    conversionIntent: "Low–Medium"
                };
            case "PURCHASE":
                return {
                    volume: "5–20 actions",
                    reach: "Low",
                    conversionIntent: "High"
                };
            case "REFERRAL":
                return {
                    volume: "10–30 actions",
                    reach: "Expanding",
                    conversionIntent: "Medium–High"
                };
            case "VISIT":
                return {
                    volume: "10–25 actions",
                    reach: "Local",
                    conversionIntent: "Medium"
                };
        }
    };

    // 3. COMPILATION ENGINE
    const compile = () => {
        if (!input.businessName) {
            toast({ title: "Validation Error", description: "Business Name is required.", variant: "destructive" });
            return;
        }

        if (input.context && input.context.split(" ").length > 5) {
            toast({ title: "Validation Error", description: "Context must be 5 words or less.", variant: "destructive" });
            return;
        }

        const goalData: Record<CampaignType, any> = {
            CONTENT: {
                drop: "Post your experience",
                moves: ["Try the product", "Record or photograph it", "Post and submit link"],
                proof: "Link",
                reward: 40
            },
            PURCHASE: {
                drop: "Complete your order",
                moves: ["Order the product", "Save receipt", "Upload proof"],
                proof: "OCR",
                reward: 70
            },
            REFERRAL: {
                drop: "Refer a friend",
                moves: ["Share referral link", "Friend signs up", "Submit referral proof"],
                proof: "Link",
                reward: 90
            },
            VISIT: {
                drop: "Visit the location",
                moves: ["Go to location", "Take photo", "Upload proof"],
                proof: "Upload",
                reward: 50
            }
        };

        const config = goalData[input.goal];
        const name = generateMomentName(input);
        
        // 6. DESCRIPTION GENERATION
        const description = `${config.drop}\n\nSteps:\n1. ${config.moves[0]}\n2. ${config.moves[1]}\n3. ${config.moves[2]}\n\nProof: ${config.proof}`;

        const compiledCampaign: CompiledCampaign = {
            moment: {
                name,
                description,
                tier: "A3" // Tier: "A3" (No dynamic tiering in V1)
            },
            drop: config.drop,
            moves: config.moves,
            proof: config.proof,
            reward: {
                baseGems: config.reward
            },
            outcome: estimateOutcome(input.goal),
            compiler_metadata: {
                goal: input.goal,
                generatedAt: new Date().toISOString()
            }
        };

        setCompiled(compiledCampaign);
    };

    const handleLaunch = async () => {
        if (!compiled) return;

        setIsLaunching(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/campaigns/compiler-launch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(compiled)
            });

            if (!res.ok) throw new Error("Launch failed");

            toast({ title: "Campaign Launched! 🚀", description: "Your compiled campaign is now live on the platform." });
            setCompiled(null);
            setInput({ goal: "CONTENT", businessName: "", context: "" });
        } catch (error: any) {
            toast({ title: "Launch Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-2xl">
                    <Zap className="w-8 h-8 text-primary fill-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Campaign Compiler V1</h2>
                    <p className="text-muted-foreground font-serif italic">Turn intent into immediate, valid campaigns.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* SECTION 1 — INPUT */}
                <Card className="border-border/50 shadow-xl bg-card/30 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-widest font-black flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Input Parameters
                        </CardTitle>
                        <CardDescription>Define the objective for this campaign</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Primary Goal</Label>
                            <Select 
                                value={input.goal} 
                                onValueChange={(v: CampaignType) => setInput({ ...input, goal: v })}
                            >
                                <SelectTrigger className="h-12 border-primary/20 focus:ring-primary">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CONTENT">CONTENT — Drive posts & engagement</SelectItem>
                                    <SelectItem value="PURCHASE">PURCHASE — Drive orders & revenue</SelectItem>
                                    <SelectItem value="REFERRAL">REFERRAL — Drive friend invites</SelectItem>
                                    <SelectItem value="VISIT">VISIT — Drive foot traffic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Business Name</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    className="pl-10 h-12 border-primary/20"
                                    placeholder="e.g., Strawberry Jerk Wings" 
                                    value={input.businessName}
                                    onChange={e => setInput({ ...input, businessName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold">Context (Max 5 Words)</Label>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    className="pl-10 h-12 border-primary/20"
                                    placeholder="e.g., First bite reaction" 
                                    value={input.context}
                                    onChange={e => setInput({ ...input, context: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full h-14 text-lg font-bold shadow-glow" 
                            onClick={compile}
                        >
                            Generate Preview <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* SECTION 2 — PREVIEW */}
                <div className="space-y-6">
                    {compiled ? (
                        <Card className="border-primary/40 bg-primary/5 shadow-2xl relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
                             <div className="absolute top-0 right-0 p-3">
                                <Badge variant="secondary" className="bg-primary/20 text-primary uppercase text-[8px] tracking-widest border-none">
                                    {compiled.moment.tier} Verified
                                </Badge>
                            </div>
                            
                            <CardHeader>
                                <CardTitle className="text-2xl font-black italic tracking-tighter">{compiled.moment.name}</CardTitle>
                                <CardDescription>{compiled.drop}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] uppercase font-bold text-primary tracking-widest">The Moves</h4>
                                    {compiled.moves.map((move, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/50">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm">{move}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-secondary/10 rounded-xl border border-border/50">
                                        <h5 className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Proof Type</h5>
                                        <Badge variant="outline" className="border-primary/30 text-primary">{compiled.proof}</Badge>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/30">
                                        <h5 className="text-[9px] uppercase font-bold text-primary mb-1">User Reward</h5>
                                        <p className="text-xl font-bold">{compiled.reward.baseGems} Gems</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-3">
                                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" /> Outcome Estimation
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center">
                                            <p className="text-xs font-bold">{compiled.outcome.volume}</p>
                                            <p className="text-[8px] text-muted-foreground uppercase">Volume</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold">{compiled.outcome.reach}</p>
                                            <p className="text-[8px] text-muted-foreground uppercase">Reach</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold">{compiled.outcome.conversionIntent}</p>
                                            <p className="text-[8px] text-muted-foreground uppercase">Intent</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-xl italic tracking-tighter shadow-glow"
                                    onClick={handleLaunch}
                                    disabled={isLaunching}
                                >
                                    {isLaunching ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            LAUNCH CAMPAIGN <Rocket className="ml-2 w-6 h-6 fill-white" />
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl opacity-40">
                            <MousePointerClick className="w-12 h-12 mb-4" />
                            <p className="text-center italic font-serif">Enter parameters and generate to preview the compiled result.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
