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
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
