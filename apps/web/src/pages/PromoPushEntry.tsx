import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolvePromoPushEntry } from "@/hooks/usePromoPush";

export default function PromoPushEntry() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!code) {
        setError("Missing tracking code.");
        return;
      }

      try {
        const entry = await resolvePromoPushEntry(code);
        if (!cancelled) {
          navigate(entry.redirect_url, { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Tracking link could not be resolved.");
        }
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] px-4 text-white">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center">
        {error ? (
          <>
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#FFC300]" />
            <h1 className="text-2xl font-black">Link unavailable</h1>
            <p className="mt-3 text-sm text-white/65">{error}</p>
            <Button asChild className="mt-6 bg-[#FF6A00] text-white hover:bg-[#e65f00]">
              <Link to="/discover/moments">
                Find Moments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#FF6A00]" />
            <h1 className="text-2xl font-black">Routing to Moment</h1>
            <p className="mt-3 text-sm text-white/65">PromoPush is logging the entry and sending you to the action path.</p>
          </>
        )}
      </div>
    </div>
  );
}
