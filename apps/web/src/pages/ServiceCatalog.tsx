import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Trash2, Edit2, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/agency/ProductDialog";

export default function ServiceCatalog() {
    const { activeOrgId, activeRole } = useAuth();
    const { data: products, isLoading } = useProducts(activeOrgId);
    const deleteProduct = useDeleteProduct();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const filteredProducts = products?.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            deleteProduct.mutate({ id, organizationId: activeOrgId! });
        }
    };

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">Catalog</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your expertise, services, and digital products.
                    </p>
                </div>
                <Button onClick={handleCreate} className="rounded-xl px-6 shadow-soft">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search services..."
                        className="pl-10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse h-64 bg-muted/40" />
                    ))
                ) : filteredProducts?.length === 0 ? (
                    <Card className="col-span-full py-12 text-center bg-muted/20 border-dashed">
                        <CardContent className="space-y-4">
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">No services yet</h3>
                                <p className="text-muted-foreground">List your first service or expertise to get started.</p>
                            </div>
                            <Button onClick={handleCreate} variant="outline" className="rounded-xl">
                                Add Item
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredProducts?.map((product) => (
                        <Card key={product.id} className="group overflow-hidden border-border/40 hover:border-primary/50 transition-all duration-300 shadow-soft hover:shadow-soft-xl bg-card/60 backdrop-blur-sm">
                            <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                        <ExternalLink className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none capitalize">
                                        {product.type}
                                    </Badge>
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-background/80 backdrop-blur-md">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(product.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{product.name}</CardTitle>
                                    <span className="font-bold text-primary">
                                        {product.price ? `$${product.price}` : "Custom"}
                                    </span>
                                </div>
                                <CardDescription className="line-clamp-2 mt-1 min-h-[2.5rem]">
                                    {product.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                                        {product.status}
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-wider hover:text-primary" onClick={() => handleEdit(product)}>
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <ProductDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                product={selectedProduct}
                organizationId={activeOrgId!}
            />
        </div>
    );
}
