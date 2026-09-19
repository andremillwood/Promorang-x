import { Link } from "react-router-dom";
import { FileCheck2, History, Scale, ShieldCheck } from "lucide-react";
import { useModerationOverview } from "@/hooks/useAdmin";
import { AdminModerationTab } from "@/components/admin/AdminModerationTab";

export function AdminVerificationHub() {
  const moderation = useModerationOverview();
  const summary = moderation.data?.summary;

  const metrics = [
    {
      label: "Proof claims waiting",
      value: Number(summary?.pending_proofs || 0),
      helper: "Submitted proof is still a claim until a review decision is recorded.",
    },
    {
      label: "Content waiting",
      value: Number(summary?.pending_content || 0),
      helper: "Content moderation remains separate from attendance and proof verification.",
    },
    {
      label: "Verified check-ins",
      value: Number(summary?.total_check_ins || 0),
      helper: "Recorded verified attendance; not purchase or fulfillment.",
    },
  ];

  return (
    <div className="admin-tab-stack" data-admin-trust-surface>
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_82%_18%,rgba(255,101,0,.16),transparent_30%),linear-gradient(135deg,#0b0b0c,#11100f)] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[.22em] text-[#ff7a35]">
              <ShieldCheck className="h-4 w-4" />
              Admin · Trust
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.04em] text-white sm:text-4xl">
              Decide what counts. Preserve why.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/48">
              Trust is the review layer between a submitted claim and a durable platform consequence. Source, claim,
              decision, reason and downstream outcome remain separately inspectable.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin?tab=audit" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 text-xs font-black text-white/70 hover:bg-white/[.07]">
              <History className="h-4 w-4" /> Audit ledger
            </Link>
            <Link to="/admin?tab=moments" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff6500] px-4 text-xs font-black text-black hover:bg-[#ff7a20]">
              <FileCheck2 className="h-4 w-4" /> Moment records
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">{metric.label}</p>
              <p className="mt-3 text-4xl font-black text-white">{moderation.isLoading ? "…" : metric.value.toLocaleString()}</p>
              <p className="mt-2 text-xs leading-5 text-white/38">{metric.helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-4" aria-label="Trust decision chain">
        {[
          ["01 · Source", "What evidence or authoritative record exists?"],
          ["02 · Claim", "What is the participant, host, creator or operator asserting?"],
          ["03 · Decision", "What did an authorized reviewer actually verify or reject?"],
          ["04 · Residue", "What reward, memory, payout, Piece or correction was then recorded?"],
        ].map(([label, copy]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
            <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff7a35]">{label}</p>
            <p className="mt-5 text-sm leading-6 text-white/52">{copy}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#ff7a35]">Live review workspace</p>
            <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">Queues, decisions and history.</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/35">
            <Scale className="h-4 w-4 text-[#ff7a35]" />
            Approval ≠ payout · proof submission ≠ attendance
          </div>
        </div>

        <AdminModerationTab />
      </section>
    </div>
  );
}

export default AdminVerificationHub;
