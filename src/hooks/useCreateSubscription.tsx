import { useToast } from "./use-toast";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export type SubscriptionTier = null | "Monthly" | "Yearly" | "Lifetime";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: SubscriptionTier;
  subscription_end: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useCreateSubscription = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = async () => {
    if (!isAuthenticated()) {
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setSubscriptionData((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const { data, error } = await supabase.functions.invoke(
        "check-subscription"
      );

      if (error) {
        throw new Error(error.message);
      }

      setSubscriptionData({
        subscribed: data.subscribed,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscriptionData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check subscription status",
      }));
    }
  };

  const createCheckout = async (plan: any, priceId: string) => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      window.location.href = `/signin?callbackUrl=${window.location.pathname}`;
      return;
    }

    try {
      console.log("Creating checkout", { priceId, plan });
      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            priceId,
            plan,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      // Open Stripe checkout in a new tab
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Checkout Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start checkout process",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage your subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "customer-portal"
      );

      if (error) {
        throw new Error(error.message);
      }

      // Open Stripe customer portal in a new tab
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Portal Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to open subscription management portal",
        variant: "destructive",
      });
    }
  };

  // Check subscription status on auth change and periodically
  useEffect(() => {
    if (isAuthenticated()) {
      checkSubscription();

      // Set up periodic refresh
      const intervalId = setInterval(checkSubscription, 60000); // Check every minute

      return () => clearInterval(intervalId);
    }
  }, [user?.id]);

  return {
    subscriptionData,
    isLoading: subscriptionData.isLoading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
