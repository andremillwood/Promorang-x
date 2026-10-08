import { beforeEach, describe, expect, it, vi } from "vitest";
const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/marketing-attribution", () => ({ trackGrowthEvent: track }));
import { acquisitionJourney, trackBusinessStep } from "./business-growth";
describe("commercial acquisition", () => {
  beforeEach(() => { track.mockClear(); sessionStorage.clear(); });
  it.each(["/business/start", "/pricing", "/for-merchants", "/for-brands", "/for-communities", "/create/campaign", "/dashboard/campaigns/owned"])("classifies %s", path => expect(acquisitionJourney(path)).toBe("commercial"));
  it.each(["/today", "/moments/one", "/discover", "/wallet", "/pricing-fake", "/promopush/creator", "/promopush/promoter", "/promopush/careers"])("keeps %s participant", path => expect(acquisitionJourney(path)).toBe("participant"));
  it("preserves business auth intent", () => {
    expect(acquisitionJourney("/auth", "?next=%2Fbusiness%2Fstart%3Fresume%3D1")).toBe("commercial");
    expect(acquisitionJourney("/auth", "?role=merchant")).toBe("commercial");
    expect(acquisitionJourney("/auth", "?next=%2Ftoday")).toBe("participant");
  });
  it("bounds and deduplicates events without brief contents", () => {
    for (const event of ["started", "completed", "auth_started", "auth_resumed", "continued"] as const) {
      trackBusinessStep("attempt-test", event, "recommendation");
      trackBusinessStep("attempt-test", event, "recommendation");
    }
    expect(track).toHaveBeenCalledTimes(5);
    expect(track.mock.calls.every(([event]) => Object.keys(event.properties).sort().join() === "navigator_event,step")).toBe(true);
    expect(new Set(track.mock.calls.map(([event]) => event.idempotencyKey)).size).toBe(5);
  });
});
