import { afterEach, describe, expect, it, vi } from "vitest";
import { shareSceneLink } from "./scene-share";
afterEach(() => vi.unstubAllGlobals());
describe("Scene sharing truth", () => {
  it("confirms copying only after the clipboard succeeds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect(await shareSceneLink("Night walks", "https://example.com/scenes/walks")).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://example.com/scenes/walks");
  });
  it("does not turn denied clipboard access into success", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    await expect(shareSceneLink("Scene", "https://example.com")).rejects.toThrow("denied");
  });
  it("does not count cancelled native sharing", async () => {
    vi.stubGlobal("navigator", { share: vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError")) });
    expect(await shareSceneLink("Scene", "https://example.com")).toBe("cancelled");
  });
  it("reports a completed native share separately from a copy", async () => {
    vi.stubGlobal("navigator", { share: vi.fn().mockResolvedValue(undefined) });
    expect(await shareSceneLink("Scene", "https://example.com")).toBe("shared");
  });
});
