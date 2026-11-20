import { supabase } from "@/integrations/supabase/client";
import { validateSignupEligibility, type SignupEligibilityCode } from "@promorang/shared";

const KNOWN = ["COUNTRY_REQUIRED", "INVALID_COUNTRY", "DOB_REQUIRED", "INVALID_DOB", "UNDERAGE", "SIGN_IN_REQUIRED"] as const;

export type EligibilityMessageCode = (typeof KNOWN)[number];

export function eligibilityCodeFromMessage(message: string): EligibilityMessageCode | null {
  return KNOWN.find((code) => message.includes(code)) ?? null;
}

export function clientEligibilityCode(input: { countryCode?: string | null; dob?: string | null }): SignupEligibilityCode | null {
  return validateSignupEligibility(input);
}

function functionMissing(message: string) {
  return /schema cache|could not find the function|PGRST202|404/i.test(message);
}

/** Persists country and DOB. A missing RPC (migration not applied yet) does not throw. */
export async function recordSignupEligibility(input: {
  countryCode: string;
  dob: string;
  source?: "signup" | "user_confirmed";
}) {
  const code = validateSignupEligibility(input);
  if (code) {
    return { error: new Error(code), missingFunction: false };
  }
  const { error } = await supabase.rpc("record_signup_eligibility", {
    p_country_code: input.countryCode.toUpperCase(),
    p_dob: input.dob,
    p_source: input.source ?? "signup",
  });
  if (!error) return { error: null, missingFunction: false };
  if (functionMissing(error.message)) return { error: null, missingFunction: true };
  return { error, missingFunction: false };
}
