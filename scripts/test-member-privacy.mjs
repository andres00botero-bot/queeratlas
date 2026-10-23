import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizeSharedProfile, sharedProfilePreview, validSharedAlias } from "../src/lib/memberPrivacyModel.js";

assert.equal(normalizeSharedProfile({ audience: "public", share_city: "true" }).audience, "hidden");
assert.equal(normalizeSharedProfile({ share_city: "true" }).share_city, false);
assert.deepEqual(sharedProfilePreview({ alias: "AtlasFox", discovery_city: "Berlin", shared_pronouns: "they", phone: "private" }), {
  alias: "AtlasFox", bio: "", discovery_city: "", shared_pronouns: "", share_avatar: false,
});
assert.equal(validSharedAlias("person@example.com"), false);
assert.equal(validSharedAlias("a\n"), false);
assert.equal(validSharedAlias("AtlasFox"), true);

// Exercise the actual client helper with a stalled external dependency. An abort
// alone does not bound time spent waiting for the auth SDK before fetch begins.
const clientSource = await readFile(new URL("../src/lib/memberPrivacy.js",import.meta.url),"utf8");
const stalledClientSource = clientSource.replace('import { supabase } from "@/lib/supabase";',
  'const supabase={rpc:()=>({abortSignal:()=>new Promise(()=>{})})};');
assert.notEqual(stalledClientSource,clientSource);
const stalledClient = await import(`data:text/javascript;base64,${Buffer.from(stalledClientSource).toString("base64")}`);
await assert.rejects(stalledClient.privacyCall("state"),/privacy_unavailable/);

