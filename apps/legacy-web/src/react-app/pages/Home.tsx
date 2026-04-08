import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Diamond, Sparkles, Store, Zap, Users, Globe } from 'lucide-react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { Button } from '../../components/ui/button';

{/* Hero Section - Feeling First focused */ }
const HeroSection = ({ navigate, user }: { navigate: (path: string) => void; user: any }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#0A0714] pt-20">
      {/* Background artwork: Depth & Space */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0714]/60 to-[#0A0714]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,202,0.15)_0%,transparent_50%)]" />
        {/* Animated Orbs for Airbnb-style warmth */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-600/5 blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-[5.5rem] font-black text-white tracking-tighter mb-8 leading-[0.95] drop-shadow-2xl">
            Moments are better when <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-indigo-500 italic">
              they’re shared — and remembered.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-pr-text-2 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Promorang is where moments live on. Join moments, share what they meant to you, and unlock rewards, recognition, and new opportunities along the way.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-24">
            <Button
              onClick={() => navigate(user ? '/today' : '/auth')}
              variant="primary"
              size="lg"
              className="text-lg px-12 py-8 bg-white text-black hover:bg-zinc-200 shadow-2xl shadow-indigo-500/10 rounded-2xl font-black transition-all hover:scale-105 active:scale-95"
            >
              Join a Moment <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/creators')}
              variant="outline"
              size="lg"
              className="text-lg px-12 py-8 text-white border-white/20 hover:bg-white/5 rounded-2xl font-bold backdrop-blur-md transition-all hover:border-white/40"
            >
              Create Your First Moment
            </Button>
          </div>

          {/* Emotional Anchor Support */}
          <div className="max-w-3xl mx-auto pt-16 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 opacity-40">
              {['Concerts.', 'Pop-ups.', 'Launches.', 'Trips.', 'Firsts.'].map((word) => (
                <span key={word} className="text-white text-sm font-black tracking-[0.4em] uppercase">{word}</span>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Some moments pass. <br />
                <span className="text-white/30">Some moments change you.</span>
              </p>
              <p className="text-lg text-pr-text-2 leading-relaxed max-w-xl mx-auto mt-6 font-medium">
                Promorang helps you hold onto the ones that mattered — and lets others discover them too.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section 1 - What happens on Promorang?
const UserActionSection = () => {
  return (
    <section className="py-32 bg-[#0F0C1E] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-24">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">What happens on Promorang?</h2>
          <p className="text-xl text-pr-text-2 leading-relaxed font-medium">
            Promorang isn’t about scrolling endlessly. It’s about entering moments — real ones — and letting them count for something. Here’s how people use it:
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {[
            {
              title: "Join Moments",
              icon: <Zap className="w-6 h-6 text-orange-400" />,
              body: "Show up to events, activations, launches, or experiences near you. Promorang helps you check in, participate, and be counted — fairly and simply.",
              color: "border-orange-500/10 bg-orange-500/5",
              image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&fit=crop"
            },
            {
              title: "Share the Moment",
              icon: <Sparkles className="w-6 h-6 text-rose-400" />,
              body: "Add a photo, a story, or a reflection of your experience. Not for likes or algorithms. For memory, meaning, and a record of your presence.",
              color: "border-rose-500/10 bg-rose-500/5",
              image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&fit=crop"
            },
            {
              title: "Get Recognized",
              icon: <Diamond className="w-6 h-6 text-indigo-400" />,
              body: "Unlock perks, exclusive access, and future invitations from creators and brands. Tangible appreciation for the moments you choose to be part of.",
              color: "border-indigo-500/10 bg-indigo-500/5",
              image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&fit=crop"
            }
          ].map((card, i) => (
            <div key={i} className="group relative flex flex-col space-y-6">
              {/* Airbnb-style experience card */}
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 relative shadow-2xl transition-all duration-500 group-hover:shadow-indigo-500/10">
                <img src={card.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C1E] via-[#0F0C1E]/20 to-transparent" />
                <div className="absolute top-8 left-8 w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                  {card.icon}
                </div>
                <div className="absolute bottom-10 left-10 right-10">
                  <h3 className="text-3xl font-black text-white mb-4 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{card.title}</h3>
                  <p className="text-pr-text-2 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{card.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Section 2 - Not another social feed
const AntiSocialSection = () => {
  return (
    <section className="py-24 bg-[#0A0714] border-y border-white/5">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Not another social feed.</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-xl md:text-2xl text-pr-text-2 leading-relaxed font-medium">
            Promorang isn’t trying to replace Instagram or TikTok.
          </p>
          <p className="text-2xl md:text-3xl text-white font-bold italic">
            Social media shows how moments look. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Promorang shows that they happened.</span>
          </p>
          <p className="text-lg text-pr-text-2 leading-relaxed pt-4">
            Here, moments don’t disappear after 24 hours. They become part of your story.
          </p>
        </div>
      </div>
    </section>
  );
};

// Section 5 - For Brands & Destinations
const BrandsSection = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <section className="py-24 bg-[#0F0C1E] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black text-white mb-6">When moments matter to your business.</h2>
            <div className="space-y-6 text-lg text-pr-text-2 leading-relaxed">
              <p>Brands and destinations use Promorang to welcome people into real experiences, reward participation, not just attention, and understand what truly resonated.</p>
              <p>It’s not about shouting louder. It’s about connecting where people already are.</p>
            </div>
            <div className="mt-10">
              <Button onClick={() => navigate('/advertisers')} variant="primary" size="lg" className="bg-white text-black hover:bg-white/90 rounded-xl px-10">
                Host a Branded Moment
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-3xl font-black text-white mb-2">Real</div>
              <div className="text-sm text-pr-text-muted uppercase tracking-widest font-bold">Experiences</div>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-3xl font-black text-white mb-2">Verified</div>
              <div className="text-sm text-pr-text-muted uppercase tracking-widest font-bold">Participation</div>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-3xl font-black text-white mb-2">Human</div>
              <div className="text-sm text-pr-text-muted uppercase tracking-widest font-bold">Resonance</div>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="text-3xl font-black text-white mb-2">Loyal</div>
              <div className="text-sm text-pr-text-muted uppercase tracking-widest font-bold">Communities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section 6 - Reward Without the Gimmicks
const RewardsSection = () => {
  return (
    <section className="py-24 bg-[#0A0714] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Rewards that feel earned.</h2>
        <p className="text-xl text-pr-text-2 leading-relaxed mb-12">
          Promorang doesn’t turn moments into contests. Rewards come from showing up, participating, and contributing meaningfully.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-lg font-bold">
          {['No chasing likes.', 'No fake urgency.', 'No endless grind.'].map((text) => (
            <div key={text} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60">
              {text}
            </div>
          ))}
        </div>
        <p className="text-2xl text-white font-black mt-16 italic">Just moments that give back.</p>
      </div>
    </section>
  );
};

// Section 7 - The Quiet Magic
const QuietMagicSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0A0714] to-[#0F0C1E] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Moments you can look back on.</h2>
        <div className="space-y-6 text-xl text-pr-text-2 leading-relaxed">
          <p>Every moment you join or create builds a private history of where you’ve been, what you took part in, and what mattered to you.</p>
          <p className="text-white font-bold transition-all hover:text-indigo-400">You don’t have to perform for it. You don’t have to optimize it.</p>
          <p>It’s just there — when you need it.</p>
        </div>
      </div>
    </section>
  );
};

// Season Showcase - Removed per doctrine.

// Section 8 - Final Invitation
const FinalInvitation = ({ navigate, user }: { navigate: (path: string) => void; user: any }) => {
  return (
    <section className="py-32 bg-[#0A0714] text-center border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
          Life is made of moments. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-indigo-500 italic">Some are worth keeping.</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12">
          <Button
            onClick={() => navigate(user ? '/today' : '/auth')}
            variant="primary"
            size="lg"
            className="text-lg px-12 py-7 bg-white text-black hover:bg-white/90 rounded-2xl font-black"
          >
            Join a Moment
          </Button>
          <Button
            onClick={() => navigate('/creators')}
            variant="outline"
            size="lg"
            className="text-lg px-12 py-7 text-white border-white/10 hover:bg-white/5 rounded-2xl font-bold"
          >
            Create One
          </Button>
        </div>
        <p className="mt-20 text-sm font-bold text-white/30 uppercase tracking-[0.5em]">
          Promorang is where moments don’t disappear.
        </p>
      </div>
    </section>
  );
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen-dynamic bg-[#0A0714] font-sans">
      <SEO
        title="Promorang | Where Moments Live On"
        description="Join moments, share what they meant to you, and unlock rewards. Promorang helps you hold onto the ones that mattered."
        canonicalUrl="https://promorang.co/"
      />
      <MarketingNav />

      <HeroSection navigate={navigate} user={user} />
      <UserActionSection />
      <AntiSocialSection />

      {/* Section 3 - Resonance Gallery (Pinterest Masonry Style) */}
      <section className="py-32 bg-[#0A0714] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Resonance Gallery</h2>
            <h3 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">Moments happen everywhere.</h3>
            <p className="text-xl text-pr-text-2 max-w-2xl mx-auto font-medium">From live stages to digital releases, every moment counts.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: 'Live Events', icon: <Sparkles className="text-rose-400" />, size: 'aspect-[4/5]', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&fit=crop' },
              { name: 'Brand Drops', icon: <Zap className="text-amber-400" />, size: 'aspect-square', image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&fit=crop' },
              { name: 'Retail Hubs', icon: <Store className="text-emerald-400" />, size: 'aspect-[4/6]', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&fit=crop' },
              { name: 'Creator Sets', icon: <Diamond className="text-indigo-400" />, size: 'aspect-[4/5]', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&fit=crop' },
              { name: 'Digital Worlds', icon: <Globe className="text-blue-400" />, size: 'aspect-square', image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&fit=crop' },
              { name: 'Pop-up Circles', icon: <Users className="text-purple-400" />, size: 'aspect-[4/6]', image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&fit=crop' },
              { name: 'First Tracks', icon: <Zap className="text-rose-400" />, size: 'aspect-[4/5]', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a342b?w=800&fit=crop' },
              { name: 'Garden Gatherings', icon: <Sparkles className="text-emerald-400" />, size: 'aspect-square', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&fit=crop' }
            ].map((moment, i) => (
              <div key={i} className={`group relative rounded-[2rem] overflow-hidden ${moment.size} bg-zinc-900 border border-white/5 transition-all duration-300 hover:shadow-indigo-500/20 shadow-xl`}>
                <img src={moment.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  {moment.icon}
                </div>

                <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-lg font-black text-white tracking-tighter uppercase leading-none">{moment.name}</h4>
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mt-2">Verified Moment</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 - For Creators (Secondary) */}
      <section className="py-24 bg-[#0F0C1E] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Create moments people want to be part of.</h2>
          <div className="space-y-6 text-xl text-pr-text-2 leading-relaxed mb-12">
            <p>Creators use Promorang to invite people into what they’re building, see who really showed up, and reward participation without chasing algorithms.</p>
            <p className="text-white font-bold italic">Your audience isn’t just watching anymore. They’re present.</p>
          </div>
          <Button onClick={() => navigate('/creators')} variant="outline" size="lg" className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 rounded-xl px-12">
            Create a Moment
          </Button>
        </div>
      </section>

      <BrandsSection navigate={navigate} />
      <RewardsSection />
      <QuietMagicSection />
      <FinalInvitation navigate={navigate} user={user} />

      <MarketingFooter />
    </div>
  );
}
