import "server-only";

import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export const PUBLIC_NEWS_CACHE_TAG = "qa-world-news";

function timestamp(value) {
  const parsed = Date.parse(value || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareNewsRecency(a, b) {
  const byCreatedAt = timestamp(b.createdAt) - timestamp(a.createdAt);
  if (byCreatedAt !== 0) return byCreatedAt;
  const byDate = timestamp(b.date) - timestamp(a.date);
  if (byDate !== 0) return byDate;
  return String(b.id || "").localeCompare(String(a.id || ""));
}

export function mapPublicNewsRow(row = {}) {
  const rawSource = String(row.source_name || "").trim();
  return {
    id: String(row.id || ""), title: String(row.title || "").trim(), city: String(row.city || "Global").trim() || "Global",
    country: String(row.country || "").trim(), category: String(row.category || "culture_tip").trim() || "culture_tip",
    date: row.date || row.created_at || "", summary: String(row.summary || "").trim(), whyItMatters: String(row.why_it_matters || "").trim(),
    sourceName: rawSource.toLowerCase().includes("atlas admin") ? "Atlas admin" : rawSource || "Queer Atlas editorial desk",
    sourceUrl: String(row.source_url || row.link || "").trim(), createdAt: row.created_at || "", updatedAt: row.updated_at || row.created_at || row.date || "",
    imageUrl: String(row.image_url || "").trim(), imageAlt: String(row.image_alt || row.title || "").trim(), imageCredit: String(row.image_credit || "").trim(),
  };
}

async function loadPublishedNews() {
  const { data, error } = await supabase.from("qa_world_news").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
  if (error) {
    console.error("[public-news] Could not load published news", { code: String(error.code || ""), message: String(error.message || "") });
    return { items: [], available: false };
  }
  return {
    // qa_world_news has a public read policy; every row is a published article.
    items: (data || []).map(mapPublicNewsRow).filter((item) => item.id && item.title).sort(compareNewsRecency),
    available: true,
  };
}

const getCachedPublishedNews = unstable_cache(loadPublishedNews, ["qa-published-news-v1"], { revalidate: 60, tags: [PUBLIC_NEWS_CACHE_TAG] });

export async function getPublishedNews() { return getCachedPublishedNews(); }

export async function getPublishedNewsArticle(articleId) {
  const id = String(articleId || "").trim();
  if (!id) return null;
  const { items } = await getPublishedNews();
  return items.find((item) => item.id === id) || null;
}
