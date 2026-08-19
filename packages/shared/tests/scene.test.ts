import { describe, expect, it } from "vitest";
import { getSceneHumanState, sceneLocation, type Scene } from "../src";

const scene: Scene = { id: "scene-1", slug: "night-market", title: "Night Market", description: "Food and music after dark.", city: "Kingston", country: "Jamaica", image_url: null, visibility: "public", status: "active", metadata: { tagline: "Eat, listen, linger." } };

describe("Scene human state", () => {
  it("invites a newcomer through a Moment", () => expect(getSceneHumanState(scene).ctaLabel).toBe("Join through a Moment"));
  it("recognizes an active returning person", () => expect(getSceneHumanState(scene, { scene_id: scene.id, user_id: "user-1", relationship: "participant", membership_state: "active", moments_joined: 2, moments_returned: 1, people_brought: 0, stories_shared: 0, last_seen_at: null }).title).toContain("came back"));
  it("uses human location language", () => expect(sceneLocation(scene)).toBe("Kingston, Jamaica"));
});
