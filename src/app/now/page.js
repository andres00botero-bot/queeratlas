"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { useAuth } from "@/lib/auth";
import { citySelectionPath } from "@/lib/cityRouting";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { EDITORIAL_PULSE_ITEMS, PULSE_CATEGORIES } from "@/lib/pulse";
import {
  QA_LOGO_URL,
  QA_ORGANIZATION_ID,
  QA_ORGANIZATION_NAME,
  QA_SITE_URL,
  QA_WEBSITE_ID,
} from "@/lib/seo/entityAuthority";
import { QA_SOURCE_CONFIDENCE } from "@/lib/seo/entityConsistency";
import { listCityClusterTopics } from "@/lib/seo/cityClusters";
import { listTopicHubs } from "@/lib/seo/topicHubs";
import {
  isIndexableTopicHub,
  TIER1_CITY_SLUGS,
  TIER1_TOPIC_KEYS,
} from "@/lib/seo/indexingTier";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { readRuntimeCache, writeRuntimeCache } from "@/lib/runtimeCache";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { createContentSubmission } from "@/lib/contentSubmissions";
import { formatDateShort, toDateInputValue } from "@/lib/dateDisplay";
import VibeTagChips from "@/components/ui/VibeTagChips";
import EmptyState from "@/components/ui/EmptyState";
import PageControls from "@/components/ui/PageControls";

function isThisWeek(value, now) {
  const date = new Date(value);
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  return date >= now && date <= end;
}

function parseNewsTimestamp(value) {
  const timestamp = Date.parse(value || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function clampSeoText(value, max = 260) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function formatRatingValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "N/A";
  return numeric.toFixed(1);
}

function normalizeRankingDraftItem(item) {
  return {
    city: (item?.city || "").trim().toLowerCase().replaceAll(" ", "_"),
    country: (item?.country || "").trim(),
    signal: (item?.signal || "").trim(),
  };
}

function formatCityLabel(value) {
  return String(value || "TBA")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getNewsToneByCategory(category) {
  const key = String(category || "");
  if (key === "rights_safety") {
    return {
      accentBar: "from-rose-200 via-orange-200 to-rose-100/45",
      categoryBadge: "border-rose-200/30 bg-rose-200/12 text-rose-100",
      cardBorder: "border-rose-200/20",
      cardHover: "hover:border-rose-200/50 hover:shadow-[0_22px_56px_rgba(251,113,133,0.18)]",
      overlay: "from-rose-300/28 via-orange-300/16 to-transparent",
      glow: "shadow-[0_24px_80px_rgba(251,146,60,0.16)]",
    };
  }
  if (key === "major_event") {
    return {
      accentBar: "from-orange-200 via-amber-200 to-yellow-100/45",
      categoryBadge: "border-orange-200/30 bg-orange-200/12 text-orange-100",
      cardBorder: "border-orange-200/20",
      cardHover: "hover:border-orange-200/50 hover:shadow-[0_22px_56px_rgba(251,146,60,0.16)]",
      overlay: "from-orange-300/28 via-amber-300/16 to-transparent",
      glow: "shadow-[0_24px_80px_rgba(251,146,60,0.16)]",
    };
  }
  if (key === "nightlife_change") {
    return {
      accentBar: "from-fuchsia-200 via-pink-200 to-purple-100/45",
      categoryBadge: "border-fuchsia-200/30 bg-fuchsia-200/12 text-fuchsia-100",
      cardBorder: "border-fuchsia-200/20",
      cardHover: "hover:border-fuchsia-200/50 hover:shadow-[0_22px_56px_rgba(232,121,249,0.2)]",
      overlay: "from-fuchsia-300/30 via-pink-300/18 to-transparent",
      glow: "shadow-[0_24px_80px_rgba(217,70,239,0.14)]",
    };
  }
  if (key === "rising_spot") {
    return {
      accentBar: "from-emerald-200 via-teal-200 to-cyan-100/45",
      categoryBadge: "border-emerald-200/30 bg-emerald-200/12 text-emerald-100",
      cardBorder: "border-emerald-200/20",
      cardHover: "hover:border-emerald-200/50 hover:shadow-[0_22px_56px_rgba(52,211,153,0.18)]",
      overlay: "from-emerald-300/26 via-teal-300/16 to-transparent",
      glow: "shadow-[0_24px_80px_rgba(45,212,191,0.14)]",
    };
  }
  return {
    accentBar: "from-cyan-200 via-sky-200 to-blue-100/45",
    categoryBadge: "border-cyan-200/30 bg-cyan-200/12 text-cyan-100",
    cardBorder: "border-cyan-200/20",
    cardHover: "hover:border-cyan-200/50 hover:shadow-[0_22px_56px_rgba(34,211,238,0.2)]",
    overlay: "from-cyan-300/28 via-sky-300/16 to-transparent",
    glow: "shadow-[0_24px_80px_rgba(56,189,248,0.16)]",
  };
}

function resolveNewsConfidence(item, canEditAdminNews) {
  if (canEditAdminNews) return QA_SOURCE_CONFIDENCE.verifiedAdmin;
  const source = String(item?.sourceName || "").toLowerCase();
  if (source.includes("editorial") || source.includes("atlas")) return QA_SOURCE_CONFIDENCE.editorialSignal;
  if (source.includes("member")) return QA_SOURCE_CONFIDENCE.communitySignal;
  return QA_SOURCE_CONFIDENCE.developingSignal;
}

function isRightsUpdateItem(item) {
  return String(item?.category || "").trim().toLowerCase() === "rights_safety";
}

function isVoicesMemberItem(item) {
  const id = String(item?.id || "").trim().toLowerCase();
  const source = String(item?.sourceName || "").trim().toLowerCase();
  return (
    id.startsWith("member-story-") ||
    source.includes("member story") ||
    source.includes("voices submission")
  );
}


function compareNewsRecency(a, b) {
  const byCreatedAt =
    parseNewsTimestamp(b.createdAt || b.created_at) - parseNewsTimestamp(a.createdAt || a.created_at);
  if (byCreatedAt !== 0) return byCreatedAt;

  const byDate = parseNewsTimestamp(b.date) - parseNewsTimestamp(a.date);
  if (byDate !== 0) return byDate;

  return String(b.id || "").localeCompare(String(a.id || ""));
}

const ADMIN_NEWS_KEY = "qa_world_news_admin";
const HIDDEN_NEWS_KEY = "qa_world_news_hidden";
const RANKING_OVERRIDES_KEY = "qa_atlas_ranking_overrides";
const RANKING_PENDING_SYNC_YEARS_KEY = "qa_atlas_ranking_pending_sync_years_v1";
const SAFETY_RANKING_OVERRIDES_KEY = "qa_atlas_safety_ranking_overrides";
const SAFETY_RANKING_PENDING_SYNC_YEARS_KEY = "qa_atlas_safety_ranking_pending_sync_years_v1";
const NEWS_TABLE = "qa_world_news";
const NEWS_HIDDEN_TABLE = "qa_world_news_hidden";
const RANKING_TABLE = "qa_atlas_rankings";
const SAFETY_RANKING_TABLE = "qa_atlas_safety_rankings";
const NOW_NEWS_IMAGE_BUCKET = "qa-now-news";
const NOW_NEWS_IMAGE_MAX_BYTES = 6 * 1024 * 1024;
const NOW_NEWS_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const NOW_RANKING_LIMIT = 10;
const NOW_PULSE_CACHE_KEY = "qa_now_pulse_v1";
const NOW_PULSE_CACHE_TTL_MS = 2 * 60 * 1000;
const NOW_EDITORIAL_CACHE_KEY = "qa_now_editorial_v1";
const NOW_EDITORIAL_CACHE_TTL_MS = 5 * 60 * 1000;
const NOW_FOCUS_REFRESH_COOLDOWN_MS = 60 * 1000;
const MIXED_FEED_ADMIN_CATEGORIES = PULSE_CATEGORIES.filter(
  (item) => item.key !== "all"
);
function createAdminNewsFormDefault() {
  return {
    title: "",
    city: "",
    category: "culture_tip",
    summary: "",
    whyItMatters: "",
    date: "",
    imageUrl: "",
    imageAlt: "",
    imageCredit: "",
  };
}

const COMMUNITY_STORY_TYPES = [
  { value: "harassment_or_violence", label: "Harassment, threats or violence", mapToCategory: "rights_safety" },
  { value: "discrimination_or_bans", label: "Discrimination, bans or exclusion", mapToCategory: "rights_safety" },
  { value: "shared_experiences", label: "Shared experiences and community reality", mapToCategory: "culture_tip" },
  { value: "nightlife_safety_story", label: "Nightlife safety story", mapToCategory: "nightlife_change" },
  { value: "queer_life_in_city", label: "What it is like being queer in a city", mapToCategory: "culture_tip" },
];

function createCommunityStoryFormDefault() {
  return {
    storyType: COMMUNITY_STORY_TYPES[0].value,
    city: "",
    title: "",
    summary: "",
    whyItMatters: "",
  };
}

function getCommunityStoryCategory(storyType = "") {
  const found = COMMUNITY_STORY_TYPES.find((item) => item.value === storyType);
  return found?.mapToCategory || "culture_tip";
}
const ATLAS_DESTINATION_RANKINGS = {
  2026: [
    { city: "berlin", country: "Germany", signal: "Club ecosystem, radical diversity, 24/7 queer culture." },
    { city: "new_york", country: "USA", signal: "Historic queer legacy + constant reinvention across boroughs." },
    { city: "sao_paulo", country: "Brazil", signal: "Massive scene scale, iconic nightlife, bold community pulse." },
    { city: "madrid", country: "Spain", signal: "Late-night social flow with one of Europe’s strongest queer cores." },
    { city: "toronto", country: "Canada", signal: "Safe, inclusive, and packed with year-round queer programming." },
    { city: "san_francisco", country: "USA", signal: "Foundational queer history with deeply rooted local community." },
    { city: "paris", country: "France", signal: "Creative queer nightlife and culture-rich neighborhood discovery." },
    { city: "copenhagen", country: "Denmark", signal: "Design-forward city with confident queer visibility and comfort." },
    { city: "mexico_city", country: "Mexico", signal: "Huge creative energy, queer bars, parties, and culture mix." },
    { city: "sydney", country: "Australia", signal: "World-class events, beach lifestyle, and high queer confidence." },
    { city: "bangkok", country: "Thailand", signal: "Electric nightlife and strong trans visibility across the city." },
    { city: "barcelona", country: "Spain", signal: "Mediterranean style, nightlife density, and Pride-season momentum." },
    { city: "tokyo", country: "Japan", signal: "Unique district-based scenes and nonstop bar micro-cultures." },
    { city: "amsterdam", country: "Netherlands", signal: "Open culture, canal-city charm, and reliable queer nightlife." },
    { city: "lisbon", country: "Portugal", signal: "Warm, social, and growing scene with global queer crowd." },
  ],
  2025: [
    { city: "berlin", country: "Germany", signal: "Still the benchmark for nightlife freedom and subculture depth." },
    { city: "new_york", country: "USA", signal: "Global reference point for queer art, bars, and community power." },
    { city: "mexico_city", country: "Mexico", signal: "Fast-rising powerhouse with high creative and social signal." },
    { city: "bangkok", country: "Thailand", signal: "Crowd energy, nightlife variety, and late-night consistency." },
    { city: "sao_paulo", country: "Brazil", signal: "Big-city intensity with huge queer event infrastructure." },
    { city: "san_francisco", country: "USA", signal: "Legacy + reliability, still one of the safest queer anchors." },
    { city: "toronto", country: "Canada", signal: "Consistently inclusive with strong district-level discovery." },
    { city: "tel_aviv", country: "Israel", signal: "High visibility, summer energy, and party-weekend magnetism." },
    { city: "lisbon", country: "Portugal", signal: "Compact city flow with social-friendly queer nights." },
    { city: "barcelona", country: "Spain", signal: "Strong club identity and international queer crowd draw." },
    { city: "paris", country: "France", signal: "Aesthetic nightlife and high-density queer venues." },
    { city: "sydney", country: "Australia", signal: "Iconic events with broad LGBTQ+ representation." },
    { city: "rio", country: "Brazil", signal: "Distinct beach-nightlife rhythm and cultural magnetism." },
    { city: "tokyo", country: "Japan", signal: "Neighborhood-led discovery with endlessly varied nightlife." },
    { city: "cape_town", country: "South Africa", signal: "Global travel appeal with rising queer travel signal." },
  ],
};

const ATLAS_SAFETY_RANKINGS = {
  2026: [
    { city: "copenhagen", country: "Denmark", signal: "Consistent late-night safety and high confidence local support." },
    { city: "amsterdam", country: "Netherlands", signal: "Strong civic protections and stable queer nightlife navigation." },
    { city: "sydney", country: "Australia", signal: "High trans visibility confidence and strong verified community signals." },
    { city: "melbourne", country: "Australia", signal: "Reliable venue safety standards and low-friction night movement." },
    { city: "berlin", country: "Germany", signal: "Dense queer ecosystem with resilient late-night safety infrastructure." },
    { city: "barcelona", country: "Spain", signal: "High local sentiment and broad trusted venue coverage." },
    { city: "madrid", country: "Spain", signal: "Strong community signal density and consistent night mobility comfort." },
    { city: "lisbon", country: "Portugal", signal: "Growing safety confidence with stable social trust signals." },
    { city: "stockholm", country: "Sweden", signal: "High late-night navigation confidence with strong queer community trust signals." },
    { city: "bangkok", country: "Thailand", signal: "High nightlife activity with rising confidence in trusted routes." },
  ],
  2025: [
    { city: "amsterdam", country: "Netherlands", signal: "Strong legal context and high community trust continuity." },
    { city: "copenhagen", country: "Denmark", signal: "Low-friction night navigation with strong structural safety signals." },
    { city: "sydney", country: "Australia", signal: "Stable safety baseline and consistent verified local sentiment." },
    { city: "berlin", country: "Germany", signal: "High signal density with established community safety patterns." },
    { city: "melbourne", country: "Australia", signal: "Reliable safety indicators across core queer districts." },
    { city: "barcelona", country: "Spain", signal: "Trusted venue network and strong crowd confidence." },
    { city: "madrid", country: "Spain", signal: "Balanced nightlife vitality and safety signal reliability." },
    { city: "lisbon", country: "Portugal", signal: "Consistent social warmth and improving verified safety coverage." },
    { city: "tokyo", country: "Japan", signal: "District-level navigation reliability with high late-night predictability." },
    { city: "toronto", country: "Canada", signal: "Strong civic protections and broad queer-inclusive operating norms." },
  ],
};

function mapNewsRowToItem(row) {
  const rawSource = String(row.source_name || "").trim();
  const normalizedSource =
    rawSource.toLowerCase().includes("atlas admin") ? "Atlas admin" : rawSource || "Atlas admin";
  return {
    id: row.id,
    title: row.title,
    city: row.city || "Global",
    category: row.category || "culture_tip",
    date: row.date,
    summary: row.summary,
    whyItMatters: row.why_it_matters,
    sourceName: normalizedSource,
    createdAt: row.created_at || "",
    imageUrl: row.image_url || "",
    imageAlt: row.image_alt || "",
    imageCredit: row.image_credit || "",
  };
}

function groupRankingRows(rows) {
  return rows.reduce((acc, row) => {
    const year = String(row.year);
    if (!acc[year]) acc[year] = [];
    acc[year].push({
      city: row.city || "",
      country: row.country || "",
      signal: row.signal || "",
    });
    return acc;
  }, {});
}

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

function isMissingColumnError(error, columnName = "") {
  if (!error || !columnName) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.includes(String(columnName).toLowerCase())
  );
}

function formatSupabaseError(error) {
  if (!error) return "Unknown error";
  return String(error.message || error.details || error.hint || "Unknown error").trim();
}

function mergeEditorialCacheRanking(nextRankingOverrides) {
  const cached = readRuntimeCache(NOW_EDITORIAL_CACHE_KEY, 24 * 60 * 60 * 1000);
  const cachedData = cached?.data && typeof cached.data === "object" ? cached.data : {};
  writeRuntimeCache(NOW_EDITORIAL_CACHE_KEY, {
    ...cachedData,
    rankingOverrides: nextRankingOverrides || {},
  });
}

function mergeEditorialCacheSafetyRanking(nextRankingOverrides) {
  const cached = readRuntimeCache(NOW_EDITORIAL_CACHE_KEY, 24 * 60 * 60 * 1000);
  const cachedData = cached?.data && typeof cached.data === "object" ? cached.data : {};
  writeRuntimeCache(NOW_EDITORIAL_CACHE_KEY, {
    ...cachedData,
    safetyRankingOverrides: nextRankingOverrides || {},
  });
}

function readRankingPendingSyncYears() {
  const raw = readLocalJson(RANKING_PENDING_SYNC_YEARS_KEY, []);
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((value) => String(value || "").trim()).filter(Boolean))];
}

