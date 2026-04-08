import { useState } from "react";
import { Gift, ShoppingBag, Award, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRedeemableProducts, useRedeemProduct } from "@/hooks/useMerchantProducts";
import { useUserPoints } from "@/hooks/usePoints";
import { Skeleton } from "@/components/ui/skeleton";

export function RewardsShop() {
  const { data: products, isLoading: productsLoading } = useRedeemableProducts();
  const { data: userPoints, isLoading: pointsLoading } = useUserPoints();
  const redeemProduct = useRedeemProduct();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Get total points across all brands
  const totalPoints = userPoints?.reduce((sum, p) => sum + (p.current_points || 0), 0) || 0;

  const handleRedeem = async (product: any) => {
    setSelectedProduct(product);
    setConfirmOpen(true);
  };

  const confirmRedeem = async () => {
    if (!selectedProduct) return;

    // Find matching brand points
    const brandPoints = userPoints?.find(p => p.brand_id === selectedProduct.merchant_id);
    if (!brandPoints) return;

    await redeemProduct.mutateAsync({
      productId: selectedProduct.id,
      brandId: selectedProduct.merchant_id,
    });

    setConfirmOpen(false);
    setSelectedProduct(null);
  };

  if (productsLoading || pointsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Header */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm">Your PromoPoints</p>
            <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Gift className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const canAfford = userPoints?.some(
              p => p.brand_id === product.merchant_id && (p.current_points || 0) >= (product.points_cost || 0)
            );

            return (
              <div
                key={product.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-card transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Award className="w-3 h-3" />
                      {product.points_cost?.toLocaleString()} pts
                    </Badge>
                    <Button
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => handleRedeem(product)}
                    >
                      {canAfford ? "Redeem" : "Not Enough Points"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Rewards Available Yet</h3>
          <p className="text-muted-foreground">
            Check back soon for products you can redeem with your points!
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  <Award className="w-3 h-3 inline mr-1" />
                  {selectedProduct.points_cost?.toLocaleString()} points
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRedeem}
              disabled={redeemProduct.isPending}
            >
              {redeemProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Redemption
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
