import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useAddUserRole, useAllUsers, useRemoveUserRole, useUpdateUserSuspension, type UserWithProfile } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AVAILABLE_ROLES = ["participant", "host", "brand", "merchant", "admin"];
const STATE_FILTERS = ["all", "flagged", "suspended", "limited", "kyc_pending"] as const;

type StateFilter = (typeof STATE_FILTERS)[number];

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "admin":
      return "destructive" as const;
    case "host":
      return "default" as const;
    case "brand":
      return "secondary" as const;
    case "merchant":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function getUserState(user: UserWithProfile) {
  if (user.profile?.suspended) return "suspended";
  if (user.qualification?.has_no_violations === false || !user.qualification?.is_qualified_for_money) return "limited";
  if (user.kyc_status === "pending") return "kyc_pending";
  if (user.moderation_flags.length > 0) return "flagged";
  return "healthy";
}

function getStateBadge(user: UserWithProfile) {
  const state = getUserState(user);

  if (state === "suspended") {
    return <Badge variant="destructive">Suspended</Badge>;
  }

  if (state === "limited") {
    return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700">Limited</Badge>;
  }

  if (state === "kyc_pending") {
    return <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-700">KYC Pending</Badge>;
  }

  if (state === "flagged") {
    return <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-700">Flagged</Badge>;
  }

  return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">Healthy</Badge>;
}

