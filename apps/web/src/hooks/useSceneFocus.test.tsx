import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useScene } from "./useScenes";

const mocks = vi.hoisted(() => ({ requests: [] as Array<{ table: string; filters: Record<string, unknown> }>, focused: null as unknown }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (table: string) => {
    const filters: Record<string, unknown> = {};
    const request = { table, filters };
    mocks.requests.push(request);
    const result = () => ({ data: table === "scenes" ? { id: "scene-1", slug: "walks" } : table === "discovery_questions" && filters.id ? mocks.focused : [], error: null });
    const builder = {
      select: () => builder, order: () => builder, limit: () => builder, gt: () => builder, in: () => builder,
      eq: (key: string, value: unknown) => { filters[key] = value; return builder; },
      maybeSingle: async () => result(),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
    };
    return builder;
  } },
}));
afterEach(() => { cleanup(); mocks.requests.length = 0; mocks.focused = null; });
function show(wantId?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => useScene("walks", wantId), { wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
}
it("includes a linked Want outside the ranked list, scoped to the Scene and demand kind", async () => {
  mocks.focused = { id: "want-9", question: "More walks" };
  const { result } = show("want-9");
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.demand).toEqual([mocks.focused]);
  expect(mocks.requests).toContainEqual({ table: "discovery_questions", filters: { scene_id: "scene-1", semantic_kind: "demand", id: "want-9" } });
});
it("does not add an extra lookup for ordinary Scene visits", async () => {
  const { result } = show();
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocks.requests.filter((r) => r.table === "discovery_questions")).toHaveLength(1);
});
it("does not invent a contribution when the scoped record is unavailable", async () => {
  const { result } = show("missing");
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.demand).toEqual([]);
});
