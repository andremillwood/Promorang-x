import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromoCardFace } from "./SignatureObjects";

describe("PromoCardFace brand lockup", () => {
  it("prints the PROMORANG mark and orange wordmark on the plastic face", () => {
    const { container } = render(
      <PromoCardFace holder="Maya" available="Use this" limit="Coffee on us" places="Sea Deck" />,
    );

    const card = container.querySelector('[aria-label="PromoCard"]');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent("PROMORANG");
    expect(card).toHaveTextContent("PromoCard");

    const mark = container.querySelector('img[alt="PROMORANG"]');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveAttribute("src");

    const wordmark = Array.from(container.querySelectorAll("p")).find((node) => node.textContent === "PROMORANG");
    expect(wordmark).toHaveClass("text-primary");
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
