import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";

/**
 * POST /api/checkout
 * Create a Stripe Checkout session for one-time $29 payment
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      console.warn("[API/checkout] Stripe is not configured");
      return NextResponse.json(
        {
          error: "payment_not_configured",
          message:
            "Stripe payments are not configured. Set STRIPE_SECRET_KEY in environment variables.",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      auditId?: string;
      email?: string;
      siteUrl?: string;
    };

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Create Stripe Checkout Session for one-time payment
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // One-time payment, not subscription
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "GEO Pulse Pro Audit",
              description:
                "Full AI visibility report with JSON-LD schema, gap analysis, and recommendations",
              images: [`${origin}/og-image.png`],
            },
            unit_amount: 2900, // $29.00 in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      // Pre-fill customer email if provided
      ...(body.email && { customer_email: body.email }),
      // Store metadata for webhook processing
      metadata: {
        auditId: body.auditId || "",
        siteUrl: body.siteUrl || "",
        product: "geo_pulse_pro_audit",
      },
      // Allow promotion codes for discounts
      allow_promotion_codes: true,
      // Collect billing address
      billing_address_collection: "auto",
    });

    if (!session.url) {
      console.error("[API/checkout] Stripe returned no checkout URL");
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    console.log(`[API/checkout] Session created: ${session.id}`);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API/checkout] Error:", message);

    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout?session_id=xxx
 * Check checkout session status
 */
export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      metadata: session.metadata,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[API/checkout] GET error:", message);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
