export type BusinessOutcomeId =
  | "bring-people-in"
  | "try-it"
  | "launch"
  | "move-this"
  | "quiet-period"
  | "bring-back"
  | "learn-demand"
  | "word-of-mouth";

export type BusinessTypeId =
  | "place"
  | "consumer-brand"
  | "online"
  | "event"
  | "service"
  | "other";

export type SuccessActionId =
  | "visits"
  | "purchases"
  | "trials"
  | "registrations"
  | "reservations"
  | "attendance"
  | "reviews"
  | "referrals"
  | "repeat-visits"
  | "other";

export type ProgrammeId =
  | "first-50"
  | "fill-the-room"
  | "try-this"
  | "move-this"
  | "quiet-hours"
  | "bring-them-back"
  | "what-do-they-want"
  | "tell-somebody";

export type ExecutionRailId =
  | "commerce"
  | "offer"
  | "moment"
  | "demand-test"
  | "distribution"
  | "mixed";

export type CommerceSubjectId =
  | "product"
  | "service"
  | "offer"
  | "ticket"
  | "booking"
  | "experience"
  | "other";

export type SellerResponsibilityId =
  | "existing-merchant"
  | "merchant-to-onboard"
  | "current-org-merchant"
  | "undecided";

export type BusinessOutcomeBrief = {
  version: 2;
  id: string;
  createdAt: string;
  outcomeId: BusinessOutcomeId;
  businessType: BusinessTypeId;
  successAction: SuccessActionId;
  target: number | null;
  timeframe: string;
  geography: string;
  audience: string;
  availableValue: string;
  programmeId: ProgrammeId;
  executionRailId: ExecutionRailId;
  commerceSubjectId: CommerceSubjectId | null;
  subjectLabel: string;
  sellerResponsibilityId: SellerResponsibilityId | null;
  commerceSourceId?: string | null;
};

export const BUSINESS_OUTCOME_BRIEF_KEY = "promorang_business_outcome_brief_v2";
const LEGACY_BUSINESS_OUTCOME_BRIEF_KEY = "promorang_business_outcome_brief_v1";

export const BUSINESS_OUTCOMES: Array<{
  id: BusinessOutcomeId;
  title: string;
  short: string;
  description: string;
  suggestedActions: SuccessActionId[];
}> = [
  { id: "bring-people-in", title: "Bring people in", short: "More visits", description: "Create a reason for the right people to visit, reserve, check in or show up.", suggestedActions: ["visits", "reservations", "attendance", "purchases"] },
  { id: "try-it", title: "Get people to try it", short: "Product trial", description: "Put a product, service or experience in front of real people and learn what they do next.", suggestedActions: ["trials", "purchases", "reviews"] },
  { id: "launch", title: "Launch something", short: "Strong start", description: "Give a new product, place, service or experience a measurable first move.", suggestedActions: ["trials", "visits", "purchases", "registrations"] },
  { id: "move-this", title: "Move this", short: "Focused action", description: "Focus attention and customer action around one product, service, offer or priority.", suggestedActions: ["purchases", "trials", "visits"] },
  { id: "quiet-period", title: "Fill a quiet period", short: "Slow-time traffic", description: "Create measurable movement during a day, time or period that needs more business.", suggestedActions: ["visits", "reservations", "purchases"] },
  { id: "bring-back", title: "Bring them back", short: "Repeat business", description: "Give first-time or existing customers a clear reason to return.", suggestedActions: ["repeat-visits", "purchases", "reservations"] },
  { id: "learn-demand", title: "Find out what people want", short: "Demand test", description: "Test interest before committing heavily to stock, spend, production or a launch.", suggestedActions: ["registrations", "trials", "other"] },
  { id: "word-of-mouth", title: "Build word of mouth", short: "Sharing & advocacy", description: "Create a reason for customers, creators or participants to review, refer or share.", suggestedActions: ["reviews", "referrals", "registrations"] },
];

export const BUSINESS_TYPES: Array<{ id: BusinessTypeId; title: string; description: string }> = [
  { id: "place", title: "A place people visit", description: "Restaurant, retail, venue, hospitality or another physical location." },
  { id: "consumer-brand", title: "A product / consumer brand", description: "A brand trying to move trial, purchase, preference or repeat behavior." },
  { id: "online", title: "An online business", description: "A digital product, store or online-first service." },
  { id: "event", title: "An event / experience", description: "Something where attendance, access or participation is the core move." },
  { id: "service", title: "A service business", description: "Bookings, leads, visits, consultations or another service action." },
  { id: "other", title: "Something else", description: "We can still start from the outcome and shape the response around it." },
];

