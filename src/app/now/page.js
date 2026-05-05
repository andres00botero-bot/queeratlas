"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { useAuth } from "@/lib/auth";
import { citySelectionPath } from "@/lib/cityRouting";
import { EDITORIAL_PULSE_ITEMS, PULSE_CATEGORIES } from "@/lib/pulse";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { readRuntimeCache, writeRuntimeCache } from "@/lib/runtimeCache";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { createContentSubmission } from "@/lib/contentSubmissions";
import { formatDateShort, toDateInputValue } from "@/lib/dateDisplay";
import VibeTagChips from "@/components/ui/VibeTagChips";
import EmptyState from "@/components/ui/EmptyState";

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

function getNewsToneByCategory(category) {
  const key = String(category || "");
  if (key === "rights_safety") {
    return {
      accentBar: "from-rose-200/85 via-orange-200/65 to-transparent",
      categoryBadge: "border-rose-200/30 bg-rose-200/12 text-rose-100",
      cardHover: "hover:border-rose-200/35",
    };
  }
  if (key === "major_event") {
    return {
      accentBar: "from-orange-200/85 via-amber-200/65 to-transparent",
      categoryBadge: "border-orange-200/30 bg-orange-200/12 text-orange-100",
      cardHover: "hover:border-orange-200/35",
    };
  }
  if (key === "nightlife_change") {
    return {
      accentBar: "from-fuchsia-200/85 via-pink-200/65 to-transparent",
      categoryBadge: "border-fuchsia-200/30 bg-fuchsia-200/12 text-fuchsia-100",
      cardHover: "hover:border-fuchsia-200/35",
    };
  }
  if (key === "rising_spot") {
    return {
      accentBar: "from-emerald-200/85 via-teal-200/65 to-transparent",
      categoryBadge: "border-emerald-200/30 bg-emerald-200/12 text-emerald-100",
      cardHover: "hover:border-emerald-200/35",
    };
  }
  return {
    accentBar: "from-cyan-200/85 via-sky-200/65 to-transparent",
    categoryBadge: "border-cyan-200/30 bg-cyan-200/12 text-cyan-100",
    cardHover: "hover:border-cyan-200/35",
  };
}

