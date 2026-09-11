import { describe, expect, it, vi } from "vitest";
import { fetchMomentGoingCount } from "./moment-going";

describe("fetchMomentGoingCount", () => {
  it("uses the Moment going RPC so guest RSVPs are included", async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: 14, error: null }),
      from: vi.fn(),
    };
    await expect(fetchMomentGoingCount(client, "moment-1")).resolves.toBe(14);
    expect(client.rpc).toHaveBeenCalledWith("moment_going_count", { p_moment_id: "moment-1" });
    expect(client.from).not.toHaveBeenCalled();
  });

  it("falls back to account joiners when the RPC is missing", async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "function moment_going_count does not exist" } }),
      from: vi.fn().mockReturnValue({
        select: () => ({
          eq: () => Promise.resolve({ count: 3, error: null }),
        }),
      }),
    };
    await expect(fetchMomentGoingCount(client, "moment-1")).resolves.toBe(3);
  });
});
