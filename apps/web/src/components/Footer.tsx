import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/promorang-logo-full.png";

const footerLinks = {
  discover: [
    { label: "Browse Moments", href: "/discover" },
    { label: "Near Me", href: "/discover?filter=nearby" },
    { label: "Trending", href: "/discover?filter=trending" },
    { label: "Strategy Index", href: "/strategies" },
    { label: "Bounty Board", href: "/bounties" },
  ],
  create: [
    { label: "For Brands", href: "/for-brands" },
    { label: "For Merchants", href: "/for-merchants" },
    { label: "For Agencies", href: "/for-agencies" },
    { label: "For Hosts", href: "/host" },
    { label: "Pricing", href: "/pricing" },
  ],
  company: [
    { label: "About", href: "/" },
    { label: "Blog", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Press", href: "/" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      {/* CTA Section */}
      <div className="container px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            The world is waiting for your next moment
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of people discovering experiences that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-border">
        <div className="container px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/">
                <img src={logo} alt="Promorang" className="h-8 w-auto mb-4" />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Where moments happen, together.
              </p>
            </div>

            {/* Discover Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Discover</h4>
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

            {/* Create Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Create</h4>
              <ul className="space-y-3">
                {footerLinks.create.map((link) => (
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

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
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
        <div className="container px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Promorang. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
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
