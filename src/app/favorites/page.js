"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "../signal-motion.css";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { useAuth } from "@/lib/auth";
import { cityConfig } from "@/lib/cities";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { subscribeBlockedItems, syncBlockedItemsFromCloud } from "@/lib/moderation";
import { getMemberProfile } from "@/lib/memberProfile";
import { getMemberTitleMeta } from "@/lib/communityRanking";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { trackKpiEvent } from "@/lib/analytics";
import { useActionToast } from "@/lib/useActionToast";
import { showActionFeedback } from "@/lib/actionFeedback";
import { LIVE_VIBE_OPTIONS, isMissingTableError as isMissingLiveVibeTableError } from "@/lib/liveVibe";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";
import { resolvePrimaryVibeKey, resolvePrimaryVibeLabel } from "@/lib/vibeDisplay";
import { formatVibeTagLabel, normalizeVibeTags } from "@/lib/vibeTaxonomy";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
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
import {
  buildCheckinMapEmbedUrl,
  buildFollowingCheckinMarkers,
  buildOpenStreetMapStaticUrl,
  buildStaticMapUrl,
  filterRecentCheckins,
  getCheckinCities,
  normalizeInvalidCheckinCity,
  pickDefaultCheckinCity,
  pickDefaultCheckinCountry,
  getSelectedCheckin,
  getSelectedCityEvents,
  getSelectedCityPlaces,
  resolveCheckinMapCenter,
  sortRecentFollowingCheckins,
} from "@/features/favorites/logic/checkinSelectors";
import {
  buildEditCheckinFormPatch,
  buildNextCheckin,
  mergeSavedCheckinIntoList,
  resolveDirectPlaceDbId,
  resolvePlaceDbIdFromLookupRows,
} from "@/features/favorites/logic/favoritesCheckins";
import {
  addFavoriteLocalState,
  addFollowingUserIdLocalState,
  buildAddedEntriesFromFavoriteRows,
  buildFavoriteIdsFromRows,
  buildLocalAddedEntries,
  buildQuickCheckinPayload,
  computeMissingFavorites,
  mergeFavoriteIds,
  normalizeFavoriteIds,
  removeFavoriteLocalState,
  removeFollowingLocalState,
  removePlanLocalState,
} from "@/features/favorites/logic/favoritesMutations";
import {
  buildProfileFormState,
  hasProfileFormChanges,
  resolveGreetingByHour,
  resolveMemberDisplayName,
  selectStoredProfile,
} from "@/features/favorites/logic/favoritesProfile";
import {
  buildBlockedLookup,
  hasTrustNetworkMissingTables,
  mapFollowingCheckinsWithOwnerNames,
  mapPresenceByUserId,
  mapProfileDisplayNamesByUserId,
  mergeTrustMembersWithProfileRows,
  normalizeCheckins,
  normalizeTrustNetworkRows,
  normalizeFollowingTargetIds,
} from "@/features/favorites/logic/favoritesNetwork";
import {
  buildCityCountryLookup,
  buildCityLabelLookup,
  computeAllCities,
  computeCheckinCityOptions,
  computeCheckinCountryOptions,
  computeRecentCheckins,
  computeRecentSaves,
  computeSavedEvents,
  computeSavedPlaces,
  computeThisWeekAdds,
  computeTopVibe,
} from "@/features/favorites/logic/favoritesSummary";
import {
  computeContributionCountsFromCollections,
  computeForYouRecommendations,
  computeFollowingFeedItems,
  computeFollowingProfiles,
  computeMomentumMilestones,
  computePlannerCities,
  computeSuggestedMembers,
} from "@/features/favorites/logic/favoritesInsights";
import {
  buildCheckinMarkerById,
  buildCheckinMarkers,
  resolveCheckinFocusCoordinates,
} from "@/features/favorites/checkinMapGuards";
import {
  FAVORITES_CHECKIN_LIST_SCROLL_CLASS,
  FAVORITES_FRIENDS_CHECKIN_LIST_SCROLL_CLASS,
} from "@/features/favorites/favoritesUiConstants";
import ActionToast from "@/components/ui/ActionToast";
import PageOpeningState from "@/components/ui/PageOpeningState";
import FavoritesCardSkeleton from "@/components/favorites/FavoritesCardSkeleton";
import FavoritesMomentumPanel from "@/components/favorites/FavoritesMomentumPanel";
import FavoritesPeopleSignalPanel from "@/components/favorites/FavoritesPeopleSignalPanel";
import FavoritesForYouPanel from "@/components/favorites/FavoritesForYouPanel";
import { useFavoritesStateController } from "@/features/favorites/useFavoritesStateController";

const TripPlannerV2 = dynamic(() => import("@/components/planner/TripPlannerV2"), {
  loading: () => <FavoritesCardSkeleton />,
});
const SavedEventsPanel = dynamic(() => import("@/components/favorites/SavedEventsPanel"), {
  loading: () => <FavoritesCardSkeleton />,
});

const CHECKIN_VIBE_COOLDOWN_MS = 30 * 1000;
const FAVORITES_PROFILE_EXTRAS_STORAGE_KEY = "qa_favorites_profile_extras_v1";
const FAVORITES_CALENDAR_REMINDER_STORAGE_KEY = "qa_favorites_calendar_reminders_v1";
const FAVORITES_CALENDAR_LAST_ALERT_DAY_STORAGE_KEY = "qa_favorites_calendar_last_alert_day_v1";
const MEMBER_AVATAR_BUCKET = "member-avatars";

function isAvatarColumnMissingError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  if (code === "42703" || code === "PGRST204") return true;
  if (!message) return false;
  const mentionsAvatarField =
    message.includes("avatar_url") ||
    message.includes("avatar_path");
  return mentionsAvatarField && (message.includes("does not exist") || message.includes("schema cache"));
}

function resolveAvatarUrlFromRow(row) {
  const direct = String(row?.avatar_url || "").trim();
  if (direct) return direct;
  const path = String(row?.avatar_path || "").trim();
  if (!path) return "";
  return supabase.storage.from(MEMBER_AVATAR_BUCKET).getPublicUrl(path)?.data?.publicUrl || "";
}

