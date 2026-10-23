import { NextResponse } from "next/server";
import { getTelemetryServiceClient } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";
export async function GET(request) {
  const secret=process.env.CRON_SECRET;
  if(!secret || request.headers.get("authorization")!==`Bearer ${secret}`) {
    return NextResponse.json({error:"unauthorized"},{status:401,headers:{"Cache-Control":"no-store"}});
  }
  try {
    const {error}=await getTelemetryServiceClient().rpc("qa_privacy_prune");
    if(error)throw error;
    return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  } catch {
    // Only an operational category, never report contents or member identifiers.
    console.error("member_privacy_retention_failed");
    return NextResponse.json({error:"retention_unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
