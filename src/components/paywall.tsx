"use client";

import { motion } from "framer-motion";
import { Lock, Zap, Check, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface PaywallProps {
  creditsUsed?: number;
  totalCredits?: number;
}

export function Paywall({ creditsUsed = 3, totalCredits = 3 }: PaywallProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Failed to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("[Paywall] Checkout error:", err);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const proFeatures = [
    "Unlimited GEO audits",
    "Full JSON-LD schema downloads",
    "Multi-engine visibility reports",
    "Historical tracking & analytics",
    "Priority recommendations",
    "API access",
    "Email support",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center px-6"
    >
      <div className="max-w-lg w-full">
        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.1 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-8 border border-violet-500/20"
        >
          <Lock className="h-10 w-10 text-violet-400" />
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="font-[family-name:var(--font-fraunces)] text-2xl sm:text-3xl font-bold mb-4">
            You&apos;ve Used All Free Audits
          </h2>
          <p className="text-zinc-400 mb-2">
            You&apos;ve completed{" "}
            <span className="text-violet-400 font-medium">
              {creditsUsed}/{totalCredits}
            </span>{" "}
            free audits this month.
          </p>
          <p className="text-zinc-500 text-sm">
            Upgrade to Pro for unlimited audits and full access to all features.
          </p>
        </motion.div>

        {/* Pro Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 border-violet-500/20 relative overflow-hidden"
        >
          {/* Popular badge */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-b-lg">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </div>

          <div className="pt-4">
            {/* Pricing */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-white">$49</span>
              <span className="text-zinc-500">/month</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-zinc-300"
                >
                  <div className="h-5 w-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-violet-400" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="glow-button w-full flex items-center justify-center gap-2 text-base disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Zap className="h-5 w-5" />
                  </motion.div>
                  Processing...
                </span>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Upgrade to Pro
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Trust text */}
            <p className="text-xs text-zinc-600 text-center mt-4">
              Cancel anytime • Secure payment via Stripe
            </p>
          </div>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <a
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to homepage
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
