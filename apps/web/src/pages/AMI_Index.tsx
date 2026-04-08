import { useEffect, useState } from 'react';
import { ActivationMechanic } from '../types/ami';
import { amiService } from '../services/ami';
import { MechanicCard } from '../components/ami/MechanicCard';
import { Button } from '../components/ui/button';
import { Filter, Search, ArrowUpRight, Activity } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import SEO from '../components/SEO';

export default function AMI_Index() {
    const [mechanics, setMechanics] = useState<ActivationMechanic[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMechanics = async () => {
            setLoading(true);
            try {
                const data = await amiService.getMechanics({
                    category: filterCategory === 'All' ? undefined : filterCategory,
                    sort: undefined
                });
                setMechanics(data);
            } catch (error) {
                console.error('Failed to load AMI data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMechanics();
    }, [filterCategory]);

    const filteredMechanics = mechanics.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <SEO
                title="Activation Mechanics Index"
                description="The Catalog of Proven Activation Strategies. Use the Index to launch reliable, verified campaigns."
            />

            <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/40 pb-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                            <Activity className="w-3.5 h-3.5" />
                            The Map of Reality
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
                            Activation <span className="text-primary italic">Index</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Explore the catalog of immutable, proven activation mechanics.
                            Select a strategy to launch a Moment with guaranteed verification logic and predicted outcomes.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="hidden md:block text-right">
                            <p className="text-3xl font-bold font-serif">{mechanics.length}+</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Active Strategies</p>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-16 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-border/0 md:border-border/0">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search strategies (e.g. 'Coffee', 'Traffic')..."
                            className="pl-9 bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {['All', 'IRL', 'Digital', 'Hybrid'].map((cat) => (
                            <Button
                                key={cat}
                                variant={filterCategory === cat || (cat === 'All' && !filterCategory) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterCategory(cat === 'All' ? undefined : cat)}
                                className="rounded-full px-6 font-semibold"
                            >
                                {cat}
                            </Button>
                        ))}
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Grid Section */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : filteredMechanics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                        {filteredMechanics.map((mechanic) => (
                            <MechanicCard key={mechanic.id} mechanic={mechanic} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground bg-muted/30 rounded-3xl border border-dashed border-border/50">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-foreground">No mechanics found</p>
                        <p>Try adjusting your filters or search terms.</p>
                        <Button
                            variant="link"
                            onClick={() => { setSearchQuery(''); setFilterCategory(undefined); }}
                            className="mt-2 text-primary"
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}

            </div>
        </>
    );
}
