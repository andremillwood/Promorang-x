import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nContext";
import Marketplace from "./Marketplace";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQuery: () => ({ data: [], isLoading: false, error: null }),
  };
});

let root: Root;
let container: HTMLDivElement;

const renderShop = async () => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={["/shop"]}>
        <I18nProvider>
          <Marketplace />
        </I18nProvider>
      </MemoryRouter>,
    );
  });
};

describe("Marketplace mobile copy", () => {
  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("keeps shop headline and body words separated", async () => {
    await renderShop();

    expect(container.textContent).toContain("Curated Passes. Guaranteed Value.");
    expect(container.textContent).toContain("Promorang curates experience packages with local partners.");
    expect(container.textContent).toContain("Buy or book");
    expect(container.textContent).toContain("Earn signal");
    expect(container.textContent).toContain("Unlock more");
    expect(container.textContent).not.toContain("CURATEDPASSES");
    expect(container.textContent).not.toContain("Buyorbook");
  });
});
