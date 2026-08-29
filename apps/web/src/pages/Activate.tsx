import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Activity, 
  Users, 
  Target, 
  ChevronRight, 
  Star 
} from 'lucide-react';
import SEO from '@/components/SEO';
import { SwipeRail } from '@/components/ui/SwipeRail';
import { useI18n } from '@/i18n/I18nContext';

export default function ActivatePage() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeStats, setActiveStats] = useState({
    earners: 127,
    payout: 0.3,
    earnings: 12
  });

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard/campaigns/create');
    } else {
      navigate('/auth?role=brand');
    }
  };

  // Animate stats on load
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStats(prev => ({
        earners: prev.earners + Math.floor(Math.random() * 5),
        payout: prev.payout + (Math.random() * 0.1),
        earnings: prev.earnings + Math.floor(Math.random() * 3)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={t("activatePage.seoTitle")}
        description={t("activatePage.seoDesc")}
      />

      {/* Modern Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <img 
                  src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
                  alt="Promorang"
                  className="h-8 w-auto transition-transform hover:scale-105"
                />
              </Link>
              <span className="ml-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded uppercase tracking-tighter shadow-sm">{t("activatePage.businessTag")}</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#packages" className="text-muted-foreground hover:text-foreground font-medium transition-colors">{t("activatePage.navPackages")}</a>
              <a href="#outcomes" className="text-muted-foreground hover:text-foreground font-medium transition-colors">{t("activatePage.navOutcomes")}</a>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCtaClick}
                variant="hero"
                size="sm"
              >
                {t("activatePage.navLaunch")}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-14 sm:py-16 lg:py-24">
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-primary/20">
               <Sparkles className="w-4 h-4 mr-2" />
               {t("activatePage.heroBadge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              {t("activatePage.heroTitlePart1")}
              <span className="block text-gradient-primary">
                {t("activatePage.heroTitlePart2")}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {t("activatePage.heroSubtitlePart1")} 
              <span className="font-semibold text-foreground"> {t("activatePage.heroSubtitlePart2")}</span>
            </p>

            {/* CTAs */}
            <div className="mb-10 flex flex-col justify-center gap-4 animate-slide-up sm:flex-row" style={{ animationDelay: "0.2s" }}>
              <Button
                onClick={handleCtaClick}
                variant="hero"
                size="xl"
                className="group"
              >
                {t("activatePage.heroCta")}
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> {t("activatePage.featVerifiedActions")}</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> {t("activatePage.featUgcRights")}</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> {t("activatePage.feat5DayDelivery")}</div>
            </div>

            <SwipeRail fadeFrom="from-background" className="mt-6 -mx-4 px-4 sm:hidden" scrollerClassName="gap-3 pb-1 text-left">
                <div className="min-w-[240px] snap-start rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("activatePage.journeyTitle")}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{t("activatePage.journeyDesc")}</p>
                </div>
                <div className="min-w-[220px] snap-start rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">{t("activatePage.touchFlowTitle")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{t("activatePage.touchFlowDesc")}</p>
                </div>
            </SwipeRail>
          </div>
        </div>
      </section>

      {/* Commercial Offer Stack Section */}
      <section id="packages" className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("activatePage.packagesTitle")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("activatePage.packagesSubtitle")}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 md:gap-8">
            {/* Hero Offer */}
            <div className="relative z-10 rounded-3xl border-2 border-primary bg-card p-6 shadow-elevated transition-transform hover:scale-[1.02] md:scale-105 md:p-8 md:hover:scale-[1.06]">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-6 py-1.5 rounded-bl-3xl rounded-tr-lg text-xs font-black uppercase tracking-widest">
                {t("activatePage.heroBundleBadge")}
              </div>
              <h3 className="text-2xl font-bold mb-2">{t("activatePage.heroBundleTitle")}</h3>
              <div className="text-4xl font-black text-primary mb-4">{t("activatePage.heroBundlePrice")}</div>
              <p className="text-muted-foreground mb-8 font-semibold">{t("activatePage.heroBundleDesc")}</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>{t("activatePage.heroBundleFeat1")}</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>{t("activatePage.heroBundleFeat2")}</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-green-500 mr-4 flex-shrink-0" />
                   <span>{t("activatePage.heroBundleFeat3")}</span>
                </li>
              </ul>
              <Button onClick={handleCtaClick} variant="hero" size="lg" className="w-full">
                {t("activatePage.heroBundleCta")}
              </Button>
            </div>

            {/* Core Offer */}
            <div className="rounded-3xl border border-border bg-secondary/30 p-6 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:shadow-card md:p-8">
              <h3 className="text-2xl font-bold mb-2">{t("activatePage.custActivationTitle")}</h3>
              <div className="text-4xl font-black mb-4">{t("activatePage.custActivationPrice")}</div>
              <p className="text-muted-foreground mb-8 font-semibold">{t("activatePage.custActivationDesc")}</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>{t("activatePage.custActivationFeat1")}</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>{t("activatePage.custActivationFeat2")}</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>{t("activatePage.custActivationFeat3")}</span>
                </li>
              </ul>
              <Button onClick={handleCtaClick} variant="warm" size="lg" className="w-full font-bold">
                {t("activatePage.custActivationCta")}
              </Button>
            </div>

            {/* High Ticket */}
            <div className="rounded-3xl border border-border bg-secondary/30 p-6 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:shadow-card md:p-8">
              <h3 className="text-2xl font-bold mb-2">{t("activatePage.alwaysOnTitle")}</h3>
              <div className="text-4xl font-black mb-4">{t("activatePage.alwaysOnPrice")}</div>
              <p className="text-muted-foreground mb-8 font-semibold">{t("activatePage.alwaysOnDesc")}</p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>{t("activatePage.alwaysOnFeat1")}</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>{t("activatePage.alwaysOnFeat2")}</span>
                </li>
                <li className="flex items-start">
                   <CheckCircle className="w-6 h-6 text-muted-foreground mr-4 flex-shrink-0" />
                   <span>{t("activatePage.alwaysOnFeat3")}</span>
                </li>
              </ul>
              <Button onClick={handleCtaClick} variant="outline" size="lg" className="w-full font-bold">
                {t("activatePage.alwaysOnCta")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Proof Section */}
      <section id="outcomes" className="py-24 bg-secondary/20 overflow-hidden relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">{t("activatePage.outcomesTitle")}</h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                {t("activatePage.outcomesDesc")}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                  <div className="bg-primary/10 p-3 rounded-xl"><Users className="w-6 h-6 text-primary" /></div>
                  <span className="font-bold">{t("activatePage.outcomeFootTraffic")}</span>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                  <div className="bg-accent/10 p-3 rounded-xl"><Activity className="w-6 h-6 text-accent" /></div>
                  <span className="font-bold">{t("activatePage.outcomeUgc")}</span>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                   <div className="bg-green-100/50 p-3 rounded-xl"><Target className="w-6 h-6 text-green-600" /></div>
                   <span className="font-bold">{t("activatePage.outcomeProductTrials")}</span>
                </div>
                <div className="bg-card p-6 rounded-2xl shadow-soft border border-border flex items-center space-x-4 hover:shadow-card transition-shadow">
                   <div className="bg-orange-100/50 p-3 rounded-xl"><Sparkles className="w-6 h-6 text-orange-600" /></div>
                   <span className="font-bold">{t("activatePage.outcomeSocialBlitz")}</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
               <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-elevated md:space-y-8 md:p-10">
                  <div>
                    <div className="text-sm font-black text-primary uppercase mb-2">{t("activatePage.liveProofBadge")}</div>
                    <div className="text-3xl font-bold">{t("activatePage.liveProofCount")}</div>
                    <div className="text-muted-foreground">{t("activatePage.liveProofDesc")}</div>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full shadow-glow"></div>
                  </div>
                  <Button onClick={handleCtaClick} variant="hero" size="xl" className="w-full font-black">
                    {t("activatePage.secureReachCta")}
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
           <img 
              src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_extended-03.png"
              alt="Promorang"
              className="h-10 w-auto mx-auto mb-8 opacity-50 grayscale"
            />
            <p className="text-muted-foreground text-sm">{t("activatePage.footerCopyright")}</p>
        </div>
      </footer>
    </div>
  );
}
