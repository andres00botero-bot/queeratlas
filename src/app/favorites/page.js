"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mergeSeedEvents, mergeSeedPlaces } from "@/lib/seedContent";
import { useAuth } from "@/lib/auth";
import { cityConfig } from "@/lib/cities";
import { getBlockedItems } from "@/lib/moderation";
import { getMemberProfile } from "@/lib/memberProfile";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";
import DateInput from "@/components/ui/DateInput";

function timeAgo(value) {
  if (!value) return "Recently";
  const diffHours = Math.round((new Date() - new Date(value)) / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function formatDate(value) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatSavedTime(value) {
  if (!value) return "Not saved yet";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PLAN_STORAGE_KEY = "qa_trip_plans";
const FAVORITES_STORAGE_KEY = "qa_favorites";
const ADDED_STORAGE_KEY = "qa_added";

function mapPlanRow(row) {
  return {
    id: row.client_id || String(row.id),
    title: row.title || "",
    city: row.city || "",
    date: row.date || null,
    placeIds: Array.isArray(row.place_ids) ? row.place_ids : [],
    eventIds: Array.isArray(row.event_ids) ? row.event_ids : [],
    stops: Array.isArray(row.stops) ? row.stops : [],
    note: row.note || "",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    pronouns: "",
    homeCity: "",
    residentCountry: "",
  });
  const [favorites, setFavorites] = useState([]);
  const [added, setAdded] = useState([]);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [isAtlasLoading, setIsAtlasLoading] = useState(false);
  const [atlasLoadError, setAtlasLoadError] = useState("");
  const [plans, setPlans] = useState([]);
  const [showPlannerForm, setShowPlannerForm] = useState(false);
  const [plannerForm, setPlannerForm] = useState({
    title: "",
    city: "",
    date: "",
    placeIds: [],
    eventIds: [],
    note: "",
  });
  const {
    isMember,
    isLoading: isAuthLoading,
    user,
    memberName: authMemberName,
    memberProfile,
    updateMemberProfile,
  } = useAuth();
  const { toast, showToast } = useActionToast();
  const [syncWarning, setSyncWarning] = useState("");

  const loadMemberCollections = useCallback(async (userId, localFavorites, localPlans) => {
    const [favoritesRes, plansRes] = await Promise.all([
      supabase
        .from("member_favorites")
        .select("favorite_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("member_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (favoritesRes.error || plansRes.error) {
      setSyncWarning("Cloud sync unavailable. Using local data.");
      setFavorites((localFavorites || []).map((item) => String(item)));
      setAdded(
        (localFavorites || []).map((id) => ({
          id: String(id),
          date: new Date().toISOString(),
        }))
      );
      setPlans(localPlans || []);
      return;
    }

    const remoteFavorites = (favoritesRes.data || []).map((row) => String(row.favorite_id));
    const remoteAdded = (favoritesRes.data || []).map((row) => ({
      id: String(row.favorite_id),
      date: row.created_at,
    }));
    const remotePlans = (plansRes.data || []).map(mapPlanRow);

    const localFavsNormalized = (localFavorites || []).map((id) => String(id));
    const missingFavorites = localFavsNormalized.filter((id) => !remoteFavorites.includes(id));

    if (missingFavorites.length > 0) {
      await supabase.from("member_favorites").insert(
        missingFavorites.map((id) => ({
          user_id: userId,
          favorite_id: id,
        }))
      );
    }

    if ((localPlans || []).length > 0 && remotePlans.length === 0) {
      await supabase.from("member_plans").insert(
        localPlans.map((plan) => ({
          user_id: userId,
          client_id: String(plan.id || `plan-${Date.now()}`),
          title: plan.title || "",
          city: plan.city || "",
          date: plan.date || null,
          place_ids: (plan.placeIds || []).map(String),
          event_ids: (plan.eventIds || []).map(String),
          stops: Array.isArray(plan.stops) ? plan.stops : [],
          note: plan.note || "",
        }))
      );
    }

    const mergedFavorites = [...new Set([...remoteFavorites, ...localFavsNormalized])];
    setFavorites(mergedFavorites);
    setAdded(
      remoteAdded.length > 0
        ? remoteAdded
        : mergedFavorites.map((id) => ({ id, date: new Date().toISOString() }))
    );
    setPlans(remotePlans.length > 0 ? remotePlans : localPlans || []);

    writeLocalJson(FAVORITES_STORAGE_KEY, mergedFavorites);
    writeLocalJson(ADDED_STORAGE_KEY, remoteAdded);
    writeLocalJson(PLAN_STORAGE_KEY, remotePlans.length > 0 ? remotePlans : localPlans || []);
  }, []);

  const loadAtlasData = useCallback(async () => {
    setIsAtlasLoading(true);
    setAtlasLoadError("");

    const [{ data: placesData, error: placesError }, { data: eventsData, error: eventsError }] = await Promise.all([
      supabase.from("places_with_stats").select("*"),
      supabase.from("events").select("*"),
    ]);

    if (placesError || eventsError) {
      setAtlasLoadError("Could not load some live atlas data. Showing available signal.");
    }

    setPlaces(mergeSeedPlaces(placesData || []));
    setEvents(mergeSeedEvents(eventsData || []));
    setIsAtlasLoading(false);
  }, []);

  const blocked = useMemo(() => {
    const items = getBlockedItems();
    return {
      places: new Set(
        items
          .filter((item) => item.targetType === "place")
          .map((item) => String(item.targetId))
      ),
      events: new Set(
        items
          .filter((item) => item.targetType === "event")
          .map((item) => String(item.targetId))
      ),
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    queueMicrotask(async () => {
      setSyncWarning("");
      if (!isMember) {
        localStorage.removeItem("qa_redirect");
        writeLocalValue("qa_post_login_target", "/");
        router.replace("/?join=true");
        setIsReady(true);
        return;
      }

      const fallbackName =
        localStorage.getItem("qa_member_name") ||
        localStorage.getItem("qa_name") ||
        "";
      const storedFavorites = readLocalJson(FAVORITES_STORAGE_KEY, []);
      const storedPlans = readLocalJson(PLAN_STORAGE_KEY, []);
      const storedProfile =
        memberProfile && (
          memberProfile.displayName ||
          memberProfile.pronouns ||
          memberProfile.homeCity ||
          memberProfile.residentCountry
        )
          ? memberProfile
          : getMemberProfile();

      setMemberName(authMemberName || fallbackName);
      setProfileForm({
        displayName: storedProfile.displayName || authMemberName || fallbackName,
        pronouns: storedProfile.pronouns || "",
        homeCity: storedProfile.homeCity || "",
        residentCountry: storedProfile.residentCountry || "",
      });
      if (user?.id) {
        await loadMemberCollections(user.id, storedFavorites, storedPlans);
      } else {
        setFavorites((storedFavorites || []).map((item) => String(item)));
        setAdded(readLocalJson(ADDED_STORAGE_KEY, []));
        setPlans(storedPlans);
      }

      await loadAtlasData();
      setIsReady(true);
    });
  }, [authMemberName, isAuthLoading, isMember, loadAtlasData, loadMemberCollections, memberProfile, router, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(PLAN_STORAGE_KEY, plans);
  }, [isReady, isMember, plans]);

  const savedPlaces = useMemo(() => {
    return places
      .filter((place) => favorites.includes(String(place.id)) && !blocked.places.has(String(place.id)))
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }, [blocked.places, favorites, places]);

  const savedEvents = useMemo(() => {
    return events
      .filter((event) => favorites.includes(`event-${event.id}`) && !blocked.events.has(String(event.id)))
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  }, [blocked.events, favorites, events]);

  const totalPlaces = savedPlaces.length;
  const totalEvents = savedEvents.length;
  const allCities = [...new Set(savedPlaces.concat(savedEvents).map((item) => item.city).filter(Boolean))];
  const totalCities = allCities.length;

  const vibeCount = savedPlaces.reduce((acc, place) => {
    const vibe = place.vibe || place.type || "Mixed";
    acc[vibe] = (acc[vibe] || 0) + 1;
    return acc;
  }, {});

  const topVibe =
    Object.entries(vibeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "Open";

  const recentSaves = [...added]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((item) => {
      const isEvent = String(item.id).startsWith("event-");
      if (isEvent) {
        const eventId = String(item.id).replace("event-", "");
        const event = events.find((entry) => String(entry.id) === eventId);
        return event
          ? { type: "event", id: event.id, city: event.city, name: event.name, date: item.date }
          : null;
      }

      const place = places.find((entry) => String(entry.id) === String(item.id));
      return place
        ? { type: "place", id: place.id, city: place.city, name: place.name, date: item.date }
        : null;
    })
    .filter(Boolean);

  const thisWeekAdds = added.filter((item) => {
    const date = new Date(item.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;

  const contributionCounts = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        stories: 0,
        guides: 0,
        ideas: 0,
        topics: 0,
        total: 0,
      };
    }

    const stories = readLocalJson("qa_community_stories", []);
    const guides = readLocalJson("qa_community_guides", []);
    const ideas = readLocalJson("qa_community_ideas", []);
    const topics = readLocalJson("qa_community_topics", []);

    const me = (memberProfile?.displayName || authMemberName || memberName || "").trim().toLowerCase();
    if (!me) {
      return {
        stories: 0,
        guides: 0,
        ideas: 0,
        topics: 0,
        total: 0,
      };
    }

    const mineStories = stories.filter((item) => (item.author || "").trim().toLowerCase() === me).length;
    const mineGuides = guides.filter((item) => (item.author || "").trim().toLowerCase() === me).length;
    const mineIdeas = ideas.filter((item) => (item.author || "").trim().toLowerCase() === me).length;
    const mineTopics = topics.filter((item) => (item.author || "").trim().toLowerCase() === me).length;

    return {
      stories: mineStories,
      guides: mineGuides,
      ideas: mineIdeas,
      topics: mineTopics,
      total: mineStories + mineGuides + mineIdeas + mineTopics,
    };
  }, [authMemberName, memberName, memberProfile?.displayName]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const result = await updateMemberProfile(profileForm);
    setMemberName(profileForm.displayName || authMemberName || "Explorer");
    if (result?.ok) {
      showToast("Profile updated.", { tone: "ok", duration: 2200 });
    } else {
      showToast("Profile saved locally. Cloud sync unavailable.", { tone: "info", duration: 2400 });
    }
    setIsEditingProfile(false);
  };

  const hasProfileChanges =
    (profileForm.displayName || "").trim() !== (memberProfile?.displayName || "").trim() ||
    (profileForm.pronouns || "").trim() !== (memberProfile?.pronouns || "").trim() ||
    (profileForm.homeCity || "").trim() !== (memberProfile?.homeCity || "").trim() ||
    (profileForm.residentCountry || "").trim() !== (memberProfile?.residentCountry || "").trim();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = memberName.trim() || "Explorer";
  const plannerCities = useMemo(() => {
    const configCities = Object.values(cityConfig)
      .map((item) => item.title?.replace("Queer ", ""))
      .filter(Boolean);
    const dataCities = [...new Set(places.concat(events).map((item) => item.city).filter(Boolean))];
    return [...new Set([...configCities, ...dataCities])].sort((a, b) => a.localeCompare(b));
  }, [events, places]);
  const activePlannerCity =
    plannerCities.includes(plannerForm.city) ? plannerForm.city : plannerCities[0] || "";
  const plannerPlaces = places
    .filter((place) => place.city?.toLowerCase() === activePlannerCity.toLowerCase())
    .sort((a, b) => {
      const aSaved = favorites.includes(String(a.id)) ? 1 : 0;
      const bSaved = favorites.includes(String(b.id)) ? 1 : 0;
      if (bSaved !== aSaved) return bSaved - aSaved;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    })
    .slice(0, 24);
  const plannerEvents = events
    .filter((event) => event.city?.toLowerCase() === activePlannerCity.toLowerCase())
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .slice(0, 24);

  const togglePlannerSelection = (kind, id) => {
    const key = kind === "place" ? "placeIds" : "eventIds";

    setPlannerForm((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((entry) => entry !== id)
        : [...current[key], id],
    }));
  };

  const createPlan = async (event) => {
    event.preventDefault();
    if (!activePlannerCity || !plannerForm.title) return;
    if (plannerForm.placeIds.length === 0 && plannerForm.eventIds.length === 0) return;

    const stops = [
      ...plannerForm.placeIds.map((id) => {
        const place = places.find((entry) => String(entry.id) === String(id));
        return place
          ? { type: "place", id: place.id, name: place.name, city: place.city }
          : null;
      }),
      ...plannerForm.eventIds.map((id) => {
        const selectedEvent = events.find((entry) => String(entry.id) === String(id));
        return selectedEvent
          ? {
              type: "event",
              id: selectedEvent.id,
              name: selectedEvent.name,
              city: selectedEvent.city,
              date: selectedEvent.date || null,
            }
          : null;
      }),
    ].filter(Boolean);

    const draftPlan = {
      id: `plan-${Date.now()}`,
      title: plannerForm.title,
      city: activePlannerCity,
      date: plannerForm.date || null,
      placeIds: plannerForm.placeIds.map(String),
      eventIds: plannerForm.eventIds.map(String),
      stops,
      note: plannerForm.note,
      createdAt: new Date().toISOString(),
    };

    let savedPlan = draftPlan;
    if (user?.id) {
      const { data, error } = await supabase
        .from("member_plans")
        .insert([{
          user_id: user.id,
          client_id: draftPlan.id,
          title: draftPlan.title,
          city: draftPlan.city,
          date: draftPlan.date,
          place_ids: draftPlan.placeIds,
          event_ids: draftPlan.eventIds,
          stops: draftPlan.stops,
          note: draftPlan.note,
        }])
        .select("*")
        .single();

      if (error || !data) {
        setSyncWarning("Plan synced locally only. Cloud save unavailable.");
      } else {
        savedPlan = mapPlanRow(data);
      }
    }

    setPlans((current) => [savedPlan, ...current]);

    setPlannerForm({
      title: "",
      city: activePlannerCity,
      date: "",
      placeIds: [],
      eventIds: [],
      note: "",
    });
    setShowPlannerForm(false);
    showToast("Plan saved.", { tone: "ok", duration: 2200 });
  };

  const removeFavorite = async (favoriteId, label = "Item") => {
    const updated = favorites.filter((entry) => String(entry) !== String(favoriteId));
    setFavorites(updated);
    writeLocalJson(FAVORITES_STORAGE_KEY, updated);
    writeLocalJson(
      ADDED_STORAGE_KEY,
      added.filter((item) => String(item.id) !== String(favoriteId))
    );
    setAdded((current) => current.filter((item) => String(item.id) !== String(favoriteId)));

    if (user?.id) {
      const { error } = await supabase
        .from("member_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("favorite_id", String(favoriteId));

      if (error) {
        setSyncWarning("Favorite removed locally. Cloud sync unavailable.");
      }
    }

    showToast(`${label} removed from favorites.`, { tone: "info", duration: 2200 });
  };

  const removePlan = async (planId) => {
    setPlans((current) => current.filter((entry) => String(entry.id) !== String(planId)));

    if (user?.id) {
      const { error } = await supabase
        .from("member_plans")
        .delete()
        .eq("user_id", user.id)
        .eq("client_id", String(planId));

      if (error) {
        setSyncWarning("Plan removed locally. Cloud sync unavailable.");
      }
    }
  };

  if (!isReady || !isMember) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <p className="text-sm text-gray-400">Opening your atlas...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <ActionToast toast={toast} />
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.10),transparent_20%),radial-gradient(circle_at_80%_14%,rgba(45,212,191,0.10),transparent_20%),radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />

        <section className="relative mb-8 overflow-hidden rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.14),transparent_24%),linear-gradient(135deg,rgba(24,24,24,0.96),rgba(10,10,10,0.99),rgba(18,24,23,0.97))] p-8 shadow-[0_34px_130px_rgba(0,0,0,0.40)]">
          <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-rose-400/12 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">
              Member atlas
            </p>
            <p className="mt-4 text-sm text-rose-100/78">
              {greeting}, {displayName}
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-[-0.04em] text-white sm:text-6xl">
              Your Atlas
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              Your saved queer map across cities, places, and events. This is where
              discovery becomes direction.
            </p>
            {isAtlasLoading && (
              <p className="mt-4 text-xs text-white/55">Refreshing atlas data...</p>
            )}
            {atlasLoadError && (
              <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-rose-300/20 bg-rose-300/8 px-3 py-2 text-xs text-rose-100">
                <span>{atlasLoadError}</span>
                <button
                  type="button"
                  onClick={loadAtlasData}
                  className="rounded-full border border-rose-200/25 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/40"
                >
                  Retry
                </button>
              </div>
            )}
            {syncWarning && (
              <div className="mt-3 inline-flex rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                {syncWarning}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-rose-200/18 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-rose-100">Travel memory</span>
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100">Member signal</span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">Live atlas</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-rose-200/10 bg-rose-200/[0.06] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Saved places</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalPlaces}</p>
            </div>
            <div className="rounded-3xl border border-violet-200/10 bg-violet-200/[0.06] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Saved events</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalEvents}</p>
            </div>
            <div className="rounded-3xl border border-cyan-200/10 bg-cyan-200/[0.05] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Cities</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCities}</p>
            </div>
            <div className="rounded-3xl border border-amber-200/10 bg-amber-200/[0.05] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Top vibe</p>
              <p className="mt-3 text-3xl font-semibold capitalize text-white">
                {String(topVibe).replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[34px] border border-emerald-200/12 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_26%),linear-gradient(180deg,rgba(13,32,28,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">
                Member identity
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Profile signal
              </h2>
            </div>
            <div className="rounded-full border border-emerald-200/16 bg-emerald-200/[0.08] px-4 py-2 text-xs text-emerald-100">
              {contributionCounts.total} contributions
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileForm({
                      displayName: memberProfile?.displayName || authMemberName || memberName,
                      pronouns: memberProfile?.pronouns || "",
                      homeCity: memberProfile?.homeCity || "",
                      residentCountry: memberProfile?.residentCountry || "",
                    });
                    setIsEditingProfile(true);
                  }}
                  className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs text-white/72 transition hover:border-white/20 hover:text-white"
                >
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={!hasProfileChanges}
                    className="rounded-full bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_14px_40px_rgba(45,212,191,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {hasProfileChanges ? "Save profile" : "Saved"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({
                        displayName: memberProfile?.displayName || authMemberName || memberName,
                        pronouns: memberProfile?.pronouns || "",
                        homeCity: memberProfile?.homeCity || "",
                        residentCountry: memberProfile?.residentCountry || "",
                      });
                      setIsEditingProfile(false);
                    }}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs text-white/72 transition hover:border-white/20 hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {isEditingProfile && (
              <div className="grid gap-3 md:grid-cols-4 rounded-2xl border border-emerald-200/16 bg-emerald-200/[0.05] p-4">
              <input
                value={profileForm.displayName}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                }
                placeholder="Display name"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
              <input
                value={profileForm.pronouns}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, pronouns: event.target.value }))
                }
                placeholder="Pronouns"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
              <input
                value={profileForm.homeCity}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, homeCity: event.target.value }))
                }
                placeholder="Home city"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
              <input
                value={profileForm.residentCountry}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, residentCountry: event.target.value }))
                }
                placeholder="Country"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Your footprint</p>
              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Current profile</p>
                <p className="mt-2 text-sm text-white/85">
                  {(memberProfile?.displayName || memberName || "Explorer")}
                  {memberProfile?.pronouns ? ` · ${memberProfile.pronouns}` : ""}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {memberProfile?.homeCity ? `Home city: ${memberProfile.homeCity}` : "Home city not set"}
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {memberProfile?.residentCountry ? `Country: ${memberProfile.residentCountry}` : "Country not set"}
                </p>
                <p className="mt-1 text-[11px] text-white/45">
                  Last saved: {formatSavedTime(memberProfile?.updatedAt)}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Stories</p>
                  <p className="mt-2 text-lg font-semibold text-white">{contributionCounts.stories}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Guides</p>
                  <p className="mt-2 text-lg font-semibold text-white">{contributionCounts.guides}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Ideas</p>
                  <p className="mt-2 text-lg font-semibold text-white">{contributionCounts.ideas}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">Topics</p>
                  <p className="mt-2 text-lg font-semibold text-white">{contributionCounts.topics}</p>
                </div>
              </div>
            </div>
          </form>
        </section>

        <section className="relative mb-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                  Momentum
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Your signal
                </h2>
              </div>
              <button
                onClick={() => router.push("/cities")}
                className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-xs text-white/58 transition hover:border-white/14 hover:text-white/80"
              >
                Explore cities
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(39,17,27,0.72),rgba(12,12,12,0.96))] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-200/70">
                  Added this week
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">{thisWeekAdds}</p>
              </div>
              <div className="rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(14,33,31,0.72),rgba(12,12,12,0.96))] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">
                  Cities touched
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">{allCities.length}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/38">
                Your cities
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {allCities.length > 0 ? (
                  allCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => router.push(`/${city.toLowerCase()}`)}
                      className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-white/14 hover:text-white"
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-white/42">No cities saved yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                  Recent saves
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Continue where you left off
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentSaves.length > 0 ? (
                recentSaves.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() =>
                      router.push(
                        item.type === "place"
                          ? `/${item.city.toLowerCase()}?placeId=${item.id}`
                          : `/${item.city.toLowerCase()}?eventId=${item.id}`
                      )
                    }
                    className="animate-rise-in flex w-full items-center justify-between rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-4 text-left transition hover:-translate-y-[1px] hover:border-white/16"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                        {item.type === "place" ? "Place" : "Event"} · {item.city}
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">{item.name}</p>
                    </div>
                    <span className="text-xs text-white/40">{timeAgo(item.date)}</span>
                  </button>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/42">
                  Start saving places and events to build your atlas.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[34px] border border-cyan-200/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(14,27,31,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">
                Trip planner
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Plan a night or city flow
              </h2>
            </div>
            <button
              onClick={() => setShowPlannerForm((current) => !current)}
              className="rounded-full border border-cyan-200/10 bg-cyan-200/[0.06] px-4 py-2 text-sm text-white/70 transition hover:border-cyan-200/18 hover:text-white"
            >
              {showPlannerForm ? "Close planner" : "New plan"}
            </button>
          </div>

          {showPlannerForm && (
            <form
              onSubmit={createPlan}
              className="mb-6 rounded-[28px] border border-cyan-200/10 bg-white/[0.03] p-5"
            >
              <div className="grid gap-3 md:grid-cols-[1fr_0.45fr]">
                <input
                  value={plannerForm.title}
                  onChange={(event) =>
                    setPlannerForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Plan title"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={activePlannerCity}
                    onChange={(event) =>
                      setPlannerForm((current) => ({
                        ...current,
                        city: event.target.value,
                        placeIds: [],
                        eventIds: [],
                      }))
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                  >
                    {plannerCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <DateInput
                    value={plannerForm.date}
                    onChange={(event) =>
                      setPlannerForm((current) => ({ ...current, date: event.target.value }))
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
                    tone="cyan"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                    Saved places
                  </p>
                  <div className="mt-3 space-y-2">
                    {plannerPlaces.length > 0 ? (
                      plannerPlaces.map((place) => (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => togglePlannerSelection("place", place.id)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            plannerForm.placeIds.includes(place.id)
                              ? "border-cyan-200/18 bg-cyan-200/[0.08] text-white"
                              : "border-white/8 bg-white/[0.03] text-white/62 hover:border-white/14"
                          }`}
                        >
                          <span>{place.name}</span>
                          <span>
                            {plannerForm.placeIds.includes(place.id)
                              ? "Added"
                              : favorites.includes(String(place.id))
                                ? "Saved"
                                : "Add"}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-white/42">No places found in this city yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                    Saved events
                  </p>
                  <div className="mt-3 space-y-2">
                    {plannerEvents.length > 0 ? (
                      plannerEvents.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => togglePlannerSelection("event", item.id)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            plannerForm.eventIds.includes(item.id)
                              ? "border-cyan-200/18 bg-cyan-200/[0.08] text-white"
                              : "border-white/8 bg-white/[0.03] text-white/62 hover:border-white/14"
                          }`}
                        >
                          <span>{item.name}</span>
                          <span>
                            {plannerForm.eventIds.includes(item.id) ? "Added" : formatDate(item.date)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-white/42">No events found in this city yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <textarea
                value={plannerForm.note}
                onChange={(event) =>
                  setPlannerForm((current) => ({ ...current, note: event.target.value }))
                }
                placeholder="Optional note for the plan"
                className="mt-4 h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none"
              />

              <button
                type="submit"
                className="mt-4 rounded-full bg-gradient-to-r from-cyan-200 via-sky-200 to-teal-200 px-5 py-3 text-sm font-semibold text-black shadow-[0_14px_40px_rgba(45,212,191,0.16)]"
              >
                Save plan
              </button>
              {plannerForm.placeIds.length === 0 && plannerForm.eventIds.length === 0 && (
                <p className="mt-3 text-xs text-white/45">Pick at least one saved place or event to create a plan.</p>
              )}
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <article
                  key={plan.id}
                  className="animate-rise-in rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.20)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                        {plan.city}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{plan.title}</h3>
                      {plan.date && (
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-100/70">
                          {formatDate(plan.date)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-white/38">{timeAgo(plan.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => removePlan(plan.id)}
                        className="mt-2 text-[11px] text-rose-100/70 transition hover:text-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                        Places
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">{plan.placeIds.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                        Events
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">{plan.eventIds.length}</p>
                    </div>
                  </div>

                  {Array.isArray(plan.stops) && plan.stops.length > 0 && (
                    <div className="mt-4 space-y-2 rounded-2xl border border-white/8 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/36">Itinerary</p>
                      {plan.stops.slice(0, 4).map((stop) => (
                        <button
                          key={`${stop.type}-${stop.id}`}
                          type="button"
                          onClick={() =>
                            router.push(
                              stop.type === "place"
                                ? `/${stop.city?.toLowerCase()}?placeId=${stop.id}`
                                : `/${stop.city?.toLowerCase()}?eventId=${stop.id}`
                            )
                          }
                          className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-left text-xs text-white/70 transition hover:border-white/14 hover:text-white"
                        >
                          <span className="truncate">{stop.name}</span>
                          <span className="ml-3 uppercase text-[10px] tracking-[0.14em] text-white/40">{stop.type}</span>
                        </button>
                      ))}
                      {plan.stops.length > 4 && (
                        <p className="text-[11px] text-white/42">+{plan.stops.length - 4} more stops</p>
                      )}
                    </div>
                  )}

                  {plan.note && (
                    <p className="mt-4 text-sm leading-6 text-white/46">{plan.note}</p>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/42 md:col-span-2 xl:col-span-3">
                No plans yet. Build your first night or city flow from saved places and events.
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-[34px] border border-rose-200/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_28%),linear-gradient(180deg,rgba(30,16,24,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-rose-200/70">
                Saved places
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Places with gravity
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedPlaces.length > 0 ? (
              savedPlaces.map((place) => (
                <div
                  key={place.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/${place.city?.toLowerCase()}?placeId=${place.id}`)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                      keyEvent.preventDefault();
                      router.push(`/${place.city?.toLowerCase()}?placeId=${place.id}`);
                    }
                  }}
                  className="animate-rise-in cursor-pointer rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 transition duration-300 hover:-translate-y-[2px] hover:border-rose-200/18 hover:shadow-[0_24px_70px_rgba(0,0,0,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/45"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                        {place.city}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{place.name}</h3>
                    </div>
                    <div className="rounded-full border border-rose-200/10 bg-rose-200/[0.06] px-3 py-1 text-xs text-white/60">
                      ★ {place.avgRating?.toFixed(1) || "-"}
                    </div>
                  </div>

                  <p className="mt-3 text-sm capitalize text-rose-100/72">
                    {String(place.vibe || place.type || "signal").replaceAll("_", " ")}
                  </p>

                  {place.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/46">
                      {place.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between text-xs text-white/38">
                    <span>{place.reviewCount || 0} reviews</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFavorite(place.id, place.name);
                      }}
                      className="rounded-full border border-rose-200/14 bg-rose-200/[0.08] px-3 py-1 text-[11px] text-rose-100/90 transition hover:border-rose-200/30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/42 md:col-span-2 xl:col-span-3">
                No saved places yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[34px] border border-violet-200/10 bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,0.12),transparent_28%),linear-gradient(180deg,rgba(26,18,46,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-violet-200/70">
                Saved events
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Time-based queer signal
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedEvents.length > 0 ? (
              savedEvents.map((event) => (
                <div
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}`)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                      keyEvent.preventDefault();
                      router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}`);
                    }
                  }}
                  className="animate-rise-in cursor-pointer rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 transition duration-300 hover:-translate-y-[2px] hover:border-violet-200/18 hover:shadow-[0_24px_70px_rgba(0,0,0,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                        {event.city}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{event.name}</h3>
                    </div>
                    <div className="rounded-full border border-violet-200/10 bg-violet-200/[0.06] px-3 py-1 text-xs text-white/60">
                      {formatDate(event.date)}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-violet-100/72">
                    Community event
                  </p>

                  {event.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/46">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between text-xs text-white/38">
                    <span>{event.link ? "External link available" : "Open on map"}</span>
                    <button
                      type="button"
                      onClick={(itemEvent) => {
                        itemEvent.stopPropagation();
                        removeFavorite(`event-${event.id}`, event.name);
                      }}
                      className="rounded-full border border-violet-200/14 bg-violet-200/[0.08] px-3 py-1 text-[11px] text-violet-100/90 transition hover:border-violet-200/30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/42 md:col-span-2 xl:col-span-3">
                No saved events yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
