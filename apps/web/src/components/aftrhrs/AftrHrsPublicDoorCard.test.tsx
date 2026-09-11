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
  it("opens the AftrHrs door pass without naming the scene as the event", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AftrHrsPublicDoorCard />
        </MemoryRouter>,
      );
    });
    expect(container).toHaveTextContent("Friday night");
    expect(container).toHaveTextContent("AftrHrs");
    expect(container).toHaveTextContent("RSVP for Friday");
    expect(container).toHaveTextContent("Friday moment in Kingston After Dark");
    expect(container).not.toHaveTextContent("Kingston After Dark · Friday");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/aftrhrs");
  });
});
