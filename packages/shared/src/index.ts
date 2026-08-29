export type PromorangDestinationId = "today" | "discover" | "create" | "progress" | "vault";

export * from "./feed";
export * from "./moment-context";
export * from "./scene";
export * from "./discovery";
export * from "./journey-state";
export * from "./notification-journey";
export * from "./action-receipt";
export * from "./content-context";
export * from "./brand-opportunity";
export * from "./merchant-live-ops";
export * from "./commerce-case";
export * from "./guest-rsvp";
export * from "./demand-plan";
export * from "./action-engine";
export * from "./gem-ledger";
export * from "./promocard-moment";
export * from "./promocard-loop";
export * from "./weekly-moment-drop";
export * from "./stakeholder-scout";
export * from "./people-moments";

export type PromorangJourneyStepId =
  | "discover"
  | "connect"
  | "choose"
  | "show_up"
  | "be_seen"
  | "unlock"
  | "keep"
  | "become_known"
  | "return";

export type StakeholderRole =
  | "participant"
  | "creator"
  | "host"
  | "brand"
  | "merchant"
  | "agency";

export type JourneyStepStatus = "done" | "current" | "todo";

export type JourneyStep = {
  id: PromorangJourneyStepId;
  label: string;
  actionLabel: string;
  humanMeaning: string;
  systemMeaning: string;
  route: PromorangDestinationId;
};

export type JourneyProgressInput = {
  hasDiscovered?: boolean;
  hasJoinedMoment?: boolean;
  hasArrived?: boolean;
  hasContribution?: boolean;
  hasUnlockedValue?: boolean;
  hasSavedMemory?: boolean;
  hasRecognizedPattern?: boolean;
  hasReturned?: boolean;
};

export type CurrentMove = {
  step: JourneyStep;
  title: string;
  body: string;
  ctaLabel: string;
  destination: PromorangDestinationId;
};

export type ValueReceipt = {
  label: string;
  humanValue: string;
  commercialValue: string;
};

export type ProductLanguageTerm =
  | "proof"
  | "reputation"
  | "points"
  | "proposal"
  | "campaign"
  | "tickets"
  | "draw";

export type ProductLanguageGuidance = {
  legacy: string;
  preferred: string;
  why: string;
  participantFacing: string;
  stakeholderFacing: string;
};

export type StakeholderExperience = {
  role: StakeholderRole;
  label: string;
  promise: string;
  socialReturn: string;
  commercialReturn: string;
  firstMove: string;
};

export type ActivationOutcomeId =
  | "gather"
  | "visits"
  | "content"
  | "launch"
  | "community"
  | "commercial";

export type ActivationContentNeedId = "invitation" | "creator" | "live" | "memory";

export type ActivationCollaboratorId =
  | "host"
  | "creator"
  | "venue"
  | "merchant"
  | "brand";

export type ActivationBlueprintOption<TId extends string = string> = {
  id: TId;
  title: string;
  detail: string;
};

export type ActivationCreationStepId =
  | "outcome"
  | "scene_moment"
  | "content_people"
  | "value_launch"
  | "return_review";

export type ActivationCreationStep = {
  id: ActivationCreationStepId;
  shortLabel: string;
  eyebrow: string;
  title: string;
  detail: string;
};

export type ActivationCreationGuidance = {
  stepId: ActivationCreationStepId;
  successQuestion: string;
  participantLens: string;
  partnerLens: string;
  contentLens: string;
  sceneLens: string;
  gemsLens: string;
  avoid: string;
};

export type ActivationReadinessStageId =
  | "direction"
  | "moment"
  | "story_people"
  | "shared_value"
  | "bring_alive"
  | "return_review";

export type ActivationReadinessStage = {
  id: ActivationReadinessStageId;
  label: string;
  detail: string;
  completeMeaning: string;
};

export type StakeholderReturnRole = StakeholderRole | "venue";

export type StakeholderReturnMetricId =
  | "accessOpened"
  | "gemsEarned"
  | "doorsOpened"
  | "peopleAroundIt"
  | "visitsMoved"
  | "returns"
  | "redemptions"
  | "valueMoved"
  | "peopleReached"
  | "storiesCreated"
  | "collaborations"
  | "gemsMoved";

export type StakeholderReturnMetric = {
  id: StakeholderReturnMetricId;
  label: string;
  humanMeaning: string;
};

export type StakeholderReturnBlueprint = {
  role: StakeholderReturnRole;
  title: string;
  headline: string;
  body: string;
  socialReturn: string;
  commercialReturn: string;
  tone: "primary" | "pink" | "emerald" | "sky" | "amber";
  metrics: StakeholderReturnMetricId[];
};

export const GEM_USD_VALUE = 1;

export const GEM_LANGUAGE = {
  singular: "Gem",
  plural: "Gems",
  valueStatement: "1 Gem = 1 USD of platform value",
  participantMeaning: "Gems let people secure access, fund participation, tip creators, and move value inside Promorang.",
  stakeholderMeaning: "Gems secure budgets, rewards, creator payouts, venue commitments, and other paid activation actions.",
} as const;

