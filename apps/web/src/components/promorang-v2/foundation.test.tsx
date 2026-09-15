import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  NextMove,
  OutcomeProgress,
  WorkspaceSwitcher,
  type OutcomeStage,
} from "./foundation";

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
});
