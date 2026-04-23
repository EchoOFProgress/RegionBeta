import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic'; // Zajistí, že se data nebudou cachovat

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe Secret Key missing" }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20" as any,
    });

    // Získáme seznam všech dokončených platebních relací
    // Poznámka: Stripe vrací max 100 výsledků na stránku, pro začátek to stačí.
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    });

    // Sečteme všechny úspěšné platby (Stripe vrací částky v haléřích, dělíme 100)
    const totalAmount = sessions.data.reduce((sum, session) => {
      return sum + (session.amount_total ? session.amount_total / 100 : 0);
    }, 0);

    return NextResponse.json({ 
      total: totalAmount,
      count: sessions.data.length 
    });
  } catch (err: any) {
    console.error("Stripe Total Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
