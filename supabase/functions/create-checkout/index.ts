// Creates a Stripe Checkout Session for a company plan and returns its URL.
// Deploy: supabase functions deploy create-checkout
import Stripe from "npm:stripe@17";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const SITE_URL = Deno.env.get("SITE_URL")!; // e.g. https://primemanagement18.com
const cors = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
};
// Stripe price ids per tier, set as function secrets: PRICE_TIER_1 ... PRICE_TIER_4.
const prices: Record<string, string | undefined> = {
  tier1: Deno.env.get("PRICE_TIER_1"),
  tier2: Deno.env.get("PRICE_TIER_2"),
  tier3: Deno.env.get("PRICE_TIER_3"),
  tier4: Deno.env.get("PRICE_TIER_4"),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { orgCode, tier, email } = await req.json();
    const code = String(orgCode ?? "").trim().toUpperCase();
    const price = prices[String(tier)];
    if (!/^[A-Z0-9]{4,10}$/.test(code)) return json({ error: "Enter your company code." }, 400);
    if (!price) return json({ error: "Choose a package." }, 400);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: code,
      metadata: { org_code: code, tier },
      subscription_data: { metadata: { org_code: code, tier } },
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/employer-pay/?paid=1`,
      cancel_url: `${SITE_URL}/employer-pay/`,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error(e);
    return json({ error: "Could not start checkout. Please try again." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });
}