export const PRODUCT_LANGUAGE: Record<ProductLanguageTerm, ProductLanguageGuidance> = {
  proof: {
    legacy: "Proof",
    preferred: "Your presence counted",
    why: "Proof is useful infrastructure, but it can feel cold when people are deciding whether to join a social experience.",
    participantFacing: "Your presence, content, purchase, or contribution was recognized.",
    stakeholderFacing: "Qualified actions show what happened and what value moved.",
  },
  reputation: {
    legacy: "Reputation",
    preferred: "Become known",
    why: "People want recognition, familiarity, trust, taste, and opportunity more than an abstract reputation score.",
    participantFacing: "People and places start recognizing what you care about.",
    stakeholderFacing: "Repeat patterns reveal trusted participants, creators, hosts, and Scenes.",
  },
  points: {
    legacy: "Points",
    preferred: "Gems and earned value",
    why: `${GEM_LANGUAGE.valueStatement}; Gems are the platform value rail for money-linked actions.`,
    participantFacing: "Gems, access, rewards, receipts, and invitations show what opened for you.",
    stakeholderFacing: "Gems secure budgets, payouts, access, rewards, and paid activation actions.",
  },
  proposal: {
    legacy: "Proposal",
    preferred: "Activation plan",
    why: "Proposal sounds administrative. Activation plan sounds like something a stakeholder is shaping into reality.",
    participantFacing: "A plan for a Moment people can join.",
    stakeholderFacing: "A Scene, Moment, people, content, value, Gems, and return plan.",
  },
  campaign: {
    legacy: "Campaign",
    preferred: "Activation",
    why: "Campaign can sound like advertising. Activation keeps the focus on culture, people, and real-world action.",
    participantFacing: "A Moment, offer, story, or experience worth taking part in.",
    stakeholderFacing: "A funded cultural/commercial loop with visible human and business return.",
  },
  tickets: {
    legacy: "Tickets",
    preferred: "Access",
    why: "Access can include free entry, Gems-secured entry, RSVP, passes, perks, and invitations without making everything feel transactional.",
    participantFacing: "Your way into the Moment.",
    stakeholderFacing: "Capacity, entry value, reservation, paid access, and eligibility.",
  },
  draw: {
    legacy: "Draw",
    preferred: "Possible reward",
    why: "Draws can be optional mechanics, but they should not become the perceived purpose of Promorang.",
    participantFacing: "Something that may open because you took part.",
    stakeholderFacing: "An optional reward mechanic tied to qualified actions and Gems-funded value.",
  },
} as const;

export const PLATFORM_READINESS_AUDIT = [
  {
    area: "Journey clarity",
    standard: "Every screen should answer: what should I do now, why does it matter, and what can open next?",
  },
  {
    area: "Human language",
    standard: "Participant-facing surfaces should prefer presence, contribution, access, memory, belonging, and return over cold system terms.",
  },
  {
    area: "Scenes",
    standard: "Scenes should connect Moments, people, content, places, partners, memory, and next moves.",
  },
  {
    area: "Content",
    standard: "Content should be treated as invitation, live meaning, after-story, and movement—not decoration.",
  },
  {
    area: "Gems",
    standard: `${GEM_LANGUAGE.valueStatement}; Gems should be used anywhere platform money, funding, payouts, access, or rewards are involved.`,
  },
  {
    area: "Stakeholder return",
    standard: "Participant, creator, host, merchant, venue, brand, and agency surfaces should show social return and commercial return in plain language.",
  },
  {
    area: "Review loop",
    standard: "Post-launch review should show what changed: people, content, access, Gems, visits, redemptions, returns, and Scene momentum.",
  },
] as const;

export const ACTIVATION_CREATION_STEPS: ActivationCreationStep[] = [
  {
    id: "outcome",
    shortLabel: "Outcome",
    eyebrow: "Desired outcome",
    title: "What do you want to make happen between people?",
    detail: "Start with the human change. Promorang will shape the Scene, Moment, content, people, value, and funding around it.",
  },
  {
    id: "scene_moment",
    shortLabel: "Scene + Moment",
    eyebrow: "Scene + Moment",
    title: "Where will this belonging grow?",
    detail: "The Scene holds the relationships. The Moment gives people a reason to gather now.",
  },
  {
    id: "content_people",
    shortLabel: "Content + people",
    eyebrow: "Content + people",
    title: "Who will give this meaning and help it travel?",
    detail: "Content creates desire before, captures the feeling during, and carries the Scene forward after.",
  },
  {
    id: "value_launch",
    shortLabel: "Value + launch",
    eyebrow: "Value + launch",
    title: "What should this open for everyone involved?",
    detail: "Participant value and partner return should come from the same successful experience.",
  },
  {
    id: "return_review",
    shortLabel: "Return review",
    eyebrow: "Return review",
    title: "What changed because this happened?",
    detail: "Review the human return, commercial return, content created, Gems moved, and what the Scene should do next.",
  },
];

export const ACTIVATION_OUTCOMES: ActivationBlueprintOption<ActivationOutcomeId>[] = [
  {
    id: "gather",
    title: "Bring people together",
    detail: "Create a gathering people want to enter and return to.",
  },
  {
    id: "visits",
    title: "Bring people to a place",
    detail: "Turn attention into meaningful visits and repeat customers.",
  },
  {
    id: "content",
    title: "Set a story in motion",
    detail: "Help creator content lead to real participation and opportunity.",
  },
  {
    id: "launch",
    title: "Launch something people feel",
    detail: "Give a product, idea, or cultural release a living audience.",
  },
  {
    id: "community",
    title: "Grow a Scene",
    detail: "Strengthen belonging, recurring rituals, and shared opportunity.",
  },
  {
    id: "commercial",
    title: "Create measurable demand",
    detail: "Connect cultural contribution to visits, sales, loyalty, or return.",
  },
];

