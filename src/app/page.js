"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { mergeSeedEvents, mergeSeedPlaces } from "@/lib/seedContent";
import { buildAtlasSearchResults } from "@/lib/search";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { EDITORIAL_PULSE_ITEMS, PULSE_CATEGORIES } from "@/lib/pulse";
import { ArrowUpRight, Search } from "lucide-react";

const PENDING_SIGNUP_PROFILE_KEY = "qa_pending_signup_profile";

function formatDate(value) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
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

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
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
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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
  } = useAuth();
  const needsEmailConfirmation =
    Boolean(pendingEmailConfirmation) || authMessage.toLowerCase().includes("confirm your email");

  const getResultKey = (item) => (
    item.type === "event" ? `event-${item.id}` : String(item.id)
  );

  const isSavedResult = (item) => favorites.includes(getResultKey(item));

  const openSignup = (redirect = "") => {
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
  };

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
      router.push(`/${item.key || item.id}`);
      return;
    }

    if (!item?.city) {
      router.push(item?.type === "event" ? "/events" : "/cities");
      return;
    }

    if (item.type === "place") {
      router.push(`/${item.city.toLowerCase()}?placeId=${item.id}`);
      return;
    }

    router.push(`/${item.city.toLowerCase()}?eventId=${item.id}`);
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

    toggleFavorite(getResultKey(item));
    setShowSaved(true);

    setTimeout(() => {
      setShowSaved(false);
    }, 1000);
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    setEvents(mergeSeedEvents(data || []));
    return { error };
  };

  const fetchPlaces = async () => {
    const { data, error } = await supabase
      .from("places_with_stats")
      .select("*");

    setPlaces(mergeSeedPlaces(data || []));
    return { error };
  };

  const fetchWorldNews = async () => {
    const { data, error } = await supabase
      .from("qa_world_news")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      const localNews = readLocalJson("qa_world_news_admin", []);
      const withLocalCategory = (localNews || []).map((item) => ({
        ...item,
        categoryLabel: PULSE_CATEGORIES.find((option) => option.key === item.category)?.label || "News",
      }));
      const fallback = [...withLocalCategory, ...EDITORIAL_PULSE_ITEMS].sort(compareNewsRecency);
      setWorldNews(fallback);
      return { error: null };
    }

    const withCategoryLabel = (data || []).map((item) => ({
      ...item,
      createdAt: item.created_at || "",
      categoryLabel: PULSE_CATEGORIES.find((option) => option.key === item.category)?.label || "News",
    }));

    const localNews = readLocalJson("qa_world_news_admin", []);
    const withLocalCategory = (localNews || []).map((item) => ({
      ...item,
      categoryLabel: PULSE_CATEGORIES.find((option) => option.key === item.category)?.label || "News",
    }));

    const merged = [...withCategoryLabel, ...withLocalCategory, ...EDITORIAL_PULSE_ITEMS].reduce((acc, item) => {
      const key = String(item.id || `${item.title}-${item.date}`);
      if (!acc.some((existing) => String(existing.id || `${existing.title}-${existing.date}`) === key)) {
        acc.push(item);
      }
      return acc;
    }, []);

    setWorldNews(merged.sort(compareNewsRecency));
    return { error: null };
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

  const loadHomeData = useCallback(async () => {
    setIsDataLoading(true);
    setDataError("");
    const [eventsRes, placesRes, worldNewsRes] = await Promise.all([fetchEvents(), fetchPlaces(), fetchWorldNews()]);
    if (eventsRes?.error || placesRes?.error || worldNewsRes?.error) {
      setDataError("Some live data could not load. Showing available signal.");
    }
    setIsDataLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      await loadHomeData();
    });
  }, [loadHomeData]);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem("qa_favorites");
      if (stored) {
        setFavorites((readLocalJson("qa_favorites", []) || []).map((item) => String(item)));
      }
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsIntroVisible(true);
    }, 80);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("join") !== "true") return;

    queueMicrotask(() => {
      openSignup();
      window.history.replaceState({}, "", "/");
    });
  }, []);

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
    if (isAuthLoading || !isMember) {
      setIsAdmin(false);
      return;
    }

    let active = true;

    queueMicrotask(async () => {
      let adminState = false;
      try {
        const rpcRes = await supabase.rpc("qa_is_admin");
        adminState = Boolean(rpcRes.data);
      } catch {
        adminState = false;
      }

      if (!active) return;
      setIsAdmin(adminState);
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember]);

  useEffect(() => {
    if (!query) {
      queueMicrotask(() => {
        setResults([]);
      });
      return;
    }

    const timeout = setTimeout(() => {
      const merged = buildAtlasSearchResults({
        query,
        places,
        events,
        cityLimit: 4,
        placeLimit: 4,
        eventLimit: 4,
      }).all;

      setResults(merged);
      setShowResults(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [events, places, query]);

  const homeNewsItems = [...worldNews]
    .sort(compareNewsRecency)
    .slice(0, 3);

  const topCities = Object.values(
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
    .slice(0, 3);

  const cityCount = new Set(places.map((place) => place.city).filter(Boolean)).size;
  const eventCount = events.length;
  const placeCount = places.length;
  const introClass = (visibleClass = "") =>
    `transition-all duration-700 ease-out ${isIntroVisible ? `translate-y-0 opacity-100 ${visibleClass}` : "translate-y-3 opacity-0"}`.trim();
  const introStyle = (delay = 0) => ({ transitionDelay: `${delay}ms` });

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
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.06),transparent_16%),radial-gradient(circle_at_22%_18%,rgba(244,114,182,0.08),transparent_20%),radial-gradient(circle_at_80%_16%,rgba(59,130,246,0.07),transparent_20%),linear-gradient(180deg,#050505_0%,#080808_50%,#050505_100%)]" />
        <div className="pointer-events-none absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-rose-500/6 blur-3xl" />
        <div className="pointer-events-none absolute right-[-4%] top-28 h-80 w-80 rounded-full bg-sky-400/6 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/5 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
          <div className={`mb-8 flex flex-wrap items-center justify-between gap-4 ${introClass()}`} style={introStyle(0)}>
            <div className="rounded-full border border-fuchsia-200/15 bg-[linear-gradient(90deg,rgba(244,114,182,0.12),rgba(56,189,248,0.1))] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/78 backdrop-blur">
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
                  className="rounded-full bg-gradient-to-r from-rose-300 via-fuchsia-300 to-orange-200 px-5 py-2 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(244,114,182,0.20)] transition hover:scale-[1.01] hover:opacity-95"
                >
                  Join Queer Atlas
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/favorites")}
                    className="rounded-full border border-fuchsia-200/28 bg-[linear-gradient(90deg,rgba(244,114,182,0.18),rgba(251,146,60,0.16))] px-4 py-2 text-sm font-semibold text-white transition hover:border-fuchsia-200/45"
                  >
                    Your Atlas
                  </button>
                  <button
                    onClick={() => router.push("/community")}
                    className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 backdrop-blur transition hover:border-white/16 hover:text-white sm:inline-flex"
                  >
                    Community
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => router.push("/admin")}
                      className="hidden rounded-full border border-cyan-200/24 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100 transition hover:border-cyan-200/45 sm:inline-flex"
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
                  className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>

          <div className="grid items-start gap-8 xl:grid-cols-[1.28fr_0.72fr] xl:items-end">
            <section className={`pt-1 xl:pt-6 ${introClass()}`} style={introStyle(90)}>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-[linear-gradient(90deg,rgba(56,189,248,0.14),rgba(16,185,129,0.12))] px-4 py-2 text-xs text-white/78 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
                Experience-first queer atlas
              </div>

              <div className="mt-6 flex items-center gap-4 sm:gap-5">
                <Image
                  src="/queer-atlas-heart-logo-progress.svg"
                  alt="Queer Atlas heart"
                  width={96}
                  height={96}
                  className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 xl:h-24 xl:w-24"
                />
                <h1 className="max-w-5xl text-4xl font-bold leading-[0.94] tracking-[-0.05em] text-white sm:text-6xl xl:text-7xl">
                  QUEER ATLAS
                </h1>
              </div>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                Find the city. Feel the signal. The global queer database for discovery,
                vibe, community, and culture.
              </p>
              {isDataLoading && (
                <p className="mt-3 text-xs text-white/55">Loading live atlas data...</p>
              )}
              {dataError && (
                <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
                  <span>{dataError}</span>
                  <button
                    type="button"
                    onClick={loadHomeData}
                    className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="mt-7 w-full max-w-3xl">
                <div className="relative">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-white/35"
                    size={18}
                  />

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search cities, places, events"
                    className="w-full rounded-[28px] border border-fuchsia-200/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] pl-12 pr-28 py-4 text-sm text-white outline-none backdrop-blur placeholder:text-white/45 focus:border-fuchsia-300/45 focus:ring-2 focus:ring-fuchsia-300/20 sm:pl-14 sm:pr-32 sm:py-5 sm:text-base"
                  />

                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-fuchsia-300 via-pink-300 to-orange-200 px-3 py-1.5 text-[11px] font-semibold text-black transition hover:scale-[1.02] sm:right-3 sm:px-4 sm:py-2 sm:text-xs"
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
              <div className={`mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/55 ${introClass()}`} style={introStyle(220)}>
                <span className="rounded-full border border-cyan-200/18 bg-cyan-200/8 px-3 py-1">Updated daily</span>
                <span className="rounded-full border border-emerald-200/18 bg-emerald-200/8 px-3 py-1">Community-powered</span>
                <span className="rounded-full border border-fuchsia-200/18 bg-fuchsia-200/8 px-3 py-1">Member-safe by design</span>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-cyan-200/15 bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Cities</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{cityCount}</p>
                </div>
                <div className="rounded-3xl border border-emerald-200/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Places</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{placeCount}</p>
                </div>
                <div className="rounded-3xl border border-amber-200/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Events</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{eventCount}</p>
                </div>
              </div>
            </section>

            <aside className={`grid gap-4 ${introClass()}`} style={introStyle(170)}>
              <div className="overflow-hidden rounded-[32px] border border-orange-200/16 bg-[linear-gradient(155deg,rgba(58,26,16,0.56),rgba(24,24,24,0.94),rgba(10,10,10,0.98))] p-4 shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-amber-200/70">
                      Queer world news
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      Live now
                    </h2>
                  </div>

                  <button
                    onClick={() => router.push("/now")}
                    className="rounded-full border border-orange-200/20 bg-orange-200/8 px-3 py-1.5 text-[11px] text-orange-100 transition hover:border-orange-200/40 hover:bg-orange-200/14"
                  >
                    Open news
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  {homeNewsItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push("/now")}
                      className="w-full rounded-2xl border border-orange-200/14 bg-[linear-gradient(180deg,rgba(70,33,16,0.72),rgba(31,18,29,0.86),rgba(15,15,15,0.96))] p-3.5 text-left transition hover:-translate-y-[1px] hover:border-orange-200/35"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="rounded-full border border-orange-200/15 bg-orange-200/8 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-orange-100/85">
                          {[item.city || "Global", formatDate(item.date)].join(" | ")}
                        </p>
                        <span className="rounded-full border border-orange-200/18 bg-orange-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-orange-100">
                          {item.categoryLabel || "news"}
                        </span>
                      </div>
                      <p className="mt-2 text-[15px] font-semibold text-white">{item.title || "Queer world update"}</p>
                      <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-white/45">
                        {item.summary || "Fresh global queer signal from the atlas feed."}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-white/38">
                        Open news
                        <ArrowUpRight size={12} />
                      </span>
                    </button>
                  ))}

                  {!isDataLoading && homeNewsItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-white/45">
                      No world news signal yet.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>

          <section className={`mt-12 ${introClass()}`} style={introStyle(260)}>
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
                  className={`group relative h-full w-full cursor-pointer overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 text-left backdrop-blur transition duration-300 hover:-translate-y-[2px] hover:border-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/45 ${item.glow} ${introClass()}`}
                  style={introStyle(310 + (index * 55))}
                >
                  <div className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br ${item.accent}`} />
                  <div className="absolute inset-[1px] rounded-[29px] bg-[#0b0b0b]/96" />

                  <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                      {item.subtitle}
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/64">
                      {item.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between">
                      <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${item.accent}`} />
                      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-white/46 transition group-hover:text-white/72">
                        Open
                        <ArrowUpRight size={12} />
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
                  className={`group relative h-full w-full cursor-pointer overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 text-left backdrop-blur transition duration-300 hover:-translate-y-[2px] hover:border-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/45 ${item.glow} ${introClass()}`}
                  style={introStyle(430 + (index * 55))}
                >
                  <div className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br ${item.accent}`} />
                  <div className="absolute inset-[1px] rounded-[29px] bg-[#0b0b0b]/96" />

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
                        <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={`mt-12 ${introClass()}`} style={introStyle(560)}>
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,1))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.32)]">
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
                    onClick={() => router.push(`/${city.city.toLowerCase()}`)}
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

          <section className={`mt-10 pb-4 ${introClass()}`} style={introStyle(680)}>
            <div className="mx-auto flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/gay-guide"
                className="rounded-full border border-fuchsia-200/22 bg-fuchsia-200/10 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
              >
                Gay Guide
              </Link>
              <Link
                href="/queer-guide"
                className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/40"
              >
                Queer Guide
              </Link>
              <Link
                href="/hbtq-guide"
                className="rounded-full border border-amber-200/22 bg-amber-200/10 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-200/40"
              >
                HBTQ Guide
              </Link>
            </div>
          </section>
        </div>
      </div>

      {showSignup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setShowSignup(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,21,21,0.97),rgba(10,10,10,0.99))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-rose-400/12 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                Member access
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Join Queer Atlas
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/62">
                Unlock community, contribution, and the deeper layer of queer discovery.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthMessage("");
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    authMode === "signin" ? "bg-white text-black" : "bg-transparent text-white/70 hover:text-white"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthMessage("");
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    authMode === "signup" ? "bg-white text-black" : "bg-transparent text-white/70 hover:text-white"
                  }`}
                >
                  Create account
                </button>
              </div>

              {authMode === "signin" ? (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={async () => {
                      setAuthMessage("");
                      setAuthLoading(true);
                      writeLocalValue("qa_post_login_target", "/");
                      const { error } = await signInWithGoogle();
                      if (error) setAuthMessage(error.message);
                      setAuthLoading(false);
                    }}
                    disabled={authLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-white via-rose-100 to-orange-100 py-3 font-semibold text-black transition hover:opacity-95"
                  >
                    {authLoading ? "Opening..." : "Continue with Google"}
                  </button>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <input
                      value={emailInput}
                      onChange={(event) => setEmailInput(event.target.value)}
                      placeholder="you@email.com"
                      className="mb-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                    <input
                      value={passwordInput}
                      onChange={(event) => setPasswordInput(event.target.value)}
                      type="password"
                      placeholder="Password"
                      className="mb-2 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                    <button
                      onClick={async () => {
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
                        }
                        setAuthLoading(false);
                      }}
                      disabled={authLoading}
                      className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      {authLoading ? "Signing in..." : "Sign in with email + password"}
                    </button>

                    <button
                      onClick={async () => {
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
                      }}
                      disabled={authLoading}
                      className="mt-2 w-full rounded-xl border border-white/12 bg-black/20 py-2 text-xs font-semibold tracking-[0.08em] text-white/75 transition hover:border-white/24 hover:text-white"
                    >
                      {authLoading ? "Sending..." : "Send magic link instead"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(244,114,182,0.08),rgba(0,0,0,0.22))] p-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.14em] text-fuchsia-100/85">Build your member identity</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={signupForm.displayName}
                      onChange={(event) => setSignupForm((current) => ({ ...current, displayName: event.target.value }))}
                      placeholder="Display name"
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                    <input
                      value={signupForm.pronouns}
                      onChange={(event) => setSignupForm((current) => ({ ...current, pronouns: event.target.value }))}
                      placeholder="Pronouns (optional)"
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                    <input
                      value={signupForm.homeCity}
                      onChange={(event) => setSignupForm((current) => ({ ...current, homeCity: event.target.value }))}
                      placeholder="Home city"
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                    <input
                      value={signupForm.residentCountry}
                      onChange={(event) => setSignupForm((current) => ({ ...current, residentCountry: event.target.value }))}
                      placeholder="Country"
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                    <input
                      value={signupForm.email}
                      onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Email"
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30 sm:col-span-2"
                    />
                    <input
                      type="password"
                      value={signupForm.password}
                      onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                      placeholder="Choose password"
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                    <input
                      type="password"
                      value={signupForm.confirmPassword}
                      onChange={(event) => setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="Confirm password"
                      className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                  </div>

                  <button
                    onClick={async () => {
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
                      } else {
                        setPendingEmailConfirmation(email);
                        setPendingConfirmationPassword(password);
                        localStorage.setItem(
                          PENDING_SIGNUP_PROFILE_KEY,
                          JSON.stringify({ ...profilePayload, email })
                        );
                        setAuthMessage("Account created. Confirm your email to activate your profile.");
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
                    }}
                    disabled={authLoading}
                    className="mt-3 w-full rounded-xl border border-fuchsia-200/22 bg-fuchsia-200/12 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/38 hover:bg-fuchsia-200/18"
                  >
                    {authLoading ? "Creating..." : "Create account"}
                  </button>
                </div>
              )}

              {authMessage && (
                <div
                  className={`mt-4 rounded-xl border px-3 py-2 text-xs ${
                    needsEmailConfirmation
                      ? "animate-pulse border-amber-300/45 bg-amber-300/15 text-amber-100"
                      : "border-white/10 bg-white/5 text-white/75"
                  }`}
                >
                  {authMessage}
                </div>
              )}
              {needsEmailConfirmation && (
                <div className="mt-2 rounded-xl border border-amber-200/25 bg-amber-200/10 px-3 py-2 text-[11px] text-amber-100/90">
                  <p>Check inbox + spam in 1-2 minutes, then confirm the link.</p>
                  {pendingEmailConfirmation && (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-amber-100/80">
                      Auto-check active on this screen. After confirmation on phone, this tab signs in automatically.
                    </p>
                  )}
                  {pendingEmailConfirmation && (
                    <button
                      type="button"
                      onClick={async () => {
                        setAuthLoading(true);
                        const { error } = await signInWithEmail(pendingEmailConfirmation);
                        if (error) {
                          setAuthMessage(error.message);
                        } else {
                          setAuthMessage("New confirmation email sent. Check inbox + spam.");
                        }
                        setAuthLoading(false);
                      }}
                      disabled={authLoading}
                      className="mt-2 rounded-full border border-amber-100/35 bg-amber-100/15 px-3 py-1 text-[10px] font-semibold tracking-[0.08em] text-amber-50 transition hover:bg-amber-100/22 disabled:opacity-70"
                    >
                      {authLoading ? "Sending..." : "Resend confirmation"}
                    </button>
                  )}
                </div>
              )}

              <p className="mt-5 text-xs leading-6 text-white/36">
                By signing in or creating an account, you agree to our{" "}
                <Link href="/terms" className="text-white/70 underline underline-offset-2 transition hover:text-white">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-white/70 underline underline-offset-2 transition hover:text-white">
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                onClick={() => setShowSignup(false)}
                className="mt-4 text-sm text-white/46 transition hover:text-white/75"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

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
