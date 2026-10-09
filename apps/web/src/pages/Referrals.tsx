import { commerceStatus } from "@/i18n/commerce-status";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/lib/api';
import { Link2, ShieldCheck, Sparkles } from "lucide-react";
import { ReferralsSection } from "@/components/participant/ReferralsSection";
import { useI18n } from "@/i18n/I18nContext";

export default function Referrals() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const purchases = useQuery({ queryKey: ['referral-purchases', user?.id], enabled: Boolean(user), queryFn: async () => {
    const { data } = await supabase.auth.getSession();
    const response = await fetch(`${API_BASE_URL}/commerce/referral-purchases`, { headers: { Authorization: `Bearer ${data.session?.access_token}` } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load referred purchases');
    return result.purchases as { id: string; payment_status: string; fulfillment_status: string; total_amount: number; currency: string }[];
  } });
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#FF6A00]/15 blur-3xl" />
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#FFC300]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("referrals.network")}
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
              {t("referrals.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              {t("referrals.copy")}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/55">
              <span className="inline-flex items-center gap-2"><Link2 className="h-4 w-4 text-[#FF6A00]" /> {t("referrals.oneLink")}</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#FF6A00]" /> {t("referrals.verified")}</span>
            </div>
          </div>
        </header>

        <section aria-labelledby="referral-dashboard-title" className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF6A00]">{t("referrals.dashboard")}</p>
            <h2 id="referral-dashboard-title" className="mt-1 text-2xl font-black">{t("referrals.results")}</h2>
          </div>
          <ReferralsSection />
          <section className="mt-8 border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold">{t("release.88")}</h2>
            <p className="mt-3 text-sm text-white/60">{t("release.89")}</p>
            {purchases.isLoading ? <p role="status" className="mt-4">{t("release.90")}</p> : purchases.isError ? <p role="alert" className="mt-4">{t("release.91")} <button className="underline" onClick={() => void purchases.refetch()}>{t("release.18")}</button></p> : purchases.data?.length ? <ul className="mt-5 divide-y divide-white/10">{purchases.data.map(purchase => <li key={purchase.id} className="flex flex-wrap justify-between gap-3 py-4"><span>{t("cart.orderId", { id: purchase.id.slice(0,8) })}</span><span>{commerceStatus(t, purchase.payment_status)} · {commerceStatus(t, purchase.fulfillment_status)}</span><strong>{new Intl.NumberFormat(locale, { style: 'currency', currency: purchase.currency }).format(Number(purchase.total_amount))}</strong></li>)}</ul> : <p className="mt-4 text-sm text-white/50">{t("release.92")}</p>}
          </section>
        </section>
      </div>
    </main>
  );
}
