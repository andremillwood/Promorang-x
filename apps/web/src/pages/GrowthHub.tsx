import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Coins,
  Gem,
  HandHeart,
  Megaphone,
  Radio,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import SEO from "@/components/SEO";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const growthTiles = [
  { titleKey: "growthHub.tileContentTitle" as TranslationKey, textKey: "growthHub.tileContentText" as TranslationKey, href: "/content-drops", icon: Radio },
  { titleKey: "growthHub.tilePromoshareTitle" as TranslationKey, textKey: "growthHub.tilePromoshareText" as TranslationKey, href: "/promoshare", icon: Sparkles },
  { titleKey: "growthHub.tileCampaignsTitle" as TranslationKey, textKey: "growthHub.tileCampaignsText" as TranslationKey, href: "/promopush", icon: Megaphone },
  { titleKey: "growthHub.tileReferralsTitle" as TranslationKey, textKey: "growthHub.tileReferralsText" as TranslationKey, href: "/growth/referrals", icon: Share2 },
  { titleKey: "growthHub.tilePioneerTitle" as TranslationKey, textKey: "growthHub.tilePioneerText" as TranslationKey, href: "/growth/pioneer", icon: Trophy },
  { titleKey: "growthHub.tilePiecesTitle" as TranslationKey, textKey: "growthHub.tilePiecesText" as TranslationKey, href: "/portfolio", icon: Trophy },
  { titleKey: "growthHub.tileAnalyticsTitle" as TranslationKey, textKey: "growthHub.tileAnalyticsText" as TranslationKey, href: "/dashboard/analytics", icon: BarChart3 },
  { titleKey: "growthHub.tileEarningsTitle" as TranslationKey, textKey: "growthHub.tileEarningsText" as TranslationKey, href: "/wallet", icon: Coins },
  { titleKey: "growthHub.tileMembershipTitle" as TranslationKey, textKey: "growthHub.tileMembershipText" as TranslationKey, href: "/wallet", icon: Gem },
  { titleKey: "growthHub.tileResilienceTitle" as TranslationKey, textKey: "growthHub.tileResilienceText" as TranslationKey, href: "/support", icon: HandHeart },
  { titleKey: "growthHub.tileKickstartTitle" as TranslationKey, textKey: "growthHub.tileKickstartText" as TranslationKey, href: "/marketplace", icon: Rocket },
];

const primaryJobs = [
  {
    title: "Move an audience toward something real",
    description: "Publish or distribute a release only when there is a clear action worth creating and a way to prove what happened.",
    href: "/content-drops",
    cta: "Find or publish a release",
    icon: Radio,
    proof: "Proof: attributed action / accepted release proof",
  },
  {
    title: "Create customer movement",
    description: "Build a campaign around a customer action such as trial, visit, claim, redemption, purchase, review, or referral.",
    href: "/promopush",
    cta: "Build a customer activation",
    icon: Target,
    proof: "Proof: campaign-linked verified action",
  },
  {
    title: "Bring another person into value",
    description: "Use referrals when introducing someone creates value for them and the resulting action can be attributed back to the introduction.",
    href: "/growth/referrals",
    cta: "Review referrals",
    icon: Users,
    proof: "Proof: attributed signup / downstream action",
  },
  {
    title: "Review what your effort produced",
    description: "Use analytics and your wallet only after there is real recorded activity. No activity should appear as a simulated success metric.",
    href: "/dashboard/analytics",
    cta: "Review recorded results",
    icon: ShieldCheck,
    proof: "Proof: recorded participation, redemption, or settlement",
  },
];

export default function GrowthHub() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-black pb-16 text-white">
      <SEO title={t("growthHub.seoTitle")} description={t("growthHub.seoDescription")} />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,106,0,0.16),transparent_42%)] pt-24">
        <div className="container px-6 pb-12">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Growth workspace</p>
          <h1 className="mt-4 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.06em] md:text-7xl">
            What are you trying to <span className="text-primary">make happen?</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/65">
            Growth is not a collection of features. Choose the real movement you want to create, take the next action, then use PROMORANG to attribute and review the result.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/60">
            <strong className="text-white">Proof rule:</strong> reach is not conversion, a claim is not automatically a purchase, and a reward balance is not financial yield. Each result should be described only as strongly as the underlying evidence allows.
          </div>
        </div>
      </section>

      <div className="container px-6 pt-6">
        <PersonalValueNav />
      </div>

      <section className="container px-6 py-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Start with the job</p>
          <h2 className="mt-2 text-3xl font-black">Choose the movement before the mechanism.</h2>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {primaryJobs.map((job) => {
            const Icon = job.icon;
            return (
              <Link key={job.title} to={job.href} className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-primary/45 hover:bg-white/[0.055]">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black">{job.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{job.description}</p>
                    <p className="mt-3 text-xs font-semibold text-emerald-300/80">{job.proof}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">{job.cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container px-6 pb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Tools when relevant</p>
          <h2 className="mt-2 text-3xl font-black">Open a mechanism only after you know the job.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">These are supporting systems. They are not the reason to use PROMORANG by themselves.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {growthTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={`${tile.href}-${String(tile.titleKey)}`} to={tile.href} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-primary/45">
                <Icon className="mb-5 h-6 w-6 text-primary" />
                <h3 className="text-xl font-black">{t(tile.titleKey)}</h3>
                <p className="mt-3 min-h-16 text-sm leading-6 text-white/55">{t(tile.textKey)}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">Open when needed<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container px-6 pb-12">
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.05] p-5 text-sm leading-6 text-amber-100/75">
          <strong className="text-amber-100">No demo opportunities are shown as live inventory here.</strong> Opportunities, earnings, balances, and performance should come from real account or platform records. Development fixtures belong in development and test environments only.
        </div>
      </section>
    </main>
  );
}
