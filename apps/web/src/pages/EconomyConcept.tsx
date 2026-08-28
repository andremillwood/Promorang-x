import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  MoneyPots,
  NightTrail,
  ObjectShelf,
  PaperReceipt,
  PlainEnglish,
  PromoCardFace,
  RoleLens,
  StatusChip,
  TicketPass,
} from "@/components/promorang/SignatureObjects";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

type ConceptKey =
  | "overview"
  | "moments"
  | "points"
  | "keys"
  | "master-key"
  | "promocard"
  | "pieces"
  | "content"
  | "promoshare-gems"
  | "network"
  | "sustainability";

const navigationLinks: Array<{ label: TranslationKey; slug: string; path: string }> = [
  { label: "economy.navOverview", slug: "overview", path: "/economy" },
  { label: "economy.navMoments", slug: "moments", path: "/economy/moments" },
  { label: "economy.navPoints", slug: "points", path: "/economy/points" },
  { label: "economy.navKeys", slug: "keys", path: "/economy/keys" },
  { label: "economy.navMasterKey", slug: "master-key", path: "/economy/master-key" },
  { label: "economy.navPromoCard", slug: "promocard", path: "/economy/promocard" },
  { label: "economy.navPieces", slug: "pieces", path: "/economy/pieces" },
  { label: "economy.navContent", slug: "content", path: "/economy/content" },
  { label: "economy.navGems", slug: "promoshare-gems", path: "/economy/promoshare-gems" },
  { label: "economy.navCrews", slug: "network", path: "/economy/network" },
  { label: "economy.navMoney", slug: "sustainability", path: "/economy/sustainability" },
];

