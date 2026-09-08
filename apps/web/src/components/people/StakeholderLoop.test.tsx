import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StakeholderPutInPass, StakeholderSurfaceLead } from "./StakeholderLoop";

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
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

describe("stakeholder surface lead", () => {
  it("sends a host into gathering, not a generic claim", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <StakeholderPutInPass role="host" />
        </MemoryRouter>,
      );
    });
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/create/moment");
    expect(container).toHaveTextContent("Gather");
  });

  it("names the world from the merchant lens", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <StakeholderSurfaceLead role="merchant" surface="world" />
        </MemoryRouter>,
      );
    });
    expect(container).toHaveTextContent("Where your perk can be used tonight.");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/stock");
  });
});
