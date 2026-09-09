import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StakeholderPutInPass, StakeholderSetupPlaybook, StakeholderSurfaceLead } from "./StakeholderLoop";

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

describe("stakeholder setup playbook", () => {
  it("names the merchant venue-to-scanner path", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <StakeholderSetupPlaybook role="merchant" />
        </MemoryRouter>,
      );
    });
    expect(container).toHaveTextContent("Add the venue");
    expect(container).toHaveTextContent("Put one perk up");
    expect(container).toHaveTextContent("Validate at the counter");
    expect(container.querySelector('a[href="/dashboard/venues/add"]')).toBeTruthy();
    expect(container.querySelector('a[href="/stock"]')).toBeTruthy();
  });

  it("names the brand fund-then-fly path", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <StakeholderSetupPlaybook role="brand" />
        </MemoryRouter>,
      );
    });
    expect(container).toHaveTextContent("Fund a real benefit");
    expect(container).toHaveTextContent("Launch the campaign flight");
    expect(container.querySelector('a[href="/create/campaign"]')).toBeTruthy();
  });

  it("names the creator Release-then-attach path", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <StakeholderSetupPlaybook role="creator" />
        </MemoryRouter>,
      );
    });
    expect(container).toHaveTextContent("Publish a Release");
    expect(container).toHaveTextContent("Attach a room or perk");
    expect(container.querySelector('a[href="/content-drops"]')).toBeTruthy();
  });
});
