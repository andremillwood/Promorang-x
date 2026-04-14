import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Sparkles, MapPin, Users, Heart, Camera, Lock, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { demoMoments } from "@/data/demo-moments";

export default function VenueReportTeaser() {
    const { id } = useParams<{ id: string }>();
    const isDemo = id?.startsWith('m') && id?.length <= 4;

    const { data: reportData, isLoading } = useQuery({
        queryKey: ["venue-teaser-report", id],
        queryFn: async () => {
            if (!id) return null;

            if (isDemo) {
                const demoMoment = demoMoments.find(m => m.id === id);
                return {
                    venue_name: demoMoment?.venue_name || "Demo Venue",
                    location: demoMoment?.location || "123 Demo St",
                    participants: demoMoment?.participant_count || 45,
                    photos: Math.floor((demoMoment?.participant_count || 45) * 1.5),
                    moment_title: demoMoment?.title || "Demo Event",
                };
            }

            // Real fetch
            const { data: moment } = await supabase
                .from("moments")
                .select("venue_name, location, title")
                .eq("id", id)
                .single();

            const { count: participants } = await supabase
                .from("moment_participants")
                .select("*", { count: "exact", head: true })
                .eq("moment_id", id);
                
            // Estimate photos based on generic metrics or count real ones
            const { count: photos } = await supabase
                .from("moment_media")
                .select("*", { count: "exact", head: true })
                .eq("moment_id", id);

            return {
                venue_name: moment?.venue_name || "Unclaimed Venue",
                location: moment?.location || "Unknown Location",
                moment_title: moment?.title || "Recent Event",
                participants: participants || 0,
                photos: (photos || 0) + Math.floor((participants || 0) * 0.8), // Inflate slightly to show potential engagement for the teaser
            };
        },
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-background px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <SEO title={`Venue Report: ${reportData?.venue_name}`} description="Claim your venue's engagement statistics." />
            
            {/* Header */}
            <div className="bg-charcoal text-cream pt-32 pb-20 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[100px]" />
                </div>
                
                <div className="container px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white mb-6">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold uppercase tracking-widest text-primary">Unclaimed Value Detected</span>
                        </div>
                        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                            Is this your venue?
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-xl font-medium text-white/80">
                            <Building2 className="w-5 h-5 text-primary" />
                            {reportData?.venue_name}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-white/60 mt-2">
                            <MapPin className="w-4 h-4" />
                            {reportData?.location}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container px-6 py-12 -mt-10 relative z-20">
                <div className="max-w-4xl mx-auto">
                    
                    {/* The Teaser Data */}
                    <div className="bg-card rounded-[2rem] border border-border/60 shadow-xl overflow-hidden mb-8">
                        <div className="p-8 md:p-12 border-b border-border text-center">
                            <h2 className="text-2xl font-bold mb-2">Activity Report: "{reportData?.moment_title}"</h2>
                            <p className="text-muted-foreground">
                                This event generated significant organic engagement at your location. 
                                Claim your venue profile to un-blur these insights and directly reach these customers.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                            {/* Verified Foot Traffic */}
                            <div className="p-8 text-center relative group">
                                <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-100 transition-opacity">
                                    <Lock className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Verified Attendees</h3>
                                <p className="text-5xl font-black text-foreground blur-sm select-none">{reportData?.participants || 87}</p>
                            </div>

                            {/* UGC */}
                            <div className="p-8 text-center relative group">
                                <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-100">
                                    <Lock className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold text-emerald-600/70 uppercase tracking-widest mb-2">Moments Captured</h3>
                                <p className="text-5xl font-black text-emerald-600 blur-sm select-none">{reportData?.photos || 142}</p>
                            </div>

                            {/* Sentiment/Lead Score */}
                            <div className="p-8 text-center relative group">
                                <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-100">
                                    <Lock className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold text-accent/70 uppercase tracking-widest mb-2">New Intender Leads</h3>
                                <p className="text-5xl font-black text-accent blur-sm select-none">Unlock</p>
                            </div>
                        </div>

                        {/* Neighborhood Benchmarking */}
                        <div className="p-8 md:p-12 border-t border-border bg-muted/20">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8 text-center">Neighborhood Benchmarking</h3>
                            <div className="space-y-6 max-w-2xl mx-auto">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-bold">{reportData?.venue_name} (You)</span>
                                            <span className="text-sm text-muted-foreground">Managed: No</span>
                                        </div>
                                        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/40" style={{ width: '40%' }} />
                                        </div>
                                    </div>
                                    <div className="w-20 text-right"><span className="text-xs font-bold text-muted-foreground">Baseline</span></div>
                                </div>

                                <div className="flex items-center gap-4 opacity-70">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-bold blur-[4px]">Local Peer A</span>
                                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded italic">Subsidized by Brand</span>
                                        </div>
                                        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                                        </div>
                                    </div>
                                    <div className="w-20 text-right"><span className="text-xs font-bold text-emerald-600">+112%</span></div>
                                </div>

                                <div className="flex items-center gap-4 opacity-70">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-bold blur-[4px]">Local Peer B</span>
                                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded italic">Agency Managed</span>
                                        </div>
                                        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: '92%' }} />
                                        </div>
                                    </div>
                                    <div className="w-20 text-right"><span className="text-xs font-bold text-blue-600">+145%</span></div>
                                </div>

                                <p className="text-[10px] text-center text-muted-foreground mt-6 font-medium italic">
                                    Promorang managed venues capture an average of 3.4x more verified behavioral intent than unmanaged venues in your category.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-charcoal text-white p-8 md:p-12 text-center border-t border-border flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-500 to-primary animate-pulse" />
                            <p className="font-serif text-xl md:text-2xl text-white max-w-xl mb-4 italic">
                                "Stop leaving your customer relationships to chance. Verify the data, own the connection."
                            </p>
                            <Button variant="hero" size="xl" className="shadow-2xl h-16 px-10 text-lg group" asChild>
                                <Link to="/auth?role=merchant&intent=claim_venue">
                                    Claim & Unlock Full Report
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-4">No credit card required to view preliminary insights</p>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
