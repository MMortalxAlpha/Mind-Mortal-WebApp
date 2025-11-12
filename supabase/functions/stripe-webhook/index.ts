import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@^16.2.0?target=deno";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// --- Stripe key selection (test vs live)
const TEST_KEY =
  Deno.env.get("MORTAL_TEST_STRIPE_SECRET_KEY") ??
  Deno.env.get("STRIPE_TEST_SECRET_KEY") ??
  Deno.env.get("STRIPE_SECRET_KEY");
const LIVE_KEY =
  Deno.env.get("STRIPE_SECRET_KEY_LIVE") ??
  Deno.env.get("STRIPE_SECRET_KEY");

function stripeClient(live: boolean) {
  const key = live ? LIVE_KEY : TEST_KEY;
  if (!key) throw new Error(`Missing Stripe secret for ${live ? "live" : "test"} mode`);
  return new Stripe(key, { apiVersion: "2025-03-31.basil" });
}

type BillingInterval = "month" | "year" | "lifetime";
const toInterval = (v?: string | null): BillingInterval | null =>
  v === "month" ? "month" : v === "year" ? "year" : null;

// ---------- helpers

// 1) Try profiles by email/username; if not found, fall back to Auth Admin API
async function resolveUserIdByEmail(email?: string | null): Promise<string | null> {
  if (!email) return null;

  // profiles lookup
  {
    const url =
      `${supabaseUrl}/rest/v1/profiles?` +
      `select=id&or=(email.eq.${encodeURIComponent(email)},username.eq.${encodeURIComponent(email)})&limit=1`;
    const r = await fetch(url, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (r.ok) {
      const rows = (await r.json()) as Array<{ id: string }>;
      if (rows?.[0]?.id) return rows[0].id;
    }
  }

  // auth admin lookup (returns users array)
  {
    const url = `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
    const r = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`, // service role only
      },
    });
    if (r.ok) {
      const data = await r.json();
      const id = data?.users?.[0]?.id ?? data?.[0]?.id; // handle both shapes
      if (id) return id as string;
    }
  }

  return null;
}

