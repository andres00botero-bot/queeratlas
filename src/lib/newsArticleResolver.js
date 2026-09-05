import "server-only";

import { supabase } from "@/lib/supabase";
import { EDITORIAL_PULSE_ITEMS } from "@/lib/pulse";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { cityPath } from "@/lib/cityRouting";
import { buildEventPath, buildVenuePath } from "@/lib/seo/entitySlug";

const NEWS_CATEGORY_LABELS = {
  rights_safety: "Politics & policy",
  nightlife_change: "Openings & closures",
  major_event: "Major event",
  rising_spot: "Travel signal",
  culture_tip: "Culture & lifestyle",
};

function clean(value) {
  return String(value || "").trim();
}

function displayCity(value) {
  const city = clean(value);
  if (!city) return "Global";
  if (city.toLowerCase() === "multi-city") return "Multi-city";
  return city
    .replaceAll("_", " ")
    .split(/\s+/)
    .map((part) => part ? `${part.charAt(0).toUpperCase()}${part.slice(1)}` : "")
    .join(" ");
}

function normalizeDatabaseArticle(row) {
  return {
    id: clean(row.id),
    kind: "database",
    storyType: NEWS_CATEGORY_LABELS[row.category] || "Queer news",
    title: clean(row.title),
    city: displayCity(row.city),
    country: clean(row.country),
    category: clean(row.category) || "culture_tip",
    date: row.date || row.created_at || "",
    publishedAt: row.created_at || row.date || "",
    updatedAt: row.updated_at || row.created_at || row.date || "",
    summary: clean(row.summary),
    whyItMatters: clean(row.why_it_matters),
    sourceName: clean(row.source_name) || "Queer Atlas editorial desk",
    sourceUrl: clean(row.source_url || row.link),
    imageUrl: clean(row.image_url),
    imageAlt: clean(row.image_alt) || clean(row.title),
    imageCredit: clean(row.image_credit),
    verificationLabel: "Published by the Queer Atlas editorial desk",
    commentsEnabled: true,
    entityHref: "",
    entityLabel: "",
  };
}

function normalizeEditorialArticle(item) {
  return {
    id: clean(item.id),
    kind: "editorial",
    storyType: NEWS_CATEGORY_LABELS[item.category] || "Queer news",
    title: clean(item.title),
    city: displayCity(item.city),
    country: clean(item.country),
    category: clean(item.category) || "culture_tip",
    date: item.date || "",
    publishedAt: item.date || "",
    updatedAt: item.updatedAt || item.date || "",
    summary: clean(item.summary),
    whyItMatters: clean(item.whyItMatters),
    sourceName: clean(item.sourceName) || "Queer Atlas editorial",
    sourceUrl: clean(item.sourceUrl),
    imageUrl: clean(item.imageUrl),
    imageAlt: clean(item.imageAlt) || clean(item.title),
    imageCredit: clean(item.imageCredit),
    verificationLabel: "Curated and reviewed by Queer Atlas",
    commentsEnabled: false,
    entityHref: "",
    entityLabel: "",
  };
}

async function resolveRisingSpot(articleId) {
  const placeId = clean(articleId).slice("rising-".length);
  if (!placeId) return null;
  const { data, error } = await fetchPlacesForAtlas({ filters: { id: placeId } });
  if (error || !data?.[0]) return null;
  const place = data[0];
  const rating = Number(place.avgRating ?? place.avg_rating);
  const reviewCount = Number(place.reviewCount ?? place.review_count) || 0;
  const ratingCopy = Number.isFinite(rating) && rating > 0 ? ` · ${rating.toFixed(1)} rating` : "";

  return {
    id: clean(articleId),
    kind: "venue-signal",
    storyType: "Travel signal",
    title: `${place.name} is rising`,
    city: displayCity(place.city),
    country: clean(place.country),
    category: "rising_spot",
    date: place.updated_at || "",
    publishedAt: place.updated_at || "",
    updatedAt: place.updated_at || "",
    summary: `${place.type || "Venue"} · ${reviewCount} community reviews${ratingCopy}.`,
    whyItMatters: "Community traction is increasing, making this a higher-confidence place to consider in your city plans.",
    sourceName: "Queer Atlas place and community signals",
    sourceUrl: "",
    imageUrl: clean(place.imageUrl || place.image_url),
    imageAlt: clean(place.name),
    imageCredit: "",
    verificationLabel: "Generated from current Atlas place signals",
    commentsEnabled: false,
    entityHref: buildVenuePath(place.city, place),
    entityLabel: `Open ${place.name}`,
  };
}

async function findEvent(eventId) {
  const { data } = await supabase
    .from("events")
    .select("id,city,name,description,date,start_date,end_date,link,vibe,vibe_tags,location,lat,lng")
    .eq("id", String(eventId))
    .maybeSingle();
  if (data) return data;

  const seedEvents = await mergeSeedEventsAsync([]);
  return seedEvents.find((event) => String(event?.id || "") === String(eventId)) || null;
}

async function resolveMajorEvent(articleId) {
  const eventId = clean(articleId).slice("major-".length);
  if (!eventId) return null;
  const event = await findEvent(eventId);
  if (!event) return null;
  return {
    id: clean(articleId),
    kind: "event-signal",
    storyType: "Major event",
    title: clean(event.name),
    city: displayCity(event.city),
    country: clean(event.country),
    category: "major_event",
    date: event.start_date || event.date || "",
    publishedAt: event.updated_at || event.start_date || event.date || "",
    updatedAt: event.updated_at || event.start_date || event.date || "",
    summary: clean(event.description) || "A major queer community event with high planning value.",
    whyItMatters: "Events like this can shape where the strongest queer energy gathers and may affect tickets, transport and accommodation.",
    sourceName: "Queer Atlas events desk",
    sourceUrl: clean(event.link),
    imageUrl: clean(event.imageUrl || event.image_url),
    imageAlt: clean(event.name),
    imageCredit: "",
    verificationLabel: "Matched to the current Atlas event record",
    commentsEnabled: false,
    entityHref: buildEventPath(event.city, event),
    entityLabel: `View ${event.name}`,
  };
}

async function resolveDatabaseArticle(articleId) {
  const { data, error } = await supabase
    .from("qa_world_news")
    .select("*")
    .eq("id", String(articleId))
    .maybeSingle();
  if (error) {
    console.error("[news-article] Supabase lookup failed", {
      articleId: String(articleId),
      errorCode: String(error.code || ""),
      errorMessage: String(error.message || ""),
    });
    return null;
  }
  return data ? normalizeDatabaseArticle(data) : null;
}

export async function resolveNewsArticle(articleId) {
  const id = clean(articleId);
  if (!id) return null;

  const editorial = EDITORIAL_PULSE_ITEMS.find((item) => String(item.id) === id);
  if (editorial) return normalizeEditorialArticle(editorial);
  if (id.startsWith("rising-")) return resolveRisingSpot(id);
  if (id.startsWith("major-")) return resolveMajorEvent(id);
  return resolveDatabaseArticle(id);
}

export function getNewsArticleLinks(article) {
  const city = clean(article?.city);
  const hasSpecificCity = city && !["global", "multi-city", "regional"].includes(city.toLowerCase()) && !city.includes("/");
  return {
    cityHref: hasSpecificCity ? cityPath(city) : "",
    cityLabel: hasSpecificCity ? `Explore ${city}` : "",
    entityHref: clean(article?.entityHref),
    entityLabel: clean(article?.entityLabel),
  };
}

export function newsCategoryLabel(category) {
  return NEWS_CATEGORY_LABELS[category] || "Queer news";
}
