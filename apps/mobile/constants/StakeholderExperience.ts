import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type StakeholderRole =
  | 'participant'
  | 'creator'
  | 'host'
  | 'brand'
  | 'merchant'
  | 'agency';

export type StakeholderStep = {
  title: string;
  detail: string;
  href: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

export type StakeholderExperience = {
  label: string;
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  eyebrow: string;
  headline: string;
  summary: string;
  outcome: string;
  primaryLabel: string;
  primaryHref: string;
  metrics: Array<{ value: string; label: string }>;
  steps: StakeholderStep[];
  tabs: {
    discover: string;
    create: string;
    grow: string;
    vault: string;
  };
};

export const STAKEHOLDER_EXPERIENCES: Record<StakeholderRole, StakeholderExperience> = {
  participant: {
    label: 'Participant',
    color: '#3B82F6',
    icon: 'people',
    eyebrow: 'FIND IT · CHECK IN · KEEP THE RECORD',
    headline: 'Find something worth showing up for.',
    summary: 'Discover nearby moments, verify your participation, and build a living record of what you helped move.',
    outcome: 'Your next check-in can lead to familiar faces, a memory, and a reason to come back.',
    primaryLabel: 'Explore live moments',
    primaryHref: '/discover',
    metrics: [{ value: '3', label: 'check-ins this week' }, { value: '840', label: 'points earned' }],
    steps: [
      { title: 'Discover a moment', detail: 'Choose a live experience nearby.', href: '/discover', icon: 'compass' },
      { title: 'Let the host know you made it', detail: 'Check in when you arrive.', href: '/check-in', icon: 'location' },
      { title: 'Keep what you earned', detail: 'See memories, access, and rewards.', href: '/vault', icon: 'archive' },
    ],
    tabs: { discover: 'Discover', create: 'Capture', grow: 'Grow', vault: 'Vault' },
  },
  creator: {
    label: 'Creator',
    color: '#EC4899',
    icon: 'videocam',
    eyebrow: 'CREATE · DISTRIBUTE · EARN',
    headline: 'Turn your point of view into action people can prove.',
    summary: 'Find relevant Moments, publish your point of view, and see what your story sets in motion.',
    outcome: 'Your next post can bring someone into a place, a Scene, or an opportunity they would have missed.',
    primaryLabel: 'Find a creator prompt',
    primaryHref: '/discover',
    metrics: [{ value: '4', label: 'open prompts' }, { value: '2.8k', label: 'people reached' }],
    steps: [
      { title: 'Choose a prompt', detail: 'Find work aligned with your voice.', href: '/discover', icon: 'sparkles' },
      { title: 'Publish your take', detail: 'Create context people can act on.', href: '/post', icon: 'camera' },
      { title: 'Track real action', detail: 'See qualified actions and earnings.', href: '/promoshare', icon: 'trending-up' },
    ],
    tabs: { discover: 'Prompts', create: 'Create', grow: 'Impact', vault: 'Earnings' },
  },
  host: {
    label: 'Host',
    color: '#8B5CF6',
    icon: 'calendar',
    eyebrow: 'CONVENE · ACTIVATE · GROW',
    headline: 'Give people a reason to gather.',
    summary: 'Shape the Moment, bring the right people together, and become known for rooms people want to return to.',
    outcome: 'Your next proposal turns an idea into a fundable, measurable activation.',
    primaryLabel: 'Create a proposal',
    primaryHref: '/create-proposal',
    metrics: [{ value: '84', label: 'recent attendees' }, { value: '4.7', label: 'host rating' }],
    steps: [
      { title: 'Frame the moment', detail: 'Define the experience and outcome.', href: '/create-proposal', icon: 'bulb' },
      { title: 'Coordinate turnout', detail: 'Give participants a clear action.', href: '/discover', icon: 'people' },
      { title: 'See what happened', detail: 'Understand turnout, connections, payouts, and who came back.', href: '/dashboard', icon: 'analytics' },
    ],
    tabs: { discover: 'Community', create: 'Launch', grow: 'Turnout', vault: 'Payouts' },
  },
  brand: {
    label: 'Brand',
    color: '#FF5A0A',
    icon: 'business',
    eyebrow: 'ACTIVATE · VERIFY · SCALE',
    headline: 'Create action, not just impressions.',
    summary: 'Connect campaign investment to creators, places, and participation you can actually verify.',
    outcome: 'Your next activation can help culture happen and connect that support to visits, content, sales, and return.',
    primaryLabel: 'Launch an activation',
    primaryHref: '/create-proposal',
    metrics: [{ value: '4.2x', label: 'activation return' }, { value: '890', label: 'people who acted' }],
    steps: [
      { title: 'Set the outcome', detail: 'Define the action you want people to take.', href: '/create-proposal', icon: 'flag' },
      { title: 'Match the ecosystem', detail: 'Find hosts, creators, and venues.', href: '/discover', icon: 'git-network' },
      { title: 'Read the evidence', detail: 'Review participation and impact.', href: '/dashboard', icon: 'stats-chart' },
    ],
    tabs: { discover: 'Network', create: 'Campaign', grow: 'Results', vault: 'Assets' },
  },
  merchant: {
    label: 'Merchant',
    color: '#10B981',
    icon: 'storefront',
    eyebrow: 'ATTRACT · CONVERT · RETAIN',
    headline: 'Turn local attention into repeat visits.',
    summary: 'Connect your venue to nearby moments, verify foot traffic, and give customers a reason to return.',
    outcome: 'Your next offer links a real visit to measurable retention.',
    primaryLabel: 'Open merchant dashboard',
    primaryHref: '/dashboard',
    metrics: [{ value: '126', label: 'visits this week' }, { value: '31%', label: 'repeat rate' }],
    steps: [
      { title: 'Activate your venue', detail: 'Anchor offers to a real location.', href: '/dashboard', icon: 'storefront' },
      { title: 'Verify each visit', detail: 'Scan access and capture conversion.', href: '/merchant/scan', icon: 'qr-code' },
      { title: 'Build repeat behavior', detail: 'Review yield and returning guests.', href: '/dashboard', icon: 'repeat' },
    ],
    tabs: { discover: 'Nearby', create: 'Offer', grow: 'Traffic', vault: 'Receipts' },
  },
  agency: {
    label: 'Agency',
    color: '#F59E0B',
    icon: 'layers',
    eyebrow: 'ORCHESTRATE · PROVE · REPORT',
    headline: 'Run the whole activation from one view.',
    summary: 'Coordinate client campaigns across brands, creators, hosts, and venues—with evidence ready for the report.',
    outcome: 'Your next client activation becomes a shared operating plan with attributable outcomes.',
    primaryLabel: 'Create client campaign',
    primaryHref: '/create-proposal',
    metrics: [{ value: '6', label: 'active clients' }, { value: '18', label: 'live activations' }],
    steps: [
      { title: 'Choose client context', detail: 'Enter the right managed workspace.', href: '/modal', icon: 'swap-horizontal' },
      { title: 'Coordinate execution', detail: 'Connect partners around one brief.', href: '/create-proposal', icon: 'git-branch' },
      { title: 'Tell the outcome story', detail: 'Show what happened, who cared, and what the client should do next.', href: '/dashboard', icon: 'document-text' },
    ],
    tabs: { discover: 'Partners', create: 'Campaign', grow: 'Portfolio', vault: 'Reports' },
  },
};

export const isStakeholderRole = (role: string | null): role is StakeholderRole =>
  Boolean(role && role in STAKEHOLDER_EXPERIENCES);