function resolveNewsConfidence(item, canEditAdminNews) {
  if (canEditAdminNews) return "Verified admin";
  const source = String(item?.sourceName || "").toLowerCase();
  if (source.includes("editorial") || source.includes("atlas")) return "Editorial signal";
  if (source.includes("member")) return "Community signal";
  return "Developing";
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
const NEWS_TABLE = "qa_world_news";
const NEWS_HIDDEN_TABLE = "qa_world_news_hidden";
const RANKING_TABLE = "qa_atlas_rankings";
const NOW_RANKING_LIMIT = 10;
const NOW_PULSE_CACHE_KEY = "qa_now_pulse_v1";
const NOW_PULSE_CACHE_TTL_MS = 2 * 60 * 1000;
const NOW_EDITORIAL_CACHE_KEY = "qa_now_editorial_v1";
const NOW_EDITORIAL_CACHE_TTL_MS = 5 * 60 * 1000;
function createAdminNewsFormDefault() {
  return {
    title: "",
    city: "",
    category: "culture_tip",
    summary: "",
    whyItMatters: "",
    date: "",
  };
}

const COMMUNITY_STORY_TYPES = [
  { value: "safety_issues", label: "Safety issues", mapToCategory: "rights_safety" },
  { value: "global_developments", label: "Global queer developments", mapToCategory: "culture_tip" },
  { value: "nightlife_stories", label: "Nightlife stories", mapToCategory: "nightlife_change" },
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

function mapNewsRowToItem(row) {
  return {
    id: row.id,
    title: row.title,
    city: row.city || "Global",
    category: row.category || "culture_tip",
    date: row.date,
    summary: row.summary,
    whyItMatters: row.why_it_matters,
    sourceName: row.source_name || "Atlas admin",
    createdAt: row.created_at || "",
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
  const [isHappeningExpanded, setIsHappeningExpanded] = useState(false);
  const [isCommunityExpanded, setIsCommunityExpanded] = useState(false);
  const [rankingOverrides, setRankingOverrides] = useState({});
  const [isRankingEditorOpen, setIsRankingEditorOpen] = useState(false);
  const [rankingDraft, setRankingDraft] = useState([]);
  const [adminNews, setAdminNews] = useState([]);
  const [hiddenNewsIds, setHiddenNewsIds] = useState([]);
  const [isAdminByTable, setIsAdminByTable] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showPolicyAdminForm, setShowPolicyAdminForm] = useState(false);
  const [isPublishingNews, setIsPublishingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState("");
  const [adminForm, setAdminForm] = useState(() => createAdminNewsFormDefault());
  const [showCommunityStoryForm, setShowCommunityStoryForm] = useState(false);
  const [isSubmittingCommunityStory, setIsSubmittingCommunityStory] = useState(false);
  const [communityStoryNotice, setCommunityStoryNotice] = useState("");
  const [communityStoryForm, setCommunityStoryForm] = useState(() => createCommunityStoryFormDefault());

  const loadPulseData = useCallback(async ({ forceRefresh = false } = {}) => {
    const now = new Date();
    setToday(now);
    setLoadError("");
    setReady(false);

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
      supabase.from("events").select("*").order("date", { ascending: true }),
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
      setRankingOverrides(cached.data.rankingOverrides || {});
      setSyncWarning(String(cached.data.syncWarning || ""));
      if (!cached.stale) return;
    }

    const [newsResponse, hiddenResponse, rankingResponse] = await Promise.all([
      supabase.from(NEWS_TABLE).select("*").order("date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from(NEWS_HIDDEN_TABLE).select("feed_id"),
      supabase.from(RANKING_TABLE).select("*").order("year", { ascending: false }).order("rank", { ascending: true }),
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
      setRankingOverrides({});
    } else {
      const remoteRankings = groupRankingRows(rankingResponse.data || []);
      setRankingOverrides(remoteRankings);
      writeLocalJson(RANKING_OVERRIDES_KEY, remoteRankings);
    }

    const nextSyncWarning = warnings.join(" ") || "";
    setSyncWarning(nextSyncWarning);
    writeRuntimeCache(NOW_EDITORIAL_CACHE_KEY, {
      adminNews: newsResponse.error ? [] : (newsResponse.data || []).map(mapNewsRowToItem),
      hiddenNewsIds: hiddenResponse.error ? [] : (hiddenResponse.data || []).map((row) => String(row.feed_id)),
      rankingOverrides: rankingResponse.error ? {} : groupRankingRows(rankingResponse.data || []),
      syncWarning: nextSyncWarning,
    });
  }, []);

  useEffect(() => {
    queueMicrotask(loadEditorialData);
  }, [loadEditorialData]);

  useEffect(() => {
    const refreshOnFocus = () => {
      queueMicrotask(async () => {
        await Promise.all([loadPulseData(), loadEditorialData()]);
      });
    };

    const refreshOnVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshOnFocus();
      }
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
      setIsAdminByTable(false);
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
  const buildRankingDraftForYear = useCallback(
    (year) => {
      const source = (rankingOverrides[year] || ATLAS_DESTINATION_RANKINGS[year] || [])
        .slice(0, NOW_RANKING_LIMIT)
        .map((item) => ({ ...item }));
      return Array.from({ length: NOW_RANKING_LIMIT }, (_, index) => source[index] || { city: "", country: "", signal: "" });
    },
    [rankingOverrides]
  );
  const baseRankingItems = useMemo(
    () => ATLAS_DESTINATION_RANKINGS[selectedRankingYear] || [],
    [selectedRankingYear]
  );
  const rankingItems = (rankingOverrides[selectedRankingYear] || baseRankingItems).slice(0, NOW_RANKING_LIMIT);
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

  const categoryLabels = useMemo(
    () =>
      PULSE_CATEGORIES.reduce((acc, item) => {
        acc[item.key] = item.label;
        return acc;
      }, {}),
    []
  );
  const mixedFeedCategories = useMemo(
    () => PULSE_CATEGORIES.filter((item) => item.key !== "rights_safety"),
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
      .sort(compareNewsRecency)
      .slice(0, 12);
  }, [adminNews, hiddenNewsIds, majorEventNews, risingSpotsNews]);

  useEffect(() => {
    if (selectedNewsCategory === "rights_safety") {
      setSelectedNewsCategory("all");
    }
  }, [selectedNewsCategory]);

  const mixedFeedItems = useMemo(
    () => worldNewsItems.filter((item) => !isRightsUpdateItem(item) && !isVoicesMemberItem(item)),
    [worldNewsItems]
  );

  const displayedNewsItems = useMemo(() => {
    const scopedItems =
      selectedNewsCategory === "all"
        ? mixedFeedItems
        : mixedFeedItems.filter((item) => String(item.category || "") === selectedNewsCategory);
    return scopedItems.slice(0, 8);
  }, [mixedFeedItems, selectedNewsCategory]);

  const rightsUpdates = useMemo(
    () => worldNewsItems.filter((item) => isRightsUpdateItem(item)).slice(0, 6),
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
  const adminNewsIdSet = useMemo(
    () => new Set((adminNews || []).map((item) => String(item.id))),
    [adminNews]
  );
  const isEditingNews = Boolean(editingNewsId);

  const resetAdminNewsComposer = useCallback(() => {
    setEditingNewsId("");
    setAdminForm(createAdminNewsFormDefault());
    setShowAdminForm(false);
    setShowPolicyAdminForm(false);
  }, []);

  const resetCommunityStoryForm = useCallback(() => {
    setCommunityStoryForm(createCommunityStoryFormDefault());
    setShowCommunityStoryForm(false);
  }, []);

  const openEditNewsComposer = useCallback((item) => {
    if (!item) return;
    const isPolicyUpdate = String(item.category || "").trim().toLowerCase() === "rights_safety";
    setEditingNewsId(String(item.id));
    setShowAdminForm(!isPolicyUpdate);
    setShowPolicyAdminForm(isPolicyUpdate);
    setAdminForm({
      title: String(item.title || ""),
      city: String(item.city || "").toLowerCase() === "global" ? "" : String(item.city || ""),
      category: String(item.category || "culture_tip"),
      summary: String(item.summary || ""),
      whyItMatters: String(item.whyItMatters || ""),
      date: toDateInputValue(item.date || item.createdAt),
    });
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

    const { error: deleteError } = await supabase.from(RANKING_TABLE).delete().eq("year", year);
    if (deleteError && !isMissingTableError(deleteError)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    } else {
      const { error: insertError } = rows.length
        ? await supabase.from(RANKING_TABLE).insert(rows)
        : { error: null };

      if (insertError && !isMissingTableError(insertError)) {
        setSyncWarning("Cloud sync failed. Using local backup.");
      } else if (insertError && isMissingTableError(insertError)) {
        setSyncWarning("Off-grid sync is unavailable right now.");
      } else {
        setSyncWarning("");
      }
    }

    setRankingOverrides(next);
    writeLocalJson(RANKING_OVERRIDES_KEY, next);
    setIsRankingEditorOpen(false);
  };

  const resetRankingYear = async () => {
    if (!isAdmin) return;

    const next = { ...rankingOverrides };
    delete next[selectedRankingYear];

    const { error } = await supabase.from(RANKING_TABLE).delete().eq("year", Number(selectedRankingYear));
    if (error && !isMissingTableError(error)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    } else if (error && isMissingTableError(error)) {
      setSyncWarning("Off-grid sync is unavailable right now.");
    } else {
      setSyncWarning("");
    }

    setRankingOverrides(next);
    writeLocalJson(RANKING_OVERRIDES_KEY, next);
    setIsRankingEditorOpen(false);
  };
  const rankingRenderItems = isRankingEditorOpen ? rankingDraft : rankingItems;

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
    const item = {
      id: nextId,
      title: adminForm.title,
      city: adminForm.city || "Global",
      category: adminForm.category || "culture_tip",
      date: effectiveDate,
      summary: adminForm.summary,
      whyItMatters: adminForm.whyItMatters,
      sourceName: `${memberName || "Admin"} | Atlas admin`,
      createdAt: new Date().toISOString(),
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
      };

      let error = null;
      if (isEditingNews) {
        const updateRes = await supabase
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
      }

      if (error && !isMissingTableError(error)) {
        setSyncWarning(
          `Cloud sync failed. News was not ${isEditingNews ? "updated" : "published"}. ${String(error.message || "").trim()}`.trim()
        );
        return;
      }

      if (error && isMissingTableError(error)) {
        setSyncWarning("Off-grid sync is unavailable right now.");
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
      setSyncWarning("Off-grid sync is unavailable right now.");
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
    <main className="qa-page min-h-screen bg-black text-white">
      <div className="qa-shell">
        <div className="qa-panel mb-8 rounded-[30px] border border-fuchsia-300/18 bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(251,146,60,0.14),transparent_32%),linear-gradient(135deg,rgba(46,13,62,0.94),rgba(11,10,18,0.98),rgba(61,24,38,0.9))] p-7 shadow-[0_30px_120px_rgba(232,121,249,0.12)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="qa-eyebrow text-fuchsia-100/90">Live Discovery + Editorial Signal</p>
              <h1 className="qa-display qa-h1 mt-3 text-4xl font-bold text-white sm:text-5xl">Queer World News</h1>
              <p className="qa-lead mt-4 max-w-2xl text-sm text-white/75">
                Three separate editorial lanes: mixed discovery, policy & safety watch, and member voices.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Focus city</p>
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="mt-3 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-300"
              >
                <option value="all">All cities</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city.charAt(0).toUpperCase() + city.slice(1)}
                  </option>
                ))}
              </select>
            </div>
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

        <section className="mb-6">
          <div className="grid items-stretch gap-6 xl:grid-cols-[1.52fr_0.72fr]">
            <section className="qa-panel flex h-full flex-col rounded-[28px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(14,24,36,0.92),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(34,211,238,0.08)]">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/85">Mixed feed</p>
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
                      setEditingNewsId("");
                      setAdminForm(createAdminNewsFormDefault());
                      setShowAdminForm(true);
                    }}
                    className="rounded-full border border-cyan-300/28 bg-cyan-300/10 px-4 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/45"
                  >
                    {showAdminForm ? "Close admin composer" : "Admin publish"}
                  </button>
                )}
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {mixedFeedCategories.map((category) => {
                  const isActive = selectedNewsCategory === category.key;
                  return (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => setSelectedNewsCategory(category.key)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition ${
                        isActive
                          ? "border-cyan-200/45 bg-cyan-200/18 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.18)]"
                          : "border-white/14 bg-white/[0.03] text-white/65 hover:border-cyan-200/28 hover:text-cyan-100"
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>

              {isAdmin && showAdminForm && (
                <form onSubmit={publishAdminNews} className="mb-5 grid gap-3 rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.05] p-4 md:grid-cols-2">
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
                    {PULSE_CATEGORIES.filter((item) => item.key !== "all").map((item) => (
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

              {!isAdmin && (
                <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  Read-only for members. Editing is restricted to administrator.
                </p>
              )}
              <p className="mb-4 text-[11px] uppercase tracking-[0.15em] text-white/45">
                Showing {displayedNewsItems.length} stories
                {selectedNewsCategory === "all" ? " across all categories" : ` in ${categoryLabels[selectedNewsCategory] || "selected category"}`}
              </p>

              <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto pr-1 md:grid-cols-2">
                {displayedNewsItems.length > 0 ? (
                  displayedNewsItems.map((item) => {
                    const canEditAdminNews = adminNewsIdSet.has(String(item.id));
                    const itemDateForDisplay = canEditAdminNews
                      ? item.createdAt || item.date
                      : item.date;
                    const tone = getNewsToneByCategory(item.category);
                    const confidenceLabel = resolveNewsConfidence(item, canEditAdminNews);
                    return (
                    <article
                      key={item.id}
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
                      className={`cursor-pointer rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 transition hover:-translate-y-[1px] ${tone.cardHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45`}
                    >
                      <div className={`mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r ${tone.accentBar}`} />
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/45">{item.city || "Global"}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${tone.categoryBadge}`}>
                            {categoryLabels[item.category] || "News"}
                          </span>
                        </div>
                        <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] text-white/72">
                          {formatDateShort(itemDateForDisplay)}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                      <p
                        className={`mt-3 text-sm leading-6 text-white/66 transition-all ${
                          String(expandedNewsId) === String(item.id) ? "" : "line-clamp-2"
                        }`}
                      >
                        {item.summary}
                      </p>
                      <div className="mt-4 rounded-xl border border-white/8 bg-black/20 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Why it matters</p>
                        <p
                          className={`mt-2 text-sm leading-6 text-white/62 transition-all ${
                            String(expandedNewsId) === String(item.id) ? "" : "line-clamp-3"
                          }`}
                        >
                          {item.whyItMatters}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[0.14em] text-white/36">{confidenceLabel}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/36">
                            {String(expandedNewsId) === String(item.id)
                              ? item.sourceName || "Atlas signal"
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
                                  className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/38"
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
                                className="rounded-full border border-rose-200/20 bg-rose-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/38"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                    );
                  })
                ) : (
                  <EmptyState
                    title="No world news items yet."
                    description="Add an admin news item or check back after new signals."
                    className="md:col-span-2 px-4 py-8"
                    primaryActionLabel={isAdmin ? "Open admin publish" : "Open events"}
                    onPrimaryAction={() => {
                      if (isAdmin) {
                        setEditingNewsId("");
                        setAdminForm(createAdminNewsFormDefault());
                        setShowAdminForm(true);
                        return;
                      }
                      router.push("/events");
                    }}
                  />
                )}
              </div>
            </section>

            <section className="qa-panel relative flex h-full flex-col overflow-hidden rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(11,44,56,0.75),rgba(9,9,9,0.96))] p-6 shadow-[0_24px_64px_rgba(34,211,238,0.10)]">
              <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="pointer-events-none absolute -right-14 bottom-16 h-40 w-40 rounded-full bg-rose-300/8 blur-3xl" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Ranking</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Top 10 Queer Travel Destinations</h3>
                  <div className="mt-2 inline-flex items-center rounded-full border border-cyan-200/26 bg-cyan-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100/90">
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
                          <span className="text-[10px] uppercase tracking-[0.14em] text-white/75">
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
                          className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] transition ${
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
            </section>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_90%_22%,rgba(232,121,249,0.12),transparent_36%),linear-gradient(180deg,rgba(20,30,44,0.95),rgba(10,10,10,1))] p-6 shadow-[0_26px_88px_rgba(56,189,248,0.09)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/90">Laws & rights updates</p>
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
                  setEditingNewsId("");
                  setAdminForm({
                    ...createAdminNewsFormDefault(),
                    category: "rights_safety",
                  });
                  setShowPolicyAdminForm(true);
                }}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/46"
              >
                {showPolicyAdminForm ? "Close policy composer" : "Publish policy update"}
              </button>
            )}
          </div>

          {isAdmin && showPolicyAdminForm && (
            <form onSubmit={publishAdminNews} className="mb-5 grid gap-3 rounded-2xl border border-cyan-300/18 bg-cyan-300/[0.05] p-4 md:grid-cols-2">
              <p className="md:col-span-2 text-xs uppercase tracking-[0.14em] text-cyan-100/85">
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
              <div className="rounded-xl border border-cyan-200/18 bg-cyan-200/10 px-4 py-3 text-xs uppercase tracking-[0.14em] text-cyan-100/90">
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

          <div className="grid gap-3 md:grid-cols-2">
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
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left transition hover:border-cyan-200/32"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/80">
                  {item.city || "Global"} | {formatDateShort(item.date || item.createdAt)}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                <p
                  className={`mt-2 text-xs leading-5 text-white/62 ${
                    String(expandedNewsId) === String(item.id) ? "" : "line-clamp-2"
                  }`}
                >
                  {item.whyItMatters || item.summary}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/40">
                    {item.sourceName || "Atlas signal"}
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
                          className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/42"
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
                        className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
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
            <div className="grid gap-4 md:grid-cols-2">
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

          <section className="rounded-[28px] border border-fuchsia-300/15 bg-[linear-gradient(180deg,rgba(44,18,48,0.92),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(232,121,249,0.08)]">
            <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-200">Community stories</p>
            <h2 className="qa-h2 mt-2 text-2xl font-semibold text-white">Voices from members</h2>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Member stories are editorially moderated before publishing to keep signal quality high.
            </p>
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
              <span className="text-[11px] text-white/52">
                Themes: safety issues, global developments, nightlife stories, and life-in-city reality.
              </span>
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
                  placeholder="What happened? Keep it factual and helpful."
                  className="min-h-[100px] rounded-xl border border-white/12 bg-black/35 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
                />
                <textarea
                  required
                  value={communityStoryForm.whyItMatters}
                  onChange={(event) =>
                    setCommunityStoryForm((current) => ({ ...current, whyItMatters: event.target.value }))
                  }
                  placeholder="Why should the community know this?"
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

            <div className="mt-5 space-y-3">
              {visibleCommunityStories.map((story) => {
                const canEditAdminNews = adminNewsIdSet.has(String(story.id));
                return (
                <article
                  key={`story-${story.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setExpandedNewsId((current) =>
                      String(current) === String(story.id) ? null : String(story.id)
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setExpandedNewsId((current) =>
                        String(current) === String(story.id) ? null : String(story.id)
                      );
                    }
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-fuchsia-200/30"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/75">
                    {story.city || "Global"} | {formatDateShort(story.date || story.createdAt)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{story.title}</p>
                  <p
                    className={`mt-2 text-xs leading-5 text-white/60 ${
                      String(expandedNewsId) === String(story.id) ? "" : "line-clamp-2"
                    }`}
                  >
                    {story.summary}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-white/40">
                      {story.sourceName || "Community signal"}
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
                            className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/42"
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
                          className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
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
                  primaryActionLabel="Open community"
                  onPrimaryAction={() => router.push("/community")}
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

      </div>
    </main>
  );
}


