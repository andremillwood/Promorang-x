import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { NightTrail } from "./SignatureObjects";

it("gives multiple journeys unique accessible region labels", () => {
  render(<><NightTrail eyebrow="For you" title="Your journey" steps={[]} /><NightTrail eyebrow="For partners" title="Your operating route" steps={[]} /></>);
  const participant = screen.getByRole("region", { name: "Your journey" });
  const partner = screen.getByRole("region", { name: "Your operating route" });
  expect(participant.getAttribute("aria-labelledby")).not.toBe(partner.getAttribute("aria-labelledby"));
});