export const SUCCESS_ACTIONS: Array<{ id: SuccessActionId; title: string; unit: string }> = [
  { id: "visits", title: "Validated visits", unit: "visits" },
  { id: "purchases", title: "Recorded purchases", unit: "purchases" },
  { id: "trials", title: "Trials / samples", unit: "trials" },
  { id: "registrations", title: "Registrations / signups", unit: "registrations" },
  { id: "reservations", title: "Reservations / bookings", unit: "reservations" },
  { id: "attendance", title: "Attendance / check-ins", unit: "attendees" },
  { id: "reviews", title: "Reviews / usable feedback", unit: "reviews" },
  { id: "referrals", title: "Referrals", unit: "referrals" },
  { id: "repeat-visits", title: "Repeat visits / return actions", unit: "returns" },
  { id: "other", title: "Another measurable action", unit: "actions" },
];

export const EXECUTION_RAILS: Array<{ id: ExecutionRailId; title: string; description: string; boundary: string }> = [
  { id: "commerce", title: "Commerce", description: "A real product, service, ticket or booking must be available to reserve or buy.", boundary: "Reserved ≠ paid ≠ fulfilled." },
  { id: "offer", title: "Offer / access", description: "A defined customer benefit or access rule needs to open.", boundary: "Offer ≠ claim ≠ redemption ≠ purchase." },
  { id: "moment", title: "Moment / attendance", description: "The response is a time-bound experience people can join or attend.", boundary: "RSVP ≠ attendance." },
  { id: "demand-test", title: "Demand test", description: "The first job is to learn what people want before supply is committed.", boundary: "Interest ≠ supply." },
  { id: "distribution", title: "Distribution / word of mouth", description: "Creators, participants or communities help move attention toward something real.", boundary: "Share or click ≠ attributed outcome." },
  { id: "mixed", title: "Mixed programme", description: "The outcome needs more than one execution rail—for example trial + commerce + creator distribution.", boundary: "Each rail keeps its own authoritative state." },
];

export const COMMERCE_SUBJECTS: Array<{ id: CommerceSubjectId; title: string }> = [
  { id: "product", title: "Product / SKU" },
  { id: "service", title: "Service" },
  { id: "offer", title: "Offer / perk" },
  { id: "ticket", title: "Ticket / pass" },
  { id: "booking", title: "Booking / reservation" },
  { id: "experience", title: "Experience" },
  { id: "other", title: "Something else" },
];

export const SELLER_RESPONSIBILITIES: Array<{ id: SellerResponsibilityId; title: string; description: string }> = [
  { id: "existing-merchant", title: "An existing PROMORANG merchant", description: "A merchant already owns the price, inventory/payment and fulfillment." },
  { id: "merchant-to-onboard", title: "A merchant we need to bring in", description: "The seller exists, but their commerce supply still needs to be represented on PROMORANG." },
  { id: "current-org-merchant", title: "My organization is the seller / fulfiller", description: "This organization is accepting Merchant responsibility for price, stock, payment and fulfillment." },
  { id: "undecided", title: "Not sure yet", description: "Keep seller responsibility unresolved until a real merchant is chosen." },
];

