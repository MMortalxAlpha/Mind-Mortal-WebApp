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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";

const ALL_ROLES = ["admin", "mentor", "disciple"];

interface ChangeUserRoleDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, newRoles: string[]) => void;
  saving: boolean;
  currentRoles: string[];
}

const ChangeUserRoleDialog: React.FC<ChangeUserRoleDialogProps> = ({
  userId,
  open,
  onOpenChange,
  onSave,
  saving,
  currentRoles,
}) => {
  const { roles: currentUserRoles } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);

  useEffect(() => {
    setSelectedRoles(currentRoles);
  }, [currentRoles, open]);

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) onSave(userId, selectedRoles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Roles</DialogTitle>
          <DialogDescription>
            Update the roles for this user. You can assign multiple roles.
          </DialogDescription>
        </DialogHeader>
        {!currentUserRoles?.includes("admin") ? (
          <div className="py-4 text-red-500">
            You do not have permission to change roles.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              {ALL_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => handleRoleChange(role)}
                    id={`role-${role}`}
                  />
                  <span className="capitalize">{role}</span>
                </label>
              ))}
            </div>
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

export default ChangeUserRoleDialog;
