import { useState, useEffect } from "react";
import { Search, ShieldCheck, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nContext";
import { supabase } from "@/integrations/supabase/client";

interface ParticipantProfile {
    id: string;
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    created_at: string;
}

const Participants = () => {
    const { t } = useI18n();
    const [participants, setParticipants] = useState<ParticipantProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchParticipants = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('profiles')
                    .select('id, user_id, full_name, avatar_url, location, created_at')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (searchQuery.trim()) {
                    query = query.ilike('full_name', `%${searchQuery.trim()}%`);
                }

                const { data, error } = await query;
                if (error) throw error;
                setParticipants(data || []);
            } catch (err) {
                console.error("Failed to load participants:", err);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchParticipants, 250);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                    {t("participantsPage.title")} <span className="text-primary italic">{t("participantsPage.community")}</span>
                </h1>
                <p className="text-muted-foreground font-serif italic">
                    {t("participantsPage.subtitle")}
                </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder={t("participantsPage.searchPlaceholder")} 
                        className="pl-10" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md shadow-soft-xl">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-sm">Loading community directory...</span>
                    </div>
                ) : participants.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="font-medium text-foreground">No members found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {searchQuery ? "Try searching for a different name." : "Members will appear here as they join the platform."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead>{t("participantsPage.thParticipant")}</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>{t("participantsPage.thStatus")}</TableHead>
                                        <TableHead>{t("participantsPage.thJoinedDate")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participants.map((participant) => (
                                        <TableRow key={participant.id} className="hover:bg-muted/20">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {participant.avatar_url ? (
                                                        <img 
                                                            src={participant.avatar_url} 
                                                            alt={participant.full_name || "User"} 
                                                            className="w-8 h-8 rounded-full object-cover border border-border"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {(participant.full_name || "?").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-foreground">
                                                        {participant.full_name || "Community Explorer"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {participant.location || "Global Member"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                                                    Active
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {new Date(participant.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3 p-4 md:hidden">
                            {participants.map((participant) => (
                                <div key={participant.id} className="rounded-xl border border-border bg-background/50 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {participant.avatar_url ? (
                                                <img 
                                                    src={participant.avatar_url} 
                                                    alt={participant.full_name || "User"} 
                                                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                    {(participant.full_name || "?").charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-foreground">
                                                    {participant.full_name || "Community Explorer"}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {participant.location || "Global Member"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="default" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="mt-3 text-xs text-muted-foreground">
                                        <span>Joined: {new Date(participant.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Participants;
