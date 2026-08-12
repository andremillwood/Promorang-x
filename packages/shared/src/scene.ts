export type SceneVisibility = "public" | "invite" | "private";
export type SceneStatus = "draft" | "active" | "paused" | "archived";
export type SceneRelationship = "participant" | "creator" | "host" | "venue" | "merchant" | "brand" | "agency" | "supporter";
export type SceneMembershipState = "invited" | "active" | "paused" | "left" | "removed";

export type SceneMetadata = {
  tagline?: string;
  welcome?: string;
  vibe?: string[];
  accessibility?: string[];
  recurring_ritual?: string;
  next_invitation?: string;
  hosts?: Array<{ id?: string; name: string; role?: string; avatar_url?: string }>;
  places?: Array<{ id?: string; name: string; detail?: string; image_url?: string }>;
};

export type Scene = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  city: string | null;
  country: string | null;
  image_url: string | null;
  visibility: SceneVisibility;
  status: SceneStatus;
  metadata: SceneMetadata;
  created_at?: string;
  updated_at?: string;
};

export type SceneMembership = {
  scene_id: string;
  user_id: string;
  relationship: SceneRelationship;
  membership_state: SceneMembershipState;
  moments_joined: number;
  moments_returned: number;
  people_brought: number;
  stories_shared: number;
  last_seen_at: string | null;
};

export type SceneHumanState = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
};

export function getSceneHumanState(scene: Scene, membership?: SceneMembership | null): SceneHumanState {
  if (scene.status === "paused") return { eyebrow: "Between gatherings", title: "This Scene is taking a breath.", body: "Keep it close. The next gathering will appear when the people shaping it are ready.", ctaLabel: "Keep this Scene" };
  if (membership?.membership_state === "invited") return { eyebrow: "An invitation for you", title: "Someone thinks you belong in this room.", body: scene.metadata.welcome || "Look around, meet the people shaping it, and join when it feels like your world.", ctaLabel: "Accept invitation" };
  if (membership?.membership_state === "active") {
    const returning = membership.moments_returned > 0;
    return { eyebrow: returning ? "A familiar place" : "You’re part of this", title: returning ? "The Scene knows you came back." : "Your place in the Scene has started.", body: scene.metadata.next_invitation || "Stay close to the people, places and Moments that keep this Scene alive.", ctaLabel: "See what’s next" };
  }
  return { eyebrow: "Find your people", title: scene.metadata.tagline || `Step into ${scene.title}.`, body: scene.metadata.welcome || "See what it feels like, who makes it welcoming, and which Moment is the easiest way in.", ctaLabel: "Join through a Moment" };
}

export function sceneLocation(scene: Pick<Scene, "city" | "country">) {
  return [scene.city, scene.country].filter(Boolean).join(", ") || "Wherever the Scene gathers";
}