export const ACTIVATION_CONTENT_NEEDS: ActivationBlueprintOption<ActivationContentNeedId>[] = [
  {
    id: "invitation",
    title: "Invitation story",
    detail: "Give people a reason to care and one clear next step.",
  },
  {
    id: "creator",
    title: "Creator perspective",
    detail: "Let a trusted voice interpret why this matters.",
  },
  {
    id: "live",
    title: "Live coverage",
    detail: "Capture the people, energy, and story while it happens.",
  },
  {
    id: "memory",
    title: "After-story",
    detail: "Carry the Moment forward and invite people into what comes next.",
  },
];

export const ACTIVATION_COLLABORATORS: ActivationBlueprintOption<ActivationCollaboratorId>[] = [
  {
    id: "host",
    title: "Host",
    detail: "Creates the room and holds the experience.",
  },
  {
    id: "creator",
    title: "Creator",
    detail: "Builds desire, context, and cultural meaning.",
  },
  {
    id: "venue",
    title: "Venue",
    detail: "Gives the Moment a place and a reason to return.",
  },
  {
    id: "merchant",
    title: "Merchant",
    detail: "Contributes product, service, access, or customer value.",
  },
  {
    id: "brand",
    title: "Brand partner",
    detail: "Helps fund the outcome without taking over the culture.",
  },
];

export const ACTIVATION_PARTICIPANT_RETURNS = [
  "Meet the right people",
  "Be part of the Scene",
  "Get invited back",
  "Unlock access or a useful reward",
  "Create a memory worth keeping",
  "Open a new opportunity",
] as const;

export const ACTIVATION_SUCCESS_LANGUAGE = {
  whatCounts:
    "Use human language: people came, stayed, met someone, created something, visited the venue, bought, returned, or joined the next Moment.",
  humanReturn:
    "New friendships, collaborators, invitations, creative recognition, belonging, access, memories, and reasons to return.",
  commercialReturn:
    "Qualified visits, useful content, product trials, redemptions, sales, repeat customers, cultural relevance, and clearer demand.",
  sharedReturn:
    "People should leave with more life. Partners should leave knowing what they helped make possible.",
  gemsFunding: `${GEM_LANGUAGE.valueStatement}. Gems secure activation budgets, participant value, creator work, venue commitments, and rewards.`,
} as const;

export const ACTIVATION_CREATION_GUIDANCE: Record<ActivationCreationStepId, ActivationCreationGuidance> = {
  outcome: {
    stepId: "outcome",
    successQuestion: "If this works, what will people feel, do, or talk about without being forced?",
    participantLens: "They should see a real social reason to care: belonging, access, recognition, fun, opportunity, or a better night out.",
    partnerLens: "Partners should know the human outcome they are funding before they think about reach, sales, or reports.",
    contentLens: "The story should sound like an invitation into life, not an ad asking for attention.",
    sceneLens: "The outcome should strengthen a living Scene people can return to, not create a one-off stunt.",
    gemsLens: `${GEM_LANGUAGE.valueStatement}. At this stage, Gems express the seriousness of the outcome before spend gets assigned.`,
    avoid: "Do not start with a generic campaign mechanic, discount, or vanity metric. Start with the change in human behavior.",
  },
  scene_moment: {
    stepId: "scene_moment",
    successQuestion: "Where does this belong, and why would someone leave their routine to show up?",
    participantLens: "The Moment should feel socially worth it: the right people, the right room, the right timing, the right promise.",
    partnerLens: "Hosts, venues, merchants, and brands should understand the role they play in making the room feel alive.",
    contentLens: "Content needs a place, faces, rituals, textures, and a reason for people to say: you had to be there.",
    sceneLens: "The Scene is the continuity. The Moment is the spark. Both should make the next gathering easier.",
    gemsLens: "Gems can secure venue commitments, access, rewards, creator work, or participant value attached to this Moment.",
    avoid: "Do not make the Moment feel like inventory. Make it feel like a doorway into a specific social world.",
  },
  content_people: {
    stepId: "content_people",
    successQuestion: "Who makes this feel credible, desirable, and safe enough to join?",
    participantLens: "People want cues: who is going, what is the vibe, what can I do there, and will I feel out of place?",
    partnerLens: "Each collaborator should have a visible reason to participate and a clear return from the work.",
    contentLens: "Define the before-story, live capture, creator perspective, and after-story so content creates movement.",
    sceneLens: "Creators and hosts should reveal the culture of the Scene, not flatten it into generic promotion.",
    gemsLens: "Gems can fund creator briefs, host work, live coverage, rewards, and commissions tied to qualified actions.",
    avoid: "Do not treat creators as ad slots or hosts as logistics. They are social translators.",
  },
  value_launch: {
    stepId: "value_launch",
    successQuestion: "What does each person leave with, and what does each partner learn or earn?",
    participantLens: "Participants should leave with more life: memory, access, people, status, useful rewards, or a next invitation.",
    partnerLens: "Partners should see visits, redemptions, content, demand, loyalty, Gems movement, and reasons to fund again.",
    contentLens: "Content should carry the proof of feeling: the human evidence that something worth joining happened.",
    sceneLens: "The launch should create a next move for the Scene, not just close a transaction.",
    gemsLens: `${GEM_LANGUAGE.valueStatement}. Gems should fund what must be paid for and track what value moved through the ecosystem.`,
    avoid: "Do not make value feel like a bribe. It should feel like access, appreciation, and momentum.",
  },
  return_review: {
    stepId: "return_review",
    successQuestion: "What changed because this happened, and what should the Scene do next?",
    participantLens: "Review who returned, who connected, what was unlocked, what was saved, and what people want next.",
    partnerLens: "Review commercial return beside cultural return: visits, sales, content, relevance, loyalty, and repeat demand.",
    contentLens: "The after-story should turn the Moment into memory, invitation, and momentum for the next activation.",
    sceneLens: "The Scene should become smarter after every Moment: better rituals, stronger hosts, clearer audiences.",
    gemsLens: "Gems moved should make budget, payouts, rewards, and earned value visible without reducing the Moment to money.",
    avoid: "Do not report only numbers. Numbers need the human story that explains why the return matters.",
  },
} as const;

