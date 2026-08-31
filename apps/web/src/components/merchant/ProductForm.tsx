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
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.string().optional(),
  sku: z.string().max(50).optional(),
  price: z.coerce.number().min(0),
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

const categories: { value: string; label: TranslationKey }[] = [
  { value: "Apparel", label: "addProduct.catApparel" },
  { value: "Electronics", label: "addProduct.catElectronics" },
  { value: "Food & Beverage", label: "addProduct.catFood" },
  { value: "Health & Beauty", label: "addProduct.catBeauty" },
  { value: "Home & Garden", label: "addProduct.catHome" },
  { value: "Sports & Outdoors", label: "addProduct.catSports" },
  { value: "Toys & Games", label: "addProduct.catToys" },
  { value: "Other", label: "addProduct.catOther" },
];

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = !!initialData?.id;

  const localizedSchema = productSchema.extend({
    name: z.string().min(1, t("addProduct.nameRequired")).max(200),
    price: z.coerce.number().min(0, t("addProduct.pricePositive")),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(localizedSchema),
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
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t("addProduct.basic")}
          </h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("addProduct.name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("addProduct.namePlaceholder")} {...field} />
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
                <FormLabel>{t("addProduct.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("addProduct.descPlaceholder")}
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("addProduct.category")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("addProduct.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {t(cat.label)}
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
                  <FormLabel>{t("addProduct.sku")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("addProduct.skuPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t("addProduct.pricing")}
          </h3>

          <div className="grid gap-6 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("addProduct.price")}</FormLabel>
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
                  <FormLabel>{t("addProduct.compare")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t("addProduct.comparePlaceholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>{t("addProduct.compareHint")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cost_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("addProduct.cost")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t("addProduct.costPlaceholder")}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>{t("addProduct.costHint")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="font-semibold text-foreground">{t("addProduct.inventory")}</h3>

          <FormField
            control={form.control}
            name="inventory_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("addProduct.qty")}</FormLabel>
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
              <FormItem className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <FormLabel className="text-base">{t("addProduct.active")}</FormLabel>
                  <FormDescription>
                    {t("addProduct.activeHint")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Earned Value Redemption */}
        <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5" />
            {t("addProduct.redemption")}
          </h3>

          <FormField
            control={form.control}
            name="is_redeemable_with_points"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <FormLabel className="text-base">{t("addProduct.enableRedeem")}</FormLabel>
                  <FormDescription>
                    {t("addProduct.enableRedeemHint")}
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
                  <FormLabel>{t("addProduct.valueRequired")}</FormLabel>
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
                    {t("addProduct.pointsHint")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            {t("addProduct.cancel")}
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("addProduct.saving")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? t("addProduct.update") : t("addProduct.create")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
