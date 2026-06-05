"use client";

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
import { trackKpiEvent } from "@/lib/analytics";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { readRuntimeCache, writeRuntimeCache } from "@/lib/runtimeCache";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { formatDateShort } from "@/lib/dateDisplay";
import { ArrowUpRight, Search } from "lucide-react";
import HomeContactSection from "@/components/home/HomeContactSection";

const PENDING_SIGNUP_PROFILE_KEY = "qa_pending_signup_profile";
const HOME_DATA_CACHE_KEY = "qa_home_data_v1";
const HOME_DATA_CACHE_TTL_MS = 3 * 60 * 1000;
const HOME_METRICS_DAILY_CACHE_KEY = "qa_home_metrics_daily_v1";
const HomeDeferredSections = dynamic(() => import("@/components/home/HomeDeferredSections"));
const HomeAuthModal = dynamic(() => import("@/components/home/HomeAuthModal"));
function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getResultMeta(result) {
  if (result.type === "city") return `City | ${result.country || "Global"}`;
  if (result.type === "place") return `${result.city || "City"} | Place`;
  return `${result.city || "City"} | Event`;
}

function parseNewsTimestamp(value) {
  const timestamp = Date.parse(value || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function parseEventTimestamp(value) {
  const timestamp = Date.parse(value || "");
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getFreshnessSignal(value) {
  const timestamp = Date.parse(String(value || ""));
  if (Number.isNaN(timestamp)) return { label: "PENDING", tone: "neutral" };
  const diffMinutes = Math.max(0, (Date.now() - timestamp) / 60000);
  if (diffMinutes <= 15) return { label: "JUST UPDATED", tone: "live" };
  if (diffMinutes <= 24 * 60) return { label: "UPDATED TODAY", tone: "today" };
  if (diffMinutes <= 7 * 24 * 60) return { label: "UPDATED THIS WEEK", tone: "week" };
  return { label: "EARLIER UPDATE", tone: "neutral" };
}

function formatCityLabel(value) {
  return String(value || "Global")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compareNewsRecency(a, b) {
  const byCreatedAt =
    parseNewsTimestamp(b.createdAt || b.created_at) - parseNewsTimestamp(a.createdAt || a.created_at);
  if (byCreatedAt !== 0) return byCreatedAt;

  const byDate = parseNewsTimestamp(b.date) - parseNewsTimestamp(a.date);
  if (byDate !== 0) return byDate;

  return String(b.id || "").localeCompare(String(a.id || ""));
}

function scheduleIdleTask(task, timeout = 650) {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    const idleId = window.requestIdleCallback(() => {
      task();
    }, { timeout });
    return () => window.cancelIdleCallback?.(idleId);
  }
  const timeoutId = window.setTimeout(() => task(), 140);
  return () => window.clearTimeout(timeoutId);
}

export default function HomePageClient({ initialHomeData = null }) {
  const router = useRouter();
  const initialEvents = useMemo(
    () => (Array.isArray(initialHomeData?.events) ? initialHomeData.events : []),
    [initialHomeData]
  );
  const initialPlaces = useMemo(
    () => (Array.isArray(initialHomeData?.places) ? initialHomeData.places : []),
    [initialHomeData]
  );
  const initialWorldNews = useMemo(
    () => (Array.isArray(initialHomeData?.worldNews) ? initialHomeData.worldNews : []),
    [initialHomeData]
  );
  const initialMetrics = initialHomeData?.metrics || null;
  const hasCompleteInitialHomeData = initialHomeData?.complete !== false;
  const hasInitialHomeData =
    initialEvents.length > 0 || initialPlaces.length > 0 || initialWorldNews.length > 0;
  const [events, setEvents] = useState(initialEvents);
  const [places, setPlaces] = useState(initialPlaces);
  const [query, setQuery] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(!hasInitialHomeData);
  const [dataError, setDataError] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [worldNews, setWorldNews] = useState(initialWorldNews);
  const [favorites, setFavorites] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authMode, setAuthMode] = useState("signin");
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState("");
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [resetPasswordConfirmInput, setResetPasswordConfirmInput] = useState("");
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [signupForm, setSignupForm] = useState({
    displayName: "",
    pronouns: "",
    homeCity: "",
    residentCountry: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const [dailyMetricsSnapshot, setDailyMetricsSnapshot] = useState(null);
  const [nowTick, setNowTick] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const {
    isMember,
    memberName,
    memberProfile,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
    resetPasswordForEmail,
    updatePassword,
    updateMemberProfile,
    signOut,
    user,
  } = useAuth();
  const currentEmail = String(user?.email || "").trim().toLowerCase();

  const getResultKey = (item) => (
    item.type === "event" ? `event-${item.id}` : String(item.id)
  );

  const isSavedResult = (item) => favorites.includes(getResultKey(item));

  const openSignup = useCallback(() => {
    setAuthMessage("");
    setAuthMode("signin");
    setPasswordInput("");
    setPendingEmailConfirmation("");
    setResetPasswordInput("");
    setResetPasswordConfirmInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("qa_redirect");
    }
    writeLocalValue("qa_post_login_target", "/");
    setShowSignup(true);
  }, []);

  const openResult = (item) => {
    if (item.type === "city") {
      router.push(cityPath(item.key || item.id));
      return;
    }

    const cityValue = cityPath(item?.city, "");

    if (!cityValue || (item.type === "event" && cityValue === "/global")) {
      if (item?.type === "event") {
        const offgridEventId = String(item?.id || "").trim();
        const query = offgridEventId ? `?offgridEventId=${encodeURIComponent(offgridEventId)}` : "";
        router.push(`/events${query}`);
      } else {
        router.push("/cities");
      }
      return;
    }

    if (item.type === "place") {
      router.push(citySelectionPath(item.city, { placeId: item.id }));
      return;
    }

    router.push(citySelectionPath(item.city, { eventId: item.id }));
  };

  const saveResult = (item) => {
    if (item.type === "city") {
      openResult(item);
      return;
    }

    if (!isMember) {
      openSignup();
      return;
    }

    const favoriteKey = getResultKey(item);
    toggleFavorite(favoriteKey);
    trackKpiEvent("favorite_saved", {
      city: String(item?.city || item?.name || ""),
      targetType: item?.type || "",
      targetId: favoriteKey,
      memberKey: String(memberProfile?.displayName || memberName || "").trim().toLowerCase(),
    });
    setShowSaved(true);

    setTimeout(() => {
      setShowSaved(false);
    }, 1000);
  };

  const fetchHomeData = useCallback(async () => {
    const response = await fetch("/api/home-data", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`home-data-${response.status}`);
    }

    const payload = await response.json();
    return {
      events: Array.isArray(payload?.events) ? payload.events : [],
      places: Array.isArray(payload?.places) ? payload.places : [],
      worldNews: Array.isArray(payload?.worldNews) ? payload.worldNews : [],
      partialData: Boolean(payload?.partialData),
    };
  }, []);

  const toggleFavorite = (id) => {
    const key = String(id);
    let updated;

    if (favorites.includes(key)) {
      updated = favorites.filter((favorite) => favorite !== key);
    } else {
      updated = [...favorites, key];

      const existing = readLocalJson("qa_added", []);

      existing.push({
        id: key,
        date: new Date().toISOString(),
      });

      writeLocalJson("qa_added", existing);
    }

    setFavorites(updated);
    writeLocalJson("qa_favorites", updated);
  };

  const loadHomeData = useCallback(async ({ forceRefresh = false } = {}) => {
    setIsDataLoading(true);
    setDataError("");

    const cached = forceRefresh ? { hit: false, stale: true } : readRuntimeCache(HOME_DATA_CACHE_KEY, HOME_DATA_CACHE_TTL_MS);
    if (cached.hit && cached.data) {
      setEvents(Array.isArray(cached.data.events) ? cached.data.events : []);
      setPlaces(Array.isArray(cached.data.places) ? cached.data.places : []);
      setWorldNews(Array.isArray(cached.data.worldNews) ? cached.data.worldNews : []);
      setIsDataLoading(false);
      if (!cached.stale) return;
    }

    let payload;
    try {
      payload = await fetchHomeData();
    } catch {
      setDataError("Some live data could not load. Showing available signal.");
      setIsDataLoading(false);
      return;
    }

    const nextEvents = payload.events;
    const nextPlaces = payload.places;
    const nextWorldNews = payload.worldNews;

    setEvents(nextEvents);
    setPlaces(nextPlaces);
    setWorldNews(nextWorldNews);
    writeRuntimeCache(HOME_DATA_CACHE_KEY, {
      events: nextEvents,
      places: nextPlaces,
      worldNews: nextWorldNews,
    });

    if (payload.partialData) {
      setDataError("Some live data could not load. Showing available signal.");
    }
    setIsDataLoading(false);
  }, [fetchHomeData]);

  useEffect(() => {
    if (hasInitialHomeData) {
      writeRuntimeCache(HOME_DATA_CACHE_KEY, {
        events: initialEvents,
        places: initialPlaces,
        worldNews: initialWorldNews,
      });
      queueMicrotask(() => {
        setIsDataLoading(false);
      });
      if (hasCompleteInitialHomeData) return () => {};

      return scheduleIdleTask(() => {
        queueMicrotask(async () => {
          await loadHomeData({ forceRefresh: true });
        });
      }, 900);
    }

    return scheduleIdleTask(() => {
      queueMicrotask(async () => {
        await loadHomeData();
      });
    }, 450);
  }, [
    hasCompleteInitialHomeData,
    hasInitialHomeData,
    initialEvents,
    initialPlaces,
    initialWorldNews,
    loadHomeData,
  ]);

  useEffect(() => {
    return scheduleIdleTask(() => {
      queueMicrotask(() => {
        const stored = localStorage.getItem("qa_favorites");
        if (stored) {
          setFavorites((readLocalJson("qa_favorites", []) || []).map((item) => String(item)));
        }
      });
    }, 900);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("join") !== "true") return;

    queueMicrotask(() => {
      openSignup();
      window.history.replaceState({}, "", "/");
    });
  }, [openSignup]);

  useEffect(() => {
    if (isAuthLoading || !isMember) return;

    queueMicrotask(() => {
      setShowSignup(false);
    });
  }, [isAuthLoading, isMember, router]);

  useEffect(() => {
    if (isAuthLoading || !isMember || typeof window === "undefined") return;

    const raw = localStorage.getItem(PENDING_SIGNUP_PROFILE_KEY);
    if (!raw) return;

    queueMicrotask(async () => {
      try {
        const parsed = JSON.parse(raw);
        const profilePayload = {
          displayName: String(parsed?.displayName || "").trim(),
          pronouns: String(parsed?.pronouns || "").trim(),
          homeCity: String(parsed?.homeCity || "").trim(),
          residentCountry: String(parsed?.residentCountry || "").trim(),
        };

        const result = await updateMemberProfile(profilePayload);
        if (result?.ok) {
          localStorage.removeItem(PENDING_SIGNUP_PROFILE_KEY);
        }
      } catch {
        localStorage.removeItem(PENDING_SIGNUP_PROFILE_KEY);
      }
    });
  }, [isAuthLoading, isMember, updateMemberProfile]);

  useEffect(() => {
    if (typeof window === "undefined" || isMember) return;
    const hash = window.location.hash || "";
    if (!hash.includes("type=recovery")) return;

    queueMicrotask(() => {
      setShowSignup(true);
      setAuthMode("reset");
      setAuthMessage("Recovery verified. Set a new password.");
    });
  }, [isMember]);

  useEffect(() => {
    if (isAuthLoading || !isMember) return;

    let active = true;

    const cancel = scheduleIdleTask(() => {
      queueMicrotask(async () => {
        const { isAdmin: adminState } = await resolveAdminAccess({
          email: currentEmail,
        });

        if (!active) return;
        setIsAdmin(adminState);
      });
    }, 1100);

    return () => {
      active = false;
      cancel?.();
    };
  }, [currentEmail, isAuthLoading, isMember]);

  useEffect(() => {
    if (!deferredQuery) {
      queueMicrotask(() => {
        setResults([]);
      });
      return;
    }

    const normalizedQuery = String(deferredQuery || "").trim();
    if (normalizedQuery.length < 2) {
      queueMicrotask(() => {
        setResults([]);
        setShowResults(true);
      });
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      const [{ buildAtlasSearchResults }, { getQualityMap }] = await Promise.all([
        import("@/lib/search"),
        import("@/lib/quality"),
      ]);
      if (cancelled) return;
      const merged = buildAtlasSearchResults({
        query: normalizedQuery,
        places,
        events,
        cityLimit: 4,
        placeLimit: 4,
        eventLimit: 4,
        favoriteIds: favorites,
        qualityMap: getQualityMap(),
      });

      const orderedResults = [...merged.cities, ...merged.events, ...merged.places];

      startTransition(() => {
        setResults(orderedResults);
        setShowResults(true);
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [deferredQuery, events, favorites, places]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId = null;

    const trigger = () => {
      if (cancelled) return;
      setShowDeferredSections(true);
    };

    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(() => trigger(), { timeout: 700 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(idleId);
      };
    }

    timeoutId = window.setTimeout(() => trigger(), 300);
    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const homeNewsItems = useMemo(
    () => [...worldNews].sort(compareNewsRecency).slice(0, 3),
    [worldNews]
  );
  const latestPulseNews = homeNewsItems[0] || null;

  const topCities = useMemo(
    () =>
      Object.values(
        places.reduce((acc, place) => {
          const city = place.city || "Unknown";

          if (!acc[city]) {
            acc[city] = {
              city,
              count: 0,
              reviews: 0,
            };
          }

          acc[city].count += 1;
          acc[city].reviews += place.reviewCount || 0;

          return acc;
        }, {})
      )
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, 3),
    [places]
  );
  const strongestCitySignal = topCities[0] || null;
  const nextUpcomingEvent = useMemo(() => {
    const nowTimestamp = Number(nowTick || 0);
    const upcoming = [...events]
      .map((event) => ({ ...event, __ts: parseEventTimestamp(event?.date) }))
      .filter((event) => event.__ts > 0 && event.__ts >= nowTimestamp)
      .sort((a, b) => a.__ts - b.__ts);

    if (upcoming.length > 0) return upcoming[0];

    return [...events]
      .map((event) => ({ ...event, __ts: parseEventTimestamp(event?.date) }))
      .filter((event) => event.__ts > 0)
      .sort((a, b) => b.__ts - a.__ts)[0] || null;
  }, [events, nowTick]);
  const nextEventFreshness = useMemo(
    () => getFreshnessSignal(nextUpcomingEvent?.date),
    [nextUpcomingEvent]
  );

  const cityCount = useMemo(
    () => new Set(places.map((place) => place.city).filter(Boolean)).size,
    [places]
  );
  const eventCount = events.length;
  const placeCount = places.length;
  const metricsForCards = useMemo(
    () => ({
      cities:
        Number.isFinite(Number(dailyMetricsSnapshot?.cities))
          ? Number(dailyMetricsSnapshot.cities)
          : Number.isFinite(Number(initialMetrics?.cities))
            ? Number(initialMetrics.cities)
          : cityCount,
      places:
        Number.isFinite(Number(dailyMetricsSnapshot?.places))
          ? Number(dailyMetricsSnapshot.places)
          : Number.isFinite(Number(initialMetrics?.places))
            ? Number(initialMetrics.places)
          : placeCount,
      events:
        Number.isFinite(Number(dailyMetricsSnapshot?.events))
          ? Number(dailyMetricsSnapshot.events)
          : Number.isFinite(Number(initialMetrics?.events))
            ? Number(initialMetrics.events)
          : eventCount,
    }),
    [cityCount, dailyMetricsSnapshot, eventCount, initialMetrics, placeCount]
  );
  const formatMetric = (value) => (value > 0 ? String(value) : "-");
  const cityCountDisplay = isDataLoading && !dailyMetricsSnapshot ? "..." : formatMetric(metricsForCards.cities);
  const placeCountDisplay = isDataLoading && !dailyMetricsSnapshot ? "..." : formatMetric(metricsForCards.places);
  const eventCountDisplay = isDataLoading && !dailyMetricsSnapshot ? "..." : formatMetric(metricsForCards.events);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(HOME_METRICS_DAILY_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (String(parsed?.dateKey || "") !== getLocalDateKey()) return;
      queueMicrotask(() => {
        setDailyMetricsSnapshot({
          dateKey: String(parsed.dateKey),
          cities: Number(parsed.cities) || 0,
          places: Number(parsed.places) || 0,
          events: Number(parsed.events) || 0,
        });
      });
    } catch {
      // Ignore local cache parse issues.
    }
  }, []);

  useEffect(() => {
    if (isDataLoading) return;

    const dateKey = getLocalDateKey();
    queueMicrotask(() => {
      setDailyMetricsSnapshot((current) => {
        if (String(current?.dateKey || "") === dateKey) {
          return current;
        }

        const nextSnapshot = {
          dateKey,
          cities: Number(cityCount) || 0,
          places: Number(placeCount) || 0,
          events: Number(eventCount) || 0,
        };

        try {
          localStorage.setItem(HOME_METRICS_DAILY_CACHE_KEY, JSON.stringify(nextSnapshot));
        } catch {
          // Ignore local cache write issues.
        }

        return nextSnapshot;
      });
    });
  }, [cityCount, eventCount, isDataLoading, placeCount]);

  useEffect(() => {
    queueMicrotask(() => {
      setNowTick(Date.now());
    });
    const id = window.setInterval(() => {
      setNowTick(Date.now());
    }, 60 * 1000);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  const topLaneCards = [
    {
      title: "Cities",
      subtitle: "Explore destinations",
      description: "Navigate queer geography city by city.",
      icon: "Cities",
      accent: "from-violet-400 via-blue-400 to-sky-300",
      glow: "shadow-[0_24px_80px_rgba(96,165,250,0.16)]",
      onClick: () => router.push("/cities"),
    },
    {
      title: "Events",
      subtitle: "Parties & festivals",
      description: "Track time-based queer culture and movement.",
      icon: "Events",
      accent: "from-rose-400 via-orange-300 to-amber-200",
      glow: "shadow-[0_24px_80px_rgba(251,146,60,0.16)]",
      onClick: () => router.push("/events"),
    },
  ];

  const bottomLaneCards = [
    {
      title: "Queer World News",
      subtitle: "Live + editorial signal",
      description: "Now, rising spots, rights & safety, nightlife changes, major events, and culture tips in one flow.",
      icon: "News",
      accent: "from-cyan-300 via-sky-300 to-amber-300",
      glow: "shadow-[0_24px_80px_rgba(56,189,248,0.16)]",
      onClick: () => router.push("/now"),
    },
    {
      title: "Community",
      subtitle: "Stories & guides",
      description: "Lived experience, practical wisdom, and member signal.",
      icon: "Community",
      accent: "from-emerald-300 via-teal-200 to-cyan-200",
      glow: "shadow-[0_24px_80px_rgba(45,212,191,0.14)]",
      onClick: () => {
        if (!isMember) {
          openSignup("/community");
          return;
        }

        router.push("/community");
      },
    },
    {
      title: "Contribute",
      subtitle: "Grow the atlas",
      description: "Add places, events, stories, and corrections.",
      icon: "Contribute",
      accent: "from-fuchsia-300 via-pink-300 to-violet-300",
      glow: "shadow-[0_24px_80px_rgba(217,70,239,0.14)]",
      onClick: () => {
        if (!isMember) {
          openSignup("/contribute");
          return;
        }

        router.push("/contribute");
      },
    },
  ];
  const livePulseCards = [
    {
      key: "next-event",
      subtitle: "Next event",
      title: nextUpcomingEvent?.name || "No upcoming event signal yet",
      description: `${formatCityLabel(nextUpcomingEvent?.city)} - ${
        nextUpcomingEvent ? formatDateShort(nextUpcomingEvent.date) : "No date available"
      }.`,
      badge: nextEventFreshness.label,
      badgeClass:
        nextEventFreshness.tone === "live"
          ? "border-cyan-200/35 bg-cyan-200/14 text-cyan-100"
          : nextEventFreshness.tone === "today"
            ? "border-amber-200/35 bg-amber-200/14 text-amber-100"
            : nextEventFreshness.tone === "week"
              ? "border-violet-200/35 bg-violet-200/14 text-violet-100"
              : "border-white/22 bg-white/8 text-white/80",
      cardClass:
        "border-amber-200/26 bg-[linear-gradient(180deg,rgba(44,28,14,0.78),rgba(16,12,8,0.94))] hover:border-amber-200/46",
      ctaLabel: "Open event",
      onClick: () => {
        if (nextUpcomingEvent?.city && nextUpcomingEvent?.id) {
          router.push(citySelectionPath(nextUpcomingEvent.city, { eventId: nextUpcomingEvent.id }));
          return;
        }
        router.push("/events");
      },
    },
    {
      key: "latest-news",
      subtitle: "Latest news",
      title: latestPulseNews?.title || "No published news yet",
      description: `${formatCityLabel(latestPulseNews?.city)} - Global queer news, verified and fresh.`,
      badge: "",
      badgeClass: "",
      cardClass:
        "border-cyan-200/24 bg-[linear-gradient(180deg,rgba(14,28,44,0.74),rgba(10,12,20,0.92))] hover:border-cyan-200/44",
      ctaLabel: "Open story",
      onClick: () => router.push("/now"),
    },
    {
      key: "top-city",
      subtitle: "Top city right now",
      title: strongestCitySignal?.city
        ? formatCityLabel(strongestCitySignal.city)
        : "Signal is still warming up",
      description: "Highest current community pull in the atlas feed.",
      badge: strongestCitySignal ? `${strongestCitySignal.reviews || 0} reviews` : "Pending",
      badgeClass: "border-fuchsia-200/24 bg-fuchsia-200/12 text-fuchsia-100/90",
      cardClass:
        "border-fuchsia-200/24 bg-[linear-gradient(180deg,rgba(42,16,36,0.72),rgba(14,10,16,0.92))] hover:border-fuchsia-200/44",
      ctaLabel: "Open city",
      onClick: () => {
        if (strongestCitySignal?.city) {
          router.push(cityPath(strongestCitySignal.city));
          return;
        }
        router.push("/cities");
      },
    },
  ];
  const heroIdentityLabel = isMember
    ? `${memberName || "Alias"} | ${memberProfile?.pronouns || "Pronomen"}`
    : "Alias | Pronomen";

  return (
    <main className="qa-page min-h-screen overflow-x-hidden bg-[#01010C] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(244,114,182,0.05),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(56,189,248,0.06),transparent_27%),linear-gradient(180deg,#01010C_0%,#02020E_52%,#01010C_100%)]" />
        <div className="pointer-events-none absolute left-[-10%] top-20 h-64 w-64 rounded-full bg-rose-500/4 blur-3xl" />
        <div className="pointer-events-none absolute right-[-7%] top-24 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />

        <div className="qa-shell qa-shell-home relative flex min-h-screen w-full flex-col pt-0">
          <section className="relative left-1/2 w-screen min-h-[100dvh] -translate-x-1/2 overflow-hidden rounded-none bg-[#05070f]/72 px-4 py-5 shadow-[0_22px_72px_rgba(0,0,0,0.32)] backdrop-blur-[1.5px] sm:px-6 sm:py-6 xl:px-8 xl:py-8">
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <Image
                src="/home/home-hero-background-v4.png"
                alt=""
                fill
                priority
                quality={100}
                sizes="(max-width: 1023px) 0px, (max-width: 1600px) 100vw, 1800px"
                className="object-cover object-center opacity-96"
                style={{ objectPosition: "center calc(50% - 1.5cm)" }}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(104deg,rgba(3,6,18,0.9)_0%,rgba(5,7,16,0.74)_38%,rgba(7,7,12,0.22)_68%,rgba(7,7,12,0.5)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#05060f]/88 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#070912]/55 to-[#01010C]" />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-[#05060f]/86 to-transparent lg:block" />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-28 bg-gradient-to-l from-[#05060f]/86 to-transparent lg:block" />

            <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] w-full max-w-[1720px] flex-col justify-between">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div className="qa-eyebrow rounded-full border border-white/14 bg-white/5 px-4 py-2 text-white/76 backdrop-blur">
              {heroIdentityLabel}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {!isMember ? (
                <button
                  onClick={() => openSignup()}
                  className="qa-action qa-action-strong inline-flex h-10 items-center justify-center rounded-full border border-white/55 bg-gradient-to-r from-rose-300 via-fuchsia-300 to-orange-200 px-5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(244,114,182,0.2)] transition hover:scale-[1.01] hover:opacity-95"
                >
                  Join Queer Atlas
                </button>
              ) : (
                <>
                <button
                  onClick={() => router.push("/favorites")}
                  className="qa-action qa-action-strong inline-flex h-10 items-center justify-center rounded-full border border-fuchsia-200/48 bg-[linear-gradient(135deg,rgba(232,121,249,0.32),rgba(99,102,241,0.22),rgba(14,10,20,0.95))] px-4 text-sm font-semibold text-white transition hover:border-fuchsia-200/70"
                >
                  Your Atlas
                </button>
                <button
                  onClick={() => router.push("/community")}
                  className="qa-action hidden h-10 items-center justify-center rounded-full border border-emerald-200/30 bg-emerald-200/12 px-4 text-sm font-medium text-emerald-100/92 backdrop-blur transition hover:border-emerald-200/52 hover:text-emerald-50 sm:inline-flex"
                >
                  Community
                </button>
                  {isAdmin && (
                  <button
                    onClick={() => router.push("/admin")}
                    className="qa-action hidden h-10 items-center justify-center rounded-full border border-cyan-200/34 bg-cyan-200/14 px-4 text-sm font-medium text-cyan-100 transition hover:border-cyan-200/54 sm:inline-flex"
                  >
                    Admin
                  </button>
                  )}
                </>
              )}

              {isMember && (
                <button
                  onClick={async () => {
                    await signOut();
                    setShowSignup(false);
                  }}
                  className="qa-action inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.02] px-4 text-sm font-medium text-white/70 transition hover:border-white/28 hover:text-white"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>

          <div>
            <section className="pt-4 xl:pt-14">
              <div className="flex items-center gap-4 sm:gap-5">
                <Image
                  src="/queer-atlas-heart-logo-progress.png"
                  alt="Queer Atlas heart"
                  width={96}
                  height={96}
                  priority
                  className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 xl:h-24 xl:w-24"
                />
                <div>
                  <h1 className="qa-display qa-h1 max-w-5xl text-4xl font-bold leading-[0.95] tracking-[-0.028em] text-white sm:text-6xl xl:text-7xl">
                    <span className="text-white">Queer</span>{" "}
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-200 to-fuchsia-200 bg-clip-text text-transparent">
                      Atlas
                    </span>
                  </h1>
                  <p className="mt-3.5 text-[1.08rem] font-medium leading-[1.35] tracking-[-0.01em] text-white/84 sm:text-[1.42rem]">
                    Explore the queer world.
                  </p>
                </div>
              </div>

              <p className="qa-lead mt-7 max-w-[52ch] text-[1.02rem] leading-[1.62] tracking-[0.002em] text-white/76 sm:text-[1.16rem]">
                Discover places, events, and communities across 300+ cities with verified
                local signal for nightlife, culture, and safe spaces.
              </p>
              {isDataLoading && (
                <p className="mt-3 text-xs text-white/55">Loading live atlas data...</p>
              )}
              {dataError && (
                <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
                  <span>{dataError}</span>
                  <button
                    type="button"
                    onClick={() => loadHomeData({ forceRefresh: true })}
                    className="qa-action rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="relative mt-8 w-full max-w-[44rem] rounded-[30px] border border-cyan-200/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.035))] p-3.5 shadow-[0_20px_56px_rgba(2,6,23,0.36),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-xl sm:p-[18px]">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/38"
                      size={17}
                    />

                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onFocus={() => setShowResults(true)}
                      placeholder="Search cities, places, events"
                      className="h-12 w-full rounded-[21px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] py-0 pl-11 pr-4 text-[15px] leading-none text-white outline-none backdrop-blur placeholder:text-white/42 focus:border-cyan-300/48 focus:ring-2 focus:ring-cyan-300/22 sm:h-[52px] sm:text-base"
                    />
                  </div>

                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="qa-action qa-action-strong h-12 w-full shrink-0 rounded-full border border-cyan-100/72 bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 px-4 text-sm font-semibold text-black transition hover:scale-[1.01] sm:h-[52px] sm:w-auto sm:px-5"
                  >
                    Explore
                  </button>
                </div>

                  {showResults && results.length > 0 && (
                    <div className="absolute top-full z-50 mt-3 w-full max-h-[360px] overflow-y-auto overflow-x-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,15,17,0.98),rgba(11,11,13,0.97))] shadow-[0_24px_72px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                      {results.map((result) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            setShowResults(false);
                            openResult(result);
                          }}
                          className="cursor-pointer border-b border-white/6 px-5 py-4 transition last:border-b-0 hover:bg-white/6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
                                {result.type}
                              </span>
                              <p className="mt-2 font-medium text-white">{result.name}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                                {getResultMeta(result)}
                              </p>
                            </div>

                            {result.type !== "city" && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  saveResult(result);
                                }}
                                className={`qa-action rounded-full border px-3 py-1 text-xs transition ${
                                  isSavedResult(result)
                                    ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
                                    : "border-white/10 bg-white/5 text-white/65 hover:border-rose-300/25 hover:text-rose-100"
                                }`}
                              >
                                {isSavedResult(result) ? "Saved" : "Save"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showResults && query.trim().length > 0 && results.length === 0 && (
                    <div className="absolute top-full z-50 mt-3 w-full rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,15,17,0.98),rgba(11,11,13,0.97))] px-5 py-4 text-sm text-white/60 shadow-[0_24px_72px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                      No instant matches yet. Press Explore for full search.
                    </div>
                  )}
                </div>
              <div className="mt-5 grid w-full max-w-[44rem] grid-cols-3 gap-2.5">
                <div className="qa-card flex h-[82px] flex-col items-center justify-center rounded-xl border border-violet-200/16 bg-[linear-gradient(180deg,rgba(139,92,246,0.12),rgba(255,255,255,0.03))] px-3.5 py-2.5 text-center backdrop-blur">
                  <p className="tabular-nums text-[1.16rem] font-semibold leading-none text-white sm:text-[1.24rem]">{cityCountDisplay}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/45">Cities</p>
                </div>
                <div className="qa-card flex h-[82px] flex-col items-center justify-center rounded-xl border border-cyan-200/16 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] px-3.5 py-2.5 text-center backdrop-blur">
                  <p className="tabular-nums text-[1.16rem] font-semibold leading-none text-white sm:text-[1.24rem]">{placeCountDisplay}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/45">Places</p>
                </div>
                <div className="qa-card flex h-[82px] flex-col items-center justify-center rounded-xl border border-fuchsia-200/16 bg-[linear-gradient(180deg,rgba(232,121,249,0.12),rgba(255,255,255,0.03))] px-3.5 py-2.5 text-center backdrop-blur">
                  <p className="tabular-nums text-[1.16rem] font-semibold leading-none text-white sm:text-[1.24rem]">{eventCountDisplay}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/45">Events</p>
                </div>
              </div>
            </section>
          </div>
            </div>
          </section>

          {showDeferredSections ? (
            <HomeDeferredSections
              topLaneCards={topLaneCards}
              bottomLaneCards={bottomLaneCards}
              livePulseCards={livePulseCards}
              topCities={topCities}
              onOpenCities={() => router.push("/cities")}
              contactSlot={
                <HomeContactSection
                  className="mt-8"
                  isMember={isMember}
                  userId={String(user?.id || "")}
                  defaultName={String(memberProfile?.displayName || memberName || "")}
                />
              }
            />
          ) : (
            <div className="mt-12 h-[460px] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
          )}

        </div>
      </div>

            <HomeAuthModal
        showSignup={showSignup}
        setShowSignup={setShowSignup}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authMessage={authMessage}
        setAuthMessage={setAuthMessage}
        authLoading={authLoading}
        setAuthLoading={setAuthLoading}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        showSigninPassword={showSigninPassword}
        setShowSigninPassword={setShowSigninPassword}
        pendingEmailConfirmation={pendingEmailConfirmation}
        setPendingEmailConfirmation={setPendingEmailConfirmation}
        resetPasswordInput={resetPasswordInput}
        setResetPasswordInput={setResetPasswordInput}
        resetPasswordConfirmInput={resetPasswordConfirmInput}
        setResetPasswordConfirmInput={setResetPasswordConfirmInput}
        showSignupPassword={showSignupPassword}
        setShowSignupPassword={setShowSignupPassword}
        showSignupConfirmPassword={showSignupConfirmPassword}
        setShowSignupConfirmPassword={setShowSignupConfirmPassword}
        showResetPassword={showResetPassword}
        setShowResetPassword={setShowResetPassword}
        showResetConfirmPassword={showResetConfirmPassword}
        setShowResetConfirmPassword={setShowResetConfirmPassword}
        signupForm={signupForm}
        setSignupForm={setSignupForm}
        signInWithGoogle={signInWithGoogle}
        signInWithEmail={signInWithEmail}
        signInWithPassword={signInWithPassword}
        signUpWithPassword={signUpWithPassword}
        resetPasswordForEmail={resetPasswordForEmail}
        updatePassword={updatePassword}
        updateMemberProfile={updateMemberProfile}
        trackKpiEvent={trackKpiEvent}
        writeLocalValue={writeLocalValue}
        pendingSignupProfileKey={PENDING_SIGNUP_PROFILE_KEY}
      />
      {showSaved && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-medium text-black shadow-[0_18px_50px_rgba(255,255,255,0.18)]">
            Saved
          </div>
        </div>
      )}
    </main>
  );
}


