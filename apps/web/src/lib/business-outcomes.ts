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

export type BusinessOutcomeBrief = {
  version: 1;
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
};

export const BUSINESS_OUTCOME_BRIEF_KEY = "promorang_business_outcome_brief_v1";

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

export const PROGRAMMES: Array<{
  id: ProgrammeId;
  title: string;
  promise: string;
  designedFor: string;
  path: string[];
}> = [
  { id: "first-50", title: "First 50", promise: "Create the first measurable customer actions around one clear business goal.", designedFor: "Launches, early tests and businesses that need a concrete first proof point.", path: ["Define one action", "Give people a reason", "Distribute", "Measure what happened"] },
  { id: "fill-the-room", title: "Fill the Room", promise: "Turn relevant interest into attendance, reservations or real arrivals.", designedFor: "Events, venues, restaurants and experiences.", path: ["Read interest", "Open access", "Invite", "Confirm arrivals"] },
  { id: "try-this", title: "Try This", promise: "Get a product or experience into people's hands and learn what follows.", designedFor: "Sampling, product trial, menu items and new services.", path: ["Find the audience", "Create trial", "Capture proof", "Learn"] },
  { id: "move-this", title: "Move This", promise: "Concentrate customer action around one product, service or commercial priority.", designedFor: "Specific SKUs, menu items, offers or services.", path: ["Choose the priority", "Build the reason", "Distribute", "Measure action"] },
  { id: "quiet-hours", title: "Quiet Hours", promise: "Create a reason to visit during a period that needs more movement.", designedFor: "Restaurants, retail, hospitality and local services.", path: ["Choose the window", "Shape the reason", "Reach nearby people", "Validate visits"] },
  { id: "bring-them-back", title: "Bring Them Back", promise: "Turn a first interaction into another meaningful one.", designedFor: "Repeat visits, repeat purchases and relationship-building.", path: ["Identify the first action", "Create return value", "Carry it on PromoCard", "Measure return"] },
  { id: "what-do-they-want", title: "What Do They Want?", promise: "Test interest before committing heavily to the response.", designedFor: "Product decisions, launches, stock, concepts and market discovery.", path: ["Ask", "Gather", "Read the signal", "Decide whether to respond"] },
  { id: "tell-somebody", title: "Tell Somebody", promise: "Give people a reason to review, refer, share or create around something real.", designedFor: "Word of mouth, advocacy, creator participation and referrals.", path: ["Choose the story", "Create a reason", "Invite participation", "Verify the action"] },
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

export function roleForBusinessType(type: BusinessTypeId): "brand" | "merchant" {
  return type === "place" || type === "service" ? "merchant" : "brand";
}

export function createBusinessOutcomeBrief(input: Omit<BusinessOutcomeBrief, "version" | "id" | "createdAt" | "programmeId">): BusinessOutcomeBrief {
  return {
    ...input,
    version: 1,
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

export function readBusinessOutcomeBrief(): BusinessOutcomeBrief | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(BUSINESS_OUTCOME_BRIEF_KEY) || (() => {
    try { return localStorage.getItem(BUSINESS_OUTCOME_BRIEF_KEY); } catch { return null; }
  })();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BusinessOutcomeBrief;
    if (parsed?.version !== 1 || !getOutcome(parsed.outcomeId) || !getProgramme(parsed.programmeId)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildBusinessOutcomePrompt(brief: BusinessOutcomeBrief) {
  const outcome = getOutcome(brief.outcomeId);
  const businessType = getBusinessType(brief.businessType);
  const success = getSuccessAction(brief.successAction);
  const programme = getProgramme(brief.programmeId);
  const target = brief.target ? `${brief.target} ${success?.unit || "actions"}` : "a measurable target we can confirm before launch";

  return [
    `Desired business outcome: ${outcome?.title || brief.outcomeId}.`,
    `Business context: ${businessType?.title || brief.businessType}.`,
    `Recommended programme direction: ${programme?.title || brief.programmeId}.`,
    `Success should be measured as ${target} using ${success?.title || brief.successAction} where the underlying system can authoritatively record or verify it.`,
    brief.timeframe ? `Timing: ${brief.timeframe}.` : "",
    brief.geography ? `Geography / place: ${brief.geography}.` : "",
    brief.audience ? `Audience: ${brief.audience}.` : "",
    brief.availableValue ? `Possible participant reason to act: ${brief.availableValue}. Treat this as a proposal until terms, funding, inventory and fulfillment are approved.` : "",
    "Create a practical PROMORANG activation plan. Keep demand, response, claim, attendance, purchase and verified evidence distinct. Do not invent inventory, funding, prices, product claims or guaranteed outcomes.",
  ].filter(Boolean).join("\n");
}
