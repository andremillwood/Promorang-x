import { useState } from 'react';
import { Button } from '../components/ui/button';
import { 
    Target, 
    ArrowRight, 
    Zap, 
    TrendingUp, 
    Users, 
    MessageSquare,
    ShoppingBag,
    MapPin,
    UserPlus,
    X
} from 'lucide-react';
import SEO from '../components/SEO';
import { Playbook, PlaybookCard } from '../components/ami/PlaybookCard';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from '../components/ui/dialog';
import { FlashCampaignCompiler } from '../components/campaigns/FlashCampaignCompiler';

const PLAYBOOKS: Playbook[] = [
    // CONTENT
    {
        id: 'content-1',
        goal: 'CONTENT',
        title: 'First Experience Post',
        context: 'First bite reaction',
        happens: 'People try your product for the first time and record their genuine reaction.',
        gets: 'High-energy customer videos + massive social visibility.',
        bestFor: 'Restaurants, Bakeries, Food Brands'
    },
    {
        id: 'content-2',
        goal: 'CONTENT',
        title: 'Reaction Video',
        context: 'Surprise reaction',
        happens: 'Customers record themselves being surprised by your service or a "special drop".',
        gets: 'Emotional, trust-based UGC that converts skeptics.',
        bestFor: 'Experience brands, Gift shops, Luxury services'
    },
    {
        id: 'content-3',
        goal: 'CONTENT',
        title: 'Share Your Experience',
        context: 'Visitor story',
        happens: 'General call-to-action for visitors to post a story or photo of their visit.',
        gets: 'Consistent brand awareness and "proof of life" for your location.',
        bestFor: 'All businesses with a physical or digital presence'
    },
    // PURCHASE
    {
        id: 'purchase-1',
        goal: 'PURCHASE',
        title: 'Order & Save',
        context: 'Limited time order',
        happens: 'Customers complete an order and upload their receipt as proof.',
        gets: 'Direct, trackable sales with immediate revenue impact.',
        bestFor: 'E-commerce, Takeaway, Retail'
    },
    // VISIT
    {
        id: 'visit-1',
        goal: 'VISIT',
        title: 'Check-In & Post',
        context: 'Location visit',
        happens: 'Customers visit your physical location, take a photo, and upload it.',
        gets: 'Verified foot traffic and local social proof.',
        bestFor: 'Cafes, Gyms, Pop-up Shops, Venues'
    },
    // REFERRAL
    {
        id: 'referral-1',
        goal: 'REFERRAL',
        title: 'Invite & Earn',
        context: 'Referral program',
        happens: 'Customers share a unique referral link with friends who sign up.',
        gets: 'Low-cost acquisition of new, qualified customers.',
        bestFor: 'Subscription services, Apps, Professional services'
    }
];

type GoalType = "CONTENT" | "PURCHASE" | "VISIT" | "REFERRAL";

export default function AMI_Index() {
    const [selectedGoal, setSelectedGoal] = useState<GoalType>("CONTENT");
    const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
    const [isCompilerOpen, setIsCompilerOpen] = useState(false);

    const filteredPlaybooks = PLAYBOOKS.filter(p => p.goal === selectedGoal);

    const handleUsePlaybook = (playbook: Playbook) => {
        setActivePlaybook(playbook);
        setIsCompilerOpen(true);
    };

    const goalOptions = [
        { id: 'CONTENT', label: 'Get people posting about my business', icon: <MessageSquare className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'PURCHASE', label: 'Get more orders or purchases', icon: <ShoppingBag className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: 'VISIT', label: 'Get people to visit my location', icon: <MapPin className="w-5 h-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: 'REFERRAL', label: 'Get referrals / word of mouth', icon: <UserPlus className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Launch Results | Promorang"
                description="Choose what result you want and launch a proven campaign template in under 30 seconds."
            />

            <div className="container mx-auto px-4 py-12 max-w-6xl space-y-16">
                
                {/* Section 1: Result Selection */}
                <div className="space-y-8 text-center">
                    <div className="space-y-4">
                        <h2 className="text-sm uppercase tracking-[0.2em] font-black text-primary opacity-80">Phase 1: Goal</h2>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter italic">
                            What do you want to <span className="text-primary underline decoration-primary/30">achieve?</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Stop browsing concepts. Start selecting results. 
                            Choose a goal to see proven patterns that work.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {goalOptions.map((goal) => (
                            <button
                                key={goal.id}
                                onClick={() => setSelectedGoal(goal.id as GoalType)}
                                className={`
                                    relative p-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col gap-4 group
                                    ${selectedGoal === goal.id 
                                        ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' 
                                        : 'border-border/50 bg-card hover:border-primary/50 hover:bg-muted/50'}
                                `}
                            >
                                <div className={`w-12 h-12 rounded-xl ${goal.bg} ${goal.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    {goal.icon}
                                </div>
                                <span className={`font-bold leading-tight ${selectedGoal === goal.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {goal.label}
                                </span>
                                {selectedGoal === goal.id && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 2: Playbooks */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary fill-primary/20" />
                            <h3 className="text-xl font-black italic tracking-tight uppercase">Proven Templates</h3>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {filteredPlaybooks.length} Patterns Found
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPlaybooks.length > 0 ? (
                            filteredPlaybooks.map((playbook) => (
                                <PlaybookCard 
                                    key={playbook.id} 
                                    playbook={playbook} 
                                    onUse={handleUsePlaybook}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-muted/30 rounded-3xl border-2 border-dashed border-border/50">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <h4 className="text-lg font-bold mb-1">Start with a proven campaign</h4>
                                <p className="text-muted-foreground text-sm">Select a goal above to see ready-to-launch templates.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Campaign Compiler Modal */}
            <Dialog open={isCompilerOpen} onOpenChange={setIsCompilerOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-primary/20 shadow-2xl">
                    <div className="absolute right-4 top-4 z-50">
                        <Button variant="ghost" size="icon" onClick={() => setIsCompilerOpen(false)} className="rounded-full h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="p-8 pb-0">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary/10 text-primary uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded">
                                    Pre-filled Template
                                </div>
                            </div>
                            <DialogTitle className="text-3xl font-serif font-black italic tracking-tighter">
                                {activePlaybook?.title}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Just enter your business name to compile and launch. Everything else is ready.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 pt-4 overflow-y-auto max-h-[80vh]">
                        {activePlaybook && (
                            <FlashCampaignCompiler 
                                initialInput={{
                                    goal: activePlaybook.goal,
                                    context: activePlaybook.context
                                }}
                                onSuccess={() => setIsCompilerOpen(false)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Footer / CTA Section */}
            <div className="bg-muted/30 border-t border-border/50 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <TrendingUp className="w-10 h-10 mx-auto text-primary opacity-50" />
                    <h2 className="text-3xl font-serif font-bold italic tracking-tight">Don't see what you need?</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Our Campaign Compiler can build custom strategies from scratch for any business objective.
                    </p>
                    <Button variant="outline" size="lg" className="rounded-full font-black italic tracking-tighter" asChild>
                        <a href="/activate">Launch Custom Wizard <ArrowRight className="ml-2 w-4 h-4" /></a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
