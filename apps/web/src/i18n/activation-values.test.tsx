import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ActivationCommercialSetup } from "@/components/activation/ActivationCommercialSetup";
import type { ReturnTypeOfActivationOperations } from "@/hooks/useActivationOperations.types";
import { withI18n } from "@/test/withI18n";
import { translations } from "./translations";
import { activationValueLabel } from "./activation-values";

vi.mock("@/hooks/useOffers", () => ({ useOwnerOffers: () => ({ data: [], isLoading: false }) }));
afterEach(cleanup);

describe.each(["en", "es-419", "pt-BR"] as const)("activation controls in %s", (locale) => {
  it("submits stable protocol values when translated evidence and category options are selected", () => {
    window.history.replaceState({}, "", "/");
    const mutate = vi.fn();
    const operations = {
      people: { data: [] }, operations: { data: { commercialRules: [] } },
      addCommercialRule: { mutate, isPending: false },
      addValueCommitment: { mutate: vi.fn(), isPending: false },
    } as unknown as ReturnTypeOfActivationOperations;
    const copy = translations[locale];
    render(withI18n(<ActivationCommercialSetup operations={operations} />, locale));
    fireEvent.change(screen.getByLabelText(copy["activationSetup.bucket"]), { target: { value: "participant_value" } });
    const evidence = screen.getByLabelText(copy["activationSetup.evidence"]);
    expect(screen.getByRole("option", { name: copy["web.activationEnum.repeat_purchase"] })).toHaveValue("repeat_purchase");
    fireEvent.change(evidence, { target: { value: "repeat_purchase" } });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: copy["activationSetup.saveRule"] }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ bucket: "participant_value", requiredEvidence: "repeat_purchase", percentage: 12 }), expect.any(Object));
  });
  it("translates known event labels and preserves unrecognized server values", () => {
    const t = (key: keyof typeof translations.en) => translations[locale][key];
    expect(activationValueLabel(t, "proof_verified")).toBe(translations[locale]["web.activationEnum.proof_verified"]);
    expect(activationValueLabel(t, "future_event")).toBe("future_event");
    expect(activationValueLabel(t, "constructor")).toBe("constructor");
  });
});
