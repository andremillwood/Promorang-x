import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useRoleWorkspaceTab } from "./useRoleWorkspaceTab";

function Workspace() {
  const { activeTab, setActiveTab } = useRoleWorkspaceTab("overview", ["overview", "proof"]);
  const navigate = useNavigate();
  const location = useLocation();
  return <><p data-testid="selected">{activeTab}</p><p data-testid="url">{location.search}</p><button onClick={() => setActiveTab("proof")}>Proof</button><button onClick={() => navigate(-1)}>Back</button><button onClick={() => navigate("?keep=1")}>Reset</button></>;
}

describe("workspace URL selection", () => {
  it("retains unrelated parameters and follows browser history", () => {
    render(<MemoryRouter initialEntries={["/?view=studio&keep=1"]}><Workspace /></MemoryRouter>);
    fireEvent.click(screen.getByText("Proof", { selector: "button" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("proof");
    expect(screen.getByTestId("url")).toHaveTextContent("view=studio&keep=1&tab=proof");
    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByTestId("selected")).toHaveTextContent("overview");
  });
  it("falls back for invalid tabs and resets when tab is removed", () => {
    render(<MemoryRouter initialEntries={["/?tab=missing"]}><Workspace /></MemoryRouter>);
    expect(screen.getByTestId("selected")).toHaveTextContent("overview");
    fireEvent.click(screen.getByText("Proof", { selector: "button" }));
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByTestId("selected")).toHaveTextContent("overview");
  });
});