function sanitizeProfileExtras(raw = {}) {
  return {
    about: String(raw?.about || "").slice(0, 160),
    visibility: ["friends", "members", "public"].includes(String(raw?.visibility || "members"))
      ? String(raw?.visibility || "members")
      : "members",
    birthday: String(raw?.birthday || "").slice(0, 20),
    vibe: String(raw?.vibe || "").slice(0, 80),
    phone: String(raw?.phone || "").slice(0, 40),
    contactEmail: String(raw?.contactEmail || "").slice(0, 120),
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const isMapboxStylesReady = useMapboxStylesheet();
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
    updateMemberAvatar,
  } = useAuth();
  const { toast, showToast } = useActionToast();
  const [activeFavoritesIntent, setActiveFavoritesIntent] = useState("go_out_tonight");
  const [showSecondaryPanels, setShowSecondaryPanels] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("about");
  const [myMapView, setMyMapView] = useState("checkins");
  const [calendarReminderByEventId, setCalendarReminderByEventId] = useState(() =>
    readLocalJson(FAVORITES_CALENDAR_REMINDER_STORAGE_KEY, {})
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [profileExtras, setProfileExtras] = useState({
    about: "",
    visibility: "members",
    birthday: "",
    vibe: "",
    phone: "",
    contactEmail: "",
  });
  const [profileAvatarDataUrl, setProfileAvatarDataUrl] = useState("");
  const [profileAvatarLoadFailed, setProfileAvatarLoadFailed] = useState(false);
  const [friendAvatarByUserId, setFriendAvatarByUserId] = useState({});
  const tonightSectionRef = useRef(null);
  const tripSectionRef = useRef(null);
  const pulseSectionRef = useRef(null);
  const avatarFileInputRef = useRef(null);

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
      const localFavoriteIds = normalizeFavoriteIds(localFavorites);
      setFavorites(localFavoriteIds);
      setAdded(buildLocalAddedEntries(localFavoriteIds));
      setPlans(localPlans || []);
      return;
    }

    const remoteFavorites = buildFavoriteIdsFromRows(favoritesRes.data || []);
    const remoteAdded = buildAddedEntriesFromFavoriteRows(favoritesRes.data || []);
    const remotePlans = (plansRes.data || []).map(mapPlanRow);

    const localFavsNormalized = normalizeFavoriteIds(localFavorites);
    const missingFavorites = computeMissingFavorites({
      localFavoriteIds: localFavsNormalized,
      remoteFavoriteIds: remoteFavorites,
    });

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

    const mergedFavorites = mergeFavoriteIds(remoteFavorites, localFavsNormalized);
    setFavorites(mergedFavorites);
    setAdded(
      remoteAdded.length > 0
        ? remoteAdded
        : buildLocalAddedEntries(mergedFavorites)
    );
    setPlans(remotePlans.length > 0 ? remotePlans : localPlans || []);

    writeLocalJson(FAVORITES_STORAGE_KEY, mergedFavorites);
    writeLocalJson(ADDED_STORAGE_KEY, remoteAdded);
    writeLocalJson(PLAN_STORAGE_KEY, remotePlans.length > 0 ? remotePlans : localPlans || []);
  }, [setAdded, setFavorites, setPlans, setSyncWarning]);

  const loadAtlasData = useCallback(async () => {
    setIsAtlasLoading(true);
    setAtlasLoadError("");

    const [placesRes, { data: eventsData, error: eventsError }] = await Promise.all([
      fetchPlacesForAtlas(),
      supabase.from("events").select("*"),
    ]);
    const placesData = placesRes?.data || [];
    const placesError = placesRes?.error || null;

    if (placesError || eventsError) {
      setAtlasLoadError("Could not load some live atlas data. Showing available signal.");
    }

    setPlaces(placesData);
    setEvents(await mergeSeedEventsAsync(eventsData || []));
    setIsAtlasLoading(false);
  }, [setAtlasLoadError, setEvents, setIsAtlasLoading, setPlaces]);

  const loadCheckins = useCallback(async () => {
    const localRows = readLocalJson(CHECKINS_STORAGE_KEY, []);
    const localMapped = normalizeCheckins(localRows, mapCheckinRow);
    if (localMapped.length > 0) {
      setCheckins(localMapped);
    }

    if (!user?.id) {
      setCheckins(localMapped);
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
      setCheckins(localMapped);
      return;
    }

    const mapped = normalizeCheckins(data, mapCheckinRow);
    setCheckins(mapped);
    writeLocalJson(CHECKINS_STORAGE_KEY, mapped);
    setCheckinsWarning("");
  }, [setCheckins, setCheckinsWarning, user?.id]);

  const loadFollowingCheckins = useCallback(async () => {
    if (!user?.id || !Array.isArray(followingUserIds) || followingUserIds.length === 0) {
      setFollowingCheckins([]);
      setFollowingPresenceByUserId({});
      setFriendAvatarByUserId({});
      setFollowingCheckinsWarning("");
      return;
    }

    const targetIds = normalizeFollowingTargetIds(followingUserIds);
    if (targetIds.length === 0) {
      setFollowingCheckins([]);
      setFollowingPresenceByUserId({});
      setFriendAvatarByUserId({});
      setFollowingCheckinsWarning("");
      return;
    }

    const [checkinsRes, presenceRes] = await Promise.all([
      supabase
        .from("qa_member_checkins")
        .select("id, user_id, mode, privacy, country, city, label, address, note, place_id, event_id, lat, lng, checked_in_at, created_at")
        .in("user_id", targetIds)
        .neq("privacy", "private")
        .order("checked_in_at", { ascending: false })
        .limit(150),
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

    let profileRows = [];
    const profilesWithAvatarRes = await supabase
      .from("member_profiles")
      .select("user_id, display_name, avatar_url, avatar_path")
      .in("user_id", targetIds);

    if (profilesWithAvatarRes.error && isAvatarColumnMissingError(profilesWithAvatarRes.error)) {
      const fallbackProfilesRes = await supabase
        .from("member_profiles")
        .select("user_id, display_name, avatar_path")
        .in("user_id", targetIds);
      profileRows = Array.isArray(fallbackProfilesRes.data) ? fallbackProfilesRes.data : [];
    } else {
      profileRows = Array.isArray(profilesWithAvatarRes.data) ? profilesWithAvatarRes.data : [];
    }

    const profileByUserId = mapProfileDisplayNamesByUserId(profileRows);
    const avatarByUserId = {};
    profileRows.forEach((row) => {
      const key = String(row?.user_id || "").trim();
      const avatar = resolveAvatarUrlFromRow(row);
      if (!key || !avatar) return;
      avatarByUserId[key] = avatar;
    });
    setFriendAvatarByUserId(avatarByUserId);
    const presenceMap = mapPresenceByUserId(presenceRes.data);
    setFollowingPresenceByUserId(presenceMap);

    const mapped = mapFollowingCheckinsWithOwnerNames({
      checkinRows: checkinsRes.data,
      displayNameByUserId: profileByUserId,
      mapCheckinRow,
    });

    setFollowingCheckins(mapped);
    setFollowingCheckinsWarning("");
  }, [followingUserIds, setFollowingCheckins, setFollowingCheckinsWarning, setFollowingPresenceByUserId, user?.id]);

  const blocked = useMemo(() => {
    return buildBlockedLookup(blockedItems);
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
    let active = true;

    queueMicrotask(async () => {
      if (!active) return;
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
      const storedProfile = selectStoredProfile({
        memberProfile,
        fallbackProfile: getMemberProfile(),
      });

      setMemberName(authMemberName || fallbackName);
      setProfileForm(
        buildProfileFormState({
          storedProfile,
          authMemberName,
          fallbackName,
        })
      );
      if (user?.id) {
        await loadMemberCollections(user.id, storedFavorites, storedPlans);
      } else {
        setFavorites((storedFavorites || []).map((item) => String(item)));
        setAdded(readLocalJson(ADDED_STORAGE_KEY, []));
        setPlans(storedPlans);
      }

      setIsReady(true);
      queueMicrotask(async () => {
        await Promise.all([loadAtlasData(), loadCheckins()]);
      });
    });
    return () => {
      active = false;
    };
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

    const leaderboardWithAvatarPromise = supabase
      .from("qa_member_leaderboard")
      .select("user_id, display_name, title, rank, avatar_url, avatar_path")
      .order("rank", { ascending: true })
      .limit(80);
    const [leaderboardResRaw, followingRes, feedRes] = await Promise.all([
      leaderboardWithAvatarPromise,
      supabase
        .from("member_following")
        .select("followed_user_id")
        .eq("follower_user_id", user.id),
      supabase.rpc("qa_following_feed_favorites", { feed_limit: 40 }),
    ]);
    let leaderboardRes = leaderboardResRaw;
    if (leaderboardResRaw.error && isAvatarColumnMissingError(leaderboardResRaw.error)) {
      leaderboardRes = await supabase
        .from("qa_member_leaderboard")
        .select("user_id, display_name, title, rank")
        .order("rank", { ascending: true })
        .limit(80);
    }

    const missingTable = hasTrustNetworkMissingTables({
      followingError: followingRes.error,
      feedError: feedRes.error,
      isMissingTableError,
    });

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

    const trustNetworkRows = normalizeTrustNetworkRows({
      leaderboardRows: leaderboardRes.data,
      followingRows: followingRes.data,
      feedRows: feedRes.data,
    });

    const followedTargetIds = normalizeFollowingTargetIds(trustNetworkRows.followingUserIds);
    let followedProfileRows = [];
    if (followedTargetIds.length > 0) {
      let followedProfilesRes = await supabase
        .from("member_profiles")
        .select("user_id, display_name, avatar_url, avatar_path")
        .in("user_id", followedTargetIds);

      if (followedProfilesRes.error && isAvatarColumnMissingError(followedProfilesRes.error)) {
        followedProfilesRes = await supabase
          .from("member_profiles")
          .select("user_id, display_name, avatar_path")
          .in("user_id", followedTargetIds);
      }

      if (!followedProfilesRes.error) {
        followedProfileRows = Array.isArray(followedProfilesRes.data) ? followedProfilesRes.data : [];
      }
    }

    const mergedMembers = mergeTrustMembersWithProfileRows({
      leaderboardMembers: trustNetworkRows.members,
      followedProfileRows,
    });

    setNetworkMembers(mergedMembers);
    setFollowingUserIds(trustNetworkRows.followingUserIds);
    setFollowingFeedRows(trustNetworkRows.feedRows);
    setNetworkLoading(false);
  }, [isMember, setFollowingFeedRows, setFollowingUserIds, setNetworkLoading, setNetworkMembers, setNetworkWarning, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember || !user?.id) return;
    let timeoutId = null;
    let cancelled = false;

    const run = () => {
      queueMicrotask(async () => {
        if (cancelled) return;
        await loadTrustNetwork();
      });
    };

    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(run, { timeout: 1800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }

    timeoutId = window.setTimeout(run, 900);
    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isReady, isMember, loadTrustNetwork, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember || !user?.id) return;
    let timeoutId = null;
    let cancelled = false;

    const run = () => {
      queueMicrotask(async () => {
        if (cancelled) return;
        await loadFollowingCheckins();
      });
    };

    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(run, { timeout: 2200 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }

    timeoutId = window.setTimeout(run, 1300);
    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isReady, isMember, loadFollowingCheckins, user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(FAVORITES_PROFILE_EXTRAS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setProfileExtras(sanitizeProfileExtras(parsed));
    } catch {
      // Ignore malformed local profile extras payload.
    }
  }, []);

  useEffect(() => {
    const remoteExtras = sanitizeProfileExtras({
      about: memberProfile?.about,
      visibility: memberProfile?.visibility,
      birthday: memberProfile?.birthday,
      vibe: memberProfile?.vibe,
      phone: memberProfile?.phone,
      contactEmail: memberProfile?.contactEmail,
    });
    setProfileExtras((current) => {
      const next = {
        about: remoteExtras.about || current.about || "",
        visibility: remoteExtras.visibility || current.visibility || "members",
        birthday: remoteExtras.birthday || current.birthday || "",
        vibe: remoteExtras.vibe || current.vibe || "",
        phone: remoteExtras.phone || current.phone || "",
        contactEmail: remoteExtras.contactEmail || current.contactEmail || "",
      };
      return next;
    });
  }, [
    memberProfile?.about,
    memberProfile?.visibility,
    memberProfile?.birthday,
    memberProfile?.vibe,
    memberProfile?.phone,
    memberProfile?.contactEmail,
  ]);

  useEffect(() => {
    const remoteAvatar = String(memberProfile?.avatarUrl || "").trim();
    setProfileAvatarDataUrl(remoteAvatar || "");
  }, [memberProfile?.avatarUrl]);

  useEffect(() => {
    setProfileAvatarLoadFailed(false);
  }, [profileAvatarDataUrl]);

  const favoriteIdSet = useMemo(
    () => new Set((favorites || []).map((item) => String(item))),
    [favorites]
  );

  const savedPlaces = useMemo(() => {
    return computeSavedPlaces({
      places,
      favoriteIdSet,
      blockedPlaceIds: blocked.places,
    });
  }, [blocked.places, favoriteIdSet, places]);

  const savedEvents = useMemo(() => {
    return computeSavedEvents({
      events,
      favoriteIdSet,
      blockedEventIds: blocked.events,
    });
  }, [blocked.events, events, favoriteIdSet]);
  const calendarEvents = useMemo(() => {
    return [...savedEvents]
      .map((event) => {
        const parsed = new Date(event?.date || "");
        return {
          ...event,
          calendarDate: parsed,
          calendarTime: parsed.getTime(),
        };
      })
      .filter((event) => Number.isFinite(event.calendarTime))
      .sort((a, b) => a.calendarTime - b.calendarTime);
  }, [savedEvents]);
  const todayDateKey = useMemo(() => {
    const referenceTs = Number(nowTs || Date.now());
    return new Date(referenceTs).toISOString().slice(0, 10);
  }, [nowTs]);
  const todayCalendarEvents = useMemo(
    () =>
      calendarEvents.filter((event) => {
        const eventDateKey = event.calendarDate.toISOString().slice(0, 10);
        return eventDateKey === todayDateKey;
      }),
    [calendarEvents, todayDateKey]
  );
  const upcomingCalendarEvents = useMemo(
    () =>
      calendarEvents.filter((event) => {
        const eventDateKey = event.calendarDate.toISOString().slice(0, 10);
        return eventDateKey > todayDateKey;
      }),
    [calendarEvents, todayDateKey]
  );

  const totalPlaces = savedPlaces.length;
  const totalEvents = savedEvents.length;
  const cityCountryLookup = useMemo(() => {
    return buildCityCountryLookup({
      cityConfig,
      places,
      events,
      normalizeCityKey,
    });
  }, [events, places]);

  const cityLabelLookup = useMemo(() => {
    return buildCityLabelLookup({
      cityConfig,
      places,
      events,
      normalizeCityKey,
      formatCityLabel,
    });
  }, [events, places]);

  const allCities = useMemo(
    () => computeAllCities({ savedPlaces, savedEvents, normalizeCityKey, cityLabelLookup, formatCityLabel }),
    [cityLabelLookup, savedEvents, savedPlaces]
  );
  const totalCities = allCities.length;

  const checkinCountryOptions = useMemo(() => {
    return computeCheckinCountryOptions({
      cityCountryLookup,
      residentCountry: memberProfile?.residentCountry || "",
    });
  }, [cityCountryLookup, memberProfile?.residentCountry]);

  const checkinCityOptions = useMemo(() => {
    return computeCheckinCityOptions({
      cityCountryLookup,
      cityLabelLookup,
      selectedCountry: checkinForm.country || "",
      formatCityLabel,
    });
  }, [checkinForm.country, cityCountryLookup, cityLabelLookup]);

  useEffect(() => {
    const nextCountry = pickDefaultCheckinCountry({
      currentCountry: checkinForm.country,
      residentCountry: memberProfile?.residentCountry,
      homeCity: memberProfile?.homeCity,
      cityCountryLookup,
      normalizeCityKey,
      checkinCountryOptions,
    });
    if (nextCountry === null) return;
    setCheckinForm((current) => ({ ...current, country: String(nextCountry) }));
  }, [checkinCountryOptions, checkinForm.country, cityCountryLookup, memberProfile?.homeCity, memberProfile?.residentCountry, setCheckinForm]);

  useEffect(() => {
    const nextCity = pickDefaultCheckinCity({
      currentCity: checkinForm.city,
      homeCity: memberProfile?.homeCity,
      checkinCityOptions,
      formatCityLabel,
    });
    if (nextCity === null) return;
    setCheckinForm((current) => ({ ...current, city: String(nextCity) }));
  }, [checkinCityOptions, checkinForm.city, memberProfile?.homeCity, setCheckinForm]);

  useEffect(() => {
    const normalizedCity = normalizeInvalidCheckinCity({
      currentCity: checkinForm.city,
      checkinCityOptions,
    });
    if (normalizedCity === null) return;
    setCheckinForm((current) => ({
      ...current,
      city: normalizedCity,
      sourceId: "",
      label: "",
      address: "",
    }));
  }, [checkinCityOptions, checkinForm.city, setCheckinForm]);

  const { topVibeKey, topVibe } = useMemo(
    () => computeTopVibe({ savedPlaces, resolvePrimaryVibeKey, resolvePrimaryVibeLabel }),
    [savedPlaces]
  );
  const recentSaves = useMemo(
    () => computeRecentSaves({ added, events, places }),
    [added, events, places]
  );
  const thisWeekAdds = useMemo(() => computeThisWeekAdds(added), [added]);

  const recentCheckins = useMemo(
    () => computeRecentCheckins(checkins, 10),
    [checkins]
  );

  const filteredRecentCheckins = useMemo(() => {
    return filterRecentCheckins(recentCheckins, checkinViewFilter);
  }, [checkinViewFilter, recentCheckins]);

  const recentFollowingCheckins = useMemo(
    () => sortRecentFollowingCheckins(followingCheckins),
    [followingCheckins]
  );

  const checkinCities = useMemo(
    () => getCheckinCities(checkins),
    [checkins]
  );
  const savedPlaceCities = useMemo(() => {
    return new Set((savedPlaces || []).map((place) => normalizeCityKey(place?.city)).filter(Boolean)).size;
  }, [savedPlaces]);

  const selectedCheckinCityKey = useMemo(() => normalizeCityKey(checkinForm.city), [checkinForm.city]);

  const selectedCityPlaces = useMemo(
    () => getSelectedCityPlaces({ places, selectedCheckinCityKey, normalizeCityKey }),
    [places, selectedCheckinCityKey]
  );

  const selectedCityEvents = useMemo(
    () => getSelectedCityEvents({ events, selectedCheckinCityKey, normalizeCityKey }),
    [events, selectedCheckinCityKey]
  );

  const savedPlaceMapMarkers = useMemo(() => {
    return (savedPlaces || [])
      .filter((place) => Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lng)))
      .map((place) => ({
        id: `saved-${String(place.id || "")}`,
        label: String(place.name || "Saved place"),
        city: String(place.city || ""),
        country: "",
        checkedInAt: String(place.addedAt || place.updatedAt || ""),
        markerLat: Number(place.lat),
        markerLng: Number(place.lng),
      }));
  }, [savedPlaces]);

  const checkinMarkers = useMemo(
    () => (
      myMapView === "saved"
        ? savedPlaceMapMarkers
        : buildCheckinMarkers({
            checkins: filteredRecentCheckins,
            atlasPlaces: places,
            atlasEvents: events,
            savedPlaces,
            savedEvents,
          })
    ),
    [events, filteredRecentCheckins, myMapView, places, savedEvents, savedPlaceMapMarkers, savedPlaces]
  );

  const followingCheckinMarkers = useMemo(
    () => buildFollowingCheckinMarkers([]),
    []
  );

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

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
    return getSelectedCheckin(checkinMarkers, selectedCheckinId);
  }, [checkinMarkers, selectedCheckinId]);

  const checkinMarkerById = useMemo(() => buildCheckinMarkerById(checkinMarkers), [checkinMarkers]);

  const checkinMapCenter = useMemo(() => {
    return resolveCheckinMapCenter({
      checkinMarkers,
      followingCheckinMarkers,
      savedPlaces,
      savedEvents,
    });
  }, [checkinMarkers, followingCheckinMarkers, savedEvents, savedPlaces]);

  const staticMapUrl = useMemo(() => {
    return buildStaticMapUrl({
      checkinMapCenter,
      checkinMarkers,
      followingCheckinMarkers,
      token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    });
  }, [checkinMapCenter, checkinMarkers, followingCheckinMarkers]);

  const checkinMapEmbedUrl = useMemo(() => {
    return buildCheckinMapEmbedUrl(checkinMapCenter);
  }, [checkinMapCenter]);

  const openStreetMapStaticUrl = useMemo(() => {
    return buildOpenStreetMapStaticUrl(checkinMapCenter);
  }, [checkinMapCenter]);

  useEffect(() => {
    setSelectedCheckinId(null);
  }, [myMapView, setSelectedCheckinId]);

  useEffect(() => {
    const isMapTabActive = activeProfileTab === "map";
    if (!isMapTabActive) {
      if (checkinMapRef.current) {
        checkinMapMarkersRef.current.forEach((marker) => marker.remove());
        checkinMapMarkersRef.current = [];
        checkinMapRef.current.remove();
        checkinMapRef.current = null;
      }
      return;
    }

    if (!isMapboxStylesReady || !mapboxToken || !checkinMapContainerRef.current || checkinMapRef.current) return;

    mapboxgl.accessToken = mapboxToken;
    const center = checkinMapCenter
      ? [Number(checkinMapCenter.lng), Number(checkinMapCenter.lat)]
      : [11, 20];
    const zoom = checkinMapCenter ? 4.2 : 2;
    const map = new mapboxgl.Map({
      container: checkinMapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      map.resize();
    });
    checkinMapRef.current = map;

    return () => {
      checkinMapMarkersRef.current.forEach((marker) => marker.remove());
      checkinMapMarkersRef.current = [];
      map.remove();
      checkinMapRef.current = null;
    };
  }, [
    checkinMapCenter,
    checkinMapContainerRef,
    checkinMapMarkersRef,
    checkinMapRef,
    activeProfileTab,
    isMapboxStylesReady,
    mapboxToken,
  ]);

  useEffect(() => {
    const isMapTabActive = activeProfileTab === "map";
    if (!isMapTabActive) return;
    const map = checkinMapRef.current;
    if (!map) return;
    const raf = window.requestAnimationFrame(() => {
      map.resize();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [activeProfileTab, checkinMapRef, myMapView]);

  useEffect(() => {
    const map = checkinMapRef.current;
    if (!map) return;

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
  const memberDisplayNameById = useMemo(() => {
    const map = new Map();
    (networkMembers || []).forEach((member) => {
      const key = String(member?.user_id || member?.id || "").trim();
      if (!key) return;
      const name = String(member?.display_name || member?.displayName || "").trim();
      if (!name) return;
      map.set(key, name);
    });
    return map;
  }, [networkMembers]);
  const memberAvatarById = useMemo(() => {
    const map = new Map();
    (networkMembers || []).forEach((member) => {
      const key = String(member?.user_id || member?.id || "").trim();
      if (!key) return;
      const avatar = resolveAvatarUrlFromRow(member) || String(member?.avatarUrl || "").trim();
      if (!avatar) return;
      map.set(key, avatar);
    });
    return map;
  }, [networkMembers]);
  const followingFeedNameById = useMemo(() => {
    const map = new Map();
    (followingFeedRows || []).forEach((row) => {
      const key = String(row?.owner_user_id || "").trim();
      if (!key || map.has(key)) return;
      const name = String(row?.display_name || "").trim();
      if (!name || name.toLowerCase() === "member") return;
      map.set(key, name);
    });
    return map;
  }, [followingFeedRows]);
  const followingFeedAvatarById = useMemo(() => {
    const map = new Map();
    (followingFeedRows || []).forEach((row) => {
      const key = String(row?.owner_user_id || "").trim();
      if (!key || map.has(key)) return;
      const avatar = resolveAvatarUrlFromRow(row);
      if (!avatar) return;
      map.set(key, avatar);
    });
    return map;
  }, [followingFeedRows]);
  const followingCheckinNameById = useMemo(() => {
    const map = new Map();
    (followingCheckins || []).forEach((row) => {
      const key = String(row?.ownerUserId || "").trim();
      if (!key || map.has(key)) return;
      const name = String(row?.ownerName || "").trim();
      if (!name || name.toLowerCase() === "member") return;
      map.set(key, name);
    });
    return map;
  }, [followingCheckins]);

  const placesById = useMemo(() => {
    const map = new Map();
    (places || []).forEach((entry) => {
      const key = String(entry?.id || "");
      if (!key) return;
      map.set(key, entry);
    });
    return map;
  }, [places]);

  const eventsById = useMemo(() => {
    const map = new Map();
    (events || []).forEach((entry) => {
      const key = String(entry?.id || "");
      if (!key) return;
      map.set(key, entry);
    });
    return map;
  }, [events]);

  const suggestedMembers = useMemo(() => {
    if (!showSignalDeck && activeProfileTab !== "friends") return [];
    return computeSuggestedMembers(networkMembers, user?.id);
  }, [activeProfileTab, networkMembers, showSignalDeck, user?.id]);

  const followingFeedItems = useMemo(() => {
    return computeFollowingFeedItems({
      followingFeedRows,
      eventsById,
      placesById,
    });
  }, [eventsById, followingFeedRows, placesById]);

  const followingProfiles = useMemo(() => {
    if (!showSignalDeck && activeProfileTab !== "friends") return [];
    return computeFollowingProfiles({
      followingUserIds,
      followingFeedRows,
      networkMembers,
    });
  }, [activeProfileTab, followingFeedRows, followingUserIds, networkMembers, showSignalDeck]);
  const followingProfileNameByUserId = useMemo(() => {
    const map = new Map();
    (followingProfiles || []).forEach((profile) => {
      const key = String(profile?.userId || "").trim();
      const name = String(profile?.displayName || "").trim();
      if (!key || !name || name.toLowerCase() === "member") return;
      map.set(key, name);
    });
    return map;
  }, [followingProfiles]);

  const forYouRecommendations = useMemo(() => {
    if (!showSignalDeck) return [];
    return computeForYouRecommendations({
      recommendationMode,
      blockedEvents: blocked.events,
      blockedPlaces: blocked.places,
      events,
      favoriteIdSet,
      followingFeedItems,
      places,
      savedPlaces,
      normalizeCityKey,
      resolvePrimaryVibeKey,
      resolvePrimaryVibeLabel,
      formatDate,
    });
  }, [blocked.events, blocked.places, events, favoriteIdSet, followingFeedItems, places, recommendationMode, savedPlaces, showSignalDeck]);

  const momentumMilestones = useMemo(() => {
    return computeMomentumMilestones({
      checkins,
      totalPlaces,
      normalizeCityKey,
    });
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

    return computeContributionCountsFromCollections({
      stories,
      guides,
      ideas,
      topics,
      memberIdentity: memberProfile?.displayName || authMemberName || memberName || "",
    });
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

  const saveAboutProfile = async (event) => {
    event.preventDefault();
    const sanitizedExtras = sanitizeProfileExtras(profileExtras);
    const result = await updateMemberProfile({
      ...profileForm,
      ...sanitizedExtras,
    });
    setProfileExtras(sanitizedExtras);
    writeLocalJson(FAVORITES_PROFILE_EXTRAS_STORAGE_KEY, sanitizedExtras);
    if (result?.ok) {
      showToast("Profile updated.", { tone: "ok", duration: 2200 });
    } else {
      showToast("Profile saved locally. Cloud sync unavailable.", { tone: "info", duration: 2400 });
    }
    setIsEditingAbout(false);
    setIsEditingProfile(false);
  };

  const openAvatarEditor = () => {
    avatarFileInputRef.current?.click();
  };

  const onProfileAvatarSelected = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    if (!String(file.type || "").startsWith("image/")) {
      showToast("Please choose an image file.", { tone: "warn", duration: 2200 });
      return;
    }
    if (Number(file.size || 0) > 5 * 1024 * 1024) {
      showToast("Image is too large. Max 5MB.", { tone: "warn", duration: 2200 });
      return;
    }
    if (typeof updateMemberAvatar !== "function") {
      showToast("Avatar upload is unavailable.", { tone: "warn", duration: 2200 });
      return;
    }

    const result = await updateMemberAvatar(file);
    if (!result?.ok) {
      showToast("Could not update image right now. Try again.", { tone: "warn", duration: 2200 });
      return;
    }

    const syncedAvatar = String(result?.avatarUrl || "").trim();
    if (syncedAvatar) {
      setProfileAvatarDataUrl(syncedAvatar);
    }
    showToast("Profile image updated.", { tone: "ok", duration: 1800 });
  };

  const hasProfileChanges = hasProfileFormChanges(profileForm, memberProfile || {});
  const greeting = resolveGreetingByHour();
  const displayName = resolveMemberDisplayName(memberName);
  const memberTitleMeta = getMemberTitleMeta(memberRank?.title || "");
  const displayInitials = useMemo(() => {
    const parts = String(displayName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    if (parts.length === 0) return "QA";
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }, [displayName]);
  const plannerCities = useMemo(() => {
    const configCities = Object.values(cityConfig).map((item) => item.title?.replace("Queer ", "")).filter(Boolean);
    return computePlannerCities({ configCities, places, events });
  }, [events, places]);
  const isGoOutTonightIntent = activeFavoritesIntent === "go_out_tonight";
  const isPlanTripIntent = activeFavoritesIntent === "plan_a_trip";
  const isFriendPulseIntent = activeFavoritesIntent === "check_friend_pulse";
  const isProfileAboutTab = activeProfileTab === "about";
  const isProfileActivityTab = false;
  const isProfileMapTab = activeProfileTab === "map";
  const isProfileTripsTab = activeProfileTab === "trips";
  const isProfileFriendsTab = activeProfileTab === "friends";
  const isProfileCalendarTab = activeProfileTab === "calendar";
  const isCompactCheckinSection = showSecondaryPanels && !isGoOutTonightIntent;
  const isCompactTripSection = showSecondaryPanels && !isPlanTripIntent;
  const isCompactPulseSection = showSecondaryPanels && !isFriendPulseIntent;
  const showCheckinSection = isProfileMapTab;
  const showTripSection = isProfileTripsTab;
  const showPulseSection = isProfileFriendsTab;
  const showCalendarSection = isProfileCalendarTab;
  const primaryIntentCtaLabel = isGoOutTonightIntent
    ? "Start check-in now"
    : isPlanTripIntent
      ? "Open trip planner"
      : "Open friend pulse";

  const openIntentView = useCallback(
    (nextIntent) => {
      const nextTab =
        nextIntent === "plan_a_trip"
          ? "trips"
          : nextIntent === "check_friend_pulse"
            ? "friends"
            : "map";
      setActiveProfileTab(nextTab);
      if (nextIntent === "go_out_tonight") {
        setMyMapView("checkins");
      }
      setActiveFavoritesIntent(nextIntent);
      setShowSecondaryPanels(false);
      if (nextIntent === "check_friend_pulse") {
        setShowSignalDeck(true);
      }
      const targetRef =
        nextIntent === "go_out_tonight"
          ? tonightSectionRef
          : nextIntent === "plan_a_trip"
            ? tripSectionRef
            : pulseSectionRef;
      window.setTimeout(() => {
        targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 20);
    },
    [setShowSignalDeck]
  );

  const resolveFriendDisplayName = useCallback((userId, fallbackName = "") => {
    const key = String(userId || "").trim();
    const profileListName = String(followingProfileNameByUserId.get(key) || "").trim();
    const profileName = String(memberDisplayNameById.get(key) || "").trim();
    const feedName = String(followingFeedNameById.get(key) || "").trim();
    const checkinName = String(followingCheckinNameById.get(key) || "").trim();
    const fallback = String(fallbackName || "").trim();
    return (
      (profileListName && profileListName.toLowerCase() !== "member" && profileListName) ||
      (profileName && profileName.toLowerCase() !== "member" && profileName) ||
      (feedName && feedName.toLowerCase() !== "member" && feedName) ||
      (checkinName && checkinName.toLowerCase() !== "member" && checkinName) ||
      (fallback && fallback.toLowerCase() !== "member" && fallback) ||
      "Member"
    );
  }, [followingCheckinNameById, followingFeedNameById, followingProfileNameByUserId, memberDisplayNameById]);

  const focusSavedPlaceOnMap = useCallback((place) => {
    if (!place) return;
    const markerId = `saved-${String(place.id || "")}`;
    setSelectedCheckinId(markerId);
    const lat = Number(place.lat);
    const lng = Number(place.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const map = checkinMapRef.current;
    if (!map) return;
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 12), essential: true });
  }, [checkinMapRef, setSelectedCheckinId]);

  useEffect(() => {
    if (activeProfileTab === "friends" && !showSignalDeck) {
      setShowSignalDeck(true);
    }
  }, [activeProfileTab, setShowSignalDeck, showSignalDeck]);

  useEffect(() => {
    writeLocalJson(FAVORITES_CALENDAR_REMINDER_STORAGE_KEY, calendarReminderByEventId || {});
  }, [calendarReminderByEventId]);

  useEffect(() => {
    if (activeProfileTab !== "calendar") return;
    const todayWithReminder = todayCalendarEvents.filter((event) => {
      const mode = String(calendarReminderByEventId?.[String(event.id)] || "off");
      return mode === "day_of";
    });
    if (todayWithReminder.length === 0) return;
    const lastShownDay = String(
      readLocalJson(FAVORITES_CALENDAR_LAST_ALERT_DAY_STORAGE_KEY, "") || ""
    );
    if (lastShownDay === todayDateKey) return;
    showToast(
      `You have ${todayWithReminder.length} saved event reminder${
        todayWithReminder.length > 1 ? "s" : ""
      } today.`,
      { tone: "info", duration: 2800 }
    );
    writeLocalJson(FAVORITES_CALENDAR_LAST_ALERT_DAY_STORAGE_KEY, todayDateKey);
  }, [activeProfileTab, calendarReminderByEventId, showToast, todayCalendarEvents, todayDateKey]);

  const removeFavorite = async (favoriteId, label = "Item") => {
    const nextState = removeFavoriteLocalState({ favorites, added, favoriteId });
    setFavorites(nextState.favorites);
    writeLocalJson(FAVORITES_STORAGE_KEY, nextState.favorites);
    writeLocalJson(ADDED_STORAGE_KEY, nextState.added);
    setAdded(nextState.added);

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
    const nextState = addFavoriteLocalState({
      favorites,
      added,
      favoriteId,
      nowIso: new Date().toISOString(),
    });
    if (!nextState.isValid) return;
    const normalized = String(favoriteId || "");
    if (nextState.alreadySaved) {
      showActionFeedback(showToast, "favoriteAlreadySaved", { label });
      return;
    }

    setFavorites(nextState.favorites);
    writeLocalJson(FAVORITES_STORAGE_KEY, nextState.favorites);
    setAdded(nextState.added);
    writeLocalJson(ADDED_STORAGE_KEY, nextState.added);

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

  const setCalendarReminderMode = useCallback((eventId, mode) => {
    const safeId = String(eventId || "").trim();
    const safeMode = mode === "day_before" || mode === "day_of" ? mode : "off";
    if (!safeId) return;
    setCalendarReminderByEventId((current) => ({
      ...(current || {}),
      [safeId]: safeMode,
    }));
    if (safeMode === "off") {
      showToast("Reminder removed.", { tone: "info", duration: 1400 });
      return;
    }
    showToast(
      safeMode === "day_before"
        ? "Reminder set: 1 day before."
        : "Reminder set: on event day.",
      { tone: "ok", duration: 1600 }
    );
  }, [showToast]);

  const resolveCheckinPlaceDbId = useCallback(async (entry) => {
    const directPlaceId = resolveDirectPlaceDbId(entry?.placeId);
    if (directPlaceId) return directPlaceId;

    const cityValue = String(entry?.city || "").trim();
    const labelValue = String(entry?.label || "").trim();
    if (!cityValue || !labelValue) return null;

    const lookup = await supabase
      .from("places")
      .select("id, city, name")
      .ilike("name", labelValue)
      .limit(20);

    return resolvePlaceDbIdFromLookupRows({
      rows: Array.isArray(lookup?.data) ? lookup.data : [],
      city: cityValue,
    });
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

    const nextCheckin = buildNextCheckin({
      payload,
      resolvedCoords,
      isEditing,
      editingId,
    });

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
        const merged = mergeSavedCheckinIntoList({
          current,
          savedRow,
          isEditing,
          limit: 300,
        });
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
      ...buildEditCheckinFormPatch({
        entry,
        currentCountry: current.country,
        cityCountryLookup,
        normalizeCityKey,
        formatCityLabel,
      }),
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
      const target = resolveCheckinFocusCoordinates(entry, checkinMarkerById);
      if (map && target) {
        map.flyTo({
          center: [target.lng, target.lat],
          zoom: Math.max(map.getZoom(), 12.5),
          essential: true,
        });
      }

      const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
      if (isMobile) {
        checkinMapCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [checkinMapCardRef, checkinMapRef, checkinMarkerById, setSelectedCheckinId]
  );

  const quickCheckinFromItem = async (item, itemType = "place") => {
    const payload = buildQuickCheckinPayload({
      item,
      itemType,
      cityCountryLookup,
      normalizeCityKey,
    });
    if (!payload) return;
    await submitCheckin(payload);
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

      setFollowingUserIds((current) =>
        removeFollowingLocalState({ followingUserIds: current, targetUserId: normalizedTarget }).followingUserIds
      );
      setFollowingFeedRows((current) =>
        removeFollowingLocalState({ followingFeedRows: current, targetUserId: normalizedTarget }).followingFeedRows
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

    setFollowingUserIds((current) => addFollowingUserIdLocalState(current, normalizedTarget));
    showToast("Member added to your trusted signal.", { tone: "ok", duration: 2100 });
    await loadTrustNetwork();
  };

  const removePlan = async (planId) => {
    setPlans((current) => removePlanLocalState({ plans: current, planId }).plans);
    setExpandedPlanId((current) => removePlanLocalState({ expandedPlanId: current, planId }).expandedPlanId);

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
    if (stop.itemType === "event") {
      router.push(citySelectionPath(stop.city, { eventId: stop.id }));
      return;
    }
    router.push(citySelectionPath(stop.city, { placeId: stop.id }));
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

    const selectedVibeTags = normalizeVibeTags(
      Array.isArray(payload?.vibeTags) && payload.vibeTags.length > 0
        ? payload.vibeTags
        : [payload?.vibe || "mixed"],
      { max: 3 }
    );
    const vibeLabel = selectedVibeTags.length > 0
      ? selectedVibeTags.map((tag) => formatVibeTagLabel(tag) || tag).join(" + ")
      : "Mixed";
    const title = `${cityName} - ${String(payload?.horizon || "trip").replaceAll("_", " ")} - ${vibeLabel}`;
    const note = `V2 plan - vibes: ${selectedVibeTags.join(", ") || "mixed"} - budget: ${payload?.budget || "balanced"} - energy: ${payload?.energy || 70} - solo-safe: ${payload?.soloSafe ? "on" : "off"}`;

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
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_12%_9%,rgba(56,189,248,0.11),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(244,114,182,0.11),transparent_26%),linear-gradient(180deg,#040406_0%,#070911_48%,#040406_100%)] text-white">
      <ActionToast toast={toast} />
      <div className="qa-shell relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(45,212,191,0.14),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute -left-10 top-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-28 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <section className="qa-panel qa-premium-card relative mb-6 overflow-hidden rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(244,114,182,0.08),transparent_30%),linear-gradient(135deg,rgba(22,22,24,0.95),rgba(10,10,10,0.99),rgba(16,18,22,0.98))] p-4 shadow-[0_42px_132px_rgba(0,0,0,0.56)] sm:rounded-[34px] sm:p-6">
          <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-rose-400/12 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute right-2 top-3 h-20 w-20 rounded-full bg-cyan-300/30 blur-lg sm:right-[7rem] sm:top-1/2 sm:h-40 sm:w-40 sm:-translate-y-[78%] sm:blur-2xl" />
          <div className="pointer-events-none absolute right-2 top-3 h-16 w-16 rounded-full bg-sky-300/24 blur-md sm:right-[7rem] sm:top-1/2 sm:h-36 sm:w-36 sm:-translate-y-[78%] sm:blur-lg" />
          <button
            type="button"
            onClick={() => {
              setActiveProfileTab("about");
              openAvatarEditor();
            }}
            className="group absolute right-2 top-3 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-cyan-200/40 bg-cyan-200/10 text-lg font-semibold text-cyan-100 shadow-[0_0_24px_rgba(103,232,249,0.26),0_18px_40px_rgba(0,0,0,0.42)] transition hover:border-cyan-200/58 sm:right-[7rem] sm:top-1/2 sm:h-36 sm:w-36 sm:-translate-y-[78%] sm:text-3xl"
            aria-label="Edit profile image"
          >
            {String(profileAvatarDataUrl || "").trim() && !profileAvatarLoadFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileAvatarDataUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setProfileAvatarLoadFailed(true)}
              />
            ) : (
              <span>{displayInitials}</span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/48 px-2 py-1 text-center text-[10px] uppercase tracking-[0.12em] text-white/85 opacity-0 transition group-hover:opacity-100 sm:text-xs">
              Edit
            </span>
          </button>
          <input
            ref={avatarFileInputRef}
            type="file"
            accept="image/*"
            onChange={onProfileAvatarSelected}
            className="hidden"
          />
          <div className="max-w-4xl pr-[5.25rem] sm:pr-0">
            <p className="mt-1 max-w-[calc(100%-0.25rem)] bg-gradient-to-r from-amber-100 via-rose-100 to-cyan-100 bg-clip-text text-xl font-semibold tracking-[-0.01em] text-transparent drop-shadow-[0_10px_24px_rgba(251,191,36,0.2)] sm:text-3xl">
              {greeting}, {displayName}
            </p>
            <h1 className="qa-display qa-h1 mt-3 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-3xl font-bold text-transparent sm:mt-4 sm:text-6xl">
              Your Atlas
            </h1>
            <p className="qa-lead mt-3 max-w-2xl text-sm text-white/64 sm:mt-5 sm:text-base">
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
          </div>

          <div className="mt-4 rounded-2xl border border-white/12 bg-black/25 p-2.5 sm:mt-5 sm:p-3.5">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/48">Page controls</p>
              <p className="text-[11px] text-white/58">Choose one lane</p>
            </div>
            <nav className="flex snap-x snap-mandatory items-center gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:whitespace-normal sm:gap-2">
              {[
                { id: "about", label: "Home" },
                { id: "friends", label: "Friends" },
                { id: "map", label: "My map" },
                { id: "trips", label: "Plan a trip" },
                { id: "calendar", label: "My Calendar" },
              ].map((tab) => {
                const isActive = activeProfileTab === tab.id;
                const toneClasses =
                  tab.id === "about"
                    ? {
                        active: "border-cyan-200/40 bg-cyan-300/14 text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.26)]",
                        idle: "border-cyan-200/18 bg-cyan-300/[0.06] text-cyan-100/78 hover:border-cyan-200/34 hover:text-cyan-100",
                      }
                    : tab.id === "map"
                      ? {
                          active: "border-emerald-200/40 bg-emerald-300/14 text-emerald-100 shadow-[0_0_0_1px_rgba(110,231,183,0.24)]",
                          idle: "border-emerald-200/18 bg-emerald-300/[0.06] text-emerald-100/78 hover:border-emerald-200/34 hover:text-emerald-100",
                        }
                      : tab.id === "trips"
                        ? {
                            active: "border-amber-200/40 bg-amber-300/14 text-amber-100 shadow-[0_0_0_1px_rgba(252,211,77,0.24)]",
                            idle: "border-amber-200/18 bg-amber-300/[0.06] text-amber-100/78 hover:border-amber-200/34 hover:text-amber-100",
                          }
                        : tab.id === "friends"
                          ? {
                              active: "border-violet-200/40 bg-violet-300/14 text-violet-100 shadow-[0_0_0_1px_rgba(196,181,253,0.24)]",
                              idle: "border-violet-200/18 bg-violet-300/[0.06] text-violet-100/78 hover:border-violet-200/34 hover:text-violet-100",
                            }
                          : tab.id === "calendar"
                            ? {
                                active: "border-rose-200/40 bg-rose-300/14 text-rose-100 shadow-[0_0_0_1px_rgba(251,191,188,0.24)]",
                                idle: "border-rose-200/18 bg-rose-300/[0.06] text-rose-100/78 hover:border-rose-200/34 hover:text-rose-100",
                              }
                            : {
                              active: "border-rose-200/40 bg-rose-300/14 text-rose-100 shadow-[0_0_0_1px_rgba(251,191,188,0.24)]",
                              idle: "border-rose-200/18 bg-rose-300/[0.06] text-rose-100/78 hover:border-rose-200/34 hover:text-rose-100",
                            };
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition ${
                      isActive ? toneClasses.active : toneClasses.idle
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-white/58">
              <span>{totalPlaces} places</span>
              <span>|</span>
              <span>{totalEvents} events</span>
              <span>|</span>
              <span>{totalCities} cities</span>
              <span>|</span>
              <span className="capitalize">{topVibe}</span>
            </div>
          </div>
        </section>

        {isProfileAboutTab ? (
        <section className="qa-premium-card relative mb-6 overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_14%_18%,rgba(34,211,238,0.12),transparent_36%),radial-gradient(circle_at_82%_12%,rgba(236,72,153,0.1),transparent_34%),linear-gradient(180deg,rgba(16,18,24,0.97),rgba(8,10,12,0.99))] p-4 shadow-[0_30px_88px_rgba(0,0,0,0.44)] sm:rounded-[30px] sm:p-5">
          <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full bg-fuchsia-400/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.03),transparent_32%)]" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/72">Member profile</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                About
              </h2>
              <div className="mt-2 rounded-xl border border-cyan-200/16 bg-cyan-200/[0.06] px-3 py-2">
                <p className="mt-1 text-sm font-medium leading-6 text-white/88 sm:text-base">
                  {profileExtras.about || "Add a short profile line to help people know your vibe."}
                </p>
              </div>
            </div>
            {!isEditingAbout ? (
              <button
                type="button"
                onClick={() => {
                  setProfileForm({
                    displayName: memberProfile?.displayName || authMemberName || memberName,
                    pronouns: memberProfile?.pronouns || "",
                    homeCity: memberProfile?.homeCity || "",
                    residentCountry: memberProfile?.residentCountry || "",
                  });
                  setIsEditingAbout(true);
                  setIsEditingProfile(true);
                }}
                className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/80 transition hover:border-white/26"
              >
                Edit about
              </button>
            ) : null}
          </div>

          {!isEditingAbout ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] p-3.5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-100/78">Personal details</p>
                <p className="mt-1 text-xs text-white/64">Keep this section updated so trusted members understand your profile at a glance.</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Display name</p>
                <p className="mt-1 text-sm text-white">{displayName}</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Visibility</p>
                <p className="mt-1 text-sm text-white">
                  {profileExtras.visibility === "public"
                    ? "Visible to all"
                    : profileExtras.visibility === "friends"
                      ? "Visible to friends"
                      : "Visible to members"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Location</p>
                <p className="mt-1 text-sm text-white">
                  {memberProfile?.homeCity || memberProfile?.residentCountry
                    ? [memberProfile?.homeCity, memberProfile?.residentCountry].filter(Boolean).join(", ")
                    : "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Birthday</p>
                <p className="mt-1 text-sm text-white">{profileExtras.birthday || "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Vibe</p>
                <p className="mt-1 text-sm text-white">{profileExtras.vibe || topVibe}</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Tel (optional)</p>
                <p className="mt-1 text-sm text-white">{profileExtras.phone || "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/25 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/52">Mail (optional)</p>
                <p className="mt-1 text-sm text-white">{profileExtras.contactEmail || "Not set"}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={saveAboutProfile} className="mt-4 space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Display name</p>
                  <p className="mb-1 text-[11px] text-white/44">Shown publicly in comments, follows, and member cards.</p>
                  <input
                    value={profileForm.displayName}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, displayName: event.target.value }))
                    }
                    placeholder="How members see your name"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Pronouns</p>
                  <p className="mb-1 text-[11px] text-white/44">Optional, but helpful for respectful interaction.</p>
                  <input
                    value={profileForm.pronouns}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, pronouns: event.target.value }))
                    }
                    placeholder="Optional, e.g. he/him, she/her, they/them"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Location</p>
                  <p className="mb-1 text-[11px] text-white/44">Your main city so people understand your local scene.</p>
                  <input
                    value={profileForm.homeCity}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, homeCity: event.target.value }))
                    }
                    placeholder="City where you are mostly active"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Country</p>
                  <p className="mb-1 text-[11px] text-white/44">Adds context for laws, rights, and community conditions.</p>
                  <input
                    value={profileForm.residentCountry}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, residentCountry: event.target.value }))
                    }
                    placeholder="Country for local context"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Birthday</p>
                  <p className="mb-1 text-[11px] text-white/44">Optional. Only add this if you are comfortable sharing it.</p>
                  <input
                    type="date"
                    value={profileExtras.birthday}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        birthday: String(event.target.value || "").slice(0, 20),
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Vibe</p>
                  <p className="mb-1 text-[11px] text-white/44">Short keywords about your energy, music, and social style.</p>
                  <input
                    value={profileExtras.vibe}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        vibe: String(event.target.value || "").slice(0, 80),
                      }))
                    }
                    placeholder="Your social/nightlife vibe in a few words"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Tel (optional)</p>
                  <p className="mb-1 text-[11px] text-white/44">For direct contact with trusted members if you choose.</p>
                  <input
                    value={profileExtras.phone}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        phone: String(event.target.value || "").slice(0, 40),
                      }))
                    }
                    placeholder="Only if you want to share"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Mail (optional)</p>
                  <p className="mb-1 text-[11px] text-white/44">Use an address you are okay sharing in community context.</p>
                  <input
                    type="email"
                    value={profileExtras.contactEmail}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        contactEmail: String(event.target.value || "").slice(0, 120),
                      }))
                    }
                    placeholder="Optional contact mail"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">Profile visibility</p>
                  <p className="mb-1 text-[11px] text-white/44">Choose who can see your profile details in the atlas.</p>
                  <select
                    value={profileExtras.visibility}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        visibility: ["friends", "members", "public"].includes(String(event.target.value || ""))
                          ? String(event.target.value)
                          : "members",
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  >
                    <option value="friends">Visible to friends only</option>
                    <option value="members">Visible to members only</option>
                    <option value="public">Visible to all</option>
                  </select>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/28 p-2.5 sm:col-span-2">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">About (max 160)</p>
                  <p className="mb-1 text-[11px] text-white/44">Tell others what you are into and what kind of people/places you seek.</p>
                  <textarea
                    value={profileExtras.about}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        about: String(event.target.value || "").slice(0, 160),
                      }))
                    }
                    placeholder="Tell people what you are into, what vibe you bring, and where you like to go."
                    className="min-h-[90px] w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-black"
                >
                  Save about
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingAbout(false);
                    setIsEditingProfile(false);
                  }}
                  className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/80 transition hover:border-white/26"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
        ) : null}

        {isProfileActivityTab ? (
        <section className="qa-premium-card mb-6 rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(14,16,20,0.96),rgba(8,8,10,0.99))] p-4 shadow-[0_24px_72px_rgba(0,0,0,0.38)] sm:rounded-[30px] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/72">Mission control</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                What do you want now?
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSecondaryPanels((current) => !current)}
                className="rounded-full border border-white/14 bg-white/7 px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/78 transition hover:border-white/26"
              >
                {showSecondaryPanels ? "Focus mode" : "Show all panels"}
              </button>
              <button
                type="button"
                onClick={() => openIntentView(activeFavoritesIntent)}
                className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/44"
              >
                {primaryIntentCtaLabel}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {[
              { id: "go_out_tonight", label: "Check in now", hint: "Venue/event check-ins, live energy." },
              { id: "plan_a_trip", label: "Plan a trip", hint: "Route, stops, save flow." },
              { id: "check_friend_pulse", label: "Check friend pulse", hint: "Friends, trusted signal." },
            ].map((intent) => {
              const isActive = activeFavoritesIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => openIntentView(intent.id)}
                  className={`rounded-2xl border px-3.5 py-3 text-left transition ${
                    isActive
                      ? "border-cyan-200/34 bg-cyan-200/12 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{intent.label}</p>
                  <p className="mt-1 text-xs text-white/58">{intent.hint}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.03] px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200/26 bg-cyan-200/12 text-xs font-semibold text-cyan-100">
              {displayInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-[11px] text-white/58">
                {memberProfile?.homeCity ? memberProfile.homeCity : "Home city not set"}
                {" | "}
                {topVibe}
              </p>
            </div>
            {memberRank?.title ? (
              <span className={`ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${memberTitleMeta.className}`}>
                <span>{memberTitleMeta.icon}</span>
                {memberTitleMeta.label}
              </span>
            ) : null}
          </div>

          <div className="mt-3 rounded-2xl border border-white/12 bg-black/25 px-3.5 py-2.5 text-xs text-white/70">
            {isGoOutTonightIntent && checkins.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>No check-ins yet. Start with one venue or event check-in.</span>
                <button
                  type="button"
                  onClick={() => tonightSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.11em] text-fuchsia-100 transition hover:border-fuchsia-200/45"
                >
                  Start here
                </button>
              </div>
            ) : null}
            {isGoOutTonightIntent && checkins.length > 0 && checkins.length <= 3 ? (
              <span>Quick flow: check in, tap vibe, and jump to saved places.</span>
            ) : null}
            {isGoOutTonightIntent && checkins.length > 3 ? (
              <span>Compact mode: use filters and list scroll to manage your active check-ins.</span>
            ) : null}
            {isPlanTripIntent && plans.length === 0 ? (
              <span>No plans saved yet. Build your first itinerary in one pass.</span>
            ) : null}
            {isPlanTripIntent && plans.length > 0 ? (
              <span>{plans.length} saved plans ready. Open one and continue from the latest stop.</span>
            ) : null}
            {isFriendPulseIntent && followingUserIds.length === 0 ? (
              <span>Follow members to unlock your trusted friend pulse feed.</span>
            ) : null}
            {isFriendPulseIntent && followingUserIds.length > 0 ? (
              <span>{followingUserIds.length} trusted connections active in your pulse network.</span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em] text-white/56">
            <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1">Saved</span>
            <span className="text-white/35">-&gt;</span>
            <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1">Signal</span>
            <span className="text-white/35">-&gt;</span>
            <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1">Route</span>
            <span className="text-white/35">-&gt;</span>
            <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1">Share / Meet</span>
          </div>
          {!showSecondaryPanels ? (
            <p className="mt-2 text-[11px] text-white/48">
              Focus mode on: only your active intent panel is visible.
            </p>
          ) : null}
        </section>
        ) : null}


        {showCheckinSection ? (
        isCompactCheckinSection ? (
        <section className="qa-premium-card mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,14,22,0.94),rgba(10,10,10,0.98))] p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/72">My map</p>
              <p className="mt-1 text-sm text-white/82">
                {myMapView === "checkins" ? `${checkins.length} check-ins` : `${savedPlaces.length} saved places`} | {checkinCities.length} cities
              </p>
            </div>
            <button
              type="button"
              onClick={() => openIntentView("go_out_tonight")}
              className="rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.11em] text-fuchsia-100 transition hover:border-fuchsia-200/44"
            >
              Open full
            </button>
          </div>
        </section>
        ) : (
        <section
          ref={tonightSectionRef}
          className="qa-premium-card mb-6 rounded-[30px] border border-fuchsia-200/14 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(26,14,24,0.96),rgba(10,10,10,0.99))] p-4 shadow-[0_34px_104px_rgba(0,0,0,0.42)] sm:rounded-[32px] sm:p-5"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-fuchsia-200/75">
                Atlas signal map
              </p>
              <h2 className="qa-h2 mt-2 bg-gradient-to-r from-fuchsia-100 via-white to-cyan-100 bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent sm:text-2xl">
                Live map layers
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/56">
                Switch between your live check-ins and your saved venues in one premium map surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/12 bg-white/7 px-3 py-1 text-xs text-white/70">
                {myMapView === "checkins" ? `${checkins.length} check-ins` : `${savedPlaces.length} saved places`}
              </span>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100/85">
                {myMapView === "checkins" ? checkinCities.length : savedPlaceCities} {myMapView === "checkins" ? (checkinCities.length === 1 ? "city" : "cities") : (savedPlaceCities === 1 ? "city" : "cities")}
              </span>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {[
              { id: "checkins", label: "Check-ins layer", icon: "●" },
              { id: "saved", label: "Saved layer", icon: "◆" },
            ].map((view) => {
              const isActive = myMapView === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setMyMapView(view.id)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
                    isActive
                      ? view.id === "checkins"
                        ? "border-fuchsia-200/45 bg-fuchsia-200/16 text-fuchsia-100 shadow-[0_0_0_1px_rgba(244,114,182,0.25)]"
                        : "border-cyan-200/45 bg-cyan-200/16 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                      : "border-white/14 bg-white/6 text-white/72 hover:border-white/24 hover:text-white"
                  }`}
                >
                  <span className="mr-1.5 opacity-90">{view.icon}</span>
                  {view.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div
              ref={checkinMapCardRef}
              className={`qa-premium-card rounded-3xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.28)] transition ${
                selectedCheckin
                  ? "border-fuchsia-200/34 shadow-[0_0_0_1px_rgba(244,114,182,0.18),0_24px_80px_rgba(244,114,182,0.14)]"
                  : "border-white/10 hover:shadow-[0_24px_54px_rgba(6,182,212,0.16),0_10px_26px_rgba(0,0,0,0.34)]"
              }`}
            >
              {selectedCheckin ? (
                <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-fuchsia-200/35 bg-fuchsia-200/12 px-3 py-1 text-[11px] text-fuchsia-100/95">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-200" />
                  <span className="truncate">
                    Selected: {selectedCheckin.label || "Check-in"} | {selectedCheckin.city || "City"}
                  </span>
                </div>
              ) : null}
              {mapboxToken ? (
                <div
                  ref={checkinMapContainerRef}
                  className="h-[230px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/25 sm:h-[280px]"
                />
              ) : checkinMapEmbedUrl ? (
                <iframe
                  title="Your check-in map"
                  src={checkinMapEmbedUrl}
                  className="h-[230px] w-full rounded-2xl border border-white/10 bg-black/25 sm:h-[280px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : staticMapUrl && !checkinMapLoadFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={staticMapUrl}
                  alt="Your check-in map"
                  onError={() => setCheckinMapLoadFailed(true)}
                  className="h-[230px] w-full rounded-2xl border border-white/10 bg-black/25 object-contain sm:h-[280px]"
                />
              ) : openStreetMapStaticUrl && !checkinStaticFallbackFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={openStreetMapStaticUrl}
                  alt="Your check-in map fallback"
                  onError={() => setCheckinStaticFallbackFailed(true)}
                  className="h-[230px] w-full rounded-2xl border border-white/10 bg-black/25 object-contain sm:h-[280px]"
                />
              ) : (
                <div className="flex h-[230px] items-center justify-center rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 text-sm text-white/45 sm:h-[280px]">
                  Check-ins auto-pin from city + venue. Add more check-ins to render the map.
                </div>
              )}

              {myMapView === "checkins" ? (
              <>
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
              </>
              ) : (
                <div className="mt-4 rounded-2xl border border-cyan-200/24 bg-cyan-200/10 px-4 py-3 text-xs text-cyan-100/88">
                  Saved places mode is active. Switch to <span className="font-semibold">My check-ins</span> to create new check-ins and live vibe taps.
                </div>
              )}
            </div>

            <div className="qa-premium-card rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.28)]">
              <p className="text-xs uppercase tracking-[0.18em] text-white/42">
                {myMapView === "checkins" ? "Your check-ins" : "My saved places"}
              </p>
              {myMapView === "checkins" ? (
              <>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/12 px-2 py-0.5 text-fuchsia-100/90">You</span>
                  <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5 text-white/75">Map shows your saved check-ins</span>
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
                <div
                  className={FAVORITES_CHECKIN_LIST_SCROLL_CLASS}
                  style={{ scrollbarGutter: "stable", minHeight: "31rem", maxHeight: "31rem" }}
                >
                {filteredRecentCheckins.length > 0 ? (
                    <div className="space-y-2.5">
                      {filteredRecentCheckins.map((entry) => (
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
                            {entry.city || "Unknown city"}{entry.country ? ` | ${entry.country}` : ""}
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
                      ))}
                    </div>
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
              </>
              ) : (
                <>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-2 py-0.5 text-cyan-100/90">Saved</span>
                    <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5 text-white/75">Map shows your saved venues</span>
                  </div>
                  <div
                    className={FAVORITES_CHECKIN_LIST_SCROLL_CLASS}
                    style={{ scrollbarGutter: "stable", maxHeight: "13.25rem" }}
                  >
                    {savedPlaces.length > 0 ? (
                      <div className="space-y-2.5">
                      {savedPlaces.map((place) => (
                        <article
                          key={`saved-map-${place.id}`}
                          className="rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-white/24"
                        >
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                            {place.city || "Unknown city"}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">{place.name || "Unnamed place"}</p>
                          {place.location || place.address ? (
                            <p className="mt-1 text-xs text-white/62">{place.location || place.address}</p>
                          ) : null}
                          <div className="mt-1 text-xs text-white/55">
                            Saved {formatSavedTime(place.addedAt)}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => focusSavedPlaceOnMap(place)}
                              className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-3 py-1 text-[11px] text-fuchsia-100/90 transition hover:border-fuchsia-200/35"
                            >
                              Show on map
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(citySelectionPath(place.city, { placeId: place.id }))}
                              className="rounded-full border border-white/18 bg-white/8 px-3 py-1 text-[11px] text-white/85 transition hover:border-white/30"
                            >
                              Open venue
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                quickCheckinFromItem(place, "place");
                              }}
                              className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-[11px] text-cyan-100/90 transition hover:border-cyan-200/35"
                            >
                              Check in
                            </button>
                          </div>
                        </article>
                      ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/12 px-4 py-6 text-sm text-white/45">
                        No saved places yet. Save venues from city pages to build your map.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
        )
        ) : null}

        {showTripSection ? (
        isCompactTripSection ? (
        <section className="qa-premium-card mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,24,0.94),rgba(10,10,10,0.98))] p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/72">Plan a trip</p>
              <p className="mt-1 text-sm text-white/82">{plans.length} saved itineraries ready</p>
            </div>
            <button
              type="button"
              onClick={() => openIntentView("plan_a_trip")}
              className="rounded-full border border-cyan-200/28 bg-cyan-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.11em] text-cyan-100 transition hover:border-cyan-200/44"
            >
              Open full
            </button>
          </div>
        </section>
        ) : (
        <section ref={tripSectionRef} className="mb-8">
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
                  {memberProfile?.pronouns ? ` | ${memberProfile.pronouns}` : ""}
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

          <div className="qa-premium-card overflow-visible rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_30%),radial-gradient(circle_at_10%_8%,rgba(244,114,182,0.07),transparent_28%),linear-gradient(180deg,rgba(18,18,20,0.95),rgba(10,10,10,0.99))] p-4 shadow-[0_36px_108px_rgba(0,0,0,0.48)] sm:rounded-[32px] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
                  Trip planner
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  Plan a night or city flow. Build and save itinerary flows based on your vibe, timing, and city context.
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
                  className="qa-premium-card animate-rise-in rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.20)] sm:p-4"
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

                    <div className="flex w-full flex-wrap items-center gap-2 self-start sm:w-auto lg:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPlanId((current) =>
                            String(current) === String(plan.id) ? null : plan.id
                          )
                        }
                        className="rounded-full border border-cyan-200/16 bg-cyan-200/[0.08] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-cyan-100/85 transition hover:border-cyan-200/30 sm:flex-none"
                      >
                        {String(expandedPlanId) === String(plan.id) ? "Collapse" : "Expand"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlan(plan.id)}
                        className="rounded-full border border-rose-200/16 bg-rose-200/[0.08] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-rose-100/85 transition hover:border-rose-200/30 sm:flex-none"
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
                                  citySelectionPath(stop.city, {
                                    placeId: stop.type === "place" ? stop.id : "",
                                    eventId: stop.type === "event" ? stop.id : "",
                                  })
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
                                    {stop.trustReason ? ` | ${stop.trustReason}` : ""}
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
              <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-sm text-white/42">
                No plans yet. Build your first night or city flow from saved places and events.
              </div>
            )}
          </div>
          </div>
        </section>
        )
        ) : null}

        {showPulseSection ? (
        isCompactPulseSection ? (
        <section className="qa-premium-card mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,16,22,0.94),rgba(10,10,10,0.98))] p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-violet-100/72">Check friend pulse</p>
              <p className="mt-1 text-sm text-white/82">{followingUserIds.length} trusted members | {followingFeedItems.length} signal saves</p>
            </div>
            <button
              type="button"
              onClick={() => openIntentView("check_friend_pulse")}
              className="rounded-full border border-violet-200/28 bg-violet-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.11em] text-violet-100 transition hover:border-violet-200/44"
            >
              Open full
            </button>
          </div>
        </section>
        ) : (
        <div ref={pulseSectionRef}>
          {isProfileFriendsTab ? (
          <section className="qa-premium-card mb-6 rounded-[28px] border border-violet-200/16 bg-[linear-gradient(180deg,rgba(16,14,24,0.95),rgba(10,10,10,0.99))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.4)] sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-100/70">Friends</p>
                <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">People you follow</h3>
              </div>
              <button
                type="button"
                onClick={loadTrustNetwork}
                className="rounded-full border border-violet-200/26 bg-violet-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-violet-100 transition hover:border-violet-200/40"
              >
                Refresh
              </button>
            </div>
            {followingProfiles.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {followingProfiles.map((profile) => {
                  const userId = String(profile?.userId || "").trim();
                  const fallbackName = memberDisplayNameById.get(userId) || "";
                  const feedName = followingFeedNameById.get(userId) || "";
                  const checkinName = followingCheckinNameById.get(userId) || "";
                  const profileName = String(profile?.displayName || "").trim();
                  const friendAvatarUrl = String(
                    friendAvatarByUserId[userId] ||
                    memberAvatarById.get(userId) ||
                    followingFeedAvatarById.get(userId) ||
                    ""
                  ).trim();
                  const friendName = resolveFriendDisplayName(
                    userId,
                    profileName || fallbackName || feedName || checkinName
                  );
                  const initials = friendName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((chunk) => chunk.charAt(0).toUpperCase())
                    .join("");
                  return (
                  <article
                    key={`friends-list-${profile.userId}`}
                    className="rounded-2xl border border-white/12 bg-white/[0.04] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-200/28 bg-cyan-200/10 text-xs font-semibold text-cyan-100">
                        {friendAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={friendAvatarUrl} alt={friendName} className="h-full w-full object-cover" />
                        ) : (
                          initials || "M"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{friendName}</p>
                        <p className="mt-1 text-xs text-white/60">
                          {profile.cityCount || 0} cities {" \u00B7 "} {profile.score || 0} pts
                        </p>
                        {profile.latestItemName ? (
                          <p className="mt-1 truncate text-[11px] text-cyan-100/72">
                            Latest: {profile.latestItemName}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/messages?user=${encodeURIComponent(String(profile?.userId || ""))}&name=${encodeURIComponent(
                              friendName
                            )}`
                          )
                        }
                        className="rounded-full border border-cyan-200/26 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-200/44"
                      >
                        Message
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFollowMember(String(profile?.userId || ""))}
                        className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/78 transition hover:border-white/26"
                      >
                        Unfollow
                      </button>
                    </div>
                  </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 bg-black/25 px-4 py-6 text-sm text-white/48">
                You are not following anyone yet. Add trusted members to start your friend pulse.
              </div>
            )}
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/78">Friend pulse</p>
                <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100/86">
                  Live check-ins
                </span>
              </div>
              {followingCheckinsWarning ? (
                <div className="mb-3 rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                  {followingCheckinsWarning}
                </div>
              ) : null}
              <div
                className={FAVORITES_FRIENDS_CHECKIN_LIST_SCROLL_CLASS}
                style={{ scrollbarGutter: "stable", maxHeight: "17.25rem" }}
              >
                {recentFollowingCheckins.length > 0 ? (
                  recentFollowingCheckins.map((entry) => {
                    const presence = followingPresenceByUserId[String(entry.ownerUserId || "")] || null;
                    const activeNow = isPresenceActiveNow(presence);
                    return (
                      <article key={`friend-${entry.id}`} className="rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {resolveFriendDisplayName(entry.ownerUserId, entry.ownerName)}
                            </p>
                            <p className="mt-1 text-xs text-white/65">
                              {entry.label || "Unnamed check-in"} | {entry.city || "Unknown city"}
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
          </section>
          ) : showSignalDeck ? (
          <>
            <FavoritesPeopleSignalPanel
              networkWarning={networkWarning}
              onRefresh={loadTrustNetwork}
              followingProfiles={followingProfiles}
              suggestedMembers={suggestedMembers}
              followingFeedItems={followingFeedItems}
              followingIdSet={followingIdSet}
              networkLoading={networkLoading}
              onMessageMember={(profile) =>
                router.push(
                  `/messages?user=${encodeURIComponent(String(profile?.userId || ""))}&name=${encodeURIComponent(
                    String(profile?.displayName || "Member")
                  )}`
                )
              }
              onToggleFollow={(memberId) => toggleFollowMember(memberId)}
              onSaveFromFeed={(item) => addFavoriteFromNetwork(item.favoriteId, item.name)}
            />

            <FavoritesForYouPanel
              recommendationMode={recommendationMode}
              setRecommendationMode={setRecommendationMode}
              forYouRecommendations={forYouRecommendations}
              onOpenRecommendation={(item) =>
                router.push(
                  citySelectionPath(item.city, {
                    placeId: item.kind === "place" ? item.id : "",
                    eventId: item.kind === "event" ? item.id : "",
                  })
                )
              }
              onSaveRecommendation={(item) =>
                addFavoriteFromNetwork(item.kind === "event" ? `event-${item.id}` : item.id, item.name)
              }
            />
          </>
          ) : null}
        </div>
        )
        ) : null}

        {showCalendarSection ? (
        <section className="qa-premium-card mb-6 rounded-[30px] border border-rose-200/16 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.14),transparent_32%),radial-gradient(circle_at_85%_14%,rgba(34,211,238,0.1),transparent_28%),linear-gradient(180deg,rgba(22,14,18,0.96),rgba(10,10,10,0.99))] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38)] sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-100/78">My Calendar</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">Your upcoming event pulse</h3>
              <p className="mt-2 text-sm text-white/62">
                Save events, set reminder mode, and keep your next queer moments in one timeline.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-rose-200/24 bg-rose-200/12 px-3 py-1 text-xs text-rose-100">
                Today: {todayCalendarEvents.length}
              </span>
              <span className="rounded-full border border-cyan-200/24 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">
                Upcoming: {upcomingCalendarEvents.length}
              </span>
            </div>
          </div>

          {calendarEvents.length > 0 ? (
            <div className="space-y-3">
              {calendarEvents.map((event) => {
                const eventId = String(event.id || "");
                const reminderMode = String(calendarReminderByEventId?.[eventId] || "off");
                const eventDateKey = event.calendarDate.toISOString().slice(0, 10);
                const isToday = eventDateKey === todayDateKey;
                const isPast = eventDateKey < todayDateKey;
                return (
                  <article
                    key={`calendar-${eventId}`}
                    className={`rounded-2xl border p-3.5 transition ${
                      isToday
                        ? "border-rose-200/34 bg-rose-200/12 shadow-[0_0_0_1px_rgba(251,113,133,0.24)]"
                        : "border-white/12 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{event.name}</p>
                        <p className="mt-1 text-xs text-white/62">
                          {formatDate(event.date)} · {formatCityLabel(event.city || "")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {isToday ? (
                          <span className="rounded-full border border-rose-200/30 bg-rose-200/14 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100">
                            Today
                          </span>
                        ) : null}
                        {isPast ? (
                          <span className="rounded-full border border-white/16 bg-white/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70">
                            Past
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCalendarReminderMode(eventId, reminderMode === "off" ? "day_of" : "off")}
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                          reminderMode === "day_of"
                            ? "border-cyan-200/36 bg-cyan-200/16 text-cyan-100"
                            : "border-white/14 bg-white/8 text-white/74 hover:border-white/28"
                        }`}
                      >
                        Day-of reminder
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarReminderMode(eventId, reminderMode === "day_before" ? "off" : "day_before")}
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em] transition ${
                          reminderMode === "day_before"
                            ? "border-amber-200/36 bg-amber-200/16 text-amber-100"
                            : "border-white/14 bg-white/8 text-white/74 hover:border-white/28"
                        }`}
                      >
                        1 day before
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(citySelectionPath(event.city, { eventId: event.id }))}
                        className="rounded-full border border-rose-200/24 bg-rose-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/42"
                      >
                        Open event
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/12 bg-black/28 px-4 py-7 text-sm text-white/55">
              No saved events yet. Save events from city pages or events page, then manage reminders here.
            </div>
          )}

          <div className="mt-4">
            <SavedEventsPanel
              isAtlasLoading={isAtlasLoading}
              savedEvents={savedEvents}
              formatDate={formatDate}
              onOpenEvent={(event) => router.push(citySelectionPath(event.city, { eventId: event.id }))}
              onQuickCheckin={(event) => quickCheckinFromItem(event, "event")}
              onRemoveFavorite={removeFavorite}
              onBrowseEvents={() => router.push("/events")}
              renderSkeleton={() => <FavoritesCardSkeleton />}
            />
          </div>
        </section>
        ) : null}
      </div>
    </main>
  );
}

