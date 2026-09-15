import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  NextMove,
  OutcomeProgress,
  WorkspaceSwitcher,
  type OutcomeStage,
} from "./foundation";
import { PromoCardV2 } from "./PromoCardV2";
import { OpportunityCard } from "./OpportunityCard";

describe("Promorang UI V2 foundation", () => {
  it("exposes the dominant next move as a labelled region", () => {
    render(
      <NextMove
        title="Launch your first promotion"
        description="Create one useful offer and get it in front of customers."
        action={<button type="button">Create promotion</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Launch your first promotion" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create promotion" })).toBeInTheDocument();
  });

  it("marks the current outcome stage for assistive technology", () => {
    const stages: OutcomeStage[] = [
      { id: "ready", label: "Business ready", status: "complete" },
      { id: "live", label: "Promotion live", status: "current" },
      { id: "customer", label: "First verified customer", status: "upcoming" },
    ];

    render(<OutcomeProgress stages={stages} />);

    const currentMarker = screen.getByText("2").closest("span");
    expect(currentMarker).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("1/3 complete")).toBeInTheDocument();
  });

  it("changes workspace using an explicit controlled value", () => {
    const onChange = vi.fn();
    render(
      <WorkspaceSwitcher
        value="personal"
        onChange={onChange}
        options={[
          { id: "personal", label: "Personal", role: "participant" },
          { id: "merchant:1", label: "Dulce Lounge", role: "merchant", detail: "Merchant" },
        ]}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Workspace" }), {
      target: { value: "merchant:1" },
    });

    expect(onChange).toHaveBeenCalledWith("merchant:1");
  });

  it("communicates PromoCard state without relying on color", () => {
    render(
      <PromoCardV2
        model={{
          state: "ready",
          holder: "Andre",
          headline: "Encore access is ready",
          detail: "Show this at the door.",
          places: "Oasis",
          action: "Use it",
          footerCue: "Claim, then use",
          credential: "ENCORE25",
          canFlip: true,
        }}
      />,
    );

    expect(screen.getByRole("article", { name: /PromoCard for Andre/i })).toHaveAccessibleName(/Ready to use/i);
    expect(screen.getByText("ENCORE25")).toBeInTheDocument();
  });

  it("keeps opportunity value and proof explicit", () => {
    render(
      <OpportunityCard
        title="Store visit campaign"
        description="Visit a participating location and publish one approved story."
        value="J$8,000"
        proof="Verified store visit + approved story"
        actionLabel="View opportunity"
        action={<a href="/earn/store-visit">View opportunity</a>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Store visit campaign" })).toBeInTheDocument();
    expect(screen.getByText("J$8,000")).toBeInTheDocument();
    expect(screen.getByText("Verified store visit + approved story")).toBeInTheDocument();
  });
});
