import React, { useState } from 'react';
import { User, Store, Sparkles, Building2, CheckCircle2, ArrowRight, ShieldCheck, Gift } from 'lucide-react';

type Persona = 'consumer' | 'merchant' | 'creator' | 'brand';

interface InteractiveOnboardingWizardProps {
  onComplete: (persona: Persona, data: any) => void;
}

export const InteractiveOnboardingWizard: React.FC<InteractiveOnboardingWizardProps> = ({ onComplete }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>('consumer');
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    category: 'Dining',
    socialHandle: '',
  });

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete(selectedPersona, formData);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white">
      {/* Header Progress */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Step {step} of 2</span>
          <h2 className="text-xl font-extrabold text-white">
            {step === 1 ? 'Select Your Primary Role' : `Quick ${selectedPersona.toUpperCase()} Setup`}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-8 h-2 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-slate-800'}`} />
          <div className={`w-8 h-2 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-slate-800'}`} />
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Consumer Card */}
          <div
            onClick={() => setSelectedPersona('consumer')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPersona === 'consumer'
                ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="p-3 bg-purple-500/20 w-fit rounded-xl text-purple-400 mb-3">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Local Explorer</h3>
            <p className="text-xs text-gray-400 mt-1">Discover drops, earn cashback, and unlock group deals.</p>
            <span className="inline-block mt-3 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
              🎁 Instant +100 Tokens
            </span>
          </div>

          {/* Merchant Card */}
          <div
            onClick={() => setSelectedPersona('merchant')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPersona === 'merchant'
                ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="p-3 bg-amber-500/20 w-fit rounded-xl text-amber-400 mb-3">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Local Merchant</h3>
            <p className="text-xs text-gray-400 mt-1">Drive foot-traffic during slow hours & launch tipping drops.</p>
            <span className="inline-block mt-3 px-2.5 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">
              🚀 $50 Free Map Credit
            </span>
          </div>

          {/* Creator Card */}
          <div
            onClick={() => setSelectedPersona('creator')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPersona === 'creator'
                ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="p-3 bg-rose-500/20 w-fit rounded-xl text-rose-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Creator & Host</h3>
            <p className="text-xs text-gray-400 mt-1">Share-to-Earn (Promoshare) and monetize your local audience.</p>
            <span className="inline-block mt-3 px-2.5 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded-full">
              💸 15% Tier Commission
            </span>
          </div>

          {/* Brand Card */}
          <div
            onClick={() => setSelectedPersona('brand')}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPersona === 'brand'
                ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="p-3 bg-blue-500/20 w-fit rounded-xl text-blue-400 mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Corporate Brand</h3>
            <p className="text-xs text-gray-400 mt-1">Sponsor multi-city drops & capture real-time foot analytics.</p>
            <span className="inline-block mt-3 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full">
              📊 Analytics Portal
            </span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Your Full Name or Display Handle:</label>
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {selectedPersona === 'merchant' && (
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Business / Store Name:</label>
              <input
                type="text"
                placeholder="e.g. Artisan Coffee Roasters"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {selectedPersona === 'creator' && (
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Primary Social Handle (@instagram / @tiktok):</label>
              <input
                type="text"
                placeholder="@alex_promorang"
                value={formData.socialHandle}
                onChange={(e) => setFormData({ ...formData, socialHandle: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleNext}
        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl transition"
      >
        <span>{step === 1 ? 'Continue to Quick Setup' : 'Complete Setup & Unlock Bonus'}</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
