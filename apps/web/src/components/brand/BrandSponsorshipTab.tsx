import { useState } from "react";
import { Filter, MapPin, Calendar, Sparkles, Building2 } from "lucide-react";
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
import { useExploreMoments, useMomentCategories, type ExploreMoment } from "@/hooks/useExploreMoments";
import { MomentDiscoveryCard } from "./MomentDiscoveryCard";
import { SponsorshipRequestDialog } from "./SponsorshipRequestDialog";
import { SponsorshipRequestsTable } from "./SponsorshipRequestsTable";

export function BrandSponsorshipTab() {
  const [locationSearch, setLocationSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedMoment, setSelectedMoment] = useState<ExploreMoment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: categories } = useMomentCategories();
  const { data: moments, isLoading } = useExploreMoments({
    category: categoryFilter,
    location: locationSearch || undefined,
  });

  const handleSponsorClick = (moment: ExploreMoment) => {
    setSelectedMoment(moment);
    setDialogOpen(true);
  };

  return (
    <section className="space-y-8">
      <div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Choose the culture to support</p><h2 className="mt-3 font-serif text-4xl font-semibold leading-[.98] tracking-[-.04em] sm:text-5xl">Find a Moment where the brand can belong.</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Start with the people, place, and meaning of the gathering. Sponsorship should strengthen what is already alive there.</p></div>
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-y border-border/60 bg-transparent p-0">
          <TabsTrigger value="discover" className="gap-2 rounded-none border-b-2 border-transparent px-0 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            <Sparkles className="w-4 h-4" />
            Explore Moments
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2 rounded-none border-b-2 border-transparent px-0 py-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
            <Building2 className="w-4 h-4" />
            My Requests
          </TabsTrigger>
        </TabsList>

        {/* Explore Moments Tab */}
        <TabsContent value="discover" className="space-y-6 mt-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-card/55 p-4 sm:flex-row">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 w-full rounded-xl sm:w-48">
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
            <div className="rounded-[2rem] border border-dashed border-border bg-card/50 p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2 font-serif text-2xl font-semibold text-foreground">No Moments found</h3>
              <p className="text-muted-foreground">
                Try another place or category, or return when new Moments enter the Scene.
              </p>
            </div>
          )}
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="requests" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-3xl font-semibold text-foreground">Your offers to support</h3>
              <p className="text-sm text-muted-foreground">
                See which conversations are waiting, accepted, or need a response.
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
    </section>
  );
}
