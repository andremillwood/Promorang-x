import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Product {
    id: string;
    name: string;
    description?: string;
    category?: string;
    listing_kind?: string;
    fulfillment_mode?: string;
    booking_url?: string;
    service_duration_minutes?: number;
    service_capacity?: number;
    visibility?: string;
    price?: number;
    price_usd?: number;
    points_cost?: number;
    price_points?: number;
    inventory_quantity?: number;
    inventory_count?: number;
    low_stock_threshold?: number;
    total_sales: number;
    revenue_generated: number;
    is_active: boolean;
    image_url?: string;
    discount_type?: string;
    discount_value?: number;
    expires_at?: string;
    terms_conditions?: string;
}

const ProductCatalogManager = () => {
    const { user, session } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        price_usd: "",
        price_points: "",
        inventory_count: "",
        low_stock_threshold: "10",
        discount_type: "",
        discount_value: "",
        image_url: "",
        listing_kind: "product",
        fulfillment_mode: "pickup",
        booking_url: "",
        service_duration_minutes: "",
        service_capacity: "",
        visibility: "public",
        expires_at: "",
        terms_conditions: "",
    });

    useEffect(() => {
        if (session?.access_token) {
            fetchProducts();
        }
    }, [session]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/merchant/products`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            setProducts(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                price: formData.price_usd ? parseFloat(formData.price_usd) : null,
                price_usd: formData.price_usd ? parseFloat(formData.price_usd) : null,
                points_cost: formData.price_points ? parseInt(formData.price_points) : null,
                price_points: formData.price_points ? parseInt(formData.price_points) : null,
                inventory_quantity: formData.inventory_count ? parseInt(formData.inventory_count) : null,
                inventory_count: formData.inventory_count ? parseInt(formData.inventory_count) : null,
                low_stock_threshold: parseInt(formData.low_stock_threshold),
                discount_type: formData.discount_type || null,
                discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null,
                image_url: formData.image_url || null,
                listing_kind: formData.listing_kind || (formData.category === "service" ? "service" : "product"),
                fulfillment_mode: formData.fulfillment_mode || (formData.category === "service" ? "booking" : "pickup"),
                booking_url: formData.booking_url || null,
                service_duration_minutes: formData.service_duration_minutes ? parseInt(formData.service_duration_minutes) : null,
                service_capacity: formData.service_capacity ? parseInt(formData.service_capacity) : null,
                visibility: formData.visibility,
                expires_at: formData.expires_at || null,
                terms_conditions: formData.terms_conditions || null,
            };

            const url = editingProduct
                ? `${API_URL}/api/merchant/products/${editingProduct.id}`
                : `${API_URL}/api/merchant/products`;

            const method = editingProduct ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) throw new Error('Failed to save product');

            toast({
                title: "Success",
                description: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
            });

            setIsDialogOpen(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || "",
            category: product.category || "",
            price_usd: (product.price_usd ?? product.price)?.toString() || "",
            price_points: (product.price_points ?? product.points_cost)?.toString() || "",
            inventory_count: (product.inventory_count ?? product.inventory_quantity)?.toString() || "",
            low_stock_threshold: product.low_stock_threshold?.toString() || "10",
            discount_type: "",
            discount_value: "",
            image_url: product.image_url || "",
            listing_kind: product.listing_kind || (product.category === "service" ? "service" : "product"),
            fulfillment_mode: product.fulfillment_mode || (product.category === "service" ? "booking" : "pickup"),
            booking_url: product.booking_url || "",
            service_duration_minutes: product.service_duration_minutes?.toString() || "",
            service_capacity: product.service_capacity?.toString() || "",
            visibility: product.visibility || "public",
            expires_at: product.expires_at ? product.expires_at.slice(0, 10) : "",
            terms_conditions: product.terms_conditions || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${API_URL}/api/merchant/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete product');

            toast({
                title: "Success",
                description: "Product deleted successfully",
            });

            fetchProducts();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            category: "",
            price_usd: "",
            price_points: "",
            inventory_count: "",
            low_stock_threshold: "10",
            discount_type: "",
            discount_value: "",
            image_url: "",
            listing_kind: "product",
            fulfillment_mode: "pickup",
            booking_url: "",
            service_duration_minutes: "",
            service_capacity: "",
            visibility: "public",
            expires_at: "",
            terms_conditions: "",
        });
        setEditingProduct(null);
    };

    const isLowStock = (product: Product) => {
        const inventory = product.inventory_count ?? product.inventory_quantity;
        if (inventory === null || inventory === undefined) return false;
        return inventory <= (product.low_stock_threshold || 10);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-foreground">Product Catalog</h2>
                    <p className="text-muted-foreground">Manage your products and inventory</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                            <DialogDescription>
                                {editingProduct ? 'Update product details' : 'Create a new product in your catalog'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({
                                            ...formData,
                                            category: value,
                                            listing_kind: value === "service" ? "service" : formData.listing_kind,
                                            fulfillment_mode: value === "service" ? "booking" : formData.fulfillment_mode,
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="food">Food & Beverage</SelectItem>
                                            <SelectItem value="retail">Retail</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                            <SelectItem value="entertainment">Entertainment</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="listing_kind">Storefront Type</Label>
                                    <Select
                                        value={formData.listing_kind}
                                        onValueChange={(value) => setFormData({ ...formData, listing_kind: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Listing type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="product">Product</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                            <SelectItem value="experience">Experience</SelectItem>
                                            <SelectItem value="perk">Perk</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="image_url">Storefront Image URL</Label>
                                    <Input
                                        id="image_url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="fulfillment_mode">Fulfillment</Label>
                                    <Select
                                        value={formData.fulfillment_mode}
                                        onValueChange={(value) => setFormData({ ...formData, fulfillment_mode: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Fulfillment mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pickup">Pickup</SelectItem>
                                            <SelectItem value="booking">Booking</SelectItem>
                                            <SelectItem value="reservation">Reservation</SelectItem>
                                            <SelectItem value="online">Online</SelectItem>
                                            <SelectItem value="onsite">On-site redemption</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="visibility">Visibility</Label>
                                    <Select
                                        value={formData.visibility}
                                        onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">Public storefront</SelectItem>
                                            <SelectItem value="moment_participants">Moment participants</SelectItem>
                                            <SelectItem value="hidden">Hidden</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="discount_type">Discount Type</Label>
                                    <Select
                                        value={formData.discount_type}
                                        onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage Off</SelectItem>
                                            <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                                            <SelectItem value="bogo">Buy One Get One</SelectItem>
                                            <SelectItem value="free_item">Free Item</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="discount_value">Discount Value</Label>
                                    <Input
                                        id="discount_value"
                                        type="number"
                                        step="0.01"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        placeholder="20"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="price_usd">Price (USD)</Label>
                                    <Input
                                        id="price_usd"
                                        type="number"
                                        step="0.01"
                                        value={formData.price_usd}
                                        onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="price_points">Price (earned value)</Label>
                                    <Input
                                        id="price_points"
                                        type="number"
                                        value={formData.price_points}
                                        onChange={(e) => setFormData({ ...formData, price_points: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="inventory_count">Inventory Count</Label>
                                    <Input
                                        id="inventory_count"
                                        type="number"
                                        value={formData.inventory_count}
                                        onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
                                    <Input
                                        id="low_stock_threshold"
                                        type="number"
                                        value={formData.low_stock_threshold}
                                        onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="booking_url">Booking URL</Label>
                                    <Input
                                        id="booking_url"
                                        value={formData.booking_url}
                                        onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="expires_at">Offer Ends</Label>
                                    <Input
                                        id="expires_at"
                                        type="date"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="service_duration_minutes">Duration Minutes</Label>
                                    <Input
                                        id="service_duration_minutes"
                                        type="number"
                                        value={formData.service_duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, service_duration_minutes: e.target.value })}
                                        placeholder="45"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="service_capacity">Service Capacity</Label>
                                    <Input
                                        id="service_capacity"
                                        type="number"
                                        value={formData.service_capacity}
                                        onChange={(e) => setFormData({ ...formData, service_capacity: e.target.value })}
                                        placeholder="8"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="terms_conditions">Terms / Redemption Notes</Label>
                                    <Textarea
                                        id="terms_conditions"
                                        value={formData.terms_conditions}
                                        onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                                        rows={2}
                                        placeholder="Valid in-store only, one per customer, show code at counter..."
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>
                        {products.length} product{products.length !== 1 ? 's' : ''} in catalog
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-8">Loading products...</p>
                    ) : products.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No products yet. Click "Add Product" to get started.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Storefront</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Inventory</TableHead>
                                    <TableHead>Sales</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            <span className="block min-w-[11rem] max-w-[18rem] truncate">{product.name}</span>
                                            {product.discount_value ? (
                                                <span className="mt-1 block text-xs text-primary">
                                                    {product.discount_value}{product.discount_type === "percentage" ? "%" : ""} offer
                                                </span>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            <div className="min-w-[10rem] space-y-1">
                                                <span className="block truncate capitalize">{product.listing_kind || product.category || 'Product'}</span>
                                                <span className="block text-xs text-muted-foreground capitalize">{product.fulfillment_mode || 'pickup'} · {product.visibility || 'public'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(product.price_usd ?? product.price) && `$${Number(product.price_usd ?? product.price).toFixed(2)}`}
                                            {(product.price_usd ?? product.price) && (product.price_points ?? product.points_cost) && ' / '}
                                            {(product.price_points ?? product.points_cost) && `${product.price_points ?? product.points_cost} pts`}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex min-w-[7rem] items-center gap-2">
                                                {(product.inventory_count ?? product.inventory_quantity) !== null ? (
                                                    <>
                                                        <Package className="w-4 h-4" />
                                                        {product.inventory_count ?? product.inventory_quantity}
                                                        {isLowStock(product) && (
                                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">Unlimited</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.total_sales || 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.is_active ? "default" : "secondary"}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductCatalogManager;
