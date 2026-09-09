import { describe, expect, it } from "vitest";
import {
  inferReleaseKind,
  isLiveRelease,
  releaseConsequenceHrefs,
  releaseFromDrop,
  releasePaysForAction,
  releaseSignalCopy,
  selectLiveReleaseSignal,
} from "./release";

const drop = {
  id: "seed-drop-release-room",
  title: "Release room: move the first-wave video",
  status: "active",
  objective_type: "content_launch",
  linked_moment_id: "demo-moment-1",
  metadata: { creator: "Maya Vale", release_kind: "song", linked_offer_id: "offer-9" },
  content_distribution_assets: [{ target_url: "https://open.spotify.com/track/1", media_url: "https://img" }],
};

describe("Release experience", () => {
  it("reads a song, news, episode, or video from a drop", () => {
    expect(inferReleaseKind({ metadata: { release_kind: "news" } })).toBe("news");
    expect(inferReleaseKind({ title: "Release room listen", platform: "spotify" })).toBe("song");
    expect(releaseFromDrop(drop).kind).toBe("song");
    expect(releaseFromDrop(drop).originalUrl).toContain("spotify");
    expect(releaseFromDrop(drop).linkedOfferId).toBe("offer-9");
  });

  it("pays on open and Promorang consequence, not on Shared", () => {
    expect(releasePaysForAction("click")).toBe(true);
    expect(releasePaysForAction("open")).toBe(true);
    expect(releasePaysForAction("rsvp")).toBe(true);
    expect(releasePaysForAction("share")).toBe(false);
    expect(releasePaysForAction("repost")).toBe(false);
    expect(releasePaysForAction("comment")).toBe(false);
  });

  it("surfaces one live Release and the attach/catch moves", () => {
    const release = releaseFromDrop(drop);
    expect(isLiveRelease(release)).toBe(true);
    expect(selectLiveReleaseSignal([release])?.id).toBe(drop.id);
    expect(releaseSignalCopy(release).verb).toBe("Listen");
    expect(releaseConsequenceHrefs(release).map((item) => item.id)).toEqual(["room", "perk"]);
    expect(releaseConsequenceHrefs({ id: "x" }).map((item) => item.id)).toEqual(["attach"]);
  });
});
