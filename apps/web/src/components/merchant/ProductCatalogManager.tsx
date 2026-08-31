import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
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
    const { t } = useI18n();

    const kindLabel = (value?: string) => {
        const keys: Record<string, TranslationKey> = {
            product: "merchCat.kindProduct",
            service: "merchCat.kindService",
            experience: "merchCat.kindExp",
            perk: "merchCat.kindPerk",
        };
        return value && keys[value] ? t(keys[value]) : (value || t("merchCat.kindProduct"));
    };
    const fulfillLabel = (value?: string) => {
        const keys: Record<string, TranslationKey> = {
            pickup: "merchCat.pickup",
            booking: "merchCat.booking",
            reservation: "merchCat.reservation",
            online: "merchCat.online",
            onsite: "merchCat.onsite",
        };
        return value && keys[value] ? t(keys[value]) : (value || t("merchCat.pickup"));
    };
    const visLabel = (value?: string) => {
        const keys: Record<string, TranslationKey> = {
            public: "merchCat.visPublic",
            moment_participants: "merchCat.visMoment",
            hidden: "merchCat.visHidden",
        };
        return value && keys[value] ? t(keys[value]) : (value || t("merchCat.visPublic"));
    };
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
                title: t("merchCat.err"),
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
                title: t("merchCat.ok"),
                description: editingProduct ? t("merchCat.updated") : t("merchCat.created"),
            });

            setIsDialogOpen(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            toast({
                title: t("merchCat.err"),
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
        if (!confirm(t("merchCat.confirmDel"))) return;

        try {
            const response = await fetch(`${API_URL}/api/merchant/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete product');

            toast({
                title: t("merchCat.ok"),
                description: t("merchCat.deleted"),
            });

            fetchProducts();
        } catch (error: any) {
            toast({
                title: t("merchCat.err"),
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
                    <h2 className="text-2xl font-bold text-foreground">{t("merchCat.title")}</h2>
                    <p className="text-muted-foreground">{t("merchCat.copy")}</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {t("merchCat.add")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? t("merchCat.edit") : t("merchCat.addNew")}</DialogTitle>
                            <DialogDescription>
                                {editingProduct ? t("merchCat.updateDetails") : t("merchCat.createCopy")}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name">{t("merchCat.name")}</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="description">{t("merchCat.desc")}</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">{t("merchCat.category")}</Label>
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
                                            <SelectValue placeholder={t("merchCat.selectCat")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="food">{t("merchCat.catFood")}</SelectItem>
                                            <SelectItem value="retail">{t("merchCat.catRetail")}</SelectItem>
                                            <SelectItem value="service">{t("merchCat.catService")}</SelectItem>
                                            <SelectItem value="entertainment">{t("merchCat.catEnt")}</SelectItem>
                                            <SelectItem value="other">{t("merchCat.catOther")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="listing_kind">{t("merchCat.storeType")}</Label>
                                    <Select
                                        value={formData.listing_kind}
                                        onValueChange={(value) => setFormData({ ...formData, listing_kind: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("merchCat.listingType")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="product">{t("merchCat.kindProduct")}</SelectItem>
                                            <SelectItem value="service">{t("merchCat.kindService")}</SelectItem>
                                            <SelectItem value="experience">{t("merchCat.kindExp")}</SelectItem>
                                            <SelectItem value="perk">{t("merchCat.kindPerk")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="image_url">{t("merchCat.image")}</Label>
                                    <Input
                                        id="image_url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="fulfillment_mode">{t("merchCat.fulfillment")}</Label>
                                    <Select
                                        value={formData.fulfillment_mode}
                                        onValueChange={(value) => setFormData({ ...formData, fulfillment_mode: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("merchCat.fulfillMode")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pickup">{t("merchCat.pickup")}</SelectItem>
                                            <SelectItem value="booking">{t("merchCat.booking")}</SelectItem>
                                            <SelectItem value="reservation">{t("merchCat.reservation")}</SelectItem>
                                            <SelectItem value="online">{t("merchCat.online")}</SelectItem>
                                            <SelectItem value="onsite">{t("merchCat.onsite")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="visibility">{t("merchCat.visibility")}</Label>
                                    <Select
                                        value={formData.visibility}
                                        onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("merchCat.visibility")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">{t("merchCat.visPublic")}</SelectItem>
                                            <SelectItem value="moment_participants">{t("merchCat.visMoment")}</SelectItem>
                                            <SelectItem value="hidden">{t("merchCat.visHidden")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="discount_type">{t("merchCat.discType")}</Label>
                                    <Select
                                        value={formData.discount_type}
                                        onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("merchCat.selectType")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">{t("merchCat.pctOff")}</SelectItem>
                                            <SelectItem value="fixed_amount">{t("merchCat.fixedOff")}</SelectItem>
                                            <SelectItem value="bogo">{t("merchCat.bogo")}</SelectItem>
                                            <SelectItem value="free_item">{t("merchCat.freeItem")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="discount_value">{t("merchCat.discVal")}</Label>
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
                                    <Label htmlFor="price_usd">{t("merchCat.priceUsd")}</Label>
                                    <Input
                                        id="price_usd"
                                        type="number"
                                        step="0.01"
                                        value={formData.price_usd}
                                        onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="price_points">{t("merchCat.pricePts")}</Label>
                                    <Input
                                        id="price_points"
                                        type="number"
                                        value={formData.price_points}
                                        onChange={(e) => setFormData({ ...formData, price_points: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="inventory_count">{t("merchCat.inventory")}</Label>
                                    <Input
                                        id="inventory_count"
                                        type="number"
                                        value={formData.inventory_count}
                                        onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                                        placeholder={t("merchCat.invPh")}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="low_stock_threshold">{t("merchCat.lowStock")}</Label>
                                    <Input
                                        id="low_stock_threshold"
                                        type="number"
                                        value={formData.low_stock_threshold}
                                        onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="booking_url">{t("merchCat.bookingUrl")}</Label>
                                    <Input
                                        id="booking_url"
                                        value={formData.booking_url}
                                        onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="expires_at">{t("merchCat.offerEnds")}</Label>
                                    <Input
                                        id="expires_at"
                                        type="date"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="service_duration_minutes">{t("merchCat.duration")}</Label>
                                    <Input
                                        id="service_duration_minutes"
                                        type="number"
                                        value={formData.service_duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, service_duration_minutes: e.target.value })}
                                        placeholder="45"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="service_capacity">{t("merchCat.capacity")}</Label>
                                    <Input
                                        id="service_capacity"
                                        type="number"
                                        value={formData.service_capacity}
                                        onChange={(e) => setFormData({ ...formData, service_capacity: e.target.value })}
                                        placeholder="8"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="terms_conditions">{t("merchCat.terms")}</Label>
                                    <Textarea
                                        id="terms_conditions"
                                        value={formData.terms_conditions}
                                        onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                                        rows={2}
                                        placeholder={t("merchCat.termsPh")}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                                    {t("merchCat.cancel")}
                                </Button>
                                <Button type="submit" className="flex-1">
                                    {editingProduct ? t("merchCat.update") : t("merchCat.create")}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("merchCat.products")}</CardTitle>
                    <CardDescription>
                        {products.length === 1 ? t("merchCat.countOne", { count: products.length }) : t("merchCat.countMany", { count: products.length })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-8">{t("merchCat.loading")}</p>
                    ) : products.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            {t("merchCat.empty")}
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("merchCat.colProduct")}</TableHead>
                                    <TableHead>{t("merchCat.colStore")}</TableHead>
                                    <TableHead>{t("merchCat.colPrice")}</TableHead>
                                    <TableHead>{t("merchCat.colInv")}</TableHead>
                                    <TableHead>{t("merchCat.colSales")}</TableHead>
                                    <TableHead>{t("merchCat.colStatus")}</TableHead>
                                    <TableHead className="text-right">{t("merchCat.colActions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            <span className="block min-w-[11rem] max-w-[18rem] truncate">{product.name}</span>
                                            {product.discount_value ? (
                                                <span className="mt-1 block text-xs text-primary">
                                                    {t("merchCat.offer", { value: `${product.discount_value}${product.discount_type === "percentage" ? "%" : ""}` })}
                                                </span>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            <div className="min-w-[10rem] space-y-1">
                                                <span className="block truncate">{kindLabel(product.listing_kind || product.category)}</span>
                                                <span className="block text-xs text-muted-foreground">{fulfillLabel(product.fulfillment_mode)} · {visLabel(product.visibility)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(product.price_usd ?? product.price) && `$${Number(product.price_usd ?? product.price).toFixed(2)}`}
                                            {(product.price_usd ?? product.price) && (product.price_points ?? product.points_cost) && ' / '}
                                            {(product.price_points ?? product.points_cost) && t("merchCat.pts", { count: product.price_points ?? product.points_cost })}
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
                                                    <span className="text-muted-foreground">{t("merchCat.unlimited")}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.total_sales || 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.is_active ? "default" : "secondary"}>
                                                {product.is_active ? t("merchCat.active") : t("merchCat.inactive")}
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
