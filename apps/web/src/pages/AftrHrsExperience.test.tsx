import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AftrHrsExperience from "./AftrHrsExperience";
import { AFTRHRS_COPY, authPathForAftrHrsClaim } from "@promorang/shared";
import { AFTRHRS_FALLBACK } from "@/hooks/useAftrHrs";

const snapshot = vi.hoisted(() => ({
  current: structuredClone(AFTRHRS_FALLBACK),
}));

vi.mock("@/hooks/useAftrHrs", () => ({
  useAftrHrs: () => ({
    data: snapshot.current,
    remaining: snapshot.current.edition.remaining,
    soldOut: snapshot.current.edition.soldOut,
    user: null,
    claim: { mutateAsync: vi.fn() },
    join: { mutateAsync: vi.fn() },
    ambassadorRequest: { mutate: vi.fn() },
    follow: { mutate: vi.fn() },
    track: { mutate: vi.fn() },
  }),
}));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("qrcode.react", () => ({ QRCodeSVG: () => null }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() } }));

let root: Root;
let container: HTMLDivElement;

describe("AftrHrs landing states", () => {
  beforeEach(() => {
    snapshot.current = structuredClone(AFTRHRS_FALLBACK);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  it("sends unauthenticated claimers back to the claim flow after login", () => {
    expect(authPathForAftrHrsClaim()).toContain("next=%2Fmoments%2Faftrhrs%3Fclaim%3D1");
  });

  it("keeps the night open after digital inventory is gone", async () => {
    snapshot.current.edition.digital_claimed = 20;
    snapshot.current.edition.remaining = 0;
    snapshot.current.edition.soldOut = true;
    const client = new QueryClient();
    await new Promise<void>((resolve) => {
      root.render(
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <AftrHrsExperience />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      queueMicrotask(resolve);
    });
    expect(container.textContent).toContain(AFTRHRS_COPY.soldOutHeadline);
    expect(container.textContent).toContain("Find an AftrHrs Ambassador");
    expect(container.textContent).toContain("Join the AftrHrs Waitlist");
    expect(container.textContent).not.toContain("Event unavailable");
  });
});
