import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Copy,
  Gift,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";
import { firstGivenName } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import {
  ExperienceShell,
  ExperienceLoading,
  QuietEmpty,
} from "@/components/people/ExperienceShell";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type CardPerk = {
  id: string;
  title: string;
  detail?: string;
  redemptionCode?: string | null;
  expiresAt?: string | null;
  status?: string;
};

const actionClass =
  "experience-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-black disabled:opacity-50";

export default function MyPromoCard() {
  const { user, profile } = useAuth();
  const card = useMyPromoCard();
  const to = useExperiencePath();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState<CardPerk | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const data = card.data;
  const holder = firstGivenName({
    displayName: data?.givenName || data?.name,
    fullName:
      profile?.full_name ||
      profile?.display_name ||
      user?.user_metadata?.full_name,
    username: profile?.username,
    email: user?.email,
    fallback: "Your card",
  });
  const perks: CardPerk[] = data?.perks || [];
  const isExpired = (perk: CardPerk) =>
    Boolean(perk.expiresAt && new Date(perk.expiresAt).getTime() <= Date.now());
  const activePerks = perks.filter((perk) => !isExpired(perk));
  const expiredPerks = perks.filter(isExpired);
  const selectedExpired = selected ? isExpired(selected) : false;

  async function copyCode() {
    if (!selected?.redemptionCode) return;
    try {
      await navigator.clipboard.writeText(selected.redemptionCode);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <ExperienceShell
      eyebrow="Your PromoCard"
      title="Good things, kept close."
      description="Your claimed perks and communities, ready when you are."
      backTo="/dashboard"
      actions={
        data ? (
          <button
            type="button"
            aria-label="Refresh your card"
            disabled={card.isFetching}
            onClick={() => void card.refetch()}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-white/15 px-4 text-sm text-white/70 disabled:opacity-50"
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-4 w-4 ${card.isFetching ? "motion-safe:animate-spin" : ""}`}
            />
            Refresh
          </button>
        ) : undefined
      }
    >
      {card.isLoading ? (
        <ExperienceLoading label="Getting your card ready…" />
      ) : !data && card.isError ? (
        <QuietEmpty
          title="Your card couldn’t load"
          copy="Try again to see your balances and claimed perks."
          action={
            <button
              type="button"
              className={actionClass}
              disabled={card.isFetching}
              onClick={() => void card.refetch()}
            >
              {card.isFetching ? "Trying again…" : "Try again"}
            </button>
          }
        />
      ) : (
        <>
          {card.isError ? (
            <p
              role="status"
              className="rounded-2xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm text-amber-100"
            >
              We couldn’t refresh your card. These are your last loaded details.
            </p>
          ) : null}
          <div className="grid items-center gap-6 sm:grid-cols-[1.4fr_1fr]">
            <PromoCardFace
              variant="membership"
              holder={holder}
              available={`${Number(data?.points || 0).toLocaleString()} pts`}
              limit={`${Number(data?.keys || 0).toLocaleString()} keys`}
              places="Perks & access"
            />
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-amber-200">
                <Ticket aria-hidden="true" className="h-5 w-5" />
                <p className="text-sm font-semibold">
                  {activePerks.length
                    ? `${activePerks.length} ${activePerks.length === 1 ? "perk" : "perks"} on your card`
                    : "Your next perk starts here"}
                </p>
              </div>
              <p className="text-sm leading-6 text-white/65">
                {activePerks.length
                  ? "Open a perk to see its details and redemption code."
                  : "Explore what’s available and claim something you’ll enjoy. Find it here when you’re ready to use it."}
              </p>
              <Link to="/discover?tab=perks" className={actionClass}>
                Explore perks{" "}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <section aria-labelledby="card-perks-heading" className="pt-4">
            <div className="mb-4 flex items-center gap-3">
              <h2
                id="card-perks-heading"
                className="font-serif text-2xl font-bold"
              >
                Your perks
              </h2>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
                {activePerks.length}
              </span>
            </div>
            {activePerks.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {activePerks.map((perk) => (
                  <article
                    key={perk.id}
                    className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-amber-200">
                      <Gift aria-hidden="true" className="h-4 w-4" />
                      {perk.status === "fulfillment_pending"
                        ? "Being prepared"
                        : "Claimed"}
                    </div>
                    <h3 className="break-words font-serif text-2xl font-bold">
                      {perk.title}
                    </h3>
                    {perk.detail ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/65">
                        {perk.detail}
                      </p>
                    ) : null}
                    {perk.expiresAt &&
                    Number.isFinite(new Date(perk.expiresAt).getTime()) ? (
                      <p className="mt-3 text-xs text-amber-100/80">
                        Expires{" "}
                        {new Date(perk.expiresAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={(event) => {
                        triggerRef.current = event.currentTarget;
                        setSelected(perk);
                        setCopyState("idle");
                      }}
                      className="experience-interactive mt-5 flex min-h-12 items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold hover:bg-white/10"
                      aria-label={`${perk.redemptionCode ? "Show code for" : "View"} ${perk.title}`}
                    >
                      {perk.redemptionCode
                        ? "Show redemption code"
                        : "View perk"}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                      />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <QuietEmpty
                title="Make room for something good"
                copy="Claim a perk from Discover or a community. It will be waiting here for your next visit."
                action={
                  <Link to="/discover?tab=perks" className={actionClass}>
                    Find your first perk{" "}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                }
              />
            )}
          </section>

          {expiredPerks.length ? (
            <details className="rounded-2xl border border-white/10 p-4 text-white/65">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
                Expired perks ({expiredPerks.length})
              </summary>
              <ul className="mt-3 space-y-3">
                {expiredPerks.map((perk) => (
                  <li
                    key={perk.id}
                    className="border-t border-white/10 pt-3 text-sm"
                  >
                    {perk.title}
                    <span className="ml-2 text-xs text-white/50">Expired</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <section aria-labelledby="card-communities-heading" className="pt-3">
            <h2
              id="card-communities-heading"
              className="mb-4 font-serif text-2xl font-bold"
            >
              Your communities
            </h2>
            {data?.memberships?.length ? (
              <div className="space-y-2">
                {data.memberships.map(
                  (item: {
                    id: string;
                    slug?: string;
                    title: string;
                    role: string;
                  }) => (
                    <Link
                      key={item.id}
                      to={item.slug ? `/scenes/${item.slug}` : "/scenes"}
                      className="experience-interactive flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.07]"
                    >
                      <Users
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-amber-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs capitalize text-white/60">
                          {item.role}
                        </p>
                      </div>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-white/50"
                      />
                    </Link>
                  ),
                )}
              </div>
            ) : (
              <QuietEmpty
                title="Find your people"
                copy="Join a community around your interests and discover what they’re sharing."
                action={
                  <Link
                    to="/scenes"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-amber-200"
                  >
                    Explore communities{" "}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                }
              />
            )}
          </section>
          <Link
            to={to("/dashboard")}
            className="inline-flex min-h-11 items-center text-sm text-white/65 hover:text-white"
          >
            Back to your home
          </Link>
        </>
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setCopyState("idle");
          }
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          className="max-h-[90dvh] overflow-y-auto rounded-3xl border-white/15 bg-[#141313] text-white sm:max-w-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">
            On your PromoCard
          </p>
          <DialogTitle className="break-words pr-5 font-serif text-3xl">
            {selected?.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/70">
            {selected?.detail || "Your claimed perk details."}
          </DialogDescription>
          {selected?.redemptionCode && !selectedExpired ? (
            <div className="mt-2 rounded-2xl border border-amber-200/25 bg-amber-200/5 p-5 text-center">
              <p className="text-sm text-amber-100">Show this code to redeem</p>
              <code className="my-5 block select-all break-all font-mono text-3xl font-bold tracking-wider">
                {selected.redemptionCode}
              </code>
              <button
                type="button"
                onClick={() => void copyCode()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold"
              >
                {copyState === "copied" ? (
                  <Check aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Copy aria-hidden="true" className="h-4 w-4" />
                )}
                {copyState === "copied" ? "Copied" : "Copy code"}
              </button>
              <p role="status" className="mt-2 text-xs text-white/65">
                {copyState === "failed"
                  ? "Couldn’t copy. You can select the code or show this screen."
                  : copyState === "copied"
                    ? "Code copied to clipboard."
                    : "Only share this code when redeeming your perk."}
              </p>
            </div>
          ) : (
            <p className="rounded-2xl bg-white/5 p-4 text-sm leading-6 text-white/70">
              {selectedExpired
                ? "This perk has expired. Explore Discover for something new."
                : selected?.status === "fulfillment_pending"
                  ? "Your perk is being prepared. Check back here for redemption details."
                  : "This perk has no redemption code yet. Check with the community or business that issued it for instructions."}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </ExperienceShell>
  );
}
