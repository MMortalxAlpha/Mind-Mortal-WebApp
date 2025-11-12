// supabase/functions/create-subscriber/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Use the same TEST key you used in create-checkout
const stripe = new Stripe(Deno.env.get("MORTAL_TEST_STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Resolve your internal plan
async function resolveByPriceId(priceId: string) {
  const { data, error } = await supabase
    .from("plan_configurations")
    .select(
      "plan_id, name, stripe_price_id_monthly, stripe_price_id_annual, stripe_price_id_lifetime"
    )
    .or(
      `stripe_price_id_monthly.eq.${priceId},stripe_price_id_annual.eq.${priceId},stripe_price_id_lifetime.eq.${priceId}`
    )
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  let billing_interval: "month" | "year" | "lifetime" = "month";
  if (data.stripe_price_id_annual === priceId) billing_interval = "year";
  if (data.stripe_price_id_lifetime === priceId) billing_interval = "lifetime";

  return {
    plan_id: data.plan_id,
    subscription_tier: data.name,
    billing_interval,
  };
}

function computeEndDate(interval: "month" | "year" | "lifetime") {
  const now = new Date();
  if (interval === "month") return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
  if (interval === "year") return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
  return null;
}

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;
      const customerId = session.customer;
      const userId = session.client_reference_id || session.metadata?.user_id;
      const email = session.customer_details?.email ?? null;
      const subscriptionId = session.subscription ?? null;

      // Fetch line items to get price and product ids
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const priceId = lineItems.data[0]?.price?.id;
      const productId = lineItems.data[0]?.price?.product;

      if (!userId || !customerId || !priceId) {
        console.error("Missing identifiers", { userId, customerId, priceId });
        return new Response("missing-data", { status: 400 });
      }

      const plan = await resolveByPriceId(priceId);
      if (!plan) {
        console.error("Plan not found for price", priceId);
        return new Response("plan-not-found", { status: 404 });
      }

      const subscription_end = computeEndDate(plan.billing_interval);

      const { error } = await supabase.from("subscribers").upsert(
        {
          user_id: userId,
          email,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          stripe_product_id: productId,
          subscribed: true,
          plan_id: plan.plan_id,
          subscription_tier: plan.subscription_tier,
          billing_interval: plan.billing_interval,
          subscription_end,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("DB upsert error:", error);
        return new Response("db-error", { status: 500 });
      }

      console.log("✅ Subscriber updated:", userId);
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    console.error("⚠️ Handler error:", e);
    return new Response("fail", { status: 500 });
  }
});
