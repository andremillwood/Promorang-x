export type ConsumerObjectKind =
  | "content"
  | "discovery"
  | "scene"
  | "moment"
  | "reward"
  | "person"
  | "piece";

export type ConsumerActionKind =
  | "view"
  | "vote"
  | "save"
  | "rsvp"
  | "share"
  | "invite"
  | "claim"
  | "check_in"
  | "follow"
  | "join";

export interface ConsumerObjectBase {
  id: string;
  kind: ConsumerObjectKind;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  href?: string;
  eyebrow?: string;
}

export interface ContentObject extends ConsumerObjectBase {
  kind: "content";
  creatorName?: string;
  format?: "video" | "audio" | "article" | "gallery" | "post";
  relatedDiscoveryId?: string;
  relatedMomentId?: string;
}

export interface DiscoveryObject extends ConsumerObjectBase {
  kind: "discovery";
  question: string;
  options: Array<{ id: string; label: string; votes?: number }>;
  totalSignals?: number;
  sceneId?: string;
  relatedMomentId?: string;
}

export interface SceneObject extends ConsumerObjectBase {
  kind: "scene";
  memberCount?: number;
  signalCount?: number;
  trendingCount?: number;
}

export interface MomentObject extends ConsumerObjectBase {
  kind: "moment";
  startsAt?: string;
  venueName?: string;
  location?: string;
  participantCount?: number;
  saved?: boolean;
  accessLabel?: string;
  sceneIds?: string[];
}

export interface RewardObject extends ConsumerObjectBase {
  kind: "reward";
  pointsCost?: number;
  expiresAt?: string;
  status?: "available" | "unlocked" | "claimed" | "used";
  relatedMomentId?: string;
}

export interface PersonObject extends ConsumerObjectBase {
  kind: "person";
  handle?: string;
  relationship?: "following" | "friend" | "creator" | "host" | "member";
}

export interface PieceObject extends ConsumerObjectBase {
  kind: "piece";
  issuedAt?: string;
  pieceNumber?: string;
  significance?: string;
  relatedMomentId?: string;
  relatedDiscoveryId?: string;
}

export type ConsumerObject =
  | ContentObject
  | DiscoveryObject
  | SceneObject
  | MomentObject
  | RewardObject
  | PersonObject
  | PieceObject;

export interface ConsumerAction {
  kind: ConsumerActionKind;
  objectId: string;
  objectKind: ConsumerObjectKind;
  label: string;
  value?: string | number | boolean;
}

/**
 * Consumer UI rule:
 * Mechanics such as PromoPoints, PromoKeys, PromoShare, referrals, affiliate
 * attribution, missions and check-in are consequences/actions around canonical
 * objects. They should not become top-level consumer objects unless the user
 * explicitly needs a dedicated management surface.
 */
export const CONSUMER_PRIMARY_NAV = [
  { label: "Home", href: "/", intent: "personalized" },
  { label: "Discover", href: "/discover", intent: "explore" },
  { label: "PromoCard", href: "/card", intent: "spend" },
  { label: "Rewards", href: "/rewards", intent: "value" },
  { label: "You", href: "/profile", intent: "identity" },
] as const;
