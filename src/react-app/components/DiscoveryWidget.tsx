import React, { useState } from 'react';
import { HelpCircle, Vote, CheckCircle2, TrendingUp, Sparkles, PlusCircle } from 'lucide-react';

export interface DiscoveryOption {
  id: string;
  text: string;
  votes: number;
}

export interface DiscoveryProps {
  id: string;
  question: string;
  category: string;
  authorName: string;
  options: DiscoveryOption[];
  totalVotes: number;
  thresholdForMoment?: number;
  userVotedOptionId?: string;
  onVote?: (discoveryId: string, optionId: string) => void;
  onAddOption?: (discoveryId: string, text: string) => void;
}

export const DiscoveryWidget: React.FC<DiscoveryProps> = ({
  id,
  question,
  category,
  authorName,
  options: initialOptions,
  totalVotes: initialTotalVotes,
  thresholdForMoment = 100,
  userVotedOptionId: initialUserVotedOptionId,
  onVote,
  onAddOption
}) => {
  const [options, setOptions] = useState<DiscoveryOption[]>(initialOptions);
  const [totalVotes, setTotalVotes] = useState<number>(initialTotalVotes);
  const [votedOptionId, setVotedOptionId] = useState<string | undefined>(initialUserVotedOptionId);
  const [newOptionText, setNewOptionText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);

  const handleVote = (optionId: string) => {
    if (votedOptionId) return; // Prevent multi-voting in UI demo
    
    setVotedOptionId(optionId);
    setTotalVotes(prev => prev + 1);
    setOptions(prev =>
      prev.map(opt => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt))
    );

    if (onVote) {
      onVote(id, optionId);
    }
  };

  const handleAddOptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const progressPercentage = Math.min(100, Math.round((totalVotes / thresholdForMoment) * 100));

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 p-5 text-white border border-gray-800 shadow-xl">
      {/* Top Meta Header */}
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full font-semibold">
          {category} Discovery
        </span>
        <span className="text-gray-400">By {authorName}</span>
      </div>

      {/* Main Question */}
      <h3 className="text-base font-bold text-white mb-4 leading-snug flex items-start">
        <HelpCircle className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
        <span>{question}</span>
      </h3>

      {/* Demand Signal Threshold Progress Bar */}
      <div className="mb-5 bg-gray-800/80 p-3 rounded-xl border border-gray-700/50">
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-gray-300 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mr-1" />
            Demand Signal Progress
          </span>
          <span className="text-orange-400 font-bold">
            {totalVotes} / {thresholdForMoment} Votes
          </span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {progressPercentage >= 100 ? (
          <p className="text-[11px] text-emerald-400 font-semibold mt-1.5 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" /> Demand Threshold Met! Promorang is creating this Moment now.
          </p>
        ) : (
          <p className="text-[11px] text-gray-400 mt-1">
            Reaching {thresholdForMoment} votes unlocks a dedicated Promorang Moment!
          </p>
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
              onClick={() => handleVote(option.id)}
              disabled={!!votedOptionId}
              className={`w-full relative overflow-hidden p-3 rounded-xl text-left border transition-all duration-200 ${
                isSelected
                  ? 'border-orange-500 bg-orange-500/10 text-white font-semibold'
                  : 'border-gray-800 bg-gray-800/40 text-gray-200 hover:border-gray-700 hover:bg-gray-800/70'
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

      {/* Add Custom Option Trigger */}
      {!votedOptionId && !showAddOption && (
        <button
          onClick={() => setShowAddOption(true)}
          className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          <span>Add your own option</span>
        </button>
      )}

      {showAddOption && (
        <form onSubmit={handleAddOptionSubmit} className="mt-3 flex items-center space-x-2">
          <input
            type="text"
            value={newOptionText}
            onChange={e => setNewOptionText(e.target.value)}
            placeholder="Type your recommendation..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};
