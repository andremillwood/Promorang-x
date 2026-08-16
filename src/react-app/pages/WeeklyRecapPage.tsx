import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  Key, 
  CheckCircle2, 
  Share2, 
  ArrowRight, 
  Users, 
  Store
} from 'lucide-react';

export default function WeeklyRecapPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* Header Banner */}
      <div className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/radar')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-gray-950 text-lg shadow-md">
              P
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">PROMORANG KINGSTON</span>
              <span className="text-[9px] text-orange-400 font-bold block uppercase tracking-widest">Weekly Community Proof</span>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-xl border border-gray-700 flex items-center space-x-1.5 transition-all"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Recap'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Title Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-[11px] font-black uppercase tracking-widest inline-block mb-3">
            Sunday Community Proof • Edition #01
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
            This Week on <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Promorang</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            Here is what 143 Kingston participants, creators, and venues unlocked, decided, and experienced over the last 7 days.
          </p>
        </div>

        {/* 4 Stat Proof Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-2xl text-center">
            <Users className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
            <div className="text-2xl font-black text-white">143</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Active Patrons</div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-2xl text-center">
            <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <div className="text-2xl font-black text-white">44</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Discovery Votes</div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-2xl text-center">
            <Key className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <div className="text-2xl font-black text-white">15</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Keys Unlocked</div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-4 rounded-2xl text-center">
            <CheckCircle2 className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
            <div className="text-2xl font-black text-white">11</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Verified Scans</div>
          </div>
        </div>

        {/* Major Story 1: What Community Caused to Happen */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-orange-500/30 p-6 md:p-8 rounded-3xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
            <Flame className="w-4 h-4" />
            <span>Winning Demand Outcome</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white mb-2">
            The Community Voted: Secret Jamaican Food Crawl
          </h2>
          
          <p className="text-xs md:text-sm text-gray-300 mb-6 leading-relaxed">
            With 22 votes in the Barbican area, our Scene Concierge is partnering with 3 local restaurants to host a curated 15-person tasting crawl this coming Friday.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/radar')}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center space-x-1.5 transition-all"
            >
              <span>Get Priority Alert on Wednesday</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-gray-500 font-medium">Limited to 15 PromoKeys</span>
          </div>
        </div>

        {/* Two Column Grid: Top Discoverer & Partner Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Contributor Spotlight */}
          <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
              <Trophy className="w-4 h-4" />
              <span>Top Discoverer of the Week</span>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-400 flex items-center justify-center font-black text-white text-lg">
                JS
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">@jamaican_eats_scout</h3>
                <span className="text-[11px] text-gray-400">Founding Member #014 • 850 PromoPoints</span>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Nominated 3 hidden gems in Kingston After Dark and captured 4 verified UGC video reviews.
            </p>
          </div>

          {/* Partner Spotlight */}
          <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
              <Store className="w-4 h-4" />
              <span>Partner of the Week</span>
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-lg">
                MB
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Marketplace Bistro</h3>
                <span className="text-[11px] text-gray-400">Constant Spring Rd • Off-Peak Partner</span>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Allocated 15 off-peak PromoKeys for Friday night; verified 11 on-site visits with 4.8/5.0 patron ratings.
            </p>
          </div>
        </div>

        {/* Next Week's Rhythm Callout */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center">
          <h3 className="text-base font-extrabold text-white mb-2">What Happens Next Week?</h3>
          <p className="text-xs text-gray-400 max-w-lg mx-auto mb-4">
            • <strong>Monday</strong>: Discovery Question #02 Drops<br />
            • <strong>Wednesday</strong>: 15 Food Crawl PromoKeys Released<br />
            • <strong>Friday</strong>: Live Activations in Barbican & New Kingston
          </p>
          <button
            onClick={() => navigate('/radar')}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl border border-gray-700"
          >
            Explore Active Radar
          </button>
        </div>

      </div>
    </div>
  );
}
