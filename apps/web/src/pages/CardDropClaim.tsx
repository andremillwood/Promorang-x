import { Link, useSearchParams } from "react-router-dom";
import { Gift } from "lucide-react";
import SEO from "@/components/SEO";

export default function CardDropClaim() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug") || searchParams.get("drop");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <SEO
        title="Claim a live PromoCard benefit"
        description="PromoCard only holds benefits a merchant supplied and an ambassador shared. Gift activation is not a completion."
      />
      <div className="w-full max-w-lg space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
          <Gift className="h-3.5 w-3.5" />
          Live drop only
        </div>
        <h1 className="font-serif text-4xl font-bold">This is not a gift activation.</h1>
        <p className="text-sm leading-6 text-white/60">
          A PromoCard benefit has to come from a participating merchant, be shared by an ambassador, then claimed and validated. Simulated balance, recharge, and gift codes are not completions.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to={slug ? `/drop/${slug}` : "/discover"}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-black text-black"
          >
            {slug ? "Open the live drop" : "Available nearby"}
          </Link>
          <Link
            to="/card"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-bold"
          >
            Use this on PromoCard
          </Link>
        </div>
      </div>
    </main>
  );
}
