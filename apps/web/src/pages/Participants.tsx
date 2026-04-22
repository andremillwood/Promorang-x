import { Search, ShieldCheck, Users } from "lucide-react";
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

const mockParticipants = [
    { id: 1, name: "Sarah Chen", email: "sarah@example.com", status: "Active", rank: 4, joinedDate: "2024-01-15" },
    { id: 2, name: "Marcus Miller", email: "marcus@example.com", status: "Active", rank: 3, joinedDate: "2024-01-20" },
    { id: 3, name: "Elena Rodriguez", email: "elena@example.com", status: "Pending", rank: 2, joinedDate: "2024-02-01" },
    { id: 4, name: "David Kim", email: "david@example.com", status: "Active", rank: 5, joinedDate: "2024-01-10" },
];

const Participants = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                    Participants <span className="text-primary italic">Community</span>
                </h1>
                <p className="text-muted-foreground font-serif italic">
                    Manage and connect with the members of your moments.
                </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." className="pl-10" />
                </div>
                <Button variant="outline" className="w-full sm:w-auto">Filter</Button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md shadow-soft-xl">
                <div className="hidden md:block">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead>Participant</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Consistency Rank</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockParticipants.map((participant) => (
                            <TableRow key={participant.id} className="hover:bg-muted/20">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {(participant.name || "?").charAt(0)}
                                        </div>
                                        <span className="font-medium text-foreground">{participant.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{participant.email}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        <span className="font-medium">Level {participant.rank}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={participant.status === "Active" ? "default" : "secondary"}>
                                        {participant.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{participant.joinedDate}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Details</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
                <div className="space-y-3 p-4 md:hidden">
                    {mockParticipants.map((participant) => (
                        <div key={participant.id} className="rounded-xl border border-border bg-background/50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        {(participant.name || "?").charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-foreground">{participant.name}</p>
                                        <p className="truncate text-sm text-muted-foreground">{participant.email}</p>
                                    </div>
                                </div>
                                <Badge variant={participant.status === "Active" ? "default" : "secondary"}>
                                    {participant.status}
                                </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Consistency</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Level {participant.rank}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Joined</p>
                                    <p className="mt-1 text-foreground">{participant.joinedDate}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="mt-3 w-full">Details</Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Participants;
