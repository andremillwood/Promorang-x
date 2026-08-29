import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StickyJoinBar } from "./StickyJoinBar";

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/lib/hapticAudio", () => ({
  hapticAudio: { playClick: vi.fn() },
}));

const baseProps = {
  momentId: "moment-1",
  title: "Footprints Cafe Night",
  participantCount: 0,
  isJoined: false,
  isPast: false,
  isHost: false,
  isLoggedIn: false,
  onJoin: vi.fn(),
  accessState: {
    key: "available" as const,
    label: "Available" as const,
    ctaLabel: "Join This Moment",
    canAttempt: true,
    description: "This moment is open.",
  },
};

describe("StickyJoinBar", () => {
  it("keeps essential join actions on the rail instead of a swipe row", () => {
    const { container } = render(
      <StickyJoinBar
        {...baseProps}
        missionCount={3}
        missionPointTotal={175}
        onExploreMissions={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Sign In to Join" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3 Missions/ })).toBeInTheDocument();
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
    expect(container.querySelector(".touch-pan-x")).toBeNull();
  });

  it("opens extra squad actions in the Drawer component", () => {
    render(
      <StickyJoinBar
        {...baseProps}
        isLoggedIn
        isJoined
        participantCount={4}
        missionCount={3}
        missionPointTotal={175}
        onExploreMissions={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open moment quick details" }));

    expect(screen.getByText("Footprints Cafe Night")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ping Squad" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "You're Joined" }).length).toBeGreaterThan(0);
  });
});
