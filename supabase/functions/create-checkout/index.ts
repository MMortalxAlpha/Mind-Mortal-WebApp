// supabase/functions/create-checkout/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) =>
  console.log(`[CREATE-CHECKOUT] ${step}${details ? " " + JSON.stringify(details) : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    log("Function started");

    // Body can pass { priceId } or { plan: "Monthly" | "Yearly" | "Lifetime" }
    const { priceId, plan } = await req.json().catch(() => ({}));
    log("Request body", { priceId, plan });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Auth (Bearer <jwt>)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth failed: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email missing");
    log("User authenticated", { userId: user.id, email: user.email });

    // Stripe (TEST key as requested)
    const stripeKey = Deno.env.get("MORTAL_TEST_STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("MORTAL_TEST_STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create customer by email
    let customerId: string;
    {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existing.data.length) {
        customerId = existing.data[0].id;
        log("Existing customer", { customerId });
      } else {
        const created = await stripe.customers.create({
          email: user.email,
          metadata: { user_id: user.id },
        });
        customerId = created.id;
        log("New customer created", { customerId });
      }
    }

    // Pick price:
    // A) caller passes a specific priceId (preferred)
    // B) fallback: derive from "plan" label by listing prices (test mode)
    let stripePriceId: string | undefined = priceId;

    if (!stripePriceId && plan) {
      const prices = await stripe.prices.list({ active: true, limit: 100 });
      let match;
      if (plan === "Monthly") {
        match = prices.data.find((p) => p.recurring?.interval === "month");
      } else if (plan === "Yearly") {
        match = prices.data.find((p) => p.recurring?.interval === "year");
      } else if (plan === "Lifetime") {
        match = prices.data.find((p) => !p.recurring);
      }
      if (!match) throw new Error(`No matching price found for plan: ${plan}`);
      stripePriceId = match.id;
      log("Price resolved from plan", { plan, stripePriceId });
    }

    if (!stripePriceId) throw new Error("No priceId provided/resolved");

    // Determine mode by inspecting price
    const price = await stripe.prices.retrieve(stripePriceId);
    const isSubscription = !!price.recurring;
    log("Price retrieved", { isSubscription });

    // Success/cancel URLs
    const origin = req.headers.get("origin") ?? "https://your.app";
    const successUrl = `${origin}/dashboard/payment-confirmation?session_id={CHECKOUT_SESSION_ID}&customer_id=${customerId}&price_id=${stripePriceId}`;
    const cancelUrl = `${origin}/pricing`;

    // Create session; pass user mapping so webhook can upsert by user_id
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
    });

    log("Session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    log("ERROR", { message: err.message ?? String(err) });
    return new Response(JSON.stringify({ error: err.message ?? String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
