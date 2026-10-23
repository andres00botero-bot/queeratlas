import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getTelemetryServiceClient } from "@/lib/telemetry/serverSupabase";

export const dynamic = "force-dynamic";
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function removeOwnedFiles(client, bucket, owner) {
  const paths = [];
  const walk = async (prefix) => {
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 100, offset });
      if (error) throw error;
      for (const entry of data || []) {
        const path = `${prefix}/${entry.name}`;
        if (!path.startsWith(`${owner}/`) || entry.name.includes("/") || entry.name === "..") throw new Error("invalid_path");
        if (entry.id) paths.push(path); else await walk(path);
      }
      if ((data || []).length < 100) break;
    }
  };
  await walk(owner);
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await client.storage.from(bucket).remove(paths.slice(index, index + 100));
    if (error) throw error;
  }
}

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "forbidden" }, 403);
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  if (!token) return reply({ error: "not_authenticated" }, 401);
  const body = await request.json().catch(() => null);
  if (body?.confirmation !== "DELETE") return reply({ error: "confirmation_required" }, 400);
  let hidden = false;
  try {
    const service = getTelemetryServiceClient();
    const { data: identity, error } = await service.auth.getUser(token);
    if (error || !identity?.user?.id) return reply({ error: "not_authenticated" }, 401);
    // getUser validates the token before its authentication-method claims are used.
    const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    const recent = Array.isArray(claims.amr) && claims.amr.some(method =>
      Number(method.timestamp) > Date.now() / 1000 - 600 && Number(method.timestamp) <= Date.now() / 1000 + 30);
    if (!recent) return reply({ error: "recent_login_required" }, 403);
    const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: hideError } = await userClient.rpc("qa_privacy_request_deletion");
    if (hideError) return reply({ error: "privacy_unavailable" }, 503);
    hidden = true;
    const { data: buckets, error: bucketError } = await service.storage.listBuckets();
    if (bucketError) throw bucketError;
    for (const bucket of buckets || []) {
      if (["member-avatars", "member-memories"].includes(bucket.id)) await removeOwnedFiles(service, bucket.id, identity.user.id);
    }
    const { error: eraseError } = await service.rpc("qa_privacy_erase_private_atlas", { target: identity.user.id });
    if (eraseError) throw eraseError;
    // Project-specific tables and retained records must also be verified in staging.
    // On failure the account remains hidden/pending; never claim erasure succeeded.
    const result = await service.auth.admin.deleteUser(identity.user.id);
    if (result.error) throw result.error;
    return reply({ deleted: true });
  } catch {
    return reply({ error: "deletion_unavailable", hidden }, 503);
  }
}
