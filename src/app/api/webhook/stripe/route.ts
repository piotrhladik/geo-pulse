import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users, audits } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Stripe Webhook Handler
 *
 * Handles one-time payments for GEO Pulse Pro Audit ($29)
 *
 * Events:
 * - checkout.session.completed: Payment successful → unlock full report
 * - payment_intent.payment_failed: Payment failed → log error
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.error("[Webhook/Stripe] Stripe not configured");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Webhook/Stripe] STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("[Webhook/Stripe] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature (CRITICAL for security)
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Webhook/Stripe] Signature verification failed:", message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }

    console.log(`[Webhook/Stripe] Received event: ${event.type} (${event.id})`);

    // Handle specific event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`[Webhook/Stripe] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook/Stripe] Unexpected error:", message);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout - unlock full report for user
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook/Stripe] Checkout completed: ${session.id}`);

  const customerEmail = session.customer_email;
  const metadata = session.metadata || {};
  const auditId = metadata.auditId;
  const siteUrl = metadata.siteUrl;

  if (!customerEmail) {
    console.error("[Webhook/Stripe] No customer email in checkout session");
    return;
  }

  try {
    // 1. Create or update user with Pro status
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, customerEmail))
      .limit(1);

    if (existingUsers.length > 0) {
      // Update existing user - grant Pro access
      await db
        .update(users)
        .set({
          isPro: true,
          plan: "pro",
          credits: 999999, // Unlimited audits
          updatedAt: new Date(),
        })
        .where(eq(users.email, customerEmail));

      console.log(`[Webhook/Stripe] Upgraded user to Pro: ${customerEmail}`);
    } else {
      // Create new Pro user
      await db.insert(users).values({
        email: customerEmail,
        isPro: true,
        plan: "pro",
        credits: 999999,
      });

      console.log(`[Webhook/Stripe] Created new Pro user: ${customerEmail}`);
    }

    // 2. Mark audit as paid (if auditId provided)
    if (auditId) {
      await db
        .update(audits)
        .set({
          status: "paid",
          updatedAt: new Date(),
        })
        .where(eq(audits.id, auditId));

      console.log(`[Webhook/Stripe] Marked audit ${auditId} as paid`);
    }

    // 3. Log successful payment for analytics
    console.log(`[Webhook/Stripe] ✅ Payment successful:`, {
      email: customerEmail,
      amount: session.amount_total,
      siteUrl: siteUrl,
      sessionId: session.id,
    });

  } catch (dbErr) {
    console.error("[Webhook/Stripe] Database error:", dbErr);
    throw dbErr; // Re-throw to return 500 and trigger Stripe retry
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.warn(`[Webhook/Stripe] Payment failed: ${paymentIntent.id}`);

  const lastError = paymentIntent.last_payment_error;
  console.warn(`[Webhook/Stripe] Failure reason:`, {
    code: lastError?.code,
    message: lastError?.message,
    type: lastError?.type,
  });

  // You could send an email to the user here, or log for analytics
}
