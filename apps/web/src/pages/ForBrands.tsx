import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import {
    Building2,
    Handshake,
    BarChart3,
    Target,
    Users,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Zap,
    Check,
} from "lucide-react";

const sponsorshipBenefits = [
    {
        icon: Target,
        title: "Participation Fit",
        description:
            "Match your campaign to Moments, creators, venues, Scenes, and audiences where people already have a reason to care.",
    },
    {
        icon: Handshake,
        title: "Human Integration",
        description:
            "Show up inside the experience instead of interrupting it. Give people a useful reason to participate.",
    },
    {
        icon: Users,
        title: "Verified Audiences",
        description:
            "See the people who joined, checked in, scanned, redeemed, posted, or returned after the campaign.",
    },
    {
        icon: BarChart3,
        title: "Participation Reporting",
        description:
            "Read campaign performance through attendance, QR engagement, creator content, redemptions, and repeat movement.",
    },
    {
        icon: ShieldCheck,
        title: "Return You Can Trust",
        description:
            "Track the journey from visibility to action with verified Moments, counted contributions, and clear participation receipts.",
    },
];

const stats = [
    { value: "Moments", label: "Campaign building blocks" },
    { value: "Marks", label: "Verified participation" },
    { value: "QR", label: "On-site engagement" },
    { value: "UGC", label: "Creator and Scene signal" },
];

