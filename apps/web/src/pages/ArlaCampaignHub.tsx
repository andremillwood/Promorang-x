import React, { useState, useEffect, useRef } from 'react';
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
  Smile,
  Sliders,
  DollarSign,
  Layers,
  Thermometer,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { ArlaRecipePackModal } from '@/components/arla/ArlaRecipePackModal';
import { getSiteUrl } from '@/lib/discovery';

type DialState = 'cook' | 'whip' | 'drink';

export default function ArlaCampaignHub() {
  // Dual-State Culinary Dial Slider position (0 = Cook/Hot, 50 = Drink/Punch, 100 = Whip/Cold)
  const [dialPos, setDialPos] = useState<number>(0);
  const [dialState, setDialState] = useState<DialState>('cook');

  // Interactive Taste-Off Ballot State
  const [ballotVote, setBallotVote] = useState<'pasta' | 'mousse' | null>(null);
  const [stampActive, setStampActive] = useState<boolean>(false);
  const [ticketSerial, setTicketSerial] = useState<string>('');
  const [pastaCount, setPastaCount] = useState<number>(178);
  const [mousseCount, setMousseCount] = useState<number>(154);

  // Grocery Savings Basket Calculator
  const [cartonQty, setCartonQty] = useState<number>(2);

  // Recipe Pack Modal
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [activeRecipeTab, setActiveRecipeTab] = useState<number>(0);

  // Sound / Micro-feedback mock
  const playHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(25); } catch { /* ignore */ }
    }
  };

  // Sync dial position with mode
  const handleDialChange = (val: number) => {
    setDialPos(val);
    playHaptic();
    if (val < 33) setDialState('cook');
    else if (val > 66) setDialState('whip');
    else setDialState('drink');
  };

  const handleVote = (choice: 'pasta' | 'mousse') => {
    if (ballotVote) return;
    playHaptic();
    setStampActive(true);
    setBallotVote(choice);
    const randSerial = 'ARLA-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-KGN';
    setTicketSerial(randSerial);

    if (choice === 'pasta') {
      setPastaCount((p) => p + 1);
      toast.success('PASSPORT STAMPED: Team Spicy Rasta Pasta! 🍝 (+50 Pts)');
    } else {
      setMousseCount((m) => m + 1);
      toast.success('PASSPORT STAMPED: Team Chocolate Chip Mousse! 🍫 (+50 Pts)');
    }

    setTimeout(() => setStampActive(false), 800);
  };

  const totalBallots = pastaCount + mousseCount;
  const pastaShare = Math.round((pastaCount / totalBallots) * 100);
  const mousseShare = 100 - pastaShare;

  // Grocery Savings Math
  const regPriceEach = 2700;
  const roadshowPriceEach = 1200;
  const regTotal = cartonQty * regPriceEach;
  const roadshowTotal = cartonQty * roadshowPriceEach;
  const savingsTotal = regTotal - roadshowTotal;
  const mealsCooked = cartonQty * 2;
  const dessertBowls = cartonQty * 1;

  const copyShareLink = () => {
    const url = `${window.location.origin}/campaigns/arla-whip-and-cook?utm_source=promorang&utm_medium=tasteoff_share&utm_campaign=arla_pricesmart`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  const shareWhatsApp = () => {
    const text = `🔥 Hot Rasta Pasta vs ❄️ Cold Chocolate Mousse! Taste them free at PriceSmart Jamaica & cast your vote here: ${window.location.origin}/campaigns/arla-whip-and-cook`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#0d0c0a] text-[#f4efe5] selection:bg-[#ff5a1f] selection:text-white font-sans pb-36 relative overflow-x-hidden">
      <SEO
        title="PROMORANG × ARLA PRO — Stop Buying Two Different Creams"
        description="Cook spicy hot dinners and whip fluffy cold desserts from one single carton. Free sampling roadshow active daily at PriceSmart Jamaica (111 Red Hills Road, 10am–8pm). Get 1L for J$1,200."
        image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200"
        url={getSiteUrl("/campaigns/arla-whip-and-cook")}
      />

      {/* TOP TICKER TAPE */}
      <div className="bg-[#ff5a1f] text-black font-mono font-black text-xs uppercase tracking-wider py-2.5 px-4 border-b-2 border-black flex items-center justify-between overflow-x-auto gap-4 z-40 relative">
        <div className="flex items-center gap-3 shrink-0">
          <span className="h-2.5 w-2.5 bg-black rounded-full animate-ping" />
          <span>FREE TASTING BOOTH OPEN TODAY AT PRICESMART (111 RED HILLS ROAD) · 10:00 AM – 8:00 PM</span>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-bold">
          <span className="bg-black text-[#ffcf38] px-2.5 py-0.5 text-[11px]">ROADSHOW SPECIAL: J$1,200</span>
          <Link to="/proposals/arla-pro" className="hover:underline text-[10px]">
            FOR BUSINESS / BRAND PROPOSAL →
          </Link>
        </div>
      </div>

      {/* 1. HERO WITH THE INTERACTIVE DUAL-STATE CULINARY DIAL */}
      <section className="relative border-b-2 border-black/40 px-4 sm:px-8 pt-10 pb-16 bg-gradient-to-b from-[#181512] via-[#11100e] to-[#0d0c0a]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#ff5a1f] font-black uppercase tracking-widest">
              <span>PROMORANG EXPERIMENTAL</span>
              <span className="text-white/30">/</span>
              <span>ARLA PRO ROADSHOW</span>
              <span className="text-white/30">/</span>
              <span className="text-[#ffcf38]">KINGSTON 19</span>
            </div>

            <div className="flex items-center gap-2 bg-black/60 border border-white/15 px-3 py-1 text-[11px] text-[#25D366]">
              <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>CHEF SAMPLING ACTIVE NOW (10AM - 8PM)</span>
            </div>
          </div>

          {/* Core Title */}
          <div className="space-y-3 max-w-4xl">
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] text-white">
              Stop Buying Two <i className="text-[#ff5a1f] not-italic">Different</i> Creams.
            </h1>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcf38] leading-tight">
              One carton cooks velvety hot dinners and whips firm dessert peaks without spoiling or curdling.
            </p>
            <p className="text-sm sm:text-base text-[#d0c5b9] leading-relaxed max-w-2xl">
              Ever had heavy cream split into oily water when cooked with Scotch bonnet? Or bought whipping cream that melted in Jamaican heat? Arla Pro Whip & Cook 28% solves both in one single 1-litre carton.
            </p>
          </div>

          {/* ⚡️ BESPOKE UI COMPONENT 1: THE DUAL-STATE CULINARY SIMULATOR */}
          <div className="rounded-none border-2 border-black bg-[#161412] p-6 sm:p-8 shadow-[12px_12px_0_#ff5a1f] space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black/60 pb-4 font-mono">
              <div>
                <span className="text-[#ff5a1f] font-black uppercase text-xs tracking-widest block">
                  [ INTERACTIVE CULINARY SIMULATOR ]
                </span>
                <span className="text-white text-sm font-bold">Drag the Temperature Slider to test what happens in your pan vs bowl:</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1 font-mono font-black text-xs uppercase border ${
                  dialState === 'cook'
                    ? 'bg-orange-600 text-black border-black shadow-[2px_2px_0_#ffcf38]'
                    : dialState === 'whip'
                    ? 'bg-emerald-500 text-black border-black shadow-[2px_2px_0_#ffcf38]'
                    : 'bg-purple-500 text-black border-black shadow-[2px_2px_0_#ffcf38]'
                }`}>
                  {dialState === 'cook' ? '🔥 100°C HOT PAN (COOK)' : dialState === 'whip' ? '❄️ 4°C COLD WHISK (WHIP)' : '🥤 20°C BLEND (PUNCH)'}
                </span>
              </div>
            </div>

            {/* Tactile Range Slider */}
            <div className="space-y-2 font-mono">
              <div className="flex justify-between text-xs font-bold text-[#898071]">
                <button onClick={() => handleDialChange(0)} className="hover:text-white cursor-pointer">
                  ◀ 01. HOT COOKING (0° - 100°C)
                </button>
                <button onClick={() => handleDialChange(50)} className="hover:text-white cursor-pointer">
                  02. DRINK BLEND
                </button>
                <button onClick={() => handleDialChange(100)} className="hover:text-white cursor-pointer">
                  03. COLD WHIPPING (4°C) ▶
                </button>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={dialPos}
                onChange={(e) => handleDialChange(Number(e.target.value))}
                className="w-full h-4 bg-black border-2 border-black rounded-none appearance-none cursor-pointer accent-[#ff5a1f]"
              />
            </div>

            {/* Dynamic Stage Canvas */}
            <div className={`p-6 border-2 border-black transition-all duration-300 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-center ${
              dialState === 'cook'
                ? 'bg-gradient-to-r from-[#2e1308] via-[#1a0f0a] to-black border-orange-600'
                : dialState === 'whip'
                ? 'bg-gradient-to-r from-[#072417] via-[#0b1a13] to-black border-emerald-500'
                : 'bg-gradient-to-r from-[#200f28] via-[#130b19] to-black border-purple-500'
            }`}>
              
              {/* Left Photo & Real Dish View */}
              <div className="relative border-2 border-black aspect-video sm:aspect-[4/3] overflow-hidden bg-black shadow-[6px_6px_0_#000]">
                <img
                  src={
                    dialState === 'cook'
                      ? 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800'
                      : dialState === 'whip'
                      ? 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
                      : 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=800'
                  }
                  alt="Application View"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black text-[#ffcf38] font-mono font-black text-[10px] uppercase px-2.5 py-1 border border-white/20">
                  {dialState === 'cook' ? 'DISH: SPICY RASTA PASTA' : dialState === 'whip' ? 'DISH: CHOCOLATE CHIP MOUSSE' : 'DISH: STRONG BACK PUNCH'}
                </div>
              </div>

              {/* Right Live Culinary Telemetry */}
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <h3 className="font-serif text-3xl font-black text-white font-sans">
                    {dialState === 'cook'
                      ? 'Boil & Pepper Stability (Hot Dinner)'
                      : dialState === 'whip'
                      ? '3.5× Expansion & Firm Peaks (Dessert)'
                      : 'Smooth Stout Emulsion (Jamaican Punch)'}
                  </h3>
                  <p className="text-[#c9c0b5] text-xs leading-relaxed mt-1">
                    {dialState === 'cook'
                      ? 'Simmered over direct heat with Scotch bonnet pepper, scallions, and bell peppers. Will never split, curdle, or release greasy oil.'
                      : dialState === 'whip'
                      ? 'Whips to 350% of its starting volume. Holds its firm shape on cakes and mousses even in warm Jamaican kitchen temperatures.'
                      : 'Blends seamlessly with Dragon Stout, peanut butter, and condensed milk without curdling or separating over ice.'}
                  </p>
                </div>

                {/* 3 Metric Gauges */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 bg-black/70 border border-white/10">
                    <span className="text-[9px] text-white/40 block">HEAT TOLERANCE</span>
                    <strong className={`text-xs ${dialState === 'cook' ? 'text-orange-400' : 'text-white'}`}>
                      {dialState === 'cook' ? '100°C (Boil Safe)' : 'Up to 100°C'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-black/70 border border-white/10">
                    <span className="text-[9px] text-white/40 block">VOLUME YIELD</span>
                    <strong className={`text-xs ${dialState === 'whip' ? 'text-emerald-400' : 'text-white'}`}>
                      {dialState === 'whip' ? '3.5× (350%)' : '1.0× Dense'}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-black/70 border border-white/10">
                    <span className="text-[9px] text-white/40 block">CURDLE RISK</span>
                    <strong className="text-xs text-[#25D366]">0% (Zero Curdling)</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => document.getElementById('ballot-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-5 py-2.5 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider border border-black shadow-[3px_3px_0_#ffcf38] hover:translate-x-[1px] hover:translate-y-[1px] transition cursor-pointer"
                  >
                    VOTE FOR THIS DISH IN TASTE-OFF ↓
                  </button>
                  <button
                    onClick={() => setRecipeModalOpen(true)}
                    className="px-4 py-2.5 bg-white/10 text-white font-bold uppercase text-xs border border-white/20 hover:bg-white/20 transition cursor-pointer"
                  >
                    GET RECIPE →
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 2. ⚡️ BESPOKE UI COMPONENT 2: THE PHYSICAL STAMPED TASTING BALLOT */}
      <section id="ballot-section" className="px-4 sm:px-8 py-20 bg-[#141210] border-b-2 border-black relative">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black pb-6">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#ff5a1f]">
                OFFICIAL ROADSHOW CITIZEN BALLOT
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl font-black text-white mt-1">
                Which dish won your vote at PriceSmart?
              </h2>
              <p className="text-xs text-[#d0c5b9] font-mono mt-1">
                Tap your winner to physically stamp your roadshow ballot and lock in your vote.
              </p>
            </div>

            <div className="font-mono bg-black border-2 border-black p-4 text-right shrink-0 shadow-[4px_4px_0_#ff5a1f]">
              <span className="text-3xl font-black text-[#ffcf38]">{totalBallots}</span>
              <p className="text-[10px] font-bold text-white/50 uppercase">Stamped Ballots Cast</p>
            </div>
          </div>

          {/* Physical Stamped Ballot Board */}
          <div className="bg-[#f4efe5] text-[#11100e] p-6 sm:p-10 border-2 border-black shadow-[16px_16px_0_#ff5a1f] relative overflow-hidden font-mono">
            
            {/* Ink Stamp Overlay Effect when voted */}
            {ballotVote && (
              <div className="absolute top-8 right-8 z-20 pointer-events-none transform rotate-[-12deg] animate-in zoom-in-50 duration-300">
                <div className="border-4 border-dashed border-red-700 text-red-700 font-mono font-black text-xl sm:text-2xl px-6 py-2 uppercase tracking-widest bg-red-100/90 shadow-lg">
                  ★ VERIFIED TASTE VOTE STAMPED ★
                  <span className="block text-[10px] text-center">{ticketSerial}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center border-b-2 border-black pb-4 text-xs font-black">
              <span>KINGSTON SAMPLING BALLOT № {ticketSerial || '0823-PENDING'}</span>
              <span className="bg-black text-white px-2.5 py-1">111 RED HILLS ROAD</span>
            </div>

            {/* Contender 1 vs Contender 2 Split Cards */}
            <div className="grid gap-6 md:grid-cols-2 my-8">
              
              {/* Option A: Spicy Rasta Pasta */}
              <div
                onClick={() => handleVote('pasta')}
                className={`p-6 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  ballotVote === 'pasta'
                    ? 'border-black bg-[#ff5a1f] text-black shadow-[8px_8px_0_#000]'
                    : 'border-black/30 bg-white hover:border-black hover:shadow-[4px_4px_0_#000]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="bg-black text-white px-2 py-0.5">CONTENDER 01</span>
                    <span>SAVOURY / DINNER</span>
                  </div>

                  <div className="border-2 border-black aspect-video overflow-hidden bg-black">
                    <img
                      src="https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&q=80&w=800"
                      alt="Rasta Pasta"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="font-serif text-3xl font-black font-sans">🍝 Spicy Rasta Pasta</h3>
                  <p className="text-xs text-[#443e37] leading-relaxed">
                    Rich penne in a hot Scotch bonnet, garlic, scallion, and sweet bell pepper Arla reduction.
                  </p>
                </div>

                <div className="pt-6 space-y-3">
                  {ballotVote && (
                    <div className="space-y-1 text-xs font-bold">
                      <div className="flex justify-between">
                        <span>{pastaShare}% FAVOURITE</span>
                        <span>{pastaCount} VOTES</span>
                      </div>
                      <div className="h-3 w-full bg-black/20 border border-black overflow-hidden">
                        <div className="h-full bg-black transition-all duration-500" style={{ width: `${pastaShare}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!!ballotVote}
                    className={`w-full py-3.5 text-xs font-black uppercase tracking-wider border-2 border-black cursor-pointer transition ${
                      ballotVote === 'pasta'
                        ? 'bg-black text-[#ffcf38]'
                        : 'bg-black text-white hover:bg-[#ff5a1f] hover:text-black'
                    }`}
                  >
                    {ballotVote === 'pasta' ? '✓ STAMPED AS YOUR WINNER' : 'STAMP BALLOT FOR RASTA PASTA'}
                  </button>
                </div>
              </div>

              {/* Option B: Chocolate Chip Mousse */}
              <div
                onClick={() => handleVote('mousse')}
                className={`p-6 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  ballotVote === 'mousse'
                    ? 'border-black bg-[#ffcf38] text-black shadow-[8px_8px_0_#000]'
                    : 'border-black/30 bg-white hover:border-black hover:shadow-[4px_4px_0_#000]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="bg-black text-white px-2 py-0.5">CONTENDER 02</span>
                    <span>SWEET / DESSERT</span>
                  </div>

                  <div className="border-2 border-black aspect-video overflow-hidden bg-black">
                    <img
                      src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800"
                      alt="Chocolate Chip Mousse"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="font-serif text-3xl font-black font-sans">🍫 Chocolate Chip Mousse</h3>
                  <p className="text-xs text-[#443e37] leading-relaxed">
                    Fluffy, airy dessert with firm peaks whipped from the exact same cream in 5 minutes.
                  </p>
                </div>

                <div className="pt-6 space-y-3">
                  {ballotVote && (
                    <div className="space-y-1 text-xs font-bold">
                      <div className="flex justify-between">
                        <span>{mousseShare}% FAVOURITE</span>
                        <span>{mousseCount} VOTES</span>
                      </div>
                      <div className="h-3 w-full bg-black/20 border border-black overflow-hidden">
                        <div className="h-full bg-black transition-all duration-500" style={{ width: `${mousseShare}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!!ballotVote}
                    className={`w-full py-3.5 text-xs font-black uppercase tracking-wider border-2 border-black cursor-pointer transition ${
                      ballotVote === 'mousse'
                        ? 'bg-black text-[#ffcf38]'
                        : 'bg-black text-white hover:bg-[#ffcf38] hover:text-black'
                    }`}
                  >
                    {ballotVote === 'mousse' ? '✓ STAMPED AS YOUR WINNER' : 'STAMP BALLOT FOR CHOCOLATE MOUSSE'}
                  </button>
                </div>
              </div>

            </div>

            {/* Ballot Footer Sharing Bar */}
            <div className="border-t-2 border-black pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-black text-black block">PASSPORT CITIZEN ACTION:</span>
                <p className="text-[#554e45]">Invite family or foodie friends to sample and vote before 8:00 PM.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={shareWhatsApp}
                  className="px-4 py-2 bg-[#25D366] text-black font-black uppercase text-xs border border-black shadow-[2px_2px_0_#000] cursor-pointer"
                >
                  SHARE TO WHATSAPP
                </button>
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-black text-white font-black uppercase text-xs border border-black hover:bg-neutral-800 cursor-pointer"
                >
                  COPY BALLOT LINK
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. ⚡️ BESPOKE UI COMPONENT 3: THE PRICESMART GROCERY BASKET CALCULATOR */}
      <section className="px-4 sm:px-8 py-20 bg-[#11100e] border-b-2 border-black">
        <div className="max-w-5xl mx-auto space-y-10 font-mono">
          
          <div className="text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffcf38]">
              HOUSEHOLD BUDGET IMPACT
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-black text-white font-sans">
              Interactive Grocery Basket Calculator
            </h2>
            <p className="text-xs text-white/60">
              See what switching to Arla Pro at PriceSmart this week saves your household budget:
            </p>
          </div>

          <div className="bg-[#181512] border-2 border-white/20 p-6 sm:p-10 shadow-[12px_12px_0_#ff5a1f] space-y-8">
            
            {/* Quantity Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#ff5a1f]">CARTONS TO BUY THIS WEEK:</span>
                <span className="text-2xl font-black text-white bg-black px-4 py-1 border border-white/20">
                  {cartonQty} CARTON{cartonQty > 1 ? 'S' : ''} (1L EACH)
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={cartonQty}
                onChange={(e) => {
                  setCartonQty(Number(e.target.value));
                  playHaptic();
                }}
                className="w-full h-4 bg-black border border-white/20 appearance-none cursor-pointer accent-[#25D366]"
              />

              <div className="flex justify-between text-[10px] text-white/40">
                <span>1 Carton (1-2 Dinners)</span>
                <span>4 Cartons (Family Weekly)</span>
                <span>8 Cartons (Bakers & Caterers)</span>
              </div>
            </div>

            {/* Calculated Yield Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-b border-white/10 py-6">
              <div className="p-3 bg-black/60 border border-white/10">
                <span className="text-[9px] text-white/40 block">FAMILY DINNERS</span>
                <strong className="text-xl font-black text-white font-sans">{mealsCooked} Pots</strong>
                <span className="text-[10px] text-white/50 block mt-0.5">Pasta / Chicken</span>
              </div>

              <div className="p-3 bg-black/60 border border-white/10">
                <span className="text-[9px] text-white/40 block">DESSERT BOWLS</span>
                <strong className="text-xl font-black text-white font-sans">{dessertBowls} Bowls</strong>
                <span className="text-[10px] text-white/50 block mt-0.5">Mousse / Cheesecake</span>
              </div>

              <div className="p-3 bg-black/60 border border-white/10">
                <span className="text-[9px] text-white/40 block">REGULAR STORE COST</span>
                <strong className="text-xl font-black text-red-400 font-sans line-through">J${regTotal.toLocaleString()}</strong>
                <span className="text-[10px] text-white/50 block mt-0.5">Separate Creams</span>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40">
                <span className="text-[9px] text-emerald-400 block font-bold">PRICESMART ROADSHOW</span>
                <strong className="text-2xl font-black text-emerald-400 font-sans">J${roadshowTotal.toLocaleString()}</strong>
                <span className="text-[10px] text-emerald-300 block font-bold mt-0.5">J$1,200 per 1L</span>
              </div>
            </div>

            {/* Net Savings Callout */}
            <div className="p-5 bg-black border-2 border-[#25D366] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">
                  YOUR IMMEDIATE GROCERY SAVINGS
                </span>
                <p className="text-3xl font-black text-white font-serif font-sans mt-0.5">
                  Save J${savingsTotal.toLocaleString()} In Your Pocket (56%)
                </p>
              </div>

              <button
                onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3.5 bg-[#25D366] text-black font-black uppercase text-xs tracking-wider border border-black shadow-[3px_3px_0_#fff] cursor-pointer shrink-0"
              >
                GRAB AT PRICESMART TODAY →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 4. ⚡️ BESPOKE UI COMPONENT 4: TEAR-OFF PERFORATED RECIPE DRAWER */}
      <section className="px-4 sm:px-8 py-20 bg-[#161412] border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-8 font-mono">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/20 pb-6">
            <div>
              <p className="text-xs font-black uppercase text-[#ffcf38] tracking-widest">
                DIGITAL VALUE RECEIPT / LEAD MAGNET
              </p>
              <h2 className="font-serif text-4xl sm:text-6xl font-black text-white font-sans mt-1">
                5 Ways to Whip & Cook with Arla
              </h2>
              <p className="text-xs text-[#d0c5b9] mt-1">
                Step-by-step recipes built for Jamaican pantries using Arla Pro Whip & Cook 28%.
              </p>
            </div>

            <button
              onClick={() => setRecipeModalOpen(true)}
              className="px-6 py-3.5 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider border border-black shadow-[4px_4px_0_#ffcf38] cursor-pointer"
            >
              OPEN FULL RECIPE PACK (FREE) →
            </button>
          </div>

          {/* 5 Perforated Index Tab Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { id: 0, title: 'Roadshow Rasta Pasta', tag: 'DINNER', time: '20 MIN', temp: '🔥 100°C', icon: Flame, note: 'Velvety Scotch bonnet reduction.' },
              { id: 1, title: 'Chocolate Chip Mousse', tag: 'DESSERT', time: '5 MIN', temp: '❄️ 4°C', icon: Snowflake, note: '3.5× whipped volume expansion.' },
              { id: 2, title: 'Garlic Pan Chicken', tag: 'DINNER', time: '25 MIN', temp: '🔥 90°C', icon: Flame, note: 'Pan drippings + garlic sauce.' },
              { id: 3, title: 'Strawberry Cheesecake', tag: 'NO-BAKE', time: '15 MIN', temp: '❄️ 4°C', icon: Snowflake, note: 'Firm cream cheese dessert cups.' },
              { id: 4, title: 'Strong Back Punch', tag: 'BEVERAGE', time: '5 MIN', temp: '🥤 20°C', icon: Coffee, note: 'Dragon Stout, peanut, vanilla.' }
            ].map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setRecipeModalOpen(true)}
                className="bg-[#f4efe5] text-[#11100e] p-5 border-2 border-black shadow-[6px_6px_0_#ff5a1f] hover:translate-y-[-2px] transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-2 border-b-2 border-dashed border-black/30 pb-3">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="bg-black text-white px-1.5 py-0.5">RECIPE 0{recipe.id + 1}</span>
                    <span className="text-[#ff5a1f] font-bold">{recipe.tag}</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold font-sans">{recipe.title}</h4>
                </div>

                <div className="pt-3 space-y-2 text-[10px]">
                  <p className="text-[#554e45] leading-snug">{recipe.note}</p>
                  <div className="flex justify-between font-bold text-black border-t border-black/15 pt-2">
                    <span>{recipe.time}</span>
                    <span>{recipe.temp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. ROADSHOW RADAR & COORDINATES */}
      <section id="location-section" className="px-4 sm:px-8 py-20 bg-[#11100e] border-b-2 border-black">
        <div className="max-w-7xl mx-auto space-y-8 font-mono">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/20 pb-6">
            <div>
              <span className="text-xs font-black uppercase text-[#ff5a1f] tracking-widest">COORDINATES & SAMPLING STATION</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-white font-sans mt-1">PriceSmart Jamaica</h2>
              <p className="text-xs text-white/60 mt-1">111 Red Hills Road, Kingston 19 · Daily 10:00 AM – 8:00 PM</p>
            </div>
            <Link
              to="/moments/00000000-0000-0000-0002-000000000060"
              className="px-6 py-3 bg-white text-black font-black uppercase text-xs tracking-wider border border-black hover:bg-[#ffcf38] transition"
            >
              VIEW EVENT ON PROMORANG →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-black border border-white/20 space-y-1">
              <span className="text-[10px] text-[#ff5a1f] font-bold">STATION 01</span>
              <h4 className="text-sm font-bold text-white font-serif font-sans">Hot Rasta Pasta</h4>
              <p className="text-[11px] text-white/60">Try fresh from the chef skillet (+40 Pts).</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1">
              <span className="text-[10px] text-[#ffcf38] font-bold">STATION 02</span>
              <h4 className="text-sm font-bold text-white font-serif font-sans">Whipped Mousse</h4>
              <p className="text-[11px] text-white/60">Sample the fluffy cold dessert (+40 Pts).</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1">
              <span className="text-[10px] text-[#25D366] font-bold">STATION 03</span>
              <h4 className="text-sm font-bold text-white font-serif font-sans">Stamp Passport</h4>
              <p className="text-[11px] text-white/60">Vote online to unlock 5 recipes (+50 Pts).</p>
            </div>
            <div className="p-4 bg-black border border-white/20 space-y-1">
              <span className="text-[10px] text-[#ff5a1f] font-bold">STATION 04</span>
              <h4 className="text-sm font-bold text-white font-serif font-sans">Get J$1,200 Cartons</h4>
              <p className="text-[11px] text-white/60">Promoters verify purchase on site (+60 Pts).</p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-8 py-16 bg-black text-center font-mono space-y-6 border-t-2 border-black">
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-xs text-[#ff5a1f] font-black uppercase tracking-widest">ARLA PRO × PROMORANG</p>
          <h3 className="font-serif text-3xl sm:text-4xl font-black text-white font-sans">Turning Free Samples Into Repeat Buyers</h3>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/proposals/arla-pro"
            className="px-6 py-3 bg-[#ff5a1f] text-black font-black uppercase text-xs tracking-wider border border-black shadow-[4px_4px_0_#ffcf38]"
          >
            ARLA COMMERCIAL PROPOSAL DECK →
          </Link>
        </div>
      </footer>

      {/* Recipe Pack Reader Modal */}
      <ArlaRecipePackModal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        unlocked={true}
      />
    </main>
  );
}
