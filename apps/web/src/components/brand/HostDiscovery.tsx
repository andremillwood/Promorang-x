import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Users, DollarSign, Calendar, TrendingUp, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CATEGORIES = [
    { value: "", label: "All Categories" },
    { value: "social", label: "Social Gathering" },
    { value: "fitness", label: "Fitness & Wellness" },
    { value: "food", label: "Food & Drink" },
    { value: "music", label: "Music & Entertainment" },
    { value: "networking", label: "Networking" },
    { value: "outdoor", label: "Outdoor Adventure" },
    { value: "arts", label: "Arts & Culture" },
];

interface Host {
    hostId: string;
    hostName: string;
    hostEmail: string;
    moments: Moment[];
    totalAudience: number;
    avgCostPerMoment: number;
}

interface Moment {
    id: string;
    title: string;
    category: string;
    location: string;
    startsAt: string;
    audienceSize: number;
    estimatedCost: number;
}

const HostDiscovery = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const campaignId = searchParams.get('campaignId');

    const [hosts, setHosts] = useState<Host[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSponsoring, setIsSponsoring] = useState<string | null>(null);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [minAudience, setMinAudience] = useState(10);
    const [maxCost, setMaxCost] = useState(500);

    useEffect(() => {
        fetchHosts();
    }, [selectedCategory, locationFilter, minAudience, maxCost]);

    const fetchHosts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('categories', selectedCategory);
            if (locationFilter) params.append('locations', locationFilter);
            params.append('minAudienceSize', minAudience.toString());
            params.append('maxCostPerMoment', maxCost.toString());

            const response = await fetch(`${API_URL}/api/brand/hosts/discover?${params}`, {
                headers: {
                    'Authorization': `Bearer ${user?.id}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch hosts');

            const { hosts: fetchedHosts } = await response.json();
            setHosts(fetchedHosts);
        } catch (error: any) {
            toast({
                title: "Error fetching hosts",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSponsor = async (momentId: string, amount: number) => {
        if (!campaignId) {
            toast({
                title: "No campaign selected",
                description: "Please create a campaign first",
                variant: "destructive",
            });
            return;
        }

        setIsSponsoring(momentId);
        try {
            const response = await fetch(`${API_URL}/api/brand/hosts/sponsor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`,
                },
                body: JSON.stringify({
                    campaignId,
                    momentId,
                    amount,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to sponsor moment');
            }

            toast({
                title: "Moment Sponsored! 🎉",
                description: "Your sponsorship is now active.",
            });

            // Refresh hosts to update UI
            fetchHosts();
        } catch (error: any) {
            toast({
                title: "Error sponsoring moment",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSponsoring(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                    Discover Hosts
                </h1>
                <p className="text-muted-foreground">
                    Find and sponsor moments that align with your campaign goals
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Filter Hosts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g., New York"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="minAudience">Min Audience</Label>
                            <Input
                                id="minAudience"
                                type="number"
                                min="0"
                                value={minAudience}
                                onChange={(e) => setMinAudience(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="maxCost">Max Cost ($)</Label>
                            <Input
                                id="maxCost"
                                type="number"
                                min="0"
                                value={maxCost}
                                onChange={(e) => setMaxCost(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <Button onClick={fetchHosts} className="mt-4">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-xl" />
                    ))
                ) : hosts.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No hosts found matching your criteria. Try adjusting your filters.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    hosts.map((host) => (
                        <Card key={host.hostId} className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {host.hostName}
                                            <Badge variant="secondary">{host.moments.length} Moments</Badge>
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {host.hostEmail}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            {host.totalAudience} Total Reach
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <DollarSign className="w-4 h-4" />
                                            ${Math.round(host.avgCostPerMoment)} Avg Cost
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {host.moments.map((moment) => (
                                        <div
                                            key={moment.id}
                                            className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-foreground mb-2">
                                                    {moment.title}
                                                </h4>
                                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Badge variant="outline">{moment.category}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {moment.location}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(moment.startsAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {moment.audienceSize} expected
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 ml-4">
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-primary">
                                                        ${moment.estimatedCost}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Estimated Cost
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSponsor(moment.id, moment.estimatedCost)}
                                                    disabled={isSponsoring === moment.id || !campaignId}
                                                >
                                                    {isSponsoring === moment.id ? (
                                                        "Sponsoring..."
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Sponsor
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {!campaignId && (
                <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="py-4">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            ⚠️ No campaign selected. Create a campaign first to sponsor moments.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default HostDiscovery;