export const PROGRAMMES: Array<{
  id: ProgrammeId;
  title: string;
  promise: string;
  designedFor: string;
  path: string[];
}> = [
  { id: "first-50", title: "First 50", promise: "Create the first measurable customer actions around one clear business goal.", designedFor: "Launches, early tests and businesses that need a concrete first proof point.", path: ["Define one action", "Make a real response available", "Distribute", "Measure what happened"] },
  { id: "fill-the-room", title: "Fill the Room", promise: "Turn relevant interest into attendance, reservations or real arrivals.", designedFor: "Events, venues, restaurants and experiences.", path: ["Read interest", "Open access", "Invite", "Confirm arrivals"] },
  { id: "try-this", title: "Try This", promise: "Get a product or experience into people's hands and learn what follows.", designedFor: "Sampling, product trial, menu items and new services.", path: ["Find the audience", "Make trial fulfillable", "Distribute", "Capture proof"] },
  { id: "move-this", title: "Move This", promise: "Concentrate customer action around one product, service or commercial priority.", designedFor: "Specific SKUs, menu items, offers or services.", path: ["Choose the commercial object", "Confirm seller and availability", "Distribute", "Measure action"] },
  { id: "quiet-hours", title: "Quiet Hours", promise: "Create a reason to visit during a period that needs more movement.", designedFor: "Restaurants, retail, hospitality and local services.", path: ["Choose the window", "Shape the reason", "Reach nearby people", "Validate visits"] },
  { id: "bring-them-back", title: "Bring Them Back", promise: "Turn a first interaction into another meaningful one.", designedFor: "Repeat visits, repeat purchases and relationship-building.", path: ["Identify the first action", "Create return value", "Carry it on PromoCard", "Measure return"] },
  { id: "what-do-they-want", title: "What Do They Want?", promise: "Test interest before committing heavily to the response.", designedFor: "Product decisions, launches, stock, concepts and market discovery.", path: ["Ask", "Gather", "Read the signal", "Decide whether to supply"] },
  { id: "tell-somebody", title: "Tell Somebody", promise: "Give people a reason to review, refer, share or create around something real.", designedFor: "Word of mouth, advocacy, creator participation and referrals.", path: ["Choose the real object", "Create a reason", "Distribute", "Verify attributable action"] },
];

export function getOutcome(id?: string | null) {
  return BUSINESS_OUTCOMES.find((item) => item.id === id) || null;
}
export function getBusinessType(id?: string | null) {
  return BUSINESS_TYPES.find((item) => item.id === id) || null;
}
export function getSuccessAction(id?: string | null) {
  return SUCCESS_ACTIONS.find((item) => item.id === id) || null;
}
export function getProgramme(id?: string | null) {
  return PROGRAMMES.find((item) => item.id === id) || null;
}
export function getExecutionRail(id?: string | null) {
  return EXECUTION_RAILS.find((item) => item.id === id) || null;
}
export function getCommerceSubject(id?: string | null) {
  return COMMERCE_SUBJECTS.find((item) => item.id === id) || null;
}
export function getSellerResponsibility(id?: string | null) {
  return SELLER_RESPONSIBILITIES.find((item) => item.id === id) || null;
}

export function recommendProgramme(outcomeId: BusinessOutcomeId, businessType: BusinessTypeId): ProgrammeId {
  if (outcomeId === "bring-people-in") return businessType === "event" ? "fill-the-room" : "first-50";
  if (outcomeId === "try-it") return "try-this";
  if (outcomeId === "launch") return "first-50";
  if (outcomeId === "move-this") return "move-this";
  if (outcomeId === "quiet-period") return "quiet-hours";
  if (outcomeId === "bring-back") return "bring-them-back";
  if (outcomeId === "learn-demand") return "what-do-they-want";
  return "tell-somebody";
}

export function recommendExecutionRail(outcomeId: BusinessOutcomeId, successAction: SuccessActionId, businessType: BusinessTypeId): ExecutionRailId {
  if (outcomeId === "learn-demand") return "demand-test";
  if (outcomeId === "word-of-mouth" || successAction === "reviews" || successAction === "referrals") return "distribution";
  if (successAction === "purchases") return "commerce";
  if (successAction === "trials") return "mixed";
  if (successAction === "attendance") return "moment";
  if (successAction === "reservations") return businessType === "event" ? "moment" : "commerce";
  if (successAction === "visits" || successAction === "repeat-visits") return "offer";
  if (outcomeId === "launch") return "mixed";
  return "distribution";
}

export function roleForBusinessType(type: BusinessTypeId): "brand" | "merchant" {
  return type === "place" || type === "service" ? "merchant" : "brand";
}

export function createBusinessOutcomeBrief(
  input: Omit<BusinessOutcomeBrief, "version" | "id" | "createdAt" | "programmeId">
): BusinessOutcomeBrief {
  return {
    ...input,
    version: 2,
    id: `business-${Date.now()}`,
    createdAt: new Date().toISOString(),
    programmeId: recommendProgramme(input.outcomeId, input.businessType),
  };
}

export function saveBusinessOutcomeBrief(brief: BusinessOutcomeBrief) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(brief);
  sessionStorage.setItem(BUSINESS_OUTCOME_BRIEF_KEY, payload);
  try { localStorage.setItem(BUSINESS_OUTCOME_BRIEF_KEY, payload); } catch { /* session continuity remains available */ }
}

