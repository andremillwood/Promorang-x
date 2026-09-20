import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, CircleAlert, Package, Store } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { authPathForReturn } from "@/lib/post-auth-next";
import { supabase } from "@/integrations/supabase/client";
import {
  executionNeedsCommerce,
  getCommerceSubject,
  getExecutionRail,
  getOutcome,
  getProgramme,
  getSellerResponsibility,
  getSuccessAction,
  readBusinessOutcomeBrief,
  roleForBusinessType,
  saveBusinessOutcomeBrief,
} from "@/lib/business-outcomes";
import CommerceResponsibilityMap from "@/components/business/CommerceResponsibilityMap";

function nextActions(brief: NonNullable<ReturnType<typeof readBusinessOutcomeBrief>>, activeRole?: string | null) {
  const planner = "/create/campaign?from=business-outcome";
  const commerceOwnedHere = brief.sellerResponsibilityId === "current-org-merchant";
  const currentMerchant = activeRole === "merchant";

  if (brief.executionRailId === "commerce") {
    if (brief.commerceSourceId && (commerceOwnedHere || currentMerchant)) {
      return {
        primary: { label: "Open linked commerce supply", href: "/dashboard?tab=storefront" },
        secondary: { label: "Plan distribution around it", href: planner },
      };
    }
    if (commerceOwnedHere || currentMerchant) {
      return {
        primary: { label: "Create or select sellable supply", href: "/dashboard/products/add?from=business-outcome" },
        secondary: { label: "Open merchant commerce", href: "/dashboard?tab=storefront" },
      };
    }
    return {
      primary: { label: "Plan the commerce activation", href: planner },
      secondary: { label: "Browse current commerce", href: "/shop" },
    };
  }

  if (brief.executionRailId === "offer") {
    if (currentMerchant) return {
      primary: { label: "Create the merchant response", href: "/dashboard?tab=storefront" },
      secondary: { label: "Plan distribution around it", href: planner },
    };
    return {
      primary: { label: "Plan the Offer + merchant handoff", href: planner },
      secondary: { label: "See current Offers", href: "/discover/rewards#offers" },
    };
  }

  if (brief.executionRailId === "moment") {
    return {
      primary: { label: "Create the Moment", href: "/create/moment?from=business-outcome" },
      secondary: { label: "Plan distribution around it", href: planner },
    };
  }

  if (brief.executionRailId === "demand-test") {
    return {
      primary: { label: "Build the demand test", href: planner },
      secondary: { label: "See what people want now", href: "/#wanted" },
    };
  }

  if (brief.executionRailId === "distribution") {
    return {
      primary: { label: "Build the distribution brief", href: planner },
      secondary: { label: "Review Creator opportunities", href: "/for-creators" },
    };
  }

  if (executionNeedsCommerce(brief) && (commerceOwnedHere || currentMerchant)) {
    return {
      primary: { label: "Establish the commerce supply first", href: "/dashboard/products/add?from=business-outcome" },
      secondary: { label: "Plan the wider activation", href: planner },
    };
  }

  return {
    primary: { label: "Build the mixed programme", href: planner },
    secondary: { label: "Review the commerce side", href: "/shop" },
  };
}

