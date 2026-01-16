import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Star,
  ArrowRight,
  ChevronDown,
  Play,
  Gift,
  Target as TargetIcon,
  Sparkles,
  BarChart3,
  UserPlus,
  Wallet,
  GraduationCap,
  Heart,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';

const LucideIcon = ({ icon: Icon, className }: { icon: any; className?: string }) => {
  return <Icon className={className} />;
};

const tiers = [
  {
    name: 'Starter',
    price: 50,
    description: 'Perfect for getting started',
    features: [
      'Access to all platform features',
      'Basic training modules',
      'Community support',
      'Earn team bonuses',
      'Personal dashboard',
    ],
    popular: false,
    color: 'orange',
  },
  {
    name: 'Growth',
    price: 100,
    description: 'Most popular choice',
    features: [
      'Everything in Starter',
      'Advanced training library',
      'Priority support',
      'Higher earning potential',
      'Exclusive events access',
      'Performance analytics',
    ],
    popular: true,
    color: 'purple',
  },
  {
    name: 'Pro',
    price: 200,
    description: 'For serious builders',
    features: [
      'Everything in Growth',
      'VIP training sessions',
      '1-on-1 coaching calls',
      'Maximum earning tiers',
      'Leadership recognition',
      'Early feature access',
    ],
    popular: false,
    color: 'orange',
  },
  {
    name: 'Elite',
    price: 500,
    description: 'Ultimate success package',
    features: [
      'Everything in Pro',
      'Personal success coach',
      'Exclusive retreats',
      'Top-tier bonuses',
      'Board recognition',
      'Legacy building tools',
    ],
    popular: false,
    color: 'purple',
  },
];

const ranks = [
  { name: 'Partner', icon: '🌟', color: '#f97316', requirement: 'Join the program' },
  { name: 'Rising Star', icon: '⭐', color: '#8b5cf6', requirement: '3 active team members' },
  { name: 'Team Leader', icon: '🌙', color: '#f97316', requirement: '5 active, 15 total team' },
  { name: 'Director', icon: '🔮', color: '#a855f7', requirement: '8 active, 30 total team' },
  { name: 'Executive', icon: '👑', color: '#f97316', requirement: '12 active, 50 total team' },
  { name: 'Diamond', icon: '💎', color: '#d946ef', requirement: '20 active, 100 total team' },
  { name: 'Blue Diamond', icon: '💠', color: '#f97316', requirement: '35 active, 250 total team' },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Team Leader',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    quote: "I started as a skeptic, but within 3 months I was earning more than my day job. The community support is incredible.",
    earnings: '$4,200/mo',
  },
  {
    name: 'Marcus J.',
    role: 'Director',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    quote: "The training and mentorship helped me build a team of 50+ people. This changed my family's financial future.",
    earnings: '$12,500/mo',
  },
  {
    name: 'Emily R.',
    role: 'Executive',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    quote: "What I love most is helping others succeed. When my team wins, I win. It's a true partnership.",
    earnings: '$28,000/mo',
  },
];

const faqs = [
  {
    question: 'How does the Growth Partner Program work?',
    answer: 'As a Growth Partner, you earn bonuses when you help others discover Promorang. When someone joins through your referral and subscribes, you earn a welcome bonus. As they continue their subscription, you earn ongoing team bonuses. The more you help your team succeed, the more you earn.',
  },
  {
    question: 'How much can I realistically earn?',
    answer: 'Earnings vary based on your effort and team size. Partners typically earn $500-$2,000/month in their first few months. Top performers with larger teams earn $10,000-$50,000+ monthly. Your success depends on your commitment to building and supporting your team.',
  },
  {
    question: 'Do I need experience to get started?',
    answer: 'No experience needed! We provide comprehensive training, mentorship, and a supportive community. Many of our top earners started with zero experience in team building or online business.',
  },
  {
    question: 'What makes this different from other programs?',
    answer: 'Promorang is a real platform with real value - not just a compensation plan. Our partners promote a product people actually use and love. Plus, our qualification system rewards those who actively support their team, not just recruit.',
  },
  {
    question: 'How do I get paid?',
    answer: 'Earnings are calculated weekly and paid out after a 7-day verification period. You can withdraw to your bank account, PayPal, or convert to platform credits. Minimum payout is $50.',
  },
  {
    question: 'Is there a cap on earnings?',
    answer: 'Weekly earning caps increase as you advance through ranks. Starting partners can earn up to $5,000/week, while Blue Diamond partners can earn up to $100,000/week. These caps ensure sustainable growth for everyone.',
  },
];

