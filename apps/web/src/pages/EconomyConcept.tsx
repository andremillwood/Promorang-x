import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  Compass,
  FileText,
  Flame,
  Gem,
  Gift,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  PlayCircle,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Unlock,
  Upload,
  UserCheck,
  Users,
  Vault,
  WalletCards,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { moneyBoundaries } from "@/lib/revenue-model";

type ConceptKey =
  | "overview"
  | "moments"
  | "points"
  | "keys"
  | "master-key"
  | "pieces"
  | "content"
  | "promoshare-gems"
  | "network"
  | "sustainability";

type RoleValue = {
  role: string;
  badge: string;
  why: string;
  outcome: string;
  action: string;
  href: string;
};

type StepValue = {
  label: string;
  title: string;
  text: string;
};

type Highlight = {
  title: string;
  description: string;
  icon: typeof Sparkles;
};

const navigationLinks = [
  { label: "Ecosystem Architecture", slug: "overview", path: "/economy" },
  { label: "Moments (Physical Anchor)", slug: "moments", path: "/economy/moments" },
  { label: "Points & Rank (Merit)", slug: "points", path: "/economy/points" },
  { label: "PromoKeys (Scarcity Gate)", slug: "keys", path: "/economy/keys" },
  { label: "Master Key (Daily Pulse)", slug: "master-key", path: "/economy/master-key" },
  { label: "Pieces (Cultural Equity)", slug: "pieces", path: "/economy/pieces" },
  { label: "Missions & UGC", slug: "content", path: "/economy/content" },
  { label: "Tickets & Funded Gems", slug: "promoshare-gems", path: "/economy/promoshare-gems" },
  { label: "Crew & Social Multipliers", slug: "network", path: "/economy/network" },
  { label: "3-Ledgers & Escrow", slug: "sustainability", path: "/economy/sustainability" },
];

const assetPrimitives = [
  {
    name: "Points",
    icon: Coins,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    role: "Merit, Standing & XP",
    supply: "Infinite Velocity, Seasonal Reset",
    monetaryRisk: "Zero (Free effort-based)",
    burnMechanic: "500 Points burned per PromoKey minted",
    summary: "Non-transferable internal score reflecting verified physical presence, consistency, and community trust.",
  },
  {
    name: "PromoKeys",
    icon: KeyRound,
    color: "text-primary border-primary/30 bg-primary/10",
    role: "Scarcity & Opportunity Gating",
    supply: "Capped Daily Mint (Max 3/day)",
    monetaryRisk: "Zero (Purely effort-minted)",
    burnMechanic: "100% Burned upon unlocking high-tier drops",
    summary: "Deflationary access tokens required to unlock sponsored prize vaults, VIP tables, and exclusive drops.",
  },
  {
    name: "Master Key",
    icon: Flame,
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    role: "Daily Active User Velocity",
    supply: "24-Hour Rolling Pulse",
    monetaryRisk: "Zero (Requires 1 daily verified action)",
    burnMechanic: "Decays after 24h if no active proof provided",
    summary: "Daily active streak mechanism ensuring continuous network liquidity and live platform engagement.",
  },
  {
    name: "Pieces",
    icon: Sparkles,
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    role: "Cultural Equity & Memorabilia",
    supply: "Limited Edition Fixed Caps (e.g. 50–500)",
    monetaryRisk: "Marketplace Secondary Trading",
    burnMechanic: "1% Atomic Protocol Fee on P2P settlement",
    summary: "Collectible digital relics from landmark events granting perpetual host utility, VIP lines, and tradeability.",
  },
  {
    name: "PromoShare Gems",
    icon: Gem,
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    role: "Funded Liquidity & Payouts",
    supply: "100% Sponsor Escrow Backed",
    monetaryRisk: "Fully Collateralized Escrow",
    burnMechanic: "Redeemed for real-world products, perks, or cashouts",
    summary: "Liquid reward units funded upfront by brand campaign deposits with transparent on-chain audit trails.",
  },
];

const conceptData: Record<
  ConceptKey,
  {
    eyebrow: string;
    headline: string;
    subhead: string;
    whyItMatters: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    roles: RoleValue[];
    highlights: Highlight[];
    steps: StepValue[];
    tagline: string;
  }
