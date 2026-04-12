"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mergeSeedEvents, mergeSeedPlaces } from "@/lib/seedContent";
import { useAuth } from "@/lib/auth";
import { EDITORIAL_PULSE_ITEMS, PULSE_CATEGORIES } from "@/lib/pulse";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import EmptyState from "@/components/ui/EmptyState";

function formatDate(value) {
  if (!value) return "Date TBA";
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

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

function PulseSkeletonCard({ tone = "orange" }) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200/16 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(10,10,10,0.94))]"
      : tone === "yellow"
        ? "border-yellow-200/16 bg-[linear-gradient(180deg,rgba(250,204,21,0.10),rgba(10,10,10,0.94))]"
        : "border-orange-200/16 bg-[linear-gradient(180deg,rgba(251,146,60,0.10),rgba(10,10,10,0.94))]";

  return (
    <div className={`animate-pulse rounded-2xl border p-4 ${toneClass}`} aria-hidden="true">
      <div className="h-3 w-24 rounded-full bg-white/14" />
      <div className="mt-3 h-5 w-2/3 rounded-full bg-white/12" />
      <div className="mt-4 h-3 w-full rounded-full bg-white/8" />
      <div className="mt-2 h-3 w-5/6 rounded-full bg-white/8" />
    </div>
  );
}

