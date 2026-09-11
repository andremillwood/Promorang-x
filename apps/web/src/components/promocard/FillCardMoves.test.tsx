import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePromoCardAim } from "@promorang/shared";
import { FillCardMoves } from "./FillCardMoves";

let root: Root;
let container: HTMLDivElement;

async function renderMoves(authenticated = false) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={["/app-preview/card"]}>
        <FillCardMoves aim={resolvePromoCardAim("food")} authenticated={authenticated} />
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

describe("FillCardMoves", () => {
  it("prompts an empty Food card toward Discover, a request, a poll, and a moment", async () => {
    await renderMoves(false);
    expect(container).toHaveTextContent("Browse Food perks");
    expect(container).toHaveTextContent("Ask for Food");
    expect(container).toHaveTextContent("Start a poll");
    expect(container).toHaveTextContent("Host a moment");
    const hrefs = Array.from(container.querySelectorAll("a")).map((link) => link.getAttribute("href") || "");
    expect(hrefs.some((href) => href.includes("aim=food") && !href.includes("fill=request"))).toBe(true);
    expect(hrefs.some((href) => href.includes("fill=request"))).toBe(true);
    expect(hrefs.some((href) => href.includes("/app-preview/create") && href.includes("intent=answer"))).toBe(true);
    expect(hrefs.some((href) => href.includes("/app-preview/create/moment"))).toBe(true);
    expect(container).not.toHaveTextContent("Available to spend");
  });
});
