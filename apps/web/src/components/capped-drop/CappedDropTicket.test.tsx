import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { CappedDropTicket } from "./CappedDropTicket";

it("shows the server count and hides almost-gone copy when more than 10 percent remain", () => {
  render(
    <CappedDropTicket
      kicker="Only 100"
      title="Friday drop"
      detail="37 of 100 left"
      stub="37"
      stubLabel="Left"
    />
  );
  expect(screen.getByText("37 of 100 left")).toBeTruthy();
  expect(screen.queryByText("Almost gone")).toBeNull();
});

it("shows almost-gone only when that label is passed from a true count", () => {
  render(
    <CappedDropTicket
      kicker="Only 100"
      title="Friday drop"
      detail="8 of 100 left"
      stub="8"
      stubLabel="Left"
      almostGoneLabel="Almost gone"
    />
  );
  expect(screen.getByText("Almost gone")).toBeTruthy();
});
