import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { captureBusinessBrief } from "@/lib/platform-funnels";
import type { BusinessOutcomeBrief } from "@/lib/business-outcomes";

export function BusinessBriefCapture({ brief, onSaved }: { brief: BusinessOutcomeBrief; onSaved: (leadId: string) => void }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [contact, setContact] = useState({ email: user?.email || "", fullName: user?.user_metadata?.full_name || "", organizationName: "", phone: "", marketingConsent: false, website: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError("");
    try { const result = await captureBusinessBrief(brief, contact); onSaved(result.leadId); }
    catch { setError(t("funnel.saveFailed")); }
    finally { setSaving(false); }
  }
  if (brief.leadId) return <p role="status" className="mt-6 border-y border-orange-300/20 py-4 text-sm text-orange-200">{t("funnel.saved")}</p>;
  return <form onSubmit={submit} className="mt-6 space-y-4 border-t border-white/15 pt-6">
    <h4 className="font-serif text-xl font-bold">{t("funnel.captureTitle")}</h4>
    <p className="text-xs leading-6 text-white/55">{t("funnel.captureCopy")}</p>
    {([['fullName', 'funnel.name', 'text', true], ['email', 'funnel.email', 'email', true], ['organizationName', 'funnel.organization', 'text', false], ['phone', 'funnel.phone', 'tel', false]] as const).map(([field, label, type, required]) => <label key={field} className="block text-xs font-bold text-white/65">{t(label)}<input type={type} required={required} maxLength={field === "email" ? 320 : 200} value={contact[field]} onChange={event => setContact(current => ({ ...current, [field]: event.target.value }))} autoComplete={field === "fullName" ? "name" : field === "organizationName" ? "organization" : type === "tel" ? "tel" : "email"} className="mt-2 min-h-11 w-full rounded-xl border border-white/20 bg-black/35 px-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300" /></label>)}
    <label className="flex items-start gap-3 text-xs leading-5 text-white/60"><input type="checkbox" checked={contact.marketingConsent} onChange={event => setContact(current => ({ ...current, marketingConsent: event.target.checked }))} className="mt-1" />{t("funnel.consent")}</label>
    <input aria-hidden="true" tabIndex={-1} autoComplete="off" name="website" value={contact.website} onChange={event => setContact(current => ({ ...current, website: event.target.value }))} className="hidden" />
    <button disabled={saving} type="submit" className="min-h-12 w-full rounded-full bg-orange-400 px-5 text-sm font-black text-black disabled:opacity-50">{saving ? t("funnel.saving") : t("funnel.save")}</button>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </form>;
}