const objectShelf = [
  { href: "/economy/promocard", name: "PromoCard", like: "A local gift card you can refill.", use: "Comes off the bill at partner shops." },
  { href: "/economy/points", name: "Points", like: "A punch card for showing up.", use: "500 Points can become 1 Key." },
  { href: "/economy/keys", name: "Keys", like: "A ticket you earn, not buy.", use: "Opens a limited prize or VIP table." },
  { href: "/economy/master-key", name: "Daily streak", like: "One real action keeps it on for 24 hours.", use: "Can boost what you earn that day." },
  { href: "/economy/pieces", name: "Pieces", like: "A concert poster you can still use.", use: "Keep for perks, or pass it on later." },
  { href: "/economy/promoshare-gems", name: "Gems", like: "Store credit a brand already paid for.", use: "Redeem for perks, products, or eligible cash." },
];

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
    headline: "Show up. Save at checkout. Get more back.",
    subhead:
      "Promorang is a local rewards loop. You use a PromoCard at participating shops, then refill it by checking in, bringing friends, or completing a small mission.",
    inPlainEnglish:
      "Go to a real place. Save a few dollars on the bill. Earn more savings by coming back — not by decoding a second currency.",
    primaryCta: { label: "See one night, step by step", href: "#one-night" },
    secondaryCta: { label: "Get a PromoCard", href: "/auth?mode=signup" },
    roles: [
      {
        role: "If you go out",
        why: "Your time out should turn into something you can actually use.",
        outcome: "Save at partner shops, build a streak, and unlock limited nights without paying to skip the line.",
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
        outcome: "Fund visits, purchases, and creator work, then see proof of what happened. Prize money is set aside first.",
        action: "See options for brands",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "Tonight", title: "A place puts up an offer", text: "A shop or sponsor decides what you can save, and on which purchases." },
      { label: "Checkout", title: "You use the card", text: "Available PromoCard value comes off an eligible bill. You pay the rest as usual." },
      { label: "After", title: "Showing up refills it", text: "A check-in, review, or share can restore value for the next visit." },
      { label: "Later", title: "Extras open up", text: "Points, Keys, streaks, and Gems are the extras — not the starting point." },
    ],
    tagline: "Useful at the register. Earned by being there.",
  },
  promocard: {
    eyebrow: "Your everyday savings card",
    headline: "PromoCard is the savings you can see on the bill.",
    subhead:
      "Eligible members get a card with a clear dollar amount. At participating shops, that amount comes off. You pay the rest. Showing up can refill it.",
    inPlainEnglish: "Think of it as a local gift card. The shop decides how much you can save. You pay the rest. Coming back can fill it up again.",
    primaryCta: { label: "Get your PromoCard", href: "/auth?mode=signup" },
    secondaryCta: { label: "Partner with us", href: "/for-merchants" },
    roles: [
      {
        role: "If you go out",
        why: "You should not need a glossary to spend a reward.",
        outcome: "Apply the card at checkout, pay the remainder, and see the saving on a normal receipt.",
        action: "Get your card",
        href: "/auth?mode=signup",
      },
      {
        role: "If you run a shop",
        why: "Blanket discounts eat margin without proving a new customer walked in.",
        outcome: "Set the allowance, a minimum basket, and a per-person cap. Then see the visits it actually produced.",
        action: "Set shop terms",
        href: "/for-merchants",
      },
      {
        role: "If you fund it",
        why: "Reach is not the same as someone buying something nearby.",
        outcome: "Fund refills or partner offers, then follow the path from check-in to a real purchase.",
        action: "Explore partner options",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Get the card", text: "An eligible account gets a PromoCard with a visible spending limit." },
      { label: "02", title: "Use it at checkout", text: "Available value lowers an eligible partner bill. You pay the rest." },
      { label: "03", title: "Refill by showing up", text: "Eligible check-ins, reviews, and shares can restore value for next time." },
      { label: "04", title: "See it on the receipt", text: "The saving is recorded. It is promotional value, not a bank account." },
    ],
    tagline: "Useful to you. Controlled by the shop. Measurable for partners.",
  },
  moments: {
    eyebrow: "Real nights, real places",
    headline: "Moments are the tastings, drops, and nights you actually go to.",
    subhead:
      "A Moment is something happening in a real place. Checking in proves you were there, so rewards go to people in the room — not someone on the couch.",
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
      { label: "02", title: "You arrive", text: "Scan the live code while you are actually there." },
      { label: "03", title: "It counts", text: "Points, perks, or a card refill can land once the visit is confirmed." },
      { label: "04", title: "It stays on your profile", text: "The night becomes part of your history — you were there." },
    ],
    tagline: "Moments matter because real life happens offline.",
  },
  points: {
    eyebrow: "Your score for showing up",
    headline: "Points remember that you showed up.",
    subhead:
      "You earn Points by checking in, completing missions, and bringing friends. You cannot buy or sell them. Seasons reset so last year does not lock everyone else out.",
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
      { label: "01", title: "Do something real", text: "Check in, finish a mission, or bring a friend." },
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
      "Turn 500 Points into 1 PromoKey. Use it for a prize, a VIP table, or a limited drop. You can earn up to three Keys a day. When you use one, it is gone.",
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
      { label: "03", title: "Pick an offer", text: "A prize draw, VIP table, or exclusive mission." },
      { label: "04", title: "Use it", text: "The Key is spent. Access is yours." },
    ],
    tagline: "Keys open the city for people who actually show up.",
  },
  "master-key": {
    eyebrow: "Your daily streak",
    headline: "Do one real thing today and keep the streak going.",
    subhead:
      "Check in, leave a review, or finish a small action. The daily streak stays on for 24 hours. Keep it active and you can earn more Points and enter daily prize draws.",
    inPlainEnglish: "It is a daily stamp, not a lockout. One honest action keeps the door open.",
    primaryCta: { label: "Check your streak", href: "/activity" },
    secondaryCta: { label: "Do one thing today", href: "/explore/moments" },
    roles: [
      {
        role: "If you go out",
        why: "A small habit should make the rest of the week nicer, not stressful.",
        outcome: "Keep the streak on with one action. Active streaks can boost Points and daily draws.",
        action: "Activate today's streak",
        href: "/explore/moments",
      },
      {
        role: "If you run a shop",
        why: "Tuesdays and Wednesdays need a reason to visit.",
        outcome: "Become a check-in spot for neighborhood regulars who want to keep a streak alive.",
        action: "Register your place",
        href: "/create/moment",
      },
      {
        role: "If you sponsor daily perks",
        why: "One-week campaigns spike, then disappear.",
        outcome: "Fund a daily perk for people who actually did something today.",
        action: "Sponsor a daily drop",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Do one thing", text: "Check in, review, or complete a short mission." },
      { label: "02", title: "Streak stays on", text: "You have 24 hours before it needs another action." },
      { label: "03", title: "Earn a little more", text: "Active streaks can boost Points and daily prize access." },
      { label: "04", title: "Miss a day? Start again", text: "No punishment theater. Just come back." },
    ],
    tagline: "One small action every day keeps the extras open.",
  },
  pieces: {
    eyebrow: "Keepsakes with perks",
    headline: "Pieces are limited mementos from nights worth remembering.",
    subhead:
      "When a big event happens, a small number of Pieces can be claimed. Hold one for skip-the-line perks, or pass it on later. Hosts still earn a little whenever it changes hands.",
    inPlainEnglish: "Like a limited poster from a night you were at — except this one can still get you in faster next year.",
    primaryCta: { label: "Browse Pieces", href: "/marketplace" },
    secondaryCta: { label: "Issue event Pieces", href: "/create/moment" },
    roles: [
      {
        role: "If you collect",
        why: "Tickets expire. The night should not vanish with them.",
        outcome: "Hold a Piece for venue perks, or trade it later if you are done with it.",
        action: "Open the marketplace",
        href: "/marketplace",
      },
      {
        role: "If you host",
        why: "A sold-out night should keep giving after the lights come up.",
        outcome: "Issue a small run. You still receive a cut if a Piece is resold.",
        action: "Mint an event collection",
        href: "/create/moment",
      },
      {
        role: "If you collaborate",
        why: "Brand merch often has no life after the drop.",
        outcome: "Co-create a Piece tied to a real night, with a product or perk still attached.",
        action: "Co-create a collection",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "A host issues a small run", text: "Fixed number, clear perks, and a cut for the host if it is resold." },
      { label: "02", title: "Early guests claim", text: "People who were actually there can pick one up." },
      { label: "03", title: "Hold for perks", text: "Skip a line, get a yearly discount, or keep it as a memory." },
      { label: "04", title: "Or pass it on", text: "A 1% fee applies if it is resold. The host still shares in that." },
    ],
    tagline: "Do not just witness a night. Keep a piece of it.",
  },
  content: {
    eyebrow: "Paid creator missions",
    headline: "Make a video that actually brings people through the door.",
    subhead:
      "A brand posts a short brief and sets the payout aside first. You visit, film, and submit. Once the visit is confirmed, you get paid in Gems.",
    inPlainEnglish: "You get paid for real content at a real place. The money is waiting before you start.",
    primaryCta: { label: "Browse missions", href: "/missions" },
    secondaryCta: { label: "Post a mission", href: "/for-brands" },
    roles: [
      {
        role: "If you create",
        why: "You should not wait on an agency to get paid for local work.",
        outcome: "Pick a brief, show up, submit proof, and receive Gems when it checks out.",
        action: "Find open missions",
        href: "/missions",
      },
      {
        role: "If you run a venue",
        why: "You want authentic clips from inside the room, not stock footage.",
        outcome: "Put up a Gem bounty for a cocktail recap or vibe video and watch local feeds fill.",
        action: "Create a venue mission",
        href: "/create/moment",
      },
      {
        role: "If you run a brand",
        why: "Follower counts are a weak substitute for foot traffic.",
        outcome: "Pay creators for verified visits, with the payout sitting aside until the work is real.",
        action: "Launch a creator campaign",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "The brief is funded", text: "The brand writes what they need and sets Gems aside." },
      { label: "02", title: "You go and film", text: "Visit the place, make the piece, upload it in the app." },
      { label: "03", title: "It gets checked", text: "Place, time, and the ask are confirmed." },
      { label: "04", title: "You get paid", text: "Gems move to you from the money that was already set aside." },
    ],
    tagline: "Content that brings people together in the real world.",
  },
  "promoshare-gems": {
    eyebrow: "Rewards already paid for",
    headline: "Gems and tickets are prizes a sponsor already funded.",
    subhead:
      "Before a prize is offered, the brand sets the money aside. PromoShare tickets are entries in a fair draw. Gems can be redeemed for products, perks, or eligible cash.",
    inPlainEnglish: "Nothing is printed out of thin air. If you can win it, someone already paid for it.",
    primaryCta: { label: "See live draws", href: "/promoshare" },
    secondaryCta: { label: "Fund a prize pot", href: "/for-brands" },
    roles: [
      {
        role: "If you play along",
        why: "Rewards should be redeemable, not theoretical.",
        outcome: "Collect tickets for draws and redeem Gems for real products and perks.",
        action: "View PromoShare draws",
        href: "/promoshare",
      },
      {
        role: "If you host a night",
        why: "A mid-event draw keeps people in the room.",
        outcome: "Run a live ticket draw that is already funded, so the prize is real.",
        action: "Host a draw",
        href: "/create/moment",
      },
      {
        role: "If you sponsor",
        why: "You want every prize dollar to stay a prize dollar.",
        outcome: "Deposit the pot first. Get a clear record of what was given out.",
        action: "Fund a brand pot",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "A sponsor funds it", text: "The prize money is set aside before anyone can win." },
      { label: "02", title: "You earn a ticket or Gems", text: "Verified actions issue entries and reward units." },
      { label: "03", title: "A fair draw happens", text: "Winners are selected in a way that can be checked." },
      { label: "04", title: "You redeem", text: "Gems become products, perks, or eligible cash." },
    ],
    tagline: "Honest rewards backed by real sponsors.",
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
    eyebrow: "How money is kept safe",
    headline: "Prize money is set aside before anyone can win it.",
    subhead:
      "Sponsor rewards, shop earnings, and Promorang's fee live in three separate pots. Prize money is not mixed with money used to run the app.",
    inPlainEnglish: "Promorang cannot dip into the prize pot to pay the lights. Those are different piles of money.",
    primaryCta: { label: "See plans and pricing", href: "/pricing" },
    secondaryCta: { label: "Talk with the team", href: "/for-brands" },
    roles: [
      {
        role: "If you win rewards",
        why: "You need to know the prize is real before you bother.",
        outcome: "Reward budgets sit aside in advance. They are not operating cash.",
        action: "Read how funds stay separate",
        href: "/pricing",
      },
      {
        role: "If you run a shop",
        why: "Ticket and sales money should not wait on platform bookkeeping.",
        outcome: "Your proceeds settle on their own path, with fees shown separately.",
        action: "View commercial terms",
        href: "/pricing",
      },
      {
        role: "If you sponsor",
        why: "You should see that promotional dollars reached real people.",
        outcome: "Each committed dollar has a path you can inspect.",
        action: "Explore brand hub",
        href: "/for-brands",
      },
    ],
    steps: [
      { label: "01", title: "Money arrives into a labeled pot", text: "Sponsor funds go to rewards. Shop sales go to the shop." },
      { label: "02", title: "A real action releases it", text: "A visit or completed mission is what moves rewards." },
      { label: "03", title: "Fees stay visible", text: "Promorang's cut is a published software fee, recorded on its own." },
      { label: "04", title: "Nothing is mixed", text: "Three pots. Three jobs. No blending." },
    ],
    tagline: "Trust first. Then the extras.",
  },
};

