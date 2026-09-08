import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PutUpFoundModal } from "./PutUpFoundModal";

vi.mock("@/i18n/I18nContext", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

let root: Root;
let container: HTMLDivElement;

async function renderModal(open = true) {
  await act(async () => {
    root.render(
      <PutUpFoundModal
        cityName="Kingston"
        defaultTitle="jerk on friday"
        open={open}
        onOpenChange={() => undefined}
        onPutUp={async () => undefined}
        trigger={<button type="button">Put this up</button>}
      />,
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
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("PutUpFoundModal", () => {
  it("opens the request form when fill=request lands on Discover", async () => {
    await renderModal(true);
    expect(document.body).toHaveTextContent("found.putUpTitle");
    expect(document.body).toHaveTextContent("found.putUpCopy");
  });
});
