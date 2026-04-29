import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

// Exchange rate: 1 USD = ~23 CZK (fixed reference rate for goal display)
// The actual Stripe transactions can be in either currency.
const CZK_PER_USD = 23;

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe Secret Key missing" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20" as any,
    });

    // Get all completed checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    });

    // Sum all payments, converting everything to CZK for the goal tracker
    let totalCZK = 0;
    let totalUSD = 0;

    for (const session of sessions.data) {
      if (!session.amount_total) continue;
      const amountInMainUnit = session.amount_total / 100;
      const currency = (session.currency || "czk").toLowerCase();

      if (currency === "czk") {
        totalCZK += amountInMainUnit;
        totalUSD += amountInMainUnit / CZK_PER_USD;
      } else if (currency === "usd") {
        totalUSD += amountInMainUnit;
        totalCZK += amountInMainUnit * CZK_PER_USD;
      } else {
        // Fallback: treat as CZK
        totalCZK += amountInMainUnit;
      }
    }

    return NextResponse.json({
      total: Math.round(totalCZK),       // in CZK (for Czech users)
      totalUSD: parseFloat(totalUSD.toFixed(2)),  // in USD (for English users)
      count: sessions.data.length,
    });
  } catch (err: any) {
    console.error("Stripe Total Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
