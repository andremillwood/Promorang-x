/**
 * First-hour landings that make PROMORANG active.
 *
 * The live loop is: merchant puts a perk up → someone shares it →
 * a member claims it → the merchant validates the code.
 * Role dashboards, onboarding, and tours must land on those surfaces —
 * not Discover tours, localStorage perk posts, or bounty/marketing pilots.
 */

export type ActivationRole = 'merchant' | 'host' | 'creator' | 'people' | 'explorer';

export type FirstAction = {
  id: string;
  label: string;
  href: string;
  why: string;
};

export const LIVE_PATHS = {
  putPerkUp: '/stock',
  sharePerk: '/give',
  takePerk: '/earn',
  card: '/card',
  validate: '/staff/scanner',
  merchantValidateTab: '/dashboard?view=studio&tab=redemptions',
  createMoment: '/create/moment',
  liveDrop: (slug: string) => `/drop/${slug}`,
} as const;

const MERCHANT_ACTIONS: FirstAction[] = [
  {
    id: 'put-perk-up',
    label: 'Put a perk up',
    href: LIVE_PATHS.putPerkUp,
    why: 'The loop starts when a merchant supplies one real benefit.',
  },
  {
    id: 'share-perk',
    label: 'Share it',
    href: LIVE_PATHS.sharePerk,
    why: 'A host or creator needs a live drop link to hand out.',
  },
  {
    id: 'validate',
    label: 'Validate at the counter',
    href: LIVE_PATHS.validate,
    why: 'Only a merchant-recorded redemption completes the loop.',
  },
];

const HOST_ACTIONS: FirstAction[] = [
  {
    id: 'create-moment',
    label: 'Create tonight’s gathering',
    href: LIVE_PATHS.createMoment,
    why: 'A host gathering is the place a perk gets used.',
  },
  {
    id: 'attach-perk',
    label: 'Attach a live perk',
    href: LIVE_PATHS.sharePerk,
    why: 'Share a merchant perk as a drop the door can hand out.',
  },
  {
    id: 'validate',
    label: 'Send the merchant to validate',
    href: LIVE_PATHS.validate,
    why: 'The merchant still records the redemption. The host does not simulate it.',
  },
];

const CREATOR_ACTIONS: FirstAction[] = [
  {
    id: 'take-perk',
    label: 'Take a perk to share',
    href: LIVE_PATHS.takePerk,
    why: 'Creators share inventory that already exists — they do not invent it.',
  },
  {
    id: 'share-perk',
    label: 'Share the drop',
    href: LIVE_PATHS.sharePerk,
    why: 'The audience claims a live drop, then uses it at the merchant.',
  },
  {
    id: 'card',
    label: 'See what is on the card',
    href: LIVE_PATHS.card,
    why: 'Pay happens after the merchant validates, not when the link is copied.',
  },
];

const PEOPLE_ACTIONS: FirstAction[] = [
  {
    id: 'card',
    label: 'Open PromoCard',
    href: LIVE_PATHS.card,
    why: 'Use this, available nearby, and the next benefit are the member actions.',
  },
  {
    id: 'take-perk',
    label: 'Claim a nearby perk',
    href: LIVE_PATHS.takePerk,
    why: 'A claim is only live if a merchant already put the perk up.',
  },
];

export function firstActionsForRole(role: string | null | undefined): FirstAction[] {
  const key = String(role || '').toLowerCase();
  if (key === 'merchant') return MERCHANT_ACTIONS;
  if (key === 'host') return HOST_ACTIONS;
  if (key === 'creator') return CREATOR_ACTIONS;
  return PEOPLE_ACTIONS;
}

export function landingPathForRole(role: string | null | undefined): string {
  const key = String(role || '').toLowerCase();
  if (key === 'merchant' || key === 'brand') return LIVE_PATHS.putPerkUp;
  if (key === 'host') return LIVE_PATHS.createMoment;
  if (key === 'creator') return LIVE_PATHS.takePerk;
  return LIVE_PATHS.card;
}

export function merchantPerkPostedNext(offerId?: string | null): FirstAction[] {
  const shareHref = offerId
    ? `${LIVE_PATHS.sharePerk}?offer=${encodeURIComponent(offerId)}`
    : LIVE_PATHS.sharePerk;
  return [
    {
      id: 'share-perk',
      label: 'Share this perk',
      href: shareHref,
      why: 'Hand the live drop to a host, creator, or the room.',
    },
    {
      id: 'validate',
      label: 'Validate at the counter',
      href: LIVE_PATHS.validate,
      why: 'When someone uses it, record the code. That is the completion.',
    },
  ];
}
