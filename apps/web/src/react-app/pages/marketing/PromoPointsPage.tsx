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
  ShieldCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';

export default function PromoPointsPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <MarketingNav />
      
      {/* 1. HERO SECTION */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-zinc-900 to-background text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        
        <div className="container relative mx-auto px-4 text-center z-10">
          <div className={`transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Your Followers Already Have Value.<br />
              Now You Can Finally Use It.
            </h1>
            <p className="text-xl lg:text-2xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Promorang converts your content and your engagement into <span className="text-blue-400 font-semibold">PromoPoints</span> — a utility currency you use to unlock earning opportunities, rewards, benefits, and access across the platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Calculate My Value
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-zinc-700 text-white hover:bg-zinc-800 px-8 py-6 text-lg rounded-full"
                onClick={() => navigate('/auth')}
              >
                Join Promorang Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT ARE PROMOPOINTS */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">What Are PromoPoints?</h2>
            <p className="text-xl text-muted-foreground">
              PromoPoints are Promorang’s attention currency. They represent the <span className="text-foreground font-semibold">monetizable value</span> of your audience interaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-green-500" />
                You Earn Them From:
              </h3>
              <ul className="space-y-3">
                {['Your posts', 'Your shares', 'Your followers', 'Your referrals', 'Daily missions', 'Content interactions', 'Creator activity'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-100 dark:border-blue-900">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Crown className="text-blue-500" />
                PromoPoints Unlock:
              </h3>
              <ul className="space-y-3">
                {['High-value Tasks', 'Gems (Real Money)', 'Merchant Deals', 'Creator Benefits', 'Season Access', 'Lottery Tickets', 'Content Allocations', 'Priority Visibility'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent -translate-y-1/2 z-0"></div>

            {[
              {
                step: "01",
                title: "You Post",
                desc: "Your followers engage. You earn PromoPoints automatically.",
                icon: <Globe className="h-8 w-8 text-white" />,
                color: "bg-blue-500"
              },
              {
                step: "02",
                title: "Points Unlock Value",
                desc: "Access tasks, prizes, deals, and exclusive creator boosts.",
                icon: <Gift className="h-8 w-8 text-white" />,
                color: "bg-purple-500"
              },
              {
                step: "03",
                title: "You Climb the Economy",
                desc: "More points = more access, more opportunities, more earnings.",
                icon: <TrendingUp className="h-8 w-8 text-white" />,
                color: "bg-green-500"
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center shadow-lg mb-6 transform transition-transform hover:scale-110 hover:rotate-3`}>
                  {item.icon}
                </div>
                <div className="bg-background p-6 rounded-xl border shadow-sm w-full h-full">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Step {item.step}</span>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VALUE CALCULATOR */}
      <section id="calculator" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">PromoPoints Value Calculator</h2>
              <p className="text-xl text-muted-foreground">Estimate the utility value of your attention.</p>
            </div>

            <PromoPointsCalculator />
          </div>
        </div>
      </section>

      {/* 5. WHY PROMOPOINTS MATTER */}
      <section className="py-20 bg-zinc-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-8">Why PromoPoints Matter</h2>
              <div className="space-y-6">
                {[
                  "Earn more for doing the same work you already do",
                  "Unlock higher paying tasks and opportunities",
                  "Get higher tiers for better platform rates",
                  "Qualify for exclusive Season prizes",
                  "Gain advantages over standard users",
                  "Unlock Premium access without paying cash",
                  "Climb the Promorang economy faster",
                  "Gain real utility from the audience you built"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 p-1 bg-green-500/20 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="text-lg text-zinc-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-20"></div>
              <Card className="relative bg-zinc-800 border-zinc-700 p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Real User Examples</h3>
                <div className="space-y-6">
                  <ExampleCard 
                    title="Creator (5k Followers)" 
                    points="3,200" 
                    unlocks="20 tasks, 8 prize entries, 3 boosts" 
                  />
                  <ExampleCard 
                    title="Micro-User (500 Followers)" 
                    points="900" 
                    unlocks="6 tasks, 2 opportunities" 
                  />
                  <ExampleCard 
                    title="Merchant Promoter" 
                    points="10,000" 
                    unlocks="Marketplace visibility, 6 sales" 
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 7. JOIN CTA */}
      <section className="py-24 bg-background text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Join Promorang and Activate Your Value</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The first "attention-to-utility" model. Unlock the hidden value of your followers today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg rounded-full shadow-xl shadow-blue-500/20"
              onClick={() => navigate('/auth')}
            >
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-10 py-6 text-lg rounded-full"
              onClick={() => navigate('/create')}
            >
              Create Your First PromoTask
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Already signed up? Comment "promopoints" on any Promorang post to activate your bonus.
          </p>
        </div>
      </section>
    </div>
  );
}

