import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolvePromoPushEntry } from "@/hooks/usePromoPush";
import { useI18n } from "@/i18n/I18nContext";

export default function PromoPushEntry() {
  const { t } = useI18n();
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!code) {
        setError(t("pushEntry.missing"));
        return;
      }

      try {
        const entry = await resolvePromoPushEntry(code);
        if (!cancelled) {
          navigate(entry.redirect_url, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("pushEntry.resolveFail"));
        }
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [code, navigate, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4 text-white">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center">
        {error ? (
          <>
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#FFC300]" />
            <h1 className="text-2xl font-black">{t("pushEntry.unavailable")}</h1>
            <p className="mt-3 text-sm text-white/65">{error}</p>
            <Button asChild className="mt-6 bg-[#FF6A00] text-white hover:bg-[#e65f00]">
              <Link to="/discover/moments">
                {t("pushEntry.findMoments")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#FF6A00]" />
            <h1 className="text-2xl font-black">{t("pushEntry.routing")}</h1>
            <p className="mt-3 text-sm text-white/65">{t("pushEntry.routingCopy")}</p>
          </>
        )}
      </div>
    </div>
  );
}
