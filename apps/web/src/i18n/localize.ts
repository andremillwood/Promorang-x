import type { InventoryNextAction, PromoCardBenefit, StakeholderLens, StakeholderNavRole } from "@promorang/shared";
import {
  classifyBenefitType,
  isPlaceholderDisplayName,
  journeyKindForFulfillment,
  presentBenefitHeadline,
} from "@promorang/shared";
import type { TranslationKey } from "./translations";

type Translate = (key: TranslationKey, variables?: Record<string, string | number>) => string;

const ROLE_KEYS: StakeholderNavRole[] = [
  "participant",
  "creator",
  "host",
  "brand",
  "merchant",
  "agency",
  "promoter",
  "marketing",
  "admin",
];

export function localizedGreeting(name: string, t: Translate, now = new Date()): string {
  const hour = now.getHours();
  const named = !isPlaceholderDisplayName(name);
  if (hour < 12) return named ? t("people.morningNamed", { name }) : t("people.morning");
  if (hour < 17) return named ? t("people.afternoonNamed", { name }) : t("people.afternoon");
  return named ? t("people.eveningNamed", { name }) : t("people.evening");
}

export function localizeLens(lens: StakeholderLens, t: Translate): StakeholderLens {
  const role = ROLE_KEYS.includes(lens.role) ? lens.role : "participant";
  const prefix = `lens.${role}` as const;
  const workspace = t(`${prefix}.workspace` as TranslationKey);
  const promise = t(`${prefix}.promise` as TranslationKey);
  const ticker = t(`${prefix}.ticker` as TranslationKey);
  const putInLabel = t(`${prefix}.putIn` as TranslationKey);
  const putInDetail = t(`${prefix}.putInDetail` as TranslationKey);
  const cardMeaning = t(`${prefix}.card` as TranslationKey);
  const worldLabel = t(`${prefix}.world` as TranslationKey);
  const worldMeaning = t(`${prefix}.worldMeaning` as TranslationKey);
  const activityLabel = t(`${prefix}.activity` as TranslationKey);
  const activityMeaning = t(`${prefix}.activityMeaning` as TranslationKey);

  return {
    ...lens,
    workspaceLabel: workspace,
    promise,
    ticker,
    putIn: { ...lens.putIn, label: putInLabel, detail: putInDetail },
    promoCard: { meaning: cardMeaning },
    world: { ...lens.world, label: worldLabel, meaning: worldMeaning },
    activity: { ...lens.activity, label: activityLabel, meaning: activityMeaning },
    destinations: lens.destinations.map((item) => {
      if (item.id === "today") return { ...item, label: t("lens.today"), meaning: t("lens.todayMeaning") };
      if (item.id === "world") return { ...item, label: worldLabel, meaning: worldMeaning };
      if (item.id === "activity") return { ...item, label: activityLabel, meaning: activityMeaning };
      if (item.id === "putIn") return { ...item, label: putInLabel, meaning: putInDetail };
      if (item.id === "promoCard") return { ...item, label: t("lens.card"), meaning: cardMeaning };
      return item;
    }),
    extras: lens.extras.map((item) => {
      if (item.href === "/wallet") return { ...item, label: t("lens.wallet") };
      if (item.href === "/dashboard/settings") return { ...item, label: t("lens.settings") };
      if (item.href === "/people") return { ...item, label: t("lens.people") };
      if (item.href === "/demand") return { ...item, label: t("lens.demand") };
      return item;
    }),
  };
}

export function localizedRemainingLabel(percent: number, soldOut: boolean, t: Translate): string {
  if (soldOut || Number(percent || 0) <= 0) return t("aftrhrs.claimedLabel");
  return `${Math.max(0, Math.min(100, Math.round(Number(percent))))}%`;
}

export function localizedGuestPassStatus(status: string | null | undefined, t: Translate): string {
  if (status === "redeemed") return t("aftrhrs.passUsed");
  if (status === "cancelled" || status === "expired") return t("aftrhrs.passInvalid");
  return t("aftrhrs.passReady");
}

export function localizedPerkKind(kind: string, t: Translate): string {
  return t(`give.kind.${kind}` as TranslationKey);
}

export function localizedAudience(audience: string, t: Translate): string {
  return t(`give.audience.${audience}` as TranslationKey);
}

export function localizedCreateIntent(intent: string, t: Translate): { label: string; prompt: string } {
  return {
    label: t(`create.intent.${intent}` as TranslationKey),
    prompt: t(`create.prompt.${intent}` as TranslationKey),
  };
}

export function localizedCommunityTheme(themeId: string, t: Translate): string {
  return t(`start.theme.${themeId}` as TranslationKey);
}

export function localizedFulfillment(id: string, t: Translate): { label: string; detail: string } {
  return {
    label: t(`stock.fulfill.${id}.label` as TranslationKey),
    detail: t(`stock.fulfill.${id}.detail` as TranslationKey),
  };
}

