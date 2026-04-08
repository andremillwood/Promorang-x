import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calculator,
    Zap,
    TrendingUp,
    Users,
    Gift,
    Target,
    ArrowRight,
    CheckCircle,
    Crown,
    Globe,
    ShieldCheck,
    Sparkles,
    Heart,
    Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';

export default function CredibilityPage() {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0714] text-white overflow-x-hidden font-sans">
            <SEO
                title="Record of Presence | Your Story's Weight"
                description="Your experiences have value. Understand the depth of your presence and how it unlocks meaning across the platform."
                canonicalUrl="https://promorang.co/credibility"
            />
            <MarketingNav />

            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-[#0A0714]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,202,0.1)_0%,transparent_50%)]" />

                <div className="container relative mx-auto px-4 text-center z-10">
                    <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-5 py-2 rounded-full mb-10">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest">Presence Index</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-tight">
                            Your history is your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">verified depth.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                            Promorang doesn’t just track where you go. It honors where you’ve been. Your **Record of Presence** is the weight of your story, unlocking rewards and recognition by proving you were truly there.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button
                                size="lg"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-7 text-lg rounded-[2rem] shadow-xl shadow-indigo-500/20 transition-all hover:scale-105"
                                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Calculator className="mr-3 h-5 w-5" />
                                Discover My Value
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/10 text-white hover:bg-white/5 px-10 py-7 text-lg rounded-[2rem]"
                                onClick={() => navigate('/auth')}
                            >
                                Join the Circle
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. WHAT IS PRESENCE DEPTH */}
            <section className="py-24 bg-[#0F0C1E] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">What is Presence Depth?</h2>
                        <p className="text-xl text-pr-text-2 font-medium">
                            It’s the invisible thread of your experiences. A verified record that shows you didn’t just look—you participated.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <Card className="p-10 bg-white/5 border-white/10 rounded-[3rem] hover:bg-white/10 transition-all">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <TrendingUp className="text-emerald-400" />
                                How it builds:
                            </h3>
                            <ul className="space-y-5">
                                {[
                                    'Verified moment entries',
                                    'Meaningful sharing',
                                    'Consistent participation',
                                    'Inviting others to the circle',
                                    'Acknowledged contributions',
                                    'Real-world interactions'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-pr-text-2 text-lg font-medium">
                                        <CheckCircle className="h-6 w-6 text-emerald-400/70" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card className="p-10 bg-gradient-to-br from-indigo-950/30 to-[#0A0714] border-white/10 rounded-[3rem] hover:bg-white/10 transition-all">
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <Crown className="text-indigo-400" />
                                What it unlocks:
                            </h3>
                            <ul className="space-y-5">
                                {[
                                    'Exclusive Moment Access',
                                    'Creator Acknowledgement',
                                    'Special Brand Perks',
                                    'Priority Experience Entry',
                                    'Private History Archives',
                                    'Un-optimized Memories'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-white text-lg font-bold">
                                        <ShieldCheck className="h-6 w-6 text-indigo-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            </section>

            {/* 3. THE LOOP */}
            <section className="py-24 bg-[#0A0714]">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-20">The Meaningful Path</h2>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {[
                            {
                                step: "01",
                                title: "You Show Up",
                                desc: "Join a moment in the real world. Your presence is verified and recorded forever.",
                                icon: <Globe className="h-8 w-8 text-white" />,
                                color: "bg-blue-600/20 border-blue-500/20"
                            },
                            {
                                step: "02",
                                title: "Your Depth Increases",
                                desc: "Every moment adds weight to your story. Unlock deeper recognition and more exclusive circles.",
                                icon: <Star className="h-8 w-8 text-white" />,
                                color: "bg-indigo-600/20 border-indigo-500/20"
                            },
                            {
                                step: "03",
                                title: "You Lead the Circle",
                                desc: "High presence depth means you’re a trusted steward of the network, leading others to what matters.",
                                icon: <TrendingUp className="h-8 w-8 text-white" />,
                                color: "bg-emerald-600/20 border-emerald-500/20"
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                                <div className={`w-20 h-20 rounded-3xl ${item.color} border flex items-center justify-center shadow-lg mb-8 transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                    {item.icon}
                                </div>
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 w-full h-full group-hover:bg-white/10 transition-all">
                                    <span className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-4 block">Stage {item.step}</span>
                                    <h3 className="text-2xl font-black text-white mb-4">{item.title}</h3>
                                    <p className="text-pr-text-2 text-lg font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. VALUE CALCULATOR */}
            <section id="calculator" className="py-24 bg-[#0F0C1E] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Discover Your Impact</h2>
                            <p className="text-xl text-pr-text-2 font-medium">Understand the depth of your presence in the Promorang ecosystem.</p>
                        </div>

                        <CredibilityCalculator />
                    </div>
                </div>
            </section>

            {/* 5. WHY IT MATTERS */}
            <section className="py-24 bg-[#0A0714]">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-10 leading-tight">Why Presence <br /><span className="italic text-pr-text-muted">Changes Everything</span></h2>
                            <div className="space-y-8">
                                {[
                                    "Turn your experiences into a verified asset",
                                    "Unlock rewards that actually feel personal",
                                    "Build a history that doesn't disappear in a feed",
                                    "Connect directly with the creators you support",
                                    "Gain priority access to the moments you want",
                                    "Skip the algorithm and be seen for who you are",
                                    "Contribute to a network built on integrity",
                                    "Actually own the value of your participation"
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="mt-1 p-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                            <CheckCircle className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <p className="text-xl text-pr-text-2 font-medium leading-relaxed">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative group">
                            {/* Visual representation of Presence Depth (Pinterest style) */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3.5rem] blur-3xl opacity-5"></div>
                            <div className="relative grid grid-cols-2 gap-4 -rotate-3 hover:rotate-0 transition-transform duration-700">
                                {[
                                    { title: "Active Participant", score: "3,200", img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&fit=crop" },
                                    { title: "Quiet Supporter", score: "900", img: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&fit=crop" },
                                    { title: "Circle Steward", score: "10,000", img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&fit=crop" },
                                    { title: "Moment Legend", score: "25,000", img: "https://images.unsplash.com/photo-1514525253361-bee8718a342b?w=600&fit=crop" }
                                ].map((card, i) => (
                                    <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group/card">
                                        <img src={card.img} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/card:opacity-80 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-6 left-6">
                                            <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">{card.title}</div>
                                            <div className="text-xl font-black text-white">{card.score} Depth</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Groupon-style Indexed Value Voucher overlay */}
                            <div className="absolute -bottom-10 -right-10 w-72 bg-[#130F1E] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-20">
                                <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#0A0714] border-r border-white/10" />
                                <div className="text-center">
                                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Presence Acknowledged</div>
                                    <div className="text-4xl font-black text-white tracking-tighter mb-2">INDEXED</div>
                                    <div className="h-[1px] w-full border-t border-dashed border-white/20 my-4" />
                                    <div className="text-sm font-bold text-pr-text-muted">Verified History Record</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. JOIN CTA */}
            <section className="py-32 bg-[#0F0C1E] border-t border-white/5 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Start your record.</h2>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
                        The first platform that honors presence over attention. <br />Join the circle and begin your history today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Button
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-8 text-xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105"
                            onClick={() => navigate('/auth')}
                        >
                            Create Profile
                            <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 px-12 py-8 text-xl rounded-[2.5rem]"
                            onClick={() => navigate('/referral-program')}
                        >
                            Grow the Circle
                        </Button>
                    </div>
                </div>
            </section>
            <MarketingFooter />
        </div>
    );
}

function ExampleCard({ title, score, unlocks }: { title: string, score: string, unlocks: string }) {
    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-white">{title}</h4>
                <span className="text-indigo-400 font-black tracking-widest uppercase text-sm">{score} Depth</span>
            </div>
            <p className="text-lg text-pr-text-muted">Unlocks: <span className="text-white font-medium">{unlocks}</span></p>
        </div>
    );
}

function CredibilityCalculator() {
    const [followers, setFollowers] = useState(1000);
    const [engagement, setEngagement] = useState(3);
    const [postsPerWeek, setPostsPerWeek] = useState(3);
    const [sharesPerWeek, setSharesPerWeek] = useState(2);
    const [referrals, setReferrals] = useState(0);
    const [streak, setStreak] = useState(0);
    const [isCreator, setIsCreator] = useState(false);
    const [isMerchant, setIsMerchant] = useState(false);

    // Calculation Logic
    const calculatePoints = () => {
        const basePoints = followers * (engagement / 100) * 0.5;
        const activityPoints = postsPerWeek * 30;
        const sharingPoints = sharesPerWeek * 20;
        const referralPoints = referrals * 50;
        const streakPoints = streak * 15;

        let total = basePoints + activityPoints + sharingPoints + referralPoints + streakPoints;

        if (isCreator) total *= 1.3;
        if (isMerchant) total *= 1.2;

        return Math.round(total);
    };

    const monthlyScore = calculatePoints();

    return (
        <div className="grid lg:grid-cols-12 gap-8 bg-[#100C24] rounded-[3.5rem] shadow-2xl border border-white/10 overflow-hidden">
            {/* Inputs */}
            <div className="lg:col-span-7 p-12 space-y-12">
                <div className="space-y-10">
                    <InputSlider
                        label="Moments Near You"
                        value={followers}
                        setValue={setFollowers}
                        min={100}
                        max={50000}
                        step={100}
                        format={(v) => v.toLocaleString()}
                    />
                    <InputSlider
                        label="Presence Consistency (%)"
                        value={engagement}
                        setValue={setEngagement}
                        min={0.5}
                        max={20}
                        step={0.5}
                        format={(v) => `${v}%`}
                    />
                    <InputSlider
                        label="Moments per Week"
                        value={postsPerWeek}
                        setValue={setPostsPerWeek}
                        min={0}
                        max={20}
                    />
                    <InputSlider
                        label="Sharing the Moment"
                        value={sharesPerWeek}
                        setValue={setSharesPerWeek}
                        min={0}
                        max={50}
                    />
                    <InputSlider
                        label="People in Your Circle"
                        value={referrals}
                        setValue={setReferrals}
                        min={0}
                        max={50}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-10 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between gap-4 flex-1">
                        <label className="text-lg font-bold text-white">I Host Moments</label>
                        <Switch checked={isCreator} onCheckedChange={setIsCreator} />
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-1">
                        <label className="text-lg font-bold text-white">I Welcome Others</label>
                        <Switch checked={isMerchant} onCheckedChange={setIsMerchant} />
                    </div>
                </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-5 bg-[#0D0A1C] p-12 flex flex-col justify-center border-l border-white/5">
                <div className="mb-12 text-center">
                    <p className="text-white/40 text-sm uppercase tracking-[0.3em] font-black mb-4">Your Potential Depth</p>
                    <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                        {monthlyScore.toLocaleString()}
                    </div>
                    <p className="text-xl text-indigo-300 font-bold italic">Presence Units / Month</p>
                </div>

                <div className="space-y-8">
                    <ResultRow
                        label="Experiences Unlocked"
                        value={`Up to ${Math.min(20, Math.max(1, Math.floor(monthlyScore / 150)))}/week`}
                        sub={`Verified acknowledgement included`}
                    />
                    <ResultRow
                        label="Circle Standing"
                        value={monthlyScore > 2000 ? "Steward Status" : "Supporter Status"}
                        sub={monthlyScore > 2000 ? "Priority for all drops" : "Standard circle access"}
                    />
                    <div className="pt-10 mt-2 border-t border-white/5 text-center">
                        <p className="text-lg text-pr-text-muted italic font-medium">"Your story is gaining weight."</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputSlider({ label, value, setValue, min, max, step = 1, format }: any) {
    return (
        <div className="space-y-5 group">
            <div className="flex justify-between items-center">
                <label className="text-lg font-bold text-pr-text-muted group-hover:text-white transition-colors">{label}</label>
                <span className="text-2xl font-black text-white">{format ? format(value) : value}</span>
            </div>
            <Slider
                value={[value]}
                onValueChange={(vals) => setValue(vals[0])}
                min={min}
                max={max}
                step={step}
                className="py-2"
            />
        </div>
    );
}

function ResultRow({ label, value, sub }: any) {
    return (
        <div className="flex justify-between items-start border-b border-white/5 pb-8 last:border-0 last:pb-0">
            <div className="text-left">
                <p className="text-white/40 text-sm font-black uppercase tracking-widest mb-1">{label}</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-black text-white mb-1">{value}</p>
                <p className="text-sm text-emerald-400 font-bold uppercase tracking-widest">{sub}</p>
            </div>
        </div>
    );
}
