import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL environment variable is missing" },
      { status: 500 }
    );
  }

  try {
    // Dynamiczny import zapobiega wywaleniu buildu przy braku zmiennych
    const { db } = await import("@/db");
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}