export const ACTIVATION_READINESS_STAGES: ActivationReadinessStage[] = [
  {
    id: "direction",
    label: "Direction",
    detail: "The outcome, Scene, and reason for caring are clear.",
    completeMeaning: "Everyone understands what this is trying to make happen.",
  },
  {
    id: "moment",
    label: "Moment",
    detail: "A real gathering, offer, access path, or experience is connected.",
    completeMeaning: "There is a clear place and time for people to act.",
  },
  {
    id: "story_people",
    label: "Story + people",
    detail: "Content and collaborator roles are defined.",
    completeMeaning: "The right hosts, creators, venues, merchants, or brands know their part.",
  },
  {
    id: "shared_value",
    label: "Shared value",
    detail: "People and partners know what this opens.",
    completeMeaning: "Participant value and commercial return are connected.",
  },
  {
    id: "bring_alive",
    label: "Bring alive",
    detail: "Gems, access, launch, and operating promises are aligned.",
    completeMeaning: "The activation can move from plan to lived experience.",
  },
  {
    id: "return_review",
    label: "Return review",
    detail: "Human return, commercial return, content, Gems, and next moves are visible.",
    completeMeaning: "The Scene can learn what to repeat, improve, or close.",
  },
];

export const ACTIVATION_RETURN_REVIEW = {
  eyebrow: "Return review",
  title: "What changed because this happened?",
  emptyTitle: "Make the return visible",
  emptyBody:
    "Capture what became more connected, valuable, memorable, useful, or repeatable for people, partners, and the Scene.",
  participantPrompt: "What became better, possible, memorable, or more connected for people?",
  commercialPrompt: "What changed for the venue, merchant, brand, creator, host, or Scene commercially?",
  recordCta: "Record the shared return",
  reviewedCta: "Review the shared return",
} as const;

export const ACTIVATION_RETURN_METRICS = [
  { id: "showed", label: "Showed up", prompt: "People who showed up" },
  { id: "returned", label: "Returned", prompt: "People who returned" },
  { id: "stories", label: "Stories", prompt: "Stories created" },
  { id: "collaborations", label: "Doors opened", prompt: "Collaborations opened" },
  { id: "grossValue", label: "Value moved", prompt: "Commercial value moved" },
] as const;

export type ActivationReviewLoopStageId =
  | "people"
  | "content"
  | "contribution"
  | "value"
  | "commercial"
  | "scene"
  | "next";

export type ActivationReviewLoopStage = {
  id: ActivationReviewLoopStageId;
  label: string;
  question: string;
  empty: string;
  signal: string;
};

export const ACTIVATION_REVIEW_SUMMARY = {
  title: "The return loop",
  body:
    "Review the activation as a living loop: people, content, contributions, Gems, commercial return, Scene learning, and the next move.",
  cta: "Turn this into the next move",
} as const;

export const ACTIVATION_REVIEW_NEXT_DECISIONS = [
  {
    id: "repeat",
    label: "Repeat",
    meaning: "The Moment worked; bring it back with the same core ritual, people, or place.",
  },
  {
    id: "improve",
    label: "Improve",
    meaning: "The signal is there; adjust the offer, content, timing, collaborators, or access path.",
  },
  {
    id: "invite",
    label: "Invite",
    meaning: "The Scene needs more of the right participants, creators, hosts, merchants, venues, or brands.",
  },
  {
    id: "fund",
    label: "Fund",
    meaning: "Put Gems behind the next version because the human and commercial return is credible.",
  },
  {
    id: "close",
    label: "Close",
    meaning: "Retire or pause the idea honestly when it did not create enough return.",
  },
] as const;

export const ACTIVATION_REVIEW_DECISION_ACTIONS = {
  repeat: {
    title: "Create the next version",
    detail: "Use the same Scene, ritual, people, or place as the foundation for the next Moment.",
    cta: "Repeat this",
  },
  improve: {
    title: "Tune the activation",
    detail: "Adjust the content, access, value, timing, collaborators, or offer before the next launch.",
    cta: "Improve it",
  },
  invite: {
    title: "Bring more of the right people in",
    detail: "Add creators, hosts, venues, merchants, brands, or participants who can strengthen the Scene.",
    cta: "Invite people",
  },
  fund: {
    title: "Secure Gems for what is working",
    detail: "Put Gems behind the next version because the return is credible enough to back.",
    cta: "Fund next",
  },
  close: {
    title: "Close with learning",
    detail: "Archive the idea honestly, keep the Scene learning, and avoid forcing a weak loop.",
    cta: "Close loop",
  },
} as const;

