// supabase/functions/check-subscription/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) =>
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? " " + JSON.stringify(details) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth failed: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not found");
    log("Authenticated", { userId: user.id });

    // Read ONLY from our DB. Webhook keeps this in sync with Stripe.
    const { data: sub, error } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        subscribed: !!sub?.subscribed,
        status: sub?.status ?? null,
        plan_id: sub?.plan_id ?? null,                // Stripe product id (your plan_id)
        subscription_tier: sub?.subscription_tier ?? null,
        stripe_customer_id: sub?.stripe_customer_id ?? null,
        stripe_price_id: sub?.stripe_price_id ?? null,
        stripe_product_id: sub?.stripe_product_id ?? null,
        billing_interval: sub?.billing_interval ?? null,
        current_period_end: sub?.current_period_end ?? sub?.subscription_end ?? null,
        cancel_at_period_end: sub?.cancel_at_period_end ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    log("Error", { message: err.message ?? String(err) });
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
