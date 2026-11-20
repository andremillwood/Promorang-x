import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sanitizeCompleteProfileNext } from "@promorang/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CountryPicker } from "@/components/auth/CountryPicker";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { clientEligibilityCode, eligibilityCodeFromMessage, recordSignupEligibility } from "@/lib/signup-eligibility";

/**
 * Existing signed-in accounts finish country and date of birth here.
 * Route: /complete-profile?next=<path>
 * `next` is a same-origin path. After a successful save the page replaces to it.
 * Capped-drop claims that fail with AGE_REQUIRED or COUNTRY_REQUIRED should
 * send the member to this route.
 */
export default function CompleteProfile() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = sanitizeCompleteProfileNext(searchParams.get("next"));
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    supabase.rpc("signup_eligibility_status").then(({ data, error }) => {
      if (cancelled || error || !data || typeof data !== "object") return;
      if ((data as { complete?: boolean }).complete) {
        navigate(next || "/today", { replace: true });
      }
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [loading, user, next, navigate]);

  const messageFor = (code: string) => {
    if (code === "UNDERAGE") return t("onboarding.underage");
    if (code === "DOB_REQUIRED" || code === "INVALID_DOB") return t("onboarding.dobRequired");
    return t("onboarding.countryRequired");
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const code = clientEligibilityCode({ countryCode, dob });
    if (code) {
      setMessage(messageFor(code));
      return;
    }
    setSaving(true);
    const result = await recordSignupEligibility({
      countryCode: countryCode || "",
      dob,
      source: "user_confirmed",
    });
    setSaving(false);
    if (result.error) {
      const known = eligibilityCodeFromMessage(result.error.message);
      setMessage(messageFor(known || "COUNTRY_REQUIRED"));
      return;
    }
    navigate(next || "/today", { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <p className="text-xs font-black uppercase tracking-wide text-primary">{t("onboarding.confirmTitle")}</p>
      <h1 className="mt-2 text-3xl font-black">{t("onboarding.homeCountry")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboarding.confirmBody")}</p>
      <form onSubmit={(event) => void save(event)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="complete-country">{t("auth.country")}</Label>
          <CountryPicker
            id="complete-country"
            value={countryCode}
            onChange={(code) => {
              setCountryCode(code);
              setMessage(null);
            }}
            placeholder={t("auth.countrySearch")}
            noMatchLabel={t("onboarding.noCountryMatch")}
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("onboarding.countryHelp")}</p>
        </div>
        <div>
          <Label htmlFor="complete-dob">{t("auth.dob")}</Label>
          <input
            id="complete-dob"
            type="date"
            value={dob}
            onChange={(event) => {
              setDob(event.target.value);
              setMessage(null);
            }}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("onboarding.dobHelp")}</p>
        </div>
        {message && <p className="text-sm text-destructive">{message}</p>}
        <Button type="submit" className="w-full" disabled={saving}>{t("onboarding.confirmSave")}</Button>
      </form>
    </main>
  );
}