export const ACTIVATION_REVIEW_LOOP: ActivationReviewLoopStage[] = [
  {
    id: "people",
    label: "People",
    question: "Who showed up, connected, returned, or asked for what is next?",
    empty: "No people signal recorded yet.",
    signal: "Attendance, return behavior, familiar faces, and new connections.",
  },
  {
    id: "content",
    label: "Content",
    question: "What stories, captures, recaps, or creator perspectives helped the Moment travel?",
    empty: "No content signal recorded yet.",
    signal: "Invitation content, live capture, after-story, creator output, and saved memory.",
  },
  {
    id: "contribution",
    label: "Contribution",
    question: "What contributions counted and who made the Moment more useful?",
    empty: "No contribution signal recorded yet.",
    signal: "Check-ins, captures, referrals, redemptions, host decisions, and reviewed contributions.",
  },
  {
    id: "value",
    label: "Gems + value",
    question: "What Gems, access, rewards, payouts, or participant value opened?",
    empty: "No Gems or value movement recorded yet.",
    signal: "1 Gem = 1 USD of platform value; track what was secured, released, refunded, earned, or opened.",
  },
  {
    id: "commercial",
    label: "Commercial return",
    question: "What visits, redemptions, purchases, demand, loyalty, or reusable insight appeared?",
    empty: "No commercial return recorded yet.",
    signal: "Venue traffic, merchant redemptions, brand demand, creator payouts, and partner return.",
  },
  {
    id: "scene",
    label: "Scene learning",
    question: "What did the Scene learn about rituals, hosts, creators, places, and people?",
    empty: "No Scene learning recorded yet.",
    signal: "What to repeat, improve, retire, or invite next.",
  },
  {
    id: "next",
    label: "Next move",
    question: "What should happen next so the Scene keeps moving?",
    empty: "No next move recorded yet.",
    signal: "Return invitation, next Moment, new collaborator, offer refresh, recap, or funding renewal.",
  },
];

export const STAKEHOLDER_RETURN_METRICS: Record<StakeholderReturnMetricId, StakeholderReturnMetric> = {
  accessOpened: {
    id: "accessOpened",
    label: "Access opened",
    humanMeaning: "Useful doors, offers, entries, or invitations became available.",
  },
  gemsEarned: {
    id: "gemsEarned",
    label: "Gems earned",
    humanMeaning: "Platform value was earned through meaningful participation or contribution.",
  },
  doorsOpened: {
    id: "doorsOpened",
    label: "Doors opened",
    humanMeaning: "New people, places, invitations, or opportunities became possible.",
  },
  peopleAroundIt: {
    id: "peopleAroundIt",
    label: "People around it",
    humanMeaning: "A real social circle formed around the Moment, Scene, or activation.",
  },
  visitsMoved: {
    id: "visitsMoved",
    label: "Visits moved",
    humanMeaning: "People showed up somewhere with context and intent.",
  },
  returns: {
    id: "returns",
    label: "Returns",
    humanMeaning: "People had a reason to come back.",
  },
  redemptions: {
    id: "redemptions",
    label: "Redemptions",
    humanMeaning: "Access, offers, rewards, or merchant value became real action.",
  },
  valueMoved: {
    id: "valueMoved",
    label: "Value moved",
    humanMeaning: "Commercial value moved through the Scene, venue, merchant, brand, or activation.",
  },
  peopleReached: {
    id: "peopleReached",
    label: "People reached",
    humanMeaning: "The story reached people who could care or act.",
  },
  storiesCreated: {
    id: "storiesCreated",
    label: "Stories created",
    humanMeaning: "Content helped people understand, remember, or share the Moment.",
  },
  collaborations: {
    id: "collaborations",
    label: "Collaborations",
    humanMeaning: "Creators, hosts, venues, brands, merchants, or participants opened new working relationships.",
  },
  gemsMoved: {
    id: "gemsMoved",
    label: "Gems moved",
    humanMeaning: "Platform value funded, rewarded, tipped, paid, or unlocked action.",
  },
};