> = {
  overview: {
    eyebrow: "Promorang Economic Architecture & Flywheel",
    headline: "A closed-loop, proof-of-presence economy backed by real-world activity.",
    subhead:
      "Promorang bridges brand capital, venue foot traffic, and participant loyalty through cryptographic proof of physical presence. Unlike ad networks that monetize passive screen time or token schemes with unbacked emissions, Promorang's economy is 100% funded by verified real-world activations and commercial demand.",
    whyItMatters:
      "Digital attention is zero-sum, easily bot-faked, and extractive. By anchoring incentives to verified physical presence and cultural contributions, Promorang creates a non-dilutive, sustainable economic engine where every reward is fully funded before it is earned.",
    primaryCta: { label: "Explore Flywheel Simulator", href: "#macro-flywheel" },
    secondaryCta: { label: "Schedule Enterprise Briefing", href: "/for-brands" },
    roles: [
      {
        role: "For Capital Allocators & Brands",
        badge: "Measurable ROAS & Verifiable CAC",
        why: "Digital ads suffer from rampant bot fraud, low conversion, and opaque attribution.",
        outcome:
          "Convert sponsorship capital into verified physical foot traffic and authentic creator UGC with segregated escrow and real-time proof-of-presence receipts.",
        action: "Explore Brand Architecture",
        href: "/for-brands",
      },
      {
        role: "For Venue Operators & Hosts",
        badge: "Crowd Velocity & Zero Upfront Risk",
        why: "Venues need predictable patron velocity, repeat customers, and high-energy off-peak crowds.",
        outcome:
          "Fill slow timeframes with gamified check-in missions, recruit local ambassadors, and monetize event culture via limited Piece editions.",
        action: "Explore Host Tools",
        href: "/create/moment",
      },
      {
        role: "For Participants & Creators",
        badge: "Merit-Based Value & Standing",
        why: "Social platforms extract user attention and data without sharing economic value.",
        outcome:
          "Convert real-world energy, presence, and content into provable status, sponsor-backed Gems, and exclusive VIP privileges without paying to win.",
        action: "Explore Live Moments",
        href: "/explore/moments",
      },
    ],
    highlights: [
      {
        icon: Vault,
        title: "1. 100% Escrow Collateralized",
        description: "Every Gem bounty and prize pool is deposited upfront in segregated escrow—zero unbacked token emissions.",
      },
      {
        icon: ShieldCheck,
        title: "2. Anti-Sybil Proof of Presence",
        description: "Geofenced QR Marks and receipt causality trees prevent bots and fake check-ins from draining budgets.",
      },
      {
        icon: TrendingUp,
        title: "3. Non-Dilutive Credit Velocity",
        description: "Points act as non-transferable merit; PromoKeys burn upon entry to preserve perpetual asset scarcity.",
      },
    ],
    steps: [
      { label: "01", title: "Capital Inflow & Escrow", text: "Brands and merchants deposit activation budgets directly into segregated, audited escrow contracts." },
      { label: "02", title: "Physical Proof Verified", text: "Participants check in at partner venues, verify their presence via Mark QR, or submit authentic UGC missions." },
      { label: "03", title: "Automated Value Settlement", text: "Escrowed rewards and standing settle automatically to participants, driving direct foot-traffic revenue to venues." },
    ],
    tagline: "Real-world presence is the ultimate scarce asset. We built the economic infrastructure to reward it.",
  },

  moments: {
    eyebrow: "The Physical Anchor",
    headline: "Moments bind economic value to real-world coordinates.",
    subhead:
      "A Moment is an event, secret drop, tasting ritual, creator mission, or neighborhood activation. It serves as the physical proof-of-presence anchor connecting sponsor capital, venue capacity, and community participation.",
    whyItMatters:
      "Without a verified physical anchor, digital reward points become speculative numbers. Moments guarantee that economic transactions reflect genuine human movement and local business patronage.",
    primaryCta: { label: "Explore Moment Network", href: "/explore/moments" },
    secondaryCta: { label: "Host a Moment", href: "/create/moment" },
    roles: [
      {
        role: "For Capital Allocators",
        badge: "Targeted In-Person Reach",
        why: "Direct marketing dollars to exact physical locations and demographic subcultures.",
        outcome:
          "Sponsor localized moments with guaranteed geofenced check-in minimums and full ROI reporting.",
        action: "Sponsor a Moment",
        href: "/for-brands",
      },
      {
        role: "For Venue Operators",
        badge: "Yield Optimization",
        why: "Monetize quiet evenings and turn first-time attendees into lifetime repeat regulars.",
        outcome:
          "Deploy moments with tiered arrival perks (e.g. earlier arrival = higher point multipliers).",
        action: "Publish an Activation",
        href: "/create/moment",
      },
      {
        role: "For Participants",
        badge: "Lived Experience",
        why: "Earn tangible perks and social standing simply for discovering and supporting your city.",
        outcome:
          "Unlock secret tastings, VIP nightlife access, and permanent proof-of-memory marks.",
        action: "Find Today's Moments",
        href: "/explore/moments",
      },
    ],
    highlights: [
      {
        icon: MapPin,
        title: "Cryptographic Geofencing",
        description: "Timestamped geolocation and dynamic QR rotation eliminate GPS spoofing.",
      },
      {
        icon: Gift,
        title: "Perks on Arrival",
        description: "Smart contracts unlock instant beverage vouchers and Gem bounties upon physical scan.",
      },
      {
        icon: ShieldCheck,
        title: "Permanent Reputation Log",
        description: "Every checked-in moment stamps your profile with tamper-proof social standing.",
      },
    ],
    steps: [
      { label: "01", title: "Operator Deploys", text: "Venue or sponsor publishes location, capacity, reward pools, and arrival milestones." },
      { label: "02", title: "Patron Arrives", text: "Attendee scans the live venue Mark inside the physical geofence." },
      { label: "03", title: "Instant Verification", text: "Value receipt is minted, points and perks settle, and venue patron analytics log in real time." },
    ],
    tagline: "Moments matter because real life happens offline.",
  },

  points: {
    eyebrow: "Merit & Standing Architecture",
    headline: "Points measure participation energy and reputation without monetary inflation.",
    subhead:
      "Points celebrate genuine participation and community standing. Because Points are non-transferable, zero-cost to earn, and periodically reset by season, they cannot be bought, farmed, or hyperinflated.",
    whyItMatters:
      "Pay-to-win systems degrade community trust. Points ensure that standing on Promorang is 100% earned through authentic, effort-based physical and social contribution.",
    primaryCta: { label: "View Standing Tiers", href: "/activity" },
    secondaryCta: { label: "Earn Points Today", href: "/explore/moments" },
    roles: [
      {
        role: "For Enterprise Stakeholders",
        badge: "Anti-Sybil Metric",
        why: "Filter out high-net-worth speculators and bots in favor of genuine cultural advocates.",
        outcome:
          "Identify highly active local micro-influencers whose points reflect true community trust.",
        action: "View Community Analytics",
        href: "/for-brands",
      },
      {
        role: "For Venue Operators",
        badge: "VIP Segmentation",
        why: "Automatically identify and reward high-energy patrons who bring groups and drive revenue.",
        outcome:
          "Target high-tier Point holders with exclusive tasting menus and private event invitations.",
        action: "View Top Patrons",
        href: "/create/moment",
      },
      {
        role: "For Participants",
        badge: "Meritocratic Leveling",
        why: "Your personal effort and consistency should build permanent status and access.",
        outcome:
          "Convert 500 earned points into 1 scarce PromoKey daily to unlock high-yield prize vaults.",
        action: "Earn Points",
        href: "/explore/moments",
      },
    ],
    highlights: [
      {
        icon: Coins,
        title: "Effort-Gated Minting",
        description: "Points are strictly earned through verified check-ins, missions, and referrals—never purchased.",
      },
      {
        icon: TrendingUp,
        title: "Seasonal Rank Decays",
        description: "Seasonal resets prevent legacy stagnation and keep platform competition vibrant.",
      },
      {
        icon: KeyRound,
        title: "Burn on Conversion",
        description: "Converting Points into PromoKeys permanently burns points, maintaining supply equilibrium.",
      },
    ],
    steps: [
      { label: "01", title: "Active Contribution", text: "Attend moments, verify presence, or submit approved creator missions." },
      { label: "02", title: "Stack Standing", text: "Increase seasonal standing tier to unlock boosted yield multipliers." },
      { label: "03", title: "Mint Access Keys", text: "Burn 500 Points to mint 1 PromoKey into your personal vault." },
    ],
    tagline: "Your energy counts. Points prove you were there and put in the work.",
  },

  keys: {
    eyebrow: "Scarcity & Access Primitives",
    headline: "PromoKeys enforce strict access scarcity for premium brand opportunities.",
    subhead:
      "PromoKeys are scarce access tokens minted exclusively by burning Points. They gate high-value sponsor giveaways, VIP event reservations, and high-bounty creator missions—ensuring that premium opportunities go only to verified active contributors.",
    whyItMatters:
      "Unrestricted open giveaways are quickly exploited by click farms and bots. PromoKey gating ensures brand budgets reward only high-intent, verified daily participants.",
    primaryCta: { label: "Inspect Key Mechanics", href: "/wallet" },
    secondaryCta: { label: "Browse Key Drops", href: "/missions" },
    roles: [
      {
        role: "For Brand Sponsors",
        badge: "Fraud-Proof Gating",
        why: "Ensure high-dollar rewards reach dedicated local brand advocates, not bot networks.",
        outcome:
          "Require 1 or 2 PromoKeys for campaign entry, guaranteeing high user engagement quality.",
        action: "Launch Gated Campaign",
        href: "/for-brands",
      },
      {
        role: "For Venue Operators",
        badge: "Zero-Flake Reservations",
        why: "Prevent no-shows on limited VIP seating and private dining experiences.",
        outcome:
          "Require PromoKey deposits on RSVP; attendees value their hard-earned keys and show up.",
        action: "Create Key Gate",
        href: "/create/moment",
      },
      {
        role: "For Participants",
        badge: "Exclusive Access",
        why: "Level playing field to win high-ticket products, VIP passes, and private tastings.",
        outcome:
          "Spend earned PromoKeys to enter sponsor vaults with high win-probabilities.",
        action: "Mint PromoKeys",
        href: "/wallet",
      },
    ],
    highlights: [
      {
        icon: Lock,
        title: "Hard Velocity Caps",
        description: "Users can mint a maximum of 3 PromoKeys per 24 hours, preventing whale hoarding.",
      },
      {
        icon: Unlock,
        title: "Deflationary Burn",
        description: "PromoKeys are destroyed upon opportunity entry, preventing secondary market rent-seeking.",
      },
      {
        icon: Sparkles,
        title: "100% Merit-Funded",
        description: "Keys cannot be bought with fiat—only minted through verified platform participation.",
      },
    ],
    steps: [
      { label: "01", title: "Earn & Burn Points", text: "Burn 500 earned points to mint 1 PromoKey into your encrypted wallet." },
      { label: "02", title: "Select Premium Gate", text: "Choose a sponsored prize draw, VIP reservation, or exclusive mission." },
      { label: "03", title: "Key Burn & Unlock", text: "The PromoKey is permanently burned, unlocking instant access." },
    ],
    tagline: "PromoKeys unlock the best of the city for the people who actually show up.",
  },

  "master-key": {
    eyebrow: "Daily Network Velocity",
    headline: "The Master Key aligns continuous daily platform retention.",
    subhead:
      "The Master Key is an active 24-hour status badge maintained by completing at least one verified physical or digital platform contribution each day. It acts as the heartbeat of ecosystem engagement.",
    whyItMatters:
      "Network effects require consistent daily liquidity. The Master Key aligns user habits with sponsor exposure, creating predictable daily active user (DAU) metrics for brand partners.",
    primaryCta: { label: "Simulate Daily Pulse", href: "/activity" },
    secondaryCta: { label: "Check Streak Status", href: "/explore/moments" },
    roles: [
      {
        role: "For Brand Allocators",
        badge: "Predictable DAU Velocity",
        why: "Need reliable daily audience engagement rather than sporadic campaign spikes.",
        outcome:
          "Sponsor daily Master Key streak rewards to gain guaranteed daily active impressions.",
        action: "Sponsor Daily Drops",
        href: "/for-brands",
      },
      {
        role: "For Venue Operators",
        badge: "Midweek Foot Traffic",
        why: "Drive foot traffic on Tuesdays and Wednesdays, smoothing out weekend spikes.",
        outcome:
          "Designate venue as an official Master Key check-in hub for local neighborhood regulars.",
        action: "Register Check-in Hub",
        href: "/create/moment",
      },
      {
        role: "For Participants",
        badge: "Compounding Multipliers",
        why: "Earn higher point multipliers and unlock daily funded prize draws.",
        outcome:
          "Perform 1 free daily action to keep the Master Key active and boost all earnings by up to 1.5x.",
        action: "Activate Master Key",
        href: "/explore/moments",
      },
    ],
    highlights: [
      {
        icon: Flame,
        title: "24-Hour Rolling Expiration",
        description: "Key expires after 24h of inactivity, demanding genuine ongoing participation.",
      },
      {
        icon: QrCode,
        title: "Single-Action Renewal",
        description: "One physical check-in, verified review, or social share renews the status instantly.",
      },
      {
        icon: ShieldCheck,
        title: "Sponsor Pool Unlock",
        description: "Only active Master Key holders qualify for daily sponsor-funded prize distributions.",
      },
    ],
    steps: [
      { label: "01", title: "Complete Daily Action", text: "Check in at a partner venue or submit proof for a creator mission." },
      { label: "02", title: "Status Renews", text: "Master Key turns active gold for the next 24 hours." },
      { label: "03", title: "Claim Active Perks", text: "Access live daily Gem draws and boosted point yields." },
    ],
    tagline: "One small action every day opens the doors to everything.",
  },

  pieces: {
    eyebrow: "Cultural Equity Primitives",
    headline: "Pieces tokenize landmark moments into lasting cultural assets.",
    subhead:
      "Pieces are limited-edition digital collectibles minted for flagship moments, festival milestones, and creator drops. They confer permanent venue privileges, backstage access, and can be traded on the peer-to-peer marketplace.",
    whyItMatters:
      "Traditional event tickets expire and retain zero residual value for fans or creators. Pieces turn cultural memories into enduring assets that distribute royalties back to hosts on every secondary trade.",
    primaryCta: { label: "Explore Piece Marketplace", href: "/marketplace" },
    secondaryCta: { label: "Mint Event Pieces", href: "/create/moment" },
    roles: [
      {
        role: "For Organizers & Hosts",
        badge: "Perpetual Royalty Streams",
        why: "Monetize cultural hype upfront and earn royalties on secondary ticket/membership trading.",
        outcome:
          "Mint 50–500 Pieces per flagship event; earn automated royalties whenever pieces change hands.",
        action: "Mint Event Collection",
        href: "/create/moment",
      },
      {
        role: "For Collectors & Patrons",
        badge: "Permanent Venue Utility",
        why: "Own provable provenance of historic moments and enjoy permanent VIP venue rights.",
        outcome:
          "Hold Pieces to skip lines, receive annual discounts, or trade on the marketplace.",
        action: "Browse Marketplace",
        href: "/marketplace",
      },
      {
        role: "For Brand Collaborators",
        badge: "Co-Branded Relics",
        why: "Build enduring brand affinity through collectible memorabilia attached to physical drops.",
        outcome:
          "Co-sponsor Piece collections that attach exclusive physical product redemptions.",
        action: "Co-Brand a Collection",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Sparkles,
        title: "Immutable Provenance",
        description: "Verifiable timestamped attendance logs prove early participation in iconic events.",
      },
      {
        icon: Gift,
        title: "Embedded Smart Utility",
        description: "Holders automatically unlock VIP queue privileges and secret venue perks.",
      },
      {
        icon: WalletCards,
        title: "1% Atomic Protocol Fee",
        description: "Secondary market trades execute atomically with transparent, minimal platform overhead.",
      },
    ],
    steps: [
      { label: "01", title: "Host Mints Drop", text: "Organizer configures fixed supply, utility perks, and creator royalty splits." },
      { label: "02", title: "Early Attendees Claim", text: "Top attendees or VIP buyers claim pieces during the live moment activation." },
      { label: "03", title: "Hold or Trade", text: "Holders flash pieces for permanent venue perks or trade on the open marketplace." },
    ],
    tagline: "Don't just witness culture—hold a piece of it.",
  },

  content: {
    eyebrow: "Verified Creator Missions",
    headline: "Performance-driven creator incentives backed by physical foot traffic.",
    subhead:
      "Creator Missions align brand marketing spend directly with authentic user-generated content and verified venue foot traffic. Brands set bounties; creators post genuine recaps; smart verification confirms visits and distributes escrowed Gems.",
    whyItMatters:
      "Traditional influencer marketing is plagued by fake followers, vanity metrics, and opaque attribution. Promorang creator missions guarantee that content creates verified in-person movement.",
    primaryCta: { label: "Browse Mission Hub", href: "/missions" },
    secondaryCta: { label: "Deploy Brand Mission", href: "/for-brands" },
    roles: [
      {
        role: "For Enterprise Brands",
        badge: "Attributed ROAS",
        why: "Pay creators only for verified physical visits and trackable community actions.",
        outcome:
          "Fund UGC bounties with automated geofence checks and QR attribution tracking.",
        action: "Launch Creator Campaign",
        href: "/for-brands",
      },
      {
        role: "For Venues & Merchants",
        badge: "Viral Local Buzz",
        why: "Generate hundreds of authentic short-form videos from guests inside the venue.",
        outcome:
          "Put up 50–200 Gem bounties for best cocktail or vibe recaps, flooding local TikTok and Reels feeds.",
        action: "Create Venue Mission",
        href: "/create/moment",
      },
      {
        role: "For Content Creators",
        badge: "Guaranteed Payouts",
        why: "Get compensated fairly and instantly for documenting local culture without agency delays.",
        outcome:
          "Complete local missions, submit media proof, and receive instant Gems deposited in wallet.",
        action: "Find Open Bounties",
        href: "/missions",
      },
    ],
    highlights: [
      {
        icon: PlayCircle,
        title: "Smart Submission Auditing",
        description: "Automated media analysis validates tags, timestamps, and geolocation integrity.",
      },
      {
        icon: UserCheck,
        title: "Instant Escrow Settlement",
        description: "Approved submissions receive instant Gem payouts directly from the sponsor's escrow pool.",
      },
      {
        icon: TrendingUp,
        title: "Creator Standing Multiplier",
        description: "High-performing creators unlock higher bounty limits and direct brand partnership invites.",
      },
    ],
    steps: [
      { label: "01", title: "Brand Funds Brief", text: "Brand specifies requirements (e.g. 15s video, tag @brand & @venue) and deposits Gems into escrow." },
      { label: "02", title: "Creator Executes", text: "Creator visits venue, records authentic content, and uploads proof in-app." },
      { label: "03", title: "Verification & Release", text: "Upon verification, escrowed Gems transfer instantly to the creator's wallet." },
    ],
    tagline: "Content that brings people together in the real world.",
  },

  "promoshare-gems": {
    eyebrow: "Collateralized Reward Reserves",
    headline: "100% Escrow-backed Gems and mathematically provable prize draws.",
    subhead:
      "PromoShare introduces provably fair community prize draws, while Gems represent liquid reward units backed 1:1 by committed sponsor capital. Every Gem earned corresponds to real currency deposited in segregated escrow before distribution.",
    whyItMatters:
      "Unlike inflationary web3 tokens or opaque corporate points programs with unstated liabilities, Promorang Gems carry 100% collateralized reserve backing with zero fractional reserve risk.",
    primaryCta: { label: "Inspect PromoShare Ledger", href: "/promoshare" },
    secondaryCta: { label: "Fund a Reward Pool", href: "/for-brands" },
    roles: [
      {
        role: "For Capital Sponsors",
        badge: "Audited Pool Escrow",
        why: "Ensure promotional funds remain strictly dedicated to reward pools with complete transparency.",
        outcome:
          "Deposit reward budgets into smart escrow; receive cryptographic receipts for every distributed unit.",
        action: "Fund Brand Pool",
        href: "/for-brands",
      },
      {
        role: "For Venue Operators",
        badge: "Crowd Excitement",
        why: "Host high-stakes prize draws that keep crowds energized and incentivize longer stays.",
        outcome:
          "Integrate live PromoShare ticket draws at event midpoints to maximize patron retention.",
        action: "Host PromoShare Draw",
        href: "/create/moment",
      },
      {
        role: "For Participants",
        badge: "Guaranteed Redemption",
        why: "Confidence that rewards can be redeemed for real products, vouchers, and cashouts.",
        outcome:
          "Collect named PromoShare tickets and redeem Gems in the marketplace for genuine value.",
        action: "View PromoShare Draws",
        href: "/promoshare",
      },
    ],
    highlights: [
      {
        icon: Ticket,
        title: "Named Ticket Ledger",
        description: "Every PromoShare ticket is cryptographically assigned to a specific draw timestamp and prize ID.",
      },
      {
        icon: Gem,
        title: "1:1 Collateral Reserve",
        description: "Gems are minted only when cash or stable capital is locked in segregated sponsor escrow.",
      },
      {
        icon: ShieldCheck,
        title: "Provable Randomness",
        description: "Winners are selected using verifiable random functions (VRF) for tamper-proof fairness.",
      },
    ],
    steps: [
      { label: "01", title: "Sponsor Deposits", text: "Brand commits capital into segregated reward escrow pool." },
      { label: "02", title: "Proof-Based Issuance", text: "Participants receive Gems and PromoShare tickets for verified actions." },
      { label: "03", title: "Provable Distribution", text: "Draws execute on-chain; participants redeem Gems for physical goods and perks." },
    ],
    tagline: "Honest rewards backed by real sponsors. Win, collect, and redeem.",
  },

  network: {
    eyebrow: "Social Multipliers & Squad Economics",
    headline: "Viral referral graphs and group coordination incentives.",
    subhead:
      "Promorang rewards coordinated group behavior. When friends attend moments together, they trigger Squad Multipliers that boost point yields and unlock collective scene standing, creating viral organic distribution for venues.",
    whyItMatters:
      "Physical dining, nightlife, and cultural events are inherently social. Rewarding groups rather than isolated individuals drives higher average ticket sizes and lower venue customer acquisition costs.",
    primaryCta: { label: "Explore Scene Hub", href: "/for-communities" },
    secondaryCta: { label: "Form a Squad", href: "/explore/moments" },
    roles: [
      {
        role: "For Venue Operators",
        badge: "Higher Table Sizes",
        why: "Incentivize groups of 4–10 to coordinate and attend together rather than solo walk-ins.",
        outcome:
          "Activate squad multipliers that reward groups with complimentary table upgrades and bonus points.",
        action: "Configure Squad Perks",
        href: "/for-communities",
      },
      {
        role: "For Brands & Agencies",
        badge: "Word-of-Mouth Scaling",
        why: "Harness natural social contagion to amplify campaign reach without extra ad spend.",
        outcome:
          "Sponsor squad leaderboards to incentivize competing subcultures to advocate for your brand.",
        action: "Sponsor Squad Leaderboards",
        href: "/for-brands",
      },
      {
        role: "For Groups & Crews",
        badge: "Group Status & Boosts",
        why: "Going out with friends should be more rewarding and unlock collective VIP treatment.",
        outcome:
          "Check in with 3+ squad members to trigger a +50% point yield and climb city leaderboards.",
        action: "Rally Your Squad",
        href: "/explore/moments",
      },
    ],
    highlights: [
      {
        icon: Users,
        title: "Squad Multipliers",
        description: "Simultaneous check-ins within a 30-minute window trigger group multiplier boosts.",
      },
      {
        icon: Compass,
        title: "Scene Leaderboards",
        description: "Neighborhood squads compete for monthly table residencies and private invites.",
      },
      {
        icon: Share2,
        title: "Two-Sided Referral Loops",
        description: "Inviters earn passive yield on downstream verified check-ins from referred peers.",
      },
    ],
    steps: [
      { label: "01", title: "Form a Squad", text: "Invite friends to link profiles into a neighborhood crew." },
      { label: "02", title: "Check In Together", text: "Scan venue Marks collectively to trigger the +50% Squad Multiplier." },
      { label: "03", title: "Unlock Scene Standing", text: "Climb local leaderboards to secure reserved venue tables and perks." },
    ],
    tagline: "Culture is co-created. Bring your friends and build the scene.",
  },

  sustainability: {
    eyebrow: "3-Ledger Architecture & Capital Safety",
    headline: "Cryptographically isolated ledgers guaranteeing capital segregation.",
    subhead:
      "Promorang enforces an audited 3-ledger accounting framework. Reward escrow funds, merchant proceeds, and platform service fees are segregated into isolated compartments, ensuring zero fund co-mingling and bulletproof financial compliance.",
    whyItMatters:
      "Platforms that mix user reward funds with operating capital create existential insolvency risks. Promorang’s separated architecture ensures sponsor budgets are legally and technically protected exclusively for participants.",
    primaryCta: { label: "Review 3-Ledger Architecture", href: "#three-ledgers" },
    secondaryCta: { label: "View Pricing & Terms", href: "/pricing" },
    roles: [
      {
        role: "For Compliance & Legal",
        badge: "Segregated Escrow",
        why: "Ensure reward funds and sweepstakes mechanics comply with global financial and promotional regulations.",
        outcome:
          "Reward pools reside in dedicated escrow accounts; Promorang acts strictly as the software verification layer.",
        action: "Review Compliance Framework",
        href: "/pricing",
      },
      {
        role: "For Brand Advertisers",
        badge: "Audited Capital Flow",
        why: "Demand transparent, auditable proof that promotional funds were disbursed directly to real consumers.",
        outcome:
          "Receive itemized cryptographic receipts documenting the exact journey of every committed dollar.",
        action: "Explore Brand Hub",
        href: "/for-brands",
      },
      {
        role: "For Venue Operators",
        badge: "Direct Payouts",
        why: "Ticket sales and merchant transactions must never be withheld or delayed by platform fees.",
        outcome:
          "Operator revenues settle directly via automated payout rails with disclosed service fees deducted cleanly.",
        action: "View Commercial Terms",
        href: "/pricing",
      },
    ],
    highlights: [
      {
        icon: ShieldCheck,
        title: "1. Sponsor Escrow Pool",
        description: "100% committed to community participants; legally isolated from Promorang operational funds.",
      },
      {
        icon: Building2,
        title: "2. Operator & Host Proceeds",
        description: "Merchant ticket and booking revenue settles directly to venues without middleman delays.",
      },
      {
        icon: Coins,
        title: "3. Disclosed Platform Fees",
        description: "Promorang earns only published, predictable SaaS and configuration fees.",
      },
    ],
    steps: [
      { label: "01", title: "Isolated Inflow", text: "Sponsor capital deposits directly into the dedicated Escrow Ledger." },
      { label: "02", title: "Proof Verification", text: "Physical presence and creator proof trigger automated smart disbursement." },
      { label: "03", title: "Audited Settlement", text: "Participants claim funds; platform fee is recorded separately with full transparency." },
    ],
    tagline: "A sustainable platform built on trust, transparency, and shared success.",
  },
};

