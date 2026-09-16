import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Gift, Ticket, Trophy, Sparkles, Zap, Gem, ReceiptText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const tabs: Array<{ id: VaultTab; label: string; icon: typeof Gift; count?: number }> = [
    { id: "perks", label: "Claimed perks", icon: Gift, count: claimedPerks.length },
    { id: "tickets", label: "PromoShare", icon: Ticket, count: balances.promoShareTickets },
    { id: "memories", label: "Kept proof", icon: Trophy, count: memories.length },
    { id: "liquidity", label: "Backing & reserves", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] pb-16 text-white selection:bg-[#ff5500] selection:text-white" data-proof-family="participant-kept-proof">
      <SEO title="My Retained Value & Vault — Promorang" description="Your real retained proof, perks, tickets and platform value." />

      <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-6 border-b border-white/10 pb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge className="border-none bg-[#ff5500] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">Retained Value & Vault</Badge>
              <h1 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">What stayed with you.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Useful value, possessed access and verified history. Nothing appears here merely because it was intended, claimed or illustrated.</p>
            </div>
            <GlobalTicketBalancePill />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["PromoPoints", `${balances.promoPoints} pts`, "Progress", Zap, "text-orange-400"],
              ["Active perks", claimedPerks.length.toLocaleString(), "Ready to present", Gift, "text-emerald-400"],
              ["Draw tickets", balances.promoShareTickets.toLocaleString(), balances.nextDrawDate || "Current balance", Ticket, "text-purple-300"],
              ["Platform Gems", `${balances.gems} Gems`, "Retained platform value", Gem, "text-blue-400"],
            ].map(([label, value, detail, Icon, tone]) => {
              const MetricIcon = Icon as typeof Gift;
              return (
                <div key={String(label)} className="border border-white/10 bg-[#121214] p-4">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">{String(label)}</span><MetricIcon className={`h-3.5 w-3.5 ${tone}`} /></div>
                  <p className={`mt-3 text-2xl font-black ${tone}`}>{String(value)}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">{String(detail)}</p>
                </div>
              );
            })}
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-4" aria-label="Vault sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`inline-flex min-h-10 items-center gap-2 border px-4 text-xs font-black transition ${active ? "border-[#ff5500] bg-[#ff5500] text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"}`}>
                <Icon className="h-4 w-4" />{tab.label}{typeof tab.count === "number" ? <span className="bg-black/25 px-1.5 py-0.5 font-mono text-[10px]">{tab.count}</span> : null}
              </button>
            );
          })}
        </nav>

        {activeTab === "perks" ? (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Possessed utility</p><h2 className="mt-2 font-serif text-3xl font-semibold">On your PromoCard</h2><p className="mt-1 text-sm text-white/50">A claim gives you an entitlement. Merchant validation and fulfillment remain later states.</p></div><Button asChild variant="outline" className="border-white/15 bg-white/5"><Link to="/card">Open PromoCard</Link></Button></div>
            {card.isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <Skeleton key={n} className="h-48 rounded-none bg-white/5" />)}</div> : claimedPerks.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{claimedPerks.map((perk: any) => <LivePerkCard key={perk.id} perk={perk} />)}</div> : <div className="border border-dashed border-white/15 p-7"><p className="font-serif text-2xl font-semibold">Nothing claimed yet.</p><p className="mt-2 text-sm text-white/50">When you possess a live perk it will appear here without pretending that it has already been used.</p><Link to="/earn" className="mt-4 inline-block text-sm font-black text-emerald-400">Find a live perk →</Link></div>}
            {usedPerks.length ? <div className="space-y-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Already used</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{usedPerks.map((perk: any) => <LivePerkCard key={perk.id} perk={perk} />)}</div></div> : null}
          </section>
        ) : null}

        {activeTab === "tickets" ? (
          <section className="space-y-5 animate-in fade-in duration-300">
            <div className="border border-purple-500/25 bg-[linear-gradient(135deg,rgba(88,28,135,.24),rgba(18,18,20,.9))] p-6 sm:p-8"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">Possibility retained</p><h2 className="mt-2 font-serif text-3xl font-semibold">{balances.promoShareTickets} active draw tickets</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Tickets remain distinct from points and Gems. They represent entries in the draw, not guaranteed winnings or cash.</p><Button asChild className="mt-5 bg-purple-600 font-black text-white hover:bg-purple-500"><Link to="/promoshare">Open PromoShare</Link></Button></div>
          </section>
        ) : null}

        {activeTab === "memories" ? (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-start gap-3"><ReceiptText className="mt-1 h-5 w-5 text-amber-300" /><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Verified history</p><h2 className="mt-1 font-serif text-3xl font-semibold">Kept proof</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">These receipts are rendered only from the authenticated Vault response. No demo memory is substituted when your retained history is empty.</p></div></div>
            {vaultQuery.isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <Skeleton key={n} className="h-64 rounded-none bg-white/5" />)}</div> : vaultQuery.error ? <div className="border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-200">{(vaultQuery.error as Error).message}</div> : memories.length ? <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">{memories.map((memory) => {
              const meta = memory.metadata || {};
              const place = String(meta.venue_name || meta.location || "").trim();
              const moment = String(meta.moment_title || memory.title || "Verified Moment");
              const proofRef = String(meta.proof_submission_id || memory.id);
              return <Link key={memory.id} to={`/memories/${memory.id}`} className="block transition hover:-translate-y-1"><PaperReceipt heading={memory.title || moment} lines={[{ label: "Moment", value: moment, strong: true }, ...(place ? [{ label: "Place", value: place }] : []), { label: "Kept", value: readableDate(memory.issued_at) }, { label: "Rarity", value: memory.rarity || "Memory" }, { label: "Proof ref", value: proofRef.slice(0, 18) }]} footer="Verified history stays yours. Open the memory for its retained source context." /></Link>;
            })}</div> : <div className="border border-dashed border-amber-300/20 bg-amber-300/[0.04] p-8"><p className="font-serif text-2xl font-semibold">No kept proof yet.</p><p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Joining or checking in does not automatically manufacture a receipt here. Verified history will appear after the platform has a retained memory record.</p><Link to="/discover" className="mt-4 inline-block text-sm font-black text-amber-300">Discover what is happening →</Link></div>}
          </section>
        ) : null}

        {activeTab === "liquidity" ? <section className="animate-in fade-in duration-300"><LiquidityVaultDashboard /></section> : null}
      </div>
    </div>
  );
};

export default Vault;