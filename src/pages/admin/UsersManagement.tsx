import ChangePlanDialog from "@/components/modals/ChangePlanDialog";
import ChangeUserRoleDialog from "@/components/modals/ChangeUserRoleDialog";
import EditUserDialog from "@/components/modals/EditUserDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Edit, MoreHorizontal, Search, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: string;
  full_name: string | null;
  email: string;
  roles: string[];
  subscription_tier: string | null;
  updated_at: string;
}

const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleDialogUserId, setRoleDialogUserId] = useState<string | null>(null);
  const [roleDialogCurrentRoles, setRoleDialogCurrentRoles] = useState<
    string[]
  >([]);
  const [roleSaving, setRoleSaving] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDialogUserId, setPlanDialogUserId] = useState<string | null>(null);
  const [planDialogCurrentPlan, setPlanDialogCurrentPlan] = useState<
    string | null
  >(null);

  const fetchUsers = async () => {
    try {
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, updated_at")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Get user roles for each profile
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          // Get user roles
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          // Get subscription info
          const { data: subscription } = await supabase
            .from("subscribers")
            .select("subscription_tier")
            .eq("user_id", profile.id)
            .single();

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.username,
            roles: userRoles?.map((r) => r.role) || ["disciple"],
            subscription_tier: subscription?.subscription_tier || null,
            updated_at: profile.updated_at,
          };
        })
      );

      setUsers(usersWithData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (
    e: React.FormEvent,
    fullName: string,
    email: string,
    userId: string
  ) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: fullName, username: email })
        .eq("id", userId);

      if (updateError) throw updateError;
      toast.success("User info updated successfully");
      setEditDialogOpen(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch (err: any) {
      toast.error("Failed to update user info.");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleSave = async (userId: string, newRoles: string[]) => {
    setRoleSaving(true);
    try {
      // Remove all roles for user
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Insert new roles
      if (newRoles.length > 0) {
        const inserts = newRoles.map((role) => ({
          user_id: userId,
          role: role as "admin" | "mentor" | "disciple",
        }));
        await supabase.from("user_roles").insert(inserts);
      }
      toast.success("User roles updated successfully");
      setRoleDialogOpen(false);
      setRoleDialogUserId(null);
      setRoleDialogCurrentRoles([]);
      fetchUsers();
    } catch (err: any) {
      toast.error("Failed to update user roles.");
    } finally {
      setRoleSaving(false);
    }
  };

  // Status badge colors
  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("admin")) {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary">
          Admin
        </Badge>
      );
    } else if (roles.includes("mentor")) {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
          Mentor
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-secondary text-secondary-foreground"
        >
          Disciple
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Users Management</h1>
        </div>
        <div className="flex justify-center py-12">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users Management</h1>
        {/* <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            {/* <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button> */}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.full_name || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.roles)}</TableCell>
                    <TableCell>
                      {user.subscription_tier ? (
                        <Badge variant="outline">
                          {user.subscription_tier}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          None
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRoleDialogUserId(user.id);
                              setRoleDialogCurrentRoles(user.roles);
                              setRoleDialogOpen(true);
                            }}
                          >
                            Change Role
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => {
                              setPlanDialogUserId(user.id);
                              setPlanDialogCurrentPlan(user.subscription_tier);
                              setPlanDialogOpen(true);
                            }}
                          >
                            Change Plan
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Account
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <EditUserDialog
        userId={selectedUserId}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedUserId(null);
        }}
        onSave={handleSave}
        saving={saving}
      />
      <ChangeUserRoleDialog
        userId={roleDialogUserId}
        open={roleDialogOpen}
        onOpenChange={(open) => {
          setRoleDialogOpen(open);
          if (!open) {
            setRoleDialogUserId(null);
            setRoleDialogCurrentRoles([]);
          }
        }}
        onSave={handleRoleSave}
        saving={roleSaving}
        currentRoles={roleDialogCurrentRoles}
      />
      <ChangePlanDialog
        userId={planDialogUserId}
        userEmail={users.find((u) => u.id === planDialogUserId)?.email || null}
        open={planDialogOpen}
        onOpenChange={(open) => {
          setPlanDialogOpen(open);
          if (!open) {
            setPlanDialogUserId(null);
            setPlanDialogCurrentPlan(null);
          }
        }}
        currentPlan={planDialogCurrentPlan}
        onSave={async (userId, newPlan) => {
          try {
            const { error } = await supabase
              .from("subscribers")
              .update({ subscription_tier: newPlan })
              .eq("user_id", userId);
            if (error) throw error;
            toast.success("User plan updated successfully");
            fetchUsers();
          } catch (err) {
            toast.error("Failed to update user plan.");
          }
        }}
      />
    </div>
  );
};

export default UsersManagement;
