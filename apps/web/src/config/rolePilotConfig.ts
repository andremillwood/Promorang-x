import {
  Compass,
  Sparkles,
  Ticket,
  Radio,
  MapPin,
  BarChart3,
  Flame,
  Gift,
  Share2,
  DollarSign,
  Send,
  Building2,
  QrCode,
  Users,
  Target,
  LucideIcon
} from 'lucide-react';

export type PilotRoleId = 'explorer' | 'creator' | 'host' | 'merchant' | 'brand';

export interface PilotStep {
  step: number;
  stage: string;
  title: string;
  path: string;
  insight: string;
  actionLabel: string;
  icon: LucideIcon;
  badgeColor: string;
}

export interface RoleTourConfig {
  id: PilotRoleId;
  name: string;
  icon: LucideIcon;
  themeColor: string;
  tagline: string;
  steps: PilotStep[];
}

export const ROLE_PILOT_CONFIGS: Record<PilotRoleId, RoleTourConfig> = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    icon: Compass,
    themeColor: '#ff5a1f',
    tagline: 'Find exclusive drops, vote in radar polls, and unlock real-world perks.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · VIBE & RADAR INTENT',
        title: 'Community Discovery Radar',
        path: '/discover?pilot=explorer&step=1',
        insight: 'Cast your vote in active radar polls to signal demand and earn initial Pioneer points in under 10 seconds.',
        actionLabel: 'Next: Explore Live Moments ➔',
        icon: Radio,
        badgeColor: 'text-[#ff5a1f] bg-[#ff5a1f15] border-[#ff5a1f33]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · EVENT EXPERIENCE & PERKS',
        title: 'Moments & Exclusive Perks',
        path: '/moments?pilot=explorer&step=2',
        insight: 'Browse trending experiences, RSVP for early-access guest passes, and unlock hosted drinks or VIP perks.',
        actionLabel: 'Next: View Live Geo-Radar ➔',
        icon: Ticket,
        badgeColor: 'text-[#ffcf38] bg-[#ffcf3815] border-[#ffcf3833]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · GEO-FENCED DROPS',
        title: 'Local Radar & Flash Drops',
        path: '/radar?pilot=explorer&step=3',
        insight: 'See nearby venues with active drop zones. When you arrive on location, check in with GPS to claim bounty rewards.',
        actionLabel: 'Next: Vault & Referrals ➔',
        icon: MapPin,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      },
      {
        step: 4,
        stage: 'STAGE 04 · REWARD VAULT & SQUAD',
        title: 'Pioneer Vault & Squad Links',
        path: '/pioneers?pilot=explorer&step=4',
        insight: 'Track your points balance, climb the leaderboard, and generate your personal referral link to earn squad bonuses.',
        actionLabel: 'Complete Explorer Walkthrough ➔',
        icon: Gift,
        badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
      }
    ]
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    icon: Sparkles,
    themeColor: '#a855f7',
    tagline: 'Monetize your content, claim bounties, and earn commissions on verified foot traffic.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · ACTIVE BOUNTIES',
        title: 'Bounty Marketplace',
        path: '/bounties?pilot=creator&step=1',
        insight: 'Discover paid campaigns from verified brands and hot venues offering guaranteed cash for attendance and viral posts.',
        actionLabel: 'Next: Creator Trackable Hub ➔',
        icon: DollarSign,
        badgeColor: 'text-[#a855f7] bg-[#a855f715] border-[#a855f733]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · PROMO ENGINE',
        title: 'Creator Network & Assets',
        path: '/for-creators?pilot=creator&step=2',
        insight: 'Get your unique trackable promo links and media kits to share across Instagram, TikTok, and WhatsApp.',
        actionLabel: 'Next: Submitting Proof ➔',
        icon: Share2,
        badgeColor: 'text-[#ec4899] bg-[#ec489915] border-[#ec489933]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · VERIFIED ATTRIBUTION',
        title: 'Proof & Conversion Payouts',
        path: '/growth?pilot=creator&step=3',
        insight: 'See how Promorang cryptographically attributes ticket sales and venue check-ins directly to your promo links.',
        actionLabel: 'Complete Creator Walkthrough ➔',
        icon: BarChart3,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      }
    ]
  },
  host: {
    id: 'host',
    name: 'Host / Mayor',
    icon: Flame,
    themeColor: '#f97316',
    tagline: 'Organize high-energy moments, manage digital guestlists, and build loyal event crowds.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · MOMENT CREATION',
        title: 'Propose & Launch Moments',
        path: '/propose?pilot=host&step=1',
        insight: 'Create single-night concerts, recurring pop-ups, or beach parties with built-in referral viral loops.',
        actionLabel: 'Next: Guestlist & RSVP Management ➔',
        icon: Send,
        badgeColor: 'text-[#f97316] bg-[#f9731615] border-[#f9731633]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · GUEST PASSES & DOOR ACCESS',
        title: 'Door Operations & Fast Pass',
        path: '/host/operations?pilot=host&step=2',
        insight: 'Scan digital RSVP passes at the entrance for frictionless check-in while capturing verified attendee numbers.',
        actionLabel: 'Next: Organizer Intelligence ➔',
        icon: QrCode,
        badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · ATTENDEE INTELLIGENCE',
        title: 'Organizer CRM & Growth',
        path: '/organizer?pilot=host&step=3',
        insight: 'Access your persistent attendee list for future announcements without relying on algorithm-gated social channels.',
        actionLabel: 'Complete Host Walkthrough ➔',
        icon: Users,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      }
    ]
  },
  merchant: {
    id: 'merchant',
    name: 'Merchant / Venue',
    icon: Building2,
    themeColor: '#10b981',
    tagline: 'Turn digital foot traffic into repeat physical venue visits and direct revenue.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · CANONICAL PROFILE',
        title: 'Claim or Add Your Venue',
        path: '/add-venue?pilot=merchant&step=1',
        insight: 'Establish your venue’s permanent GPS profile, operational hours, photos, and verified pioneer status.',
        actionLabel: 'Next: Flash Offers & Drops ➔',
        icon: Building2,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · FOOT TRAFFIC ACCELERATOR',
        title: 'Merchant Solutions & Flash Perks',
        path: '/for-merchants?pilot=merchant&step=2',
        insight: 'Set up time-limited perks (e.g. 2-for-1 cocktails during slow hours) that activate when patrons arrive.',
        actionLabel: 'Next: In-Store Validation ➔',
        icon: Ticket,
        badgeColor: 'text-[#ff5a1f] bg-[#ff5a1f15] border-[#ff5a1f33]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · PROMOTER CRM',
        title: 'Merchant Analytics & CRM',
        path: '/dashboard/merchant?pilot=merchant&step=3',
        insight: 'Inspect real-time check-ins, customer demographics, and squad referral depth to optimize your floor revenues.',
        actionLabel: 'Complete Merchant Walkthrough ➔',
        icon: BarChart3,
        badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
      }
    ]
  },
  brand: {
    id: 'brand',
    name: 'Brand / Sponsor',
    icon: Target,
    themeColor: '#3b82f6',
    tagline: 'Fund high-impact community campaigns with guaranteed offline conversion attribution.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · CAMPAIGN ARCHITECTURE',
        title: 'Brand Activation Suite',
        path: '/for-brands?pilot=brand&step=1',
        insight: 'Deploy performance-based budgets where creators and venue hosts are compensated strictly for verified results.',
        actionLabel: 'Next: Creator Matching ➔',
        icon: Target,
        badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · CREATOR SQUADS',
        title: 'Pioneer & Creator Talent',
        path: '/creators?pilot=brand&step=2',
        insight: 'Handpick top-performing local creators with high engagement and verified event audience reach.',
        actionLabel: 'Next: Conversion Attribution ➔',
        icon: Sparkles,
        badgeColor: 'text-[#a855f7] bg-[#a855f715] border-[#a855f733]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · ROI & AUDITABLE IMPACT',
        title: 'Brand Attribution Dashboard',
        path: '/dashboard?pilot=brand&step=3',
        insight: 'Verify every dollar spent against real foot-traffic, social impressions, and in-venue consumer activations.',
        actionLabel: 'Complete Brand Walkthrough ➔',
        icon: BarChart3,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      }
    ]
  }
};
