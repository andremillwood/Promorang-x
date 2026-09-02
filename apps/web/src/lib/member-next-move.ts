export type MemberNextMoveStage = "notice" | "move" | "prove" | "unlock" | "grow" | "return";

export type MemberNextMoveKind =
  | "guest_discover"
  | "show_up"
  | "open_moment"
  | "browse_discover"
  | "start_create"
  | "see_progress";

export type MemberNextMove = {
  kind: MemberNextMoveKind;
  stage: MemberNextMoveStage;
  href: string;
  titleKey:
    | "nextMove.guestTitle"
    | "nextMove.showUpTitle"
    | "nextMove.momentTitle"
    | "nextMove.discoverTitle"
    | "nextMove.createTitle"
    | "nextMove.progressTitle";
  whyKey:
    | "nextMove.guestWhy"
    | "nextMove.showUpWhy"
    | "nextMove.momentWhy"
    | "nextMove.discoverWhy"
    | "nextMove.createWhy"
    | "nextMove.progressWhy";
  ctaKey:
    | "nextMove.guestCta"
    | "nextMove.showUpCta"
    | "nextMove.momentCta"
    | "nextMove.discoverCta"
    | "nextMove.createCta"
    | "nextMove.progressCta";
  vars?: Record<string, string>;
};

export type MemberNextMoveInput = {
  signedIn: boolean;
  needsCheckIn?: boolean;
  checkInHref?: string;
  hasUpcomingMoment?: boolean;
  upcomingMomentHref?: string;
  upcomingMomentName?: string;
  emptyDiscover?: boolean;
  canCreate?: boolean;
};

export function getMemberNextMove(input: MemberNextMoveInput): MemberNextMove {
  const momentName = input.upcomingMomentName || "this Moment";

  if (!input.signedIn) {
    return {
      kind: "guest_discover",
      stage: "notice",
      href: "/discover",
      titleKey: "nextMove.guestTitle",
      whyKey: "nextMove.guestWhy",
      ctaKey: "nextMove.guestCta",
    };
  }

  if (input.needsCheckIn && input.checkInHref) {
    return {
      kind: "show_up",
      stage: "prove",
      href: input.checkInHref,
      titleKey: "nextMove.showUpTitle",
      whyKey: "nextMove.showUpWhy",
      ctaKey: "nextMove.showUpCta",
      vars: { name: momentName },
    };
  }

  if (input.hasUpcomingMoment && input.upcomingMomentHref) {
    return {
      kind: "open_moment",
      stage: "move",
      href: input.upcomingMomentHref,
      titleKey: "nextMove.momentTitle",
      whyKey: "nextMove.momentWhy",
      ctaKey: "nextMove.momentCta",
      vars: { name: momentName },
    };
  }

  if (input.emptyDiscover) {
    return {
      kind: "browse_discover",
      stage: "notice",
      href: "/discover",
      titleKey: "nextMove.discoverTitle",
      whyKey: "nextMove.discoverWhy",
      ctaKey: "nextMove.discoverCta",
    };
  }

  if (input.canCreate) {
    return {
      kind: "start_create",
      stage: "move",
      href: "/create",
      titleKey: "nextMove.createTitle",
      whyKey: "nextMove.createWhy",
      ctaKey: "nextMove.createCta",
    };
  }

  return {
    kind: "see_progress",
    stage: "return",
    href: "/progress",
    titleKey: "nextMove.progressTitle",
    whyKey: "nextMove.progressWhy",
    ctaKey: "nextMove.progressCta",
  };
}