export function localizedInventoryFollow(fulfillmentType: string | null | undefined, t: Translate): string {
  const kind = journeyKindForFulfillment(fulfillmentType);
  if (kind === "ship") return t("stock.followShip");
  if (kind === "credit") return t("stock.followCredit");
  if (kind === "code") return t("stock.followCode");
  return t("stock.followPlace");
}

export function localizedInventoryNext(
  actions: InventoryNextAction[],
  fulfillmentType: string | null | undefined,
  t: Translate,
): InventoryNextAction[] {
  const kind = journeyKindForFulfillment(fulfillmentType);
  return actions.map((action) => {
    if (action.id === "share-perk") {
      return { ...action, label: t("stock.next.share.label"), why: t("stock.next.share.why") };
    }
    if (action.id === "validate") {
      return { ...action, label: t("stock.next.validate.label"), why: t("stock.next.validate.why") };
    }
    if (kind === "ship") {
      return { ...action, label: t("stock.next.watchShip.label"), why: t("stock.next.watchShip.why") };
    }
    if (kind === "credit") {
      return { ...action, label: t("stock.next.watchCredit.label"), why: t("stock.next.watchCredit.why") };
    }
    if (kind === "code") {
      return { ...action, label: t("stock.next.watchCode.label"), why: t("stock.next.watchCode.why") };
    }
    return action;
  });
}

export function localizedBenefitCta(
  benefit: PromoCardBenefit,
  t: Translate,
  options: { used?: boolean; hasCode?: boolean; intent?: "claim" | "share" } = {},
): string {
  if (options.used) return t("perk.alreadyUsed");
  if (options.hasCode) return t("perk.redeem");
  if (options.intent === "share") return t("perk.shareThis");
  const type = classifyBenefitType(benefit);
  const headline = presentBenefitHeadline(benefit);
  if (type === "fixed_discount" || type === "percentage_discount") {
    return t("perk.claimHeadline", { headline });
  }
  if (type === "free_item") {
    return /free/i.test(headline) ? t("perk.getHeadline", { headline }) : t("perk.claimBenefit");
  }
  if (type === "access") return /entry/i.test(headline) ? t("perk.unlockEntry") : t("perk.unlockAccess");
  if (type === "bundle") return t("perk.unlockOffer");
  return t("perk.seeBenefit");
}

export function localizedBenefitScarcity(
  benefit: Pick<PromoCardBenefit, "availableQuantity" | "eligibility" | "expiresAt">,
  t: Translate,
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string,
  now = Date.now(),
): string | undefined {
  const remaining = benefit.availableQuantity ?? benefit.eligibility?.remaining ?? null;
  const parts: string[] = [];
  if (remaining != null && remaining > 0) {
    parts.push(
      remaining <= 8
        ? t("perk.onlyLeft", { count: remaining })
        : t("perk.remainingCount", { count: remaining }),
    );
  }
  if (benefit.expiresAt) {
    const expiry = Date.parse(benefit.expiresAt);
    if (Number.isFinite(expiry) && expiry > now) {
      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);
      const startMs = startToday.getTime();
      if (expiry < startMs + 86_400_000) {
        parts.push(new Date(expiry).getHours() >= 17 ? t("perk.endsTonight") : t("perk.availableToday"));
      } else if (expiry < startMs + 2 * 86_400_000) {
        parts.push(t("perk.endsTomorrow"));
      } else {
        parts.push(t("perk.expires", { date: formatDate(expiry, { month: "short", day: "numeric" }) }));
      }
    }
  }
  return parts.length ? parts.join(" · ") : undefined;
}

const AIM_COPY_SUFFIX: Record<string, "Kad" | "Barbican" | "Food" | "Tonight"> = {
  "kingston-after-dark": "Kad",
  barbican: "Barbican",
  food: "Food",
  tonight: "Tonight",
};

export function localizedAimCopy(
  id: string | null | undefined,
  t: Translate,
): { label: string; line: string; watching: string } | null {
  const suffix = AIM_COPY_SUFFIX[String(id || "")];
  if (!suffix) return null;
  return {
    label: t(`card.aim${suffix}` as TranslationKey),
    line: t(`card.aim${suffix}Line` as TranslationKey),
    watching: t(`card.aim${suffix}Watch` as TranslationKey),
  };
}

export function localizedPathTitle(dimension: string, t: Translate): string {
  return t(`progress.path.${dimension}` as TranslationKey);
}

export function localizedFactionCopy(
  key: string,
  t: Translate,
): { title: string; line: string; verb: string } {
  return {
    title: t(`progress.faction.${key}.title` as TranslationKey),
    line: t(`progress.faction.${key}.line` as TranslationKey),
    verb: t(`progress.faction.${key}.verb` as TranslationKey),
  };
}

export function localizedCrewRoleTitle(key: string, t: Translate): string {
  return t(`progress.crewRole.${key}` as TranslationKey);
}