export const STAKEHOLDER_RETURN_BLUEPRINTS: Record<StakeholderReturnRole, StakeholderReturnBlueprint> = {
  participant: {
    role: "participant",
    title: "Your social return",
    headline: "What Promorang is giving back to you",
    body: "A clearer social life: places you returned to, access you opened, Gems you can use, and people connected through real Moments.",
    socialReturn: "Belonging, better invitations, memories, familiar faces, useful access, and a visible pattern of taste.",
    commercialReturn: "Participant action powers attendance, redemptions, demand signals, content value, and repeat behavior.",
    tone: "primary",
    metrics: ["accessOpened", "gemsEarned", "doorsOpened", "peopleAroundIt"],
  },
  creator: {
    role: "creator",
    title: "Creator return",
    headline: "What your content is making possible",
    body: "Track how your work helped people show up, create stories, open invitations, and turn attention into Gems.",
    socialReturn: "Recognition, collaborators, audience trust, cultural relevance, and a stronger body of work.",
    commercialReturn: "Qualified content, turnout influence, conversion signals, Gems, tips, commissions, and paid briefs.",
    tone: "pink",
    metrics: ["peopleReached", "storiesCreated", "collaborations", "gemsMoved"],
  },
  host: {
    role: "host",
    title: "Host return",
    headline: "What your Moments are returning",
    body: "See turnout, repeat participation, Gems released, and the collaborations your room made possible.",
    socialReturn: "Status as a convener, stronger community memory, familiar participants, and repeat rituals.",
    commercialReturn: "Attendance, partner budgets, ticket/access revenue, retention, creator output, and venue value.",
    tone: "primary",
    metrics: ["peopleReached", "storiesCreated", "collaborations", "gemsMoved"],
  },
  merchant: {
    role: "merchant",
    title: "Merchant return",
    headline: "What your place is gaining",
    body: "Connect visits, redemptions, purchases, creator-driven traffic, and the commercial value moving through your venue.",
    socialReturn: "A place people associate with belonging, discovery, ritual, and good stories.",
    commercialReturn: "Foot traffic, basket value, offer redemption, repeat visits, creator content, and local demand.",
    tone: "emerald",
    metrics: ["visitsMoved", "returns", "redemptions", "valueMoved"],
  },
  venue: {
    role: "venue",
    title: "Venue return",
    headline: "What your place is gaining",
    body: "Connect visits, redemptions, purchases, creator-driven traffic, and the commercial value moving through your venue.",
    socialReturn: "A place people associate with belonging, discovery, ritual, and good stories.",
    commercialReturn: "Foot traffic, basket value, offer redemption, repeat visits, creator content, and local demand.",
    tone: "emerald",
    metrics: ["visitsMoved", "returns", "redemptions", "valueMoved"],
  },
  brand: {
    role: "brand",
    title: "Brand return",
    headline: "What your funding is moving",
    body: "Follow funded value, creator output, participant action, commercial return, and the doors opened by your activation.",
    socialReturn: "Cultural credibility, affinity, creator association, and remembered participation.",
    commercialReturn: "Visits, redemptions, qualified content, conversions, attributed demand, and reusable insight.",
    tone: "sky",
    metrics: ["peopleReached", "storiesCreated", "collaborations", "gemsMoved"],
  },
  agency: {
    role: "agency",
    title: "Agency return",
    headline: "What your activation work is compounding",
    body: "Track people, partners, content, funded value, and repeatable outcomes across the rooms you coordinate.",
    socialReturn: "Client trust, partner credibility, better creative intelligence, and reusable case studies.",
    commercialReturn: "Budget control, measurable outputs, qualified partner performance, and clearer reporting.",
    tone: "amber",
    metrics: ["peopleReached", "storiesCreated", "collaborations", "gemsMoved"],
  },
};

export const SCENE_RETURN_CARDS = [
  {
    role: "participant",
    label: "You + participants",
    title: "Belonging that follows you",
    detail: STAKEHOLDER_RETURN_BLUEPRINTS.participant.socialReturn,
  },
  {
    role: "creator",
    label: "Creators",
    title: "See what your story started",
    detail: STAKEHOLDER_RETURN_BLUEPRINTS.creator.socialReturn,
  },
  {
    role: "host",
    label: "Hosts + places",
    title: "A crowd that can return",
    detail: `${STAKEHOLDER_RETURN_BLUEPRINTS.host.socialReturn} ${STAKEHOLDER_RETURN_BLUEPRINTS.venue.commercialReturn}`,
  },
  {
    role: "brand",
    label: "Brands + merchants",
    title: "Demand with context",
    detail: `${STAKEHOLDER_RETURN_BLUEPRINTS.brand.commercialReturn} ${STAKEHOLDER_RETURN_BLUEPRINTS.merchant.socialReturn}`,
  },
] as const;


export const PROMORANG_DESTINATIONS: Record<
  PromorangDestinationId,
  { label: string; purpose: string; humanQuestion: string }
> = {
  today: {
    label: "Today",
    purpose: "The user's live command center.",
    humanQuestion: "What should I do now?",
  },
  discover: {
    label: "Discover",
    purpose: "Scenes, Moments, places, content, offers, and people worth moving toward.",
    humanQuestion: "What is worth my time?",
  },
  create: {
    label: "Create",
    purpose: "The place stakeholders shape Moments, content, value, funding, and launch plans.",
    humanQuestion: "What can I make happen?",
  },
  progress: {
    label: "Progress",
    purpose: "Human and commercial return made visible.",
    humanQuestion: "What changed because I took part?",
  },
  vault: {
    label: "Vault",
    purpose: "The user's saved memories, access, receipts, Gems, and earned value.",
    humanQuestion: "What did I keep, earn, or unlock?",
  },
};

