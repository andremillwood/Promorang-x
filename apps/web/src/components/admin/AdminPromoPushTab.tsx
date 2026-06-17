import { useMemo, useState } from "react";
import { Copy, Loader2, Megaphone, Palette, QrCode, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useAssignPromoPushPromoter,
  usePromoPushAdmin,
  useUpdatePromoPushApplication,
  useUpdatePromoPushCreativeTask,
} from "@/hooks/usePromoPush";

export function AdminPromoPushTab() {
  const adminQuery = usePromoPushAdmin();
  const assignPromoter = useAssignPromoPushPromoter();
  const updateTask = useUpdatePromoPushCreativeTask();
  const updateApplication = useUpdatePromoPushApplication();
  const [assignment, setAssignment] = useState({ campaign_id: "", promoter_id: "", flyer_url: "" });

  const data = adminQuery.data;
  const approvedPromoters = useMemo(() => {
    return (data?.applications || []).filter((application) => application.applicant_role === "promoter" && application.status === "approved");
  }, [data?.applications]);

  const submitAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    await assignPromoter.mutateAsync({
      campaign_id: assignment.campaign_id,
      promoter_id: assignment.promoter_id,
      flyer_url: assignment.flyer_url || undefined,
    });
    setAssignment({ campaign_id: "", promoter_id: "", flyer_url: "" });
  };

  if (adminQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading PromoPush operations
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">PromoPush Operations</h2>
          <p className="text-sm text-muted-foreground">
            Assign street activation promoters, process workforce signups, and move creative support tasks through production.
          </p>
        </div>
        <Button variant="outline" onClick={() => adminQuery.refetch()}>
          <Megaphone className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Campaigns", value: data?.campaigns?.length || 0 },
          { label: "Applications", value: data?.applications?.length || 0 },
          { label: "Creative Tasks", value: data?.creative_tasks?.length || 0 },
          { label: "Assignments", value: data?.assignments?.length || 0 },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-black">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Assign Promoter
            </CardTitle>
            <CardDescription>Create a personal street activation channel and assignment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitAssignment} className="space-y-4">
              <div>
                <Label>Campaign</Label>
                <Select value={assignment.campaign_id} onValueChange={(value) => setAssignment((current) => ({ ...current, campaign_id: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select active campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {(data?.campaigns || []).map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="promoter_id">Promoter user ID</Label>
                <Input
                  id="promoter_id"
                  required
                  value={assignment.promoter_id}
                  onChange={(event) => setAssignment((current) => ({ ...current, promoter_id: event.target.value }))}
                  placeholder="UUID from approved application or user profile"
                  className="mt-2"
                />
                {approvedPromoters.length > 0 && (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {approvedPromoters.slice(0, 4).map((application) => (
                      <button
                        key={application.id}
                        type="button"
                        className="block text-left hover:text-primary"
                        onClick={() => setAssignment((current) => ({ ...current, promoter_id: application.user_id || "" }))}
                      >
                        {application.name}: {application.user_id || "link user ID first"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="flyer_url">Flyer URL</Label>
                <Input
                  id="flyer_url"
                  value={assignment.flyer_url}
                  onChange={(event) => setAssignment((current) => ({ ...current, flyer_url: event.target.value }))}
                  placeholder="Optional printable asset URL"
                  className="mt-2"
                />
              </div>
              <Button disabled={assignPromoter.isPending || !assignment.campaign_id || !assignment.promoter_id} className="w-full">
                {assignPromoter.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                Create Assignment
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Career Applications</CardTitle>
            <CardDescription>Promoter, creator, and marketing applicants from public career pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.applications || []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No applications yet.</div>
            ) : (
              (data?.applications || []).map((application) => (
                <div key={application.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{application.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-primary">{application.applicant_role}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{application.location} · {application.phone}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{application.area_coverage || "No coverage listed"}</p>
                    </div>
                    <Select
                      value={application.status}
                      onValueChange={(status) => updateApplication.mutate({ id: application.id, status })}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["new", "contacted", "approved", "rejected"].map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <Input
                      defaultValue={application.user_id || ""}
                      placeholder="Attach user UUID"
                      onBlur={(event) => {
                        if (event.target.value !== (application.user_id || "")) {
                          updateApplication.mutate({ id: application.id, user_id: event.target.value });
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(application.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      ID
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Creative Support Queue
          </CardTitle>
          <CardDescription>Flyer design, QR layout, and ad creative tasks generated from campaign creation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.creative_tasks || []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No creative support tasks yet.</div>
          ) : (
            (data?.creative_tasks || []).map((task) => (
              <div key={task.id} className="grid gap-3 rounded-lg border border-border p-4 lg:grid-cols-[1fr_160px_1fr_1fr]">
                <div>
                  <p className="font-semibold">{task.campaign?.title || "Campaign"}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-primary">{task.task_type.replace(/_/g, " ")}</p>
                </div>
                <Select value={task.status} onValueChange={(status) => updateTask.mutate({ id: task.id, status })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["pending", "in_progress", "completed", "cancelled"].map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  defaultValue={task.asset_url || ""}
                  placeholder="Asset URL"
                  onBlur={(event) => {
                    if (event.target.value !== (task.asset_url || "")) {
                      updateTask.mutate({ id: task.id, asset_url: event.target.value });
                    }
                  }}
                />
                <Textarea
                  defaultValue={task.notes || ""}
                  placeholder="Notes"
                  className="min-h-10"
                  onBlur={(event) => {
                    if (event.target.value !== (task.notes || "")) {
                      updateTask.mutate({ id: task.id, notes: event.target.value });
                    }
                  }}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Street Assignments</CardTitle>
          <CardDescription>Personal channels and flyer links assigned to promoters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.assignments || []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No promoter assignments yet.</div>
          ) : (
            (data?.assignments || []).map((assignment) => (
              <div key={assignment.id} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-semibold">{assignment.campaign?.title || "Campaign"}</p>
                  <p className="text-sm text-muted-foreground">Promoter: {assignment.promoter_id}</p>
                </div>
                <p className="break-all text-sm text-muted-foreground">{assignment.channel?.tracking_link || "No channel link"}</p>
                <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(assignment.channel?.tracking_link || "")}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
