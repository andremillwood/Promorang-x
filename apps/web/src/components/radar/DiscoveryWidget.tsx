import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, PlusCircle, Share2, Signal, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PromoShareAction } from '@/components/promoshare/PromoShareAction';
import { useI18n } from '@/i18n/I18nContext';

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
  signalKind?: "demand" | "live_offer";
  onVote?: (discoveryId: string, optionId: string) => void | Promise<void>;
  onAddOption?: (discoveryId: string, text: string) => void | Promise<void>;
  landOnCard?: boolean;
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
  signalKind = "demand",
  onVote,
  onAddOption,
}) => {
  const navigate = useNavigate();
  const { t, formatNumber } = useI18n();
  const [options, setOptions] = useState<DiscoveryOption[]>(initialOptions);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [votedOptionId, setVotedOptionId] = useState<string | undefined>(initialUserVotedOptionId);
  const [newOptionText, setNewOptionText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);
  const [votingOptionId, setVotingOptionId] = useState<string | null>(null);
  const [addingOption, setAddingOption] = useState(false);
  const detailUrl = `/discoveries/${slug || id}`;

  const handleVote = async (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation();
    if (votedOptionId || votingOptionId) return;
    if (!onVote && !import.meta.env.DEV) {
      toast.error("This signal cannot be recorded from this surface.");
      return;
    }

    setVotingOptionId(optionId);
    try {
      await onVote?.(id, optionId);
      setVotedOptionId(optionId);
      setTotalVotes((value) => value + 1);
      setOptions((rows) => rows.map((option) => option.id === optionId ? { ...option, votes: option.votes + 1 } : option));
    } catch {
      toast.error("We couldn’t add your voice.");
    } finally {
      setVotingOptionId(null);
    }
  };

  const handleAddOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = newOptionText.trim();
    if (!text || addingOption) return;
    if (!onAddOption && !import.meta.env.DEV) {
      toast.error("New options cannot be recorded from this surface.");
      return;
    }

    setAddingOption(true);
    try {
      await onAddOption?.(id, text);
      const next = { id: `opt-${Date.now()}`, text, votes: 1 };
      setOptions((rows) => [...rows, next]);
      setTotalVotes((value) => value + 1);
      setVotedOptionId(next.id);
      setNewOptionText('');
      setShowAddOption(false);
      toast.success(t("radar.addedBallot"));
    } catch {
      toast.error("That option was not recorded.");
    } finally {
      setAddingOption(false);
    }
  };

  return (
    <article className="pr-world-panel overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="pr-world-kicker">{category} · people want</p>
          <button type="button" onClick={() => navigate(detailUrl)} className="mt-3 block max-w-2xl text-left">
            <h3 className="font-serif text-[1.9rem] font-bold leading-[.98] tracking-[-.04em] text-white transition hover:text-[#f4c66c] sm:text-[2.35rem]">{question}</h3>
          </button>
          <p className="mt-2 text-xs text-white/35">Started by {authorName}</p>
        </div>
        <Signal className="mt-1 h-5 w-5 shrink-0 text-[#ff5a1f]" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-white/10 py-3 text-[10px] font-black uppercase tracking-[.13em] text-white/38">
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{formatNumber(totalVotes)} voices</span>
        <span>{signalKind === "live_offer" ? "Something is open" : "People want this"}</span>
        <span className="ml-auto text-white/26">A strong want can invite a response. It does not create one.</span>
      </div>

      <div className="mt-5 space-y-2">
        {options.map((option) => {
          const selected = votedOptionId === option.id;
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <button
              key={option.id}
              type="button"
              onClick={(event) => handleVote(event, option.id)}
              disabled={Boolean(votedOptionId || votingOptionId)}
              className={`relative w-full overflow-hidden rounded-2xl border px-4 py-4 text-left transition ${selected ? 'border-[#ff5a1f]/55 bg-[#ff5a1f]/12' : 'border-white/10 bg-white/[.025] hover:border-white/20 hover:bg-white/[.05]'}`}
            >
              {votedOptionId ? <span className="absolute inset-y-0 left-0 bg-white/[.035]" style={{ width: `${percentage}%` }} /> : null}
              <span className="relative flex items-center justify-between gap-4">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white/82">{selected ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff5a1f]" /> : null}<span className="truncate">{option.text}</span></span>
                {votedOptionId ? <span className="shrink-0 font-mono text-[10px] text-white/42">{percentage}% · {option.votes}</span> : <ArrowRight className="h-4 w-4 shrink-0 text-white/25" />}
              </span>
            </button>
          );
        })}
      </div>

      {votedOptionId ? (
        <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.045] p-4">
          <p className="text-sm font-black text-emerald-200">You’re in.</p>
          <p className="mt-1 text-xs leading-5 text-white/42">You added your voice. If something real opens from this, PROMORANG will show it separately.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PromoShareAction objectType="discovery" objectId={id} slugOrPath={slug} title={question} buttonLabel={t("radar.rallyChat")} variant="compact" />
            <button type="button" onClick={() => navigate(detailUrl)} className="pr-world-chip">See what’s moving <ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ) : null}

      {!votedOptionId && !showAddOption ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={(event) => { event.stopPropagation(); setShowAddOption(true); }} className="pr-world-link inline-flex items-center gap-1.5"><PlusCircle className="h-4 w-4" />{t("radar.putSpot")}</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}${detailUrl}`); toast.success(t("radar.copiedBattle")); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-white/40 transition hover:text-white"><Share2 className="h-3.5 w-3.5" />{t("common.share")}</button>
        </div>
      ) : null}

      {showAddOption ? (
        <form onSubmit={handleAddOptionSubmit} className="mt-5 flex gap-2" onClick={(event) => event.stopPropagation()}>
          <input value={newOptionText} onChange={(event) => setNewOptionText(event.target.value)} placeholder={t("radar.nominatePlaceholder")} className="min-h-12 flex-1 rounded-2xl border border-white/12 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#ff5a1f]/60" />
          <button type="submit" disabled={addingOption} className="pr-world-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-50">{addingOption ? "Adding…" : "Add"}</button>
        </form>
      ) : null}

      <button type="button" onClick={() => navigate(detailUrl)} className="mt-5 flex w-full items-center justify-between border-t border-white/10 pt-4 text-left text-xs font-black text-white/50 transition hover:text-white">
        <span>Read the full Discovery</span><ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
};