export const PARTICIPANT_JOURNEY: JourneyStep[] = [
  {
    id: "discover",
    label: "Discover",
    actionLabel: "Find your moment",
    humanMeaning: "See what is happening around you.",
    systemMeaning: "Browse eligible Scenes, Moments, content, offers, and invitations.",
    route: "discover",
  },
  {
    id: "connect",
    label: "Connect",
    actionLabel: "Feel the fit",
    humanMeaning: "Understand why this Scene, place, or people might matter to you.",
    systemMeaning: "Read context, social signals, creator content, and participation value.",
    route: "discover",
  },
  {
    id: "choose",
    label: "Choose",
    actionLabel: "Choose your move",
    humanMeaning: "Commit to one thing worth your time.",
    systemMeaning: "Join, save, reserve, claim, buy, or otherwise signal intent.",
    route: "today",
  },
  {
    id: "show_up",
    label: "Show up",
    actionLabel: "Be present",
    humanMeaning: "Arrive, participate, and help the Moment become real.",
    systemMeaning: "Location, QR, ticket, scan, post, or host action confirms participation.",
    route: "today",
  },
  {
    id: "be_seen",
    label: "Be seen",
    actionLabel: "Let it count",
    humanMeaning: "Your presence, content, purchase, or contribution is recognized.",
    systemMeaning: "A qualified action is recorded for access, payout, or return measurement.",
    route: "progress",
  },
  {
    id: "unlock",
    label: "Unlock",
    actionLabel: "Open value",
    humanMeaning: "Something useful opens because you took part.",
    systemMeaning: "Gems, access, keys, offers, entries, payouts, or invitations become available.",
    route: "vault",
  },
  {
    id: "keep",
    label: "Keep",
    actionLabel: "Keep the memory",
    humanMeaning: "The Moment becomes part of your story.",
    systemMeaning: "Receipts, memories, tickets, rewards, and saved objects enter the Vault.",
    route: "vault",
  },
  {
    id: "become_known",
    label: "Become known",
    actionLabel: "Build your pattern",
    humanMeaning: "People and places begin to recognize what you care about.",
    systemMeaning: "Repeat behavior, Scene participation, creator signals, and relationships compound.",
    route: "progress",
  },
  {
    id: "return",
    label: "Return",
    actionLabel: "Find what is next",
    humanMeaning: "Come back to the people, places, Scenes, and opportunities that fit.",
    systemMeaning: "Retention, repeat visits, reactivation, and next invitations are measured.",
    route: "today",
  },
];

export const STAKEHOLDER_EXPERIENCES: Record<StakeholderRole, StakeholderExperience> = {
  participant: {
    role: "participant",
    label: "Participant",
    promise: "Find Moments worth showing up for and keep what opens from them.",
    socialReturn: "Belonging, better invitations, memories, familiar faces, useful access, and a visible pattern of taste.",
    commercialReturn: "Participant action powers attendance, redemptions, demand signals, content value, and repeat behavior.",
    firstMove: "Choose one Moment that feels worth leaving home for.",
  },
  creator: {
    role: "creator",
    label: "Creator",
    promise: "Turn point of view into content that moves people into Scenes and Moments.",
    socialReturn: "Recognition, collaborators, audience trust, cultural relevance, and a stronger body of work.",
    commercialReturn: "Qualified content, turnout influence, conversion signals, Gems, tips, commissions, and paid briefs.",
    firstMove: "Pick a prompt or Moment where your voice can create desire, context, or memory.",
  },
  host: {
    role: "host",
    label: "Host",
    promise: "Give people a reason to gather and become known for rooms people return to.",
    socialReturn: "Status as a convener, stronger community memory, familiar participants, and repeat rituals.",
    commercialReturn: "Attendance, partner budgets, ticket/access revenue, retention, creator output, and venue value.",
    firstMove: "Frame the outcome and the Scene before choosing the Moment mechanics.",
  },
  brand: {
    role: "brand",
    label: "Brand",
    promise: "Help culture happen while connecting spend to action, content, and return.",
    socialReturn: "Cultural credibility, affinity, creator association, and remembered participation.",
    commercialReturn: "Visits, redemptions, qualified content, conversions, attributed demand, and reusable insight.",
    firstMove: "Choose the human outcome before funding the activation.",
  },
  merchant: {
    role: "merchant",
    label: "Merchant",
    promise: "Turn nearby attention into visits, sales, and reasons to return.",
    socialReturn: "A place people associate with belonging, discovery, ritual, and good stories.",
    commercialReturn: "Foot traffic, basket value, offer redemption, repeat visits, creator content, and local demand.",
    firstMove: "Attach the venue or offer to a Scene people already care about.",
  },
  agency: {
    role: "agency",
    label: "Agency",
    promise: "Coordinate the whole activation story across clients, creators, hosts, venues, and Scenes.",
    socialReturn: "Client trust, partner credibility, better creative intelligence, and reusable case studies.",
    commercialReturn: "Budget control, measurable outputs, qualified partner performance, and clearer reporting.",
    firstMove: "Set the client outcome and assemble the right Scene, Moment, and partner mix.",
  },
};

export const VALUE_RECEIPTS: ValueReceipt[] = [
  {
    label: "Presence",
    humanValue: "I was there and it mattered.",
    commercialValue: "Attendance, check-in, access, and capacity signals.",
  },
  {
    label: "Connection",
    humanValue: "I met, followed, joined, or became familiar with the right people.",
    commercialValue: "Network growth, retention paths, referrals, and community density.",
  },
  {
    label: "Memory",
    humanValue: "I kept something I want to remember or share.",
    commercialValue: "Content inventory, earned media, creator output, and Scene storytelling.",
  },
  {
    label: "Access",
    humanValue: "Something opened for me because I took part.",
    commercialValue: "Offer redemption, gated access, ticket value, Gems movement, and repeat demand.",
  },
  {
    label: "Standing",
    humanValue: "My taste, consistency, or contribution became more visible.",
    commercialValue: "Qualified audiences, higher-value segments, partner selection, and loyalty signals.",
  },
  {
    label: "Return",
    humanValue: "I have a reason to come back.",
    commercialValue: "Repeat visits, lifetime value, renewal, and next activation readiness.",
  },
];

