import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Compass,
  Heart,
  MapPin,
  Share2,
  Sparkles,
  Star,
  Users,
  ExternalLink,
  CheckCircle2,
  MessageSquare,
  Globe,
  Instagram,
  Clock,
  ThumbsUp,
  Plus,
  TrendingUp,
  HelpCircle,
  Gift,
  ArrowRight,
  Copy,
  Flame,
  ShieldCheck,
  Zap,
  Target,
  Send,
  Vote,
  CheckSquare
} from "lucide-react";
import { formatDiscoveryCategory, discoveryLocation } from "@promorang/shared";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "@/components/ImageGallery";
import { PromorangMap } from "@/components/PromorangMap";
import { ReactionBar } from "@/components/ReactionBar";
import { SaveButton } from "@/components/SaveButton";
import { ShareButton } from "@/components/ShareButton";
import { useDiscovery, useSaveDiscovery } from "@/hooks/useDiscoveries";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { buildLocationPath, getSiteUrl, slugifySegment } from "@/lib/discovery";
import { generateDiscoverySchema } from "@/lib/seo-schemas";
import { 
  getDiscoveryPollByIdOrSlug, 
  getAllDiscoveryPolls, 
  DiscoveryPoll,
  DiscoveryOption,
  DiscoveryComment 
} from "@/data/discoveriesData";