function ExampleCard({ title, points, unlocks }: { title: string, points: string, unlocks: string }) {
  return (
    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-white">{title}</h4>
        <span className="text-yellow-400 font-mono font-bold">{points} pts/mo</span>
      </div>
      <p className="text-sm text-zinc-400">Unlocks: <span className="text-zinc-200">{unlocks}</span></p>
    </div>
  );
}

function PromoPointsCalculator() {
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

  const monthlyPoints = calculatePoints();
  const weeklyPoints = Math.round(monthlyPoints / 4);

  return (
    <div className="grid lg:grid-cols-12 gap-8 bg-card rounded-2xl shadow-xl border overflow-hidden">
      {/* Inputs */}
      <div className="lg:col-span-7 p-8 space-y-8">
        <div className="space-y-6">
          <InputSlider 
            label="Followers" 
            value={followers} 
            setValue={setFollowers} 
            min={100} 
            max={50000} 
            step={100}
            format={(v) => v.toLocaleString()}
          />
          <InputSlider 
            label="Avg. Engagement Rate (%)" 
            value={engagement} 
            setValue={setEngagement} 
            min={0.5} 
            max={20} 
            step={0.5}
            format={(v) => `${v}%`}
          />
          <InputSlider 
            label="Posts per Week" 
            value={postsPerWeek} 
            setValue={setPostsPerWeek} 
            min={0} 
            max={20} 
          />
          <InputSlider 
            label="Shares per Week" 
            value={sharesPerWeek} 
            setValue={setSharesPerWeek} 
            min={0} 
            max={50} 
          />
          <InputSlider 
            label="Active Referrals" 
            value={referrals} 
            setValue={setReferrals} 
            min={0} 
            max={50} 
          />
          <InputSlider 
            label="Daily Streak (Days)" 
            value={streak} 
            setValue={setStreak} 
            min={0} 
            max={30} 
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-8 pt-4 border-t">
          <div className="flex items-center justify-between gap-4 flex-1">
            <label className="font-medium">I am a Creator</label>
            <Switch checked={isCreator} onCheckedChange={setIsCreator} />
          </div>
          <div className="flex items-center justify-between gap-4 flex-1">
            <label className="font-medium">I am a Merchant</label>
            <Switch checked={isMerchant} onCheckedChange={setIsMerchant} />
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="lg:col-span-5 bg-zinc-900 text-white p-8 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-zinc-400 text-sm uppercase tracking-wider font-bold mb-2">Estimated Economic Power</p>
          <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            {monthlyPoints.toLocaleString()}
          </div>
          <p className="text-zinc-300">PromoPoints / Month</p>
        </div>

        <div className="space-y-6">
          <ResultRow 
            label="Tasks Unlocked" 
            value={`Up to ${Math.min(20, Math.max(1, Math.floor(monthlyPoints / 150)))} tasks/week`} 
            sub={`Worth up to ${(monthlyPoints / 10).toFixed(0)} Gems`}
          />
          <ResultRow 
            label="Season Tickets" 
            value={`${Math.floor(monthlyPoints / 500)} Entries`} 
            sub="Increased win chance"
          />
          <ResultRow 
            label="Marketplace Access" 
            value={monthlyPoints > 2000 ? "Premium Unlocked" : "Standard Access"} 
            sub={monthlyPoints > 2000 ? "Exclusive offers & boosts" : "Basic deals available"}
          />
          <div className="pt-6 mt-2 border-t border-zinc-700 text-center">
            <p className="text-sm text-zinc-400 italic">"This is your attention value — activated."</p>
          </div>
        </div>
      </div>
      <MarketingFooter />
      </div>
  );
}

function InputSlider({ label, value, setValue, min, max, step = 1, format }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span className="font-bold">{format ? format(value) : value}</span>
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
    <div className="flex justify-between items-start border-b border-zinc-800 pb-4 last:border-0">
      <div className="text-left">
        <p className="text-zinc-400 text-sm font-medium">{label}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-white">{value}</p>
        <p className="text-xs text-green-400">{sub}</p>
      </div>
    </div>
  );
}
