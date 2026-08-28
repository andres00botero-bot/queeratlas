"use client";

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
import { cityCoreConfig } from "@/lib/cityCore";
import { trackKpiEvent } from "@/lib/analytics";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { readRuntimeCache, writeRuntimeCache } from "@/lib/runtimeCache";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { formatDateShort } from "@/lib/dateDisplay";
import { Search, Sparkles } from "lucide-react";
import HomeVenueIntelligence from "@/components/home/HomeVenueIntelligence";

const PENDING_SIGNUP_PROFILE_KEY = "qa_pending_signup_profile";
const HOME_DATA_CACHE_KEY = "qa_home_data_v2";
const HOME_FOCUS_CITY_KEY = "qa_home_focus_city";
const LAST_EXPLORED_CITY_KEY = "qa_last_explored_city";
const HOME_DATA_CACHE_TTL_MS = 3 * 60 * 1000;
const HOME_CITY_OPTIONS = Object.keys(cityCoreConfig).sort((a, b) =>
  formatCityLabel(a).localeCompare(formatCityLabel(b))
);
const HOME_COUNTRY_COUNT = new Set(
  Object.values(cityCoreConfig).map((city) => city?.country).filter(Boolean)
).size;
const HomeDeferredSections = dynamic(() => import("@/components/home/HomeDeferredSections"));
const HomeContactSection = dynamic(() => import("@/components/home/HomeContactSection"));
const HomeAuthModal = dynamic(() => import("@/components/home/HomeAuthModal"));
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

