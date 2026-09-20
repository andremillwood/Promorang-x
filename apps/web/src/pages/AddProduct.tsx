import { Package, Route } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ProductForm } from "@/components/merchant/ProductForm";
import { readBusinessOutcomeBrief, saveBusinessOutcomeBrief } from "@/lib/business-outcomes";

export default function AddProduct() {
  const [params] = useSearchParams();
  const fromOutcome = params.get("from") === "business-outcome";
  const brief = fromOutcome ? readBusinessOutcomeBrief() : null;

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
