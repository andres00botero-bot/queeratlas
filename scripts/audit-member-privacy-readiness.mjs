// Metadata only. No member rows or credentials are printed or exported.
import { createClient } from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error("Supabase service configuration is missing");
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const tables=["qa_member_privacy","qa_member_contacts","qa_member_blocks","qa_member_privacy_reports","qa_privacy_rollout"];
for(const table of tables){
  // GET with an empty range preserves schema errors that some HEAD proxies hide.
  // No member rows or aggregate member counts are retrieved.
  const {error,status}=await client.from(table).select("*").limit(0);
  console.log(`${table}: ${error||status>=400?`unavailable (${error?.code||status||'network'})`:'present'}`);
}
const {data:buckets,error}=await client.storage.listBuckets();
if(error)console.log("Member-image storage: metadata unavailable");
else for(const b of buckets.filter(b=>/member|avatar|memor/i.test(b.id)))console.log(`Storage ${b.id}: ${b.public?'PUBLIC':'private'}`);
const {error:rpcError}=await client.rpc("qa_privacy_state");
console.log(`Privacy RPC: ${rpcError?.message==='not_authenticated'?'installed, requires user session':rpcError?`unavailable (${rpcError.code||'network'})`:'unexpected service response; investigate'}`);
console.log("RLS policies, grants, triggers and cross-schema SECURITY DEFINER functions still require a SQL-level audit. Table existence is not proof of protection.");
