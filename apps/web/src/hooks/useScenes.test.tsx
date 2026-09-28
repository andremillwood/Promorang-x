import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Scene } from "@promorang/shared";
import { useJoinScene } from "./useScenes";
const mocks = vi.hoisted(() => ({ upsert: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "person-1" } }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ upsert: mocks.upsert }) } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const scene = { id: "scene-1", slug: "walks" } as Scene;
function show() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const hook = renderHook(() => useJoinScene(scene), { wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> });
  return { hook, invalidate };
}
it("refreshes Today and the Scene only after membership succeeds", async () => {
  mocks.upsert.mockResolvedValue({ error: null });
  const { hook, invalidate } = show();
  await act(async () => { await hook.result.current.mutateAsync(); });
  expect(mocks.upsert).toHaveBeenCalledWith({ scene_id: "scene-1", user_id: "person-1", relationship: "participant", membership_state: "active" }, { onConflict: "scene_id,user_id,relationship" });
  for (const queryKey of [["scene", "walks"], ["movement-feed-scene-memberships"], ["experience-home"], ["experience-card"]]) expect(invalidate).toHaveBeenCalledWith({ queryKey });
});
it("does not refresh caches as if a failed follow succeeded", async () => {
  mocks.upsert.mockResolvedValue({ error: new Error("denied") });
  const { hook, invalidate } = show();
  await act(async () => { await expect(hook.result.current.mutateAsync()).rejects.toThrow("denied"); });
  expect(invalidate).not.toHaveBeenCalled();
});
