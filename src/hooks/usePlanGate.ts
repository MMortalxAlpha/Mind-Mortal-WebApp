// src/hooks/usePlanGate.ts
import { useEffect, useMemo, useState } from "react";
import { useSubscription } from "./useSubscription";            // <-- use the alias planId from the hook
import { PLAN_LIMITS } from "./usePlanLimits";
import { useUsage } from "./useUsage";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type CapacityKind = "legacy" | "idea" | "timeless" | "wisdom";

type AccessRow = {
  mentorship: "none" | "mentee" | "both" | null;
  can_view_mentorship: boolean | null;
  can_post_wisdom: boolean | null;
  can_see_progress_tracker: boolean | null;
};

export function usePlanGate() {
  const { user } = useAuth();

  // IMPORTANT: use the alias planId that the subscription hook derives from DB (plan_limits)
  const { planId: subPlanId } = useSubscription();              // 'free' | 'builder' | 'master'
  const planId = subPlanId;                                     // <-- stop deriving from subscriptionTier
  const baseLimits = PLAN_LIMITS[planId];

  const usage = useUsage(user?.id);

  // Live capabilities from DB
  const [rpc, setRpc] = useState<AccessRow | null>(null);
  const [rpcLoading, setRpcLoading] = useState<boolean>(!!user);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!user) {
        setRpc(null);
        setRpcLoading(false);
        return;
      }
      setRpcLoading(true);
      const { data, error } = await supabase.rpc("current_access", {
        p_user: user.id,
      });
      if (ignore) return;

      if (error) {
        console.warn("current_access RPC error (falling back to PLAN_LIMITS):", error);
        setRpc(null);
      } else {
        const row = (Array.isArray(data) ? data[0] : data) as AccessRow | null;
        setRpc(row ?? null);
      }
      setRpcLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  // Merge: DB overrides for mentorship/progress flags
  const mergedLimits = useMemo(() => {
    const out = { ...baseLimits };

    if (rpc?.mentorship) {
      out.mentorship =
        rpc.mentorship === "both" ? ("mentor_mentee" as const) : rpc.mentorship;
    }
    if (typeof rpc?.can_see_progress_tracker === "boolean") {
      out.showProgressTracker = rpc.can_see_progress_tracker;
    }
    return out;
  }, [baseLimits, rpc]);

  function requireCapacity(kind: CapacityKind) {
    if (usage.loading) return { ok: false as const, reason: "loading" as const };

    const map = {
      legacy:   { used: usage.legacyCountMonth,   cap: mergedLimits.legacyPerMonth },
      idea:     { used: usage.ideaCountMonth,     cap: mergedLimits.ideaPerMonth },
      timeless: { used: usage.timelessCountMonth, cap: mergedLimits.timelessPerMonth },
      // Wisdom creation is governed by mentorship role; treat as unlimited here
      wisdom:   { used: usage.wisdomCountMonth,   cap: "unlimited" as const },
    }[kind];

    if (map.cap === "unlimited") return { ok: true as const };
    if (map.used < map.cap)     return { ok: true as const };

    toast({
      title: "Limit reached",
      description: "Please upgrade your plan to create more.",
    });
    return { ok: false as const, reason: "quota" as const };
  }

  function requireStorage(bytesNeeded: number) {
    if (usage.loading) return { ok: false as const, reason: "loading" as const };
    const remaining = mergedLimits.storageBytes - usage.storageBytes;
    if (remaining >= bytesNeeded) return { ok: true as const };

    toast({
      title: "Storage full",
      description: "Upgrade your plan to add more storage.",
    });
    return { ok: false as const, reason: "storage" as const };
  }

  function requireMentorshipAccess() {
    const ok =
      (typeof rpc?.can_view_mentorship === "boolean"
        ? rpc.can_view_mentorship
        : mergedLimits.mentorship !== "none");

    if (!ok) {
      toast({
        title: "Mentorship is a premium feature",
        description: "Upgrade to access mentorship.",
      });
    }
    return { ok };
  }

  function requireMentorRole() {
    const ok =
      (typeof rpc?.can_post_wisdom === "boolean"
        ? rpc.can_post_wisdom
        : mergedLimits.mentorship === "mentor_mentee");

    if (!ok) {
      toast({
        title: "Mentor tools require Master plan",
        description: "Upgrade to become a mentor.",
      });
    }
    return { ok };
  }

  const canSeeProgressTracker =
    typeof rpc?.can_see_progress_tracker === "boolean"
      ? rpc.can_see_progress_tracker
      : !!mergedLimits.showProgressTracker;

  return {
    planId,                    // now reflects DB-derived alias reliably
    limits: mergedLimits,
    usage,
    loading: rpcLoading || usage.loading,
    canSeeProgressTracker,
    requireCapacity,
    requireStorage,
    requireMentorshipAccess,
    requireMentorRole,
  };
}

export function useMentorshipAccess() {
  const { limits, planId } = usePlanGate();

  const canViewMentorship =
    limits.mentorship !== "none" && ["builder", "master"].includes(planId);

  const canCreateResource =
    limits.mentorship === "mentor_mentee" || planId === "master";

  const canSeeProgressTracker = !!limits.showProgressTracker;

  return {
    canViewMentorship,
    canCreateResource,
    canSeeProgressTracker,
  };
}
