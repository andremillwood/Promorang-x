import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Gem,
  Gift,
  History,
  KeyRound,
  Layers3,
  LockKeyhole,
  MapPin,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  Trophy,
  Users,
  Vote,
  WalletCards,
} from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

type MarkKind = "move" | "explore" | "return" | "proof" | "kept";

const palette = {
  ink: "#080809",
  raised: "#0d0d0f",
  clay: "#7A2E17",
  ochre: "#FF6A00",
  sand: "#EADCC6",
  gold: "#F6C453",
  water: "#4CC6F0",
  leaf: "#22C55E",
  violet: "#B58CFF",
} as const;

function BrandMark({ kind, size = 42 }: { kind: MarkKind; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 64 64", fill: "none", "aria-hidden": true } as const;
  if (kind === "move") return <svg {...common}><path d="M12 43C19 24 35 14 52 18" stroke={palette.ochre} strokeWidth="5" strokeLinecap="round"/><path d="M44 11L54 18L46 28" stroke={palette.gold} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="43" r="4" fill={palette.clay}/></svg>;
  if (kind === "explore") return <svg {...common}><path d="M10 44C18 22 30 46 39 26C44 15 51 18 55 11" stroke={palette.ochre} strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9"/><circle cx="10" cy="44" r="4" fill={palette.gold}/><circle cx="39" cy="26" r="4" fill={palette.clay}/><circle cx="55" cy="11" r="4" fill={palette.ochre}/></svg>;
  if (kind === "return") return <svg {...common}><path d="M48 19C39 10 22 13 16 26C11 37 17 49 29 50C39 51 47 44 48 35" stroke="#C65F1A" strokeWidth="6" strokeLinecap="round"/><path d="M12 24L17 13L28 17" stroke={palette.gold} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === "proof") return <svg {...common}><circle cx="32" cy="32" r="22" stroke={palette.ochre} strokeWidth="4"/><circle cx="32" cy="32" r="10" stroke={palette.gold} strokeWidth="3"/><circle cx="32" cy="32" r="3.5" fill={palette.ochre}/></svg>;
  return <svg {...common}><rect x="12" y="12" width="40" height="40" rx="12" stroke={palette.gold} strokeWidth="3.5"/><circle cx="32" cy="32" r="11" fill={palette.clay} stroke={palette.ochre} strokeWidth="3"/><circle cx="32" cy="32" r="3.5" fill={palette.sand}/></svg>;
}

function LabSection({ number, kicker, title, copy, children }: { number: string; kicker: string; title: string; copy: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 pt-20">
      <div className="mb-12 grid gap-7 lg:grid-cols-[1fr_.52fr] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6a00]">{number} · {kicker}</p>
          <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">{title}</h2>
        </div>
        <div className="border-l border-[#ff6a00]/35 pl-5"><p className="text-sm leading-6 text-white/48">{copy}</p></div>
      </div>
      {children}
    </section>
  );
}

