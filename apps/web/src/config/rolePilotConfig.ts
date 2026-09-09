import {
  Compass,
  Sparkles,
  Ticket,
  Flame,
  Gift,
  Share2,
  Building2,
  QrCode,
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
    tagline: 'Claim a live perk, keep it on PromoCard, and use it where a merchant can validate it.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · PROMOCARD',
        title: 'Open PromoCard',
        path: '/card?pilot=explorer&step=1',
        insight: 'Use this, available nearby, and the next benefit are the only member actions that matter.',
        actionLabel: 'Next: Claim a nearby perk ➔',
        icon: Gift,
        badgeColor: 'text-[#ff5a1f] bg-[#ff5a1f15] border-[#ff5a1f33]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · CLAIM',
        title: 'Take a live perk',
        path: '/earn?pilot=explorer&step=2',
        insight: 'A claim is only live if a merchant already put the perk up. Simulated wallets do not count.',
        actionLabel: 'Next: See nearby drops ➔',
        icon: Ticket,
        badgeColor: 'text-[#ffcf38] bg-[#ffcf3815] border-[#ffcf3833]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · NEARBY',
        title: 'Available nearby',
        path: '/discover?tab=perks&pilot=explorer&step=3',
        insight: 'These are participating merchant perks with a live drop. Claim one, then use the code at the counter.',
        actionLabel: 'Complete explorer walkthrough ➔',
        icon: Compass,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      }
    ]
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    icon: Sparkles,
    themeColor: '#a855f7',
    tagline: 'Publish a Release, attach a room or perk, and get paid after a Promorang consequence — not a share tap.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · RELEASE',
        title: 'Publish a Release',
        path: '/content-drops?pilot=creator&step=1',
        insight: 'A song or story is origin. The original stays where it lives. Sharing is not the payday.',
        actionLabel: 'Next: Attach a room or perk ➔',
        icon: Gift,
        badgeColor: 'text-[#a855f7] bg-[#a855f715] border-[#a855f733]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · CATCH',
        title: 'Attach a room or perk',
        path: '/give?pilot=creator&step=2',
        insight: 'Hosts, merchants, and brands catch the Release. Claim, RSVP, or delivery is the payday — not Shared.',
        actionLabel: 'Next: See the card ➔',
        icon: Share2,
        badgeColor: 'text-[#ec4899] bg-[#ec489915] border-[#ec489933]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · CARD',
        title: 'See what is on the card',
        path: '/card?pilot=creator&step=3',
        insight: 'Pay and attribution update after validation — not when the drop is created.',
        actionLabel: 'Complete creator walkthrough ➔',
        icon: Ticket,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      }
    ]
  },
  host: {
    id: 'host',
    name: 'Host / Mayor',
    icon: Flame,
    themeColor: '#f97316',
    tagline: 'Create tonight’s gathering, attach a live merchant perk, and send the merchant to validate.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · GATHERING',
        title: 'Create tonight’s gathering',
        path: '/create/moment?pilot=host&step=1',
        insight: 'A host gathering is the place a perk gets used. Publishing it is not a completion.',
        actionLabel: 'Next: Attach a live perk ➔',
        icon: Flame,
        badgeColor: 'text-[#f97316] bg-[#f9731615] border-[#f9731633]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · ATTACH',
        title: 'Attach a live perk',
        path: '/give?pilot=host&step=2',
        insight: 'Share a merchant perk as a drop the door can hand out. Guests claim it onto PromoCard.',
        actionLabel: 'Next: Merchant validation ➔',
        icon: Share2,
        badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · VALIDATE',
        title: 'Send the merchant to validate',
        path: '/staff/scanner?pilot=host&step=3',
        insight: 'The merchant records the redemption. The host does not simulate use, recharge, or payment.',
        actionLabel: 'Complete host walkthrough ➔',
        icon: QrCode,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      }
    ]
  },
  merchant: {
    id: 'merchant',
    name: 'Merchant / Venue',
    icon: Building2,
    themeColor: '#10b981',
    tagline: 'Put one perk up, share it, and validate the code. That is the live loop.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · SUPPLY',
        title: 'Put a perk up',
        path: '/stock?pilot=merchant&step=1',
        insight: 'The loop starts when you supply one real benefit. Local drafts and flash-drop toasts do not count.',
        actionLabel: 'Next: Share it ➔',
        icon: Gift,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · SHARE',
        title: 'Share the perk',
        path: '/give?pilot=merchant&step=2',
        insight: 'A host or creator needs a live drop link to hand out. Same inventory you just put up.',
        actionLabel: 'Next: Validate at the counter ➔',
        icon: Share2,
        badgeColor: 'text-[#ff5a1f] bg-[#ff5a1f15] border-[#ff5a1f33]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · VALIDATE',
        title: 'Validate at the counter',
        path: '/staff/scanner?pilot=merchant&step=3',
        insight: 'Only a merchant-recorded redemption completes the loop and pays the person who shared it.',
        actionLabel: 'Complete merchant walkthrough ➔',
        icon: QrCode,
        badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
      }
    ]
  },
  brand: {
    id: 'brand',
    name: 'Brand / Sponsor',
    icon: Target,
    themeColor: '#3b82f6',
    tagline: 'Fund a merchant perk, let creators share it, and pay on recorded redemptions.',
    steps: [
      {
        step: 1,
        stage: 'STAGE 01 · SUPPLY',
        title: 'Put inventory up',
        path: '/stock?pilot=brand&step=1',
        insight: 'A brand benefit still has to be real inventory someone can claim and a merchant can validate.',
        actionLabel: 'Next: Share it ➔',
        icon: Gift,
        badgeColor: 'text-[#3b82f6] bg-[#3b82f615] border-[#3b82f633]'
      },
      {
        step: 2,
        stage: 'STAGE 02 · SHARE',
        title: 'Hand it to creators',
        path: '/earn?pilot=brand&step=2',
        insight: 'Creators take the opportunity and drop it. They are paid after validation, not for posting.',
        actionLabel: 'Next: See PromoCard ➔',
        icon: Share2,
        badgeColor: 'text-[#a855f7] bg-[#a855f715] border-[#a855f733]'
      },
      {
        step: 3,
        stage: 'STAGE 03 · CARD',
        title: 'See the member card',
        path: '/card?pilot=brand&step=3',
        insight: 'The member action is use this / available nearby / next benefit — not a simulated wallet top-up.',
        actionLabel: 'Complete brand walkthrough ➔',
        icon: Ticket,
        badgeColor: 'text-[#10b981] bg-[#10b98115] border-[#10b98133]'
      }
    ]
  }
};
