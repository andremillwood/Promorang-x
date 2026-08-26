import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  Vote, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  PlusCircle, 
  Share2, 
  Copy, 
  Gift, 
  ArrowRight, 
  ArrowUpRight,
  MessageSquare,
  Flame,
  Zap,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { usePromoShareRail } from '@/hooks/usePromoShareRail';
import { usePerks } from '@/hooks/usePerks';
import { PromoShareAction } from '@/components/promoshare/PromoShareAction';

export interface DiscoveryOption {
  id: string;
  text: string;
  votes: number;
}

export interface DiscoveryProps {
  id: string;
  slug?: string;
  question: string;
  category: string;
  authorName: string;
  options: DiscoveryOption[];
  totalVotes: number;
  thresholdForMoment?: number;
  userVotedOptionId?: string;
  targetUnlockPerk?: string;
  onVote?: (discoveryId: string, optionId: string) => void;
  onAddOption?: (discoveryId: string, text: string) => void;
}

export const DiscoveryWidget: React.FC<DiscoveryProps> = ({
  id,
  slug,
  question,
  category,
  authorName,
  options: initialOptions,
  totalVotes: initialTotalVotes,
  thresholdForMoment = 100,
  userVotedOptionId: initialUserVotedOptionId,
  targetUnlockPerk,
  onVote,
  onAddOption
}) => {
  const navigate = useNavigate();
  const { recordAttributedAction } = usePromoShareRail();
  const { perks, claimPerk } = usePerks();
  const [options, setOptions] = useState<DiscoveryOption[]>(initialOptions);
  const [totalVotes, setTotalVotes] = useState<number>(initialTotalVotes);
  const [votedOptionId, setVotedOptionId] = useState<string | undefined>(initialUserVotedOptionId);
  const [newOptionText, setNewOptionText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);

  const detailUrl = `/discoveries/${slug || id}`;

  // Find related perk for this discovery
  const relatedPerk = perks.find(p => 
    p.category?.toLowerCase() === category.toLowerCase() || 
    p.title.toLowerCase().includes('wings') ||
    p.title.toLowerCase().includes('taco')
  ) || perks[0];

  const navigateToDetail = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(detailUrl);
  };

  const handleVote = (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation();
    if (votedOptionId) return; // Prevent multi-voting in UI demo
    
    setVotedOptionId(optionId);
    setTotalVotes(prev => prev + 1);
    setOptions(prev =>
      prev.map(opt => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt))
    );

    recordAttributedAction('discovery.completed', question);

    if (onVote) {
      onVote(id, optionId);
    }
  };

  const handleAddOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newOptionText.trim()) return;

    const newOpt: DiscoveryOption = {
      id: `opt-${Date.now()}`,
      text: newOptionText.trim(),
      votes: 1
    };

    setOptions(prev => [...prev, newOpt]);
    setTotalVotes(prev => prev + 1);
    setVotedOptionId(newOpt.id);
    setNewOptionText('');
    setShowAddOption(false);

    if (onAddOption) {
      onAddOption(id, newOptionText.trim());
    }
    toast.success('Your candidate was added to the ballot!');
  };

  const progressPercentage = Math.min(100, Math.round((totalVotes / thresholdForMoment) * 100));

  return (
    <div 
      className="group relative rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-950 to-gray-900 p-5 text-white border border-gray-800/80 shadow-xl hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Top Meta Header - Clickable to page */}
        <div className="flex items-center justify-between text-xs mb-3">
          <button
            onClick={navigateToDetail}
            className="px-2.5 py-0.5 bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 rounded-full font-semibold transition-colors flex items-center gap-1 text-left"
          >
            <span>{category} Discovery</span>
          </button>
          
          <button
            onClick={navigateToDetail}
            className="text-gray-400 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <span>By {authorName}</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-orange-400 transition-opacity" />
          </button>
        </div>

        {/* Main Question - Clickable to page */}
        <div 
          onClick={navigateToDetail}
          className="cursor-pointer mb-4 group/title"
        >
          <h3 className="text-base font-bold text-white group-hover/title:text-orange-300 leading-snug flex items-start transition-colors">
            <HelpCircle className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5 group-hover/title:scale-110 transition-transform" />
            <span className="flex-1">{question}</span>
            <span className="ml-2 text-xs font-semibold text-orange-400/0 group-hover/title:text-orange-400 flex items-center shrink-0 transition-all">
              <span className="hidden sm:inline text-[11px]">View Details</span>
              <ArrowUpRight className="w-4 h-4 ml-0.5" />
            </span>
          </h3>
        </div>

        {/* City Unlock Progress Bar */}
        <div 
          onClick={navigateToDetail}
          className="cursor-pointer mb-5 bg-black/50 hover:bg-black/70 p-3.5 rounded-2xl border border-white/10 hover:border-orange-500/40 transition-all shadow-inner group/meter"
        >
          <div className="flex items-center justify-between text-xs mb-2 font-medium">
            <span className="text-white flex items-center font-bold tracking-tight">
              <Zap className="w-4 h-4 text-amber-400 mr-1.5 animate-bounce" />
              <span>City Unlock Meter</span>
            </span>
            <span className="text-orange-400 font-black text-xs px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30">
              {totalVotes} / {thresholdForMoment} Votes
            </span>
          </div>
          <div className="w-full bg-gray-800/90 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-700 shadow-md shadow-orange-500/30"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {progressPercentage >= 100 ? (
            <p className="text-[11px] text-emerald-400 font-bold mt-2 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> 🎉 UNLOCKED! Exclusive Tasting Pass is Live!
            </p>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-white/60 mt-1.5">
              <span>{thresholdForMoment - totalVotes} more votes triggers the drop for everyone</span>
              <span className="text-orange-400 font-extrabold ml-1 group-hover/meter:translate-x-0.5 transition-transform">
                Charge Meter →
              </span>
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-2.5 mb-4">
          {options.map(option => {
            const votePercentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isSelected = votedOptionId === option.id;

            return (
              <button
                key={option.id}
                onClick={(e) => handleVote(e, option.id)}
                disabled={!!votedOptionId}
                className={`w-full relative overflow-hidden p-3.5 rounded-2xl text-left border transition-all duration-200 active:scale-[0.99] ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/20 text-white font-bold shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40'
                    : 'border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/25 hover:bg-white/[0.07]'
                }`}
              >
                {/* Voting percentage background bar */}
                {votedOptionId && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ${
                      isSelected ? 'bg-orange-500/25' : 'bg-white/[0.04]'
                    }`}
                    style={{ width: `${votePercentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between gap-2.5 text-xs">
                  <span className="flex items-center min-w-0 flex-1">
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0" />}
                    <span className="truncate">{option.text}</span>
                  </span>
                  {votedOptionId && (
                    <span className="font-black text-white ml-2 shrink-0 font-mono text-[11px]">
                      {votePercentage}% ({option.votes})
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Post-Vote Micro-Conversion & Related Perk Unlocked */}
        {votedOptionId && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-orange-950/80 border border-purple-500/40 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Demand Signal Recorded!</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-black text-[9px] font-black uppercase">
                      +25 Pts
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[9px] font-mono font-bold">
                      +1 🎟️
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1">
                    Your contribution charged the City Unlock Meter. Here is an instant unlocked Perk from our verified partner:
                  </p>
                </div>
              </div>
            </div>

            {/* Related Perk Micro-Card */}
            {relatedPerk && (
              <div className="p-3 rounded-xl bg-black/60 border border-orange-500/30 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-orange-400 font-bold block">
                    {relatedPerk.merchantName} · Unlocked Drop
                  </span>
                  <p className="text-xs font-bold text-white truncate">{relatedPerk.title}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    claimPerk(relatedPerk);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black transition-all shadow-md"
                >
                  Claim Perk →
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-white/10">
              <PromoShareAction
                objectType="discovery"
                objectId={id}
                slugOrPath={slug}
                title={question}
                potentialReward={{ promoPoints: 25, tickets: 1, condition: 'when friends vote' }}
                buttonLabel="Rally Group Chat (+1 Ticket)"
                variant="compact"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(detailUrl);
                }}
                className="text-xs font-bold text-white hover:text-orange-300 px-3 py-1.5 rounded-xl flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Live Arena & Hot Takes</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Add Custom Option Trigger */}
        {!votedOptionId && !showAddOption && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddOption(true);
              }}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center space-x-1"
            >
              <PlusCircle className="w-4 h-4 mr-1 text-orange-400" />
              <span>Put your spot on the map 📍</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = `${window.location.origin}${detailUrl}`;
                navigator.clipboard.writeText(url);
                toast.success('Battle link copied! Share to group chat.');
              }}
              className="text-[11px] text-white/50 hover:text-white flex items-center space-x-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 mr-1 text-purple-400" />
              <span>Share</span>
            </button>
          </div>
        )}

        {showAddOption && (
          <form onSubmit={handleAddOptionSubmit} className="mt-3 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newOptionText}
              onChange={e => setNewOptionText(e.target.value)}
              placeholder="Nominate a spot or choice..."
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black rounded-xl whitespace-nowrap"
            >
              Nominate & Vote
            </button>
          </form>
        )}
      </div>

      {/* Footer link to dedicated page */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
        <button
          onClick={navigateToDetail}
          className="text-orange-400 hover:text-orange-300 font-black flex items-center gap-1 group/btn transition-colors"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Enter Live Arena & Hot Takes</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>

        {votedOptionId ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="w-3 h-3" /> Vote Recorded
          </span>
        ) : (
          <span className="text-white/40 text-[10px] font-medium">
            Tap to open debate
          </span>
        )}
      </div>
    </div>
  );
};
