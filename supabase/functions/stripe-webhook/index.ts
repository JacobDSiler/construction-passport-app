// Receives Stripe events and keeps company_billing in step. Stripe, not the app, decides who has paid.
// Deploy with JWT checking off (Stripe has no Supabase token): supabase functions deploy stripe-webhook --no-verify-jwt
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
// The service role key is provided to functions by Supabase at runtime. It is never in the repo or the app.
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function save(orgCode: string, patch: Record<string, unknown>) {
  const { error } = await db.from("company_billing").upsert(
    { org_code: orgCode, updated_at: new Date().toISOString(), ...patch },
    { onConflict: "org_code" },
  );
  if (error) throw error;
}

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("no signature", { status: 400 });
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), sig, secret);
  } catch {
    return new Response("bad signature", { status: 400 });
  }
  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const org = s.metadata?.org_code;
      if (org) {
        await save(org, {
          tier: s.metadata?.tier ?? null,
          status: "active",
          stripe_customer_id: String(s.customer ?? ""),
          stripe_subscription_id: String(s.subscription ?? ""),
        });
      }
    } else if (event.type.startsWith("customer.subscription.")) {
      const sub = event.data.object as Stripe.Subscription;
      const org = sub.metadata?.org_code;
      if (org) {
        const status = sub.status === "active" || sub.status === "trialing" ? "active"
          : sub.status === "past_due" || sub.status === "unpaid" ? "past_due" : "canceled";
        await save(org, {
          status,
          tier: sub.metadata?.tier ?? null,
          paid_until: new Date(sub.current_period_end * 1000).toISOString(),
          stripe_subscription_id: sub.id,
        });
      }
    } else if (event.type === "invoice.payment_failed") {
      const inv = event.data.object as Stripe.Invoice;
      const sub = inv.subscription ? await stripe.subscriptions.retrieve(String(inv.subscription)) : null;
      const org = sub?.metadata?.org_code;
      if (org) await save(org, { status: "past_due" });
    }
  } catch (e) {
    console.error(e);
    return new Response("handler error", { status: 500 }); // Stripe retries
  }
  return new Response("ok");
});
