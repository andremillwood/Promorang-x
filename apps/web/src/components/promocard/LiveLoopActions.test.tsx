import { withI18n } from "@/test/withI18n";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LiveLoopActions } from "./LiveLoopActions";

const renderActions = (role: string, completedActionIds: string[] = []) => render(
  withI18n(<MemoryRouter>
    <LiveLoopActions role={role} completedActionIds={completedActionIds} />
  </MemoryRouter>),
);

describe("LiveLoopActions", () => {
  it.each([
    ["creator", "Publish a Release"],
    ["host", "Create tonight’s gathering"],
    ["merchant", "Put a perk up"],
    ["brand", "Fund a real benefit"],
  ])("shows %s-specific priorities", (role, firstAction) => {
    renderActions(role);
    expect(screen.getByRole("heading", { name: new RegExp(`${role} priorities`, "i") })).toBeInTheDocument();
    expect(screen.getByText(firstAction)).toBeInTheDocument();
    expect(screen.getByText("Do this next")).toBeInTheDocument();
    expect(screen.queryByText("Open PromoCard")).not.toBeInTheDocument();
  });

  it("acknowledges completed work and advances the next action", () => {
    renderActions("creator", ["publish-drop"]);
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Attach a room or perk")).toBeInTheDocument();
    expect(screen.getByText("1 of 3 complete")).toBeInTheDocument();
  });

  it("recognizes a completed operating loop", () => {
    renderActions("merchant", ["put-perk-up", "share-perk", "validate"]);
    expect(screen.getByText("Loop active")).toBeInTheDocument();
    expect(screen.getByText("3 of 3 complete")).toBeInTheDocument();
  });
});