const ForBrands = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen overflow-x-clip bg-background">
            <SEO
                title="Promorang for Brands - Turn Promotions Into Participation"
                description="Promorang helps brands turn marketing visibility into measurable consumer participation through Moments, creators, venues, QR engagement, and campaign reporting."
                type="website"
            />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-charcoal pb-16 pt-28 text-white md:pb-32 md:pt-40">
                <div className="absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
                <div className="container relative z-10 px-4 sm:px-6">
                    <div className="grid gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
                    <div className="min-w-0">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary mb-8">
                            <Building2 className="w-4 h-4" />
                            <span className="min-w-0 text-sm font-medium">Participation Marketing Platform</span>
                        </div>

                        <h1 className="mb-6 max-w-4xl break-words text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] text-white sm:text-6xl md:text-7xl">
                            Turn Promotions <br className="hidden sm:block" />
                            <span className="text-gradient-primary">Into Participation.</span>
                        </h1>

                        <p className="mb-10 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg md:text-xl">
                            Promorang helps brands create Moments people actually want to join:
                            better nights out, useful perks, local rituals, creator-led missions, and venue activations.
                            Then you can see who showed up, scanned, redeemed, created content, and came back.
                        </p>

                        <MarketingPromiseStrip
                            variant="dark"
                            className="mb-8 max-w-3xl"
                            items={[
                                { label: "Situation", text: "Awareness is easy to buy. Real participation is harder to prove." },
                                { label: "Promorang makes possible", text: "Your spend becomes a moment people can attend, redeem, share, and remember." },
                                { label: "Next move", text: "Start with one activation that can prove attendance before scaling the campaign." },
                            ]}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <a href="#outcomes">
                                    Explore Brand Flow
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </a>
                            </Button>
                            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                                {user ? (
                                    <Link to="/onboarding/brand">Start Brand Account</Link>
                                ) : (
                                    <Link to="/auth">Start a Brand Pilot</Link>
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="relative mx-auto w-full max-w-md">
                        <div className="absolute -inset-5 rounded-[2rem] bg-primary/20 blur-[80px]" />
                        <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Participation Signal</p>
                                    <p className="mt-1 text-sm text-zinc-300">Activation preview</p>
                                </div>
                                <Badge className="border-primary/20 bg-primary/15 text-primary">Live</Badge>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                                <h2 className="text-2xl font-black tracking-[-0.04em] text-white">Coffee Tour Weekend</h2>
                                <p className="mt-2 text-sm leading-6 text-zinc-300">A Moment route that gives locals a reason to visit, scan, redeem, return, and talk.</p>
                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    {[
                                        ["Live", "redemptions"],
                                        ["184", "Marks"],
                                        ["Proof", "return record"],
                                    ].map(([value, label]) => (
                                        <div key={label} className="rounded-xl bg-white/10 p-3 text-center">
                                            <p className="text-xl font-black text-white">{value}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </section>

            <MissionRoleValue audience="brand" />

            {/* Participation Measurement Section */}
            <section className="py-20 md:py-32">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
                                <BarChart3 className="w-4 h-4" />
                                <span className="text-sm font-medium">Participation Measurement</span>
                            </div>

                            <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground md:text-5xl">
                                Move Beyond Awareness. <br />
                                Measure What People Actually Do.
                            </h2>

                            <p className="text-lg text-muted-foreground mb-8">
                                Already promoting Carnival, a local festival, a product launch, or a neighborhood campaign?
                                Use Promorang to turn visibility into Moments people join, remember,
                                redeem, and return from with a clear recap of the participation your campaign created.
                            </p>

                            <div className="space-y-4 mb-8">
                                {sponsorshipBenefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <benefit.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                {benefit.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="hero" asChild>
                                <Link to="/strategies">Explore Moment Ideas</Link>
                            </Button>
                        </div>

                        {/* Scene Pulse Preview */}
                        <div className="relative">
                            <div className="bg-charcoal rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-xl font-black tracking-[-0.04em] text-white">Scene Pulse</h4>
                                        <Badge className="bg-primary/20 text-primary border-primary/20 animate-pulse">Live Feed</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { title: "Yoga in the Park", verified: "84%", status: "Active", energy: "Heartfelt" },
                                            { title: "Craft Coffee Tour", verified: "92%", status: "Active", energy: "Vibrant" },
                                        ].map((intel, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-white">{intel.title}</p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Status: {intel.status}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-primary">{intel.verified} Verified</p>
                                                    <p className="text-[9px] text-white/20 uppercase font-black">{intel.energy}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Real stories unfold every day</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-b border-border bg-muted/30">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl font-black text-primary md:text-4xl">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Moment Catalog Section */}
            <section id="outcomes" className="py-20 bg-background border-y border-border">
                <div className="container px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-foreground mb-6">
                            <span className="text-sm font-medium">Moments Are The Atomic Unit</span>
                        </div>
                        <h2 className="mb-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground md:text-5xl">
                            Build Activations From Human Moments
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            A Moment is a small, understandable activation: a place, a reason to participate, a simple action path, and a clear record of what people did.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {/* Scene Moment - Entry Level */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 mb-4 text-xs font-bold">
                                START HERE
                            </div>
                            <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 text-emerald-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Scene Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">SINGLE LOCATION</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Start with one place, one audience, and one clear reason for people to participate.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Pilot Budget</span>
                                    <span className="font-mono font-medium">$0 – $150</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Support Range</span>
                                    <span className="font-mono font-medium text-emerald-500">$0 – $30</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">GPS + Time</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/auth">Start Free</Link>
                            </Button>
                        </div>

                        {/* Activation */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-all">
                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Activation Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Single Location</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Create a specific Moment around a launch, venue, creator, or cultural occasion.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Pilot Budget</span>
                                    <span className="font-mono font-medium">$250 – $750</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">GPS + Time</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/strategies">Explore Potential Outcomes</Link>
                            </Button>
                        </div>

                        {/* Bounty */}
                        <div className="bg-card rounded-xl p-8 border border-primary/20 shadow-soft-xl relative overflow-hidden transition-all">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                SCALABLE
                            </div>
                            <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 text-white">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Bounty Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Distributed</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Run the same participation brief across multiple hosts, creators, or venues with proof attached to each action.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Pilot Budget</span>
                                    <span className="font-mono font-medium">$500 – $2.5k</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">Proof of Work</span>
                                </div>
                            </div>
                            <Button variant="hero" className="w-full" asChild>
                                <Link to="/strategies">Discover Targeted Outcomes</Link>
                            </Button>
                        </div>

                        {/* Digital */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-all">
                            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Digital Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Remote</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Verified participation without physical limits. Ideal for remote activations.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Pilot Budget</span>
                                    <span className="font-mono font-medium">$150 – $500</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">Digital Proof</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/strategies">View Verification Logic</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Participation Playbooks Section */}
            <section id="catalyst" className="py-24 bg-charcoal relative overflow-hidden border-y border-white/5">
                <div className="container px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Zap className="w-3 h-3" />
                            Industry Activation Playbooks
                        </div>
                        <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white md:text-5xl">
                            Design Moments <span className="text-primary">People Want To Join.</span>
                        </h2>
                        <p className="text-white/60 text-lg">
                            Each industry has a different human reason to participate. Use these playbooks
                            to turn products, places, and services into Moments people understand quickly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                industry: "Food & Beverage",
                                description: "Hospitality and taste-makers.",
                                idea: "Founder's Table",
                                ideaDesc: "Reserved seating and off-menu items for early guests who check in and share proof.",
                                icon: Zap,
                            },
                            {
                                industry: "Luxury & Retail",
                                description: "Physical goods and limited drops.",
                                idea: "Preview Drop",
                                ideaDesc: "Early access to a product release for people who join the launch Moment.",
                                icon: Sparkles,
                            },
                            {
                                industry: "Professional Services",
                                description: "Expertise and priority access.",
                                idea: "Priority Session",
                                ideaDesc: "A limited session for customers who complete a qualifying action path.",
                                icon: ShieldCheck,
                            },
                            {
                                industry: "Digital & SaaS",
                                description: "Platforms and remote tools.",
                                idea: "Beta Circle",
                                ideaDesc: "Invite engaged users into a small product feedback Moment with clear next steps.",
                                icon: Target,
                            }
                        ].map((category, i) => (
                            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <category.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{category.industry}</h3>
                                <p className="text-xs text-white/40 mb-6">{category.description}</p>
                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 italic">{category.idea}</p>
                                    <p className="text-xs text-white/60 leading-relaxed">{category.ideaDesc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sharing Power Section */}
            <section className="py-24 bg-background border-b border-border">
                <div className="container px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl" />
                            <div className="relative bg-card rounded-[3rem] border border-border p-12 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <h4 className="font-bold text-lg">Scene Reach</h4>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Social Reach</Badge>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Participation Signal</span>
                                            <span className="text-xs font-black text-primary">Strong</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-primary" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground italic">
                                        "When the right people join a Moment, your campaign moves through real social circles instead of staying in an ad slot."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
                                <Users className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Creator And Scene Amplification</span>
                            </div>
                            <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                                Reach the Right <span className="text-primary italic">People.</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                A strong Moment gives creators and scene members something real to talk about.
                                Promorang helps connect activation participation to the content, check-ins, referrals, and QR paths that show how the Moment traveled.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: "Creator Fit", desc: "Invite creators whose audience matches the Moment and location." },
                                    { title: "Scene Signal", desc: "Collect posts, check-ins, scans, and redemption activity in one activation record." },
                                    { title: "Activation Reports", desc: "See how far your Moment traveled across people, places, and social media." },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Participants Join Section */}
            <section className="py-24 bg-charcoal border-b border-white/5">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 mb-6">
                                <Target className="w-4 h-4" />
                                <span className="text-sm font-bold uppercase tracking-wider">Why People Participate</span>
                            </div>
                            <h2 className="mb-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white md:text-5xl">
                                Why People Actually Show Up
                            </h2>
                            <p className="text-white/60 text-lg">
                                People show up when the offer feels human, scarce, and worth being part of.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <h3 className="font-bold text-xl text-white">There Is A Clear Reason</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Join a Moment</span>
                                        <span className="font-bold text-amber-500">Plan</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Check in at the venue</span>
                                        <span className="font-bold text-amber-500">Proof</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">Redeem or share</span>
                                        <span className="font-bold text-amber-500">Action</span>
                                    </div>
                                </div>
                                <p className="text-sm text-white/40 mt-4">
                                    The best activations are simple: know what to do, know where to go, and know what it unlocks.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-xl text-white">They Feel Part Of It</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        <span className="text-white/60">Newcomer to regular to insider</span>
                                    </div>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-white/60">Insider to advocate to host</span>
                                    </div>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <span className="text-white/60">Return visits create stronger Scene memory</span>
                                    </div>
                                </div>
                                <p className="text-sm text-white/40 mt-4">
                                    People return when the experience recognizes them without making the campaign feel mechanical.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-8 text-center">
                            <h3 className="mb-4 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white">
                                You Are Not Buying Attention. You Are Creating A Moment People Can Join.
                            </h3>
                            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                                The brand is not interrupting the Moment. It is making the Moment more useful, more social, or more memorable while receiving proof that real participation happened.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-white">GPS-verified attendance</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-white">Clear participation path</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-white">Creator and Scene context</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-charcoal text-cream">
                <div className="container px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                            Ready to create a Moment people remember?
                        </h2>
                        <p className="text-cream/70 text-lg mb-8">
                            Start with one pilot activation, prove participation, then scale what works.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                {user ? (
                                    <Link to="/onboarding/brand">
                                        Start Brand Account
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                ) : (
                                    <Link to="/auth">
                                        Start a Brand Pilot
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                )}
                            </Button>
                            <Button variant="outline" size="lg" className="border-cream/30 text-cream hover:bg-cream/10" asChild>
                                <Link to="/strategies">View Moment Catalog</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForBrands;
