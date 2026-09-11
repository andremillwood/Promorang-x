import { FormEvent, useState } from "react";
import SEO from "@/components/SEO";
import { useAftrHrsDoor } from "@/hooks/useAftrHrs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";

export default function AftrHrsDoor() {
  const { t } = useI18n();
  const { user } = useAuth();
  const redeem = useAftrHrsDoor();
  const [code, setCode] = useState("");
  const [last, setLast] = useState<{ unique_code?: string; status?: string; user_id?: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const pass = await redeem.mutateAsync(code);
      setLast(pass as { unique_code?: string; status?: string; user_id?: string });
      setCode("");
      toast.success(t("aftrhrs.doorOk"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("aftrhrs.doorFail"));
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <SEO title={t("aftrhrs.doorSeo")} description={t("aftrhrs.doorSeoCopy")} />
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">{t("aftrhrs.doorEyebrow")}</p>
        <h1 className="mt-3 text-4xl font-black uppercase">{t("aftrhrs.doorTitle")}</h1>
        {!user ? <p className="mt-6 text-white/60">{t("aftrhrs.doorSignIn")}</p> : null}
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t("aftrhrs.doorPh")}
            className="h-14 w-full rounded-2xl border border-white/15 bg-zinc-950 px-4 font-mono uppercase tracking-widest"
          />
          <button type="submit" disabled={!user || redeem.isPending} className="h-12 w-full rounded-full bg-white text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-50">
            {redeem.isPending ? t("aftrhrs.doorChecking") : t("aftrhrs.doorValidate")}
          </button>
        </form>
        {last ? (
          <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">{t("aftrhrs.doorCheckedIn")}</p>
            <p className="mt-2 font-mono text-xl">{last.unique_code}</p>
            <p className="mt-1 text-sm text-white/60">{last.status}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