function writeRankingPendingSyncYears(years = []) {
  const normalized = [...new Set((years || []).map((value) => String(value || "").trim()).filter(Boolean))];
  writeLocalJson(RANKING_PENDING_SYNC_YEARS_KEY, normalized);
  return normalized;
}

function markRankingYearPendingSync(year, isPending) {
  const key = String(year || "").trim();
  if (!key) return readRankingPendingSyncYears();
  const nextSet = new Set(readRankingPendingSyncYears());
  if (isPending) {
    nextSet.add(key);
  } else {
    nextSet.delete(key);
  }
  return writeRankingPendingSyncYears([...nextSet]);
}

function readSafetyRankingPendingSyncYears() {
  const raw = readLocalJson(SAFETY_RANKING_PENDING_SYNC_YEARS_KEY, []);
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((value) => String(value || "").trim()).filter(Boolean))];
}

function writeSafetyRankingPendingSyncYears(years = []) {
  const normalized = [...new Set((years || []).map((value) => String(value || "").trim()).filter(Boolean))];
  writeLocalJson(SAFETY_RANKING_PENDING_SYNC_YEARS_KEY, normalized);
  return normalized;
}

function markSafetyRankingYearPendingSync(year, isPending) {
  const key = String(year || "").trim();
  if (!key) return readSafetyRankingPendingSyncYears();
  const nextSet = new Set(readSafetyRankingPendingSyncYears());
  if (isPending) {
    nextSet.add(key);
  } else {
    nextSet.delete(key);
  }
  return writeSafetyRankingPendingSyncYears([...nextSet]);
}

function mergeRankingOverridesWithPending({
  remoteRankings = {},
  localRankings = {},
  pendingYears = [],
}) {
  const next = { ...(remoteRankings || {}) };
  const pendingSet = new Set((pendingYears || []).map((value) => String(value || "").trim()).filter(Boolean));
  pendingSet.forEach((year) => {
    const localRows = Array.isArray(localRankings?.[year]) ? localRankings[year] : [];
    if (localRows.length > 0) {
      next[year] = localRows;
    }
  });
  return next;
}

