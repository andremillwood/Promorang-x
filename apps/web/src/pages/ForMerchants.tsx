import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import {
    Store,
    Users,
    Gift,
    TrendingUp,
    ArrowRight,
    TrendingUp as Graph,
    MapPin,
    Clock,
    ShieldCheck,
    Lock,
    CheckCircle2
} from "lucide-react";

const merchantBenefits = [
    {
        icon: MapPin,
        title: "A Trusted Local Stage",
        description:
            "Position your space as part of the neighborhood story. List your venue so hosts, creators, and brands can route real moments through your doors.",
    },
    {
        icon: Users,
        title: "Real Community Activity",
        description:
            "Attract active locals who truly value your space. Turn product drops, service rituals, sampling missions, and brand-supported visits into consistent neighborhood energy.",
    },
    {
        icon: ShieldCheck,
        title: "Verified Welcomes",
        description:
            "Greet guests at your counter, confirm arrival with a quick PIN or scan, and turn a visit into proof that rewards and campaigns can trust.",
    },
    {
        icon: TrendingUp,
        title: "Proof You Can Reuse",
        description:
            "See which moments, offers, and creator stories brought people in so you can repeat what worked instead of guessing.",
    },
];

const stats = [
    { value: "Visits", label: "Verified in person" },
    { value: "Offers", label: "Controlled redemptions" },
    { value: "Proof", label: "Reusable local record" },
    { value: "$0", label: "Cost to list" },
];

const ForMerchants = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Promorang for Merchants - Your Space is the Stage"
                description="Become a trusted destination for community moments. Attract storytellers, welcome them personally, and build real activity in your space."
                type="website"
            />

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-white/5 bg-charcoal pb-16 pt-28 md:pb-32 md:pt-40">
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -top-24 -left-24" />
                <div className="container relative z-10 px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8">
                            <Store className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">A space for every story</span>
                        </div>

                        <h1 className="mx-auto mb-6 max-w-[18rem] break-words font-serif text-[1.8rem] font-bold italic leading-tight text-white sm:max-w-4xl sm:text-4xl md:text-7xl">
                            Become the Place <span className="text-primary">People Return To.</span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg md:text-xl">
                            Your space is more than four walls. It can be a boutique drop point, a salon ritual, a grocery sampling station,
                            a trusted barber chair, or a neighborhood service hub. Host the moments people want to talk about,
                            verify the visits that actually happen, and give people a reason to come back.
                        </p>

                        <MarketingPromiseStrip
                            variant="dark"
                            className="mx-auto mb-8 max-w-5xl text-left"
                            items={[
                                { label: "Situation", text: "Foot traffic is valuable only when people remember why they came." },
                                { label: "Promorang makes possible", text: "Your place becomes a stage for moments, verified welcomes, rewards, and return visits." },
                                { label: "Next move", text: "List your spot and create one reason for people to visit this week." },
                            ]}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <Link to="/dashboard/venues/add">
                                    Register Your Spot
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/5" size="lg" asChild>
                                <Link to="/explore/moments">See what's happening</Link>
                            </Button>
                        </div>

                        <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
                            {[
                                ["Welcome", "Turn arrival into a human first impression."],
                                ["Validate", "Confirm check-ins, redemptions, and visits."],
                                ["Return", "Use proof to create repeat-worthy offers."],
                            ].map(([title, text]) => (
                                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">{title}</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-300">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* The Verification Flow */}
            <section className="py-24 bg-background">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Trust & Welcomes</span>
                            </div>
                            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
                                A <span className="text-emerald-600 italic">Face-to-Face Check-in.</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                We've kept things simple and human. When a guest arrives for a drop, service appointment,
                                sampling mission, or visit ritual, a quick PIN at your counter confirms they're really there.
                                It is a simple way to welcome people, unlock rewards, protect limited offers, issue founder memories, and create return-driving perks for your patrons.
                            </p>
                            
                            <div className="grid gap-6">
                                {merchantBenefits.map((benefit, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-muted transition-colors group">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 transition-colors group-hover:text-white flex-shrink-0">
                                            <benefit.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground mb-1">{benefit.title}</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-[3rem] blur-3xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-charcoal p-6 shadow-2xl sm:rounded-[3rem] sm:p-12">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <Store className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">Venue Check-in</p>
                                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Ready to welcome</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-primary/20 text-primary border-primary/30">Secure PIN</Badge>
                                    </div>

                                    <div className="p-8 bg-black/40 rounded-2xl border border-white/5 text-center space-y-6">
                                        <p className="text-xs text-white/60 font-medium">Verify guest arrival:</p>
                                        <div className="flex justify-center gap-2 sm:gap-3">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="flex h-14 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-serif text-xl font-bold text-white sm:h-16 sm:w-12 sm:text-2xl">
                                                    *
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-6">
                                            Confirm Personal Welcome
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-white/40">
                                        <Lock className="w-3 h-3" />
                                        <span className="text-[9px] uppercase font-black tracking-widest">Secure & Simple Verification</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Dashboard */}
            <section className="py-16 bg-muted/30 border-y border-border">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center group">
                                <p className="font-serif text-4xl font-bold text-foreground mb-2 group-hover:text-emerald-600 transition-colors">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-charcoal relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
                    <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-8 italic">
                        The Heart of the <span className="text-primary italic">Neighborhood.</span>
                    </h2>
                    <p className="text-lg text-white/60 mb-10 leading-relaxed">
                        Ready to welcome the storytellers in your community? List your spot for free and start seeing
                        more local faces, verified visits, and repeat-worthy momentum flow through your doors.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/dashboard/venues/add">Register Your Spot Now</Link>
                        </Button>
                        <Link to="/help" className="text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">
                            How it works for Spots
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForMerchants;