export function AdminUsersTab() {
  const { data: users, isLoading } = useAllUsers();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  const updateSuspension = useUpdateUserSuspension();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [roleDialog, setRoleDialog] = useState<{ userId: string; action: "add" | "remove" } | null>(null);
  const [suspensionDialog, setSuspensionDialog] = useState<{ user: UserWithProfile; nextSuspended: boolean } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(1020);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Synchronize table scroll to sticky scrollbar
  const handleTableScroll = () => {
    if (!tableScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
    if (stickyScrollRef.current && Math.abs(stickyScrollRef.current.scrollLeft - scrollLeft) > 1) {
      stickyScrollRef.current.scrollLeft = scrollLeft;
    }
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Synchronize sticky scrollbar to table
  const handleStickyScroll = () => {
    if (!stickyScrollRef.current || !tableScrollRef.current) return;
    const { scrollLeft } = stickyScrollRef.current;
    if (Math.abs(tableScrollRef.current.scrollLeft - scrollLeft) > 1) {
      tableScrollRef.current.scrollLeft = scrollLeft;
    }
  };

  const scrollTable = (direction: "left" | "right") => {
    if (!tableScrollRef.current) return;
    const amount = 320;
    tableScrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const updateWidth = () => {
      if (tableScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tableScrollRef.current;
        setTableScrollWidth(scrollWidth);
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };
    updateWidth();
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener("resize", updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateWidth);
    };
  }, [filteredUsers]);

  const filteredUsers = useMemo(() => {
    return (users || []).filter((user) => {
      const query = searchQuery.trim().toLowerCase();
      const searchMatches = !query || [
        user.profile?.full_name,
        user.profile?.display_name,
        user.profile?.username,
        user.email,
        user.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      const roleMatches = !roleFilter || user.roles.includes(roleFilter);
      const state = getUserState(user);
      const stateMatches = stateFilter === "all" || state === stateFilter;

      return searchMatches && roleMatches && stateMatches;
    });
  }, [roleFilter, searchQuery, stateFilter, users]);

  const summary = useMemo(() => {
    const rows = users || [];
    return {
      total: rows.length,
      suspended: rows.filter((user) => user.profile?.suspended).length,
      limited: rows.filter((user) => getUserState(user) === "limited").length,
      flagged: rows.filter((user) => user.moderation_flags.length > 0).length,
      openSupport: rows.reduce((sum, user) => sum + user.activity.open_support_tickets, 0),
    };
  }, [users]);

  const openSuspensionDialog = (user: UserWithProfile, nextSuspended: boolean) => {
    setSuspensionDialog({ user, nextSuspended });
    setSuspensionReason(nextSuspended ? user.profile?.suspension_reason || "" : "");
  };

  const handleAddRole = (userId: string, role: string) => {
    addRole.mutate({ userId, role });
    setRoleDialog(null);
  };

  const handleRemoveRole = (userId: string, role: string) => {
    removeRole.mutate({ userId, role });
    setRoleDialog(null);
  };

  const handleSuspensionSubmit = () => {
    if (!suspensionDialog) return;
    updateSuspension.mutate({
      userId: suspensionDialog.user.id,
      suspended: suspensionDialog.nextSuspended,
      reason: suspensionReason.trim() || undefined,
    });
    setSuspensionDialog(null);
    setSuspensionReason("");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Users</p>
          <p className="mt-2 text-2xl font-semibold">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Suspended</p>
          <p className="mt-2 text-2xl font-semibold text-destructive">{summary.suspended}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Limited</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{summary.limited}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Flagged</p>
          <p className="mt-2 text-2xl font-semibold text-orange-600">{summary.flagged}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Open Support</p>
          <p className="mt-2 text-2xl font-semibold">{summary.openSupport}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users, email, id..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>

        <div className="-mx-1 overflow-x-auto px-1 touch-pan-x snap-x-mandatory scrollbar-none">
          <div className="flex min-w-max gap-2">
            <Button
              variant={roleFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(null)}
              className="snap-start"
            >
              All Roles
            </Button>
            {AVAILABLE_ROLES.map((role) => (
              <Button
                key={role}
                variant={roleFilter === role ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(role)}
                className="snap-start"
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="-mx-1 overflow-x-auto px-1 touch-pan-x snap-x-mandatory scrollbar-none">
          <div className="flex min-w-max gap-2">
            {STATE_FILTERS.map((state) => (
              <Button
                key={state}
                variant={stateFilter === state ? "default" : "outline"}
                size="sm"
                onClick={() => setStateFilter(state)}
                className="snap-start"
              >
                {state === "all" ? "All States" : state.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative rounded-xl border border-border bg-card shadow-sm">
        <div
          ref={tableScrollRef}
          onScroll={handleTableScroll}
          className="hidden overflow-x-auto rounded-t-xl lg:block scrollbar-none"
        >
          <table className="w-full min-w-[1020px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="sticky left-0 z-20 bg-card/95 backdrop-blur-sm p-4 text-left text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[240px] border-r border-border/60 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">
                  User
                </th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">State</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[140px]">Roles</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[140px]">Activity</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[160px]">Trust</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[130px]">Joined</th>
                <th className="p-4 text-right text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[170px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/40 transition-colors p-4 align-top min-w-[240px] border-r border-border/60 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={user.profile?.avatar_url || undefined} />
                          <AvatarFallback>{user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[180px]">{user.profile?.full_name || user.profile?.display_name || "Anonymous User"}</p>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[165px]">{user.email || "No email on file"}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top min-w-[120px]">
                      <div className="space-y-2">
                        {getStateBadge(user)}
                        {user.moderation_flags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {user.moderation_flags.map((flag) => (
                              <Badge key={flag} variant="outline" className="text-[10px]">
                                {flag.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top min-w-[140px]">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <span className="text-sm text-muted-foreground">No roles</span>
                        ) : (
                          user.roles.map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)}>
                              {role}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top text-sm text-muted-foreground whitespace-nowrap min-w-[140px]">
                      <div>{user.activity.hosted_count} hosted</div>
                      <div>{user.activity.joined_count} joined</div>
                      <div>{user.activity.total_content} content items</div>
                    </td>
                    <td className="p-4 align-top text-sm text-muted-foreground min-w-[160px]">
                      <div>{user.kyc_status ? `KYC: ${user.kyc_status}` : "KYC: —"}</div>
                      <div>
                        Money: {user.qualification?.is_qualified_for_money ? "Qualified" : "Limited"}
                      </div>
                      {user.qualification?.disqualification_reason && (
                        <p className="mt-1 max-w-[220px] text-xs text-amber-700">
                          {user.qualification.disqualification_reason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 align-top text-sm text-muted-foreground whitespace-nowrap min-w-[130px]">
                      <div>{formatDate(user.created_at)}</div>
                      <div className="mt-1 text-xs">
                        Last active: {formatDate(user.activity.latest_activity_at)}
                      </div>
                    </td>
                    <td className="p-4 align-top text-right whitespace-nowrap min-w-[170px]">
                      <div className="flex items-center justify-end gap-2">
                        {!user.roles.includes("host") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0 border-primary/20 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleAddRole(user.id, "host")}
                            disabled={addRole.isPending}
                          >
                            <UserPlus className="mr-1 h-3 w-3" />
                            Promote Host
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Moderate User</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setRoleDialog({ userId: user.id, action: "add" })}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add Role
                            </DropdownMenuItem>
                            {user.roles.length > 0 && (
                              <DropdownMenuItem onClick={() => setRoleDialog({ userId: user.id, action: "remove" })}>
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove Role
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openSuspensionDialog(user, !user.profile?.suspended)}>
                              {user.profile?.suspended ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Restore Account
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend Account
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky floating horizontal scroll toolbar pinned to the bottom of the viewport */}
        <div className="sticky bottom-0 z-30 hidden items-center justify-between gap-4 rounded-b-xl border-t border-border/80 bg-card/95 px-4 py-2 backdrop-blur shadow-[0_-6px_16px_rgba(0,0,0,0.25)] lg:flex">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs font-semibold"
              onClick={() => scrollTable("left")}
              disabled={!canScrollLeft}
              title="Scroll left"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />
              Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs font-semibold"
              onClick={() => scrollTable("right")}
              disabled={!canScrollRight}
              title="Scroll right"
            >
              Right
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>

          <div
            ref={stickyScrollRef}
            onScroll={handleStickyScroll}
            className="flex-1 overflow-x-auto py-1"
          >
            <div style={{ width: `${tableScrollWidth}px` }} className="h-1" />
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-[11px] hidden xl:inline">User pinned left</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => {
                if (tableScrollRef.current) {
                  tableScrollRef.current.scrollTo({
                    left: canScrollRight ? tableScrollWidth : 0,
                    behavior: "smooth",
                  });
                }
              }}
            >
              {canScrollRight ? "Actions →" : "← Reset"}
            </Button>
          </div>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
              <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="rounded-xl border border-border bg-background/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile?.avatar_url || undefined} />
                      <AvatarFallback>{user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{user.profile?.full_name || user.profile?.display_name || "Anonymous User"}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email || user.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Moderate User</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setRoleDialog({ userId: user.id, action: "add" })}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Role
                      </DropdownMenuItem>
                      {user.roles.length > 0 && (
                        <DropdownMenuItem onClick={() => setRoleDialog({ userId: user.id, action: "remove" })}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove Role
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openSuspensionDialog(user, !user.profile?.suspended)}>
                        {user.profile?.suspended ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Restore Account
                          </>
                        ) : (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {getStateBadge(user)}
                  {user.roles.map((role) => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)}>
                      {role}
                    </Badge>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Joined</p>
                    <p className="mt-1">{formatDate(user.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">KYC</p>
                    <p className="mt-1">{user.kyc_status || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Hosted</p>
                    <p className="mt-1">{user.activity.hosted_count}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Joined</p>
                    <p className="mt-1">{user.activity.joined_count}</p>
                  </div>
                </div>

                {(user.qualification?.disqualification_reason || user.profile?.suspension_reason) && (
                  <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800">
                    {user.profile?.suspension_reason || user.qualification?.disqualification_reason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users?.length || 0} users
      </p>

      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{roleDialog?.action === "add" ? "Add Role" : "Remove Role"}</DialogTitle>
            <DialogDescription>
              {roleDialog?.action === "add"
                ? "Select a role to grant to this user."
                : "Select a role to remove from this user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-2">
            {roleDialog?.action === "add"
              ? AVAILABLE_ROLES.filter((role) => !users?.find((entry) => entry.id === roleDialog.userId)?.roles.includes(role)).map((role) => (
                  <Button
                    key={role}
                    variant="outline"
                    onClick={() => handleAddRole(roleDialog.userId, role)}
                    disabled={addRole.isPending}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                ))
              : users?.find((entry) => entry.id === roleDialog?.userId)?.roles.map((role) => (
                  <Button
                    key={role}
                    variant="outline"
                    onClick={() => handleRemoveRole(roleDialog!.userId, role)}
                    disabled={removeRole.isPending}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRoleDialog(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!suspensionDialog} onOpenChange={() => setSuspensionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{suspensionDialog?.nextSuspended ? "Suspend account" : "Restore account"}</DialogTitle>
            <DialogDescription>
              {suspensionDialog?.nextSuspended
                ? "Use suspension to hard-block users who violated moment, content, or trust policies."
                : "Restoring removes the hard block and lets the user access the platform again."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {suspensionDialog?.user && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-medium">{suspensionDialog.user.profile?.full_name || suspensionDialog.user.email || "User"}</p>
                <p className="mt-1 text-muted-foreground">{suspensionDialog.user.email || suspensionDialog.user.id}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>{suspensionDialog.user.activity.pending_content} pending content</div>
                  <div>{suspensionDialog.user.activity.rejected_content} rejected content</div>
                  <div>{suspensionDialog.user.activity.open_support_tickets} open support</div>
                  <div>{suspensionDialog.user.activity.hosted_count} hosted moments</div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-800">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Suspension is the hard block. Softer limitations are currently handled through role control and the user’s money qualification status.
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">
                {suspensionDialog?.nextSuspended ? "Suspension reason" : "Restoration note"}
              </p>
              <Textarea
                value={suspensionReason}
                onChange={(event) => setSuspensionReason(event.target.value)}
                placeholder={suspensionDialog?.nextSuspended ? "Explain the violation or moderation concern." : "Optional note about why access is being restored."}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuspensionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={suspensionDialog?.nextSuspended ? "destructive" : "default"}
              onClick={handleSuspensionSubmit}
              disabled={updateSuspension.isPending}
            >
              {suspensionDialog?.nextSuspended ? (
                <>
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Suspend User
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Restore User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
