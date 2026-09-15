import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, KeyRound, Search, ShieldCheck, UserCog, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllUsers } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type AdminRole = "support" | "moderator" | "admin" | "master_admin";
type CapabilityGrant = { id: string; capability: string; reason: string; granted_at: string; expires_at: string };
type TeamMember = {
  id: string;
  email: string | null;
  name: string;
  username: string | null;
  role: AdminRole;
  role_granted_at: string;
  capability_grants: CapabilityGrant[];
  is_current_user: boolean;
};
type Capability = { capability: string; display_name: string; description: string; risk_level: string };
type TeamPayload = { members: TeamMember[]; capabilities: Capability[] };

const ROLES: Record<AdminRole, { label: string; description: string }> = {
  support: { label: "Support", description: "Help people and view only the account context required for support." },
  moderator: { label: "Reviewer", description: "Review identity, evidence, applications, and content." },
  admin: { label: "Operations Manager", description: "Run Moments, commerce, catalog, reporting, and communications." },
  master_admin: { label: "Platform Owner", description: "Manage administrator access, money, policy, and system controls." },
};

export function AdminTeamAccessTab() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const people = useAllUsers(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState<AdminRole>("support");
  const [reason, setReason] = useState("");
  const [capability, setCapability] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const headers = {
    Authorization: `Bearer ${session?.access_token || ""}`,
    "Content-Type": "application/json",
  };
  const team = useQuery<TeamPayload>({
    queryKey: ["admin-team"],
    enabled: Boolean(session?.access_token),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/admin-team`, { headers });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to load the admin team");
      return payload;
    },
  });

  const saveRole = useMutation({
    mutationFn: async ({ userId, nextRole }: { userId: string; nextRole: AdminRole | "none" }) => {
      const response = await fetch(`${API_URL}/api/admin/admin-team/${userId}/role`, {
        method: "POST", headers, body: JSON.stringify({ role: nextRole, reason }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to change access");
    },
    onSuccess: async () => {
      toast({ title: "Admin access updated", description: "The change was recorded in admin activity." });
      setReason("");
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["admin-team"] }), queryClient.invalidateQueries({ queryKey: ["admin-all-users"] })]);
    },
    onError: (error: Error) => toast({ title: "Access was not changed", description: error.message, variant: "destructive" }),
  });

  const grantCapability = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/api/admin/admin-team/${selectedUserId}/capability-grants`, {
        method: "POST", headers, body: JSON.stringify({ capability, reason, expiresAt }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to grant temporary access");
    },
    onSuccess: async () => {
      toast({ title: "Temporary access granted", description: "It will expire automatically at the selected time." });
      setCapability(""); setExpiresAt(""); setReason("");
      await queryClient.invalidateQueries({ queryKey: ["admin-team"] });
    },
    onError: (error: Error) => toast({ title: "Temporary access was not granted", description: error.message, variant: "destructive" }),
  });

  const revokeCapability = useMutation({
    mutationFn: async (grantId: string) => {
      const response = await fetch(`${API_URL}/api/admin/admin-team/capability-grants/${grantId}`, {
        method: "DELETE", headers, body: JSON.stringify({ reason }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to revoke temporary access");
    },
    onSuccess: async () => {
      toast({ title: "Temporary access revoked" }); setReason("");
      await queryClient.invalidateQueries({ queryKey: ["admin-team"] });
    },
    onError: (error: Error) => toast({ title: "Access was not revoked", description: error.message, variant: "destructive" }),
  });

  const selectedMember = team.data?.members.find((member) => member.id === selectedUserId);
  const candidateResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length < 2) return [];
    return (people.data || []).filter((person) => {
      const text = [person.email, person.profile?.full_name, person.profile?.display_name, person.profile?.username].filter(Boolean).join(" ").toLowerCase();
      return text.includes(query);
    }).slice(0, 6);
  }, [people.data, search]);

  function selectPerson(personId: string, existingRole?: AdminRole) {
    setSelectedUserId(personId);
    setRole(existingRole || "support");
    setSearch(""); setReason(""); setCapability(""); setExpiresAt("");
  }

  if (team.isLoading) return <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-44 rounded-2xl" />)}</div>;
  if (team.isError) return <Card><CardContent className="p-6 text-sm text-destructive">{team.error.message}</CardContent></Card>;

  return (
    <div className="space-y-6 text-foreground">
      <div>
        <p className="text-sm font-semibold text-primary">Owner-only administration</p>
        <h2 className="mt-1 text-2xl font-bold">Admin team and access</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Give each person the smallest useful role. Use temporary access only for a specific need, with a clear reason and expiry.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.entries(ROLES) as [AdminRole, typeof ROLES[AdminRole]][]).map(([key, info]) => (
          <Card key={key} className="border-border/70"><CardContent className="p-4"><p className="font-semibold">{info.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{info.description}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-primary" />Current admin team</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(team.data?.members || []).map((member) => (
              <button key={member.id} onClick={() => selectPerson(member.id, member.role)} className={`w-full rounded-xl border p-4 text-left transition ${selectedUserId === member.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div><div className="flex items-center gap-2"><p className="font-semibold">{member.name}</p>{member.is_current_user && <Badge variant="outline">You</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{member.email || member.username || "No contact shown"}</p></div>
                  <div className="flex items-center gap-2"><Badge>{ROLES[member.role]?.label || member.role}</Badge>{member.capability_grants.length > 0 && <Badge variant="outline"><KeyRound className="mr-1 h-3 w-3" />{member.capability_grants.length} temporary</Badge>}</div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UserCog className="h-5 w-5 text-primary" />{selectedUserId ? "Change access" : "Choose a person"}</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {!selectedUserId && <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" className="pl-9" />{candidateResults.length > 0 && <div className="absolute z-10 mt-2 w-full rounded-xl border bg-popover p-1 shadow-xl">{candidateResults.map((person) => <button key={person.id} onClick={() => selectPerson(person.id)} className="w-full rounded-lg p-2 text-left text-sm hover:bg-accent"><span className="block font-medium">{person.profile?.full_name || person.profile?.display_name || person.email}</span><span className="block text-xs text-muted-foreground">{person.email}</span></button>)}</div>}</div>}

            {selectedUserId && <>
              <div><p className="font-semibold">{selectedMember?.name || people.data?.find((person) => person.id === selectedUserId)?.profile?.full_name || "Selected person"}</p><button onClick={() => setSelectedUserId("")} className="mt-1 text-xs text-primary hover:underline">Choose someone else</button></div>
              <div className="space-y-2"><Label>Role</Label><Select value={role} onValueChange={(value) => setRole(value as AdminRole)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(Object.entries(ROLES) as [AdminRole, typeof ROLES[AdminRole]][]).map(([key, info]) => <SelectItem key={key} value={key}>{info.label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{ROLES[role].description}</p></div>
              <div className="space-y-2"><Label htmlFor="access-reason">Reason for this change</Label><Input id="access-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="For example: joining the support rotation" /></div>
              <div className="grid gap-2 sm:grid-cols-2"><Button disabled={reason.trim().length < 3 || saveRole.isPending} onClick={() => saveRole.mutate({ userId: selectedUserId, nextRole: role })}>Save role</Button>{selectedMember && <Button variant="destructive" disabled={reason.trim().length < 3 || saveRole.isPending || (selectedMember.is_current_user && selectedMember.role === "master_admin")} onClick={() => saveRole.mutate({ userId: selectedUserId, nextRole: "none" })}><UserMinus className="mr-2 h-4 w-4" />Remove admin access</Button>}</div>

              {selectedMember && <div className="border-t pt-5"><p className="font-semibold">Temporary additional access</p><p className="mt-1 text-xs text-muted-foreground">Use this only when the person's normal role is insufficient for a time-bound task.</p><div className="mt-4 space-y-3"><Select value={capability} onValueChange={setCapability}><SelectTrigger><SelectValue placeholder="Choose a capability" /></SelectTrigger><SelectContent>{(team.data?.capabilities || []).filter((item) => item.risk_level !== "standard").map((item) => <SelectItem key={item.capability} value={item.capability}>{item.display_name} · {item.risk_level}</SelectItem>)}</SelectContent></Select><div className="space-y-2"><Label htmlFor="access-expiry">Access expires</Label><Input id="access-expiry" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></div><Button variant="outline" className="w-full" disabled={!capability || !expiresAt || reason.trim().length < 3 || grantCapability.isPending} onClick={() => grantCapability.mutate()}><Clock3 className="mr-2 h-4 w-4" />Grant temporary access</Button></div>
                {selectedMember.capability_grants.length > 0 && <div className="mt-4 space-y-2">{selectedMember.capability_grants.map((grant) => <div key={grant.id} className="rounded-lg border p-3"><p className="text-sm font-medium">{team.data?.capabilities.find((item) => item.capability === grant.capability)?.display_name || grant.capability}</p><p className="mt-1 text-xs text-muted-foreground">Expires {new Date(grant.expires_at).toLocaleString()}</p><Button size="sm" variant="ghost" className="mt-2 text-destructive" disabled={reason.trim().length < 3 || revokeCapability.isPending} onClick={() => revokeCapability.mutate(grant.id)}>Revoke using reason above</Button></div>)}</div>}
              </div>}
            </>}
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Access changes are recorded in Admin activity. Removing a role does not invalidate an already-issued access token immediately; sensitive API actions re-check server-owned role records on every request.</p>
    </div>
  );
}

export default AdminTeamAccessTab;
