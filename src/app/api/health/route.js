import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  return NextResponse.json(
    {
      ok: true,
      service: "queer-atlas",
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - startedAt,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
