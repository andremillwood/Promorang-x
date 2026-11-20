import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { completeProfileHref } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { supabase } from "@/integrations/supabase/client";

const sessionKey = (userId: string) => `promorang.eligibilityPrompt.${userId}`;

/**
 * Non-blocking reminder. The form itself is /complete-profile?next=<path>.
 * Shown once per browser session. Browsing stays available.
 */
export function ConfirmCountryPrompt() {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(sessionKey(user.id))) return;
    let cancelled = false;
    supabase.rpc("signup_eligibility_status").then(({ data, error }) => {
      if (cancelled || error || !data || typeof data !== "object") return;
      if ((data as { complete?: boolean }).complete === false) setVisible(true);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(sessionKey(user.id), "1");
    setVisible(false);
  };

  const href = completeProfileHref(`${location.pathname}${location.search}`);

  return (
    <div className="border-b border-[#171512]/10 bg-[#fff8ec] px-4 py-3 text-[#171512]">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black">{t("onboarding.confirmTitle")}</p>
          <p className="mt-1 text-xs leading-5 text-[#5c5348]">{t("onboarding.confirmBody")}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={dismiss} className="min-h-11 text-sm font-bold text-[#5c5348]">{t("onboarding.confirmLater")}</button>
          <Link to={href} className="inline-flex min-h-11 items-center text-sm font-black text-primary">{t("onboarding.confirmSave")}</Link>
        </div>
      </div>
    </div>
  );
}
