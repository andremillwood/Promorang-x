import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Store } from "lucide-react";
import SEO from "@/components/SEO";
import { PromoCardCheckoutDemo } from "@/components/promocard/PromoCardCheckoutDemo";
import {
  NightTrail,
  PlainEnglish,
  RoleLens,
} from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { PUBLIC_PROMOCARD_PATH, promoCardActionHref } from "@/lib/promocard/public-path";

export default function PromoCardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const actionHref = promoCardActionHref(Boolean(user));

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <SEO
        title={t("promoCardPage.seoTitle")}
        description={t("promoCardPage.seoDescription")}
        url={typeof window !== "undefined" ? `${window.location.origin}${PUBLIC_PROMOCARD_PATH}` : undefined}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("promoCardPage.seoTitle"),
          description: t("promoCardPage.seoDescription"),
          url: PUBLIC_PROMOCARD_PATH,
        }}
      />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#120e0b] pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(255,113,16,0.2),transparent_36%)]" />
        <div className="container relative z-10 px-6">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-primary">{t("economy.pcEyebrow")}</p>
              <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                {t("promoCardPage.headline")}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 md:text-lg">{t("economy.pcSubhead")}</p>
              <div className="mt-6 max-w-xl">
                <PlainEnglish>{t("promoCardPage.plainEnglish")}</PlainEnglish>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <TactileButton variant="primary" size="xl" asChild>
                  <Link to={actionHref}>
                    {user ? t("promoCardMoment.openCard") : t("promoCardExplainer.getCard")}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </TactileButton>
                <TactileButton variant="obsidian" size="xl" asChild>
                  <Link to="/shop">
                    <Store className="h-4 w-4" />
                    {t("promoCardPage.seePlaces")}
                  </Link>
                </TactileButton>
              </div>
            </div>
            <PromoCardCheckoutDemo />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#070707] py-16 md:py-24">
        <div className="container px-6">
          <NightTrail
            eyebrow={t("promoCardPage.trailEyebrow")}
            title={t("promoCardPage.trailTitle")}
            steps={[
              { label: "01", title: t("economy.pcS1Title"), text: t("economy.pcS1Text") },
              { label: "02", title: t("economy.pcS2Title"), text: t("economy.pcS2Text") },
              { label: "03", title: t("promoCardExplainer.step3Title"), text: t("promoCardExplainer.step3Text") },
              { label: "04", title: t("promoCardExplainer.step4Title"), text: t("promoCardExplainer.step4Text") },
            ]}
          />
          <p className="mt-12 text-center font-serif text-lg italic text-zinc-300">{t("economy.pcTagline")}</p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0c0c0c] py-16 md:py-24">
        <div className="container px-6">
          <p className="text-xs font-bold tracking-[0.2em] text-primary">{t("economy.chooseView")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{t("economy.doesForYou")}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">{t("economy.pickOption")}</p>
          <div className="mt-8">
            <RoleLens
              selectedIndex={selectedRoleIndex}
              onSelect={setSelectedRoleIndex}
              roles={[
                {
                  role: t("economy.pcRole1"),
                  why: t("economy.pcRole1Why"),
                  outcome: t("economy.pcRole1Outcome"),
                  action: user ? t("promoCardMoment.openCard") : t("economy.pcRole1Action"),
                  href: actionHref,
                },
                {
                  role: t("economy.pcRole2"),
                  why: t("economy.pcRole2Why"),
                  outcome: t("economy.pcRole2Outcome"),
                  action: t("economy.pcRole2Action"),
                  href: "/for-merchants",
                },
                {
                  role: t("economy.pcRole3"),
                  why: t("economy.pcRole3Why"),
                  outcome: t("economy.pcRole3Outcome"),
                  action: t("economy.pcRole3Action"),
                  href: "/for-brands",
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0a0a0a] py-16 md:py-24">
        <div className="container px-6">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-400">{t("how.faqEyebrow")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{t("how.faq1Q")}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">{t("how.faq1A")}</p>
          <h3 className="mt-10 font-serif text-2xl font-bold">{t("how.faq2Q")}</h3>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">{t("how.faq2A")}</p>
          <p className="mt-8 text-sm leading-6 text-white/45">{t("promoCardExplainer.disclaimer")}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-black">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-6 font-serif text-3xl font-bold md:text-5xl">{t("promoCardPage.ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300">{t("promoCardPage.ctaCopy")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TactileButton variant="primary" size="xl" asChild>
              <Link to={actionHref}>
                {user ? t("promoCardMoment.openCard") : t("promoCardExplainer.getCard")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </TactileButton>
            <TactileButton variant="obsidian" size="xl" asChild>
              <Link to="/economy/promocard">{t("promoCardExplainer.seeMoneyFlow")}</Link>
            </TactileButton>
          </div>
        </div>
      </section>
    </div>
  );
}
