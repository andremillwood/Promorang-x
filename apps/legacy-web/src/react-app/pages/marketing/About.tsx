import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { ShieldCheck, Target, Users, BarChart3 } from 'lucide-react';

export default function About() {
    const values = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
            title: "Verification Integrity",
            description: "We provide defensible proof for every campaign action. Accuracy is our primary metric.",
        },
        {
            icon: <Target className="w-8 h-8 text-purple-500" />,
            title: "Performance Certainty",
            description: "No more estimates. We turn field actions into verified data points for professional reporting.",
        },
        {
            icon: <Users className="w-8 h-8 text-green-500" />,
            title: "Direct Accountability",
            description: "Clear terms and direct verification protocols between brands and participants.",
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
            title: "Operational Excellence",
            description: "Building the infrastructure for the next generation of marketing verification.",
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-pr-surface-background">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">Verification Standard</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto leading-relaxed">
                        Promorang provides the industrial infrastructure for campaign certainty and defensible proof of performance.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Our Mandate</h2>
                        <p className="text-xl text-pr-text-2 leading-relaxed">
                            To eliminate uncertainty in marketing activations by providing a globally recognized standard for verification and settlement.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-pr-text-1 mb-4">The Challenge</h3>
                            <p className="text-lg text-pr-text-2 mb-6 leading-relaxed">
                                Traditional marketing reporting often relies on soft metrics and unverifiable signals. This creates risk for brands and frustration for participants.
                            </p>
                            <p className="text-lg text-pr-text-2 leading-relaxed">
                                We've engineered a solution that turns actions into audit-grade assets, ensuring that every campaign dollar is accounted for.
                            </p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 shadow-xl">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="text-blue-500 w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Defensible Proof</div>
                                        <div className="text-sm text-pr-text-2">Every signal is verified and on the record.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Target className="text-emerald-500 w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Bilateral Success</div>
                                        <div className="text-sm text-pr-text-2">Clear goals lead to immediate settlement.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Our Operating Principles</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            The standards that drive professional campaign execution.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/30 transition-all shadow-sm">
                                <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center ring-1 ring-pr-border">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{value.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-8 text-center">Development History</h2>
                    <div className="prose prose-lg max-w-none text-pr-text-2">
                        <p className="leading-relaxed mb-6">
                            Promorang was founded to solve a critical trust gap in the performance marketing industry.
                        </p>
                        <p className="leading-relaxed mb-6">
                            While digital tracking has existed for years, the verification of real-world community action remained fragmented and unreliable. We recognized that for brands to truly scale their community-led initiatives, they needed more than just platform access—they needed an institutional-grade verification protocol.
                        </p>
                        <p className="leading-relaxed mb-6">
                            Our architecture was built from the ground up to support the "Success Standard"—a framework that prioritizes defensible proof and ethical transparency. Today, Promorang serves as the backbone for high-stakes campaigns across retail, events, and digital media.
                        </p>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Implement the Standard"
                subheadline="Bring professional verification to your next campaign."
                ctaText="Register Company"
                ctaLink="/auth"
                secondaryCta={{ text: "View Framework", link: '/how-it-works' }}
            />

            <MarketingFooter />
        </div>
    );
}