function PromoCardDemo() {
  const [applied, setApplied] = useState(false);
  return (
    <div className="space-y-4">
      <PromoCardFace available={applied ? "$16.00" : "$24.00"} holder="Maya · East Austin" />
      <PaperReceipt
        heading={applied ? "Velvet Lounge" : "Ready at checkout"}
        lines={
          applied
            ? [
                { label: "Tasting flight", value: "$24.00" },
                { label: "PromoCard", value: "−$8.00", strong: true },
                { label: "You pay", value: "$16.00", strong: true },
              ]
            : [
                { label: "Tonight's bill", value: "$24.00" },
                { label: "Card ready", value: "$8.00 off" },
                { label: "You would pay", value: "$16.00" },
              ]
        }
        footer={applied ? "Saved $8. Check in to refill." : "Not a bank card. Just savings at partners."}
      />
      <TactileButton variant={applied ? "success" : "vault"} size="lg" fullWidth onClick={() => setApplied((v) => !v)}>
        {applied ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Saved on the bill
          </>
        ) : (
          "Apply $8 at checkout"
        )}
      </TactileButton>
      <p className="sr-only" aria-live="polite">
        {applied ? "PromoCard applied. You pay 16 dollars." : "PromoCard not yet applied."}
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
          Arrive, scan the live code, and the drink pass is yours. 142 people already checked in.
        </p>
        <TactileButton variant={inRoom ? "success" : "primary"} size="lg" fullWidth onClick={() => setInRoom((v) => !v)}>
          {inRoom ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Checked in · +150 Points
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
        detail={used ? "Show this at the door. Your Key is spent." : "Artisan Distillers · 8 seats left tonight."}
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

function StreakDemo() {
  const [on, setOn] = useState(true);
  return (
    <article className="rounded-[1.7rem] border border-amber-400/30 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_46%),#120e0a] p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-black">
          <Flame className="h-6 w-6" />
        </div>
        <StatusChip ok={on}>{on ? "On · 14h left" : "Off · do one thing"}</StatusChip>
      </div>
      <h3 className="mt-5 font-serif text-2xl font-bold text-white">{on ? "6-day streak" : "Streak paused"}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        {on ? "Daily prize access is open. Points can get a 1.5× bump." : "Check in, review, or finish a short mission to start again."}
      </p>
      <div className="mt-5">
        <TactileButton variant="vault" size="lg" fullWidth onClick={() => setOn((v) => !v)}>
          {on ? "Skip a day" : "Do today's action"}
        </TactileButton>
      </div>
      <p className="sr-only" aria-live="polite">
        {on ? "Streak is on." : "Streak is off."}
      </p>
    </article>
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
      return <StreakDemo />;
    case "pieces":
      return (
        <CollectibleRelic
          serial="Piece 042 of 100"
          title="Neon Nights 2026"
          origin="Claimed at the launch gala. Proof you were in the room."
          perk="Holders skip the partner line and keep a 15% host perk."
        />
      );
    case "content":
      return (
        <TicketPass
          kicker="Open mission · 120 Gems"
          title="15-second cocktail recap"
          detail="Film the seasonal drink at Velvet Lounge. Payout is already set aside."
          stub="120"
          stubLabel="Gems"
        />
      );
    case "promoshare-gems":
      return (
        <TicketPass
          kicker="Friday 8pm draw"
          title="Austin weekend pot"
          detail="Ticket PS-88219. The $500 prize is already funded."
          stub="PS"
          stubLabel="Draw"
        />
      );
    case "network":
      return (
        <article className="rounded-[1.7rem] border border-white/12 bg-[#12151c] p-6">
          <p className="text-[11px] font-bold tracking-[0.16em] text-sky-300">Downtown crew</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-white">4 of 5 checked in</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-300">Arrive together and everyone gets a +50% Points bump.</p>
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
          heading="Three separate pots"
          lines={[
            { label: "Prize money", value: "Set aside", strong: true },
            { label: "Shop earnings", value: "Goes to the shop" },
            { label: "Promorang fee", value: "Published, separate" },
          ]}
          footer="Prize money is not operating cash."
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
  const conceptKey = (concept ?? "overview") as ConceptKey;
  const data = conceptData[conceptKey] ?? conceptData.overview;
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  useEffect(() => {
    setSelectedRoleIndex(0);
  }, [conceptKey]);

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
            <HeroObject concept={conceptData[conceptKey] ? conceptKey : "overview"} />
          </div>
        </div>
      </section>

      <nav aria-label={t("economy.navOverview")} className="sticky top-16 z-30 border-b border-white/10 bg-[#090909]/95 backdrop-blur-md">
        <div className="container px-6">
          <div className="flex gap-2 overflow-x-auto py-3 pr-scroll-rail">
            {navigationLinks.map((item) => {
              const isActive = (conceptKey === "overview" && item.slug === "overview") || conceptKey === item.slug;
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
                { label: "Pay", title: "PromoCard takes $8 off", text: "The flight is $24. Her card covers $8. She pays $16 like anyone else." },
                { label: "Keep", title: "The night refills the card", text: "The check-in restores value for next time, and 500 Points can become a Key." },
              ]}
            />
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
            <ObjectShelf items={objectShelf.map((item) => ({ ...item, active: item.href.endsWith(conceptKey) }))} />
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
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-emerald-400">{t("economy.fundsProtected")}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{t("economy.rewardSeparate")}</h2>
              <p className="mt-4 text-base leading-7 text-zinc-300">
                {t("economy.rewardSeparateCopy")}
              </p>
              <div className="mt-6">
                <TactileButton variant="primary" size="lg" asChild>
                  <Link to="/pricing">
                    {t("economy.viewPlans")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </TactileButton>
              </div>
            </div>
            <MoneyPots
              pots={[
                { label: t("economy.boundaryRevenue"), detail: t("economy.boundaryRevenueDetail"), mark: t("economy.keptSeparate") },
                { label: t("economy.boundaryCommitted"), detail: t("economy.boundaryCommittedDetail"), mark: t("economy.keptSeparate") },
                { label: t("economy.boundaryOperator"), detail: t("economy.boundaryOperatorDetail"), mark: t("economy.keptSeparate") },
              ]}
            />
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
