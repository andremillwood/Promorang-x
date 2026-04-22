import { motion } from "framer-motion";
import { Flame, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const leaderData = [
    { name: "Lena Rivers", tier: "Eminence", stories: 42, points: "12,400", color: "text-primary", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { name: "Marcus Thorne", tier: "Luminary", stories: 38, points: "9,850", color: "text-amber-500", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    { name: "Sarah Chen", tier: "Luminary", stories: 35, points: "8,900", color: "text-amber-500", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" },
    { name: "Julian Marsh", tier: "Herald", stories: 29, points: "7,200", color: "text-blue-400", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    { name: "Elena Vance", tier: "Herald", stories: 27, points: "6,500", color: "text-blue-400", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const StandingLeaderboard = () => {
    const { data } = useQuery({
        queryKey: ["public-impact-leaderboard"],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/api/impact/public-leaderboard?limit=5`);
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(payload?.error || "Failed to load leaderboard");
            }
            return payload?.leaderboard || [];
        },
        retry: 0,
    });

    const liveLeaders = Array.isArray(data) && data.length > 0
        ? data.map((row: any, index: number) => ({
            name: row.display_name || row.full_name || row.username || `Community Member ${index + 1}`,
            tier: String(row.catalyst_rank || "new_signal").replaceAll("_", " "),
            stories: row.downstream_action_count || 0,
            points: Number(row.impact_score || 0).toLocaleString(),
            color: index < 3 ? "text-primary" : "text-blue-400",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(row.user_id || `leader-${index}`)}`,
            isLive: true,
        }))
        : leaderData;

    const showingExamples = liveLeaders === leaderData;

    return (
        <section className="py-24 bg-background relative border-t border-border/40">
            <div className="container px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 italic">
                            Community Leaderboard
                        </h2>
                        <p className="text-muted-foreground">
                            {showingExamples
                                ? "Preview how status, mayor energy, and real participation can shape your local community."
                                : "Meet the most active community members. Your level is built through showing up and making a real impact."}
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-card rounded-[2rem] border border-border/40 overflow-hidden shadow-soft-xl">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 gap-4 px-8 py-4 bg-muted/30 border-b border-border/40 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <span className="col-span-1">Level</span>
                            <span className="col-span-1">Member</span>
                            <span className="col-span-1 text-center">Stories Shared</span>
                            <span className="col-span-1 text-right">Gratitude</span>
                        </div>

                        {/* List Items */}
                        <div className="divide-y divide-border/20">
                            {liveLeaders.map((user, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className="grid grid-cols-4 gap-4 px-8 py-6 items-center hover:bg-muted/10 transition-colors group"
                                >
                                    {/* Standing/Rank */}
                                    <div className="col-span-1 flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-sm flex-shrink-0 ${
                                            index === 0 ? "bg-primary/20 text-primary border border-primary/30" : 
                                            index < 3 ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : 
                                            "bg-muted text-muted-foreground"
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="relative flex-shrink-0">
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                            {index === 0 && <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5"><Crown className="w-2.5 h-2.5 text-black" /></div>}
                                        </div>
                                    </div>

                                    {/* User/Tier */}
                                    <div className="col-span-1">
                                        <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{user.name}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${index < 3 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${user.color}`}>{user.tier}</p>
                                        </div>
                                    </div>

                                    {/* Stories */}
                                    <div className="col-span-1 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/5 border border-orange-500/10">
                                            <Flame className="w-3 h-3 text-orange-500" />
                                            <span className="text-xs font-bold text-foreground">{user.stories}</span>
                                        </div>
                                    </div>

                                    {/* Gratitude/Points */}
                                    <div className="col-span-1 text-right">
                                        <p className="font-serif text-lg font-bold text-foreground">{user.points}</p>
                                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">points</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <Badge variant="outline" className="px-6 py-2 border-primary/20 hover:bg-primary/5 transition-all cursor-default">
                            <Sparkles className="w-3 h-3 text-primary mr-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {showingExamples ? "No live leaders yet. Become a founding mayor and set the first standard." : "Only the most active members reach the top"}
                            </span>
                        </Badge>
                    </div>
                </div>
            </div>
        </section>
    );
};
