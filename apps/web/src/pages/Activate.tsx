import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Activity,
  Users,
  Target,
  ChevronRight,
  Star
} from 'lucide-react';
import SEO from '@/components/SEO';

export default function ActivatePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeStats, setActiveStats] = useState({
    earners: 127,
    payout: 0.3,
    earnings: 12
  });

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard/campaigns/create');
    } else {
      navigate('/auth?role=brand');
    }
  };

  // Animate stats on load
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStats(prev => ({
        earners: prev.earners + Math.floor(Math.random() * 5),
        payout: prev.payout + (Math.random() * 0.1),
        earnings: prev.earnings + Math.floor(Math.random() * 3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Promorang Business - 100 Real People in 5 Days"
        description="Get real people to interact with your brand in 5 days guaranteed. Our commercial scaling layer drives high-density attention on demand."
      />

      {/* Modern Navigation */}
      <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
                  alt="Promorang"
                  className="h-8 w-auto transition-transform hover:scale-105"
                />
              </Link>
              <span className="ml-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded uppercase tracking-tighter shadow-sm">Business</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#packages" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Packages</a>
              <a href="#outcomes" className="text-muted-foreground hover:text-foreground font-medium transition-colors">Outcomes</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCtaClick}
                variant="hero"
                size="sm"
              >
                Launch Campaign
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-16 lg:py-24 overflow-hidden">
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-primary/20">
               <Sparkles className="w-4 h-4 mr-2" />
               New Commercial Scaling Layer
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              Get real people to interact with your brand in 
              <span className="block text-gradient-primary">
                5 Days — Guaranteed.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              We drive hundreds of real customer actions and authentic content around your brand. 
              <span className="font-semibold text-foreground"> High-density attention on demand.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button
                onClick={handleCtaClick}
                variant="hero"
                size="xl"
                className="group"
              >
                100 Real People — JMD $25k
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Verified Local Actions</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> UGC Content Rights</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> 5-Day Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Offer Stack Section */}
      <section id="packages" className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Commercial Offer Stack</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Skip the complexity. Buy the outcome.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Hero Offer */}
            <div className="bg-card rounded-3xl p-8 border-2 border-primary shadow-elevated relative transform scale-105 z-10 transition-transform hover:scale-[1.06]">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-1.5 rounded-bl-3xl rounded-tr-lg text-xs font-black uppercase tracking-widest">
                Entry Point
              </div>
              <h3 className="text-2xl font-bold mb-2">The Hero Bundle</h3>
              <div className="text-4xl font-black text-primary mb-4">JMD $25,000</div>
              <p className="text-muted-foreground mb-8 font-semibold">100 Real People Campaign</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>100 Verified human engagements</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>10–20 UGC pieces (optional)</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>Full proof dashboard access</span>
                </li>
              </ul>
              <Button onClick={handleCtaClick} variant="hero" size="lg" className="w-full">
                Start Hero Campaign
              </Button>
            </div>

            {/* Core Offer */}
            <div className="bg-secondary/30 rounded-3xl p-8 border border-border hover:shadow-card transition-all">
              <h3 className="text-2xl font-bold mb-2">Customer Activation</h3>
              <div className="text-4xl font-black mb-4">JMD $120,000</div>
              <p className="text-muted-foreground mb-8 font-semibold">Repeatable Growth Engine</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>500–1,000 Verified actions</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>Multi-day venue activation</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>Advanced audience targeting</span>
                </li>
              </ul>
              <Button onClick={handleCtaClick} variant="warm" size="lg" className="w-full font-bold">
                Enable Activation Engine
              </Button>
            </div>

            {/* High Ticket */}
            <div className="bg-secondary/30 rounded-3xl p-8 border border-border hover:shadow-card transition-all">
              <h3 className="text-2xl font-bold mb-2">Always-On Attention</h3>
              <div className="text-4xl font-black mb-4">JMD $350K+</div>
              <p className="text-muted-foreground mb-8 font-semibold">Strategic Scaling</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>Recurring weekly activations</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>Strategic account manager</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>Priority creator matching</span>
                </li>
              </ul>
              <Button onClick={handleCtaClick} variant="outline" size="lg" className="w-full font-bold">
                Talk to Strategy Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Proof Section */}
      <section id="outcomes" className="py-24 bg-secondary/20 overflow-hidden relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Marketing Outcomes — Verified In-App.</h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                We bridge the gap between digital content and physical business results. Every action taken is verified by our AI-engine via OCR receipts or geofenced activity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-xl"><Users className="w-6 h-6 text-primary" /></div>
                  <span className="font-bold">Foot Traffic</span>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                  <div className="bg-accent/10 p-3 rounded-xl"><Activity className="w-6 h-6 text-accent" /></div>
                  <span className="font-bold">UGC Bundles</span>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                   <div className="bg-green-100/50 p-3 rounded-xl"><Target className="w-6 h-6 text-green-600" /></div>
                   <span className="font-bold">Product Trials</span>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                   <div className="bg-orange-100/50 p-3 rounded-xl"><Sparkles className="w-6 h-6 text-orange-600" /></div>
                   <span className="font-bold">Social Blitz</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
               <div className="bg-card p-10 rounded-3xl shadow-elevated border border-border space-y-8">
                  <div>
                    <div className="text-sm font-black text-primary uppercase mb-2">Live Proof</div>
                    <div className="text-3xl font-bold">12,482 Actions</div>
                    <div className="text-muted-foreground">Verified this month across 85 active brands.</div>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full shadow-glow"></div>
                  </div>
                  <Button onClick={handleCtaClick} variant="hero" size="xl" className="w-full font-black">
                    Secure Your Reach Today
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
           <img 
              src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
              alt="Promorang"
              className="h-10 w-auto mx-auto mb-8 opacity-50 grayscale"
            />
            <p className="text-muted-foreground text-sm">© 2024 Promorang Campaigns Division. Outcome-focused marketing for the modern era.</p>
        </div>
      </footer>
    </div>
  );
}
