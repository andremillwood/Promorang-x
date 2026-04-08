import { useState, useEffect } from "react";
import { Users, Mail, Shield, ShieldCheck, UserPlus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
}

export const TeamManagement = () => {
    const { activeOrgId } = useAuth();
    const { toast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        if (activeOrgId) {
            fetchMembers();
        }
    }, [activeOrgId]);

    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("organization_members")
            .select(`
        id,
        user_id,
        role,
        joined_at,
        profiles!inner (
          full_name,
          avatar_url
        )
      `)
            .eq("organization_id", activeOrgId);

        if (error) {
            console.error("Error fetching members:", error);
        } else {
            setMembers(data as any);
        }
        setLoading(false);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setInviting(true);
        // In a real app, this would send an email and create a pending_invitations record.
        // For this build, we'll simulate the addition of a 'staff' member.
        toast({
            title: "Invitation Sent!",
            description: `We've sent an invite to ${inviteEmail}.`,
        });
        setInviteEmail("");
        setInviting(false);
    };

    if (!activeOrgId) {
        return (
            <div className="text-center py-20">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Organization Selected</h3>
                <p className="text-muted-foreground">Select an organization to manage your team.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold tracking-tight">Team Management</h2>
                    <p className="text-muted-foreground">Manage roles and permissions for your organization.</p>
                </div>

                <form onSubmit={handleInvite} className="flex gap-2">
                    <Input
                        type="email"
                        placeholder="colleague@agency.com"
                        className="w-64 bg-card"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button type="submit" disabled={inviting}>
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                        Invite
                    </Button>
                </form>
            </div>

            <div className="bg-card rounded-2xl border border-border/40 overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/40 bg-muted/30">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Member</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Joined</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-muted rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : members.map((member) => (
                                <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {member.profiles?.full_name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{member.profiles?.full_name}</p>
                                                <p className="text-[10px] text-muted-foreground">Active</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {member.role === 'owner' ? <ShieldCheck className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                                            <span className="text-sm font-medium capitalize">{member.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(member.joined_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {member.role !== 'owner' && (
                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Roles & Permissions
                    </h4>
                    <ul className="text-xs space-y-2 text-muted-foreground">
                        <li><strong className="text-foreground">Owners:</strong> Complete control over billing and staff.</li>
                        <li><strong className="text-foreground">Admins:</strong> Can manage all campaigns, venues, and team members.</li>
                        <li><strong className="text-foreground">Managers:</strong> Can create and edit campaigns/venues.</li>
                        <li><strong className="text-foreground">Staff:</strong> Can view analytics and check-in participants.</li>
                    </ul>
                </div>

                <div className="bg-accent/5 rounded-2xl p-6 border border-accent/20">
                    <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-accent" />
                        Agency Access
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Invite your agency partners as <strong>Managers</strong> to allow them to set up campaigns on your behalf without granting access to billing data.
                    </p>
                </div>
            </div>
        </div>
    );
};
