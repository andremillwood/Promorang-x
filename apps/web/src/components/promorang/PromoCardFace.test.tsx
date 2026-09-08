import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PromoCardFace } from "./SignatureObjects";

let root: Root;
let container: HTMLDivElement;

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

describe("PromoCardFace brand lockup", () => {
  it("prints the PROMORANG mark and orange wordmark on the plastic face", async () => {
    await act(async () => {
      root.render(
        <PromoCardFace holder="Maya" available="Use this" limit="Coffee on us" places="Sea Deck" />,
      );
    });

    const card = container.querySelector('[aria-label="PromoCard"]');
    expect(card).toBeTruthy();
    expect(card?.textContent).toContain("PROMORANG");
    expect(card?.textContent).toContain("PromoCard");

    const mark = container.querySelector('img[alt="PROMORANG"]');
    expect(mark).toBeTruthy();
    expect(mark?.getAttribute("src")).toBeTruthy();

    const wordmark = Array.from(container.querySelectorAll("p")).find((node) => node.textContent === "PROMORANG");
    expect(wordmark?.className).toContain("text-primary");
    expect(card?.className).toContain("pr-plastic-card");
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(container.querySelector(".from-amber-200")).toBeNull();
  });

  it("keeps an empty city honest and flips a ready credential", async () => {
    await act(async () => {
      root.render(<PromoCardFace holder="Maya" />);
    });
    expect(container).toHaveTextContent("Nothing to show at the door");
    expect(container.querySelector('button[aria-label="Flip PromoCard to show the merchant"]')).toBeNull();

    await act(async () => {
      root.render(
        <PromoCardFace
          model={{
            state: "ready",
            holder: "Maya",
            headline: "Show this",
            detail: "Coffee on us",
            places: "Sea Deck",
            action: "Flip to show the merchant",
            footerCue: "Nothing is used until they validate it",
            issuer: "Sea Deck",
            issuerInitial: "S",
            credential: "COFFEE-TEST",
            canFlip: true,
          }}
        />,
      );
    });
    expect(container.querySelector('[aria-label="Sea Deck mark"]')?.textContent).toBe("S");
    const flip = Array.from(container.querySelectorAll("button")).find(
      (item) => item.getAttribute("aria-label") === "Flip PromoCard to show the merchant",
    );
    expect(flip).toBeTruthy();
    await act(async () => {
      flip?.click();
    });
    expect(container).toHaveTextContent("COFFEE-TEST");
    expect(container).toHaveTextContent("HOLD AT THE DOOR");
  });
});
