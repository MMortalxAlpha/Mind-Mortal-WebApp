import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PaymentSuccess from "@/components/subscription/PaymentSuccess";
import PaymentFailed from "@/components/subscription/PaymentFailed";
import { supabase } from "@/integrations/supabase/client";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentSuccessPage = () => {
  const query = useQuery();
  const sessionId = query.get("session_id");
  const priceId = query.get("price_id");
  const customerId = query.get("customer_id");

  const isValid = priceId && customerId;

  const createSubscriber = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user found");
    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();
    if (profileError || !profile) throw new Error("No profile found for user");
    const userEmail = profile.username;

    console.log(priceId, "priceId");
    const { data: plan, error: planError } = await supabase
      .from("plan_configurations")
      .select("*")
      .or(
        `stripe_price_id_monthly.eq.${priceId},stripe_price_id_annual.eq.${priceId},stripe_price_id_lifetime.eq.${priceId}`
      )
      .single();

    console.log(plan, "plan");
    console.log(planError, "planError");
    if (planError || !plan) throw new Error("No plan found for price ID");

    let subscriptionExpiresAt;
    if (plan.monthly_price > 0) {
      subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (plan.annual_price > 0) {
      subscriptionExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (plan.lifetime_price > 0) {
      subscriptionExpiresAt = new Date(
        Date.now() + 10 * 365 * 24 * 60 * 60 * 1000
      );
    } else {
      throw new Error("No valid price found for plan");
    }

    const { data: existing, error: fetchError } = await supabase
      .from("subscribers")
      .select("email")
      .eq("email", userEmail)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("subscribers")
        .update({
          stripe_customer_id: customerId,
          subscribed: true,
          updated_at: new Date().toISOString(),
          plan_id: plan.plan_id,
          subscription_tier: plan.name,
          subscription_end: subscriptionExpiresAt.toISOString(),
        })
        .eq("email", userEmail)
        .select();

      if (updateError) throw updateError;
      return updated;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("subscribers")
        .insert([
          {
            user_id: userId,
            email: userEmail,
            stripe_customer_id: customerId,
            subscribed: true,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            plan_id: plan.plan_id,
            subscription_tier: plan.name,
            subscription_end: subscriptionExpiresAt.toISOString(),
          },
        ])
        .select();

      if (insertError) throw insertError;
      return inserted;
    }
  };

  useEffect(() => {
    if (isValid) {
      createSubscriber().then(() => {
        console.log("Subscriber created");
      });
    }
  }, [isValid]);

  return isValid ? <PaymentSuccess /> : <PaymentFailed />;
};

export default PaymentSuccessPage;
