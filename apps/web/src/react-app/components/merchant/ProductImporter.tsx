import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ExternalProduct {
    id: string;
    title: string;
    images: string[];
    price: number;
    inventory: number;
}

export default function ProductImporter() {
    const { toast } = useToast();
    const [products, setProducts] = useState<ExternalProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activePlatform, setActivePlatform] = useState<string | null>(null);

    // Poll for connected platforms
    useEffect(() => {
        checkConnections();
    }, []);

    const checkConnections = async () => {
        const platforms = ['shopify', 'woocommerce', 'etsy'];
        for (const p of platforms) {
            try {
                const response = await fetch(`/api/marketplace/integrations/${p}/status`, { credentials: 'include' });
                const data = await response.json();
                if (data.status === 'success' && data.data.integration) {
                    setActivePlatform(p);
                    fetchProducts(p);
                    break; // Use the first connected one for simplicity in UI
                }
            } catch (e) { }
        }
    };

    const fetchProducts = async (platform: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/marketplace/integrations/${platform}/products`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.status === 'success') {
                setProducts(data.data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (selectedIds.length === 0 || !activePlatform) return;

        setImporting(true);
        try {
            const response = await fetch(`/api/marketplace/integrations/${activePlatform}/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productIds: selectedIds })
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast({
                    title: "Import Successful",
                    description: `${data.data.imported.length} products added from ${activePlatform}.`,
                    type: "success"
                });
                setSelectedIds([]);
            }
        } catch (error) {
            toast({ title: "Import Failed", type: "destructive" });
        } finally {
            setImporting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!activePlatform) {
        return (
            <Card className="p-8 text-center border-dashed">
                <p className="text-pr-text-2">Connect a platform above to start importing products.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pr-text-2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder={`Search ${activePlatform} products...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 bg-pr-surface-card border border-pr-border rounded-lg"
                    />
                </div>
                <Button
                    onClick={handleImport}
                    disabled={importing || selectedIds.length === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {importing ? 'Importing...' : `Import ${selectedIds.length} Products`}
                </Button>
            </div>

            {loading ? (
                <div className="py-12 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
            ) : products.length === 0 ? (
                <Card className="p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-pr-text-2/20 mb-4" />
                    <p className="text-pr-text-2">No products found in your {activePlatform} store.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((p) => (
                        <Card
                            key={p.id}
                            className={`overflow-hidden cursor-pointer border-2 ${selectedIds.includes(p.id) ? 'border-blue-500 bg-blue-50/5' : 'border-transparent'
                                }`}
                            onClick={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id])}
                        >
                            <div className="aspect-square relative">
                                <img src={p.images[0] || 'https://via.placeholder.com/200'} alt={p.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2">
                                    <input type="checkbox" checked={selectedIds.includes(p.id)} readOnly className="h-4 w-4 rounded" />
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="font-bold truncate">{p.title}</p>
                                <p className="text-sm text-pr-text-2">${p.price} • {p.inventory} in stock</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
