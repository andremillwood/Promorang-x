/** Canonical FlashCreate Cook Shop offer ladder and 15-week Creative Cook Shop season. */

export const FLASHCREATE_ORIGIN = "https://flashcreate.co";

export const COOK_SHOP_BRAND = {
  serviceName: "The Customer Cook Shop",
  seasonName: "The Creative Cook Shop",
  host: "FlashCreate",
  tagline: "Stop Chasing Attention. Start Cooking Up Customers.",
} as const;

export type CookShopOfferId =
  | "acquisition_webinar"
  | "season_pass"
  | "core_300"
  | "retainer"
  | "grand_slam";

export type CookShopAccessLevel = "none" | "acquisition" | "season" | "kitchen";

export type CookShopWeek = {
  week: number;
  date: string;
  title: string;
  subtitle?: string;
};

export const CREATIVE_COOK_SHOP_SEASON = {
  id: "creative-cook-shop-2026",
  year: 2026,
  startDate: "2026-09-08",
  endDate: "2026-12-15",
  weekday: "Tuesday",
  startTime: "18:30",
  endTime: "19:30",
  timeZone: "America/New_York",
  timeLabel: "6:30 – 7:30 PM Eastern Time",
  platform: "Live on Zoom",
  publicPath: "/flashcreate/creative-cook-shop",
  flashcreateUrl: `${FLASHCREATE_ORIGIN}/creative-cook-shop`,
  acquisitionWebinarUrl: `${FLASHCREATE_ORIGIN}/webinar`,
  cookShopUrl: `${FLASHCREATE_ORIGIN}/cook-shop`,
  coreOfferUrl: `${FLASHCREATE_ORIGIN}/cook-shop-a`,
} as const;

export const CREATIVE_COOK_SHOP_WEEKS: readonly CookShopWeek[] = [
  {
    week: 1,
    date: "2026-09-08",
    title: "Welcome to the Creative Cook Shop",
    subtitle: "Stop Chasing Attention. Start Cooking Up Customers.",
  },
  { week: 2, date: "2026-09-15", title: "Who Are You Cooking For?", subtitle: "Finding Your Real Customer" },
  { week: 3, date: "2026-09-22", title: "What's on Your Menu?", subtitle: "Building an Offer People Actually Want" },
  { week: 4, date: "2026-09-29", title: "Make Them Smell It", subtitle: "Content That Gets Attention" },
  { week: 5, date: "2026-10-06", title: "The AI Sous-Chef", subtitle: "How AI Can Help You Market Smarter" },
  { week: 6, date: "2026-10-13", title: "From Window-Shopper to Customer", subtitle: "Building Your Marketing Funnel" },
  { week: 7, date: "2026-10-20", title: "The Social Media Kitchen", subtitle: "Turning Followers Into Customers" },
  { week: 8, date: "2026-10-27", title: "What's Your Secret Sauce?", subtitle: "Building a Brand People Remember" },
  { week: 9, date: "2026-11-03", title: "The Customer Keeps Coming Back", subtitle: "Retention & Relationship Marketing" },
  { week: 10, date: "2026-11-10", title: "Cook-Off", subtitle: "Build Your Customer Acquisition Recipe" },
  { week: 11, date: "2026-11-17", title: "The Marketing Grocery List", subtitle: "What Do You Really Need?" },
  { week: 12, date: "2026-11-24", title: "Pay to Play", subtitle: "Understanding Paid Advertising" },
  { week: 13, date: "2026-12-01", title: "The Power of the Follow-Up", subtitle: "Don't Let Customers Walk Away" },
  { week: 14, date: "2026-12-08", title: "Cook With the Community", subtitle: "Partnerships, PR & Word-of-Mouth" },
  { week: 15, date: "2026-12-15", title: "The Ultimate Cook-Off", subtitle: "Build Your 2027 Customer Acquisition Plan" },
];

export type CookShopOffer = {
  id: CookShopOfferId;
  sku: string;
  name: string;
  job: string;
  priceUsd: number;
  priceJmd?: number;
  billing: "free" | "one_time" | "monthly";
  access: CookShopAccessLevel;
  includesSeason: boolean;
  public: boolean;
  destination: string;
};

