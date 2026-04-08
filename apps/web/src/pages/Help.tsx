import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Shield, HelpCircle, Mail, MessageSquare, ArrowRight, BookOpen, CheckCircle2, Users, Calendar, Gift } from "lucide-react";
import SEO from "@/components/SEO";

const HelpCenter = () => {
    const navigate = useNavigate();

    const faqs = [
        {
            q: "What is a 'Moment'?",
            a: "A Moment is a brand-funded activation. It's an event, gathering, or experience hosted by a community member and funded by a brand looking to drive specific outcomes like foot traffic or UGC."
        },
        {
            q: "How do I get paid for hosting?",
            a: "Hosts can claim 'Bounties' on our Bounty Board. Once you host the moment and verify the required actions (like photos or check-ins), the bounty amount is released to your account."
        },
        {
            q: "What is 'Access Rank'?",
            a: "Access Rank is your reputation score. Consistent participation and high-quality hosting increases your rank, unlocking higher-paying bounties and exclusive brand opportunities."
        }
    ];

    const guides = [
        {
            icon: Users,
            title: "Getting Started as a Participant",
            description: "Discover nearby Moments, check in with GPS verification, and earn points for consistent participation.",
            steps: [
                "Create your free account",
                "Browse Moments in your area",
                "Check in at events using GPS",
                "Build your Access Rank through consistency"
            ]
        },
        {
            icon: Calendar,
            title: "Hosting Your First Moment",
            description: "Learn how to create, fund, and execute successful community activations.",
            steps: [
                "Start with a free Community Moment",
                "Define your audience and outcome",
                "Set up GPS verification zones",
                "Track participant engagement in real-time"
            ]
        },
        {
            icon: Gift,
            title: "Claiming Bounties",
            description: "Browse brand-funded opportunities and get paid for verified execution.",
            steps: [
                "Browse the Bounty Board",
                "Review funding requirements",
                "Execute the activation",
                "Submit proof for payment release"
            ]
        }
    ];

    const safetyGuidelines = [
        {
            title: "Verified Locations Only",
            description: "All Moments must occur at public or pre-approved venues with GPS verification enabled."
        },
        {
            title: "Community Standards",
            description: "Hosts and participants must maintain respectful, inclusive environments. Discrimination or harassment results in immediate removal."
        },
        {
            title: "Age Requirements",
            description: "Users must be 18+ to host Moments. Participants under 18 require parental consent for certain activations."
        },
        {
            title: "Data Privacy",
            description: "We never sell your location data. GPS verification is used solely for proof-of-attendance and is deleted after 30 days."
        },
        {
            title: "Dispute Resolution",
            description: "All bounty disputes are reviewed by our Trust & Safety team within 48 hours with full transparency."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Help Center | Promorang"
                description="Find answers to common questions and learn how to get the most out of Promorang."
            />

            <main className="pt-24 pb-20 px-6">
                <div className="container max-w-5xl mx-auto">
                    {/* Hero */}
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">How can we help?</h1>
                        <p className="text-lg text-muted-foreground">
                            Search our documentation or browse common questions below.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="grid sm:grid-cols-3 gap-6 mb-16">
                        <a href="#guides" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors group cursor-pointer">
                            <BookOpen className="w-10 h-10 text-primary mb-4" />
                            <h3 className="font-bold text-lg mb-2">Guides</h3>
                            <p className="text-sm text-muted-foreground mb-4">Learn the basics of hosting and participating.</p>
                            <div className="flex items-center text-primary text-sm font-bold group-hover:translate-x-1 transition-transform">
                                Read Guides <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </a>

                        <div className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => navigate('/contact')}>
                            <MessageSquare className="w-10 h-10 text-primary mb-4" />
                            <h3 className="font-bold text-lg mb-2">Support</h3>
                            <p className="text-sm text-muted-foreground mb-4">Get direct help from our success team.</p>
                            <div className="flex items-center text-primary text-sm font-bold group-hover:translate-x-1 transition-transform">
                                Contact Us <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>

                        <a href="#safety" className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors group cursor-pointer">
                            <Shield className="w-10 h-10 text-primary mb-4" />
                            <h3 className="font-bold text-lg mb-2">Safety</h3>
                            <p className="text-sm text-muted-foreground mb-4">Our community standards and safety protocols.</p>
                            <div className="flex items-center text-primary text-sm font-bold group-hover:translate-x-1 transition-transform">
                                Learn Safety <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </a>
                    </div>

                    {/* Guides Section */}
                    <section id="guides" className="mb-20 scroll-mt-24">
                        <div className="mb-12">
                            <h2 className="font-serif text-3xl font-bold mb-4">Getting Started Guides</h2>
                            <p className="text-lg text-muted-foreground">
                                Step-by-step instructions for participants, hosts, and brands.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {guides.map((guide, i) => (
                                <div key={i} className="p-6 bg-card border border-border rounded-2xl">
                                    <guide.icon className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="font-bold text-lg mb-2">{guide.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                                    <ul className="space-y-2">
                                        {guide.steps.map((step, j) => (
                                            <li key={j} className="flex items-start gap-2 text-sm">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Safety Section */}
                    <section id="safety" className="mb-20 scroll-mt-24">
                        <div className="mb-12">
                            <h2 className="font-serif text-3xl font-bold mb-4">Safety & Community Standards</h2>
                            <p className="text-lg text-muted-foreground">
                                Our commitment to creating safe, verified, and trustworthy experiences.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {safetyGuidelines.map((guideline, i) => (
                                <div key={i} className="p-6 bg-card border border-border rounded-2xl">
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        {guideline.title}
                                    </h3>
                                    <p className="text-muted-foreground">{guideline.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQs */}
                    <div className="space-y-8 mb-20">
                        <h2 className="font-serif text-3xl font-bold">Frequently Asked Questions</h2>
                        <div className="grid gap-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="p-6 bg-card border border-border rounded-2xl">
                                    <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                                    <p className="text-muted-foreground">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Still need help? */}
                    <div className="p-8 bg-muted rounded-3xl text-center">
                        <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                        <p className="text-muted-foreground mb-6">We're here to help you succeed.</p>
                        <Button variant="hero" onClick={() => navigate('/contact')}>
                            Email Support
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HelpCenter;
