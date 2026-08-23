import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Minus, Plus, Share2, TicketCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/I18nContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function GuestRsvp() {
  const { momentId } = useParams();
  const [params] = useSearchParams();
  const { t } = useI18n();
  const title = params.get("title") || t("rsvp.thisMoment");
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    guest_count: 1,
    group_name: "",
    meeting_point: "",
    consent_whatsapp: true,
    consent_sms: true,
    consent_email: false,
  });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API}/api/guest-rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, moment_id: momentId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("rsvp.reserveError"));
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("rsvp.reserveError"));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    const shareUrl = `${location.origin}/guest-pass/${result.rsvp.invite_token}`;
    const privateUrl = `/guest-pass/${result.rsvp.invite_token}?manage=${result.rsvp.manage_token}`;
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${result.moment.title}: ${shareUrl}`)}`;
    const places = result.rsvp.guest_count === 1 ? t("rsvp.place") : t("rsvp.places");

    return (
      <main className="min-h-screen bg-[#0b0b0a] px-5 py-16 text-white">
        <div className="mx-auto max-w-xl">
          <div className="border-y border-dashed border-black/25 bg-[#f4ead8] p-7 text-[#17130f]">
            <p className="text-[10px] font-black uppercase tracking-[.3em] text-primary">{t("rsvp.pass")}</p>
            <h1 className="mt-3 font-serif text-5xl font-black uppercase">{t("rsvp.going")}</h1>
            <p className="mt-2 text-lg font-bold">{result.moment.title}</p>
            <div className="my-6 border-t border-dashed border-black/20" />
            <p className="font-mono text-3xl font-black">{result.rsvp.pass_code}</p>
            <p className="mt-2 text-sm text-black/55">
              {t("rsvp.held", { count: result.rsvp.guest_count, places, name: result.rsvp.full_name })}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t("rsvp.noAccount")}
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <Button asChild className="h-12 bg-[#25D366] font-black text-black hover:bg-[#20bd5a]">
              <a href={whatsapp} target="_blank" rel="noreferrer">
                <Share2 className="mr-2 h-4 w-4" />
                {t("rsvp.inviteWhatsApp")}
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12 border-white/15 bg-transparent text-white">
              <Link to={privateUrl}>{t("rsvp.openPass")}</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const benefits = [
    [TicketCheck, t("rsvp.benefitPass")],
    [Share2, t("rsvp.benefitLink")],
    [CheckCircle2, t("rsvp.benefitUpdates")],
  ] as const;

  return (
    <main className="min-h-screen bg-[#0b0b0a] px-5 py-14 text-white">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 lg:grid-cols-[.8fr_1.2fr]">
        <section className="bg-[radial-gradient(circle_at_top,rgba(255,106,26,.24),transparent_40%),#111] p-8">
          <p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">{t("rsvp.reserve")}</p>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-none">{title}</h1>
          <p className="mt-5 text-sm leading-6 text-white/55">{t("rsvp.intro")}</p>
          <div className="mt-10 space-y-5">
            {benefits.map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-sm">
                <Icon className="h-5 w-5 text-primary" />
                {text}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={submit} className="bg-[#f6efe3] p-7 text-[#17130f] sm:p-10">
          <h2 className="font-serif text-4xl font-black">{t("rsvp.holdFor")}</h2>
          <div className="mt-7 grid gap-4">
            <Input required placeholder={t("rsvp.fullName")} value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
            <Input required placeholder={t("rsvp.mobile")} value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
            <Input type="email" placeholder={t("rsvp.email")} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <div>
              <label className="text-xs font-bold uppercase tracking-wider">{t("rsvp.guestCount")}</label>
              <div className="mt-2 flex h-11 w-40 items-center justify-between rounded-md border bg-white">
                <button type="button" aria-label={t("rsvp.removeGuest")} onClick={() => setForm({ ...form, guest_count: Math.max(1, form.guest_count - 1) })} className="px-3">
                  <Minus className="h-4 w-4" />
                </button>
                <strong>{form.guest_count}</strong>
                <button type="button" aria-label={t("rsvp.addGuest")} onClick={() => setForm({ ...form, guest_count: Math.min(12, form.guest_count + 1) })} className="px-3">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Input placeholder={t("rsvp.groupName")} value={form.group_name} onChange={(event) => setForm({ ...form, group_name: event.target.value })} />
            <Input placeholder={t("rsvp.meetingPoint")} value={form.meeting_point} onChange={(event) => setForm({ ...form, meeting_point: event.target.value })} />
            <label className="flex gap-3 rounded-xl border bg-white/60 p-3 text-sm">
              <input type="checkbox" checked={form.consent_whatsapp} onChange={(event) => setForm({ ...form, consent_whatsapp: event.target.checked })} />
              {t("rsvp.whatsappUpdates")}
            </label>
            {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
            <Button disabled={busy} className="h-12 bg-primary font-black text-black">
              {busy ? t("rsvp.reserving") : t("rsvp.confirm")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-[11px] text-black/45">{t("rsvp.privacy")}</p>
          </div>
        </form>
      </div>
    </main>
  );
}
