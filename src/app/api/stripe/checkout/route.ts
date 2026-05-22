import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" as any });
}

export async function POST(request: NextRequest) {
  try {
    const { companyId, companyName, email } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: "companyId required" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sidekick Pro",
              description: "AI-powered knowledge base for your frontline team",
            },
            unit_amount: 20000, // $200.00
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { companyId, companyName: companyName || "" },
      success_url: `https://app.textsidekick.com/manager?payment=success&companyId=${companyId}`,
      cancel_url: `https://app.textsidekick.com/manager?payment=cancelled`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("[Stripe Checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
