import { NextResponse } from "next/next"; // Changed to next/next to be safe, but usually it's next/server
// Correction: Next.js App Router uses next/server for NextResponse
import { NextResponse as NextResp } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = body.amount;

    if (!amount) {
      return NextResp.json({ error: "Chybí částka k zaplacení." }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResp.json({ 
        error: "Server Error: STRIPE_SECRET_KEY nebyl nalezen v proměnných prostředí. Ujistěte se, že je v .env.local a restartujte server." 
      }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20" as any,
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          price_data: {
            currency: "czk",
            product_data: {
              name: "Podpora projektu Region Beta",
              description: "Děkujeme za vaši podporu!",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${req.headers.get("origin")}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResp.json({ clientSecret: session.client_secret });
  } catch (err: any) {
    console.error("DEBUG STRIPE:", err);
    return NextResp.json(
      { error: `Stripe API Error: ${err.message}` }, 
      { status: 500 }
    );
  }
}