export default function DiscoveryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: uiToast } = useToast();

  // Check if this slug matches a Discovery Poll / Demand Signal
  const pollConfig = getDiscoveryPollByIdOrSlug(slug || "");
  const [poll, setPoll] = useState<DiscoveryPoll | undefined>(pollConfig);
  const [userVotedOptionId, setUserVotedOptionId] = useState<string | undefined>(undefined);
  const [newOptionText, setNewOptionText] = useState("");
  const [showAddOption, setShowAddOption] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedOptionForComment, setSelectedOptionForComment] = useState<string>("");
  const [comments, setComments] = useState<DiscoveryComment[]>(pollConfig?.comments || []);
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [isSavedPoll, setIsSavedPoll] = useState(false);

  // Fallback to database query if not a static poll
  const query = useDiscovery(!pollConfig ? slug : undefined);
  const saveMutation = useSaveDiscovery(query.data?.id);
  const [saved, setSaved] = useState(false);
  const [checkins, setCheckins] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Array<{ id: string; author: string; text: string; rating: number; date: string }>>([
    {
      id: "1",
      author: "Maya R.",
      text: "Discovered this spot through Promorang last week! The vibe is incredible and atmosphere is unmatched.",
      rating: 5,
      date: "2 days ago",
    },
    {
      id: "2",
      author: "Marcus T.",
      text: "Hidden gem for sure. Perfect spot to bring friends or connect with local scene members.",
      rating: 5,
      date: "5 days ago",
    },
  ]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // ----------------------------------------------------------------------
  // DEDICATED DISCOVERY POLL / DEMAND SIGNAL VIEW
  // ----------------------------------------------------------------------
  if (poll) {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const progressPercentage = Math.min(100, Math.round((totalVotes / poll.thresholdForMoment) * 100));
    const votesRemaining = Math.max(0, poll.thresholdForMoment - totalVotes);
    const isThresholdMet = totalVotes >= poll.thresholdForMoment;
    const leadingOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
    const otherPolls = getAllDiscoveryPolls().filter((p) => p.id !== poll.id).slice(0, 2);

    const handleVoteOnPoll = (optionId: string) => {
      if (userVotedOptionId) return;

      setUserVotedOptionId(optionId);
      setPoll((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalVotes: prev.totalVotes + 1,
          options: prev.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      });

      const selectedOpt = poll.options.find(o => o.id === optionId);
      if (selectedOpt) {
        setSelectedOptionForComment(selectedOpt.text);
      }

      toast.success(`Vote counted! +${poll.pointsReward} PromoPoints awarded to your account.`);
    };

    const handleAddOption = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newOptionText.trim()) return;

      const newOpt: DiscoveryOption = {
        id: `opt-${Date.now()}`,
        text: newOptionText.trim(),
        votes: 1,
      };

      setPoll((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalVotes: prev.totalVotes + 1,
          options: [...prev.options, newOpt],
        };
      });

      setUserVotedOptionId(newOpt.id);
      setSelectedOptionForComment(newOpt.text);
      setNewOptionText("");
      setShowAddOption(false);
      toast.success("Your nominated candidate was added to the official ballot!");
    };

    const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      const newC: DiscoveryComment = {
        id: `c-${Date.now()}`,
        author: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You",
        badge: "Community Voter",
        optionSupported: selectedOptionForComment || (userVotedOptionId ? poll.options.find(o => o.id === userVotedOptionId)?.text : undefined),
        text: commentText.trim(),
        likes: 1,
        timeAgo: "Just now",
      };

      setComments([newC, ...comments]);
      setCommentText("");
      toast.success("Your debate argument was posted!");
    };

    const handleToggleCommentLike = (commentId: string) => {
      setCommentLikes((prev) => {
        const current = prev[commentId] || 0;
        return { ...prev, [commentId]: current === 1 ? 0 : 1 };
      });
    };

    const shareUrl = window.location.href;
    const whatsappShareText = `Vote on Promorang: "${poll.question}" - Which option is your pick? ${shareUrl}`;

    return (
      <main className="min-h-screen bg-[#07090e] pb-24 text-white selection:bg-orange-500 selection:text-white">
        <SEO
          title={`${poll.question} — Promorang Demand Signal`}
          description={poll.description}
          url={getSiteUrl(`/discoveries/${poll.slug}`)}
        />

        {/* Ambient Glows */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-600/10 blur-[120px]" />
          <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-purple-600/10 blur-[140px]" />
          <div className="absolute left-1/3 top-1/2 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[160px]" />
        </div>

        <div className="relative z-10">
          {/* Top Bar / Navigation */}
          <section className="border-b border-white/10 bg-black/40 backdrop-blur-xl pt-20">
            <div className="container mx-auto px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link
                    to="/discover"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-orange-400" />
                    Back to Discoveries
                  </Link>

                  <Link
                    to="/radar?tab=discover"
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-orange-400 transition"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Opportunity Radar
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Poll link copied to clipboard!");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 transition"
                  >
                    <Copy className="h-3.5 w-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </button>

                  <button
                    onClick={() => {
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareText)}`, "_blank");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      setIsSavedPoll(!isSavedPoll);
                      toast.success(isSavedPoll ? "Removed from Saved" : "Saved to your Vault! 🌟");
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      isSavedPoll
                        ? "border-orange-500/50 bg-orange-500/20 text-orange-400"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{isSavedPoll ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Hero Header */}
          <section className="container mx-auto px-4 py-8 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Category & Status Strip */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  {poll.category} Discovery
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Demand Signal
                </span>

                <span className="text-xs font-bold text-purple-400 bg-purple-950/50 border border-purple-800/40 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  +{poll.pointsReward} PromoPoints per Vote
                </span>
              </div>

              {/* Grand Editorial Title */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                {poll.question}
              </h1>

              {/* Scout Attribution Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  {poll.authorAvatar ? (
                    <img
                      src={poll.authorAvatar}
                      alt={poll.authorName}
                      className="h-12 w-12 rounded-full border-2 border-orange-500/60 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-orange-500/20 text-orange-400 font-bold text-lg border border-orange-500/40">
                      {poll.authorName[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{poll.authorName}</span>
                      <CheckCircle2 className="h-4 w-4 text-orange-400" />
                      {poll.authorHandle && (
                        <span className="text-xs text-white/40">{poll.authorHandle}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/60">{poll.authorRole}</p>
                  </div>
                </div>

                {poll.connectedScene && (
                  <Link
                    to={`/scenes/${poll.connectedScene.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl transition"
                  >
                    <span>Connected to: {poll.connectedScene.title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* 2-Column Content Grid */}
          <section className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-[1fr_340px] items-start">
              
              {/* Left Column: Interactive Ballot & Debate Content */}
              <div className="space-y-8">
                
                {/* Demand Signal Progress Card */}
                <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-gray-900/90 via-gray-950 to-gray-900 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                        DEMAND-TO-SUPPLY THRESHOLD
                      </span>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                        <span>Demand Signal Velocity</span>
                      </h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-2xl font-black text-orange-400">
                        {totalVotes} <span className="text-sm font-normal text-white/50">/ {poll.thresholdForMoment} Votes</span>
                      </span>
                      <p className="text-[11px] text-white/50 font-medium">{progressPercentage}% of unlock target</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-lg shadow-orange-500/20"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Milestone Target Explanation */}
                  <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 shrink-0 mt-0.5">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Target Milestone Perk</p>
                      <p className="text-xs text-white/80 mt-0.5 font-medium">{poll.targetUnlockPerk}</p>
                      {isThresholdMet ? (
                        <p className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> Threshold Cleared! Promorang is scheduling this Moment.
                        </p>
                      ) : (
                        <p className="text-[11px] text-orange-300/90 font-semibold mt-1">
                          🔥 Only {votesRemaining} more votes needed to trigger this community unlock!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Voting Ballot */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Vote className="h-5 w-5 text-orange-400" />
                        <span>Cast Your Vote</span>
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {userVotedOptionId ? "Your choice has been recorded on the live ledger." : "Select an option below to submit your demand signal."}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-white/40">
                      {poll.options.length} Candidates
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const votePercentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                      const isSelected = userVotedOptionId === option.id;
                      const isLeading = leadingOption?.id === option.id && totalVotes > 10;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVoteOnPoll(option.id)}
                          disabled={!!userVotedOptionId}
                          className={`w-full relative overflow-hidden p-4 rounded-2xl text-left border transition-all duration-200 group ${
                            isSelected
                              ? "border-orange-500 bg-orange-500/15 text-white font-bold ring-2 ring-orange-500/30"
                              : "border-white/10 bg-white/[0.02] text-white hover:border-white/20 hover:bg-white/[0.05] active:scale-[0.99]"
                          }`}
                        >
                          {/* Animated vote percentage background bar */}
                          {userVotedOptionId && (
                            <div
                              className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ${
                                isSelected ? "bg-orange-500/25" : "bg-white/[0.04]"
                              }`}
                              style={{ width: `${votePercentage}%` }}
                            />
                          )}

                          <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center border shrink-0 transition ${
                                  isSelected
                                    ? "border-orange-400 bg-orange-500 text-black font-black"
                                    : "border-white/30 group-hover:border-orange-400"
                                }`}
                              >
                                {isSelected ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-white/20 group-hover:bg-orange-400" />
                                )}
                              </div>
                              
                              <div className="text-left">
                                <span className="text-sm font-medium text-white block">
                                  {option.text}
                                </span>
                                {isLeading && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> Leading Choice ({votePercentage}%)
                                  </span>
                                )}
                              </div>
                            </div>

                            {userVotedOptionId && (
                              <div className="text-right shrink-0">
                                <span className="text-sm font-black text-white block">
                                  {votePercentage}%
                                </span>
                                <span className="text-[11px] text-white/50">
                                  {option.votes} {option.votes === 1 ? "vote" : "votes"}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Post-Vote Micro-Conversion & Reward Banner */}
                  {userVotedOptionId && (
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-gray-900 to-orange-950/70 border border-purple-500/30 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
                          <Gift className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">Your vote has been verified! 🎯</h4>
                            <span className="px-2 py-0.5 rounded-md bg-orange-500 text-black text-[10px] font-black uppercase">
                              +{poll.pointsReward} Pts
                            </span>
                          </div>
                          <p className="text-xs text-white/70 mt-1 leading-relaxed">
                            When this question reaches its {poll.thresholdForMoment}-vote threshold, all verified voters receive priority access to the unlocked perk.
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => {
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareText)}`, "_blank");
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center gap-1.5 transition"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Invite Friends on WhatsApp</span>
                            </button>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                toast.success("Share link copied!");
                              }}
                              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Custom Candidate Nomination */}
                  {!userVotedOptionId && !showAddOption && (
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => setShowAddOption(true)}
                        className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nominate another candidate / spot</span>
                      </button>
                    </div>
                  )}

                  {showAddOption && (
                    <form onSubmit={handleAddOption} className="mt-6 pt-4 border-t border-white/10 space-y-3">
                      <p className="text-xs font-bold text-white">Nominate Your Choice</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newOptionText}
                          onChange={(e) => setNewOptionText(e.target.value)}
                          placeholder="Type your candidate spot or choice name..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs rounded-xl px-4"
                        >
                          Add & Vote
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Scout Context & Deep Dive */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">SCOUT INTELLIGENCE</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white">Context & Market Rationale</h3>
                  <p className="text-sm sm:text-base leading-relaxed text-white/80">
                    {poll.description}
                  </p>
                  
                  {poll.contextNotes && (
                    <div className="mt-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                      <p className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> What Happens Next
                      </p>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">
                        {poll.contextNotes}
                      </p>
                    </div>
                  )}

                  {/* Tag Pills */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                    {poll.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Community Debate & Discussion Feed */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-400" />
                        <span>Community Debate & Hot Takes</span>
                      </h3>
                      <p className="text-xs text-white/50">{comments.length} arguments recorded</p>
                    </div>
                  </div>

                  {/* Add Argument Form */}
                  <form onSubmit={handleAddComment} className="space-y-3 border-b border-white/10 pb-6">
                    <p className="text-xs font-bold text-white/90">Share your reasoning for your pick:</p>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Why did you pick your candidate? Share your experience, flavor notes, or event expectations..."
                      rows={3}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/40">Keep debates respectful and authentic.</span>
                      <Button
                        type="submit"
                        disabled={!commentText.trim()}
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Argument</span>
                      </Button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((c) => {
                      const hasLiked = (commentLikes[c.id] || 0) === 1;
                      const displayLikes = c.likes + (hasLiked ? 1 : 0);

                      return (
                        <div key={c.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{c.author}</span>
                              {c.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-white/70">
                                  {c.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/40">{c.timeAgo}</span>
                          </div>

                          {c.optionSupported && (
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400">
                              <span>Voted for: {c.optionSupported}</span>
                            </div>
                          )}

                          <p className="text-xs leading-relaxed text-white/80">{c.text}</p>

                          <div className="flex items-center gap-4 pt-1">
                            <button
                              onClick={() => handleToggleCommentLike(c.id)}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold transition ${
                                hasLiked ? "text-orange-400" : "text-white/40 hover:text-white"
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${hasLiked ? "fill-orange-400" : ""}`} />
                              <span>{displayLikes}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Sticky Sidebar: Demand Engine & Related Polls */}
              <aside className="sticky top-24 space-y-6">
                
                {/* Demand-to-Supply Engine Card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
                    HOW IT WORKS
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white">Demand-to-Supply</h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Promorang doesn't wait for sponsors to decide what gets created. We aggregate verified community demand to unlock merchant perks and sponsor co-funding.
                  </p>

                  <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-orange-500/20 text-orange-400 font-black flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </div>
                      <p className="text-white/80"><strong>You Vote & Debate:</strong> Back your favorite spot or candidate.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-orange-500/20 text-orange-400 font-black flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </div>
                      <p className="text-white/80"><strong>Threshold Trigger:</strong> At {poll.thresholdForMoment} votes, Promorang contracts the venue.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-orange-500/20 text-orange-400 font-black flex items-center justify-center shrink-0 text-[10px]">
                        3
                      </div>
                      <p className="text-white/80"><strong>Voter Priority:</strong> Voters receive instant PromoKey drops and points.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <Button
                      onClick={() => {
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappShareText)}`, "_blank");
                      }}
                      className="w-full h-11 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Rally Friends on WhatsApp</span>
                    </Button>
                  </div>
                </div>

                {/* Related Debates */}
                {otherPolls.length > 0 && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                      MORE ACTIVE DEBATES
                    </span>
                    
                    <div className="space-y-3">
                      {otherPolls.map((op) => (
                        <Link
                          key={op.id}
                          to={`/discoveries/${op.slug}`}
                          className="block p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/40 hover:bg-white/[0.05] transition group"
                        >
                          <span className="text-[10px] font-bold text-orange-400 uppercase">
                            {op.category}
                          </span>
                          <h4 className="text-xs font-bold text-white group-hover:text-orange-300 line-clamp-2 mt-1">
                            {op.question}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-white/50 mt-2">
                            <span>{op.totalVotes} / {op.thresholdForMoment} votes</span>
                            <span className="text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                              Vote →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </aside>

            </div>
          </section>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------------
  // PLACE / VENUE DISCOVERY VIEW (Database Fallback)
  // ----------------------------------------------------------------------
  if (query.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-black text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!query.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
        <div>
          <Compass className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-bold">This Discovery is not available.</h1>
          <p className="mt-3 text-white/50">It may have been removed or the link might be incorrect.</p>
          <Link to="/discover" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Explore Discoveries & Polls
          </Link>
        </div>
      </main>
    );
  }

  const discovery = query.data;
  const currentCheckins = checkins !== null ? checkins : discovery.checkin_count || 0;

  // Prepare images for Airbnb-style gallery
  const galleryImages = [
    ...(discovery.cover_image ? [{ url: discovery.cover_image, alt: discovery.title, caption: discovery.title }] : []),
    ...(Array.isArray(discovery.gallery)
      ? discovery.gallery.map((g: any, i: number) => ({
          url: typeof g === "string" ? g : g.url || discovery.cover_image || "",
          alt: `${discovery.title} photo ${i + 1}`,
          caption: typeof g === "object" ? g.caption : undefined,
        }))
      : []),
    {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop",
      alt: "Atmosphere",
      caption: "Vibe & Atmosphere",
    },
    {
      url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop",
      alt: "Gathering",
      caption: "Community Spot",
    },
  ];

  const handleSave = async () => {
    if (!user) {
      window.location.assign(`/auth?next=${encodeURIComponent(`/discoveries/${discovery.slug}`)}`);
      return;
    }
    try {
      await saveMutation.mutateAsync();
      setSaved(!saved);
      uiToast({ title: saved ? "Removed from Saved" : "Saved to Vault! 🌟", description: "You can access saved discoveries in your Vault." });
    } catch {
      setSaved(true);
      uiToast({ title: "Saved!", description: "Discovery added to your saved collection." });
    }
  };

  const handleCheckin = () => {
    if (!user) {
      window.location.assign(`/auth?next=${encodeURIComponent(`/discoveries/${discovery.slug}`)}`);
      return;
    }
    setCheckins(currentCheckins + 1);
    uiToast({ title: "Checked in! 📍", description: "You logged your visit to this Discovery and earned 50 PromoPoints!" });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    setTimeout(() => {
      setReviews([
        {
          id: String(Date.now()),
          author: user?.user_metadata?.full_name || "You",
          text: newReviewText,
          rating: newRating,
          date: "Just now",
        },
        ...reviews,
      ]);
      setNewReviewText("");
      setSubmittingReview(false);
      uiToast({ title: "Review added! ⭐", description: "Thank you for rating this Scout Discovery." });
    }, 400);
  };

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={`${discovery.title} — Promorang Discovery`}
        description={discovery.description || `Explore ${discovery.title} on Promorang.`}
        image={discovery.cover_image || undefined}
        url={getSiteUrl(`/discoveries/${discovery.slug}`)}
        schema={generateDiscoverySchema(discovery)}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-white/10 pt-20">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          {/* Breadcrumb & Quick Actions */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              Back to Discoveries
            </Link>

            <div className="flex items-center gap-2">
              <ShareButton
                title={discovery.title}
                url={window.location.href}
                description={discovery.description || undefined}
              />
              <SaveButton
                isSaved={saved}
                onToggle={handleSave}
                saveCount={discovery.save_count || 0}
              />
            </div>
          </div>

          {/* Title & Category Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-primary/50 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary">
                {formatDiscoveryCategory(discovery.category)}
              </Badge>
              {discovery.city && (
                <Link to={buildLocationPath(slugifySegment(discovery.country || "Jamaica"), slugifySegment(discovery.city))} className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-primary">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {discoveryLocation(discovery)}
                </Link>
              )}
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                4.9 (12 reviews)
              </span>
            </div>

            <h1 className="mt-3 font-serif text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl">
              {discovery.title}
            </h1>
          </div>

          {/* Airbnb-style Photo Gallery */}
          <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <ImageGallery images={galleryImages} />
          </div>

          {/* 2-Column Main Content & Action Sidebar */}
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
            {/* Left Main Details Column */}
            <div className="space-y-10">
              {/* Description & Overview */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <h2 className="font-serif text-2xl font-bold text-white">About this Spot</h2>
                {discovery.description ? (
                  <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                    {discovery.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-white/50">
                    A recommended cultural find verified by the Promorang Scout network.
                  </p>
                )}

                {/* Highlights / Vibe Tags */}
                <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                  {["Vibe & Ambience", "Local Favorite", "Photo Spot", "Walkable", "Recommended"].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                      ✨ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Creator / Scout Attribution Card */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  {discovery.creator_profile?.avatar_url ? (
                    <img
                      src={discovery.creator_profile.avatar_url}
                      alt=""
                      className="h-14 w-14 rounded-full border-2 border-primary object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                      {discovery.creator_profile?.display_name?.[0] || "S"}
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Discovered & Recommended by</span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {discovery.creator_profile?.display_name || discovery.creator_profile?.username || "Culture Scout"}
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </h3>
                    <p className="text-xs text-white/50">Level 3 Scout · Top 5% Local Explorer</p>
                  </div>
                </div>
              </div>

              {/* Connected Scene Section */}
              {discovery.scene && (
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-black to-black p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">CONNECTED SCENE RITUAL</span>
                      <h3 className="mt-1 font-serif text-3xl font-bold">{discovery.scene.title}</h3>
                      <p className="mt-2 text-xs text-white/60">
                        This discovery is linked to the {discovery.scene.title} community.
                      </p>
                    </div>
                    <Link
                      to={`/scenes/${discovery.scene.slug}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-black transition hover:bg-orange-400"
                    >
                      Explore Scene <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Interactive Location Map */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">LOCATION & DIRECTIONS</span>
                    <h3 className="font-serif text-2xl font-bold">{discovery.city || "Local Destination"}</h3>
                    <p className="text-xs text-white/60">{discovery.location_address || "Address available upon check-in."}</p>
                  </div>
                  {discovery.location_address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(discovery.location_address + " " + (discovery.city || ""))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Google Maps <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <div className="h-64 overflow-hidden rounded-2xl border border-white/10">
                  <PromorangMap
                    moments={[
                      {
                        id: String(discovery.id),
                        title: discovery.title,
                        location: discovery.location_address || discovery.city || "Spot",
                        latitude: discovery.latitude || 17.9714,
                        longitude: discovery.longitude || -76.7936,
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Community Reviews & Sentiment */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Scout Reviews & Ratings</h3>
                    <p className="text-xs text-white/50">{reviews.length} community reviews</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="h-5 w-5 fill-amber-400" />
                    <span className="text-lg">4.9</span>
                  </div>
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="mt-6 border-b border-white/10 pb-6">
                  <p className="text-xs font-bold text-white/80">Have you visited this Discovery?</p>
                  <div className="mt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-400"
                      >
                        <Star className={`h-5 w-5 ${star <= newRating ? "fill-amber-400" : "text-white/20"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share what makes this spot worth discovering..."
                    rows={2}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
                  />
                  <Button
                    type="submit"
                    disabled={submittingReview || !newReviewText.trim()}
                    size="sm"
                    className="mt-3 bg-primary font-bold text-black hover:bg-orange-400"
                  >
                    Submit Review
                  </Button>
                </form>

                {/* Reviews List */}
                <div className="mt-6 space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{rev.author}</span>
                        <span className="text-[10px] text-white/40">{rev.date}</span>
                      </div>
                      <div className="mt-1 flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-white/70">{rev.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Action Sidebar Card */}
            <aside className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">LOG & VERIFY</span>
                <h2 className="mt-2 font-serif text-2xl font-bold">Have You Been Here?</h2>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  Log your visit to this Discovery to earn **+50 PromoPoints** and build your Scout reputation.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-4">
                  <div>
                    <p className="text-3xl font-bold text-white">{currentCheckins}</p>
                    <p className="text-[11px] font-medium text-white/50">Community Visits</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{discovery.save_count || 0}</p>
                    <p className="text-[11px] font-medium text-white/50">Times Saved</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleCheckin}
                    className="h-12 w-full gap-2 rounded-full bg-primary font-black text-black hover:bg-orange-400"
                  >
                    <MapPin className="h-4 w-4" />
                    Log Visit / Check In (+50 Pts)
                  </Button>

                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className={`h-11 w-full gap-2 rounded-full border-white/20 font-bold ${
                      saved ? "border-primary bg-primary/20 text-primary" : "text-white hover:bg-white/10"
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                    {saved ? "Saved to Vault" : "Save to Vault"}
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
