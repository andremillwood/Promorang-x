import { Package } from "lucide-react";
import { ProductForm } from "@/components/merchant/ProductForm";
import { useI18n } from "@/i18n/I18nContext";

export default function AddProduct() {
  const { t } = useI18n();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          {t("addProduct.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("addProduct.lede")}
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
