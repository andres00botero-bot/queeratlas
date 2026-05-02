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

function isMissingColumnOrTableError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "42p01" ||
    code === "pgrst205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

export async function resolveContributionAccess({ client = supabase, email = "", userId = "" } = {}) {
  const adminAccess = await resolveAdminAccess({ client, email });
  const isAdmin = Boolean(adminAccess?.isAdmin);

  if (isAdmin) {
    return {
      isAdmin: true,
      isTrustedContributor: true,
      canPublishDirect: true,
      error: adminAccess?.error || null,
    };
  }

  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    return {
      isAdmin: false,
      isTrustedContributor: false,
      canPublishDirect: false,
      error: adminAccess?.error || null,
    };
  }

  try {
    const { data, error } = await client
      .from("member_profiles")
      .select("trusted_contributor")
      .eq("user_id", normalizedUserId)
      .maybeSingle();

    if (error) {
      return {
        isAdmin: false,
        isTrustedContributor: false,
        canPublishDirect: false,
        error: isMissingColumnOrTableError(error) ? null : error,
      };
    }

    const isTrustedContributor = Boolean(data?.trusted_contributor);
    return {
      isAdmin: false,
      isTrustedContributor,
      canPublishDirect: isTrustedContributor,
      error: adminAccess?.error || null,
    };
  } catch (error) {
    return {
      isAdmin: false,
      isTrustedContributor: false,
      canPublishDirect: false,
      error,
    };
  }
}
