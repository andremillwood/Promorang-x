import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Lightbulb,
    ArrowRight,
    Sparkles,
    Users,
    DollarSign,
    CheckCircle,
    Rocket
} from "lucide-react";

export default function ProposeLanding() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
                    <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
                </div>

                <div className="container px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/50 text-foreground mb-8 animate-fade-in">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Get Your Idea Funded</span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight max-w-4xl mx-auto">
                        Don't pay to organize. <br />
                        <span className="text-gradient-primary">Get paid to create.</span>
                    </h1>

                    <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Have a concept for a moment that gathers people? Brands are looking for hosts like you.
                        Propose your idea, get approved, and unlock the budget to make it real.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="xl" variant="hero" asChild className="group">
                            <Link to="/propose/new">
                                Start Proposal
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="xl" variant="outline" asChild>
                            <Link to="/discover">See Examples</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 border-y border-border/40 bg-secondary/20">
                <div className="container px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        {[
                            {
                                icon: Lightbulb,
                                title: "1. Pitch Your Vision",
                                desc: "Describe your event idea, set your budget, and define the audience. It takes 5 minutes.",
                                color: "text-amber-500"
                            },
                            {
                                icon: CheckCircle,
                                title: "2. Get Verified",
                                desc: "We review your proposal for safety and viability. Once approved, it goes live to sponsors.",
                                color: "text-emerald-500"
                            },
                            {
                                icon: DollarSign,
                                title: "3. Get Funded",
                                desc: "Brands fund your budget in exchange for presence. You host, get paid, and build your record.",
                                color: "text-blue-500"
                            }
                        ].map((step, i) => (
                            <div key={i} className="text-center relative">
                                {i !== 2 && (
                                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-border -z-10" />
                                )}
                                <div className={`w-20 h-20 mx-auto rounded-3xl bg-background border border-border shadow-soft flex items-center justify-center mb-6`}>
                                    <step.icon className={`w-8 h-8 ${step.color}`} />
                                </div>
                                <h3 className="font-serif text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Guarantee (Risk Reversal) */}
            <section className="py-32">
                <div className="container px-6">
                    <div className="bg-card rounded-[3rem] p-12 md:p-20 border border-border/50 shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-20 -mb-20" />

                        <Rocket className="w-12 h-12 text-primary mx-auto mb-6" />

                        <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
                            Zero Financial Risk.
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Unlike traditional event hosting, you don't front the costs.
                            If a brand funds your proposal, the budget is escrowed instantly.
                            You enter the moment with confidence, not debt.
                        </p>

                        <Button size="xl" variant="default" className="rounded-full px-12" asChild>
                            <Link to="/propose/new">Draft Your Proposal</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
