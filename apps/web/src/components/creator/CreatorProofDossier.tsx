import { FileCheck2, Link2, Scale, WalletCards } from "lucide-react";
import CreatorReleaseWorkspaceBridge from "@/components/creator/CreatorReleaseWorkspaceBridge";
import CreatorAttributionMap from "@/components/creator/CreatorAttributionMap";
import CreatorEarningsVault from "@/components/creator/CreatorEarningsVault";

export function CreatorProofDossier() {
  return (
    <div className="space-y-6" data-proof-family="creator-proof-dossier">
      <section className="overflow-hidden border border-violet-400/20 bg-[#17121d] text-white shadow-2xl">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-violet-300/25 bg-violet-300/10 text-violet-200"><FileCheck2 className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">Creator · proof dossier</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em]">Show what moved, then keep credit and money separate.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">This dossier composes existing release, attribution and earnings records. Publishing work is not verification. Verified attribution is not settlement. Approved earnings are not paid earnings.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 bg-black/20 p-5 lg:border-l lg:border-t-0 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Reading order</p>
            <div className="mt-4 space-y-3">
              {[
                ["01", "Work record", "What was commissioned or released."],
                ["02", "Attribution", "What activity can be tied back to the work."],
                ["03", "Earnings", "What value is pending, approved, settled or reversed."],
              ].map(([number, title, copy]) => (
                <div key={number} className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                  <span className="font-mono text-xs text-violet-300">{number}</span>
                  <div><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-white/45">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-l-4 border-violet-400 bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 text-violet-400" /><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Source · release record</p><p className="mt-1 text-sm text-muted-foreground">Real opportunities and creator release records. A release proves publication state, not audience effect or payment.</p></div></div>
        <CreatorReleaseWorkspaceBridge mode="work" />
      </section>

      <section className="border-l-4 border-cyan-400 bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3"><Link2 className="mt-0.5 h-4 w-4 text-cyan-400" /><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Verification · attributed movement</p><p className="mt-1 text-sm text-muted-foreground">Keep engaged, joined, verified and memorized states distinct. Only show what the attribution record actually supports.</p></div></div>
        <CreatorAttributionMap />
      </section>

      <section className="border-l-4 border-emerald-400 bg-card p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3"><WalletCards className="mt-0.5 h-4 w-4 text-emerald-400" /><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Residue · creator value</p><p className="mt-1 text-sm text-muted-foreground">Earnings retain their own lifecycle. Pending, approved, settled and reversed cannot be collapsed into one “earned” number.</p></div></div>
        <CreatorEarningsVault />
      </section>

      <section className="flex items-start gap-3 border border-border/60 bg-muted/20 p-4"><Scale className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" /><p className="text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Truth boundary:</strong> release ≠ verified attribution ≠ approved earning ≠ settled payout. The dossier makes the chain reviewable without manufacturing a single synthetic “performance score.”</p></section>
    </div>
  );
}

export default CreatorProofDossier;