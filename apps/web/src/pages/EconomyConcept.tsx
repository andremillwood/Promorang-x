import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  KeyRound,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import SEO from "@/components/SEO";
import { TactileButton } from "@/components/ui/TactileButton";
import {
  CollectibleRelic,
  NightTrail,
  ObjectShelf,
  PaperReceipt,
  PlainEnglish,
  PromoCardFace,
  PromorangValidReceipt,
  RoleLens,
  StatusChip,
  TicketPass,
} from "@/components/promorang/SignatureObjects";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { listValueInstruments, VALUE_INSTRUMENTS, VALUE_STORY } from "@promorang/shared";
import { WhatIsWhatMap } from "@/components/economy/WhatIsWhatMap";

type ConceptKey =
  | "overview"
  | "moments"
  | "points"
  | "keys"
  | "master-key"
  | "promocard"
  | "pieces"
  | "content"
  | "gems"
  | "promoshare"
  | "save-and-win"
  | "network"
  | "sustainability";

const navigationLinks: Array<{ label: TranslationKey; slug: string; path: string }> = [
  { label: "economy.navOverview", slug: "overview", path: "/economy" },
  { label: "economy.navPromoCard", slug: "promocard", path: "/economy/promocard" },
  { label: "economy.navMoments", slug: "moments", path: "/economy/moments" },
  { label: "economy.navPoints", slug: "points", path: "/economy/points" },
  { label: "economy.navGems", slug: "gems", path: "/economy/gems" },
  { label: "economy.navPieces", slug: "pieces", path: "/economy/pieces" },
  { label: "economy.navKeys", slug: "keys", path: "/economy/keys" },
  { label: "economy.navMasterKey", slug: "master-key", path: "/economy/master-key" },
  { label: "economy.navPromoShare", slug: "promoshare", path: "/economy/promoshare" },
  { label: "economy.navSaveWin", slug: "save-and-win", path: "/economy/save-and-win" },
  { label: "economy.navContent", slug: "content", path: "/economy/content" },
  { label: "economy.navCrews", slug: "network", path: "/economy/network" },
  { label: "economy.navMoney", slug: "sustainability", path: "/economy/sustainability" },
];

const objectShelf = listValueInstruments().map((item) => ({
  href: item.href,
  name: item.name,
  like: item.like,
  use: item.shelfUse,
}));

const CONCEPT_SLUGS = new Set<ConceptKey>([
  "overview",
  "moments",
  "points",
  "keys",
  "master-key",
  "promocard",
  "pieces",
  "content",
  "gems",
  "promoshare",
  "save-and-win",
  "network",
  "sustainability",
]);

function resolveConceptKey(concept?: string): ConceptKey {
  if (concept === "promoshare-gems") return "gems";
  if (concept && CONCEPT_SLUGS.has(concept as ConceptKey)) return concept as ConceptKey;
  return "overview";
}

const conceptData: Record<
  ConceptKey,
  {
    eyebrow: string;
    headline: string;
    subhead: string;
    inPlainEnglish: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    roles: Array<{ role: string; why: string; outcome: string; action: string; href: string }>;
    steps: Array<{ label: string; title: string; text: string }>;
    tagline: string;
  }
