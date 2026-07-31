import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionByEmail, ensureUser } from "@/lib/subscription";

/**
 * GET /api/subscription?email=user@example.com
 * Check subscription status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      // No email = anonymous user with default free credits
      return NextResponse.json({
        isPro: false,
        plan: "free",
        credits: 3,
        canAudit: true,
        authenticated: false,
      });
    }

    const subscription = await getSubscriptionByEmail(email);

    if (!subscription) {
      // User doesn't exist yet — they have free credits
      return NextResponse.json({
        isPro: false,
        plan: "free",
        credits: 3,
        canAudit: true,
        authenticated: false,
      });
    }

    return NextResponse.json({
      ...subscription,
      authenticated: true,
    });
  } catch (err) {
    console.error("[API/subscription] Error:", err);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription
 * Create or ensure user exists
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email: string; name?: string };

    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await ensureUser(body.email, body.name);

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      isPro: user.isPro,
      plan: user.plan,
      credits: user.credits,
    });
  } catch (err) {
    console.error("[API/subscription] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
