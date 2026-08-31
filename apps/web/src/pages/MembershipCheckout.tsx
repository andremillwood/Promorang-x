import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { trackMetaEvent } from "@/components/MetaPixel";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const plans = {
  plus: { nameKey: "membership.plus", value: 9.99, price: "$9.99 / month", benefits: ["membership.plusB1", "membership.plusB2", "membership.plusB3"] },
  pro: { nameKey: "membership.pro", value: 24.99, price: "$24.99 / month", benefits: ["membership.proB1", "membership.proB2", "membership.proB3"] },
  elite: { nameKey: "membership.elite", value: 49.99, price: "$49.99 / month", benefits: ["membership.eliteB1", "membership.eliteB2", "membership.eliteB3"] },
  host_pro: { nameKey: "membership.hostPro", value: 49, price: "$49 / month", benefits: ["membership.hostB1", "membership.hostB2", "membership.hostB3"] },
  merchant_growth: { nameKey: "membership.merchantGrowth", value: 499, price: "$499 / month", benefits: ["membership.merchantB1", "membership.merchantB2", "membership.merchantB3"] },
  brand_studio: { nameKey: "membership.brandStudio", value: 999, price: "$999 / month", benefits: ["membership.brandB1", "membership.brandB2", "membership.brandB3"] },
} as const;

export default function MembershipCheckout() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const requested = (params.get("plan") || "plus").toLowerCase();
  const planId = requested in plans ? requested as keyof typeof plans : "plus";
  const plan = plans[planId];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const beginCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) throw new Error(t("membership.signIn"));
      const response = await fetch(`${API_BASE_URL}/payments/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "stripe",
          plan_id: planId,
          success_url: `${window.location.origin}/billing/result?status=success&plan=${planId}`,
          cancel_url: `${window.location.origin}/membership/checkout?plan=${planId}&cancelled=1`,
          metadata: { source: "pricing", selected_plan: planId },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.data?.url) throw new Error(payload.message || t("membership.unavailable"));
      trackMetaEvent("InitiateCheckout", {
        content_ids: [planId],
        content_name: t(plan.nameKey),
        content_type: "product",
        currency: "USD",
        value: plan.value,
      });
      window.location.assign(payload.data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : t("membership.startFail"));
      setLoading(false);
    }
  };

  return <main className="min-h-screen bg-[#090909] px-5 pb-20 pt-28 text-white">
    <SEO title={t("membership.seoTitle", { plan: t(plan.nameKey) })} description={t("membership.seoCopy")} />
    <div className="mx-auto max-w-4xl">
      <Link to="/pricing#pricing-by-role" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("membership.back")}</Link>
      <div className="mt-8 grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#121212] lg:grid-cols-[1.1fr_.9fr]">
        <section className="p-7 md:p-10">
          <p className="text-xs font-black uppercase tracking-[.25em] text-primary">{t("membership.order")}</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-.055em]">{t(plan.nameKey)}</h1>
          <p className="mt-3 text-2xl font-bold text-white/70">{plan.price}</p>
          <div className="mt-8 space-y-3">
            {[...plan.benefits, "membership.cancelTerms"].map(item => <p key={item} className="flex gap-3 text-sm text-white/65"><Check className="h-4 w-4 shrink-0 text-primary" />{t(item as TranslationKey)}</p>)}
          </div>
          <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/[.08] p-4 text-sm leading-6 text-white/60"><strong className="text-white">{t("membership.noPromise")}</strong> {t("membership.noPromiseCopy")}</div>
        </section>
        <aside className="border-t border-white/10 bg-black/30 p-7 md:p-10 lg:border-l lg:border-t-0">
          <ShieldCheck className="h-9 w-9 text-primary" />
          <h2 className="mt-5 text-2xl font-black">{t("membership.secure")}</h2>
          <p className="mt-3 text-sm leading-6 text-white/50">{t("membership.secureCopy")}</p>
          {params.get("cancelled") ? <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">{t("membership.cancelled")}</p> : null}
          {error ? <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
          <Button size="lg" className="mt-7 w-full" onClick={beginCheckout} disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("membership.opening")}</> : t("membership.continue", { plan: t(plan.nameKey) })}</Button>
          <p className="mt-4 text-center text-xs text-white/30">{t("membership.finalTerms")}</p>
        </aside>
      </div>
    </div>
  </main>;
}
