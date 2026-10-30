import { Link } from "react-router-dom";
import { ArrowRight, Compass, Store, Megaphone, Camera } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { ReactNode } from "react";
import partnerPhoto from "@/assets/hero-moments.jpg";
import nightlifeHero from "@/assets/public-home-nightlife-hero.jpg";
import type { TranslationKey } from "@/i18n/translations";
import "./PublicMarketHome.css";

const scenes = [
  { key: "food" },
  { key: "nightlife" },
  { key: "wellness" },
] as const;

const paths = [
  { key: "people", href: "/scenes", icon: Compass },
  { key: "merchants", href: "/for-merchants", icon: Store },
  { key: "creators", href: "/for-creators", icon: Camera },
  { key: "brands", href: "/for-brands", icon: Megaphone },
] as const;

export function HomeIntroduction({ opportunities, market, children }: { opportunities: ReactNode; market?: string; children?: ReactNode }) {
  const { t } = useI18n();
  return <div className="home-introduction">
    <div className="home-hero-dark">
    <img className="home-hero-photograph" src={nightlifeHero} alt="" loading="eager" />
    <section className="home-intro-hero" aria-labelledby="home-intro-title">
      <div className="home-intro-copy">
        <p className="home-kicker">{market || t("homeIntro.eyebrow")}</p>
        <h1 id="home-intro-title">{t("homeIntro.title")} <span>{t("homeIntro.accent")}</span></h1>
        <p className="home-intro-description">{t("homeIntro.intro")}</p>
        <div className="home-intro-actions">
          <Link to="/discover" className="home-primary-link">{t("homeIntro.explore")}<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <nav className="home-scene-ribbon" aria-label={t("homeValue.scenes")}>
          {scenes.map(scene => <Link key={scene.key} to={`/discover?category=${scene.key}`}>
            <span>{t(`publicHome.category.${scene.key}` as TranslationKey)}<ArrowRight size={15} aria-hidden="true" /></span>
          </Link>)}
        </nav>
      </div>
      <aside className="home-hero-showcase" aria-label={t("homeIntro.boardTitle")}><p className="home-showcase-title">{t("homeIntro.boardTitle")}</p>{opportunities}</aside>
    </section>
    </div>
    {children}
    <section className="home-paths" aria-labelledby="home-paths-title">
      <header><h2 id="home-paths-title">{t("homeIntro.paths")}</h2><p>{t("homeIntro.pathsCopy")}</p></header>
      <div className="home-path-layout"><img className="home-partner-photo" src={partnerPhoto} alt="" loading="lazy" /><div className="home-path-grid">
        {paths.map(({ key, href, icon: Icon }) => <Link key={key} to={href} className="home-path">
          <div className="home-path-label"><Icon size={19} aria-hidden="true" /><span>{t(`homeIntro.${key}` as TranslationKey)}</span></div>
          <h3>{t(`homeIntro.${key}Title` as TranslationKey)}</h3>
          <p>{t(`homeIntro.${key}Copy` as TranslationKey)}</p>
          <span className="home-path-action">{t(`homeIntro.${key}Cta` as TranslationKey)}<ArrowRight size={17} aria-hidden="true" /></span>
        </Link>)}
      </div>
      </div>
      <div className="home-extra-paths">
        <Link to="/solutions">{t("homeIntro.business")}<ArrowRight size={16} aria-hidden="true" /></Link>
        {[["/hosting", "hosts"], ["/for-communities", "communities"], ["/for-agencies", "agencies"]].map(([href, key]) => <Link key={href} to={href}>{t(`homeIntro.${key}` as TranslationKey)}<ArrowRight size={15} aria-hidden="true" /></Link>)}
      </div>
    </section>
  </div>;
}
