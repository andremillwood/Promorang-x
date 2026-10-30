import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./MarketingStory.css";

type MarketingHeroProps = {
  eyebrow: string; title: ReactNode; intro: string;
  primary?: { label: string; href: string }; secondary?: { label: string; href: string };
  image?: string; variant?: "portrait" | "panorama" | "product" | "statement";
  children?: ReactNode;
};

export function MarketingHero({ eyebrow, title, intro, primary, secondary, image, variant = "portrait", children }: MarketingHeroProps) {
  return <section className={`marketing-story-hero marketing-story-hero--${variant}`} aria-labelledby="marketing-page-title">
    {image ? <img className="marketing-story-photo" src={image} alt="" loading="eager" /> : null}
    <div className="marketing-story-hero-inner">
      <div className="marketing-story-copy">
        <p className="marketing-story-kicker">{eyebrow}</p>
        <h1 id="marketing-page-title">{title}</h1>
        <p className="marketing-story-intro">{intro}</p>
        {primary || secondary ? <div className="marketing-story-actions">
          {primary ? <Link className="marketing-story-primary" to={primary.href}>{primary.label}<ArrowRight size={18} aria-hidden="true" /></Link> : null}
          {secondary ? <Link className="marketing-story-secondary" to={secondary.href}>{secondary.label}<ArrowRight size={16} aria-hidden="true" /></Link> : null}
        </div> : null}
      </div>
      {children ? <div className="marketing-story-visual">{children}</div> : null}
    </div>
  </section>;
}