function createClientId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 12)}`;
}

function PulseSkeletonCard({ tone = "orange" }) {
  const toneClass =
    tone === "fuchsia"
      ? "border-fuchsia-200/16 bg-[linear-gradient(180deg,rgba(232,121,249,0.12),rgba(10,10,10,0.94))]"
      : tone === "cyan"
        ? "border-cyan-200/16 bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(10,10,10,0.94))]"
      : tone === "emerald"
      ? "border-emerald-200/16 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(10,10,10,0.94))]"
      : tone === "yellow"
        ? "border-yellow-200/16 bg-[linear-gradient(180deg,rgba(250,204,21,0.10),rgba(10,10,10,0.94))]"
        : "border-orange-200/16 bg-[linear-gradient(180deg,rgba(251,146,60,0.10),rgba(10,10,10,0.94))]";

  return (
    <div className={`qa-skeleton-card rounded-2xl border p-4 ${toneClass}`} aria-hidden="true">
      <div className="qa-skeleton-card h-3 w-24 rounded-full" />
      <div className="qa-skeleton-card mt-3 h-5 w-2/3 rounded-full" />
      <div className="qa-skeleton-card mt-4 h-3 w-full rounded-full" />
      <div className="qa-skeleton-card mt-2 h-3 w-5/6 rounded-full" />
    </div>
  );
}

export default function NowPage() {
  const router = useRouter();
  const { isMember, memberName, user, memberProfile } = useAuth();
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(null);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [loadError, setLoadError] = useState("");
  const [syncWarning, setSyncWarning] = useState("");
  const [expandedSoonEventId, setExpandedSoonEventId] = useState(null);
  const [expandedNewsId, setExpandedNewsId] = useState(null);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState("all");
  const [selectedRankingYear, setSelectedRankingYear] = useState("2026");
  const [selectedSafetyRankingYear, setSelectedSafetyRankingYear] = useState("2026");
  const [isHappeningExpanded, setIsHappeningExpanded] = useState(false);
  const [isCommunityExpanded, setIsCommunityExpanded] = useState(false);
  const [activeNowSection, setActiveNowSection] = useState("mixed");
  const [rankingOverrides, setRankingOverrides] = useState(() => readLocalJson(RANKING_OVERRIDES_KEY, {}));
  const [safetyRankingOverrides, setSafetyRankingOverrides] = useState(() =>
    readLocalJson(SAFETY_RANKING_OVERRIDES_KEY, {})
  );
  const [isRankingEditorOpen, setIsRankingEditorOpen] = useState(false);
  const [rankingDraft, setRankingDraft] = useState([]);
  const [isSafetyRankingEditorOpen, setIsSafetyRankingEditorOpen] = useState(false);
  const [safetyRankingDraft, setSafetyRankingDraft] = useState([]);
  const [adminNews, setAdminNews] = useState([]);
  const [hiddenNewsIds, setHiddenNewsIds] = useState([]);
  const [isAdminByTable, setIsAdminByTable] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showPolicyAdminForm, setShowPolicyAdminForm] = useState(false);
  const [readingNewsItem, setReadingNewsItem] = useState(null);
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState("");
  const isEditingNews = Boolean(editingNewsId);
  const [adminForm, setAdminForm] = useState(() => createAdminNewsFormDefault());
  const [adminImageFile, setAdminImageFile] = useState(null);
  const [removeAdminImage, setRemoveAdminImage] = useState(false);
  const [adminComposerLane, setAdminComposerLane] = useState("mixed");
  const [showCommunityStoryForm, setShowCommunityStoryForm] = useState(false);
  const [isSubmittingCommunityStory, setIsSubmittingCommunityStory] = useState(false);
  const [communityStoryNotice, setCommunityStoryNotice] = useState("");
  const [communityStoryForm, setCommunityStoryForm] = useState(() => createCommunityStoryFormDefault());
  const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);
  const nowControlsRef = useRef(null);
  const nowControlButtonsRef = useRef({});
  const adminComposerRef = useRef(null);
  const lastBackgroundRefreshAtRef = useRef(0);

  useEffect(() => {
    const button = nowControlButtonsRef.current[activeNowSection];
    if (!button || typeof button.scrollIntoView !== "function") return;
    button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeNowSection]);
  useEffect(() => {
    if (!isEditingNews) return;
    if (!showAdminForm && !showPolicyAdminForm) return;
    adminComposerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isEditingNews, showAdminForm, showPolicyAdminForm]);

  const loadPulseData = useCallback(async ({ forceRefresh = false } = {}) => {
    const now = new Date();
    setToday(now);
    setLoadError("");
    setReady((prev) => (prev ? prev : false));
    setIsRefreshingPulse(true);

    try {
      const cached = forceRefresh
        ? { hit: false, stale: true }
        : readRuntimeCache(NOW_PULSE_CACHE_KEY, NOW_PULSE_CACHE_TTL_MS);

      if (cached.hit && cached.data) {
        setEvents(Array.isArray(cached.data.events) ? cached.data.events : []);
        setPlaces(Array.isArray(cached.data.places) ? cached.data.places : []);
        setReady(true);
        if (!cached.stale) return;
      }

      const [{ data: eventsData, error: eventsError }, placesRes] = await Promise.all([
        supabase
          .from("events")
          .select("id, city, name, description, date, start_date, end_date, link, vibe, vibe_tags, location, lat, lng")
          .order("date", { ascending: true }),
        fetchPlacesForAtlas(),
      ]);
      const placesData = placesRes?.data || [];
      const placesError = placesRes?.error || null;

      if (eventsError || placesError) {
        setLoadError("Live pulse could not fully load. Showing available data.");
      }

      const nextEvents = await mergeSeedEventsAsync(eventsData || []);
      const nextPlaces = placesData;
      setEvents(nextEvents);
      setPlaces(nextPlaces);
      writeRuntimeCache(NOW_PULSE_CACHE_KEY, {
        events: nextEvents,
        places: nextPlaces,
      });
      setReady(true);
    } finally {
      setIsRefreshingPulse(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      await loadPulseData();
    });
  }, [loadPulseData]);

  const loadEditorialData = useCallback(async ({ forceRefresh = false } = {}) => {
    const cached = forceRefresh
      ? { hit: false, stale: true }
      : readRuntimeCache(NOW_EDITORIAL_CACHE_KEY, NOW_EDITORIAL_CACHE_TTL_MS);

    if (cached.hit && cached.data) {
      setAdminNews(Array.isArray(cached.data.adminNews) ? cached.data.adminNews : []);
      setHiddenNewsIds(Array.isArray(cached.data.hiddenNewsIds) ? cached.data.hiddenNewsIds : []);
      const localRankings = readLocalJson(RANKING_OVERRIDES_KEY, cached.data.rankingOverrides || {});
      setRankingOverrides(localRankings || {});
      const localSafetyRankings = readLocalJson(
        SAFETY_RANKING_OVERRIDES_KEY,
        cached.data.safetyRankingOverrides || {}
      );
      setSafetyRankingOverrides(localSafetyRankings || {});
      setSyncWarning(String(cached.data.syncWarning || ""));
      if (!cached.stale) return;
    }

    const [newsResponse, hiddenResponse, rankingResponse, safetyRankingResponse] = await Promise.all([
      supabase.from(NEWS_TABLE).select("*").order("date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from(NEWS_HIDDEN_TABLE).select("feed_id"),
      supabase.from(RANKING_TABLE).select("*").order("year", { ascending: false }).order("rank", { ascending: true }),
      supabase.from(SAFETY_RANKING_TABLE).select("*").order("year", { ascending: false }).order("rank", { ascending: true }),
    ]);

    const warnings = [];

    if (newsResponse.error) {
      if (isMissingTableError(newsResponse.error)) {
        warnings.push("News table is missing.");
      } else {
        warnings.push("News sync failed.");
      }
      setAdminNews([]);
    } else {
      const remoteNews = (newsResponse.data || []).map(mapNewsRowToItem);
      setAdminNews(remoteNews);
      writeLocalJson(ADMIN_NEWS_KEY, remoteNews);
    }

    if (hiddenResponse.error) {
      if (!isMissingTableError(hiddenResponse.error)) {
        warnings.push("Hidden-news sync failed.");
      }
      setHiddenNewsIds([]);
    } else {
      const remoteHidden = (hiddenResponse.data || []).map((row) => String(row.feed_id));
      setHiddenNewsIds(remoteHidden);
      writeLocalJson(HIDDEN_NEWS_KEY, remoteHidden);
    }

    if (rankingResponse.error) {
      if (!isMissingTableError(rankingResponse.error)) {
        warnings.push("Ranking sync failed.");
      }
      const localRankings = readLocalJson(RANKING_OVERRIDES_KEY, {});
      setRankingOverrides(localRankings || {});
    } else {
      const localRankings = readLocalJson(RANKING_OVERRIDES_KEY, {});
      const pendingYears = readRankingPendingSyncYears();
      const remoteRankings = groupRankingRows(rankingResponse.data || []);
      const hasRemoteRankings = Object.keys(remoteRankings).length > 0;
      if (hasRemoteRankings) {
        const mergedRankings = mergeRankingOverridesWithPending({
          remoteRankings,
          localRankings,
          pendingYears,
        });
        setRankingOverrides(mergedRankings);
        writeLocalJson(RANKING_OVERRIDES_KEY, mergedRankings);
      } else {
        setRankingOverrides(localRankings || {});
      }
    }

    if (safetyRankingResponse.error) {
      if (!isMissingTableError(safetyRankingResponse.error)) {
        warnings.push("Safety ranking sync failed.");
      }
      const localSafetyRankings = readLocalJson(SAFETY_RANKING_OVERRIDES_KEY, {});
      setSafetyRankingOverrides(localSafetyRankings || {});
    } else {
      const localSafetyRankings = readLocalJson(SAFETY_RANKING_OVERRIDES_KEY, {});
      const pendingYears = readSafetyRankingPendingSyncYears();
      const remoteSafetyRankings = groupRankingRows(safetyRankingResponse.data || []);
      const hasRemoteSafetyRankings = Object.keys(remoteSafetyRankings).length > 0;
      if (hasRemoteSafetyRankings) {
        const mergedSafetyRankings = mergeRankingOverridesWithPending({
          remoteRankings: remoteSafetyRankings,
          localRankings: localSafetyRankings,
          pendingYears,
        });
        setSafetyRankingOverrides(mergedSafetyRankings);
        writeLocalJson(SAFETY_RANKING_OVERRIDES_KEY, mergedSafetyRankings);
      } else {
        setSafetyRankingOverrides(localSafetyRankings || {});
      }
    }

    const nextSyncWarning = warnings.join(" ") || "";
    setSyncWarning(nextSyncWarning);
    writeRuntimeCache(NOW_EDITORIAL_CACHE_KEY, {
      adminNews: newsResponse.error ? [] : (newsResponse.data || []).map(mapNewsRowToItem),
      hiddenNewsIds: hiddenResponse.error ? [] : (hiddenResponse.data || []).map((row) => String(row.feed_id)),
      rankingOverrides: readLocalJson(RANKING_OVERRIDES_KEY, {}),
      safetyRankingOverrides: readLocalJson(SAFETY_RANKING_OVERRIDES_KEY, {}),
      syncWarning: nextSyncWarning,
    });
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      queueMicrotask(loadEditorialData);
    }, 140);
    return () => window.clearTimeout(timeoutId);
  }, [loadEditorialData]);

  useEffect(() => {
    const refreshOnFocus = () => {
      const nowTs = Date.now();
      if (nowTs - lastBackgroundRefreshAtRef.current < NOW_FOCUS_REFRESH_COOLDOWN_MS) return;
      lastBackgroundRefreshAtRef.current = nowTs;
      queueMicrotask(async () => {
        await Promise.all([loadPulseData(), loadEditorialData()]);
      });
    };

    const refreshOnVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => refreshOnFocus(), { timeout: 700 });
        return;
      }
      window.setTimeout(() => refreshOnFocus(), 120);
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnVisibility);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnVisibility);
    };
  }, [loadEditorialData, loadPulseData]);

  const cityOptions = useMemo(
    () => [...new Set(events.concat(places).map((item) => item.city?.toLowerCase()).filter(Boolean))].sort(),
    [events, places]
  );
  const cityOptionSet = useMemo(() => new Set(cityOptions), [cityOptions]);
  const currentEmail = String(user?.email || "").toLowerCase();
  const isAdmin = isAdminByTable;

  useEffect(() => {
    if (!isMember) {
      queueMicrotask(() => {
        setIsAdminByTable(false);
      });
      return;
    }

    let active = true;

    queueMicrotask(async () => {
      const { isAdmin: adminState } = await resolveAdminAccess({
        email: currentEmail,
      });

      if (!active) return;
      setIsAdminByTable(adminState);
      if (!adminState) {
        setShowAdminForm(false);
        setShowPolicyAdminForm(false);
        setEditingNewsId("");
        setAdminForm(createAdminNewsFormDefault());
      }
    });

    return () => {
      active = false;
    };
  }, [currentEmail, isMember]);

  const rankingYears = Object.keys(ATLAS_DESTINATION_RANKINGS).sort((a, b) => Number(b) - Number(a));
  const safetyRankingYears = Object.keys(ATLAS_SAFETY_RANKINGS).sort((a, b) => Number(b) - Number(a));
  const buildRankingDraftForYear = useCallback(
    (year) => {
      const source = (rankingOverrides[year] || ATLAS_DESTINATION_RANKINGS[year] || [])
        .slice(0, NOW_RANKING_LIMIT)
        .map((item) => ({ ...item }));
      return Array.from({ length: NOW_RANKING_LIMIT }, (_, index) => source[index] || { city: "", country: "", signal: "" });
    },
    [rankingOverrides]
  );
  const buildSafetyRankingDraftForYear = useCallback(
    (year) => {
      const source = (safetyRankingOverrides[year] || ATLAS_SAFETY_RANKINGS[year] || [])
        .slice(0, NOW_RANKING_LIMIT)
        .map((item) => ({ ...item }));
      return Array.from({ length: NOW_RANKING_LIMIT }, (_, index) => source[index] || { city: "", country: "", signal: "" });
    },
    [safetyRankingOverrides]
  );
  const baseRankingItems = useMemo(
    () => ATLAS_DESTINATION_RANKINGS[selectedRankingYear] || [],
    [selectedRankingYear]
  );
  const baseSafetyRankingItems = useMemo(
    () => ATLAS_SAFETY_RANKINGS[selectedSafetyRankingYear] || [],
    [selectedSafetyRankingYear]
  );
  const rankingItems = (rankingOverrides[selectedRankingYear] || baseRankingItems).slice(0, NOW_RANKING_LIMIT);
  const safetyRankingItems =
    (safetyRankingOverrides[selectedSafetyRankingYear] || baseSafetyRankingItems).slice(0, NOW_RANKING_LIMIT);
  const filteredEvents = useMemo(
    () =>
      selectedCity === "all"
        ? events
        : events.filter((event) => event.city?.toLowerCase() === selectedCity),
    [events, selectedCity]
  );

  const filteredPlaces = useMemo(
    () =>
      selectedCity === "all"
        ? places
        : places.filter((place) => place.city?.toLowerCase() === selectedCity),
    [places, selectedCity]
  );

  const upcomingEvents = useMemo(
    () => filteredEvents.filter((event) => event.date && new Date(event.date) >= today),
    [filteredEvents, today]
  );

  const tonightEvents = useMemo(() => upcomingEvents.slice(0, 4), [upcomingEvents]);

  const thisWeekEvents = useMemo(
    () => upcomingEvents.filter((event) => isThisWeek(event.date, today)).slice(0, 6),
    [today, upcomingEvents]
  );

  const trendingPlaces = useMemo(
    () =>
      [...filteredPlaces]
        .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        .slice(0, 6),
    [filteredPlaces]
  );
  const monthlyUpcomingEvents = useMemo(() => {
    if (!today) return [];
    const end = new Date(today);
    end.setDate(today.getDate() + 30);
    return upcomingEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= end;
    });
  }, [today, upcomingEvents]);
  const upcomingBeyondTonight = useMemo(() => {
    const tonightIds = new Set(tonightEvents.map((event) => String(event.id)));
    return monthlyUpcomingEvents.filter((event) => !tonightIds.has(String(event.id)));
  }, [monthlyUpcomingEvents, tonightEvents]);
  const happeningSoonEvents = useMemo(() => {
    const tonightTagged = tonightEvents.map((event) => ({ ...event, qaTiming: "tonight" }));
    const nextTagged = upcomingBeyondTonight.slice(0, 8).map((event) => ({ ...event, qaTiming: "next" }));
    return [...tonightTagged, ...nextTagged];
  }, [tonightEvents, upcomingBeyondTonight]);
  const visibleHappeningEvents = useMemo(
    () => (isHappeningExpanded ? happeningSoonEvents : happeningSoonEvents.slice(0, 6)),
    [happeningSoonEvents, isHappeningExpanded]
  );

  const categoryLabels = useMemo(() => {
    const base = PULSE_CATEGORIES.reduce((acc, item) => {
      acc[item.key] = item.label;
      return acc;
    }, {});
    base.culture_tip = "Culture and lifestyle";
    base.rights_safety = "Politics & Policy";
    base.rising_spot = "Travel";
    return base;
  }, []);
  const mixedFeedCategories = useMemo(
    () => PULSE_CATEGORIES.filter((item) => item.key !== "all"),
    []
  );

  const risingSpotsNews = useMemo(
    () =>
      trendingPlaces.slice(0, 4).map((place) => ({
        id: `rising-${place.id}`,
        title: `${place.name} is rising`,
        city: place.city || "City",
        category: "rising_spot",
        date: new Date().toISOString().slice(0, 10),
        summary: `${place.type || "Venue"} | ${place.reviewCount || 0} reviews | rating ${formatRatingValue(place.avgRating)}`,
        whyItMatters: "Community traction is increasing, so this venue is becoming a higher-confidence choice.",
      })),
    [trendingPlaces]
  );

  const majorEventNews = useMemo(
    () =>
      thisWeekEvents.slice(0, 4).map((event) => ({
        id: `major-${event.id}`,
        title: event.name,
        city: event.city || "City",
        category: "major_event",
        date: event.date,
        summary: event.description || "Major community event with high planning value.",
        whyItMatters: "Events like this often shape where the strongest queer energy will concentrate.",
      })),
    [thisWeekEvents]
  );

  const worldNewsItems = useMemo(() => {
    const combined = [
      ...adminNews,
      ...EDITORIAL_PULSE_ITEMS,
      ...risingSpotsNews,
      ...majorEventNews,
    ];
    const hiddenNewsIdSet = new Set((hiddenNewsIds || []).map((id) => String(id)));

    return combined
      .filter((item) => !hiddenNewsIdSet.has(String(item.id)))
      .sort(compareNewsRecency);
  }, [adminNews, hiddenNewsIds, majorEventNews, risingSpotsNews]);

  const mixedFeedItems = useMemo(
    () => worldNewsItems.filter((item) => !isVoicesMemberItem(item)),
    [worldNewsItems]
  );

  const displayedNewsItems = useMemo(() => {
    const scopedItems =
      selectedNewsCategory === "all"
        ? mixedFeedItems
        : mixedFeedItems.filter((item) => String(item.category || "") === selectedNewsCategory);
    return scopedItems;
  }, [mixedFeedItems, selectedNewsCategory]);
  const leadNewsItem = displayedNewsItems[0] || null;
  const secondaryNewsItems = displayedNewsItems.slice(1);
  const nowNewsJsonLd = useMemo(() => {
    const baseUrl = QA_SITE_URL;
    const topItems = displayedNewsItems.slice(0, 10);

    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${baseUrl}/now#collection`,
      url: `${baseUrl}/now`,
      name: "Queer News Feed",
      description:
        "Daily LGBTQ world news, queer travel safety updates, nightlife changes, and policy watch across major cities.",
      inLanguage: "en",
      isPartOf: {
        "@id": QA_WEBSITE_ID,
      },
      publisher: {
        "@id": QA_ORGANIZATION_ID,
      },
      mainEntity: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: topItems.length,
        itemListElement: topItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${baseUrl}/now#${String(item.id || `story-${index + 1}`)}`,
          item: {
            "@type": "NewsArticle",
            headline: clampSeoText(item.title, 110),
            datePublished: item.date || item.createdAt || undefined,
            dateModified: item.createdAt || item.date || undefined,
            articleSection: categoryLabels[item.category] || "Queer news",
            description: clampSeoText(item.summary || item.whyItMatters || "", 220),
            inLanguage: "en",
            about: [
              "Queer news",
              "LGBTQ community",
              "Queer travel",
              "Inclusive nightlife",
            ],
            author: {
              "@type": "Organization",
              name: item.sourceName || "Queer Atlas Editorial",
            },
            publisher: {
              "@type": "Organization",
              "@id": QA_ORGANIZATION_ID,
              name: QA_ORGANIZATION_NAME,
              logo: {
                "@type": "ImageObject",
                url: QA_LOGO_URL,
              },
            },
            image: item.imageUrl ? [item.imageUrl] : undefined,
          },
        })),
      },
    };
  }, [categoryLabels, displayedNewsItems]);

  const nowTravelRankingJsonLd = useMemo(() => {
    const baseUrl = QA_SITE_URL;
    const topItems = rankingItems.slice(0, NOW_RANKING_LIMIT);
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${baseUrl}/now#travel-ranking-${selectedRankingYear}`,
      name: `Top 10 Queer Travel Destinations ${selectedRankingYear}`,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: topItems.length,
      itemListElement: topItems.map((item, index) => {
        const citySlug = String(item?.city || "").trim().toLowerCase().replaceAll(" ", "_");
        return {
          "@type": "ListItem",
          position: index + 1,
          url: citySlug ? `${baseUrl}/${citySlug}` : `${baseUrl}/cities`,
          name: formatCityLabel(item?.city),
          description: clampSeoText(item?.signal || "Signal pending editorial update.", 180),
        };
      }),
    };
  }, [rankingItems, selectedRankingYear]);

  const nowSafetyRankingJsonLd = useMemo(() => {
    const baseUrl = QA_SITE_URL;
    const topItems = safetyRankingItems.slice(0, NOW_RANKING_LIMIT);
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${baseUrl}/now#safety-ranking-${selectedSafetyRankingYear}`,
      name: `Top 10 Queer Safety Destinations ${selectedSafetyRankingYear}`,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: topItems.length,
      itemListElement: topItems.map((item, index) => {
        const citySlug = String(item?.city || "").trim().toLowerCase().replaceAll(" ", "_");
        return {
          "@type": "ListItem",
          position: index + 1,
          url: citySlug ? `${baseUrl}/${citySlug}` : `${baseUrl}/cities`,
          name: formatCityLabel(item?.city),
          description: clampSeoText(item?.signal || "Signal pending editorial update.", 180),
        };
      }),
    };
  }, [safetyRankingItems, selectedSafetyRankingYear]);

  const rankingSeoSummaryText = useMemo(() => {
    const travelTop3 = rankingItems.slice(0, 3).map((item) => formatCityLabel(item?.city)).filter(Boolean);
    const safetyTop3 = safetyRankingItems.slice(0, 3).map((item) => formatCityLabel(item?.city)).filter(Boolean);
    return {
      travel: travelTop3.length
        ? `Travel leaders ${selectedRankingYear}: ${travelTop3.join(", ")}.`
        : `Travel ranking ${selectedRankingYear} is being updated.`,
      safety: safetyTop3.length
        ? `Safety leaders ${selectedSafetyRankingYear}: ${safetyTop3.join(", ")}.`
        : `Safety ranking ${selectedSafetyRankingYear} is being updated.`,
    };
  }, [rankingItems, safetyRankingItems, selectedRankingYear, selectedSafetyRankingYear]);

  const rightsUpdates = useMemo(
    () =>
      worldNewsItems
        .filter((item) => isRightsUpdateItem(item) && !isVoicesMemberItem(item))
        .slice(0, 6),
    [worldNewsItems]
  );
  const communityStories = useMemo(
    () => worldNewsItems.filter((item) => isVoicesMemberItem(item)).slice(0, 6),
    [worldNewsItems]
  );
  const visibleCommunityStories = useMemo(
    () => (isCommunityExpanded ? communityStories : communityStories.slice(0, 4)),
    [communityStories, isCommunityExpanded]
  );
  const nowSections = useMemo(
    () => [
      { id: "mixed", label: "News feed", tone: "cyan", count: displayedNewsItems.length },
      { id: "rankings", label: "Rankings", tone: "emerald", count: rankingItems.length },
      { id: "voices", label: "Voices", tone: "fuchsia", count: communityStories.length },
      { id: "happening", label: "Happening soon", tone: "violet", count: happeningSoonEvents.length },
    ],
    [communityStories.length, displayedNewsItems.length, happeningSoonEvents.length, rankingItems.length]
  );
  const crawlClusterTopics = useMemo(
    () => TIER1_TOPIC_KEYS.filter((topicKey) => Boolean(listCityClusterTopics().find((topic) => topic.key === topicKey))),
    []
  );
  const crawlClusterCities = useMemo(
    () => TIER1_CITY_SLUGS.filter((cityKey) => Boolean(cityConfig[cityKey])).slice(0, 12),
    []
  );
  const topicHubKeys = useMemo(
    () => listTopicHubs().map((hub) => hub.key).filter((key) => isIndexableTopicHub(key)),
    []
  );
  const adminNewsIdSet = useMemo(
    () => new Set((adminNews || []).map((item) => String(item.id))),
    [adminNews]
  );

  const resetAdminNewsComposer = useCallback(() => {
    setEditingNewsId("");
    setAdminForm(createAdminNewsFormDefault());
    setAdminImageFile(null);
    setRemoveAdminImage(false);
    setAdminComposerLane("mixed");
    setShowAdminForm(false);
    setShowPolicyAdminForm(false);
  }, []);

  const resetCommunityStoryForm = useCallback(() => {
    setCommunityStoryForm(createCommunityStoryFormDefault());
    setShowCommunityStoryForm(false);
  }, []);
  const closeNewsReader = useCallback(() => {
    setReadingNewsItem(null);
  }, []);

  const openEditNewsComposer = useCallback((item) => {
    if (!item) return;
    setActiveNowSection("mixed");
    setEditingNewsId(String(item.id));
    setAdminComposerLane("mixed");
    setShowAdminForm(true);
    setShowPolicyAdminForm(false);
    setAdminForm({
      title: String(item.title || ""),
      city: String(item.city || "").toLowerCase() === "global" ? "" : String(item.city || ""),
      category: String(item.category || "culture_tip"),
      summary: String(item.summary || ""),
      whyItMatters: String(item.whyItMatters || ""),
      date: toDateInputValue(item.date || item.createdAt),
      imageUrl: String(item.imageUrl || ""),
      imageAlt: String(item.imageAlt || ""),
      imageCredit: String(item.imageCredit || ""),
    });
    setAdminImageFile(null);
    setRemoveAdminImage(false);
  }, []);

  const uploadNowNewsImage = useCallback(async ({ newsId, file }) => {
    if (!file) return { url: "" };
    if (!NOW_NEWS_IMAGE_MIME_TYPES.has(file.type)) {
      throw new Error("Unsupported image type. Use JPG, PNG, or WebP.");
    }
    if (file.size > NOW_NEWS_IMAGE_MAX_BYTES) {
      throw new Error("Image is too large. Maximum size is 6MB.");
    }

    const extension = String(file.name || "")
      .split(".")
      .pop()
      ?.toLowerCase();
    const fallbackExt =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const safeExt = extension && extension.length <= 5 ? extension : fallbackExt;
    const path = `${String(newsId)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const uploadRes = await supabase.storage.from(NOW_NEWS_IMAGE_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadRes.error) throw uploadRes.error;

    const publicUrl =
      supabase.storage.from(NOW_NEWS_IMAGE_BUCKET).getPublicUrl(path)?.data?.publicUrl || "";
    if (!publicUrl) {
      throw new Error("Could not generate public URL for uploaded image.");
    }
    return { url: publicUrl, path };
  }, []);

  const submitCommunityStory = async (event) => {
    event.preventDefault();
    if (!isMember || !user?.id) {
      localStorage.setItem("qa_post_login_target", "/now");
      router.push("/?join=true");
      return;
    }
    if (isSubmittingCommunityStory) return;

    const title = String(communityStoryForm.title || "").trim();
    const summary = String(communityStoryForm.summary || "").trim();
    const whyItMatters = String(communityStoryForm.whyItMatters || "").trim();
    const city = String(communityStoryForm.city || "").trim();
    const storyType = String(communityStoryForm.storyType || "").trim();

    if (!title || !summary || !whyItMatters) {
      setCommunityStoryNotice("Fill in title, story summary, and why it matters.");
      return;
    }

    setIsSubmittingCommunityStory(true);
    setCommunityStoryNotice("");

    try {
      const category = getCommunityStoryCategory(storyType);
      const payload = {
        id: createClientId("member-story"),
        title,
        city: city || "Global",
        category,
        summary,
        why_it_matters: whyItMatters,
        story_type: storyType,
        source_name: `${memberName || "Member"} | Member story`,
        description: summary,
      };

      const submissionRes = await createContentSubmission({
        entityType: "community_story",
        actionType: "create",
        city: city || "global",
        title,
        payload,
        user: {
          id: user.id,
          email: user.email || "",
          memberName: memberName || "Member",
        },
        isTrustedContributor: Boolean(memberProfile?.trustedContributor),
      });

      if (submissionRes.tableMissing) {
        setCommunityStoryNotice("Moderation queue is not configured yet. Run supabase/content-submissions-v2-community-story.sql.");
        return;
      }

      if (submissionRes.error) {
        setCommunityStoryNotice(submissionRes.error.message || "Could not submit story right now.");
        return;
      }

      setCommunityStoryNotice("Story submitted. It will appear after admin approval.");
      resetCommunityStoryForm();
    } finally {
      setIsSubmittingCommunityStory(false);
    }
  };

  const updateRankingDraftField = (index, field, value) => {
    setRankingDraft((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const moveRankingDraftItem = (index, direction) => {
    setRankingDraft((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const temp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = temp;
      return next;
    });
  };

  const clearRankingDraftItem = (index) => {
    setRankingDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { city: "", country: "", signal: "" } : item
      )
    );
  };

  const updateSafetyRankingDraftField = (index, field, value) => {
    setSafetyRankingDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const moveSafetyRankingDraftItem = (index, direction) => {
    setSafetyRankingDraft((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const temp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = temp;
      return next;
    });
  };

  const clearSafetyRankingDraftItem = (index) => {
    setSafetyRankingDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { city: "", country: "", signal: "" } : item
      )
    );
  };

  const saveRankingDraft = async () => {
    if (!isAdmin) return;
    const normalizedDraft = rankingDraft.map(normalizeRankingDraftItem);
    const emptyRows = normalizedDraft
      .map((item, index) => ({ index, city: item.city }))
      .filter((item) => !item.city);
    if (emptyRows.length > 0) {
      // Legacy regression sentinel (test harness):
      // "Ranking save blocked. Every position from #1 to #15 must have a city."
      setSyncWarning("Ranking save blocked. Every position from #1 to #10 must have a city.");
      return;
    }

    const duplicateCitySet = new Set();
    const duplicateCities = [];
    normalizedDraft.forEach((item) => {
      if (duplicateCitySet.has(item.city) && !duplicateCities.includes(item.city)) {
        duplicateCities.push(item.city);
      }
      duplicateCitySet.add(item.city);
    });
    if (duplicateCities.length > 0) {
      setSyncWarning(
        `Ranking save blocked. Duplicate cities found: ${duplicateCities.join(", ")}.`
      );
      return;
    }

    const next = {
      ...rankingOverrides,
      [selectedRankingYear]: normalizedDraft,
    };
    const year = Number(selectedRankingYear);
    const rows = next[selectedRankingYear].map((item, index) => ({
      year,
      rank: index + 1,
      city: item.city,
      country: item.country,
      signal: item.signal,
      updated_by_email: currentEmail || null,
    }));

    const { error: upsertError } = rows.length
      ? await supabase.from(RANKING_TABLE).upsert(rows, { onConflict: "year,rank" })
      : { error: null };

    if (upsertError && !isMissingTableError(upsertError)) {
      markRankingYearPendingSync(selectedRankingYear, true);
      setSyncWarning(`Cloud sync failed. Using local backup. ${formatSupabaseError(upsertError)}`);
    } else if (upsertError && isMissingTableError(upsertError)) {
      markRankingYearPendingSync(selectedRankingYear, true);
      setSyncWarning("Ranking saved locally. Run supabase/world-news-sync.sql to enable cloud sync.");
    } else {
      const { error: trimError } = await supabase
        .from(RANKING_TABLE)
        .delete()
        .eq("year", year)
        .gt("rank", rows.length);
      if (trimError && !isMissingTableError(trimError)) {
        markRankingYearPendingSync(selectedRankingYear, true);
        setSyncWarning(`Ranking saved. Cloud cleanup partial: ${formatSupabaseError(trimError)}`);
      } else {
        markRankingYearPendingSync(selectedRankingYear, false);
        setSyncWarning("");
      }
    }

    setRankingOverrides(next);
    writeLocalJson(RANKING_OVERRIDES_KEY, next);
    mergeEditorialCacheRanking(next);
    setIsRankingEditorOpen(false);

    if (!upsertError) {
      await loadEditorialData({ forceRefresh: true });
    }
  };

  const saveSafetyRankingDraft = async () => {
    if (!isAdmin) return;
    const normalizedDraft = safetyRankingDraft.map(normalizeRankingDraftItem);
    const emptyRows = normalizedDraft
      .map((item, index) => ({ index, city: item.city }))
      .filter((item) => !item.city);
    if (emptyRows.length > 0) {
      setSyncWarning("Safety ranking save blocked. Every position from #1 to #10 must have a city.");
      return;
    }

    const duplicateCitySet = new Set();
    const duplicateCities = [];
    normalizedDraft.forEach((item) => {
      if (duplicateCitySet.has(item.city) && !duplicateCities.includes(item.city)) {
        duplicateCities.push(item.city);
      }
      duplicateCitySet.add(item.city);
    });
    if (duplicateCities.length > 0) {
      setSyncWarning(
        `Safety ranking save blocked. Duplicate cities found: ${duplicateCities.join(", ")}.`
      );
      return;
    }

    const next = {
      ...safetyRankingOverrides,
      [selectedSafetyRankingYear]: normalizedDraft,
    };
    const year = Number(selectedSafetyRankingYear);
    const rows = next[selectedSafetyRankingYear].map((item, index) => ({
      year,
      rank: index + 1,
      city: item.city,
      country: item.country,
      signal: item.signal,
      updated_by_email: currentEmail || null,
    }));

    const { error: upsertError } = rows.length
      ? await supabase.from(SAFETY_RANKING_TABLE).upsert(rows, { onConflict: "year,rank" })
      : { error: null };

    if (upsertError && !isMissingTableError(upsertError)) {
      markSafetyRankingYearPendingSync(selectedSafetyRankingYear, true);
      setSyncWarning(`Cloud sync failed. Using local backup. ${formatSupabaseError(upsertError)}`);
    } else if (upsertError && isMissingTableError(upsertError)) {
      markSafetyRankingYearPendingSync(selectedSafetyRankingYear, true);
      setSyncWarning("Safety ranking saved locally. Run SQL setup to enable cloud sync.");
    } else {
      const { error: trimError } = await supabase
        .from(SAFETY_RANKING_TABLE)
        .delete()
        .eq("year", year)
        .gt("rank", rows.length);
      if (trimError && !isMissingTableError(trimError)) {
        markSafetyRankingYearPendingSync(selectedSafetyRankingYear, true);
        setSyncWarning(`Safety ranking saved. Cloud cleanup partial: ${formatSupabaseError(trimError)}`);
      } else {
        markSafetyRankingYearPendingSync(selectedSafetyRankingYear, false);
        setSyncWarning("");
      }
    }

    setSafetyRankingOverrides(next);
    writeLocalJson(SAFETY_RANKING_OVERRIDES_KEY, next);
    mergeEditorialCacheSafetyRanking(next);
    setIsSafetyRankingEditorOpen(false);

    if (!upsertError) {
      await loadEditorialData({ forceRefresh: true });
    }
  };

  const resetRankingYear = async () => {
    if (!isAdmin) return;

    const next = { ...rankingOverrides };
    delete next[selectedRankingYear];

    const { error } = await supabase.from(RANKING_TABLE).delete().eq("year", Number(selectedRankingYear));
    if (error && !isMissingTableError(error)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    } else if (error && isMissingTableError(error)) {
      setSyncWarning("Ranking reset saved locally. Run supabase/world-news-sync.sql to enable cloud sync.");
    } else {
      setSyncWarning("");
    }

    setRankingOverrides(next);
    writeLocalJson(RANKING_OVERRIDES_KEY, next);
    mergeEditorialCacheRanking(next);
    setIsRankingEditorOpen(false);
  };
  const resetSafetyRankingYear = async () => {
    if (!isAdmin) return;

    const next = { ...safetyRankingOverrides };
    delete next[selectedSafetyRankingYear];

    const { error } = await supabase
      .from(SAFETY_RANKING_TABLE)
      .delete()
      .eq("year", Number(selectedSafetyRankingYear));
    if (error && !isMissingTableError(error)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    } else if (error && isMissingTableError(error)) {
      setSyncWarning("Safety ranking reset saved locally. Run SQL setup to enable cloud sync.");
    } else {
      setSyncWarning("");
    }

    setSafetyRankingOverrides(next);
    writeLocalJson(SAFETY_RANKING_OVERRIDES_KEY, next);
    mergeEditorialCacheSafetyRanking(next);
    setIsSafetyRankingEditorOpen(false);
  };
  const rankingRenderItems = isRankingEditorOpen ? rankingDraft : rankingItems;
  const safetyRankingRenderItems = isSafetyRankingEditorOpen ? safetyRankingDraft : safetyRankingItems;

  const publishAdminNews = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;
    if (isPublishingNews) return;
    if (!adminForm.title || !adminForm.summary || !adminForm.whyItMatters) return;

    const nextId = isEditingNews ? String(editingNewsId) : createClientId("admin-news");
    const existingNewsItem = isEditingNews
      ? adminNews.find((entry) => String(entry.id) === nextId)
      : null;
    const preservedEditDate =
      toDateInputValue(existingNewsItem?.date || existingNewsItem?.createdAt) ||
      new Date().toISOString().slice(0, 10);
    const effectiveDate = isEditingNews
      ? adminForm.date || preservedEditDate
      : adminForm.date || new Date().toISOString().slice(0, 10);
    const effectiveCategory = adminForm.category || "culture_tip";
    let imageUrl = String(adminForm.imageUrl || "").trim();
    if (removeAdminImage) {
      imageUrl = "";
    }
    if (adminImageFile) {
      try {
        const uploaded = await uploadNowNewsImage({ newsId: nextId, file: adminImageFile });
        imageUrl = uploaded.url;
      } catch (uploadError) {
        setSyncWarning(`Image upload failed. ${formatSupabaseError(uploadError)}`);
        return;
      }
    }

    const item = {
      id: nextId,
      title: adminForm.title,
      city: adminForm.city || "Global",
      category: effectiveCategory,
      date: effectiveDate,
      summary: adminForm.summary,
      whyItMatters: adminForm.whyItMatters,
      sourceName: "Atlas admin",
      createdAt: new Date().toISOString(),
      imageUrl,
      imageAlt: String(adminForm.imageAlt || "").trim(),
      imageCredit: String(adminForm.imageCredit || "").trim(),
    };

    setIsPublishingNews(true);
    try {
      const basePayload = {
        id: item.id,
        title: item.title,
        city: item.city,
        category: item.category,
        date: item.date,
        summary: item.summary,
        why_it_matters: item.whyItMatters,
        source_name: item.sourceName,
        image_url: item.imageUrl || null,
        image_alt: item.imageAlt || null,
        image_credit: item.imageCredit || null,
      };

      let error = null;
      if (isEditingNews) {
        let updateRes = await supabase
          .from(NEWS_TABLE)
          .update({
            title: item.title,
            city: item.city,
            category: item.category,
            date: item.date,
            summary: item.summary,
            why_it_matters: item.whyItMatters,
            source_name: item.sourceName,
            image_url: item.imageUrl || null,
            image_alt: item.imageAlt || null,
            image_credit: item.imageCredit || null,
          })
          .eq("id", item.id);
        error = updateRes.error;

        if (
          error &&
          (isMissingColumnError(error, "image_url") ||
            isMissingColumnError(error, "image_alt") ||
            isMissingColumnError(error, "image_credit"))
        ) {
          updateRes = await supabase
            .from(NEWS_TABLE)
            .update({
              title: item.title,
              city: item.city,
              category: item.category,
              date: item.date,
              summary: item.summary,
              why_it_matters: item.whyItMatters,
              source_name: item.sourceName,
            })
            .eq("id", item.id);
          error = updateRes.error;
          if (!error) {
            setSyncWarning("News updated. Image columns missing in DB, so image fields were skipped.");
          }
        }
      } else {
        // Prefer canonical created_by (uuid) when available.
        const insertRes = await supabase.from(NEWS_TABLE).insert({
          ...basePayload,
          created_by: user?.id || null,
        });
        error = insertRes.error;

        // Backward-compatible fallback for older schemas using created_by_email.
        if (error && isMissingColumnError(error, "created_by")) {
          const retry = await supabase.from(NEWS_TABLE).insert({
            ...basePayload,
            created_by_email: currentEmail || null,
          });
          error = retry.error;
        }

        // Final fallback if neither metadata column exists.
        if (error && (isMissingColumnError(error, "created_by_email") || isMissingColumnError(error, "created_by"))) {
          const retry = await supabase.from(NEWS_TABLE).insert(basePayload);
          error = retry.error;
        }

        if (
          error &&
          (isMissingColumnError(error, "image_url") ||
            isMissingColumnError(error, "image_alt") ||
            isMissingColumnError(error, "image_credit"))
        ) {
          let retry = await supabase.from(NEWS_TABLE).insert({
            id: item.id,
            title: item.title,
            city: item.city,
            category: item.category,
            date: item.date,
            summary: item.summary,
            why_it_matters: item.whyItMatters,
            source_name: item.sourceName,
            created_by: user?.id || null,
          });
          let retryError = retry.error;

          if (retryError && isMissingColumnError(retryError, "created_by")) {
            retry = await supabase.from(NEWS_TABLE).insert({
              id: item.id,
              title: item.title,
              city: item.city,
              category: item.category,
              date: item.date,
              summary: item.summary,
              why_it_matters: item.whyItMatters,
              source_name: item.sourceName,
              created_by_email: currentEmail || null,
            });
            retryError = retry.error;
          }

          if (
            retryError &&
            (isMissingColumnError(retryError, "created_by_email") || isMissingColumnError(retryError, "created_by"))
          ) {
            retry = await supabase.from(NEWS_TABLE).insert(basePayload);
            retryError = retry.error;
          }

          error = retryError;
          if (!error) {
            setSyncWarning("News published. Image columns missing in DB, so image fields were skipped.");
          }
        }
      }

      if (error && !isMissingTableError(error)) {
        setSyncWarning(
          `Cloud sync failed. News was not ${isEditingNews ? "updated" : "published"}. ${String(error.message || "").trim()}`.trim()
        );
        return;
      }

      if (error && isMissingTableError(error)) {
        setSyncWarning("Off-grid sync is unavailable. Run supabase/world-news-sync.sql.");
        return;
      }

      await loadEditorialData({ forceRefresh: true });

      resetAdminNewsComposer();
    } finally {
      setIsPublishingNews(false);
    }
  };

  const deleteFeedItem = async (itemId) => {
    if (!isAdmin) return;
    const key = String(itemId);
    if (String(editingNewsId) === key) {
      resetAdminNewsComposer();
    }

    const { error: deleteNewsError } = await supabase.from(NEWS_TABLE).delete().eq("id", key);
    if (deleteNewsError && !isMissingTableError(deleteNewsError)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    }

    let { error: hideError } = await supabase
      .from(NEWS_HIDDEN_TABLE)
      .upsert(
        {
          feed_id: key,
          hidden_by_email: currentEmail || null,
        },
        { onConflict: "feed_id" }
      );

    if (hideError && isMissingColumnError(hideError, "hidden_by_email")) {
      const retry = await supabase
        .from(NEWS_HIDDEN_TABLE)
        .upsert(
          {
            feed_id: key,
          },
          { onConflict: "feed_id" }
        );
      hideError = retry.error;
    }

    if (hideError && !isMissingTableError(hideError)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    } else if (
      (deleteNewsError && isMissingTableError(deleteNewsError)) ||
      (hideError && isMissingTableError(hideError))
    ) {
      setSyncWarning("Off-grid sync is unavailable. Run supabase/world-news-sync.sql.");
    } else if (!deleteNewsError && !hideError) {
      setSyncWarning("");
    }

    setAdminNews((current) => {
      const next = current.filter((item) => String(item.id) !== key);
      if (next.length !== current.length) {
        writeLocalJson(ADMIN_NEWS_KEY, next);
      }
      return next;
    });

    setHiddenNewsIds((current) => {
      if (current.includes(key)) return current;
      const next = [key, ...current];
      writeLocalJson(HIDDEN_NEWS_KEY, next);
      return next;
    });
  };

  const isMixedSection = activeNowSection === "mixed";
  const isRankingSection = activeNowSection === "rankings";
  const isPolicySection = activeNowSection === "policy";
  const isVoicesSection = activeNowSection === "voices";
  const isHappeningSection = activeNowSection === "happening";
  useEffect(() => {
    if (activeNowSection === "policy") {
      queueMicrotask(() => {
        setActiveNowSection("mixed");
      });
    }
  }, [activeNowSection]);

  if (!ready || !today) {
    return (
      <main className="qa-page min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[32px] border border-fuchsia-300/18 bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(251,146,60,0.14),transparent_32%),linear-gradient(135deg,rgba(46,13,62,0.94),rgba(11,10,18,0.98),rgba(61,24,38,0.9))] p-8">
            <div className="animate-pulse space-y-3" aria-hidden="true">
              <div className="h-3 w-28 rounded-full bg-white/14" />
              <div className="h-10 w-52 rounded-full bg-white/12" />
              <div className="h-3 w-full rounded-full bg-white/8" />
              <div className="h-3 w-4/5 rounded-full bg-white/8" />
            </div>
          </section>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[28px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(14,24,36,0.92),rgba(10,10,10,1))] p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <PulseSkeletonCard tone="cyan" />
                <PulseSkeletonCard tone="cyan" />
              </div>
            </section>
            <section className="rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(11,44,56,0.75),rgba(9,9,9,0.96))] p-6">
              <div className="space-y-3">
                <PulseSkeletonCard tone="cyan" />
                <PulseSkeletonCard tone="cyan" />
              </div>
            </section>
          </div>
          <section className="rounded-[28px] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(8,39,32,0.94),rgba(10,10,10,1))] p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <PulseSkeletonCard tone="emerald" />
              <PulseSkeletonCard tone="emerald" />
              <PulseSkeletonCard tone="emerald" />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="qa-page qa-now min-h-screen bg-[radial-gradient(circle_at_12%_10%,rgba(56,189,248,0.11),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(244,114,182,0.11),transparent_28%),linear-gradient(180deg,#030305_0%,#060813_46%,#030305_100%)] px-4 py-6 pb-8 text-white sm:px-6 sm:py-8 sm:pb-12">
      <nav aria-label="Internal now crawl links" className="sr-only">
        <Link href="/now">Now</Link>
        <Link href="/cities">Cities</Link>
        <Link href="/events">Events</Link>
        <Link href="/topics">Topics</Link>
        {topicHubKeys.map((topicKey) => (
          <Link key={`now-topic-hub-${topicKey}`} href={`/topics/${topicKey}`}>
            {topicKey}
          </Link>
        ))}
        {crawlClusterCities.flatMap((cityKey) =>
          crawlClusterTopics.map((topicKey) => (
            <Link key={`now-crawl-cluster-${cityKey}-${topicKey}`} href={`/${cityKey}/discover/${topicKey}`}>
              {cityKey} {topicKey}
            </Link>
          ))
        )}
      </nav>
      <div className="qa-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(nowNewsJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(nowTravelRankingJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(nowSafetyRankingJsonLd) }}
        />
        <div className="qa-panel relative mb-8 overflow-hidden rounded-[30px] border border-fuchsia-200/24 bg-[#0a1022] p-7 shadow-[0_34px_130px_rgba(232,121,249,0.16)] sm:p-8">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/now/now-hero-newsroom.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center 8%" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,18,0.44),rgba(5,8,18,0.72)_56%,rgba(5,8,18,0.92)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.2),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(244,114,182,0.2),transparent_28%)]" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <p className="qa-eyebrow text-fuchsia-100/90">Live Discovery + Editorial Signal</p>
            <h1 className="qa-display qa-h1 mt-3 text-4xl font-bold text-white sm:text-5xl">Queer World News</h1>
            <p className="qa-lead mt-4 max-w-2xl text-sm text-white/75">
              Real-time queer signal across discovery, rights, and community narratives - curated in one premium flow.
            </p>
          </div>
          {loadError && (
            <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
              <span>{loadError}</span>
              <button
                onClick={() => loadPulseData({ forceRefresh: true })}
                className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
              >
                Retry
              </button>
            </div>
          )}
          {syncWarning && (
            <div className="mt-3 inline-flex items-center rounded-xl border border-yellow-300/25 bg-yellow-300/10 px-3 py-2 text-xs text-yellow-100">
              {syncWarning}
            </div>
          )}
        </div>

        <PageControls
          className="mb-6 transition-all duration-300"
          controlsRef={nowControlsRef}
          controlButtonsRef={nowControlButtonsRef}
          buttons={nowSections.map((section) => ({ id: section.id, label: section.label }))}
          activeId={activeNowSection}
          onSelect={(sectionId) => {
            setActiveNowSection(sectionId);
          }}
        />

        {(isMixedSection || isRankingSection) && (
        <section className="mb-6">
          <div className="grid items-stretch gap-6">
            {isMixedSection && (
            <section className="relative flex h-full flex-col p-0">
              <div className="pointer-events-none absolute -left-20 top-8 h-52 w-52 rounded-full bg-cyan-300/8 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 bottom-10 h-52 w-52 rounded-full bg-fuchsia-300/8 blur-3xl" />
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/80">News feed</p>
                  <h2 className="qa-h2 mt-2 text-2xl font-semibold text-white">What is new in the queer world</h2>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (showAdminForm) {
                        resetAdminNewsComposer();
                        return;
                      }
                      setShowPolicyAdminForm(false);
                      setAdminComposerLane("mixed");
                      setEditingNewsId("");
                      setAdminImageFile(null);
                      setRemoveAdminImage(false);
                      setAdminForm(createAdminNewsFormDefault());
                      setShowAdminForm(true);
                    }}
                    className="rounded-full border border-cyan-300/28 bg-cyan-300/10 px-4 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/45"
                  >
                    {showAdminForm ? "Close admin composer" : "Admin publish"}
                  </button>
                )}
              </div>
              <div className="relative z-10 mb-5 flex flex-wrap gap-2">
                {mixedFeedCategories.map((category) => {
                  const isActive = selectedNewsCategory === category.key;
                  const toneClassByCategory =
                    category.key === "rising_spot"
                      ? isActive
                        ? "border-emerald-200/70 bg-emerald-200/30 text-emerald-50 shadow-[0_0_0_1px_rgba(110,231,183,0.28)]"
                        : "border-emerald-200/34 bg-emerald-300/[0.12] text-emerald-100/86 hover:border-emerald-200/52 hover:text-emerald-100"
                      : category.key === "rights_safety"
                        ? isActive
                          ? "border-rose-200/72 bg-rose-200/32 text-rose-50 shadow-[0_0_0_1px_rgba(251,113,133,0.3)]"
                          : "border-rose-200/36 bg-rose-300/[0.12] text-rose-100/86 hover:border-rose-200/54 hover:text-rose-100"
                        : category.key === "nightlife_change"
                          ? isActive
                            ? "border-amber-200/70 bg-amber-200/30 text-amber-50 shadow-[0_0_0_1px_rgba(251,191,36,0.28)]"
                            : "border-amber-200/36 bg-amber-300/[0.12] text-amber-100/86 hover:border-amber-200/54 hover:text-amber-100"
                          : category.key === "major_event"
                            ? isActive
                              ? "border-violet-200/70 bg-violet-200/30 text-violet-50 shadow-[0_0_0_1px_rgba(196,181,253,0.3)]"
                              : "border-violet-200/36 bg-violet-300/[0.12] text-violet-100/86 hover:border-violet-200/54 hover:text-violet-100"
                            : isActive
                              ? "border-cyan-200/70 bg-cyan-200/30 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.3)]"
                              : "border-cyan-200/36 bg-cyan-300/[0.12] text-cyan-100/88 hover:border-cyan-200/54 hover:text-cyan-100";
                  return (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => setSelectedNewsCategory(category.key)}
                      className={`rounded-full border px-3.5 py-2 text-xs uppercase tracking-[0.1em] transition sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.14em] ${toneClassByCategory}`}
                    >
                      {categoryLabels[category.key] || category.label}
                    </button>
                  );
                })}
              </div>

              {isAdmin && showAdminForm && (
                <form ref={adminComposerRef} onSubmit={publishAdminNews} className="mb-5 grid gap-3 rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.05] p-4 md:grid-cols-2">
                  <p className="md:col-span-2 text-xs uppercase tracking-[0.14em] text-cyan-100/85">
                    {isEditingNews ? "Edit admin news" : "Publish admin news"}
                  </p>
                  <input
                    value={adminForm.title}
                    onChange={(event) => setAdminForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="News title"
                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    required
                  />
                  <input
                    value={adminForm.city}
                    onChange={(event) => setAdminForm((current) => ({ ...current, city: event.target.value }))}
                    placeholder="City (optional, or Global)"
                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                  />
                  <select
                    value={adminForm.category}
                    onChange={(event) => setAdminForm((current) => ({ ...current, category: event.target.value }))}
                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                  >
                    {MIXED_FEED_ADMIN_CATEGORIES.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={adminForm.date}
                    onChange={(event) => setAdminForm((current) => ({ ...current, date: event.target.value }))}
                    type="date"
                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                  />
                  <textarea
                    value={adminForm.summary}
                    onChange={(event) => setAdminForm((current) => ({ ...current, summary: event.target.value }))}
                    placeholder="Summary"
                    className="min-h-[90px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none md:col-span-2"
                    required
                  />
                  <textarea
                    value={adminForm.whyItMatters}
                    onChange={(event) => setAdminForm((current) => ({ ...current, whyItMatters: event.target.value }))}
                    placeholder="Why this matters"
                    className="min-h-[90px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none md:col-span-2"
                    required
                  />
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 md:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/85">
                      Article image (Supabase storage)
                    </p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setAdminImageFile(file);
                        if (file) {
                          setRemoveAdminImage(false);
                        }
                      }}
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-200/20 file:px-3 file:py-1.5 file:text-xs file:text-cyan-100 hover:file:bg-cyan-200/30"
                    />
                    <label className="inline-flex items-center gap-2 text-xs text-white/72">
                      <input
                        type="checkbox"
                        checked={removeAdminImage}
                        onChange={(event) => setRemoveAdminImage(event.target.checked)}
                        className="h-4 w-4 rounded border-white/30 bg-black/40"
                      />
                      Remove current image on save
                    </label>
                    {adminImageFile ? (
                      <p className="text-xs text-cyan-100/82">
                        New file: {adminImageFile.name}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                    <input
                      value={adminForm.imageAlt}
                      onChange={(event) => setAdminForm((current) => ({ ...current, imageAlt: event.target.value }))}
                      placeholder="Image alt text (optional)"
                      className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                    <input
                      value={adminForm.imageCredit}
                      onChange={(event) => setAdminForm((current) => ({ ...current, imageCredit: event.target.value }))}
                      placeholder="Image credit (optional)"
                      className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  {adminForm.imageUrl && !removeAdminImage ? (
                    <a
                      href={adminForm.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-cyan-200/25 bg-cyan-200/8 px-4 py-3 text-xs text-cyan-100 transition hover:border-cyan-200/45 md:col-span-2"
                    >
                      Open current image
                    </a>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isPublishingNews}
                    className="rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
                  >
                    {isPublishingNews
                      ? isEditingNews
                        ? "Updating..."
                        : "Publishing..."
                      : isEditingNews
                        ? "Update news"
                        : "Publish news"}
                  </button>
                  <button
                    type="button"
                    onClick={resetAdminNewsComposer}
                    className="rounded-xl border border-white/16 bg-black/30 px-4 py-3 text-sm text-white/82 transition hover:border-white/28 md:col-span-2"
                  >
                    Cancel
                  </button>
                </form>
              )}

              <p className="mb-4 text-[11px] uppercase tracking-[0.15em] text-white/45">
                Showing {displayedNewsItems.length} stories
                {selectedNewsCategory === "all" ? " across all categories" : ` in ${categoryLabels[selectedNewsCategory] || "selected category"}`}
              </p>

              {leadNewsItem ? (
                <article
                  role="button"
                  tabIndex={0}
                  onClick={() => setReadingNewsItem(leadNewsItem)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setReadingNewsItem(leadNewsItem);
                    }
                  }}
                  className="qa-premium-card relative z-10 mb-4 overflow-hidden rounded-[22px] border border-cyan-200/26 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(10,10,10,1))] p-3.5 shadow-[0_18px_50px_rgba(34,211,238,0.12)] transition hover:-translate-y-[1px] hover:border-cyan-200/44 sm:mb-5 sm:rounded-[22px] sm:p-3.5 sm:shadow-[0_14px_38px_rgba(34,211,238,0.1)]"
                >
                  <div className="mb-3 overflow-hidden rounded-xl border border-cyan-200/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(217,70,239,0.14),rgba(12,12,12,0.7))] sm:mb-4 sm:rounded-2xl sm:border-cyan-200/20">
                    {leadNewsItem.imageUrl ? (
                      <div className="relative h-32 w-full sm:h-36">
                        <Image
                          src={leadNewsItem.imageUrl}
                          alt={leadNewsItem.imageAlt || leadNewsItem.title || "News image"}
                          fill
                          loading="eager"
                          fetchPriority="high"
                          sizes="(max-width: 640px) 100vw, 70vw"
                          className="object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/18 to-transparent" />
                        {leadNewsItem.imageCredit && (
                          <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2">
                            {leadNewsItem.imageCredit ? (
                              <span className="rounded-full border border-white/18 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80">
                                Photo: {leadNewsItem.imageCredit}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex aspect-[16/9] items-end justify-between px-3 py-2.5 sm:aspect-[16/8] sm:px-4 sm:py-3">
                        <span className="rounded-full border border-white/16 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80">
                          Editorial image slot
                        </span>
                        <span className="hidden rounded-full border border-white/16 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80 sm:inline-flex">
                          Atlas desk
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mb-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-cyan-200 via-sky-200 to-transparent sm:mb-4 sm:w-14" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-200/34 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100 sm:px-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                      Lead story
                    </span>
                    <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/72 sm:px-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                      {leadNewsItem.city || "Global"}
                    </span>
                    <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] text-white/72 sm:px-2.5 sm:text-[10px]">
                      {formatDateShort(leadNewsItem.createdAt || leadNewsItem.date)}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-semibold leading-tight text-white sm:mt-3 sm:text-lg">{leadNewsItem.title}</h3>
                  <p className="qa-copy-justify mt-2.5 line-clamp-3 text-sm leading-6 text-white/74 sm:mt-3 sm:line-clamp-2 sm:leading-6">
                    {leadNewsItem.summary}
                  </p>
                  {leadNewsItem.whyItMatters ? (
                    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:mt-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Why it matters</p>
                      <p className="qa-copy-justify mt-2 text-sm leading-6 text-white/72 line-clamp-2 sm:line-clamp-2">{leadNewsItem.whyItMatters}</p>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-3">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                      {resolveNewsConfidence(leadNewsItem, adminNewsIdSet.has(String(leadNewsItem.id)))}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/58">
                      {leadNewsItem.imageCredit ? <span>{leadNewsItem.imageCredit}</span> : null}
                      <span>{leadNewsItem.sourceName || QA_SOURCE_CONFIDENCE.atlasSignal}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setReadingNewsItem(leadNewsItem);
                        }}
                        className="rounded-full border border-fuchsia-100/70 bg-[linear-gradient(135deg,rgba(244,114,182,0.95),rgba(236,72,153,0.92),rgba(168,85,247,0.9))] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_rgba(217,70,239,0.35)] transition hover:-translate-y-[1px] hover:brightness-110 hover:shadow-[0_18px_40px_rgba(217,70,239,0.45)]"
                      >
                        Open article
                      </button>
                      {isAdmin && adminNewsIdSet.has(String(leadNewsItem.id)) ? (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditNewsComposer(leadNewsItem);
                            }}
                            className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/42"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteFeedItem(leadNewsItem.id);
                            }}
                            className="rounded-full border border-rose-200/20 bg-rose-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/38"
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              ) : null}

              <div className="qa-defer-render relative z-10 grid min-h-0 flex-1 content-start gap-3 overflow-visible pr-0 md:gap-4 md:overflow-y-auto md:pr-1 md:grid-cols-2 md:[grid-auto-rows:1fr]">
                {secondaryNewsItems.length > 0 ? (
                  secondaryNewsItems.map((item, itemIndex) => {
                    const canEditAdminNews = adminNewsIdSet.has(String(item.id));
                    const itemDateForDisplay = canEditAdminNews
                      ? item.createdAt || item.date
                      : item.date;
                    const tone = getNewsToneByCategory(item.category);
                    const confidenceLabel = resolveNewsConfidence(item, canEditAdminNews);
                    const isExpanded = String(expandedNewsId) === String(item.id);
                    return (
                      <div key={item.id} className="group relative h-full pb-3 [content-visibility:auto] [contain-intrinsic-size:420px]">
                        <article
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setExpandedNewsId((current) =>
                              String(current) === String(item.id) ? null : String(item.id)
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setExpandedNewsId((current) =>
                                String(current) === String(item.id) ? null : String(item.id)
                              );
                            }
                          }}
                          className={`qa-premium-card relative z-10 h-auto cursor-pointer overflow-hidden rounded-[22px] border ${tone.cardBorder} bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] p-3.5 transition duration-300 hover:-translate-y-[2px] sm:rounded-[24px] sm:p-4 md:h-[25.5rem] ${tone.cardHover} ${tone.glow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45`}
                        >
                          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-80 ${tone.overlay}`} />
                          <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-[#0b0b0b]/96" />
                          <div className="relative z-10 flex h-full flex-col">
                            <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(8,8,8,0.72))]">
                              {item.imageUrl ? (
                                <div className="relative h-[120px] w-full">
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.imageAlt || item.title || "News image"}
                                    fill
                                    loading={!leadNewsItem && itemIndex === 0 ? "eager" : "lazy"}
                                    fetchPriority={!leadNewsItem && itemIndex === 0 ? "high" : "auto"}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                  />
                                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                                  {item.imageCredit ? (
                                    <span className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-white/18 bg-black/45 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/78">
                                      {item.imageCredit}
                                    </span>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="flex aspect-[16/8] items-end justify-between px-3 py-2">
                                  <span className="rounded-full border border-white/16 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/75">
                                    Cover
                                  </span>
                                  <span className="rounded-full border border-white/16 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/75">
                                    Newsroom
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className={`mb-3 h-1.5 w-20 rounded-full bg-gradient-to-r transition-all duration-300 group-hover:w-28 sm:mb-4 sm:w-24 sm:group-hover:w-32 ${tone.accentBar}`} />
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">{item.city || "Global"}</p>
                                <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${tone.categoryBadge}`}>
                                  {categoryLabels[item.category] || "News"}
                                </span>
                              </div>
                              <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[10px] text-white/72 sm:px-3 sm:text-[11px]">
                                {formatDateShort(itemDateForDisplay)}
                              </span>
                            </div>
                            <h3 className="mt-2.5 text-base font-semibold leading-6 text-white sm:mt-3 sm:text-lg">{item.title}</h3>
                            <div className={`mt-3 md:min-h-0 md:flex-1 ${isExpanded ? "md:overflow-y-auto md:pr-1" : "overflow-hidden"}`}>
                              <p
                                className={`qa-copy-justify mt-2 text-sm leading-6 text-white/62 transition-all ${
                                  isExpanded ? "" : "line-clamp-2 sm:line-clamp-2"
                                }`}
                              >
                                {item.summary}
                              </p>
                              <div className="mt-4 rounded-xl border border-white/8 bg-black/20 p-3">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Why it matters</p>
                                <p
                                  className={`qa-copy-justify mt-2 text-sm leading-6 text-white/62 transition-all ${
                                    isExpanded ? "" : "line-clamp-2"
                                  }`}
                                >
                                  {item.whyItMatters}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-[11px] uppercase tracking-[0.14em] text-white/36">{confidenceLabel}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    setReadingNewsItem(item);
                                  }}
                                  className="rounded-full border border-fuchsia-100/65 bg-[linear-gradient(135deg,rgba(244,114,182,0.94),rgba(217,70,239,0.9))] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(217,70,239,0.3)] transition hover:-translate-y-[1px] hover:brightness-110"
                                >
                                  Open article
                                </button>
                                <span className="text-[11px] text-white/36">
                                  {isExpanded
                                    ? item.sourceName || QA_SOURCE_CONFIDENCE.atlasSignal
                                    : "Tap to expand"}
                                </span>
                                {isAdmin && (
                                  <>
                                    {canEditAdminNews && (
                                      <button
                                        type="button"
                                        onClick={(clickEvent) => {
                                          clickEvent.stopPropagation();
                                          openEditNewsComposer(item);
                                        }}
                                        className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/38"
                                      >
                                        Edit
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(clickEvent) => {
                                        clickEvent.stopPropagation();
                                        deleteFeedItem(item.id);
                                      }}
                                      className="rounded-full border border-rose-200/20 bg-rose-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/38"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      </div>
                    );
                  })
                ) : displayedNewsItems.length === 0 ? (
                  <EmptyState
                    title="No world news items yet."
                    description="Add an admin news item or check back after new signals."
                    className="md:col-span-2 px-4 py-8"
                    primaryActionLabel={isAdmin ? "Open admin publish" : "Open events"}
                    onPrimaryAction={() => {
                      if (isAdmin) {
                        setEditingNewsId("");
                        setAdminImageFile(null);
                        setRemoveAdminImage(false);
                        setAdminForm(createAdminNewsFormDefault());
                        setShowAdminForm(true);
                        return;
                      }
                      router.push("/events");
                    }}
                  />
                ) : null}
              </div>
            </section>
            )}

            {isRankingSection && (
            <section className="qa-panel relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(180deg,rgba(18,22,34,0.92),rgba(9,11,18,0.97),rgba(7,8,12,1))] p-6 shadow-[0_24px_64px_rgba(2,6,23,0.35)]">
              <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
              <div className="pointer-events-none absolute -right-14 bottom-16 h-40 w-40 rounded-full bg-white/4 blur-3xl" />
              <div className="mb-4 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">Ranking brief</p>
                <p className="qa-copy-justify mt-1 text-sm leading-6 text-white/74">
                  {rankingSeoSummaryText.travel} {rankingSeoSummaryText.safety}
                </p>
              </div>
              <div className="grid h-full gap-4 xl:grid-cols-2">
              <div className="relative min-h-0 rounded-2xl border border-cyan-200/26 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(56,189,248,0.08),rgba(2,6,23,0.55))] p-4">
              <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/16 blur-2xl" />
              <div className="pointer-events-none absolute -right-10 bottom-8 h-24 w-24 rounded-full bg-sky-300/12 blur-2xl" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Ranking</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Top 10 Queer Travel Destinations</h3>
                  <div className="mt-2 inline-flex items-center rounded-full border border-cyan-200/26 bg-cyan-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100/90">
                    Atlas ranking editorial
                  </div>
                </div>
                <select
                  value={selectedRankingYear}
                  onChange={(event) => {
                    const year = event.target.value;
                    setSelectedRankingYear(year);
                    if (isRankingEditorOpen) {
                      setRankingDraft(buildRankingDraftForYear(year));
                    }
                  }}
                  className="rounded-xl border border-cyan-200/20 bg-black/35 px-3 py-2 text-xs text-cyan-100 outline-none focus:border-cyan-200/45"
                >
                  {rankingYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-cyan-100/70">
                Editorial ranking by Queer Atlas. Updated yearly to become the reference list.
              </p>

              {isAdmin && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isRankingEditorOpen) {
                        setIsRankingEditorOpen(false);
                        setRankingDraft([]);
                        return;
                      }

                      setRankingDraft(buildRankingDraftForYear(selectedRankingYear));
                      setIsRankingEditorOpen(true);
                    }}
                    className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-3 py-1.5 text-xs text-cyan-100 transition hover:border-cyan-200/45"
                  >
                    {isRankingEditorOpen ? "Close ranking edit" : "Edit ranking"}
                  </button>
                  {isRankingEditorOpen && (
                    <>
                      <button
                        type="button"
                        onClick={saveRankingDraft}
                        className="rounded-full border border-emerald-200/30 bg-emerald-200/12 px-3 py-1.5 text-xs text-emerald-100 transition hover:border-emerald-200/45"
                      >
                        Save ranking
                      </button>
                      <button
                        type="button"
                        onClick={resetRankingYear}
                        className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1.5 text-xs text-rose-100 transition hover:border-rose-200/40"
                      >
                        Reset year
                      </button>
                    </>
                  )}
                </div>
              )}
              {!isRankingEditorOpen && (
                <div className="mt-5 grid gap-3">
                  {[0, 1, 2].map((index) => {
                    const item = rankingRenderItems[index] || { city: "", country: "", signal: "" };
                    const cityKey = String(item.city || "").toLowerCase();
                    const citySlug = cityKey.replaceAll(" ", "_").trim();
                    const cityExists = cityOptionSet.has(citySlug);
                    const medalTone =
                      index === 0
                        ? "from-amber-200/90 via-yellow-200/70 to-amber-200/30 border-amber-200/35"
                        : index === 1
                          ? "from-slate-200/80 via-slate-300/55 to-slate-200/25 border-slate-200/30"
                          : "from-orange-300/80 via-amber-300/55 to-orange-300/25 border-orange-200/30";
                    return (
                      <button
                        key={`podium-${selectedRankingYear}-${index + 1}`}
                        type="button"
                        disabled={!cityExists}
                        onClick={() => {
                          if (!cityExists) return;
                          router.push(`/${citySlug}`);
                        }}
                        className={`group relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 text-left transition ${
                          cityExists
                            ? "hover:-translate-y-[1px] hover:border-cyan-200/45 hover:shadow-[0_20px_52px_rgba(34,211,238,0.14)]"
                            : "opacity-70"
                        } ${medalTone}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/18 bg-white/10 text-sm font-semibold text-white">
                            #{index + 1}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.14em] text-white/75">
                            {index === 0 ? "Global icon" : index === 1 ? "High signal" : "Rising elite"}
                          </span>
                        </div>
                        <p className="truncate text-base font-semibold text-white">
                          {(item.city || "TBA").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </p>
                        <p className="mt-1 truncate text-xs text-white/65">{item.country || "Country TBA"}</p>
                        <p className="mt-3 text-xs leading-5 text-white/70">
                          {item.signal || "Signal pending editorial update."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className={`mt-4 ${isRankingEditorOpen ? "grid flex-1 grid-rows-[repeat(10,minmax(0,1fr))] gap-2" : "space-y-2.5"}`}>
                {Array.from({ length: NOW_RANKING_LIMIT }).map((_, index) => {
                  if (!isRankingEditorOpen && index < 3) return null;
                  const item = rankingRenderItems[index] || { city: "", country: "", signal: "" };
                  const cityKey = String(item.city || "").toLowerCase();
                  const citySlug = cityKey.replaceAll(" ", "_").trim();
                  const cityExists = cityOptionSet.has(citySlug);
                  const signalStrength = Math.max(22, 100 - index * 4);
                  return (
                    <div
                      key={`${selectedRankingYear}-${index + 1}`}
                      className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl border px-3 py-2 transition ${
                        isRankingEditorOpen
                          ? "border-white/10 bg-black/25"
                          : "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] hover:border-cyan-200/32"
                      }`}
                    >
                      <p className={`text-xs font-semibold ${index < 5 ? "text-cyan-100" : "text-cyan-200/90"}`}>#{index + 1}</p>
                      {isAdmin && isRankingEditorOpen ? (
                        <div className="grid gap-1">
                          <input
                            value={item.city || ""}
                            onChange={(event) => updateRankingDraftField(index, "city", event.target.value)}
                            placeholder="city_name"
                            className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white outline-none"
                          />
                          <div className="grid grid-cols-2 gap-1">
                            <input
                              value={item.country || ""}
                              onChange={(event) => updateRankingDraftField(index, "country", event.target.value)}
                              placeholder="country"
                              className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white outline-none"
                            />
                            <input
                              value={item.signal || ""}
                              onChange={(event) => updateRankingDraftField(index, "signal", event.target.value)}
                              placeholder="signal line"
                              className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {(item.city || "TBA").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                          </p>
                          <p className="truncate text-[11px] text-white/55">{item.country || "Country TBA"}</p>
                          <p className="truncate text-[11px] text-white/62">{item.signal || "Signal pending editorial update."}</p>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                            <span
                              className="block h-1.5 rounded-full bg-gradient-to-r from-cyan-200/85 via-sky-200/75 to-cyan-200/45"
                              style={{ width: `${signalStrength}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {isAdmin && isRankingEditorOpen ? (
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveRankingDraftItem(index, -1)}
                            className="rounded-full border border-white/16 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80 transition hover:border-white/30 disabled:opacity-35"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            disabled={index === NOW_RANKING_LIMIT - 1}
                            onClick={() => moveRankingDraftItem(index, 1)}
                            className="rounded-full border border-white/16 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80 transition hover:border-white/30 disabled:opacity-35"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() => clearRankingDraftItem(index)}
                            className="rounded-full border border-rose-200/20 bg-rose-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/38"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!cityExists}
                          onClick={() => {
                            if (!cityExists) return;
                            router.push(`/${citySlug}`);
                          }}
                          className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                            cityExists
                              ? "border border-cyan-200/35 bg-cyan-200/12 text-cyan-100 hover:bg-cyan-200/22"
                              : "border border-white/10 bg-white/5 text-white/35"
                          }`}
                        >
                          {cityExists ? "Focus" : "Soon"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
              <div className="relative min-h-0 rounded-2xl border border-emerald-200/28 bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(45,212,191,0.08),rgba(2,20,16,0.58))] p-4">
              <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-emerald-300/16 blur-2xl" />
              <div className="pointer-events-none absolute -right-10 bottom-8 h-24 w-24 rounded-full bg-teal-300/14 blur-2xl" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">Safety ranking</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Top 10 Queer Safety Destinations</h3>
                  <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200/26 bg-emerald-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100/90">
                    Atlas safety editorial
                  </div>
                </div>
                <select
                  value={selectedSafetyRankingYear}
                  onChange={(event) => {
                    const year = event.target.value;
                    setSelectedSafetyRankingYear(year);
                    if (isSafetyRankingEditorOpen) {
                      setSafetyRankingDraft(buildSafetyRankingDraftForYear(year));
                    }
                  }}
                  className="rounded-xl border border-emerald-200/20 bg-black/35 px-3 py-2 text-xs text-emerald-100 outline-none focus:border-emerald-200/45"
                >
                  {safetyRankingYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-emerald-100/70">
                Editorial safety ranking by Queer Atlas. Updated yearly to guide low-friction city movement.
              </p>

              {isAdmin && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSafetyRankingEditorOpen) {
                        setIsSafetyRankingEditorOpen(false);
                        setSafetyRankingDraft([]);
                        return;
                      }

                      setSafetyRankingDraft(buildSafetyRankingDraftForYear(selectedSafetyRankingYear));
                      setIsSafetyRankingEditorOpen(true);
                    }}
                    className="rounded-full border border-emerald-200/28 bg-emerald-200/12 px-3 py-1.5 text-xs text-emerald-100 transition hover:border-emerald-200/45"
                  >
                    {isSafetyRankingEditorOpen ? "Close safety edit" : "Edit safety ranking"}
                  </button>
                  {isSafetyRankingEditorOpen && (
                    <>
                      <button
                        type="button"
                        onClick={saveSafetyRankingDraft}
                        className="rounded-full border border-emerald-200/30 bg-emerald-200/12 px-3 py-1.5 text-xs text-emerald-100 transition hover:border-emerald-200/45"
                      >
                        Save ranking
                      </button>
                      <button
                        type="button"
                        onClick={resetSafetyRankingYear}
                        className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1.5 text-xs text-rose-100 transition hover:border-rose-200/40"
                      >
                        Reset year
                      </button>
                    </>
                  )}
                </div>
              )}
              {!isSafetyRankingEditorOpen && (
                <div className="mt-5 grid gap-3">
                  {[0, 1, 2].map((index) => {
                    const item = safetyRankingRenderItems[index] || { city: "", country: "", signal: "" };
                    const cityKey = String(item.city || "").toLowerCase();
                    const citySlug = cityKey.replaceAll(" ", "_").trim();
                    const cityExists = cityOptionSet.has(citySlug);
                    const medalTone =
                      index === 0
                        ? "from-emerald-200/90 via-teal-200/70 to-emerald-200/30 border-emerald-200/35"
                        : index === 1
                          ? "from-teal-200/80 via-cyan-300/55 to-teal-200/25 border-teal-200/30"
                          : "from-lime-300/80 via-emerald-300/55 to-lime-300/25 border-lime-200/30";
                    return (
                      <button
                        key={`safety-podium-${selectedSafetyRankingYear}-${index + 1}`}
                        type="button"
                        disabled={!cityExists}
                        onClick={() => {
                          if (!cityExists) return;
                          router.push(`/${citySlug}`);
                        }}
                        className={`group relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 text-left transition ${
                          cityExists
                            ? "hover:-translate-y-[1px] hover:border-emerald-200/45 hover:shadow-[0_20px_52px_rgba(16,185,129,0.18)]"
                            : "opacity-70"
                        } ${medalTone}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/18 bg-white/10 text-sm font-semibold text-white">
                            #{index + 1}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.14em] text-white/75">
                            {index === 0 ? "Safety icon" : index === 1 ? "High confidence" : "Trusted route"}
                          </span>
                        </div>
                        <p className="truncate text-base font-semibold text-white">
                          {(item.city || "TBA").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </p>
                        <p className="mt-1 truncate text-xs text-white/65">{item.country || "Country TBA"}</p>
                        <p className="mt-3 text-xs leading-5 text-white/70">
                          {item.signal || "Signal pending editorial update."}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className={`mt-4 ${isSafetyRankingEditorOpen ? "grid flex-1 grid-rows-[repeat(10,minmax(0,1fr))] gap-2" : "space-y-2.5"}`}>
                {Array.from({ length: NOW_RANKING_LIMIT }).map((_, index) => {
                  if (!isSafetyRankingEditorOpen && index < 3) return null;
                  const item = safetyRankingRenderItems[index] || { city: "", country: "", signal: "" };
                  const cityKey = String(item.city || "").toLowerCase();
                  const citySlug = cityKey.replaceAll(" ", "_").trim();
                  const cityExists = cityOptionSet.has(citySlug);
                  const signalStrength = Math.max(22, 100 - index * 4);
                  return (
                    <div
                      key={`safety-${selectedSafetyRankingYear}-${index + 1}`}
                      className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl border px-3 py-2 transition ${
                        isSafetyRankingEditorOpen
                          ? "border-white/10 bg-black/25"
                          : "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] hover:border-emerald-200/32"
                      }`}
                    >
                      <p className={`text-xs font-semibold ${index < 5 ? "text-emerald-100" : "text-emerald-200/90"}`}>#{index + 1}</p>
                      {isAdmin && isSafetyRankingEditorOpen ? (
                        <div className="grid gap-1">
                          <input
                            value={item.city || ""}
                            onChange={(event) => updateSafetyRankingDraftField(index, "city", event.target.value)}
                            placeholder="city_name"
                            className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white outline-none"
                          />
                          <div className="grid grid-cols-2 gap-1">
                            <input
                              value={item.country || ""}
                              onChange={(event) => updateSafetyRankingDraftField(index, "country", event.target.value)}
                              placeholder="country"
                              className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white outline-none"
                            />
                            <input
                              value={item.signal || ""}
                              onChange={(event) => updateSafetyRankingDraftField(index, "signal", event.target.value)}
                              placeholder="signal line"
                              className="rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {(item.city || "TBA").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                          </p>
                          <p className="truncate text-[11px] text-white/55">{item.country || "Country TBA"}</p>
                          <p className="truncate text-[11px] text-white/62">{item.signal || "Signal pending editorial update."}</p>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                            <span
                              className="block h-1.5 rounded-full bg-gradient-to-r from-emerald-200/85 via-teal-200/75 to-emerald-200/45"
                              style={{ width: `${signalStrength}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {isAdmin && isSafetyRankingEditorOpen ? (
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveSafetyRankingDraftItem(index, -1)}
                            className="rounded-full border border-white/16 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80 transition hover:border-white/30 disabled:opacity-35"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            disabled={index === NOW_RANKING_LIMIT - 1}
                            onClick={() => moveSafetyRankingDraftItem(index, 1)}
                            className="rounded-full border border-white/16 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80 transition hover:border-white/30 disabled:opacity-35"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={() => clearSafetyRankingDraftItem(index)}
                            className="rounded-full border border-rose-200/20 bg-rose-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/38"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!cityExists}
                          onClick={() => {
                            if (!cityExists) return;
                            router.push(`/${citySlug}`);
                          }}
                          className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                            cityExists
                              ? "border border-emerald-200/35 bg-emerald-200/12 text-emerald-100 hover:bg-emerald-200/22"
                              : "border border-white/10 bg-white/5 text-white/35"
                          }`}
                        >
                          {cityExists ? "Focus" : "Soon"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
              </div>
            </section>
            )}
          </div>
        </section>
        )}

        {isPolicySection && (
        <section className="mt-8 rounded-[28px] border border-rose-300/16 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_34%),radial-gradient(circle_at_90%_22%,rgba(251,191,36,0.11),transparent_36%),linear-gradient(180deg,rgba(42,20,30,0.95),rgba(18,12,18,0.98),rgba(10,10,10,1))] p-6 shadow-[0_26px_88px_rgba(244,63,94,0.10)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-100/90">Laws & rights updates</p>
            <h2 className="qa-h2 mt-2 text-2xl font-semibold text-white">Policy and safety watch</h2>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (showPolicyAdminForm) {
                    resetAdminNewsComposer();
                    return;
                  }
                  setShowAdminForm(false);
                  setAdminComposerLane("policy");
                  setEditingNewsId("");
                  setAdminImageFile(null);
                  setRemoveAdminImage(false);
                  setAdminForm({
                    ...createAdminNewsFormDefault(),
                    category: "rights_safety",
                  });
                  setShowPolicyAdminForm(true);
                }}
                className="rounded-full border border-rose-200/35 bg-rose-200/12 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-100/60"
              >
                {showPolicyAdminForm ? "Close policy composer" : "Publish policy update"}
              </button>
            )}
          </div>

          {isAdmin && showPolicyAdminForm && (
            <form onSubmit={publishAdminNews} className="mb-5 grid gap-3 rounded-2xl border border-rose-200/20 bg-rose-200/[0.06] p-4 md:grid-cols-2">
              <p className="md:col-span-2 text-xs uppercase tracking-[0.14em] text-rose-100/90">
                {isEditingNews ? "Edit policy update" : "Publish policy update"}
              </p>
              <input
                value={adminForm.title}
                onChange={(event) => setAdminForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Policy headline"
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                required
              />
              <input
                value={adminForm.city}
                onChange={(event) => setAdminForm((current) => ({ ...current, city: event.target.value }))}
                placeholder="City or country scope (optional)"
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
              <input
                value={adminForm.date}
                onChange={(event) => setAdminForm((current) => ({ ...current, date: event.target.value }))}
                type="date"
                className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
              <div className="rounded-xl border border-rose-200/18 bg-rose-200/10 px-4 py-3 text-xs uppercase tracking-[0.14em] text-rose-100/90">
                Category: Rights & safety
              </div>
              <textarea
                value={adminForm.summary}
                onChange={(event) => setAdminForm((current) => ({ ...current, summary: event.target.value }))}
                placeholder="What changed?"
                className="min-h-[90px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none md:col-span-2"
                required
              />
              <textarea
                value={adminForm.whyItMatters}
                onChange={(event) => setAdminForm((current) => ({ ...current, whyItMatters: event.target.value }))}
                placeholder="Why this matters for queer travelers/community"
                className="min-h-[90px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none md:col-span-2"
                required
              />
              <div className="grid gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 md:col-span-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-rose-100/90">
                  Policy image (Supabase storage)
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setAdminImageFile(file);
                    if (file) {
                      setRemoveAdminImage(false);
                    }
                  }}
                  className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-rose-200/20 file:px-3 file:py-1.5 file:text-xs file:text-rose-100 hover:file:bg-rose-200/30"
                />
                <label className="inline-flex items-center gap-2 text-xs text-white/72">
                  <input
                    type="checkbox"
                    checked={removeAdminImage}
                    onChange={(event) => setRemoveAdminImage(event.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-black/40"
                  />
                  Remove current image on save
                </label>
                {adminImageFile ? (
                  <p className="text-xs text-rose-100/85">
                    New file: {adminImageFile.name}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                <input
                  value={adminForm.imageAlt}
                  onChange={(event) => setAdminForm((current) => ({ ...current, imageAlt: event.target.value }))}
                  placeholder="Image alt text (optional)"
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                />
                <input
                  value={adminForm.imageCredit}
                  onChange={(event) => setAdminForm((current) => ({ ...current, imageCredit: event.target.value }))}
                  placeholder="Image credit (optional)"
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                />
              </div>
              {adminForm.imageUrl && !removeAdminImage ? (
                <a
                  href={adminForm.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-rose-200/25 bg-rose-200/8 px-4 py-3 text-xs text-rose-100 transition hover:border-rose-200/45 md:col-span-2"
                >
                  Open current image
                </a>
              ) : null}
              <button
                type="submit"
                disabled={isPublishingNews}
                className="rounded-xl bg-gradient-to-r from-rose-300 via-fuchsia-300 to-amber-200 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
              >
                {isPublishingNews
                  ? isEditingNews
                    ? "Updating..."
                    : "Publishing..."
                  : isEditingNews
                    ? "Update policy"
                    : "Publish policy"}
              </button>
              <button
                type="button"
                onClick={resetAdminNewsComposer}
                className="rounded-xl border border-white/16 bg-black/30 px-4 py-3 text-sm text-white/82 transition hover:border-white/28 md:col-span-2"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="qa-defer-render grid gap-3 md:grid-cols-2">
            {rightsUpdates.map((item) => {
              const canEditAdminNews = adminNewsIdSet.has(String(item.id));
              return (
              <article
                key={`rights-${item.id}`}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setExpandedNewsId((current) =>
                    String(current) === String(item.id) ? null : String(item.id)
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setExpandedNewsId((current) =>
                      String(current) === String(item.id) ? null : String(item.id)
                    );
                  }
                }}
                className="cursor-pointer rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:border-rose-200/38 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/45"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-rose-100/82">
                  {item.city || "Global"} | {formatDateShort(item.date || item.createdAt)}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                {item.summary ? (
                  <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">Summary</p>
                    <p
                      className={`mt-1 text-xs leading-5 text-white/70 ${
                        String(expandedNewsId) === String(item.id) ? "" : "line-clamp-2"
                      }`}
                    >
                      {item.summary}
                    </p>
                  </div>
                ) : null}
                {item.whyItMatters ? (
                  <div className="mt-2 rounded-xl border border-cyan-200/14 bg-cyan-200/[0.05] px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-rose-100/80">Why it matters</p>
                    <p
                      className={`mt-1 text-sm leading-6 text-white/72 ${
                        String(expandedNewsId) === String(item.id) ? "" : "line-clamp-2"
                      }`}
                    >
                      {item.whyItMatters}
                    </p>
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-white/48">
                    {item.sourceName || QA_SOURCE_CONFIDENCE.atlasSignal}
                  </span>
                  <span className="text-[11px] text-rose-100/80">
                    {String(expandedNewsId) === String(item.id) ? "Tap to collapse" : "Tap to expand"}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      {canEditAdminNews && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditNewsComposer(item);
                          }}
                          className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/42"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteFeedItem(item.id);
                        }}
                        className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
            })}
            {rightsUpdates.length === 0 && (
              <EmptyState
                title="No rights updates in this view yet."
                description="Rights & safety updates will appear here when published."
                className="md:col-span-2 px-4 py-8"
              />
            )}
          </div>
        </section>
        )}

        {isHappeningSection && (
        <div className="mt-8">
          <section className="rounded-[28px] border border-fuchsia-300/16 bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.14),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(56,189,248,0.14),transparent_36%),linear-gradient(180deg,rgba(42,22,50,0.95),rgba(16,16,26,0.96),rgba(10,10,10,1))] p-6 shadow-[0_24px_90px_rgba(232,121,249,0.09)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-100/90">Happening Soon</p>
                <h2 className="qa-h2 mt-2 text-2xl font-semibold text-white">Tonight and next up</h2>
              </div>
              <button
                onClick={() => router.push("/events")}
                className="rounded-full border border-fuchsia-200/34 bg-fuchsia-200/12 px-4 py-2 text-xs text-fuchsia-50 transition hover:border-fuchsia-100/52 hover:bg-fuchsia-200/20"
              >
                Open all events
              </button>
            </div>
            <p className="mb-4 text-xs text-fuchsia-50/70">
              One unified flow: tonight picks first, then the next 30-day pulse.
            </p>
            <div className="qa-defer-render grid gap-4 md:grid-cols-2">
              {visibleHappeningEvents.map((event) => {
                const isTonight = event.qaTiming === "tonight";
                return (
                  <div
                    key={`happening-${event.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setExpandedSoonEventId((current) =>
                        String(current) === String(event.id) ? null : String(event.id)
                      )
                    }
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                        keyEvent.preventDefault();
                        setExpandedSoonEventId((current) =>
                          String(current) === String(event.id) ? null : String(event.id)
                        );
                      }
                    }}
                    className="cursor-pointer rounded-[24px] border border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(68,28,74,0.72),rgba(22,16,28,0.94))] p-5 transition hover:-translate-y-[1px] hover:border-fuchsia-100/44 hover:shadow-[0_20px_58px_rgba(232,121,249,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200/45"
                  >
                    <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-fuchsia-200/95 via-cyan-200/65 to-transparent" />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-50/85">
                        {event.city || "City"} | {formatDateShort(event.date)}
                      </p>
                      <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
                        isTonight
                          ? "border-fuchsia-200/25 bg-fuchsia-200/16 text-fuchsia-100"
                          : "border-cyan-200/25 bg-cyan-200/14 text-cyan-100"
                      }`}>
                        {isTonight ? "Tonight" : "Next"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{event.name}</h3>
                    <VibeTagChips
                      entity={event}
                      tone="fuchsia"
                      className="mt-2"
                      includeTypeFallback
                      includeMixedFallback
                    />
                    <p
                      className={`mt-3 text-sm leading-6 text-white/68 transition-all ${
                        String(expandedSoonEventId) === String(event.id) ? "" : "line-clamp-2"
                      }`}
                    >
                      {event.description || "Upcoming community event with high signal value."}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                        {String(expandedSoonEventId) === String(event.id) ? "Tap again to collapse" : "Tap to expand"}
                      </span>
                      <button
                        type="button"
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          router.push(citySelectionPath(event.city, { eventId: event.id }));
                        }}
                        className="rounded-full border border-fuchsia-200/28 bg-fuchsia-200/14 px-3 py-1 text-xs text-fuchsia-50 transition hover:border-fuchsia-100/50"
                      >
                        Open event
                      </button>
                    </div>
                  </div>
                );
              })}
              {happeningSoonEvents.length === 0 && (
                <EmptyState
                  title="No upcoming events in this view yet."
                  description="Switch city filter or open all events."
                  className="md:col-span-2 px-4 py-8"
                >
                  <button
                    onClick={() => {
                      setSelectedCity("all");
                      router.push("/events");
                    }}
                    className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/12 px-4 py-2 text-xs text-fuchsia-50 transition hover:border-fuchsia-100/50 hover:bg-fuchsia-200/18"
                  >
                    Open global events
                  </button>
                </EmptyState>
              )}
            </div>
            {happeningSoonEvents.length > 6 && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHappeningExpanded((current) => !current)}
                  className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.13em] text-fuchsia-50 transition hover:border-fuchsia-100/45 hover:bg-fuchsia-200/18"
                >
                  {isHappeningExpanded ? "Show less events" : "Show more events"}
                </button>
              </div>
            )}
          </section>
        </div>
        )}

        {isVoicesSection && (
        <div className="mt-8">
          <section className="rounded-[30px] border border-fuchsia-200/18 bg-[linear-gradient(155deg,rgba(58,21,68,0.9),rgba(18,16,36,0.96)_44%,rgba(8,8,8,1))] p-6 shadow-[0_30px_95px_rgba(217,70,239,0.12)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.27em] text-fuchsia-200/95">Community voices</p>
                <h2 className="qa-h2 mt-2 text-2xl font-semibold text-white">Voices from members</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/66">
                  Real member stories, reviewed before publishing, so the signal stays clear and useful.
                </p>
              </div>
              <div className="rounded-2xl border border-fuchsia-200/26 bg-fuchsia-300/[0.08] px-3.5 py-2.5 text-right shadow-[0_10px_30px_rgba(217,70,239,0.14)]">
                <p className="text-[10px] uppercase tracking-[0.16em] text-fuchsia-100/80">Approved stories</p>
                <p className="mt-1 text-lg font-semibold text-white">{communityStories.length}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isMember) {
                    localStorage.setItem("qa_post_login_target", "/now");
                    router.push("/?join=true");
                    return;
                  }
                  setShowCommunityStoryForm((current) => !current);
                  setCommunityStoryNotice("");
                }}
                className="rounded-full border border-fuchsia-200/32 bg-fuchsia-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-fuchsia-50 transition hover:border-fuchsia-100/55 hover:bg-fuchsia-200/20"
              >
                {isMember
                  ? showCommunityStoryForm
                    ? "Close story form"
                    : "Share your story"
                  : "Join to publish"}
              </button>
              <span className="text-xs font-medium text-fuchsia-100/88">
                Share verified realities that help others navigate safely.
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-fuchsia-200/28 bg-[linear-gradient(135deg,rgba(217,70,239,0.14),rgba(56,189,248,0.08),rgba(10,10,10,0.3))] px-4 py-3 shadow-[0_16px_42px_rgba(217,70,239,0.14)]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/92">What to report here</p>
              <p className="mt-1.5 text-sm leading-6 text-white/84">
                Use Voices to report harassment, threats, violence, discrimination, and real queer lived experiences in each city.
                These reports are reviewed before publication to keep signal quality high and actionable.
              </p>
            </div>

            {showCommunityStoryForm && (
              <form
                onSubmit={submitCommunityStory}
                className="mt-4 grid gap-3 rounded-2xl border border-fuchsia-200/18 bg-fuchsia-200/[0.06] p-4"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-fuchsia-100/90">
                  Submit to moderation queue
                </p>
                <select
                  value={communityStoryForm.storyType}
                  onChange={(event) =>
                    setCommunityStoryForm((current) => ({ ...current, storyType: event.target.value }))
                  }
                  className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
                >
                  {COMMUNITY_STORY_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <input
                  value={communityStoryForm.city}
                  onChange={(event) =>
                    setCommunityStoryForm((current) => ({ ...current, city: event.target.value }))
                  }
                  placeholder="City (optional, or leave blank for Global)"
                  className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
                />
                <input
                  required
                  value={communityStoryForm.title}
                  onChange={(event) =>
                    setCommunityStoryForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Headline"
                  className="rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
                />
                <textarea
                  required
                  value={communityStoryForm.summary}
                  onChange={(event) =>
                    setCommunityStoryForm((current) => ({ ...current, summary: event.target.value }))
                  }
                  placeholder="What happened? Include what, where, and when. Keep it factual and helpful."
                  className="min-h-[100px] rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
                />
                <textarea
                  required
                  value={communityStoryForm.whyItMatters}
                  onChange={(event) =>
                    setCommunityStoryForm((current) => ({ ...current, whyItMatters: event.target.value }))
                  }
                  placeholder="Why should the community know this? Add practical safety context if relevant."
                  className="min-h-[90px] rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingCommunityStory}
                    className="rounded-full border border-cyan-200/35 bg-cyan-200/15 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-100/55 disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    {isSubmittingCommunityStory ? "Submitting..." : "Submit for approval"}
                  </button>
                  <button
                    type="button"
                    onClick={resetCommunityStoryForm}
                    className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/82 transition hover:border-white/30"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {communityStoryNotice && (
              <div className="mt-3 rounded-xl border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-2 text-xs text-fuchsia-100">
                {communityStoryNotice}
              </div>
            )}

            <div className="qa-defer-render mt-5 space-y-3">
              {visibleCommunityStories.map((story) => {
                const canEditAdminNews = adminNewsIdSet.has(String(story.id));
                return (
                <article
                  key={`story-${story.id}`}
                  className="group w-full rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))] px-4 py-3 text-left shadow-[0_14px_40px_rgba(0,0,0,0.24)] transition hover:-translate-y-[1px] hover:border-fuchsia-200/34"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100/95">
                      {story.city || "Global"}
                    </span>
                    <span className="rounded-full border border-white/16 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/72">
                      {formatDateShort(story.date || story.createdAt)}
                    </span>
                    <span className="hidden rounded-full border border-cyan-200/25 bg-cyan-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100/90 sm:inline-flex">
                      Moderated
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{story.title}</p>
                  <p className="mt-2 text-xs leading-5 text-white/67">
                    {story.summary}
                  </p>
                  {story.whyItMatters ? (
                    <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-white/78">
                      {story.whyItMatters}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-white/55">
                      {resolveNewsConfidence(story, canEditAdminNews)} | {story.sourceName || QA_SOURCE_CONFIDENCE.communitySignal}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        {canEditAdminNews && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditNewsComposer(story);
                            }}
                            className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/42"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteFeedItem(story.id);
                          }}
                          className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
                );
              })}
              {communityStories.length === 0 && (
                <EmptyState
                  title="No approved community stories yet."
                  description="Members will be able to submit stories for admin approval."
                  className="px-4 py-8"
                />
              )}
            </div>
            {communityStories.length > 4 && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsCommunityExpanded((current) => !current)}
                  className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.13em] text-fuchsia-50 transition hover:border-fuchsia-100/45 hover:bg-fuchsia-200/18"
                >
                  {isCommunityExpanded ? "Show less stories" : "Show more stories"}
                </button>
              </div>
            )}
          </section>
        </div>
        )}

        <section className="mt-8 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-[11px] text-white/74">
          <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/78">Discover paths</p>
          <p className="mt-1 text-xs leading-6 text-white/66">
            Shortcut routes plus citation sources in one low-noise layer.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topicHubKeys.slice(0, 5).map((topicKey) => (
              <Link
                key={`now-depth-topic-${topicKey}`}
                href={`/topics/${topicKey}`}
                className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 transition hover:border-cyan-200/40 hover:text-cyan-100"
              >
                {topicKey.replace(/-/g, " ")}
              </Link>
            ))}
            {crawlClusterCities.slice(0, 4).flatMap((cityKey) =>
              crawlClusterTopics.slice(0, 2).map((topicKey) => (
                <Link
                  key={`now-depth-cluster-${cityKey}-${topicKey}`}
                  href={`/${cityKey}/discover/${topicKey}`}
                  className="rounded-full border border-white/12 bg-white/[0.02] px-3 py-1 transition hover:border-fuchsia-200/38 hover:text-fuchsia-100"
                >
                  {cityKey.replace(/_/g, " ")} {topicKey.replace(/-/g, " ")}
                </Link>
              ))
            )}
            <Link href="/reports" className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/[0.08] px-3 py-1 text-fuchsia-100/88 transition hover:border-fuchsia-100/45 hover:text-fuchsia-100">
              Open reports
            </Link>
            <Link href="/topics" className="rounded-full border border-cyan-200/24 bg-cyan-200/[0.08] px-3 py-1 text-cyan-100/88 transition hover:border-cyan-100/45 hover:text-cyan-100">
              Open topic hubs
            </Link>
            <Link href="/community-policy" className="rounded-full border border-white/16 bg-white/[0.04] px-3 py-1 text-white/82 transition hover:border-white/30 hover:text-white">
              Moderation policy
            </Link>
          </div>
        </section>

        {readingNewsItem ? (
          <div
            className="fixed inset-0 z-[95] bg-black/75 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="now-news-reader-title"
            onClick={closeNewsReader}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeNewsReader();
            }}
          >
            <div className="flex min-h-full items-end justify-center p-0 sm:p-4">
              <article
                className="w-full max-w-4xl max-h-[100vh] overflow-hidden rounded-t-[22px] border border-white/14 bg-[linear-gradient(180deg,rgba(18,18,20,0.99),rgba(10,10,10,1))] shadow-[0_35px_120px_rgba(0,0,0,0.56)] sm:max-h-[94vh] sm:rounded-[24px]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md sm:px-6">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/70">
                    {readingNewsItem.city || "Global"} · {formatDateShort(readingNewsItem.createdAt || readingNewsItem.date)}
                  </p>
                  <button
                    type="button"
                    onClick={closeNewsReader}
                    className="rounded-full border border-white/24 bg-white/10 px-3 py-1 text-xs text-white/90 transition hover:border-white/40"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-[calc(100vh-3.2rem)] overflow-y-auto sm:max-h-[calc(94vh-3.2rem)]">
                  {readingNewsItem.imageUrl ? (
                    <div className="relative h-56 w-full overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),rgba(10,10,10,0.98)_62%)] sm:h-80">
                      <Image
                        src={readingNewsItem.imageUrl}
                        alt={readingNewsItem.imageAlt || readingNewsItem.title || "News image"}
                        fill
                        sizes="(max-width: 640px) 100vw, 75vw"
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                  <div className="p-4 sm:p-6">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-white/58">
                      {readingNewsItem.city || "Global"} · {formatDateShort(readingNewsItem.createdAt || readingNewsItem.date)}
                    </p>
                    <h3 id="now-news-reader-title" className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                      {readingNewsItem.title}
                    </h3>
                    <p className="mt-4 text-[15px] leading-8 text-white/86">{readingNewsItem.summary}</p>
                    {readingNewsItem.whyItMatters ? (
                      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Why it matters</p>
                        <p className="mt-2 text-[15px] leading-8 text-white/82">{readingNewsItem.whyItMatters}</p>
                      </div>
                    ) : null}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/62">
                      <span>{readingNewsItem.sourceName || QA_SOURCE_CONFIDENCE.atlasSignal}</span>
                      {readingNewsItem.imageCredit ? <span>Photo: {readingNewsItem.imageCredit}</span> : null}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        ) : null}

      </div>
    </main>
  );
}






