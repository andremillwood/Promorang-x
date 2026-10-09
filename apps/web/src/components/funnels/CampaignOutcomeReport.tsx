import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { funnelRequest, type CampaignOutcomeReport as Report } from "@/lib/platform-funnels";

export function CampaignOutcomeReport({ campaignId }: { campaignId: string }) {
  const { user } = useAuth();
  const { t, formatNumber } = useI18n();
  const queryClient = useQueryClient();
  const [reviewed, setReviewed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery({ queryKey: ["campaign-funnel-report", campaignId, user?.id], queryFn: () => funnelRequest<Report>(`/funnels/campaigns/${campaignId}/report`), enabled: Boolean(user) });
  async function review() {
    setSaving(true); setError("");
    try {
      await funnelRequest(`/funnels/campaigns/${campaignId}/review`, { method: "POST" });
      setReviewed(true);
      await queryClient.invalidateQueries({ queryKey: ["platform-funnels"] });
    } catch { setError(t("funnel.reviewFailed")); }
    finally { setSaving(false); }
  }
  const report = query.data;
  return <section className="mt-10 border-y border-black/20 py-8 text-[#191816]">
    <h2 className="font-serif text-3xl font-bold">{t("funnel.report")}</h2>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">{t("funnel.reportCopy")}</p>
    {query.isLoading ? <p role="status" className="mt-5">{t("funnel.loading")}</p> : query.isError ? <p role="alert" className="mt-5">{t("funnel.unavailable")} <button type="button" onClick={() => void query.refetch()} className="min-h-11 underline">{t("funnel.retry")}</button></p> : report ? <>
      <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">{([
        ["funnel.attendance", report.metrics.attendance], ["funnel.redemptions", report.metrics.redemptions], ["funnel.purchases", report.metrics.purchases], ["funnel.proofs", report.metrics.acceptedProofs], ["funnel.funding", report.funding.securedGems], ["funnel.released", report.funding.releasedGems],
      ] as const).map(([key, value]) => <div key={key}><dt className="text-xs text-black/60">{t(key)}</dt><dd className="mt-2 text-3xl font-black">{formatNumber(value)}</dd></div>)}</dl>
      {!report.metrics.lastOutcomeAt && <p className="mt-6 text-sm text-black/60">{t("funnel.noOutcomes")}</p>}
      {report.canRenew && <div className="mt-6"><p className="max-w-2xl text-sm leading-6 text-black/60">{t("funnel.renewalCopy")}</p>{reviewed ? <><p role="status" className="mt-4 text-sm font-bold">{t("funnel.reviewed")}</p><Link to={`/create/campaign?renew=${campaignId}`} className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#191816] px-6 text-sm font-black text-white">{t("funnel.renew")}</Link></> : <button type="button" disabled={saving} onClick={() => void review()} className="mt-4 min-h-12 rounded-full bg-[#191816] px-6 text-sm font-black text-white disabled:opacity-50">{saving ? t("funnel.saving") : t("funnel.review")}</button>}</div>}
    </> : null}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
  </section>;
}
