export const VALUE_INSTRUMENT_RATES = {
  gemUsd: 1,
  pointsPerKey: 500,
  maxDailyKeys: 3,
  masterKeyProofs: { starter: 5, professional: 2, power_user: 1 },
} as const;

const GEM_USD = VALUE_INSTRUMENT_RATES.gemUsd;
const POINTS_PER_KEY = VALUE_INSTRUMENT_RATES.pointsPerKey;
const MAX_DAILY_KEYS = VALUE_INSTRUMENT_RATES.maxDailyKeys;
const MASTER_KEY_PROOFS = VALUE_INSTRUMENT_RATES.masterKeyProofs;

export type ValueInstrumentId =
  | "promocard"
  | "points"
  | "gems"
  | "pieces"
  | "promokeys"
  | "master-key"
  | "promoshare-tickets"
  | "save-and-win";

export type ValueLayerId = "everyday" | "value" | "access" | "chances" | "parked";

export type ValueInstrument = {
  id: ValueInstrumentId;
  name: string;
  layer: ValueLayerId;
  job: string;
  like: string;
  is: string;
  isNot: string;
  getIt: string[];
  useIt: string[];
  marketKnows: string;
  href: string;
  shelfUse: string;
};

export type ValueLayer = {
  id: ValueLayerId;
  label: string;
  meaning: string;
  instrumentIds: ValueInstrumentId[];
};

/**
 * Canonical public language for what each participant instrument is.
 * Screens should import this instead of inventing a second glossary.
 */
export const VALUE_STORY = {
  loop:
    "PromoCard is what you use. Points prove you showed up. Gems are the money. Pieces are keepsakes you buy or earn with Gems. Keys open scarce doors. Tickets are chances. Save & Win parks Gems without losing them.",
  gemsPay: `1 Gem = ${GEM_USD} USD of platform value. Gems pay. Points do not. Keys do not.`,
  gemsBuyBenefits:
    "Buying and spending Gems is better than paying cash outside Promorang. Gem spend can unlock Pieces, Save & Win tickets, PromoShare entries, standing, and partner perks that a card swipe outside the app cannot.",
  gemsEarn:
    "Gems are not only bought. Funded missions, completed Moments, membership allowances, and funded draws can pay Gems. Holding Gems still earns nothing. Using or parking them is what opens extras.",
  keysUnlock:
    `Points convert to PromoKeys (${POINTS_PER_KEY} Points = 1 Key). The daily Master Key is separate: it proves you contributed enough today. You need both to enter funded work.`,
  ticketsChance:
    "A PromoShare ticket is a chance in a named draw, not a prize and not money. More eligible tickets improve odds. Leaderboard Points stay separate.",
  saveAndWin:
    "Save & Win is the no-loss pot. Park Gems, keep 100% of them, and collect draw tickets while they sit. Take the Gems out whenever you want.",
} as const;

export const VALUE_LAYERS: ValueLayer[] = [
  {
    id: "everyday",
    label: "What you use",
    meaning: "The card that comes off a real bill. Start here. Everything else is extra.",
    instrumentIds: ["promocard"],
  },
  {
    id: "value",
    label: "What you hold",
    meaning: "Three different jobs: a score, money, and a keepsake. Do not mix them up.",
    instrumentIds: ["points", "gems", "pieces"],
  },
  {
    id: "access",
    label: "What opens doors",
    meaning: "Keys ration scarce seats. The Master Key proves you showed up today.",
    instrumentIds: ["promokeys", "master-key"],
  },
  {
    id: "chances",
    label: "What gives you a shot",
    meaning: "Tickets are chances in a named draw. They are not Gems and not a guarantee.",
    instrumentIds: ["promoshare-tickets"],
  },
  {
    id: "parked",
    label: "What you can park",
    meaning: "Set Gems aside, keep them, and stay in the draws. That is Save & Win.",
    instrumentIds: ["save-and-win"],
  },
];

