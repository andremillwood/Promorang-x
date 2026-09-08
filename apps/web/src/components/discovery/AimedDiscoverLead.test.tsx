import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePromoCardAim } from "@promorang/shared";
import { AimedDiscoverLead } from "./AimedDiscoverLead";

let root: Root;
let container: HTMLDivElement;

async function renderLead(authenticated = false) {
  const aim = resolvePromoCardAim("food")!;
  await act(async () => {
    root.render(
      <MemoryRouter>
        <AimedDiscoverLead aim={aim} authenticated={authenticated} />
      </MemoryRouter>,
    );
  });
}

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
  vi.unstubAllGlobals();
});

describe("AimedDiscoverLead", () => {
  it("tells a guest the answer lands on the aimed card", async () => {
    await renderLead(false);
    expect(container).toHaveTextContent("On your card · Food");
    expect(container).toHaveTextContent("Your card is set for food");
    expect(container).toHaveTextContent("Answer a live question and it lands there");
    expect(container).toHaveTextContent("Unlock this");
    expect(container.querySelector("a")?.getAttribute("href")).toContain("next=%2Fcard%3Faim%3Dfood");
    expect(container).not.toHaveTextContent("create an account");
    expect(container).not.toHaveTextContent("Available to spend");
  });

  it("sends a signed-in member back to the aimed card", async () => {
    await renderLead(true);
    expect(container).toHaveTextContent("Open your PromoCard");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/card?aim=food");
  });
});
