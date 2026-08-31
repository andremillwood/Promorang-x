import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gem, Layers3, Loader2, RefreshCw, Sparkles, WalletCards } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PieceHoldingCard, type PieceHoldingView } from "@/components/pieces/PieceHoldingCard";
import { useI18n } from "@/i18n/I18nContext";

type PieceType = "content" | "moment" | "host" | "venue";
interface PortfolioPosition {
  id: string;
  piece_type: PieceType;
  asset_id: string;
  pieces_owned: number;
  market_value: number;
  pnl: number;
  unclaimed_dividends?: number;
  lifetime_dividends?: number;
  is_owner?: boolean;
  asset?: { title?: string; name?: string; description?: string; image_url?: string };
  piece?: { title?: string; name?: string };
}
const piecesApiBase = (import.meta.env.VITE_API_URL || "https://api.promorang.co").replace(/\/$/, "");
const piecesApiUrl = (path: string) => `${piecesApiBase}${piecesApiBase.endsWith("/api") ? "" : "/api"}${path}`;

export function PiecePortfolio() {
  const { t, formatNumber } = useI18n();
  const money = (value: number) => formatNumber(value, { style: "currency", currency: "USD" });
  const { session } = useAuth();
  const { toast } = useToast();
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fetchPortfolio = useCallback(async () => {
    if (!session?.access_token) {
      setPositions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(piecesApiUrl("/pieces/portfolio/me"), {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t("pieceHoldings.loadError"));
      setPositions(Array.isArray(data.positions) ? data.positions : []);
    } catch (error) {
      setPositions([]);
      setLoadError(error instanceof Error ? error.message : t("pieceHoldings.loadError"));
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, t]);
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const holdings = useMemo<PieceHoldingView[]>(
    () =>
      positions.map((position) => ({
        id: position.id,
        type: position.piece_type,
        assetId: position.asset_id,
        title:
          position.asset?.title ||
          position.asset?.name ||
          position.piece?.title ||
          position.piece?.name ||
          t("pieceHoldings.pieceFallback", { type: position.piece_type }),
        description: position.asset?.description,
        imageUrl: position.asset?.image_url,
        quantity: Number(position.pieces_owned || 0),
        marketValue: Number(position.market_value || 0),
        gain: Number(position.pnl || 0),
        unclaimed: Number(position.unclaimed_dividends || 0),
        lifetime: Number(position.lifetime_dividends || 0),
        isOwner: position.is_owner,
      })),
    [positions, t],
  );
  const totals = useMemo(
    () =>
      holdings.reduce(
        (sum, piece) => ({
          value: sum.value + piece.marketValue,
          gain: sum.gain + piece.gain,
          ready: sum.ready + piece.unclaimed,
          lifetime: sum.lifetime + piece.lifetime,
        }),
        { value: 0, gain: 0, ready: 0, lifetime: 0 },
      ),
    [holdings],
  );
  const types = new Set(holdings.map((piece) => piece.type)).size;

  const claimAll = async () => {
    if (!session?.access_token || totals.ready <= 0) return;
    setClaiming(true);
    try {
      const response = await fetch(piecesApiUrl("/pieces/dividends/claim"), {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t("pieceHoldings.claimFail"));
      toast({
        title: t("pieceHoldings.claimedTitle"),
        description: t("pieceHoldings.claimedCopy", { amount: money(Number(data.total_amount ?? totals.ready)) }),
      });
      await fetchPortfolio();
    } catch (error) {
      toast({
        title: t("pieceHoldings.claimFail"),
        description: error instanceof Error ? error.message : t("pieceHoldings.claimFailCopy"),
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading)
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">{t("pieceHoldings.gathering")}</p>
        </div>
      </main>
    );
  return (
    <div className="min-h-screen bg-[#09090a] text-white">
      <header className="relative overflow-hidden border-b border-white/10 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_25%,rgba(255,85,0,.20),transparent_34%),radial-gradient(circle_at_86%_10%,rgba(168,85,247,.14),transparent_28%)]"
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.28em] text-primary">{t("pieceHoldings.archive")}</p>
              <h1 className="mt-3 max-w-3xl text-5xl font-black leading-[.92] tracking-[-.06em] sm:text-7xl">
                {t("pieceHoldings.title1")}
                <br />
                <span className="text-white/34">{t("pieceHoldings.title2")}</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/55 sm:text-base">{t("pieceHoldings.copy")}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link to="/wallet">
                  <WalletCards className="mr-2 h-4 w-4" />
                  {t("pieceHoldings.wallet")}
                </Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link to="/marketplace">
                  {t("pieceHoldings.discover")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          {holdings.length > 0 && (
            <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 sm:grid-cols-4">
              <Summary label={t("pieceHoldings.currentValue")} value={money(totals.value)} detail={t("pieceHoldings.holdingsCount", { count: holdings.length })} />
              <Summary
                label={t("pieceHoldings.valueChange")}
                value={`${totals.gain >= 0 ? "+" : "−"}${money(Math.abs(totals.gain))}`}
                detail={t("pieceHoldings.acrossHoldings")}
                positive={totals.gain >= 0}
              />
              <Summary
                label={t("pieceHoldings.readyWallet")}
                value={money(totals.ready)}
                detail={t("pieceHoldings.claimable")}
                positive={totals.ready > 0}
              />
              <Summary
                label={t("pieceHoldings.lifetime")}
                value={money(totals.lifetime)}
                detail={t("pieceHoldings.acrossTypes", { count: types })}
              />
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {loadError ? (
          <State icon={RefreshCw} title={t("pieceHoldings.openFail")} copy={loadError} action={t("pieceHoldings.tryAgain")} onAction={fetchPortfolio} />
        ) : holdings.length === 0 ? (
          <State
            icon={Layers3}
            title={t("pieceHoldings.emptyTitle")}
            copy={t("pieceHoldings.emptyCopy")}
            action={t("pieceHoldings.explore")}
            href="/marketplace"
          />
        ) : (
          <>
            <section className="mb-8 flex flex-col gap-4 rounded-[28px] border border-emerald-400/20 bg-emerald-400/[.055] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black">
                    {totals.ready > 0 ? t("pieceHoldings.readyMove", { amount: money(totals.ready) }) : t("pieceHoldings.allSettled")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/48">
                    {totals.ready > 0 ? t("pieceHoldings.readyCopy") : t("pieceHoldings.settledCopy")}
                  </p>
                </div>
              </div>
              {totals.ready > 0 && (
                <Button onClick={claimAll} disabled={claiming} className="rounded-xl bg-emerald-300 text-black hover:bg-emerald-200">
                  {claiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gem className="mr-2 h-4 w-4" />}
                  {t("pieceHoldings.moveWallet")}
                </Button>
              )}
            </section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.22em] text-white/35">{t("pieceHoldings.collection")}</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-.035em]">{t("pieceHoldings.activePieces")}</h2>
              </div>
              <span className="text-xs text-white/38">{t("pieceHoldings.total", { count: holdings.length })}</span>
            </div>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {holdings.map((piece) => (
                <PieceHoldingCard key={piece.id} piece={piece} />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
function Summary({ label, value, detail, positive }: { label: string; value: string; detail: string; positive?: boolean }) {
  return (
    <div className="bg-[#101012] p-5 sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/38">{label}</p>
      <p className={`mt-2 text-2xl font-black tracking-[-.04em] ${positive ? "text-emerald-300" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-[11px] text-white/36">{detail}</p>
    </div>
  );
}
function State({
  icon: Icon,
  title,
  copy,
  action,
  href,
  onAction,
}: {
  icon: typeof Layers3;
  title: string;
  copy: string;
  action: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <section className="mx-auto max-w-2xl rounded-[32px] border border-dashed border-white/15 bg-white/[.025] px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-[-.035em]">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/48">{copy}</p>
      {href ? (
        <Button asChild className="mt-6 rounded-xl">
          <Link to={href}>
            {action}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button onClick={onAction} className="mt-6 rounded-xl">
          {action}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </section>
  );
}
export default PiecePortfolio;
