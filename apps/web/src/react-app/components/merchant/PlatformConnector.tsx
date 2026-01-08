import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, CheckCircle2, RefreshCcw, AlertCircle, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PlatformConnectorProps {
    onConnected?: () => void;
}

type Platform = 'shopify' | 'woocommerce' | 'etsy' | 'bigcommerce';

const PLATFORMS = [
    { id: 'shopify', name: 'Shopify', icon: '🛍️', color: 'bg-[#95bf47]' },
    { id: 'woocommerce', name: 'WooCommerce', icon: '🛒', color: 'bg-[#96588a]' },
    { id: 'etsy', name: 'Etsy', icon: '🧶', color: 'bg-[#f1641e]' },
    { id: 'bigcommerce', name: 'BigCommerce', icon: '📦', color: 'bg-[#34313f]' },
];

export default function PlatformConnector({ onConnected }: PlatformConnectorProps) {
    const { toast } = useToast();
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('shopify');
    const [shopUrl, setShopUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [integrations, setIntegrations] = useState<Record<string, any>>({});

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        // Check status for each platform (simplification for POC)
        for (const p of PLATFORMS) {
            try {
                const response = await fetch(`/api/marketplace/integrations/${p.id}/status`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.status === 'success' && data.data.integration) {
                    setIntegrations(prev => ({ ...prev, [p.id]: data.data.integration }));
                }
            } catch (e) { }
        }
    };

    const handleConnect = async () => {
        if (!shopUrl) return;
        setLoading(true);

        try {
            if (selectedPlatform === 'woocommerce') {
                const response = await fetch('/api/marketplace/integrations/woocommerce/connect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ shopUrl, apiKey, apiSecret })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    toast({ title: "WooCommerce Connected", type: "success" });
                    fetchIntegrations();
                    if (onConnected) onConnected();
                }
            } else {
                // OAuth Flow (Shopify, Etsy, etc.)
                const response = await fetch(`/api/marketplace/integrations/${selectedPlatform}/authorize?shop=${encodeURIComponent(shopUrl)}`, {
                    credentials: 'include'
                });
                const data = await response.json();

                if (data.status === 'success' && data.data.authUrl) {
                    const width = 600, height = 800;
                    const left = window.screenX + (window.outerWidth - width) / 2;
                    const top = window.screenY + (window.outerHeight - height) / 2;
                    const popup = window.open(data.data.authUrl, 'Connect Platform', `width=${width},height=${height},left=${left},top=${top}`);

                    const timer = setInterval(() => {
                        if (popup?.closed) {
                            clearInterval(timer);
                            fetchIntegrations();
                            if (onConnected) onConnected();
                            toast({ title: `${selectedPlatform} Connected`, type: "success" });
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            toast({ title: "Connection Failed", type: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PLATFORMS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedPlatform(p.id as Platform)}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedPlatform === p.id ? 'border-blue-500 bg-blue-500/5' : 'border-pr-border hover:border-pr-text-muted'
                            } ${integrations[p.id] ? 'border-green-500/50' : ''}`}
                    >
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-bold text-sm text-pr-text-1">{p.name}</span>
                        {integrations[p.id] && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 absolute top-2 right-2" />
                        )}
                    </button>
                ))}
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white ${PLATFORMS.find(p => p.id === selectedPlatform)?.color
                        }`}>
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-pr-text-1">Link {PLATFORMS.find(p => p.id === selectedPlatform)?.name}</h3>
                        <p className="text-sm text-pr-text-2">Connect your external store to Promorang</p>
                    </div>
                </div>

                {integrations[selectedPlatform] ? (
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div>
                            <p className="font-medium text-green-700 dark:text-green-400">Connected</p>
                            <p className="text-sm text-pr-text-2">{integrations[selectedPlatform].external_store_url}</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCcw className="h-4 w-4" /> Sync Now
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Store URL</label>
                            <Input
                                placeholder={selectedPlatform === 'shopify' ? 'store.myshopify.com' : 'https://your-site.com'}
                                value={shopUrl}
                                onChange={(e) => setShopUrl(e.target.value)}
                            />
                        </div>

                        {selectedPlatform === 'woocommerce' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">API Key (Consumer Key)</label>
                                    <Input
                                        type="password"
                                        placeholder="ck_..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">API Secret (Consumer Secret)</label>
                                    <Input
                                        type="password"
                                        placeholder="cs_..."
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleConnect}
                            disabled={loading || !shopUrl}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                        >
                            {loading ? 'Connecting...' : `Connect ${PLATFORMS.find(p => p.id === selectedPlatform)?.name}`}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
