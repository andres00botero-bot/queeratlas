import { NextResponse } from "next/server";
import { getTelemetryServiceClient, hasAuthorizedSeoAdminRequest } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(request) {
  if(!await hasAuthorizedSeoAdminRequest(request))return reply({error:"forbidden"},403);
  const service=getTelemetryServiceClient();
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";
  const {data:identity}=await service.auth.getUser(token);
  if(!identity?.user?.id)return reply({error:"forbidden"},403);
  const {error:auditError}=await service.from("qa_member_privacy_audit").insert({actor:identity.user.id,action:"review_queue_access"});
  if(auditError)return reply({error:"audit_unavailable"},503);
  const [reports,deletions]=await Promise.all([
    service.from("qa_member_privacy_reports").select("id,target_id,reason,details,status,created_at").order("created_at",{ascending:false}).limit(50),
    service.from("qa_member_privacy").select("user_id,deletion_requested_at").not("deletion_requested_at","is",null).order("deletion_requested_at").limit(50),
  ]);
  if(reports.error||deletions.error)return reply({error:"privacy_unavailable"},503);
  return reply({reports:reports.data||[],deletions:deletions.data||[]});
}
export async function POST(request) {
  if(!await hasAuthorizedSeoAdminRequest(request))return reply({error:"forbidden"},403);
  const body=await request.json().catch(()=>null);
  if(!/^[0-9a-f-]{36}$/i.test(body?.id||"")||!["new","reviewing","closed"].includes(body?.status))return reply({error:"invalid_request"},400);
  const service=getTelemetryServiceClient();
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";
  const {data}=await service.auth.getUser(token);
  if(!data?.user?.id)return reply({error:"forbidden"},403);
  const {error}=await service.rpc("qa_privacy_review_report",{report:body.id,new_status:body.status,operator_id:data.user.id});
  return error?reply({error:"update_failed"},503):reply({ok:true});
}
