import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/promorang-logo-full.png";

const footerLinks = {
  discover: [
    { label: "Moments", href: "/explore/moments" },
    { label: "Scenes", href: "/scenes" },
    { label: "Discover", href: "/discover" },
    { label: "Content", href: "/explore/content" },
    { label: "Rewards", href: "/explore/rewards" },
    { label: "Venues", href: "/explore/venues" },
    { label: "Genesis Season", href: "/pioneers" },
  ],
  how: [
    { label: "What is Promorang?", href: "/what-is-promorang" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Overview", href: "/economy" },
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

const Footer = ({ showCta = true }: { showCta?: boolean }) => {
  return (
    <footer className="bg-background border-t border-border">
      {/* CTA Section */}
      {showCta ? <div className="container px-4 py-14 sm:px-6 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find the moment you want to be part of.
          </h2>
          <p className="mb-8 text-base text-muted-foreground sm:text-lg">
            Show up, leave your Mark, and let the best parts of the night keep building after it ends.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/free/scene">
                Find Your Scene
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div> : null}

      {/* Footer Links */}
      <div className="border-t border-border">
        <div className="container px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/">
                <img src={logo} alt="Promorang" className="h-8 w-auto mb-4" />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Moments, people, proof, and the value that stays with them.
              </p>
            </div>

            {/* Discover Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Explore</h4>
              <ul className="space-y-3">
                {footerLinks.discover.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* How It Works Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">How it works</h4>
              <ul className="space-y-3">
                {footerLinks.how.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partner Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">For partners</h4>
              <ul className="space-y-3">
                {footerLinks.partners.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Free tools</h4>
              <ul className="space-y-3">{footerLinks.tools.map(link=><li key={link.label}><Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link></li>)}</ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
      <div className="border-t border-border">
        <div className="container px-4 py-6 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Promorang. All rights reserved.
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
