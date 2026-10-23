import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createAdminMembersHandlers } from "../src/lib/adminMembersServer.js";

const uid = index => `00000000-0000-4000-8000-${String(index).padStart(12,"0")}`;
const accounts = Array.from({length:1205},(_,index)=>({
  id:uid(index+1),email:`synthetic-${index}@example.invalid`,created_at:"2026-10-23T00:00:00Z",
  email_confirmed_at:index%2?null:"2026-10-23T00:00:00Z",identities:[{secret:"never return"}],app_metadata:{role:"never return"},
}));
const profiles = new Map([[uid(1),{user_id:uid(1),display_name:"Keep this name",trusted_contributor:false,phone:"never return"}]]);
const privacy = [{user_id:uid(1),audience:"hidden"}];
const audit=[];
let serviceAccesses=0, authorized=true, auditFails=false, authFails=false;
const service={
  auth:{admin:{
    listUsers:async({page,perPage})=>authFails?{error:new Error("internal secret")}:{data:{users:accounts.slice((page-1)*perPage,page*perPage),total:accounts.length,nextPage:1}},
    getUserById:async id=>({data:{user:accounts.find(account=>account.id===id)}}),
  }},
  from(table){
    let filter, value, operation;
    const query={
      select(){return query;},
      in(_key,ids){return Promise.resolve({data:table==="member_profiles"?[...profiles.values()].filter(row=>ids.includes(row.user_id)):privacy.filter(row=>ids.includes(row.user_id))});},
      eq(_key,id){filter=id;return query;},
      maybeSingle:async()=>({data:profiles.get(filter)||null}),
      update(payload){value=payload;operation="update";return query;},
      insert(payload){
        if(table==="qa_member_privacy_audit"){
          audit.push(payload);return Promise.resolve({error:auditFails?new Error("audit unavailable"):null});
        }
        value=payload;operation="insert";return query;
      },
      async single(){
        if(operation==="insert")profiles.set(value.user_id,{...value});
        else profiles.set(filter,{...profiles.get(filter),...value});
        return {data:{user_id:filter||value.user_id},error:null};
      },
    };
    return query;
  },
};
const handlers=createAdminMembersHandlers({authorize:async()=>authorized?{id:uid(9999)}:null,getService:()=>{serviceAccesses++;return service;}});
const get=page=>new Request(`https://atlas.test/api/admin/members?page=${page}`);
const patch=(body,origin="https://atlas.test")=>new Request("https://atlas.test/api/admin/members",{method:"PATCH",headers:{"Content-Type":"application/json",origin},body:JSON.stringify(body)});
authorized=false;
assert.equal((await handlers.GET(get(1))).status,403);
assert.equal((await handlers.PATCH(patch({user_id:uid(1),trusted_contributor:true}))).status,403);
assert.equal(serviceAccesses,0,"No privileged reads/writes before server authorization");
authorized=true;
for(const page of [0,-1,1.5,"not-a-page"] )assert.equal((await handlers.GET(get(page))).status,400);
const all=[];
let page=1;
while(page){
  const response=await handlers.GET(get(page));
  assert.equal(response.status,200);
  assert.match(response.headers.get("cache-control"),/no-store/);
  const data=await response.json();
  assert.equal(data.total,1205);
  assert(!JSON.stringify(data).includes("never return"),"No raw Auth/profile metadata in response");
  all.push(...data.members);page=data.nextPage;
}
assert.equal(all.length,1205,"All accounts beyond the former 250-row limit must be reachable");
assert.equal(new Set(all.map(row=>row.user_id)).size,1205);
assert.equal(all[0].audience,"hidden","Hidden accounts are included for admin");
assert.equal(all[1].has_profile,false,"Auth-only accounts must be included");
assert.equal(all[1].email_confirmed,false,"Unconfirmed accounts must be included");
assert(audit.length>=13,"Each page read is audited, including two-digit page numbers");
assert.equal((await handlers.PATCH(patch({user_id:uid(1),trusted_contributor:true,role:"admin"}))).status,400);
assert.equal((await handlers.PATCH(patch({user_id:uid(1),trusted_contributor:true},"https://other.test"))).status,403);
assert.equal((await handlers.PATCH(patch({user_id:uid(999999),trusted_contributor:true}))).status,404);
assert.equal((await handlers.PATCH(patch({user_id:uid(1),trusted_contributor:true}))).status,200);
assert.equal(profiles.get(uid(1)).display_name,"Keep this name");
assert.equal(profiles.get(uid(1)).trusted_contributor,true);
assert.equal((await handlers.PATCH(patch({user_id:uid(2),trusted_contributor:true}))).status,200);
assert.equal(profiles.get(uid(2)).trusted_contributor,true,"Admin can provision publishing for Auth-only accounts");
auditFails=true;
assert.equal((await handlers.PATCH(patch({user_id:uid(1),trusted_contributor:false}))).status,503);
assert.equal(profiles.get(uid(1)).trusted_contributor,true,"Failed audit prevents mutation");
assert.equal((await handlers.GET(get(1))).status,503);
auditFails=false;authFails=true;
const failure=await handlers.GET(get(1));
assert.equal(failure.status,503);
assert(!JSON.stringify(await failure.json()).includes("internal secret"));
// Test the actual shared authorization helper with mocked transport only.
// Client-side roles and truthy non-boolean RPC responses must not grant admin.
const guardSource = (await readFile(new URL("../src/lib/telemetry/serverSupabase.js",import.meta.url),"utf8"))
  .replace('import "server-only";','')
  .replace('import { createClient } from "@supabase/supabase-js";',`
    let scenario;
    export function scenarioForTest(value){scenario=value;}
    const createClient=()=>({auth:{getUser:async()=>scenario.identity},rpc:async()=>scenario.rpc});
  `);
const guard = await import(`data:text/javascript;base64,${Buffer.from(guardSource).toString("base64")}`);
process.env.NEXT_PUBLIC_SUPABASE_URL="https://synthetic.example.invalid";
process.env.NEXT_PUBLIC_SUPABASE_KEY="synthetic-public-key";
const guardRequest = new Request("https://atlas.test/api/admin/members",{headers:{Authorization:"Bearer synthetic-token"}});
for(const rpcValue of [false,"true",{role:"admin"},[]]) {
  guard.scenarioForTest({identity:{data:{user:{id:uid(1),app_metadata:{role:"admin"}}}},rpc:{data:rpcValue,error:null}});
  assert.equal(await guard.getAuthorizedSeoAdminUser(guardRequest),null);
}
guard.scenarioForTest({identity:{data:{user:{id:uid(1)}}},rpc:{data:true,error:null}});
assert.equal((await guard.getAuthorizedSeoAdminUser(guardRequest)).id,uid(1));
guard.scenarioForTest({identity:{data:{user:null},error:new Error("invalid session")},rpc:{data:true,error:null}});
assert.equal(await guard.getAuthorizedSeoAdminUser(guardRequest),null);
console.log("Admin members: server authorization, 1205 accounts, hidden/Auth-only accounts, safe projection, audit, publishing updates and failure states passed.");
