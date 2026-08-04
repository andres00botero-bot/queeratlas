import "server-only";
import { EDITORIAL_TEAM } from "@/lib/editorialTrust";

const CACHE_TTL_MS = 5 * 60 * 1000;
const recordCache = new Map();
const EDITORIAL_REVALIDATE_SECONDS = 600;

function getPublicSupabaseConfig() {
  return {
    url: String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, ""),
    key: String(
      process.env.NEXT_PUBLIC_SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "",
    ).trim(),
  };
}

async function fetchPublicEditorialRows(table, params) {
  const config = getPublicSupabaseConfig();
  if (!config.url || !config.key) return [];
  const response = await fetch(`${config.url}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: "application/json",
    },
    next: {
      revalidate: EDITORIAL_REVALIDATE_SECONDS,
      tags: ["qa-editorial"],
    },
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function fallbackRecord(fallback = {}) {
  return {
    ...fallback,
    author: fallback.author || EDITORIAL_TEAM,
    reviewer: fallback.reviewer || null,
    sources: Array.isArray(fallback.sources) ? fallback.sources : [],
    changeLog: Array.isArray(fallback.changeLog) ? fallback.changeLog : [],
    databaseBacked: false,
  };
}

function normalizePerson(row, fallback = null) {
  if (!row?.name) return fallback;
  const slug = String(row.slug || "").trim();
  return {
    id: slug || String(row.id || "editorial-person"),
    name: String(row.name || "").trim(),
    type: row.person_type === "organization" ? "Organization" : "Person",
    role: String(row.role || "").trim(),
    bio: String(row.bio || "").trim(),
    href: slug ? `/contributors#${slug}` : "/contributors",
    city: String(row.city || "").trim(),
    country: String(row.country || "").trim(),
    languages: Array.isArray(row.languages) ? row.languages.filter(Boolean) : [],
    expertise: Array.isArray(row.expertise) ? row.expertise.filter(Boolean) : [],
    avatarUrl: String(row.avatar_url || "").trim(),
  };
}

function normalizeSource(row = {}) {
  return {
    id: String(row.id || ""),
    url: String(row.url || "").trim(),
    name: String(row.source_name || "Source").trim(),
    type: String(row.source_type || "other").trim(),
    confidence: String(row.confidence || "medium").trim(),
    claimScope: String(row.claim_scope || "").trim(),
    checkedAt: row.checked_at || "",
  };
}

function normalizeRevision(row = {}) {
  return {
    id: String(row.id || ""),
    date: row.changed_at || "",
    note: String(row.summary || "").trim(),
    type: String(row.change_type || "editorial").trim(),
    isMaterial: Boolean(row.is_material),
  };
}

function mapEditorialRow(row, fallback = {}) {
  const revisions = Array.isArray(row?.revisions)
    ? row.revisions
        .map(normalizeRevision)
        .filter((entry) => entry.date && entry.note)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    : [];
  const sources = Array.isArray(row?.sources)
    ? row.sources
        .map(normalizeSource)
        .filter((entry) => entry.url)
    : [];

  return {
    ...fallback,
    id: String(row?.id || ""),
    contentKey: String(row?.content_key || "").trim(),
    route: String(row?.route || "").trim(),
    title: String(row?.title || "").trim(),
    status: String(row?.status || "published").trim(),
    publishedAt: row?.published_at || fallback.publishedAt || "",
    updatedAt: row?.last_updated_at || fallback.updatedAt || "",
    reviewedAt: row?.reviewed_at || "",
    researchScope: String(row?.research_scope || fallback.researchScope || "").trim(),
    methodologyNote: String(row?.methodology_note || "").trim(),
    author: normalizePerson(row?.author, fallback.author || EDITORIAL_TEAM),
    reviewer: normalizePerson(row?.reviewer, fallback.reviewer || null),
    sources,
    changeLog: revisions.length > 0 ? revisions : fallback.changeLog || [],
    databaseBacked: true,
  };
}

export async function getPublishedEditorialRecord(contentKey = "", fallback = {}) {
  const normalizedKey = String(contentKey || "").trim();
  if (!normalizedKey) {
    return fallbackRecord(fallback);
  }

  const cached = recordCache.get(normalizedKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return cached.value;

  try {
    const params = new URLSearchParams();
    params.set("select", `
        id, content_key, route, content_type, title, status,
        published_at, last_updated_at, reviewed_at,
        research_scope, methodology_note,
        author:qa_editorial_people!qa_editorial_entries_author_id_fkey(
          id, slug, name, person_type, role, bio, city, country,
          languages, expertise, avatar_url
        ),
        reviewer:qa_editorial_people!qa_editorial_entries_reviewer_id_fkey(
          id, slug, name, person_type, role, bio, city, country,
          languages, expertise, avatar_url
        ),
        sources:qa_editorial_sources(
          id, url, source_name, source_type, confidence,
          claim_scope, checked_at, sort_order
        ),
        revisions:qa_editorial_revisions(
          id, changed_at, summary, change_type, is_material, created_at
        )
      `);
    params.set("content_key", `eq.${normalizedKey}`);
    params.set("status", "eq.published");
    params.set("is_public", "eq.true");
    params.set("limit", "1");
    const rows = await fetchPublicEditorialRows("qa_editorial_entries", params);
    const data = rows[0] || null;

    if (!data) {
      return fallbackRecord(fallback);
    }

    const value = mapEditorialRow(data, fallback);
    recordCache.set(normalizedKey, { cachedAt: Date.now(), value });
    return value;
  } catch {
    return fallbackRecord(fallback);
  }
}

export async function listPublishedEditorialPeople() {
  try {
    const params = new URLSearchParams();
    params.set("select", "id,slug,name,person_type,role,bio,city,country,languages,expertise,avatar_url");
    params.set("is_public", "eq.true");
    params.set("is_active", "eq.true");
    params.set("order", "name.asc");
    const rows = await fetchPublicEditorialRows("qa_editorial_people", params);
    return rows.map((row) => normalizePerson(row)).filter(Boolean);
  } catch {
    return [];
  }
}
