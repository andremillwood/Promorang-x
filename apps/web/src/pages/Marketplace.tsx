import { useState, useEffect } from "react";
import { Store, ShoppingBag, MapPin, Search, Filter, ArrowRight, Coins, CreditCard, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/hooks/useMarketplace";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    points_cost: number;
    images: any;
    merchant_id: string;
    is_redeemable_with_points: boolean;
    venues: {
        name: string;
        address: string;
    };
}

const Marketplace = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("merchant_products")
            .select(`
        *,
        venues (
          name,
          address
        )
      `)
            .eq("is_active", true);

        if (error) {
            console.error("Error fetching products:", error);
        } else {
            setProducts(data as any);
        }
        setLoading(false);
    };

    const { purchase, processing } = useMarketplace();

    const handlePurchase = async (product: Product, method: 'cash' | 'points') => {
        await purchase(product.id, method);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Search & Filter Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight mb-2 flex items-center gap-3">
                        Local Marketplace <Store className="w-8 h-8 text-primary" />
                    </h1>
                    <p className="text-muted-foreground">Support local venues. Earn Access Points with every purchase.</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products or venues..."
                            className="pl-10 bg-card rounded-xl border-border/40 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl border-border/40">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Categories / Tags */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All Products', 'Apparel', 'Food & Drink', 'Experiences', 'Services'].map((cat) => (
                    <Badge key={cat} variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors">
                        {cat}
                    </Badge>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl p-4 border border-border/40 animate-pulse h-80" />
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No products found</h3>
                        <p className="text-muted-foreground">Check back later or try a different search.</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <div key={product.id} className="group bg-card rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col">
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-muted">
                                {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <ShoppingBag className="w-12 h-12 opacity-20" />
                                    </div>
                                )}

                                {product.is_redeemable_with_points && (
                                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-amber-400" /> +10 ACCESS POINTS
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                                        <MapPin className="w-3 h-3" /> {product.venues?.name || "Local Branch"}
                                    </div>
                                    <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                                    {product.description || "Limited edition local merch."}
                                </p>

                                <div className="space-y-3">
                                    {/* Buy with Cash */}
                                    <Button
                                        className="w-full justify-between h-10 rounded-xl group/btn"
                                        variant="hero"
                                        onClick={() => handlePurchase(product, 'cash')}
                                    >
                                        <span className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" /> Buy Now
                                        </span>
                                        <span className="font-bold">${product.price}</span>
                                    </Button>

                                    {/* Redeem with Points */}
                                    {product.is_redeemable_with_points && (
                                        <Button
                                            className="w-full justify-between h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20"
                                            variant="outline"
                                            onClick={() => handlePurchase(product, 'points')}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Coins className="w-4 h-4" /> Use Points
                                            </span>
                                            <span className="font-bold">{product.points_cost} Pts</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Value Prop Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-serif font-bold mb-2">Spend $1, Earn 10 Points</h2>
                    <p className="text-muted-foreground text-sm">Every direct purchase from a local merchant earns you Access Points. Points are used to build your Access Rank and qualify for exclusive, limited-entry moments.</p>
                    <Button variant="link" className="p-0 text-primary mt-4 h-auto">
                        Learn about Access Ranks <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-10">
                    <Sparkles className="w-32 h-32" />
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
