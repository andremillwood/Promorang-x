import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Loader2, 
    Calendar, 
    MapPin, 
    Users as UsersIcon, 
    Sparkles, 
    Search,
    UserPlus,
    CheckCircle2,
    Store
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
    { value: "social", label: "Social Gathering" },
    { value: "workshop", label: "Workshop" },
    { value: "fitness", label: "Fitness & Wellness" },
    { value: "food", label: "Food & Drink" },
    { value: "music", label: "Music & Entertainment" },
    { value: "networking", label: "Networking" },
    { value: "outdoor", label: "Outdoor Adventure" },
    { value: "arts", label: "Arts & Culture" },
];

export const AdminCreateMomentTab = () => {
    const { session } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Data for Selection
    const [hosts, setHosts] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    
    // Form State
    const [selectedHostId, setSelectedHostId] = useState<string>("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "social",
        location: "",
        venueId: "",
        startsAt: "",
        endsAt: "",
        maxParticipants: 50,
        visibility: "open" as "open" | "invite" | "private",
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch users with 'host' role
                const { data: hostData } = await supabase
                    .from('user_roles')
                    .select('user_id, profiles(full_name, email)')
                    .eq('role', 'host');
                
                // Fetch all venues
                const { data: venueData } = await supabase
                    .from('venues')
                    .select('id, name, address');

                setHosts(hostData || []);
                setVenues(venueData || []);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) fetchData();
    }, [session]);

    const handleVenueChange = (venueId: string) => {
        const venue = venues.find(v => v.id === venueId);
        if (venue) {
            setFormData(prev => ({
                ...prev,
                venueId: venue.id,
                location: venue.address
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHostId) {
            toast({ title: "Error", description: "Please select a host for this moment.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("moments").insert({
                host_id: selectedHostId,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                location: formData.location,
                venue_id: formData.venueId || null,
                starts_at: new Date(formData.startsAt).toISOString(),
                ends_at: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
                max_participants: formData.maxParticipants || null,
                is_active: true,
                status: 'joinable', // Admins bypass the review queue
                visibility: formData.visibility,
                proof_type: 'QR',
                evidence_requirements: []
            });

            if (error) throw error;

            toast({ title: "Moment Created! 🎉", description: "Administrative creation successful. Moment is live." });
            
            // Reset form
            setFormData({
                title: "",
                description: "",
                category: "social",
                location: "",
                venueId: "",
                startsAt: "",
                endsAt: "",
                maxParticipants: 50,
                visibility: "open",
            });
            setSelectedHostId("");
        } catch (error: any) {
            toast({ title: "Creation Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Acting On-Behalf-Of</h2>
                    <p className="text-muted-foreground text-sm">Create moments for hosts or platform events.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Moment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input 
                                    required 
                                    placeholder="e.g., Grand Opening Celebration" 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    required 
                                    placeholder="Explain the purpose of this moment..." 
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Participants</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.maxParticipants}
                                        onChange={e => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Logistics & Venue
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Link to Venue (Optional)</Label>
                                <Select value={formData.venueId} onValueChange={handleVenueChange}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select a registered venue" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venues.map(venue => (
                                            <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Manual Address</Label>
                                <Input 
                                    required 
                                    placeholder="Enter full address" 
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Starts At</Label>
                                    <Input 
                                        type="datetime-local" 
                                        required 
                                        value={formData.startsAt}
                                        onChange={e => setFormData({...formData, startsAt: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ends At</Label>
                                    <Input 
                                        type="datetime-local" 
                                        value={formData.endsAt}
                                        onChange={e => setFormData({...formData, endsAt: e.target.value})}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-primary" />
                                Target Host
                            </CardTitle>
                            <CardDescription>Select the vendor who will own this moment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Select value={selectedHostId} onValueChange={setSelectedHostId}>
                                    <SelectTrigger className="pl-9 h-12">
                                        <SelectValue placeholder="Search hosts..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hosts.map(h => (
                                            <SelectItem key={h.user_id} value={h.user_id}>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{h.profiles?.full_name || "Merchant"}</span>
                                                    <span className="text-[10px] text-muted-foreground">{h.profiles?.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedHostId && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none w-full justify-center py-1">
                                    Host Selected: {hosts.find(h => h.user_id === selectedHostId)?.profiles?.full_name}
                                </Badge>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button 
                                type="submit" 
                                className="w-full shadow-glow py-6 text-lg font-serif" 
                                disabled={isSubmitting || !selectedHostId}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Instantly"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="bg-secondary/50 rounded-xl p-6 border border-border space-y-4">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Admin Privileges
                        </h4>
                        <div className="space-y-2 text-xs text-muted-foreground">
                            <p>• Bypasses standard moderation</p>
                            <p>• Automatically marked as 'joinable'</p>
                            <p>• Immediately visible in global feed</p>
                            <p>• Can act for any Host or Brand</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
