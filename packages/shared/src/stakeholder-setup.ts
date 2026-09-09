/**
 * First-hour setup: the how, not just renamed labels.
 *
 * Role changes tone and supply. The live loop is still:
 * someone puts a real benefit up → someone shares it →
 * a person claims it on PromoCard → use is recorded
 * (scan, code, delivery, or credit).
 *
 * Drafts, flash toasts, and unfunded campaigns do not count.
 */

import { normalizeStakeholderRole, type StakeholderNavRole } from "./stakeholder-lens";

export type StakeholderSetupStep = {
  id: string;
  label: string;
  href: string;
  youPutIn: string;
  othersDo: string;
  youGet: string;
};

export type StakeholderSetupPlaybook = {
  role: StakeholderNavRole;
  kicker: string;
  title: string;
  why: string;
  steps: StakeholderSetupStep[];
};

export type StakeholderHowSurface = "stock" | "campaign" | "earn" | "drops" | "venue" | "give";

export type StakeholderHowLead = {
  eyebrow: string;
  title: string;
  body: string;
  nextHref?: string;
  nextLabel?: string;
};

const MERCHANT_SETUP: StakeholderSetupPlaybook = {
  role: "merchant",
  kicker: "How to set up",
  title: "Venue, then inventory, then the counter",
  why: "The place is optional context. The perk is what people can use. The scan is what finishes the loop.",
  steps: [
    {
      id: "add-venue",
      label: "Add the venue",
      href: "/dashboard/venues/add",
      youPutIn: "Name and address of the place people show up.",
      othersDo: "Hosts can attach gatherings. Members see where to go.",
      youGet: "A place the perk can be used. Skip if you already have one.",
    },
    {
      id: "put-perk-up",
      label: "Put one perk up",
      href: "/stock",
      youPutIn: "A real benefit: tasting, 2-for-1, first drink — not a draft.",
      othersDo: "Creators take it. Hosts attach it. Members claim it onto PromoCard.",
      youGet: "Live inventory other people can move.",
    },
    {
      id: "share-perk",
      label: "Share the live drop",
      href: "/give",
      youPutIn: "A drop link for the room, a host, or a creator.",
      othersDo: "People claim it and bring the card to the counter.",
      youGet: "Distribution without inventing a second campaign.",
    },
    {
      id: "validate",
      label: "Validate at the counter",
      href: "/staff/scanner",
      youPutIn: "Scan or enter the code when they use it.",
      othersDo: "The claim becomes recorded use.",
      youGet: "Attributable spend. Creators and hosts get paid.",
    },
  ],
};

const BRAND_SETUP: StakeholderSetupPlaybook = {
  role: "brand",
  kicker: "How to deploy",
  title: "Fund a real perk, then fly the campaign",
  why: "A campaign without inventory is a draft. Pay on recorded use — a scan, a code, a delivery, or a credit — not impressions.",
  steps: [
    {
      id: "fund-perk",
      label: "Fund a real benefit",
      href: "/stock",
      youPutIn: "A place pass, a shippable drop, a code, or a credit. Not only a counter scan.",
      othersDo: "Creators share. Members claim. Fulfillment follows the journey you chose.",
      youGet: "A live perk, not a slogan.",
    },
    {
      id: "launch-campaign",
      label: "Launch the campaign flight",
      href: "/create/campaign",
      youPutIn: "Who, where, and what counts as a qualified action.",
      othersDo: "The benefit still has to be claimed and used.",
      youGet: "A flight that can be funded against recorded use.",
    },
    {
      id: "see-movers",
      label: "See who can move it",
      href: "/earn",
      youPutIn: "Confirm creators can take the opportunity.",
      othersDo: "Creators drop it. Participants claim it.",
      youGet: "Distribution attached to a real benefit.",
    },
    {
      id: "watch-attributed",
      label: "Watch attributed use",
      href: "/happened",
      youPutIn: "Nothing until someone uses it.",
      othersDo: "The merchant validates the code.",
      youGet: "Pay on recorded use.",
    },
  ],
};

const CREATOR_SETUP: StakeholderSetupPlaybook = {
  role: "creator",
  kicker: "How to put content up",
  title: "Publish a Release, then attach a room or perk",
  why: "A song or story is origin. Other people catch it. A share tap is not the payday.",
  steps: [
    {
      id: "publish-drop",
      label: "Publish a Release",
      href: "/content-drops",
      youPutIn: "The original — song, news, episode, video — plus a Promorang title.",
      othersDo: "People open the original. Hosts and brands can attach.",
      youGet: "A live Release, not a mission gig.",
    },
    {
      id: "attach-perk",
      label: "Attach a room or perk",
      href: "/give",
      youPutIn: "A gathering or a funded benefit the Release opens.",
      othersDo: "Members claim or RSVP. That is the consequence.",
      youGet: "Pay after claim, RSVP, check-in, or delivery — not after Shared.",
    },
    {
      id: "take-perk",
      label: "Or take a live perk to move",
      href: "/earn",
      youPutIn: "Inventory a merchant or brand already opened.",
      othersDo: "Your people claim it on PromoCard.",
      youGet: "Distribution labor, if that is the job tonight.",
    },
    {
      id: "see-card",
      label: "See what they carry",
      href: "/card",
      youPutIn: "Confirm the perk or pass landed on PromoCard.",
      othersDo: "They use it the way it was issued.",
      youGet: "Proof the Release reached a person.",
    },
  ],
};

