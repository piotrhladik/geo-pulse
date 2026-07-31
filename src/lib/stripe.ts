import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe client (lazy — only throws when actually used without key)
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    })
  : null;

// Pricing configuration (one-time payment)
export const PRICING = {
  proAudit: {
    name: "GEO Pulse Pro Audit",
    description: "Full AI visibility report with JSON-LD schema",
    amount: 2900, // $29.00 in cents
    currency: "usd",
  },
} as const;

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return stripe !== null;
}

/**
 * Format amount for display
 */
export function formatPrice(amountInCents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}
