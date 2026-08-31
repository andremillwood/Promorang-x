export type OpeningPath = "choose_path" | "start_tonight" | "find_something" | "create_story";

export type OpeningDestination = "create" | "discover";

export type OpeningStep = {
  label: string;
  title: string;
  text: string;
};

export type OpeningMove = {
  path: OpeningPath;
  eyebrow: string;
  headline: string;
  body: string;
  plainEnglish: string;
  ctaLabel: string;
  destination: OpeningDestination;
  ticketTitle: string;
  ticketDetail: string;
  ticketStub: string;
  steps: OpeningStep[];
};

export type OpeningPathChoice = "place" | "out";

export type OpeningMoveInput = {
  role?: string | null;
  hostedMomentCount?: number;
  joinedMomentCount?: number;
  pathChoice?: OpeningPathChoice | null;
};

const START_TONIGHT: OpeningMove = {
  path: "start_tonight",
  eyebrow: "Your move",
  headline: "Tonight can bring people to your door.",
  body: "You are already open. Name what is happening at your place so people nearby can find it and show up.",
  plainEnglish:
    "A Moment is just tonight at your bar — happy hour, a DJ, a crowd — written down so people can join from their phone.",
  ctaLabel: "Start tonight",
  destination: "create",
  ticketTitle: "Start tonight",
  ticketDetail: "Name what is already happening. People can join from their phone.",
  ticketStub: "Tonight",
  steps: [
    { label: "01", title: "Name it", text: "Thursday at the bar is enough. You are not planning a festival." },
    { label: "02", title: "People nearby see it", text: "It shows up for people looking for somewhere to go." },
    { label: "03", title: "They walk in", text: "They can say they are coming, then you see who showed up." },
  ],
};

const FIND_SOMETHING: OpeningMove = {
  path: "find_something",
  eyebrow: "Your move",
  headline: "Find one place worth leaving home for.",
  body: "Start with a night, a room, or a crowd you actually want to be in.",
  plainEnglish: "You do not need to create anything yet. Pick something happening and join it.",
  ctaLabel: "See what is on",
  destination: "discover",
  ticketTitle: "See what is on",
  ticketDetail: "Nearby nights, rooms, and places people are already going.",
  ticketStub: "Tonight",
  steps: [
    { label: "01", title: "Look around", text: "See what is live or starting soon near you." },
    { label: "02", title: "Pick one", text: "Save it or say you are going." },
    { label: "03", title: "Show up", text: "Check in when you arrive so it counts." },
  ],
};

const CREATE_STORY: OpeningMove = {
  path: "create_story",
  eyebrow: "Your move",
  headline: "Point people at a night worth showing up for.",
  body: "Your first move is one story that makes someone leave the house.",
  plainEnglish: "You are not filling out a campaign. You are naming a night people can join.",
  ctaLabel: "Start tonight",
  destination: "create",
  ticketTitle: "Start tonight",
  ticketDetail: "Name the night. People can find it and join.",
  ticketStub: "Create",
  steps: [
    { label: "01", title: "Name the night", text: "What is happening, and where." },
    { label: "02", title: "People see it", text: "Your story becomes something they can join." },
    { label: "03", title: "You see who came", text: "Presence and shares become a record, not a guess." },
  ],
};

const CHOOSE_PATH: OpeningMove = {
  path: "choose_path",
  eyebrow: "Start here",
  headline: "Do you have a place, or are you going out?",
  body: "This one choice decides your first screen. You can switch later.",
  plainEnglish: "If you run a bar, restaurant, or night — choose I have a place. If you are here to go out, choose that.",
  ctaLabel: "I have a place",
  destination: "create",
  ticketTitle: "I have a place",
  ticketDetail: "A bar, restaurant, venue, or night people should show up to.",
  ticketStub: "Place",
  steps: [
    { label: "Place", title: "I have a place", text: "Put tonight on the map so people can join." },
    { label: "Out", title: "I am going out", text: "Find a night, a room, or a crowd worth showing up for." },
  ],
};

export function isVenueOpeningRole(role?: string | null): boolean {
  return role === "host" || role === "merchant";
}

export function shouldShowOpeningMove(input: OpeningMoveInput): boolean {
  const hosted = input.hostedMomentCount ?? 0;
  const joined = input.joinedMomentCount ?? 0;
  if (hosted > 0) return false;
  if (isVenueOpeningRole(input.role) || input.pathChoice === "place") return true;
  if (input.role === "creator") return true;
  if (joined === 0) return true;
  return false;
}

export function getOpeningMove(input: OpeningMoveInput): OpeningMove {
  const hosted = input.hostedMomentCount ?? 0;
  const joined = input.joinedMomentCount ?? 0;
  const venueOwner = isVenueOpeningRole(input.role) || input.pathChoice === "place";

  if (hosted > 0) {
    return FIND_SOMETHING;
  }

  if (venueOwner) {
    return START_TONIGHT;
  }

  if (input.role === "creator") {
    return CREATE_STORY;
  }

  if (input.pathChoice === "out" || (input.role === "participant" && joined === 0 && input.pathChoice)) {
    return FIND_SOMETHING;
  }

  if (!input.role || input.role === "participant") {
    return CHOOSE_PATH;
  }

  return FIND_SOMETHING;
}

export function openingHref(destination: OpeningDestination): string {
  return destination === "create" ? "/create/moment?firstTime=true" : "/discover?firstTime=true";
}
