import { Link, useParams } from "react-router-dom";
import { ArrowRight, Award, CalendarDays, CheckCircle2, Gem, Instagram, Mail, MessageCircle, Music2, Play, Radio, Share2, Sparkles, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { ExperienceCard, MobileBottomNav } from "@/components/culture/CultureCards";
import { cultureCreators, cultureEvents } from "@/data/culture-demo";
import { ContentProvenanceBadge, SampleContentNotice } from "@/components/content/ContentProvenance";
import { useI18n } from "@/i18n/I18nContext";

export default function CreatorDetail() {
  const { t } = useI18n();
  const { handle } = useParams();
  const creator = cultureCreators.find((item) => item.handle === handle) || cultureCreators[0];
  const tabs = [
    { label: t("creatorProfile.overview"), icon: Users },
    { label: t("creatorProfile.events"), icon: CalendarDays },
    { label: t("creatorProfile.content"), icon: Play },
    { label: t("creatorProfile.bookings"), icon: Mail },
    { label: t("creatorProfile.about"), icon: MessageCircle },
  ];
  const creatorRail = [
    { label: t("creatorProfile.follow"), body: t("creatorProfile.followBody"), icon: Users },
    { label: t("creatorProfile.moveContent"), body: t("creatorProfile.moveContentBody"), icon: Play },
    { label: t("creatorProfile.unlockStatus"), body: t("creatorProfile.unlockStatusBody"), icon: Award },
  ];

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={`${creator.name} — ${t("creatorProfile.seoSuffix")}`}
        description={creator.bio}
      />

      <section className="relative overflow-hidden border-b border-white/10 pt-24">
        <img src={creator.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.78)_48%,rgba(0,0,0,0.38)_100%)]" />
        <div className="container relative z-10 grid gap-7 px-6 pb-10 pt-16 md:grid-cols-[150px_1fr_340px] md:items-end">
          <div className="relative">
            <img src={creator.avatar} alt="" className="h-36 w-36 rounded-full border-4 border-white object-cover" />
            <span className="absolute bottom-2 right-2 rounded-full bg-primary p-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </span>
          </div>
          <div>
            <ContentProvenanceBadge />
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] md:text-7xl">{creator.name}</h1>
            <p className="mt-2 text-white/70">@{creator.handle}</p>
            <p className="mt-2 text-lg text-white/80">{creator.role}</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">{creator.bio}</p>
            <p className="mt-2 text-sm font-bold text-primary">{t("creatorProfile.bookings")}: {creator.booking}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary">{t("creatorProfile.status")}</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                [t("creatorProfile.followers"), creator.followers],
                [t("creatorProfile.following"), creator.following],
                [t("creatorProfile.events"), creator.events],
                [t("creatorProfile.checkins"), creator.checkIns],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="font-black">{value}</p>
                  <p className="text-[10px] text-white/45">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2">
              <Link to="/auth" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
                {t("creatorProfile.follow")}
              </Link>
              <Link to="/profile" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-black text-white">
                {t("creatorProfile.message")}
              </Link>
              <button type="button" className="rounded-xl border border-white/15 p-3">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex gap-4 text-white/65">
              {[Instagram, Music2, Play].map((Icon, index) => (
                <Icon key={index} className="h-5 w-5" />
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.06] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{t("creatorProfile.unlocks")}</p>
              <p className="mt-2 text-sm leading-6 text-white/66">
                {t("creatorProfile.unlocksCopy")}
              </p>
            </div>
          </div>
        </div>
        <div className="relative z-10 border-t border-white/10 bg-black/70">
          <div className="container flex gap-6 overflow-x-auto px-6 scrollbar-none">
            {tabs.map((tab, index) => (
              <button key={tab.label} className={`inline-flex min-w-fit items-center gap-2 border-b-2 px-2 py-4 text-sm font-bold ${index === 0 ? "border-primary text-primary" : "border-transparent text-white/60"}`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="container px-6 pt-6">
        <SampleContentNotice noun="creator profile, metrics, and activity" />
      </div>

      <section className="container grid gap-8 px-6 py-10 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-10 grid gap-3 md:grid-cols-3">
            {creatorRail.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-primary">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/66">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-[-0.03em]">{t("creatorProfile.upcoming")}</h2>
            <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
              {t("creatorProfile.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cultureEvents.slice(0, 4).map((event) => (
              <ExperienceCard key={event.slug} event={event} compact />
            ))}
          </div>

          <div className="mt-10">
            <h2 className="mb-5 text-2xl font-black uppercase tracking-[-0.03em]">{t("creatorProfile.recent")}</h2>
            <div className="grid grid-flow-col auto-cols-[68%] gap-4 overflow-x-auto pb-3 scrollbar-none md:auto-cols-[30%]">
              {cultureEvents.map((event) => (
                <Link key={event.slug} to="/discover/content" className="group">
                  <article className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]">
                    <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-4">
                      <Play className="mb-auto h-8 w-8 rounded-full bg-black/50 p-2 text-white" />
                      <p className="font-bold">{event.shortTitle} was a movie!</p>
                      <p className="text-xs text-white/50">{t("creatorProfile.recap")}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary/20 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-primary">share signal</span>
                        <span className="rounded-full bg-white/[0.10] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/58">PromoShare</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          {/* PromoShare Share-to-Earn Card */}
          <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-black to-black p-5 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Share-to-Earn Active</p>
            </div>
            <h3 className="mt-2 text-base font-extrabold text-white">Earn with @{creator.handle}</h3>
            <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
              Share this creator&apos;s upcoming moments and drops. Earn an instant 15% Gem commission on every verified check-in driven.
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`https://promorang.co/creators/${creator.handle}?ref=promoshare`);
                alert(`PromoShare link for @${creator.handle} copied!`);
              }}
              className="mt-4 w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Copy PromoShare Link</span>
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t("creatorProfile.growth")}</p>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {t("creatorProfile.growthCopy")}
            </p>
            <Link to="/growth" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
              {t("creatorProfile.openGrowth")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">{t("creatorProfile.signals")}</p>
            <div className="mt-4 space-y-2">
              {[
                ["Live pull", Radio],
                ["Drop motion", Sparkles],
                ["Pieces potential", Gem],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-sm font-bold">{label as string}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <MobileBottomNav />
    </main>
  );
}
