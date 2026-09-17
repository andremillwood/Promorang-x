import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Gift, Ticket, Trophy, Sparkles, Zap, Gem, ReceiptText, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidityVaultDashboard } from "@/components/LiquidityVaultDashboard";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { usePromoShareRail } from "@/hooks/usePromoShareRail";
import { LivePerkCard } from "@/components/perks/LivePerkCard";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type VaultTab = "perks" | "tickets" | "memories" | "liquidity";

type VaultMemory = {
  id: string;
  title?: string | null;
  rarity?: string | null;
  issued_at?: string | null;
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

function readableDate(value?: string | null) {
  if (!value) return "Date retained in source record";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const Vault = () => {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<VaultTab>("perks");
  const card = useMyPromoCard();
  const { balances } = usePromoShareRail();
  const claimedPerks = card.data?.benefits || [];
  const usedPerks = card.data?.used || [];

  const vaultQuery = useQuery({
    queryKey: ["vault-data", user?.id],
    enabled: Boolean(user && session),
    queryFn: async () => {
      if (!session?.access_token) return null;
      const response = await fetch(`${API_URL}/api/vault`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "Failed to load retained history");
      return payload;
    },
  });

  const vaultData = vaultQuery.data?.vault || vaultQuery.data || {};
  const memories: VaultMemory[] = Array.isArray(vaultData?.memories) ? vaultData.memories : [];

  const tabs: Array<{ id: VaultTab; label: string; note: string; icon: typeof Gift; count?: number }> = [
    { id: "perks", label: "Use", note: "Perks on your card", icon: Gift, count: claimedPerks.length },
    { id: "tickets", label: "Chance", note: "PromoShare entries", icon: Ticket, count: balances.promoShareTickets },
    { id: "memories", label: "Keep", note: "Verified proof", icon: Trophy, count: memories.length },
    { id: "liquidity", label: "Backing", note: "Inspect reserves", icon: Sparkles },
  ];

  return (
    <div className="participant-world pb-20 text-white" data-proof-family="participant-kept-proof">
      <SEO title="Your Vault — Promorang" description="The things Promorang has actually kept for you: usable perks, draw entries, verified memories and backing." />

      <header className="pr-world-wrap pr-world-header">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="pr-world-kicker">Your Vault</p>
            <h1 className="pr-world-display mt-4 max-w-4xl">What stayed with you.</h1>
            <p className="pr-world-copy mt-5 max-w-2xl">
              Not a wallet full of promises. These are the things the platform can actually point to: access you possess, entries recorded for you, proof that survived the Moment, and backing you can inspect.
            </p>
          </div>
          <GlobalTicketBalancePill />
        </div>

        <div className="pr-world-ledger mt-10">
          <div className="pr-world-ledger-item"><span>PromoPoints</span><strong>{balances.promoPoints}</strong><p className="mt-1 text-xs text-white/35">Progress, not cash</p></div>
          <div className="pr-world-ledger-item"><span>Usable perks</span><strong>{claimedPerks.length}</strong><p className="mt-1 text-xs text-white/35">Ready to present</p></div>
          <div className="pr-world-ledger-item"><span>PromoShare</span><strong>{balances.promoShareTickets}</strong><p className="mt-1 text-xs text-white/35">Recorded entries</p></div>
          <div className="pr-world-ledger-item"><span>Gems</span><strong>{balances.gems}</strong><p className="mt-1 text-xs text-white/35">Platform value</p></div>
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
                data-active={active}
                className="pr-world-chip min-w-[145px] justify-between px-4 py-3"
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
                <p className="pr-world-kicker text-emerald-300">Use</p>
                <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-[.95] tracking-tight sm:text-5xl">Things you can actually walk in with.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">Claimed means you possess the entitlement. It still does not mean redeemed, fulfilled or purchased.</p>
              </div>
              <Link to="/card" className="pr-world-primary">Open PromoCard <ArrowRight className="h-4 w-4" /></Link>
            </div>

            {card.isLoading ? (
              <div className="pr-world-object-grid">{[1,2,3].map((n) => <Skeleton key={n} className="h-56 rounded-[1.6rem] bg-white/5" />)}</div>
            ) : claimedPerks.length ? (
              <div className="pr-world-object-grid">{claimedPerks.map((perk: any, index: number) => <div key={perk.id} className={index === 0 ? "pr-world-object--wide" : ""}><LivePerkCard perk={perk} /></div>)}</div>
            ) : (
              <div className="pr-world-empty px-6 py-12">
                <div><Gift className="mx-auto h-7 w-7 text-emerald-300" /><h3 className="mt-4 font-serif text-3xl font-bold">Nothing is on your card yet.</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/45">When a live entitlement is actually issued to you, it will land here. Empty is better than pretending.</p><Link to="/discover" className="pr-world-link mt-5 inline-flex items-center gap-2">Find something worth claiming <ArrowRight className="h-4 w-4" /></Link></div>
              </div>
            )}

            {usedPerks.length ? (
              <div className="space-y-4 border-t border-white/10 pt-7">
                <p className="pr-world-kicker text-white/35">Already used</p>
                <div className="pr-world-object-grid">{usedPerks.map((perk: any) => <LivePerkCard key={perk.id} perk={perk} />)}</div>
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "tickets" ? (
          <section className="animate-in fade-in duration-300">
            <div className="pr-world-panel overflow-hidden p-6 sm:p-9" style={{ background: "radial-gradient(circle at 90% 10%, rgba(125,100,255,.28), transparent 36%), rgba(18,18,20,.82)" }}>
              <p className="pr-world-kicker text-purple-300">Chance</p>
              <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
                <div><h2 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl">{balances.promoShareTickets} entries.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">They represent recorded participation in a draw. An entry is not a win, and a win is not settlement until the system records it.</p></div>
                <div className="border-l border-white/10 pl-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Next known draw</p><p className="mt-2 font-serif text-2xl font-bold">{balances.nextDrawDate || "No active draw supplied"}</p></div>
              </div>
              <Link to="/promoshare" className="pr-world-primary mt-7">Open PromoShare <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </section>
        ) : null}

        {activeTab === "memories" ? (
          <section className="space-y-8 animate-in fade-in duration-300">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div><p className="pr-world-kicker text-amber-300">Keep</p><h2 className="mt-3 font-serif text-4xl font-bold leading-[.95] tracking-tight sm:text-5xl">Receipts from the life you actually lived.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">No demo memory fills an empty shelf. These appear only when the authenticated Vault says the platform retained one.</p></div>
              <div className="flex items-start gap-3 border-t border-white/10 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><ReceiptText className="mt-1 h-5 w-5 text-amber-300" /><p className="text-xs leading-6 text-white/45">Proof submission → review → verified attendance → retained memory.</p></div>
            </div>

            {vaultQuery.isLoading ? (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <Skeleton key={n} className="h-72 rounded-xl bg-white/5" />)}</div>
            ) : vaultQuery.error ? (
              <div className="pr-world-panel border-red-500/20 bg-red-500/5 p-5 text-sm text-red-200">{(vaultQuery.error as Error).message}</div>
            ) : memories.length ? (
              <div className="grid items-start gap-7 sm:grid-cols-2 lg:grid-cols-3">{memories.map((memory, index) => {
                const meta = memory.metadata || {};
                const place = String(meta.venue_name || meta.location || "").trim();
                const moment = String(meta.moment_title || memory.title || "Verified Moment");
                const proofRef = String(meta.proof_submission_id || memory.id);
                return (
                  <Link key={memory.id} to={`/memories/${memory.id}`} className={`block transition hover:-translate-y-1 ${index % 3 === 1 ? "sm:translate-y-8" : ""}`}>
                    <PaperReceipt heading={memory.title || moment} lines={[{ label: "Moment", value: moment, strong: true }, ...(place ? [{ label: "Place", value: place }] : []), { label: "Kept", value: readableDate(memory.issued_at) }, { label: "Rarity", value: memory.rarity || "Memory" }, { label: "Proof ref", value: proofRef.slice(0, 18) }]} footer="Verified history stays yours. Open this Piece for its retained source context." />
                  </Link>
                );
              })}</div>
            ) : (
              <div className="pr-world-empty px-6 py-12"><div><Trophy className="mx-auto h-7 w-7 text-amber-300" /><h3 className="mt-4 font-serif text-3xl font-bold">Your shelf is still clean.</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/45">Joining is intent. Submission is a claim. A memory appears only after something verifiable becomes part of your history.</p><Link to="/discover" className="pr-world-link mt-5 inline-flex items-center gap-2">Go find what is moving <ArrowRight className="h-4 w-4" /></Link></div></div>
            )}
          </section>
        ) : null}

        {activeTab === "liquidity" ? (
          <section className="space-y-5 animate-in fade-in duration-300">
            <div><p className="pr-world-kicker">Backing</p><h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">Inspect what sits behind the value layer.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">This is intentionally separate from your memories, perks and draw entries. Retained cultural history is not presented as a financial asset.</p></div>
            <div className="pr-world-panel overflow-hidden p-1"><LiquidityVaultDashboard /></div>
          </section>
        ) : null}

        <div className="pr-world-rule" />
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/35"><span>Memory ≠ money · entry ≠ win · claim ≠ redemption.</span><div className="flex items-center gap-4"><Zap className="h-4 w-4 text-orange-400" /><Gem className="h-4 w-4 text-blue-400" /><Ticket className="h-4 w-4 text-purple-300" /></div></div>
      </main>
    </div>
  );
};

export default Vault;
