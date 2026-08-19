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
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [options, setOptions] = useState<DiscoveryOption[]>(initialOptions);
  const [totalVotes, setTotalVotes] = useState<number>(initialTotalVotes);
  const [votedOptionId, setVotedOptionId] = useState<string | undefined>(initialUserVotedOptionId);
  const [newOptionText, setNewOptionText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);

  const detailUrl = `/discoveries/${slug || id}`;

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

    if (onVote) {
      onVote(id, optionId);
    }
    toast.success('Vote counted! +25 PromoPoints awarded.');
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

        {/* Demand Signal Threshold Progress Bar */}
        <div 
          onClick={navigateToDetail}
          className="cursor-pointer mb-5 bg-gray-800/60 hover:bg-gray-800/80 p-3 rounded-xl border border-gray-700/50 hover:border-gray-600/60 transition-all"
        >
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-gray-300 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mr-1" />
              Demand Signal Progress
            </span>
            <span className="text-orange-400 font-bold">
              {totalVotes} / {thresholdForMoment} Votes
            </span>
          </div>
          <div className="w-full bg-gray-700/80 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {progressPercentage >= 100 ? (
            <p className="text-[11px] text-emerald-400 font-semibold mt-1.5 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Demand Threshold Met! Dedicated Moment unlocked.
            </p>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
              <span>Reaching {thresholdForMoment} votes unlocks a dedicated Promorang Moment!</span>
              <span className="text-orange-400/80 font-bold ml-1">{thresholdForMoment - totalVotes} left</span>
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-2 mb-4">
          {options.map(option => {
            const votePercentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isSelected = votedOptionId === option.id;

            return (
              <button
                key={option.id}
                onClick={(e) => handleVote(e, option.id)}
                disabled={!!votedOptionId}
                className={`w-full relative overflow-hidden p-3 rounded-xl text-left border transition-all duration-200 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10 text-white font-semibold shadow-inner'
                    : 'border-gray-800 bg-gray-800/40 text-gray-200 hover:border-gray-700 hover:bg-gray-800/70 active:scale-[0.99]'
                }`}
              >
                {/* Voting percentage background bar */}
                {votedOptionId && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-orange-500/20 transition-all duration-500"
                    style={{ width: `${votePercentage}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0" />}
                    {option.text}
                  </span>
                  {votedOptionId && (
                    <span className="font-bold text-gray-300 ml-2">
                      {votePercentage}% ({option.votes})
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Post-Vote Micro-Conversion & Reward Banner */}
        {votedOptionId && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-orange-950/60 border border-purple-800/40 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 mt-0.5">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Your vote has been counted! 🎯</p>
                  <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                    When this question reaches {thresholdForMoment} votes, voters unlock early access to the winning venue's tasting pass.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10">
              <span className="text-[10px] text-orange-400 font-bold flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> +25 PromoPoints Earned
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(detailUrl);
                }}
                className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <span>View Full Debate</span>
                <ArrowRight className="w-3 h-3" />
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
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              <span>Add your candidate</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = `${window.location.origin}${detailUrl}`;
                navigator.clipboard.writeText(url);
                toast.success('Poll link copied! Share to your group chat.');
              }}
              className="text-[11px] text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 mr-1 text-purple-400" />
              <span>Share Poll</span>
            </button>
          </div>
        )}

        {showAddOption && (
          <form onSubmit={handleAddOptionSubmit} className="mt-3 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newOptionText}
              onChange={e => setNewOptionText(e.target.value)}
              placeholder="Type your recommendation (e.g. Chilitos Courtyard)..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl whitespace-nowrap"
            >
              Submit
            </button>
          </form>
        )}
      </div>

      {/* Footer link to dedicated page */}
      <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
        <button
          onClick={navigateToDetail}
          className="text-orange-400/90 hover:text-orange-300 font-bold flex items-center gap-1 group/btn transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
          <span>Explore Discussion & Scout Notes</span>
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>

        {votedOptionId ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const text = `Vote on Promorang: "${question}" - Which spot is your pick? ${window.location.origin}${detailUrl}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="px-2.5 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold transition-colors flex items-center gap-1"
          >
            <Share2 className="w-3 h-3" />
            <span>WhatsApp</span>
          </button>
        ) : (
          <span className="text-gray-500 text-[10px] font-medium">
            Click to view page
          </span>
        )}
      </div>
    </div>
  );
};
