import { useState } from "react";
import { useAllUsers, useAddUserRole, useRemoveUserRole } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, MoreHorizontal, Shield, UserPlus, UserMinus, Users } from "lucide-react";
import { format } from "date-fns";

const AVAILABLE_ROLES = ["participant", "host", "brand", "merchant", "admin"];

export function AdminUsersTab() {
  const { data: users, isLoading } = useAllUsers();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roleDialog, setRoleDialog] = useState<{ userId: string; action: "add" | "remove"; role?: string } | null>(null);

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || user.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const handleAddRole = (userId: string, role: string) => {
    addRole.mutate({ userId, role });
    setRoleDialog(null);
  };

  const handleRemoveRole = (userId: string, role: string) => {
    removeRole.mutate({ userId, role });
    setRoleDialog(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "host": return "default";
      case "brand": return "secondary";
      case "merchant": return "outline";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={roleFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setRoleFilter(null)}
          >
            All
          </Button>
          {AVAILABLE_ROLES.map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
            >
              {(role || "User").charAt(0).toUpperCase() + (role || "User").slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Roles</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.profile?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.profile?.full_name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
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
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.profile?.location || "—"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground text-center">
                      <div className="flex justify-end gap-2">
                        {!user.roles.includes("host") && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[10px] uppercase font-bold tracking-wider hover:bg-primary/10 hover:text-primary border-primary/20"
                            onClick={() => handleAddRole(user.id, "host")}
                            disabled={addRole.isPending}
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Promote Host
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setRoleDialog({ userId: user.id, action: "add" })}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Role
                            </DropdownMenuItem>
                            {user.roles.length > 0 && (
                              <DropdownMenuItem
                                onClick={() => setRoleDialog({ userId: user.id, action: "remove" })}
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Role
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-muted-foreground">
                              <Shield className="w-4 h-4 mr-2" />
                              View Activity
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
      </div>

      {/* Total count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers?.length || 0} of {users?.length || 0} users
      </p>

      {/* Role Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {roleDialog?.action === "add" ? "Add Role" : "Remove Role"}
            </DialogTitle>
            <DialogDescription>
              {roleDialog?.action === "add" 
                ? "Select a role to add to this user."
                : "Select a role to remove from this user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {roleDialog?.action === "add" ? (
              AVAILABLE_ROLES.filter(
                (role) => !users?.find((u) => u.id === roleDialog.userId)?.roles.includes(role)
              ).map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  onClick={() => handleAddRole(roleDialog.userId, role)}
                  disabled={addRole.isPending}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))
            ) : (
              users?.find((u) => u.id === roleDialog?.userId)?.roles.map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  onClick={() => handleRemoveRole(roleDialog!.userId, role)}
                  disabled={removeRole.isPending}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRoleDialog(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
