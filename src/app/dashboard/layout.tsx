import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — GEO Pulse AI",
  description: "Your AI visibility audit dashboard",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
