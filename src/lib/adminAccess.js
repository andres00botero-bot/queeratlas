import { supabase } from "./supabase";

function normalizeAuthEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function resolveAdminAccess({ client = supabase, email = "" } = {}) {
  const normalizedEmail = normalizeAuthEmail(email);
  let rpcError = null;

  try {
    const rpcRes = await client.rpc("qa_is_admin");
    if (!rpcRes?.error) {
      return { isAdmin: Boolean(rpcRes?.data), source: "rpc", error: null };
    }
    rpcError = rpcRes.error;
  } catch (error) {
    rpcError = error;
  }

  if (!normalizedEmail) {
    return { isAdmin: false, source: "none", error: rpcError };
  }

  try {
    const { data, error } = await client
      .from("qa_admin_users")
      .select("email")
      .ilike("email", normalizedEmail)
      .limit(1);

    if (error) {
      return { isAdmin: false, source: "table", error };
    }

    return { isAdmin: (data || []).length > 0, source: "table", error: null };
  } catch (error) {
    return { isAdmin: false, source: "table", error };
  }
}

