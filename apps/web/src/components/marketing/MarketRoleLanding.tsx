import { useI18n } from "@/i18n/I18nContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { discoverPathHref } from "@/lib/discovery-path";
import { MarketingHero } from "./MarketingHero";
import creatorPhoto from "@/assets/moments/open-mic.jpg";
import hostPhoto from "@/assets/moments/jazz-night.jpg";
import communityPhoto from "@/assets/hero-moments.jpg";
import agencyPhoto from "@/assets/moments/coffee-code.jpg";
import causePhoto from "@/assets/moments/hiking.jpg";

type RoleLandingProps = {
  role: "creator" | "host" | "community" | "agency" | "enterprise" | "cause";
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  roleJob: string;
  discoveryUse: string;
  demandUse: string;
  responseTitle: string;
  responseDetail: string;
  responseStub: string;
  proofTitle: string;
  proofDetail: string;
  promoCardDetail: string;
  truthGates: string[];
};


const roleVisuals = {
  creator: { image: creatorPhoto, variant: "portrait" },
  host: { image: hostPhoto, variant: "panorama" },
  community: { image: communityPhoto, variant: "panorama" },
  agency: { image: agencyPhoto, variant: "portrait" },
  enterprise: { image: agencyPhoto, variant: "statement" },
  cause: { image: causePhoto, variant: "panorama" },
} as const;

export default function MarketRoleLanding(props: RoleLandingProps) {
  const { t } = useI18n();
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const signal = inbox.questions[0];
  const visual = roleVisuals[props.role];
  return <main className={`marketing-story marketing-story--${props.role}`}>
    <SEO title={props.seoTitle} description={props.seoDescription} />
    <MarketingHero eyebrow={props.eyebrow} title={props.title} intro={props.intro} primary={props.primaryCta} secondary={props.secondaryCta} {...visual} />
    <section className="marketing-story-response marketing-story-section">
      <div className="marketing-story-section-inner marketing-story-response-layout">
        <h2>{props.responseTitle}</h2>
        <div><p className="marketing-story-lead">{props.responseDetail}</p><p>{props.roleJob}</p></div>
      </div>
    </section>
    <section className="marketing-story-section marketing-story-evidence">
      <div className="marketing-story-section-inner marketing-story-evidence-layout">
        <div><h2>{props.proofTitle}</h2><p>{props.proofDetail}</p></div>
        <details className="marketing-story-disclosure"><summary>{t("compression.details")}</summary><p>{t("compression.distinctions")}</p><ul>{props.truthGates.map(gate => <li key={gate}>{gate}</li>)}</ul></details>
      </div>
    </section>
    <section className="marketing-story-section marketing-story-market">
      <div className="marketing-story-section-inner marketing-story-market-layout">
        <div><h2>{t("compression.marketTitle")}</h2><p>{t("compression.marketCopy")}</p><Link className="marketing-story-text-link" to="/discover?tab=wants">{t("compression.seeDemand")}<ArrowRight size={18} aria-hidden="true" /></Link></div>
        <div className="marketing-story-signal">
          {signal ? <DemandSignalObject city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={discoverPathHref(signal.poll.question)} actionLabel={t("compression.seeDemand")} state={signal.votesRemaining === 0 ? "threshold_met" : signal.closeness === "unlocking" ? "near_threshold" : signal.closeness} /> : isLoading ? <p role="status">{t("people.homeLoad")}</p> : <div className="marketing-story-quiet"><h3>{t("compression.quiet")}</h3><p>{t("compression.quietCopy")}</p><span>{city.name}</span></div>}
        </div>
      </div>
    </section>
    <section className="marketing-story-section marketing-story-card-section">
      <div className="marketing-story-section-inner marketing-story-card-layout">
        <div className="marketing-story-card-object"><PromoCardFace interactive={false} compact /></div>
        <div><h2>{t("compression.keepTitle")}</h2><p>{props.promoCardDetail}</p><Link className="marketing-story-text-link" to="/what-is-promorang">{t("compression.cardMore")}<ArrowRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </section>
    <section className="marketing-story-section marketing-story-close"><div className="marketing-story-section-inner"><h2>{t("compression.ready")}</h2><Link className="marketing-story-primary" to={props.primaryCta.href}>{props.primaryCta.label}<ArrowRight size={18} aria-hidden="true" /></Link></div></section>
  </main>;
}
