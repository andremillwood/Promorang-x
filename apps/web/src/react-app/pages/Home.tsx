import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Activity, TrendingUp, Unlock, Eye, Clock, Lock, Zap } from 'lucide-react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { Button } from '../../components/ui/button';

// Example opportunities - showing what the platform enables
const exampleOpportunities = [
  {
    id: '1',
    title: 'Early Access: Product Launch',
    brand: 'Your Brand Here',
    status: 'LOCKED',
    requiredRank: 14,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'Exclusive Product Review',
    brand: 'Tech Company',
    status: 'COUNTDOWN',
    startsIn: '2h 34m',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    title: 'Restaurant Opening Event',
    brand: 'Local Dining',
    status: 'MISSED',
    endedDate: 'Jan 12',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
  }
];

// Hero Section - Access Rank focused
const HeroSection = ({ navigate, user }: { navigate: (path: string) => void; user: any }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-pr-surface-background pt-16">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-pr-text-1 tracking-tight mb-6 leading-[1.1]">
            Show up consistently.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Get access others don't.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-pr-text-2 mb-12 leading-relaxed max-w-2xl mx-auto">
            Promorang tracks active users and gives them priority when opportunities appear.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {!user ? (
              <>
                <Button
                  onClick={() => navigate('/auth')}
                  variant="primary"
                  size="lg"
                  className="text-lg px-10 py-6 shadow-xl shadow-blue-500/20"
                >
                  Start Day 1 <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate('/how-it-works')}
                  variant="ghost"
                  size="lg"
                  className="text-lg px-10 py-6"
                >
                  How It Works
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/today')}
                variant="primary"
                size="lg"
                className="text-lg px-10 py-6 shadow-xl shadow-blue-500/20"
              >
                Go to Today <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>

          {/* Access Rank Steps - Inline */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-pr-text-1 mb-2">Show Up</h3>
              <p className="text-sm text-pr-text-2">Your Access Rank increases every day you participate.</p>
            </div>
            <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-pr-text-1 mb-2">Higher Rank</h3>
              <p className="text-sm text-pr-text-2">See opportunities before others. Get notified first.</p>
            </div>
            <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Unlock className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-pr-text-1 mb-2">Access</h3>
              <p className="text-sm text-pr-text-2">Unlock opportunities that inactive users miss.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Preview Drops Section - Shows examples of what opportunities look like
const PreviewDropsSection = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <section className="py-20 bg-pr-surface-1 border-y border-pr-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-500 text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Examples of What's Possible
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-4">
            This Is How Access Works
          </h2>
          <p className="text-lg text-pr-text-2 max-w-2xl mx-auto">
            When brands create opportunities on Promorang, your Access Rank determines what you see and when.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {exampleOpportunities.map((drop) => (
            <div key={drop.id} className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden relative">
              {/* Example badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pr-text-muted bg-pr-surface-2 px-2 py-1 rounded">
                  Example
                </span>
              </div>

              {/* Image with state overlay */}
              <div className="aspect-video relative">
                <img
                  src={drop.image}
                  alt=""
                  className={`w-full h-full object-cover ${drop.status === 'LOCKED' ? 'blur-sm opacity-60' :
                      drop.status === 'MISSED' ? 'grayscale opacity-50' : 'opacity-80'
                    }`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {drop.status === 'LOCKED' && (
                    <div className="bg-yellow-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold">
                      <Lock className="w-4 h-4" />
                      Day {drop.requiredRank}+ Required
                    </div>
                  )}
                  {drop.status === 'COUNTDOWN' && (
                    <div className="bg-blue-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold">
                      <Clock className="w-4 h-4" />
                      Opens in {drop.startsIn}
                    </div>
                  )}
                  {drop.status === 'MISSED' && (
                    <div className="bg-red-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold">
                      <Eye className="w-4 h-4 line-through" />
                      Ended {drop.endedDate}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="text-xs text-pr-text-muted mb-1">{drop.brand}</div>
                <h3 className="font-bold text-pr-text-1 mb-3">{drop.title}</h3>

                {drop.status === 'LOCKED' && (
                  <p className="text-sm text-pr-text-2">Higher rank users see this first.</p>
                )}
                {drop.status === 'COUNTDOWN' && (
                  <p className="text-sm text-pr-text-2">Active users get notified when this opens.</p>
                )}
                {drop.status === 'MISSED' && (
                  <p className="text-sm text-pr-text-2">Only active users saw this.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dual CTA - Users and Businesses */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6 text-center">
            <h3 className="font-bold text-pr-text-1 mb-2">Want access to opportunities like these?</h3>
            <p className="text-sm text-pr-text-2 mb-4">Start building your Access Rank today.</p>
            <Button onClick={() => navigate('/auth')} variant="primary" size="sm">
              Start Day 1 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
            <h3 className="font-bold text-pr-text-1 mb-2">Want to create opportunities like these?</h3>
            <p className="text-sm text-pr-text-2 mb-4">Reach verified, active users for your brand.</p>
            <Button onClick={() => navigate('/advertisers')} variant="ghost" size="sm">
              For Businesses <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// The Access Principle Section
const AccessPrincipleSection = () => {
  return (
    <section className="py-20 bg-pr-surface-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-4">
            The Access Principle
          </h2>
          <p className="text-lg text-pr-text-2">
            Consistency creates opportunity. It's that simple.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
            <div className="text-red-500 font-bold text-lg mb-4">❌ Low Access Rank</div>
            <ul className="space-y-3 text-pr-text-2">
              <li>• See opportunities after others</li>
              <li>• Often find things already claimed</li>
              <li>• Miss time-sensitive drops</li>
              <li>• Limited platform visibility</li>
            </ul>
          </div>
          <div className="bg-pr-surface-card border border-green-500/30 rounded-2xl p-8">
            <div className="text-green-500 font-bold text-lg mb-4">✓ High Access Rank</div>
            <ul className="space-y-3 text-pr-text-2">
              <li>• First to see new opportunities</li>
              <li>• Priority access before they fill</li>
              <li>• Early notification of drops</li>
              <li>• Full platform visibility</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

// For Business CTA
const ForBusinessSection = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-900/20 via-pr-surface-background to-blue-900/20 border-y border-pr-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-4">
          For Businesses
        </h2>
        <p className="text-lg text-pr-text-2 mb-8 max-w-2xl mx-auto">
          Reach verified, active users who complete what they start.
          Guaranteed actions, not impressions.
        </p>
        <Button onClick={() => navigate('/advertisers')} variant="ghost" size="lg">
          Learn About Action Windows <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </section>
  );
};

// Final CTA
const FinalCTA = ({ navigate, user }: { navigate: (path: string) => void; user: any }) => {
  return (
    <section className="py-24 bg-pr-surface-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-pr-text-1 mb-6">
          Day 1 starts{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            when you do.
          </span>
        </h2>
        <p className="text-xl text-pr-text-2 mb-10 max-w-2xl mx-auto">
          Every day you're not here, you're falling behind.
          The sooner you start, the higher you climb.
        </p>
        <Button
          onClick={() => navigate(user ? '/today' : '/auth')}
          variant="primary"
          size="lg"
          className="text-xl px-16 py-6 shadow-2xl shadow-blue-600/30"
        >
          {user ? 'Go to Today' : 'Start Day 1'}
        </Button>
      </div>
    </section>
  );
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-background font-sans">
      <SEO
        title="Show Up Consistently. Get Access Others Don't. | Promorang"
        description="Promorang tracks active users and gives them priority when opportunities appear. Build your Access Rank through consistent participation."
        keywords="access rank, consistent users, priority access, promorang, opportunities"
        canonicalUrl="https://promorang.co/"
      />
      <MarketingNav />

      <HeroSection navigate={navigate} user={user} />
      <PreviewDropsSection navigate={navigate} />
      <AccessPrincipleSection />
      <ForBusinessSection navigate={navigate} />
      <FinalCTA navigate={navigate} user={user} />

      <MarketingFooter />
    </div>
  );
}
