"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync, mergeSeedPlacesAsync } from "@/lib/seedMerge";
import { useAuth } from "@/lib/auth";
import { cityConfig } from "@/lib/cities";
import { subscribeBlockedItems, syncBlockedItemsFromCloud } from "@/lib/moderation";
import { getMemberProfile } from "@/lib/memberProfile";
import { getMemberTitleMeta } from "@/lib/communityRanking";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { readRuntimeCache, writeRuntimeCache } from "@/lib/runtimeCache";
import { trackKpiEvent } from "@/lib/analytics";
import { useActionToast } from "@/lib/useActionToast";
import { showActionFeedback } from "@/lib/actionFeedback";
import { LIVE_VIBE_OPTIONS, isMissingTableError as isMissingLiveVibeTableError } from "@/lib/liveVibe";
import {
  formatCheckinTime,
  formatCityLabel,
  formatDate,
  formatSavedTime,
  formatWeekRange,
  geocodeCheckinFromCityAndLabel,
  isPresenceActiveNow,
  isWithinDays,
  mapCheckinRow,
  mapPlanRow,
  normalizeCityKey,
  normalizeLooseText,
  isMissingTableError,
  stopQuickContext,
  timeAgo,
} from "@/features/favorites/favoritesPageUtils";
import {
  ADDED_STORAGE_KEY,
  CHECKINS_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
  PLAN_STORAGE_KEY,
} from "@/features/favorites/favoritesStateDefaults";
import ActionToast from "@/components/ui/ActionToast";
import PageOpeningState from "@/components/ui/PageOpeningState";
import FavoritesCardSkeleton from "@/components/favorites/FavoritesCardSkeleton";
import { useFavoritesStateController } from "@/features/favorites/useFavoritesStateController";

const TripPlannerV2 = dynamic(() => import("@/components/planner/TripPlannerV2"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
      Loading planner...
    </div>
  ),
});
const SavedEventsPanel = dynamic(() => import("@/components/favorites/SavedEventsPanel"));
const SavedPlacesPanel = dynamic(() => import("@/components/favorites/SavedPlacesPanel"));

const CHECKIN_VIBE_COOLDOWN_MS = 30 * 1000;
const MY_CHECKIN_PREVIEW_COUNT = 3;
const FRIEND_CHECKIN_PREVIEW_COUNT = 3;
const FAVORITES_ATLAS_CACHE_KEY = "qa_favorites_atlas_v1";
const FAVORITES_ATLAS_CACHE_TTL_MS = 2 * 60 * 1000;
const FAVORITES_ATLAS_PLACE_FETCH_LIMIT = 1500;
const FAVORITES_ATLAS_EVENT_FETCH_LIMIT = 1500;