export const VALUE_INSTRUMENTS: Record<ValueInstrumentId, ValueInstrument> = {
  promocard: {
    id: "promocard",
    name: "PromoCard",
    layer: "everyday",
    job: "Show a live perk or savings amount you can use at a partner shop.",
    like: "A local gift card you can refill by showing up.",
    is: "The everyday card. Eligible value comes off a partner bill. You pay the rest.",
    isNot: "Not a bank card, not Points, not Gems, and not a cash account you can withdraw.",
    getIt: [
      "Open an eligible account and claim a live perk.",
      "A shop, brand, or friend can put a benefit on your card.",
      "Verified check-ins, reviews, and shares can refill it.",
    ],
    useIt: [
      "Apply it at checkout at participating shops.",
      "Show the live credential when a perk needs to be scanned.",
    ],
    marketKnows: "If people only remember one object, it should be PromoCard — the thing that works at the register.",
    href: "/economy/promocard",
    shelfUse: "Comes off the bill at partner shops.",
  },
  points: {
    id: "points",
    name: "Points",
    layer: "value",
    job: "Measure useful participation and progress.",
    like: "A punch card for showing up.",
    is: "A seasonal score. You earn it. You cannot buy, sell, or withdraw it.",
    isNot: "Not money. Not Gems. Not a ticket. Not something you cash out.",
    getIt: [
      "Check in, finish a mission, share, or bring a friend.",
      "Higher standing can multiply how many Points an action is worth.",
    ],
    useIt: [
      `Convert ${POINTS_PER_KEY} Points into 1 PromoKey.`,
      "Climb local boards and qualify for limited nights.",
    ],
    marketKnows: "Points prove activity. They never pay a bill.",
    href: "/economy/points",
    shelfUse: `${POINTS_PER_KEY} Points can become 1 Key.`,
  },
  gems: {
    id: "gems",
    name: "Gems",
    layer: "value",
    job: `Represent ${GEM_USD} USD of platform value and pay for things inside Promorang.`,
    like: "Store credit a brand already paid for — or money you put in yourself.",
    is: `1 Gem = ${GEM_USD} USD of platform value. Gems are the spendable money inside Promorang.`,
    isNot: "Not Points, not tickets, not a crypto token, and not a return just for holding them.",
    getIt: [
      "Buy Gems with a card. $1 becomes 1 Gem.",
      "Earn Gems from funded missions, completed Moments, membership allowances, or funded draws.",
    ],
    useIt: [
      "Spend Gems on Pieces, access, tips, boosts, and partner perks.",
      "Park Gems in Save & Win and keep them while you collect tickets.",
      "Eligible earned Gems can be reviewed for cash-out after the published holds.",
    ],
    marketKnows: VALUE_STORY.gemsBuyBenefits,
    href: "/economy/gems",
    shelfUse: "Buy them or earn them. Spend them for extras cash cannot buy.",
  },
  pieces: {
    id: "pieces",
    name: "Pieces",
    layer: "value",
    job: "Keep a limited memento from a night, creator, or place — with perks still attached.",
    like: "A concert poster you can still use next year.",
    is: "A keepsake tied to a real Moment, host, or venue. You buy, earn, or receive them.",
    isNot: "Not Gems, not a stock, and not a guaranteed payout.",
    getIt: [
      "Claim early when you were actually in the room.",
      "Buy with Gems on the marketplace.",
      "Earn a complementary Piece when a campaign says you outperformed.",
    ],
    useIt: [
      "Hold for skip-the-line or partner perks.",
      "Pass it on later. Hosts can still share if it changes hands.",
    ],
    marketKnows: "Pieces are bought and sold with Gems, not with a card swipe outside the app.",
    href: "/economy/pieces",
    shelfUse: "Keep for perks, or pass it on later.",
  },
  promokeys: {
    id: "promokeys",
    name: "PromoKeys",
    layer: "access",
    job: "Ration access to one gated opportunity at a time.",
    like: "A ticket you earn, not buy.",
    is: "Scarce access. Convert Points, earn a milestone, or win a Community Draw.",
    isNot: "Not payment. Not the daily Master Key. Not a prize by itself.",
    getIt: [
      `Convert ${POINTS_PER_KEY} Points into 1 PromoKey (up to ${MAX_DAILY_KEYS} a day).`,
      "Verified milestones, Community Draws, or a disclosed membership allowance.",
    ],
    useIt: [
      "Spend one Key to enter a VIP table, tasting, vault, or limited drop.",
      "A failed or reversed entry follows that opportunity's refund rule.",
    ],
    marketKnows: "Keys unlock. They never pay the bill.",
    href: "/economy/keys",
    shelfUse: "Opens a limited prize or VIP table.",
  },
  "master-key": {
    id: "master-key",
    name: "Master Key",
    layer: "access",
    job: "Prove you completed today's required free contribution before funded doors open.",
    like: "Today's stamp that says you already did the work.",
    is: `A daily gate. Complete your tier's verified free Proofs and it stays on until reset. Starter needs ${MASTER_KEY_PROOFS.starter}, Professional ${MASTER_KEY_PROOFS.professional}, Power User ${MASTER_KEY_PROOFS.power_user}.`,
    isNot: "Not a streak badge, not a Point purchase, and not a stack of PromoKeys.",
    getIt: [
      "Finish today's required verified free Proofs. Activation is automatic.",
      "Upgrading lowers how many Proofs you need. Every level still contributes.",
    ],
    useIt: [
      "Enter funded or premium opportunities that require today's Master Key.",
      "Spend PromoKeys only after the Master Key is on, when the opportunity asks for both.",
    ],
    marketKnows: "Owning PromoKeys does not skip the Master Key. One answers “did you contribute today?” The other answers “how many doors may you open?”",
    href: "/economy/master-key",
    shelfUse: "Today's proof that funded doors can open.",
  },
  "promoshare-tickets": {
    id: "promoshare-tickets",
    name: "PromoShare tickets",
    layer: "chances",
    job: "Create a chance in a named draw.",
    like: "A raffle ticket that names the pot it belongs to.",
    is: "An entry for one named draw. More eligible tickets improve odds.",
    isNot: "Not Points, not Gems, not weight, and not a guaranteed prize.",
    getIt: [
      "Do the action the draw lists: check-in, share, mission, or parked Save & Win Gems.",
      "One action can issue tickets for today's draw, this week's draw, and a grand draw when the rules say so.",
    ],
    useIt: [
      "Wait for that named draw. Winners are selected at random among eligible tickets.",
      "Funded draws pay Gems, products, or perks already set aside. Community Draws pay progression — Points, Keys, or access.",
    ],
    marketKnows: "Tickets are chances. The prize money is set aside before anyone can win.",
    href: "/economy/promoshare",
    shelfUse: "A chance in a named draw — not a prize yet.",
  },
  "save-and-win": {
    id: "save-and-win",
    name: "Save & Win",
    layer: "parked",
    job: "Park Gems, keep them, and collect draw tickets while they sit.",
    like: "Money in a jar that also buys raffle tickets. The jar is still yours.",
    is: "A no-loss pot. You keep 100% of the Gems you park. Tickets are the extra.",
    isNot: "Not investing, not a way to lose your principal, and not a return for merely holding Gems in your wallet.",
    getIt: [
      "Move Gems into a community pot. Membership and streaks can multiply tickets.",
      "Take the Gems back out whenever you want.",
    ],
    useIt: [
      "Stay in weekly and monthly draws while the Gems are parked.",
      "If you win, the prize is extra. If you do not, your Gems are still there.",
    ],
    marketKnows: VALUE_STORY.saveAndWin,
    href: "/economy/save-and-win",
    shelfUse: "Park Gems. Keep them. Collect tickets.",
  },
};

export function getValueInstrument(id: ValueInstrumentId): ValueInstrument {
  return VALUE_INSTRUMENTS[id];
}

export function listValueInstruments(): ValueInstrument[] {
  return VALUE_LAYERS.flatMap((layer) => layer.instrumentIds.map((id) => VALUE_INSTRUMENTS[id]));
}

export function getValueInstrumentsByLayer(): Array<ValueLayer & { instruments: ValueInstrument[] }> {
  return VALUE_LAYERS.map((layer) => ({
    ...layer,
    instruments: layer.instrumentIds.map((id) => VALUE_INSTRUMENTS[id]),
  }));
}

export function describeValueInstrument(id: ValueInstrumentId): string {
  const instrument = VALUE_INSTRUMENTS[id];
  return `${instrument.name}: ${instrument.job} ${instrument.isNot}`;
}
