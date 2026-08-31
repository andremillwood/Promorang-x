import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/promorang-logo-full.png";
import { useI18n } from "@/i18n/I18nContext";

import type { TranslationKey } from "@/i18n/translations";

const footerLinks: Record<string, Array<{ key: TranslationKey; href: string }>> = {
  discover: [
    { key: "footer.linkMoments", href: "/explore/moments" },
    { key: "footer.linkScenes", href: "/scenes" },
    { key: "footer.linkDiscover", href: "/discover" },
    { key: "footer.linkContent", href: "/explore/content" },
    { key: "footer.linkRewards", href: "/explore/rewards" },
    { key: "footer.linkVenues", href: "/explore/venues" },
    { key: "footer.linkGenesis", href: "/pioneers" },
    { key: "footer.linkSaveWin", href: "/nodes" },
  ],
  how: [
    { key: "footer.linkWhatIs", href: "/what-is-promorang" },
    { key: "footer.linkHowItWorks", href: "/how-it-works" },
    { key: "footer.linkOverview", href: "/economy" },
    { key: "footer.linkCommunityVaults", href: "/nodes" },
    { key: "footer.linkEconomyMoments", href: "/economy/moments" },
    { key: "footer.linkPoints", href: "/economy/points" },
    { key: "footer.linkPromoKeys", href: "/economy/keys" },
    { key: "footer.linkMasterKey", href: "/economy/master-key" },
    { key: "footer.linkPieces", href: "/economy/pieces" },
    { key: "footer.linkEconomyContent", href: "/economy/content" },
    { key: "footer.linkTicketsGems", href: "/economy/promoshare-gems" },
    { key: "footer.linkNetworkValue", href: "/economy/network" },
  ],
  partners: [
    { key: "footer.linkForBrands", href: "/for-brands" },
    { key: "footer.linkForCreators", href: "/for-creators" },
    { key: "footer.linkForMerchants", href: "/for-merchants" },
    { key: "footer.linkForHosts", href: "/for-communities" },
    { key: "footer.linkForAgencies", href: "/for-agencies" },
    { key: "footer.linkForEnterprise", href: "/for-enterprise" },
    { key: "footer.linkForCauses", href: "/for-causes" },
  ],
  support: [
    { key: "footer.linkHelp", href: "/help" },
    { key: "footer.linkSupport", href: "/support/tickets" },
    { key: "footer.linkContact", href: "/contact" },
    { key: "footer.linkTerms", href: "/terms" },
    { key: "footer.linkPrivacy", href: "/privacy" },
  ],
  tools: [
    { key: "footer.linkFindScene", href: "/free/scene" },
    { key: "footer.linkScoreMoment", href: "/free/moment" },
    { key: "footer.linkRevealDemand", href: "/free/demand" },
    { key: "footer.linkAuditInfluence", href: "/free/creator" },
    { key: "footer.linkBuildBrief", href: "/free/sponsor" },
  ],
};

const Footer = ({ showCta = true }: { showCta?: boolean }) => {
  const { t } = useI18n();
  return (
    <footer className="bg-background border-t border-border">
      {/* CTA Section */}
      {showCta ? <div className="w-full px-4 py-14 sm:px-6 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("footer.ctaTitle")}
          </h2>
          <p className="mb-8 text-base text-muted-foreground sm:text-lg">
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
      <div className="border-t border-border">
        <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/">
                <img src={logo} alt="Promorang" className="h-8 w-auto mb-4" />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("footer.tagline")}
              </p>
            </div>

            {/* Discover Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.explore")}</h4>
              <ul className="space-y-3">
                {footerLinks.discover.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* How It Works Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.how")}</h4>
              <ul className="space-y-3">
                {footerLinks.how.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partner Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.partners")}</h4>
              <ul className="space-y-3">
                {footerLinks.partners.map((link) => (
                  <li key={`${link.href}-${link.key}`}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.tools")}</h4>
              <ul className="space-y-3">{footerLinks.tools.map(link=><li key={link.href}><Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t(link.key)}</Link></li>)}</ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t("footer.support")}</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container px-4 py-6 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
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
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
