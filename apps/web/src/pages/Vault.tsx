import { API_BASE_URL } from "@/lib/api";
import type { PromoCardPerk } from "@promorang/shared";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Gift, Ticket, Trophy, Sparkles, ReceiptText, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidityVaultDashboard } from "@/components/LiquidityVaultDashboard";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { usePromoShareRail } from "@/hooks/usePromoShareRail";
import { LivePerkCard } from "@/components/perks/LivePerkCard";
import { ParticipantPiece } from "@/components/participant/ParticipantPiece";
import { useRetainedMomentArtwork } from "@/hooks/useRetainedMomentArtwork";



type VaultTab = "perks" | "tickets" | "memories" | "liquidity";

type VaultMemory = {
  id: string;
  title?: string | null;
  rarity?: string | null;
  issued_at?: string | null;
  moment_id?: string | null;
  legacy_score?: number | null;
  metadata?: {
    moment_title?: string | null;
    venue_name?: string | null;
    location?: string | null;
    scene_title?: string | null;
    proof_submission_id?: string | null;
    [key: string]: unknown;
  } | null;
};

const Vault = () => {
  const { t: webT } = useWebI18n();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<VaultTab>("memories");
  const card = useMyPromoCard();
  const { balances, refreshBalances } = usePromoShareRail();
  const claimedPerks = card.data?.benefits || [];
  const usedPerks = card.data?.used || [];

  const vaultQuery = useQuery({
    queryKey: ["vault-data", user?.id],
    enabled: Boolean(user && session),
    queryFn: async () => {
      if (!session?.access_token) return null;
      const response = await fetch(`${API_BASE_URL}/vault`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to load retained history");
      return payload;
    },
  });

  const vaultData = vaultQuery.data?.vault || vaultQuery.data || {};
  const memories: VaultMemory[] = Array.isArray(vaultData?.memories) ? vaultData.memories : [];
  const artwork = useRetainedMomentArtwork(memories);

  const tabs: Array<{ id: VaultTab; label: string; note: string; icon: typeof Gift; count?: number }> = [
    { id: "memories", label: "Pieces", note: "Pieces & memories", icon: Trophy, count: vaultQuery.data ? memories.length : undefined },
    { id: "perks", label: "Access", note: "Perks on your card", icon: Gift, count: card.data ? claimedPerks.length : undefined },
    { id: "tickets", label: "Entries", note: "PromoShare entries", icon: Ticket, count: balances.promoShareSourceRecorded ? balances.promoShareTickets : undefined },
    { id: "liquidity", label: "Backing", note: "Inspect reserves", icon: Sparkles },
  ];

  return (
    <div className="participant-world participant-vault pb-20 text-white" data-proof-family="participant-kept-proof">
      <SEO title="Your Vault — Promorang" description="The things PROMORANG kept for you: access you can use, chances you hold, and Pieces from things you were part of." />

      <header className="pr-world-wrap pr-world-header">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>

            <h1 className="pr-world-display mt-4 max-w-4xl">My Vault</h1>
            <p className="pr-world-copy mt-5 max-w-2xl">
              Access for your next visit. Entries in the draw. Pieces and memories from the things you took part in.
            </p>
          </div>
          <Link to="/dashboard" className="pr-world-link">Back to Today →</Link>
        </div>

      </header>

      <main className="pr-world-canvas">
        <nav className="pr-world-strip" aria-label="Vault sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={active}
                data-active={active}
                className="pr-world-chip justify-between gap-2 px-4 py-3"
              >
                <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" />{tab.label}</span>
                <span className="font-mono text-[10px] text-white/40">{typeof tab.count === "number" ? tab.count : "↗"}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === "perks" ? (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <p className="pr-world-kicker text-emerald-300">{webT("web.use")}</p>
                <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-[.95] tracking-tight sm:text-5xl">Access you kept.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">Check each offer’s status and instructions before using it. Claiming access is separate from redemption or fulfillment.</p>
              </div>
              <Link to="/card" className="pr-world-primary">{webT("web.openPromoCard")} <ArrowRight className="h-4 w-4" /></Link>
            </div>

            {card.isLoading ? (
              <div className="pr-world-object-grid">{[1,2,3].map((n) => <Skeleton key={n} className="h-56 rounded-[1.6rem] bg-white/5" />)}</div>
            ) : card.isError && !card.data ? (
              <div role="alert" className="pr-world-empty p-6"><p>Your access couldn’t load.</p><button type="button" onClick={() => void card.refetch()} className="pr-world-link min-h-11">{webT("release.18")}</button></div>
            ) : claimedPerks.length ? (
              <div className="pr-world-object-grid">{claimedPerks.map((perk: PromoCardPerk, index: number) => <div key={perk.id} className={index === 0 ? "pr-world-object--wide" : ""}><LivePerkCard perk={perk} /></div>)}</div>
            ) : (
              <div className="pr-world-empty px-6 py-12">
                <div><Gift className="mx-auto h-7 w-7 text-emerald-300" /><h3 className="mt-4 font-serif text-3xl font-bold">Nothing is on your card yet.</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/45">Claim an available offer and find it here for your next visit.</p><Link to="/discover" className="pr-world-link mt-5 inline-flex items-center gap-2">Find something worth claiming <ArrowRight className="h-4 w-4" /></Link></div>
              </div>
            )}

            {usedPerks.length ? (
              <div className="space-y-4 border-t border-white/10 pt-7">
                <p className="pr-world-kicker text-white/35">{webT("perk.alreadyUsed")}</p>
                <div className="pr-world-object-grid">{usedPerks.map((perk: PromoCardPerk) => <LivePerkCard key={perk.id} perk={perk} />)}</div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "tickets" ? (
          <section className="animate-in fade-in duration-300">
            <div className="pr-world-panel overflow-hidden p-6 sm:p-9">
              <p className="pr-world-kicker text-purple-300">{webT("web.chance")}</p>
              <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
                <div><h2 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">{balances.promoShareSourceRecorded ? `${balances.promoShareTickets} entries.` : "Entries unavailable."}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">They represent recorded participation in a draw. An entry is not a win, and a win is not settlement until the system records it.</p></div>
                <div className="border-l border-white/10 pl-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Next known draw</p><p className="mt-2 font-serif text-2xl font-bold">{balances.nextDrawDate || "No active draw supplied"}</p></div>
              </div>
              {!balances.promoShareSourceRecorded ? <button type="button" onClick={() => void refreshBalances()} className="pr-world-link mt-5 min-h-11">Refresh entries</button> : null}
              <Link to="/promoshare" className="pr-world-primary mt-7">{webT("how.memberStep2Cta")} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </section>
        ) : null}

        {activeTab === "memories" ? (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className={memories.length ? "sr-only" : "grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end"}>
              <div><p className="pr-world-kicker text-amber-300">{webT("home.trail04Label")}</p><h2 className="mt-3 font-serif text-4xl font-bold leading-[.95] tracking-tight sm:text-5xl">Your story, kept.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">Revisit your Pieces and memories, with the source details that connect each one to your history.</p></div>
              <div className="flex items-start gap-3 border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><ReceiptText className="mt-1 h-5 w-5 text-amber-300" /><p className="text-xs leading-6 text-white/45">You showed up → it counted → you kept a Piece.</p></div>
            </div>

            {vaultQuery.isLoading ? (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <Skeleton key={n} className="h-72 rounded-xl bg-white/5" />)}</div>
            ) : vaultQuery.error ? (
              <div role="alert" className="pr-world-panel p-5 text-sm text-red-200"><p>Your Pieces couldn’t load.</p><button type="button" disabled={vaultQuery.isFetching} onClick={() => void vaultQuery.refetch()} className="pr-world-link min-h-11">Try again</button></div>
            ) : memories.length ? (
              <div className="participant-piece-grid">{memories.map((memory) => <ParticipantPiece key={memory.id} memory={memory} moments={artwork} />)}</div>
            ) : (
              <div className="pr-world-empty px-6 py-12"><div><Trophy className="mx-auto h-7 w-7 text-amber-300" /><h3 className="mt-4 font-serif text-3xl font-bold">Your shelf is still clean.</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/45">Nothing here yet. Show up, take part, and when it counts, PROMORANG can keep a Piece of it with you.</p><Link to="/discover" className="pr-world-link mt-5 inline-flex items-center gap-2">Go find what is moving <ArrowRight className="h-4 w-4" /></Link></div></div>
            )}
          </section>
        ) : null}

        {activeTab === "liquidity" ? (
          <section className="space-y-5 animate-in fade-in duration-300">
            <div><p className="pr-world-kicker">Backing</p><h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">Inspect what sits behind the value layer.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">This is intentionally separate from your memories, perks and draw entries. Retained cultural history is not presented as a financial asset.</p></div>
            <details className="border-y border-white/10 py-4"><summary className="cursor-pointer min-h-11 text-sm">Platform balances</summary><dl className="flex flex-wrap gap-8 py-4 text-sm"><div><dt>{webT("give.kind.points")}</dt><dd>{balances.promoPoints} · not cash</dd></div><div><dt>{webT("wallet.gemsLabel")}</dt><dd>{balances.gems}</dd></div></dl></details>
            <div className="pr-world-panel overflow-hidden p-1"><LiquidityVaultDashboard /></div>
          </section>
        ) : null}

        <Link to="/discover" className="pr-world-link inline-flex min-h-11 items-center gap-3">Find your next Moment <ArrowRight size={16} /></Link>
      </main>
    </div>
  );
};

export default Vault;