const JOURNEY_BY_ID = PARTICIPANT_JOURNEY.reduce(
  (accumulator, step) => ({ ...accumulator, [step.id]: step }),
  {} as Record<PromorangJourneyStepId, JourneyStep>,
);

export function getJourneyStatuses(input: JourneyProgressInput): Array<JourneyStep & { status: JourneyStepStatus }> {
  const completed: PromorangJourneyStepId[] = [];

  if (input.hasDiscovered) completed.push("discover", "connect");
  if (input.hasJoinedMoment) completed.push("choose");
  if (input.hasArrived) completed.push("show_up");
  if (input.hasContribution) completed.push("be_seen");
  if (input.hasUnlockedValue) completed.push("unlock");
  if (input.hasSavedMemory) completed.push("keep");
  if (input.hasRecognizedPattern) completed.push("become_known");
  if (input.hasReturned) completed.push("return");

  const completedSet = new Set(completed);
  const current = PARTICIPANT_JOURNEY.find((step) => !completedSet.has(step.id)) ?? PARTICIPANT_JOURNEY[PARTICIPANT_JOURNEY.length - 1];

  return PARTICIPANT_JOURNEY.map((step) => ({
    ...step,
    status: completedSet.has(step.id) ? "done" : step.id === current.id ? "current" : "todo",
  }));
}

export function getCurrentMove(input: JourneyProgressInput): CurrentMove {
  const current = getJourneyStatuses(input).find((step) => step.status === "current") ?? {
    ...JOURNEY_BY_ID.return,
    status: "current" as const,
  };

  const contentByStep: Record<PromorangJourneyStepId, Omit<CurrentMove, "step" | "destination">> = {
    discover: {
      title: "Find one Moment worth your time",
      body: "Start with the Scene, people, place, or feeling you actually want more of.",
      ctaLabel: "Discover",
    },
    connect: {
      title: "Understand why it fits",
      body: "Look for the story, people, creator signals, and value that make the Moment feel relevant.",
      ctaLabel: "See the context",
    },
    choose: {
      title: "Choose your move",
      body: "Join, save, reserve, claim, or buy the thing that makes this Moment real for you.",
      ctaLabel: "Choose",
    },
    show_up: {
      title: "Be present",
      body: "Arrive, participate, and let the host or Moment know you made it.",
      ctaLabel: "Check in",
    },
    be_seen: {
      title: "Let it count",
      body: "Your presence, content, purchase, or contribution should be recognized in plain human terms.",
      ctaLabel: "See progress",
    },
    unlock: {
      title: "Open what you earned",
      body: "Access, Gems, offers, memories, invitations, and other value should now be visible.",
      ctaLabel: "Open Vault",
    },
    keep: {
      title: "Keep the memory",
      body: "Save the receipts, content, tickets, rewards, and story pieces that belong to you.",
      ctaLabel: "View Vault",
    },
    become_known: {
      title: "Build your pattern",
      body: "Your repeated choices help Promorang understand your taste, Scenes, people, and places.",
      ctaLabel: "View progress",
    },
    return: {
      title: "Come back for what fits",
      body: "Use what you learned and unlocked to find the next Moment that deserves your time.",
      ctaLabel: "Today",
    },
  };

  return {
    step: current,
    destination: current.route,
    ...contentByStep[current.id],
  };
}

export function describeGemAmount(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const label = Math.abs(safeAmount) === 1 ? GEM_LANGUAGE.singular : GEM_LANGUAGE.plural;
  return `${safeAmount.toLocaleString()} ${label}`;
}

export const PARTICIPANT_ECONOMY = {
  pointsPerPromoKey: 500,
  maxDailyPromoKeyConversions: 3,
  masterKeyDurationHours: 24,
  tiers: {
    starter: { label: "Starter", pointsMultiplier: 1, dailyMasterKeyProofs: 5 },
    professional: { label: "Professional", pointsMultiplier: 1.5, dailyMasterKeyProofs: 2 },
    power_user: { label: "Power User", pointsMultiplier: 2, dailyMasterKeyProofs: 1 },
  },
} as const;

export type ParticipantEconomyTierId = keyof typeof PARTICIPANT_ECONOMY.tiers;

export const PARTICIPANT_TIER_ALIASES: Record<string, ParticipantEconomyTierId> = {
  free: "starter",
  starter: "starter",
  plus: "professional",
  premium: "professional",
  pro: "professional",
  professional: "professional",
  elite: "power_user",
  super: "power_user",
  power: "power_user",
  power_user: "power_user",
};

export function resolveParticipantEconomyTier(tier?: string | null) {
  const id = PARTICIPANT_TIER_ALIASES[String(tier || "").toLowerCase()] || "starter";
  return { id, ...PARTICIPANT_ECONOMY.tiers[id] };
}

export * from "./context/Web3VaultContext";
export * from "./markets";
