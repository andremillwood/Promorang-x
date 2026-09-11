import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackMetaEvent } from "@/components/MetaPixel";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";

export default function BillingResult() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const success = params.get("status") === "success";
  const sessionId = params.get("session_id");
  const [verification, setVerification] = useState<"idle" | "checking" | "paid" | "pending">(success && sessionId ? "checking" : "idle");

  useEffect(() => {
    if (!success || !sessionId) return;
    let active = true;

    const verifyPurchase = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session?.access_token) throw new Error("Authentication required");
        const response = await fetch(`${API_BASE_URL}/payments/checkout/session/${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok || !payload.data?.paid) {
          if (active) setVerification("pending");
          return;
        }

        const storageKey = `promorang_meta_purchase_${sessionId}`;
        if (!sessionStorage.getItem(storageKey)) {
          trackMetaEvent("Purchase", {
            content_ids: payload.data.plan_id ? [payload.data.plan_id] : [],
            content_type: "product",
            currency: payload.data.currency,
            value: payload.data.value,
          }, `stripe_${sessionId}`);
          sessionStorage.setItem(storageKey, "1");
        }
        if (active) setVerification("paid");
      } catch {
        if (active) setVerification("pending");
      }
    };

    void verifyPurchase();
    return () => { active = false; };
  }, [sessionId, success]);

  const confirmed = verification === "paid";
  const title = confirmed ? t("billing.confirmed") : success ? t("billing.received") : t("billing.update");
  const message = confirmed
    ? t("billing.confirmedCopy")
    : success
      ? t("billing.receivedCopy")
      : t("billing.updateCopy");

  return <main className="grid min-h-screen place-items-center bg-[#090909] px-5 text-white"><section className="max-w-xl rounded-[2rem] border border-white/10 bg-[#141414] p-8 text-center md:p-12">{verification === "checking" ? <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /> : <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />}<h1 className="mt-6 text-4xl font-black tracking-[-.04em]">{title}</h1><p className="mt-4 text-sm leading-7 text-white/55">{message}</p><Button className="mt-7" asChild><Link to="/wallet">{t("billing.openWallet")}</Link></Button></section></main>;
}
