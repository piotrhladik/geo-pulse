"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hoverGlow = false,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={
        hoverGlow
          ? {
              borderColor: "rgba(139, 92, 246, 0.3)",
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.1)",
            }
          : undefined
      }
      className={cn("glass-card p-6", className)}
    >
      {children}
    </motion.div>
  );
}
