import { useState, type FormEvent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TactileButton } from "@/components/ui/TactileButton";
import { useI18n } from "@/i18n/I18nContext";
import { defaultFinderPerk, type FoundKind } from "@/lib/discovery-found";
import { cn } from "@/lib/utils";

type PutUpFoundModalProps = {
  cityName: string;
  defaultTitle?: string;
  trigger: ReactNode;
  onPutUp: (input: {
    kind: FoundKind;
    title: string;
    words?: string;
    whereHint?: string;
    perkToFinder?: string;
  }) => Promise<unknown>;
};

export function PutUpFoundModal({
  cityName,
  defaultTitle = "",
  trigger,
  onPutUp,
}: PutUpFoundModalProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FoundKind>("moment");
  const [title, setTitle] = useState(defaultTitle);
  const [whereHint, setWhereHint] = useState("");
  const [perkToFinder, setPerkToFinder] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextTitle = title.trim() || defaultTitle.trim();
    if (nextTitle.length < 3) return;
    setBusy(true);
    try {
      await onPutUp({
        kind,
        title: nextTitle,
        words: nextTitle,
        whereHint,
        perkToFinder: perkToFinder.trim() || defaultFinderPerk(kind),
      });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg border-white/10 bg-[#111113] text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{t("found.putUpTitle")}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/60">
            {t("found.putUpCopy", { city: cityName })}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-2">
            {(["moment", "place"] as FoundKind[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                className={cn(
                  "min-h-12 rounded-2xl border px-3 text-sm font-bold",
                  kind === id ? "border-orange-400 bg-orange-400/15 text-white" : "border-white/10 text-white/70",
                )}
              >
                {t(id === "place" ? "found.kindPlace" : "found.kindMoment")}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{t("found.titleLabel")}</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={defaultTitle || t("found.titlePlaceholder")}
              className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{t("found.whereLabel")}</span>
            <input
              value={whereHint}
              onChange={(event) => setWhereHint(event.target.value)}
              placeholder={t("found.wherePlaceholder")}
              className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{t("found.perkLabel")}</span>
            <input
              value={perkToFinder}
              onChange={(event) => setPerkToFinder(event.target.value)}
              placeholder={defaultFinderPerk(kind)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
            />
            <span className="mt-2 block text-xs leading-5 text-white/45">{t("found.perkHint")}</span>
          </label>
          <TactileButton type="submit" variant="primary" disabled={busy} className="w-full">
            {busy ? t("found.puttingUp") : t("found.submit")}
          </TactileButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