const HOST_SETUP: StakeholderSetupPlaybook = {
  role: "host",
  kicker: "How to set up tonight",
  title: "Gathering first, then a live perk at the door",
  why: "Publishing the night is not the finish. Attach a perk a merchant already put up, then send them to the scanner.",
  steps: [
    {
      id: "create-moment",
      label: "Create tonight’s gathering",
      href: "/create/moment",
      youPutIn: "When, where, and why people should leave home.",
      othersDo: "Guests see it in World and can RSVP.",
      youGet: "A room the perk can be used in.",
    },
    {
      id: "attach-perk",
      label: "Attach a live perk",
      href: "/give",
      youPutIn: "A merchant perk as the door pass — not a typed reward.",
      othersDo: "Guests claim it onto PromoCard.",
      youGet: "A reason to show up that the merchant can honor.",
    },
    {
      id: "send-merchant",
      label: "Send the merchant to validate",
      href: "/staff/scanner",
      youPutIn: "The merchant records the code. You do not simulate it.",
      othersDo: "Arrivals become recorded use.",
      youGet: "Who showed up, and what they used.",
    },
  ],
};

const PARTICIPANT_SETUP: StakeholderSetupPlaybook = {
  role: "participant",
  kicker: "Start here",
  title: "Three steps",
  why: "A perk is a real offer a business put up. Your card stays empty until you pick one, or until a business puts one up. Crews, guilds, and scenes are optional later.",
  steps: [
    {
      id: "see-world",
      label: "Browse live perks",
      href: "/discover?tab=perks",
      youPutIn: "Open the list of offers businesses already posted.",
      othersDo: "A business has to put the offer up. You do not invent it.",
      youGet: "Something you can actually take to a door.",
    },
    {
      id: "claim",
      label: "Put one on your card",
      href: "/discover?tab=perks",
      youPutIn: "Claim a live perk. Polls are optional city votes, not the only way in.",
      othersDo: "The business still has to honor it at the counter.",
      youGet: "A pass you can show.",
    },
    {
      id: "use-card",
      label: "Show it at the door",
      href: "/card",
      youPutIn: "Open PromoCard when you arrive.",
      othersDo: "The business scans or checks the code.",
      youGet: "The offer, if they confirm it.",
    },
  ],
};

const AGENCY_SETUP: StakeholderSetupPlaybook = {
  role: "agency",
  kicker: "How to run a client",
  title: "Client benefit, then the first recorded result",
  why: "Launch still needs inventory someone can claim and a merchant can validate.",
  steps: [
    {
      id: "launch-client",
      label: "Launch the client benefit",
      href: "/create/campaign",
      youPutIn: "The client outcome and the flight.",
      othersDo: "The benefit still has to be real inventory.",
      youGet: "A client loop you can prove.",
    },
    {
      id: "fund-perk",
      label: "Put the benefit up",
      href: "/stock",
      youPutIn: "Inventory a merchant can validate.",
      othersDo: "Creators share. Members claim.",
      youGet: "Supply the campaign can actually move.",
    },
    {
      id: "watch-results",
      label: "Watch recorded results",
      href: "/happened",
      youPutIn: "Nothing until someone uses it.",
      othersDo: "The merchant validates.",
      youGet: "Proof you can take back to the client.",
    },
  ],
};

const PROMOTER_SETUP: StakeholderSetupPlaybook = {
  role: "promoter",
  kicker: "How to move it",
  title: "Hand out a drop that already exists",
  why: "Attribution follows the use, not the share.",
  steps: [
    {
      id: "take-or-share",
      label: "Take a live drop",
      href: "/earn",
      youPutIn: "A perk a merchant or brand already opened.",
      othersDo: "Your people claim it.",
      youGet: "A drop you can move.",
    },
    {
      id: "share",
      label: "Hand it out",
      href: "/give",
      youPutIn: "The live link.",
      othersDo: "Members claim. Merchant validates.",
      youGet: "Pay after recorded use.",
    },
  ],
};

const MARKETING_SETUP: StakeholderSetupPlaybook = {
  ...BRAND_SETUP,
  role: "marketing",
  title: "Put distribution behind a real benefit",
};

const ADMIN_SETUP: StakeholderSetupPlaybook = {
  role: "admin",
  kicker: "How to keep it trusted",
  title: "Watch supply, proof, and payout",
  why: "The loop is only honest if inventory, validation, and return stay connected.",
  steps: [
    {
      id: "command",
      label: "Open command",
      href: "/admin?tab=command",
      youPutIn: "Attention on supply and proof health.",
      othersDo: "Operators put inventory up and validate.",
      youGet: "Where the loop is breaking.",
    },
  ],
};

