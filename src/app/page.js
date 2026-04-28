"use client";

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
import { trackKpiEvent } from "@/lib/analytics";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { readRuntimeCache, writeRuntimeCache } from "@/lib/runtimeCache";
import { EDITORIAL_PULSE_ITEMS, PULSE_CATEGORIES } from "@/lib/pulse";
import { formatDateShort } from "@/lib/dateDisplay";

const AuthModal = dynamic(() => import("@/components/home/AuthModal"), {
  ssr: false,
});

const PENDING_SIGNUP_PROFILE_KEY = "qa_pending_signup_profile";
const HOME_ATLAS_CACHE_KEY = "qa_home_atlas_data_v1";
const HOME_NEWS_CACHE_KEY = "qa_home_news_data_v1";
const HOME_DATA_CACHE_TTL_MS = 3 * 60 * 1000;

function splitLegacyVibe(description = "") {
  const raw = String(description || "");
  const match = raw.match(/^\[Vibe:\s*([^\]]+)\]\s*(?:\n\n)?([\s\S]*)$/i);
  if (!match) {
    return {
      vibe: "",
      description: raw,
    };
  }

  return {
    vibe: String(match[1] || "").trim(),
    description: String(match[2] || "").trim(),
  };
}

function mapGlobalEventForSearch(row = {}) {
  const parsed = splitLegacyVibe(row.description || "");
  const startDate = String(row.start_date || row.date || "").slice(0, 10);
  const endDate = String(row.end_date || row.start_date || row.date || "").slice(0, 10);

  return {
    id: `global-${String(row.id || "")}`,
    name: String(row.name || "").trim(),
    city: "Global",
    description: parsed.description || "",
    vibe: String(row.vibe || parsed.vibe || "").trim(),
    date: startDate,
    start_date: startDate,
    end_date: endDate || startDate,
    location: String(row.location || "").trim(),
    link: String(row.link || "").trim(),
    isGlobal: true,
  };
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

function compareNewsRecency(a, b) {
  const byCreatedAt =
    parseNewsTimestamp(b.createdAt || b.created_at) - parseNewsTimestamp(a.createdAt || a.created_at);
  if (byCreatedAt !== 0) return byCreatedAt;

  const byDate = parseNewsTimestamp(b.date) - parseNewsTimestamp(a.date);
  if (byDate !== 0) return byDate;

  return String(b.id || "").localeCompare(String(a.id || ""));
}

function SearchIcon({ className = "", size = 18 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "", size = 12 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isAtlasDataLoading, setIsAtlasDataLoading] = useState(false);
  const [hasAtlasDataLoaded, setHasAtlasDataLoaded] = useState(false);
  const [dataError, setDataError] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [worldNews, setWorldNews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authMode, setAuthMode] = useState("signin");
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState("");
  const [pendingConfirmationPassword, setPendingConfirmationPassword] = useState("");
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
  const [isIntroVisible] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
    updateMemberProfile,
    signOut,
    user,
  } = useAuth();
  const currentEmail = String(user?.email || "").trim().toLowerCase();
  const needsEmailConfirmation =
    Boolean(pendingEmailConfirmation) || authMessage.toLowerCase().includes("confirm your email");

  const getResultKey = (item) => (
    item.type === "event" ? `event-${item.id}` : String(item.id)
  );

  const isSavedResult = (item) => favorites.includes(getResultKey(item));

  const openSignup = useCallback((redirect = "") => {
    setAuthMessage("");
    setAuthMode("signin");
    setPasswordInput("");
    setPendingEmailConfirmation("");
    setPendingConfirmationPassword("");
    if (redirect) {
      writeLocalValue("qa_redirect", redirect);
      writeLocalValue("qa_post_login_target", redirect);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("qa_redirect");
      writeLocalValue("qa_post_login_target", "/");
    }
    setShowSignup(true);
  }, []);

  const takeAllowedRedirect = () => {
    if (typeof window === "undefined") return "";

    const rawRedirect = (localStorage.getItem("qa_redirect") || "").trim();
    localStorage.removeItem("qa_redirect");

    if (!rawRedirect) return "";
    if (
      rawRedirect === "/favorites" ||
      rawRedirect === "/favorites/" ||
      rawRedirect.startsWith("/favorites?")
    ) {
      return "";
    }

    const allowedPrefixes = ["/community", "/contribute", "/search", "/admin"];
    return allowedPrefixes.some(
      (prefix) => rawRedirect === prefix || rawRedirect.startsWith(`${prefix}?`)
    )
      ? rawRedirect
      : "";
  };

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

  const fetchEvents = async () => {
    const [{ supabase }, { mergeSeedEventsAsync }] = await Promise.all([
      import("@/lib/supabase"),
      import("@/lib/seedMerge"),
    ]);

    const [eventsRes, globalRes] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true }),
      supabase
        .from("global_events")
        .select("*")
        .order("date", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

    const mergedEvents = await mergeSeedEventsAsync(eventsRes?.data || []);
    const globalEvents = Array.isArray(globalRes?.data)
      ? globalRes.data.map(mapGlobalEventForSearch).filter((event) => event.name)
      : [];

    return { error: eventsRes?.error || globalRes?.error, data: [...mergedEvents, ...globalEvents] };
  };

  const fetchPlaces = async () => {
    const { fetchPlacesForAtlas } = await import("@/lib/placesDataApi");
    const { data, error } = await fetchPlacesForAtlas();
    return { error, data };
  };

  const fetchWorldNews = async () => {
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase
      .from("qa_world_news")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = [...EDITORIAL_PULSE_ITEMS].sort(compareNewsRecency);
      return { error: null, data: fallback };
    }

    const withCategoryLabel = (data || []).map((item) => ({
      ...item,
      createdAt: item.created_at || "",
      categoryLabel: PULSE_CATEGORIES.find((option) => option.key === item.category)?.label || "News",
    }));

    const merged = [...withCategoryLabel, ...EDITORIAL_PULSE_ITEMS].reduce((acc, item) => {
      const key = String(item.id || `${item.title}-${item.date}`);
      if (!acc.some((existing) => String(existing.id || `${existing.title}-${existing.date}`) === key)) {
        acc.push(item);
      }
      return acc;
    }, []);

    return { error: null, data: merged.sort(compareNewsRecency) };
  };

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

  const loadAtlasData = useCallback(async ({ forceRefresh = false } = {}) => {
    if (isAtlasDataLoading) return;

    setIsAtlasDataLoading(true);
    setDataError("");

    const cached = forceRefresh
      ? { hit: false, stale: true }
      : readRuntimeCache(HOME_ATLAS_CACHE_KEY, HOME_DATA_CACHE_TTL_MS);
    if (cached.hit && cached.data) {
      setEvents(Array.isArray(cached.data.events) ? cached.data.events : []);
      setPlaces(Array.isArray(cached.data.places) ? cached.data.places : []);
      setHasAtlasDataLoaded(true);
      setIsAtlasDataLoading(false);
      if (!cached.stale) {
        return;
      }
    }

    const [eventsRes, placesRes] = await Promise.all([fetchEvents(), fetchPlaces()]);
    const nextEvents = eventsRes?.data || [];
    const nextPlaces = placesRes?.data || [];

    setEvents(nextEvents);
    setPlaces(nextPlaces);
    setHasAtlasDataLoaded(true);
    writeRuntimeCache(HOME_ATLAS_CACHE_KEY, {
      events: nextEvents,
      places: nextPlaces,
    });

    if (eventsRes?.error || placesRes?.error) {
      setDataError("Some atlas data could not load. Showing available signal.");
    }
    setIsAtlasDataLoading(false);
  }, [isAtlasDataLoading]);

  const loadHomeNews = useCallback(async ({ forceRefresh = false } = {}) => {
    setIsNewsLoading(true);
    setDataError("");

    const cached = forceRefresh
      ? { hit: false, stale: true }
      : readRuntimeCache(HOME_NEWS_CACHE_KEY, HOME_DATA_CACHE_TTL_MS);
    if (cached.hit && cached.data) {
      setWorldNews(Array.isArray(cached.data.worldNews) ? cached.data.worldNews : []);
      setIsNewsLoading(false);
      if (!cached.stale) return;
    }

    const worldNewsRes = await fetchWorldNews();
    const nextWorldNews = worldNewsRes?.data || [];
    setWorldNews(nextWorldNews);
    writeRuntimeCache(HOME_NEWS_CACHE_KEY, {
      worldNews: nextWorldNews,
    });

    if (worldNewsRes?.error) {
      setDataError("Some world news data could not load. Showing available signal.");
    }
    setIsNewsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await loadHomeNews();
    };

    let timeoutId;
    let idleId;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => {
        run();
      }, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(run, 260);
    }

    return () => {
      cancelled = true;
      if (typeof idleId === "number" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [loadHomeNews]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasAtlasDataLoaded || isAtlasDataLoading) return;

    let cancelled = false;
    const run = () => {
      if (cancelled || hasAtlasDataLoaded || isAtlasDataLoading) return;
      loadAtlasData();
    };

    let timeoutId;
    let idleId;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(run, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(run, 700);
    }

    return () => {
      cancelled = true;
      if (typeof idleId === "number" && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [hasAtlasDataLoaded, isAtlasDataLoading, loadAtlasData]);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem("qa_favorites");
      if (stored) {
        setFavorites((readLocalJson("qa_favorites", []) || []).map((item) => String(item)));
      }
    });
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

    const redirect = takeAllowedRedirect();
    if (redirect) {
      router.push(redirect);
    }

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
    if (!pendingEmailConfirmation || !pendingConfirmationPassword || isMember) return;

    let cancelled = false;
    let checking = false;

    const tryAutoSignIn = async () => {
      if (cancelled || checking) return;
      checking = true;
      const { error } = await signInWithPassword(
        pendingEmailConfirmation,
        pendingConfirmationPassword,
        { silent: true }
      );

      if (cancelled) return;

      if (!error) {
        setAuthMessage("Email confirmed. Signing you in...");
        setPendingEmailConfirmation("");
        setPendingConfirmationPassword("");
        checking = false;
        return;
      }

      const lower = String(error?.message || "").toLowerCase();
      const stillPending =
        lower.includes("confirm") ||
        lower.includes("verification") ||
        lower.includes("not confirmed");

      if (!stillPending) {
        setAuthMessage(error.message || "Login pending. Please try again.");
      }

      checking = false;
    };

    const initial = window.setTimeout(tryAutoSignIn, 4000);
    const interval = window.setInterval(tryAutoSignIn, 12000);

    return () => {
      cancelled = true;
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [isMember, pendingConfirmationPassword, pendingEmailConfirmation, signInWithPassword]);

  useEffect(() => {
    if (isAuthLoading || !isMember) return;

    let active = true;

    queueMicrotask(async () => {
      const { resolveAdminAccess } = await import("@/lib/adminAccess");
      const { isAdmin: adminState } = await resolveAdminAccess({
        email: currentEmail,
      });

      if (!active) return;
      setIsAdmin(adminState);
    });

    return () => {
      active = false;
    };
  }, [currentEmail, isAuthLoading, isMember]);

  useEffect(() => {
    if (!deferredQuery) {
      queueMicrotask(() => {
        setResults([]);
      });
      return;
    }

    if (!hasAtlasDataLoaded) {
      queueMicrotask(() => {
        loadAtlasData();
      });
      return;
    }

    let disposed = false;
    const timeout = setTimeout(async () => {
      const [{ buildAtlasSearchResults }, { getQualityMap }] = await Promise.all([
        import("@/lib/search"),
        import("@/lib/quality"),
      ]);
      if (disposed) return;

      const merged = buildAtlasSearchResults({
        query: deferredQuery,
        places,
        events,
        cityLimit: 4,
        placeLimit: 4,
        eventLimit: 4,
        favoriteIds: favorites,
        qualityMap: getQualityMap(),
      }).all;

      startTransition(() => {
        setResults(merged);
        setShowResults(true);
      });
    }, 300);

    return () => {
      disposed = true;
      clearTimeout(timeout);
    };
  }, [deferredQuery, events, favorites, hasAtlasDataLoaded, loadAtlasData, places]);

  const homeNewsItems = useMemo(
    () => [...worldNews].sort(compareNewsRecency).slice(0, 3),
    [worldNews]
  );

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

  const cityCount = useMemo(
    () => new Set(places.map((place) => place.city).filter(Boolean)).size,
    [places]
  );
  const eventCount = events.length;
  const placeCount = places.length;
  const formatMetric = (value) => (value > 0 ? String(value) : "—");
  const cityCountDisplay = isAtlasDataLoading || !hasAtlasDataLoaded ? "…" : formatMetric(cityCount);
  const placeCountDisplay = isAtlasDataLoading || !hasAtlasDataLoaded ? "…" : formatMetric(placeCount);
  const eventCountDisplay = isAtlasDataLoading || !hasAtlasDataLoaded ? "…" : formatMetric(eventCount);
  const introClass = (visibleClass = "") =>
    `transition-all duration-700 ease-out ${isIntroVisible ? `translate-y-0 opacity-100 ${visibleClass}` : "translate-y-3 opacity-0"}`.trim();
  const introStyle = (delay = 0) => ({ transitionDelay: `${delay}ms` });
  const belowFoldStyle = {
    contentVisibility: "auto",
    containIntrinsicSize: "1200px",
  };

  const handleGoogleSignIn = async () => {
    setAuthMessage("");
    setAuthLoading(true);
    writeLocalValue("qa_post_login_target", "/");
    const { error } = await signInWithGoogle();
    if (error) setAuthMessage(error.message);
    setAuthLoading(false);
  };

  const handlePasswordSignIn = async () => {
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthMessage("Enter both email and password.");
      return;
    }

    setAuthMessage("");
    setAuthLoading(true);
    writeLocalValue("qa_post_login_target", "/");
    const { error } = await signInWithPassword(emailInput.trim(), passwordInput);
    if (error) {
      setAuthMessage(error.message);
    } else {
      setAuthMessage("Signed in. Redirecting...");
      trackKpiEvent("login_completed", {
        memberKey: emailInput.trim().toLowerCase(),
      });
    }
    setAuthLoading(false);
  };

  const handleMagicLinkSignIn = async () => {
    if (!emailInput.trim()) {
      setAuthMessage("Enter your email to receive a magic link.");
      return;
    }

    setAuthMessage("");
    setAuthLoading(true);
    writeLocalValue("qa_post_login_target", "/");
    const { error } = await signInWithEmail(emailInput.trim());
    if (error) {
      setAuthMessage(error.message);
    } else {
      setAuthMessage("Magic link sent. Check your inbox.");
    }
    setAuthLoading(false);
  };

  const handleCreateAccount = async () => {
    const email = signupForm.email.trim();
    const password = signupForm.password.trim();
    const confirmPassword = signupForm.confirmPassword.trim();
    const profilePayload = {
      displayName: signupForm.displayName.trim(),
      pronouns: signupForm.pronouns.trim(),
      homeCity: signupForm.homeCity.trim(),
      residentCountry: signupForm.residentCountry.trim(),
    };

    if (!profilePayload.displayName || !email || !password) {
      setAuthMessage("Name, email, and password are required.");
      return;
    }
    if (password.length < 6) {
      setAuthMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthMessage("Passwords do not match.");
      return;
    }

    setAuthMessage("");
    setAuthLoading(true);
    writeLocalValue("qa_post_login_target", "/");
    const { data, error } = await signUpWithPassword(email, password);
    if (error) {
      setAuthMessage(error.message);
      setPendingEmailConfirmation("");
      setPendingConfirmationPassword("");
      setAuthLoading(false);
      return;
    }

    if (data?.session) {
      setPendingEmailConfirmation("");
      setPendingConfirmationPassword("");
      const result = await updateMemberProfile(profilePayload);
      if (result?.ok) {
        setAuthMessage("Account ready. Welcome to Queer Atlas.");
      } else {
        setAuthMessage("Account created. Profile can be edited in Your Atlas.");
      }
      trackKpiEvent("signup_completed", {
        memberKey: email.toLowerCase(),
      });
    } else {
      setPendingEmailConfirmation(email);
      setPendingConfirmationPassword(password);
      localStorage.setItem(
        PENDING_SIGNUP_PROFILE_KEY,
        JSON.stringify({ ...profilePayload, email })
      );
      setAuthMessage("Account created. Confirm your email to activate your profile.");
      trackKpiEvent("signup_completed", {
        memberKey: email.toLowerCase(),
      });
    }

    setSignupForm({
      displayName: "",
      pronouns: "",
      homeCity: "",
      residentCountry: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setAuthLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!pendingEmailConfirmation) return;
    setAuthLoading(true);
    const { error } = await signInWithEmail(pendingEmailConfirmation);
    if (error) {
      setAuthMessage(error.message);
    } else {
      setAuthMessage("New confirmation email sent. Check inbox + spam.");
    }
    setAuthLoading(false);
  };

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

  return (
    <main className="qa-page min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(244,114,182,0.09),transparent_23%),radial-gradient(circle_at_86%_14%,rgba(56,189,248,0.08),transparent_24%),linear-gradient(180deg,#050505_0%,#08080a_56%,#050505_100%)]" />
        <div className="pointer-events-none absolute left-[-10%] top-20 h-64 w-64 rounded-full bg-rose-500/6 blur-3xl" />
        <div className="pointer-events-none absolute right-[-7%] top-24 h-72 w-72 rounded-full bg-cyan-400/6 blur-3xl" />

        <div className="qa-shell relative flex min-h-screen w-full flex-col">
          <div className={`mb-8 flex flex-wrap items-center justify-between gap-4 ${introClass()}`} style={introStyle(0)}>
            <div className="qa-eyebrow rounded-full border border-white/14 bg-white/5 px-4 py-2 text-white/76 backdrop-blur">
              Global queer discovery
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isMember && (
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/72 backdrop-blur sm:block">
                  {memberName}{memberProfile?.pronouns ? ` | ${memberProfile.pronouns}` : ""}
                </div>
              )}

              {!isMember ? (
                <button
                  onClick={() => openSignup()}
                  className="qa-action qa-action-strong rounded-full bg-gradient-to-r from-rose-300 via-fuchsia-300 to-orange-200 px-5 py-2 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(244,114,182,0.20)] transition hover:scale-[1.01] hover:opacity-95"
                >
                  Join Queer Atlas
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/favorites")}
                    className="qa-action rounded-full border border-fuchsia-200/26 bg-fuchsia-200/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-fuchsia-200/45 hover:bg-fuchsia-200/14"
                  >
                    Your Atlas
                  </button>
                  <button
                    onClick={() => router.push("/community")}
                    className="qa-action hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 backdrop-blur transition hover:border-white/16 hover:text-white sm:inline-flex"
                  >
                    Community
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => router.push("/admin")}
                      className="qa-action hidden rounded-full border border-cyan-200/24 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-200/45 sm:inline-flex"
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
                  className="qa-action rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>

          <div className="grid items-start gap-8 xl:grid-cols-[1.28fr_0.72fr] xl:items-end">
            <section className={`pt-1 xl:pt-6 ${introClass()}`} style={introStyle(90)}>
              <div className="qa-eyebrow inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-200/8 px-4 py-2 text-white/78 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
                Experience-first queer atlas
              </div>

              <div className="mt-6 flex items-center gap-4 sm:gap-5">
                <Image
                  src="/queer-atlas-heart-logo-progress.png"
                  alt="Queer Atlas heart"
                  width={96}
                  height={96}
                  className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 xl:h-24 xl:w-24"
                />
                <h1 className="qa-display qa-h1 max-w-5xl text-4xl font-bold text-white sm:text-6xl xl:text-7xl">
                  QUEER ATLAS
                </h1>
              </div>

              <p className="qa-lead mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
                Find the city. Feel the signal. The global queer database for discovery,
                vibe, community, and culture.
              </p>
              {(isNewsLoading || isAtlasDataLoading) && (
                <p className="mt-3 text-xs text-white/55">Loading live atlas data...</p>
              )}
              {dataError && (
                <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
                  <span>{dataError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        loadHomeNews({ forceRefresh: true });
                        loadAtlasData({ forceRefresh: true });
                      }}
                      className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
                    >
                      Retry
                  </button>
                </div>
              )}

              <div className="mt-7 w-full max-w-3xl">
                <div className="relative">
                  <SearchIcon
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-white/35"
                    size={18}
                  />

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => {
                      setShowResults(true);
                      loadAtlasData();
                    }}
                    placeholder="Search cities, places, events"
                    className="w-full rounded-[24px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] py-4 pl-11 pr-24 text-[13px] text-white outline-none backdrop-blur placeholder:text-white/45 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/20 sm:py-5 sm:pl-14 sm:pr-32 sm:text-base"
                  />

                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-200 px-2.5 py-1.5 text-[10px] font-semibold text-black transition hover:scale-[1.02] sm:right-3 sm:px-4 sm:py-2 sm:text-xs"
                  >
                    Explore
                  </button>

                  {showResults && results.length > 0 && (
                    <div className="absolute top-full z-50 mt-3 w-full max-h-[360px] overflow-y-auto overflow-x-hidden rounded-3xl border border-white/10 bg-[#111111]/95 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur">
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
                                className={`rounded-full border px-3 py-1 text-xs transition ${
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
                    <div className="absolute top-full z-50 mt-3 w-full rounded-3xl border border-white/10 bg-[#111111]/95 px-5 py-4 text-sm text-white/60 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur">
                      No instant matches yet. Press Explore for full search.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">Updated daily</span>
                <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">Community-powered</span>
                <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1">Member-safe by design</span>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="qa-card qa-metric-card rounded-3xl border border-white/12 bg-white/[0.045] p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Cities</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{cityCountDisplay}</p>
                </div>
                <div className="qa-card qa-metric-card rounded-3xl border border-white/12 bg-white/[0.045] p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Places</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{placeCountDisplay}</p>
                </div>
                <div className="qa-card qa-metric-card rounded-3xl border border-white/12 bg-white/[0.045] p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Events</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{eventCountDisplay}</p>
                </div>
              </div>
            </section>

            <aside className={`grid gap-4 ${introClass()}`} style={introStyle(170)}>
              <div className="overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(155deg,rgba(20,20,20,0.96),rgba(10,10,10,0.99))] p-4 shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/65">
                      Queer world news
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Live now
                    </h2>
                  </div>

                  <button
                    onClick={() => router.push("/now")}
                    className="rounded-full border border-cyan-200/20 bg-cyan-200/8 px-3 py-1.5 text-[11px] text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-200/14"
                  >
                    Open news
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  {homeNewsItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push("/now")}
                      className="qa-list-card w-full rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(32,32,32,0.88),rgba(14,14,14,0.96))] p-3.5 text-left transition hover:-translate-y-[1px] hover:border-white/26"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="rounded-full border border-white/12 bg-white/7 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/82">
                          {[item.city || "Global", formatDateShort(item.date)].join(" | ")}
                        </p>
                        <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
                          {item.categoryLabel || "news"}
                        </span>
                      </div>
                      <p className="mt-2 text-[15px] font-semibold text-white">{item.title || "Queer world update"}</p>
                      <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-white/45">
                        {item.summary || "Fresh global queer signal from the atlas feed."}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-white/38">
                        Open news
                        <ArrowUpRightIcon size={12} />
                      </span>
                    </button>
                  ))}

                  {!isNewsLoading && homeNewsItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-white/45">
                      No world news signal yet.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <section className={`mt-12 ${introClass()}`} style={{ ...introStyle(260), ...belowFoldStyle }}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                  Discovery lanes
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Move through the atlas
                </h2>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {topLaneCards.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  onClick={item.onClick}
                  className={`group relative h-full w-full cursor-pointer overflow-hidden rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 text-left backdrop-blur transition duration-300 hover:-translate-y-[2px] hover:border-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${item.glow} ${introClass()}`}
                  style={introStyle(310 + (index * 55))}
                >
                  <div className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-80 bg-gradient-to-br ${item.accent}`} />
                  <div className="absolute inset-[1px] rounded-[25px] bg-[#0b0b0b]/96" />

                  <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                      {item.subtitle}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/64">
                      {item.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${item.accent}`} />
                      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-white/46 transition group-hover:text-white/72">
                        Open
                        <ArrowUpRightIcon size={12} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {bottomLaneCards.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  onClick={item.onClick}
                  className={`group relative h-full w-full cursor-pointer overflow-hidden rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 text-left backdrop-blur transition duration-300 hover:-translate-y-[2px] hover:border-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 ${item.glow} ${introClass()}`}
                  style={introStyle(430 + (index * 55))}
                >
                  <div className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-80 bg-gradient-to-br ${item.accent}`} />
                  <div className="absolute inset-[1px] rounded-[25px] bg-[#0b0b0b]/96" />

                  <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                      {item.subtitle}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/64">
                      {item.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${item.accent}`} />
                      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-white/46 transition group-hover:text-white/72">
                        Open
                        <ArrowUpRightIcon size={12} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={`mt-12 ${introClass()}`} style={{ ...introStyle(560), ...belowFoldStyle }}>
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.32)]">
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                City gravity
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
                Where signal is strongest
              </h2>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {topCities.map((city, index) => (
                  <button
                    key={city.city}
                    onClick={() => router.push(cityPath(city.city))}
                    className="w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-4 text-left transition hover:border-white/16 hover:bg-white/6"
                    style={introStyle(610 + (index * 45))}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/6 text-sm font-semibold text-white/75">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{city.city}</p>
                        <p className="mt-1 text-xs text-white/42">
                          {city.count} places | {city.reviews} reviews
                        </p>
                      </div>
                    </div>
                    <span className="mt-3 inline-flex text-xs uppercase tracking-[0.16em] text-white/35">open city</span>
                  </button>
                ))}
              </div>
              {!hasAtlasDataLoaded && (
                <div className="mt-4 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-3 text-xs text-white/55">
                  Tap search to load live city gravity and ranking.
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/cities")}
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs text-white/65 transition hover:border-white/20 hover:text-white"
                >
                  Explore all cities
                </button>
              </div>
            </div>
          </section>

          <section className={`mt-10 pb-4 ${introClass("opacity-70")}`} style={{ ...introStyle(680), ...belowFoldStyle }}>
            <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/45">
              <span className="mr-1 uppercase tracking-[0.18em] text-white/32">Search guides</span>
              <Link
                href="/gay-guide"
                prefetch={false}
                className="rounded-full border border-fuchsia-200/14 bg-fuchsia-200/[0.05] px-2.5 py-1 text-[11px] text-fuchsia-100/70 transition hover:border-fuchsia-200/30 hover:text-fuchsia-100"
              >
                Gay Guide
              </Link>
              <Link
                href="/queer-guide"
                prefetch={false}
                className="rounded-full border border-cyan-200/14 bg-cyan-200/[0.05] px-2.5 py-1 text-[11px] text-cyan-100/70 transition hover:border-cyan-200/30 hover:text-cyan-100"
              >
                Queer Guide
              </Link>
              <Link
                href="/hbtq-guide"
                prefetch={false}
                className="rounded-full border border-amber-200/14 bg-amber-200/[0.05] px-2.5 py-1 text-[11px] text-amber-100/70 transition hover:border-amber-200/30 hover:text-amber-100"
              >
                HBTQ Guide
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/45">
              <Link
                href="/privacy"
                prefetch={false}
                className="underline underline-offset-2 transition hover:text-white"
              >
                Privacy Policy
              </Link>
              <span className="text-white/25">|</span>
              <Link
                href="/terms"
                prefetch={false}
                className="underline underline-offset-2 transition hover:text-white"
              >
                Terms
              </Link>
            </div>
          </section>
        </div>
      </div>

      <AuthModal
        show={showSignup}
        onClose={() => setShowSignup(false)}
        authMode={authMode}
        onAuthModeChange={(mode) => {
          setAuthMode(mode);
          setAuthMessage('');
        }}
        authLoading={authLoading}
        authMessage={authMessage}
        needsEmailConfirmation={needsEmailConfirmation}
        emailInput={emailInput}
        onEmailInputChange={setEmailInput}
        passwordInput={passwordInput}
        onPasswordInputChange={setPasswordInput}
        signupForm={signupForm}
        onSignupFieldChange={(field, value) => setSignupForm((current) => ({ ...current, [field]: value }))}
        pendingEmailConfirmation={pendingEmailConfirmation}
        onGoogleSignIn={handleGoogleSignIn}
        onPasswordSignIn={handlePasswordSignIn}
        onMagicLinkSignIn={handleMagicLinkSignIn}
        onCreateAccount={handleCreateAccount}
        onResendConfirmation={handleResendConfirmation}
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
