import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
    BarChart3, 
    Eye, 
    TrendingUp, 
    Users, 
    Search, 
    Filter, 
    Zap, 
    Target,
    ShieldCheck,
    ArrowUpRight,
    PlayCircle,
    LayoutGrid,
    Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 700 },
];

export const IntelligenceBureau = () => {
    // Fetch all active moments to simulate Ad Library
    const { data: globalMoments, isLoading: libraryLoading } = useQuery({
        queryKey: ["global-moments-library"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("moments")
                .select("*, host_profile:profiles(full_name)")
                .eq("is_active", true)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Command Header */}
            <div className="bg-charcoal rounded-[2.5rem] p-10 text-cream relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified Intelligence
                        </div>
                        <h2 className="font-serif text-4xl font-bold tracking-tight">The <span className="italic text-primary">Intelligence</span> Bureau</h2>
                        <p className="text-white/60 text-lg mt-2 max-w-xl">
                            Real-time platform activity, competitive benchmarking, and behavioral ROI command.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white font-bold h-12 rounded-2xl">
                            <LayoutGrid className="w-4 h-4 mr-2" /> Export Intel
                        </Button>
                        <Button variant="hero" className="h-12 rounded-2xl shadow-glow">
                            <Target className="w-4 h-4 mr-2" /> Optimize Bidding
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ROI Insights Sidebar (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-card border-border/50 rounded-[2rem] overflow-hidden shadow-soft-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/40 p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Proof-of-Action ROI
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <p className="text-4xl font-black text-foreground">$12.40</p>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 mb-2">
                                        <ArrowUpRight className="w-3 h-3 mr-1" /> 14% yield
                                    </Badge>
                                </div>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Avg. Cost Per Verified Action (CPVA)</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                        <span>Photo Verifications</span>
                                        <span className="text-primary">82%</span>
                                    </div>
                                    <Progress value={82} className="h-2" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                        <span>Venue Check-ins</span>
                                        <span className="text-accent">64%</span>
                                    </div>
                                    <Progress value={64} className="h-2 bg-accent/10" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-charcoal border-white/5 rounded-[2rem] overflow-hidden shadow-soft-xl text-white">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-primary" />
                                Niche Velocity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockChartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Ad Library View (8/12) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-serif text-2xl font-bold flex items-center gap-3">
                            The Moment Library
                            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20">Live</Badge>
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    className="bg-card border border-border/60 rounded-xl h-10 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary w-48 transition-all"
                                    placeholder="Search moments..."
                                />
                            </div>
                            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/60">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {libraryLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-64 rounded-3xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {globalMoments?.slice(0, 6).map((moment) => (
                                <div key={moment.id} className="group relative bg-card h-80 rounded-[2rem] border border-border/50 overflow-hidden hover:shadow-soft-xl transition-all duration-500">
                                    <div className="absolute inset-0">
                                        <img 
                                            src={moment.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"} 
                                            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                                            alt={moment.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    </div>

                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 uppercase tracking-widest text-[9px] font-black">
                                            {moment.category}
                                        </Badge>
                                        <Badge className="bg-primary/80 backdrop-blur-md text-white border-none uppercase tracking-widest text-[9px] font-black">
                                            Active Intel
                                        </Badge>
                                    </div>

                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Current Momentum</p>
                                        <h4 className="font-serif text-xl font-bold text-white mb-4 line-clamp-1">{moment.title}</h4>
                                        
                                        <div className="grid grid-cols-2 gap-3 pb-2 border-t border-white/10 pt-4">
                                            <div>
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Host Impact</p>
                                                <p className="text-xs font-bold text-white">{(moment as any).host_profile?.full_name || "Unknown Mayor"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Velocity</p>
                                                <p className="text-xs font-bold text-primary flex items-center justify-end">
                                                    <Zap className="w-3 h-3 mr-1 fill-primary" /> High
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] bg-black/40">
                                        <Button variant="hero" className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs">
                                            View Performance Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-8 bg-muted/50 border border-border border-dashed rounded-[2rem] text-center">
                        <p className="text-muted-foreground text-sm font-medium mb-4">Want deeper intelligence on specific niches or competing campaigns?</p>
                        <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-10">
                            Unlock Competitor Benchmarking
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
