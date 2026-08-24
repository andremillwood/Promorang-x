import React, { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
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
  WalletCards,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { revenueLines, moneyBoundaries } from "@/lib/revenue-model";

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
  { label: "Ecosystem", slug: "overview", path: "/economy" },
  { label: "Moments", slug: "moments", path: "/economy/moments" },
  { label: "Points & Rank", slug: "points", path: "/economy/points" },
  { label: "PromoKeys", slug: "keys", path: "/economy/keys" },
  { label: "Master Key", slug: "master-key", path: "/economy/master-key" },
  { label: "Pieces", slug: "pieces", path: "/economy/pieces" },
  { label: "Content & Missions", slug: "content", path: "/economy/content" },
  { label: "Tickets & Gems", slug: "promoshare-gems", path: "/economy/promoshare-gems" },
  { label: "Crew & Network", slug: "network", path: "/economy/network" },
  { label: "Sustainability & Fees", slug: "sustainability", path: "/economy/sustainability" },
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
    eyebrow: "The Promorang Ecosystem",
    headline: "Turn real-world presence into lasting value.",
    subhead:
      "Promorang connects people, places, and brands through real moments. When you show up, share, or host, your real-world activity generates visible standing, exclusive perks, and tangible rewards.",
    whyItMatters:
      "Online feeds reward passive scrolling. Promorang rewards lived experience: attending gatherings, completing missions, supporting local venues, and sharing authentic culture.",
    primaryCta: { label: "Explore Live Moments", href: "/explore/moments" },
    secondaryCta: { label: "Host a Moment", href: "/create/moment" },
    roles: [
      {
        role: "For Attendees",
        badge: "Discover & Earn",
        why: "You want unforgettable experiences and recognition for showing up.",
        outcome:
          "Check in at moments, earn Points, mint PromoKeys, and unlock high-value sponsor rewards and VIP access.",
        action: "Find Moments Near You",
        href: "/explore/moments",
      },
      {
        role: "For Hosts & Venues",
        badge: "Pack Rooms & Build Loyalty",
        why: "You need more than a flyer and a headcount.",
        outcome:
          "Reward attendees for showing up on time, refer friends, post content, and turn one-time guests into permanent regulars.",
        action: "Create Your First Moment",
        href: "/create/moment",
      },
      {
        role: "For Brands & Creators",
        badge: "Funded Activations",
        why: "You need sponsorship and creator missions that spark verified real-world actions.",
        outcome:
          "Sponsor moments, reward UGC creators, distribute funded Gems, and track authentic foot traffic and engagement.",
        action: "Explore Brand Hub",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Ticket,
        title: "1. Real Moments",
        description: "Events, drops, tasting rituals, and creator missions in your city.",
      },
      {
        icon: Sparkles,
        title: "2. Verified Proof",
        description: "Leave a digital Mark when you arrive or contribute—no fake check-ins.",
      },
      {
        icon: Gem,
        title: "3. Real Perks & Gems",
        description: "Convert energy into rank, PromoKeys, sponsor perks, and collectible pieces.",
      },
    ],
    steps: [
      { label: "01", title: "Show Up", text: "Find a live moment or drop in your city and participate in person." },
      { label: "02", title: "Prove It", text: "Check in with a QR code or submit creator proof to register your Mark." },
      { label: "03", title: "Level Up", text: "Collect points, activate your daily streak, and unlock exclusive rewards." },
    ],
    tagline: "The simple truth: when you leave the feed and live in the real world, your presence should pay off.",
  },

  moments: {
    eyebrow: "The Core Primitive",
    headline: "Moments are the real-world experiences everything connects to.",
    subhead:
      "A Moment is an event, secret drop, dining ritual, creator mission, or neighborhood gathering. It’s the reason to close your apps, step outside, and connect with real people.",
    whyItMatters:
      "Every reward, ticket, piece of content, and point in Promorang is anchored to a real Moment. Without real moments, points are just numbers on a screen.",
    primaryCta: { label: "Browse Live Moments", href: "/explore/moments" },
    secondaryCta: { label: "Create a Moment", href: "/create/moment" },
    roles: [
      {
        role: "For Attendees",
        badge: "Experience & Access",
        why: "You want a compelling reason to discover your city and meet new people.",
        outcome:
          "Discover secret tastings, VIP nightlife, workshops, and brand drops with verified perks.",
        action: "Explore Today's Moments",
        href: "/explore/moments",
      },
      {
        role: "For Hosts & Venues",
        badge: "Fill Your Space",
        why: "Traditional event flyers disappear in social feeds without driving commitments.",
        outcome:
          "Give guests instant incentives to arrive early, bring friends, document the night, and return next week.",
        action: "Publish a Moment",
        href: "/create/moment",
      },
      {
        role: "For Brands & Creators",
        badge: "Live Culture",
        why: "Digital ads are ignored; real-world cultural moments create lifelong brand affinity.",
        outcome:
          "Anchor your brand or creator meetup inside a live venue with trackable attendance and organic buzz.",
        action: "Sponsor a Moment",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: MapPin,
        title: "Physical & Digital Sync",
        description: "Geofenced check-ins and live attendee rosters give moments real pulse.",
      },
      {
        icon: Gift,
        title: "Perks on Arrival",
        description: "Hosts attach drink vouchers, VIP passes, and reward Gems directly to attendance.",
      },
      {
        icon: ShieldCheck,
        title: "Proof of Memory",
        description: "Attending stamps your permanent profile record and unlocks exclusive future invites.",
      },
    ],
    steps: [
      { label: "01", title: "Host Publishes", text: "A venue or organizer sets the location, perks, and mission." },
      { label: "02", title: "Guests Check In", text: "Attendees arrive, scan their Mark, and instantly verify their presence." },
      { label: "03", title: "Memory & Value", text: "The moment logs to your profile, building your rank and unlocking next-tier drops." },
    ],
    tagline: "Moments matter because real life happens offline.",
  },

  points: {
    eyebrow: "Organic Progression",
    headline: "Points measure your energy, consistency, and rank.",
    subhead:
      "Every check-in, review, share, and verified mission earns you Points. Points celebrate genuine participation, build your platform standing, and convert into valuable PromoKeys.",
    whyItMatters:
      "Points don't cost money to earn. They are your free, merit-based passport that proves you are an active, trusted member of the community.",
    primaryCta: { label: "Earn Points Today", href: "/explore/moments" },
    secondaryCta: { label: "View Your Standing", href: "/activity" },
    roles: [
      {
        role: "For Attendees",
        badge: "Status & Rank",
        why: "Your engagement should build toward tangible status and access.",
        outcome:
          "Level up from Pioneer to City Steward, converting 500 Points into 1 PromoKey daily.",
        action: "Find Point Activities",
        href: "/explore/moments",
      },
      {
        role: "For Hosts & Venues",
        badge: "Identify Top Patrons",
        why: "You need to know who your true champions and highest-energy regulars are.",
        outcome:
          "See top ranked point-earners in your scene and offer them exclusive tables and perks.",
        action: "Reward Your Regulars",
        href: "/create/moment",
      },
      {
        role: "For Brands",
        badge: "Targeted Influence",
        why: "Find authentic micro-influencers who actually attend and promote events.",
        outcome:
          "Reward users whose verified points reflect real-world local influence and trust.",
        action: "Explore Brand Rewards",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Coins,
        title: "Effort-Based Earning",
        description: "Earn points freely by showing up, inviting friends, and completing missions.",
      },
      {
        icon: TrendingUp,
        title: "Tier Progression",
        description: "Higher tiers unlock better multipliers, secret drops, and host discounts.",
      },
      {
        icon: KeyRound,
        title: "Mint PromoKeys",
        description: "Convert 500 Points directly into PromoKeys to open high-tier reward opportunities.",
      },
    ],
    steps: [
      { label: "01", title: "Participate", text: "Show up to moments, submit creator content, or refer friends." },
      { label: "02", title: "Stack Points", text: "Watch your balance grow and your seasonal Pioneer rank increase." },
      { label: "03", title: "Convert to Keys", text: "Use your hard-earned points to mint PromoKeys and unlock the Vault." },
    ],
    tagline: "Your energy counts. Points prove you were there and put in the work.",
  },

  keys: {
    eyebrow: "Access & Scarcity",
    headline: "PromoKeys are your golden ticket to high-value opportunities.",
    subhead:
      "PromoKeys open doors that money can't buy. Mint them by converting your daily Points, and spend them to access exclusive sponsor giveaways, VIP event tiers, and high-yield missions.",
    whyItMatters:
      "Instead of pay-to-win auctions, PromoKeys level the playing field. Anyone who stays active can mint keys and claim the best rewards.",
    primaryCta: { label: "Mint Your PromoKeys", href: "/wallet" },
    secondaryCta: { label: "Browse Key Drops", href: "/missions" },
    roles: [
      {
        role: "For Attendees",
        badge: "Unlock Opportunities",
        why: "You want access to sponsored prizes, high-value Gem bounties, and VIP experiences.",
        outcome:
          "Spend 1 PromoKey to enter funded draws, claim instant merch drops, and unlock creator missions.",
        action: "Open Your Wallet",
        href: "/wallet",
      },
      {
        role: "For Hosts",
        badge: "Quality Gate",
        why: "You want to ensure only dedicated, high-intent people claim your limited VIP slots.",
        outcome:
          "Require PromoKeys for RSVPs to filter out flakers and ensure a packed, energetic room.",
        action: "Set Up a Key Gate",
        href: "/create/moment",
      },
      {
        role: "For Brands",
        badge: "High-Intent Audience",
        why: "Prevent bots and giveaway hunters from draining your reward budgets.",
        outcome:
          "PromoKey gating ensures your budget goes to real, verified, daily active consumers.",
        action: "Launch a Key Campaign",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Lock,
        title: "Protected Scarcity",
        description: "Daily conversion limits (3 keys/day) keep access scarce and prestigious.",
      },
      {
        icon: Unlock,
        title: "Instant Vault Access",
        description: "Open sponsored product giveaways, VIP tables, and exclusive concert tickets.",
      },
      {
        icon: Sparkles,
        title: "Zero Cash Required",
        description: "100% mintable through active participation and points conversion.",
      },
    ],
    steps: [
      { label: "01", title: "Accumulate 500 Pts", text: "Earn points naturally by attending moments or submitting proof." },
      { label: "02", title: "Mint PromoKey", text: "Convert 500 Points into 1 PromoKey in your wallet (up to 3 per day)." },
      { label: "03", title: "Unlock the Vault", text: "Spend keys to enter premium opportunities and claim sponsored rewards." },
    ],
    tagline: "PromoKeys unlock the best of the city for the people who actually show up.",
  },

  "master-key": {
    eyebrow: "Daily Active Streak",
    headline: "The Master Key activates your daily VIP standing.",
    subhead:
      "The Master Key is your daily pulse. Complete just one verified action each day—a check-in, a share, or a vote—to unlock funded prize draws and daily Gem rewards.",
    whyItMatters:
      "A daily ritual builds an unstoppable community. The Master Key rewards consistency over sporadic spending.",
    primaryCta: { label: "Activate Today's Master Key", href: "/explore/moments" },
    secondaryCta: { label: "Check Streak Status", href: "/activity" },
    roles: [
      {
        role: "For Attendees",
        badge: "Daily Power-Up",
        why: "You want continuous access to live prize draws, multipliers, and daily perks.",
        outcome:
          "Perform 1 free verified action per day to maintain your Master Key and claim active bonuses.",
        action: "Complete Daily Action",
        href: "/explore/moments",
      },
      {
        role: "For Hosts",
        badge: "Daily Foot Traffic",
        why: "You want regular foot traffic every day of the week, not just Saturday night.",
        outcome:
          "Become an official Master Key check-in spot to draw curious locals through your doors.",
        action: "Register Check-in Spot",
        href: "/create/moment",
      },
      {
        role: "For Brands",
        badge: "Consistent Eyes",
        why: "Sustained engagement beats one-off campaign spikes every time.",
        outcome:
          "Daily active Master Key users view and interact with your sponsored activations on schedule.",
        action: "Sponsor Daily Drops",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Flame,
        title: "Streak Bonuses",
        description: "Consecutive daily activations boost your draw odds and bonus point multipliers.",
      },
      {
        icon: QrCode,
        title: "Quick & Simple",
        description: "One single check-in or proof submission keeps your key active for 24 hours.",
      },
      {
        icon: ShieldCheck,
        title: "Funded Opportunity Gate",
        description: "Keeps bots out and ensures real humans receive sponsored brand value.",
      },
    ],
    steps: [
      { label: "01", title: "Perform Daily Action", text: "Check in at a venue, submit a quick review, or complete a mission." },
      { label: "02", title: "Master Key Unlocks", text: "Your badge turns active gold for the next 24 hours." },
      { label: "03", title: "Claim Funded Value", text: "Access all live Gem draws and sponsor-funded reward pools." },
    ],
    tagline: "One small action every day opens the doors to everything.",
  },

  pieces: {
    eyebrow: "Cultural Equity & Memorabilia",
    headline: "Pieces let you own a lasting fragment of the moment.",
    subhead:
      "Pieces are limited digital collectibles tied to landmark events, iconic moments, and creator collaborations. They celebrate history, confer perpetual perks, and can be traded in the marketplace.",
    whyItMatters:
      "Ticket stubs used to sit in a shoebox. Pieces turn memories into living assets that unlock discounts, backstage access, and lifetime host recognition.",
    primaryCta: { label: "Explore Moment Pieces", href: "/portfolio" },
    secondaryCta: { label: "Create a Piece Drop", href: "/create/moment" },
    roles: [
      {
        role: "For Attendees",
        badge: "Collect & Hold",
        why: "You were there when history happened and want proof you were part of the early crew.",
        outcome:
          "Collect limited-edition pieces that grant lifetime perks, VIP lines, and secondary market value.",
        action: "View Your Piece Vault",
        href: "/portfolio",
      },
      {
        role: "For Hosts & Creators",
        badge: "Monetize Culture",
        why: "You want to reward your earliest supporters while creating a recurring royalty stream.",
        outcome:
          "Mint 50-100 Pieces for your flagship event; reward loyal holders with perpetual perks.",
        action: "Mint an Event Piece",
        href: "/create/moment",
      },
      {
        role: "For Brands",
        badge: "Brand Relics",
        why: "Create brand artifacts that people cherish and keep in their wallets for years.",
        outcome:
          "Sponsor commemorative Pieces with redeemable physical gifts and annual VIP invitations.",
        action: "Co-brand a Piece Drop",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Sparkles,
        title: "Provable Provenance",
        description: "Timestamped records proving you attended the maiden flight or anniversary drop.",
      },
      {
        icon: Gift,
        title: "Perpetual Utility",
        description: "Holders enjoy permanent discounts, secret menu access, or free admission.",
      },
      {
        icon: WalletCards,
        title: "Marketplace Liquidity",
        description: "Trade or gift your pieces to fellow collectors whenever you want.",
      },
    ],
    steps: [
      { label: "01", title: "Attend or Claim", text: "Earn a piece by being one of the first 50 attendees, or mint from the host drop." },
      { label: "02", title: "Hold in Vault", text: "Flash your piece at participating venues to unlock secret perks and VIP queues." },
      { label: "03", title: "Trade or Pass Down", text: "List on the Promorang marketplace or hold as a permanent cultural relic." },
    ],
    tagline: "Don't just witness culture—hold a piece of it.",
  },

  content: {
    eyebrow: "Creator Missions & UGC",
    headline: "Content that sparks real movement, not mindless scrolls.",
    subhead:
      "Creator missions connect authentic user-generated content directly to live moments. Post recaps, reviews, photos, or TikToks that point back to real places and get paid in Gems and Points.",
    whyItMatters:
      "Social algorithms are cluttered with fake aesthetic posts. Promorang content proves real people having real experiences, driving actual foot traffic to venues.",
    primaryCta: { label: "Browse Creator Missions", href: "/missions" },
    secondaryCta: { label: "Post a Moment Recap", href: "/create/moment" },
    roles: [
      {
        role: "For Creators",
        badge: "Get Paid for Vibes",
        why: "You love documenting nightlife, dining, and culture and want direct brand rewards.",
        outcome:
          "Complete local venue missions, submit photo/video proof, and get paid directly in Gems & cash.",
        action: "Find Open Missions",
        href: "/missions",
      },
      {
        role: "For Hosts & Venues",
        badge: "Authentic Foot Traffic",
        why: "You need organic viral content from guests who are actually in your room.",
        outcome:
          "Put up a 100-Gem bounty for the best video recap of your Friday night DJ set.",
        action: "Launch a UGC Mission",
        href: "/create/moment",
      },
      {
        role: "For Brands",
        badge: "Measurable Reach",
        why: "Traditional influencer deals are opaque and hard to verify.",
        outcome:
          "Tie creator payouts to verified venue visits, attendee check-ins, and tracked QR scans.",
        action: "Launch Brand Campaign",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: PlayCircle,
        title: "Mission Bounties",
        description: "Clear briefs with guaranteed Gem payouts for verified photo & video submissions.",
      },
      {
        icon: UserCheck,
        title: "Automatic Verification",
        description: "Smart submission review verifies tags, geolocations, and quality criteria.",
      },
      {
        icon: TrendingUp,
        title: "Creator Rank Boost",
        description: "Top-performing creators unlock higher bounty limits and direct brand sponsorships.",
      },
    ],
    steps: [
      { label: "01", title: "Pick a Mission", text: "Browse open briefs: e.g. 'Post a 15-second cocktail review tagging @venue'." },
      { label: "02", title: "Submit Proof", text: "Upload your link or media directly in the app for fast review." },
      { label: "03", title: "Get Rewarded", text: "Receive Gems in your wallet, boost your standing, and get featured." },
    ],
    tagline: "Content that brings people together in the real world.",
  },

  "promoshare-gems": {
    eyebrow: "Rewards & Real Value",
    headline: "Transparent prize draws and sponsor-funded Gems.",
    subhead:
      "PromoShare gives every attendee provably fair chances at community prizes, while Gems represent guaranteed, sponsor-funded reward value you can redeem for real-world perks and products.",
    whyItMatters:
      "No hidden lotteries or fake discount codes. PromoShare tickets are clearly named to specific draws, and Gems are 100% backed by committed sponsor pools before you earn them.",
    primaryCta: { label: "See Live PromoShare Draws", href: "/promoshare" },
    secondaryCta: { label: "Open Your Gem Vault", href: "/wallet" },
    roles: [
      {
        role: "For Attendees",
        badge: "Win & Redeem",
        why: "You want real, exciting rewards for your loyalty and participation.",
        outcome:
          "Collect Tickets from moments to enter weekly draws; redeem Gems for gift cards, drinks, and tickets.",
        action: "Check PromoShare Draws",
        href: "/promoshare",
      },
      {
        role: "For Hosts",
        badge: "Electrify the Crowd",
        why: "You want to turn regular nights into high-stakes, thrilling experiences.",
        outcome:
          "Run a live PromoShare draw at midnight to keep the crowd engaged until closing time.",
        action: "Host a PromoShare Draw",
        href: "/create/moment",
      },
      {
        role: "For Brands",
        badge: "Funded Rewards",
        why: "You need transparent proof that your promotional budget reached verified participants.",
        outcome:
          "Fund a Gem pool with full audit trails, participant receipts, and measurable ROI.",
        action: "Fund a Reward Pool",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Ticket,
        title: "Named PromoShare Tickets",
        description: "Each ticket is tied to an explicit draw date and prize—no phantom entries.",
      },
      {
        icon: Gem,
        title: "Funded Gems",
        description: "Gems are backed by verified sponsor reserves and redeemable for tangible perks.",
      },
      {
        icon: ShieldCheck,
        title: "100% Provable Fairness",
        description: "Draws are verifiable with publicly visible ticket totals and timestamped winners.",
      },
    ],
    steps: [
      { label: "01", title: "Earn Tickets & Gems", text: "Complete moment actions, convert keys, or win creator missions." },
      { label: "02", title: "Join Transparent Draws", text: "Enter your named tickets into weekly community or brand prize drops." },
      { label: "03", title: "Redeem Real Perks", text: "Spend Gems in the marketplace for drinks, merchandise, and VIP upgrades." },
    ],
    tagline: "Honest rewards backed by real sponsors. Win, collect, and redeem.",
  },

  network: {
    eyebrow: "Community & Squads",
    headline: "Moments are better together. Build your crew and multiply value.",
    subhead:
      "Promorang isn't a solo game. When you bring friends, host a crew, and frequent the same venues together, you build Scene Standing that unlocks collective perks, crew multipliers, and exclusive invites.",
    whyItMatters:
      "Great nightlife, dining, and culture thrive on social momentum. The more your crew shows up, the stronger your city's local culture becomes.",
    primaryCta: { label: "Explore Local Communities", href: "/for-communities" },
    secondaryCta: { label: "Invite Your Crew", href: "/explore/moments" },
    roles: [
      {
        role: "For Attendees & Crews",
        badge: "Squad Power",
        why: "Going out with your friends should be twice as fun and twice as rewarding.",
        outcome:
          "Form a crew, check in together for squad point multipliers, and unlock group table perks.",
        action: "Find Your Scene",
        href: "/explore/moments",
      },
      {
        role: "For Hosts & Scene Stewards",
        badge: "Cultivate Regulars",
        why: "A venue without a community is just an empty room.",
        outcome:
          "Identify and reward the social hubs and key figures who bring 10+ friends every weekend.",
        action: "Build a Scene Roster",
        href: "/for-communities",
      },
      {
        role: "For Brands",
        badge: "Community Movement",
        why: "Word-of-mouth recommendations between friends carry 10x more trust than billboard ads.",
        outcome:
          "Sponsor entire crews and subcultures that represent the core demographic of your brand.",
        action: "Sponsor a Community",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: Users,
        title: "Crew Multipliers",
        description: "Checking in with 3+ friends boosts everyone’s Point and Ticket yield by up to 50%.",
      },
      {
        icon: Compass,
        title: "Scene Leaderboards",
        description: "Compete with other crews for monthly venue residencies and exclusive perks.",
      },
      {
        icon: Share2,
        title: "Viral Referral Graph",
        description: "Earn passive points whenever friends you introduced to Promorang attend moments.",
      },
    ],
    steps: [
      { label: "01", title: "Rally Your Crew", text: "Share moment invites with your squad using your personal link." },
      { label: "02", title: "Check In Together", text: "Trigger the Squad Multiplier when you scan in at the same venue." },
      { label: "03", title: "Unlock Scene Status", text: "Climb the local leaderboard and unlock VIP table upgrades and invitations." },
    ],
    tagline: "Culture is co-created. Bring your friends and build the scene.",
  },

  sustainability: {
    eyebrow: "Platform Sustainability & Trust",
    headline: "How Promorang earns: transparent, ethical, and aligned.",
    subhead:
      "Promorang earns when funded value moves, verified outcomes succeed, or premium operator tools are used. Free participation is never secretly monetized, and reward pools belong to the community.",
    whyItMatters:
      "Traditional platforms profit by selling your attention and data to advertisers. Promorang operates on a transparent, fee-for-service model where we only succeed when hosts pack rooms and attendees get real value.",
    primaryCta: { label: "View Pricing & Products", href: "/pricing" },
    secondaryCta: { label: "Explore Brand Hub", href: "/for-brands" },
    roles: [
      {
        role: "For Participants",
        badge: "Always Free to Earn",
        why: "You want assurance that your time and data are respected.",
        outcome:
          "100% free to explore, attend, check in, and earn. Zero hidden fees or predatory ads.",
        action: "Explore Free Moments",
        href: "/explore/moments",
      },
      {
        role: "For Hosts & Merchants",
        badge: "Predictable Pricing",
        why: "You need clear costs that scale with your actual business revenue.",
        outcome:
          "Transparent monthly operator plans and performance-based activation fees.",
        action: "View Host Pricing",
        href: "/pricing",
      },
      {
        role: "For Brands & Sponsors",
        badge: "Separated Escrow",
        why: "You require complete audit trails for promotional budgets and prize funds.",
        outcome:
          "Reward pools remain committed in escrow; Promorang charges a published service fee.",
        action: "Review Commercial Terms",
        href: "/for-brands",
      },
    ],
    highlights: [
      {
        icon: ShieldCheck,
        title: "3 Separate Ledgers",
        description: "Promorang revenue, sponsor reward escrow, and operator proceeds are strictly separated.",
      },
      {
        icon: Coins,
        title: "Disclosed Fees Only",
        description: "Every fee is published before checkout—no surprise deductions or hidden cuts.",
      },
      {
        icon: Building2,
        title: "Value Aligned",
        description: "We only earn when real transactions, bookings, and verified outcomes occur.",
      },
    ],
    steps: [
      { label: "01", title: "Sponsor Funds", text: "A brand commits a reward pool and pays a published configuration fee." },
      { label: "02", title: "Users Participate", text: "Participants complete verified missions and attend moments." },
      { label: "03", title: "Outcomes Verified", text: "100% of the committed reward pool is distributed to qualifying participants." },
    ],
    tagline: "A sustainable platform built on trust, transparency, and shared success.",
  },
};