async function priceToPlanIntervalAndName(stripe_price_id?: string | null) {
  if (!stripe_price_id)
    return { plan_id: null as string | null, billing_interval: null as BillingInterval | null, plan_name: null as string | null };

  const url =
    `${supabaseUrl}/rest/v1/plan_configurations` +
    `?or=(stripe_price_id_monthly.eq.${encodeURIComponent(stripe_price_id)},` +
    `stripe_price_id_annual.eq.${encodeURIComponent(stripe_price_id)},` +
    `stripe_price_id_lifetime.eq.${encodeURIComponent(stripe_price_id)})` +
    `&select=plan_id,name,stripe_price_id_monthly,stripe_price_id_annual,stripe_price_id_lifetime`;

  const resp = await fetch(url, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const rows = await resp.json() as Array<{
    plan_id: string;
    name: string;
    stripe_price_id_monthly: string | null;
    stripe_price_id_annual:  string | null;
    stripe_price_id_lifetime:string | null;
  }>;

  if (!rows?.[0]) return { plan_id: null, billing_interval: null, plan_name: null };

  let billing_interval: BillingInterval | null = null;
  if (rows[0].stripe_price_id_monthly  === stripe_price_id) billing_interval = "month";
  else if (rows[0].stripe_price_id_annual === stripe_price_id) billing_interval = "year";
  else if (rows[0].stripe_price_id_lifetime === stripe_price_id) billing_interval = "lifetime";

  return { plan_id: rows[0].plan_id, billing_interval, plan_name: rows[0].name };
}

function isoOrNull(secs?: number | null): string | null {
  return secs ? new Date(secs * 1000).toISOString() : null;
}

async function upsertSubscriber(body: Record<string, unknown>) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_subscriber_safe`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ p: body }),
  });
  if (!res.ok) throw new Error(`upsert_subscriber_safe failed: ${res.status} ${await res.text()}`);
}

// ---------- handler

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature") ?? "";
  const rawBody = await req.text();

  // verify with any client
  const verifier = stripeClient(false);
  let event: Stripe.Event;
  try {
    event = await verifier.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
  }

  // correct-mode client
  const api = stripeClient(!!event.livemode);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const customerId = (s.customer as string) || "";
        const subscriptionId = (s.subscription as string) || null;

        let priceId: string | null = null;
        let productId: string | null = null;
        let status: string | null = null;
        let current_period_start: string | null = null;
        let current_period_end: string | null = null;
        let cancel_at: string | null = null;
        let stripe_subscription_id: string | null = subscriptionId;
        let interval: BillingInterval | null = null;

        if (subscriptionId) {
          const sub = await api.subscriptions.retrieve(subscriptionId);
          const item = sub.items?.data?.[0];
          priceId   = (item?.price?.id as string) ?? null;
          productId = (item?.price?.product as string) ?? null;
          interval  = toInterval(item?.price?.recurring?.interval ?? null);
          status    = sub.status;
          current_period_start = isoOrNull(sub.current_period_start);
          current_period_end   = isoOrNull(sub.current_period_end);
          cancel_at            = isoOrNull(sub.cancel_at);
          stripe_subscription_id = sub.id;
        }

        const map = await priceToPlanIntervalAndName(priceId ?? undefined);
        if (!interval) interval = map.billing_interval ?? null;

        let user_id: string | null = (s.metadata?.user_id as string) ?? null;
        if (!user_id) user_id = await resolveUserIdByEmail(s.customer_details?.email ?? null);

        await upsertSubscriber({
          user_id,
          email: s.customer_details?.email ?? null,
          stripe_customer_id: customerId,
          stripe_price_id: priceId,
          stripe_product_id: productId,
          billing_interval: interval,
          status,
          current_period_start,
          current_period_end,
          cancel_at,
          plan_id: map.plan_id,
          stripe_subscription_id,
          // convenience fields for your UI
          subscribed: status === "active",
          subscription_tier: map.plan_name,
          subscription_end: current_period_end,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = (sub.customer as string) || "";
        const item = sub.items?.data?.[0];
        const priceId   = (item?.price?.id as string) ?? null;
        const productId = (item?.price?.product as string) ?? null;
        let interval    = toInterval(item?.price?.recurring?.interval ?? null);

        // get email
        let email: string | null = null;
        if (customerId) {
          const cust = await api.customers.retrieve(customerId);
          // @ts-ignore union type
          email = (cust && !cust.deleted) ? (cust.email ?? null) : null;
        }

        const map = await priceToPlanIntervalAndName(priceId ?? undefined);
        if (!interval) interval = map.billing_interval ?? null;

        let user_id: string | null = (sub.metadata?.user_id as string) ?? null;
        if (!user_id) user_id = await resolveUserIdByEmail(email);

        const current_period_start = isoOrNull(sub.current_period_start);
        const current_period_end   = isoOrNull(sub.current_period_end);
        const cancel_at            = isoOrNull(sub.cancel_at);

        await upsertSubscriber({
          user_id,
          email,
          stripe_customer_id: customerId,
          stripe_price_id: priceId,
          stripe_product_id: productId,
          billing_interval: interval,
          status: sub.status,
          current_period_start,
          current_period_end,
          cancel_at,
          plan_id: map.plan_id,
          stripe_subscription_id: sub.id,
          // convenience fields for your UI
          subscribed: sub.status === "active",
          subscription_tier: map.plan_name,
          subscription_end: current_period_end,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = (sub.customer as string) || "";

        let email: string | null = null;
        if (customerId) {
          const cust = await api.customers.retrieve(customerId);
          // @ts-ignore union type
          email = (cust && !cust.deleted) ? (cust.email ?? null) : null;
        }

        let user_id: string | null = (sub.metadata?.user_id as string) ?? null;
        if (!user_id) user_id = await resolveUserIdByEmail(email);

        const current_period_start = isoOrNull(sub.current_period_start);
        const current_period_end   = isoOrNull(sub.current_period_end);
        const cancel_at            = isoOrNull(sub.cancel_at);

        await upsertSubscriber({
          user_id,
          email,
          stripe_customer_id: customerId,
          stripe_price_id: null,
          stripe_product_id: null,
          billing_interval: null,
          status: sub.status ?? "canceled",
          current_period_start,
          current_period_end,
          cancel_at,
          plan_id: null,
          stripe_subscription_id: sub.id,
          subscribed: false,
          subscription_tier: null,
          subscription_end: current_period_end,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Webhook handle error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
  }
});
