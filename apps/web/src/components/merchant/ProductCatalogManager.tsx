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
    price_usd?: number;
    price_points?: number;
    inventory_count?: number;
    low_stock_threshold?: number;
    total_sales: number;
    revenue_generated: number;
    is_active: boolean;
    image_url?: string;
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
                price_usd: formData.price_usd ? parseFloat(formData.price_usd) : null,
                price_points: formData.price_points ? parseInt(formData.price_points) : null,
                inventory_count: formData.inventory_count ? parseInt(formData.inventory_count) : null,
                low_stock_threshold: parseInt(formData.low_stock_threshold),
                discount_type: formData.discount_type || null,
                discount_value: formData.discount_value ? parseFloat(formData.discount_value) : null,
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
            price_usd: product.price_usd?.toString() || "",
            price_points: product.price_points?.toString() || "",
            inventory_count: product.inventory_count?.toString() || "",
            low_stock_threshold: product.low_stock_threshold?.toString() || "10",
            discount_type: "",
            discount_value: "",
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
        });
        setEditingProduct(null);
    };

    const isLowStock = (product: Product) => {
        if (product.inventory_count === null || product.inventory_count === undefined) return false;
        return product.inventory_count <= (product.low_stock_threshold || 10);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
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
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                            <DialogDescription>
                                {editingProduct ? 'Update product details' : 'Create a new product in your catalog'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="col-span-2">
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
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                                    <Label htmlFor="price_points">Price (Points)</Label>
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
                            </div>

                            <div className="flex gap-3 pt-4">
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
                                    <TableHead>Category</TableHead>
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
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category || 'Uncategorized'}</TableCell>
                                        <TableCell>
                                            {product.price_usd && `$${product.price_usd.toFixed(2)}`}
                                            {product.price_usd && product.price_points && ' / '}
                                            {product.price_points && `${product.price_points} pts`}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {product.inventory_count !== null ? (
                                                    <>
                                                        <Package className="w-4 h-4" />
                                                        {product.inventory_count}
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