function dedupeById(items = []) {
  const seen = new Set();
  const result = [];
  for (const item of Array.isArray(items) ? items : []) {
    const key = String(item?.id || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export default function FavoritesPage() {
  const router = useRouter();
  const {
    isReady, setIsReady,
    memberName, setMemberName,
    isEditingProfile, setIsEditingProfile,
    profileForm, setProfileForm,
    favorites, setFavorites,
    added, setAdded,
    places, setPlaces,
    events, setEvents,
    isAtlasLoading, setIsAtlasLoading,
    atlasLoadError, setAtlasLoadError,
    plans, setPlans,
    expandedPlanId, setExpandedPlanId,
    blockedItems, setBlockedItems,
    syncWarning, setSyncWarning,
    memberRank, setMemberRank,
    networkMembers, setNetworkMembers,
    followingUserIds, setFollowingUserIds,
    followingFeedRows, setFollowingFeedRows,
    networkLoading, setNetworkLoading,
    networkWarning, setNetworkWarning,
    recommendationMode, setRecommendationMode,
    showSignalDeck, setShowSignalDeck,
    nowTs, setNowTs,
    checkins, setCheckins,
    checkinsWarning, setCheckinsWarning,
    isSavingCheckin, setIsSavingCheckin,
    pendingCheckinVibe, setPendingCheckinVibe,
    isSubmittingCheckinVibe, setIsSubmittingCheckinVibe,
    checkinVibeCooldownUntil, setCheckinVibeCooldownUntil,
    followingCheckins, setFollowingCheckins,
    followingCheckinsWarning, setFollowingCheckinsWarning,
    followingPresenceByUserId, setFollowingPresenceByUserId,
    checkinMapLoadFailed, setCheckinMapLoadFailed,
    checkinStaticFallbackFailed, setCheckinStaticFallbackFailed,
    editingCheckinId, setEditingCheckinId,
    selectedCheckinId, setSelectedCheckinId,
    checkinViewFilter, setCheckinViewFilter,
    checkinMapContainerRef,
    checkinMapCardRef,
    checkinFormRef,
    checkinMapRef,
    checkinMapMarkersRef,
    checkinForm, setCheckinForm,
  } = useFavoritesStateController();
  const {
    isMember,
    isLoading: isAuthLoading,
    user,
    memberName: authMemberName,
    memberProfile,
    updateMemberProfile,
  } = useAuth();
  const { toast, showToast } = useActionToast();
  const mapboxLibRef = useRef(null);
  const [checkinSidebarHeight, setCheckinSidebarHeight] = useState(null);
  const [showAllMyCheckins, setShowAllMyCheckins] = useState(false);
  const [showAllFriendCheckins, setShowAllFriendCheckins] = useState(false);

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
    const mergedAdded =
      remoteAdded.length > 0
        ? remoteAdded
        : mergedFavorites.map((id) => ({ id, date: new Date().toISOString() }));
    setAdded(mergedAdded);
    setPlans(remotePlans.length > 0 ? remotePlans : localPlans || []);

    writeLocalJson(FAVORITES_STORAGE_KEY, mergedFavorites);
    writeLocalJson(ADDED_STORAGE_KEY, mergedAdded);
    writeLocalJson(PLAN_STORAGE_KEY, remotePlans.length > 0 ? remotePlans : localPlans || []);
  }, [setAdded, setFavorites, setPlans, setSyncWarning]);

  const loadAtlasData = useCallback(async () => {
    setIsAtlasLoading(true);
    setAtlasLoadError("");

    const cached = readRuntimeCache(FAVORITES_ATLAS_CACHE_KEY, FAVORITES_ATLAS_CACHE_TTL_MS);
    if (cached.hit && cached.data) {
      setPlaces(Array.isArray(cached.data.places) ? cached.data.places : []);
      setEvents(Array.isArray(cached.data.events) ? cached.data.events : []);
      setIsAtlasLoading(false);
      if (!cached.stale) return;
    }

    const [{ data: placesData, error: placesError }, { data: eventsData, error: eventsError }] = await Promise.all([
      supabase
        .from("places_with_stats")
        .select("id,name,type,city,lat,lng,description,vibe,hours,link,location,avgRating,reviewCount")
        .limit(FAVORITES_ATLAS_PLACE_FETCH_LIMIT),
      supabase
        .from("events")
        .select("id,name,city,date,start_date,end_date,address,description,vibe,link,lat,lng")
        .limit(FAVORITES_ATLAS_EVENT_FETCH_LIMIT),
    ]);

    if (placesError || eventsError) {
      setAtlasLoadError("Could not load some live atlas data. Showing available signal.");
    }

    const nextPlaces = dedupeById(await mergeSeedPlacesAsync(placesData || []));
    const nextEvents = dedupeById(await mergeSeedEventsAsync(eventsData || []));
    setPlaces(nextPlaces);
    setEvents(nextEvents);
    writeRuntimeCache(FAVORITES_ATLAS_CACHE_KEY, {
      places: nextPlaces,
      events: nextEvents,
    });
    setIsAtlasLoading(false);
  }, [setAtlasLoadError, setEvents, setIsAtlasLoading, setPlaces]);

  const loadCheckins = useCallback(async () => {
    if (!user?.id) {
      const localRows = readLocalJson(CHECKINS_STORAGE_KEY, []);
      const mapped = Array.isArray(localRows) ? localRows.map(mapCheckinRow) : [];
      setCheckins(mapped.sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0)));
      return;
    }

    const { data, error } = await supabase
      .from("qa_member_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("checked_in_at", { ascending: false })
      .limit(300);

    if (error) {
      if (isMissingTableError(error)) {
        setCheckinsWarning("Check-ins are not enabled yet. Run the latest Supabase SQL.");
      } else {
        setCheckinsWarning("Cloud check-ins unavailable. Showing local check-ins.");
      }
      const localRows = readLocalJson(CHECKINS_STORAGE_KEY, []);
      const mapped = Array.isArray(localRows) ? localRows.map(mapCheckinRow) : [];
      setCheckins(mapped.sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0)));
      return;
    }

    const mapped = (Array.isArray(data) ? data : []).map(mapCheckinRow);
    setCheckins(mapped);
    writeLocalJson(CHECKINS_STORAGE_KEY, mapped);
    setCheckinsWarning("");
  }, [setCheckins, setCheckinsWarning, user?.id]);

  const loadFollowingCheckins = useCallback(async () => {
    if (!user?.id || !Array.isArray(followingUserIds) || followingUserIds.length === 0) {
      setFollowingCheckins([]);
      setFollowingPresenceByUserId({});
      setFollowingCheckinsWarning("");
      return;
    }

    const targetIds = [...new Set(followingUserIds.map((id) => String(id)).filter(Boolean))];
    if (targetIds.length === 0) {
      setFollowingCheckins([]);
      setFollowingPresenceByUserId({});
      setFollowingCheckinsWarning("");
      return;
    }

    const [checkinsRes, profilesRes, presenceRes] = await Promise.all([
      supabase
        .from("qa_member_checkins")
        .select("id, user_id, mode, privacy, country, city, label, address, note, place_id, event_id, lat, lng, checked_in_at, created_at")
        .in("user_id", targetIds)
        .neq("privacy", "private")
        .order("checked_in_at", { ascending: false })
        .limit(150),
      supabase
        .from("member_profiles")
        .select("user_id, display_name")
        .in("user_id", targetIds),
      supabase
        .from("qa_presence")
        .select("user_id, is_online, last_seen_at")
        .in("user_id", targetIds),
    ]);

    if (checkinsRes.error) {
      if (isMissingTableError(checkinsRes.error)) {
        setFollowingCheckinsWarning("Friends check-ins require updated check-in SQL policies.");
      } else {
        setFollowingCheckinsWarning("Could not load friends check-ins right now.");
      }
      setFollowingCheckins([]);
      return;
    }

    const profileByUserId = new Map(
      (Array.isArray(profilesRes.data) ? profilesRes.data : []).map((row) => [
        String(row.user_id || ""),
        String(row.display_name || "").trim() || "Member",
      ])
    );

    const presenceMap = {};
    (Array.isArray(presenceRes.data) ? presenceRes.data : []).forEach((row) => {
      const userId = String(row.user_id || "");
      if (!userId) return;
      presenceMap[userId] = {
        isOnline: Boolean(row.is_online),
        lastSeenAt: row.last_seen_at || null,
      };
    });
    setFollowingPresenceByUserId(presenceMap);

    const mapped = (Array.isArray(checkinsRes.data) ? checkinsRes.data : []).map((row) => {
      const normalized = mapCheckinRow(row);
      const ownerId = String(row.user_id || "");
      return {
        ...normalized,
        ownerUserId: ownerId,
        ownerName: profileByUserId.get(ownerId) || "Member",
      };
    });

    setFollowingCheckins(mapped);
    setFollowingCheckinsWarning("");
  }, [followingUserIds, setFollowingCheckins, setFollowingCheckinsWarning, setFollowingPresenceByUserId, user?.id]);

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
  }, [setBlockedItems]);

  useEffect(() => {
    return subscribeBlockedItems((items) => {
      setBlockedItems(items || []);
    });
  }, [setBlockedItems]);

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
      await loadCheckins();
      setIsReady(true);
    });
  }, [authMemberName, isAuthLoading, isMember, loadAtlasData, loadCheckins, loadMemberCollections, memberProfile, router, setAdded, setFavorites, setIsReady, setMemberName, setPlans, setProfileForm, setSyncWarning, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(PLAN_STORAGE_KEY, plans);
  }, [isReady, isMember, plans]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
    }, 60000);
    return () => window.clearInterval(timer);
  }, [setNowTs]);

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
  }, [isReady, isMember, setMemberRank, user?.id]);

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
  }, [isMember, setFollowingFeedRows, setFollowingUserIds, setNetworkLoading, setNetworkMembers, setNetworkWarning, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember || !user?.id) return;
    queueMicrotask(async () => {
      await loadTrustNetwork();
    });
  }, [isReady, isMember, loadTrustNetwork, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember || !user?.id) return;
    queueMicrotask(async () => {
      await loadFollowingCheckins();
    });
  }, [isReady, isMember, loadFollowingCheckins, user?.id]);

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
  const cityCountryLookup = useMemo(() => {
    const map = new Map();

    Object.entries(cityConfig || {}).forEach(([cityKey, config]) => {
      const normalized = normalizeCityKey(cityKey);
      const country = String(config?.country || "").trim();
      if (normalized && country) {
        map.set(normalized, country);
      }
    });

    places.forEach((place) => {
      const normalized = normalizeCityKey(place.city);
      const country = String(cityConfig?.[String(place.city || "").toLowerCase()]?.country || "").trim();
      if (!normalized || !country || map.has(normalized)) return;
      map.set(normalized, country);
    });

    events.forEach((event) => {
      const normalized = normalizeCityKey(event.city);
      const country = String(cityConfig?.[String(event.city || "").toLowerCase()]?.country || "").trim();
      if (!normalized || !country || map.has(normalized)) return;
      map.set(normalized, country);
    });

    return map;
  }, [events, places]);

  const cityLabelLookup = useMemo(() => {
    const map = new Map();
    Object.keys(cityConfig || {}).forEach((cityKey) => {
      map.set(normalizeCityKey(cityKey), formatCityLabel(cityKey));
    });
    places.forEach((place) => {
      const key = normalizeCityKey(place.city);
      if (key && !map.has(key)) {
        map.set(key, formatCityLabel(place.city));
      }
    });
    events.forEach((event) => {
      const key = normalizeCityKey(event.city);
      if (key && !map.has(key)) {
        map.set(key, formatCityLabel(event.city));
      }
    });
    return map;
  }, [events, places]);

  const allCities = useMemo(
    () =>
      [...new Set(savedPlaces.concat(savedEvents).map((item) => normalizeCityKey(item.city)).filter(Boolean))]
        .map((cityKey) => cityLabelLookup.get(cityKey) || formatCityLabel(cityKey))
        .filter(Boolean),
    [cityLabelLookup, savedEvents, savedPlaces]
  );
  const totalCities = allCities.length;

  const checkinCountryOptions = useMemo(() => {
    return [...new Set([...cityCountryLookup.values(), String(memberProfile?.residentCountry || "").trim()].filter(Boolean))].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [cityCountryLookup, memberProfile?.residentCountry]);

  const checkinCityOptions = useMemo(() => {
    const selectedCountry = String(checkinForm.country || "").trim();
    const entries = [...cityCountryLookup.entries()].filter(([, country]) => {
      if (!selectedCountry) return true;
      return String(country).toLowerCase() === selectedCountry.toLowerCase();
    });
    return entries
      .map(([cityKey]) => cityLabelLookup.get(cityKey) || formatCityLabel(cityKey))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [checkinForm.country, cityCountryLookup, cityLabelLookup]);

  useEffect(() => {
    if (String(checkinForm.country || "").trim()) return;
    if (memberProfile?.residentCountry) {
      setCheckinForm((current) => ({ ...current, country: String(memberProfile.residentCountry).trim() }));
      return;
    }

    const homeCityKey = normalizeCityKey(memberProfile?.homeCity);
    const homeCountry = homeCityKey ? cityCountryLookup.get(homeCityKey) : "";
    if (homeCountry) {
      setCheckinForm((current) => ({ ...current, country: String(homeCountry) }));
      return;
    }

    if (checkinCountryOptions.length > 0) {
      setCheckinForm((current) => ({ ...current, country: String(checkinCountryOptions[0]) }));
    }
  }, [checkinCountryOptions, checkinForm.country, cityCountryLookup, memberProfile?.homeCity, memberProfile?.residentCountry, setCheckinForm]);

  useEffect(() => {
    if (String(checkinForm.city || "").trim()) return;
    if (memberProfile?.homeCity) {
      setCheckinForm((current) => ({ ...current, city: formatCityLabel(memberProfile.homeCity) }));
      return;
    }
    if (checkinCityOptions.length > 0) {
      setCheckinForm((current) => ({ ...current, city: String(checkinCityOptions[0]) }));
    }
  }, [checkinCityOptions, checkinForm.city, memberProfile?.homeCity, setCheckinForm]);

  useEffect(() => {
    if (!checkinForm.city) return;
    if (checkinCityOptions.includes(checkinForm.city)) return;
    setCheckinForm((current) => ({
      ...current,
      city: checkinCityOptions[0] || "",
      sourceId: "",
      label: "",
      address: "",
    }));
  }, [checkinCityOptions, checkinForm.city, setCheckinForm]);

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

  const recentCheckins = useMemo(
    () =>
      [...checkins]
        .sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0))
        .slice(0, 10),
    [checkins]
  );

  const filteredRecentCheckins = useMemo(() => {
    const base = [...recentCheckins];
    if (checkinViewFilter === "places") return base.filter((item) => Boolean(String(item.placeId || "").trim()));
    if (checkinViewFilter === "events") return base.filter((item) => Boolean(String(item.eventId || "").trim()));
    if (checkinViewFilter === "manual") {
      return base.filter(
        (item) => !String(item.placeId || "").trim() && !String(item.eventId || "").trim()
      );
    }
    return base;
  }, [checkinViewFilter, recentCheckins]);

  const recentFollowingCheckins = useMemo(
    () =>
      [...followingCheckins]
        .sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0))
        .slice(0, 12),
    [followingCheckins]
  );

  const visibleRecentCheckins = useMemo(() => {
    if (showAllMyCheckins) return filteredRecentCheckins;
    return filteredRecentCheckins.slice(0, MY_CHECKIN_PREVIEW_COUNT);
  }, [filteredRecentCheckins, showAllMyCheckins]);

  const visibleRecentFollowingCheckins = useMemo(() => {
    if (showAllFriendCheckins) return recentFollowingCheckins;
    return recentFollowingCheckins.slice(0, FRIEND_CHECKIN_PREVIEW_COUNT);
  }, [recentFollowingCheckins, showAllFriendCheckins]);

  const hasMoreMyCheckins = filteredRecentCheckins.length > MY_CHECKIN_PREVIEW_COUNT;
  const hasMoreFriendCheckins = recentFollowingCheckins.length > FRIEND_CHECKIN_PREVIEW_COUNT;

  const checkinSidebarStyle = useMemo(() => {
    if (!Number.isFinite(checkinSidebarHeight) || checkinSidebarHeight <= 0) return undefined;
    const value = `${Math.round(checkinSidebarHeight)}px`;
    return { height: value, maxHeight: value };
  }, [checkinSidebarHeight]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const leftPanel = checkinMapCardRef.current;
    if (!leftPanel) return;

    let frame = 0;
    const syncHeight = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) {
        setCheckinSidebarHeight(null);
        return;
      }
      const nextHeight = Math.round(leftPanel.getBoundingClientRect().height || 0);
      setCheckinSidebarHeight(nextHeight > 0 ? nextHeight : null);
    };

    const scheduleSync = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncHeight);
    };

    scheduleSync();
    const onResize = () => scheduleSync();
    window.addEventListener("resize", onResize);

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => scheduleSync());
      observer.observe(leftPanel);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (observer) observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [checkinMapCardRef]);

  useEffect(() => {
    setShowAllMyCheckins(false);
  }, [checkinViewFilter]);

  const checkinCities = useMemo(
    () => [...new Set(checkins.map((item) => String(item.city || "").trim()).filter(Boolean))],
    [checkins]
  );

  const selectedCheckinCityKey = useMemo(() => normalizeCityKey(checkinForm.city), [checkinForm.city]);

  const selectedCityPlaces = useMemo(
    () =>
      places
        .filter((place) => normalizeCityKey(place.city) === selectedCheckinCityKey)
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [places, selectedCheckinCityKey]
  );

  const selectedCityEvents = useMemo(
    () =>
      events
        .filter((event) => normalizeCityKey(event.city) === selectedCheckinCityKey)
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [events, selectedCheckinCityKey]
  );

  const checkinMarkers = useMemo(() => {
    const placeById = new Map(
      savedPlaces.map((place) => [String(place.id), place])
    );
    const eventById = new Map(
      savedEvents.map((event) => [String(event.id), event])
    );
    const placeByCityName = new Map(
      savedPlaces.map((place) => [
        `${normalizeLooseText(place.city)}::${normalizeLooseText(place.name)}`,
        place,
      ])
    );
    const eventByCityName = new Map(
      savedEvents.map((event) => [
        `${normalizeLooseText(event.city)}::${normalizeLooseText(event.name)}`,
        event,
      ])
    );

    return checkins
      .map((entry) => {
        if (Number.isFinite(entry.lat) && Number.isFinite(entry.lng)) {
          return { ...entry, markerLat: Number(entry.lat), markerLng: Number(entry.lng) };
        }

        const placeMatch = entry.placeId ? placeById.get(String(entry.placeId)) : null;
        const eventMatch = entry.eventId ? eventById.get(String(entry.eventId)) : null;
        const key = `${normalizeLooseText(entry.city)}::${normalizeLooseText(entry.label)}`;
        const byName = placeByCityName.get(key) || eventByCityName.get(key) || null;
        const match = placeMatch || eventMatch || byName;

        if (match && Number.isFinite(Number(match.lat)) && Number.isFinite(Number(match.lng))) {
          return { ...entry, markerLat: Number(match.lat), markerLng: Number(match.lng) };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.checkedInAt || 0) - new Date(a.checkedInAt || 0));
  }, [checkins, savedEvents, savedPlaces]);

  const followingCheckinMarkers = useMemo(
    () =>
      recentFollowingCheckins
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
        .map((item) => ({ ...item, markerLat: Number(item.lat), markerLng: Number(item.lng) }))
        .slice(0, 18),
    [recentFollowingCheckins]
  );

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const loadMapbox = useCallback(async () => {
    if (mapboxLibRef.current) return mapboxLibRef.current;
    const mapboxModule = await import("mapbox-gl");
    mapboxLibRef.current = mapboxModule.default;
    return mapboxLibRef.current;
  }, []);

  const interactiveCheckinPoints = useMemo(() => {
    const mine = checkinMarkers.map((item) => ({
      ...item,
      markerId: `mine-${String(item.id)}`,
      markerKind: "mine",
    }));
    const friends = followingCheckinMarkers.map((item) => ({
      ...item,
      markerId: `friend-${String(item.id)}`,
      markerKind: "friend",
    }));
    return [...mine, ...friends];
  }, [checkinMarkers, followingCheckinMarkers]);

  const selectedCheckin = useMemo(() => {
    if (!selectedCheckinId) return null;
    return checkinMarkers.find((item) => String(item.id) === String(selectedCheckinId)) || null;
  }, [checkinMarkers, selectedCheckinId]);

  const checkinMapCenter = useMemo(() => {
    const centerSource =
      checkinMarkers[0] ||
      followingCheckinMarkers[0] ||
      savedPlaces.find((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng))) ||
      savedEvents.find((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng))) ||
      null;
    if (!centerSource) return null;

    const centerLng = Number(centerSource.markerLng ?? centerSource.lng);
    const centerLat = Number(centerSource.markerLat ?? centerSource.lat);
    if (!Number.isFinite(centerLat) || !Number.isFinite(centerLng)) return null;
    return { lat: centerLat, lng: centerLng };
  }, [checkinMarkers, followingCheckinMarkers, savedEvents, savedPlaces]);

  const staticMapUrl = useMemo(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return "";
    const myMarkers = checkinMarkers
      .map((item) => `pin-s+f472b6(${item.markerLng},${item.markerLat})`)
      .join(",");
    const friendMarkers = followingCheckinMarkers
      .map((item) => `pin-s+22d3ee(${item.markerLng},${item.markerLat})`)
      .join(",");
    const markerString = [myMarkers, friendMarkers].filter(Boolean).join(",");
    if (!checkinMapCenter) return "";
    const centerLng = Number(checkinMapCenter.lng);
    const centerLat = Number(checkinMapCenter.lat);
    const zoom = 11;
    if (!markerString) {
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${centerLng},${centerLat},${zoom}/1200x620?padding=36&access_token=${token}`;
    }
    const encoded = markerString.replaceAll("|", "%7C");
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${encoded}/${centerLng},${centerLat},${zoom}/1200x620?padding=36&access_token=${token}`;
  }, [checkinMapCenter, checkinMarkers, followingCheckinMarkers]);

  const checkinMapEmbedUrl = useMemo(() => {
    if (!checkinMapCenter) return "";
    const lat = Number(checkinMapCenter.lat);
    const lng = Number(checkinMapCenter.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";

    const delta = 0.06;
    const left = (lng - delta).toFixed(6);
    const right = (lng + delta).toFixed(6);
    const top = (lat + delta).toFixed(6);
    const bottom = (lat - delta).toFixed(6);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
  }, [checkinMapCenter]);

  const openStreetMapStaticUrl = useMemo(() => {
    if (!checkinMapCenter) return "";
    const lat = Number(checkinMapCenter.lat);
    const lng = Number(checkinMapCenter.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
    const zoom = 11;
    const marker = `${lat.toFixed(6)},${lng.toFixed(6)},red-pushpin`;
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat.toFixed(6)},${lng.toFixed(6)}&zoom=${zoom}&size=1200x620&markers=${marker}`;
  }, [checkinMapCenter]);

  useEffect(() => {
    if (!mapboxToken || !checkinMapContainerRef.current || checkinMapRef.current) return;
    let cancelled = false;
    let mapInstance = null;

    const initializeMap = async () => {
      const mapboxgl = await loadMapbox();
      if (cancelled || checkinMapRef.current) return;

      mapboxgl.accessToken = mapboxToken;
      const center = checkinMapCenter
        ? [Number(checkinMapCenter.lng), Number(checkinMapCenter.lat)]
        : [11, 20];
      const zoom = checkinMapCenter ? 4.2 : 2;
      mapInstance = new mapboxgl.Map({
        container: checkinMapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom,
        attributionControl: false,
      });
      mapInstance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      checkinMapRef.current = mapInstance;
    };

    initializeMap();

    return () => {
      cancelled = true;
      checkinMapMarkersRef.current.forEach((marker) => marker.remove());
      checkinMapMarkersRef.current = [];
      mapInstance?.remove();
      mapInstance = null;
      checkinMapRef.current = null;
    };
  }, [
    checkinMapCenter,
    checkinMapContainerRef,
    checkinMapMarkersRef,
    checkinMapRef,
    loadMapbox,
    mapboxToken,
  ]);

  useEffect(() => {
    const map = checkinMapRef.current;
    if (!map) return;
    const mapboxgl = mapboxLibRef.current;
    if (!mapboxgl) return;

    checkinMapMarkersRef.current.forEach((marker) => marker.remove());
    checkinMapMarkersRef.current = [];

    if (!interactiveCheckinPoints.length) {
      if (checkinMapCenter) {
        map.flyTo({
          center: [Number(checkinMapCenter.lng), Number(checkinMapCenter.lat)],
          zoom: Math.max(map.getZoom(), 4.2),
          essential: true,
        });
      }
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    interactiveCheckinPoints.forEach((point) => {
      const lat = Number(point.markerLat);
      const lng = Number(point.markerLng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const markerEl = document.createElement("button");
      markerEl.type = "button";
      markerEl.style.width = "14px";
      markerEl.style.height = "14px";
      markerEl.style.borderRadius = "9999px";
      markerEl.style.border = "2px solid rgba(255,255,255,0.85)";
      markerEl.style.background = point.markerKind === "friend" ? "#22d3ee" : "#f472b6";
      markerEl.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.42)";
      markerEl.style.cursor = "pointer";
      markerEl.style.transform = String(selectedCheckinId) === String(point.id) ? "scale(1.2)" : "scale(1)";
      markerEl.title = String(point.label || point.ownerName || "Check-in");
      markerEl.addEventListener("click", () => {
        if (point.markerKind === "mine") {
          setSelectedCheckinId(String(point.id || ""));
        }
        map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 12), essential: true });
      });

      const marker = new mapboxgl.Marker({ element: markerEl, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);
      checkinMapMarkersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    if (!bounds.isEmpty()) {
      if (selectedCheckinId) {
        const selected = interactiveCheckinPoints.find((item) => String(item.id) === String(selectedCheckinId));
        if (selected && Number.isFinite(Number(selected.markerLat)) && Number.isFinite(Number(selected.markerLng))) {
          map.flyTo({
            center: [Number(selected.markerLng), Number(selected.markerLat)],
            zoom: Math.max(map.getZoom(), 12),
            essential: true,
          });
          return;
        }
      }
      map.fitBounds(bounds, { padding: 44, maxZoom: 11, duration: 650 });
    }
  }, [checkinMapCenter, checkinMapMarkersRef, checkinMapRef, interactiveCheckinPoints, selectedCheckinId, setSelectedCheckinId]);

  useEffect(() => {
    setCheckinMapLoadFailed(false);
  }, [setCheckinMapLoadFailed, staticMapUrl]);

  useEffect(() => {
    setCheckinStaticFallbackFailed(false);
  }, [openStreetMapStaticUrl, setCheckinStaticFallbackFailed]);

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
    const weekAgo = nowTs - 7 * 24 * 60 * 60 * 1000;
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
  }, [allCities, events, followingFeedItems, nowTs, totalCities]);

  const momentumMilestones = useMemo(() => {
    const checkinCount = checkins.length;
    const checkinCityCount = new Set(
      checkins.map((item) => normalizeCityKey(item.city)).filter(Boolean)
    ).size;
    const weekendActivityCount = new Set(
      checkins
        .map((item) => {
          const date = new Date(item.checkedInAt || item.createdAt || "");
          if (Number.isNaN(date.getTime())) return "";
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const day = String(date.getUTCDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        })
        .filter(Boolean)
    ).size;

    const items = [
      {
        id: "first-checkin",
        label: "First check-in",
        current: checkinCount,
        target: 1,
      },
      {
        id: "cities-5",
        label: "5 cities explored",
        current: checkinCityCount,
        target: 5,
      },
      {
        id: "venues-10",
        label: "10 places saved",
        current: totalPlaces,
        target: 10,
      },
      {
        id: "weekends-3",
        label: "3 active days",
        current: weekendActivityCount,
        target: 3,
      },
    ].map((item) => ({
      ...item,
      done: item.current >= item.target,
      progress: Math.max(0, Math.min(1, item.current / item.target)),
    }));

    const completed = items.filter((item) => item.done).length;
    const overallProgress = items.length ? completed / items.length : 0;
    const nextMilestone = items.find((item) => !item.done) || null;

    return {
      items,
      completed,
      total: items.length,
      overallProgress,
      nextMilestone,
    };
  }, [checkins, totalPlaces]);

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

    showActionFeedback(showToast, "favoriteRemoved", { label });
  };

  const addFavoriteFromNetwork = async (favoriteId, label = "Item") => {
    const normalized = String(favoriteId || "");
    if (!normalized) return;
    if (favorites.includes(normalized)) {
      showActionFeedback(showToast, "favoriteAlreadySaved", { label });
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

    showActionFeedback(showToast, "favoriteSaved", { label });
    trackKpiEvent("favorite_saved", {
      targetType: normalized.startsWith("event-") ? "event" : "place",
      targetId: normalized,
      memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
    });
  };

  const resolveCheckinPlaceDbId = useCallback(async (entry) => {
    const rawPlaceId = String(entry?.placeId || "").trim();
    if (rawPlaceId && !rawPlaceId.startsWith("seed-place-") && /^\d+$/.test(rawPlaceId)) {
      return Number(rawPlaceId);
    }

    const cityValue = String(entry?.city || "").trim();
    const labelValue = String(entry?.label || "").trim();
    if (!cityValue || !labelValue) return null;

    const normalize = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ");

    const lookup = await supabase
      .from("places")
      .select("id, city, name")
      .ilike("name", labelValue)
      .limit(20);

    const rows = Array.isArray(lookup?.data) ? lookup.data : [];
    const matched = rows.find((row) => normalize(row?.city) === normalize(cityValue));
    const numericId = Number(matched?.id);
    return Number.isFinite(numericId) ? numericId : null;
  }, []);

  const submitCheckinVibe = useCallback(async (signalKey) => {
    if (!pendingCheckinVibe?.placeDbId) return;
    if (!user?.id) {
      showToast("Join as member to share live vibe.", { tone: "info", duration: 2200 });
      return;
    }

    const now = Date.now();
    if (now < Number(checkinVibeCooldownUntil || 0)) {
      const secondsLeft = Math.ceil((Number(checkinVibeCooldownUntil) - now) / 1000);
      showToast(`Hold for ${secondsLeft}s before sending another vibe tap.`, {
        tone: "info",
        duration: 1800,
      });
      return;
    }

    setIsSubmittingCheckinVibe(true);
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("qa_place_vibe_signals")
        .upsert(
          [{
            place_id: pendingCheckinVibe.placeDbId,
            user_id: user.id,
            signal_key: signalKey,
            created_at: nowIso,
          }],
          { onConflict: "place_id,user_id" }
        );

      if (error) {
        if (isMissingLiveVibeTableError(error)) {
          showToast("Live vibe table missing. Run the latest Supabase SQL.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }
        showToast("Could not save live vibe right now.", { tone: "warn", duration: 2200 });
        return;
      }

      setCheckinVibeCooldownUntil(Date.now() + CHECKIN_VIBE_COOLDOWN_MS);
      showToast("Live vibe shared.", { tone: "ok", duration: 1600 });
      setPendingCheckinVibe(null);
    } finally {
      setIsSubmittingCheckinVibe(false);
    }
  }, [checkinVibeCooldownUntil, pendingCheckinVibe, setCheckinVibeCooldownUntil, setIsSubmittingCheckinVibe, setPendingCheckinVibe, showToast, user?.id]);

  const submitCheckin = async (payload) => {
    const editingId = String(payload?.id || "").trim();
    const isEditing = Boolean(editingId);
    const countryValue = String(payload?.country || "").trim();
    const cityValue = String(payload?.city || "").trim();
    const labelValue = String(payload?.label || "").trim();
    const addressValue = String(payload?.address || "").trim();
    if (!cityValue || !labelValue) {
      showToast("City and venue/event are required for check-in.", { tone: "warn", duration: 2400 });
      return;
    }

    const modeValue = String(payload?.mode || "trip");
    const privacyValue = String(payload?.privacy || "friends");
    const latValue = Number(payload?.lat);
    const lngValue = Number(payload?.lng);
    let resolvedCoords =
      Number.isFinite(latValue) && Number.isFinite(lngValue)
        ? { lat: latValue, lng: lngValue }
        : null;

    if (!resolvedCoords) {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
      resolvedCoords = await geocodeCheckinFromCityAndLabel({
        city: cityValue,
        country: countryValue,
        label: labelValue,
        address: addressValue,
        token,
      });
    }

    const nextCheckin = {
      id: isEditing ? editingId : `local-${Date.now()}`,
      mode: modeValue,
      privacy: privacyValue,
      country: countryValue,
      city: cityValue,
      label: labelValue,
      address: addressValue,
      note: String(payload?.note || "").trim(),
      placeId: String(payload?.placeId || ""),
      eventId: String(payload?.eventId || ""),
      lat: Number.isFinite(Number(resolvedCoords?.lat)) ? Number(resolvedCoords.lat) : null,
      lng: Number.isFinite(Number(resolvedCoords?.lng)) ? Number(resolvedCoords.lng) : null,
      checkedInAt: String(payload?.checkedInAt || new Date().toISOString()),
      createdAt: String(payload?.createdAt || new Date().toISOString()),
    };

    setIsSavingCheckin(true);
    try {
      let savedRow = nextCheckin;
      if (user?.id) {
        const writePayload = {
          user_id: user.id,
          mode: modeValue,
          privacy: privacyValue,
          country: countryValue || null,
          city: cityValue,
          label: labelValue,
          address: addressValue || null,
          note: nextCheckin.note || null,
          place_id: nextCheckin.placeId || null,
          event_id: nextCheckin.eventId || null,
          lat: nextCheckin.lat,
          lng: nextCheckin.lng,
          checked_in_at: nextCheckin.checkedInAt,
        };
        const query = isEditing
          ? supabase
              .from("qa_member_checkins")
              .update(writePayload)
              .eq("id", editingId)
              .eq("user_id", user.id)
              .select("*")
              .single()
          : supabase
              .from("qa_member_checkins")
              .insert([writePayload])
              .select("*")
              .single();

        const { data, error } = await query;

        if (error) {
          if (isMissingTableError(error)) {
            setCheckinsWarning("Check-ins are not enabled yet. Run the latest Supabase SQL.");
            showToast("Saved locally. Enable check-ins SQL for cloud sync.", { tone: "info", duration: 2800 });
          } else {
            setCheckinsWarning("Cloud check-in unavailable. Saved locally.");
            showToast("Saved locally. Cloud check-in unavailable.", { tone: "info", duration: 2600 });
          }
        } else if (data) {
          savedRow = mapCheckinRow(data);
          setCheckinsWarning("");
        }
      } else {
        showToast("Saved locally. Join as member to sync check-ins across devices.", { tone: "info", duration: 2800 });
      }

      setCheckins((current) => {
        const merged = isEditing
          ? current.map((entry) => (String(entry.id) === String(savedRow.id) ? savedRow : entry))
          : [savedRow, ...current].slice(0, 300);
        writeLocalJson(CHECKINS_STORAGE_KEY, merged);
        return merged;
      });

      trackKpiEvent("checkin_saved", {
        city: cityValue,
        targetType: "checkin",
        targetId: String(savedRow.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showActionFeedback(showToast, isEditing ? "checkinUpdated" : "checkinSaved");
      setSelectedCheckinId(String(savedRow.id || ""));
      if (isEditing) {
        setEditingCheckinId("");
        setPendingCheckinVibe(null);
      } else if (user?.id) {
        try {
          const placeDbId = await resolveCheckinPlaceDbId(savedRow);
          if (placeDbId) {
            setPendingCheckinVibe({
              placeDbId,
              label: String(savedRow.label || ""),
              city: String(savedRow.city || ""),
            });
          } else {
            setPendingCheckinVibe(null);
          }
        } catch {
          setPendingCheckinVibe(null);
        }
      }
    } finally {
      setIsSavingCheckin(false);
    }
  };

  const startEditCheckin = (entry) => {
    if (!entry?.id) return;
    setEditingCheckinId(String(entry.id));
    setSelectedCheckinId(String(entry.id));
    setCheckinForm((current) => ({
      ...current,
      mode: String(entry.mode || "trip"),
      privacy: String(entry.privacy || "friends"),
      country: String(entry.country || cityCountryLookup.get(normalizeCityKey(entry.city)) || current.country || ""),
      city: formatCityLabel(String(entry.city || current.city || "")),
      sourceType: "manual",
      sourceId: "",
      label: String(entry.label || ""),
      address: String(entry.address || ""),
      note: String(entry.note || ""),
    }));
  };

  const cancelEditCheckin = () => {
    setEditingCheckinId("");
  };

  const deleteCheckin = async (entry) => {
    const id = String(entry?.id || "");
    if (!id) return;

    if (user?.id && !id.startsWith("local-")) {
      const { error } = await supabase
        .from("qa_member_checkins")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        showToast("Could not delete check-in in cloud. Try again.", { tone: "warn", duration: 2500 });
        return;
      }
    }

    setCheckins((current) => {
      const next = current.filter((item) => String(item.id) !== id);
      writeLocalJson(CHECKINS_STORAGE_KEY, next);
      return next;
    });
    if (editingCheckinId === id) {
      setEditingCheckinId("");
    }
    if (selectedCheckinId === id) {
      setSelectedCheckinId("");
    }
    showActionFeedback(showToast, "checkinDeleted");
  };

  const focusCheckinOnMap = useCallback(
    (entry) => {
      if (!entry?.id) return;
      setSelectedCheckinId(String(entry.id));

      const map = checkinMapRef.current;
      if (map && Number.isFinite(Number(entry.markerLat)) && Number.isFinite(Number(entry.markerLng))) {
        map.flyTo({
          center: [Number(entry.markerLng), Number(entry.markerLat)],
          zoom: Math.max(map.getZoom(), 12.5),
          essential: true,
        });
      }

      const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
      if (isMobile) {
        checkinMapCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [checkinMapCardRef, checkinMapRef, setSelectedCheckinId]
  );

  const quickCheckinFromItem = async (item, itemType = "place") => {
    if (!item) return;
    const cityValue = String(item.city || "");
    const countryValue = cityCountryLookup.get(normalizeCityKey(cityValue)) || "";
    await submitCheckin({
      mode: "trip",
      privacy: "friends",
      country: countryValue,
      city: cityValue,
      label: String(item.name || item.title || "Unknown stop"),
      address: String(item.location || item.address || ""),
      note: "",
      lat: item.lat,
      lng: item.lng,
      placeId: itemType === "place" ? String(item.id || "") : "",
      eventId: itemType === "event" ? String(item.id || "") : "",
    });
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
    trackKpiEvent("plan_saved", {
      city: cityName,
      targetType: "plan",
      targetId: String(savedPlan.id || ""),
      memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
    });
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
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_top,#120b1d_0%,#050505_38%,#040404_100%)] text-white">
      <ActionToast toast={toast} />
      <div className="qa-shell relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(45,212,191,0.14),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%)]" />

        <section className="qa-panel relative mb-8 overflow-hidden rounded-[38px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.20),transparent_28%),linear-gradient(135deg,rgba(36,20,44,0.96),rgba(10,10,10,0.99),rgba(14,28,26,0.98))] p-8 shadow-[0_40px_140px_rgba(0,0,0,0.48)]">
          <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-rose-400/12 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="max-w-4xl">
            <p className="qa-eyebrow text-white/45">
              Member atlas
            </p>
            <p className="mt-4 text-sm text-rose-100/78">
              {greeting}, {displayName}
            </p>
            <h1 className="qa-display qa-h1 mt-4 text-5xl font-bold text-white sm:text-6xl">
              Your Atlas
            </h1>
            <p className="qa-lead mt-5 max-w-2xl text-base text-white/62">
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
            <div className="qa-card qa-metric-card rounded-3xl border border-rose-200/18 bg-[linear-gradient(180deg,rgba(251,113,133,0.18),rgba(251,113,133,0.06))] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Saved places</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalPlaces}</p>
            </div>
            <div className="qa-card qa-metric-card rounded-3xl border border-violet-200/18 bg-[linear-gradient(180deg,rgba(167,139,250,0.18),rgba(167,139,250,0.06))] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Saved events</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalEvents}</p>
            </div>
            <div className="qa-card qa-metric-card rounded-3xl border border-cyan-200/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(34,211,238,0.06))] p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Cities</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalCities}</p>
            </div>
            <div className="qa-card qa-metric-card rounded-3xl border border-amber-200/18 bg-[linear-gradient(180deg,rgba(251,191,36,0.16),rgba(251,191,36,0.06))] p-5 backdrop-blur">
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
              <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
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
                  className="qa-action rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs text-white/72 transition hover:border-white/20 hover:text-white"
                >
                  Edit profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={!hasProfileChanges}
                    className="qa-action qa-action-strong rounded-full bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_14px_40px_rgba(45,212,191,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="qa-action rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs text-white/72 transition hover:border-white/20 hover:text-white"
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

        <section className="relative mb-8 rounded-[34px] border border-fuchsia-200/14 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.13),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_34%),linear-gradient(180deg,rgba(22,14,28,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.36)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Signal rail</p>
              <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">Momentum</h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                One integrated panel for your current signal and your fastest next actions.
              </p>
            </div>
            <button
              onClick={() => router.push("/cities")}
              className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs text-white/65 transition hover:border-white/20 hover:text-white/88"
            >
              Explore cities
            </button>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="h-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-100/78">Your signal</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-rose-200/75">Added this week</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{thisWeekAdds}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/75">Cities touched</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{allCities.length}</p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-200/75">Momentum milestones</p>
                  <span className="text-[11px] text-white/58">
                    {momentumMilestones.completed}/{momentumMilestones.total}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300 transition-[width] duration-500"
                    style={{ width: `${Math.max(8, Math.round(momentumMilestones.overallProgress * 100))}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/58">
                  {momentumMilestones.nextMilestone
                    ? `Next: ${momentumMilestones.nextMilestone.label} (${Math.min(
                        momentumMilestones.nextMilestone.current,
                        momentumMilestones.nextMilestone.target
                      )}/${momentumMilestones.nextMilestone.target})`
                    : "All core milestones completed. Keep your signal active this week."}
                </p>
                <div className="mt-3 grid gap-2">
                  {momentumMilestones.items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border px-3 py-2 text-xs ${
                        item.done
                          ? "border-emerald-200/30 bg-emerald-200/10 text-emerald-100"
                          : "border-white/10 bg-black/20 text-white/72"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{item.label}</span>
                        <span className="text-[11px]">
                          {Math.min(item.current, item.target)}/{item.target}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-indigo-200/75">Community ranking</p>
                {memberRank?.title ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
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
                  <p className="mt-2 text-sm text-white/62">
                    No rank yet. Add places, events, or reviews to activate your badge.
                  </p>
                )}
              </div>

              <div className="mt-3 rounded-2xl border border-emerald-200/18 bg-emerald-200/[0.08] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100/78">Your footprint</p>
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
                      className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] text-white/78 transition hover:border-white/22"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-white/88">
                  {(memberProfile?.displayName || memberName || "Explorer")}
                  {memberProfile?.pronouns ? ` - ${memberProfile.pronouns}` : ""}
                </p>
                <p className="mt-1 text-xs text-white/62">
                  {memberProfile?.homeCity ? `Home: ${memberProfile.homeCity}` : "Home city not set"}
                  {" · "}
                  {memberProfile?.residentCountry ? `Country: ${memberProfile.residentCountry}` : "Country not set"}
                </p>

                {isEditingProfile ? (
                  <form onSubmit={saveProfile} className="mt-3 space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="submit"
                        disabled={!hasProfileChanges}
                        className="rounded-full bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 px-4 py-1.5 text-xs font-semibold text-black shadow-[0_14px_40px_rgba(45,212,191,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] text-white/78 transition hover:border-white/22"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">Your cities</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {allCities.length > 0 ? (
                    allCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => router.push(`/${city.toLowerCase()}`)}
                        className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-white/72 transition hover:border-white/20 hover:text-white"
                      >
                        {city}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-white/45">No cities saved yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-full rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/78">Continue where you left off</p>
              <p className="mt-2 text-sm text-white/56">Latest saves, optimized for quick re-entry.</p>
              <div className="mt-4 space-y-2 md:max-h-[360px] md:overflow-y-auto md:pr-1">
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
                      className="animate-rise-in w-full rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] px-4 py-3 text-left transition hover:-translate-y-[1px] hover:border-white/24 md:flex md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/62">
                          {item.type === "place" ? "Place" : "Event"} - {item.city}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-5 text-white">{item.name}</p>
                      </div>
                      <span className="mt-1.5 block text-[11px] text-white/52 md:mt-0 md:ml-3">{timeAgo(item.date)}</span>
                    </button>
                  ))
                ) : (
                  <div className="w-full rounded-[22px] border border-dashed border-white/12 px-4 py-8 text-sm text-white/45">
                    Start saving places and events to build your atlas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-[34px] border border-fuchsia-200/14 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(26,14,24,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-fuchsia-200/75">
                Your travel timeline
              </p>
              <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                Check-in map
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Check in where you are now and build your own live queer map.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/12 bg-white/7 px-3 py-1 text-xs text-white/70">
                {checkins.length} check-ins
              </span>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100/85">
                {checkinCities.length} cities
              </span>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div
              ref={checkinMapCardRef}
              className={`rounded-3xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 transition ${
                selectedCheckin
                  ? "border-fuchsia-200/34 shadow-[0_0_0_1px_rgba(244,114,182,0.18),0_24px_80px_rgba(244,114,182,0.14)]"
                  : "border-white/10"
              }`}
            >
              {selectedCheckin ? (
                <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-fuchsia-200/35 bg-fuchsia-200/12 px-3 py-1 text-[11px] text-fuchsia-100/95">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-200" />
                  <span className="truncate">
                    Selected: {selectedCheckin.label || "Check-in"} · {selectedCheckin.city || "City"}
                  </span>
                </div>
              ) : null}
              {mapboxToken ? (
                <div
                  ref={checkinMapContainerRef}
                  className="h-[280px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/25"
                />
              ) : checkinMapEmbedUrl ? (
                <iframe
                  title="Your check-in map"
                  src={checkinMapEmbedUrl}
                  className="h-[280px] w-full rounded-2xl border border-white/10 bg-black/25"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : staticMapUrl && !checkinMapLoadFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={staticMapUrl}
                  alt="Your check-in map"
                  onError={() => setCheckinMapLoadFailed(true)}
                  className="h-[280px] w-full rounded-2xl border border-white/10 bg-black/25 object-contain"
                />
              ) : openStreetMapStaticUrl && !checkinStaticFallbackFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={openStreetMapStaticUrl}
                  alt="Your check-in map fallback"
                  onError={() => setCheckinStaticFallbackFailed(true)}
                  className="h-[280px] w-full rounded-2xl border border-white/10 bg-black/25 object-contain"
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 text-sm text-white/45">
                  Check-ins auto-pin from city + venue. Add more check-ins to render the map.
                </div>
              )}

              <form
                ref={checkinFormRef}
                onSubmit={async (event) => {
                  event.preventDefault();
                  const sourceType = String(checkinForm.sourceType || "manual");
                  const payload = { ...checkinForm };

                  if (sourceType === "atlas_place") {
                    const selected = selectedCityPlaces.find((item) => String(item.id) === String(checkinForm.sourceId));
                    if (!selected) {
                      showToast("Choose a venue from atlas or switch to Manual.", { tone: "warn", duration: 2200 });
                      return;
                    }
                    payload.label = String(selected.name || "");
                    payload.placeId = String(selected.id || "");
                    payload.eventId = "";
                    payload.lat = selected.lat;
                    payload.lng = selected.lng;
                    payload.city = formatCityLabel(selected.city || checkinForm.city);
                    payload.country = cityCountryLookup.get(normalizeCityKey(payload.city)) || checkinForm.country || "";
                    payload.address = String(selected.location || selected.address || "");
                  } else if (sourceType === "atlas_event") {
                    const selected = selectedCityEvents.find((item) => String(item.id) === String(checkinForm.sourceId));
                    if (!selected) {
                      showToast("Choose an event from atlas or switch to Manual.", { tone: "warn", duration: 2200 });
                      return;
                    }
                    payload.label = String(selected.name || "");
                    payload.placeId = "";
                    payload.eventId = String(selected.id || "");
                    payload.lat = selected.lat;
                    payload.lng = selected.lng;
                    payload.city = formatCityLabel(selected.city || checkinForm.city);
                    payload.country = cityCountryLookup.get(normalizeCityKey(payload.city)) || checkinForm.country || "";
                    payload.address = String(selected.location || selected.address || "");
                  } else {
                    payload.placeId = "";
                    payload.eventId = "";
                    payload.city = formatCityLabel(checkinForm.city);
                    payload.country = cityCountryLookup.get(normalizeCityKey(payload.city)) || checkinForm.country || "";
                    payload.address = String(checkinForm.address || "");
                  }

                  if (editingCheckinId) {
                    const existing = checkins.find((entry) => String(entry.id) === String(editingCheckinId));
                    payload.id = editingCheckinId;
                    payload.lat = payload.lat ?? existing?.lat ?? null;
                    payload.lng = payload.lng ?? existing?.lng ?? null;
                    payload.checkedInAt = existing?.checkedInAt || new Date().toISOString();
                  }

                  await submitCheckin(payload);
                }}
                className="mt-4 grid gap-2 sm:grid-cols-2"
              >
                <select
                  value={checkinForm.mode}
                  onChange={(event) => setCheckinForm((current) => ({ ...current, mode: event.target.value }))}
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none"
                >
                  <option value="trip">Trip</option>
                  <option value="home">Home</option>
                  <option value="night_out">Night out</option>
                </select>
                <select
                  value={checkinForm.privacy}
                  onChange={(event) => setCheckinForm((current) => ({ ...current, privacy: event.target.value }))}
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none"
                >
                  <option value="friends">Friends</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
                <select
                  value={checkinForm.country}
                  onChange={(event) =>
                    setCheckinForm((current) => ({
                      ...current,
                      country: event.target.value,
                      city: "",
                      sourceId: "",
                      label: "",
                      address: "",
                    }))
                  }
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none"
                >
                  {checkinCountryOptions.length === 0 ? <option value="">No countries yet</option> : null}
                  {checkinCountryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <select
                  value={checkinForm.city}
                  onChange={(event) =>
                    setCheckinForm((current) => ({
                      ...current,
                      city: event.target.value,
                      sourceId: "",
                      label: "",
                      address: "",
                    }))
                  }
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none"
                >
                  {checkinCityOptions.length === 0 ? <option value="">No cities yet</option> : null}
                  {checkinCityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <select
                  value={checkinForm.sourceType}
                  onChange={(event) =>
                    setCheckinForm((current) => ({
                      ...current,
                      sourceType: event.target.value,
                      sourceId: "",
                      label: "",
                      address: "",
                    }))
                  }
                  className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none sm:col-span-2"
                >
                  <option value="manual">Manual venue/event</option>
                  <option value="atlas_place">Choose atlas venue</option>
                  <option value="atlas_event">Choose atlas event</option>
                </select>
                {checkinForm.sourceType === "atlas_place" ? (
                  <select
                    value={checkinForm.sourceId}
                    onChange={(event) => {
                      const selected = selectedCityPlaces.find((item) => String(item.id) === String(event.target.value));
                      setCheckinForm((current) => ({
                        ...current,
                        sourceId: event.target.value,
                        label: selected ? String(selected.name || "") : "",
                        address: selected ? String(selected.location || selected.address || "") : "",
                      }));
                    }}
                    className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none sm:col-span-2"
                  >
                    <option value="">
                      {selectedCityPlaces.length > 0 ? "Select venue" : "No venues in this city yet"}
                    </option>
                    {selectedCityPlaces.map((place) => (
                      <option key={`place-${place.id}`} value={String(place.id)}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                {checkinForm.sourceType === "atlas_event" ? (
                  <select
                    value={checkinForm.sourceId}
                    onChange={(event) => {
                      const selected = selectedCityEvents.find((item) => String(item.id) === String(event.target.value));
                      setCheckinForm((current) => ({
                        ...current,
                        sourceId: event.target.value,
                        label: selected ? String(selected.name || "") : "",
                        address: selected ? String(selected.location || selected.address || "") : "",
                      }));
                    }}
                    className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none sm:col-span-2"
                  >
                    <option value="">
                      {selectedCityEvents.length > 0 ? "Select event" : "No events in this city yet"}
                    </option>
                    {selectedCityEvents.map((item) => (
                      <option key={`event-${item.id}`} value={String(item.id)}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : null}
                {checkinForm.sourceType === "manual" ? (
                  <>
                    <input
                      value={checkinForm.label}
                      onChange={(event) => setCheckinForm((current) => ({ ...current, label: event.target.value }))}
                      placeholder="Venue / event / area"
                      className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none sm:col-span-2"
                    />
                    <input
                      value={checkinForm.address}
                      onChange={(event) => setCheckinForm((current) => ({ ...current, address: event.target.value }))}
                      placeholder="Address (recommended for accurate map pin)"
                      className="rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none sm:col-span-2"
                    />
                  </>
                ) : null}
                <textarea
                  value={checkinForm.note}
                  onChange={(event) => setCheckinForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Note (optional)"
                  className="min-h-[72px] rounded-xl border border-white/12 bg-black/35 px-3 py-2 text-sm outline-none sm:col-span-2"
                />
                <button
                  type="submit"
                  disabled={isSavingCheckin}
                  className="rounded-xl border border-fuchsia-200/30 bg-fuchsia-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-200/55 disabled:opacity-60 sm:col-span-2"
                >
                  {isSavingCheckin ? "Saving check-in..." : editingCheckinId ? "Save check-in changes" : "Check in now"}
                </button>
                {editingCheckinId ? (
                  <button
                    type="button"
                    onClick={cancelEditCheckin}
                    className="rounded-xl border border-white/16 bg-white/7 px-3 py-2 text-xs uppercase tracking-[0.12em] text-white/75 transition hover:border-white/24 sm:col-span-2"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </form>
              {pendingCheckinVibe ? (
                <div className="mt-3 rounded-2xl border border-fuchsia-200/22 bg-fuchsia-200/10 p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-fuchsia-100/80">How is it right now?</p>
                  <p className="mt-1 text-sm text-fuchsia-50/95">
                    Share live vibe for {pendingCheckinVibe.label || "this venue"} in {pendingCheckinVibe.city || "this city"}.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {LIVE_VIBE_OPTIONS.map((option) => (
                      <button
                        key={`post-checkin-vibe-${option.key}`}
                        type="button"
                        disabled={isSubmittingCheckinVibe}
                        onClick={() => {
                          submitCheckinVibe(option.key);
                        }}
                        className={`rounded-xl border px-3 py-2 text-left text-xs transition disabled:opacity-60 ${option.buttonClass}`}
                      >
                        <span className="block text-sm font-semibold">
                          {option.emoji} {option.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] opacity-85">
                          1 tap
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPendingCheckinVibe(null)}
                      className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/75 transition hover:border-white/28"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              ) : null}
              {checkinsWarning && (
                <div className="mt-3 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                  {checkinsWarning}
                </div>
              )}
            </div>

            <div
              style={checkinSidebarStyle}
              className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 lg:self-start lg:flex lg:flex-col lg:overflow-hidden"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-white/42">Your check-ins</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/12 px-2 py-0.5 text-fuchsia-100/90">You</span>
                <span className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-2 py-0.5 text-cyan-100/90">Friends</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "places", label: "Places" },
                  { id: "events", label: "Events" },
                  { id: "manual", label: "Manual" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setCheckinViewFilter(filter.id)}
                    className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.11em] transition ${
                      checkinViewFilter === filter.id
                        ? "border-fuchsia-200/45 bg-fuchsia-200/16 text-fuchsia-100"
                        : "border-white/14 bg-white/6 text-white/62 hover:border-white/24 hover:text-white/82"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-white/52">
                <span>
                  Showing {visibleRecentCheckins.length} of {filteredRecentCheckins.length}
                </span>
                {filteredRecentCheckins.length > 0 ? (
                  <button
                    type="button"
                    disabled={!hasMoreMyCheckins}
                    onClick={() => {
                      if (hasMoreMyCheckins) setShowAllMyCheckins((current) => !current);
                    }}
                    className={`rounded-full border px-3 py-1 uppercase tracking-[0.11em] transition ${
                      hasMoreMyCheckins
                        ? "border-white/16 bg-white/7 text-white/72 hover:border-white/24 hover:text-white"
                        : "cursor-default border-white/10 bg-white/5 text-white/40"
                    }`}
                    title={hasMoreMyCheckins ? "Expand or collapse this list" : "No more items to expand"}
                  >
                    {hasMoreMyCheckins ? (showAllMyCheckins ? "Collapse" : "Show all") : "All visible"}
                  </button>
                ) : null}
              </div>
              <div className={`mt-3 space-y-2 pr-1 ${showAllMyCheckins ? "max-h-[320px] overflow-y-auto lg:max-h-[360px]" : ""}`}>
                {visibleRecentCheckins.length > 0 ? (
                  visibleRecentCheckins.map((entry) => (
                    <article
                      key={entry.id}
                      onClick={() => focusCheckinOnMap(entry)}
                      className={`cursor-pointer rounded-2xl border bg-black/20 p-3 transition ${
                        String(selectedCheckinId) === String(entry.id)
                          ? "border-fuchsia-200/45 shadow-[0_0_0_1px_rgba(244,114,182,0.25)]"
                          : "border-white/10 hover:border-white/24"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                        {entry.city || "Unknown city"}{entry.country ? ` · ${entry.country}` : ""}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{entry.label || "Unnamed check-in"}</p>
                      {entry.address ? <p className="mt-1 text-xs text-white/62">{entry.address}</p> : null}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                        <span>{formatCheckinTime(entry.checkedInAt)}</span>
                        <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white/78">
                          {String(entry.mode).replaceAll("_", " ")}
                        </span>
                      </div>
                      {entry.note ? <p className="mt-1 text-xs text-white/62">{entry.note}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            startEditCheckin(entry);
                          }}
                          className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] text-cyan-100/90 transition hover:border-cyan-200/35"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteCheckin(entry);
                          }}
                          className="rounded-full border border-rose-200/24 bg-rose-200/10 px-3 py-1 text-[11px] text-rose-100/90 transition hover:border-rose-200/35"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/12 px-4 py-6 text-sm text-white/45">
                    <div className="mb-2 text-base">No check-ins in this filter yet.</div>
                    <button
                      type="button"
                      onClick={() => checkinFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-3 py-1.5 text-[11px] uppercase tracking-[0.11em] text-fuchsia-100 transition hover:border-fuchsia-200/45"
                    >
                      Create check-in
                    </button>
                  </div>
                )}
              </div>
              {followingCheckinsWarning && (
                <div className="mt-3 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                  {followingCheckinsWarning}
                </div>
              )}
              <div className="mt-4 border-t border-white/10 pt-4 lg:mt-3 lg:flex lg:min-h-0 lg:flex-col">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/78">Friends check-ins</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/52">
                  <span>
                    Showing {visibleRecentFollowingCheckins.length} of {recentFollowingCheckins.length}
                  </span>
                  {recentFollowingCheckins.length > 0 ? (
                    <button
                      type="button"
                      disabled={!hasMoreFriendCheckins}
                      onClick={() => {
                        if (hasMoreFriendCheckins) setShowAllFriendCheckins((current) => !current);
                      }}
                      className={`rounded-full border px-3 py-1 uppercase tracking-[0.11em] transition ${
                        hasMoreFriendCheckins
                          ? "border-white/16 bg-white/7 text-white/72 hover:border-white/24 hover:text-white"
                          : "cursor-default border-white/10 bg-white/5 text-white/40"
                      }`}
                      title={hasMoreFriendCheckins ? "Expand or collapse this list" : "No more items to expand"}
                    >
                      {hasMoreFriendCheckins ? (showAllFriendCheckins ? "Collapse" : "Show all") : "All visible"}
                    </button>
                  ) : null}
                </div>
                <div className={`mt-2 space-y-2 pr-1 ${showAllFriendCheckins ? "max-h-[320px] overflow-y-auto lg:max-h-[360px]" : ""}`}>
                  {visibleRecentFollowingCheckins.length > 0 ? (
                    visibleRecentFollowingCheckins.map((entry) => {
                      const presence = followingPresenceByUserId[String(entry.ownerUserId || "")] || null;
                      const activeNow = isPresenceActiveNow(presence);
                      return (
                        <article key={`friend-${entry.id}`} className="rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {entry.ownerName || "Member"}
                              </p>
                              <p className="mt-1 text-xs text-white/65">
                                {entry.label || "Unnamed check-in"} · {entry.city || "Unknown city"}
                              </p>
                              {entry.address ? <p className="mt-1 text-[11px] text-white/52">{entry.address}</p> : null}
                            </div>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                              activeNow
                                ? "border-emerald-200/30 bg-emerald-200/16 text-emerald-100"
                                : "border-white/16 bg-white/8 text-white/62"
                            }`}>
                              {activeNow ? "Active now" : "Offline"}
                            </span>
                          </div>
                          <p className="mt-2 text-[11px] text-white/55">{formatCheckinTime(entry.checkedInAt)}</p>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/12 px-4 py-6 text-sm text-white/45">
                      No friend check-ins yet. Follow members and their travel signal appears here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="hidden rounded-[34px] border border-emerald-200/16 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),linear-gradient(180deg,rgba(11,38,31,0.95),rgba(10,10,10,0.99))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.36)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/72">Profile (optional)</p>
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

        {showSignalDeck ? (
        <>
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
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/messages?user=${encodeURIComponent(String(profile.userId || ""))}&name=${encodeURIComponent(String(profile.displayName || "Member"))}`
                              )
                            }
                            className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/40"
                          >
                            Message
                          </button>
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
          <p className="mb-4 text-xs text-white/52">
            Mode changes how the engine weights trust, timing, and venue energy.
          </p>

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
        </>
        ) : null}

        <SavedPlacesPanel
          isAtlasLoading={isAtlasLoading}
          savedPlaces={savedPlaces}
          onOpenPlace={(place) => router.push(`/${place.city?.toLowerCase()}?placeId=${place.id}`)}
          onQuickCheckin={(place) => quickCheckinFromItem(place, "place")}
          onRemoveFavorite={removeFavorite}
          onExploreCities={() => router.push("/cities")}
          renderSkeleton={() => <FavoritesCardSkeleton />}
        />

        <SavedEventsPanel
          isAtlasLoading={isAtlasLoading}
          savedEvents={savedEvents}
          formatDate={formatDate}
          onOpenEvent={(event) => router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}`)}
          onQuickCheckin={(event) => quickCheckinFromItem(event, "event")}
          onRemoveFavorite={removeFavorite}
          onBrowseEvents={() => router.push("/events")}
          renderSkeleton={() => <FavoritesCardSkeleton />}
        />
        <section className="mt-8 rounded-[34px] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(244,114,182,0.10),transparent_26%),linear-gradient(180deg,rgba(10,28,38,0.95),rgba(10,10,10,0.99))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/75">Atlas insights</p>
              <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">Signal dashboard</h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Keep the page clean: core tools stay open, deeper community signal stays one tap away.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100/85">
                Week {weeklyDigest.weekLabel}
              </span>
              <button
                type="button"
                onClick={() => setShowSignalDeck((current) => !current)}
                className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-200/40"
              >
                {showSignalDeck ? "Hide deep signal" : "Open deep signal"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Network saves (7d)</p>
              <p className="mt-1 text-2xl font-semibold text-white">{weeklyDigest.followingThisWeekCount}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Upcoming in your cities</p>
              <p className="mt-1 text-2xl font-semibold text-white">{weeklyDigest.upcomingInSavedCities.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Cities to reach baseline</p>
              <p className="mt-1 text-2xl font-semibold text-white">{weeklyDigest.newCityTarget}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
