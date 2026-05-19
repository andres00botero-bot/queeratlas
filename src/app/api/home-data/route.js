import { NextResponse } from "next/server";
import { fetchHomeDataPayload } from "@/lib/homeDataApi";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await fetchHomeDataPayload();

  return NextResponse.json(
    payload,
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
