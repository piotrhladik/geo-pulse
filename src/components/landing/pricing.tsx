"use client";

import { motion } from "framer-motion";
import { Check, Star, Zap, Shield, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Quick preview of your AI visibility",
    features: [
      "3 free audits per month",
      "Basic GEO Score",
      "Top 3 AI gaps identified",
      "Limited recommendations",
    ],
    limitations: [
      "No JSON-LD download",
      "No full report",
    ],
    cta: "Start Free",
    highlighted: false,
    action: "scroll",
  },
  {
    name: "Pro Audit",
    price: "$29",
    period: "one-time",
    description: "Complete AI visibility audit & fixes",
    features: [
      "Unlimited audits forever",
      "Full GEO Score breakdown",
      "Complete JSON-LD schema (copy & download)",
      "All AI gaps with priorities",
      "Multi-LLM visibility report",
      "Actionable recommendations",
      "ChatGPT, Perplexity, Gemini analysis",
    ],
    cta: "Get Full Report",
    highlighted: true,
    action: "checkout",
  },
  {
    name: "Agency",
    price: "$199",
    period: "one-time",
    description: "For agencies managing multiple clients",
    features: [
      "Everything in Pro",
      "10 client domains",
      "White-label PDF reports",
      "Bulk JSON-LD generation",
      "Priority email support",
      "API access (coming soon)",
    ],
    cta: "Contact Us",
    highlighted: false,
    action: "contact",
  },
];

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (planName: string, action: string) => {
    if (action === "scroll") {
      const el = document.getElementById("scanner");
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (action === "contact") {
      window.location.href = "mailto:hello@geopulse.ai?subject=Agency%20Plan%20Inquiry";
      return;
    }

    if (action === "checkout") {
      setLoading(planName);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "pro_audit" }),
        });

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("[Pricing] No URL returned:", data);
          alert(
            data.message ||
              "Payment system is not configured. Please try again later."
          );
        }
      } catch (err) {
        console.error("[Pricing] Checkout error:", err);
        alert("Failed to start checkout. Please try again.");
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <section id="pricing" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm">
            <Shield className="h-4 w-4" />
            <span>100% Money-Back Guarantee</span>
          </div>

          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl sm:text-4xl font-bold mb-4">
            Simple, One-Time <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            No subscriptions. No hidden fees. Pay once, use forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <GlassCard
              key={plan.name}
              delay={i * 0.15}
              hoverGlow
              className={
                plan.highlighted
                  ? "border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.1)] relative"
                  : ""
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Star className="h-3 w-3" />
                  Best Value
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-zinc-100">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-zinc-500 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <ul className="space-y-2 mb-6 pt-4 border-t border-zinc-800">
                  {plan.limitations.map((limitation) => (
                    <li
                      key={limitation}
                      className="flex items-start gap-2 text-sm text-zinc-500"
                    >
                      <span className="text-zinc-600">✕</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => handleAction(plan.name, plan.action)}
                disabled={loading === plan.name}
                className={
                  plan.highlighted
                    ? "glow-button w-full text-center text-sm flex items-center justify-center gap-2"
                    : "w-full py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-600 transition-all text-sm font-medium flex items-center justify-center gap-2"
                }
              >
                {loading === plan.name ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : plan.highlighted ? (
                  <>
                    <Zap className="h-4 w-4" />
                    {plan.cta}
                  </>
                ) : (
                  plan.cta
                )}
              </button>
            </GlassCard>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-zinc-600 text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure Payment via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💳</span>
            <span>All Major Cards Accepted</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
