import { describe, expect, it } from "vitest";

import {
  ACTIVATION_CONTENT_NEEDS,
  ACTIVATION_CREATION_STEPS,
  ACTIVATION_READINESS_STAGES,
  ACTIVATION_REVIEW_DECISION_ACTIONS,
  ACTIVATION_REVIEW_LOOP,
  ACTIVATION_REVIEW_NEXT_DECISIONS,
  GEM_LANGUAGE,
  GEM_USD_VALUE,
  STAKEHOLDER_RETURN_BLUEPRINTS,
} from "../src/index";

describe("Promorang activation success contract", () => {
  it("keeps Scenes, Moments, content, people, value, and review in the guided journey", () => {
    expect(ACTIVATION_CREATION_STEPS.map((step) => step.id)).toEqual([
      "outcome",
      "scene_moment",
      "content_people",
      "value_launch",
      "return_review",
    ]);
    expect(ACTIVATION_CREATION_STEPS[1].detail).toMatch(/Scene/i);
    expect(ACTIVATION_CREATION_STEPS[2].detail).toMatch(/Content/i);
  });

  it("treats content as a complete invitation-to-memory lifecycle", () => {
    expect(ACTIVATION_CONTENT_NEEDS.map((need) => need.id)).toEqual([
      "invitation",
      "creator",
      "live",
      "memory",
    ]);
  });

  it("keeps Gems as the only canonical money-linked platform value", () => {
    expect(GEM_USD_VALUE).toBe(1);
    expect(GEM_LANGUAGE.valueStatement).toBe("1 Gem = 1 USD of platform value");
    expect(GEM_LANGUAGE.stakeholderMeaning).toMatch(/budgets/i);
    expect(GEM_LANGUAGE.stakeholderMeaning).toMatch(/payouts/i);
  });

  it("does not allow launch readiness to omit shared value or return review", () => {
    const readinessIds = ACTIVATION_READINESS_STAGES.map((stage) => stage.id);
    expect(readinessIds).toContain("shared_value");
    expect(readinessIds).toContain("bring_alive");
    expect(readinessIds.at(-1)).toBe("return_review");
  });

  it("reviews the human, content, Gem, commercial, Scene, and next-move loop", () => {
    expect(ACTIVATION_REVIEW_LOOP.map((stage) => stage.id)).toEqual([
      "people",
      "content",
      "contribution",
      "value",
      "commercial",
      "scene",
      "next",
    ]);
  });

  it("turns every review decision into a concrete next action", () => {
    const decisionIds = ACTIVATION_REVIEW_NEXT_DECISIONS.map((decision) => decision.id);
    expect(decisionIds).toEqual(["repeat", "improve", "invite", "fund", "close"]);
    for (const decisionId of decisionIds) {
      const action = ACTIVATION_REVIEW_DECISION_ACTIONS[decisionId];
      expect(action.title.length).toBeGreaterThan(5);
      expect(action.detail.length).toBeGreaterThan(20);
      expect(action.cta.length).toBeGreaterThan(3);
    }
  });

  it("defines distinct social and commercial return for every stakeholder", () => {
    const requiredRoles = ["participant", "creator", "host", "merchant", "venue", "brand", "agency"] as const;
    for (const role of requiredRoles) {
      const blueprint = STAKEHOLDER_RETURN_BLUEPRINTS[role];
      expect(blueprint.role).toBe(role);
      expect(blueprint.socialReturn.length).toBeGreaterThan(30);
      expect(blueprint.commercialReturn.length).toBeGreaterThan(30);
      expect(blueprint.metrics.length).toBeGreaterThanOrEqual(4);
    }
  });
});
