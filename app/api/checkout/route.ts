import { NextResponse as NextResp } from "next/server";
import Stripe from "stripe";

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: "2024-06-20" as any });
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = body.amount;

    if (!amount) return NextResp.json({ error: "Chybí částka." }, { status: 400 });

    const stripe = getStripe();
    if (!stripe) return NextResp.json({ error: "Stripe Secret Key missing" }, { status: 500 });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [{
        price_data: {
          currency: "czk",
          product_data: { name: "Podpora projektu Region Beta" },
          unit_amount: amount * 100,
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

// NOVINKA: GET metoda pro ověření stavu platby po návratu
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
      customer_email: session.customer_details?.email,
    });
  } catch (err: any) {
    return NextResp.json({ error: err.message }, { status: 500 });
  }
}