export const COOK_SHOP_OFFERS: readonly CookShopOffer[] = [
  {
    id: "acquisition_webinar",
    sku: "FC-COOKSHOP-WEBINAR",
    name: "Why Funnels Fail & How to Build a Customer Machine",
    job: "Client acquisition. Evergreen weekly teardown. Not the 15-week season.",
    priceUsd: 0,
    billing: "free",
    access: "acquisition",
    includesSeason: false,
    public: true,
    destination: CREATIVE_COOK_SHOP_SEASON.acquisitionWebinarUrl,
  },
  {
    id: "season_pass",
    sku: "FC-COOKSHOP-SEASON-30",
    name: "Creative Cook Shop Season Pass",
    job: "Tripwire. $30 credits toward Core, retainer, or Grand Slam within 14 days.",
    priceUsd: 30,
    billing: "one_time",
    access: "season",
    includesSeason: true,
    public: true,
    destination: CREATIVE_COOK_SHOP_SEASON.publicPath,
  },
  {
    id: "core_300",
    sku: "FC-COOKSHOP-300",
    name: "$300 Core Campaign Offer",
    job: "One offer, one ad, one sales page. Does not include the season.",
    priceUsd: 300,
    billing: "one_time",
    access: "none",
    includesSeason: false,
    public: true,
    destination: CREATIVE_COOK_SHOP_SEASON.coreOfferUrl,
  },
  {
    id: "retainer",
    sku: "FC-COOKSHOP-RETAINER",
    name: "Customer Cook Shop Retainer",
    job: "Ongoing kitchen. Season is included at $0.",
    priceUsd: 190,
    priceJmd: 30000,
    billing: "monthly",
    access: "kitchen",
    includesSeason: true,
    public: true,
    destination: CREATIVE_COOK_SHOP_SEASON.publicPath,
  },
  {
    id: "grand_slam",
    sku: "FC-COOKSHOP-GRANDSLAM",
    name: "Grand Slam Complete System",
    job: "Done-for-you campaign system. Season is included at $0.",
    priceUsd: 11500,
    billing: "one_time",
    access: "kitchen",
    includesSeason: true,
    public: true,
    destination: CREATIVE_COOK_SHOP_SEASON.coreOfferUrl,
  },
] as const;

export const SEASON_PASS_CREDIT_USD = 30;
export const SEASON_PASS_CREDIT_DAYS = 14;

export function cookShopOffer(id: CookShopOfferId): CookShopOffer {
  const offer = COOK_SHOP_OFFERS.find((item) => item.id === id);
  if (!offer) throw new Error(`Unknown Cook Shop offer: ${id}`);
  return offer;
}

export function seasonIncludedWith(id: CookShopOfferId): boolean {
  return cookShopOffer(id).includesSeason;
}

export function seasonPassCreditsToward(id: CookShopOfferId): number {
  if (id === "core_300" || id === "retainer" || id === "grand_slam") return SEASON_PASS_CREDIT_USD;
  return 0;
}

export function isAcquisitionWebinar(id: CookShopOfferId): boolean {
  return id === "acquisition_webinar";
}

export function publicSeasonDoors(): CookShopOffer[] {
  return COOK_SHOP_OFFERS.filter((offer) => offer.public && offer.id !== "acquisition_webinar");
}

export function formatWeekDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 16, 30)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: CREATIVE_COOK_SHOP_SEASON.timeZone,
  });
}

export function nextSeasonWeek(now: Date = new Date()): CookShopWeek | null {
  const today = now.toISOString().slice(0, 10);
  return CREATIVE_COOK_SHOP_WEEKS.find((week) => week.date >= today) ?? null;
}

export function seasonIsLive(now: Date = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  return today >= CREATIVE_COOK_SHOP_SEASON.startDate && today <= CREATIVE_COOK_SHOP_SEASON.endDate;
}

export function seasonWeekCount(): number {
  return CREATIVE_COOK_SHOP_WEEKS.length;
}