export default function NowPage() {
  const router = useRouter();
  const { isMember, memberName, user } = useAuth();
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(null);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [loadError, setLoadError] = useState("");
  const [syncWarning, setSyncWarning] = useState("");
  const [expandedSoonEventId, setExpandedSoonEventId] = useState(null);
  const [expandedNewsId, setExpandedNewsId] = useState(null);
  const [expandedPullPlaceId, setExpandedPullPlaceId] = useState(null);
  const [selectedRankingYear, setSelectedRankingYear] = useState("2026");
  const [rankingOverrides, setRankingOverrides] = useState({});
  const [isRankingEditorOpen, setIsRankingEditorOpen] = useState(false);
  const [rankingDraft, setRankingDraft] = useState([]);
  const [adminNews, setAdminNews] = useState([]);
  const [hiddenNewsIds, setHiddenNewsIds] = useState([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    title: "",
    city: "",
    category: "culture_tip",
    summary: "",
    whyItMatters: "",
    date: "",
  });

  const loadPulseData = useCallback(async () => {
    const now = new Date();
    setToday(now);
    setLoadError("");
    setReady(false);

    const [{ data: eventsData, error: eventsError }, { data: placesData, error: placesError }] = await Promise.all([
      supabase.from("events").select("*").order("date", { ascending: true }),
      supabase.from("places_with_stats").select("*"),
    ]);

    if (eventsError || placesError) {
      setLoadError("Live pulse could not fully load. Showing available data.");
    }

    setEvents(mergeSeedEvents(eventsData || []));
    setPlaces(mergeSeedPlaces(placesData || []));
    setReady(true);
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      await loadPulseData();
    });
  }, [loadPulseData]);

  useEffect(() => {
    queueMicrotask(async () => {
      const localNews = readLocalJson(ADMIN_NEWS_KEY, []);
      const localHidden = (readLocalJson(HIDDEN_NEWS_KEY, []) || []).map((id) => String(id));
      const localRankings = readLocalJson(RANKING_OVERRIDES_KEY, {});

      setAdminNews(localNews);
      setHiddenNewsIds(localHidden);
      setRankingOverrides(localRankings);

      const [newsResponse, hiddenResponse, rankingResponse] = await Promise.all([
        supabase.from(NEWS_TABLE).select("*").order("date", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from(NEWS_HIDDEN_TABLE).select("feed_id"),
        supabase.from(RANKING_TABLE).select("*").order("year", { ascending: false }).order("rank", { ascending: true }),
      ]);

      const hasMissingTables =
        isMissingTableError(newsResponse.error) ||
        isMissingTableError(hiddenResponse.error) ||
        isMissingTableError(rankingResponse.error);

      if (hasMissingTables) {
        setSyncWarning("Off-grid sync is unavailable right now.");
        return;
      }

      if (newsResponse.error || hiddenResponse.error || rankingResponse.error) {
        setSyncWarning("Cloud sync failed. Using local backup.");
        return;
      }

      const remoteNews = (newsResponse.data || []).map(mapNewsRowToItem);
      const remoteHidden = (hiddenResponse.data || []).map((row) => String(row.feed_id));
      const remoteRankings = groupRankingRows(rankingResponse.data || []);

      setAdminNews(remoteNews);
      setHiddenNewsIds(remoteHidden);
      setRankingOverrides(remoteRankings);
      setSyncWarning("");

      writeLocalJson(ADMIN_NEWS_KEY, remoteNews);
      writeLocalJson(HIDDEN_NEWS_KEY, remoteHidden);
      writeLocalJson(RANKING_OVERRIDES_KEY, remoteRankings);
    });
  }, []);

  const cityOptions = [...new Set(events.concat(places).map((item) => item.city?.toLowerCase()).filter(Boolean))]
    .sort();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const currentEmail = String(user?.email || "").toLowerCase();
  const isAdmin = isMember && adminEmails.includes(currentEmail);
  const rankingYears = Object.keys(ATLAS_DESTINATION_RANKINGS).sort((a, b) => Number(b) - Number(a));
  const baseRankingItems = ATLAS_DESTINATION_RANKINGS[selectedRankingYear] || [];
  const rankingItems = (rankingOverrides[selectedRankingYear] || baseRankingItems).slice(0, 15);

  useEffect(() => {
    if (!isRankingEditorOpen) {
      setRankingDraft([]);
      return;
    }
    setRankingDraft((rankingOverrides[selectedRankingYear] || baseRankingItems).slice(0, 15).map((item) => ({ ...item })));
  }, [baseRankingItems, isRankingEditorOpen, rankingOverrides, selectedRankingYear]);

  const filteredEvents =
    selectedCity === "all"
      ? events
      : events.filter((event) => event.city?.toLowerCase() === selectedCity);

  const filteredPlaces =
    selectedCity === "all"
      ? places
      : places.filter((place) => place.city?.toLowerCase() === selectedCity);

  const upcomingEvents = filteredEvents.filter((event) => event.date && new Date(event.date) >= today);
  const tonightEvents = upcomingEvents.slice(0, 4);
  const thisWeekEvents = upcomingEvents.filter((event) => isThisWeek(event.date, today)).slice(0, 6);
  const trendingPlaces = [...filteredPlaces]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 6);

  const cityMomentum = Object.values(
    filteredPlaces.reduce((acc, place) => {
      const city = place.city || "Unknown";
      if (!acc[city]) {
        acc[city] = { city, reviews: 0, places: 0 };
      }
      acc[city].reviews += place.reviewCount || 0;
      acc[city].places += 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  const categoryLabels = useMemo(
    () =>
      PULSE_CATEGORIES.reduce((acc, item) => {
        acc[item.key] = item.label;
        return acc;
      }, {}),
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
        summary: `${place.type || "Venue"} | ${place.reviewCount || 0} reviews | rating ${place.avgRating?.toFixed(1) || "-"}`,
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

    return combined
      .filter((item) => !hiddenNewsIds.includes(String(item.id)))
      .sort(compareNewsRecency)
      .slice(0, 12);
  }, [adminNews, hiddenNewsIds, majorEventNews, risingSpotsNews]);
  const displayedNewsItems = worldNewsItems.slice(0, 8);

  const updateRankingDraftField = (index, field, value) => {
    setRankingDraft((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const saveRankingDraft = async () => {
    if (!isAdmin) return;

    const next = {
      ...rankingOverrides,
      [selectedRankingYear]: rankingDraft.map((item) => ({
        city: (item.city || "").trim().toLowerCase().replaceAll(" ", "_"),
        country: (item.country || "").trim(),
        signal: (item.signal || "").trim(),
      })),
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
    if (!adminForm.title || !adminForm.summary || !adminForm.whyItMatters) return;

    const item = {
      id: `admin-news-${Date.now()}`,
      title: adminForm.title,
      city: adminForm.city || "Global",
      category: adminForm.category || "culture_tip",
      date: adminForm.date || new Date().toISOString().slice(0, 10),
      summary: adminForm.summary,
      whyItMatters: adminForm.whyItMatters,
      sourceName: `${memberName || "Admin"} | Atlas admin`,
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from(NEWS_TABLE).insert({
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

    if (error && !isMissingTableError(error)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    } else if (error && isMissingTableError(error)) {
      setSyncWarning("Off-grid sync is unavailable right now.");
    } else {
      setSyncWarning("");
    }

    const next = [item, ...adminNews];
    setAdminNews(next);
    writeLocalJson(ADMIN_NEWS_KEY, next);
    setAdminForm({
      title: "",
      city: "",
      category: "culture_tip",
      summary: "",
      whyItMatters: "",
      date: "",
    });
    setShowAdminForm(false);
  };

  const deleteFeedItem = async (itemId) => {
    if (!isAdmin) return;
    const key = String(itemId);

    const { error: deleteNewsError } = await supabase.from(NEWS_TABLE).delete().eq("id", key);
    if (deleteNewsError && !isMissingTableError(deleteNewsError)) {
      setSyncWarning("Cloud sync failed. Using local backup.");
    }

    const { error: hideError } = await supabase
      .from(NEWS_HIDDEN_TABLE)
      .upsert(
        {
          feed_id: key,
          hidden_by_email: currentEmail || null,
        },
        { onConflict: "feed_id" }
      );

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
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[32px] border border-orange-300/15 bg-[linear-gradient(135deg,rgba(67,20,7,0.86),rgba(10,10,10,0.98),rgba(120,53,15,0.82))] p-8">
            <div className="animate-pulse space-y-3" aria-hidden="true">
              <div className="h-3 w-28 rounded-full bg-white/14" />
              <div className="h-10 w-52 rounded-full bg-white/12" />
              <div className="h-3 w-full rounded-full bg-white/8" />
              <div className="h-3 w-4/5 rounded-full bg-white/8" />
            </div>
          </section>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[28px] border border-orange-300/15 bg-[linear-gradient(180deg,rgba(44,20,10,0.95),rgba(10,10,10,1))] p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <PulseSkeletonCard tone="orange" />
                <PulseSkeletonCard tone="orange" />
              </div>
            </section>
            <section className="rounded-[28px] border border-yellow-300/15 bg-[linear-gradient(180deg,rgba(54,36,10,0.95),rgba(10,10,10,1))] p-6">
              <div className="space-y-3">
                <PulseSkeletonCard tone="yellow" />
                <PulseSkeletonCard tone="yellow" />
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
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[32px] border border-orange-300/15 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.14),transparent_28%),linear-gradient(135deg,rgba(67,20,7,0.92),rgba(10,10,10,0.98),rgba(120,53,15,0.88))] p-8 shadow-[0_30px_120px_rgba(251,146,60,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-200/90">Live Discovery + Editorial Signal</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Queer World News</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-200">
                One mixed stream: what is happening now, what is rising, what changed in nightlife, rights/safety updates, major events, and culture tips.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Focus city</p>
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="mt-3 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none focus:border-orange-300"
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
                onClick={loadPulseData}
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
          <div className="grid items-stretch gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <section className="flex h-full min-h-[920px] flex-col rounded-[28px] border border-fuchsia-300/15 bg-[linear-gradient(180deg,rgba(44,18,38,0.92),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(244,114,182,0.10)]">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-200">Mixed feed</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">What is new in the queer world</h2>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAdminForm((current) => !current)}
                    className="rounded-full border border-fuchsia-300/28 bg-fuchsia-300/10 px-4 py-2 text-xs text-fuchsia-100 transition hover:border-fuchsia-200/45"
                  >
                    {showAdminForm ? "Close admin publish" : "Admin publish"}
                  </button>
                )}
              </div>

              {isAdmin && showAdminForm && (
                <form onSubmit={publishAdminNews} className="mb-5 grid gap-3 rounded-2xl border border-fuchsia-300/18 bg-fuchsia-300/[0.05] p-4 md:grid-cols-2">
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
                    className="rounded-xl bg-gradient-to-r from-fuchsia-300 via-pink-300 to-orange-200 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-95 md:col-span-2"
                  >
                    Publish news
                  </button>
                </form>
              )}

              {!isAdmin && (
                <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  Read-only for members. Editing is restricted to administrator.
                </p>
              )}

              <div className="grid flex-1 content-start gap-4 md:grid-cols-2">
                {displayedNewsItems.length > 0 ? (
                  displayedNewsItems.map((item) => (
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
                      className="cursor-pointer rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 transition hover:-translate-y-[1px] hover:border-fuchsia-200/26 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200/45"
                    >
                      <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-fuchsia-200/80 via-cyan-200/65 to-transparent" />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/45">{item.city || "Global"}</p>
                        <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] text-white/72">
                          {formatDate(item.date)}
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
                        <span className="text-[11px] uppercase tracking-[0.14em] text-white/36">
                          {categoryLabels[item.category] || "News"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/36">
                            {String(expandedNewsId) === String(item.id)
                              ? item.sourceName || "Atlas signal"
                              : "Tap to expand"}
                          </span>
                          {isAdmin && (
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
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="No world news items yet."
                    description="Add an admin news item or check back after new signals."
                    className="md:col-span-2 px-4 py-8"
                  />
                )}
              </div>
            </section>

            <section className="flex h-full min-h-[920px] flex-col rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(11,44,56,0.75),rgba(9,9,9,0.96))] p-6 shadow-[0_24px_64px_rgba(34,211,238,0.10)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Ranking</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Top 15 Queer Travel Destinations</h3>
                </div>
                <select
                  value={selectedRankingYear}
                  onChange={(event) => setSelectedRankingYear(event.target.value)}
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
                    onClick={() => setIsRankingEditorOpen((current) => !current)}
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

              {!isAdmin && (
                <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  Read-only for members. Ranking edits are administrator-only.
                </p>
              )}

              <div className="mt-4 grid flex-1 grid-rows-[repeat(15,minmax(0,1fr))] gap-2">
                {Array.from({ length: 15 }).map((_, index) => {
                  const item = rankingRenderItems[index] || { city: "", country: "", signal: "" };
                  const cityKey = String(item.city || "").toLowerCase();
                  const cityExists = cityOptions.includes(cityKey);
                  return (
                    <div
                      key={`${selectedRankingYear}-${index + 1}`}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                    >
                      <p className="text-xs font-semibold text-cyan-200/90">#{index + 1}</p>
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
                          <p className="truncate text-[11px] text-white/55">{item.signal || "Signal pending editorial update."}</p>
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={!cityExists}
                        onClick={() => setSelectedCity(cityKey)}
                        className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] transition ${
                          cityExists
                            ? "border border-cyan-200/35 bg-cyan-200/12 text-cyan-100 hover:bg-cyan-200/22"
                            : "border border-white/10 bg-white/5 text-white/35"
                        }`}
                      >
                        {cityExists ? "Focus" : "Soon"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-orange-300/15 bg-[linear-gradient(180deg,rgba(44,20,10,0.95),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(249,115,22,0.08)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-orange-200">Happening Soon</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Tonight and next up</h2>
              </div>
              <button
                onClick={() => router.push("/events")}
                className="rounded-full border border-orange-300/30 bg-orange-300/8 px-4 py-2 text-xs text-orange-100 transition hover:border-orange-200 hover:bg-orange-300/15"
              >
                Open all events
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {tonightEvents.map((event) => (
                <div
                  key={event.id}
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
                  className="cursor-pointer rounded-[24px] border border-orange-300/14 bg-[linear-gradient(180deg,rgba(64,29,12,0.82),rgba(11,11,11,0.96))] p-5 transition hover:-translate-y-[1px] hover:border-orange-200/35 hover:shadow-[0_20px_50px_rgba(251,146,60,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200/45"
                >
                  <div className="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-orange-200/90 via-amber-200/65 to-transparent" />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-200/80">{event.city || "City"} | {formatDate(event.date)}</p>
                    <span className="rounded-full border border-orange-200/15 bg-orange-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-orange-100">
                      {String(expandedSoonEventId) === String(event.id) ? "Expanded" : "Live now"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{event.name}</h3>
                  <p
                    className={`mt-3 text-sm leading-6 text-gray-300 transition-all ${
                      String(expandedSoonEventId) === String(event.id) ? "" : "line-clamp-2"
                    }`}
                  >
                    {event.description || "Community event with live momentum right now."}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                      {String(expandedSoonEventId) === String(event.id) ? "Tap again to collapse" : "Tap to expand"}
                    </span>
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}`);
                      }}
                      className="rounded-full border border-orange-200/22 bg-orange-200/10 px-3 py-1 text-xs text-orange-100 transition hover:border-orange-200/40"
                    >
                      Open event
                    </button>
                  </div>
                </div>
              ))}

              {tonightEvents.length === 0 && (
                <EmptyState
                  title="No upcoming events in this view yet."
                  description="Switch city filter or jump to full events list."
                  className="md:col-span-2"
                >
                  <button
                    onClick={() => {
                      setSelectedCity("all");
                      router.push("/events");
                    }}
                    className="rounded-full border border-orange-300/25 bg-orange-300/10 px-4 py-2 text-xs text-orange-100 transition hover:border-orange-200 hover:bg-orange-300/15"
                  >
                    Open global events
                  </button>
                </EmptyState>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-yellow-300/15 bg-[linear-gradient(180deg,rgba(54,36,10,0.95),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(250,204,21,0.07)]">
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-200">Momentum</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Cities with signal</h2>

            <div className="mt-5 space-y-3">
              {cityMomentum.map((city) => (
                <button
                  key={city.city}
                  onClick={() => router.push(`/${city.city.toLowerCase()}`)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(57,43,13,0.8),rgba(11,11,11,0.96))] px-4 py-4 text-left transition hover:border-yellow-200/30"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{city.city}</p>
                    <p className="mt-1 text-xs text-gray-400">{city.places} places | {city.reviews} reviews</p>
                  </div>
                  <span className="rounded-full bg-yellow-200/10 px-3 py-1 text-xs text-yellow-100">Hot</span>
                </button>
              ))}
              {cityMomentum.length === 0 && (
                <EmptyState
                  title="No city momentum in this filter yet."
                  description="Try broadening to all cities for more signal."
                  className="px-4 py-8"
                >
                  {selectedCity !== "all" && (
                    <button
                      onClick={() => setSelectedCity("all")}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                    >
                      Show all cities
                    </button>
                  )}
                </EmptyState>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-pink-300/15 bg-[linear-gradient(180deg,rgba(55,16,31,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(244,114,182,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-pink-200">This Week</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Build your next move</h2>
            </div>
            <button
              onClick={() => router.push("/favorites")}
              className="rounded-full border border-pink-300/30 bg-pink-300/8 px-4 py-2 text-xs text-pink-100 transition hover:border-pink-200 hover:bg-pink-300/15"
            >
              Open favorites
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Events this week</p>
              <p className="mt-3 text-4xl font-semibold text-white">{thisWeekEvents.length}</p>
              <p className="mt-2 text-sm text-gray-400">Time-based queer culture you can act on now.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Trending places</p>
              <p className="mt-3 text-4xl font-semibold text-white">{trendingPlaces.length}</p>
              <p className="mt-2 text-sm text-gray-400">Places with the strongest review gravity in this view.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Active cities</p>
              <p className="mt-3 text-4xl font-semibold text-white">{cityMomentum.length}</p>
              <p className="mt-2 text-sm text-gray-400">Places where signal is currently strongest.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(8,39,32,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(16,185,129,0.08)]">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Discovery Engine</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Places with pull</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trendingPlaces.map((place) => {
              const isExpanded = String(expandedPullPlaceId) === String(place.id);
              return (
              <div
                key={place.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setExpandedPullPlaceId((current) =>
                    String(current) === String(place.id) ? null : String(place.id)
                  )
                }
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                    keyEvent.preventDefault();
                    setExpandedPullPlaceId((current) =>
                      String(current) === String(place.id) ? null : String(place.id)
                    );
                  }
                }}
                className={`cursor-pointer overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(10,43,33,0.76),rgba(11,11,11,0.96))] p-4 transition hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/45 ${
                  isExpanded
                    ? "border-emerald-200/45 shadow-[0_24px_56px_rgba(16,185,129,0.2)]"
                    : "border-white/8 hover:border-emerald-200/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
                }`}
              >
                <div className="mb-4 h-1.5 rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.96),rgba(52,211,153,0.55),rgba(16,185,129,0.2))]" />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">{place.city}</p>
                  <p className="text-xs text-gray-400">★ {place.avgRating?.toFixed(1) || "-"}</p>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-white">{place.name}</h3>
                <p className="mt-2 text-sm text-emerald-100/85">{place.vibe || place.type || "Queer signal"}</p>
                <p className={`mt-3 text-sm leading-6 text-gray-300 ${isExpanded ? "" : "line-clamp-2"}`}>
                  {place.description || "A place drawing real community attention right now."}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-emerald-200/70">{isExpanded ? "Tap again to collapse" : "Tap to expand"}</p>
                  <button
                    type="button"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      router.push(`/${place.city?.toLowerCase()}?placeId=${place.id}`);
                    }}
                    className="rounded-full border border-emerald-200/35 bg-emerald-300/12 px-3 py-1 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/20"
                  >
                    Open place
                  </button>
                </div>
              </div>
              );
            })}
            {trendingPlaces.length === 0 && (
              <EmptyState
                title="No places with momentum in this view yet."
                description="Try another city filter or check back after new reviews."
                className="md:col-span-2 xl:col-span-3 px-4 py-8"
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
