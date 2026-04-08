import { Package } from "lucide-react";
import { ProductForm } from "@/components/merchant/ProductForm";

export default function AddProduct() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          Add Product
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a new product for your inventory
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
