import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { translations } from "@/i18n/translations";
import PeopleHome from "./PeopleHome";

const state = vi.hoisted(() => ({
  city: { id: "kingston", name: "Kingston & St. Andrew" },
  error: false,
  fetching: false,
  retry: vi.fn(),
  moments: [] as Array<Record<string, unknown>>,
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { email: "alex@example.invalid" }, profile: { full_name: "Alex Morgan" }, activeRole: "participant", roles: ["participant"] }) }));
vi.mock("@/contexts/MarketContext", () => ({ useMarket: () => ({ city: state.city }) }));
vi.mock("@/hooks/usePeopleExperience", () => ({ useExperienceHome: () => ({ data: { communities: [], card: {} }, isLoading: false }) }));
vi.mock("@/hooks/useCanonicalMomentFeed", () => ({ useCanonicalMomentFeed: () => ({ data: { moments: state.moments }, isLoading: false, isError: state.error, isFetching: state.fetching, refetch: state.retry }) }));
vi.mock("@/hooks/useContentDistribution", () => ({ useContentDrops: () => ({ data: [] }) }));
vi.mock("@/components/discovery/FindOrAskDemandRail", () => ({ FindOrAskDemandRail: () => null }));
vi.mock("@/components/SaveButton", () => ({ SaveButton: () => null }));
vi.mock("@/components/feed/ParticipationFeed", () => ({ ParticipationFeed: () => null }));
vi.mock("@/components/discovery/FindOrAskEntry", () => ({ FindOrAskEntry: () => <input aria-label="Find or ask" /> }));
vi.mock("@/i18n/I18nContext", () => {
  const t = (key: keyof typeof translations.en, vars: Record<string, string> = {}) => (translations.en[key] || key).replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] || name);
  return { useI18n: () => ({ t, locale: "en" }), translate: t };
});
vi.mock("@/components/promorang/SignatureObjects", () => ({ PromoCardFace: () => null, TicketPass: () => null, PaperReceipt: () => null }));
vi.mock("@/components/people/ExperienceShell", () => ({
  ExperienceShell: ({ hero, children }: { hero?: React.ReactNode; children: React.ReactNode }) => <main>{hero}{children}</main>,
  QuietEmpty: ({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) => <div><h3>{title}</h3><p>{copy}</p>{action}</div>,
  WorldInvitationCard: () => null,
}));

beforeEach(() => {
  state.error = false;
  state.fetching = false;
  state.retry.mockClear();
  state.city = { id: "kingston", name: "Kingston & St. Andrew" };
  state.moments = [
    { id: "kingston-music", title: "Kingston music", location: "Dulce Lounge, Kingston", starts_at: "2026-10-16T23:00:00Z", lifecycle: "upcoming" },
    { id: "miami-music", title: "Miami music", location: "Miami", starts_at: "2026-10-16T23:00:00Z", lifecycle: "upcoming" },
    { id: "ended", title: "Ended event", location: "Kingston", starts_at: "2026-10-14T23:00:00Z", lifecycle: "recently_ended" },
  ];
});

describe("participant dashboard", () => {
  it("shows Kingston listings under the composite city label and excludes remote or ended events", () => {
    render(<MemoryRouter><PeopleHome /></MemoryRouter>);
    const calendar = document.querySelector('[aria-labelledby="now-next-title"]') as HTMLElement;
    expect(within(calendar).getByRole("link", { name: /Kingston music/ })).toHaveAttribute("href", "/moments/kingston-music");
    expect(within(calendar).queryByText("Miami music")).not.toBeInTheDocument();
    expect(within(calendar).queryByText("Ended event")).not.toBeInTheDocument();
  });
  it("uses the selected market when the visitor changes cities", () => {
    state.city = { id: "miami", name: "Miami" };
    render(<MemoryRouter><PeopleHome /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /Miami music/ })).toBeInTheDocument();
    expect(screen.queryByText("Kingston music")).not.toBeInTheDocument();
  });
  it("lets the user retry a calendar failure and disables retry during the request", () => {
    state.error = true;
    const { rerender } = render(<MemoryRouter><PeopleHome /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(state.retry).toHaveBeenCalledOnce();
    state.fetching = true;
    rerender(<MemoryRouter><PeopleHome /></MemoryRouter>);
    expect(screen.getByRole("button", { name: /trying/i })).toBeDisabled();
  });
});
