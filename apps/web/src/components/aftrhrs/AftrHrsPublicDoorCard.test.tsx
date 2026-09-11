import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AftrHrsPublicDoorCard } from "./AftrHrsPublicDoorCard";

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

describe("AftrHrsPublicDoorCard", () => {
  it("sends people to the AftrHrs door, not Kingston After Dark", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AftrHrsPublicDoorCard />
        </MemoryRouter>,
      );
    });
    expect(container).toHaveTextContent("AftrHrs");
    expect(container).toHaveTextContent("Get my AftrHrs pass");
    expect(container).toHaveTextContent("Kingston After Dark is not the event");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/aftrhrs");
  });
});