const SETUPS: Record<StakeholderNavRole, StakeholderSetupPlaybook> = {
  participant: PARTICIPANT_SETUP,
  creator: CREATOR_SETUP,
  host: HOST_SETUP,
  merchant: MERCHANT_SETUP,
  brand: BRAND_SETUP,
  agency: AGENCY_SETUP,
  promoter: PROMOTER_SETUP,
  marketing: MARKETING_SETUP,
  admin: ADMIN_SETUP,
};

export function getStakeholderSetup(role?: string | null): StakeholderSetupPlaybook {
  return SETUPS[normalizeStakeholderRole(role)];
}

const HOW_LEADS: Record<StakeholderHowSurface, (role: StakeholderNavRole) => StakeholderHowLead> = {
  venue: (role) =>
    role === "merchant" || role === "host"
      ? {
          eyebrow: "The place",
          title: "Register where people will use the perk",
          body: "A venue is the room. Next you put inventory up so someone can claim a real benefit.",
          nextHref: "/stock",
          nextLabel: "After this, put a perk up",
        }
      : {
          eyebrow: "The place",
          title: "A venue is where the benefit gets used",
          body: "Hosts and merchants attach gatherings and perks here. The loop still needs live inventory.",
          nextHref: "/stock",
          nextLabel: "Put a perk up",
        },
  stock: (role) => {
    if (role === "brand" || role === "marketing") {
      return {
        eyebrow: "Fund",
        title: "This is the benefit the campaign will fly",
        body: "A campaign without this is a draft. Choose place, ship, code, or credit — then pay when that journey finishes.",
        nextHref: "/create/campaign",
        nextLabel: "Then launch the campaign",
      };
    }
    if (role === "agency") {
      return {
        eyebrow: "Client supply",
        title: "Put the client benefit up as real inventory",
        body: "Creators can share it and members can claim it only after this is live.",
        nextHref: "/create/campaign",
        nextLabel: "Launch the client flight",
      };
    }
    return {
      eyebrow: "Inventory",
      title: "What can people get from you tonight?",
      body: "This becomes an opportunity. Other people move it. You finish the loop at the scanner.",
      nextHref: "/dashboard/venues/add",
      nextLabel: "Don’t have a place yet? Add the venue",
    };
  },
  campaign: (role) => ({
    eyebrow: role === "agency" ? "Client flight" : "Campaign",
    title: "The flight still needs a live perk",
    body: "Choose the outcome and what counts. Then fund inventory on Put up so a merchant can validate use.",
    nextHref: "/stock",
    nextLabel: "Fund the real benefit first",
  }),
  earn: (role) => {
    if (role === "creator" || role === "promoter") {
      return {
        eyebrow: "Take, don’t invent",
        title: "Share a perk that already exists",
        body: "If you are moving someone else’s inventory, take it here. To put your own song or story up, publish a Release first.",
        nextHref: "/content-drops",
        nextLabel: "Publish a Release",
      };
    }
    if (role === "brand" || role === "marketing" || role === "agency") {
      return {
        eyebrow: "Who can move it",
        title: "Creators take the opportunity you funded",
        body: "If nothing is here, fund a perk first. A campaign draft will not show up as something to take.",
        nextHref: "/stock",
        nextLabel: "Fund a benefit",
      };
    }
    return {
      eyebrow: "Earn",
      title: "Paid work and live offers",
      body: "Funded work is a paid gig a brand or house posted. If you only want something to use tonight, browse live perks instead — that is the card, not this page.",
      nextHref: "/discover?tab=perks",
      nextLabel: "Browse live perks",
    };
  },
  drops: (role) => ({
    eyebrow: role === "brand" || role === "agency" ? "Sponsor" : "Content drop",
    title:
      role === "brand" || role === "agency"
        ? "Sponsor a Release people can open, then catch"
        : "Put the original up, then attach a room or perk",
    body: "A Release is origin. Pair it with a live perk or a gathering. Opening the original starts the loop. Sharing is not the payday.",
    nextHref: "/give",
    nextLabel: "Attach a room or perk",
  }),
  give: (role) => {
    if (role === "host") {
      return {
        eyebrow: "Door pass",
        title: "Attach a live perk to the gathering",
        body: "Pick inventory a merchant already put up. A typed reward the counter cannot honor does not count.",
        nextHref: "/stock",
        nextLabel: "Need inventory? Send the merchant to Put up",
      };
    }
    if (role === "creator" || role === "promoter") {
      return {
        eyebrow: "Share",
        title: "Hand out a drop that already exists",
        body: "If the list is empty, take an opportunity first. You get paid after the scan.",
        nextHref: "/earn",
        nextLabel: "Take a live perk",
      };
    }
    return {
      eyebrow: "Share",
      title: "Drop a live perk onto PromoCards",
      body: "People claim it. The merchant validates. That is the completion.",
      nextHref: "/stock",
      nextLabel: "Nothing to share? Put a perk up",
    };
  },
};

export function getStakeholderHowLead(role: string | null | undefined, surface: StakeholderHowSurface): StakeholderHowLead {
  return HOW_LEADS[surface](normalizeStakeholderRole(role));
}
