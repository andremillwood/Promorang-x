import {
  Link2,
  Users,
  TrendingUp,
  Copy,
  Check,
  Plus,
  Share2,
  Gem,
  Coins,
  MousePointerClick,
  UserPlus,
  CircleCheckBig,
  BadgeDollarSign,
  ArrowRight,
  Route,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useReferralCodes, useReferralStats, useCreateReferralCode } from "@/hooks/useReferrals";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/I18nContext";

export function ReferralsSection() {
  const { formatNumber, formatDate } = useI18n();
  const { data: codes, isLoading: codesLoading, isError: codesError } = useReferralCodes();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useReferralStats();
  const createCode = useCreateReferralCode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const getReferralUrl = (code: string) =>
    `${window.location.origin}/auth?mode=signup&ref=${encodeURIComponent(code)}`;

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(getReferralUrl(code));
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const shareReferral = async (code: string) => {
    const url = getReferralUrl(code);
    const shareData = {
      title: "Join me on PROMORANG",
      text: "I’m using PROMORANG to find what’s worth doing and help useful things move. Here’s my tracked invite.",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyToClipboard(code);
  };

  if (codesLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (codesError || statsError) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h3 className="font-black text-foreground">Referral records unavailable</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          PROMORANG cannot confirm attribution, activity or earnings right now, so it is not substituting demo codes or fake results.
        </p>
      </div>
    );
  }

  const code = codes?.[0];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[1.8rem] border border-border bg-card">
        <div className="grid gap-px bg-border lg:grid-cols-5">
          {[
            { icon: Share2, step: "01", title: "Share", copy: "Send something genuinely worth moving." },
            { icon: MousePointerClick, step: "02", title: "Arrive", copy: "Someone opens PROMORANG through your recorded route." },
            { icon: UserPlus, step: "03", title: "Join", copy: "The person signs up or becomes attributable to your referral." },
            { icon: CircleCheckBig, step: "04", title: "Act", copy: "They complete the action the opportunity actually cares about." },
            { icon: BadgeDollarSign, step: "05", title: "Earn — if funded", copy: "A reward or commission exists only when a recorded rule pays for that verified action." },
          ].map((item) => (
            <div key={item.step} className="bg-card p-5">
              <item.icon className="h-5 w-5 text-primary" />
              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-primary">{item.step} · {item.title}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <DefinitionCard
          icon={Route}
          title="Distribution"
          copy="You help a Want, Moment, Challenge, Gig, Offer or Drop reach someone. Useful even when there is no reward."
        />
        <DefinitionCard
          icon={Users}
          title="Referral"
          copy="A person enters through your recorded code and PROMORANG can connect that person back to you."
        />
        <DefinitionCard
          icon={BadgeDollarSign}
          title="Affiliate"
          copy="A commercial subset of referral: a funded rule pays commission only after the eligible sale or other action is verified."
        />
      </section>

      <section>
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">What your movement caused</p>
          <h3 className="mt-1 text-2xl font-black text-foreground">Credit follows the journey—not the share button.</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard icon={MousePointerClick} value={formatNumber(stats?.referrals.totalClicks || 0)} label="Link opens" />
          <MetricCard icon={Users} value={formatNumber(stats?.referrals.totalSignups || 0)} label="People joined" />
          <MetricCard icon={TrendingUp} value={formatNumber(stats?.referrals.totalConversions || 0)} label="Active referrals" />
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-primary/25 bg-primary/[0.045] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Your tracked route</p>
            <h3 className="mt-2 text-2xl font-black text-foreground">{code ? "Share with credit attached." : "Turn on attribution when you want credit."}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {code
                ? "Your recorded referral code can connect later eligible signup and referral activity back to you. It does not guarantee a reward."
                : "You can always share PROMORANG without a code. Create a tracked route when you want PROMORANG to know that a person arrived because of you."}
            </p>
          </div>

          {code ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void copyToClipboard(code.code)} className="gap-2">
                {copiedCode === code.code ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copiedCode === code.code ? "Copied" : "Copy tracked link"}
              </Button>
              <Button onClick={() => void shareReferral(code.code)} className="gap-2 font-black">
                <Share2 className="h-4 w-4" /> Share my link
              </Button>
            </div>
          ) : (
            <Button onClick={() => createCode.mutate()} disabled={createCode.isPending} className="gap-2 font-black">
              <Plus className="h-4 w-4" /> {createCode.isPending ? "Creating…" : "Create my tracked link"}
            </Button>
          )}
        </div>

        {code ? (
          <div className="mt-5 rounded-xl border border-border bg-background/70 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">Recorded code</p>
            <code className="mt-1 block text-lg font-black text-primary">{code.code}</code>
          </div>
        ) : null}
      </section>

      <section className="rounded-[1.8rem] border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Recorded rewards</p>
            <h3 className="mt-2 text-2xl font-black text-foreground">Earn only when the opportunity says what pays.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A referral is not automatically an affiliate sale. These totals come from recorded reward / commission events after the qualifying action is recognized by the system.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">No pay-for-spam promise</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <EarningTotal icon={BadgeDollarSign} value={`$${(stats?.earnings.usd || 0).toFixed(2)}`} label="Commission" />
          <EarningTotal icon={Gem} value={formatNumber(stats?.earnings.gems || 0)} label="Gems" />
          <EarningTotal icon={Coins} value={formatNumber(stats?.earnings.points || 0)} label="PromoPoints" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3">
            <h3 className="font-semibold text-foreground">People connected to you</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Joined is not the same as active. PROMORANG keeps the referral state visible.</p>
          </div>
          <div className="space-y-2">
            {stats?.referralsList.length ? stats.referralsList.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">{referral.users?.display_name || referral.users?.username || "PROMORANG participant"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Joined {formatDate(referral.created_at)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${referral.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                  {referral.status === "active" ? "Active" : referral.status}
                </span>
              </div>
            )) : <EmptyState text="No recorded referrals yet. Share because something is useful first; attribution can follow when you use your tracked route." />}
          </div>
        </section>

        <section>
          <div className="mb-3">
            <h3 className="font-semibold text-foreground">Reward / commission history</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Only recorded commission events belong here.</p>
          </div>
          <div className="space-y-2">
            {stats?.commissions.length ? stats.commissions.map((commission) => (
              <div key={commission.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold capitalize text-foreground">{commission.earning_type.replaceAll("_", " ")}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {commission.users?.display_name || commission.users?.username || "Referred participant"} · {formatDate(commission.paid_at || commission.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">+{formatCommission(commission.commission_amount, commission.commission_currency)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{commission.status}</p>
                </div>
              </div>
            )) : <EmptyState text="No recorded referral rewards or affiliate commissions yet." />}
          </div>
        </section>
      </div>

      <section className="rounded-[1.8rem] border border-dashed border-border p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">The persuasion rule</p>
        <h3 className="mt-2 text-xl font-black text-foreground">Do not ask people to “refer PROMORANG.” Give them something worth moving.</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The strongest referral moments happen after someone votes for something they care about, claims access, joins a Challenge, takes a Gig, finds a useful Offer or sees a Content Drop their people would genuinely value.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-black text-primary">Useful object <ArrowRight className="h-3.5 w-3.5" /> meaningful share <ArrowRight className="h-3.5 w-3.5" /> attributed action</div>
      </section>
    </div>
  );
}

function DefinitionCard({ icon: Icon, title, copy }: { icon: typeof Route; title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-4 text-lg font-black text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{copy}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, value, label }: { icon: typeof TrendingUp; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EarningTotal({ icon: Icon, value, label }: { icon: typeof TrendingUp; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-lg font-black text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-border p-5 text-sm leading-6 text-muted-foreground">{text}</p>;
}

function formatCommission(amount: number, currency: string) {
  const value = Number(amount || 0);
  if (currency === "usd") return `$${value.toFixed(2)}`;
  return `${value.toLocaleString()} ${currency === "gems" ? "Gems" : "Points"}`;
}
