import { NextResponse as NextResp } from "next/server";
import Stripe from "stripe";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: "2024-06-20" as any });
};

// Supported currencies and their Stripe configs
const CURRENCY_CONFIG: Record<string, { name: string; zeroDecimal: boolean }> = {
  czk: { name: "Podpora projektu Region Beta", zeroDecimal: false },
  usd: { name: "Support Region Beta project", zeroDecimal: false },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = body.amount;
    // currency must be "czk" or "usd", default to "czk"
    const currency: string = (body.currency || "czk").toLowerCase();

    if (!amount || amount <= 0) {
      return NextResp.json({ error: "Invalid amount." }, { status: 400 });
    }

    if (!CURRENCY_CONFIG[currency]) {
      return NextResp.json({ error: "Unsupported currency." }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) return NextResp.json({ error: "Stripe Secret Key missing" }, { status: 500 });

    const config = CURRENCY_CONFIG[currency];

    // Stripe expects amounts in the smallest currency unit (cents / haléře)
    // CZK is NOT a zero-decimal currency in Stripe — amounts are in haléře (×100)
    // USD amounts are in cents (×100)
    const unitAmount = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded" as any,
      line_items: [{
        price_data: {
          currency,
          product_data: { name: config.name },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: "payment",
      return_url: `${req.headers.get("origin")}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResp.json({ clientSecret: session.client_secret });
  } catch (err: any) {
    return NextResp.json({ error: err.message }, { status: 500 });
  }
}

// GET: verify payment status after return
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) return NextResp.json({ error: "Missing session_id" }, { status: 400 });

  try {
    const stripe = getStripe();
    if (!stripe) return NextResp.json({ error: "Stripe Secret Key missing" }, { status: 500 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResp.json({
      status: session.status,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      customer_email: session.customer_details?.email,
    });
  } catch (err: any) {
    return NextResp.json({ error: err.message }, { status: 500 });
  }
}