// Run the real migration in PostgreSQL/WASM. No production users or credentials.
// Dependency is isolated in ignored node_modules cache, never in the app bundle.
const { PGlite } = await import("../node_modules/.cache/privacy-test-runtime/package/dist/index.js");
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema auth; create schema storage;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema auth,storage,public to anon,authenticated;
  grant execute on function auth.uid() to anon,authenticated;
  create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz);
  create table public.member_profiles(user_id uuid primary key references auth.users on delete cascade,
    display_name text,visibility text default 'members',avatar_path text,phone text,home_city text);
  create table public.qa_member_profile_memories(user_id uuid references auth.users on delete cascade,image_url text);
  create table public.member_favorites(user_id uuid,place_id integer);
  create table public.member_plans(user_id uuid,title text);
  create table public.member_following(follower_user_id uuid,followed_user_id uuid);
  create table public.qa_presence(user_id uuid,is_online boolean,last_seen_at timestamptz);
  create table public.qa_dm_threads(id uuid primary key default gen_random_uuid(),user_a uuid,user_b uuid,updated_at timestamptz default now(),unique(user_a,user_b));
  create table public.qa_dm_messages(id bigserial primary key,thread_id uuid,sender_id uuid,body text,created_at timestamptz default now());
  create function public.qa_can_open_dm(uuid) returns boolean language sql as $$ select false $$;
  create function public.qa_is_admin() returns boolean language sql as $$ select false $$;
  alter table public.qa_dm_threads enable row level security;
  alter table public.qa_dm_messages enable row level security;
  create policy legacy_dm_read on public.qa_dm_threads for select to authenticated using(true);
  create policy legacy_message_read on public.qa_dm_messages for select to authenticated using(true);
  create table public.qa_dm_thread_state(thread_id uuid,user_id uuid,blocked boolean);
  create table public.qa_private_events(id uuid primary key,host_user_id uuid);
  create table public.qa_private_event_invites(id uuid primary key,event_id uuid,requester_user_id uuid);
  create table public.community_topics(id uuid primary key,user_id uuid);
  create table public.community_messages(id uuid primary key,topic_id uuid,user_id uuid);
  alter table public.community_topics enable row level security;
  alter table public.community_messages enable row level security;
  create policy public_topics on community_topics for all to authenticated using(true) with check(true);
  create policy public_messages on community_messages for all to authenticated using(true) with check(true);
  alter table public.qa_private_events enable row level security;
  alter table public.qa_private_event_invites enable row level security;
  create policy legacy_event_read on qa_private_events for select to authenticated using(true);
  create policy legacy_invite_read on qa_private_event_invites for select to authenticated using(true);
  create table storage.buckets(id text primary key,public boolean);
  create table storage.objects(bucket_id text,name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
  insert into storage.buckets values('member-avatars',true),('member-memories',true),('other',true);
  create policy broad_read on storage.objects for select to anon,authenticated using(true);
  create policy broad_write on storage.objects for all to authenticated using(true) with check(true);
  create policy broad_profiles on member_profiles for all to authenticated using(true) with check(true);
  grant all on all tables in schema public,storage to authenticated;
  grant select on all tables in schema public,storage to anon;
  create view qa_member_leaderboard as select user_id,display_name from member_profiles;
  grant select on qa_member_leaderboard to authenticated,anon;
  create function qa_search_members() returns setof uuid language sql security definer as $$ select user_id from member_profiles $$;
  grant execute on function qa_search_members() to authenticated,anon;
  create function qa_apply_content_policies(target_table text) returns void language plpgsql security definer as $$ begin execute format('grant select on %s to authenticated',target_table); end $$;
`);
const migration = await readFile(new URL("../supabase/member-privacy-v1.sql", import.meta.url), "utf8");
await db.exec(migration);
const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const C = "00000000-0000-4000-8000-000000000003";
const D = "00000000-0000-4000-8000-000000000004";
await db.query(`insert into auth.users values ($1,now(),null),($2,now(),null),($3,now(),null),($4,null,null)`, [A,B,C,D]);
await db.query(`insert into member_profiles(user_id,display_name,phone,home_city,avatar_path)
  values($1::uuid,'Legal Name A','secret','Home A',$1::text||'/avatar.jpg'),($2::uuid,'Legal Name B','secret','Home B',$2::text||'/avatar.jpg'),($3::uuid,'Legal Name C','secret','Home C',$3::text||'/avatar.jpg')`,[A,B,C]);
await db.query(`insert into storage.objects values('member-avatars',$1::text||'/avatar.jpg'),('member-avatars',$1::text||'/memories/private.jpg'),('member-avatars',$2::text||'/avatar.jpg'),('other','public.jpg')`,[B,A]);
async function as(uid, sql, args=[]) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid || ""]);
  await db.exec(uid ? "set role authenticated" : "set role anon");
  return db.query(sql,args);
}
async function rpc(uid,name,args=[]) {
  const placeholders=args.map((_,i)=>`$${i+1}`).join(",");
  return (await as(uid,`select public.qa_privacy_${name}(${placeholders}) as value`,args)).rows.map(r=>r.value);
}
await assert.rejects(as(A,"insert into storage.objects values('member-avatars',$1)",[`${B}/injected.jpg`]),/row-level security/);
await as(A,"insert into storage.objects values('member-avatars',$1)",[`${A}/own-upload.jpg`]);
assert.equal((await as(A,"update storage.objects set name=$1 where name=$2 returning name",[`${A}/stolen.jpg`,`${B}/avatar.jpg`])).rows.length,0);
assert.equal((await as(A,"delete from storage.objects where name=$1 returning name",[`${B}/avatar.jpg`])).rows.length,0);
assert.equal((await as(null,"select * from member_profiles").catch(()=>({rows:[]}))).rows.length,0);
await assert.rejects(as(A,"select * from qa_member_leaderboard"),/permission denied/);
await assert.rejects(as(A,"select * from qa_search_members()"),/permission denied/);
await assert.rejects(as(A,"select qa_apply_content_policies('qa_member_privacy')"),/permission denied/);
await assert.rejects(rpc(A,"search",["","",0]),/community_unavailable/);
await assert.rejects(rpc(D,"join",[true,true]),/confirmed_email_required/);
await assert.rejects(rpc(A,"join",[false,true]),/consent_required/);
for(const uid of [A,B,C]) {
  const [state]=await rpc(uid,"state");
  assert.equal(state.profile.audience,"hidden");
  await rpc(uid,"join",[true,true]);
}
await db.exec("reset role; update qa_privacy_rollout set directory_open=true");
await rpc(A,"save",[{audience:"hidden",alias:"Atlas A"}]);
await rpc(B,"save",[{audience:"community",alias:"Atlas B",bio:"A shared introduction",share_avatar:true,discovery_city:"Interest city",share_city:false}]);
const results=await rpc(A,"search",["","",0]);
assert.equal(results.length,1);
assert.equal(results[0].alias,"Atlas B");
assert.equal(results[0].discovery_city,"");
assert.equal("home_city" in results[0],false);
assert.equal("phone" in results[0],false);
assert.equal("last_seen_at" in results[0],false);
assert.equal((await as(A,"select * from member_profiles")).rows.length,1);
assert.equal((await as(A,"select * from member_profiles where user_id=$1",[B])).rows.length,0);
await as(A,"update member_profiles set home_city='Owner edit' where user_id=$1",[A]);
assert.equal((await as(A,"select home_city from member_profiles where user_id=$1",[A])).rows[0].home_city,'Owner edit');
assert.equal((await as(A,"update member_profiles set phone='Must not change' where user_id=$1 returning user_id",[B])).rows.length,0);
assert.equal((await rpc(A,"profile",[C]))[0],null);
await db.exec("reset role");
await db.query("insert into member_following values($1,$2)",[C,B]);
await rpc(B,"save",[{audience:"contacts",alias:"Atlas B",share_avatar:true}]);
assert.equal((await rpc(C,"profile",[B]))[0],null,"One-way following must not grant access");
await rpc(B,"save",[{audience:"community",alias:"Atlas B",share_avatar:true}]);
await rpc(A,"contact",[B,"request"]);
await rpc(B,"contact",[A,"accept"]);
await rpc(B,"save",[{audience:"contacts",alias:"Atlas B",share_avatar:true}]);
assert.equal((await rpc(A,"profile",[B]))[0].alias,"Atlas B");
await rpc(A,"send",[B,"Synthetic private message"]);
await assert.rejects(as(A,"update qa_dm_threads set user_b=$1",[C]),/permission denied/);
assert.equal((await rpc(B,"messages",[A]))[0].body,"Synthetic private message");
await assert.rejects(rpc(C,"messages",[A]),/unavailable/);
await db.exec("reset role");
await db.query("insert into qa_private_events values($1,$2)",[D,B]);
await db.query("insert into qa_private_event_invites values($1,$2,$3)",[D,D,A]);
assert.equal((await as(A,"select * from qa_private_event_invites")).rows.length,1);
assert.equal((await as(C,"select * from qa_private_event_invites")).rows.length,0,"Unrelated accounts cannot read event requests");
const files=(await as(A,"select name from storage.objects where bucket_id='member-avatars'")).rows;
assert(files.some(r=>r.name===`${B}/avatar.jpg`));
assert(!files.some(r=>r.name===`${B}/memories/private.jpg`));
assert.equal((await as(C,"select name from storage.objects where bucket_id='member-avatars' and name=$1",[`${B}/avatar.jpg`])).rows.length,0);
await rpc(A,"block",[B,true]);
await db.exec("reset role");
await db.query("insert into community_topics values($1,$2)",[D,B]);
assert.equal((await as(A,"select * from community_topics")).rows.length,0);
assert.equal((await as(C,"select * from community_topics")).rows.length,1);
await assert.rejects(as(A,"insert into community_messages values($1,$2,$3)",[D,D,A]),/row-level security/);
assert.equal((await as(A,"select * from qa_private_event_invites")).rows.length,0);
assert.equal((await as(A,"select * from qa_private_events")).rows.length,0);
await assert.rejects(rpc(B,"send",[A,"Must not send"]),/unavailable/);
assert.equal((await as(B,"select * from qa_dm_messages")).rows.length,0);
assert.equal((await rpc(A,"profile",[B]))[0],null);
assert.equal((await rpc(B,"profile",[A]))[0],null);
assert.equal((await as(A,"select name from storage.objects where name=$1",[`${B}/avatar.jpg`])).rows.length,0);
await assert.rejects(rpc(B,"contact",[A,"request"]),/unavailable/);
await rpc(A,"block",[B,false]);
assert.equal((await rpc(A,"profile",[B]))[0],null,"Unblocking must not re-approve contacts");
await rpc(A,"report",[B,"outing","Synthetic test report"]);
await assert.rejects(as(B,"select * from qa_member_privacy_reports"),/permission denied/);
await rpc(B,"request_deletion");
await assert.rejects(rpc(B,"erase_private_atlas",[A]),/permission denied/);
await db.exec("reset role");
await db.query("insert into member_favorites values($1,1),($2,2)",[A,B]);
await db.query("insert into member_plans values($1,'Retain'),($2,'Erase')",[A,B]);
await db.exec("set role service_role");
await assert.rejects(db.query("select qa_privacy_erase_private_atlas($1)",[A]),/deletion_not_requested/);
await db.query("select qa_privacy_erase_private_atlas($1)",[B]);
await db.exec("reset role");
assert.deepEqual((await db.query("select user_id from member_favorites")).rows,[{user_id:A}]);
assert.deepEqual((await db.query("select user_id from member_plans")).rows,[{user_id:A}]);
assert.equal((await rpc(C,"profile",[B]))[0],null);
await assert.rejects(rpc(B,"save",[{audience:"community",alias:"Atlas B"}]),/community_unavailable|deletion_pending/);
await db.exec("reset role; update qa_privacy_rollout set directory_open=false");
await assert.rejects(rpc(A,"search",["","",0]),/community_unavailable/);
await rpc(A,"save",[{audience:"hidden",alias:"Atlas A"}]);
assert.equal((await as(null,"select name from storage.objects where bucket_id='member-avatars'")).rows.length,0);
// Reapplication must not reopen discovery or reset explicit consent.
await db.exec("reset role");
await db.exec(migration);
assert.equal((await rpc(A,"state"))[0].directory_open,false);
await db.exec("reset role; alter table auth.users add column email text; alter table auth.users add column raw_user_meta_data jsonb;");
await db.exec(await readFile(new URL("../supabase/member-privacy-verify-transaction.sql",import.meta.url),"utf8"));
assert.equal((await db.query("select count(*)::integer as n from auth.users")).rows[0].n,4,"Transaction verification must not retain synthetic identities");
await db.close();
console.log("Member privacy: model, real SQL migration, raw RLS, legacy RPC revocation, approved contacts, both-way blocking, avatar isolation, deletion and closed rollout passed.");