export default function BusinessProgramme() {
  const { user, activeRole } = useAuth();
  const [brief, setBrief] = useState(() => readBusinessOutcomeBrief());
  const merchantQuery = useQuery({
    queryKey: ["business-programme-commerce-merchants"],
    enabled: Boolean(brief && executionNeedsCommerce(brief) && brief.sellerResponsibilityId === "existing-merchant"),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_commerce_directory")
        .select("merchant_user_id,merchant_name,merchant_slug,merchant_logo_url,is_active")
        .eq("is_active", true)
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
  const commerceMerchants = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const item of merchantQuery.data || []) {
      if (!item.merchant_user_id) continue;
      if (!map.has(item.merchant_user_id)) map.set(item.merchant_user_id, {
        id: item.merchant_user_id,
        name: item.merchant_name || "PROMORANG merchant",
      });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [merchantQuery.data]);

  if (!brief) {
    return (
      <main className="min-h-screen bg-[#070707] px-5 py-28 text-white">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
          <CircleAlert className="mx-auto h-8 w-8 text-orange-300" />
          <h1 className="mt-5 font-serif text-4xl font-bold">No programme brief is waiting here.</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50">Start from the business outcome so PROMORANG can recommend an execution route without inventing missing commercial context.</p>
          <Link to="/business/start" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">Choose an outcome <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </main>
    );
  }

  const outcome = getOutcome(brief.outcomeId);
  const programme = getProgramme(brief.programmeId);
  const execution = getExecutionRail(brief.executionRailId);
  const success = getSuccessAction(brief.successAction);
  const seller = getSellerResponsibility(brief.sellerResponsibilityId);
  const subject = getCommerceSubject(brief.commerceSubjectId);
  const actions = nextActions(brief, activeRole);
  const expectedRole = roleForBusinessType(brief.businessType);
  const primaryHref = user ? actions.primary.href : authPathForReturn("/business/programme?resume=1", { mode: "signup", role: expectedRole });

  return (
    <main className="min-h-screen bg-[#070707] px-5 pb-20 pt-24 text-white sm:px-6 md:pt-32">
      <SEO title="PROMORANG Programme Route" description="Turn a business outcome into the right execution rail while keeping commerce, fulfillment and evidence responsibilities explicit." />
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <section>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Programme route</p>
            <h1 className="mt-4 font-serif text-5xl font-bold tracking-[-.05em] sm:text-6xl">{programme?.title || "Your programme"}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/58">{programme?.promise}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">Outcome</p><p className="mt-2 font-black">{outcome?.title}</p></div>
              <div className="rounded-2xl border border-orange-300/20 bg-orange-300/[0.05] p-4"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-300">Execution</p><p className="mt-2 font-black">{execution?.title}</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">Proof</p><p className="mt-2 font-black">{brief.target ? `${brief.target} × ` : ""}{success?.title}</p></div>
            </div>

            {executionNeedsCommerce(brief) ? (
              <div className="mt-7 rounded-[1.6rem] border border-emerald-300/20 bg-emerald-300/[0.045] p-5">
                <div className="flex items-start gap-3"><Store className="mt-0.5 h-5 w-5 text-emerald-300" /><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">Commerce dependency</p><h2 className="mt-2 font-serif text-2xl font-bold">The thing people act on must be commercially real.</h2></div></div>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-6 border-b border-white/10 pb-3"><dt className="text-white/38">Subject</dt><dd className="text-right font-black">{subject?.title || "Commerce"}{brief.subjectLabel ? ` · ${brief.subjectLabel}` : ""}</dd></div>
                  <div className="flex justify-between gap-6 border-b border-white/10 pb-3"><dt className="text-white/38">Seller / fulfiller</dt><dd className="max-w-sm text-right font-black">{seller?.title || "Still unresolved"}</dd></div>
                  {brief.sellerResponsibilityId === "existing-merchant" ? (
                    <div className="border-b border-white/10 pb-4">
                      <div className="flex items-center justify-between gap-5"><span className="text-white/38">Selected merchant</span><span className="text-right font-black">{brief.sellerMerchantName || "Choose a commerce-ready merchant"}</span></div>
                      <select
                        value={brief.sellerMerchantId || ""}
                        onChange={(event) => {
                          const merchant = commerceMerchants.find((item) => item.id === event.target.value);
                          const next = { ...brief, sellerMerchantId: merchant?.id || null, sellerMerchantName: merchant?.name || null };
                          saveBusinessOutcomeBrief(next);
                          setBrief(next);
                        }}
                        className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-black/45 px-3 text-sm text-white outline-none"
                      >
                        <option value="">Choose merchant seller…</option>
                        {commerceMerchants.map((merchant) => <option key={merchant.id} value={merchant.id}>{merchant.name}</option>)}
                      </select>
                      {merchantQuery.isLoading ? <p className="mt-2 text-xs text-white/30">Reading merchants with live public commerce…</p> : null}
                      {!merchantQuery.isLoading && !commerceMerchants.length ? <p className="mt-2 text-xs text-white/35">No commerce-ready merchant is visible yet. Use “merchant we need to bring in” instead of inventing one.</p> : null}
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-6 border-b border-white/10 pb-3"><dt className="text-white/38">Supply record</dt><dd className="max-w-sm text-right font-black">{brief.commerceSourceId ? `Linked · ${brief.commerceSourceId.slice(0, 8)}…` : "Not linked yet"}</dd></div>
                  <div className="flex justify-between gap-6"><dt className="text-white/38">Merchant law</dt><dd className="max-w-sm text-right text-white/65">Price, stock, accepted payment, fulfillment, refund/cancel and customer cases belong to Merchant responsibility.</dd></div>
                </dl>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={primaryHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">{user ? actions.primary.label : "Save workspace and continue"} <ArrowRight className="h-4 w-4" /></Link>
              {user ? <Link to={actions.secondary.href} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">{actions.secondary.label}</Link> : null}
              <Link to="/business/start?resume=1" className="inline-flex min-h-12 items-center gap-2 px-3 text-sm font-black text-white/50">Edit outcome brief</Link>
            </div>
          </section>

          <aside className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
            <Package className="h-6 w-6 text-orange-300" />
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Execution checklist</p>
            <div className="mt-5 space-y-4">
              {[
                ["Outcome", "The business change and success action are defined.", true],
                ["Programme", `${programme?.title || "Programme"} gives the starting recipe.`, true],
                ["Execution rail", `${execution?.title || "Execution"} is the primary route.`, true],
                ["Supply / access", executionNeedsCommerce(brief) ? "A real merchant-owned product/service must exist before sale." : "The response must exist in its authoritative object family.", false],
                ["Distribution", "Creators, communities, Brand, Host or direct channels can move attention without becoming seller.", false],
                ["Evidence", "Only the authoritative action record closes the selected success measure.", false],
                ["Return", "PromoCard carries the participant relationship forward after something real happens.", false],
              ].map(([title, copy, done]) => <div key={String(title)} className="grid grid-cols-[24px_1fr] gap-3"><CheckCircle2 className={`mt-0.5 h-4 w-4 ${done ? "text-emerald-300" : "text-white/18"}`} /><div><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-white/38">{copy}</p></div></div>)}
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <CommerceResponsibilityMap />
        </div>
      </div>
    </main>
  );
}
