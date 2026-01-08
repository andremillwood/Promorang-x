import React from "react";
import ProposalLayout from "../ProposalLayout";
import { motion } from "framer-motion";
import { ArrowRight, Shield, CheckCircle2, Users, Briefcase, Zap, LayoutDashboard, Send } from "lucide-react";

// Section Components (Temporary placeholders to be extracted later)

const HeroSection = () => (
    <section id="overview" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-900 z-10" />
            <img
                src="https://images.unsplash.com/photo-1449965024614-6a170393dd3b?auto=format&fit=crop&q=80&w=2000"
                alt="Modern mobility"
                className="w-full h-full object-cover opacity-60"
            />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-sm font-semibold tracking-wide uppercase mb-8">
                    Proposal v1.0
                </span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                    Building Jamaica’s Most Trusted <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mobility & Courier Platform</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                    Dryva is the trust layer for the Caribbean. Safety, transparency, and accountability integrated into every mile.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button
                        onClick={() => document.getElementById('market')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group"
                    >
                        Explore the Strategy
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => document.getElementById('activation')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all backdrop-blur-sm border border-white/20"
                    >
                        View Activation Plan
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12"
            >
                <div className="text-center">
                    <div className="text-3xl font-bold mb-1">92%</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest">Mobile Readiness</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold mb-1">Zero</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest">Cash Conflict</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold mb-1">24/7</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest">Accountability</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold mb-1">100%</div>
                    <div className="text-slate-400 text-xs uppercase tracking-widest">Digital Audit</div>
                </div>
            </motion.div>
        </div>
    </section>
);

const SectionHeading = ({ title, subtitle, light = false }: { title: string, subtitle: string, light?: boolean }) => (
    <div className="mb-16">
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        <div className={`w-12 h-1 bg-blue-600 mb-6 rounded-full`} />
        <p className={`text-lg md:text-xl max-w-3xl leading-relaxed ${light ? 'text-slate-300' : 'text-slate-600'}`}>
            {subtitle}
        </p>
    </div>
);

const MarketRealitySection = () => (
    <section id="market" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
            <SectionHeading
                title="Market Reality"
                subtitle="The inevitability of digital mobility is driven by three converging factors: technology, demand, and regulation."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    {
                        title: "Consumer Demand",
                        fact: "85% of urban riders prioritize safety over price.",
                        insight: "Digital footprints provide the safety layer informal transport lacks.",
                        icon: Users
                    },
                    {
                        title: "Mobile Readiness",
                        fact: "Jamaica exceeds 90% smartphone penetration.",
                        insight: "Infrastructure is no longer a barrier; friction in the experience is.",
                        icon: Zap
                    },
                    {
                        title: "Regulation Pressure",
                        fact: "Transport authorities are tightening compliance.",
                        insight: "Dryva's compliance-first model ensures long-term operational license.",
                        icon: Shield
                    },
                    {
                        title: "Business Mobility",
                        fact: "SMEs lack reliable, trackable courier options.",
                        insight: "The gap between personal deliveries and logistics is where Dryva wins.",
                        icon: Briefcase
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <item.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900">{item.title}</h3>
                        <p className="text-blue-600 font-semibold mb-2 text-sm">{item.fact}</p>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.insight}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const DemandGrowthSection = () => (
    <section id="activation" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
            <SectionHeading
                title="Demand Growth Engine"
                subtitle="How users are activated and retained, not just acquired."
                light
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                {[
                    {
                        title: "Urban Riders",
                        problem: "Safety & Cash Anxiety",
                        target: "Daily commuters, Women, Students",
                        trigger: "Safety verification, Cashless payment",
                        solution: "Vetted drivers, real-time tracking, digital wallet",
                        promorang: "Community challenges and referral multipliers for early advocates."
                    },
                    {
                        title: "Airport & Tourism",
                        problem: "Overpricing & Unreliability",
                        target: "International travelers, Hotel guests",
                        trigger: "Fixed pricing, Flight tracking",
                        solution: "Premium fleet, multilinguistic support, corporate billing",
                        promorang: "Tourism ambassador rewards for hotel staff and tour guides."
                    },
                    {
                        title: "SMEs & Courier",
                        problem: "High Fragmentation",
                        target: "E-commerce, Local shops, Food vendors",
                        trigger: "Bulk delivery UI, API integration",
                        solution: "Shared bearer network, route optimization",
                        promorang: "Business growth incentives for frequent merchant partners."
                    },
                    {
                        title: "Corporates",
                        problem: "Lack of Accountability",
                        target: "Banks, BPOs, Law firms",
                        trigger: "Centralized billing, usage reports",
                        solution: "Priority dispatch, dedicated support line",
                        promorang: "Departmental challenges to seed usage within large teams."
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all cursor-default group">
                        <h3 className="text-2xl font-bold mb-6 text-blue-400 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Problem</span>
                                <span className="text-slate-200 text-right">{item.problem}</span>
                            </div>
                            <div className="flex justify-between items-start gap-4">
                                <span className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Trigger</span>
                                <span className="text-slate-200 text-right">{item.trigger}</span>
                            </div>
                            <div className="flex justify-between items-start gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <span className="text-blue-400 text-sm uppercase tracking-wider font-semibold">Strategy</span>
                                <span className="text-blue-50 text-right italic">"{item.promorang}"</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const SupplyScalingSection = () => (
    <section id="supply" className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <SectionHeading
                title="Supply-Side Growth"
                subtitle="Scaling supply without chaos through structured onboarding and peer-to-peer credibility."
            />

            <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="w-full lg:w-1/2 space-y-12">
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Social Seeding (WhatsApp)</h4>
                            <p className="text-slate-600">Active recruitment inside Uber/inDrive groups. Positioned as: "Work smarter, not cheaper".</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">BPO Workforce Synergy</h4>
                            <p className="text-slate-600">Targeting shift workers as early adopters. Digitally fluent, predictable schedules, and natural ambassadors.</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">Time-to-First-Job Optimization</h4>
                            <p className="text-slate-600">Reducing friction from sign-up to earning. Real-time document verification and automated background checks.</p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 bg-slate-900 aspect-square lg:aspect-video rounded-3xl p-12 flex flex-col justify-center text-white relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <h4 className="text-3xl font-bold mb-6">"Elite Bearer" <br />Performance Tiers</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-blue-500" />
                                <span>Base Earner (Standard)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-blue-500" />
                                <span>Verified Pro (Accountability layer)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-blue-500" />
                                <span>Ambassador (Growth partner)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-blue-500" />
                                <span>Dryva Black (Premium tier)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const TradeMarketingSection = () => (
    <section id="marketing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
            <SectionHeading
                title="Trade Marketing & Market Seeding"
                subtitle="Leveraging existing networks to create non-obvious leverage and rapid trust."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-2xl font-bold mb-6 text-slate-900">WhatsApp Ecosystem Seeding</h4>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Direct outreach inside existing Uber and inDrive driver/bearer groups. Peer-to-peer credibility is the fastest way to bridge the supply gap.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-1" />
                            <span>Trust spreads faster inside existing operator networks.</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-1" />
                            <span>Higher quality supply through vetted peer referrals.</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-2xl font-bold mb-6 text-slate-900">On-Ground Activations</h4>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        High-visibility pop-up onboarding stations at BPO hubs, university campuses, and transport nodes.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-1" />
                            <span>BPO partnerships as volume anchors for off-peak supply.</span>
                        </li>
                        <li className="flex items-start gap-3 text-slate-700">
                            <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-1" />
                            <span>SME courier activations to secure base-layer demand.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
);

const DryvaBlackSection = () => (
    <section id="black" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(30,58,138,0.3),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="w-full lg:w-1/2">
                    <span className="text-blue-500 font-bold uppercase tracking-[0.2em] text-sm mb-4 block">Premium Opportunity</span>
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Dryva Black <br /><span className="text-slate-500">— Jamaica’s Missing Tier</span></h2>
                    <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-xl">
                        There is no Uber Black equivalent in Jamaica. A latent demand exists among executives, diplomats, and tourism VIPs for a truly premium, invitation-only mobility experience.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-lg">Premium Fleet</h4>
                            <p className="text-slate-500 text-sm">Strict vehicle standards, late-model luxury cars.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-lg">Top-Tier Drivers</h4>
                            <p className="text-slate-500 text-sm">Invitation-only, highest-rated professionals.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-lg">Higher Margins</h4>
                            <p className="text-slate-500 text-sm">Premium pricing supports improved platform economics.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-lg">Brand Halo</h4>
                            <p className="text-slate-500 text-sm">Elevates the perception of the entire Dryva ecosystem.</p>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 bg-gradient-to-br from-slate-900 to-black p-12 rounded-[40px] border border-white/10 shadow-2xl">
                    <div className="space-y-8">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <h5 className="text-blue-400 font-bold mb-2">Use Case: Corporate Contracts</h5>
                            <p className="text-slate-400 text-sm">Dedicated executive transport for law firms and financial institutions.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <h5 className="text-blue-400 font-bold mb-2">Use Case: Tourism VIPs</h5>
                            <p className="text-slate-400 text-sm">Luxury airport transfers and private excursions for high-net-worth visitors.</p>
                        </div>
                        <button className="w-full py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                            Explore Dryva Black Economics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const TimelineSection = () => (
    <section id="timeline" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
            <SectionHeading
                title="Execution Timeline"
                subtitle="A disciplined 180-day roadmap from foundation to premium rollout."
            />

            <div className="mt-16 space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-500/20 before:to-transparent">
                {[
                    {
                        days: "0–30 Days",
                        title: "Foundation & Funnels",
                        objective: "System integrity & supply baseline.",
                        actions: ["Beta pilot launch", "Initial driver vetting", "App store stabilization"]
                    },
                    {
                        days: "31–60 Days",
                        title: "Activation & Supply Scaling",
                        objective: "Market density in core hubs.",
                        actions: ["BPO partnership rollout", "WhatsApp seeding engine", "Referral challenge launch"]
                    },
                    {
                        days: "61–90 Days",
                        title: "Partnerships & Optimization",
                        objective: "Efficiency & repeat usage.",
                        actions: ["SME courier API launch", "Corporate billing pilot", "Route optimization v2"]
                    },
                    {
                        days: "90–180 Days",
                        title: "Expansion & Premium Rollout",
                        objective: "National scale & Dryva Black.",
                        actions: ["Parish-wide expansion", "Dryva Black pilot", "Tourism ecosystem integration"]
                    }
                ].map((phase, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-blue-100 bg-white group-hover:bg-blue-600 group-hover:text-white transition-colors z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <Zap size={16} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-blue-600">{phase.days}</span>
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Phase {i + 1}</span>
                            </div>
                            <h4 className="text-xl font-bold mb-2 text-slate-900">{phase.title}</h4>
                            <p className="text-slate-600 mb-6 text-sm">{phase.objective}</p>
                            <div className="flex flex-wrap gap-2">
                                {phase.actions.map((action, j) => (
                                    <span key={j} className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-full text-xs font-medium">
                                        {action}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const ScorecardSection = () => (
    <section id="scorecard" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
            <SectionHeading
                title="Scorecard & Measurement"
                subtitle="Operating with discipline through real-time feedback and KPI transparency."
                light
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {[
                    { label: "Demand Metrics", value: "Repeat Usage Rate", desc: "Focus on retention, not just acquisition." },
                    { label: "Supply Metrics", value: "Relay Response Time", desc: "Measuring reliability down to the second." },
                    { label: "Financial Metrics", value: "Contribution Margin", desc: "Path to profitability in every ride." },
                    { label: "Risk Indicators", value: "Compliance Health", desc: "100% digital audit readiness." }
                ].map((item, i) => (
                    <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">{item.label}</div>
                        <div className="text-2xl font-bold mb-2">{item.value}</div>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const EngagementCTA = () => (
    <section id="cta" className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900">Authorize the Future of <br />Mobility in Jamaica.</h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                Select the preferred rollout scope to begin technical and operational review.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button className="flex flex-col items-center justify-center p-8 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <Zap size={32} className="text-slate-300 group-hover:text-blue-600 mb-4" />
                    <span className="font-bold text-slate-900">Authorize Pilot</span>
                </button>
                <button className="flex flex-col items-center justify-center p-8 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <LayoutDashboard size={32} className="text-slate-300 group-hover:text-blue-600 mb-4" />
                    <span className="font-bold text-slate-900">Select Scope</span>
                </button>
                <button className="flex flex-col items-center justify-center p-8 border-blue-600 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all group">
                    <Send size={32} className="text-white mb-4" />
                    <span className="font-bold text-white">Schedule Review</span>
                </button>
            </div>
        </div>
    </section>
);

const sections = [
    { id: "overview", label: "Overview" },
    { id: "market", label: "Market Reality" },
    { id: "position", label: "Strategic Position" },
    { id: "activation", label: "Demand Engine" },
    { id: "supply", label: "Supply Growth" },
    { id: "marketing", label: "Trade Marketing" },
    { id: "black", label: "Dryva Black" },
    { id: "timeline", label: "Timeline" },
    { id: "scorecard", label: "Scorecard" },
    { id: "cta", label: "Next Steps" },
];

const DryvaMobilityPage: React.FC = () => {
    return (
        <ProposalLayout title="Dryva Mobility Proposal" sections={sections}>
            <HeroSection />
            <MarketRealitySection />

            {/* Strategic Position */}
            <section id="position" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading
                        title="Strategic Position"
                        subtitle="Dryva is not the cheapest ride. Dryva is the most dependable decision."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 italic">Trust Compounds</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Price-led platforms face a 'race to the bottom'. Dryva focuses on reliability, creating a premium moat that competitors cannot cross with discounts alone.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 italic">The Convergent Network</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Corporates, women riders, and tourism operators seek safety. By serving the most demanding segments first, we capture the wider market by default.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4 italic">Market Integrity</h3>
                            <p className="text-slate-600 leading-relaxed">
                                We don't disrupt for disruption's sake. We professionalize an informal market through digital accountability, creating value for both sides.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <DemandGrowthSection />
            <SupplyScalingSection />
            <TradeMarketingSection />
            <DryvaBlackSection />
            <TimelineSection />
            <ScorecardSection />
            <EngagementCTA />

        </ProposalLayout>
    );
};

export default DryvaMobilityPage;