// ==========================================
// Interactive Concept Visual Card Components
// ==========================================

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
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Live Moment</span>
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
              <p className="text-xs font-semibold text-zinc-400">Tonight's Activation</p>
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
            <QrCode className="h-4 w-4 text-primary" /> Geofence Verified
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
              <Sparkles className="h-4 w-4" /> Simulate Check-In (Leave Mark)
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Reputation & Rank</span>
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
            <p className="text-xs text-zinc-400">Points Balance</p>
            <p className="mt-1 font-serif text-2xl font-bold text-amber-400">{points.toLocaleString()} <span className="text-xs font-sans font-normal text-zinc-400">Pts</span></p>
            <p className="mt-1 text-[11px] text-zinc-500">+250 earned this week</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-zinc-400">Minted PromoKeys</p>
            <p className="mt-1 font-serif text-2xl font-bold text-primary">{keys} <span className="text-xs font-sans font-normal text-zinc-400">Keys</span></p>
            <p className="mt-1 text-[11px] text-zinc-500">Vault Access Ready</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-300">Daily Conversion Window</span>
            <span className="font-mono text-primary">500 Pts = 1 PromoKey</span>
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
              <CheckCircle2 className="h-4 w-4" /> 1 PromoKey Minted!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Mint 1 PromoKey (500 Pts)
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Key Gated Opportunity</span>
            <p className="text-sm font-bold text-white">The Creator Vault Drop</p>
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
                  ? "Access granted: Show your pass code #VK-9920 at the host stand."
                  : "Sponsored by Artisan Distillers • 8 slots remaining today"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Scarcity</p>
            <p className="font-semibold text-white mt-0.5">Max 3 / Day</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Cost</p>
            <p className="font-semibold text-primary mt-0.5">0 Cash (1 PromoKey)</p>
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
              <CheckCircle2 className="h-4 w-4" /> Pass Unlocked (#VK-9920)
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Spend 1 Key to Unlock Pass
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Daily Active Pulse</span>
            <p className="text-sm font-bold text-white">Master Key: {active ? "Active" : "Inactive"}</p>
          </div>
        </div>
        <Badge className="border-amber-500/40 bg-amber-500/20 text-amber-300 text-xs font-mono">
          🔥 6 Day Streak
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-amber-500/20 bg-black/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Status Window</span>
            <span className="text-xs font-mono text-amber-400">14h 32m remaining</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-white/[0.05] p-2">
              <p className="text-[10px] text-zinc-400">Daily Draw</p>
              <p className="font-bold text-emerald-400 mt-0.5">Eligible</p>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-2">
              <p className="text-[10px] text-zinc-400">Multiplier</p>
              <p className="font-bold text-amber-400 mt-0.5">1.5x Pts</p>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-2">
              <p className="text-[10px] text-zinc-400">Gems Pool</p>
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
          {active ? "Simulate Expiration" : "Simulate Daily Action (Check In)"}
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Cultural Memorabilia</span>
            <p className="text-sm font-bold text-white">Founding Resident Piece #042</p>
          </div>
        </div>
        <Badge className="border-purple-500/40 bg-purple-500/20 text-purple-300 text-xs font-mono">
          1 of 100 Minted
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4">
          <p className="text-xs text-purple-300 font-semibold">Origin Moment</p>
          <h4 className="text-base font-bold text-white mt-0.5">Neon Nights Launch Gala 2026</h4>
          <p className="mt-2 text-xs text-zinc-300">
            Permanent utility: 15% VIP discount across all partner venues and guaranteed entry to annual reunion sessions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Ownership</p>
            <p className="font-semibold text-white mt-0.5">Permanent & Tradable</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Status</p>
            <p className="font-semibold text-purple-300 mt-0.5">In Your Vault</p>
          </div>
        </div>

        <Button className="w-full py-5 text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30" asChild>
          <Link to="/portfolio">
            <WalletCards className="mr-2 h-4 w-4" /> View in Your Piece Vault
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">Funded UGC Bounty</span>
            <p className="text-sm font-bold text-white">15s Cocktail Craft Video</p>
          </div>
        </div>
        <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 font-mono text-xs font-bold text-pink-400">
          +120 Gems Bounty
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs font-semibold text-zinc-400">Mission Brief</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-200">
            Record a short video featuring the bartender preparing the signature seasonal cocktail and tag @TheVelvetLounge.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="border-white/15 text-[10px] text-zinc-400">TikTok / Reels</Badge>
            <Badge variant="outline" className="border-white/15 text-[10px] text-zinc-400">Min 10s</Badge>
            <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-400">Instant Review</Badge>
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
              <CheckCircle2 className="h-4 w-4" /> Proof Verified (+120 Gems Paid)
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Transparent Rewards</span>
            <p className="text-sm font-bold text-white">Tickets & Funded Gems</p>
          </div>
        </div>
        <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs">
          350 Gems Balance
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
            Entered into the Austin Community Weekend Pool ($500 Sponsor Escrow).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Fairness</p>
            <p className="font-semibold text-white mt-0.5">100% Provable On-Chain</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-zinc-300">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Redeemable</p>
            <p className="font-semibold text-cyan-300 mt-0.5">Direct Perks & Products</p>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Squad Multiplier</span>
            <p className="text-sm font-bold text-white">Downtown Collective</p>
          </div>
        </div>
        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-mono text-xs font-bold text-blue-400">
          1.5x Boost Active 🔥
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-semibold text-zinc-300">Checked In Together (4/5 Active)</span>
            <span className="font-mono text-blue-400">+50% Pts Yield</span>
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
          <p className="mt-0.5 text-zinc-400">2 more check-ins this month unlocks VIP reservation priority.</p>
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
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-black/80 to-black p-6 shadow-2xl backdrop-blur-xl">
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
          Audited Model
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
            <p className="text-xs font-bold text-white">3. Promorang Service Fee</p>
            <p className="text-[11px] text-zinc-400">Disclosed software and setup configuration fees</p>
          </div>
          <span className="text-xs font-mono text-primary font-bold">Published Fee</span>
        </div>

        <Button className="w-full py-5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30" asChild>
          <Link to="/pricing">
            <Building2 className="mr-2 h-4 w-4" /> View Pricing & Commercial Terms
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
        return <MomentVisualDemo />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <SEO title={`${data.eyebrow} - Promorang`} description={data.subhead} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#161513] pb-16 pt-28 text-white md:pb-24 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,113,16,0.18),transparent_40%),repeating-linear-gradient(90deg,rgba(255,255,255,.018)_0,rgba(255,255,255,.018)_1px,transparent_1px,transparent_80px)]" />

        <div className="container relative z-10 px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left: Headline & Benefit Story */}
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

            {/* Right: Interactive Visual Demo */}
            <div>{renderVisualCard()}</div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Header Bar */}
      <nav aria-label="Economy Navigation" className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="container flex gap-2 overflow-x-auto px-6 py-3 scrollbar-none">
          {navigationLinks.map((link) => {
            const isActive =
              (conceptKey === "overview" && link.slug === "overview") ||
              link.slug === conceptKey;

            return (
              <Link
                key={link.slug}
                to={link.path}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "border-primary bg-primary text-black font-extrabold shadow-md shadow-primary/20"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Dynamic Persona / Role Value Section */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 md:py-24">
        <div className="container px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Tailored Experience</p>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl text-white">
              Why this matters to you
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Select your perspective to see how this fits your real-world goals.
            </p>
          </div>

          {/* Persona Switcher Tabs */}
          <div className="mt-8">
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
              {data.roles.map((r, idx) => (
                <button
                  key={r.role}
                  onClick={() => setSelectedRoleIndex(idx)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    selectedRoleIndex === idx
                      ? "bg-primary text-black font-extrabold shadow-lg shadow-primary/20"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {r.role}
                </button>
              ))}
            </div>

            {/* Active Persona Details Card */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent p-6 md:p-10">
              <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                <div>
                  <Badge className="border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-3">
                    {activeRole.badge}
                  </Badge>
                  <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
                    {activeRole.why}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-300 md:text-base">
                    {activeRole.outcome}
                  </p>
                  <div className="mt-6">
                    <Button variant="hero" asChild>
                      <Link to={activeRole.href}>
                        {activeRole.action}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3">
                  {data.highlights.map((h, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                          <h.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{h.title}</p>
                          <p className="mt-0.5 text-[11px] text-zinc-400">{h.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Simple Flow */}
      <section className="border-b border-white/10 bg-[#070707] py-16 md:py-24">
        <div className="container px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">How It Works</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">
              Simple 3-Step Rhythm
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              Clear, transparent, and rewarding every step of the way.
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

      {/* Dedicated Sustainability & Pricing Section (Only shown on /economy/sustainability OR overview tab) */}
      {(conceptKey === "sustainability" || conceptKey === "overview") && (
        <section id="sustainability" className="border-b border-white/10 bg-[#0d0d0d] py-16 md:py-24">
          <div className="container px-6">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <Badge className="border-primary/30 bg-primary/10 text-primary text-xs font-bold mb-3">
                  Ethical Monetization
                </Badge>
                <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
                  How Promorang Earns
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  Promorang charges predictable service fees when funded campaigns operate, bookings occur, or operators use premium growth tools. We do not sell your personal data or take hidden cuts from community reward pools.
                </p>
                <div className="mt-6">
                  <Button variant="hero" asChild>
                    <Link to="/pricing">
                      View Products & Pricing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {revenueLines.map((line, idx) => (
                  <div key={line.key} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">0{idx + 1}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {line.capture}
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-bold text-white">{line.title}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/80 mt-0.5">
                      Paid by {line.payer}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">{line.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ready to Get Started Bottom Banner */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-[#090909] to-[#14120e]">
        <div className="container relative z-10 px-6 text-center max-w-3xl mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-black shadow-xl shadow-primary/30">
            <Sparkles className="h-8 w-8" />
          </div>

          <h2 className="mt-6 font-serif text-3xl font-extrabold text-white md:text-5xl">
            Experience the Real-World Economy
          </h2>
          <p className="mt-4 text-base text-zinc-300 leading-relaxed">
            Join the next live moment, start racking up points, or publish an activation that brings your community together.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/explore/moments">
                Explore Moments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/create/moment">Create a Moment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
