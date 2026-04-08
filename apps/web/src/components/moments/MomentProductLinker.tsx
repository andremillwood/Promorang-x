import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Package, Link as LinkIcon, Users, Lock, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
    id: string;
    name: string;
    description: string;
    price_usd: number;
    price_points: number;
    category: string;
    image_url: string;
}

interface MomentProductLinkerProps {
    momentId: string;
    momentName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProductLinked?: () => void;
}

export default function MomentProductLinker({
    momentId,
    momentName,
    open,
    onOpenChange,
    onProductLinked
}: MomentProductLinkerProps) {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [visibility, setVisibility] = useState<'public' | 'moment_participants' | 'private'>('moment_participants');
    const [momentExclusive, setMomentExclusive] = useState(true);
    const [autoRedeem, setAutoRedeem] = useState(false);
    const [loading, setLoading] = useState(false);
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        if (open) {
            fetchProducts();
        }
    }, [open]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/merchant/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast({
                title: 'Error',
                description: 'Failed to load products',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLinkProduct = async () => {
        if (!selectedProductId) {
            toast({
                title: 'No Product Selected',
                description: 'Please select a product to link',
                variant: 'destructive'
            });
            return;
        }

        setLinking(true);
        try {
            const response = await fetch(`/api/moment-products/${momentId}/products/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: selectedProductId,
                    visibility,
                    momentExclusive,
                    autoRedeemOnParticipation: autoRedeem
                })
            });

            if (!response.ok) throw new Error('Failed to link product');

            toast({
                title: 'Product Linked!',
                description: 'Product successfully linked to moment',
            });

            onProductLinked?.();
            onOpenChange(false);

            // Reset form
            setSelectedProductId('');
            setVisibility('moment_participants');
            setMomentExclusive(true);
            setAutoRedeem(false);
        } catch (error) {
            console.error('Error linking product:', error);
            toast({
                title: 'Error',
                description: 'Failed to link product to moment',
                variant: 'destructive'
            });
        } finally {
            setLinking(false);
        }
    };

    const selectedProduct = products.find(p => p.id === selectedProductId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        Link Product to Moment
                    </DialogTitle>
                    <DialogDescription>
                        Attach a merchant product to <span className="font-semibold">{momentName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Product Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="product">Select Product</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger id="product">
                                <SelectValue placeholder="Choose a product..." />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <div className="p-4 text-center text-muted-foreground">Loading products...</div>
                                ) : products.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">No products available</div>
                                ) : (
                                    products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                <span>{product.name}</span>
                                                <Badge variant="outline" className="ml-auto">
                                                    {product.price_points > 0 && `${product.price_points} pts`}
                                                    {product.price_points > 0 && product.price_usd > 0 && ' / '}
                                                    {product.price_usd > 0 && `$${product.price_usd}`}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Product Preview */}
                    {selectedProduct && (
                        <div className="p-4 rounded-lg border bg-muted/50">
                            <div className="flex gap-4">
                                {selectedProduct.image_url && (
                                    <img
                                        src={selectedProduct.image_url}
                                        alt={selectedProduct.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-semibold">{selectedProduct.name}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {selectedProduct.description}
                                    </p>
                                    <Badge variant="secondary" className="mt-2">
                                        {selectedProduct.category}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Visibility Settings */}
                    <div className="space-y-2">
                        <Label htmlFor="visibility">Product Visibility</Label>
                        <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                            <SelectTrigger id="visibility">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">Public</div>
                                            <div className="text-xs text-muted-foreground">Everyone can see this product</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="moment_participants">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">Moment Participants Only</div>
                                            <div className="text-xs text-muted-foreground">Only visible to those who joined</div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="private">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">Private</div>
                                            <div className="text-xs text-muted-foreground">Hidden from marketplace</div>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Exclusive Access */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="space-y-0.5">
                            <Label htmlFor="exclusive">Moment Exclusive</Label>
                            <p className="text-sm text-muted-foreground">
                                Only moment participants can purchase this product
                            </p>
                        </div>
                        <Switch
                            id="exclusive"
                            checked={momentExclusive}
                            onCheckedChange={setMomentExclusive}
                        />
                    </div>

                    {/* Auto-Redeem */}
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5">
                        <div className="space-y-0.5">
                            <Label htmlFor="autoRedeem" className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                Auto-Redeem on Participation
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically create redemption codes when users join the moment
                            </p>
                        </div>
                        <Switch
                            id="autoRedeem"
                            checked={autoRedeem}
                            onCheckedChange={setAutoRedeem}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLinkProduct}
                            disabled={!selectedProductId || linking}
                        >
                            {linking ? 'Linking...' : 'Link Product'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
