import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Building2, MapPinned, Radio, ShieldCheck, Users } from "lucide-react";
import { COUNTRY_MARKETS } from "@promorang/shared";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildLocationPath } from "@/lib/discovery";
import { useI18n } from "@/i18n/I18nContext";

export default function CityStewards() {
  const { t } = useI18n();
  const activeMarkets = COUNTRY_MARKETS.filter((market) => market.features.cityStewards);

  const responsibilities = [
    { icon: MapPinned, title: t("cityStewards.resp1Title"), copy: t("cityStewards.resp1Copy") },
    { icon: BadgeCheck, title: t("cityStewards.resp2Title"), copy: t("cityStewards.resp2Copy") },
    { icon: Users, title: t("cityStewards.resp3Title"), copy: t("cityStewards.resp3Copy") },
    { icon: Building2, title: t("cityStewards.resp4Title"), copy: t("cityStewards.resp4Copy") },
  ];

  return (
    <main className="bg-background text-foreground">
      <SEO title="City Stewards | Promorang" description="Help your city become discoverable on its own terms as a founding Promorang City Steward." />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-[#090a0b] px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,hsl(var(--primary)/0.26),transparent_30%),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(255,255,255,0.03)_40px)]" />
          <div className="relative max-w-4xl">
            <Badge className="bg-primary text-primary-foreground"><Radio className="mr-2 h-3.5 w-3.5" />{t("cityStewards.badge")}</Badge>
            <h1 className="mt-6 font-serif text-5xl font-black leading-[0.98] sm:text-7xl">{t("cityStewards.heroTitle")}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">{t("cityStewards.heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/contact?subject=city-steward">{t("cityStewards.registerInterest")}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"><a href="#program">{t("cityStewards.seeHowItWorks")}</a></Button>
            </div>
          </div>
        </div>

        <section id="program" className="py-16">
          <div className="grid gap-4 md:grid-cols-2">{responsibilities.map(({ icon: Icon, title, copy }, index) => <article key={title} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft"><div className="flex items-start gap-4"><div className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div><div><p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("cityStewards.respPrefix")} 0{index + 1}</p><h2 className="mt-2 font-serif text-2xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div></div></article>)}</div>
        </section>

        <section className="grid gap-8 rounded-[2rem] border border-border bg-muted/30 p-7 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
          <div><ShieldCheck className="h-8 w-8 text-primary" /><h2 className="mt-4 font-serif text-3xl font-bold">{t("cityStewards.trustRoleTitle")}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{t("cityStewards.trustRoleCopy")}</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{["Local identity and city knowledge", "Two credible community references", "Weekly verification capacity", "Conflict-of-interest disclosure", "Respect for privacy and safety", "No pay-to-rank local listings"].map((item) => <div key={item} className="flex gap-3 rounded-2xl border border-border bg-background p-4 text-sm"><BadgeCheck className="h-5 w-5 shrink-0 text-primary" />{item}</div>)}</div>
        </section>

        <section className="py-16"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("cityStewards.foundingMarkets")}</p><h2 className="mt-3 font-serif text-3xl font-bold">{t("cityStewards.chooseCity")}</h2><div className="mt-6 flex flex-wrap gap-3">{activeMarkets.flatMap((market) => market.cities.map((city) => <Button key={`${market.code}-${city.slug}`} asChild variant="outline" className="rounded-full"><Link to={buildLocationPath(market.slug, city.slug)}>{city.name} · {market.code}</Link></Button>))}</div></section>
      </section>
    </main>
  );
}
