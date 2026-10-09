import { useEffect } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider, useI18n } from "./I18nContext";
import { currentUiLocale, getSavedLocalePreference, saveLocalePreference } from "./geo-locale";

const geo = vi.hoisted(() => ({ resolve: undefined as undefined | ((value: { locale: "es-419" }) => void) }));
vi.mock("./geo-locale", async (original) => ({
  ...await original<typeof import("./geo-locale")>(),
  detectGeoIpLocale: () => new Promise(resolve => { geo.resolve = resolve; }),
}));

function Probe({ suggestMarket = false }: { suggestMarket?: boolean }) {
  const { locale, setLocale } = useI18n();
  useEffect(() => { if (suggestMarket) setLocale("en", { explicit: false }); }, [setLocale, suggestMarket]);
  return <><output>{locale}</output><button onClick={() => setLocale("en")}>Choose English</button></>;
}

beforeEach(() => {
  window.localStorage.clear();
  for (const name of ["promorang_locale", "promorang_locale_explicit"]) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  window.history.replaceState({}, "", "/");
  geo.resolve = undefined;
});
afterEach(() => { cleanup(); window.history.replaceState({}, "", "/"); });

describe("language precedence", () => {
  it("preserves a URL language against a market suggestion and across unprefixed navigation", () => {
    saveLocalePreference("en");
    window.history.replaceState({}, "", "/es/discover");
    render(<I18nProvider><Probe suggestMarket /></I18nProvider>);
    expect(screen.getByText("es-419")).toBeInTheDocument();
    expect(getSavedLocalePreference()).toBe("es-419");
    expect(document.documentElement.lang).toBe("es-419");
    window.history.replaceState({}, "", "/privacy");
    expect(currentUiLocale()).toBe("es-419");
  });
  it("does not let a late geo response overwrite a manual choice", async () => {
    render(<I18nProvider><Probe /></I18nProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Choose English" }));
    await act(async () => { geo.resolve?.({ locale: "es-419" }); });
    expect(screen.getByText("en")).toBeInTheDocument();
    expect(getSavedLocalePreference()).toBe("en");
  });
});
