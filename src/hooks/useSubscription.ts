// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionTier =
  | 'Free – Legacy Keeper'
  | 'Builder – Legacy Builder'
  | 'Master – Legacy Master'
  | null;

export type PlanId = 'free' | 'builder' | 'master';

// Fallback mapper (when we only have the human tier string)
export const resolvePlanId = (tier: SubscriptionTier | string | null): PlanId => {
  switch (tier) {
    case 'Builder – Legacy Builder':
    case 'builder':
      return 'builder';
    case 'Master – Legacy Master':
    case 'master':
      return 'master';
    default:
      return 'free';
  }
};

function aliasFromMentorshipValue(
  mv: 'none' | 'mentee' | 'both' | null | undefined
): PlanId {
  if (mv === 'both') return 'master';
  if (mv === 'mentee') return 'builder';
  return 'free';
}

export function useSubscription() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // what the rest of the app expects:
  const [subscriptionTier, setTier] = useState<SubscriptionTier>(null);
  const [planId, setPlanId] = useState<PlanId>('free');
  const [active, setActive] = useState(false);
  const [startDate, setStart] = useState<string | undefined>(undefined);
  const [endDate, setEnd] = useState<string | undefined>(undefined);

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        // 1) Get the subscriber row for this user
        const { data: sub, error: subErr } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .maybeSingle();

        if (subErr) throw subErr;

        if (!sub) {
          // no row => treat as free
          if (!ignore) {
            setTier(null);
            setPlanId('free');
            setActive(true);
            setStart(undefined);
            setEnd(undefined);
          }
          return;
        }

        // 2) Work out "active"
        const now = new Date();
        const end = sub.subscription_end ? new Date(sub.subscription_end) : null;
        const isActive =
          (sub.status ? sub.status === 'active' : false) ||
          (end ? end > now : !!sub.subscribed);

        // 3) Derive alias from plan_limits when we have a product plan_id
        let alias: PlanId = 'free';

        if (sub.plan_id) {
          const { data: limitRow, error: limErr } = await supabase
            .from('plan_limits')
            .select('mentorship_value')
            .eq('plan_id', sub.plan_id)
            .eq('resource', 'mentorship_access')
            .maybeSingle();

          if (limErr) throw limErr;

          alias = aliasFromMentorshipValue(
            (limitRow?.mentorship_value as any) ?? null
          );
        } else {
          // Fallback to human-readable tier if plan_id is absent
          alias = resolvePlanId(sub.subscription_tier ?? null);
        }

        // 4) Optionally keep your tier string from DB (unchanged)
        const tier = (sub.subscription_tier as SubscriptionTier) ?? null;

        if (!ignore) {
          setTier(tier);
          setPlanId(alias);
          setActive(isActive);
          setStart(sub.created_at ?? undefined);
          setEnd(sub.subscription_end ?? undefined);
        }
      } catch (e: any) {
        if (!ignore) {
          setError(e instanceof Error ? e : new Error('Failed to fetch subscription'));
          // Fail closed to FREE but stop loading so UI can continue
          setTier(null);
          setPlanId('free');
          setActive(false);
          setStart(undefined);
          setEnd(undefined);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [user?.id]);

  // preserve original return shape
  const subscription = {
    tier: subscriptionTier,
    active,
    startDate,
    endDate,
    plan_id: planId,
  };

  return { subscription, isLoading, error, subscriptionTier, planId };
}
