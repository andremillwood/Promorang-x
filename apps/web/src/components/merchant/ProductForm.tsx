import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Loader2, DollarSign, Award, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useMerchantProducts";
import { useNavigate } from "react-router-dom";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.string().optional(),
  sku: z.string().max(50).optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  compare_at_price: z.coerce.number().min(0).optional().nullable(),
  cost_price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().default("USD"),
  inventory_quantity: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
  is_redeemable_with_points: z.boolean().default(false),
  points_cost: z.coerce.number().min(0).optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormValues> & { id?: string };
  onSuccess?: () => void;
}

const categories = [
  "Apparel",
  "Electronics",
  "Food & Beverage",
  "Health & Beauty",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Other",
];

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!initialData?.id;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      sku: initialData?.sku || "",
      price: initialData?.price || 0,
      compare_at_price: initialData?.compare_at_price || null,
      cost_price: initialData?.cost_price || null,
      currency: initialData?.currency || "USD",
      inventory_quantity: initialData?.inventory_quantity || 0,
      is_active: initialData?.is_active ?? true,
      is_redeemable_with_points: initialData?.is_redeemable_with_points ?? false,
      points_cost: initialData?.points_cost || null,
    },
  });

  const isRedeemable = form.watch("is_redeemable_with_points");

  const onSubmit = async (data: ProductFormValues) => {
    const productData = {
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      sku: data.sku || null,
      price: data.price,
      compare_at_price: data.compare_at_price || null,
      cost_price: data.cost_price || null,
      currency: data.currency,
      inventory_quantity: data.inventory_quantity,
      is_active: data.is_active,
      is_redeemable_with_points: data.is_redeemable_with_points,
      points_cost: data.is_redeemable_with_points ? data.points_cost : null,
      images: [] as string[],
      variants: [] as any[],
      venue_id: null,
      inventory_policy: "deny",
    };

    if (isEditing && initialData?.id) {
      await updateProduct.mutateAsync({
        productId: initialData.id,
        updates: productData,
      });
    } else {
      await createProduct.mutateAsync(productData);
    }

    onSuccess?.();
    navigate("/dashboard");
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" />
            Basic Information
          </h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your product..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Product SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing
          </h3>

          <div className="grid sm:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="compare_at_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compare at Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Original price"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Strikethrough price</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Your cost"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>For margin tracking</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h3 className="font-semibold text-foreground">Inventory</h3>

          <FormField
            control={form.control}
            name="inventory_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity in Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Product is visible and available for purchase
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Points Redemption */}
        <div className="bg-card rounded-xl p-6 border border-border space-y-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5" />
            Points Redemption
          </h3>

          <FormField
            control={form.control}
            name="is_redeemable_with_points"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <FormLabel className="text-base">Enable Point Redemption</FormLabel>
                  <FormDescription>
                    Allow customers to purchase this product with PromoPoints
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {isRedeemable && (
            <FormField
              control={form.control}
              name="points_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points Required</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 500"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    How many PromoPoints are needed to redeem this product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update Product" : "Create Product"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
