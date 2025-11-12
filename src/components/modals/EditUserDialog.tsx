import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditUserDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    e: React.FormEvent,
    fullName: string,
    email: string,
    userId: string
  ) => void;
  saving: boolean;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
  roles: string[];
  subscription_tier: string | null;
  updated_at: string;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  userId,
  open,
  onOpenChange,
  onSave,
  saving,
}) => {
  const { roles: currentRoles } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingState, setSaving] = useState(false);

  useEffect(() => {
    if (!userId || !open) return;
    setLoading(true);
    setError(null);
    const fetchUser = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, username, updated_at")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        const { data: subscription } = await supabase
          .from("subscribers")
          .select("subscription_tier")
          .eq("user_id", userId)
          .single();

        setUser({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.username,
          roles: userRoles?.map((r) => r.role) || ["disciple"],
          subscription_tier: subscription?.subscription_tier || null,
          updated_at: profile.updated_at,
        });

        setFullName(profile.full_name || "");
        setEmail(profile.username || "");
      } catch (err: any) {
        setError("Failed to fetch user info.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">Loading user info...</div>
        ) : error ? (
          <div className="py-4 text-red-500">{error}</div>
        ) : !user ? (
          <div className="py-4">User not found.</div>
        ) : !currentRoles?.includes("admin") ? (
          <div className="py-4 text-red-500">
            You do not have permission to edit users.
          </div>
        ) : (
          <form
            onSubmit={(e) => onSave(e, fullName, email, userId)}
            className="space-y-4"
          >
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Role</label>
              <div>
                {user.roles.map((role) => (
                  <Badge key={role} className="mr-2">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Subscription</label>
              {user.subscription_tier ? (
                <Badge>{user.subscription_tier}</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">None</span>
              )}
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