function getDayStartTimestamp(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  const date = new Date(numeric);
  if (Number.isNaN(date.getTime())) return 0;
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getUpcomingEventSignal(value, nowTimestamp) {
  const eventTimestamp = parseEventTimestamp(value);
  const todayTimestamp = getDayStartTimestamp(nowTimestamp);
  if (!eventTimestamp || !todayTimestamp) return { label: "UPCOMING", tone: "neutral" };

  const daysAway = Math.round((eventTimestamp - todayTimestamp) / (24 * 60 * 60 * 1000));
  if (daysAway <= 0) return { label: "TODAY", tone: "live" };
  if (daysAway === 1) return { label: "TOMORROW", tone: "today" };
  if (daysAway <= 7) return { label: "THIS WEEK", tone: "week" };
  return { label: "UPCOMING", tone: "neutral" };
}

function formatCityLabel(value) {
  return String(value || "Global")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeCityValue(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^queer\s+/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function resolveCityOption(value, options = []) {
  const normalized = normalizeCityValue(value);
  if (!normalized) return "";
  return options.find((city) => normalizeCityValue(city) === normalized) || "";
}

function getPlaceSignalScore(place = {}) {
  const reviews = Number(place.reviewCount ?? place.review_count ?? 0) || 0;
  const rating = Number(place.avgRating ?? place.avg_rating ?? 0) || 0;
  return reviews * 100 + Math.round(rating * 10);
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
  const initialFeaturedVenue = useMemo(
    () => (initialHomeData?.featuredVenue && typeof initialHomeData.featuredVenue === "object" ? initialHomeData.featuredVenue : null),
    [initialHomeData]
  );
  const initialMetrics = initialHomeData?.metrics || null;
  const hasCompleteInitialHomeData = initialHomeData?.complete !== false;
  const hasInitialHomeData =
    initialEvents.length > 0 || initialPlaces.length > 0 || initialWorldNews.length > 0;
  const [events, setEvents] = useState(initialEvents);
  const [places, setPlaces] = useState(initialPlaces);
  const [homeMetrics, setHomeMetrics] = useState(initialMetrics);
  const [query, setQuery] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [authReturnTarget, setAuthReturnTarget] = useState("/");
  const [showSaved, setShowSaved] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(!hasInitialHomeData);
  const [dataError, setDataError] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [worldNews, setWorldNews] = useState(initialWorldNews);
  const [featuredVenue, setFeaturedVenue] = useState(initialFeaturedVenue);
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const [nowTick, setNowTick] = useState(0);
  const [homeFocusCity, setHomeFocusCity] = useState("");
  const [homeFocusSource, setHomeFocusSource] = useState("");
  const viewedHomeSectionsRef = useRef(new Set());
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

  const openSignup = useCallback((target = "/", mode = "signup", source = "home") => {
    setAuthMessage("");
    setAuthMode(mode === "signin" ? "signin" : "signup");
    setPasswordInput("");
    setPendingEmailConfirmation("");
    setResetPasswordInput("");
    setResetPasswordConfirmInput("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("qa_redirect");
    }
    const safeTarget = String(target || "/").startsWith("/") ? String(target || "/") : "/";
    setAuthReturnTarget(safeTarget);
    writeLocalValue("qa_post_login_target", safeTarget);
    trackKpiEvent("home_member_prompt_opened", {
      meta: { source, mode: mode === "signin" ? "signin" : "signup", destination: safeTarget },
    });
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
      openSignup("/", "signup", "search_save");
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
      featuredVenue: payload?.featuredVenue && typeof payload.featuredVenue === "object" ? payload.featuredVenue : null,
      metrics: payload?.metrics && typeof payload.metrics === "object" ? payload.metrics : null,
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
      if (cached.data.featuredVenue && typeof cached.data.featuredVenue === "object") {
        setFeaturedVenue(cached.data.featuredVenue);
      }
      if (cached.data.metrics && typeof cached.data.metrics === "object") {
        setHomeMetrics(cached.data.metrics);
      }
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
    const nextFeaturedVenue = payload.featuredVenue;
    const nextMetrics = payload.metrics;

    setEvents(nextEvents);
    setPlaces(nextPlaces);
    setWorldNews(nextWorldNews);
    if (nextFeaturedVenue) setFeaturedVenue(nextFeaturedVenue);
    if (nextMetrics) setHomeMetrics(nextMetrics);
    writeRuntimeCache(HOME_DATA_CACHE_KEY, {
      events: nextEvents,
      places: nextPlaces,
      worldNews: nextWorldNews,
      featuredVenue: nextFeaturedVenue,
      metrics: nextMetrics,
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
        featuredVenue: initialFeaturedVenue,
        metrics: initialMetrics,
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
    initialFeaturedVenue,
    initialMetrics,
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
    if (typeof window === "undefined" || isAuthLoading) return;
    const sessionKey = "qa_home_view_tracked_v1";
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // Continue with best-effort measurement when session storage is unavailable.
    }
    trackKpiEvent("home_viewed", {
      meta: { member_status: isMember ? "member" : "visitor" },
    });
  }, [isAuthLoading, isMember]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return undefined;
    const sections = [...document.querySelectorAll("[data-home-section]")];
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) continue;
        const section = String(entry.target.getAttribute("data-home-section") || "").trim();
        if (!section || viewedHomeSectionsRef.current.has(section)) continue;
        viewedHomeSectionsRef.current.add(section);
        trackKpiEvent("home_section_viewed", {
          meta: { section, member_status: isMember ? "member" : "visitor" },
        });
        observer.unobserve(entry.target);
      }
    }, { threshold: [0.3] });

    sections.forEach((section) => {
      const sectionName = String(section.getAttribute("data-home-section") || "").trim();
      if (!viewedHomeSectionsRef.current.has(sectionName)) observer.observe(section);
    });
    return () => observer.disconnect();
  }, [isMember, showDeferredSections]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("join") !== "true") return;

    queueMicrotask(() => {
      openSignup("/", "signup", "join_link");
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

      startTransition(() => {
        setResults(merged.all);
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
  const upcomingEvents = useMemo(() => {
    const nowTimestamp = Number(nowTick || 0);
    const todayTimestamp = getDayStartTimestamp(nowTimestamp);
    return [...events]
      .map((event) => ({ ...event, __ts: parseEventTimestamp(event?.date) }))
      .filter((event) => event.__ts > 0 && event.__ts >= todayTimestamp)
      .sort((a, b) => a.__ts - b.__ts);
  }, [events, nowTick]);

  const cityOptions = HOME_CITY_OPTIONS;

  useEffect(() => {
    if (typeof window === "undefined" || cityOptions.length === 0 || homeFocusSource === "manual") return;

    let storedCity = "";
    let lastExploredCity = "";
    try {
      storedCity = localStorage.getItem(HOME_FOCUS_CITY_KEY) || "";
      lastExploredCity = localStorage.getItem(LAST_EXPLORED_CITY_KEY) || "";
    } catch {
      // Continue with profile and atlas signals when storage is restricted.
    }

    const candidates = [
      { value: storedCity, source: "manual" },
      { value: memberProfile?.homeCity, source: "home" },
      { value: lastExploredCity, source: "recent" },
      { value: strongestCitySignal?.city, source: "popular" },
    ];
    const match = candidates
      .map((candidate) => ({ ...candidate, city: resolveCityOption(candidate.value, cityOptions) }))
      .find((candidate) => candidate.city);

    if (!match) return;
    queueMicrotask(() => {
      setHomeFocusCity(match.city);
      setHomeFocusSource(match.source);
    });
  }, [cityOptions, homeFocusSource, memberProfile?.homeCity, strongestCitySignal?.city]);

  const focusedCity = resolveCityOption(homeFocusCity, cityOptions) || strongestCitySignal?.city || cityOptions[0] || "";
  const focusedCityPlaces = useMemo(
    () => places.filter((place) => normalizeCityValue(place?.city) === normalizeCityValue(focusedCity)),
    [focusedCity, places]
  );
  const focusedCityEvents = useMemo(
    () => events.filter((event) => normalizeCityValue(event?.city) === normalizeCityValue(focusedCity)),
    [events, focusedCity]
  );
  const focusedUpcomingEvent = useMemo(
    () => upcomingEvents.find((event) => normalizeCityValue(event?.city) === normalizeCityValue(focusedCity)) || null,
    [focusedCity, upcomingEvents]
  );
  const nextUpcomingEvent = focusedUpcomingEvent || upcomingEvents[0] || null;
  const focusedVenue = useMemo(
    () => [...focusedCityPlaces].sort((a, b) => getPlaceSignalScore(b) - getPlaceSignalScore(a))[0] || null,
    [focusedCityPlaces]
  );
  const handleHomeFocusCityChange = useCallback((nextCity) => {
    const resolved = resolveCityOption(nextCity, cityOptions);
    if (!resolved) return;
    setHomeFocusCity(resolved);
    setHomeFocusSource("manual");
    try {
      localStorage.setItem(HOME_FOCUS_CITY_KEY, resolved);
    } catch {
      // The selected city remains active for this session when storage is restricted.
    }
    trackKpiEvent("home_city_focus_changed", { city: resolved });
  }, [cityOptions]);

  const nextEventFreshness = useMemo(
    () => getUpcomingEventSignal(nextUpcomingEvent?.date, nowTick),
    [nextUpcomingEvent, nowTick]
  );

  const trackHomeAction = (action, destination, meta = {}) => {
    trackKpiEvent("home_action_selected", {
      meta: { action, destination, ...meta },
    });
  };

  const submitHomeSearch = (source) => {
    const normalizedQuery = query.trim();
    trackKpiEvent("home_search_submitted", {
      meta: {
        source,
        query_length: normalizedQuery.length,
        result_count: results.length,
      },
    });
    router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
  };

  const cityCount = useMemo(
    () => new Set(places.map((place) => place.city).filter(Boolean)).size,
    [places]
  );
  const eventCount = events.length;
  const placeCount = places.length;
  const metricsForCards = useMemo(
    () => ({
      countries:
        Number.isFinite(Number(homeMetrics?.countries))
          ? Number(homeMetrics.countries)
          : HOME_COUNTRY_COUNT,
      cities:
        Number.isFinite(Number(homeMetrics?.cities))
          ? Number(homeMetrics.cities)
          : cityCount,
      places:
        Number.isFinite(Number(homeMetrics?.places))
          ? Number(homeMetrics.places)
          : placeCount,
      events:
        Number.isFinite(Number(homeMetrics?.events))
          ? Number(homeMetrics.events)
          : eventCount,
    }),
    [cityCount, eventCount, homeMetrics, placeCount]
  );
  const formatMetric = (value) => (value > 0 ? String(value) : "-");
  const countryCountDisplay = isDataLoading && !homeMetrics ? "..." : formatMetric(metricsForCards.countries);
  const cityCountDisplay = isDataLoading && !homeMetrics ? "..." : formatMetric(metricsForCards.cities);
  const placeCountDisplay = isDataLoading && !homeMetrics ? "..." : formatMetric(metricsForCards.places);
  const eventCountDisplay = isDataLoading && !homeMetrics ? "..." : formatMetric(metricsForCards.events);

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

  const discoveryCards = [
    {
      title: "Cities",
      description: "Places, safety and local queer life.",
      shortDescription: "Places, safety and queer life.",
      icon: "Cities",
      metric: `${cityCountDisplay} cities`,
      surface: "border-sky-200/16 bg-[radial-gradient(circle_at_95%_0%,rgba(56,189,248,0.18),transparent_40%),linear-gradient(150deg,rgba(18,39,75,0.92),rgba(12,24,52,0.95))] hover:border-sky-200/34",
      glow: "bg-sky-300/20",
      accentLine: "from-transparent via-sky-200/70 to-transparent",
      iconSurface: "border-sky-100/20 bg-[linear-gradient(145deg,rgba(125,211,252,0.24),rgba(37,99,235,0.24))] text-sky-50",
      metricClass: "text-sky-100/56",
      onClick: () => {
        trackHomeAction("cities", "/cities");
        router.push("/cities");
      },
    },
    {
      title: "Events",
      description: "What’s happening tonight and later.",
      shortDescription: "What’s on tonight and later.",
      icon: "Events",
      metric: `${eventCountDisplay} events`,
      surface: "border-rose-200/16 bg-[radial-gradient(circle_at_95%_0%,rgba(251,113,133,0.18),transparent_40%),linear-gradient(150deg,rgba(71,27,57,0.94),rgba(42,20,46,0.96))] hover:border-rose-200/34",
      glow: "bg-rose-300/20",
      accentLine: "from-transparent via-amber-200/70 to-transparent",
      iconSurface: "border-rose-100/20 bg-[linear-gradient(145deg,rgba(253,164,175,0.22),rgba(251,146,60,0.2))] text-rose-50",
      metricClass: "text-rose-100/58",
      onClick: () => {
        trackHomeAction("events", "/events");
        router.push("/events");
      },
    },
    {
      title: "News",
      description: "Queer news from around the world.",
      shortDescription: "Queer news from around the world.",
      icon: "News",
      metric: `${homeNewsItems.length || 0} fresh stories`,
      surface: "border-emerald-200/15 bg-[radial-gradient(circle_at_95%_0%,rgba(45,212,191,0.16),transparent_40%),linear-gradient(150deg,rgba(13,55,62,0.94),rgba(12,31,48,0.96))] hover:border-emerald-200/32",
      glow: "bg-teal-300/18",
      accentLine: "from-transparent via-emerald-200/65 to-transparent",
      iconSurface: "border-emerald-100/18 bg-[linear-gradient(145deg,rgba(110,231,183,0.2),rgba(34,211,238,0.17))] text-emerald-50",
      metricClass: "text-emerald-100/56",
      onClick: () => {
        trackHomeAction("news", "/now");
        router.push("/now");
      },
    },
    {
      title: "Collections",
      description: "Handpicked places, trips and experiences.",
      shortDescription: "Handpicked places and trips.",
      icon: "Collections",
      metric: "Editorial picks",
      surface: "border-violet-200/16 bg-[radial-gradient(circle_at_95%_0%,rgba(192,132,252,0.18),transparent_40%),linear-gradient(150deg,rgba(59,30,81,0.94),rgba(31,22,59,0.96))] hover:border-violet-200/34",
      glow: "bg-violet-300/20",
      accentLine: "from-transparent via-fuchsia-200/66 to-transparent",
      iconSurface: "border-violet-100/20 bg-[linear-gradient(145deg,rgba(216,180,254,0.22),rgba(244,114,182,0.18))] text-violet-50",
      metricClass: "text-violet-100/58",
      onClick: () => {
        trackHomeAction("collections", "/now/collections");
        router.push("/now/collections");
      },
    },
  ];
  const participationActions = [
    {
      title: "Community",
      label: isMember ? "Members, jobs and live conversations" : "Join members, jobs and live conversations",
      shortLabel: isMember ? "Open member hub" : "Join the network",
      icon: "Community",
      cardClass: "border-cyan-100/26 bg-[radial-gradient(circle_at_8%_50%,rgba(45,212,191,0.16),transparent_30%),linear-gradient(110deg,rgba(10,35,42,0.96),rgba(10,19,31,0.98))] hover:border-cyan-100/48",
      glowClass: "bg-cyan-300/16",
      lineClass: "from-teal-300 via-cyan-300 to-sky-300",
      iconClass: "border-cyan-100/28 bg-[linear-gradient(145deg,rgba(94,234,212,0.2),rgba(34,211,238,0.11))] text-cyan-50",
      titleClass: "text-white",
      copyClass: "text-cyan-50/58",
      arrowClass: "border-cyan-100/20 bg-cyan-100/[0.07] text-cyan-100/70 group-hover:border-cyan-100/40 group-hover:bg-cyan-100/[0.13] group-hover:text-white",
      onClick: () => {
        trackHomeAction("community", "/community", { member_status: isMember ? "member" : "visitor" });
        if (isMember) {
          router.push("/community");
          return;
        }
        openSignup("/community", "signup", "community");
      },
    },
    {
      title: "Contribute",
      label: isMember ? "Add places, events and services" : "Join to add what you know",
      shortLabel: isMember ? "Add what you know" : "Join & add",
      icon: "Contribute",
      cardClass: "border-rose-100/26 bg-[radial-gradient(circle_at_8%_50%,rgba(251,113,133,0.17),transparent_30%),linear-gradient(110deg,rgba(49,18,38,0.96),rgba(25,15,31,0.98))] hover:border-rose-100/48",
      glowClass: "bg-fuchsia-300/17",
      lineClass: "from-rose-300 via-pink-300 to-fuchsia-300",
      iconClass: "border-rose-100/28 bg-[linear-gradient(145deg,rgba(253,164,175,0.2),rgba(232,121,249,0.11))] text-rose-50",
      titleClass: "text-white",
      copyClass: "text-rose-50/58",
      arrowClass: "border-rose-100/20 bg-rose-100/[0.07] text-rose-100/70 group-hover:border-rose-100/40 group-hover:bg-rose-100/[0.13] group-hover:text-white",
      onClick: () => {
        trackHomeAction("contribute", "/contribute", { member_status: isMember ? "member" : "visitor" });
        if (isMember) {
          router.push("/contribute");
          return;
        }
        openSignup("/contribute", "signup", "contribute");
      },
    },
  ];
  const livePulseCards = [
    {
      key: "next-event",
      subtitle: focusedUpcomingEvent ? `Next in ${formatCityLabel(focusedCity)}` : "Next event",
      title: nextUpcomingEvent?.name || "No upcoming event signal yet",
      description: `${formatCityLabel(nextUpcomingEvent?.city)} - ${
        nextUpcomingEvent ? formatDateShort(nextUpcomingEvent.date) : "No date available"
      }.`,
      meta: focusedUpcomingEvent ? "Your local calendar" : "Next global calendar signal",
      signalLabel: "Event route",
      signalValue: nextUpcomingEvent
        ? `${formatCityLabel(nextUpcomingEvent.city)} · ${formatDateShort(nextUpcomingEvent.date)}`
        : "Open the events calendar",
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
        trackHomeAction("next_event", nextUpcomingEvent?.id ? "event_detail" : "/events", {
          city: String(nextUpcomingEvent?.city || ""),
        });
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
      meta: latestPulseNews?.city ? `${formatCityLabel(latestPulseNews.city)} signal` : "Editorial desk",
      signalLabel: "News lane",
      signalValue: homeNewsItems.length ? `${homeNewsItems.length} fresh stories` : "Open queer world news",
      badge: latestPulseNews ? "Fresh" : "Pending",
      badgeClass: "border-cyan-200/30 bg-cyan-200/12 text-cyan-100/90",
      cardClass:
        "border-cyan-200/24 bg-[linear-gradient(180deg,rgba(14,28,44,0.74),rgba(10,12,20,0.92))] hover:border-cyan-200/44",
      ctaLabel: "Open story",
      onClick: () => {
        trackHomeAction("latest_news", "/now");
        router.push("/now");
      },
    },
    {
      key: "local-pick",
      subtitle: focusedCity ? `Local pick · ${formatCityLabel(focusedCity)}` : "Local pick",
      title: focusedVenue?.name || (focusedCity ? `Explore ${formatCityLabel(focusedCity)}` : "Choose a city to begin"),
      description: focusedVenue
        ? `${focusedCityPlaces.length} places and ${focusedCityEvents.length} events mapped in ${formatCityLabel(focusedCity)}.`
        : "Open the city guide for venues, events, safety, and local context.",
      meta: focusedVenue?.type ? String(focusedVenue.type).replaceAll("_", " ") : "City guide",
      signalLabel: "Local atlas",
      signalValue: `${focusedCityPlaces.length} places · ${focusedCityEvents.length} events`,
      badge: homeFocusSource === "home" ? "Home city" : homeFocusSource === "recent" ? "Recent" : "For you",
      badgeClass: "border-fuchsia-200/24 bg-fuchsia-200/12 text-fuchsia-100/90",
      cardClass:
        "border-fuchsia-200/24 bg-[linear-gradient(180deg,rgba(42,16,36,0.72),rgba(14,10,16,0.92))] hover:border-fuchsia-200/44",
      ctaLabel: focusedVenue ? "Open place" : "Open city",
      onClick: () => {
        trackHomeAction("local_pick", focusedVenue?.id ? "place_detail" : "city_guide", {
          city: String(focusedCity || ""),
        });
        if (focusedVenue?.id && focusedCity) {
          router.push(citySelectionPath(focusedCity, { placeId: focusedVenue.id }));
          return;
        }
        if (focusedCity) {
          router.push(cityPath(focusedCity));
          return;
        }
        router.push("/cities");
      },
    },
  ];
  const heroIdentityLabel = isMember
    ? `${memberName || "Alias"} | ${memberProfile?.pronouns || "Pronomen"}`
    : "";

  return (
    <main className="qa-page min-h-screen overflow-x-hidden bg-[#01010C] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(244,114,182,0.05),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(56,189,248,0.06),transparent_27%),linear-gradient(180deg,#01010C_0%,#02020E_52%,#01010C_100%)]" />
        <div className="pointer-events-none absolute left-[-10%] top-20 h-64 w-64 rounded-full bg-rose-500/4 blur-3xl" />
        <div className="pointer-events-none absolute right-[-7%] top-24 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />

        <div className="qa-shell qa-shell-home relative flex min-h-screen w-full flex-col pt-0">
          <section data-home-section="hero" className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden rounded-none bg-[#05070f]/72 px-4 pb-4 pt-4 shadow-[0_22px_72px_rgba(0,0,0,0.32)] backdrop-blur-[1.5px] sm:px-6 sm:pb-4 sm:pt-6 lg:z-[100] lg:min-h-[734px] lg:overflow-visible xl:min-h-[754px] xl:px-8 xl:pb-4 xl:pt-8">
            <div
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%)",
              }}
            >
              <picture>
                <source
                  media="(min-width: 1024px)"
                  srcSet="/home/queer-atlas-luminous-hero-v9.webp"
                  type="image/webp"
                />
                <img
                  src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                  alt=""
                  aria-hidden="true"
                  width="2560"
                  height="1440"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.96] [filter:brightness(0.9)_contrast(1.08)_saturate(0.94)]"
                />
              </picture>
            </div>
            <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(100deg,rgba(2,8,18,0.94)_0%,rgba(3,11,21,0.78)_30%,rgba(3,13,23,0.3)_56%,rgba(3,12,21,0.08)_76%,rgba(2,8,16,0.28)_100%)] lg:block" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(34,211,238,0.11),transparent_34%),radial-gradient(circle_at_4%_45%,rgba(244,114,182,0.075),transparent_32%),linear-gradient(180deg,#03101a_0%,#020914_46%,#01010C_100%)] lg:hidden" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,transparent_0%,transparent_32%,rgba(1,5,13,0.16)_65%,rgba(1,3,10,0.52)_100%)]" />
            <div className="qa-hero-aurora pointer-events-none absolute right-[4%] top-[12%] hidden h-[58%] w-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12)_0%,rgba(244,114,182,0.055)_34%,transparent_70%)] mix-blend-screen blur-[44px] lg:block" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#020812]/72 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-[#030612]/58 to-[#01010C]" />
            <div className="qa-hero-grain pointer-events-none absolute inset-0 hidden opacity-[0.022] mix-blend-soft-light lg:block" />

            <div className="relative z-10 mx-auto flex w-full max-w-[1720px] flex-col lg:min-h-[686px] xl:min-h-[690px]">
          <div className="mb-7 flex items-center justify-end gap-3 sm:mb-14 sm:gap-4 lg:mb-0 lg:justify-between">
            <div className="hidden items-center gap-3 lg:flex">
              <Image
                src="/queer-atlas-logo.png"
                alt="Queer Atlas logo"
                width={56}
                height={56}
                priority
                className="h-12 w-12 shrink-0"
              />
              <div className="qa-display !text-left text-2xl font-semibold tracking-[-0.025em]">
                <span className="text-white">Queer</span>{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-sky-200 to-fuchsia-200 bg-clip-text text-transparent">
                  Atlas
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {isMember && (
                <div className="qa-eyebrow hidden rounded-full border border-white/14 bg-white/5 px-4 py-2 text-white/76 backdrop-blur sm:block">
                  {heroIdentityLabel}
                </div>
              )}

              {!isMember ? (
                <>
                <p className="qa-display hidden text-[15px] font-semibold tracking-[-0.015em] text-white/92 sm:block lg:text-[16px]">
                  A living atlas, <span className="bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 bg-clip-text text-transparent">built together.</span>
                </p>
                <button
                  aria-label="Join Queer Atlas for free"
                  onClick={() => openSignup("/", "signup", "hero_join")}
                  className="qa-home-join-cta qa-action qa-action-strong group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full border border-rose-200/78 bg-[linear-gradient(110deg,#f43f5e_0%,#d946ef_52%,#7c3aed_100%)] py-1.5 pl-2 pr-5 text-[15px] font-bold tracking-[-0.01em] text-white shadow-[0_15px_38px_rgba(217,70,239,0.34),0_7px_22px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] transition duration-300 hover:-translate-y-0.5 hover:border-white hover:brightness-110 hover:shadow-[0_20px_48px_rgba(217,70,239,0.46),0_9px_26px_rgba(244,63,94,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-100/85"
                >
                  <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/34 bg-white/16 text-white shadow-[0_6px_16px_rgba(49,18,61,0.24)] transition group-hover:-rotate-6 group-hover:scale-105" aria-hidden="true">
                    <Sparkles size={16} strokeWidth={2.2} />
                  </span>
                  <span className="relative z-10">Join free</span>
                </button>
                </>
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
                  disabled={isSigningOut}
                  onClick={async () => {
                    if (isSigningOut) return;
                    setIsSigningOut(true);
                    const result = await signOut();
                    if (result?.error) {
                      setAuthMessage("Could not sign out. Please try again.");
                      setIsSigningOut(false);
                      return;
                    }
                    setShowSignup(false);
                    window.location.replace("/");
                  }}
                  className="qa-action inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/[0.02] px-4 text-sm font-medium text-white/70 transition hover:border-white/28 hover:text-white disabled:cursor-wait disabled:opacity-60"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              )}
            </div>
          </div>

          <div className="lg:flex lg:flex-1 lg:items-center">
            <section className="w-full pb-1 lg:pb-10 lg:pt-8 xl:pt-12">
              <div className="flex items-center gap-2.5 sm:gap-3 lg:hidden">
                <Image
                  src="/queer-atlas-logo.png"
                  alt="Queer Atlas logo"
                  width={56}
                  height={56}
                  priority
                  className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
                />
                <div className="qa-display !text-left text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
                    <span className="text-white">Queer</span>{" "}
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-200 to-fuchsia-200 bg-clip-text text-transparent">
                      Atlas
                    </span>
                </div>
              </div>

              <p className="qa-eyebrow mt-6 !text-left text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/72 sm:mt-10 sm:text-[11px]">
                Wherever you are
              </p>
              <h1 className="qa-display qa-h1 mt-3 max-w-[12ch] !text-left text-[2.85rem] font-bold leading-[0.94] tracking-[-0.052em] text-white [hyphens:none] sm:text-[4.9rem] lg:text-[5.5rem] xl:text-[6.35rem]">
                Find your queer world.
              </h1>
              <p className="qa-lead mt-4 max-w-[48ch] !text-left text-[0.95rem] leading-[1.5] tracking-[-0.005em] text-white/76 [hyphens:none] sm:mt-6 sm:text-[1.18rem]">
                <span className="sm:hidden">Places, events, safety and local queer knowledge — wherever you land.</span>
                <span className="hidden sm:inline">Know where to go, what&apos;s happening, how it feels, and what locals actually say — wherever you land.</span>
              </p>
              {isDataLoading && (
                <p role="status" aria-live="polite" className="mt-3 text-xs text-white/55">Loading live atlas data...</p>
              )}
              {dataError && (
                <div role="alert" className="mt-3 inline-flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
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

              <div className="relative z-20 mt-5 w-full max-w-[48rem] sm:mt-8">
              <div className="relative w-full rounded-[24px] border border-cyan-200/24 bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.035))] p-3 shadow-[0_20px_56px_rgba(2,6,23,0.36),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-xl sm:rounded-[30px] sm:p-[18px]">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/38"
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="search"
                      aria-label="Search cities, venues, and events"
                      autoComplete="off"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setShowResults(false);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        submitHomeSearch("keyboard");
                      }}
                      onFocus={() => setShowResults(true)}
                      placeholder="Search a city, venue or event"
                      className="h-12 w-full rounded-[21px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] py-0 pl-11 pr-4 text-[15px] leading-none text-white outline-none backdrop-blur placeholder:text-white/42 focus:border-cyan-300/48 focus:ring-2 focus:ring-cyan-300/22 sm:h-[52px] sm:text-base"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => submitHomeSearch("button")}
                    className="qa-action qa-action-strong h-12 w-full shrink-0 rounded-full border border-cyan-100/72 bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 px-4 text-sm font-semibold text-black transition hover:scale-[1.01] sm:h-[52px] sm:w-auto sm:px-5"
                  >
                    Explore the atlas
                  </button>
                </div>

                  {showResults && results.length > 0 && (
                    <div aria-label="Instant search results" className="absolute top-full z-50 mt-3 w-full max-h-[360px] overflow-y-auto overflow-x-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,15,17,0.98),rgba(11,11,13,0.97))] shadow-[0_24px_72px_rgba(0,0,0,0.48)] backdrop-blur-xl lg:max-h-[560px]">
                      {results.map((result) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className="border-b border-white/6 transition last:border-b-0 hover:bg-white/6"
                        >
                          <div className="flex items-stretch justify-between gap-2">
                            <button
                              type="button"
                              aria-label={`Open ${result.name}`}
                              onClick={() => {
                                setShowResults(false);
                                trackKpiEvent("home_search_result_opened", {
                                  city: String(result?.city || result?.name || ""),
                                  targetType: result.type,
                                  targetId: String(result.id || ""),
                                  meta: { position: results.indexOf(result) + 1 },
                                });
                                openResult(result);
                              }}
                              className="min-w-0 flex-1 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300/45"
                            >
                              <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
                                {result.type}
                              </span>
                              <p className="mt-2 font-medium text-white">{result.name}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                                {getResultMeta(result)}
                              </p>
                            </button>

                            {result.type !== "city" && (
                              <button
                                type="button"
                                aria-label={`${isSavedResult(result) ? "Remove" : "Save"} ${result.name}`}
                                onClick={() => saveResult(result)}
                                className={`qa-action my-auto mr-4 shrink-0 rounded-full border px-3 py-1 text-xs transition ${
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
                    <div role="status" aria-live="polite" className="absolute top-full z-50 mt-3 w-full rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,15,17,0.98),rgba(11,11,13,0.97))] px-5 py-4 text-sm text-white/60 shadow-[0_24px_72px_rgba(0,0,0,0.48)] backdrop-blur-xl">
                      No instant matches yet. Press Explore for full search.
                    </div>
                  )}

                <div className="mt-3 flex items-center divide-x divide-white/10 border-t border-white/10 px-1 pt-3">
                  <div className="min-w-0 flex-1 px-2 text-center sm:px-3">
                    <p className="tabular-nums !text-center text-sm font-semibold leading-none text-white/92 sm:text-base">{countryCountDisplay}</p>
                    <p className="mt-1 !text-center text-[8px] uppercase tracking-[0.15em] text-white/38 sm:text-[9px]">Countries</p>
                  </div>
                  <div className="min-w-0 flex-1 px-2 text-center sm:px-3">
                    <p className="tabular-nums !text-center text-sm font-semibold leading-none text-white/92 sm:text-base">{cityCountDisplay}</p>
                    <p className="mt-1 !text-center text-[8px] uppercase tracking-[0.15em] text-white/38 sm:text-[9px]">Cities</p>
                  </div>
                  <div className="min-w-0 flex-1 px-2 text-center sm:px-3">
                    <p className="tabular-nums !text-center text-sm font-semibold leading-none text-white/92 sm:text-base">{placeCountDisplay}</p>
                    <p className="mt-1 !text-center text-[8px] uppercase tracking-[0.15em] text-white/38 sm:text-[9px]">Places</p>
                  </div>
                  <div className="min-w-0 flex-1 px-2 text-center sm:px-3">
                    <p className="tabular-nums !text-center text-sm font-semibold leading-none text-white/92 sm:text-base">{eventCountDisplay}</p>
                    <p className="mt-1 !text-center text-[8px] uppercase tracking-[0.15em] text-white/38 sm:text-[9px]">Events</p>
                  </div>
                </div>
                </div>

              </div>

            </section>
          </div>
            </div>
          </section>

          <HomeVenueIntelligence
            venue={featuredVenue}
            onOpen={() => trackHomeAction("venue_intelligence", "place_detail", {
              city: String(featuredVenue?.city || ""),
            })}
            onContextOpen={(href) => trackHomeAction("global_context", href)}
          />

          {showDeferredSections ? (
            <HomeDeferredSections
              discoveryCards={discoveryCards}
              livePulseCards={livePulseCards}
              localContext={{
                city: focusedCity,
                cityOptions,
                source: homeFocusSource,
              }}
              onLocalCityChange={handleHomeFocusCityChange}
              participationActions={participationActions}
              onEditorialAction={(destination) => trackHomeAction("editorial_trust", destination)}
              contactSlot={
                <HomeContactSection
                  className="h-full"
                  embedded
                  isMember={isMember}
                  userId={String(user?.id || "")}
                  defaultName={String(memberProfile?.displayName || memberName || "")}
                  onAnalyticsEvent={(action, meta) => trackKpiEvent(`home_${action}`, { meta })}
                />
              }
            />
          ) : (
            <div className="mt-12 hidden h-[460px] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] sm:block" />
          )}

        </div>
      </div>

            {showSignup ? (
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
        postLoginTarget={authReturnTarget}
        pendingSignupProfileKey={PENDING_SIGNUP_PROFILE_KEY}
      />
            ) : null}
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