export default function MatrixPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Calculator state
  const [partners, setPartners] = useState(5);
  const [avgTier, setAvgTier] = useState(100);
  const [retention, setRetention] = useState(80);

  const earnings = useMemo(() => {
    const directCommission = partners * (avgTier * 0.20);
    const residualCommission = partners * (avgTier * 0.10) * (retention / 100);
    const monthlyTotal = directCommission + residualCommission;
    return {
      direct: directCommission,
      residual: residualCommission,
      total: monthlyTotal,
      yearly: monthlyTotal * 12
    };
  }, [partners, avgTier, retention]);

  return (
    <div className="min-h-screen bg-pr-surface-background selection:bg-orange-500/30">
      <MarketingNav />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-orange-500/10 to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-8 shadow-lg shadow-orange-500/30">
              <LucideIcon icon={Sparkles} className="w-4 h-4" />
              Growth Partner Program
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-pr-text-1 mb-8 tracking-tighter">
              Build Your Future.
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-orange-600 bg-clip-text text-transparent">
                Lead The Community.
              </span>
            </h1>
            
            <p className="text-2xl text-pr-text-2 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join the elite circle of Growth Partners earning meaningful income by expanding 
              the Promorang ecosystem. <span className="text-orange-500 font-bold">Real value. Real people. Real results.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-10 py-8 rounded-2xl font-bold border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all" asChild>
                <Link to="/auth/register?ref=matrix" className="flex items-center gap-2 text-white">
                  Launch Your Business <LucideIcon icon={ArrowRight} className="w-6 h-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-xl px-10 py-8 border-2 border-purple-200 hover:bg-purple-50 rounded-2xl font-bold text-purple-700" asChild>
                <Link to="/about" className="flex items-center">
                  <LucideIcon icon={Play} className="w-6 h-6 mr-2 fill-purple-700" /> Watch The Vision
                </Link>
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-pr-text-2">
              {[
                { label: 'No inventory required', icon: CheckCircle },
                { label: 'Work from anywhere', icon: CheckCircle },
                { label: 'Weekly payouts', icon: CheckCircle },
                { label: 'Full training provided', icon: CheckCircle },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 font-medium">
                  <LucideIcon icon={item.icon} className="w-5 h-5 text-orange-500" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-pr-surface-1 border-y border-pr-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Partners', value: '15,000+', color: 'text-orange-500' },
              { label: 'Paid Out Monthly', value: '$4.2M+', color: 'text-purple-500' },
              { label: 'Partner Retention', value: '89%', color: 'text-orange-500' },
              { label: 'Partner Satisfaction', value: '4.9★', color: 'text-purple-500' },
            ].map((stat, i) => (
              <div key={i}>
                <p className={cn("text-4xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-pr-text-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-pr-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pr-text-1 mb-4 tracking-tight">
              Simple Steps to Success
            </h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
              Our proven system makes it easy to start earning. No experience needed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: UserPlus, title: 'Join', description: 'Choose your membership tier and get instant access to all tools and training.', color: 'purple' },
              { icon: GraduationCap, title: 'Learn', description: 'Complete our training modules and get mentored by successful partners.', color: 'orange' },
              { icon: Users, title: 'Share', description: 'Invite others to join Promorang using your personal referral link.', color: 'purple' },
              { icon: Wallet, title: 'Earn', description: 'Receive weekly bonuses as your team grows and succeeds.', color: 'orange' },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className={cn(
                  "rounded-2xl p-8 h-full border transition-all hover:shadow-xl",
                  step.color === 'purple' 
                    ? "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40" 
                    : "bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-6",
                    step.color === 'purple' ? "bg-purple-600 shadow-lg shadow-purple-500/20" : "bg-orange-500 shadow-lg shadow-orange-500/20"
                  )}>
                    <LucideIcon icon={step.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div className={cn(
                    "absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                    step.color === 'purple' ? "bg-purple-600" : "bg-orange-500"
                  )}>
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-pr-text-1 mb-2">{step.title}</h3>
                  <p className="text-pr-text-2 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Roadmap Visual Chart */}
      <section className="py-24 bg-pr-surface-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-pr-text-1 mb-4 tracking-tight">The Growth Roadmap</h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto font-medium">
              A clear visualization of your journey from Partner to Blue Diamond.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/5 rounded-[3rem] -z-10" />
            
            <div className="p-8 md:p-12 overflow-x-auto">
              <div className="min-w-[1000px] flex items-end gap-4 h-[400px]">
                {[
                  { rank: 'Partner', members: 1, income: 200, height: '20%', color: 'bg-orange-200' },
                  { rank: 'Rising Star', members: 5, income: 800, height: '35%', color: 'bg-orange-300' },
                  { rank: 'Team Leader', members: 15, income: 2500, height: '50%', color: 'bg-orange-400' },
                  { rank: 'Director', members: 30, income: 6500, height: '65%', color: 'bg-orange-500' },
                  { rank: 'Executive', members: 50, income: 12000, height: '75%', color: 'bg-purple-500' },
                  { rank: 'Diamond', members: 100, income: 25000, height: '85%', color: 'bg-purple-600' },
                  { rank: 'Blue Diamond', members: 250, income: 60000, height: '100%', color: 'bg-purple-700' },
                ].map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                      ${item.income.toLocaleString()}/mo
                    </div>
                    <div 
                      className={cn("w-full rounded-t-2xl transition-all duration-500 hover:scale-105 cursor-pointer relative", item.color)} 
                      style={{ height: item.height }}
                    />
                    <div className="mt-6 text-center">
                      <p className="font-black text-pr-text-1 uppercase text-xs tracking-widest">{item.rank}</p>
                      <p className="text-orange-500 font-black mt-1">${(item.income * 12 / 1000).toFixed(0)}k/year</p>
                      <p className="text-pr-text-2 text-[10px] font-bold mt-1 uppercase">{item.members} Partners</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-8 bg-pr-surface-card rounded-3xl text-pr-text-1 flex flex-col md:flex-row items-center justify-between gap-8 border border-orange-500/30 shadow-2xl shadow-orange-500/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/40">
                <LucideIcon icon={TargetIcon} className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Your Goal: Team Leader</h3>
                <p className="text-pr-text-2 font-medium">Achieve this in 90 days to unlock the Fast Track Bonus.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-pr-text-2 font-medium">Potential Earnings</p>
                <p className="text-2xl font-black text-orange-500">$30,000 / year</p>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-orange-500/20" asChild>
                <Link to="/auth/register">View Detailed Plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-purple-500/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Calculate Your Potential</h2>
              <p className="text-xl text-gray-300 mb-8">
                See how your income grows as you build your team. Our transparent bonus structure 
                rewards both growth and long-term partnership.
              </p>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-300 font-medium">Monthly Active Partners</span>
                    <span className="text-orange-400 font-bold">{partners}</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" value={partners} 
                    onChange={(e) => setPartners(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-300 font-medium">Average Subscription Tier</span>
                    <span className="text-purple-400 font-bold">${avgTier}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 200, 500].map(tier => (
                      <button 
                        key={tier}
                        onClick={() => setAvgTier(tier)}
                        className={cn(
                          "py-2 rounded-lg text-sm font-bold transition-all",
                          avgTier === tier ? "bg-purple-600 text-white shadow-lg shadow-purple-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        )}
                      >
                        ${tier}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-300 font-medium">Team Retention Rate</span>
                    <span className="text-orange-400 font-bold">{retention}%</span>
                  </div>
                  <input 
                    type="range" min="10" max="100" step="5" value={retention} 
                    onChange={(e) => setRetention(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <LucideIcon icon={DollarSign} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Direct Monthly Bonuses</p>
                    <p className="text-2xl font-bold text-white">${earnings.direct.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <LucideIcon icon={TrendingUp} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Residual Monthly Bonuses</p>
                    <p className="text-2xl font-bold text-white">${earnings.residual.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="h-px bg-white/10 my-6" />
                
                <div className="text-center">
                  <p className="text-orange-400 font-bold text-sm uppercase tracking-wider mb-2">Total Monthly Potential</p>
                  <p className="text-6xl font-bold mb-4 text-white">${Math.round(earnings.total).toLocaleString()}</p>
                  <div className="inline-block bg-orange-500/20 text-orange-400 px-4 py-1 rounded-full text-sm font-bold">
                    ${Math.round(earnings.yearly).toLocaleString()} / year
                  </div>
                </div>
                
                <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 py-6 text-lg font-bold rounded-2xl mt-6" asChild>
                  <Link to="/auth/register?ref=matrix" className="flex items-center justify-center">Get Started Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rank Progression */}
      <section className="py-24 bg-pr-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pr-text-1 mb-4 tracking-tight">
              Your Path to Success
            </h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto font-medium">
              Advance through ranks as you build your team. Each level unlocks new benefits and higher earning potential.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-orange-500/20 -translate-y-1/2 hidden lg:block" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {ranks.map((rank, index) => (
                <div key={index} className="relative flex flex-col items-center group">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-lg transition-transform group-hover:scale-110 duration-300 ring-4 ring-pr-surface-2"
                    style={{ backgroundColor: rank.color + '20', border: `3px solid ${rank.color}` }}
                  >
                    {rank.icon}
                  </div>
                  <h3 className="font-bold text-pr-text-1 text-sm text-center">{rank.name}</h3>
                  <p className="text-[10px] text-pr-text-2 text-center mt-1 font-bold uppercase tracking-tighter">{rank.requirement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 bg-pr-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pr-text-1 mb-4 tracking-tight">
              Choose Your Starting Point
            </h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto">
              Select the tier that fits your goals. You can always upgrade as you grow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => (
              <div 
                key={index}
                className={cn(
                  "relative rounded-3xl p-8 border-2 transition-all cursor-pointer bg-pr-surface-card",
                  tier.popular 
                    ? "border-purple-500 shadow-2xl scale-105" 
                    : tier.color === 'orange' ? "border-orange-500/10 hover:border-orange-500/30 hover:shadow-xl" : "border-purple-500/10 hover:border-purple-500/30 hover:shadow-xl"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-2xl font-black text-pr-text-1 mb-1">{tier.name}</h3>
                <p className="text-pr-text-2 text-sm mb-6 font-medium">{tier.description}</p>
                
                <div className="mb-8">
                  <span className="text-5xl font-black text-pr-text-1">${tier.price}</span>
                  <span className="text-pr-text-2 text-sm ml-1">/month</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3 text-sm">
                      <LucideIcon icon={CheckCircle} className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        tier.color === 'orange' ? "text-orange-500" : "text-purple-500"
                      )} />
                      <span className="text-pr-text-2 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={cn(
                    "w-full py-6 text-lg font-black rounded-xl transition-all shadow-lg shadow-black/10 hover:shadow-black/20",
                    tier.popular 
                      ? "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white" 
                      : "bg-pr-surface-background text-pr-text-1 border border-pr-border hover:bg-pr-surface-2"
                  )}
                  asChild
                >
                  <Link to="/auth/register?ref=matrix" className="flex items-center justify-center gap-2">
                    Get Started <LucideIcon icon={ArrowRight} className="w-6 h-6" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Breakdown Table */}
      <section className="py-24 bg-pr-surface-background border-t border-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-pr-text-1 mb-4 tracking-tight">Earnings Breakdown</h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto italic font-medium">
              Clear, predictable income based on your team's subscription volume.
            </p>
          </div>
          
          <div className="bg-pr-surface-card rounded-3xl shadow-2xl border border-orange-500/10 overflow-hidden group">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <th className="px-8 py-6 font-bold uppercase tracking-wider text-sm">Bonus Type</th>
                    <th className="px-8 py-6 font-bold uppercase tracking-wider text-sm">Calculation</th>
                    <th className="px-8 py-6 font-bold uppercase tracking-wider text-sm text-orange-400">Example ($100 Tier)</th>
                    <th className="px-8 py-6 font-bold uppercase tracking-wider text-sm">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pr-border">
                  <tr className="hover:bg-orange-500/5 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-pr-text-1">Welcome Bonus</p>
                      <p className="text-xs text-orange-500 font-bold uppercase tracking-tighter">Direct enrollment</p>
                    </td>
                    <td className="px-8 py-6 text-pr-text-2 font-medium">20% of 1st Month</td>
                    <td className="px-8 py-6 font-black text-orange-500 text-lg">$20.00</td>
                    <td className="px-8 py-6"><span className="px-4 py-1.5 bg-orange-500/10 text-orange-500 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border border-orange-500/20">All Ranks</span></td>
                  </tr>
                  <tr className="bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-pr-text-1">Growth Bonus</p>
                      <p className="text-xs text-purple-500 font-bold uppercase tracking-tighter">Ongoing renewals</p>
                    </td>
                    <td className="px-8 py-6 text-pr-text-2 font-medium">10% of Monthly Subscription</td>
                    <td className="px-8 py-6 font-black text-purple-500 text-lg">$10.00 / mo</td>
                    <td className="px-8 py-6"><span className="px-4 py-1.5 bg-orange-500/10 text-orange-500 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border border-orange-500/20">All Ranks</span></td>
                  </tr>
                  <tr className="hover:bg-orange-500/5 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-pr-text-1">Team Support Bonus</p>
                      <p className="text-xs text-orange-500 font-bold uppercase tracking-tighter">Level 2 partners</p>
                    </td>
                    <td className="px-8 py-6 text-pr-text-2 font-medium">5% of Monthly Subscription</td>
                    <td className="px-8 py-6 font-black text-orange-500 text-lg">$5.00 / mo</td>
                    <td className="px-8 py-6"><span className="px-4 py-1.5 bg-purple-500/10 text-purple-500 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border border-purple-500/20">Rising Star+</span></td>
                  </tr>
                  <tr className="bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-pr-text-1">Leadership Match</p>
                      <p className="text-xs text-purple-500 font-bold uppercase tracking-tighter">On team earnings</p>
                    </td>
                    <td className="px-8 py-6 text-pr-text-2 font-medium">5-10% Match</td>
                    <td className="px-8 py-6 font-black text-purple-500 text-lg">Variable</td>
                    <td className="px-8 py-6"><span className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-xs font-black uppercase tracking-tighter shadow-md shadow-orange-500/20">Director+</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-pr-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pr-text-1 mb-4 tracking-tight">
              Real Partners. Real Results.
            </h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto font-medium">
              Hear from partners who transformed their lives with Promorang.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-pr-surface-card rounded-3xl p-8 shadow-xl border border-pr-border transition-all hover:-translate-y-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-500/20"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-1.5 rounded-lg shadow-lg">
                      <LucideIcon icon={Star} className="w-3 h-3 fill-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-pr-text-1">{testimonial.name}</h4>
                    <p className="text-purple-500 text-sm font-black uppercase tracking-tight">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-pr-text-2 mb-6 italic leading-relaxed font-medium">"{testimonial.quote}"</p>
                <div className="flex items-center gap-2 text-green-500 font-black bg-green-500/10 px-4 py-2 rounded-xl inline-flex border border-green-500/20">
                  <LucideIcon icon={TrendingUp} className="w-5 h-5" />
                  {testimonial.earnings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-24 bg-pr-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pr-text-1 mb-4 tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto font-medium">
              We provide all the tools, training, and support you need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { icon: GraduationCap, title: 'Comprehensive Training', description: 'Step-by-step video courses, live workshops, and certification programs.', color: 'purple' },
              { icon: Users, title: 'Mentorship Program', description: 'Get paired with successful partners who guide you every step of the way.', color: 'orange' },
              { icon: BarChart3, title: 'Real-Time Analytics', description: 'Track your team growth, earnings, and performance in your dashboard.', color: 'purple' },
              { icon: Gift, title: 'Marketing Materials', description: 'Professional graphics, videos, and copy ready to share.', color: 'orange' },
              { icon: Shield, title: 'Compliance Support', description: 'We handle the legal stuff so you can focus on building.', color: 'purple' },
              { icon: Heart, title: 'Community', description: 'Join a supportive community of partners cheering each other on.', color: 'orange' },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 group">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:rotate-6 shadow-lg shadow-black/5",
                  item.color === 'purple' ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                )}>
                  <LucideIcon icon={item.icon} className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-pr-text-1 text-lg mb-2">{item.title}</h3>
                  <p className="text-pr-text-2 text-sm leading-relaxed font-medium">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-pr-surface-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pr-text-1 mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-pr-surface-card rounded-2xl border border-pr-border overflow-hidden transition-all hover:border-orange-500/30"
              >
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between group"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-pr-text-1 group-hover:text-orange-500 transition-colors">{faq.question}</span>
                  <LucideIcon icon={ChevronDown} className={cn(
                    "w-5 h-5 text-pr-text-2 transition-transform duration-300",
                    openFaq === index && "rotate-180 text-orange-500"
                  )} />
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6 text-pr-text-2 leading-relaxed text-sm font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-purple-600 via-purple-700 to-orange-500 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Join thousands of partners who are building their dream life with Promorang. 
              Your future self will thank you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-8 rounded-2xl font-black shadow-xl border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 transition-all" asChild>
                <Link to="/auth/register?ref=matrix" className="flex items-center gap-2">
                  Become a Partner <LucideIcon icon={ArrowRight} className="w-6 h-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 text-xl px-12 py-8 rounded-2xl font-black backdrop-blur-sm shadow-xl" asChild>
                <Link to="/contact">Schedule a Call</Link>
              </Button>
            </div>
            
            <p className="mt-10 text-purple-100/70 text-sm font-bold uppercase tracking-widest">
              No long-term commitment. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />

      {/* Income Disclaimer */}
      <section className="py-12 bg-gray-950 text-gray-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] leading-relaxed opacity-60 font-medium">
          <p className="uppercase tracking-tighter mb-2 font-black">Income Disclaimer</p>
          <p>
            The income figures shown are examples of what some partners have achieved. 
            Individual results vary based on effort, skills, and market conditions. Promorang does not guarantee any specific 
            income level. Success requires consistent effort and following our proven training system.
          </p>
        </div>
      </section>
    </div>
  );
}
