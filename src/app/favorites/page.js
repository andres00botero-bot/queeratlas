"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { mergeSeedEvents, mergeSeedPlaces } from "@/lib/seedContent";
import { useAuth } from "@/lib/auth";
import { cityConfig } from "@/lib/cities";
import { getBlockedItems, subscribeBlockedItems, syncBlockedItemsFromCloud } from "@/lib/moderation";
import { getMemberProfile } from "@/lib/memberProfile";
import { getMemberTitleMeta } from "@/lib/communityRanking";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { useActionToast } from "@/lib/useActionToast";
import ActionToast from "@/components/ui/ActionToast";
import PageOpeningState from "@/components/ui/PageOpeningState";
import TripPlannerV2 from "@/components/planner/TripPlannerV2";

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

function isWithinDays(value, days) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = Date.now();
  const diff = date.getTime() - now;
  const windowMs = days * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= windowMs;
}

function formatWeekRange(reference = new Date()) {
  const current = new Date(reference);
  const day = current.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(current);
  start.setDate(current.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${end.toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short" }
  )}`;
}

function stopQuickContext(stop) {
  const explicitReason = String(stop?.reason || "").trim();
  if (explicitReason) return explicitReason;

  const slot = String(stop?.slotLabel || "").trim();
  const kind = String(stop?.type || stop?.itemType || "").trim().toLowerCase();
  const kindLabel = kind ? kind.replaceAll("_", " ") : "spot";

  if (slot) return `${slot} energy in the flow.`;
  return `Selected as a ${kindLabel} stop for this plan arc.`;
}

function normalizeCityKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ");
}

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
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

function FavoritesCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5" aria-hidden="true">
      <div className="h-3 w-24 rounded-full bg-white/14" />
      <div className="mt-3 h-5 w-2/3 rounded-full bg-white/12" />
      <div className="mt-4 h-3 w-full rounded-full bg-white/8" />
      <div className="mt-2 h-3 w-4/5 rounded-full bg-white/8" />
    </div>
  );
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
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
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
  const [memberRank, setMemberRank] = useState(null);
  const [networkMembers, setNetworkMembers] = useState([]);
  const [followingUserIds, setFollowingUserIds] = useState([]);
  const [followingFeedRows, setFollowingFeedRows] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkWarning, setNetworkWarning] = useState("");
  const [recommendationMode, setRecommendationMode] = useState("balanced");

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
    return {
      places: new Set(
        blockedItems
          .filter((item) => item.targetType === "place")
          .map((item) => String(item.targetId))
      ),
      events: new Set(
        blockedItems
          .filter((item) => item.targetType === "event")
          .map((item) => String(item.targetId))
      ),
    };
  }, [blockedItems]);

  useEffect(() => {
    let active = true;

    queueMicrotask(async () => {
      const synced = await syncBlockedItemsFromCloud();
      if (active) {
        setBlockedItems(synced.blockedItems || []);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return subscribeBlockedItems((items) => {
      setBlockedItems(items || []);
    });
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

  useEffect(() => {
    if (!isReady || !isMember || !user?.id) return;
    let active = true;

    queueMicrotask(async () => {
      const { data, error } = await supabase
        .from("qa_member_leaderboard")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;
      if (error || !data) {
        setMemberRank(null);
        return;
      }
      setMemberRank(data);
    });

    return () => {
      active = false;
    };
  }, [isReady, isMember, user?.id]);

  const loadTrustNetwork = useCallback(async () => {
    if (!isMember || !user?.id) return;
    setNetworkLoading(true);
    setNetworkWarning("");

    const [leaderboardRes, followingRes, feedRes] = await Promise.all([
      supabase
        .from("qa_member_leaderboard")
        .select("user_id, display_name, title, rank")
        .order("rank", { ascending: true })
        .limit(80),
      supabase
        .from("member_following")
        .select("followed_user_id")
        .eq("follower_user_id", user.id),
      supabase.rpc("qa_following_feed_favorites", { feed_limit: 40 }),
    ]);

    const missingTable =
      isMissingTableError(followingRes.error) ||
      isMissingTableError(feedRes.error);

    if (missingTable) {
      setNetworkMembers([]);
      setFollowingUserIds([]);
      setFollowingFeedRows([]);
      setNetworkWarning("Friends network not enabled yet. Run the latest Supabase SQL.");
      setNetworkLoading(false);
      return;
    }

    if (leaderboardRes.error || followingRes.error || feedRes.error) {
      setNetworkWarning("Could not sync trusted members right now.");
      setNetworkLoading(false);
      return;
    }

    const memberRows = Array.isArray(leaderboardRes.data) ? leaderboardRes.data : [];
    const followRows = Array.isArray(followingRes.data) ? followingRes.data : [];
    const feedRows = Array.isArray(feedRes.data) ? feedRes.data : [];

    setNetworkMembers(memberRows);
    setFollowingUserIds(
      followRows.map((row) => String(row.followed_user_id)).filter(Boolean)
    );
    setFollowingFeedRows(feedRows);
    setNetworkLoading(false);
  }, [isMember, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember || !user?.id) return;
    queueMicrotask(async () => {
      await loadTrustNetwork();
    });
  }, [isReady, isMember, loadTrustNetwork, user?.id]);

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

  const followingIdSet = useMemo(
    () => new Set((followingUserIds || []).map((id) => String(id))),
    [followingUserIds]
  );

  const suggestedMembers = useMemo(() => {
    const selfId = String(user?.id || "");
    return (networkMembers || [])
      .filter((entry) => {
        const userId = String(entry.user_id || "");
        return userId && userId !== selfId;
      })
      .sort((a, b) => {
        const aRank = Number(a.rank || 9999);
        const bRank = Number(b.rank || 9999);
        const aScore = Number(a.score || 0);
        const bScore = Number(b.score || 0);
        const aCities = Number(a.city_count || 0);
        const bCities = Number(b.city_count || 0);
        const aSignal = aScore * 0.08 + aCities * 2.4 - aRank * 0.6;
        const bSignal = bScore * 0.08 + bCities * 2.4 - bRank * 0.6;
        return bSignal - aSignal;
      })
      .slice(0, 18);
  }, [networkMembers, user?.id]);

  const followingFeedItems = useMemo(() => {
    return (followingFeedRows || [])
      .map((row) => {
        const favoriteId = String(row.favorite_id || "");
        if (!favoriteId) return null;

        const isEvent = favoriteId.startsWith("event-");
        if (isEvent) {
          const eventId = favoriteId.replace("event-", "");
          const event = events.find((entry) => String(entry.id) === String(eventId));
          if (!event) return null;
          return {
            kind: "event",
            favoriteId,
            itemId: String(event.id),
            name: event.name,
            city: event.city,
            date: row.created_at,
            sourceName: row.display_name || "Member",
            sourceTitle: row.title || "",
          };
        }

        const place = places.find((entry) => String(entry.id) === favoriteId);
        if (!place) return null;
        return {
          kind: "place",
          favoriteId,
          itemId: String(place.id),
          name: place.name,
          city: place.city,
          date: row.created_at,
          sourceName: row.display_name || "Member",
          sourceTitle: row.title || "",
        };
      })
      .filter(Boolean);
  }, [events, followingFeedRows, places]);

  const followingProfiles = useMemo(() => {
    if (!Array.isArray(followingUserIds) || followingUserIds.length === 0) return [];

    const latestByOwner = new Map();
    (followingFeedRows || []).forEach((row) => {
      const ownerId = String(row.owner_user_id || "");
      if (!ownerId) return;
      const current = latestByOwner.get(ownerId);
      const currentTime = current ? new Date(current.created_at || 0).getTime() : 0;
      const nextTime = new Date(row.created_at || 0).getTime();
      if (!current || nextTime > currentTime) {
        latestByOwner.set(ownerId, row);
      }
    });

    return followingUserIds
      .map((id) => {
        const key = String(id);
        const member = (networkMembers || []).find((entry) => String(entry.user_id || "") === key);
        const latest = latestByOwner.get(key);
        return {
          userId: key,
          displayName: member?.display_name || "Member",
          title: member?.title || "",
          rank: member?.rank || null,
          score: member?.score || 0,
          cityCount: member?.city_count || 0,
          latestItemName: latest?.item_name || latest?.favorite_id || "",
          latestItemCity: latest?.item_city || "",
          latestAt: latest?.created_at || "",
        };
      })
      .sort((a, b) => new Date(b.latestAt || 0) - new Date(a.latestAt || 0));
  }, [followingFeedRows, followingUserIds, networkMembers]);

  const forYouRecommendations = useMemo(() => {
    const modeWeights =
      recommendationMode === "safe"
        ? { trustedCity: 3, savedCity: 4, vibe: 2, reviews: 0.25, rating: 0.5, typeSafe: 2.5, typePeak: 0.5, eventSoon: 0.04 }
        : recommendationMode === "peak"
          ? { trustedCity: 5, savedCity: 3, vibe: 3, reviews: 0.1, rating: 0.25, typeSafe: 0.6, typePeak: 2.8, eventSoon: 0.14 }
          : { trustedCity: 4, savedCity: 5, vibe: 3, reviews: 0.15, rating: 0.35, typeSafe: 1.2, typePeak: 1.4, eventSoon: 0.08 };

    const savedCityCounts = new Map();
    const trustedCityCounts = new Map();
    const savedVibeCounts = new Map();

    savedPlaces.forEach((place) => {
      const cityKey = normalizeCityKey(place.city);
      if (cityKey) {
        savedCityCounts.set(cityKey, (savedCityCounts.get(cityKey) || 0) + 1);
      }

      const vibeKey = String(place.vibe || place.type || "").trim().toLowerCase();
      if (vibeKey) {
        savedVibeCounts.set(vibeKey, (savedVibeCounts.get(vibeKey) || 0) + 1);
      }
    });

    followingFeedItems.forEach((item) => {
      const cityKey = normalizeCityKey(item.city);
      if (!cityKey) return;
      trustedCityCounts.set(cityKey, (trustedCityCounts.get(cityKey) || 0) + 1);
    });

    const topSavedCity = [...savedCityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    const topTrustedCity = [...trustedCityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    const topVibeKey = [...savedVibeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    const recommendedPlaces = places
      .filter((place) => !favorites.includes(String(place.id)) && !blocked.places.has(String(place.id)))
      .map((place) => {
        const cityKey = normalizeCityKey(place.city);
        const placeVibe = String(place.vibe || place.type || "").trim().toLowerCase();
        const placeType = String(place.type || "").trim().toLowerCase();
        let score = 0;
        if (cityKey && cityKey === topSavedCity) score += modeWeights.savedCity;
        if (cityKey && cityKey === topTrustedCity) score += modeWeights.trustedCity;
        if (topVibeKey && placeVibe && placeVibe === topVibeKey) score += modeWeights.vibe;
        score += Math.min(Number(place.reviewCount || 0), 20) * modeWeights.reviews;
        score += Number(place.avgRating || 0) * modeWeights.rating;
        if (["cafe", "bar", "hotel"].includes(placeType)) score += modeWeights.typeSafe;
        if (["club", "sauna", "cruise_club"].includes(placeType)) score += modeWeights.typePeak;

        return {
          kind: "place",
          id: String(place.id),
          city: place.city || "",
          name: place.name || "Place",
          subtitle: String(place.vibe || place.type || "Venue").replaceAll("_", " "),
          score,
          reasonBase:
            cityKey && cityKey === topSavedCity
              ? "Matches your strongest saved city signal."
              : cityKey && cityKey === topTrustedCity
                ? "Trending inside your trusted network."
                : topVibeKey && placeVibe === topVibeKey
                  ? "Aligned with your saved vibe pattern."
                  : "Strong quality signal from reviews.",
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const recommendedEvents = events
      .filter((event) => !favorites.includes(`event-${event.id}`) && !blocked.events.has(String(event.id)))
      .map((event) => {
        const cityKey = normalizeCityKey(event.city);
        const eventDate = new Date(event.date || "");
        const now = new Date();
        const daysUntil = Number.isNaN(eventDate.getTime())
          ? 120
          : Math.max(0, Math.round((eventDate.getTime() - now.getTime()) / 86400000));

        let score = 0;
        if (cityKey && cityKey === topSavedCity) score += modeWeights.savedCity - 1;
        if (cityKey && cityKey === topTrustedCity) score += modeWeights.trustedCity;
        score += Math.max(0, 40 - daysUntil) * modeWeights.eventSoon;

        return {
          kind: "event",
          id: String(event.id),
          city: event.city || "",
          name: event.name || "Event",
          subtitle: formatDate(event.date),
          score,
          reasonBase:
            cityKey && cityKey === topSavedCity
              ? "Upcoming in your saved city pattern."
              : cityKey && cityKey === topTrustedCity
                ? "Upcoming where your trusted members are active."
                : "Strong timing for your next plan window.",
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    return [...recommendedPlaces, ...recommendedEvents]
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        reason:
          recommendationMode === "safe"
            ? `${item.reasonBase} Prioritizing safer, lower-friction flow.`
            : recommendationMode === "peak"
              ? `${item.reasonBase} Prioritizing peak energy and late momentum.`
              : `${item.reasonBase} Balanced between comfort and intensity.`,
      }));
  }, [blocked.events, blocked.places, events, favorites, followingFeedItems, places, recommendationMode, savedPlaces]);

  const weeklyDigest = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const followingThisWeek = followingFeedItems.filter((item) => {
      const value = new Date(item.date || "").getTime();
      return Number.isFinite(value) && value >= weekAgo;
    });

    const upcomingInSavedCities = events
      .filter((event) => {
        const cityKey = normalizeCityKey(event.city);
        return (
          allCities.some((city) => normalizeCityKey(city) === cityKey) &&
          isWithinDays(event.date, 10)
        );
      })
      .slice(0, 3);

    const newCityTarget = Math.max(0, 5 - totalCities);
    const topFollowingCity =
      [...new Set(followingThisWeek.map((item) => item.city).filter(Boolean))][0] || "";

    return {
      weekLabel: formatWeekRange(new Date()),
      followingThisWeekCount: followingThisWeek.length,
      topFollowingCity,
      upcomingInSavedCities,
      newCityTarget,
    };
  }, [allCities, events, followingFeedItems, totalCities]);

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
  const memberTitleMeta = getMemberTitleMeta(memberRank?.title || "");
  const plannerCities = useMemo(() => {
    const configCities = Object.values(cityConfig)
      .map((item) => item.title?.replace("Queer ", ""))
      .filter(Boolean);
    const dataCities = [...new Set(places.concat(events).map((item) => item.city).filter(Boolean))];
    return [...new Set([...configCities, ...dataCities])].sort((a, b) => a.localeCompare(b));
  }, [events, places]);

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

  const addFavoriteFromNetwork = async (favoriteId, label = "Item") => {
    const normalized = String(favoriteId || "");
    if (!normalized) return;
    if (favorites.includes(normalized)) {
      showToast(`${label} is already in your atlas.`, { tone: "info", duration: 2000 });
      return;
    }

    const updated = [...favorites, normalized];
    setFavorites(updated);
    writeLocalJson(FAVORITES_STORAGE_KEY, updated);

    const nextAdded = [
      {
        id: normalized,
        date: new Date().toISOString(),
      },
      ...added,
    ];
    setAdded(nextAdded);
    writeLocalJson(ADDED_STORAGE_KEY, nextAdded);

    if (user?.id) {
      const { error } = await supabase
        .from("member_favorites")
        .insert([
          {
            user_id: user.id,
            favorite_id: normalized,
          },
        ]);

      if (error) {
        setSyncWarning("Saved locally. Cloud sync unavailable.");
      }
    }

    showToast(`${label} saved to your atlas.`, { tone: "ok", duration: 2200 });
  };

  const toggleFollowMember = async (targetUserId) => {
    const normalizedTarget = String(targetUserId || "");
    if (!user?.id || !normalizedTarget || normalizedTarget === String(user.id)) return;

    const isFollowing = followingIdSet.has(normalizedTarget);

    if (isFollowing) {
      const { error } = await supabase
        .from("member_following")
        .delete()
        .eq("follower_user_id", user.id)
        .eq("followed_user_id", normalizedTarget);

      if (error) {
        setNetworkWarning("Could not update follow state right now.");
        return;
      }

      setFollowingUserIds((current) => current.filter((id) => String(id) !== normalizedTarget));
      setFollowingFeedRows((current) =>
        current.filter((row) => String(row.owner_user_id || "") !== normalizedTarget)
      );
      showToast("Member removed from trusted signal.", { tone: "info", duration: 2100 });
      return;
    }

    const { error } = await supabase
      .from("member_following")
      .insert([
        {
          follower_user_id: user.id,
          followed_user_id: normalizedTarget,
        },
      ]);

    if (error) {
      setNetworkWarning("Could not follow member right now.");
      return;
    }

    setFollowingUserIds((current) => [...new Set([...current, normalizedTarget])]);
    showToast("Member added to your trusted signal.", { tone: "ok", duration: 2100 });
    await loadTrustNetwork();
  };

  const removePlan = async (planId) => {
    setPlans((current) => current.filter((entry) => String(entry.id) !== String(planId)));
    setExpandedPlanId((current) => (String(current) === String(planId) ? null : current));

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

  const openPlannerStopOnMap = (stop) => {
    if (!stop?.city || !stop?.id) return;
    const citySlug = String(stop.city).toLowerCase();
    if (stop.itemType === "event") {
      router.push(`/${citySlug}?eventId=${stop.id}`);
      return;
    }
    router.push(`/${citySlug}?placeId=${stop.id}`);
  };

  const saveV2Plan = async (payload) => {
    const cityName = String(payload?.city || "").trim();
    const itineraryDays = Array.isArray(payload?.itinerary) ? payload.itinerary : [];
    if (!cityName || itineraryDays.length === 0) return false;

    const flatStops = itineraryDays
      .flatMap((day) =>
        (day?.stops || []).map((stop) => ({
          type: stop.itemType === "event" ? "event" : "place",
          id: stop.id,
          name: stop.name,
          city: stop.city || cityName,
          time: stop.time || null,
          slotLabel: stop.slotLabel || null,
          dayLabel: day.dayLabel || null,
          reason: stop.reason || null,
          trustScore: Number.isFinite(Number(stop.trustScore)) ? Number(stop.trustScore) : null,
          trustReason: String(stop.trustReason || "").trim() || null,
        }))
      )
      .filter((stop) => stop?.id);

    if (flatStops.length === 0) {
      showToast("No stops to save yet. Build itinerary first.", { tone: "warn", duration: 2200 });
      return false;
    }

    const uniquePlaceIds = [...new Set(flatStops.filter((s) => s.type === "place").map((s) => String(s.id)))];
    const uniqueEventIds = [...new Set(flatStops.filter((s) => s.type === "event").map((s) => String(s.id)))];

    const title = `${cityName} · ${String(payload?.horizon || "trip").replaceAll("_", " ")} · ${String(payload?.vibe || "mixed")}`;
    const note = `V2 plan · budget: ${payload?.budget || "balanced"} · energy: ${payload?.energy || 70} · solo-safe: ${payload?.soloSafe ? "on" : "off"}`;

    const draftPlan = {
      id: `plan-v2-${Date.now()}`,
      title: String(payload?.planTitle || "").trim() || title,
      city: cityName,
      date: String(payload?.planDate || "").trim() || null,
      placeIds: uniquePlaceIds,
      eventIds: uniqueEventIds,
      stops: flatStops,
      note: String(payload?.note || "").trim() || note,
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
        setSyncWarning("Plan saved locally. Cloud sync unavailable.");
      } else {
        savedPlan = mapPlanRow(data);
      }
    }

    setPlans((current) => [savedPlan, ...current]);
    setExpandedPlanId(savedPlan.id);
    showToast("Plan saved.", { tone: "ok", duration: 2200 });
    return true;
  };

  if (!isReady || !isMember) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <PageOpeningState
          title="Opening your atlas..."
          subtitle="Loading favorites, plans, and member profile signal."
          tone="amber"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#120b1d_0%,#050505_38%,#040404_100%)] px-6 py-8 text-white">
      <ActionToast toast={toast} />
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(45,212,191,0.14),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%)]" />

        <section className="relative mb-8 overflow-hidden rounded-[38px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.20),transparent_28%),linear-gradient(135deg,rgba(36,20,44,0.96),rgba(10,10,10,0.99),rgba(14,28,26,0.98))] p-8 shadow-[0_40px_140px_rgba(0,0,0,0.48)]">
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
              <div className="mt-4 max-w-sm animate-pulse" aria-hidden="true">
                <div className="h-3 w-40 rounded-full bg-white/12" />
              </div>
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
            <div className="rounded-3xl border border-rose-200/18 bg-[linear-gradient(180deg,rgba(251,113,133,0.18),rgba(251,113,133,0.06))] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Saved places</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalPlaces}</p>
            </div>
            <div className="rounded-3xl border border-violet-200/18 bg-[linear-gradient(180deg,rgba(167,139,250,0.18),rgba(167,139,250,0.06))] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Saved events</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalEvents}</p>
            </div>
            <div className="rounded-3xl border border-cyan-200/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(34,211,238,0.06))] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Cities</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCities}</p>
            </div>
            <div className="rounded-3xl border border-amber-200/18 bg-[linear-gradient(180deg,rgba(251,191,36,0.16),rgba(251,191,36,0.06))] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Top vibe</p>
              <p className="mt-3 text-3xl font-semibold capitalize text-white">
                {String(topVibe).replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </section>

        <section className="hidden mb-8 rounded-[34px] border border-emerald-200/12 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_26%),linear-gradient(180deg,rgba(13,32,28,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
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
                {memberRank?.title && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-2.5 py-1">
                    <span className="text-[10px] text-white/65">#{memberRank.rank}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${memberTitleMeta.className}`}>
                      <span>{memberTitleMeta.icon}</span>
                      {memberTitleMeta.label}
                    </span>
                  </div>
                )}
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
          <div className="rounded-[34px] border border-fuchsia-200/14 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_28%),linear-gradient(180deg,rgba(26,14,24,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.36)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                  Momentum
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Your signal
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Snapshot of your current momentum, rank, and city footprint.
                </p>
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

            <div className="mt-4 rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,20,38,0.72),rgba(12,12,12,0.96))] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/75">
                Your community ranking just now
              </p>
              {memberRank?.title ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/75">
                    #{memberRank.rank}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] ${memberTitleMeta.className}`}>
                    <span>{memberTitleMeta.icon}</span>
                    {memberTitleMeta.label}
                  </span>
                  <span className="text-xs text-white/55">{memberRank.score} pts</span>
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/62">
                  No rank yet. Add places, events, or reviews to activate your badge.
                </p>
              )}
            </div>

            <div className="mt-5 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
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

          <div className="rounded-[34px] border border-sky-200/14 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(14,20,30,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.36)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-white/38">
                  Recent saves
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Continue where you left off
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Jump straight back into your latest saved venues and events.
                </p>
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
                    className="animate-rise-in flex w-full items-center justify-between rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-5 py-4 text-left transition hover:-translate-y-[1px] hover:border-white/20"
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

        <section className="mb-8 rounded-[34px] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(244,114,182,0.10),transparent_26%),linear-gradient(180deg,rgba(10,28,38,0.95),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/75">
                Retention loop
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Weekly digest
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Fresh signal from your network, your cities, and your next move.
              </p>
            </div>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100/85">
              Week {weeklyDigest.weekLabel}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.02))] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">Your network discovered</p>
              <p className="mt-2 text-3xl font-semibold text-white">{weeklyDigest.followingThisWeekCount}</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                saves in the last 7 days
                {weeklyDigest.topFollowingCity ? `, strongest in ${weeklyDigest.topFollowingCity}` : "."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/favorites")}
                className="mt-3 rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
              >
                Open trusted feed
              </button>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(167,139,250,0.14),rgba(255,255,255,0.02))] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-100/75">Upcoming in your cities</p>
              {weeklyDigest.upcomingInSavedCities.length > 0 ? (
                <>
                  <p className="mt-2 text-3xl font-semibold text-white">{weeklyDigest.upcomingInSavedCities.length}</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    events in the next 10 days ready for your plan window.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/events")}
                    className="mt-3 rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-violet-100 transition hover:border-violet-200/40"
                  >
                    Open events
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-lg font-semibold text-white">Quiet week ahead</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    Add new city signal or check world news for off-grid momentum.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/now")}
                    className="mt-3 rounded-full border border-violet-200/24 bg-violet-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-violet-100 transition hover:border-violet-200/40"
                  >
                    Open queer world news
                  </button>
                </>
              )}
            </article>

            <article className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(244,114,182,0.14),rgba(255,255,255,0.02))] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-rose-100/75">Next growth move</p>
              <p className="mt-2 text-3xl font-semibold text-white">{weeklyDigest.newCityTarget}</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                {weeklyDigest.newCityTarget > 0
                  ? `more city signal to reach your 5-city atlas baseline.`
                  : "city baseline complete. Time to deepen quality and reviews."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/cities")}
                className="mt-3 rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/40"
              >
                Explore cities
              </button>
            </article>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[0.74fr_1.26fr]">
          <div className="rounded-[34px] border border-emerald-200/16 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),linear-gradient(180deg,rgba(11,38,31,0.95),rgba(10,10,10,0.99))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.36)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/72">
                  Profile signal
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
                  Your footprint
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Keep your profile signal clean so your atlas recommendations stay relevant.
                </p>
              </div>
              <div className="rounded-full border border-emerald-200/16 bg-emerald-200/[0.08] px-3 py-1.5 text-[11px] text-emerald-100">
                {contributionCounts.total} contributions
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/18 bg-emerald-200/10 px-3 py-1">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-100/80">Member</span>
                  <span className="text-xs font-medium text-white">
                    {(memberProfile?.displayName || memberName || "Explorer")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                    className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] text-white/72 transition hover:border-white/20 hover:text-white"
                  >
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={!hasProfileChanges}
                      className="rounded-full bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 px-4 py-2 text-xs font-semibold text-black shadow-[0_14px_40px_rgba(45,212,191,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
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
                      className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] text-white/72 transition hover:border-white/20 hover:text-white"
                    >
                      Cancel
                    </button>
                  </>
                )}
                </div>
              </div>

              {isEditingProfile && (
                <div className="grid gap-2 rounded-2xl border border-emerald-200/16 bg-emerald-200/[0.05] p-3 sm:grid-cols-2">
                  <input
                    value={profileForm.displayName}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                    }
                    placeholder="Display name"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={profileForm.pronouns}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, pronouns: event.target.value }))
                    }
                    placeholder="Pronouns"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={profileForm.homeCity}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, homeCity: event.target.value }))
                    }
                    placeholder="Home city"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={profileForm.residentCountry}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, residentCountry: event.target.value }))
                    }
                    placeholder="Country"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
              )}

              <div className="rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4">
                <p className="text-sm text-white/85">
                  {(memberProfile?.displayName || memberName || "Explorer")}
                  {memberProfile?.pronouns ? ` · ${memberProfile.pronouns}` : ""}
                </p>
                {memberRank?.title && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-2.5 py-1">
                    <span className="text-[10px] text-white/65">#{memberRank.rank}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${memberTitleMeta.className}`}>
                      <span>{memberTitleMeta.icon}</span>
                      {memberTitleMeta.label}
                    </span>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/62">
                    {memberProfile?.homeCity ? `Home: ${memberProfile.homeCity}` : "Home city not set"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/62">
                    {memberProfile?.residentCountry ? `Country: ${memberProfile.residentCountry}` : "Country not set"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[11px] text-white/62">
                    Last saved: {formatSavedTime(memberProfile?.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-rose-200/18 bg-rose-200/8 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-rose-100/72">Stories</p>
                  <p className="mt-1 text-base font-semibold text-white">{contributionCounts.stories}</p>
                </div>
                <div className="rounded-xl border border-violet-200/18 bg-violet-200/8 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-violet-100/72">Guides</p>
                  <p className="mt-1 text-base font-semibold text-white">{contributionCounts.guides}</p>
                </div>
                <div className="rounded-xl border border-amber-200/18 bg-amber-200/8 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-amber-100/72">Ideas</p>
                  <p className="mt-1 text-base font-semibold text-white">{contributionCounts.ideas}</p>
                </div>
                <div className="rounded-xl border border-cyan-200/18 bg-cyan-200/8 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.13em] text-cyan-100/72">Topics</p>
                  <p className="mt-1 text-base font-semibold text-white">{contributionCounts.topics}</p>
                </div>
              </div>
            </form>
          </div>

          <div className="rounded-[34px] border border-cyan-200/16 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(180deg,rgba(11,31,36,0.95),rgba(10,10,10,0.99))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.36)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">
                  Trip planner
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                  Plan a night or city flow
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Build and save itinerary flows based on your vibe, timing, and city context.
                </p>
              </div>
            </div>

          <TripPlannerV2
            plannerCities={plannerCities}
            places={places}
            events={events}
            trustedFavoriteIds={(followingFeedRows || [])
              .map((row) => String(row.favorite_id || ""))
              .filter(Boolean)}
            trustedFavoriteStats={(followingFeedRows || []).reduce((acc, row) => {
              const favoriteId = String(row.favorite_id || "");
              if (!favoriteId) return acc;
              acc[favoriteId] = (acc[favoriteId] || 0) + 1;
              return acc;
            }, {})}
            onOpenStop={openPlannerStopOnMap}
            onSavePlan={saveV2Plan}
          />

          <div className="space-y-3">
            {isAtlasLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <FavoritesCardSkeleton key={`plan-skeleton-${index}`} />
              ))
            ) : plans.length > 0 ? (
              plans.map((plan, index) => (
                <article
                  key={plan.id}
                  className="animate-rise-in rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.20)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/[0.10] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-fuchsia-100/90">
                          #{index + 1}
                        </span>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/42">{plan.city || "City plan"}</p>
                        <span className="rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/55">
                          {timeAgo(plan.createdAt)}
                        </span>
                        {plan.date && (
                          <span className="rounded-full border border-cyan-200/16 bg-cyan-200/[0.08] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100/75">
                            {formatDate(plan.date)}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 truncate text-lg font-semibold text-white">{plan.title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/12 bg-black/25 px-2.5 py-1 text-[11px] text-white/62">
                          {plan.placeIds.length} places
                        </span>
                        <span className="rounded-full border border-white/12 bg-black/25 px-2.5 py-1 text-[11px] text-white/62">
                          {plan.eventIds.length} events
                        </span>
                        <span className="rounded-full border border-white/12 bg-black/25 px-2.5 py-1 text-[11px] text-white/62">
                          {Array.isArray(plan.stops) ? plan.stops.length : 0} stops
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start lg:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPlanId((current) =>
                            String(current) === String(plan.id) ? null : plan.id
                          )
                        }
                        className="rounded-full border border-cyan-200/16 bg-cyan-200/[0.08] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-cyan-100/85 transition hover:border-cyan-200/30"
                      >
                        {String(expandedPlanId) === String(plan.id) ? "Collapse" : "Expand"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlan(plan.id)}
                        className="rounded-full border border-rose-200/16 bg-rose-200/[0.08] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-rose-100/85 transition hover:border-rose-200/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {String(expandedPlanId) === String(plan.id) && Array.isArray(plan.stops) && plan.stops.length > 0 && (
                    <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/25 p-3">
                      {Object.entries(
                        plan.stops.reduce((acc, stop) => {
                          const label = stop.dayLabel || "Itinerary";
                          if (!acc[label]) acc[label] = [];
                          acc[label].push(stop);
                          return acc;
                        }, {})
                      ).map(([day, stops]) => (
                        <div key={day} className="space-y-2">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/44">{day}</p>
                          {stops.map((stop, stopIndex) => (
                            <button
                              key={`${stop.type}-${stop.id}-${stopIndex}`}
                              type="button"
                              onClick={() =>
                                router.push(
                                  stop.type === "place"
                                    ? `/${stop.city?.toLowerCase()}?placeId=${stop.id}`
                                    : `/${stop.city?.toLowerCase()}?eventId=${stop.id}`
                                )
                              }
                              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-xs text-white/75 transition hover:border-white/18 hover:text-white"
                            >
                              <span className="min-w-0">
                                <span className="block truncate">
                                  {stop.time ? `${stop.time} - ` : ""}
                                  {stop.name}
                                </span>
                                <span className="mt-1 block truncate text-[10px] text-white/48">
                                  {stopQuickContext(stop)}
                                </span>
                                {typeof stop.trustScore === "number" && (
                                  <span className="mt-1 block truncate text-[10px] text-cyan-100/72">
                                    Trust {stop.trustScore}
                                    {stop.trustReason ? ` · ${stop.trustReason}` : ""}
                                  </span>
                                )}
                              </span>
                              <span className="ml-3 uppercase text-[10px] tracking-[0.14em] text-white/44">
                                {stop.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      ))}
                      {plan.note && (
                        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/60">
                          {plan.note}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/42">
                No plans yet. Build your first night or city flow from saved places and events.
              </div>
            )}
          </div>
          </div>
        </section>

        <section className="mb-8 rounded-[34px] border border-emerald-200/14 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,rgba(13,26,24,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">
                People signal
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Trusted members network
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Follow trusted members and pull signal from what they save.
              </p>
            </div>
            <button
              type="button"
              onClick={loadTrustNetwork}
              className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-200/40"
            >
              Refresh
            </button>
          </div>

          {networkWarning && (
            <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs text-amber-100/90">
              {networkWarning}
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Following now</p>
              <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {followingProfiles.length > 0 ? (
                  followingProfiles.map((profile) => {
                    const titleMeta = getMemberTitleMeta(profile.title || "");
                    return (
                      <article
                        key={`following-profile-${profile.userId}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {profile.displayName}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {profile.title ? (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${titleMeta.className}`}>
                                  <span>{titleMeta.icon}</span>
                                  {titleMeta.label}
                                </span>
                              ) : null}
                              {profile.rank ? (
                                <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/65">
                                  #{profile.rank}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-xs text-white/60">
                              {profile.cityCount || 0} cities · {profile.score || 0} pts
                            </p>
                            {profile.latestItemName ? (
                              <p className="mt-1 truncate text-[11px] text-cyan-100/72">
                                Latest: {profile.latestItemName}
                                {profile.latestItemCity ? ` · ${profile.latestItemCity}` : ""}
                              </p>
                            ) : (
                              <p className="mt-1 text-[11px] text-white/45">No recent shared save yet.</p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-sm text-white/45">
                    Follow members to build your trusted inner circle.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Members to follow</p>
              <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {networkLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <FavoritesCardSkeleton key={`member-skeleton-${index}`} />
                  ))
                ) : suggestedMembers.length > 0 ? (
                  suggestedMembers.map((member) => {
                    const memberId = String(member.user_id || "");
                    const isFollowing = followingIdSet.has(memberId);
                    const titleMeta = getMemberTitleMeta(member.title || "");
                    return (
                      <div
                        key={`member-suggest-${memberId}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {member.display_name || "Member"}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {member.title && (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${titleMeta.className}`}>
                                  <span>{titleMeta.icon}</span>
                                  {titleMeta.label}
                                </span>
                              )}
                              {member.rank && (
                                <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/65">
                                  #{member.rank}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleFollowMember(memberId)}
                            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                              isFollowing
                                ? "border-fuchsia-200/30 bg-fuchsia-200/12 text-fuchsia-100"
                                : "border-emerald-200/25 bg-emerald-200/10 text-emerald-100 hover:border-emerald-200/40"
                            }`}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-sm text-white/45">
                    No member signal yet. As community grows, top contributors appear here.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Saved by people you follow</p>
              <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {followingFeedItems.length > 0 ? (
                  followingFeedItems.map((item, index) => (
                    <div
                      key={`following-feed-${item.favoriteId}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/55">
                            {item.city || "City"} · {item.kind}
                          </p>
                          <p className="mt-1 text-xs text-white/60">
                            Saved by {item.sourceName}
                            {item.sourceTitle ? ` · ${item.sourceTitle}` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addFavoriteFromNetwork(item.favoriteId, item.name)}
                          className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-6 text-sm text-white/45">
                    Follow members to unlock trusted favorites feed.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[34px] border border-rose-200/10 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_28%),linear-gradient(180deg,rgba(30,16,24,0.94),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">
                For you
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Next best signal
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Personalized picks from your saved vibe, city history, and trusted network.
              </p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRecommendationMode("safe")}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition ${
                recommendationMode === "safe"
                  ? "border-emerald-200/40 bg-emerald-200/16 text-emerald-100"
                  : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
              }`}
            >
              Safe mode
            </button>
            <button
              type="button"
              onClick={() => setRecommendationMode("balanced")}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition ${
                recommendationMode === "balanced"
                  ? "border-cyan-200/40 bg-cyan-200/16 text-cyan-100"
                  : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
              }`}
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => setRecommendationMode("peak")}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] transition ${
                recommendationMode === "peak"
                  ? "border-fuchsia-200/40 bg-fuchsia-200/16 text-fuchsia-100"
                  : "border-white/12 bg-white/6 text-white/65 hover:border-white/24"
              }`}
            >
              Peak mode
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {forYouRecommendations.length > 0 ? (
              forYouRecommendations.map((item) => (
                <article
                  key={`for-you-${item.kind}-${item.id}`}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/46">
                    {item.city || "City"} · {item.kind}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
                  <p className="mt-1 text-xs text-cyan-100/75">{item.subtitle}</p>
                  <p className="mt-3 min-h-[36px] text-xs leading-5 text-white/60">
                    {item.reason}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          item.kind === "event"
                            ? `/${String(item.city || "").toLowerCase()}?eventId=${item.id}`
                            : `/${String(item.city || "").toLowerCase()}?placeId=${item.id}`
                        )
                      }
                      className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/85 transition hover:border-white/30"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addFavoriteFromNetwork(
                          item.kind === "event" ? `event-${item.id}` : item.id,
                          item.name
                        )
                      }
                      className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
                    >
                      Save
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-white/42 md:col-span-2 xl:col-span-3">
                Save more places and follow members to unlock stronger personal recommendations.
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
              <p className="mt-2 text-sm leading-6 text-white/56">
                Your core saved venues, ready to open fast when you plan your next move.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isAtlasLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <FavoritesCardSkeleton key={`place-skeleton-${index}`} />
              ))
            ) : savedPlaces.length > 0 ? (
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
              <p className="mt-2 text-sm leading-6 text-white/56">
                Upcoming moments you saved, organized for timing and quick navigation.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isAtlasLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <FavoritesCardSkeleton key={`event-skeleton-${index}`} />
              ))
            ) : savedEvents.length > 0 ? (
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
