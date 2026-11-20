import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_CAPPED_DROP_CAP, LAUNCH_WINDOW_END } from "@promorang/shared";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { createCappedDrop } from "@/services/cappedDrops";

export default function CreateCappedDrop() {
  const { t } = useI18n();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [cap, setCap] = useState(String(DEFAULT_CAPPED_DROP_CAP));
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session?.access_token) return;
    setSaving(true);
    try {
      const created = await createCappedDrop(session.access_token, {
        title,
        cap: Number(cap || DEFAULT_CAPPED_DROP_CAP),
      });
      navigate(`/capped-drop/${created.slug}`);
    } catch (error) {
      toast({ title: t("cappedDrop.couldNot"), description: (error as Error).message, variant: "destructive" });
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <SEO title={t("cappedDrop.createTitle")} description={t("cappedDrop.closes", { date: LAUNCH_WINDOW_END })} />
      <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-4">
        <h1 className="font-serif text-4xl">{t("cappedDrop.createTitle")}</h1>
        <p className="text-sm text-white/60">{t("cappedDrop.closes", { date: LAUNCH_WINDOW_END })}</p>
        <label className="text-sm">
          {t("cappedDrop.name")}
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white"
          />
        </label>
        <label className="text-sm">
          {t("cappedDrop.cap")}
          <input
            required
            type="number"
            min={1}
            step={1}
            value={cap}
            onChange={(event) => setCap(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white"
          />
        </label>
        <button type="submit" disabled={saving} className="min-h-12 rounded-full bg-primary font-black text-black disabled:opacity-60">
          {t("cappedDrop.create")}
        </button>
      </form>
    </main>
  );
}
