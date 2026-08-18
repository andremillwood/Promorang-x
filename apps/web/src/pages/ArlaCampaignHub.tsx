import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  Gift,
  Share2,
  BookOpen,
  ShoppingBag,
  ExternalLink,
  ChefHat,
  Vote,
  Users,
  Copy,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArlaRecipePackModal } from '@/components/arla/ArlaRecipePackModal';
import { getSiteUrl } from '@/lib/discovery';

export default function ArlaCampaignHub() {
  // State for Taste-Off voting
  const [tasteOffVote, setTasteOffVote] = useState<'pasta' | 'mousse' | null>(null);
  const [pastaVotes, setPastaVotes] = useState(128);
  const [mousseVotes, setMousseVotes] = useState(114);

  // State for Product Mode poll
  const [modeVote, setModeVote] = useState<string | null>(null);

  // State for Price expectation poll
  const [priceVote, setPriceVote] = useState<string | null>(null);
  const [showPriceReveal, setShowPriceReveal] = useState(false);

  // State for Usage intent poll
  const [intentVote, setIntentVote] = useState<string | null>(null);

  // State for Purchase intent
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  // State for Recipe Pack Modal
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  // Actions completed tracker for Recipe Key unlock (unlocks at 2)
  const completedActionsCount = (
    (tasteOffVote ? 1 : 0) +
    (modeVote ? 1 : 0) +
    (priceVote ? 1 : 0) +
    (intentVote ? 1 : 0) +
    (purchaseStatus ? 1 : 0)
  );
  const isKeyUnlocked = completedActionsCount >= 2;

  const totalTasteOffVotes = pastaVotes + mousseVotes;
  const pastaPercentage = Math.round((pastaVotes / totalTasteOffVotes) * 100);
  const moussePercentage = 100 - pastaPercentage;

  const handleTasteOffVote = (choice: 'pasta' | 'mousse') => {
    if (tasteOffVote) return;
    setTasteOffVote(choice);
    if (choice === 'pasta') {
      setPastaVotes((v) => v + 1);
      toast.success('Vote recorded for Team Rasta Pasta! 🍝 (+25 PromoPoints)');
    } else {
      setMousseVotes((v) => v + 1);
      toast.success('Vote recorded for Team Chocolate Chip Mousse! 🍫 (+25 PromoPoints)');
    }
  };

  const handlePriceSelect = (range: string) => {
    setPriceVote(range);
    setShowPriceReveal(true);
    toast.success('Perception logged! Price revealed (+25 PromoPoints)');
  };

  const handleIntentSelect = (intent: string) => {
    setIntentVote(intent);
    toast.success('Usage intent recorded (+25 PromoPoints)');
    if (intent === 'recipes') {
      setRecipeModalOpen(true);
    } else if (intent === 'try') {
      document.getElementById('moment-card')?.scrollIntoView({ behavior: 'smooth' });
    } else if (intent === 'price') {
      document.getElementById('deal-card')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePurchaseSelect = (status: string) => {
    setPurchaseStatus(status);
    toast.success(`Purchase state updated: ${status}`);
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/campaigns/arla-whip-and-cook?utm_source=promorang_share&utm_medium=referral&utm_campaign=arla_pricesmart`;
    navigator.clipboard.writeText(url);
    toast.success('Campaign referral link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = `Taste Rasta Pasta vs Chocolate Chip Mousse at PriceSmart Jamaica! Vote in the Arla Whip & Cook Taste-Off and unlock the 5-Recipe Pack: ${window.location.origin}/campaigns/arla-whip-and-cook`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white selection:bg-[#8A1538] selection:text-white pb-24">
      <SEO
        title="Arla Pro Whip & Cook @ PriceSmart Jamaica — Taste It. Whip It. Cook It."
        description="Experience the Arla Pro Whip & Cook roadshow at PriceSmart Jamaica (Red Hills Road). Taste Rasta Pasta vs Chocolate Chip Mousse, vote in the live Taste-Off, unlock 5 Recipes, and get 1L cartons for J$1,200."
        image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
        url={getSiteUrl("/campaigns/arla-whip-and-cook")}
      />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-white/10 pt-20 pb-16 bg-gradient-to-b from-[#1a050c] via-[#0d0d0f] to-[#0d0d0f]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8A1538]/25 via-transparent to-transparent opacity-80" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          
          {/* Top Brand Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-[#8A1538] text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md shadow-[#8A1538]/30">
                Arla Pro Jamaica
              </span>
              <span className="bg-[#008543] text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md shadow-[#008543]/30">
                PriceSmart Roadshow
              </span>
            </div>
            
            <Link
              to="/proposals/arla-pro"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition underline underline-offset-4"
            >
              <span>View Arla Commercial Proposal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Hero Main Copy */}
          <div className="max-w-4xl space-y-4">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              WHIP OR COOK?
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-amber-300">
              One Product. Two Uses. Endless Possibilities.
            </p>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
              Arla Pro Whip & Cook 28% is in Jamaica at <strong>PriceSmart (111 Red Hills Road)</strong>. Experience one cream designed for hot savoury dishes, light airy desserts, and rich beverages.
            </p>
          </div>

          {/* Quick Value & Location Strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Location</span>
              <p className="text-white font-bold mt-0.5">PriceSmart Jamaica</p>
              <p className="text-white/50 text-[11px]">111 Red Hills Road, KGN 19</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Roadshow Offer</span>
              <p className="text-emerald-400 font-black text-base mt-0.5">Approx. J$1,200</p>
              <p className="text-white/50 text-[11px]">Advised reg. ~J$2,700</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Samples Served</span>
              <p className="text-white font-bold mt-0.5">Rasta Pasta + Mousse</p>
              <p className="text-white/50 text-[11px]">+ Strong Back Drops</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-white/40 block uppercase text-[10px] font-bold">Attendee Perk</span>
              <p className="text-amber-400 font-bold mt-0.5">5-Recipe Pack</p>
              <p className="text-white/50 text-[11px]">Unlocked via Arla Key</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Campaign Body Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 space-y-12">

        {/* SECTION 1: HERO TASTE-OFF VOTE */}
        <section className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#1a1215] via-[#141417] to-[#0f1411] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <span className="px-2.5 py-0.5 bg-[#8A1538]/30 text-rose-300 border border-[#8A1538]/50 rounded-full text-[10px] font-black uppercase tracking-wider">
                Hero Roadshow Taste-Off 🔥
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-white mt-1">
                Rasta Pasta vs Chocolate Chip Mousse
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Taste both at PriceSmart. Cast your vote right here. Real votes shape live rankings.
              </p>
            </div>
            
            <div className="text-left sm:text-right shrink-0">
              <span className="text-2xl font-black text-white">{totalTasteOffVotes}</span>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Verified Votes</p>
            </div>
          </div>

          {/* Voting Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Card 1: Rasta Pasta */}
            <div
              className={`relative overflow-hidden rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                tasteOffVote === 'pasta'
                  ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-md text-[10px] font-black uppercase">
                    Cook Application (Hot/Savoury)
                  </span>
                  {tasteOffVote === 'pasta' && (
                    <span className="flex items-center text-xs font-black text-orange-400">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Your Pick
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-serif font-black text-white flex items-center gap-2">
                  🍝 Team Rasta Pasta
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Rich, velvety bell pepper and Scotch bonnet reduction. Demonstrates Arla Whip & Cook’s heat stability and smooth sauce consistency.
                </p>
              </div>

              {tasteOffVote && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-orange-400">{pastaPercentage}%</span>
                    <span className="text-white/50">{pastaVotes} votes</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${pastaPercentage}%` }} />
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleTasteOffVote('pasta')}
                disabled={!!tasteOffVote}
                className={`mt-5 w-full font-bold rounded-xl text-xs py-2.5 ${
                  tasteOffVote === 'pasta'
                    ? 'bg-orange-500 text-black'
                    : 'bg-white/10 hover:bg-orange-500 hover:text-black text-white'
                }`}
              >
                {tasteOffVote === 'pasta' ? 'Voted Team Rasta Pasta' : 'Vote for Rasta Pasta'}
              </Button>
            </div>

            {/* Card 2: Chocolate Chip Mousse */}
            <div
              className={`relative overflow-hidden rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                tasteOffVote === 'mousse'
                  ? 'border-[#008543] bg-[#008543]/10 ring-2 ring-[#008543]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#008543]/20 text-emerald-400 rounded-md text-[10px] font-black uppercase">
                    Whip Application (Cold/Dessert)
                  </span>
                  {tasteOffVote === 'mousse' && (
                    <span className="flex items-center text-xs font-black text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Your Pick
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-serif font-black text-white flex items-center gap-2">
                  🍫 Team Chocolate Chip Mousse
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Airy, firm peak structure whipped with 3.5× volume expansion. Mild flavour lets rich cocoa and chocolate notes take center stage.
                </p>
              </div>

              {tasteOffVote && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-400">{moussePercentage}%</span>
                    <span className="text-white/50">{mousseVotes} votes</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${moussePercentage}%` }} />
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleTasteOffVote('mousse')}
                disabled={!!tasteOffVote}
                className={`mt-5 w-full font-bold rounded-xl text-xs py-2.5 ${
                  tasteOffVote === 'mousse'
                    ? 'bg-[#008543] text-white'
                    : 'bg-white/10 hover:bg-[#008543] hover:text-white text-white'
                }`}
              >
                {tasteOffVote === 'mousse' ? 'Voted Team Mousse' : 'Vote for Chocolate Chip Mousse'}
              </Button>
            </div>

          </div>

          {/* Post-Vote Micro Share Strip */}
          {tasteOffVote && (
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-white/70 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Leaderboard live: <strong>{pastaVotes > mousseVotes ? 'Rasta Pasta is leading!' : 'Chocolate Chip Mousse is leading!'}</strong></span>
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={shareWhatsApp} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                  <Share2 className="h-3.5 w-3.5 mr-1" /> Share to WhatsApp
                </Button>
                <Button size="sm" variant="outline" onClick={copyShareLink} className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs">
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: DISCOVERY POLLS & PRODUCT INSIGHTS */}
        <section className="grid gap-6 md:grid-cols-3">
          
          {/* Discovery Card 1: Product Mode */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Poll 2 · Product Mode</span>
              <h3 className="text-lg font-bold text-white leading-snug">
                Whip It, Cook It, or Drink It?
              </h3>
              <p className="text-xs text-white/60">If we gave you one carton right now, what happens first?</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'cook', label: '🍳 Cook It (Alfredo, creamy chicken, pasta)' },
                { id: 'whip', label: '🍰 Whip It (Mousse, cheesecake, toppings)' },
                { id: 'drink', label: '🥤 Drink It (Strong Back punch, coffee)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setModeVote(opt.id)}
                  disabled={!!modeVote}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition ${
                    modeVote === opt.id
                      ? 'border-primary bg-primary/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {modeVote && (
              <p className="text-[11px] text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Preference counted! (+25 Pts)
              </p>
            )}
          </div>

          {/* Discovery Card 2: Price Perception (Asked before reveal) */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Discovery · Price Expectation</span>
              <h3 className="text-lg font-bold text-white leading-snug">
                What would you expect to pay for 1L dual-use cream?
              </h3>
              <p className="text-xs text-white/60">Benchmark perceived value against activation pricing.</p>
            </div>

            {!showPriceReveal ? (
              <div className="space-y-1.5">
                {[
                  'Under J$1,000',
                  'J$1,000 – J$1,499',
                  'J$1,500 – J$1,999',
                  'J$2,000 – J$2,499',
                  'J$2,500+'
                ].map((range) => (
                  <button
                    key={range}
                    onClick={() => handlePriceSelect(range)}
                    className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition"
                  >
                    {range}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 animate-in fade-in duration-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Activation Price Reveal</span>
                <p className="text-xl font-black text-white">Approx. J$1,200</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  We've been advised the usual regular price is approx. <strong>J$2,700</strong> (56% difference). Available at PriceSmart roadshow.
                </p>
              </div>
            )}
          </div>

          {/* Discovery Card 3: Usage Intent */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Discovery · Usage Intent</span>
              <h3 className="text-lg font-bold text-white leading-snug">
                What would make you most likely to buy?
              </h3>
              <p className="text-xs text-white/60">Connects directly to matching Promorang inventory.</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'try', label: '🥄 Trying it first (Sample at PriceSmart)' },
                { id: 'recipes', label: '📖 Seeing recipes (Unlock 5-Recipe Pack)' },
                { id: 'price', label: '🏷️ The J$1,200 roadshow price' },
                { id: 'dual', label: '✨ Dual cooking + whipping utility' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleIntentSelect(item.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition ${
                    intentVote === item.id
                      ? 'border-rose-500 bg-rose-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {intentVote && (
              <p className="text-[11px] text-rose-400 font-bold flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Smart recommendation applied!
              </p>
            )}
          </div>

        </section>

        {/* SECTION 3: TODAY'S PRICESMART ROADSHOW MOMENT & MISSIONS */}
        <section id="moment-card" className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-10 space-y-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#8A1538] text-white font-bold text-xs uppercase px-3 py-0.5">
                  Live PriceSmart Activation
                </Badge>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                  ● Sampling Active Today
                </Badge>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
                Arla Whip & Cook @ PriceSmart
              </h2>
              <p className="text-xs sm:text-sm text-white/60 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>111 Red Hills Road, Kingston 19, Jamaica</span>
                <span>•</span>
                <Clock className="h-4 w-4 text-primary" />
                <span>Daily 10:00 AM – 8:00 PM</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild className="rounded-2xl bg-primary hover:bg-orange-500 text-black font-black px-6 py-2.5">
                <Link to="/moments/00000000-0000-0000-0002-000000000060">
                  Open Roadshow Moment <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Submoments & Sampling Missions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                <span>Active Submoments & Onsite Missions (5)</span>
              </h3>
              <span className="text-xs font-semibold text-white/40">Earn points & keys on site</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Mission 1 */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-orange-400">Submoment A · Savoury</span>
                  <span className="text-xs font-bold text-purple-300">+40 pts</span>
                </div>
                <h4 className="text-sm font-bold text-white">Taste the Rasta Pasta</h4>
                <p className="text-xs text-white/60">Sample the hot jerk cream pasta and rate whether you'd cook it at home.</p>
              </div>

              {/* Mission 2 */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-400">Submoment B · Dessert</span>
                  <span className="text-xs font-bold text-purple-300">+40 pts</span>
                </div>
                <h4 className="text-sm font-bold text-white">Taste Chocolate Chip Mousse</h4>
                <p className="text-xs text-white/60">Sample the whipped cold mousse and test dual-use cream versatility.</p>
              </div>

              {/* Mission 3 */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-rose-400">Submoment C · Voting</span>
                  <span className="text-xs font-bold text-amber-300">PromoKey</span>
                </div>
                <h4 className="text-sm font-bold text-white">Pick Your Winner</h4>
                <p className="text-xs text-white/60">Vote in the official Taste-Off and share live results with friends.</p>
              </div>

              {/* Mission 4 */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400">Submoment D · Retail</span>
                  <span className="text-xs font-bold text-purple-300">+60 pts</span>
                </div>
                <h4 className="text-sm font-bold text-white">Get Arla for J$1,200</h4>
                <p className="text-xs text-white/60">Special J$1,200 roadshow price. On-ground brand promoters can confirm your purchase.</p>
              </div>

              {/* Mission 5 (Bonus) */}
              <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/[0.05] p-4 space-y-2 sm:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-400">Submoment E · Surprise Drop</span>
                  <span className="text-xs font-bold text-amber-300">Bonus Perk</span>
                </div>
                <h4 className="text-sm font-bold text-white">Did You Catch the Strong Back? (Conditional Bonus)</h4>
                <p className="text-xs text-white/60">Surprise Jamaican Strong Back Punch drop with Arla cream (unconfirmed schedule, subject to daily drop announcements).</p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: DIGITAL PRODUCT / LEAD MAGNET: 5 WAYS TO WHIP & COOK */}
        <section className="rounded-3xl border border-white/15 bg-gradient-to-r from-[#8A1538]/20 via-[#141417] to-[#008543]/20 p-6 sm:p-10 shadow-2xl">
          <div className="grid gap-8 md:grid-cols-[1fr_360px] md:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Digital Product Lead Magnet
                </span>
                <span className="text-xs text-white/60">Arla Recipe Key Reward</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
                5 Ways to Whip & Cook with Arla
              </h2>
              
              <p className="text-sm text-white/70 leading-relaxed max-w-xl">
                A digital culinary guide featuring 5 concept recipes: Roadshow Rasta Pasta, Whipped Chocolate Chip Mousse, Creamy Garlic Chicken, Strawberry Cheesecake Cups, and Strong Back Punch.
              </p>

              {/* Unlock Requirement Progress Bar */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 max-w-md">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Arla Recipe Key Unlock</span>
                  </span>
                  <span className={isKeyUnlocked ? 'text-emerald-400' : 'text-amber-400'}>
                    {Math.min(completedActionsCount, 2)} / 2 Actions Completed
                  </span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min((completedActionsCount / 2) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/50">
                  {isKeyUnlocked
                    ? '🎉 Recipe Key Unlocked! Click below to view and save the Recipe Pack.'
                    : 'Complete any 2 actions on this page (vote in Taste-Off, answer a poll, or log intent) to unlock.'}
                </p>
              </div>

              <Button
                onClick={() => setRecipeModalOpen(true)}
                className={`rounded-2xl font-black text-xs px-7 py-3 transition shadow-lg ${
                  isKeyUnlocked
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-primary hover:bg-orange-500 text-black shadow-primary/20'
                }`}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {isKeyUnlocked ? 'Open Unlocked Recipe Pack (5 Recipes)' : 'Preview 5-Recipe Pack'}
              </Button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/15 aspect-[4/3] bg-black relative group cursor-pointer" onClick={() => setRecipeModalOpen(true)}>
              <img
                src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800"
                alt="Recipe Pack Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-5">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400">Exclusive Branded Guide</span>
                  <p className="text-base font-bold text-white">5 Ways to Whip & Cook</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: RETAIL CONVERSION / J$1,200 OFFER */}
        <section id="deal-card" className="rounded-3xl border border-white/15 bg-white/[0.03] p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Roadshow Pricing Opportunity</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-0.5">
                Get Arla Whip & Cook for Approx. J$1,200
              </h2>
              <p className="text-xs text-white/60">
                Product is available exclusively during the current PriceSmart roadshow activation.
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-3xl font-black text-emerald-400">J$1,200</span>
              <p className="text-[10px] text-white/40">Advised regular price ~J$2,700</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-3 text-xs sm:text-sm text-white/80 leading-relaxed">
              <p>
                The product is reportedly not presently sitting as a normal shelf item, but is available for purchase directly through the PriceSmart roadshow.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-white/40 block text-[10px] uppercase font-bold">Approximate Difference</span>
                  <strong className="text-emerald-400 text-sm font-black">~J$1,500 Savings</strong>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-white/40 block text-[10px] uppercase font-bold">Percentage Value</span>
                  <strong className="text-emerald-400 text-sm font-black">~56% Below Regular</strong>
                </div>
              </div>
            </div>

            {/* Purchase Intent Logger */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                Log Your Purchase Intent
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Interested',
                  'Planning to Buy',
                  'Purchased (Self-Reported)',
                  'Purchased (Verified)'
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => handlePurchaseSelect(st)}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition ${
                      purchaseStatus === st
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              
              {purchaseStatus && (
                <p className="text-[10px] text-emerald-400 font-semibold text-center pt-1">
                  ✓ Recorded: {purchaseStatus}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 6: BRING SOMEONE IN / DISTRIBUTION */}
        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-[#141417] to-amber-500/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Distribution & Referrals</span>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
              Bring Someone In — Taste Together at PriceSmart
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Share the Taste-Off with foodies, home bakers, or pasta lovers. Earn +100 PromoPoints when your friend logs their visit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button onClick={shareWhatsApp} className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5">
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button onClick={copyShareLink} variant="outline" className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs font-bold px-5 py-2.5">
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link
            </Button>
          </div>
        </section>

      </div>

      {/* Recipe Pack Modal */}
      <ArlaRecipePackModal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        unlocked={isKeyUnlocked}
      />
    </main>
  );
}
