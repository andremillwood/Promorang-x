import { Link2, ShieldCheck, Sparkles } from "lucide-react";
import { ReferralsSection } from "@/components/participant/ReferralsSection";
import { useI18n } from "@/i18n/I18nContext";

export default function Referrals() {
  const { t } = useI18n();
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
        </section>
      </div>
    </main>
  );
}
