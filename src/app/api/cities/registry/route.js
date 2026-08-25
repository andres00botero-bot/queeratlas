import { NextResponse } from "next/server";
import { listCityRegistry } from "@/lib/server/cityRegistry";

export async function GET() {
  const cities = await listCityRegistry();
  return NextResponse.json({ cities }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