> = {
  overview: {
    eyebrow: "How Promorang works",
    headline: "Show up. Show the card. Come back.",
    subhead:
      "Promorang is a local rewards loop. A merchant puts a perk on your PromoCard. You claim it, show it at the door, and they record VALID. The Return is eligibility for the next one — not a fake refill.",
    inPlainEnglish:
      "Go to a real place. Show a claimed perk. The merchant records it. The next benefit is a new claim, not money appearing on the plastic.",
    primaryCta: { label: "See one night, step by step", href: "#one-night" },
    secondaryCta: { label: "Get a PromoCard", href: "/auth?mode=signup&next=/card" },
    roles: [
      {
        role: "If you go out",
        why: "Your time out should turn into something you can actually use.",
        outcome: "Use recorded partner benefits, keep verified history, and see new eligibility when the underlying action is actually recorded.",
        action: "Find something nearby",
        href: "/explore/moments",
      },
      {
        role: "If you run a shop",
        why: "Quiet nights and one-time deals are hard to turn into regulars.",
        outcome: "You set the offer and the minimum spend. People check in, pay the rest normally, and you see who actually came.",
        action: "See tools for hosts",
        href: "/for-merchants",
      },
      {
        role: "If you run a brand",
        why: "Ads can show clicks without proving anyone walked in.",
        outcome: "Fund configured visits, purchases, or creator outcomes and see the recorded evidence. PROMORANG only describes value as funded when a funding record exists.",
        action: "See options for brands",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "Tonight", title: "A place puts up a perk", text: "A shop or sponsor supplies something you can actually claim." },
      { label: "At the door", title: "You show the card", text: "A claimed perk flips to a code. Nothing is used until staff records VALID." },
      { label: "After", title: "The Return is eligibility", text: "A verified night is stamped. Value moves when a merchant can honor the next claim." },
      { label: "Later", title: "Extras open up", text: "Points, Keys, and Gems can be extras where the recorded rule makes them available — not assumptions attached to every visit." },
    ],
    tagline: "Useful at the register. Earned by being there.",
  },
  promocard: {
    eyebrow: "The object you hold",
    headline: "PromoCard is the perk you can show at the door.",
    subhead:
      "A merchant supplies a benefit. You claim it. You flip the card and show the code. Staff records VALID. Showing up stamps eligibility — it does not invent a refill balance.",
    inPlainEnglish: "It is a Promorang pass, not a local gift card. Empty cities stay empty until a merchant puts something on it.",
    primaryCta: { label: "Get your PromoCard", href: "/auth?mode=signup&next=/card" },
    secondaryCta: { label: "Partner with us", href: "/for-merchants" },
    roles: [
      {
        role: "If you go out",
        why: "You should not need a glossary to use a reward.",
        outcome: "Claim a live perk, flip the card at the door, and keep the receipt after they validate it.",
        action: "Get your card",
        href: "/auth?mode=signup&next=/card",
      },
      {
        role: "If you run a shop",
        why: "Blanket discounts eat margin without proving a new customer walked in.",
        outcome: "Supply a real perk, scan the code, and mark VALID. The next benefit is a new claim.",
        action: "Set shop terms",
        href: "/for-merchants",
      },
      {
        role: "If you fund it",
        why: "Reach is not the same as someone buying something nearby.",
        outcome: "Fund live inventory, then follow the path from claim to a recorded redemption.",
        action: "Explore partner options",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Get the card", text: "An eligible account gets a PromoCard. Empty is honest until a perk lands." },
      { label: "02", title: "Show it at the door", text: "A claimed, unexpired code is the only thing staff can validate." },
      { label: "03", title: "They record VALID", text: "A toast or local balance change is not a redemption." },
      { label: "04", title: "The Return is eligibility", text: "A verified night is stamped. The next benefit is a new claim." },
    ],
    tagline: "Useful at the door. Controlled by the merchant. Honest when empty.",
  },
  moments: {
    eyebrow: "Real nights, real places",
    headline: "Moments are the tastings, drops, and nights you actually go to.",
    subhead:
      "A Moment is something happening in a real place. Attendance becomes verified only through that Moment's recorded check-in or proof-review contract; an RSVP or button press is not attendance.",
    inPlainEnglish: "If you can walk there, scan there, and stay awhile, it can count. That is the whole idea.",
    primaryCta: { label: "Find a Moment", href: "/explore/moments" },
    secondaryCta: { label: "Host a Moment", href: "/create/moment" },
    roles: [
      {
        role: "If you go out",
        why: "Discovering your city should come with a perk, not a scavenger hunt of apps.",
        outcome: "Unlock a tasting, a skip-the-line pass, or a keepsake by arriving and checking in.",
        action: "See tonight's Moments",
        href: "/explore/moments",
      },
      {
        role: "If you run a venue",
        why: "Empty midweek tables are expensive. One-night crowds rarely return.",
        outcome: "Publish a night with arrival perks so early guests are rewarded and regulars are visible.",
        action: "Publish a night",
        href: "/create/moment",
      },
      {
        role: "If you sponsor it",
        why: "You want people in a specific room, not a vague impression count.",
        outcome: "Fund a local night and see who actually checked in.",
        action: "Sponsor a Moment",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Someone hosts", text: "A venue or sponsor posts the place, time, and what you get for arriving." },
      { label: "02", title: "You arrive", text: "Complete the proof the Moment actually requires while you are there." },
      { label: "03", title: "It counts", text: "Only configured consequences can land after the required attendance or proof state is verified." },
      { label: "04", title: "It stays on your profile", text: "The night becomes part of your history — you were there." },
    ],
    tagline: "Moments matter because real life happens offline.",
  },
  points: {
    eyebrow: "Your score for showing up",
    headline: "Points remember that you showed up.",
    subhead:
      "Points are a non-cash score issued only when an eligible recorded action has a configured Points rule. They are not money and are not assumed for every check-in, share, referral, or mission.",
    inPlainEnglish: "Points are a score, not money. Trade 500 for a Key when you want a shot at something special.",
    primaryCta: { label: "See standing", href: "/activity" },
    secondaryCta: { label: "Earn Points today", href: "/explore/moments" },
    roles: [
      {
        role: "If you go out",
        why: "Effort should count more than who can pay to skip ahead.",
        outcome: "Stack Points, then turn 500 into 1 Key when you want a limited offer.",
        action: "Earn Points",
        href: "/explore/moments",
      },
      {
        role: "If you run a venue",
        why: "The people who bring groups and come back should be easy to spot.",
        outcome: "Invite high-standing guests to tastings and private nights without a messy spreadsheet.",
        action: "See host tools",
        href: "/create/moment",
      },
      {
        role: "If you run a brand",
        why: "You want real local advocates, not empty accounts.",
        outcome: "Standing is earned in person, so campaign access can follow people who actually participate.",
        action: "View community options",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Do something eligible", text: "Complete an action whose recorded rule actually issues Points." },
      { label: "02", title: "Points land", text: "They stay on your seasonal score. They cannot be traded." },
      { label: "03", title: "Turn them into a Key", text: "500 Points become 1 PromoKey when you choose to convert." },
      { label: "04", title: "Season resets", text: "Everyone gets a fresh start. Status from showing up still matters." },
    ],
    tagline: "Your energy counts. Points prove you put in the work.",
  },
  keys: {
    eyebrow: "Access to the good stuff",
    headline: "Keys open limited offers that should not go to the first bot in line.",
    subhead:
      "The Wallet can convert 500 recorded Points into 1 PromoKey, subject to the current daily conversion limit. A PromoKey only opens an opportunity that explicitly accepts it; it is not a universal VIP or prize entitlement.",
    inPlainEnglish: "A Key is a ticket you earn. Spend it to enter something scarce. You cannot buy a stack of them.",
    primaryCta: { label: "Open your Keys", href: "/wallet" },
    secondaryCta: { label: "Browse drops", href: "/missions" },
    roles: [
      {
        role: "If you go out",
        why: "The best tables and prizes should go to people who actually participate.",
        outcome: "Spend an earned Key to enter a vault, tasting, or limited night.",
        action: "See your Keys",
        href: "/wallet",
      },
      {
        role: "If you host VIP nights",
        why: "Free RSVPs flake. People who earned a seat tend to show up.",
        outcome: "Ask for a Key on scarce reservations so the room fills with people who meant it.",
        action: "Create a limited night",
        href: "/create/moment",
      },
      {
        role: "If you run a brand",
        why: "Open giveaways get farmed.",
        outcome: "Require a Key so the budget reaches people who already showed up locally.",
        action: "Launch a gated campaign",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Earn Points", text: "Show up until you have at least 500." },
      { label: "02", title: "Make a Key", text: "Convert 500 Points into 1 PromoKey. Max three new Keys per day." },
      { label: "03", title: "Pick an offer", text: "Choose a recorded opportunity that explicitly accepts a PromoKey." },
      { label: "04", title: "Use it", text: "The Key is spent. Access is yours." },
    ],
    tagline: "Keys open the city for people who actually show up.",
  },
  "master-key": {
    eyebrow: "Today's contribution gate",
    headline: VALUE_INSTRUMENTS["master-key"].job.replace(/\.$/, "."),
    subhead: VALUE_INSTRUMENTS["master-key"].is,
    inPlainEnglish: VALUE_INSTRUMENTS["master-key"].like,
    primaryCta: { label: "See today's Proofs", href: "/activity" },
    secondaryCta: { label: "Do one Proof today", href: "/explore/moments" },
    roles: [
      {
        role: "If you go out",
        why: "Funded extras should go to people who already contributed today — not to a wallet that bought a shortcut.",
        outcome: "Finish your tier's free Proofs. The Master Key turns on by itself. Then PromoKeys can be spent.",
        action: "Do today's Proof",
        href: "/explore/moments",
      },
      {
        role: "If you run a shop",
        why: "Quiet weekdays need a reason to visit that is not a discount war.",
        outcome: "Become a place people stop to finish today's Proof, then stay for a real purchase.",
        action: "Register your place",
        href: "/create/moment",
      },
      {
        role: "If you fund opportunities",
        why: "Open giveaways get farmed by accounts that never show up.",
        outcome: "Require today's Master Key so the budget reaches people who already did the work.",
        action: "Launch a gated campaign",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Know your count", text: "Starter needs 5 verified free Proofs. Professional 2. Power User 1." },
      { label: "02", title: "Do the free work", text: "Only completed, unpaid Proofs count. Likes do not, unless they sit inside a Proof mission." },
      { label: "03", title: "It turns on", text: "No Point charge. No purchase. The gate opens until daily reset." },
      { label: "04", title: "Then spend Keys", text: "A PromoKey still answers how many doors you may open. The Master Key answers whether today counts." },
    ],
    tagline: VALUE_INSTRUMENTS["master-key"].marketKnows,
  },
  pieces: {
    eyebrow: "Recorded ownership",
    headline: "A Piece is a recorded position tied to a specific asset.",
    subhead:
      "Pieces can represent limited supply or ownership history for an approved asset. A holding may have market or pool state when that state is actually recorded, but quantity alone does not create discounts, VIP access, governance rights, resale value, or a guaranteed buyer.",
    inPlainEnglish:
      "Keep the Piece because the record matters to you. Check the Piece profile for any real pool, price, benefit, or restriction; PROMORANG does not invent one from the number you hold.",
    primaryCta: { label: "Review Piece records", href: "/marketplace" },
    secondaryCta: { label: "Open your portfolio", href: "/portfolio" },
    roles: [
      {
        role: "If you hold a Piece",
        why: "A recorded holding should be understandable without implying benefits that were never issued.",
        outcome: "See the asset, recorded supply/position state, and any source-backed market information that actually exists.",
        action: "Review Piece records",
        href: "/marketplace",
      },
      {
        role: "If you operate an asset",
        why: "A Piece should not become a promise simply because an interface can display it.",
        outcome: "Treat issuance, benefits, pools, fees and settlement as separate contracts and publish only the terms you can honor.",
        action: "Review your Moment",
        href: "/dashboard",
      },
      {
        role: "If you fund or collaborate",
        why: "A collectible is not proof of ROI, access, or secondary-market demand.",
        outcome: "Use recorded evidence and explicit terms rather than assumed perks or resale economics.",
        action: "See partner options",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "An approved asset exists", text: "The Piece refers to a real source object and recorded supply." },
      { label: "02", title: "A position is recorded", text: "Ownership comes from the ledger, not a browser-only collectible card." },
      { label: "03", title: "Benefits stay explicit", text: "No discount, access right, governance vote, royalty, or fee share is inferred from quantity alone." },
      { label: "04", title: "Market state stays separate", text: "A pool, price, trade or settlement appears only when its own recorded contract exists." },
    ],
    tagline: "Ownership is a record. Benefits and market value need their own records.",
  },
  content: {
    eyebrow: "Creator release opportunities",
    headline: "An opportunity is not automatically a paid commission.",
    subhead:
      "A recorded Content Drop can publish an objective, assets and configured contribution rules. Opening it does not mean a creator accepted a job, transferred rights, passed review, earned payment, or reached settlement.",
    inPlainEnglish:
      "Check what the opportunity actually records before you create anything. Brief, acceptance, rights, review, earning and settlement are different states.",
    primaryCta: { label: "Review release opportunities", href: "/content-drops?role=creator" },
    secondaryCta: { label: "See creator tools", href: "/for-creators" },
    roles: [
      {
        role: "If you create",
        why: "An open opportunity should not be mistaken for a guaranteed job or payout.",
        outcome: "Review the recorded objective, assets and configured consequences. Do not assume acceptance, rights approval or settlement.",
        action: "Open creator opportunities",
        href: "/content-drops?role=creator",
      },
      {
        role: "If you run a venue",
        why: "Creator work needs explicit terms, not an implied bounty.",
        outcome: "Use recorded release/distribution tools for what exists today; acceptance and rights-review remain separate requirements.",
        action: "Review host tools",
        href: "/dashboard",
      },
      {
        role: "If you run a brand",
        why: "A reward configuration is not the same as an accepted commission or settled creator payment.",
        outcome: "Fund and review only through recorded terms, then keep attribution, approval, earning and settlement distinct.",
        action: "Review brand tools",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "The opportunity is published", text: "Objective, source assets and configured action rules are recorded." },
      { label: "02", title: "Acceptance is separate", text: "Do not treat discovery or opening the brief as creator acceptance or availability." },
      { label: "03", title: "Rights and review are separate", text: "Submission, approval, attribution and rights terms must not collapse into one state." },
      { label: "04", title: "Earning is not settlement", text: "Show value only when eligibility is recorded, and settlement only when the settlement record exists." },
    ],
    tagline: "Open opportunity ≠ accepted commission ≠ approved work ≠ settled payment.",
  },
  gems: {
    eyebrow: "Recorded platform value",
    headline: "Gems have different states. Treat those states as different.",
    subhead:
      "Current Gem packs can be purchased through the Wallet, while other Gems may come from eligible recorded outcomes. Available, bonus, pending, secured and withdrawable value are not interchangeable, and a displayed Gem balance is not automatically cash in hand.",
    inPlainEnglish:
      "Read the Wallet state that applies to your Gems. Purchase price, spending eligibility and withdrawal eligibility are separate questions.",
    primaryCta: { label: "Open Wallet", href: "/wallet" },
    secondaryCta: { label: "Understand the value states", href: "/economy" },
    roles: [
      {
        role: "If you use Gems",
        why: "One total should not hide whether value is available, pending, bonus, secured or withdrawable.",
        outcome: "Use the Wallet's recorded state before spending or requesting withdrawal.",
        action: "Open Wallet",
        href: "/wallet",
      },
      {
        role: "If you earn Gems",
        why: "A configured reward is not the same as issued or settled value.",
        outcome: "Follow the recorded consequence from eligibility to issuance and, where supported, settlement.",
        action: "Review activity",
        href: "/activity",
      },
      {
        role: "If you fund value",
        why: "Funding, issuance and settlement must remain auditable instead of being implied by copy.",
        outcome: "Configure value only where the platform records the funded source and resulting issuance.",
        action: "See brand tools",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "Acquire", title: "A Gem record has a source", text: "Purchase, funded issuance or another supported source must be recorded." },
      { label: "State", title: "Availability matters", text: "Pending, available, bonus, secured and withdrawable states can have different rules." },
      { label: "Use", title: "Spend only where supported", text: "A live product must explicitly accept Gems before spend is implied." },
      { label: "Settle", title: "Withdrawal is a separate workflow", text: "A balance is not called settled cash until the withdrawal or settlement record says so." },
    ],
    tagline: "Source, availability, use and settlement are different truths.",
  },
  promoshare: {
    eyebrow: "Recorded entries and draws",
    headline: "A PromoShare entry is a chance in a named recorded draw — not a prize.",
    subhead:
      "Entries, draw selection, claim, distribution and settlement are separate records. A share action does not automatically earn an entry, and a selected result is not described as delivered or settled until the corresponding record exists.",
    inPlainEnglish:
      "First check that you actually have a recorded entry. If a draw selects you, follow the claim and settlement state instead of assuming the prize already landed.",
    primaryCta: { label: "Open PromoShare", href: "/promoshare" },
    secondaryCta: { label: "Review Wallet", href: "/wallet" },
    roles: [
      {
        role: "If you participate",
        why: "A share, click or visit should not be turned into a fake ticket.",
        outcome: "See only entries actually issued to your account and the recorded state of each draw.",
        action: "Open PromoShare",
        href: "/promoshare",
      },
      {
        role: "If you supply a reward",
        why: "Selection, claim, distribution and settlement are not the same event.",
        outcome: "Publish only the funded/configured reward and keep every downstream state explicit.",
        action: "Review operator tools",
        href: "/dashboard",
      },
      {
        role: "If you sponsor",
        why: "A campaign should not promise rewards from unrecorded engagement.",
        outcome: "Tie eligibility to recorded actions and inspect issuance/settlement rather than assumed reach.",
        action: "See brand tools",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "An eligible action is verified", text: "Only a configured recorded rule may issue an entry." },
      { label: "02", title: "The entry belongs to a named draw", text: "The entry itself is not the prize." },
      { label: "03", title: "A result is recorded", text: "Selected does not mean claimed, distributed or settled." },
      { label: "04", title: "Downstream state stays explicit", text: "Claim and settlement are shown only when those records exist." },
    ],
    tagline: "Entry ≠ win ≠ claim ≠ distribution ≠ settlement.",
  },
  "save-and-win": {
    eyebrow: "Save & Win",
    headline: "Parked principal, draw eligibility and settlement are separate states.",
    subhead:
      "Save & Win can associate parked Gems with named draw eligibility under the recorded pot terms. A draw result does not change the ownership or settlement state of principal by implication, and withdrawal follows the Wallet/pot rules that are actually recorded.",
    inPlainEnglish:
      "Read the pot terms, your parked amount, your recorded entries and any result separately. Do not treat selection as settlement or assume an instant exit.",
    primaryCta: { label: "Open Save & Win", href: "/save-and-win" },
    secondaryCta: { label: "Review PromoShare", href: "/promoshare" },
    roles: [
      {
        role: "If you park Gems",
        why: "Your principal state and your chance in a draw should never be collapsed.",
        outcome: "See the parked balance, issued entries, named draw and any settlement state separately.",
        action: "Open Save & Win",
        href: "/save-and-win",
      },
      {
        role: "If you operate a pot",
        why: "A prize promise needs recorded funding and a clear exit/settlement path.",
        outcome: "Keep funding, entry issuance, draw result and settlement auditable.",
        action: "Review operator tools",
        href: "/dashboard",
      },
      {
        role: "If you sponsor",
        why: "A funded prize still needs a real claim/distribution lifecycle.",
        outcome: "Inspect the recorded result and settlement path rather than treating selection as delivery.",
        action: "See brand tools",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "Park", title: "Principal is recorded", text: "The pot records the amount and applicable exit terms." },
      { label: "Entries", title: "Eligibility is issued separately", text: "Only recorded entries participate in a named draw." },
      { label: "Result", title: "Selection is recorded", text: "A selected result is not yet a distributed or settled reward." },
      { label: "Exit", title: "Principal follows recorded terms", text: "Return or withdrawal is shown only when the corresponding state changes." },
    ],
    tagline: "Principal ≠ entry ≠ selected result ≠ settled reward.",
  },
  network: {
    eyebrow: "Going out with your people",
    headline: "Bring friends. Everyone earns more.",
    subhead:
      "When your crew checks in together, you get a Points boost and climb local boards. Venues fill bigger tables. You get better nights.",
    inPlainEnglish: "Going out as a group should be more rewarding than going alone. That is it.",
    primaryCta: { label: "See community nights", href: "/for-communities" },
    secondaryCta: { label: "Rally your crew", href: "/explore/moments" },
    roles: [
      {
        role: "If you go with friends",
        why: "The table of four should beat the solo walk-in, for everyone.",
        outcome: "Check in with three or more people for a Points boost and a shot at reserved tables.",
        action: "Find a night for your crew",
        href: "/explore/moments",
      },
      {
        role: "If you run a venue",
        why: "Bigger tables are better nights.",
        outcome: "Reward groups that arrive together with upgrades and bonus Points.",
        action: "Set crew perks",
        href: "/for-communities",
      },
      {
        role: "If you run a brand",
        why: "Friends telling friends still beats another ad.",
        outcome: "Sponsor crew boards so neighborhoods compete to show up for you.",
        action: "Sponsor a crew board",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Form a crew", text: "Link friends into a neighborhood group." },
      { label: "02", title: "Check in together", text: "Arrive in the same window to trigger the group boost." },
      { label: "03", title: "Climb the board", text: "Neighborhood crews compete for monthly table priority." },
      { label: "04", title: "Get the better table", text: "Standing as a group unlocks the nights that fill up first." },
    ],
    tagline: "Culture is co-created. Bring your friends.",
  },
  sustainability: {
    eyebrow: "Value provenance",
    headline: "PROMORANG should say where value came from and what state it is in.",
    subhead:
      "Reward allocation, merchant proceeds, platform fees, pending earnings and settled value are different accounting meanings. The product should keep those records distinct and should not describe an allocation as funded, protected or settled unless the supporting record exists.",
    inPlainEnglish:
      "A label in the interface is not proof that money is legally segregated. What PROMORANG can defend is the recorded source, status and consequence of value inside the platform.",
    primaryCta: { label: "Review Wallet records", href: "/wallet" },
    secondaryCta: { label: "See partner terms", href: "/pricing" },
    roles: [
      {
        role: "If you receive value",
        why: "Pending, issued and settled should not look like the same money.",
        outcome: "See the source and current state rather than a broad promise that every allocation is already protected cash.",
        action: "Open Wallet",
        href: "/wallet",
      },
      {
        role: "If you sell",
        why: "A recorded purchase is not automatically fulfilled or settled.",
        outcome: "Follow purchase, fulfillment and settlement as separate records.",
        action: "Review merchant tools",
        href: "/dashboard",
      },
      {
        role: "If you sponsor",
        why: "Configured budget is not the same as issued or settled reward value.",
        outcome: "Use source records to see what was funded, what was earned, and what remains pending.",
        action: "Review brand tools",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Record the source", text: "Purchase, sponsor funding, reward allocation and platform fee should retain provenance." },
      { label: "02", title: "Keep lifecycle state", text: "Configured, funded, earned, issued, pending and settled are not synonyms." },
      { label: "03", title: "Show the consequence", text: "The product should say what actually moved and what is still waiting." },
      { label: "04", title: "Do not overclaim custody", text: "Operational or legal segregation is not inferred from an interface category." },
    ],
    tagline: "Provenance and lifecycle first. Financial guarantees require evidence.",
  },
};

function PromoCardDemo};

function PromoCardDemo() {
  const [applied, setApplied] = useState(false);
  return (
    <div className="space-y-4">
      <PromoCardFace
        model={{
          state: applied ? "used" : "ready",
          holder: "Maya · East Austin",
          headline: applied ? "Just used" : "Show this",
          detail: "Velvet Lounge tasting",
          places: "Velvet Lounge",
          action: applied ? "Come back for the next one" : "Show the merchant this QR",
          footerCue: applied ? "Punched. The next benefit is a new claim." : "Nothing is used until they validate it",
          issuer: "Velvet Lounge",
          issuerInitial: "V",
          credential: applied ? null : "VL-TASTE",
          canFlip: !applied,
        }}
      />
      {applied ? (
        <PromorangValidReceipt title="Velvet Lounge tasting" reference="VL-TASTE" nextBenefit="Next Friday’s tasting" />
      ) : (
        <PaperReceipt
          heading="Hold at the door"
          lines={[
            { label: "Perk", value: "Velvet Lounge tasting" },
            { label: "Code", value: "VL-TASTE" },
            { label: "Status", value: "Not used until they validate it", strong: true },
          ]}
          footer="Not a prepaid balance. A merchant has to record this."
        />
      )}
      <TactileButton variant={applied ? "success" : "vault"} size="lg" fullWidth onClick={() => setApplied((v) => !v)}>
        {applied ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Reset demo
          </>
        ) : (
          "Merchant records VALID"
        )}
      </TactileButton>
      <p className="sr-only" aria-live="polite">
        {applied ? "Merchant recorded VALID. The perk is used." : "PromoCard ready to show. Not used yet."}
      </p>
    </div>
  );
}

function MomentDemo() {
  const [inRoom, setInRoom] = useState(false);
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-white/12 bg-[#14110e]">
      <div className="relative aspect-[16/10] bg-[radial-gradient(circle_at_30%_20%,rgba(255,113,16,0.35),transparent_42%),#1a1410]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#14110e] via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusChip ok={inRoom}>{inRoom ? "You're in" : "Tonight · Austin"}</StatusChip>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="flex items-center gap-1.5 text-xs text-amber-200">
            <MapPin className="h-3.5 w-3.5" /> Velvet Lounge
          </p>
          <h3 className="mt-1 font-serif text-2xl font-bold text-white">Midnight jazz tasting</h3>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-sm leading-6 text-zinc-300">
          This illustration shows a possible in-room proof state. It is not live attendance or inventory.
        </p>
        <TactileButton variant={inRoom ? "success" : "primary"} size="lg" fullWidth onClick={() => setInRoom((v) => !v)}>
          {inRoom ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Example verified state
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4" /> Scan as if you are there
            </>
          )}
        </TactileButton>
        <p className="sr-only" aria-live="polite">
          {inRoom ? "Check-in recorded." : "Not checked in yet."}
        </p>
      </div>
    </div>
  );
}

function PointsDemo() {
  const [points, setPoints] = useState(1450);
  const [keys, setKeys] = useState(2);
  const canConvert = points >= 500;
  return (
    <div className="space-y-4">
      <article className="rounded-[1.6rem] border border-amber-400/25 bg-[linear-gradient(180deg,#2a1d0e,#120e0a)] p-5">
        <p className="text-[11px] font-bold tracking-[0.16em] text-amber-300">Season punch card</p>
        <div className="mt-4 flex gap-2" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className={`h-8 w-8 rounded-full border ${i < 6 ? "border-amber-300 bg-amber-400/80" : "border-white/15 bg-black/30"}`}
            />
          ))}
        </div>
        <p className="mt-4 font-serif text-3xl font-bold text-amber-100">{points.toLocaleString()} Points</p>
        <p className="mt-1 text-sm text-white/60">{keys} Keys ready · 500 Points makes 1 Key</p>
      </article>
      <TactileButton
        variant="vault"
        size="lg"
        fullWidth
        disabled={!canConvert}
        onClick={() => {
          if (!canConvert) return;
          setPoints((p) => p - 500);
          setKeys((k) => k + 1);
        }}
      >
        <KeyRound className="h-4 w-4" /> Turn 500 Points into 1 Key
      </TactileButton>
      <p className="sr-only" aria-live="polite">
        {points} points and {keys} keys.
      </p>
    </div>
  );
}

function KeysDemo() {
  const [used, setUsed] = useState(false);
  return (
    <div className="space-y-4">
      <TicketPass
        kicker={used ? "Opened" : "1 Key required"}
        title="VIP tasting pass"
        detail={used ? "Show this at the door. Your Key is spent." : "Illustrative opportunity · availability would come from the live source."}
        stub={used ? "OPEN" : "KEY"}
        stubLabel={used ? "Used" : "Hold"}
      />
      <TactileButton variant={used ? "success" : "primary"} size="lg" fullWidth onClick={() => setUsed((v) => !v)}>
        {used ? "Pass is yours" : "Use 1 Key"}
      </TactileButton>
      <p className="sr-only" aria-live="polite">
        {used ? "Key used. Pass unlocked." : "Key not used yet."}
      </p>
    </div>
  );
}

function MasterKeyDemo() {
  const [proofs, setProofs] = useState(1);
  const need = 2;
  const on = proofs >= need;
  return (
    <article className="rounded-[1.7rem] border border-amber-400/30 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_46%),#120e0a] p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black">
          <Flame className="h-6 w-6" />
        </div>
        <StatusChip ok={on}>{on ? "Master Key on" : `${proofs} of ${need} Proofs`}</StatusChip>
      </div>
      <h3 className="mt-5 font-serif text-2xl font-bold text-white">{on ? "Today's gate is open" : "Do today's free Proofs"}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        {on
          ? "Professional member. Two verified free Proofs done. PromoKeys can now be spent on funded work."
          : "Points cannot buy this. Finish the remaining Proof and the Master Key turns on until reset."}
      </p>
      <div className="mt-5">
        <TactileButton variant="vault" size="lg" fullWidth onClick={() => setProofs((n) => (n >= need ? 1 : n + 1))}>
          {on ? "Reset the day" : "Complete a Proof"}
        </TactileButton>
      </div>
      <p className="sr-only" aria-live="polite">
        {on ? "Master Key is on." : "Master Key is off."}
      </p>
    </article>
  );
}

function GemsDemo() {
  const [step, setStep] = useState<"buy" | "earn" | "spend">("buy");
  const receipt =
    step === "buy"
      ? { heading: "Illustrative Gem purchase", lines: [{ label: "Purchase price", value: "$25.00" }, { label: "Example credited amount", value: "25 Gems", strong: true }], footer: "Purchase pricing does not make every Gem immediately withdrawable cash." }
      : step === "earn"
        ? { heading: "Illustrative funded outcome", lines: [{ label: "Eligibility", value: "Would require a recorded rule" }, { label: "Issuance", value: "Shown only after the ledger records it", strong: true }], footer: "Configured reward ≠ earned ≠ issued ≠ settled." }
        : { heading: "Illustrative Gem use", lines: [{ label: "Spend", value: "Only where a live product accepts Gems" }, { label: "PromoShare", value: "Entry only if an eligibility rule issues one", strong: true }], footer: "No bonus, ticket, or financial consequence is assumed from a Gem spend." };
  return (
    <div className="space-y-4">
      <PaperReceipt heading={receipt.heading} lines={receipt.lines} footer={receipt.footer} />
      <div className="grid grid-cols-3 gap-2">
        {(["buy", "earn", "spend"] as const).map((key) => (
          <TactileButton key={key} variant={step === key ? "primary" : "obsidian"} size="sm" fullWidth onClick={() => setStep(key)}>
            {key === "buy" ? "Buy" : key === "earn" ? "Earn" : "Spend"}
          </TactileButton>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing the {step} path for Gems.
      </p>
    </div>
  );
}

function HeroObject({ concept }: { concept: ConceptKey }) {
  switch (concept) {
    case "moments":
      return <MomentDemo />;
    case "points":
      return <PointsDemo />;
    case "keys":
      return <KeysDemo />;
    case "master-key":
      return <MasterKeyDemo />;
    case "gems":
      return <GemsDemo />;
    case "promoshare":
      return (
        <TicketPass
          kicker="Friday 8pm perk draw"
          title="Austin weekend Key"
          detail="Illustrative entry. A real entry, draw and prize would come from the recorded PromoShare cycle."
          stub="PS"
          stubLabel="Draw"
        />
      );
    case "save-and-win":
      return (
        <PaperReceipt
          heading="Local perks pot"
          lines={[
            { label: "Parked principal", value: "Illustrative", strong: true },
            { label: "Entries", value: "Only when recorded" },
            { label: "Result", value: "Separate from settlement" },
          ]}
          footer="A real pot's exit, draw and settlement terms come from its recorded state."
        />
      );
    case "pieces":
      return (
        <CollectibleRelic
          serial="Piece 042 of 100"
          title="Neon Nights 2026"
          origin="Claimed at the launch gala. Proof you were in the room."
          perk="No benefit is inferred from holding quantity. Check the source record for any real entitlement."
        />
      );
    case "content":
      return (
        <TicketPass
          kicker="Illustrative creator opportunity"
          title="15-second cocktail recap"
          detail="A real opportunity must state its recorded objective and value terms. Opening it is not acceptance or settlement."
          stub="OPEN"
          stubLabel="Example"
        />
      );
    case "network":
      return (
        <article className="rounded-[1.7rem] border border-white/12 bg-[#12151c] p-6">
          <p className="text-[11px] font-bold tracking-[0.16em] text-sky-300">Downtown crew</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-white">Illustrative crew state</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-300">A real crew benefit would require a recorded rule; no fixed attendance or Points bonus is implied here.</p>
          <div className="mt-4 flex -space-x-2">
            {["AM", "SJ", "KL", "MR"].map((n) => (
              <span key={n} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#12151c] bg-sky-600 text-[11px] font-bold text-white">
                {n}
              </span>
            ))}
          </div>
        </article>
      );
    case "sustainability":
      return (
        <PaperReceipt
          heading="Value-state example"
          lines={[
            { label: "Funding", value: "Needs a source record", strong: true },
            { label: "Earning", value: "Separate lifecycle state" },
            { label: "Settlement", value: "Shown only when recorded" },
          ]}
          footer="Interface categories do not by themselves prove legal custody or fund segregation."
        />
      );
    case "promocard":
    case "overview":
    default:
      return <PromoCardDemo />;
  }
}

export default function EconomyConcept() {
  const { t } = useI18n();
  const { concept } = useParams();
  const [searchParams] = useSearchParams();
  const conceptKey = resolveConceptKey(concept);
  const data = conceptData[conceptKey] ?? conceptData.overview;
  const roleHint = searchParams.get("role");
  const shopRoleIndex = data.roles.findIndex((role) => /shop|venue|merchant/i.test(role.role));
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  useEffect(() => {
    setSelectedRoleIndex(roleHint === "merchant" && shopRoleIndex >= 0 ? shopRoleIndex : 0);
  }, [conceptKey, roleHint, shopRoleIndex]);

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <SEO title={`${data.headline} · Promorang`} description={data.inPlainEnglish} />

      <section className="relative overflow-hidden border-b border-white/10 bg-[#120e0b] pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(255,113,16,0.2),transparent_36%)]" />
        <div className="container relative z-10 px-6">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-primary">{data.eyebrow}</p>
              <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                {data.headline}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 md:text-lg">{data.subhead}</p>
              <div className="mt-6 max-w-xl">
                <PlainEnglish>{data.inPlainEnglish}</PlainEnglish>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <TactileButton variant="primary" size="xl" asChild>
                  <Link to={data.primaryCta.href}>
                    {data.primaryCta.label}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </TactileButton>
                <TactileButton variant="obsidian" size="xl" asChild>
                  <Link to={data.secondaryCta.href}>{data.secondaryCta.label}</Link>
                </TactileButton>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Illustration only · does not read or change your account</p>
              <HeroObject concept={conceptKey} />
            </div>
          </div>
        </div>
      </section>

      <nav aria-label={t("economy.navOverview")} className="sticky top-16 z-30 border-b border-white/10 bg-[#090909]/95 backdrop-blur-md">
        <div className="container px-6">
          <div className="flex gap-2 overflow-x-auto py-3 pr-scroll-rail">
            {navigationLinks.map((item) => {
              const isActive = conceptKey === item.slug;
              return (
                <Link
                  key={item.slug}
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "bg-primary text-black"
                      : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white"
                  }`}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {conceptKey === "overview" || !concept ? (
        <section id="one-night" className="scroll-mt-32 border-b border-white/10 bg-[#0c0b0a] py-16 md:py-24">
          <div className="container px-6">
            <NightTrail
              eyebrow="One night"
              title="Follow Maya from the door to the receipt"
              steps={[
                { label: "Arrive", title: "She finds a tasting nearby", text: "Velvet Lounge is hosting a Moment. The perk is a drink pass if she checks in." },
                { label: "Scan", title: "She is actually there", text: "The live code only works in the room, so the pass goes to Maya — not a bot." },
                { label: "Show", title: "She flips the PromoCard", text: "The tasting is on the face. The code is on the back. Nothing is used until staff records VALID." },
                { label: "Keep", title: "The Return is eligibility", text: "The visit is stamped. The next benefit is a new claim — not a fake refill." },
              ]}
            />
          </div>
        </section>
      ) : null}

      {conceptKey === "overview" ? (
        <section className="border-b border-white/10 bg-[#0b0a09] py-16 md:py-24">
          <div className="container px-6">
            <WhatIsWhatMap homeLink={false} />
          </div>
        </section>
      ) : null}

      <section className="border-b border-white/10 bg-[#0a0a0a] py-16 md:py-24">
        <div className="container px-6">
          <p className="text-xs font-bold tracking-[0.2em] text-primary">{t("economy.quickGuide")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{t("economy.eachItemMeans")}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">
            {t("economy.eachItemCopy")}
          </p>
          <div className="mt-8">
            <ObjectShelf items={objectShelf.map((item) => ({ ...item, active: item.href.endsWith(`/${conceptKey}`) || (conceptKey === "overview" && item.href.endsWith("/promocard")) }))} />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0c0c0c] py-16 md:py-24">
        <div className="container px-6">
          <p className="text-xs font-bold tracking-[0.2em] text-primary">{t("economy.chooseView")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{t("economy.doesForYou")}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">
            {t("economy.pickOption")}
          </p>
          <div className="mt-8">
            <RoleLens roles={data.roles} selectedIndex={selectedRoleIndex} onSelect={setSelectedRoleIndex} />
          </div>
        </div>
      </section>

      <section id="how-value-moves" className="scroll-mt-32 border-b border-white/10 bg-[#070707] py-16 md:py-24">
        <div className="container px-6">
          <NightTrail eyebrow={t("economy.stepByStep")} title={t("economy.howValueMoves")} steps={data.steps} />
          <p className="mt-12 text-center font-serif text-lg italic text-zinc-300">{data.tagline}</p>
        </div>
      </section>

      <section id="three-ledgers" className="border-b border-white/10 bg-[#0a0a0a] py-16 md:py-24">
        <div className="container px-6">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-400">Value truth boundary</p>
          <h2 className="mt-2 max-w-3xl font-serif text-3xl font-bold md:text-4xl">Configured, funded, earned, issued, pending and settled are different states.</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
            PROMORANG should preserve the source and lifecycle of value without turning interface categories into a custody or financial guarantee. A reward is called funded only when a funding record supports it; a balance is called settled only when settlement is recorded.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Source", "Where did the value come from — purchase, sponsor funding, earned consequence, refund, or another recorded source?"],
              ["State", "Is it configured, funded, earned, issued, pending, available, secured, reversed, or settled?"],
              ["Consequence", "What actually moved, what is still waiting, and which source record proves it?"],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">{label}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-black">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-6 font-serif text-3xl font-bold md:text-5xl">{t("economy.ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            {t("economy.ctaCopy")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TactileButton variant="primary" size="xl" asChild>
              <Link to="/explore/moments">
                Find a Moment
                <ArrowRight className="h-5 w-5" />
              </Link>
            </TactileButton>
            <TactileButton variant="obsidian" size="xl" asChild>
              <Link to="/nodes">See Save & Win pots</Link>
            </TactileButton>
          </div>
        </div>
      </section>
    </div>
  );
}
