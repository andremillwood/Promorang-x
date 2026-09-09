import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { AFTRHRS_PATHS } from "@promorang/shared";
import { useAftrHrsAdmin } from "@/hooks/useAftrHrs";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

export default function AftrHrsAdmin() {
  const { data, isError, isLoading, token, update, updatePass } = useAftrHrsAdmin();
  const [allocation, setAllocation] = useState("");
  const [claimsOpen, setClaimsOpen] = useState(true);
  const [published, setPublished] = useState(true);
  const [pageMode, setPageMode] = useState("live");
  const [faqs, setFaqs] = useState("");
  const [policy, setPolicy] = useState("");

  if (isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-16 text-white">Loading AftrHrs controls…</main>;
  }
  if (isError || !data) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-16 text-center text-white">
        <h1 className="text-3xl font-black">Admin access required</h1>
        <p className="mt-3 text-white/60">AftrHrs administration is limited to authorized Promorang roles.</p>
      </main>
    );
  }

  const edition = (data.edition || {}) as Record<string, unknown>;
  const funnel = (data.funnel || {}) as Record<string, number>;
  const passes = (data.passes || []) as Array<{ id: string; unique_code: string; status: string; pass_type: string; user_id: string }>;
  const ambassadors = (data.ambassadors || []) as Array<{ name: string; allocation: number; distributed: number; tracking_code: string }>;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await update.mutateAsync({
        digitalAllocation: allocation ? Number(allocation) : undefined,
        claimsOpen,
        published,
        pageMode,
        faqs: faqs ? JSON.parse(faqs) : undefined,
        venuePolicies: policy ? { entry_policy: policy } : undefined,
      });
      toast.success("AftrHrs settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <SEO title="AftrHrs admin" description="Operate the AftrHrs pass release and Sea Deck Moment." />
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">Administration</p>
          <h1 className="mt-3 text-4xl font-black uppercase">AftrHrs controls</h1>
          <p className="mt-2 text-white/55">{data.remaining as number} digital passes remaining · linked to Sea Deck</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-4">
          {["landing_view", "moment_join", "pass_secured", "checked_in"].map((key) => (
            <div key={key} className="rounded-2xl border border-white/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">{key.replaceAll("_", " ")}</p>
              <p className="mt-2 text-2xl font-black">{funnel[key] || 0}</p>
            </div>
          ))}
        </section>

        <form onSubmit={save} className="space-y-3 rounded-3xl border border-white/10 p-5">
          <h2 className="text-lg font-black uppercase">Edition</h2>
          <label className="block text-sm">Digital allocation
            <input value={allocation} onChange={(event) => setAllocation(event.target.value)} placeholder={String(edition.digital_allocation || 20)} className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black px-3" />
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={claimsOpen} onChange={(event) => setClaimsOpen(event.target.checked)} /> Claims open</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Published</label>
          <label className="block text-sm">Page mode
            <select value={pageMode} onChange={(event) => setPageMode(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-white/15 bg-black px-3">
              <option value="live">Live</option>
              <option value="post-event">Post-event</option>
            </select>
          </label>
          <textarea value={policy} onChange={(event) => setPolicy(event.target.value)} placeholder="Venue policy (optional, admin-editable)" className="min-h-24 w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm" />
          <textarea value={faqs} onChange={(event) => setFaqs(event.target.value)} placeholder='FAQ JSON array, e.g. [{"question":"...","answer":"..."}]' className="min-h-28 w-full rounded-xl border border-white/15 bg-black px-3 py-2 font-mono text-xs" />
          <button type="submit" className="rounded-full bg-white px-5 py-2 text-xs font-black uppercase text-black">Save</button>
        </form>

        <section className="rounded-3xl border border-white/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black uppercase">Guest list</h2>
            <a href={`${API_BASE_URL}/aftrhrs/admin/guest-list.csv`} onClick={(event) => {
              event.preventDefault();
              fetch(`${API_BASE_URL}/aftrhrs/admin/guest-list.csv`, { headers: { Authorization: `Bearer ${token}` } })
                .then((response) => response.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "aftrhrs-guest-list.csv";
                  link.click();
                });
            }} className="text-xs uppercase tracking-[0.16em] text-cyan-300">Export CSV</a>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {passes.map((pass) => (
              <li key={pass.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2">
                <span className="font-mono">{pass.unique_code} · {pass.pass_type} · {pass.status}</span>
                <span className="flex gap-2">
                  <button type="button" className="text-xs uppercase text-white/50" onClick={() => updatePass.mutate({ id: pass.id, status: "cancelled" })}>Cancel</button>
                  <button type="button" className="text-xs uppercase text-cyan-300" onClick={() => updatePass.mutate({ id: pass.id, status: "active" })}>Reinstate</button>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 p-5">
          <h2 className="text-lg font-black uppercase">Ambassadors</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {ambassadors.map((row) => (
              <li key={row.tracking_code}>{row.name} · {row.distributed}/{row.allocation} · {row.tracking_code}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-white/40">
          <Link to={AFTRHRS_PATHS.moment}>Public page</Link>
          <Link to={AFTRHRS_PATHS.door}>Door</Link>
          <Link to={AFTRHRS_PATHS.venue}>Sea Deck</Link>
          <Link to="/admin?tab=moments">Moments admin</Link>
        </div>
      </div>
    </main>
  );
}
