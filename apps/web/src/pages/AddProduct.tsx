import { Package, Route } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProductForm } from "@/components/merchant/ProductForm";
import { readBusinessOutcomeBrief, saveBusinessOutcomeBrief } from "@/lib/business-outcomes";

export default function AddProduct() {
  const [params] = useSearchParams();
  const { activeRole } = useAuth();
  const fromOutcome = params.get("from") === "business-outcome";
  const brief = fromOutcome ? readBusinessOutcomeBrief() : null;

  if (fromOutcome && activeRole !== "merchant") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">Merchant responsibility required</p>
          <h1 className="mt-3 font-serif text-3xl font-bold">Switch into the Merchant workspace before creating sellable supply.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">A Brand, Creator, Host or Agency can help move commerce, but this product record controls price, stock and availability and therefore belongs to Merchant responsibility.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/dashboard" className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-black text-primary-foreground">Open workspace switcher</Link>
            <Link to="/business/programme?resume=1" className="inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-black">Back to programme</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {brief ? (
        <div className="rounded-2xl border border-orange-400/25 bg-orange-400/[0.06] p-5">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-500"><Route className="h-4 w-4" /> Programme supply step</p>
          <p className="mt-2 text-sm font-bold">Create the real commerce object before PROMORANG distributes it.</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">This product record becomes the merchant-owned source for price, inventory and availability. The programme does not invent those values.</p>
        </div>
      ) : null}

      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          Add Product
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a real merchant product with price and inventory.
        </p>
      </div>

      <ProductForm
        returnTo={brief ? "/business/programme?resume=1" : "/dashboard"}
        onSuccess={(product) => {
          if (!brief || !product?.id) return;
          saveBusinessOutcomeBrief({
            ...brief,
            commerceSourceId: product.id,
            subjectLabel: brief.subjectLabel || product.name || "",
          });
        }}
      />
    </div>
  );
}
