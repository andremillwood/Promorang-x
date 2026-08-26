import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, Loader2, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { getSiteUrl } from "@/lib/discovery";
import {
  type AcquisitionDiscovery,
  captureDiscovery,
  discoveryNextAction,
  loadDiscovery,
  shareDiscovery,
  voteDiscovery,
} from "@/lib/discovery-acquisition";
import { cn } from "@/lib/utils";

type Step = "vote" | "capture" | "results";

export default function DiscoveryAcquisitionPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [discovery, setDiscovery] = useState<AcquisitionDiscovery | null>(null);
  const [step, setStep] = useState<Step>("vote");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [founding, setFounding] = useState<{ badge?: string; memberNumber?: number } | null>(null);
  const [share, setShare] = useState<{ text: string; link: string; whatsapp: string } | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadDiscovery(slug);
        if (cancelled) return;
        setDiscovery(data.discovery);
        if (data.response?.choiceIds?.length) setSelected(data.response.choiceIds);
        if (data.session.captured || data.response?.isCaptured) {
          setStep("results");
          setPointsAwarded(data.response?.pointsAwarded || 0);
        } else if (data.session.voted) {
          setStep(data.discovery.captureRequired && !user ? "capture" : "results");
        } else {
          setStep("vote");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this Discovery");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  const maxSelections = discovery?.maxSelections || 1;
  const isMulti = (discovery?.discoveryType === "multi_select" && maxSelections > 1) || false;

  const canVote = selected.length > 0 && selected.length <= maxSelections && !submitting;

  const partnerLine = discovery?.partnerAttribution?.attribution_line;

  const selectedLabels = useMemo(() => {
    if (!discovery) return [];
    return discovery.choices.filter((c) => selected.includes(c.id)).map((c) => c.label);
  }, [discovery, selected]);

  function toggleChoice(id: string) {
    if (step !== "vote" || submitting) return;
    setSelected((prev) => {
      if (isMulti) {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= maxSelections) return prev;
        return [...prev, id];
      }
      return [id];
    });
  }

  async function handleVote() {
    if (!discovery || !canVote) return;
    try {
      setSubmitting(true);
      setError(null);
      const data = await voteDiscovery(discovery.slug, selected);
      setDiscovery(data.discovery);
      if (data.needsCapture) {
        setStep("capture");
      } else {
        setStep("results");
        setPointsAwarded(data.pointsAwarded || 0);
        setFounding(data.founding || null);
        if (data.discovery?.results) {
          /* results included */
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record your vote");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!discovery) return;
    try {
      setSubmitting(true);
      setError(null);
      const data = await captureDiscovery(discovery.slug, {
        phone: phone || undefined,
        email: email || undefined,
      });
      setDiscovery(data.discovery);
      setPointsAwarded(data.pointsAwarded || discovery.rewardPoints || 0);
      setFounding(data.founding || null);
      setShare(data.share || null);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock results");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShare() {
    if (!discovery) return;
    try {
      const data = await shareDiscovery(discovery.slug, "whatsapp");
      setShare(data);
      window.open(data.whatsapp, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open WhatsApp");
    }
  }

  async function handleNextAction(value: string) {
    if (!discovery) return;
    try {
      setSubmitting(true);
      const data = await discoveryNextAction(discovery.slug, {
        actionType: discovery.primaryNextAction,
        actionValue: value,
        momentId: discovery.relatedMomentId || undefined,
        destination: discovery.nextActionDestination || undefined,
      });
      setActionDone(value);
      if (value === "going" || discovery.primaryNextAction === "view_moment") {
        const dest = data.destination || discovery.nextActionDestination;
        if (dest) navigate(dest);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your response");
    } finally {
      setSubmitting(false);
    }
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/d/${slug}`;
  const src = searchParams.get("src");

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_#1a1510_0%,_#0c0a08_55%)] text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
      </div>
    );
  }

  if (error && !discovery) {
    return (
      <div className="min-h-[100dvh] bg-[#0c0a08] text-white flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-medium">{error}</p>
        <button type="button" onClick={() => navigate("/")} className="text-orange-400 text-sm underline">
          Back home
        </button>
      </div>
    );
  }

  if (!discovery) return null;

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_20%_0%,_#2a1c12_0%,_#0c0a08_45%,_#0a0908_100%)] text-[#f7f1e8] overflow-x-hidden">
      <SEO
        title={discovery.seoTitle || discovery.title}
        description={discovery.seoDescription || discovery.description || discovery.title}
        image={discovery.ogImageUrl || discovery.coverImageUrl || undefined}
        url={canonical}
        noindex={!discovery.indexable}
      />

      <div className="mx-auto w-full max-w-md px-4 pt-5 pb-28 sm:max-w-lg">
        {discovery.coverImageUrl && step === "vote" && (
          <div className="relative -mx-4 mb-5 h-44 overflow-hidden sm:mx-0 sm:rounded-2xl sm:h-52">
            <img
              src={discovery.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a08] via-[#0c0a08]/40 to-transparent" />
          </div>
        )}

        {discovery.eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-orange-300/90 mb-2 font-medium">
            {discovery.eyebrow}
          </p>
        )}

        <h1 className="font-[Fraunces,Georgia,serif] text-[1.65rem] leading-tight sm:text-[1.9rem] text-[#fff8f0] mb-2">
          {discovery.title}
        </h1>

        {discovery.description && step === "vote" && (
          <p className="text-sm text-[#d9cfc3]/90 leading-relaxed mb-4">{discovery.description}</p>
        )}

        {partnerLine && step === "vote" && (
          <p className="text-xs text-[#a89888] mb-5">{partnerLine}</p>
        )}

        {src && step === "vote" && (
          <p className="sr-only">Source: {src}</p>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {step === "vote" && (
          <div className="space-y-3">
            {isMulti && (
              <p className="text-xs text-[#b5a89a]">Pick up to {maxSelections}</p>
            )}
            {discovery.choices.map((choice) => {
              const active = selected.includes(choice.id);
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => toggleChoice(choice.id)}
                  className={cn(
                    "w-full text-left rounded-2xl border transition-all duration-200 active:scale-[0.99]",
                    "min-h-[64px] px-3.5 py-3.5 flex items-center gap-3",
                    active
                      ? "border-orange-400 bg-orange-500/15 shadow-[0_0_0_1px_rgba(251,146,60,0.35)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20"
                  )}
                >
                  {choice.imageUrl && (
                    <img
                      src={choice.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] text-[#fff6ec] leading-snug">{choice.label}</div>
                    {choice.description && (
                      <div className="text-xs text-[#b5a89a] mt-0.5 truncate">{choice.description}</div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full border flex items-center justify-center shrink-0",
                      active ? "border-orange-400 bg-orange-500 text-black" : "border-white/25"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}

            <div className="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 bg-[#0c0a08]/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="mx-auto max-w-md sm:max-w-lg">
                <button
                  type="button"
                  disabled={!canVote}
                  onClick={handleVote}
                  className={cn(
                    "w-full rounded-2xl py-3.5 text-[15px] font-semibold transition",
                    canVote
                      ? "bg-orange-500 text-black hover:bg-orange-400"
                      : "bg-white/10 text-white/40"
                  )}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </span>
                  ) : (
                    "Lock in my pick"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "capture" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 px-4 py-4">
              <p className="font-[Fraunces,Georgia,serif] text-xl text-[#fff8f0]">Your vote is in.</p>
              <p className="text-sm text-[#d9cfc3] mt-1">
                See how Kingston voted, where your pick ranks, and unlock what’s next.
              </p>
              {selectedLabels[0] && (
                <p className="text-xs text-orange-300 mt-3">You chose: {selectedLabels.join(", ")}</p>
              )}
            </div>

            <form onSubmit={handleCapture} className="space-y-3">
              <label className="block">
                <span className="text-xs text-[#b5a89a] mb-1.5 block">WhatsApp number</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+1 876 …"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-orange-400/60"
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#b5a89a] mb-1.5 block">Email (optional)</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-[15px] text-white placeholder:text-white/30 outline-none focus:border-orange-400/60"
                />
              </label>
              <button
                type="submit"
                disabled={submitting || (!phone.trim() && !email.trim())}
                className="w-full rounded-2xl bg-orange-500 text-black py-3.5 text-[15px] font-semibold disabled:opacity-40"
              >
                {submitting ? "Unlocking…" : "See the live result"}
              </button>
              <p className="text-[11px] text-center text-[#8a7d70]">
                Save your vote · Unlock your Promorang profile · See what your Scene chose
              </p>
            </form>
          </div>
        )}

        {step === "results" && discovery.results && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {(pointsAwarded > 0 || founding) && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                {pointsAwarded > 0 && (
                  <>
                    <p className="font-semibold text-amber-200">+{pointsAwarded} PromoPoints</p>
                    <p className="text-xs text-[#d9cfc3] mt-0.5">
                      You helped shape what the community wants.
                    </p>
                  </>
                )}
                {founding?.badge && (
                  <p className="text-xs text-amber-100/90 mt-2">
                    {founding.badge}
                    {founding.memberNumber ? ` · #${founding.memberNumber}` : ""}
                  </p>
                )}
              </div>
            )}

            <div>
              <p className="font-[Fraunces,Georgia,serif] text-xl text-[#fff8f0] mb-1">
                {discovery.results.headline}
              </p>
              {discovery.results.selected[0] && (
                <p className="text-sm text-[#d9cfc3]">
                  You’re with {discovery.results.selected[0].votePct}% of voters. Your pick is currently #
                  {discovery.results.selected[0].rank}.
                </p>
              )}
              <p className="text-xs text-[#8a7d70] mt-2">
                {discovery.results.totalVotes} vote{discovery.results.totalVotes === 1 ? "" : "s"} so far
              </p>
            </div>

            <div className="space-y-2.5">
              {discovery.choices.map((choice) => {
                const pct = choice.votePct || 0;
                const isMine = selected.includes(choice.id);
                return (
                  <div
                    key={choice.id}
                    className={cn(
                      "rounded-xl border px-3 py-2.5",
                      isMine ? "border-orange-400/40 bg-orange-500/10" : "border-white/10 bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-medium text-[#fff6ec]">{choice.label}</span>
                      <span className="text-xs tabular-nums text-[#cbbfb0]">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", isMine ? "bg-orange-400" : "bg-white/35")}
                        style={{ width: `${Math.max(pct, pct > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next action */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 space-y-3">
              <p className="font-medium text-[#fff6ec]">
                {discovery.nextActionConfig?.prompt || discovery.nextActionLabel || "What’s next?"}
              </p>
              <div className="flex flex-col gap-2">
                {(discovery.nextActionConfig?.options || [
                  { value: "going", label: "I’m going" },
                  { value: "maybe", label: "Maybe" },
                  { value: "not_this_week", label: "Not this week" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={submitting || actionDone === opt.value}
                    onClick={() => handleNextAction(opt.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                      actionDone === opt.value
                        ? "border-orange-400 bg-orange-500/20 text-orange-100"
                        : "border-white/15 bg-transparent text-[#f7f1e8] hover:border-orange-400/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {discovery.primaryNextAction === "view_moment" && discovery.relatedMomentId && (
                <button
                  type="button"
                  onClick={() => handleNextAction("view_moment")}
                  className="w-full text-sm text-orange-300 underline underline-offset-2"
                >
                  {discovery.nextActionLabel || "See the Moment"}
                </button>
              )}
            </div>

            {/* Choice-linked moment actions for weekend template */}
            {discovery.nextActionConfig?.template === "weekend_move" && selected[0] && (
              <div className="flex flex-col gap-2">
                {discovery.choices
                  .filter((c) => selected.includes(c.id) && c.momentId)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        discoveryNextAction(discovery.slug, {
                          actionType: "view_moment",
                          actionValue: "see_moment",
                          momentId: c.momentId || undefined,
                        }).finally(() => navigate(`/moments/${c.momentId}`));
                      }}
                      className="rounded-xl bg-white text-black py-3 text-sm font-semibold"
                    >
                      See the Moment
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => handleNextAction("interested")}
                  className="rounded-xl border border-white/20 py-3 text-sm font-medium"
                >
                  Interested
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="w-full rounded-2xl bg-[#25D366] text-black py-3.5 text-[15px] font-semibold inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Send to your crew
            </button>
            {share?.text && (
              <p className="text-[11px] text-center text-[#8a7d70] px-2">{share.text}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
