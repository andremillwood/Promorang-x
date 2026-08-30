import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/promorang-logo-full.png";
import { useI18n } from "@/i18n/I18nContext";

const footerLinks = {
  discover: [
    { label: "Moments", href: "/explore/moments" },
    { label: "Scenes", href: "/scenes" },
    { label: "Discover", href: "/discover" },
    { label: "Content", href: "/explore/content" },
    { label: "Rewards", href: "/explore/rewards" },
    { label: "Venues", href: "/explore/venues" },
    { label: "Genesis Season", href: "/pioneers" },
    { label: "Save & Win Vaults", href: "/nodes" },
  ],
  how: [
    { label: "What is Promorang?", href: "/what-is-promorang" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Overview", href: "/economy" },
    { label: "Community Vaults", href: "/nodes" },
    { label: "Moments", href: "/economy/moments" },
    { label: "Points", href: "/economy/points" },
    { label: "PromoKeys", href: "/economy/keys" },
    { label: "Master Key", href: "/economy/master-key" },
    { label: "Pieces", href: "/economy/pieces" },
    { label: "Content", href: "/economy/content" },
    { label: "Tickets & Gems", href: "/economy/promoshare-gems" },
    { label: "Network value", href: "/economy/network" },
  ],
  partners: [
    { label: "For Brands", href: "/for-brands" },
    { label: "For Creators", href: "/for-creators" },
    { label: "For Merchants", href: "/for-merchants" },
    { label: "For Hosts", href: "/for-communities" },
    { label: "For Agencies", href: "/for-agencies" },
    { label: "For Enterprise", href: "/for-enterprise" },
    { label: "For Causes & Non-Profits", href: "/for-causes" },
  ],
  support: [
    { label: "Knowledge Base & FAQs", href: "/help" },
    { label: "Support Tickets", href: "/support/tickets" },
    { label: "Contact Us", href: "/contact" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
  tools: [
    { label: "Find Your Scene", href: "/free/scene" },
    { label: "Score Your Moment", href: "/free/moment" },
    { label: "Reveal Nearby Demand", href: "/free/demand" },
    { label: "Audit Your Influence", href: "/free/creator" },
    { label: "Build an Activation Brief", href: "/free/sponsor" },
  ],
};

const Footer = ({ showCta = true, dark = false }: { showCta?: boolean; dark?: boolean }) => {
  const { t } = useI18n();
  const muted = dark ? "text-white/55" : "text-muted-foreground";
  const heading = dark ? "text-white" : "text-foreground";
  const hover = dark ? "hover:text-white" : "hover:text-foreground";
  return (
    <footer className={dark ? "border-t border-white/10 bg-black" : "border-t border-border bg-background"}>
      {/* CTA Section */}
      {showCta ? <div className="w-full px-4 py-14 sm:px-6 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`font-serif text-3xl md:text-4xl font-bold mb-4 ${heading}`}>
            {t("footer.ctaTitle")}
          </h2>
          <p className={`mb-8 text-base sm:text-lg ${muted}`}>
            {t("footer.ctaCopy")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/free/scene">
                {t("footer.ctaButton")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div> : null}

      {/* Footer Links */}
      <div className={dark ? "border-t border-white/10" : "border-t border-border"}>
        <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/">
                <img src={logo} alt="Promorang" className="h-8 w-auto mb-4" />
              </Link>
              <p className={`text-sm leading-relaxed ${muted}`}>
                {t("footer.tagline")}
              </p>
            </div>

            {/* Discover Links */}
            <div>
              <h4 className={`font-semibold mb-4 ${heading}`}>{t("footer.explore")}</h4>
              <ul className="space-y-3">
                {footerLinks.discover.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`text-sm transition-colors ${muted} ${hover}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* How It Works Links */}
            <div>
              <h4 className={`font-semibold mb-4 ${heading}`}>{t("footer.how")}</h4>
              <ul className="space-y-3">
                {footerLinks.how.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`text-sm transition-colors ${muted} ${hover}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partner Links */}
            <div>
              <h4 className={`font-semibold mb-4 ${heading}`}>{t("footer.partners")}</h4>
              <ul className="space-y-3">
                {footerLinks.partners.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`text-sm transition-colors ${muted} ${hover}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`font-semibold mb-4 ${heading}`}>{t("footer.tools")}</h4>
              <ul className="space-y-3">{footerLinks.tools.map(link=><li key={link.label}><Link to={link.href} className={`text-sm transition-colors ${muted} ${hover}`}>{link.label}</Link></li>)}</ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className={`font-semibold mb-4 ${heading}`}>{t("footer.support")}</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`text-sm transition-colors ${muted} ${hover}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={dark ? "border-t border-white/10" : "border-t border-border"}>
        <div className="container px-4 py-6 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className={`text-sm ${muted}`}>
              {t("footer.rights")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { name: "Twitter", url: "https://twitter.com" },
                { name: "Instagram", url: "https://instagram.com" },
                { name: "LinkedIn", url: "https://linkedin.com" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm transition-colors ${muted} ${hover}`}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
