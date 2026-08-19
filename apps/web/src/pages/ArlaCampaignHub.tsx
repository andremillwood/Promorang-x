import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  Check,
  Sparkles,
  MapPin,
  Clock,
  Vote,
  BookOpen,
  Share2,
  Copy,
  ChefHat,
  Flame,
  Snowflake,
  Coffee,
  Ticket,
  Percent,
  CheckCircle2,
  ExternalLink,
  Store,
  Compass,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Smile
} from 'lucide-react';
import { toast } from 'sonner';
import { ArlaRecipePackModal } from '@/components/arla/ArlaRecipePackModal';
import { getSiteUrl } from '@/lib/discovery';

type CulinaryMode = 'cook' | 'whip' | 'drink';

export default function ArlaCampaignHub() {
  const [activeMode, setActiveMode] = useState<CulinaryMode>('cook');
  const [tasteOffVote, setTasteOffVote] = useState<'pasta' | 'mousse' | null>(null);
  const [pastaVotes, setPastaVotes] = useState(164);
  const [mousseVotes, setMousseVotes] = useState(149);
  const [priceVote, setPriceVote] = useState<string | null>(null);
  const [showPriceReveal, setShowPriceReveal] = useState(false);
  const [intentVote, setIntentVote] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  const completedActions = [
    { id: 'tasteoff', label: 'Voted in Taste-Off', done: !!tasteOffVote },
    { id: 'mode', label: 'Tested Cooking vs Whipping', done: activeMode !== 'cook' || !!tasteOffVote },
    { id: 'price', label: 'Checked Price Savings', done: !!priceVote || showPriceReveal },
    { id: 'intent', label: 'Picked Favourite Dish', done: !!intentVote }
  ];

  const completedCount = completedActions.filter((a) => a.done).length;
  const isKeyUnlocked = completedCount >= 2;

  const totalVotes = pastaVotes + mousseVotes;
  const pastaPct = Math.round((pastaVotes / totalVotes) * 100);
  const moussePct = 100 - pastaPct;

  const handleTasteOffVote = (choice: 'pasta' | 'mousse') => {
    if (tasteOffVote) return;
    setTasteOffVote(choice);
    if (choice === 'pasta') {
      setPastaVotes((v) => v + 1);
      toast.success('Vote recorded for Spicy Rasta Pasta! 🍝 (+50 Points)');
    } else {
      setMousseVotes((v) => v + 1);
      toast.success('Vote recorded for Chocolate Chip Mousse! 🍫 (+50 Points)');
    }
  };

  const handlePriceSelect = (range: string) => {
    setPriceVote(range);
    setShowPriceReveal(true);
    toast.success('Price savings revealed! (+30 Points)');
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/campaigns/arla-whip-and-cook?utm_source=promorang&utm_medium=tasteoff_share&utm_campaign=arla_pricesmart`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied! Share it with someone who loves good food.');
  };

  const shareWhatsApp = () => {
    const text = `Have you tried the Rasta Pasta or Chocolate Mousse sample at PriceSmart? Vote for your favourite and get 5 easy dinner & dessert recipes here: ${window.location.origin}/campaigns/arla-whip-and-cook`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#11100e] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans pb-32">
      <SEO
        title="Stop Buying Two Different Creams — Arla Pro Whip & Cook @ PriceSmart Jamaica"
        description="One cream for hot dinner sauces, cold desserts, and rich Jamaican punches. Stop wasting money on creams that curdle. Taste it free at PriceSmart (10am–8pm) and get 1L for J$1,200."
        image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
        url={getSiteUrl("/campaigns/arla-whip-and-cook")}
      />

      {/* 1. TOP TICKER / LIVE ROADSHOW BANNER */}
      <div className="bg-[#ff5a1f] text-black font-mono font-black text-xs uppercase tracking-wider py-2.5 px-4 border-b-2 border-black flex items-center justify-between overflow-x-auto gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="h-2.5 w-2.5 bg-black rounded-full animate-ping" />
          <span>FREE TASTING BOOTH OPEN TODAY AT PRICESMART (111 RED HILLS ROAD) · 10:00 AM – 8:00 PM</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-bold">
          <span>ON SALE FOR ~J$1,200 (SAVE OVER J$1,500)</span>
          <Link to="/proposals/arla-pro" className="bg-black text-white px-2.5 py-0.5 hover:bg-[#11100e] transition text-[10px]">
            FOR BUSINESS / BRAND →
          </Link>
        </div>
      </div>

      {/* 2. HERO SECTION — PROBLEM & OUTCOME HEADLINE */}
      <section className="relative border-b-2 border-black/40 bg-gradient-to-b from-[#181512] to-[#11100e] px-4 sm:px-8 pt-12 pb-16">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.25fr_0.75fr] items-center">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
              <span>TIRED OF WASTED CREAM?</span>
              <span className="text-white/40">/</span>
              <span>MEET ARLA PRO</span>
              <span className="text-white/40">/</span>
              <span className="text-[#ffcf38]">AT PRICESMART</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-white">
              Stop Buying Two <i className="text-[#ff5a1f] not-italic">Different</i> Creams.
            </h1>

            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcf38] leading-tight">
              One carton cooks creamy hot dinners and whips fluffy desserts without spoiling or splitting.
            </p>

            <p className="text-sm sm:text-base text-[#d0c5b9] leading-relaxed max-w-xl">
              Ever had heavy cream split into oily water when you cook with Scotch bonnet or lemon? Or bought whipping cream that melted flat in Jamaican heat? <strong>Arla Pro Whip & Cook 28%</strong> solves both problems in a single 1-litre carton.
            </p>

            {/* Layman Problem-Solution Toggle */}
            <div className="pt-2 space-y-3">
              <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#898071] block">
                [ CLICK TO SEE HOW YOU CAN USE IT AT HOME ]
              </span>
              <div className="grid grid-cols-3 gap-2.5 max-w-lg">
                {[
                  { id: 'cook', label: '01 / FOR DINNER', sub: 'Pasta & Curries (No Curdling)', icon: Flame },
                  { id: 'whip', label: '02 / FOR DESSERT', sub: 'Mousse & Cakes (Holds Shape)', icon: Snowflake },
                  { id: 'drink', label: '03 / FOR DRINKS', sub: 'Stout & Peanut Punch', icon: Coffee }
                ].map((mode) => {
                  const isSel = activeMode === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id as CulinaryMode)}
                      className={`p-3 text-left border-2 transition-all cursor-pointer ${
                        isSel
                          ? 'border-[#ff5a1f] bg-[#ff5a1f] text-black shadow-[4px_4px_0_#ffcf38]'
                          : 'border-white/20 bg-white/5 text-[#d0c5b9] hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-black text-xs">{mode.label}</span>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p className={`text-[10px] font-bold ${isSel ? 'text-black/80' : 'text-white/40'}`}>{mode.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => document.getElementById('tasteoff-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-7 py-4 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider shadow-[6px_6px_0_#ffcf38] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#ffcf38] transition cursor-pointer border-2 border-black"
              >
                WHICH TASTES BETTER? CAST YOUR VOTE ↓
              </button>

              <button
                onClick={() => setRecipeModalOpen(true)}
                className="px-6 py-4 bg-transparent text-[#f4efe5] font-black uppercase text-xs tracking-wider border-2 border-[#f4efe5]/40 hover:border-[#f4efe5] hover:bg-white/5 transition cursor-pointer"
              >
                GET 5 EASY RECIPES ({isKeyUnlocked ? 'READY' : 'FREE'})
              </button>
            </div>
          </div>

          {/* Right Column: Physical Stamped Roadshow Tasting Pass */}
          <div className="relative">
            <div className="bg-[#f4efe5] text-[#11100e] p-6 shadow-[14px_14px_0_#ff5a1f] border-2 border-black rotate-1 hover:rotate-0 transition-transform duration-300">
              
              {/* Ticket Top */}
              <div className="flex justify-between items-center font-mono text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-3">
                <span>FREE SAMPLING PASS</span>
                <span className="bg-black text-white px-2 py-0.5">RED HILLS ROAD</span>
              </div>

              {/* Photo Preview */}
              <div className="my-4 relative border-2 border-black overflow-hidden aspect-[4/3] bg-black">
                <img
                  src={
                    activeMode === 'cook'
                      ? 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800'
                      : activeMode === 'whip'
                      ? 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
                      : 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800'
                  }
                  alt="Application View"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#ffcf38] text-black font-mono font-black text-[10px] uppercase px-2 py-0.5 border border-black">
                  {activeMode === 'cook' ? 'DISH 01: HOT RASTA PASTA' : activeMode === 'whip' ? 'DISH 02: CHOCOLATE CHIP MOUSSE' : 'DISH 03: CREAMY STOUT PUNCH'}
                </div>
              </div>

              {/* Price Highlight */}
              <div className="text-center py-2 border-b-2 border-dashed border-[#898071]">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#776e62]">THIS WEEK AT PRICESMART</span>
                <strong className="block font-serif text-5xl font-black text-[#ff5a1f] leading-none my-1">
                  J$1,200
                </strong>
                <p className="font-mono text-[10px] text-[#776e62]">
                  Usually ~J$2,700 for imported heavy cream. You save J$1,500.
                </p>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-2 font-mono text-[10px] border-b-2 border-black my-3">
                <div className="py-2 pr-2 border-r-2 border-black">
                  <span className="text-[#776e62] block">LOCATION</span>
                  <strong className="text-xs">PriceSmart KGN 19</strong>
                </div>
                <div className="py-2 pl-2">
                  <span className="text-[#776e62] block">SAMPLING HOURS</span>
                  <strong className="text-xs">10:00 AM – 8:00 PM</strong>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between font-mono text-[10px] text-[#776e62] pt-1">
                <span>TASTE FREE BEFORE YOU BUY</span>
                <span className="text-black font-bold">1L CARTON</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. THE 3 BIG PROBLEMS WE SOLVE (PLAIN ENGLISH) */}
      <section className="bg-[#f4efe5] text-[#11100e] px-4 sm:px-8 py-20 border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="max-w-3xl space-y-2">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
              WHY SWITCH FROM REGULAR CREAM?
            </p>
            <h2 className="font-serif text-4xl sm:text-6xl font-bold leading-tight">
              Cooking with cream in Jamaica shouldn't be a gamble.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 border-t-2 border-black pt-8 font-mono">
            
            <article className="space-y-3 bg-white p-6 border-2 border-black shadow-[6px_6px_0_#ff5a1f]">
              <div className="flex items-center justify-between">
                <span className="text-[#ff5a1f] font-black text-xs">PROBLEM #1</span>
                <span className="text-xs text-red-600 font-bold">CURDLING</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-black font-sans">No more split, oily pasta sauces</h3>
              <p className="text-xs text-[#554e45] leading-relaxed">
                Most heavy creams separate into oil when heated with Scotch bonnet, garlic, or lemon. Arla is heat-stable and never curdles, giving you glossy, restaurant-quality sauces every single time.
              </p>
            </article>

            <article className="space-y-3 bg-white p-6 border-2 border-black shadow-[6px_6px_0_#ffcf38]">
              <div className="flex items-center justify-between">
                <span className="text-[#ff5a1f] font-black text-xs">PROBLEM #2</span>
                <span className="text-xs text-amber-600 font-bold">MELTING</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-black font-sans">Whips to 3.5× volume and holds firm</h3>
              <p className="text-xs text-[#554e45] leading-relaxed">
                You get more whipped cream from one carton (expands to 350% of its size). Even better, it doesn’t melt into soup on your cakes or desserts in warm weather.
              </p>
            </article>

            <article className="space-y-3 bg-white p-6 border-2 border-black shadow-[6px_6px_0_#25D366]">
              <div className="flex items-center justify-between">
                <span className="text-[#ff5a1f] font-black text-xs">PROBLEM #3</span>
                <span className="text-xs text-emerald-700 font-bold">MONEY WASTED</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-black font-sans">One carton handles everything</h3>
              <p className="text-xs text-[#554e45] leading-relaxed">
                Stop buying one expensive cream for Alfredo pasta and a separate can for desserts that spoils in 3 days. Use what you need for dinner, whip the rest for dessert or a cream punch.
              </p>
            </article>

          </div>

        </div>
      </section>

      {/* 4. THE LIVE TASTE-OFF ARENA */}
      <section id="tasteoff-section" className="px-4 sm:px-8 py-20 bg-[#161412] border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#332e29] pb-6">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
                THE RED HILLS ROAD TASTE-OFF
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl font-black text-white mt-1">
                Which dish won your taste test?
              </h2>
              <p className="text-xs text-white/70 font-mono mt-1">
                Shoppers at PriceSmart get to try both free. Cast your vote below to see what Kingston prefers.
              </p>
            </div>
            <div className="font-mono text-left md:text-right bg-black/60 border border-white/10 p-3 px-5">
              <span className="text-2xl font-black text-[#ffcf38]">{totalVotes}</span>
              <p className="text-[10px] font-bold text-white/40 uppercase">Shopper Votes Counted</p>
            </div>
          </div>

          {/* Duel Matchup Arena */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Card 1: Team Rasta Pasta */}
            <div className={`p-6 border-2 transition-all flex flex-col justify-between ${
              tasteOffVote === 'pasta'
                ? 'border-[#ff5a1f] bg-[#ff5a1f]/10 shadow-[8px_8px_0_#ff5a1f]'
                : 'border-white/15 bg-black/40 hover:border-white/40'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="bg-[#ff5a1f] text-black font-black px-2.5 py-0.5">SAVOURY / HOT</span>
                  <span className="text-white/50">DINNER SAMPLE</span>
                </div>

                <div className="border border-white/20 aspect-video overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800"
                    alt="Rasta Pasta"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-serif text-3xl font-black text-white">🍝 Spicy Rasta Pasta</h3>
                <p className="text-xs text-[#c0b5a8] leading-relaxed">
                  Creamy penne tossed in a hot Scotch bonnet, garlic, scallion, and sweet bell pepper reduction. Shows how rich and silky the sauce stays under high heat.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {tasteOffVote && (
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#ff5a1f]">{pastaPct}% PREFER THE PASTA</span>
                      <span className="text-white/60">{pastaVotes} VOTES</span>
                    </div>
                    <div className="h-3 w-full bg-black border border-white/20">
                      <div className="h-full bg-[#ff5a1f]" style={{ width: `${pastaPct}%` }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleTasteOffVote('pasta')}
                  disabled={!!tasteOffVote}
                  className={`w-full py-4 font-mono font-black uppercase text-xs tracking-wider border-2 transition cursor-pointer ${
                    tasteOffVote === 'pasta'
                      ? 'bg-[#ff5a1f] text-black border-black shadow-[4px_4px_0_#ffcf38]'
                      : 'bg-white text-black border-black hover:bg-[#ff5a1f]'
                  }`}
                >
                  {tasteOffVote === 'pasta' ? '✓ YOUR VOTE IS RECORDED' : 'I PREFER RASTA PASTA (+50 PTS)'}
                </button>
              </div>
            </div>

            {/* Card 2: Team Chocolate Chip Mousse */}
            <div className={`p-6 border-2 transition-all flex flex-col justify-between ${
              tasteOffVote === 'mousse'
                ? 'border-[#ffcf38] bg-[#ffcf38]/10 shadow-[8px_8px_0_#ffcf38]'
                : 'border-white/15 bg-black/40 hover:border-white/40'
            }`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="bg-[#ffcf38] text-black font-black px-2.5 py-0.5">SWEET / COLD</span>
                  <span className="text-white/50">DESSERT SAMPLE</span>
                </div>

                <div className="border border-white/20 aspect-video overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800"
                    alt="Chocolate Chip Mousse"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-serif text-3xl font-black text-white">🍫 Chocolate Chip Mousse</h3>
                <p className="text-xs text-[#c0b5a8] leading-relaxed">
                  Light, fluffy chocolate mousse whipped in minutes from the exact same cream. Shows how smooth and clean the dairy flavour is without being overly sweet.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {tasteOffVote && (
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#ffcf38]">{moussePct}% PREFER THE MOUSSE</span>
                      <span className="text-white/60">{mousseVotes} VOTES</span>
                    </div>
                    <div className="h-3 w-full bg-black border border-white/20">
                      <div className="h-full bg-[#ffcf38]" style={{ width: `${moussePct}%` }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleTasteOffVote('mousse')}
                  disabled={!!tasteOffVote}
                  className={`w-full py-4 font-mono font-black uppercase text-xs tracking-wider border-2 transition cursor-pointer ${
                    tasteOffVote === 'mousse'
                      ? 'bg-[#ffcf38] text-black border-black shadow-[4px_4px_0_#ff5a1f]'
                      : 'bg-white text-black border-black hover:bg-[#ffcf38]'
                  }`}
                >
                  {tasteOffVote === 'mousse' ? '✓ YOUR VOTE IS RECORDED' : 'I PREFER CHOCOLATE MOUSSE (+50 PTS)'}
                </button>
              </div>
            </div>

          </div>

          {/* Social Share Callout */}
          {tasteOffVote && (
            <div className="p-6 bg-black border-2 border-[#ff5a1f] flex flex-wrap items-center justify-between gap-4 font-mono">
              <div className="text-xs">
                <span className="text-[#ffcf38] font-black uppercase block mb-0.5">SHARE WITH FRIENDS & FAMILY</span>
                <p className="text-white/70">Let someone in Kingston know they can taste this free today at PriceSmart.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={shareWhatsApp}
                  className="px-5 py-2.5 bg-[#25D366] text-black font-black text-xs uppercase border border-black shadow-[3px_3px_0_#fff] cursor-pointer"
                >
                  SEND VIA WHATSAPP
                </button>
                <button
                  onClick={copyShareLink}
                  className="px-5 py-2.5 bg-white/10 text-white font-black text-xs uppercase border border-white/20 hover:bg-white/20 cursor-pointer"
                >
                  COPY LINK
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 5. PRICE COMPARISON RECEIPT (PLAIN ENGLISH SAVINGS) */}
      <section className="px-4 sm:px-8 py-20 bg-[#11100e] border-b-2 border-black">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ffcf38]">
              GROCERY PRICE BREAKDOWN
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-black text-white">
              Why this is the smartest grocery buy this week
            </h2>
            <p className="text-xs text-white/60 font-mono">
              PriceSmart Jamaica has Arla Pro on roadshow special right now.
            </p>
          </div>

          {/* Monospace Price Receipt Card */}
          <div className="bg-[#181512] border-2 border-white/20 p-6 sm:p-8 font-mono text-xs text-[#d0c5b9] shadow-[10px_10px_0_#000] space-y-4">
            <div className="flex justify-between items-center border-b border-white/20 pb-3 font-bold text-white">
              <span>GROCERY COMPARISON</span>
              <span>ESTIMATED COST</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span>Regular imported cooking cream (1L)</span>
                <span className="text-white/60 line-through">~J$2,700</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>+ Separate can of dessert whipping cream</span>
                <span className="line-through">~J$800</span>
              </div>
              <div className="flex justify-between text-[#ffcf38] font-black text-sm pt-2 border-t border-white/10">
                <span>ARLA PRO 1L (DOES BOTH DINNER & DESSERT)</span>
                <span>J$1,200</span>
              </div>
              <div className="flex justify-between text-[#25D366] font-bold">
                <span>YOUR ESTIMATED SAVINGS</span>
                <span>SAVE OVER J$1,500+ (56%)</span>
              </div>
            </div>

            <div className="p-3 bg-black/60 border border-white/10 text-[10px] text-white/60 space-y-1">
              <p>✔ 1 Litre is enough for 2 family pasta dinners AND a full bowl of dessert mousse.</p>
              <p>✔ Unopened cartons keep long-term in the fridge (Keep at ≤ 8°C. Once opened, use within ~3 days).</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {['I plan to grab a carton', 'Already bought at the roadshow'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setPurchaseStatus(st);
                    toast.success(`Noted: ${st}`);
                  }}
                  className={`p-3 text-center border font-bold text-xs uppercase transition cursor-pointer ${
                    purchaseStatus === st
                      ? 'border-[#ff5a1f] bg-[#ff5a1f] text-black shadow-[2px_2px_0_#ffcf38]'
                      : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. DIGITAL RECIPE PACK (FREE DOWNLOAD) */}
      <section className="px-4 sm:px-8 py-20 bg-[#161412] border-b-2 border-black">
        <div className="max-w-7xl mx-auto grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          
          <div className="space-y-6">
            <div className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ffcf38] flex items-center gap-2">
              <span>FREE BONUS</span>
              <span>/</span>
              <span>DIGITAL RECIPE GUIDE</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-6xl font-black text-white leading-tight">
              5 Delicious Things You Can Cook Tonight
            </h2>

            <p className="text-sm text-[#d0c5b9] leading-relaxed max-w-xl">
              We wrote 5 foolproof recipes using ingredients readily available in Jamaican supermarkets: <strong>Roadshow Rasta Pasta</strong>, <strong>Chocolate Chip Mousse</strong>, <strong>Creamy Garlic Pan Chicken</strong>, <strong>Strawberry Cheesecake Cups</strong>, and <strong>Jamaican Strong Back Punch</strong>.
            </p>

            {/* Access Tracker */}
            <div className="bg-black border-2 border-white/20 p-5 max-w-md font-mono space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#ffcf38]">RECIPE ACCESS STATUS</span>
                <span className={isKeyUnlocked ? 'text-[#25D366]' : 'text-[#ff5a1f]'}>
                  {isKeyUnlocked ? 'UNLOCKED & READY' : 'COMPLETE 1 ACTION TO UNLOCK'}
                </span>
              </div>
              <p className="text-[10px] text-white/50">
                {isKeyUnlocked ? '★ You unlocked the full digital recipe pack! Tap below to view.' : 'Vote in the Taste-Off above to unlock all 5 recipes instantly.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setRecipeModalOpen(true)}
                className={`px-7 py-4 font-mono font-black uppercase text-xs tracking-wider border-2 transition cursor-pointer ${
                  isKeyUnlocked
                    ? 'bg-[#25D366] text-black border-black shadow-[6px_6px_0_#ffcf38]'
                    : 'bg-[#ff5a1f] text-black border-black shadow-[6px_6px_0_#fff]'
                }`}
              >
                {isKeyUnlocked ? 'OPEN 5 RECIPES PACK (FREE) →' : 'PREVIEW THE RECIPES →'}
              </button>
            </div>
          </div>

          {/* Recipe Pack Index Preview */}
          <div
            onClick={() => setRecipeModalOpen(true)}
            className="bg-[#f4efe5] text-[#11100e] p-6 border-2 border-black shadow-[12px_12px_0_#ffcf38] font-mono cursor-pointer hover:rotate-1 transition-transform"
          >
            <div className="flex justify-between border-b-2 border-black pb-2 text-xs font-black">
              <span>WHAT IS INSIDE</span>
              <span>5 TESTED DISHES</span>
            </div>
            <div className="divide-y divide-black/15 text-xs py-2">
              <div className="py-2.5 flex justify-between">
                <span>01. Spicy Roadshow Rasta Pasta</span>
                <span className="font-bold text-[#ff5a1f]">DINNER</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>02. 5-Minute Chocolate Mousse</span>
                <span className="font-bold text-[#ffcf38]">DESSERT</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>03. Creamy Garlic & Herb Chicken</span>
                <span className="font-bold text-[#ff5a1f]">DINNER</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>04. No-Bake Cheesecake Cups</span>
                <span className="font-bold text-[#ffcf38]">DESSERT</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>05. Jamaican Stout & Cream Punch</span>
                <span className="font-bold text-[#ff5a1f]">BEVERAGE</span>
              </div>
            </div>
            <div className="text-[10px] text-center pt-2 text-[#776e62] border-t-2 border-black">
              TAP TO VIEW ALL 5 INGREDIENTS & STEPS
            </div>
          </div>

        </div>
      </section>

      {/* 7. ROADSHOW LOCATION & OPENING HOURS */}
      <section className="px-4 sm:px-8 py-20 bg-[#11100e] border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-8 font-mono">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/20 pb-6">
            <div>
              <span className="text-xs font-black uppercase text-[#ff5a1f] tracking-widest">WHERE TO TASTE IT TODAY</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-white mt-1">PriceSmart Jamaica</h2>
              <p className="text-xs text-white/60 mt-1">111 Red Hills Road, Kingston 19 · Daily 10:00 AM – 8:00 PM</p>
            </div>
            <Link
              to="/moments/00000000-0000-0000-0002-000000000060"
              className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-wider border border-black hover:bg-[#ffcf38] transition"
            >
              VIEW EVENT ON PROMORANG →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#ff5a1f] font-bold">STEP 01</span>
              <h4 className="text-sm font-bold text-white font-serif">Try the Hot Rasta Pasta</h4>
              <p className="text-[11px] text-white/60">Free hot sample from the chef station inside the store.</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#ffcf38] font-bold">STEP 02</span>
              <h4 className="text-sm font-bold text-white font-serif">Try the Chocolate Mousse</h4>
              <p className="text-[11px] text-white/60">Taste how light and firm the whipped dessert is.</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#25D366] font-bold">STEP 03</span>
              <h4 className="text-sm font-bold text-white font-serif">Vote For Your Winner</h4>
              <p className="text-[11px] text-white/60">Vote on Promorang to unlock the 5 recipes.</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1.5">
              <span className="text-[10px] text-[#ff5a1f] font-bold">STEP 04</span>
              <h4 className="text-sm font-bold text-white font-serif">Grab 1L for J$1,200</h4>
              <p className="text-[11px] text-white/60">Stock up while the roadshow special price lasts.</p>
            </div>
            <div className="p-4 bg-black border border-dashed border-[#ffcf38] space-y-1.5 sm:col-span-2">
              <span className="text-[10px] text-[#ffcf38] font-bold">BONUS SURPRISE</span>
              <h4 className="text-sm font-bold text-white font-serif">Catch the Strong Back Punch Drop</h4>
              <p className="text-[11px] text-white/60">Occasionally during peak hours, promoters sample Jamaican Strong Back punch made with Arla.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="px-4 sm:px-8 py-16 bg-black text-center font-mono space-y-6">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-xs text-[#ff5a1f] font-black uppercase tracking-widest">PROMORANG × ARLA PRO ROADSHOW</p>
          <h3 className="font-serif text-3xl sm:text-4xl font-black text-white">Better cooking. Less waste. Better savings.</h3>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/proposals/arla-pro"
            className="px-6 py-3 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider border border-black shadow-[4px_4px_0_#ffcf38]"
          >
            COMMERCIAL PROPOSAL FOR ARLA LEADERSHIP →
          </Link>
        </div>
      </footer>

      {/* Recipe Pack Modal */}
      <ArlaRecipePackModal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        unlocked={isKeyUnlocked}
      />
    </main>
  );
}
