import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Zap, Trophy, ShieldCheck } from 'lucide-react';

interface StakeholderActivationHubProps {
  persona: 'consumer' | 'merchant' | 'creator' | 'brand';
  onActionClick: (actionId: string) => void;
}

export const StakeholderActivationHub: React.FC<StakeholderActivationHubProps> = ({
  persona,
  onActionClick,
}) => {
  const getPersonaItems = () => {
    switch (persona) {
      case 'merchant':
        return [
          { id: 'm1', title: 'Create 1st Tipping Drop', desc: 'Set minimum 10 claims to guarantee foot-traffic.', done: true },
          { id: 'm2', title: 'Configure Off-Peak Hours', desc: 'Set Tuesday 2-5PM discount boost.', done: false },
          { id: 'm3', title: 'Print POS Scanning QR', desc: 'Allow staff to validate customer redemptions in 3s.', done: false },
        ];
      case 'creator':
        return [
          { id: 'c1', title: 'Link Social Handle', desc: 'Verify your audience reach.', done: true },
          { id: 'c2', title: 'Share 1st Slash-It Drop', desc: 'Earn 15% cashback referral commission.', done: false },
          { id: 'c3', title: 'Claim Host Badge', desc: 'Unlock VIP event creation tools.', done: false },
        ];
      default:
        return [
          { id: 'u1', title: 'Claim 1st Local Drop', desc: 'Save 40% at a nearby venue.', done: true },
          { id: 'u2', title: 'Invite a Friend to a Squad', desc: 'Unlock +15% extra squad cashback.', done: false },
          { id: 'u3', title: 'Start a 7-Day Exploration Streak', desc: 'Earn daily bonus yield multipliers.', done: false },
        ];
    }
  };

  const items = getPersonaItems();
  const completed = items.filter((i) => i.done).length;
  const progress = Math.round((completed / items.length) * 100);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">First-Win Activation Engine</span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> {persona.toUpperCase()} Activation Roadmap
          </h2>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Progress</span>
            <span className="text-lg font-black text-emerald-400">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition ${
              item.done
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <h4 className={`text-sm font-bold ${item.done ? 'text-emerald-300' : 'text-white'}`}>
                  {idx + 1}. {item.title}
                </h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>

            {!item.done && (
              <button
                onClick={() => onActionClick(item.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition"
              >
                <span>Start</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
