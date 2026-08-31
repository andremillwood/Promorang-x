import { FormEvent, useEffect, useState } from "react";
import { Check, KeyRound, RefreshCw, TicketCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { createPresentsCode, getPresentsAdmin, updatePresentsClaim } from "@/lib/presents";
import { useI18n } from "@/i18n/I18nContext";

export function AdminPresentsPanel() {
  const { t } = useI18n();
  const [data, setData] = useState<Record<string, any[]>>({ programs: [], codes: [], memberships: [], experiences: [], claims: [] });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", source_label: "", max_uses: 1, child_allowance: 3 });
  const load = () => { setLoading(true); getPresentsAdmin().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createPresentsCode(form);
      toast.success(t("presOps.toastCreated"));
      setForm({ code: "", source_label: "", max_uses: 1, child_allowance: 3 });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create code");
    }
  };
  const act = async (id: string, status: string) => {
    try {
      await updatePresentsClaim(id, status);
      toast.success(t("presOps.toastClaim", { status }));
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update claim");
    }
  };
  const activeMembers = data.memberships.filter((item) => item.status === "active").length;
  const activeCodes = data.codes.filter((item) => item.status === "active").length;
  const pendingClaims = data.claims.filter((item) => item.status === "pending").length;
  return (
    <section className="mt-8 space-y-6 border-t pt-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{t("presOps.eyebrow")}</p>
          <h2 className="mt-1 font-serif text-2xl font-bold">{t("presOps.title")}</h2>
        </div>
        <button onClick={load} className="rounded-lg border p-2" aria-label={t("presOps.refresh")}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={Users} label={t("presOps.admitted")} value={activeMembers} />
        <Metric icon={KeyRound} label={t("presOps.invites")} value={activeCodes} />
        <Metric icon={TicketCheck} label={t("presOps.claimsAwait")} value={pendingClaims} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <form onSubmit={submit} className="rounded-xl border bg-card p-5">
          <h3 className="font-serif text-lg font-bold">{t("presOps.issue")}</h3>
          <div className="mt-4 grid gap-3">
            <label className="text-xs font-bold">
              {t("presOps.code")}
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-1 w-full rounded-md border bg-background p-2.5" placeholder={t("presOps.codePh")} />
            </label>
            <label className="text-xs font-bold">
              {t("presOps.source")}
              <input value={form.source_label} onChange={(e) => setForm({ ...form, source_label: e.target.value })} className="mt-1 w-full rounded-md border bg-background p-2.5" placeholder={t("presOps.sourcePh")} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold">
                {t("presOps.totalUses")}
                <input type="number" min="1" max="10000" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} className="mt-1 w-full rounded-md border bg-background p-2.5" />
              </label>
              <label className="text-xs font-bold">
                {t("presOps.invitesEach")}
                <input type="number" min="0" max="20" value={form.child_allowance} onChange={(e) => setForm({ ...form, child_allowance: Number(e.target.value) })} className="mt-1 w-full rounded-md border bg-background p-2.5" />
              </label>
            </div>
            <button className="rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">{t("presOps.createCode")}</button>
          </div>
        </form>
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b p-4"><h3 className="font-serif text-lg font-bold">{t("presOps.inventory")}</h3></div>
          <div className="divide-y">
            {data.experiences.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <strong>{item.title}</strong>
                  <p className="text-xs text-muted-foreground">{t("presOps.claimedMeta", { event: item.event_name, claimed: item.claimed_count, qty: item.quantity, redeemed: item.redeemed_count })}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.status === "live" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted"}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-4"><h3 className="font-serif text-lg font-bold">{t("presOps.claims")}</h3></div>
        <div className="divide-y">
          {data.claims.length ? data.claims.map((claim) => (
            <div key={claim.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <strong>{claim.presents_experiences?.title || t("presOps.experience")}</strong>
                <p className="font-mono text-xs text-muted-foreground">{claim.credential_code} · {claim.status}</p>
              </div>
              {claim.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => act(claim.id, "approved")} className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Check className="h-3 w-3" />{t("presOps.approve")}</button>
                  <button onClick={() => act(claim.id, "rejected")} className="rounded-md border px-3 py-2 text-xs font-bold">{t("presOps.reject")}</button>
                </div>
              ) : claim.status === "approved" ? (
                <button onClick={() => act(claim.id, "redeemed")} className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">{t("presOps.redeem")}</button>
              ) : null}
            </div>
          )) : <p className="p-6 text-sm text-muted-foreground">{t("presOps.emptyClaims")}</p>}
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" />
      <strong className="mt-4 block text-3xl">{value}</strong>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