// ==========================================
// Interactive Concept Visual Card Components
// ==========================================

function MacroFlywheelVisualDemo() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: "1. Capital Deposit",
      badge: "Sponsor Inflow",
      color: "text-amber-400",
      description: "Brand deposits $5,000 activation budget into Segregated Escrow (100% committed to community rewards).",
      stat: "$5,000 Locked in Escrow",
    },
    {
      step: 2,
      title: "2. Proof of Presence",
      badge: "Physical Mark Verification",
      color: "text-emerald-400",
      description: "850 attendees check in inside venue geofences; 45 creators post verified video recaps.",
      stat: "850 Marks Verified • Anti-Sybil",
    },
    {
      step: 3,
      title: "3. Asset Circulation",
      badge: "Points & Keys Velocity",
      color: "text-primary",
      description: "Participants earn Points, mint scarce PromoKeys, maintain Master Key streaks, and claim Gem bounties.",
      stat: "127,500 Pts • 255 Keys Minted",
    },
    {
      step: 4,
      title: "4. Settlement & Redemption",
      badge: "Closed Loop Value",
      color: "text-cyan-400",
      description: "Escrowed Gems redeem for real drinks & products; venues retain full food & beverage patronage revenue.",
      stat: "100% Escrow Disbursed • Zero Dilution",
    },
  ];

  return (
    <div id="macro-flywheel" className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/[0.08] via-black/90 to-black p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black font-bold shadow-lg shadow-primary/30">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Economic Engine Simulator</span>
            <p className="text-sm font-bold text-white">Closed-Loop Value Circulation</p>
          </div>
        </div>
        <Badge className="border-primary/40 bg-primary/20 text-primary text-xs font-mono">
          Interactive Model
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        {/* Step Selector Pills */}
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-white/[0.04] p-1.5">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`rounded-xl py-2 text-center text-xs font-bold transition-all ${
                activeStep === s.step
                  ? "bg-primary text-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              Step {s.step}
            </button>
          ))}
        </div>

        {/* Dynamic Step Display */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${steps[activeStep - 1].color}`}>
              {steps[activeStep - 1].badge}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-zinc-300">
              {steps[activeStep - 1].stat}
            </span>
          </div>
          <h4 className="mt-2 text-base font-bold text-white">{steps[activeStep - 1].title}</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
            {steps[activeStep - 1].description}
          </p>
        </div>

        {/* Visual Ledger Route */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Segregated Escrow</span>
            <ArrowRight className="h-3 w-3 text-primary" />
            <span className="flex items-center gap-1.5"><QrCode className="h-3.5 w-3.5 text-primary" /> Proof of Presence</span>
            <ArrowRight className="h-3 w-3 text-primary" />
            <span className="flex items-center gap-1.5"><Gem className="h-3.5 w-3.5 text-cyan-400" /> Direct Value</span>
          </div>
        </div>

        <Button
          onClick={() => setActiveStep((prev) => (prev % 4) + 1)}
          className="w-full py-5 text-sm font-bold bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Sparkles className="mr-2 h-4 w-4" /> Next Flywheel Phase ({activeStep < 4 ? `Step ${activeStep + 1}` : "Restart Loop"})
        </Button>
      </div>
    </div>
  );
}

function MomentVisualDemo() {
  const [checkedIn, setCheckedIn] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Physical Anchor Point</span>
            </div>
            <p className="text-sm font-bold text-white">The Velvet Lounge & Bar</p>
          </div>
        </div>
        <Badge className="border-primary/30 bg-primary/10 text-primary text-xs">
          142 Checked In
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-zinc-400">Tonight's Sponsored Activation</p>
              <h4 className="text-base font-bold text-white mt-0.5">Midnight Jazz & Craft Tasting</h4>
            </div>
            <span className="rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-400">
              +150 Pts • 1 Drink Pass
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-300">
            Arrive before 10 PM and scan the venue Mark to verify attendance and unlock tasting perks.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 text-xs text-zinc-300">
          <span className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" /> Geofence Verified Anti-Sybil
          </span>
          <span className="font-mono text-zinc-400">Austin, TX</span>
        </div>

        <Button
          onClick={() => setCheckedIn(!checkedIn)}
          className={`w-full py-5 text-sm font-bold transition-all ${
            checkedIn
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "bg-primary text-black hover:bg-primary/90"
          }`}
        >
          {checkedIn ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Attendance Verified (+150 Pts Stamped)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Simulate Proof of Presence (Leave Mark)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

function PointsVisualDemo() {
  const [points, setPoints] = useState(1450);
  const [keys, setKeys] = useState(2);
  const [minted, setMinted] = useState(false);

  const handleMint = () => {
    if (points >= 500) {
      setPoints(points - 500);
      setKeys(keys + 1);
      setMinted(true);
      setTimeout(() => setMinted(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Merit & Standing Ledger</span>
            <p className="text-sm font-bold text-white">Season 2: Pioneer Standing</p>
          </div>
        </div>
        <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
          Rank Tier 4
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-zinc-400">Points Balance (Non-Transferable)</p>
            <p className="mt-1 font-serif text-2xl font-bold text-amber-400">{points.toLocaleString()} <span className="text-xs font-sans font-normal text-zinc-400">Pts</span></p>
            <p className="mt-1 text-[11px] text-zinc-500">+250 earned via verified presence</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-zinc-400">Minted PromoKeys</p>
            <p className="mt-1 font-serif text-2xl font-bold text-primary">{keys} <span className="text-xs font-sans font-normal text-zinc-400">Keys</span></p>
            <p className="mt-1 text-[11px] text-zinc-500">Vault Access Ready</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-300">Conversion Window (500 Pts = 1 Key)</span>
            <span className="font-mono text-primary">Burn on Mint</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-primary w-[80%]" />
          </div>
        </div>

        <Button
          onClick={handleMint}
          disabled={points < 500}
          className="w-full py-5 text-sm font-bold bg-gradient-to-r from-amber-400 to-primary text-black hover:opacity-90"
        >
          {minted ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> 500 Points Burned • 1 PromoKey Minted!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Burn 500 Pts to Mint 1 PromoKey
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

function KeysVisualDemo() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Gated Opportunity Primitive</span>
            <p className="text-sm font-bold text-white">Sponsor Vault Gate</p>
          </div>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
          1 Key Required
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-amber-400">
              {unlocked ? <Unlock className="h-6 w-6 text-emerald-400" /> : <Lock className="h-6 w-6" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">VIP Tasting & Secret Menu Pass</h4>
              <p className="mt-1 text-xs text-zinc-400">
                {unlocked
                  ? "Access granted: Key permanently burned. Show pass code #VK-9920."
                  : "Sponsored by Artisan Distillers • 8 slots remaining today"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Scarcity</p>
            <p className="font-semibold text-white mt-0.5">Max 3 Keys Minted / Day</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Burn Model</p>
            <p className="font-semibold text-primary mt-0.5">100% Deflationary Burn</p>
          </div>
        </div>

        <Button
          onClick={() => setUnlocked(!unlocked)}
          className={`w-full py-5 text-sm font-bold transition-all ${
            unlocked
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "bg-primary text-black hover:bg-primary/90"
          }`}
        >
          {unlocked ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Key Burned • Pass Unlocked (#VK-9920)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Burn 1 Key to Unlock Opportunity
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

function MasterKeyVisualDemo() {
  const [active, setActive] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.12] to-black/80 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black shadow-lg shadow-amber-500/30">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Daily Network Pulse</span>
            <p className="text-sm font-bold text-white">Master Key: {active ? "Active (In Streak)" : "Inactive (Expired)"}</p>
          </div>
        </div>
        <Badge className="border-amber-500/40 bg-amber-500/20 text-amber-300 text-xs font-mono">
          🔥 6 Day Streak
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-amber-500/20 bg-black/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">24-Hour Velocity Window</span>
            <span className="text-xs font-mono text-amber-400">14h 32m remaining</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-white/[0.05] p-2">
              <p className="text-[10px] text-zinc-400">Daily Pool</p>
              <p className="font-bold text-emerald-400 mt-0.5">Eligible</p>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-2">
              <p className="text-[10px] text-zinc-400">Multiplier</p>
              <p className="font-bold text-amber-400 mt-0.5">1.5x Pts</p>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-2">
              <p className="text-[10px] text-zinc-400">Escrow Draw</p>
              <p className="font-bold text-white mt-0.5">Active</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.04] p-3 text-xs text-zinc-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 1 Verified Action completed today
          </span>
          <span className="text-[11px] text-zinc-500">Auto-Renews</span>
        </div>

        <Button
          onClick={() => setActive(!active)}
          variant="outline"
          className="w-full py-5 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
        >
          {active ? "Simulate 24h Inactivity Expiry" : "Simulate Proof-of-Presence Check In"}
        </Button>
      </div>
    </div>
  );
}

function PieceVisualDemo() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-black/80 to-black p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Cultural Equity Asset</span>
            <p className="text-sm font-bold text-white">Founding Resident Piece #042</p>
          </div>
        </div>
        <Badge className="border-purple-500/40 bg-purple-500/20 text-purple-300 text-xs font-mono">
          1 of 100 Minted
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4">
          <p className="text-xs text-purple-300 font-semibold">Origin Landmark Moment</p>
          <h4 className="text-base font-bold text-white mt-0.5">Neon Nights Launch Gala 2026</h4>
          <p className="mt-2 text-xs text-zinc-300">
            Permanent utility: 15% VIP discount across partner venues, VIP line skip, and perpetual host royalty routing.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Settlement</p>
            <p className="font-semibold text-white mt-0.5">1% Protocol / 5% Royalty</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Transferability</p>
            <p className="font-semibold text-purple-300 mt-0.5">P2P Secondary Tradable</p>
          </div>
        </div>

        <Button className="w-full py-5 text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30" asChild>
          <Link to="/marketplace">
            <WalletCards className="mr-2 h-4 w-4" /> Explore Piece Marketplace
          </Link>
        </Button>
      </div>
    </div>
  );
}

function CreatorMissionVisualDemo() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
            <PlayCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">Escrow-Funded UGC Bounty</span>
            <p className="text-sm font-bold text-white">15s Cocktail Craft Video</p>
          </div>
        </div>
        <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 font-mono text-xs font-bold text-pink-400">
          +120 Gems Escrow Bounty
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs font-semibold text-zinc-400">Sponsor Campaign Brief</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-200">
            Record a short video featuring the bartender preparing the signature seasonal cocktail and tag @TheVelvetLounge.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="border-white/15 text-[10px] text-zinc-400">TikTok / Reels</Badge>
            <Badge variant="outline" className="border-white/15 text-[10px] text-zinc-400">Min 10s</Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-400">Auto Audited</Badge>
          </div>
        </div>

        <Button
          onClick={() => setSubmitted(!submitted)}
          className={`w-full py-5 text-sm font-bold transition-all ${
            submitted
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "bg-pink-600 hover:bg-pink-500 text-white"
          }`}
        >
          {submitted ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Proof Verified (+120 Gems Released from Escrow)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Submit Video Proof
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

function PromoShareVisualDemo() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Gem className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">100% Collateralized Reserves</span>
            <p className="text-sm font-bold text-white">Tickets & Escrow Gems</p>
          </div>
        </div>
        <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs">
          350 Gems Backed
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-white">PromoShare Ticket #PS-88219</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Draw Friday 8 PM</span>
          </div>
          <p className="mt-2 text-xs text-zinc-300">
            Assigned to Austin Community Weekend Pool ($500 Sponsor Escrow Deposit).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Fairness</p>
            <p className="font-semibold text-white mt-0.5">VRF Provable On-Chain</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Redeemable</p>
            <p className="font-semibold text-cyan-300 mt-0.5">Direct Perks & Cashouts</p>
          </div>
        </div>

        <Button className="w-full py-5 text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30" asChild>
          <Link to="/promoshare">
            <Ticket className="mr-2 h-4 w-4" /> View Live PromoShare Draws
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SquadVisualDemo() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Social Multiplier Engine</span>
            <p className="text-sm font-bold text-white">Downtown Collective Squad</p>
          </div>
        </div>
        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-xs font-bold text-blue-400">
          1.5x Boost Active 🔥
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-semibold text-zinc-300">Coordinated Check-In (4/5 Present)</span>
            <span className="font-mono text-blue-400">+50% Yield Velocity</span>
          </div>
          <div className="flex -space-x-2 overflow-hidden">
            {["AM", "SJ", "KL", "MR"].map((initials, i) => (
              <div
                key={i}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-blue-600 font-mono text-[11px] font-bold text-white"
              >
                {initials}
              </div>
            ))}
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white/10 text-[10px] text-zinc-400">
              +1
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.04] p-3 text-xs text-zinc-300">
          <p className="font-semibold text-white">Scene Standing #3 in Downtown</p>
          <p className="mt-0.5 text-zinc-400">2 more group check-ins unlocks VIP table reservation priority.</p>
        </div>

        <Button className="w-full py-5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30" asChild>
          <Link to="/for-communities">
            <Users className="mr-2 h-4 w-4" /> Explore Community Squads
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SustainabilityVisualDemo() {
  return (
    <div id="three-ledgers" className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-black/80 to-black p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">3-Ledger Architecture</span>
            <p className="text-sm font-bold text-white">Separated Funds & Escrow</p>
          </div>
        </div>
        <Badge className="border-emerald-500/40 bg-emerald-500/20 text-emerald-300 text-xs">
          Audited Escrow
        </Badge>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl border border-white/10 bg-black/50 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">1. Sponsor Reward Escrow</p>
            <p className="text-[11px] text-zinc-400">100% committed directly to participant rewards</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">100% Payout</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/50 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">2. Host & Operator Proceeds</p>
            <p className="text-[11px] text-zinc-400">Direct ticket and sales revenue to venues</p>
          </div>
          <span className="text-xs font-mono text-white font-bold">Direct Payout</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/50 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">3. Promorang Platform Fee</p>
            <p className="text-[11px] text-zinc-400">Disclosed software and setup configuration fees</p>
          </div>
          <span className="text-xs font-mono text-primary font-bold">Published Fee</span>
        </div>

        <Button className="w-full py-5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30" asChild>
          <Link to="/pricing">
            <Building2 className="mr-2 h-4 w-4" /> View Commercial Pricing & Plans
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function EconomyConcept() {
  const { concept } = useParams();
  const conceptKey = (concept ?? "overview") as ConceptKey;
  const data = conceptData[conceptKey] ?? conceptData.overview;
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  const activeRole = data.roles[selectedRoleIndex] || data.roles[0];

  // Visual card selection based on concept
  const renderVisualCard = () => {
    switch (conceptKey) {
      case "moments":
        return <MomentVisualDemo />;
      case "points":
        return <PointsVisualDemo />;
      case "keys":
        return <KeysVisualDemo />;
      case "master-key":
        return <MasterKeyVisualDemo />;
      case "pieces":
        return <PieceVisualDemo />;
      case "content":
        return <CreatorMissionVisualDemo />;
      case "promoshare-gems":
        return <PromoShareVisualDemo />;
      case "network":
        return <SquadVisualDemo />;
      case "sustainability":
        return <SustainabilityVisualDemo />;
      case "overview":
      default:
        return <MacroFlywheelVisualDemo />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <SEO title={`${data.eyebrow} - Promorang Economic Architecture`} description={data.subhead} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#161513] pb-16 pt-28 text-white md:pb-24 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,113,16,0.18),transparent_40%),repeating-linear-gradient(90deg,rgba(255,255,255,.018)_0,rgba(255,255,255,.018)_1px,transparent_1px,transparent_80px)]" />

        <div className="container relative z-10 px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left: Headline & Stakeholder Architecture Narrative */}
            <div>
              <Badge className="border-primary/30 bg-primary/15 text-primary text-xs font-bold px-3 py-1 uppercase tracking-wider">
                {data.eyebrow}
              </Badge>

              <h1 className="mt-6 max-w-2xl font-serif text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
                {data.headline}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
                {data.subhead}
              </p>

              <div className="mt-6 border-l-2 border-primary/80 pl-4">
                <p className="text-sm leading-relaxed text-zinc-400 italic">
                  "{data.whyItMatters}"
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to={data.primaryCta.href}>
                    {data.primaryCta.label}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link to={data.secondaryCta.href}>{data.secondaryCta.label}</Link>
                </Button>
              </div>
            </div>

            {/* Right: Dedicated Visual Simulation & Ledger Demo */}
            <div>
              {renderVisualCard()}
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Pillar Concept Navigation */}
      <section className="sticky top-16 z-30 border-b border-white/10 bg-[#090909]/95 backdrop-blur-md">
        <div className="container px-6">
          <div className="flex gap-2 overflow-x-auto py-3.5 no-scrollbar">
            {navigationLinks.map((item) => {
              const isActive = conceptKey === item.slug;
              return (
                <Link
                  key={item.slug}
                  to={item.path}
                  className={`inline-flex shrink-0 items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    isActive
                      ? "bg-primary text-black shadow-lg shadow-primary/25"
                      : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stakeholder Perspective Selector */}
      <section className="border-b border-white/10 bg-[#0c0c0c] py-16 md:py-24">
        <div className="container px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Incentive Alignment</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">
              How Every Stakeholder Gains Value
            </h2>
            <p className="mt-3 text-base text-zinc-300">
              Select your perspective to understand how Promorang aligns financial and reputational incentives without zero-sum extraction.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="mt-8 flex flex-wrap gap-3">
            {data.roles.map((r, idx) => (
              <button
                key={r.role}
                onClick={() => setSelectedRoleIndex(idx)}
                className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition ${
                  selectedRoleIndex === idx
                    ? "bg-white text-black shadow-lg"
                    : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {r.role}
              </button>
            ))}
          </div>

          {/* Active Stakeholder Card */}
          <div className="mt-8 rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 md:p-10 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <Badge className="border-primary/40 bg-primary/20 text-primary font-mono text-xs mb-3">
                  {activeRole.badge}
                </Badge>
                <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
                  {activeRole.why}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-zinc-300">
                  {activeRole.outcome}
                </p>
                <div className="mt-6">
                  <Button variant="hero" asChild>
                    <Link to={activeRole.href}>
                      {activeRole.action}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Stakeholder Highlights Grid */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-4">Core Mechanism Pillars</p>
                <div className="space-y-4">
                  {data.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <h.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{h.title}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-400 leading-relaxed">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Asset Primitives Breakdown (Stakeholder Matrix) */}
      <section className="border-b border-white/10 bg-[#080808] py-16 md:py-24">
        <div className="container px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Tokenomics & Asset Hierarchy</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">
              Multi-Primitive Asset Architecture
            </h2>
            <p className="mt-3 text-base text-zinc-300">
              Each unit within Promorang serves an explicit economic function with segregated minting rules, velocity constraints, and burn mechanics.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assetPrimitives.map((asset) => {
              const Icon = asset.icon;
              return (
                <div
                  key={asset.name}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${asset.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="border-white/15 text-[10px] text-zinc-400 font-mono">
                      {asset.role}
                    </Badge>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">{asset.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{asset.summary}</p>

                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Supply Model:</span>
                      <span className="font-mono text-zinc-300 font-bold">{asset.supply}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Monetary Risk:</span>
                      <span className="font-mono text-emerald-400">{asset.monetaryRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Burn / Sinks:</span>
                      <span className="font-mono text-primary font-bold">{asset.burnMechanic}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3-Step Execution Rhythm */}
      <section className="border-b border-white/10 bg-[#070707] py-16 md:py-24">
        <div className="container px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Protocol Flow</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">
              Closed-Loop Execution Rhythm
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Clear, transparent, and verifiable every step of the journey.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {data.steps.map((step) => (
              <div
                key={step.label}
                className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-primary/40 hover:bg-white/[0.05]"
              >
                <span className="font-mono text-xs font-bold text-primary">{step.label}</span>
                <h3 className="mt-3 font-serif text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base font-serif italic text-zinc-300">"{data.tagline}"</p>
          </div>
        </div>
      </section>

      {/* 3-Ledger Architecture & Capital Safeguards Deep Dive */}
      <section id="three-ledgers" className="border-b border-white/10 bg-[#0a0a0a] py-16 md:py-24">
        <div className="container px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3">
                Capital Safety & Compliance
              </Badge>
              <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
                The 3-Ledger Escrow Guarantee
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-300">
                To eliminate insolvency and regulatory risk, Promorang segregates capital into three non-fungible ledgers. Community reward budgets are committed upfront in locked escrow, ensuring funds can never be co-mingled with platform operational revenue.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button variant="hero" asChild>
                  <Link to="/pricing">
                    View Commercial Terms & Plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                  <Link to="/for-brands">Schedule Enterprise Briefing</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {moneyBoundaries.map((boundary, idx) => (
                <div key={boundary.label} className="rounded-2xl border border-white/10 bg-black/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">Ledger 0{idx + 1}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Isolated Escrow
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-white">{boundary.label}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{boundary.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Call to Action Footer Banner */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-[#090909] to-[#14120e]">
        <div className="container relative z-10 px-6 text-center max-w-3xl mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-black shadow-xl shadow-primary/30">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h2 className="mt-6 font-serif text-3xl font-extrabold text-white md:text-5xl">
            Partner With the Real-World Economy
          </h2>
          <p className="mt-4 text-base text-zinc-300 leading-relaxed">
            Whether you are allocating brand sponsorship capital, operating a high-volume hospitality venue, or analyzing local network economics, Promorang provides the verified proof-of-presence infrastructure.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/for-brands">
                Schedule Stakeholder Briefing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/pricing">Review Commercial Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
