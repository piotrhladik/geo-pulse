/** Merge class names — simple utility without clsx dependency */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a date for display */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Return a color class based on GEO score */
export function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

/** Return a gradient style based on GEO score */
export function scoreGradient(score: number): string {
  if (score >= 70) return "from-emerald-500 to-teal-400";
  if (score >= 45) return "from-amber-500 to-orange-400";
  return "from-red-500 to-rose-400";
}

/** Normalize URL for display */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
