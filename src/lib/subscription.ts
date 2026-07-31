import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface SubscriptionStatus {
  isPro: boolean;
  plan: string;
  credits: number;
  canAudit: boolean;
  periodEnd: Date | null;
}

/**
 * Check subscription status by email
 */
export async function getSubscriptionByEmail(
  email: string
): Promise<SubscriptionStatus | null> {
  try {
    const userList = await db
      .select({
        isPro: users.isPro,
        plan: users.plan,
        credits: users.credits,
        periodEnd: users.stripeCurrentPeriodEnd,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userList.length === 0) {
      return null;
    }

    const user = userList[0];
    const isPro = user.isPro;
    const hasCredits = user.credits > 0 || user.credits === -1;

    return {
      isPro,
      plan: user.plan,
      credits: user.credits,
      canAudit: isPro || hasCredits,
      periodEnd: user.periodEnd,
    };
  } catch (err) {
    console.error("[Subscription] Error fetching status:", err);
    return null;
  }
}

/**
 * Decrement audit credits for free users
 * Returns true if successful, false if no credits left
 */
export async function useAuditCredit(email: string): Promise<boolean> {
  try {
    const userList = await db
      .select({ credits: users.credits, isPro: users.isPro })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userList.length === 0) {
      // Anonymous user — allow audit but don't track
      return true;
    }

    const user = userList[0];

    // Pro users have unlimited credits
    if (user.isPro) {
      return true;
    }

    // Check if free user has credits
    if (user.credits <= 0) {
      return false;
    }

    // Decrement credits
    await db
      .update(users)
      .set({
        credits: user.credits - 1,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    return true;
  } catch (err) {
    console.error("[Subscription] Error using credit:", err);
    return true; // Fail open — allow audit on error
  }
}

/**
 * Create or get user by email
 */
export async function ensureUser(email: string, name?: string) {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(users)
      .values({
        email,
        name: name || null,
        plan: "free",
        isPro: false,
        credits: 3,
      })
      .returning();

    return inserted[0];
  } catch (err) {
    console.error("[Subscription] Error ensuring user:", err);
    return null;
  }
}
