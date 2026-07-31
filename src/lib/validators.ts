import { z } from "zod";

export const auditRequestSchema = z.object({
  siteUrl: z
    .string()
    .min(3, "URL is required")
    .refine(
      (val) => {
        try {
          new URL(val.startsWith("http") ? val : `https://${val}`);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL (e.g., example.com)" }
    ),
  brandName: z
    .string()
    .min(1, "Brand name is required")
    .max(255, "Brand name is too long"),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;
