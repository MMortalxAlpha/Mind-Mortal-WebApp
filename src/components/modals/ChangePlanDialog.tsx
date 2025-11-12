import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: string;
  name: string;
  description: string;
  plan_id: string;
}

interface ChangePlanDialogProps {
  userId: string | null;
  userEmail: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string | null;
  onSave: (userId: string, newPlan: string) => Promise<void>;
}

const ChangePlanDialog: React.FC<ChangePlanDialogProps> = ({
  userId,
  userEmail,
  open,
  onOpenChange,
  currentPlan,
  onSave,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>(
    currentPlan || "free"
  );
  const [saving, setSaving] = useState(false);
  const [planDescriptions, setPlanDescriptions] = useState<
    Record<string, string>
  >({});
  const [userPlan, setUserPlan] = useState<string>(currentPlan || "free");

  // Fetch all plans on open
  useEffect(() => {
    if (!open) return;
    const fetchPlans = async () => {
      const { data, error } = await supabase.rpc(
        "get_public_plan_configurations"
      );
      if (!error && data) {
        setPlans(data);
        const descs: Record<string, string> = {};
        data.forEach((plan: Plan) => {
          descs[plan.name] = plan.description;
        });
        setPlanDescriptions(descs);
      }
    };
    fetchPlans();
  }, [open]);

  // Fetch user's current plan on open
  useEffect(() => {
    if (!open || !userId) return;
    const fetchUserPlan = async () => {
      const { data, error } = await supabase
        .from("subscribers")
        .select("subscription_tier")
        .eq("user_id", userId)
        .single();
      if (!error && data && data.subscription_tier) {
        console.log("data", data);
        setUserPlan(data.subscription_tier);
        setSelectedPlan(data.subscription_tier);
      } else {
        setUserPlan("free");
        setSelectedPlan("free");
      }
    };
    fetchUserPlan();
  }, [open, userId]);

  const handleSave = async () => {
    if (!userId || !userEmail) return;
    setSaving(true);
    if (selectedPlan === "free") {
      // Remove from subscribers if exists
      await supabase.from("subscribers").delete().eq("user_id", userId);
    } else {
      // Upsert into subscribers
      const { data: inserted, error } = await supabase
        .from("subscribers")
        .upsert({
          user_id: userId,
          email: userEmail,
          subscription_tier: selectedPlan,
        });
      if (error) {
        console.error("Error upserting into subscribers", error);
      }
      console.log("inserted", inserted);
    }
    await onSave(userId, selectedPlan);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Subscription Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-sm text-muted-foreground">
              Current Plan
            </div>
            <div className="font-medium mb-2">{userPlan || "Free"}</div>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select new plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="free" value="free">
                  Free
                </SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.name} value={plan.name}>
                    {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 text-xs text-muted-foreground">
              {selectedPlan === "free"
                ? "Free plan with limited features."
                : planDescriptions[selectedPlan]}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedPlan === userPlan || saving}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePlanDialog;
