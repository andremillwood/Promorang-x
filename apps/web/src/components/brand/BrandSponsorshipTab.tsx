import { useState } from "react";
import { Search, Filter, MapPin, Calendar, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscoverMoments, useMomentCategories, type DiscoverableMoment } from "@/hooks/useDiscoverMoments";
import { MomentDiscoveryCard } from "./MomentDiscoveryCard";
import { SponsorshipRequestDialog } from "./SponsorshipRequestDialog";
import { SponsorshipRequestsTable } from "./SponsorshipRequestsTable";

export function BrandSponsorshipTab() {
  const [locationSearch, setLocationSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedMoment, setSelectedMoment] = useState<DiscoverableMoment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: categories } = useMomentCategories();
  const { data: moments, isLoading } = useDiscoverMoments({
    category: categoryFilter,
    location: locationSearch || undefined,
  });

  const handleSponsorClick = (moment: DiscoverableMoment) => {
    setSelectedMoment(moment);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="discover" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Discover Moments
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <Building2 className="w-4 h-4" />
            My Requests
          </TabsTrigger>
        </TabsList>

        {/* Discover Moments Tab */}
        <TabsContent value="discover" className="space-y-6 mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Moments Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : moments && moments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moments.map((moment) => (
                <MomentDiscoveryCard
                  key={moment.id}
                  moment={moment}
                  onSponsor={handleSponsorClick}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-12 border border-border text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No moments found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new moments to sponsor.
              </p>
            </div>
          )}
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="requests" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Your Sponsorship Requests</h3>
              <p className="text-sm text-muted-foreground">
                Track the status of your sponsorship offers
              </p>
            </div>
          </div>
          <SponsorshipRequestsTable />
        </TabsContent>
      </Tabs>

      {/* Sponsorship Request Dialog */}
      <SponsorshipRequestDialog
        moment={selectedMoment}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
