import { useState } from "react";
import { Link } from "react-router-dom";
import { MasonryGrid } from "@/components/MasonryGrid";
import { MomentCard } from "@/components/MomentCard";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Calendar } from "lucide-react";

// Mock data for demonstration
const mockFollowingMoments = [
    {
        id: "fm1",
        title: "Wine & Paint Night",
        description: "Create your masterpiece while enjoying local wines",
        category: "arts",
        starts_at: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
        location: "Art Studio Downtown",
        image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400",
        host_id: "following1",
        host_name: "Elena Rodriguez",
        max_participants: 12,
        participant_count: 8,
        reward: "Take home your painting",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "fm2",
        title: "Morning Run Club",
        description: "Start your day with an energizing group run",
        category: "fitness",
        starts_at: new Date(Date.now() + 1 * 24 * 3600000).toISOString(),
        location: "Riverside Park",
        image_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400",
        host_id: "following2",
        host_name: "Marcus Johnson",
        max_participants: 30,
        participant_count: 22,
        reward: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "fm3",
        title: "Tech Meetup: AI & Beyond",
        description: "Discuss the latest in AI and machine learning",
        category: "networking",
        starts_at: new Date(Date.now() + 4 * 24 * 3600000).toISOString(),
        location: "Innovation Hub",
        image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400",
        host_id: "following3",
        host_name: "Emily Watson",
        max_participants: 50,
        participant_count: 35,
        reward: "Free drinks & snacks",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

const mockFollowing = [
    { id: "following1", name: "Elena Rodriguez", avatar: null, momentsCount: 8 },
    { id: "following2", name: "Marcus Johnson", avatar: null, momentsCount: 12 },
    { id: "following3", name: "Emily Watson", avatar: null, momentsCount: 5 },
];

const Following = () => {
    const [filter, setFilter] = useState<"all" | "upcoming" | "new">("all");

    const filteredMoments = mockFollowingMoments.filter(moment => {
        if (filter === "upcoming") {
            const startsAt = new Date(moment.starts_at);
            const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 3600000);
            return startsAt <= threeDaysFromNow;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-background">

            <main className="pt-20 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-serif text-3xl font-bold">Following</h1>
                            <p className="text-muted-foreground">
                                Moments from people you follow
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link to="/discover">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Discover More
                            </Link>
                        </Button>
                    </div>

                    {/* Following Stats */}
                    <div className="bg-card border border-border rounded-2xl p-4 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                People you follow
                            </h3>
                            <Link to="/following/all" className="text-sm text-primary hover:underline">
                                See all
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {mockFollowing.map(person => (
                                <Link
                                    key={person.id}
                                    to={`/profile/${person.id}`}
                                    className="flex flex-col items-center gap-2 min-w-[80px]"
                                >
                                    <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-lg text-white font-medium">
                                        {person.name.charAt(0)}
                                    </div>
                                    <span className="text-xs text-center truncate w-full">
                                        {person.name.split(" ")[0]}
                                    </span>
                                </Link>
                            ))}
                            <Link
                                to="/discover"
                                className="flex flex-col items-center gap-2 min-w-[80px]"
                            >
                                <div className="h-14 w-14 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">Find more</span>
                            </Link>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { value: "all", label: "All", icon: null },
                            { value: "upcoming", label: "Coming Soon", icon: Calendar },
                            { value: "new", label: "New Posts", icon: Sparkles },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value as any)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${filter === option.value
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary hover:bg-secondary/80"
                                    }`}
                            >
                                {option.icon && <option.icon className="h-4 w-4" />}
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Moments Grid */}
                    {filteredMoments.length > 0 ? (
                        <MasonryGrid>
                            {filteredMoments.map(moment => (
                                <MomentCard
                                    key={moment.id}
                                    moment={moment as any}
                                />
                            ))}
                        </MasonryGrid>
                    ) : (
                        <div className="text-center py-16">
                            <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="font-medium text-lg mb-2">No moments yet</h3>
                            <p className="text-muted-foreground mb-4">
                                People you follow haven't posted any moments matching this filter
                            </p>
                            <Button asChild>
                                <Link to="/discover">Discover Moments</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
};

export default Following;
