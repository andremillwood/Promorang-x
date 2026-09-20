import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Copy, ExternalLink, Flame, Package, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProductCatalogManager from "@/components/merchant/ProductCatalogManager";

export function MerchantStorefrontConsole({
  onOpenProducts,
  onOpenScanner,
}: {
  onOpenProducts?: () => void;
  onOpenScanner?: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [discount, setDiscount] = useState("");

  const storefrontUrl = user?.id && typeof window !== "undefined"
    ? `${window.location.origin}/storefront/${user.id}`
    : user?.id
      ? `https://www.promorang.co/storefront/${user.id}`
      : null;

  const copyStorefrontLink = async () => {
    if (!storefrontUrl) {
      toast({
        title: "Storefront link unavailable",
        description: "PROMORANG needs an authenticated merchant identity before it can create a storefront link.",
        variant: "destructive",
      });
      return;
    }

    await navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    toast({
      title: "Storefront link copied",
      description: "Share the recorded merchant storefront. Inventory shown there still comes from published product and offer records.",
    });
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleContinueOffer = () => {
    const title = offerTitle.trim() || (discount ? `${discount}% off` : "");
    const query = title ? `?title=${encodeURIComponent(title)}` : "";
    navigate(`/stock${query}`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-500/25 bg-[linear-gradient(135deg,rgba(16,185,129,.10),rgba(0,0,0,.86))] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-emerald-300">
              <Store className="h-4 w-4" />
              Merchant · Supply
            </div>
            <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Put up supply that actually exists.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              Products, offers and inventory stay source-backed. A draft here is not a live perk, a claim is not a redemption,
              and a validation is not a purchase or fulfillment record.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {storefrontUrl ? (
              <Button asChild variant="outline" className="rounded-xl border-white/10 bg-white/[.03] text-white">
                <Link to={`/storefront/${user?.id}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View storefront
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={copyStorefrontLink}
              disabled={!storefrontUrl}
              className="rounded-xl border-white/10 bg-white/[.03] text-white"
            >
              {copied ? <Check className="mr-2 h-4 w-4 text-emerald-300" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy storefront link"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-5 rounded-3xl border border-white/10 bg-[#0e1015] p-5 sm:p-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.18em] text-amber-300">Draft an offer</p>
            <h3 className="mt-2 text-xl font-black text-white">Describe the customer reason to act.</h3>
            <p className="mt-2 text-sm leading-6 text-white/45">
              This form only prepares the next supply step. Nothing becomes public until the authoritative inventory/offer flow records it.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[.14em] text-white/35">Offer title</span>
            <Input
              value={offerTitle}
              onChange={(event) => setOfferTitle(event.target.value)}
              placeholder="e.g. 20% off brunch before 4 PM"
              className="h-11 rounded-xl border-white/10 bg-white/[.04] text-white placeholder:text-white/25"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[.14em] text-white/35">Discount, if this offer truly uses one</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                placeholder="Optional"
                className="h-11 rounded-xl border-white/10 bg-white/[.04] text-white placeholder:text-white/25"
              />
              <span className="text-sm font-black text-white/45">%</span>
            </div>
          </label>

          <Button onClick={handleContinueOffer} className="w-full rounded-xl bg-[#ff6500] font-black text-black hover:bg-[#ff7a20]">
            <Flame className="mr-2 h-4 w-4" />
            Continue to inventory
          </Button>

          <div className="rounded-2xl border border-white/8 bg-white/[.025] p-4 text-xs leading-5 text-white/40">
            <TrendingUp className="mb-2 h-4 w-4 text-emerald-300" />
            Publishing supply creates an offer/inventory record. It does not create a sale, redemption, fulfillment or repeat customer by itself.
          </div>

          {onOpenScanner ? (
            <Button type="button" variant="outline" onClick={onOpenScanner} className="w-full rounded-xl border-white/10 bg-white/[.03] text-white">
              Open validation station
            </Button>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.18em] text-emerald-300">Recorded catalog</p>
              <h3 className="mt-2 text-xl font-black text-white">Products and fulfillment settings.</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">
                This catalog is the real source for merchant products. Empty inventory stays empty until you add it.
              </p>
            </div>
            {onOpenProducts ? (
              <Button type="button" variant="outline" onClick={onOpenProducts} className="rounded-xl border-white/10 bg-white/[.03] text-white">
                <Package className="mr-2 h-4 w-4" />
                Product tools
              </Button>
            ) : null}
          </div>
          <ProductCatalogManager />
        </div>
      </section>
    </div>
  );
}

export default MerchantStorefrontConsole;
