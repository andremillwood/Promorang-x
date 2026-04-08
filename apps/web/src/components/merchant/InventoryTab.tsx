import { Package, DollarSign, TrendingUp, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useMerchantProducts,
  useMerchantInventoryStats,
  useMerchantRedemptions,
  useDeleteProduct,
} from "@/hooks/useMerchantProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function MerchantInventoryTab() {
  const { data: products, isLoading: productsLoading } = useMerchantProducts();
  const { data: stats, isLoading: statsLoading } = useMerchantInventoryStats();
  const { data: redemptions, isLoading: redemptionsLoading } = useMerchantRedemptions();
  const deleteProduct = useDeleteProduct();

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <div className="bg-card rounded-xl p-4 border border-border">
              <Package className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.totalProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.activeProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <DollarSign className="w-5 h-5 text-accent mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.redeemableProducts || 0}</p>
              <p className="text-sm text-muted-foreground">Point Redeemable</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <AlertCircle className="w-5 h-5 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats?.lowStock || 0}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </>
        )}
      </div>

      {/* Products List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Products</h3>
          <Button asChild>
            <Link to="/dashboard/products/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {productsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-xl p-4 border border-border flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                    {!product.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {product.is_redeemable_with_points && (
                      <Badge variant="outline" className="text-accent border-accent">
                        {product.points_cost} pts
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${product.price.toFixed(2)} {product.currency} • {product.inventory_quantity} in stock
                  </p>
                  {product.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{product.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProduct.mutate(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No products added yet</p>
            <Button asChild>
              <Link to="/dashboard/products/add">Add Your First Product</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Pending Redemptions */}
      {redemptions && redemptions.filter(r => r.status === "pending").length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-4">Pending Redemptions</h3>
          <div className="space-y-3">
            {redemptions
              .filter(r => r.status === "pending")
              .slice(0, 5)
              .map((redemption) => (
                <div
                  key={redemption.id}
                  className="bg-card rounded-xl p-4 border border-yellow-500/50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      Order #{redemption.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {redemption.points_spent} points • Qty: {redemption.quantity}
                    </p>
                  </div>
                  <Button size="sm">Process</Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