function readRawBrief() {
  if (typeof window === "undefined") return null;
  const read = (key: string) => sessionStorage.getItem(key) || (() => {
    try { return localStorage.getItem(key); } catch { return null; }
  })();
  return read(BUSINESS_OUTCOME_BRIEF_KEY) || read(LEGACY_BUSINESS_OUTCOME_BRIEF_KEY);
}

export function readBusinessOutcomeBrief(): BusinessOutcomeBrief | null {
  const raw = readRawBrief();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BusinessOutcomeBrief> & { version?: number };
    if (!getOutcome(parsed.outcomeId) || !getProgramme(parsed.programmeId)) return null;
    if (parsed.version === 2 && parsed.executionRailId) return parsed as BusinessOutcomeBrief;

    const outcomeId = parsed.outcomeId as BusinessOutcomeId;
    const businessType = parsed.businessType as BusinessTypeId;
    const successAction = parsed.successAction as SuccessActionId;
    const migrated: BusinessOutcomeBrief = {
      ...(parsed as any),
      version: 2,
      executionRailId: recommendExecutionRail(outcomeId, successAction, businessType),
      commerceSubjectId: null,
      subjectLabel: "",
      sellerResponsibilityId: null,
      commerceSourceId: null,
    };
    saveBusinessOutcomeBrief(migrated);
    return migrated;
  } catch {
    return null;
  }
}

export function executionNeedsCommerce(brief: Pick<BusinessOutcomeBrief, "executionRailId">) {
  return brief.executionRailId === "commerce" || brief.executionRailId === "mixed";
}

export function businessProgrammePrimaryPath(brief: BusinessOutcomeBrief) {
  return "/business/programme?resume=1";
}

export function buildBusinessOutcomePrompt(brief: BusinessOutcomeBrief) {
  const outcome = getOutcome(brief.outcomeId);
  const businessType = getBusinessType(brief.businessType);
  const success = getSuccessAction(brief.successAction);
  const programme = getProgramme(brief.programmeId);
  const execution = getExecutionRail(brief.executionRailId);
  const subject = getCommerceSubject(brief.commerceSubjectId);
  const seller = getSellerResponsibility(brief.sellerResponsibilityId);
  const target = brief.target ? `${brief.target} ${success?.unit || "actions"}` : "a measurable target we can confirm before launch";

  return [
    `Desired business outcome: ${outcome?.title || brief.outcomeId}.`,
    `Business context: ${businessType?.title || brief.businessType}.`,
    `Recommended programme direction: ${programme?.title || brief.programmeId}.`,
    `Primary execution rail: ${execution?.title || brief.executionRailId}. ${execution?.boundary || ""}`,
    brief.commerceSubjectId ? `Commercial subject: ${subject?.title || brief.commerceSubjectId}${brief.subjectLabel ? ` — ${brief.subjectLabel}` : ""}.` : "",
    brief.commerceSourceId ? `Linked authoritative merchant product source: ${brief.commerceSourceId}. Keep this product reference attached; do not substitute invented supply.` : "",
    brief.sellerResponsibilityId ? `Seller / fulfillment responsibility: ${seller?.title || brief.sellerResponsibilityId}. ${seller?.description || ""}` : "",
    `Success should be measured as ${target} using ${success?.title || brief.successAction} where the underlying system can authoritatively record or verify it.`,
    brief.timeframe ? `Timing: ${brief.timeframe}.` : "",
    brief.geography ? `Geography / place: ${brief.geography}.` : "",
    brief.audience ? `Audience: ${brief.audience}.` : "",
    brief.availableValue ? `Possible participant reason to act: ${brief.availableValue}. Treat this as a proposal until terms, funding, inventory and fulfillment are approved.` : "",
    "Use existing PROMORANG commerce, Offer, Moment, distribution and evidence systems as applicable. Do not invent a parallel checkout or product database.",
    "Keep demand, availability, reservation, payment, fulfillment, claim, attendance, purchase, attribution and verified evidence distinct. Merchant responsibility owns price, inventory, payment acceptance and fulfillment unless another organization explicitly accepts Merchant responsibility.",
    "Do not invent inventory, funding, prices, product claims, seller relationships, creator earnings or guaranteed outcomes.",
  ].filter(Boolean).join("\n");
}
