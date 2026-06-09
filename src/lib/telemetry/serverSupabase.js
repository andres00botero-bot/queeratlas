import "server-only";

import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

let serviceClient = null;

function getSupabaseUrl() {
  return String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
}

function getPublicSupabaseKey() {
  return String(
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ""
  ).trim();
}

function secureEqual(left = "", right = "") {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function getTelemetryServiceClient() {
  if (serviceClient) return serviceClient;

  const url = getSupabaseUrl();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) {
    throw new Error(
      "Server telemetry requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  serviceClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return serviceClient;
}

export function hasValidTelemetryKey(request) {
  const expected = String(process.env.QA_SEO_TELEMETRY_KEY || "").trim();
  const received = String(request.headers.get("x-qa-telemetry-key") || "").trim();
  return Boolean(expected && received && secureEqual(received, expected));
}

export async function hasAuthorizedSeoAdminRequest(request) {
  if (hasValidTelemetryKey(request)) return true;

  const authorization = String(request.headers.get("authorization") || "");
  const accessToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
  const url = getSupabaseUrl();
  const publicKey = getPublicSupabaseKey();
  if (!accessToken || !url || !publicKey) return false;

  const userClient = createClient(url, publicKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData?.user?.id) return false;

  const { data: isAdmin, error: adminError } = await userClient.rpc("qa_is_admin");
  return !adminError && Boolean(isAdmin);
}
