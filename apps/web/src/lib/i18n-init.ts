import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    common: {
      language: {
        select: 'Select Language'
      }
    },
    marketing: {
      // Hero Section
      'home.hero.statusSignal': '{{count}} <bold>Active Earners</bold> Online Now',
      'home.hero.headline': 'Turn Your <highlight>Instagram Followers</highlight> Into <highlight2>Real Income</highlight2>',
      'home.hero.subheadline': 'Stop giving away your audience for free. Monetize every follower, every view, every engagement.',
      'home.hero.dashboardBtn': 'Go to Dashboard',
      'home.hero.ctaBtn': 'Start Earning Now',
      'home.hero.benefits.noCreditCard': 'No Credit Card Required',
      'home.hero.benefits.setupTime': 'Setup in 5 Minutes',
      'home.hero.benefits.keepFirst': 'Keep 100% of Your First $1,000',
      'home.hero.riskReversal': 'Try it risk-free with demo accounts:',
      'home.hero.creatorDemo': 'Creator Demo',
      'home.hero.investorDemo': 'Investor Demo',
      
      // Problem Section
      'home.problem.headline': 'The <highlight>Social Media Monetization</highlight> Trap is <br/> Broken',
      'home.problem.trap': 'You\'re building someone else\'s empire instead of your own. Every post, every story, every reel grows their platform - not your wallet.',
      'home.problem.reality': '<bold>The reality:</bold> You create the content, you take the risks, you build the audience - but someone else cashes in.',
      'home.problem.cost': '<bold>The cost:</bold> 30-50% of your earnings plus total control over your career.',
      'home.problem.oldWay.title': 'The Old Way',
      'home.problem.oldWay.desc': 'Traditional platforms take your cut and make the rules',
      'home.problem.promorangWay.title': 'The Promorang Way',
      'home.problem.promorangWay.desc': 'You keep 80% and call the shots',
      'home.problem.statement.title': 'The Math Doesn\'t Lie',
      'home.problem.statement.subtitle': 'Monthly earnings comparison',
      'home.problem.statement.instagram': 'Instagram',
      'home.problem.statement.tiktok': 'TikTok',
      'home.problem.statement.promorang': 'Promorang',
      'home.problem.statement.disclaimer': '*Based on average creator metrics',
      
      // Solution Section
      'home.solution.headline': 'The <highlight>3-Step Freedom Formula</highlight>',
      'home.solution.subheadline': 'From audience to income in minutes, not months.',
      'home.solution.steps.0.title': 'Connect Your Social',
      'home.solution.steps.0.desc': 'Link your Instagram and TikTok to instantly import your audience and engagement metrics.',
      'home.solution.steps.0.stat': '60 seconds',
      'home.solution.steps.1.title': 'Choose Your Campaigns',
      'home.solution.steps.1.desc': 'Select from brands willing to pay premium rates for your audience demographics.',
      'home.solution.steps.1.stat': '90 seconds',
      'home.solution.steps.2.title': 'Get Paid Instantly',
      'home.solution.steps.2.desc': 'Receive payments automatically when your followers engage with your content.',
      'home.solution.steps.2.stat': '24/7',
      
      // Social Proof Section
      'home.socialProof.headline': 'Join <highlight>3,482+ Creators</highlight> Already Earning',
      'home.socialProof.stats.paidToCreators': 'Paid to Creators',
      'home.socialProof.stats.activeEarners': 'Active Earners',
      'home.socialProof.stats.growth': 'Monthly Growth',
      'home.socialProof.stats.followersNeeded': 'Followers to Start',
      'home.socialProof.testimonial.quote': 'Promorang changed everything. I went from struggling to monetize my 50k followers to making more money than my 9-5 job. <highlight>The best part? I keep control of my content.</highlight>',
      'home.socialProof.testimonial.author': 'Sarah Chen',
      'home.socialProof.testimonial.role': 'Content Creator, 50k followers',
      
      // Final CTA
      'home.finalCta.headline': 'Ready to <highlight>Own Your Audience?</highlight>',
      'home.finalCta.subheadline': 'Stop building someone else\'s dream. Start building your future.',
      'home.finalCta.dashboardBtn': 'Go to Dashboard',
      'home.finalCta.ctaBtn': 'Start Earning Now',
      'home.finalCta.socialProof': 'Join {{count}} creators who\'ve already made the switch',
      
      // Footer
      'home.footer.copyright': '© 2026 Promorang. All rights reserved.'
    }
  },
  es: {
    common: {
      language: {
        select: 'Seleccionar Idioma'
      }
    }
  },
  fr: {
    common: {
      language: {
        select: 'Sélectionner la Langue'
      }
    }
  },
  de: {
    common: {
      language: {
        select: 'Sprache Auswählen'
      }
    }
  },
  it: {
    common: {
      language: {
        select: 'Seleziona Lingua'
      }
    }
  },
  pt: {
    common: {
      language: {
        select: 'Selecionar Idioma'
      }
    }
  },
  ja: {
    common: {
      language: {
        select: '言語を選択'
      }
    }
  },
  ko: {
    common: {
      language: {
        select: '언어 선택'
      }
    }
  },
  zh: {
    common: {
      language: {
        select: '选择语言'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
