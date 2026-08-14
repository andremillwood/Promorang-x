import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { trackMetaEvent } from "@/components/MetaPixel";

const plans = {
  plus: { name: "Plus", value: 9.99, price: "$9.99 / month", benefits: ["1.25× disclosed Points multiplier", "90% of standard PromoKey cost", "Cash/Gem PromoShare eligibility"] },
  pro: { name: "Pro", value: 24.99, price: "$24.99 / month", benefits: ["1.5× disclosed Points multiplier", "75% of standard PromoKey cost", "Higher caps and priority access"] },
  elite: { name: "Elite", value: 49.99, price: "$49.99 / month", benefits: ["2× disclosed Points multiplier", "60% of standard PromoKey cost", "Premium pools and local impact funding"] },
  host_pro: { name: "Host Pro", value: 49, price: "$49 / month", benefits: ["Advanced host operations", "Reusable Moment templates", "Priority brand and sponsor matching"] },
  merchant_growth: { name: "Merchant Growth", value: 499, price: "$499 / month", benefits: ["8 Merchant Moments per month", "Featured venue placement", "Loyalty integrations and priority support"] },
  brand_studio: { name: "Brand Studio", value: 999, price: "$999 / month", benefits: ["Brand workspace and reusable templates", "Priority matching and reporting", "Moment funding is billed separately"] },
} as const;

export default function MembershipCheckout() {
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
      if (!data.session?.access_token) throw new Error("Please sign in before continuing.");
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
      if (!response.ok || !payload.data?.url) throw new Error(payload.message || "Checkout is not available yet.");
      trackMetaEvent("InitiateCheckout", {
        content_ids: [planId],
        content_name: plan.name,
        content_type: "product",
        currency: "USD",
        value: plan.value,
      });
      window.location.assign(payload.data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not start.");
      setLoading(false);
    }
  };

  return <main className="min-h-screen bg-[#090909] px-5 pb-20 pt-28 text-white">
    <SEO title={`${plan.name} Membership Checkout`} description="Review and securely start a Promorang membership." />
    <div className="mx-auto max-w-4xl">
      <Link to="/pricing#pricing-by-role" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to pricing</Link>
      <div className="mt-8 grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#121212] lg:grid-cols-[1.1fr_.9fr]">
        <section className="p-7 md:p-10">
          <p className="text-xs font-black uppercase tracking-[.25em] text-primary">Membership order</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-.055em]">{plan.name}</h1>
          <p className="mt-3 text-2xl font-bold text-white/70">{plan.price}</p>
          <div className="mt-8 space-y-3">
            {[...plan.benefits, "Cancel subject to the published billing terms"].map(item => <p key={item} className="flex gap-3 text-sm text-white/65"><Check className="h-4 w-4 shrink-0 text-primary" />{item}</p>)}
          </div>
          <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/[.08] p-4 text-sm leading-6 text-white/60"><strong className="text-white">No earnings promise.</strong> Membership changes service limits and defined benefits. Rewards still require published eligibility, verified participation, and a committed pool.</div>
        </section>
        <aside className="border-t border-white/10 bg-black/30 p-7 md:p-10 lg:border-l lg:border-t-0">
          <ShieldCheck className="h-9 w-9 text-primary" />
          <h2 className="mt-5 text-2xl font-black">Secure recurring checkout</h2>
          <p className="mt-3 text-sm leading-6 text-white/50">Stripe confirms payment server-side before Promorang activates any paid benefit.</p>
          {params.get("cancelled") ? <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">Checkout was cancelled. Nothing was charged.</p> : null}
          {error ? <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
          <Button size="lg" className="mt-7 w-full" onClick={beginCheckout} disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening checkout</> : `Continue with ${plan.name}`}</Button>
          <p className="mt-4 text-center text-xs text-white/30">Final billing terms and taxes are shown before payment.</p>
        </aside>
      </div>
    </div>
  </main>;
}
