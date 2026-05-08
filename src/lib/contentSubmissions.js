import { supabase } from "@/lib/supabase";

const SUBMISSIONS_TABLE = "qa_content_submissions";

function normalizeText(value = "") {
  return String(value || "").trim();
}

function normalizeEntityType(value = "") {
  const allowed = new Set(["place", "event", "service", "community_story"]);
  const normalized = normalizeText(value).toLowerCase();
  return allowed.has(normalized) ? normalized : "";
}

function normalizeActionType(value = "") {
  const allowed = new Set(["create", "update", "delete_request"]);
  const normalized = normalizeText(value).toLowerCase();
  return allowed.has(normalized) ? normalized : "create";
}

function parseMissingColumnName(error) {
  const text = `${error?.code || ""} ${error?.message || ""} ${error?.details || ""}`;
  const matchPrimary = text.match(/column\s+["']?([a-z0-9_]+)["']?\s+does not exist/i);
  if (matchPrimary?.[1]) return String(matchPrimary[1]).toLowerCase();
  const matchSchemaCache = text.match(/'([a-z0-9_]+)'\s+column/i);
  if (matchSchemaCache?.[1]) return String(matchSchemaCache[1]).toLowerCase();
  return "";
}

export function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

export async function createContentSubmission({
  entityType,
  actionType = "create",
  city = "",
  title = "",
  payload = {},
  user = null,
  isTrustedContributor = false,
  client = supabase,
} = {}) {
  const normalizedEntityType = normalizeEntityType(entityType);
  const submittedBy = String(user?.id || "").trim();
  if (!normalizedEntityType || !submittedBy) {
    return { data: null, error: new Error("Missing submission identity."), tableMissing: false };
  }

  const insertPayload = {
    entity_type: normalizedEntityType,
    action_type: normalizeActionType(actionType),
    city: normalizeText(city) || null,
    title: normalizeText(title) || null,
    payload: payload && typeof payload === "object" ? payload : {},
    submitted_by: submittedBy,
    submitted_by_email: normalizeText(user?.email || "") || null,
    submitted_by_name: normalizeText(user?.memberName || "Member") || "Member",
    is_trusted_contributor: Boolean(isTrustedContributor),
    status: "pending",
  };

  const { data, error } = await client
    .from(SUBMISSIONS_TABLE)
    .insert([insertPayload])
    .select("*")
    .single();

  return {
    data: data || null,
    error: error || null,
    tableMissing: isMissingTableError(error),
  };
}

export async function listContentSubmissions({
  status = "pending",
  limit = 80,
  client = supabase,
} = {}) {
  let query = client
    .from(SUBMISSIONS_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (normalizeText(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  return {
    data: Array.isArray(data) ? data : [],
    error: error || null,
    tableMissing: isMissingTableError(error),
  };
}

export async function updateContentSubmissionStatus({
  submissionId,
  status,
  reviewer = null,
  adminNote = "",
  client = supabase,
} = {}) {
  const allowed = new Set(["pending", "approved", "rejected", "needs_changes"]);
  const normalizedStatus = normalizeText(status).toLowerCase();
  if (!allowed.has(normalizedStatus)) {
    return { data: null, error: new Error("Invalid status."), tableMissing: false };
  }

  const payload = {
    status: normalizedStatus,
    admin_note: normalizeText(adminNote) || null,
    reviewed_at: new Date().toISOString(),
    reviewed_by: normalizeText(reviewer?.id || "") || null,
    reviewed_by_email: normalizeText(reviewer?.email || "") || null,
  };

  const { data, error } = await client
    .from(SUBMISSIONS_TABLE)
    .update(payload)
    .eq("id", submissionId)
    .select("*")
    .single();

  return {
    data: data || null,
    error: error || null,
    tableMissing: isMissingTableError(error),
  };
}

async function insertWithFallback(table, payload, client = supabase) {
  let workingPayload = { ...(payload || {}) };
  let lastError = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const result = await client.from(table).insert([workingPayload]).select("*").single();
    if (!result.error) {
      return { data: result.data || null, error: null, tableMissing: false };
    }

    if (isMissingTableError(result.error)) {
      return { data: null, error: result.error, tableMissing: true };
    }

    const missingColumn = parseMissingColumnName(result.error);
    if (!missingColumn || !(missingColumn in workingPayload)) {
      lastError = result.error;
      break;
    }

    const nextPayload = { ...workingPayload };
    delete nextPayload[missingColumn];
    workingPayload = nextPayload;
    lastError = result.error;
  }

  return { data: null, error: lastError || new Error(`Could not insert ${table}.`), tableMissing: false };
}

function resolvePublishTarget(entityType = "") {
  const normalized = normalizeEntityType(entityType);
  if (normalized === "place") return "places";
  if (normalized === "event") return "events";
  if (normalized === "service") return "services";
  if (normalized === "community_story") return "qa_world_news";
  return "";
}

function buildCommunityStoryNewsRow(submission = {}) {
  const payload = submission?.payload && typeof submission.payload === "object" ? submission.payload : {};
  const sourceName = normalizeText(
    payload.source_name || `${submission?.submitted_by_name || "Member"} | Member story`
  );
  const fallbackId = `member-story-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id: normalizeText(payload.id || `member-story-${submission?.id || fallbackId}`),
    title: normalizeText(payload.title || payload.name || submission?.title || "Community story"),
    city: normalizeText(payload.city || submission?.city || "Global"),
    category: normalizeText(payload.category || "culture_tip"),
    date: normalizeText(payload.date || new Date().toISOString().slice(0, 10)),
    summary: normalizeText(payload.summary || payload.description || "Member report from the community."),
    why_it_matters: normalizeText(
      payload.why_it_matters ||
        payload.whyItMatters ||
        payload.details ||
        "Community-grounded signal to help others plan safer choices."
    ),
    source_name: sourceName || "Member story",
    created_by_email: normalizeText(submission?.submitted_by_email || "") || null,
  };
}

export async function publishContentSubmission({
  submission,
  reviewer = null,
  client = supabase,
} = {}) {
  const targetTable = resolvePublishTarget(submission?.entity_type);
  if (!targetTable) {
    return { data: null, error: new Error("Unknown submission entity type."), tableMissing: false };
  }

  let payload = submission?.payload && typeof submission.payload === "object" ? { ...submission.payload } : {};
  if (targetTable === "services" && !payload.created_by) {
    payload.created_by = normalizeText(submission?.submitted_by || "") || null;
  }

  if (targetTable === "qa_world_news") {
    payload = buildCommunityStoryNewsRow(submission);
  }

  const insertResult = await insertWithFallback(targetTable, payload, client);
  if (insertResult.error) {
    return insertResult;
  }

  const statusResult = await updateContentSubmissionStatus({
    submissionId: submission?.id,
    status: "approved",
    reviewer,
    adminNote: "",
    client,
  });
  if (statusResult.error) {
    return { data: insertResult.data, error: statusResult.error, tableMissing: statusResult.tableMissing };
  }

  return { data: insertResult.data, error: null, tableMissing: false };
}
