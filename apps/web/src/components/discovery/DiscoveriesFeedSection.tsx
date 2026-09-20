import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Compass, HelpCircle, MapPin, Plus, Radio, ShieldCheck, Sparkles } from "lucide-react";
import { discoveryLocation, formatDiscoveryCategory } from "@promorang/shared";
import { useDiscoveries } from "@/hooks/useDiscoveries";
import { SubmitDiscoveryModal } from "./SubmitDiscoveryModal";
import { AskQuestionModal } from "./AskQuestionModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import type { DiscoveryPoll } from "@/data/discoveriesData";
import { toast } from "sonner";
import { castListingDiscoveryVote, useListingDiscoveryPolls } from "@/hooks/useListingDiscoveryPolls";
import { useCommunityDemandPolls } from "@/hooks/useCommunityDemandPolls";
import { filterDiscoveryPollsForHub, mergeDiscoveryPolls } from "@/lib/discovery-path";

export function DiscoveriesFeedSection() {
  const { user } = useAuth();
  const { city } = useMarket();
  const queryClient = useQueryClient();
  const { data: discoveries = [], isLoading: discoveriesLoading, error: discoveriesError } = useDiscoveries({ limit: 6 });
  const { data: listingPolls = [], isLoading: listingPollsLoading, error: listingPollsError } = useListingDiscoveryPolls(12);
  const { data: communityPolls = [], isLoading: communityPollsLoading, error: communityPollsError } = useCommunityDemandPolls(city.name, 12);
  const [activeTab, setActiveTab] = useState<"demand" | "places">("demand");
  const [livePolls, setLivePolls] = useState<DiscoveryPoll[]>([]);
  const [votingKey, setVotingKey] = useState<string | null>(null);

  const pollsLoading = listingPollsLoading || communityPollsLoading;
  const demandSignals = useMemo(() => {
    const relevantListingPolls = filterDiscoveryPollsForHub(listingPolls, city);
    return mergeDiscoveryPolls(livePolls, communityPolls, relevantListingPolls);
  }, [livePolls, communityPolls, listingPolls, city]);

  const castVote = async (poll: DiscoveryPoll, optionId: string) => {
    if (!user) {
      toast.info("Sign in to add your voice.");
      return;
    }

    const key = `${poll.id}:${optionId}`;
    setVotingKey(key);
    try {
      await castListingDiscoveryVote(poll.id, optionId);
      setLivePolls((current) => current.map((item) => item.id === poll.id ? {
        ...item,
        totalVotes: item.totalVotes + 1,
        options: item.options.map((option) => option.id === optionId ? { ...option, votes: option.votes + 1 } : option),
        userVotedOptionId: optionId,
      } : item));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["listing-discovery-polls"] }),
        queryClient.invalidateQueries({ queryKey: ["community-demand-polls"] }),
      ]);
      toast.success("Your voice is in.", {
        description: poll.consequence || "Your answer contributes to the stated decision. It does not create supply or a reward by itself.",
      });
    } catch (error: any) {
      toast.error(error?.message?.includes("duplicate") ? "You already added your voice to this question." : "Your voice was not recorded.");
    } finally {
      setVotingKey(null);
    }
  };

  return (
    <section id="home-discover-path" data-canonical-family="discovery-market" className="relative my-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#090a0d] shadow-2xl">
      <div className="border-b border-white/10 p-5 sm:p-7 lg:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary"><Compass className="h-4 w-4" /> Influence what happens · {city.name}</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl">Do not answer a poll. Help decide something.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Questions on PROMORANG should tell you why your answer matters: what it can influence, who will use the result, and what happens next.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AskQuestionModal
              defaultCity={city.name}
              onQuestionCreated={(poll) => setLivePolls((current) => [poll, ...current])}
              trigger={<Button variant="outline" size="sm" className="gap-2 rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"><HelpCircle className="h-4 w-4 text-purple-300" />Ask the crowd</Button>}
            />
            <SubmitDiscoveryModal trigger={<Button size="sm" className="gap-2 rounded-full bg-primary font-bold text-black hover:bg-orange-400"><Plus className="h-4 w-4" />Propose a place</Button>} />
          </div>
        </div>

        <div className="mt-7 flex gap-2 border-t border-white/10 pt-5">
          <button type="button" onClick={() => setActiveTab("demand")} className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeTab === "demand" ? "bg-white text-black" : "bg-white/5 text-white/55 hover:text-white"}`}>
            What people are choosing <span className="ml-1 text-[10px] opacity-60">{demandSignals.length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab("places")} className={`rounded-full px-4 py-2 text-xs font-bold transition ${activeTab === "places" ? "bg-white text-black" : "bg-white/5 text-white/55 hover:text-white"}`}>
            Places worth knowing <span className="ml-1 text-[10px] opacity-60">{discoveries.length}</span>
          </button>
        </div>
      </div>

      {activeTab === "demand" ? (
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Why answer?", "The question states what your choice can influence."],
              ["02", "Add your voice", "Choose what you genuinely want, prefer or believe."],
              ["03", "See what happens next", "The result goes into the stated next decision—not magically into supply."],
            ].map(([step, title, copy]) => (
              <div key={step} className="border-l border-white/10 pl-4">
                <p className="text-[10px] font-black text-primary">{step}</p>
                <p className="mt-1 font-serif text-lg font-bold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">{copy}</p>
              </div>
            ))}
          </div>

          {pollsLoading ? (
            <div className="h-56 animate-pulse rounded-3xl bg-white/[0.04]" />
          ) : listingPollsError ? (
            <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-6">
              <p className="text-sm font-bold text-white">Recorded market questions could not be loaded.</p>
              <p className="mt-1 text-xs text-white/45">PROMORANG is not substituting synthetic choices.</p>
            </div>
          ) : demandSignals.length ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                {demandSignals.slice(0, 8).map((poll) => (
                  <article key={poll.id} className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline" className="border-purple-300/20 bg-purple-300/5 text-[10px] font-black uppercase tracking-[0.14em] text-purple-200">
                        <Radio className="mr-1 h-3 w-3" />{poll.purposeLabel || "Community choice"}
                      </Badge>
                      <span className="text-[10px] font-bold text-white/35">{poll.totalVotes} voice{poll.totalVotes === 1 ? "" : "s"}</span>
                    </div>

                    <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-white">{poll.question}</h3>
                    <p className="mt-2 text-xs leading-5 text-white/48">{poll.description || "Choose the answer that best reflects what you actually want."}</p>

                    <div className="mt-4 rounded-2xl border border-purple-300/15 bg-purple-300/[0.045] p-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-purple-300">What your answer can change</p>
                      <p className="mt-2 text-sm font-bold leading-5 text-white/80">{poll.consequence || poll.contextNotes || "Your answer helps clarify what people want so the next decision can be better informed."}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/35">
                        {poll.decisionOwner ? <span>Used by: {poll.decisionOwner}</span> : null}
                        {poll.thresholdForMoment ? <span>Target: {poll.thresholdForMoment} voices</span> : null}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {poll.options.slice(0, 6).map((option) => {
                        const key = `${poll.id}:${option.id}`;
                        const recorded = poll.userVotedOptionId === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={Boolean(votingKey || poll.userVotedOptionId)}
                            onClick={() => castVote(poll, option.id)}
                            className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-primary/40 disabled:opacity-50"
                          >
                            <span className="text-xs font-bold text-white/75">{option.text}</span>
                            <span className="shrink-0 text-[10px] font-black text-primary">
                              {votingKey === key ? "Adding…" : recorded ? `Your voice · ${option.votes}` : `${option.votes} voice${option.votes === 1 ? "" : "s"}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] leading-4 text-white/35">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-purple-300" />
                      Voice ≠ commitment · target ≠ guaranteed supply · result influences only the stated next step
                    </div>
                  </article>
                ))}
              </div>

              {communityPollsError ? (
                <p className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-[10px] leading-5 text-amber-100/55">
                  Community-created questions are temporarily unavailable from the public source. Existing recorded market questions are still shown.
                </p>
              ) : null}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-primary" />
              <h3 className="mt-3 font-serif text-2xl font-bold text-white">No live decisions need the crowd yet.</h3>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-white/45">Start a question when the answer can genuinely influence a decision, request or next experiment—not just to collect votes.</p>
              <div className="mt-5"><AskQuestionModal defaultCity={city.name} /></div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 sm:p-7 lg:p-9">
          {discoveriesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-white/[0.04]" />)}</div>
          ) : discoveriesError ? (
            <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-6">
              <p className="text-sm font-bold text-white">Approved Discoveries could not be loaded.</p>
              <p className="mt-1 text-xs text-white/45">Curated demo records are not being used as a fallback.</p>
            </div>
          ) : discoveries.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discoveries.map((item) => (
                <Link key={item.id} to={`/discoveries/${item.slug}`} className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.025] transition hover:border-primary/40">
                  <div className="relative h-48 bg-white/[0.04]">
                    {item.cover_image ? <img src={item.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-white/15" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3"><Badge className="border-emerald-300/20 bg-black/70 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200"><CheckCircle2 className="mr-1 h-3 w-3" />Approved Discovery</Badge></div>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{formatDiscoveryCategory(item.category)}</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-white transition group-hover:text-primary">{item.title}</h3>
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-white/45"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{discoveryLocation(item)}</p>
                    {item.description ? <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/55">{item.description}</p> : null}
                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] text-white/35"><span>{item.checkin_count > 0 ? `${item.checkin_count} recorded check-in${item.checkin_count === 1 ? "" : "s"}` : "Approved listing"}</span><span className="flex items-center gap-1 font-bold text-primary">Open <ArrowRight className="h-3 w-3" /></span></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
              <Compass className="mx-auto h-7 w-7 text-primary" />
              <h3 className="mt-3 font-serif text-2xl font-bold text-white">No approved Discoveries yet.</h3>
              <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-white/45">A proposal is not shown here until it crosses the approval boundary.</p>
              <div className="mt-5"><SubmitDiscoveryModal /></div>
            </div>
          )}
        </div>
      )}

      <footer className="grid gap-3 border-t border-white/10 bg-white/[0.02] p-5 text-xs text-white/45 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7 lg:px-9">
        <p><strong className="text-white/70">Influence loop:</strong> Question → Voice → Result → stated next decision → real Opportunity only when someone actually responds.</p>
        <Link to="/scenes" className="inline-flex items-center gap-2 font-bold text-primary">Explore Scenes <ArrowRight className="h-3.5 w-3.5" /></Link>
      </footer>
    </section>
  );
}
