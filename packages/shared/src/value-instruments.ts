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

export type ValueLayerId = "everyday" | "value" | "access" | "chances";

export type PromoShareDrawFamilyId = "perk" | "save-and-win";

export type PromoShareDrawFamily = {
  id: PromoShareDrawFamilyId;
  name: string;
  pays: string;
  doesNotPay: string;
  howYouEnter: string;
};

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
export const PROMOSHARE_DRAW_FAMILIES: Record<PromoShareDrawFamilyId, PromoShareDrawFamily> = {
  perk: {
    id: "perk",
    name: "Perk draws",
    pays: "A published Key, access pass, partner perk, product, or Piece. The ticket names the draw, and the draw names that prize.",
    doesNotPay: "Cash or extra Gems you can withdraw.",
    howYouEnter: "Show up, share, or finish a mission the draw lists. Those tickets are for perk draws.",
  },
  "save-and-win": {
    id: "save-and-win",
    name: "Save & Win",
    pays: "Extra Gems. 1 Gem = $1. That is PromoShare's money draw. A win is more Gems on top of what you parked.",
    doesNotPay: "A chance to lose the Gems you set aside. Those stay yours until you take them out.",
    howYouEnter: "Park Gems in a Save & Win pot. While they sit, you collect tickets for that pot's weekly and monthly draws.",
  },
};

export const VALUE_STORY = {
  loop:
    "PromoCard is what you use. Points prove you showed up. Gems are the money. Pieces are keepsakes. Keys open doors. PromoShare tickets are chances in a named draw that already says the prize. Save & Win is the PromoShare family that pays extra Gems.",
  gemsPay: `1 Gem = ${GEM_USD} USD of platform value. Gems pay. Points do not. Keys do not.`,
  gemsBuyBenefits:
    "Buying and spending Gems is better than paying cash outside Promorang. Gem spend can unlock Pieces, Save & Win tickets, standing, and partner perks that a card swipe outside the app cannot.",
  gemsEarn:
    "Gems are not only bought. Funded missions, completed Moments, membership allowances, and Save & Win winnings can pay Gems. Holding Gems still earns nothing. Using or parking them is what opens extras.",
  keysUnlock:
    `Points come from showing up, answering, or using a perk. ${POINTS_PER_KEY} Points become 1 PromoKey — a pass for a limited funded night or drop. Funded work itself lives on Earn.`,
  ticketsChance:
    "A PromoShare ticket is a chance in one named draw. The draw publishes the prize before anyone enters. Perk draws pay Keys, access, or a partner perk. Save & Win is the family that pays extra Gems. A ticket is not a guarantee.",
  namedDrawPays:
    "Read the ticket. Perk draws pay Keys, access, or a perk already set aside. Save & Win pays extra Gems. Everyday PromoShare does not print cash.",
  saveAndWin:
    "Save & Win is PromoShare's money draw. Park Gems, keep 100% of them, and compete for extra Gems. Take your parked Gems out whenever you want. A win is winnings — not a way to lose the pot.",
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
    label: "PromoShare — what you can win",
    meaning: "A ticket is a chance. The named draw says the prize. Perk draws pay Keys and access. Save & Win is the family that pays extra Gems.",
    instrumentIds: ["promoshare-tickets", "save-and-win"],
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
      "Earn Gems from funded missions, completed Moments, membership allowances, or Save & Win winnings.",
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
    is: "Scarce access. Convert Points, earn a milestone, or win a perk draw.",
    isNot: "Not payment. Not the daily Master Key. Not a prize by itself.",
    getIt: [
      `Convert ${POINTS_PER_KEY} Points into 1 PromoKey (up to ${MAX_DAILY_KEYS} a day).`,
      "Verified milestones, perk draws, or a disclosed membership allowance.",
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
    job: "Create a chance in a named draw that already says what you can win.",
    like: "A raffle ticket that names the pot — and the prize — it belongs to.",
    is: "An entry for one named draw. The draw publishes the prize. More eligible tickets improve odds.",
    isNot: "Not Points, not Gems, not a guarantee, and not a mystery prize.",
    getIt: [
      "Perk-draw tickets: check in, share, or finish a mission the draw lists.",
      "Save & Win tickets: park Gems in that pot. One action can also count for today's, this week's, and a grand draw when the rules say so.",
    ],
    useIt: [
      "Perk draws pay a Key, access, partner perk, product, or Piece already set aside.",
      "Save & Win draws pay extra Gems. Everyday tickets do not print cash.",
    ],
    marketKnows: VALUE_STORY.namedDrawPays,
    href: "/economy/promoshare",
    shelfUse: "The ticket names the draw. The draw names the prize.",
  },
  "save-and-win": {
    id: "save-and-win",
    name: "Save & Win",
    layer: "chances",
    job: "PromoShare's money draw: park Gems, keep them, and compete for extra Gems.",
    like: "Money in a jar that also buys raffle tickets. The jar is still yours. A win adds more Gems to the jar.",
    is: "The no-loss PromoShare family that pays money. You keep 100% of parked Gems. Winnings are extra Gems (1 Gem = $1).",
    isNot: "Not a perk draw, not investing, and not a way to lose what you parked.",
    getIt: [
      "Move Gems into a Save & Win pot. Membership can multiply tickets.",
      "Take the parked Gems back out whenever you want.",
    ],
    useIt: [
      "Stay in that pot's weekly and monthly money draws.",
      "If you win, extra Gems land on top. If you do not, your parked Gems are still there.",
    ],
    marketKnows: VALUE_STORY.saveAndWin,
    href: "/economy/save-and-win",
    shelfUse: "The PromoShare family that pays extra Gems.",
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
