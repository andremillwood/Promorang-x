import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { SceneWantSupport } from "./SceneWantSupport";
const mocks = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "person-1" } }) }));
vi.mock("@/hooks/useFindOrAsk", () => ({ useSupportFindOrAskDemand: () => ({ mutateAsync: mocks.mutate, isPending: false, isError: false }) }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function show() {
  const client = new QueryClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");
  render(<QueryClientProvider client={client}><MemoryRouter><SceneWantSupport id="want-1" sceneSlug="walks" /></MemoryRouter></QueryClientProvider>);
  return invalidate;
}
it("refreshes recorded support only after the canonical action succeeds", async () => {
  mocks.mutate.mockResolvedValue(1); const invalidate = show();
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByRole("button")).toBeDisabled());
  expect(mocks.mutate).toHaveBeenCalledWith("want-1");
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["scene", "walks"] });
});
it("does not mark failed support as added", async () => {
  mocks.mutate.mockRejectedValue(new Error("offline")); const invalidate = show();
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
  expect(invalidate).not.toHaveBeenCalled();
  expect(screen.getByRole("button")).toHaveTextContent("clarity.wantAction");
});
