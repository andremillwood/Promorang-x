import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
  Users, 
  Video, 
  Store, 
  Calendar, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Star,
  Target,
  Zap
} from 'lucide-react';

type StakeholderType = 'participant' | 'creator' | 'venue' | 'host' | 'brand';

export default function JoinFunnelsPage() {
  const { stakeholder } = useParams<{ stakeholder?: string }>();
  const navigate = useNavigate();
  
  const activeTab: StakeholderType = (stakeholder as StakeholderType) || 'participant';
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleOrCategory: '',
    objective: ''
  });

  const handleTabChange = (type: StakeholderType) => {
    setSubmitted(false);
    navigate(`/join/${type}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* Top Banner Navigation */}
      <div className="border-b border-gray-800/80 bg-gray-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-gray-950 text-xl shadow-lg shadow-orange-500/20">
              P
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">PROMORANG</span>
              <span className="text-[10px] text-orange-400 font-bold block uppercase tracking-widest">Market Activation Network</span>
            </div>
          </div>

          {/* Stakeholder Switcher */}
          <div className="flex items-center space-x-1 bg-gray-900 p-1.5 rounded-2xl border border-gray-800 overflow-x-auto">
            <button
              onClick={() => handleTabChange('participant')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'participant' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Participants
            </button>
            <button
              onClick={() => handleTabChange('creator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'creator' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Creators
            </button>
            <button
              onClick={() => handleTabChange('venue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'venue' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Venues & Places
            </button>
            <button
              onClick={() => handleTabChange('host')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'host' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Moment Owners
            </button>
            <button
              onClick={() => handleTabChange('brand')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'brand' ? 'bg-amber-500 text-gray-950 shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Brands
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 pt-10">
        
        {/* Dynamic Funnel Hero Section */}
        {activeTab === 'participant' && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fadeIn">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4">
              Founding Participant Access
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Find something worth doing. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                Participate. Unlock access.
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Join the Founding 100 in Kingston. Get VIP access to hidden gems, exclusive PromoKeys, and earn rewards just for experiencing your city.
            </p>
          </div>
        )}

        {activeTab === 'creator' && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fadeIn">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4">
              Promorang Creator Guild
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Turn your local discoveries into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                Paid Assignments & Brand Gigs
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              We match Food Scouts, Nightlife Correspondents, and Storytellers directly with paying venues, events, and brand campaigns.
            </p>
          </div>
        )}

        {activeTab === 'venue' && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fadeIn">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4">
              Venue & Merchant Growth Engine
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Give people a reason to move. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Fill slow days with high-value foot traffic.
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Convert complimentary perks and off-peak table capacity into guaranteed customer visits and verified reviews—without upfront ad costs.
            </p>
          </div>
        )}

        {activeTab === 'host' && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fadeIn">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4">
              Moment Owner Activation
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Turn passive event listings into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Confirmed RSVPs & Ticket Sales
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Build structured participation architecture around your concert, popup, brunch, or workshop. Drive referral loops and UGC content.
            </p>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="text-center max-w-3xl mx-auto mb-12 animate-fadeIn">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-4">
              Brand Activation & Cultural Intelligence
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Stop buying empty impressions. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                Drive measurable consumer action.
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Integrate your brand into active Scenes through sponsored Discoveries, product sampling missions, and creator challenge campaigns.
            </p>
          </div>
        )}

        {/* Value Proposition Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-2 text-base">Hormozi Value Equation</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              High perceived value outcome with minimal effort and immediate turn-around.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-2 text-base">Behavioral Scarcity</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Exclusive PromoKeys and Founding Member status create genuine, high-utility scarcity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-2 text-base">Attributed Proof</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Track real-world foot traffic, redemptions, and user actions transparently.
            </p>
          </div>
        </div>

        {/* Action Onboarding Form Card */}
        <div className="max-w-xl mx-auto bg-gradient-to-b from-gray-900 to-gray-950 p-8 rounded-3xl border border-gray-800 shadow-2xl">
          {submitted ? (
            <div className="text-center py-8 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Application Received!</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Welcome to the Promorang Market Activation Network. Our Scene Concierge team will reach out to you shortly.
              </p>
              <button
                onClick={() => navigate('/home')}
                className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Explore Active Scenes
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-2 text-center">
                Get Started as a {activeTab.toUpperCase()}
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name / Organization</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Andre Millwood"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">WhatsApp / Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (876) 000-0000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Primary Objective / Focus</label>
                <textarea
                  rows={3}
                  value={formData.objective}
                  onChange={e => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="What outcome would make this partnership successful for you?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Submit Onboarding Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
