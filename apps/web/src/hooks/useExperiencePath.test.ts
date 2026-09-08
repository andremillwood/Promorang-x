import { describe, expect, it } from "vitest";
import { experiencePathFor } from "./useExperiencePath";

describe("experiencePathFor", () => {
  it("keeps the preview role on live-loop hops", () => {
    expect(experiencePathFor("/app-preview", "?role=creator", "/earn")).toBe("/app-preview/earn?role=creator");
    expect(experiencePathFor("/app-preview", "?role=brand", "/stock")).toBe("/app-preview/stock?role=brand");
    expect(experiencePathFor("/app-preview", "?role=merchant", "/give?offer=9")).toBe(
      "/app-preview/give?offer=9&role=merchant",
    );
  });

  it("forwards the role onto setup screens that are not preview-wrapped", () => {
    expect(experiencePathFor("/app-preview", "?role=merchant", "/dashboard/venues/add")).toBe(
      "/dashboard/venues/add?role=merchant",
    );
    expect(experiencePathFor("/app-preview", "?role=brand", "/create/campaign")).toBe(
      "/create/campaign?role=brand",
    );
    expect(experiencePathFor("/app-preview", "?role=creator", "/content-drops")).toBe(
      "/content-drops?role=creator",
    );
  });

  it("does not rewrite paths outside preview", () => {
    expect(experiencePathFor("/dashboard", "?role=merchant", "/earn")).toBe("/earn");
  });
});
