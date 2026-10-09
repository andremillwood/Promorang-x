import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { translations, type Locale } from "@/i18n/translations";
import { BUSINESS_OUTCOME_BRIEF_KEY } from "@/lib/business-outcomes";
import { BusinessOutcomeNavigator } from "./BusinessOutcomeNavigator";

vi.mock("@/lib/platform-funnels", () => ({ captureBusinessBrief: vi.fn().mockResolvedValue({ saved: true, leadId: "saved-lead" }), funnelRequest: vi.fn().mockResolvedValue(null) }));
const state = vi.hoisted(() => ({ locale: "es-419" as Locale }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/contexts/MarketContext", () => ({ useMarket: () => ({ city: { name: "Kingston" } }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ t: (key: keyof typeof translations.en, variables: Record<string, string | number> = {}) => translations[state.locale][key].replace(/\{\{(\w+)\}\}/g, (_, name) => String(variables[name] ?? name)) }) }));
beforeEach(() => window.localStorage.clear());

describe("localized commercial intake", () => {
  it.each([
    ["es-419", "Atrae clientes", "Un local que la gente visita", "Visitas verificadas", "Crear mi plan", "Guardar y continuar"],
    ["pt-BR", "Atraia clientes", "Um estabelecimento que as pessoas visitam", "Visitas verificadas", "Criar meu plano", "Salvar e continuar"],
  ] as const)("keeps canonical brief IDs and auth continuation in %s", async (locale, outcome, business, success, build, save) => {
    state.locale = locale;
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><BusinessOutcomeNavigator /></MemoryRouter></QueryClientProvider>);
    fireEvent.click(screen.getByText(outcome).closest("button")!);
    fireEvent.click(screen.getByText(business).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: success }));
    fireEvent.click(screen.getByRole("button", { name: build }));
    const brief = JSON.parse(window.localStorage.getItem(BUSINESS_OUTCOME_BRIEF_KEY)!);
    expect(brief).toMatchObject({ outcomeId: "bring-people-in", businessType: "place", successAction: "visits", programmeId: "first-50", geography: "Kingston" });
    const copy = translations[locale];
    expect(screen.queryByRole("link", { name: save })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(copy["funnel.name"]), { target: { value: "Test Host" } });
    fireEvent.change(screen.getByLabelText(copy["funnel.email"]), { target: { value: "host@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: copy["funnel.save"] }));
    const continuation = (await screen.findByRole("link", { name: save })).getAttribute("href")!;
    expect(new URLSearchParams(continuation.split("?")[1]).get("next")).toBe("/business/start?resume=1");
    expect(screen.queryByText("First 50")).not.toBeInTheDocument();
  });
});
