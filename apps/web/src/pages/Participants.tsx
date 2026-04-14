import { Users, Search, Mail, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
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

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." className="pl-10" />
                </div>
                <Button variant="outline">Filter</Button>
            </div>

            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden shadow-soft-xl">
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
        </div>
    );
};

export default Participants;
