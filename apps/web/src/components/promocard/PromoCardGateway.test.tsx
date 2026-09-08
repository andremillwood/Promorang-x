import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PromoCardGateway } from "./PromoCardGateway";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

let root: Root;
let container: HTMLDivElement;

const renderGateway = async () => {
  await act(async () => {
    root.render(
      <MemoryRouter>
        <PromoCardGateway />
      </MemoryRouter>,
    );
  });
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

describe("PromoCardGateway", () => {
  it("sells recognition and return instead of the redemption machine", async () => {
    await renderGateway();

    expect(container.textContent).toContain("Passed along, not advertised");
    expect(container.textContent).toContain("Use this.");
    expect(container.textContent).toContain("Come back.");
    expect(container.textContent).toContain("last time felt like it counted");
    expect(container.textContent).toContain("Places that want you back");
    expect(container.textContent).toContain("It counts when they see you");
    expect(container.textContent).toContain("Walking in does.");
    expect(container.textContent).not.toContain("Ambassador audience");
    expect(container.textContent).not.toContain("A merchant supplies a benefit");
  });

  it("keeps the PromoCard as the next object to take", async () => {
    await renderGateway();

    const cardLink = Array.from(container.querySelectorAll("a")).find((link) =>
      link.textContent?.includes("Get my PromoCard"),
    );
    expect(cardLink?.getAttribute("href")).toBe("/auth?mode=signup&next=/card");
  });
});
