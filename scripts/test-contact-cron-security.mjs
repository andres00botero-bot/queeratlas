import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "../node_modules/.cache/privacy-test-runtime/package/dist/index.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema auth, public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create table public.contact_threads (user_id uuid, is_anonymous boolean not null default false);
  alter table public.contact_threads enable row level security;
  grant insert on public.contact_threads to anon, authenticated;
  create policy contact_threads_insert_public on public.contact_threads for insert to anon, authenticated with check (true);
`);
await db.exec(await read("supabase/contact-thread-identity-hardening-v1.sql"));
const own = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
await db.exec("set role anon");
await db.exec("insert into public.contact_threads (user_id, is_anonymous) values (null, true)");
await assert.rejects(db.exec(`insert into public.contact_threads (user_id) values ('${other}')`), /row-level security/i);
await db.exec("reset role; set role authenticated");
await db.query("select set_config('request.jwt.claim.sub', $1, false)", [own]);
await db.exec(`insert into public.contact_threads (user_id) values ('${own}')`);
await assert.rejects(db.exec(`insert into public.contact_threads (user_id) values ('${other}')`), /row-level security/i);
await assert.rejects(db.exec(`insert into public.contact_threads (user_id, is_anonymous) values ('${own}', true)`), /row-level security/i);
await db.close();

const responseShim = `const NextResponse={json:(body,options={})=>Response.json(body,options)};`;
let contact = await read("src/app/api/contact/route.js");
contact = contact.replace('import { NextResponse } from "next/server";', responseShim)
  .replace('import { createClient } from "@supabase/supabase-js";', `
    const createClient = () => globalThis.__contactTestClient;
  `);
const { POST } = await import(`data:text/javascript;base64,${Buffer.from(contact).toString("base64")}`);
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
let inserted;
globalThis.__contactTestClient = {
  auth: { getUser: async (token) => token === "valid" ? { data: { user: { id: own } } } : { error: new Error("invalid") } },
  from: () => ({ insert: (rows) => { inserted = rows[0]; return { select: () => ({ single: async () => ({ data: { id: own } }) }) }; } }),
};
const submit = (body, token) => POST(new Request("https://example.invalid/api/contact", {
  method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify({ category: "general_feedback", subject: "Feedback", message: "This is a sufficiently long test message.", ...body }),
}));
assert.equal((await submit({ userId: other })).status, 200);
assert.equal(inserted.user_id, null);
assert.equal((await submit({ userId: other }, "valid")).status, 200);
assert.equal(inserted.user_id, own);
assert.equal((await submit({ isAnonymous: true }, "valid")).status, 200);
assert.equal(inserted.user_id, null);
assert.equal((await submit({}, "invalid")).status, 401);

for (const path of ["src/app/api/cron/calendar-reminders/route.js", "src/app/api/cron/prune-offgrid-events/route.js"]) {
  let source = await read(path);
  source = source.replace('import { NextResponse } from "next/server";', responseShim)
    .replace('import { createClient } from "@supabase/supabase-js";', "const createClient = () => ({ from: () => ({ select: async () => ({ data: [], error: null }) }) });");
  const { GET } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  process.env.CRON_SECRET = "test-secret";
  assert.equal((await GET(new Request("https://example.invalid", { headers: { "x-vercel-cron": "1" } }))).status, 401, path);
  const originalFetch = globalThis.fetch;
  process.env.CALENDAR_REMINDER_CRON_SECRET = "reminder-test-secret";
  globalThis.fetch = async () => Response.json({ ok: true });
  const authorized = await GET(new Request("https://example.invalid", { headers: { authorization: "Bearer test-secret" } }));
  assert.equal(authorized.status, 200, `Authorized cron must still run: ${path}`);
  globalThis.fetch = originalFetch;
  delete process.env.CRON_SECRET;
  assert.equal((await GET(new Request("https://example.invalid", { headers: { "x-vercel-cron": "1" } }))).status, 401, path);
}
console.log("Contact identity, database policy and cron authorization checks passed.");
