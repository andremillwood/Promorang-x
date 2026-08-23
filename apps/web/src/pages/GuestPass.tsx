import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Calendar, MapPin, TicketCheck } from "lucide-react";
import { resolveGuestRsvpJourney } from "@promorang/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/i18n/I18nContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "This action could not be completed");
  return data;
}

export default function GuestPass() {
  const { t, formatNumber } = useI18n();
  const { token = "" } = useParams();
  const [params] = useSearchParams();
  const manage = params.get("manage") || "";
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ full_name: "", mobile: "", email: "", consent_whatsapp: true, consent_sms: false, consent_email: false });
  const query = useQuery({
    queryKey: ["guest-pass", token, manage],
    queryFn: () => request(`/api/guest-rsvp/${encodeURIComponent(token)}${manage ? `?manage_token=${encodeURIComponent(manage)}` : ""}`),
  });
  if (query.isLoading) return <main className="grid min-h-screen place-items-center bg-black text-white">{t("guestPassPage.loading")}</main>;
  if (!query.data?.rsvp) return <main className="grid min-h-screen place-items-center bg-black text-white">{t("guestPassPage.unavailable")}</main>;

  const r = query.data.rsvp;
  const canManage = Boolean(query.data.can_manage);
  const journey = resolveGuestRsvpJourney(r.status);
  const act = async (action: "join" | "cancel" | "claim") => {
    setBusy(true); setError("");
    try {
      if (action === "join") {
        const data = await request(`/api/guest-rsvp/${token}/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        navigate(`/guest-pass/${data.rsvp.invite_token}?manage=${data.rsvp.manage_token}`, { replace: true });
      } else if (action === "cancel") {
        await request(`/api/guest-rsvp/${token}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ manage_token: manage }) });
        await query.refetch();
      } else {
        const { data: auth } = await supabase.auth.getSession();
        if (!auth.session) { navigate(`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`); return; }
        const data = await request(`/api/guest-rsvp/${token}/claim`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.session.access_token}` }, body: JSON.stringify({ manage_token: manage }) });
        navigate(data.destination);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again"); }
    finally { setBusy(false); }
  };
  const updatePreference = async (field: "consent_whatsapp" | "consent_sms" | "consent_email", value: boolean) => {
    setBusy(true); setError("");
    try { await request(`/api/guest-rsvp/${token}/preferences`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ manage_token: manage, [field]: value }) }); await query.refetch(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Preferences could not be saved"); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-[#0b0b0a] px-5 py-14 text-white"><div className="mx-auto max-w-xl">
    <div className={`border-y border-dashed border-black/25 bg-[#f4ead8] p-7 text-[#17130f] ${!journey.passActive ? "opacity-55" : ""}`}>
      <p className="text-[10px] font-black uppercase tracking-[.3em] text-primary">Promorang {canManage ? t("guestPassPage.badgePass") : t("guestPassPage.badgeGroup")}</p>
      <h1 className="mt-3 font-serif text-5xl font-black uppercase">{r.moment.title}</h1>
      {canManage ? <div className="mt-5 flex items-center gap-5"><div className="rounded-xl bg-white p-2"><QRCodeSVG value={`https://promorang.co/guest-pass/${token}?code=${r.pass_code}`} className="h-24 w-24"/></div><div><p className="font-mono text-2xl font-black">{r.pass_code}</p><p className="mt-1 max-w-[14rem] text-xs text-black/50">{t("guestPassPage.scanInstruction")}</p></div></div> : <p className="mt-5 text-sm font-bold">{t("guestPassPage.joinGroupNotice")}</p>}
      <p className="mt-2 text-sm text-black/55">{r.guest_count} {r.guest_count === 1 ? t("guestPassPage.guestsSingle") : t("guestPassPage.guestsPlural")} · {r.group_name || r.full_name}</p>
      <div className="mt-6 space-y-3 border-t border-dashed border-black/20 pt-5 text-sm"><p className="flex gap-2"><Calendar className="h-4 w-4 text-primary"/>{r.moment.starts_at ? new Date(r.moment.starts_at).toLocaleString() : t("guestPassPage.scheduleTba")}</p><p className="flex gap-2"><MapPin className="h-4 w-4 text-primary"/>{r.moment.location || t("guestPassPage.locationTba")}</p></div>
    </div>
    {query.data.schedule_changes?.length ? <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{t("guestPassPage.scheduleChangedAlert")}</p> : null}
    {canManage && query.data.attendance_receipt ? <section className="mt-5 border-y border-dashed border-black/20 bg-[#f4ead8] p-6 text-[#17130f]"><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("guestPassPage.actionReceipt")}</p><h2 className="mt-2 font-serif text-4xl font-black uppercase">{t("guestPassPage.itCounted")}</h2><div className="mt-5 grid gap-2 border-t border-dashed border-black/15 pt-4 text-xs"><p className="flex justify-between"><span className="text-black/50">{t("guestPassPage.receiptAttendance")}</span><strong>{t("guestPassPage.receiptVerified")}</strong></p><p className="flex justify-between"><span className="text-black/50">{t("guestPassPage.receiptMethod")}</span><strong className="capitalize">{query.data.attendance_receipt.verification_method}</strong></p><p className="flex justify-between"><span className="text-black/50">{t("guestPassPage.receiptRecorded")}</span><strong>{new Date(query.data.attendance_receipt.verified_at).toLocaleString()}</strong></p><p className="flex justify-between"><span className="text-black/50">{t("guestPassPage.receiptAccount")}</span><strong>{query.data.attendance_receipt.status==="claimed"?t("guestPassPage.savedToPromorang"):t("guestPassPage.heldForYou")}</strong></p></div>{query.data.attendance_receipt.status!=="claimed"?<p className="mt-4 text-xs leading-5 text-black/55">{t("guestPassPage.claimPassPrompt")}</p>:<div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider"><span>{query.data.attendance_receipt.outcomes?.moment_piece?.awarded?t("guestPassPage.momentPiecesAwarded", { count: formatNumber(query.data.attendance_receipt.outcomes.moment_piece.quantity) }):t("guestPassPage.attendanceSaved")}</span><span>·</span><span>{query.data.attendance_receipt.outcomes?.promoshare_ticket?.awarded?t("guestPassPage.promoShareEarned"):t("guestPassPage.drawEligibilityChecked")}</span></div>}</section> : null}
    <div className="relative mt-6 grid grid-cols-3 before:absolute before:left-[15%] before:right-[15%] before:top-3 before:h-px before:bg-white/15">{journey.steps.map((step: any) => <div key={step.id} className="relative text-center"><span className={`mx-auto block h-6 w-6 rounded-full border-4 border-[#0b0b0a] ${step.state === "complete" ? "bg-primary" : step.state === "current" ? "bg-white" : "bg-white/15"}`}/><p className="mt-2 text-[10px] uppercase tracking-wider text-white/50">{step.label}</p></div>)}</div>
    {!canManage && journey.canInvite ? <div className="mt-7 grid gap-3"><Button onClick={() => setJoining(!joining)} className="h-12 bg-primary font-black text-black">{joining ? t("guestPassPage.close") : t("guestPassPage.joinThisGroup")}</Button>{joining ? <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><Input className="bg-white text-black" placeholder={t("guestPassPage.namePlaceholder")} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}/><Input className="bg-white text-black" placeholder={t("guestPassPage.mobilePlaceholder")} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })}/><Input className="bg-white text-black" placeholder={t("guestPassPage.emailPlaceholder")} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/><label className="flex items-center gap-3 text-xs text-white/65"><input type="checkbox" checked={form.consent_whatsapp} onChange={e=>setForm({...form,consent_whatsapp:e.target.checked})}/>{t("guestPassPage.consentWhatsapp")}</label><label className="flex items-center gap-3 text-xs text-white/65"><input type="checkbox" checked={form.consent_email} disabled={!form.email} onChange={e=>setForm({...form,consent_email:e.target.checked})}/>{t("guestPassPage.consentEmail")}</label><Button disabled={busy || !form.full_name || form.mobile.length < 7} onClick={() => act("join")} className="bg-primary font-black text-black">{t("guestPassPage.getMyPass")}</Button></div> : null}</div> : null}
    {canManage && journey.passActive ? <div className="mt-7 grid gap-3">{!r.user_id?<Button disabled={busy} onClick={() => act("claim")} className="h-12 bg-primary font-black text-black">{t("guestPassPage.keepInAccount")}</Button>:<p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-center text-xs font-bold text-emerald-200">{t("guestPassPage.savedInAccount")}</p>}{journey.canCancel?<Button disabled={busy} variant="outline" onClick={() => act("cancel")} className="border-red-400/30 bg-transparent text-red-300">{t("guestPassPage.cancelReservation")}</Button>:null}</div> : null}
    {canManage ? <section className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{t("guestPassPage.updatesKicker")}</p><h2 className="mt-2 font-serif text-2xl font-semibold">{t("guestPassPage.updatesHeading")}</h2><p className="mt-2 text-xs leading-5 text-white/45">{t("guestPassPage.updatesDesc")}</p><div className="mt-4 grid gap-3">{[["consent_whatsapp",t("guestPassPage.channelWhatsapp"),r.consent_whatsapp],["consent_sms",t("guestPassPage.channelSms"),r.consent_sms],["consent_email",t("guestPassPage.channelEmail"),r.consent_email]].map(([field,label,checked]:any)=><label key={field} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm"><span>{label}</span><input disabled={busy || (field==="consent_email"&&!r.has_email)} type="checkbox" checked={Boolean(checked)} onChange={e=>updatePreference(field,e.target.checked)}/></label>)}</div></section> : null}
    {error ? <p className="mt-4 text-center text-sm font-semibold text-red-400">{error}</p> : null}
    <p className="mt-7 text-center text-sm text-white/45"><TicketCheck className="mr-2 inline h-4 w-4 text-primary"/>{canManage ? t("guestPassPage.footerHostScan") : t("guestPassPage.footerIndividualPass")}</p>
  </div></main>;
}