function StateTabs<T extends string>({ states, active, setActive }: { states: readonly T[]; active: T; setActive: (value: T) => void }) {
  return <div className="flex flex-wrap gap-2">{states.map(state => <button key={state} type="button" onClick={() => setActive(state)} className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${active === state ? "border-[#ff6a00]/55 bg-[#ff6a00]/10 text-[#ff9a4d]" : "border-white/10 text-white/45 hover:text-white"}`}>{state}</button>)}</div>;
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[410px] overflow-hidden rounded-[2.6rem] border border-white/10 bg-[#09090a] shadow-[0_30px_90px_rgba(0,0,0,.55)]">{children}</div>;
}

function RuleStrip({ items }: { items: Array<[string, string]> }) {
  return <div className="mt-8 grid border border-white/10 md:grid-cols-4">{items.map(([title, copy], i) => <div key={title} className="border-white/10 p-5 md:border-r md:last:border-r-0"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff6a00]">0{i + 1}</p><h4 className="mt-4 font-serif text-xl font-bold">{title}</h4><p className="mt-2 text-xs leading-5 text-white/45">{copy}</p></div>)}</div>;
}

const pollOptions = [
  { id: "live", label: "A live music session", votes: 812 },
  { id: "food", label: "A late-night food market", votes: 621 },
  { id: "creator", label: "A creator workshop", votes: 428 },
] as const;

type PollPhase = "Signal" | "Results" | "Demand forming" | "Activated";
const pollPhases = ["Signal", "Results", "Demand forming", "Activated"] as const;

function DiscoverySystemStudy() {
  const [phase, setPhase] = useState<PollPhase>("Signal");
  const [selected, setSelected] = useState<string | null>(null);
  const total = pollOptions.reduce((sum, item) => sum + item.votes, 0) + (selected ? 1 : 0);
  return (
    <LabSection number="12" kicker="Discovery & demand" title="Demand should feel like it is becoming visible." copy="Discovery is not merely recommendation. A signal can accumulate, become legible as demand, and eventually become a Moment. The interface must make that transformation feel consequential without pretending every poll is a promise of supply.">
      <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
        <PhoneFrame>
          <div className="p-5 pt-7"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff6a00]">Kingston wants to know</p><h3 className="mt-2 font-serif text-[2.3rem] font-bold leading-[.92]">What should Kingston get next?</h3></div><Vote className="h-5 w-5 text-[#ff6a00]"/></div><p className="mt-3 text-sm leading-6 text-white/48">Your signal helps show where demand is forming.</p></div>
          <div className="px-5 pb-5"><StateTabs states={pollPhases} active={phase} setActive={setPhase}/></div>
          <div className="border-y border-white/10 px-5 py-5">
            {pollOptions.map((option, index) => {
              const isSelected = selected === option.id;
              const percent = Math.round(((option.votes + (isSelected ? 1 : 0)) / total) * 100);
              return <button key={option.id} type="button" onClick={() => phase === "Signal" && setSelected(option.id)} className={`mb-3 w-full overflow-hidden rounded-[1.2rem] border p-4 text-left last:mb-0 ${isSelected ? "border-[#ff6a00]/55 bg-[#ff6a00]/8" : "border-white/10"}`}><div className="flex items-center justify-between gap-4"><span className="font-bold">{option.label}</span>{phase === "Signal" ? <span className={`grid h-5 w-5 place-items-center rounded-full border ${isSelected ? "border-[#ff6a00] bg-[#ff6a00] text-black" : "border-white/25"}`}>{isSelected ? <Check className="h-3 w-3"/> : null}</span> : <span className="text-sm font-black text-[#f6c453]">{percent}%</span>}</div>{phase !== "Signal" ? <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#7a2e17] to-[#ff6a00]" style={{ width: `${percent}%` }}/></div> : null}</button>;
            })}
          </div>
          <div className="p-5">
            {phase === "Signal" ? <div className="rounded-2xl border border-white/10 p-4"><p className="text-xs text-white/42">{total.toLocaleString()} signals</p><button type="button" disabled={!selected} onClick={() => selected && setPhase("Results")} className="mt-3 flex min-h-12 w-full items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black disabled:opacity-35"><span>Send signal</span><ArrowRight className="h-4 w-4"/></button></div> : null}
            {phase === "Results" ? <div className="rounded-2xl border border-white/10 p-4"><BrandMark kind="proof" size={34}/><p className="mt-3 text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Signal recorded</p><p className="mt-1 font-serif text-xl font-bold">You helped make demand visible.</p><p className="mt-2 text-xs leading-5 text-white/45">Results are directional demand, not a guaranteed event.</p></div> : null}
            {phase === "Demand forming" ? <div className="rounded-2xl border border-[#ff6a00]/25 bg-[#7a2e17]/10 p-4"><BrandMark kind="explore" size={38}/><p className="mt-3 text-[10px] font-black uppercase tracking-[.16em] text-[#ff9a4d]">Demand forming</p><p className="mt-1 font-serif text-xl font-bold">A live music session is pulling away.</p><p className="mt-2 text-xs leading-5 text-white/45">PROMORANG can now show promoters and partners a credible demand signal.</p></div> : null}
            {phase === "Activated" ? <div className="rounded-2xl border border-[#22c55e]/25 bg-[#22c55e]/5 p-4"><BrandMark kind="move" size={38}/><p className="mt-3 text-[10px] font-black uppercase tracking-[.16em] text-[#22c55e]">Moment created</p><p className="mt-1 font-serif text-xl font-bold">Kingston Live Room · Oct 03</p><p className="mt-2 text-xs leading-5 text-white/45">The demand signal now has a real supply response, with issuer and terms.</p></div> : null}
          </div>
        </PhoneFrame>
        <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-6 lg:p-8"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#ff6a00]">Desktop / operator-visible demand story</p><h3 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-[.95]">A Discovery has a lifecycle, not just a radio group.</h3><div className="mt-8 grid gap-4 md:grid-cols-4">{[["Signal","People express preference.","explore"],["Pattern","Demand becomes statistically useful.","proof"],["Response","A host / merchant / creator answers it.","move"],["Moment","Supply exists and can be acted on.","return"]].map(([title, copy, mark]) => <div key={title} className="rounded-2xl border border-white/10 p-5"><BrandMark kind={mark as MarkKind} size={34}/><p className="mt-5 text-[10px] font-black uppercase tracking-[.15em] text-[#ff9a4d]">{title}</p><p className="mt-2 text-sm leading-6 text-white/52">{copy}</p></div>)}</div><div className="mt-8 rounded-[1.5rem] border border-[#f6c453]/20 bg-[#f6c453]/5 p-5"><p className="text-sm font-bold text-[#f6c453]">Trust rule</p><p className="mt-2 text-sm leading-6 text-white/52">The UI must distinguish “people want this” from “this is happening.” A demand signal should never masquerade as confirmed inventory.</p></div></div>
      </div>
      <RuleStrip items={[["Signal before reward","Voting should feel intrinsically meaningful; rewards are secondary."],["Show the denominator","Totals, timing and scope make demand credible."],["Demand ≠ supply","Activated state requires a real issuer / host response."],["Return to the user","When a Discovery becomes a Moment, people who signaled should see the return."]]}/>
    </LabSection>
  );
}

type PieceState = "Earned" | "Kept" | "Listed" | "Transferred";
const pieceStates = ["Earned", "Kept", "Listed", "Transferred"] as const;

function PieceObject({ state }: { state: PieceState }) {
  const meta: Record<PieceState, [string, string]> = { Earned: ["RETURN VERIFIED", "New Piece ready to keep"], Kept: ["KEPT · 0042", "Owned by Andre"], Listed: ["MARKET · 0042", "Listed for 28 Gems"], Transferred: ["PROVENANCE · 0042", "Transferred · history retained"] };
  return <div className="relative overflow-hidden rounded-[2rem] border border-[#694880]/55 bg-[radial-gradient(circle_at_90%_0%,rgba(181,140,255,.2),transparent_34%),linear-gradient(140deg,#17101f,#0c0b0e_58%,#17100d)] p-6 shadow-[0_26px_70px_rgba(0,0,0,.5)]"><div className="absolute -right-6 -top-8 opacity-25"><BrandMark kind="kept" size={130}/></div><div className="relative"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#b58cff]">{meta[state][0]}</p><p className="mt-1 text-xs text-white/40">{meta[state][1]}</p></div><Layers3 className="h-5 w-5 text-[#b58cff]"/></div><p className="mt-14 text-[10px] font-black uppercase tracking-[.15em] text-white/38">Food & Taste</p><h3 className="mt-2 max-w-sm font-serif text-3xl font-bold leading-[.95]">Opening Run · Piece 0042</h3><p className="mt-3 text-sm leading-6 text-white/52">Liguanea · verified return · Sep 18</p><div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-xs"><div><p className="text-white/30">ORIGIN</p><p className="mt-1 font-bold">Broken Plate</p></div><div><p className="text-white/30">PROOF</p><p className="mt-1 font-bold">Verified use</p></div><div><p className="text-white/30">UTILITY</p><p className="mt-1 font-bold">Food Scene access</p></div></div></div></div>;
}

function PiecesStudy() {
  const [state, setState] = useState<PieceState>("Kept");
  return <LabSection number="13" kicker="Pieces & provenance" title="A Piece should feel like something you can carry forward." copy="Pieces are the canonical Kept object: durable records of participation that can carry provenance, identity, utility and—where enabled—market context. They should not look like screenshots of NFTs or generic collectible cards.">
    <div className="grid gap-8 xl:grid-cols-[1fr_.78fr]">
      <div><StateTabs states={pieceStates} active={state} setActive={setState}/><div className="mt-6"><PieceObject state={state}/></div></div>
      <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-6 lg:p-8"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#b58cff]">Provenance</p><h3 className="mt-3 font-serif text-4xl font-bold">The story stays attached.</h3><div className="mt-7 space-y-0">{[["MOVE","Lunch offer surfaced","Sep 18 · 12:04 PM","move"],["RETURN","20% benefit used","Sep 18 · 1:14 PM","return"],["PROOF","Merchant validation recorded","Sep 18 · 1:15 PM","proof"],["KEPT","Piece 0042 minted into Vault","Sep 18 · 1:15 PM","kept"]].map(([label,title,when,kind], index) => <div key={label} className="grid grid-cols-[46px_1fr] gap-4"><div className="relative flex justify-center"><BrandMark kind={kind as MarkKind} size={34}/>{index < 3 ? <span className="absolute bottom-[-24px] top-[34px] w-px bg-white/10"/> : null}</div><div className="pb-7"><p className="text-[9px] font-black tracking-[.16em] text-[#ff9a4d]">{label}</p><p className="mt-1 font-bold">{title}</p><p className="mt-1 text-xs text-white/38">{when}</p></div></div>)}</div><div className="rounded-2xl border border-white/10 p-4"><p className="text-xs font-bold">Ownership can change. Provenance cannot.</p><p className="mt-2 text-xs leading-5 text-white/42">If a Piece is transferred or sold, the UI should preserve issuer, origin, proof and prior transaction history without exposing unnecessary personal data.</p></div></div>
    </div>
    <RuleStrip items={[["Earned ≠ bought","Origin should distinguish participation from marketplace acquisition."],["Provenance first","The reason the Piece exists is more important than speculative price."],["Utility explicit","Access, boosts or perks must be concrete and time-bounded."],["Identity without hype","Pieces enrich a collection; they should not imply financial investment value."]]}/>
  </LabSection>;
}

type MarketMode = "Browse" | "Detail" | "Buy" | "List mine";
const marketModes = ["Browse", "Detail", "Buy", "List mine"] as const;
const marketPieces = [
  ["0118","Barbican Night Signal","Kingston After Dark","36 Gems"],
  ["0207","Move Jamaica First Drive","Move Jamaica","42 Gems"],
  ["0315","New Kingston Room","Community","24 Gems"],
] as const;

function PieceMarketplaceStudy() {
  const [mode,setMode] = useState<MarketMode>("Browse");
  const [balance,setBalance] = useState(74);
  const selected = marketPieces[0];
  return <LabSection number="14" kicker="Piece Marketplace" title="A market should make provenance easier to trust, not easier to ignore." copy="The Piece Marketplace is a real exchange surface, so it needs browse, detail, acquisition, listing and transaction states. Its visual language should remain collectible and cultural—not collapse into a crypto terminal or stock chart.">
    <div className="grid gap-8 xl:grid-cols-[1.12fr_.7fr]">
      <div className="rounded-[2rem] border border-white/10 bg-[#0b0b0c] p-6 lg:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><StateTabs states={marketModes} active={mode} setActive={setMode}/><div className="flex items-center gap-2 rounded-full border border-[#4cc6f0]/20 px-4 py-2"><Gem className="h-4 w-4 text-[#4cc6f0]"/><span className="text-sm font-black text-[#4cc6f0]">{balance} Gems</span></div></div>
        {mode === "Browse" ? <div className="mt-8 grid gap-4 md:grid-cols-3">{marketPieces.map(([serial,title,scene,ask]) => <button key={serial} type="button" onClick={() => setMode("Detail")} className="rounded-[1.5rem] border border-[#694880]/35 bg-[radial-gradient(circle_at_100%_0%,rgba(181,140,255,.12),transparent_40%),#101012] p-5 text-left"><p className="text-[10px] font-black tracking-[.16em] text-[#b58cff]">PIECE · {serial}</p><h4 className="mt-8 font-serif text-xl font-bold leading-[1]">{title}</h4><p className="mt-2 text-xs text-white/40">{scene}</p><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-xs font-bold text-[#4cc6f0]">{ask}</span><ArrowRight className="h-4 w-4 text-white/35"/></div></button>)}</div> : null}
        {mode === "Detail" ? <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1fr]"><PieceObject state="Listed"/><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#b58cff]">Listed Piece</p><h3 className="mt-3 font-serif text-3xl font-bold">{selected[1]}</h3><p className="mt-3 text-sm leading-6 text-white/48">Earned from verified movement in Barbican. Seller acquired it through participation, not a previous market purchase.</p><dl className="mt-6 grid grid-cols-2 gap-4 text-xs"><div><dt className="text-white/30">ASK</dt><dd className="mt-1 text-xl font-black text-[#4cc6f0]">{selected[3]}</dd></div><div><dt className="text-white/30">SELLER</dt><dd className="mt-1 font-bold">Verified holder</dd></div><div><dt className="text-white/30">UTILITY</dt><dd className="mt-1 font-bold">Scene access boost</dd></div><div><dt className="text-white/30">PROVENANCE</dt><dd className="mt-1 font-bold">4 verified events</dd></div></dl><button type="button" onClick={() => setMode("Buy")} className="mt-7 flex min-h-12 w-full items-center justify-between rounded-full bg-[#eadcc6] px-5 text-sm font-black text-black">Review purchase<ArrowRight className="h-4 w-4"/></button></div></div> : null}
        {mode === "Buy" ? <div className="mx-auto mt-8 max-w-xl rounded-[1.7rem] border border-white/10 p-6"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#4cc6f0]">Review purchase</p><h3 className="mt-2 font-serif text-3xl font-bold">Barbican Night Signal</h3><div className="mt-6 space-y-3 border-y border-white/10 py-5 text-sm"><div className="flex justify-between"><span className="text-white/45">Price</span><span className="font-bold">36 Gems</span></div><div className="flex justify-between"><span className="text-white/45">Your balance</span><span className="font-bold">{balance} Gems</span></div><div className="flex justify-between"><span className="text-white/45">After purchase</span><span className="font-bold text-[#4cc6f0]">{Math.max(0,balance-36)} Gems</span></div></div><button type="button" onClick={() => { setBalance(Math.max(0,balance-36)); setMode("Detail"); }} className="mt-6 flex min-h-12 w-full items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black">Buy Piece<CheckCircle2 className="h-4 w-4"/></button><p className="mt-3 text-center text-[11px] leading-5 text-white/35">Review fixture. Production must show fees, settlement, transfer rules and irreversible actions explicitly.</p></div> : null}
        {mode === "List mine" ? <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1fr]"><PieceObject state="Kept"/><div className="rounded-[1.5rem] border border-white/10 p-5"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#b58cff]">List Piece 0042</p><label className="mt-5 block text-xs font-bold text-white/52">Ask in Gems</label><div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-2xl font-black text-[#4cc6f0]">28 Gems</div><div className="mt-5 rounded-xl border border-[#f6c453]/15 bg-[#f6c453]/5 p-4 text-xs leading-5 text-white/46">Listing changes availability, not provenance. Any market fee and cancellation rule must be shown before confirmation.</div><button type="button" className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full border border-white/15 px-5 text-sm font-black">Preview listing<ArrowRight className="h-4 w-4"/></button></div></div> : null}
      </div>
      <div className="space-y-4"><div className="rounded-[1.6rem] border border-[#4cc6f0]/20 bg-[#4cc6f0]/5 p-5"><ShieldCheck className="h-5 w-5 text-[#4cc6f0]"/><p className="mt-4 font-serif text-2xl font-bold">Market trust stack</p><div className="mt-5 space-y-4 text-sm">{["Verified provenance before price","Clear current holder / seller state","Utility separated from market ask","Gem balance and fees before confirmation","Transfer history after settlement"].map(item => <div key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e]"/><span className="text-white/58">{item}</span></div>)}</div></div><div className="rounded-[1.6rem] border border-white/10 p-5"><p className="text-xs font-bold text-[#ff9a4d]">Never imply</p><p className="mt-2 text-sm leading-6 text-white/48">That a Piece is an investment, guaranteed to appreciate, or equivalent to cash. The marketplace is for collectible/utility exchange inside the product economy.</p></div></div>
    </div>
  </LabSection>;
}

type KeyState = "Locked" | "Unlocked" | "Active" | "Expiring" | "Used";
const keyStates = ["Locked","Unlocked","Active","Expiring","Used"] as const;

function PromoKeysStudy() {
  const [state,setState] = useState<KeyState>("Active");
  const meta: Record<KeyState,{color:string;headline:string;copy:string;cta:string}> = {
    Locked:{color:"#666",headline:"Not open yet.",copy:"Complete the required action to unlock this perk.",cta:"See how to unlock"},
    Unlocked:{color:palette.gold,headline:"A door just opened.",copy:"This Key is yours. Activation terms are visible before use.",cta:"Activate Key"},
    Active:{color:palette.leaf,headline:"Ready when you are.",copy:"Complimentary wings at Sea Deck · Wed · 10 PM–12 AM.",cta:"Show Key"},
    Expiring:{color:palette.ochre,headline:"Use it tonight.",copy:"This Key expires in 2h 14m. Merchant validation is required.",cta:"Show Key"},
    Used:{color:palette.water,headline:"Used · proof returned.",copy:"Sea Deck validated this perk at 11:08 PM.",cta:"View proof"},
  };
  const current=meta[state];
  return <LabSection number="15" kicker="PromoKeys & perks" title="A Key should feel like access, not another coupon." copy="PromoKeys are compact gated-access objects. The UI must make unlock conditions, issuer, validity, merchant validation and used/expired states obvious while keeping the object emotionally distinct from PromoCard itself.">
    <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
      <div><StateTabs states={keyStates} active={state} setActive={setState}/><div className="mt-6 rounded-[2rem] border border-[#d49a35]/35 bg-[radial-gradient(circle_at_100%_0%,rgba(122,46,23,.26),transparent_36%),linear-gradient(145deg,#101011,#0b0b0c)] p-6 shadow-[0_28px_70px_rgba(0,0,0,.5)]"><div className="flex items-start justify-between"><PromorangMark size={42}/><div className="grid h-11 w-11 place-items-center rounded-full border border-[#f6c453]/35"><KeyRound className="h-5 w-5 text-[#f6c453]"/></div></div><p className="mt-12 text-[10px] font-black uppercase tracking-[.18em] text-[#ff9a4d]">PROMOKEY · SEA DECK</p><h3 className="mt-2 font-serif text-3xl font-bold">AFTRHRS Wing Key</h3><p className="mt-2 text-sm text-white/46">Complimentary wings · issued through Food & Taste</p><div className="mt-7 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:current.color}}/><span className="text-xs font-black uppercase tracking-[.14em]" style={{color:current.color}}>{state}</span></div><p className="mt-3 font-serif text-xl font-bold">{current.headline}</p><p className="mt-2 text-sm leading-6 text-white/48">{current.copy}</p><button type="button" className="mt-6 flex min-h-12 w-full items-center justify-between rounded-full bg-[#eadcc6] px-5 text-sm font-black text-black"><span>{current.cta}</span><ArrowRight className="h-4 w-4"/></button></div></div>
      <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-6 lg:p-8"><h3 className="font-serif text-4xl font-bold">One object. Five trust states.</h3><div className="mt-8 grid gap-4 md:grid-cols-5">{keyStates.map((item,index) => <div key={item} className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] font-black text-[#ff9a4d]">0{index+1}</p><p className="mt-8 font-bold">{item}</p><p className="mt-2 text-xs leading-5 text-white/42">{meta[item].copy}</p></div>)}</div><div className="mt-8 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/10 p-5"><p className="text-xs font-black uppercase tracking-[.15em] text-[#f6c453]">Issuer truth</p><p className="mt-3 text-sm leading-6 text-white/48">Every Key shows issuer, venue, validity and redemption requirements before activation.</p></div><div className="rounded-2xl border border-white/10 p-5"><p className="text-xs font-black uppercase tracking-[.15em] text-[#4cc6f0]">Return truth</p><p className="mt-3 text-sm leading-6 text-white/48">After merchant validation, the Key stops behaving like access and returns as Proof in Vault / You.</p></div></div></div>
    </div>
  </LabSection>;
}

type DrawState = "Open" | "Closing" | "Drawing" | "Result" | "Won";
const drawStates = ["Open","Closing","Drawing","Result","Won"] as const;

function PromoShareStudy() {
  const [state,setState] = useState<DrawState>("Open");
  const [tickets,setTickets] = useState(6);
  return <LabSection number="16" kicker="PromoShare & draws" title="A draw should feel like theatre with an audit trail." copy="PromoShare needs its own lifecycle: prize, named draw, ticket provenance, deadline, result and claim history. Tickets must belong to specific draws, and the interface should never blur PromoShare with leaderboard status or general points.">
    <div className="grid gap-8 xl:grid-cols-[470px_1fr]">
      <div><StateTabs states={drawStates} active={state} setActive={setState}/><div className="mt-6 overflow-hidden rounded-[2rem] border border-[#d49a35]/35 bg-[radial-gradient(circle_at_50%_-10%,rgba(246,196,83,.2),transparent_38%),#0b0b0c]"><div className="p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f6c453]">PROMOSHARE · KINGSTON</p><h3 className="mt-2 font-serif text-3xl font-bold">Kingston Food Drop</h3></div><Ticket className="h-7 w-7 text-[#f6c453]"/></div><p className="mt-4 text-sm text-white/52">Dinner for two + AFTRHRS PromoKey</p><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] uppercase tracking-[.13em] text-white/35">Your tickets</p><p className="mt-2 text-3xl font-black text-[#f6c453]">{tickets}</p></div><div className="rounded-2xl border border-white/10 p-4"><p className="text-[10px] uppercase tracking-[.13em] text-white/35">Status</p><p className="mt-2 text-sm font-black">{state === "Open" ? "Closes · 8 PM" : state}</p></div></div>
        {state === "Open" || state === "Closing" ? <button type="button" onClick={() => setTickets(value => value + 1)} className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full bg-[#f6c453] px-5 text-sm font-black text-black"><span>Share for another ticket</span><Share2 className="h-4 w-4"/></button> : null}
        {state === "Drawing" ? <div className="mt-6 rounded-2xl border border-[#f6c453]/20 bg-[#f6c453]/5 p-5 text-center"><Radio className="mx-auto h-6 w-6 animate-pulse text-[#f6c453]"/><p className="mt-3 font-serif text-2xl font-bold">Drawing from verified tickets.</p><p className="mt-2 text-xs text-white/42">Ticket set locked at close.</p></div> : null}
        {state === "Result" ? <div className="mt-6 rounded-2xl border border-white/10 p-5 text-center"><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#f6c453]">Draw complete</p><p className="mt-3 font-serif text-2xl font-bold">Winning ticket · PS-18429</p><p className="mt-2 text-xs text-white/42">Your tickets remain auditable in draw history.</p></div> : null}
        {state === "Won" ? <div className="mt-6 rounded-2xl border border-[#22c55e]/25 bg-[#22c55e]/5 p-5"><Trophy className="h-6 w-6 text-[#22c55e]"/><p className="mt-3 text-[10px] font-black uppercase tracking-[.15em] text-[#22c55e]">Your ticket won</p><p className="mt-2 font-serif text-2xl font-bold">Dinner for two is ready to claim.</p><button type="button" className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-black text-black">Claim reward<ArrowRight className="h-4 w-4"/></button></div> : null}
        </div><div className="border-t border-white/10 bg-white/[.02] p-5"><p className="text-[10px] font-black uppercase tracking-[.15em] text-white/35">How you got {tickets} tickets</p><div className="mt-4 space-y-3 text-sm">{[["Participation","2"],["Sharing","3"],["Partner action",String(Math.max(1,tickets-5))]].map(([label,value]) => <div key={label} className="flex items-center justify-between"><span className="text-white/48">{label}</span><span className="font-black">{value}</span></div>)}</div></div></div></div>
      <div className="space-y-5"><div className="rounded-[2rem] border border-white/10 p-6 lg:p-8"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f6c453]">Draw integrity</p><h3 className="mt-3 font-serif text-4xl font-bold">The user should always know what draw a ticket belongs to.</h3><div className="mt-8 grid gap-4 md:grid-cols-2">{[["Named prize","What can actually be won"],["Named draw","The pool / campaign identity"],["Ticket provenance","How each entry was earned"],["Close time","When the ticket set becomes final"],["Result record","Winning ticket and timestamp"],["Claim state","If/how a winner collects"]].map(([title,copy]) => <div key={title} className="rounded-xl border border-white/10 p-4"><p className="font-bold">{title}</p><p className="mt-2 text-xs text-white/42">{copy}</p></div>)}</div></div><div className="rounded-[1.5rem] border border-[#ff6a00]/20 bg-[#7a2e17]/10 p-5"><p className="text-sm font-bold text-[#ff9a4d]">Separation rule</p><p className="mt-2 text-sm leading-6 text-white/52">PromoShare tickets are chances in named draws. They are not Gems, Points, leaderboard weight, cash, or a universal ticket balance that can silently move between draws.</p></div></div>
    </div>
  </LabSection>;
}

type SaveState = "Choose" | "Confirm" | "Parked" | "Draw" | "Returned";
const saveStates = ["Choose","Confirm","Parked","Draw","Returned"] as const;

function SaveWinStudy() {
  const [state,setState] = useState<SaveState>("Choose");
  const [amount,setAmount] = useState(25);
  const tickets = Math.max(1, Math.floor(amount / 5));
  return <LabSection number="17" kicker="Save & Win" title="The principal should feel safer than the prize feels exciting." copy="Save & Win is economically different from a perk draw: a participant parks Gems, keeps principal ownership, receives tickets for a named draw, and may win additional Gems from a committed prize pool. The UX must make that structure unmistakable.">
    <div className="grid gap-8 xl:grid-cols-[470px_1fr]">
      <div><StateTabs states={saveStates} active={state} setActive={setState}/><div className="mt-6 rounded-[2rem] border border-[#4cc6f0]/28 bg-[radial-gradient(circle_at_100%_0%,rgba(76,198,240,.13),transparent_38%),#0b0b0c] p-6"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#4cc6f0]">SAVE & WIN</p><h3 className="mt-2 font-serif text-3xl font-bold">Weekend 100 Gem Pot</h3></div><Trophy className="h-7 w-7 text-[#4cc6f0]"/></div><p className="mt-3 text-sm text-white/48">Park Gems → receive tickets → principal remains yours.</p>
        {state === "Choose" ? <div className="mt-7"><p className="text-xs font-bold text-white/50">Choose Gems to park</p><div className="mt-3 grid grid-cols-3 gap-2">{[10,25,50].map(value => <button key={value} type="button" onClick={() => setAmount(value)} className={`rounded-xl border px-3 py-4 text-lg font-black ${amount===value?"border-[#4cc6f0]/55 bg-[#4cc6f0]/10 text-[#4cc6f0]":"border-white/10"}`}>{value}</button>)}</div><button type="button" onClick={() => setState("Confirm")} className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full bg-[#4cc6f0] px-5 text-sm font-black text-black">Review parking<ArrowRight className="h-4 w-4"/></button></div> : null}
        {state === "Confirm" ? <div className="mt-7 rounded-2xl border border-white/10 p-5"><div className="flex justify-between text-sm"><span className="text-white/45">Gems parked</span><span className="font-black">{amount}</span></div><div className="mt-3 flex justify-between text-sm"><span className="text-white/45">Tickets received</span><span className="font-black text-[#f6c453]">{tickets}</span></div><div className="mt-3 flex justify-between text-sm"><span className="text-white/45">Principal after draw</span><span className="font-black text-[#22c55e]">{amount} Gems remain yours</span></div><button type="button" onClick={() => setState("Parked")} className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-black text-black">Park {amount} Gems<CheckCircle2 className="h-4 w-4"/></button></div> : null}
        {state === "Parked" ? <div className="mt-7 rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-5"><CheckCircle2 className="h-6 w-6 text-[#22c55e]"/><p className="mt-3 font-serif text-2xl font-bold">{amount} Gems parked.</p><p className="mt-2 text-sm text-white/48">You have {tickets} tickets in the Weekend 100 Gem Pot.</p><p className="mt-4 text-xs font-bold text-[#22c55e]">Your principal remains yours.</p></div> : null}
        {state === "Draw" ? <div className="mt-7 text-center"><Radio className="mx-auto h-7 w-7 animate-pulse text-[#4cc6f0]"/><p className="mt-4 font-serif text-2xl font-bold">100 extra Gems are being drawn.</p><p className="mt-2 text-xs text-white/42">Your {amount} parked Gems are not the prize pool.</p></div> : null}
        {state === "Returned" ? <div className="mt-7 rounded-2xl border border-white/10 p-5"><BrandMark kind="return" size={38}/><p className="mt-3 text-[10px] font-black uppercase tracking-[.15em] text-[#ff9a4d]">Principal available</p><p className="mt-2 font-serif text-2xl font-bold">{amount} Gems returned to spendable balance.</p><p className="mt-2 text-xs leading-5 text-white/42">Draw result remains in history separately.</p></div> : null}
      </div></div>
      <div className="grid gap-5 md:grid-cols-2"><div className="rounded-[1.7rem] border border-[#22c55e]/20 bg-[#22c55e]/5 p-6"><LockKeyhole className="h-6 w-6 text-[#22c55e]"/><p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#22c55e]">Principal</p><h3 className="mt-2 font-serif text-3xl font-bold">Still yours.</h3><p className="mt-3 text-sm leading-6 text-white/50">Parking should never visually resemble spending or losing Gems. The user needs a persistent balance/state showing that principal remains attributable to them.</p></div><div className="rounded-[1.7rem] border border-[#4cc6f0]/20 bg-[#4cc6f0]/5 p-6"><Trophy className="h-6 w-6 text-[#4cc6f0]"/><p className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#4cc6f0]">Prize</p><h3 className="mt-2 font-serif text-3xl font-bold">Already committed.</h3><p className="mt-3 text-sm leading-6 text-white/50">The additional-Gem prize must be distinct from parked principal. The draw should state who funds it and its fixed amount.</p></div><div className="md:col-span-2 rounded-[1.7rem] border border-white/10 p-6"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#f6c453]">Safety / clarity hierarchy</p><div className="mt-6 grid gap-4 md:grid-cols-4">{[["1","You have 74 Gems"],["2",`${amount} are parked`],["3",`${tickets} draw tickets earned`],["4","100 extra Gems is the prize"]].map(([num,text]) => <div key={num} className="rounded-xl border border-white/10 p-4"><p className="text-sm font-black text-[#f6c453]">{num}</p><p className="mt-3 text-sm leading-5 text-white/55">{text}</p></div>)}</div></div></div>
    </div>
  </LabSection>;
}

type LedgerTab = "Gems" | "Points" | "Tickets";
const ledgerTabs = ["Gems","Points","Tickets"] as const;

function ValueSystemStudy() {
  const [tab,setTab] = useState<LedgerTab>("Gems");
  const ledger = useMemo(() => ({
    Gems:{icon:Gem,color:palette.water,balance:"74",meaning:"Spendable platform value",rows:[["Piece purchase","-36","Today"],["Save & Win return","+25","Yesterday"],["Merchant reward","+10","Sep 14"]]},
    Points:{icon:Sparkles,color:"#ff9a4d",balance:"1,840",meaning:"Record of participation",rows:[["Discovery signal","+15","Today"],["Workshop attendance","+120","Saturday"],["Verified lunch use","+80","Sep 18"]]},
    Tickets:{icon:Ticket,color:palette.gold,balance:"11",meaning:"Entries assigned to named draws",rows:[["Kingston Food Drop","6","Closes tonight"],["Weekend 100 Gem Pot","5","Closes Friday"],["Past draw","0","Completed"]]},
  } as const)[tab],[tab]);
  const Icon = ledger.icon;
  return <LabSection number="18" kicker="Value system" title="Gems, Points and Tickets should never feel like three mystery numbers." copy="Each value object has a different job and therefore deserves a different UI treatment. Gems are spendable internal value, Points record participation, and PromoShare tickets are entries tied to named draws. Their histories and actions must reinforce those differences.">
    <div className="grid gap-8 xl:grid-cols-[.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0f] p-6 lg:p-8"><StateTabs states={ledgerTabs} active={tab} setActive={setTab}/><div className="mt-8 flex items-end justify-between border-b border-white/10 pb-6"><div><div className="flex items-center gap-3"><Icon className="h-6 w-6" style={{color:ledger.color}}/><span className="text-[10px] font-black uppercase tracking-[.16em] text-white/35">{tab} balance</span></div><p className="mt-3 text-5xl font-black" style={{color:ledger.color}}>{ledger.balance}</p><p className="mt-2 text-sm text-white/45">{ledger.meaning}</p></div><WalletCards className="h-7 w-7 text-white/15"/></div><div className="mt-5 divide-y divide-white/10">{ledger.rows.map(([name,value,when]) => <div key={name} className="grid grid-cols-[1fr_auto] gap-4 py-4"><div><p className="text-sm font-bold">{name}</p><p className="mt-1 text-xs text-white/36">{when}</p></div><p className="font-black" style={{color:ledger.color}}>{value}</p></div>)}</div><button type="button" className="mt-5 flex min-h-12 w-full items-center justify-between rounded-full border border-white/12 px-5 text-sm font-black">View full {tab.toLowerCase()} history<History className="h-4 w-4"/></button></div>
      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-[1.7rem] border border-[#4cc6f0]/25 bg-[#4cc6f0]/5 p-6"><Gem className="h-7 w-7 text-[#4cc6f0]"/><h3 className="mt-6 font-serif text-2xl font-bold">Gems</h3><p className="mt-2 text-sm leading-6 text-white/48">Spend, park, receive and transact. Every change belongs in a monetary-style ledger with explicit source/destination.</p><div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/38">Primary home · Vault<br/>Context · Marketplace, rewards, Save & Win</div></div><div className="rounded-[1.7rem] border border-[#ff9a4d]/25 bg-[#7a2e17]/8 p-6"><Sparkles className="h-7 w-7 text-[#ff9a4d]"/><h3 className="mt-6 font-serif text-2xl font-bold">Points</h3><p className="mt-2 text-sm leading-6 text-white/48">Participation proof. Useful for progression, standing or eligibility—but should not visually impersonate money.</p><div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/38">Primary home · You / Vault<br/>Context · Missions, participation</div></div><div className="rounded-[1.7rem] border border-[#f6c453]/25 bg-[#f6c453]/5 p-6"><Ticket className="h-7 w-7 text-[#f6c453]"/><h3 className="mt-6 font-serif text-2xl font-bold">Tickets</h3><p className="mt-2 text-sm leading-6 text-white/48">Not a universal currency. Every ticket belongs to a named PromoShare / Save & Win draw with its own result.</p><div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/38">Primary home · named draw<br/>Summary · Vault</div></div></div>
    </div>
    <RuleStrip items={[["Different nouns","Never call all three rewards, credits or balance."],["Different actions","Spend Gems, earn Points, enter draws with Tickets."],["Different histories","Ledgers must preserve source, destination and named draw association."],["Context over dashboard","Show the value object where it can actually be used, not only in a balance row."]]}/>
  </LabSection>;
}

export function PromorangEconomyLab() {
  return <div className="space-y-24"><DiscoverySystemStudy/><PiecesStudy/><PieceMarketplaceStudy/><PromoKeysStudy/><PromoShareStudy/><SaveWinStudy/><ValueSystemStudy/></div>;
}
