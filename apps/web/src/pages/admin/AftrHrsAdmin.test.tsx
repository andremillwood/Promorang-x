import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AFTRHRS_ADMIN_COPY } from "@promorang/shared";
import AftrHrsAdmin from "./AftrHrsAdmin";

const admin = vi.hoisted(() => ({
  data: undefined as Record<string, unknown> | undefined,
  isLoading: false,
  isError: false,
  token: "test-token",
  update: { mutateAsync: vi.fn() },
  updatePass: { mutate: vi.fn() },
}));

vi.mock("@/hooks/useAftrHrs", () => ({
  useAftrHrsAdmin: () => admin,
}));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

let root: Root;
let container: HTMLDivElement;

const renderAdmin = async () => {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <AftrHrsAdmin />
      </MemoryRouter>,
    );
  });
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  admin.data = undefined;
  admin.isLoading = false;
  admin.isError = false;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

describe("AftrHrs admin page language", () => {
  const source = readFileSync(resolve(__dirname, "./AftrHrsAdmin.tsx"), "utf8");

  it("speaks in plain language instead of operator jargon", () => {
    expect(source).not.toMatch(/FAQ JSON|Claims open|Page mode|Export CSV|Reinstate|admin-editable|Digital allocation/);
    expect(source).not.toMatch(/uppercase tracking-\[0\./);
    expect(source).toContain("AFTRHRS_ADMIN_COPY");
    expect(source).toContain("guestPassType");
    expect(source).toContain("adminPassStatus");
    expect(source).toContain("copy.faqsTitle");
    expect(AFTRHRS_ADMIN_COPY.faqsTitle).toBe("Questions guests ask");
    expect(AFTRHRS_ADMIN_COPY.save).toMatch(/tonight/i);
  });

  it("shows the night desk in everyday words once data loads", async () => {
    admin.data = {
      remaining: 12,
      edition: {
        digital_allocation: 30,
        claims_open: true,
        published: true,
        page_mode: "live",
        venue_policies: { entry_policy: "Arrive before 11:30 PM." },
        faqs: [{ question: "When is AftrHrs?", answer: "Every Friday." }],
      },
      funnel: { landing_view: 40, moment_join: 8, pass_secured: 2, checked_in: 1 },
      passes: [
        { id: "pass-1", unique_code: "AH-A40022461", pass_type: "digital-free", status: "active" },
      ],
      ambassadors: [{ name: "AftrHrs Field", allocation: 15, distributed: 0, tracking_code: "AH-FIELD" }],
    };
    await renderAdmin();
    expect(container).toHaveTextContent("Run tonight");
    expect(container).toHaveTextContent("People can still claim a free digital pass");
    expect(container).toHaveTextContent("Questions guests ask");
    expect(container).toHaveTextContent("Digital free pass");
    expect(container).toHaveTextContent("Ready for the door");
    expect(container).toHaveTextContent("None of 15 invitations given out yet.");
    expect(container).toHaveTextContent("Download guest list");
    expect(container).not.toHaveTextContent("FAQ JSON");
    expect(container).not.toHaveTextContent("Claims open");
    expect(container).not.toHaveTextContent("digital-free");
    expect(container).not.toHaveTextContent("Export CSV");
  });
});
