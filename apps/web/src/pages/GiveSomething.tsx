import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AUDIENCE_LABELS, PERK_KIND_LABELS, dropShareCopy, type DropAudience, type PerkKind } from "@promorang/shared";
import { useGiveablePerks, useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { StakeholderHowLead } from "@/components/people/StakeholderLoop";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { readLocalFoundListings } from "@/lib/discovery-found";
import { useI18n } from "@/i18n/I18nContext";
import { localizedAudience, localizedPerkKind } from "@/i18n/localize";

const KINDS = Object.entries(PERK_KIND_LABELS) as Array<[PerkKind, string]>;
const AUDIENCES = Object.entries(AUDIENCE_LABELS) as Array<[DropAudience, string]>;

export default function GiveSomething() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const { user, profile, activeRole } = useAuth();
  const lensRole = params.get("role") || activeRole;
  const perks = useGiveablePerks();
  const { createDrop } = useExperienceActions();
  const to = useExperiencePath();
  const { toast } = useToast();
  const giverName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Someone";
  const [kind, setKind] = useState<PerkKind>((params.get("kind") as PerkKind) || "complimentary");
  const [audience, setAudience] = useState<DropAudience>("everyone");
  const [title, setTitle] = useState(params.get("title") || "");
  const foundId = params.get("found");
  const foundListing = foundId
    ? readLocalFoundListings().find((row) => row.id === foundId) || {
        title: params.get("title") || "",
        perkToFinder: "",
        words: params.get("title") || "",
      }
    : null;

  useEffect(() => {
    const nextTitle = foundListing?.title || params.get("title") || "";
    if (nextTitle) setTitle((current) => current || nextTitle);
  }, [foundId]);
  const [limit, setLimit] = useState("50");
  const [offerId, setOfferId] = useState<string | null>(params.get("offer"));
  const [shareUrl, setShareUrl] = useState("");
  const momentId = params.get("moment") || undefined;
  const releaseId = params.get("release") || undefined;

  const selectedPerk = useMemo(() => (perks.data || []).find((item) => item.id === offerId), [perks.data, offerId]);

  useEffect(() => {
    const fromQuery = params.get("offer");
    if (fromQuery && fromQuery !== offerId) setOfferId(fromQuery);
  }, [params, offerId]);

  useEffect(() => {
    if (selectedPerk?.title && !title) setTitle(selectedPerk.title);
  }, [selectedPerk, title]);

  const dropIt = async () => {
    try {
      const drop = await createDrop.mutateAsync({
        kind,
        title: title || selectedPerk?.title || PERK_KIND_LABELS[kind],
        description: selectedPerk?.description,
        offerId,
        audience,
        audienceLimit: audience === "first_x" ? Number(limit) || 50 : null,
        sceneId: params.get("hub") || undefined,
        momentId,
        sourceKind: releaseId ? "release" : undefined,
        sourceId: releaseId || undefined,
      });
      const url = `${window.location.origin}/drop/${drop.slug}`;
      setShareUrl(url);
      const message = dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind]);
      await navigator.clipboard.writeText(`${message} ${url}`).catch(() => undefined);
      toast({ title: t("give.dropped"), description: message });
    } catch (error) {
      toast({ title: t("give.dropFailed"), description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow={t("give.eyebrow")}
      title={t("give.title")}
      description={t("give.copy")}
      backTo="/dashboard"
    >
      <StakeholderHowLead role={lensRole} surface="give" />
      {momentId ? (
        <p className="rounded-[1.3rem] border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-white/70">
          {t("give.momentAttach")}
        </p>
      ) : null}
      {releaseId ? (
        <p className="rounded-[1.3rem] border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-white/70">
          {t("give.releaseCatch")}
          {" "}
          <Link to="/create/moment" className="font-bold text-primary underline-offset-2 hover:underline">
            {t("give.orMakeRoom")}
          </Link>
          .
        </p>
      ) : null}
      {foundListing ? (
        <section className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">{t("give.claimedDiscover")}</p>
          <p className="mt-2 font-serif text-2xl font-bold">{foundListing.title}</p>
          <p className="mt-1 text-sm text-white/60">
            {t("give.asksCome")}
            {foundListing.perkToFinder ? ` ${t("give.finderKeeps", { perk: foundListing.perkToFinder })}` : ""}
          </p>
        </section>
      ) : null}
      <section>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map(([id]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`min-h-14 rounded-[1.3rem] border px-3 text-sm font-bold ${kind === id ? "border-primary bg-primary text-black" : "border-white/10 bg-white/[0.04]"}`}
            >
              {localizedPerkKind(id, t)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">{t("give.available")}</h2>
        {perks.data?.length ? (
          <div className="mt-3 space-y-2">
            {perks.data.map((perk) => (
              <button
                key={perk.id}
                type="button"
                onClick={() => {
                  setOfferId(perk.id);
                  setTitle(perk.title);
                }}
                className={`w-full rounded-[1.4rem] border px-4 py-4 text-left ${offerId === perk.id ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04]"}`}
              >
                <p className="font-serif text-xl font-bold">{perk.title}</p>
                <p className="mt-1 text-xs text-white/50">
                  {perk.remaining != null ? t("give.remaining", { count: perk.remaining }) : t("give.openInventory")}
                  {perk.claimedByYourPeople ? ` · ${t("give.claimed", { count: perk.claimedByYourPeople })}` : ""}
                  {" · "}
                  {perk.source === "yours" ? t("give.yours") : t("give.fromPartner")}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title={t("give.emptyTitle")} copy={t("give.emptyCopy")} />
          </div>
        )}
      </section>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("give.whatDrop")}</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("give.whatDropPh")}
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("give.whoGets")}</p>
        <div className="mt-2 grid gap-2">
          {AUDIENCES.map(([id]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAudience(id)}
              className={`min-h-12 rounded-full border px-4 text-sm font-bold ${audience === id ? "border-primary bg-primary text-black" : "border-white/10"}`}
            >
              {localizedAudience(id, t)}
            </button>
          ))}
        </div>
        {audience === "first_x" ? (
          <input
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            inputMode="numeric"
            className="mt-3 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4"
            placeholder={t("give.firstPeoplePh")}
          />
        ) : null}
      </section>

      <Link to={to("/stock")} className="block text-center text-sm text-white/45">
        {t("give.putInventory")}
      </Link>

      <button
        type="button"
        disabled={createDrop.isPending}
        onClick={dropIt}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
      >
        {createDrop.isPending ? t("give.dropping") : t("give.dropIt")}
      </button>

      {shareUrl ? (
        <div className="rounded-[1.5rem] border border-primary/40 bg-primary/10 px-4 py-4">
          <p className="font-serif text-xl font-bold">
            {dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind])}
          </p>
          <p className="mt-2 text-sm text-white/70">{t("give.sendClaim")}</p>
          <p className="mt-3 break-all font-mono text-xs text-primary">{shareUrl}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                const message = dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind]);
                if (navigator.share) {
                  await navigator.share({ title: message, text: message, url: shareUrl }).catch(() => undefined);
                  return;
                }
                window.open(`https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`, "_blank", "noopener,noreferrer");
              }}
              className="min-h-12 rounded-full bg-white text-sm font-black text-black"
            >
              {t("common.share")}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind])} ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="grid min-h-12 place-items-center rounded-full border border-white/20 text-sm font-black"
            >
              WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </ExperienceShell>
  );
}
