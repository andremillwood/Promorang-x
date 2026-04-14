import { useState } from "react";
import {
    ExternalLink,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Loader2,
    Package,
    X,
    Unplug,
    Smartphone,
    Store,
    Globe,
    Key,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    useIntegrations,
    useShopifyConnect,
    useSquareConnect,
    useWooCommerceConnect,
    useSyncProducts,
    useDisconnectIntegration,
} from "@/hooks/useIntegrations";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const IntegrationsPanel = () => {
    const { data: integrations, isLoading } = useIntegrations();
    const shopifyConnect = useShopifyConnect();
    const squareConnect = useSquareConnect();
    const wooConnect = useWooCommerceConnect();
    const syncProducts = useSyncProducts();
    const disconnect = useDisconnectIntegration();
    const { toast } = useToast();

    const [shopifyDomain, setShopifyDomain] = useState("");
    const [showShopifyInput, setShowShopifyInput] = useState(false);
    const [showWooForm, setShowWooForm] = useState(false);
    const [wooSiteUrl, setWooSiteUrl] = useState("");
    const [wooKey, setWooKey] = useState("");
    const [wooSecret, setWooSecret] = useState("");

    const getIntegration = (provider: string) =>
        integrations?.find((i) => i.provider === provider && i.status === "connected");

    const shopify = getIntegration("shopify");
    const square = getIntegration("square");
    const woo = getIntegration("woocommerce");

    const handlePosComingSoon = (name: string) => {
        toast({
            title: `${name} POS — Coming Soon!`,
            description: "We'll notify you as soon as this integration is available.",
        });
    };

    return (
        <div className="space-y-6">
            {/* E-commerce Integrations */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-soft">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-1">E-commerce Integrations</h3>
                        <p className="text-muted-foreground text-sm">
                            Sync your existing products from Shopify, Square, or WooCommerce.
                        </p>
                    </div>
                    {(shopify || square || woo) && (
                        <Badge
                            variant="outline"
                            className="gap-1 text-emerald-600 border-emerald-500/20 bg-emerald-500/5"
                        >
                            <CheckCircle className="w-3 h-3" />
                            Connected
                        </Badge>
                    )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Shopify Card */}
                    <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#96bf48]/10 flex items-center justify-center">
                                <img
                                    src="https://cdn.worldvectorlogo.com/logos/shopify.svg"
                                    alt="Shopify"
                                    className="w-8 h-8"
                                />
                            </div>
                            {shopify ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Connected
                                </Badge>
                            ) : null}
                        </div>
                        <h4 className="font-bold mb-2">Shopify</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                            Import products, collections, and inventory counts automatically.
                        </p>

                        {shopify ? (
                            <div className="space-y-3">
                                <div className="text-xs text-muted-foreground">
                                    <p className="flex items-center gap-1">
                                        <Store className="w-3 h-3" />{" "}
                                        {shopify.external_store_name}
                                    </p>
                                    <p className="flex items-center gap-1 mt-1">
                                        <Package className="w-3 h-3" />{" "}
                                        {shopify.products_synced} products
                                    </p>
                                    {shopify.last_synced_at && (
                                        <p className="mt-1 text-[10px]">
                                            Last synced:{" "}
                                            {format(new Date(shopify.last_synced_at), "MMM d, h:mm a")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs"
                                        onClick={() => syncProducts.mutate("shopify")}
                                        disabled={syncProducts.isPending}
                                    >
                                        {syncProducts.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        ) : (
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                        )}
                                        Sync
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs text-destructive"
                                        onClick={() => disconnect.mutate("shopify")}
                                    >
                                        <Unplug className="w-3 h-3 mr-1" /> Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : showShopifyInput ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={shopifyDomain}
                                    onChange={(e) => setShopifyDomain(e.target.value)}
                                    placeholder="your-store.myshopify.com"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-[#96bf48] hover:bg-[#7ea83a] text-white"
                                        onClick={() => {
                                            if (!shopifyDomain) return;
                                            shopifyConnect.mutate(shopifyDomain);
                                        }}
                                        disabled={shopifyConnect.isPending || !shopifyDomain}
                                    >
                                        {shopifyConnect.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        ) : null}
                                        Connect
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowShopifyInput(false)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
                                    <span className="w-2 h-2 rounded-full bg-muted" /> Not Connected
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                                    onClick={() => setShowShopifyInput(true)}
                                >
                                    Connect Store
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Square Card */}
                    <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/33/Square_app_logo.png"
                                    alt="Square"
                                    className="w-8 h-8"
                                />
                            </div>
                            {square ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Connected
                                </Badge>
                            ) : null}
                        </div>
                        <h4 className="font-bold mb-2">Square</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                            Sync your Square catalog and track in-store sales attribution.
                        </p>

                        {square ? (
                            <div className="space-y-3">
                                <div className="text-xs text-muted-foreground">
                                    <p className="flex items-center gap-1">
                                        <Store className="w-3 h-3" /> {square.external_store_name}
                                    </p>
                                    <p className="flex items-center gap-1 mt-1">
                                        <Package className="w-3 h-3" /> {square.products_synced} items
                                    </p>
                                    {square.last_synced_at && (
                                        <p className="mt-1 text-[10px]">
                                            Last synced:{" "}
                                            {format(new Date(square.last_synced_at), "MMM d, h:mm a")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs"
                                        onClick={() => syncProducts.mutate("square")}
                                        disabled={syncProducts.isPending}
                                    >
                                        {syncProducts.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        ) : (
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                        )}
                                        Sync
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs text-destructive"
                                        onClick={() => disconnect.mutate("square")}
                                    >
                                        <Unplug className="w-3 h-3 mr-1" /> Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
                                    <span className="w-2 h-2 rounded-full bg-muted" /> Not Connected
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                                    onClick={() => squareConnect.mutate()}
                                    disabled={squareConnect.isPending}
                                >
                                    {squareConnect.isPending ? (
                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                    ) : null}
                                    Connect Square
                                </Button>
                            </>
                        )}
                    </div>

                    {/* WooCommerce Card */}
                    <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#96588a]/10 flex items-center justify-center">
                                <img
                                    src="https://cdn.worldvectorlogo.com/logos/woocommerce.svg"
                                    alt="WooCommerce"
                                    className="w-8 h-8"
                                />
                            </div>
                            {woo ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Connected
                                </Badge>
                            ) : null}
                        </div>
                        <h4 className="font-bold mb-2">WooCommerce</h4>
                        <p className="text-xs text-muted-foreground mb-4">
                            Sync your WordPress store using REST API keys.
                        </p>

                        {woo ? (
                            <div className="space-y-3">
                                <div className="text-xs text-muted-foreground">
                                    <p className="flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {woo.external_store_name}
                                    </p>
                                    <p className="flex items-center gap-1 mt-1">
                                        <Package className="w-3 h-3" /> {woo.products_synced} products
                                    </p>
                                    {woo.last_synced_at && (
                                        <p className="mt-1 text-[10px]">
                                            Last synced:{" "}
                                            {format(new Date(woo.last_synced_at), "MMM d, h:mm a")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs"
                                        onClick={() => syncProducts.mutate("woocommerce")}
                                        disabled={syncProducts.isPending}
                                    >
                                        {syncProducts.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        ) : (
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                        )}
                                        Sync
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs text-destructive"
                                        onClick={() => disconnect.mutate("woocommerce")}
                                    >
                                        <Unplug className="w-3 h-3 mr-1" /> Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : showWooForm ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={wooSiteUrl}
                                    onChange={(e) => setWooSiteUrl(e.target.value)}
                                    placeholder="https://your-store.com"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                                />
                                <input
                                    type="text"
                                    value={wooKey}
                                    onChange={(e) => setWooKey(e.target.value)}
                                    placeholder="Consumer Key (ck_...)"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none font-mono text-[11px]"
                                />
                                <input
                                    type="password"
                                    value={wooSecret}
                                    onChange={(e) => setWooSecret(e.target.value)}
                                    placeholder="Consumer Secret (cs_...)"
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none font-mono text-[11px]"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-[#96588a] hover:bg-[#7d4b74] text-white"
                                        onClick={() => {
                                            if (!wooSiteUrl || !wooKey || !wooSecret) return;
                                            wooConnect.mutate({
                                                siteUrl: wooSiteUrl,
                                                consumerKey: wooKey,
                                                consumerSecret: wooSecret,
                                            });
                                        }}
                                        disabled={wooConnect.isPending}
                                    >
                                        {wooConnect.isPending ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                        ) : (
                                            <Key className="w-3 h-3 mr-1" />
                                        )}
                                        Connect
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setShowWooForm(false)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
                                    <span className="w-2 h-2 rounded-full bg-muted" /> Not Connected
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                                    onClick={() => setShowWooForm(true)}
                                >
                                    Link API Key
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Info box */}
                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground leading-relaxed">
                        <p className="font-bold text-primary mb-1">What happens when you connect?</p>
                        We pull your active products into the{" "}
                        <strong className="text-foreground">Promorang Marketplace</strong>. Orders placed
                        on Promorang will be synced back to your store as "External Sales" so your inventory
                        stays accurate.
                    </div>
                </div>
            </div>

            {/* Sync Status */}
            {!isLoading && integrations && integrations.filter(i => i.status === 'connected').length > 0 ? (
                <div className="bg-card rounded-2xl p-8 border border-border shadow-soft">
                    <h4 className="font-bold text-sm mb-4">Active Syncs</h4>
                    <div className="space-y-3">
                        {integrations.filter(i => i.status === 'connected').map((integration) => (
                            <div
                                key={integration.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-border"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-2 h-2 rounded-full ${integration.sync_status === "success"
                                                ? "bg-emerald-500"
                                                : integration.sync_status === "syncing"
                                                    ? "bg-amber-500 animate-pulse"
                                                    : integration.sync_status === "error"
                                                        ? "bg-red-500"
                                                        : "bg-muted"
                                            }`}
                                    />
                                    <div>
                                        <p className="text-sm font-medium capitalize">{integration.provider}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {integration.external_store_name} · {integration.products_synced} products
                                        </p>
                                    </div>
                                </div>
                                {integration.last_synced_at && (
                                    <p className="text-[10px] text-muted-foreground">
                                        {format(new Date(integration.last_synced_at), "MMM d, h:mm a")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : !isLoading ? (
                <div className="bg-muted/30 rounded-2xl p-8 border border-border/40">
                    <div className="max-w-md mx-auto text-center py-6">
                        <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-30" />
                        <h4 className="font-bold text-muted-foreground mb-2">No active syncs</h4>
                        <p className="text-xs text-muted-foreground">
                            Select a platform above to start importing your products.
                        </p>
                    </div>
                </div>
            ) : null}

            {/* POS Integrations */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-soft">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Point of Sale (POS) Hub</h3>
                        <p className="text-muted-foreground text-sm">
                            Bridge digital participation with in-store sales attribution.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                        <Smartphone className="w-3 h-3" /> Attribution Ready
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                    {[
                        { name: "Square", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Square_app_logo.png", connected: !!square },
                        { name: "Toast", logo: "https://pos.toasttab.com/hubfs/toast-logo-orange.svg" },
                        { name: "Clover", logo: "https://www.clover.com/content/dam/clover/en_us/images/brand/logo.svg" },
                        { name: "QuickBooks", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/QuickBooks_logo.svg" },
                        { name: "Aloha (NCR)", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a3/NCR_Corporation_logo.svg" },
                        { name: "NCB Jamaica", logo: "https://www.jncb.com/getmedia/5f1b2b3b-3b3b-4b3b-8b3b-3b3b3b3b3b3b/NCB-Logo.png" },
                    ].map((pos) => (
                        <div
                            key={pos.name}
                            className="p-4 rounded-xl border border-border hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div className="h-6 mb-3 flex items-center overflow-hidden">
                                <img
                                    src={pos.logo}
                                    alt={pos.name}
                                    className="h-full object-contain filter grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
                                />
                            </div>
                            {pos.connected ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[9px] w-fit">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Linked via E-commerce
                                </Badge>
                            ) : (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full text-[10px] h-8"
                                    onClick={() => handlePosComingSoon(pos.name)}
                                >
                                    Authorize {pos.name}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-sm">How Attribution Works in Jamaica:</h4>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <p className="font-bold text-primary text-[10px] uppercase tracking-wider">
                                1. Check-In
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                User joins your moment via Promorang in-app.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-primary text-[10px] uppercase tracking-wider">
                                2. POS Match
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                We match the transaction timestamp from your POS system.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-primary text-[10px] uppercase tracking-wider">
                                3. Brand ROI
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                We push verified ROI data to your Brand sponsors as hard proof.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPanel;
