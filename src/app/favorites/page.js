"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookmarkCheck } from "lucide-react";
import CalendarMonthExperience from "@/features/favorites/calendar/CalendarMonthExperience";
import TripPlansHome from "@/features/favorites/trips/TripPlansHome";
import "../signal-motion.css";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { useAuth } from "@/lib/auth";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { fetchPlacesForAtlas } from "@/lib/placesDataApi";
import { addReport, subscribeBlockedItems, syncBlockedItemsFromCloud } from "@/lib/moderation";
import { getMemberProfile } from "@/lib/memberProfile";
import { getMemberTitleMeta } from "@/lib/communityRanking";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { trackKpiEvent } from "@/lib/analytics";
import { useActionToast } from "@/lib/useActionToast";
import { showActionFeedback } from "@/lib/actionFeedback";
import { LIVE_VIBE_OPTIONS, isMissingTableError as isMissingLiveVibeTableError } from "@/lib/liveVibe";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";
import { evaluateMapInitReadiness, shouldTriggerMapFallback } from "@/lib/mapInitGuard";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
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
  computeFollowingProfiles,
  computeMomentumMilestones,
  computePlannerCities,
} from "@/features/favorites/logic/favoritesInsights";
import {
  buildCheckinMarkerById,
  buildCheckinMarkers,
  resolveCheckinFocusCoordinates,
} from "@/features/favorites/checkinMapGuards";
import {
  FAVORITES_CHECKIN_LIST_SCROLL_CLASS,
} from "@/features/favorites/favoritesUiConstants";
import ActionToast from "@/components/ui/ActionToast";
import BrandMark from "@/components/ui/BrandMark";
import PageControls from "@/components/ui/PageControls";
import PageOpeningState from "@/components/ui/PageOpeningState";
import FavoritesCardSkeleton from "@/components/favorites/FavoritesCardSkeleton";
import FavoritesMomentumPanel from "@/components/favorites/FavoritesMomentumPanel";
import FavoritesProfileHome from "@/components/favorites/FavoritesProfileHome";
import { useFavoritesStateController } from "@/features/favorites/useFavoritesStateController";

const TripPlannerV2 = dynamic(() => import("@/components/planner/TripPlannerV2"), {
  loading: () => <FavoritesCardSkeleton />,
});

const CHECKIN_VIBE_COOLDOWN_MS = 30 * 1000;
const PREMIUM_CHECKIN_SELECT_CLASS =
  "w-full rounded-2xl border border-white/12 bg-[#15101b] px-3.5 py-2.5 text-sm font-medium text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_rgba(0,0,0,0.18)] transition hover:border-white/22 hover:bg-[#1b1423] focus:border-fuchsia-200/50 focus:ring-2 focus:ring-fuchsia-200/16 [&_option]:bg-[#15101b] [&_option]:text-white";
const FAVORITES_PROFILE_EXTRAS_STORAGE_KEY = "qa_favorites_profile_extras_v1";
const FAVORITES_PROFILE_MEMORIES_STORAGE_KEY = "qa_favorites_profile_memories_v1";
const FAVORITES_PERSONAL_CALENDAR_STORAGE_KEY = "qa_favorites_personal_calendar_v1";
const FAVORITES_CALENDAR_REMINDER_STORAGE_KEY = "qa_favorites_calendar_reminders_v1";
const FAVORITES_CALENDAR_LAST_ALERT_DAY_STORAGE_KEY = "qa_favorites_calendar_last_alert_day_v1";
const FAVORITES_CALENDAR_VIEW_STORAGE_KEY = "qa_favorites_calendar_view_v1";
const FAVORITES_CALENDAR_GOING_STORAGE_KEY = "qa_favorites_calendar_going_v1";
const MEMBER_AVATAR_BUCKET = "member-avatars";

function formatCalendarDateKey(date = new Date()) {
  const current = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(current.getTime())) return "";
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarDateKey(value = "") {
  const raw = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return formatCalendarDateKey(new Date(raw));
}

function getCalendarMonthKey(date = new Date()) {
  const current = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(current.getTime())) return formatCalendarDateKey(new Date()).slice(0, 7);
  return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
}

function buildCalendarMonthCells(monthKey = getCalendarMonthKey()) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  const firstDay = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));
  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = formatCalendarDateKey(date);
    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === firstDay.getMonth(),
    };
  });
}

function decodeVapidPublicKey(value = "") {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replaceAll("-", "+").replaceAll("_", "/");
  const bytes = window.atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

function normalizePersonalCalendarItem(raw = {}) {
  const title = String(raw?.title || "").trim().slice(0, 120);
  const dateKey = getCalendarDateKey(raw?.date);
  if (!title || !dateKey) return null;
  const reminderMode = ["day_before", "day_of", "hour_before"].includes(String(raw?.reminderMode || ""))
    ? String(raw.reminderMode)
    : "off";
  return {
    id: String(raw?.id || `personal-${Date.now()}`),
    title,
    type: String(raw?.type || "plan").trim().slice(0, 40) || "plan",
    date: dateKey,
    time: String(raw?.time || "").trim().slice(0, 8),
    city: String(raw?.city || "").trim().slice(0, 80),
    notes: String(raw?.notes || "").trim().slice(0, 500),
    reminderMode,
    createdAt: String(raw?.createdAt || new Date().toISOString()),
  };
}

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

function normalizeCheckinPrivacy(value) {
  const normalized = String(value || "private");
  return normalized === "friends" ? "private" : normalized;
}

function isProfileMemoriesTableMissingError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  if (code === "42P01" || code === "PGRST204") return true;
  return message.includes("qa_member_profile_memories") && message.includes("does not exist");
}

function isProfileStoryUserIdMissingError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = String(error?.message || "").toLowerCase();
  return (code === "42703" || code === "PGRST204") && message.includes("user_id");
}

function isCommunityContributionSchemaError(error) {
  const code = String(error?.code || "").toUpperCase();
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return code === "42P01" || code === "42703" || code === "PGRST204" ||
    (message.includes("does not exist") && (message.includes("community_") || message.includes("user_id")));
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
    about: String(raw?.about || "").slice(0, 300),
    visibility: ["friends", "members", "public"].includes(String(raw?.visibility || "members"))
      ? String(raw?.visibility || "members")
      : "members",
    birthday: String(raw?.birthday || "").slice(0, 20),
    vibe: String(raw?.vibe || "").slice(0, 80),
    phone: String(raw?.phone || "").slice(0, 40),
    contactEmail: String(raw?.contactEmail || "").slice(0, 120),
  };
}

function createProfileClientId(prefix = "profile") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mapProfileStoryRow(row = {}) {
  return {
    id: String(row?.id || createProfileClientId("story")),
    userId: String(row?.user_id || ""),
    title: String(row?.title || "").trim(),
    city: String(row?.city || "").trim(),
    author: String(row?.author || "Member").trim() || "Member",
    category: String(row?.category || "Profile").trim() || "Profile",
    excerpt: String(row?.excerpt || "").trim(),
    body: String(row?.body || "").trim(),
    createdAt: String(row?.created_at || row?.createdAt || new Date().toISOString()),
  };
}

const PREMIUM_VIBE_CHIP_META = {
  midnight_pulse: { label: "Midnight Pulse", tone: "border-fuchsia-300/70 bg-fuchsia-300/26 text-fuchsia-50" },
  festival_heart: { label: "Festival Heart", tone: "border-amber-300/70 bg-amber-300/26 text-amber-50" },
  soft_chaos: { label: "Soft Chaos", tone: "border-pink-300/70 bg-pink-300/26 text-pink-50" },
  underground_ritual: { label: "Underground Ritual", tone: "border-violet-300/70 bg-violet-300/26 text-violet-50" },
  chosen_family: { label: "Chosen Family", tone: "border-emerald-300/70 bg-emerald-300/26 text-emerald-50" },
  techno: { label: "Techno", tone: "border-indigo-300/70 bg-indigo-300/26 text-indigo-50" },
  electronic: { label: "Neon Current", tone: "border-cyan-300/70 bg-cyan-300/26 text-cyan-50" },
  neon_current: { label: "Neon Current", tone: "border-cyan-300/70 bg-cyan-300/26 text-cyan-50" },
  festivals: { label: "Festival Heart", tone: "border-amber-300/70 bg-amber-300/26 text-amber-50" },
  festival: { label: "Festival Heart", tone: "border-amber-300/70 bg-amber-300/26 text-amber-50" },
  underground: { label: "Underground Ritual", tone: "border-violet-300/70 bg-violet-300/26 text-violet-50" },
  late: { label: "Late Night Rituals", tone: "border-rose-300/70 bg-rose-300/26 text-rose-50" },
  nights: { label: "Late Night Rituals", tone: "border-rose-300/70 bg-rose-300/26 text-rose-50" },
  late_night_rituals: { label: "Late Night Rituals", tone: "border-rose-300/70 bg-rose-300/26 text-rose-50" },
  social: { label: "Chosen Family Energy", tone: "border-emerald-300/70 bg-emerald-300/26 text-emerald-50" },
  mixed: { label: "Open Circle", tone: "border-sky-300/70 bg-sky-300/26 text-sky-50" },
  leather: { label: "Leather Signal", tone: "border-stone-300/70 bg-stone-300/26 text-stone-50" },
  leather_signal: { label: "Leather Signal", tone: "border-stone-300/70 bg-stone-300/26 text-stone-50" },
  house_heat: { label: "House Heat", tone: "border-orange-300/70 bg-orange-300/26 text-orange-50" },
  ballroom_energy: { label: "Ballroom Energy", tone: "border-teal-300/70 bg-teal-300/26 text-teal-50" },
  drag_after_dark: { label: "Drag After Dark", tone: "border-fuchsia-400/70 bg-fuchsia-400/26 text-fuchsia-50" },
  rooftop_sunset: { label: "Rooftop Sunset", tone: "border-yellow-300/70 bg-yellow-300/26 text-yellow-50" },
  art_house_nights: { label: "Art House Nights", tone: "border-purple-300/70 bg-purple-300/26 text-purple-50" },
  queer_wellness: { label: "Queer Wellness", tone: "border-lime-300/70 bg-lime-300/26 text-lime-50" },
  pop: { label: "Pop Euphoria", tone: "border-pink-300/70 bg-pink-300/26 text-pink-50" },
};

const PROFILE_VIBE_PRESETS = [
  { key: "midnight_pulse", label: "Midnight Pulse" },
  { key: "festival_heart", label: "Festival Heart" },
  { key: "soft_chaos", label: "Soft Chaos" },
  { key: "underground_ritual", label: "Underground Ritual" },
  { key: "chosen_family", label: "Chosen Family" },
  { key: "techno", label: "Techno" },
  { key: "neon_current", label: "Neon Current" },
  { key: "late_night_rituals", label: "Late Night Rituals" },
  { key: "leather_signal", label: "Leather Signal" },
  { key: "house_heat", label: "House Heat" },
  { key: "ballroom_energy", label: "Ballroom Energy" },
  { key: "drag_after_dark", label: "Drag After Dark" },
  { key: "rooftop_sunset", label: "Rooftop Sunset" },
  { key: "art_house_nights", label: "Art House Nights" },
  { key: "queer_wellness", label: "Queer Wellness" },
];

function resolveProfileVibeChips(vibeRaw = "", fallbackVibe = "") {
  const source = String(vibeRaw || "").trim();
  const tokens = (source || String(fallbackVibe || "mixed"))
    .split(/[,+/|]/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  const uniqueTokens = [];
  tokens.forEach((token) => {
    if (!uniqueTokens.includes(token)) {
      uniqueTokens.push(token);
    }
  });

  return uniqueTokens.slice(0, 5).map((token) => {
    const preset = PREMIUM_VIBE_CHIP_META[token];
    if (preset) {
      return { key: token, label: preset.label, tone: preset.tone };
    }
    return {
      key: token,
      label: token
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      tone: "border-white/22 bg-white/10 text-white/86",
    };
  });
}

export default function FavoritesPage() {
  const router = useRouter();
  const [profileRouteParams, setProfileRouteParams] = useState({
    member: "",
    memberName: "",
    memberAvatar: "",
    tab: "",
  });
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
    setNetworkLoading,
    setNetworkWarning,
    nowTs, setNowTs,
    checkins, setCheckins,
    checkinsWarning, setCheckinsWarning,
    isSavingCheckin, setIsSavingCheckin,
    pendingCheckinVibe, setPendingCheckinVibe,
    isSubmittingCheckinVibe, setIsSubmittingCheckinVibe,
    checkinVibeCooldownUntil, setCheckinVibeCooldownUntil,
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
  const [tripWorkspaceMode, setTripWorkspaceMode] = useState("home");
  const [pendingTripItem, setPendingTripItem] = useState(null);
  const handledTripAddRef = useRef("");
  const [showSecondaryPanels, setShowSecondaryPanels] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("about");
  const [myMapView, setMyMapView] = useState("checkins");
  const [selectedTripMapId, setSelectedTripMapId] = useState(null);
  const [isCheckinComposerOpen, setIsCheckinComposerOpen] = useState(false);
  const [checkinMapReadyTick, setCheckinMapReadyTick] = useState(0);
  const [calendarReminderByEventId, setCalendarReminderByEventId] = useState(() =>
    readLocalJson(FAVORITES_CALENDAR_REMINDER_STORAGE_KEY, {})
  );
  const [personalCalendarItems, setPersonalCalendarItems] = useState(() =>
    (readLocalJson(FAVORITES_PERSONAL_CALENDAR_STORAGE_KEY, []) || [])
      .map((item) => normalizePersonalCalendarItem(item))
      .filter(Boolean)
  );
  const [selectedCalendarDateKey, setSelectedCalendarDateKey] = useState(() =>
    formatCalendarDateKey(new Date())
  );
  const [calendarMonthKey, setCalendarMonthKey] = useState(() => getCalendarMonthKey(new Date()));
  const [calendarView, setCalendarView] = useState(() => {
    const storedView = readLocalJson(FAVORITES_CALENDAR_VIEW_STORAGE_KEY, "agenda");
    return storedView === "month" ? "month" : "agenda";
  });
  const [calendarGoingByEventId, setCalendarGoingByEventId] = useState(() =>
    readLocalJson(FAVORITES_CALENDAR_GOING_STORAGE_KEY, {}) || {}
  );
  const [calendarPushState, setCalendarPushState] = useState("idle");
  const [calendarItemForm, setCalendarItemForm] = useState(() => ({
    title: "",
    type: "plan",
    date: formatCalendarDateKey(new Date()),
    time: "",
    city: "",
    notes: "",
    reminderMode: "off",
  }));
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
  const [profileMemories, setProfileMemories] = useState(() =>
    readLocalJson(FAVORITES_PROFILE_MEMORIES_STORAGE_KEY, [])
  );
  const [viewedProfile, setViewedProfile] = useState(null);
  const [viewedProfileLoading, setViewedProfileLoading] = useState(false);
  const [viewedProfileError, setViewedProfileError] = useState("");
  const [viewedProfileMemories, setViewedProfileMemories] = useState([]);
  const [viewedProfileMemoriesLoading, setViewedProfileMemoriesLoading] = useState(false);
  const [profileStories, setProfileStories] = useState([]);
  const [viewedProfileStories, setViewedProfileStories] = useState([]);
  const [profileStoriesLoading, setProfileStoriesLoading] = useState(false);
  const [showProfileStoryForm, setShowProfileStoryForm] = useState(false);
  const [profileStoryForm, setProfileStoryForm] = useState({
    title: "",
    city: "",
    category: "Profile",
    excerpt: "",
    body: "",
  });
  const [viewedProfileFriends, setViewedProfileFriends] = useState([]);
  const [viewedProfileFriendsLoading, setViewedProfileFriendsLoading] = useState(false);
  const [viewedMemberRank, setViewedMemberRank] = useState(null);
  const [viewedContributionCounts, setViewedContributionCounts] = useState({
    stories: 0,
    guides: 0,
    ideas: 0,
    topics: 0,
    total: 0,
  });
  const [ownContributionCounts, setOwnContributionCounts] = useState({
    stories: 0,
    guides: 0,
    ideas: 0,
    topics: 0,
    total: 0,
  });
  const tonightSectionRef = useRef(null);
  const tripSectionRef = useRef(null);
  const favoritesControlsRef = useRef(null);
  const favoritesControlButtonsRef = useRef({});
  const avatarFileInputRef = useRef(null);
  const memoryFileInputRef = useRef(null);
  const mapboxGlRef = useRef(null);
  const viewedMemberId = String(profileRouteParams.member || "").trim();
  const viewedMemberNameParam = String(profileRouteParams.memberName || "").trim();
  const viewedMemberAvatarParam = String(profileRouteParams.memberAvatar || "").trim();
  const viewedTab = String(profileRouteParams.tab || "").trim().toLowerCase();
  const isViewingAnotherMember = Boolean(viewedMemberId && viewedMemberId !== String(user?.id || ""));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncRouteParams = () => {
      const params = new URLSearchParams(window.location.search || "");
      setProfileRouteParams({
        member: String(params.get("member") || "").trim(),
        memberName: String(params.get("member_name") || "").trim(),
        memberAvatar: String(params.get("member_avatar") || "").trim(),
        tab: String(params.get("tab") || "").trim(),
      });
    };
    queueMicrotask(syncRouteParams);
    window.addEventListener("popstate", syncRouteParams);
    return () => window.removeEventListener("popstate", syncRouteParams);
  }, []);

  useEffect(() => {
    if (viewedTab === "about") {
      queueMicrotask(() => {
        setActiveProfileTab("about");
      });
    }
  }, [viewedTab]);

  useEffect(() => {
    if (!isViewingAnotherMember) return;
    queueMicrotask(() => {
      setIsEditingAbout(false);
      setIsEditingProfile(false);
    });
  }, [isViewingAnotherMember, setIsEditingAbout, setIsEditingProfile]);

  useEffect(() => {
    let active = true;

    if (isAuthLoading || !isMember) {
      queueMicrotask(() => {
        setViewedProfile(null);
        setViewedProfileLoading(false);
        setViewedProfileError("");
        setViewedMemberRank(null);
        setViewedContributionCounts({
          stories: 0,
          guides: 0,
          ideas: 0,
          topics: 0,
          total: 0,
        });
      });
      return () => {
        active = false;
      };
    }

    if (!isViewingAnotherMember) {
      queueMicrotask(() => {
        setViewedProfile(null);
        setViewedProfileLoading(false);
        setViewedProfileError("");
        setViewedMemberRank(null);
        setViewedContributionCounts({
          stories: 0,
          guides: 0,
          ideas: 0,
          topics: 0,
          total: 0,
        });
      });
      return () => {
        active = false;
      };
    }

    queueMicrotask(() => {
      setViewedProfile({
        userId: viewedMemberId,
        displayName: viewedMemberNameParam || "Member",
        pronouns: "",
        homeCity: "",
        residentCountry: "",
        about: "",
        vibe: "",
        visibility: "members",
        avatarUrl: viewedMemberAvatarParam,
        createdAt: "",
      });
    });
    queueMicrotask(() => {
      setViewedProfileLoading(true);
      setViewedProfileError("");
    });

    queueMicrotask(async () => {
      let profileRes = await supabase
        .from("member_profiles")
        .select("user_id, display_name, pronouns, home_city, resident_country, about, vibe, visibility, avatar_url, avatar_path, created_at")
        .eq("user_id", viewedMemberId)
        .maybeSingle();
      if (profileRes.error) {
        profileRes = await supabase
          .from("member_profiles")
          .select("user_id, display_name, pronouns, home_city, resident_country, about, vibe, visibility, avatar_url, avatar_path")
          .eq("user_id", viewedMemberId)
          .maybeSingle();
      }
      const { data, error } = profileRes;

      if (!active) return;

      if (error || !data) {
        setViewedProfileLoading(false);
        setViewedProfileError("Profile opened, but some member details are private or unavailable.");
        return;
      }

      setViewedProfile({
        userId: String(data.user_id || viewedMemberId),
        displayName: String(data.display_name || viewedMemberNameParam || "Member"),
        pronouns: String(data.pronouns || ""),
        homeCity: String(data.home_city || ""),
        residentCountry: String(data.resident_country || ""),
        about: String(data.about || ""),
        vibe: String(data.vibe || ""),
        visibility: String(data.visibility || "members"),
        avatarUrl: resolveAvatarUrlFromRow(data) || viewedMemberAvatarParam,
        createdAt: String(data.created_at || ""),
      });
      setViewedProfileLoading(false);
      setViewedProfileError("");
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember, isViewingAnotherMember, viewedMemberAvatarParam, viewedMemberId, viewedMemberNameParam, user?.id]);

  useEffect(() => {
    let active = true;
    if (isAuthLoading || !isMember || !isViewingAnotherMember || !viewedMemberId) {
      queueMicrotask(() => {
        setViewedMemberRank(null);
        setViewedContributionCounts({
          stories: 0,
          guides: 0,
          ideas: 0,
          topics: 0,
          total: 0,
        });
      });
      return () => {
        active = false;
      };
    }

    queueMicrotask(async () => {
      const leaderboardPromise = supabase
        .from("qa_member_leaderboard")
        .select("*")
        .eq("user_id", viewedMemberId)
        .maybeSingle();

      const countStoriesPromise = supabase
        .from("community_stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", viewedMemberId);
      const countGuidesPromise = supabase
        .from("community_guides")
        .select("*", { count: "exact", head: true })
        .eq("user_id", viewedMemberId);
      const countIdeasPromise = supabase
        .from("community_ideas")
        .select("*", { count: "exact", head: true })
        .eq("user_id", viewedMemberId);
      const countTopicsPromise = supabase
        .from("community_topics")
        .select("*", { count: "exact", head: true })
        .eq("user_id", viewedMemberId);

      const [leaderboardRes, storiesRes, guidesRes, ideasRes, topicsRes] = await Promise.all([
        leaderboardPromise,
        countStoriesPromise,
        countGuidesPromise,
        countIdeasPromise,
        countTopicsPromise,
      ]);

      if (!active) return;

      setViewedMemberRank(leaderboardRes?.error ? null : leaderboardRes?.data || null);

      const stories = Number(storiesRes?.count || 0);
      const guides = Number(guidesRes?.count || 0);
      const ideas = Number(ideasRes?.count || 0);
      const topics = Number(topicsRes?.count || 0);
      const total = stories + guides + ideas + topics;

      if (
        storiesRes?.error ||
        guidesRes?.error ||
        ideasRes?.error ||
        topicsRes?.error
      ) {
        const fallbackTotal = Number(leaderboardRes?.data?.score || 0);
        setViewedContributionCounts({
          stories: 0,
          guides: 0,
          ideas: 0,
          topics: 0,
          total: Number.isFinite(fallbackTotal) ? fallbackTotal : 0,
        });
        return;
      }

      setViewedContributionCounts({ stories, guides, ideas, topics, total });
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember, isViewingAnotherMember, viewedMemberId]);

  const currentUserId = String(user?.id || "");
  const loadOwnContributionCounts = useCallback(async () => {
    if (!isReady || !isMember || !currentUserId) {
      setOwnContributionCounts({ stories: 0, guides: 0, ideas: 0, topics: 0, total: 0 });
      return;
    }

    const userId = currentUserId;
    const displayName = String(memberProfile?.displayName || authMemberName || memberName || "")
      .trim()
      .toLowerCase();

    const countRowsForTable = async (table) => {
      let response = await supabase
        .from(table)
        .select("id,user_id,author")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (response.error && isCommunityContributionSchemaError(response.error)) {
        response = await supabase
          .from(table)
          .select("id,author")
          .order("created_at", { ascending: false })
          .limit(1000);
      }

      if (response.error) return null;

      const seen = new Set();
      (Array.isArray(response.data) ? response.data : []).forEach((row) => {
        const id = String(row?.id || "");
        if (!id) return;
        const rowUserId = String(row?.user_id || "").trim();
        const rowAuthor = String(row?.author || "").trim().toLowerCase();
        if (rowUserId === userId || (displayName && rowAuthor === displayName)) {
          seen.add(id);
        }
      });
      return seen.size;
    };

    const [stories, guides, ideas, topics] = await Promise.all([
      countRowsForTable("community_stories"),
      countRowsForTable("community_guides"),
      countRowsForTable("community_ideas"),
      countRowsForTable("community_topics"),
    ]);

    if ([stories, guides, ideas, topics].some((value) => value === null)) {
      const localStories = readLocalJson("qa_community_stories", []);
      const localGuides = readLocalJson("qa_community_guides", []);
      const localIdeas = readLocalJson("qa_community_ideas", []);
      const localTopics = readLocalJson("qa_community_topics", []);
      setOwnContributionCounts(
        computeContributionCountsFromCollections({
          stories: localStories,
          guides: localGuides,
          ideas: localIdeas,
          topics: localTopics,
          memberIdentity: memberProfile?.displayName || authMemberName || memberName || "",
        })
      );
      return;
    }

    const nextCounts = {
      stories: Number(stories || 0),
      guides: Number(guides || 0),
      ideas: Number(ideas || 0),
      topics: Number(topics || 0),
    };
    setOwnContributionCounts({
      ...nextCounts,
      total: nextCounts.stories + nextCounts.guides + nextCounts.ideas + nextCounts.topics,
    });
  }, [authMemberName, currentUserId, isMember, isReady, memberName, memberProfile?.displayName]);

  useEffect(() => {
    if (!isReady || !isMember || !currentUserId) return;
    let active = true;
    queueMicrotask(async () => {
      await loadOwnContributionCounts();
      if (!active) return;
    });
    return () => {
      active = false;
    };
  }, [currentUserId, isMember, isReady, loadOwnContributionCounts]);

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
  }, [setCheckins, setCheckinsWarning, user]);

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
  }, [isMember, setFollowingFeedRows, setFollowingUserIds, setNetworkLoading, setNetworkMembers, setNetworkWarning, user]);

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
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(FAVORITES_PROFILE_EXTRAS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      queueMicrotask(() => {
        setProfileExtras(sanitizeProfileExtras(parsed));
      });
    } catch {
      // Ignore malformed local profile extras payload.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(FAVORITES_PROFILE_MEMORIES_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        queueMicrotask(() => {
          setProfileMemories(parsed.slice(0, 5));
        });
      }
    } catch {
      // Ignore malformed local memory payload.
    }
  }, []);

  useEffect(() => {
    if (!isReady || !isMember || !user?.id) return;
    let cancelled = false;
    queueMicrotask(async () => {
      const { data, error } = await supabase
        .from("qa_member_profile_memories")
        .select("id,user_id,image_url,storage_path,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (cancelled) return;
      if (error) {
        if (!isProfileMemoriesTableMissingError(error)) {
          showToast("Could not sync memories from cloud. Using local data.", { tone: "info", duration: 2400 });
        }
        return;
      }
      const normalized = (Array.isArray(data) ? data : [])
        .map((row) => ({
          id: String(row?.id || ""),
          url: String(row?.image_url || "").trim(),
          storagePath: String(row?.storage_path || "").trim(),
          createdAt: String(row?.created_at || ""),
        }))
        .filter((row) => row.id && row.url)
        .slice(0, 5);
      setProfileMemories(normalized);
      writeLocalJson(FAVORITES_PROFILE_MEMORIES_STORAGE_KEY, normalized);
    });
    return () => {
      cancelled = true;
    };
  }, [isMember, isReady, showToast, user?.id]);

  useEffect(() => {
    let cancelled = false;

    if (isAuthLoading || !isMember) {
      queueMicrotask(() => {
        setViewedProfileMemories([]);
        setViewedProfileMemoriesLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    if (!isViewingAnotherMember || !viewedMemberId) {
      queueMicrotask(() => {
        setViewedProfileMemories([]);
        setViewedProfileMemoriesLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      setViewedProfileMemoriesLoading(true);
    });
    queueMicrotask(async () => {
      const { data, error } = await supabase
        .from("qa_member_profile_memories")
        .select("id,user_id,image_url,storage_path,created_at")
        .eq("user_id", viewedMemberId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (cancelled) return;
      if (error) {
        setViewedProfileMemories([]);
        setViewedProfileMemoriesLoading(false);
        return;
      }
      const normalized = (Array.isArray(data) ? data : [])
        .map((row) => ({
          id: String(row?.id || ""),
          url: String(row?.image_url || "").trim(),
          storagePath: String(row?.storage_path || "").trim(),
          createdAt: String(row?.created_at || ""),
        }))
        .filter((row) => row.id && row.url)
        .slice(0, 5);
      setViewedProfileMemories(normalized);
      setViewedProfileMemoriesLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isMember, isViewingAnotherMember, viewedMemberId, user?.id]);

  useEffect(() => {
    let cancelled = false;
    const targetUserId = isViewingAnotherMember ? viewedMemberId : String(user?.id || "");

    if (!isReady || !isMember || !targetUserId) {
      queueMicrotask(() => {
        setProfileStories([]);
        setViewedProfileStories([]);
        setProfileStoriesLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      setProfileStoriesLoading(true);
    });

    queueMicrotask(async () => {
      const { data, error } = await supabase
        .from("community_stories")
        .select("id,user_id,title,city,author,category,excerpt,body,created_at")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (cancelled) return;

      if (error) {
        const localStories = readLocalJson("qa_community_stories", [])
          .map(mapProfileStoryRow)
          .filter((story) => {
            if (isViewingAnotherMember) return false;
            const nameKey = String(story.author || "").trim().toLowerCase();
            const myNameKey = String(memberProfile?.displayName || authMemberName || memberName || "").trim().toLowerCase();
            return nameKey && myNameKey && nameKey === myNameKey;
          })
          .slice(0, 6);
        if (isViewingAnotherMember) {
          setViewedProfileStories([]);
        } else {
          setProfileStories(localStories);
        }
        setProfileStoriesLoading(false);
        return;
      }

      const normalized = (Array.isArray(data) ? data : [])
        .map(mapProfileStoryRow)
        .filter((story) => story.id && story.title)
        .slice(0, 6);

      if (isViewingAnotherMember) {
        setViewedProfileStories(normalized);
      } else {
        setProfileStories(normalized);
      }
      setProfileStoriesLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    authMemberName,
    isMember,
    isReady,
    isViewingAnotherMember,
    memberName,
    memberProfile?.displayName,
    user?.id,
    viewedMemberId,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (!isReady || !isMember || !isViewingAnotherMember || !viewedMemberId) {
      queueMicrotask(() => {
        setViewedProfileFriends([]);
        setViewedProfileFriendsLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      setViewedProfileFriendsLoading(true);
    });

    queueMicrotask(async () => {
      const { data, error } = await supabase
        .from("member_following")
        .select("follower_user_id,followed_user_id,created_at")
        .or(`follower_user_id.eq.${viewedMemberId},followed_user_id.eq.${viewedMemberId}`)
        .limit(12);

      if (cancelled) return;
      if (error) {
        setViewedProfileFriends([]);
        setViewedProfileFriendsLoading(false);
        return;
      }

      const friendIds = [
        ...new Set(
          (Array.isArray(data) ? data : [])
            .map((row) => {
              const follower = String(row?.follower_user_id || "");
              const followed = String(row?.followed_user_id || "");
              return follower === viewedMemberId ? followed : follower;
            })
            .filter((id) => id && id !== viewedMemberId)
        ),
      ].slice(0, 8);

      if (friendIds.length === 0) {
        setViewedProfileFriends([]);
        setViewedProfileFriendsLoading(false);
        return;
      }

      let profilesRes = await supabase
        .from("member_profiles")
        .select("user_id,display_name,home_city,avatar_url,avatar_path")
        .in("user_id", friendIds);

      if (profilesRes.error && isAvatarColumnMissingError(profilesRes.error)) {
        profilesRes = await supabase
          .from("member_profiles")
          .select("user_id,display_name,home_city,avatar_path")
          .in("user_id", friendIds);
      }

      if (cancelled) return;

      const profileRows = profilesRes.error || !Array.isArray(profilesRes.data) ? [] : profilesRes.data;
      const mapped = friendIds.map((id) => {
        const profile = profileRows.find((row) => String(row?.user_id || "") === id) || {};
        return {
          userId: id,
          displayName: String(profile?.display_name || "Member").trim() || "Member",
          homeCity: String(profile?.home_city || "").trim(),
          avatarUrl: resolveAvatarUrlFromRow(profile),
        };
      });
      setViewedProfileFriends(mapped);
      setViewedProfileFriendsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isMember, isReady, isViewingAnotherMember, viewedMemberId]);

  useEffect(() => {
    const remoteExtras = sanitizeProfileExtras({
      about: memberProfile?.about,
      visibility: memberProfile?.visibility,
      birthday: memberProfile?.birthday,
      vibe: memberProfile?.vibe,
      phone: memberProfile?.phone,
      contactEmail: memberProfile?.contactEmail,
    });
    queueMicrotask(() => {
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
    queueMicrotask(() => {
      setProfileAvatarDataUrl(remoteAvatar || "");
    });
  }, [memberProfile?.avatarUrl]);

  useEffect(() => {
    queueMicrotask(() => {
      setProfileAvatarLoadFailed(false);
    });
  }, [profileAvatarDataUrl, viewedProfile?.avatarUrl]);

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
    const referenceTs = Number(nowTs || 0);
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
  const planCalendarEntries = useMemo(() => {
    return (plans || [])
      .map((plan) => {
        const dateKey = getCalendarDateKey(plan?.date);
        if (!dateKey) return null;
        return {
          id: `plan-${String(plan.id || dateKey)}`,
          sourceId: String(plan.id || ""),
          kind: "plan",
          title: plan.title || "Saved trip plan",
          city: plan.city || "",
          dateKey,
          time: "",
          reminderMode: "off",
          stopsCount: Array.isArray(plan.stops) ? plan.stops.length : 0,
          raw: plan,
        };
      })
      .filter(Boolean);
  }, [plans]);
  const personalCalendarEntries = useMemo(() => {
    return (personalCalendarItems || [])
      .map((item) => ({
        id: item.id,
        sourceId: item.id,
        kind: "personal",
        title: item.title,
        city: item.city,
        dateKey: item.date,
        time: item.time,
        type: item.type,
        notes: item.notes,
        reminderMode: item.reminderMode,
        raw: item,
      }))
      .filter((item) => item.dateKey);
  }, [personalCalendarItems]);
  const unifiedCalendarEntries = useMemo(() => {
    const eventEntries = calendarEvents.map((event) => ({
      id: `event-${String(event.id || event.name || event.date)}`,
      sourceId: String(event.id || ""),
      kind: "event",
      title: event.name || "Saved event",
      city: event.city || "",
      dateKey: event.calendarDate.toISOString().slice(0, 10),
      time: String(event.time || event.start_time || "").slice(0, 5),
      reminderMode: String(calendarReminderByEventId?.[String(event.id || "")] || "off"),
      status: calendarGoingByEventId?.[String(event.id || "")] ? "going" : "saved",
      raw: event,
    }));
    return [...eventEntries, ...planCalendarEntries, ...personalCalendarEntries].sort((a, b) => {
      const dateCompare = String(a.dateKey || "").localeCompare(String(b.dateKey || ""));
      if (dateCompare !== 0) return dateCompare;
      return String(a.time || "99:99").localeCompare(String(b.time || "99:99"));
    });
  }, [calendarEvents, calendarGoingByEventId, calendarReminderByEventId, personalCalendarEntries, planCalendarEntries]);
  const calendarEntriesByDate = useMemo(() => {
    const lookup = new Map();
    unifiedCalendarEntries.forEach((entry) => {
      const key = String(entry.dateKey || "");
      if (!key) return;
      if (!lookup.has(key)) lookup.set(key, []);
      lookup.get(key).push(entry);
    });
    return lookup;
  }, [unifiedCalendarEntries]);
  const calendarMonthCells = useMemo(
    () => buildCalendarMonthCells(calendarMonthKey),
    [calendarMonthKey]
  );
  const selectedCalendarEntries = useMemo(
    () => calendarEntriesByDate.get(selectedCalendarDateKey) || [],
    [calendarEntriesByDate, selectedCalendarDateKey]
  );
  const reminderCalendarEntries = useMemo(
    () => unifiedCalendarEntries.filter((entry) => String(entry.reminderMode || "off") !== "off"),
    [unifiedCalendarEntries]
  );
  const calendarAgendaGroups = useMemo(() => {
    const groups = new Map();
    unifiedCalendarEntries
      .filter((entry) => String(entry.dateKey || "") >= todayDateKey)
      .forEach((entry) => {
        if (!groups.has(entry.dateKey)) groups.set(entry.dateKey, []);
        groups.get(entry.dateKey).push(entry);
      });
    return Array.from(groups, ([dateKey, entries]) => ({ dateKey, entries })).slice(0, 16);
  }, [todayDateKey, unifiedCalendarEntries]);
  const calendarDateStrip = useMemo(() => {
    const today = new Date(`${todayDateKey}T12:00:00`);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        dateKey: formatCalendarDateKey(date),
        weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
        day: date.getDate(),
      };
    });
  }, [todayDateKey]);

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

  const selectedMapTrip = useMemo(
    () => (plans || []).find((plan) => String(plan.id) === String(selectedTripMapId)) || plans?.[0] || null,
    [plans, selectedTripMapId]
  );

  const tripMapMarkers = useMemo(() => {
    if (!selectedMapTrip) return [];
    return (selectedMapTrip.stops || []).flatMap((stop, index) => {
      const source = stop.type === "event"
        ? (events || []).find((item) => String(item.id) === String(stop.id))
        : (places || []).find((item) => String(item.id) === String(stop.id));
      const lat = Number(source?.lat ?? source?.latitude);
      const lng = Number(source?.lng ?? source?.longitude ?? source?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
      return [{
        id: `trip-${selectedMapTrip.id}-${index}`,
        sourceId: stop.id,
        sourceType: stop.type,
        label: stop.name || source?.name || "Trip stop",
        city: stop.city || selectedMapTrip.city || "",
        markerLat: lat,
        markerLng: lng,
        tripStopNumber: index + 1,
        time: stop.time || null,
      }];
    });
  }, [events, places, selectedMapTrip]);

  const checkinMarkers = useMemo(
    () => (
      myMapView === "saved"
        ? savedPlaceMapMarkers
        : myMapView === "trips"
          ? tripMapMarkers
          : buildCheckinMarkers({
            checkins: filteredRecentCheckins,
            atlasPlaces: places,
            atlasEvents: events,
            savedPlaces,
            savedEvents,
          })
    ),
    [events, filteredRecentCheckins, myMapView, places, savedEvents, savedPlaceMapMarkers, savedPlaces, tripMapMarkers]
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
      markerKind: myMapView === "saved" ? "saved" : myMapView === "trips" ? "trip" : "mine",
    }));
    const friends = followingCheckinMarkers.map((item) => ({
      ...item,
      markerId: `friend-${String(item.id)}`,
      markerKind: "friend",
    }));
    return [...mine, ...friends];
  }, [checkinMarkers, followingCheckinMarkers, myMapView]);

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
    let isCancelled = false;
    if (!isMapTabActive) {
      if (checkinMapRef.current) {
        checkinMapMarkersRef.current.forEach((marker) => marker.remove());
        checkinMapMarkersRef.current = [];
        checkinMapRef.current.remove();
        checkinMapRef.current = null;
      }
      return;
    }
    let map = null;

    (async () => {
      try {
        const mapboxgl = await loadMapboxGl();
        if (isCancelled) return;
        mapboxGlRef.current = mapboxgl;

        const readiness = evaluateMapInitReadiness({
          mapboxgl,
          isMapboxStylesReady,
          mapboxToken,
          container: checkinMapContainerRef.current,
          mapInstance: checkinMapRef.current,
          requireWebGl: true,
        });
        if (!readiness.ready) {
          if (shouldTriggerMapFallback(readiness.reason)) {
            setCheckinMapLoadFailed(true);
          }
          return;
        }

        mapboxgl.accessToken = mapboxToken;
        const center = checkinMapCenter
          ? [Number(checkinMapCenter.lng), Number(checkinMapCenter.lat)]
          : [11, 20];
        const zoom = checkinMapCenter ? 4.2 : 2;
        map = new mapboxgl.Map({
          container: checkinMapContainerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center,
          zoom,
          projection: "mercator",
          attributionControl: false,
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        map.on("load", () => {
          if (isCancelled) return;
          map.resize();
          setCheckinMapReadyTick((tick) => tick + 1);
        });
        checkinMapRef.current = map;
      } catch {
        if (!isCancelled) {
          setCheckinMapLoadFailed(true);
        }
      }
    })();

    return () => {
      isCancelled = true;
      checkinMapMarkersRef.current.forEach((marker) => marker.remove());
      checkinMapMarkersRef.current = [];
      if (map) {
        map.remove();
      }
      checkinMapRef.current = null;
    };
  }, [
    checkinMapCenter,
    checkinMapContainerRef,
    setCheckinMapLoadFailed,
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
    const mapboxgl = mapboxGlRef.current;
    if (!map || !mapboxgl) return;

    checkinMapMarkersRef.current.forEach((marker) => marker.remove());
    checkinMapMarkersRef.current = [];
    const isMapStyleReady = map.isStyleLoaded();
    if (isMapStyleReady && map.getLayer("qa-trip-route")) map.removeLayer("qa-trip-route");
    if (isMapStyleReady && map.getSource("qa-trip-route")) map.removeSource("qa-trip-route");

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
      markerEl.style.width = point.markerKind === "trip" ? "28px" : "14px";
      markerEl.style.height = point.markerKind === "trip" ? "28px" : "14px";
      markerEl.style.borderRadius = "9999px";
      markerEl.style.border = "2px solid rgba(255,255,255,0.85)";
      markerEl.style.background =
        point.markerKind === "trip"
          ? "#f5a9c6"
          : point.markerKind === "saved"
          ? "#34d399"
          : point.markerKind === "friend"
            ? "#fbbf24"
            : "#f472b6";
      markerEl.style.boxShadow =
        point.markerKind === "saved"
          ? "0 0 0 2px rgba(0,0,0,0.42), 0 0 18px rgba(52,211,153,0.42)"
          : "0 0 0 2px rgba(0,0,0,0.42), 0 0 18px rgba(244,114,182,0.36)";
      markerEl.style.cursor = "pointer";
      if (point.markerKind === "trip") {
        markerEl.textContent = String(point.tripStopNumber || "");
        markerEl.style.color = "#24131d";
        markerEl.style.fontSize = "11px";
        markerEl.style.fontWeight = "800";
      }
      markerEl.style.transform = String(selectedCheckinId) === String(point.id) ? "scale(1.2)" : "scale(1)";
      markerEl.title = String(point.label || point.ownerName || "Check-in");
      markerEl.addEventListener("click", () => {
        if (["mine", "saved", "trip"].includes(point.markerKind)) {
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

    const tripCoordinates = interactiveCheckinPoints
      .filter((point) => point.markerKind === "trip")
      .sort((a, b) => Number(a.tripStopNumber) - Number(b.tripStopNumber))
      .map((point) => [Number(point.markerLng), Number(point.markerLat)])
      .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
    if (isMapStyleReady && tripCoordinates.length > 1 && !map.getSource("qa-trip-route")) {
      map.addSource("qa-trip-route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: tripCoordinates } },
      });
      map.addLayer({
        id: "qa-trip-route",
        type: "line",
        source: "qa-trip-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#f5a9c6", "line-width": 3, "line-opacity": 0.72, "line-dasharray": [1.5, 1.2] },
      });
    }

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
  }, [checkinMapCenter, checkinMapMarkersRef, checkinMapRef, interactiveCheckinPoints, selectedCheckinId, setSelectedCheckinId, checkinMapReadyTick]);

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
  const followingProfiles = useMemo(() => {
    if (activeProfileTab !== "about") return [];
    return computeFollowingProfiles({
      followingUserIds,
      followingFeedRows,
      networkMembers,
    });
  }, [activeProfileTab, followingFeedRows, followingUserIds, networkMembers]);
  const momentumMilestones = useMemo(() => {
    return computeMomentumMilestones({
      checkins,
      totalPlaces,
      normalizeCityKey,
    });
  }, [checkins, totalPlaces]);

  const saveProfile = async (event) => {
    event.preventDefault();
    const sanitizedExtras = sanitizeProfileExtras(profileExtras);
    const result = await updateMemberProfile({
      ...profileForm,
      ...sanitizedExtras,
    });
    setProfileExtras(sanitizedExtras);
    writeLocalJson(FAVORITES_PROFILE_EXTRAS_STORAGE_KEY, sanitizedExtras);
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
  const openMemoriesEditor = () => {
    if (isReadOnlyPublicProfileView) return;
    memoryFileInputRef.current?.click();
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

  const onProfileMemoriesSelected = async (event) => {
    if (isReadOnlyPublicProfileView) return;
    const files = Array.from(event?.target?.files || []).filter((file) =>
      String(file?.type || "").startsWith("image/")
    );
    if (!user?.id) {
      showToast("Join as member to upload memories.", { tone: "info", duration: 2200 });
      return;
    }
    if (files.length === 0) {
      showToast("Choose at least one image.", { tone: "warn", duration: 1800 });
      return;
    }
    if ((profileMemories?.length || 0) >= 5) {
      showToast("Memory limit reached (5).", { tone: "warn", duration: 1800 });
      return;
    }
    const allowedCount = Math.max(0, 5 - (profileMemories?.length || 0));
    const uploadBatch = files.slice(0, allowedCount);
    const nextItems = [...(profileMemories || [])];
    const insertedRows = [];

    for (let idx = 0; idx < uploadBatch.length; idx += 1) {
      const file = uploadBatch[idx];
      const mime = String(file.type || "").toLowerCase();
      const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "jpg";
      const memoryOwner = String(effectiveDisplayName || "queer-atlas-member")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "queer-atlas-member";
      const path = `${String(user.id)}/memories/${memoryOwner}-travel-memory-${Date.now()}-${idx + 1}.${ext}`;
      const uploadRes = await supabase.storage
        .from(MEMBER_AVATAR_BUCKET)
        .upload(path, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type || "image/jpeg",
        });
      if (uploadRes.error) continue;
      const publicUrl = supabase.storage.from(MEMBER_AVATAR_BUCKET).getPublicUrl(path)?.data?.publicUrl || "";
      if (!publicUrl) continue;
      const createdAtIso = new Date().toISOString();
      const localEntry = {
        id: `memory-local-${Date.now()}-${idx}`,
        url: publicUrl,
        storagePath: path,
        createdAt: createdAtIso,
      };
      nextItems.push(localEntry);
      insertedRows.push({
        user_id: user.id,
        image_url: publicUrl,
        storage_path: path,
        created_at: createdAtIso,
      });
    }

    if (insertedRows.length > 0) {
      const { error } = await supabase.from("qa_member_profile_memories").insert(insertedRows);
      if (error && !isProfileMemoriesTableMissingError(error)) {
        showToast("Memories uploaded, but cloud list sync failed.", { tone: "info", duration: 2200 });
      }
    }

    const { data: cloudRows, error: loadCloudError } = await supabase
      .from("qa_member_profile_memories")
      .select("id,user_id,image_url,storage_path,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const limited = !loadCloudError && Array.isArray(cloudRows)
      ? cloudRows
          .map((row) => ({
            id: String(row?.id || ""),
            url: String(row?.image_url || "").trim(),
            storagePath: String(row?.storage_path || "").trim(),
            createdAt: String(row?.created_at || ""),
          }))
          .filter((row) => row.id && row.url)
          .slice(0, 5)
      : nextItems.slice(0, 5);

    setProfileMemories(limited);
    writeLocalJson(FAVORITES_PROFILE_MEMORIES_STORAGE_KEY, limited);
    if (event?.target) {
      event.target.value = "";
    }
    showToast("Memories updated.", { tone: "ok", duration: 1800 });
  };

  const removeProfileMemory = (memoryId) => {
    if (isReadOnlyPublicProfileView) return;
    const target = (profileMemories || []).find((item) => String(item?.id) === String(memoryId));
    const next = (profileMemories || []).filter((item) => String(item?.id) !== String(memoryId));
    setProfileMemories(next);
    writeLocalJson(FAVORITES_PROFILE_MEMORIES_STORAGE_KEY, next);
    queueMicrotask(async () => {
      if (!user?.id || !target) return;
      const idValue = String(target.id || "").trim();
      if (idValue && !idValue.startsWith("memory-local-")) {
        await supabase
          .from("qa_member_profile_memories")
          .delete()
          .eq("id", idValue)
          .eq("user_id", user.id);
      } else if (String(target.storagePath || "").trim()) {
        await supabase
          .from("qa_member_profile_memories")
          .delete()
          .eq("user_id", user.id)
          .eq("storage_path", String(target.storagePath || "").trim());
      }
    });
  };

  const publishProfileStory = async (event) => {
    event.preventDefault();
    const title = String(profileStoryForm.title || "").trim();
    const city = String(profileStoryForm.city || profileForm.homeCity || memberProfile?.homeCity || "").trim();
    const body = String(profileStoryForm.body || "").trim();
    if (!title || !body) {
      showToast("Add a title and story before publishing.", { tone: "warn", duration: 2200 });
      return;
    }

    const excerpt = String(profileStoryForm.excerpt || body.slice(0, 140)).trim();
    const fallbackItem = mapProfileStoryRow({
      id: createProfileClientId("story-local"),
      user_id: user?.id || "",
      title,
      city,
      author: memberProfile?.displayName || authMemberName || memberName || "Member",
      category: profileStoryForm.category || "Profile",
      excerpt,
      body,
      created_at: new Date().toISOString(),
    });

    let syncedItem = null;
    let insertError = null;

    if (user?.id) {
      const payload = {
        user_id: user.id,
        title,
        city,
        author: memberProfile?.displayName || authMemberName || memberName || "Member",
        category: profileStoryForm.category || "Profile",
        excerpt,
        body,
      };
      let res = await supabase.from("community_stories").insert([payload]).select("*").single();

      if (res.error && isProfileStoryUserIdMissingError(res.error)) {
        const legacyPayload = { ...payload };
        delete legacyPayload.user_id;
        res = await supabase.from("community_stories").insert([legacyPayload]).select("*").single();
      }

      insertError = res.error || null;
      if (!res.error && res.data) {
        syncedItem = mapProfileStoryRow(res.data);
      }
    }

    const item = syncedItem || fallbackItem;
    setProfileStories((current) => [item, ...(current || [])].slice(0, 6));
    const localStories = readLocalJson("qa_community_stories", []);
    writeLocalJson("qa_community_stories", [item, ...localStories].slice(0, 80));
    setProfileStoryForm({ title: "", city: "", category: "Profile", excerpt: "", body: "" });
    setShowProfileStoryForm(false);
    showToast(insertError ? "Story saved locally. Cloud sync unavailable." : "Story added to your profile.", {
      tone: insertError ? "info" : "ok",
      duration: 2300,
    });
    queueMicrotask(() => {
      loadOwnContributionCounts();
    });
  };

  const hasProfileChanges = hasProfileFormChanges(profileForm, memberProfile || {});
  const greeting = resolveGreetingByHour();
  const displayName = resolveMemberDisplayName(memberName);
  const viewedDisplayName = String(viewedProfile?.displayName || viewedMemberNameParam || "Member").trim() || "Member";
  const effectiveDisplayName = isViewingAnotherMember ? viewedDisplayName : displayName;
  const effectivePronouns = isViewingAnotherMember ? String(viewedProfile?.pronouns || "") : String(memberProfile?.pronouns || "");
  const effectiveHomeCity = isViewingAnotherMember ? String(viewedProfile?.homeCity || "") : String(memberProfile?.homeCity || "");
  const effectiveResidentCountry = isViewingAnotherMember ? String(viewedProfile?.residentCountry || "") : String(memberProfile?.residentCountry || "");
  const effectiveAbout = isViewingAnotherMember
    ? String(viewedProfile?.about || "").trim()
    : String(profileExtras.about || "").trim();
  const effectiveVibe = isViewingAnotherMember
    ? String(viewedProfile?.vibe || "").trim()
    : String(profileExtras.vibe || "").trim();
  const viewedTargetUserId = isViewingAnotherMember ? String(viewedProfile?.userId || viewedMemberId).trim() : "";
  const isReadOnlyPublicProfileView = isViewingAnotherMember;
  const isViewedProfileFollowed = Boolean(
    isViewingAnotherMember && viewedTargetUserId && followingIdSet.has(viewedTargetUserId)
  );
  const activeMemberRank = isViewingAnotherMember ? viewedMemberRank : memberRank;
  const activeContributionCounts = isViewingAnotherMember ? viewedContributionCounts : ownContributionCounts;
  const memberTitleMeta = getMemberTitleMeta(activeMemberRank?.title || "");
  const profileVibeChips = useMemo(
    () => resolveProfileVibeChips(effectiveVibe, topVibe),
    [effectiveVibe, topVibe]
  );
  const profileAboutMe = effectiveAbout;
  const atlasCommunityPosts = Number(activeContributionCounts?.total || 0);
  const atlasPlacesAdded = Number(activeMemberRank?.places_added || 0);
  const atlasEventsAdded = Number(activeMemberRank?.events_added || 0);
  const atlasReviewsWritten = Number(activeMemberRank?.reviews_written || 0);
  const atlasCredScore = atlasCommunityPosts + atlasPlacesAdded + atlasEventsAdded + atlasReviewsWritten;
  const atlasSignalScore = Number(activeMemberRank?.score || 0);
  const atlasCredLevel =
    activeMemberRank?.title ||
    (atlasCredScore >= 60
      ? "Icon"
      : atlasCredScore >= 30
        ? "Connector"
        : atlasCredScore >= 12
          ? "Curator"
          : "Scout");
  const topContributionLabel = useMemo(() => {
    const items = [
      { label: "Places", value: atlasPlacesAdded },
      { label: "Events", value: atlasEventsAdded },
      { label: "Reviews", value: atlasReviewsWritten },
      { label: "Posts", value: atlasCommunityPosts },
    ].filter((item) => item.value > 0);

    if (!items.length) return "No credited activity yet";
    const top = items.sort((a, b) => b.value - a.value)[0];
    return `${top.value} ${top.label.toLowerCase()}`;
  }, [atlasCommunityPosts, atlasEventsAdded, atlasPlacesAdded, atlasReviewsWritten]);
  const atlasCredBadges = useMemo(() => {
    const badges = [];
    if (atlasPlacesAdded >= 1) badges.push("Venue Scout");
    if (atlasEventsAdded >= 1) badges.push("Event Finder");
    if (atlasReviewsWritten >= 1) badges.push("Review Voice");
    if ((activeContributionCounts?.stories || 0) >= 1) badges.push("Story Starter");
    if ((activeContributionCounts?.guides || 0) >= 1) badges.push("Guide Builder");
    if ((activeContributionCounts?.ideas || 0) >= 2) badges.push("Idea Engine");
    if ((activeContributionCounts?.topics || 0) >= 2) badges.push("Conversation Driver");
    if (Number.isFinite(Number(activeMemberRank?.rank)) && Number(activeMemberRank.rank) <= 50) {
      badges.push("Top 50 Contributor");
    }
    if (badges.length === 0) badges.push("Rising Voice");
    return badges.slice(0, 6);
  }, [activeContributionCounts, activeMemberRank, atlasEventsAdded, atlasPlacesAdded, atlasReviewsWritten]);
  const activeProfileVisibility = isViewingAnotherMember ? viewedProfile?.visibility : profileExtras.visibility;
  const profileVisibilityLabel =
    activeProfileVisibility === "public"
      ? "Visible to all"
      : activeProfileVisibility === "friends"
        ? "Visible to friends"
        : "Visible to members";
  const profileLocationLabel =
    effectiveHomeCity || effectiveResidentCountry
      ? [effectiveHomeCity, effectiveResidentCountry].filter(Boolean).join(", ")
      : "Location not set";
  const activeJoinedAt = isViewingAnotherMember
    ? String(viewedProfile?.createdAt || "").trim()
    : String(user?.created_at || memberProfile?.createdAt || "").trim();
  const joinedSinceLabel = useMemo(() => {
    const raw = String(activeJoinedAt || "").trim();
    if (!raw) return "Joined recently";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "Joined recently";
    return `Joined ${parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })}`;
  }, [activeJoinedAt]);
  const publicHighlights = useMemo(() => {
    return [
      { label: "Top contribution", value: topContributionLabel },
      { label: "Current level", value: atlasCredLevel },
      {
        label: "Joined",
        value: joinedSinceLabel,
      },
    ];
  }, [atlasCredLevel, joinedSinceLabel, topContributionLabel]);
  const displayInitials = useMemo(() => {
    const parts = String(effectiveDisplayName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    if (parts.length === 0) return "QA";
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }, [effectiveDisplayName]);
  const canEditOwnAvatar = !isReadOnlyPublicProfileView;
  const effectiveAvatarUrl = isReadOnlyPublicProfileView
    ? String(viewedProfile?.avatarUrl || "").trim()
    : String(profileAvatarDataUrl || "").trim();
  const effectiveProfileMemories = isReadOnlyPublicProfileView ? viewedProfileMemories : profileMemories;
  const effectiveProfileStories = isReadOnlyPublicProfileView ? viewedProfileStories : profileStories;
  const effectiveProfileFriends = isReadOnlyPublicProfileView
    ? viewedProfileFriends
    : (followingProfiles || []).map((profile) => ({
        userId: String(profile?.userId || profile?.user_id || "").trim(),
        displayName: String(profile?.displayName || profile?.display_name || "Member").trim() || "Member",
        homeCity: String(profile?.homeCity || profile?.home_city || "").trim(),
        avatarUrl: resolveAvatarUrlFromRow(profile) || String(profile?.avatarUrl || "").trim(),
      }));
  const shouldRenderAvatarImage = Boolean(effectiveAvatarUrl) && !profileAvatarLoadFailed;
  const profileTabs = useMemo(
    () =>
      isReadOnlyPublicProfileView
        ? [{ id: "about", label: "Profile Home" }]
        : [
            { id: "about", label: "Home" },
            { id: "map", label: "My map" },
            { id: "trips", label: "Plan a trip" },
            { id: "calendar", label: "My Calendar" },
          ],
    [isReadOnlyPublicProfileView]
  );
  useEffect(() => {
    if (!Array.isArray(profileTabs) || profileTabs.length === 0) return;
    const firstTabId = String(profileTabs[0]?.id || "");
    if (!firstTabId) return;
    queueMicrotask(() => {
      setActiveProfileTab(firstTabId);
    });
  }, [profileTabs]);
  const plannerCities = useMemo(() => {
    const configCities = Object.values(cityConfig).map((item) => item.title?.replace("Queer ", "")).filter(Boolean);
    return computePlannerCities({ configCities, places, events });
  }, [events, places]);
  const isGoOutTonightIntent = activeFavoritesIntent === "go_out_tonight";
  const isPlanTripIntent = activeFavoritesIntent === "plan_a_trip";
  const isProfileAboutTab = activeProfileTab === "about";
  const isProfileActivityTab = false;
  const isProfileMapTab = activeProfileTab === "map";
  const isProfileTripsTab = activeProfileTab === "trips";
  const isProfileCalendarTab = activeProfileTab === "calendar";
  const isCompactCheckinSection = showSecondaryPanels && !isGoOutTonightIntent;
  const isCompactTripSection = showSecondaryPanels && !isPlanTripIntent;
  const showCheckinSection = isProfileMapTab;
  const showTripSection = isProfileTripsTab;
  const showCalendarSection = isProfileCalendarTab;
  const primaryIntentCtaLabel = isGoOutTonightIntent
    ? "Start check-in now"
    : "Open trip planner";

  const openIntentView = useCallback(
    (nextIntent) => {
      const nextTab =
        nextIntent === "plan_a_trip"
          ? "trips"
          : "map";
      setActiveProfileTab(nextTab);
      if (nextIntent === "plan_a_trip") {
        setTripWorkspaceMode("home");
      }
      if (nextIntent === "go_out_tonight") {
        setMyMapView("checkins");
      }
      setActiveFavoritesIntent(nextIntent);
      setShowSecondaryPanels(false);
      const targetRef =
        nextIntent === "go_out_tonight"
          ? tonightSectionRef
          : tripSectionRef;
      window.setTimeout(() => {
        targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 20);
    },
    []
  );

  const openMemberProfileFromFriend = useCallback((friend) => {
    const friendUserId = String(friend?.userId || friend?.user_id || "").trim();
    if (!friendUserId) return;
    const friendName = String(friend?.displayName || friend?.display_name || "Member").trim() || "Member";
    const nextRouteParams = {
      member: friendUserId,
      memberName: friendName,
      memberAvatar: String(friend?.avatarUrl || friend?.avatar_url || "").trim(),
      tab: "about",
    };
    setProfileRouteParams(nextRouteParams);
    setActiveProfileTab("about");
    const avatarParam = nextRouteParams.memberAvatar
      ? `&member_avatar=${encodeURIComponent(nextRouteParams.memberAvatar)}`
      : "";
    router.push(
      `/favorites?tab=about&member=${encodeURIComponent(friendUserId)}&member_name=${encodeURIComponent(friendName)}${avatarParam}`
    );
    window.setTimeout(() => {
      favoritesControlsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  }, [router]);

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
    writeLocalJson(FAVORITES_CALENDAR_REMINDER_STORAGE_KEY, calendarReminderByEventId || {});
  }, [calendarReminderByEventId]);

  useEffect(() => {
    writeLocalJson(FAVORITES_PERSONAL_CALENDAR_STORAGE_KEY, personalCalendarItems || []);
  }, [personalCalendarItems]);

  useEffect(() => {
    writeLocalJson(FAVORITES_CALENDAR_VIEW_STORAGE_KEY, calendarView);
  }, [calendarView]);

  useEffect(() => {
    writeLocalJson(FAVORITES_CALENDAR_GOING_STORAGE_KEY, calendarGoingByEventId || {});
  }, [calendarGoingByEventId]);

  useEffect(() => {
    if (activeProfileTab !== "calendar") return;
    const todayWithReminder = todayCalendarEvents.filter((event) => {
      const mode = String(calendarReminderByEventId?.[String(event.id)] || "off");
      return mode === "day_of";
    });
    const todayPersonalReminders = personalCalendarItems.filter((item) => {
      return item.date === todayDateKey && item.reminderMode === "day_of";
    });
    const reminderCount = todayWithReminder.length + todayPersonalReminders.length;
    if (reminderCount === 0) return;
    const lastShownDay = String(
      readLocalJson(FAVORITES_CALENDAR_LAST_ALERT_DAY_STORAGE_KEY, "") || ""
    );
    if (lastShownDay === todayDateKey) return;
    showToast(
      `You have ${reminderCount} calendar reminder${
        reminderCount > 1 ? "s" : ""
      } today.`,
      { tone: "info", duration: 2800 }
    );
    writeLocalJson(FAVORITES_CALENDAR_LAST_ALERT_DAY_STORAGE_KEY, todayDateKey);
  }, [activeProfileTab, calendarReminderByEventId, personalCalendarItems, showToast, todayCalendarEvents, todayDateKey]);

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
    if (user?.id) {
      const calendarEvent = calendarEvents.find((item) => String(item.id || "") === safeId);
      if (calendarEvent) {
        void (async () => {
          const clientId = `event-${safeId}`;
          if (safeMode === "off") {
            await supabase.from("member_calendar_reminders").delete().eq("user_id", user.id).eq("entry_client_id", clientId);
            return;
          }
          const dateKey = calendarEvent.calendarDate.toISOString().slice(0, 10);
          const timeValue = String(calendarEvent.time || calendarEvent.start_time || "20:00").slice(0, 5);
          const startsAt = new Date(`${dateKey}T${timeValue}:00`);
          const scheduledFor = safeMode === "day_before"
            ? new Date(startsAt.getTime() - 86400000)
            : new Date(`${dateKey}T09:00:00`);
          const { error: entryError } = await supabase.from("member_calendar_entries").upsert({
            user_id: user.id,
            client_id: clientId,
            source_type: "event",
            source_id: safeId,
            status: calendarGoingByEventId?.[safeId] ? "going" : "saved",
            title: calendarEvent.name || "Saved event",
            city: calendarEvent.city || null,
            date_key: dateKey,
            time_value: timeValue,
            payload: { eventId: safeId },
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,client_id" });
          if (entryError) return;
          await supabase.from("member_calendar_reminders").upsert({
            user_id: user.id,
            entry_client_id: clientId,
            mode: safeMode,
            scheduled_for: scheduledFor.toISOString(),
            status: "pending",
            attempt_count: 0,
            delivered_at: null,
            last_error: null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,entry_client_id,mode" });
        })();
      }
    }
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
  }, [calendarEvents, calendarGoingByEventId, showToast, user]);

  const toggleCalendarGoing = useCallback((eventId) => {
    const safeId = String(eventId || "").trim();
    if (!safeId) return;
    setCalendarGoingByEventId((current) => {
      const next = { ...(current || {}) };
      if (next[safeId]) delete next[safeId];
      else next[safeId] = true;
      return next;
    });
    const wasGoing = Boolean(calendarGoingByEventId?.[safeId]);
    showToast(wasGoing ? "Moved back to Saved." : "You’re going — lovely.", { tone: wasGoing ? "info" : "ok", duration: 1700 });
  }, [calendarGoingByEventId, showToast]);

  const openCalendarEntryOnMap = useCallback((entry) => {
    if (!entry?.city) {
      showToast("This plan does not have a map location yet.", { tone: "info", duration: 1900 });
      return;
    }
    if (entry.kind === "event") {
      router.push(citySelectionPath(entry.city, { eventId: entry.sourceId }));
      return;
    }
    setMyMapView("saved");
    setActiveProfileTab("map");
    showToast("Opened My Map for this city.", { tone: "info", duration: 1500 });
  }, [router, showToast]);

  const openCalendarDirections = useCallback((entry) => {
    const raw = entry?.raw || {};
    const lat = Number(raw.lat ?? raw.latitude);
    const lng = Number(raw.lng ?? raw.longitude ?? raw.lon);
    const destination = Number.isFinite(lat) && Number.isFinite(lng)
      ? `${lat},${lng}`
      : [raw.location || raw.address, entry?.city].filter(Boolean).join(", ");
    if (!destination) {
      showToast("Directions are unavailable until a location is added.", { tone: "info", duration: 1900 });
      return;
    }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, "_blank", "noopener,noreferrer");
  }, [showToast]);

  const enableCalendarPush = useCallback(async () => {
    const vapidPublicKey = String(process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || "").trim();
    if (!vapidPublicKey) {
      showToast("Push reminders need the VAPID public key before they can be enabled.", { tone: "info", duration: 2400 });
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      showToast("Push reminders are not supported by this browser.", { tone: "info", duration: 2200 });
      return;
    }
    setCalendarPushState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setCalendarPushState("denied");
        showToast("Notifications remain off. You can enable them later.", { tone: "info", duration: 2200 });
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidPublicKey(vapidPublicKey),
      });
      const json = subscription.toJSON();
      const { error } = await supabase.from("member_push_subscriptions").upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: String(json.keys?.p256dh || ""),
        auth_key: String(json.keys?.auth || ""),
        user_agent: navigator.userAgent,
        active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,endpoint" });
      if (error) throw error;
      setCalendarPushState("enabled");
      showToast("Push reminders enabled.", { tone: "ok", duration: 1900 });
    } catch {
      setCalendarPushState("error");
      showToast("Push reminders could not be enabled yet.", { tone: "warn", duration: 2200 });
    }
  }, [showToast, user]);

  const addCalendarEventToTrip = useCallback(async (entry) => {
    if (!entry || entry.kind !== "event") return;
    const matchingPlan = (plans || []).find((plan) => normalizeCityKey(plan?.city) === normalizeCityKey(entry.city));
    if (!matchingPlan) {
      setActiveProfileTab("trips");
      setTripWorkspaceMode("builder");
      showToast(`Create a ${formatCityLabel(entry.city || "city")} trip first, then add this event.`, { tone: "info", duration: 2400 });
      window.setTimeout(() => tripSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
      return;
    }
    const eventId = String(entry.sourceId || "");
    if ((matchingPlan.eventIds || []).map(String).includes(eventId)) {
      setActiveProfileTab("trips");
      setTripWorkspaceMode("home");
      setExpandedPlanId(matchingPlan.id);
      showToast("This event is already in your trip.", { tone: "info", duration: 1700 });
      return;
    }
    const nextEventIds = [...(matchingPlan.eventIds || []), eventId];
    const nextStops = [...(matchingPlan.stops || []), {
      type: "event",
      id: eventId,
      name: entry.title,
      city: entry.city,
      time: entry.time || null,
      dayLabel: entry.dateKey,
    }];
    setPlans((current) => current.map((plan) => String(plan.id) === String(matchingPlan.id) ? { ...plan, eventIds: nextEventIds, stops: nextStops } : plan));
    if (user?.id) {
      const { error } = await supabase.from("member_plans").update({ event_ids: nextEventIds, stops: nextStops }).eq("user_id", user.id).eq("client_id", String(matchingPlan.id));
      if (error) setSyncWarning("Event added locally. Cloud sync unavailable.");
    }
    setCalendarGoingByEventId((current) => ({ ...(current || {}), [eventId]: true }));
    showToast(`Added to ${matchingPlan.title || "your trip"}.`, { tone: "ok", duration: 1900 });
  }, [plans, setExpandedPlanId, setPlans, setSyncWarning, showToast, user]);

  const moveCalendarMonth = useCallback((offset) => {
    setCalendarMonthKey((current) => {
      const [year, month] = String(current || getCalendarMonthKey()).split("-").map(Number);
      const next = new Date(year || new Date().getFullYear(), (month || 1) - 1 + offset, 1);
      return getCalendarMonthKey(next);
    });
  }, []);

  const selectCalendarDate = useCallback((dateKey) => {
    const safeDateKey = getCalendarDateKey(dateKey);
    if (!safeDateKey) return;
    setSelectedCalendarDateKey(safeDateKey);
    setCalendarItemForm((current) => ({
      ...current,
      date: safeDateKey,
    }));
  }, []);

  const savePersonalCalendarItem = useCallback((event) => {
    event.preventDefault();
    const normalized = normalizePersonalCalendarItem({
      ...calendarItemForm,
      id: `personal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    if (!normalized) {
      showToast("Add a title and date first.", { tone: "warn", duration: 1800 });
      return;
    }
    setPersonalCalendarItems((current) => [normalized, ...(current || [])].slice(0, 160));
    setSelectedCalendarDateKey(normalized.date);
    setCalendarMonthKey(getCalendarMonthKey(new Date(`${normalized.date}T12:00:00`)));
    setCalendarItemForm({
      title: "",
      type: "plan",
      date: normalized.date,
      time: "",
      city: normalized.city,
      notes: "",
      reminderMode: "off",
    });
    showToast("Calendar item saved.", { tone: "ok", duration: 1600 });
  }, [calendarItemForm, showToast]);

  const removePersonalCalendarItem = useCallback((itemId) => {
    const safeId = String(itemId || "").trim();
    if (!safeId) return;
    setPersonalCalendarItems((current) =>
      (current || []).filter((item) => String(item.id || "") !== safeId)
    );
    showToast("Calendar item removed.", { tone: "info", duration: 1400 });
  }, [showToast]);

  const setPersonalCalendarReminderMode = useCallback((itemId, mode) => {
    const safeId = String(itemId || "").trim();
    const safeMode = ["day_before", "day_of", "hour_before"].includes(String(mode || ""))
      ? String(mode)
      : "off";
    if (!safeId) return;
    setPersonalCalendarItems((current) =>
      (current || []).map((item) =>
        String(item.id || "") === safeId ? { ...item, reminderMode: safeMode } : item
      )
    );
    showToast(safeMode === "off" ? "Reminder removed." : "Reminder saved.", {
      tone: safeMode === "off" ? "info" : "ok",
      duration: 1400,
    });
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
      setIsCheckinComposerOpen(false);
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
    const privacyValue = normalizeCheckinPrivacy(payload?.privacy);
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
        setIsCheckinComposerOpen(false);
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
            setIsCheckinComposerOpen(false);
          }
        } catch {
          setPendingCheckinVibe(null);
          setIsCheckinComposerOpen(false);
        }
      } else {
        setIsCheckinComposerOpen(false);
      }
    } finally {
      setIsSavingCheckin(false);
    }
  };

  const startEditCheckin = (entry) => {
    if (!entry?.id) return;
    setEditingCheckinId(String(entry.id));
    setSelectedCheckinId(String(entry.id));
    setIsCheckinComposerOpen(true);
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
    setIsCheckinComposerOpen(false);
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

  const openProfileMessage = () => {
    if (!isViewingAnotherMember || !viewedTargetUserId) {
      showToast("Open another member profile to send a message.", { tone: "info", duration: 2200 });
      return;
    }
    router.push(`/messages?user=${encodeURIComponent(viewedTargetUserId)}&name=${encodeURIComponent(viewedDisplayName)}`);
  };

  const toggleProfileFollow = async () => {
    if (!isViewingAnotherMember || !viewedTargetUserId) {
      showToast("Open another member profile to follow them.", { tone: "info", duration: 2200 });
      return;
    }
    await toggleFollowMember(viewedTargetUserId);
  };

  const reportProfile = () => {
    if (!isViewingAnotherMember || !viewedTargetUserId) {
      showToast("Open another member profile to report.", { tone: "info", duration: 2200 });
      return;
    }
    addReport({
      targetType: "member-profile",
      targetId: viewedTargetUserId,
      city: effectiveHomeCity || "",
      title: viewedDisplayName,
      reason: "Safety concern",
      message: "Reported from Favorites profile view.",
    });
    showToast("Report sent. Thanks for keeping the atlas safe.", { tone: "info", duration: 2400 });
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

  const updatePlan = async (planId, patch) => {
    const safeStops = Array.isArray(patch?.stops) ? patch.stops : [];
    const nextPlaceIds = [...new Set(safeStops.filter((stop) => stop.type === "place").map((stop) => String(stop.id)))];
    const nextEventIds = [...new Set(safeStops.filter((stop) => stop.type === "event").map((stop) => String(stop.id)))];
    const safePatch = {
      title: String(patch?.title || "").trim() || "Untitled trip",
      date: String(patch?.date || "").trim() || null,
      note: String(patch?.note || "").trim(),
      stops: safeStops,
      placeIds: nextPlaceIds,
      eventIds: nextEventIds,
    };

    setPlans((current) =>
      current.map((plan) =>
        String(plan.id) === String(planId) ? { ...plan, ...safePatch } : plan
      )
    );

    if (user?.id) {
      const { error } = await supabase
        .from("member_plans")
        .update({
          title: safePatch.title,
          date: safePatch.date,
          note: safePatch.note,
          stops: safePatch.stops,
          place_ids: nextPlaceIds,
          event_ids: nextEventIds,
        })
        .eq("user_id", user.id)
        .eq("client_id", String(planId));

      if (error) {
        setSyncWarning("Trip updated locally. Cloud sync unavailable.");
        return true;
      }
    }

    if (patch?.feedback !== false) {
      showToast("Trip updated.", { tone: "ok", duration: 1600 });
    }
    return true;
  };

  const addItemToPlan = async (plan, item, itemType) => {
    const normalizedType = itemType === "event" ? "event" : "place";
    const itemId = String(item?.id || "");
    if (!plan || !itemId) return;
    const alreadyAdded = (plan.stops || []).some(
      (stop) => stop.type === normalizedType && String(stop.id) === itemId
    );
    if (alreadyAdded) {
      setPendingTripItem(null);
      setActiveProfileTab("trips");
      setTripWorkspaceMode("home");
      setExpandedPlanId(plan.id);
      showToast("Already in this trip.", { tone: "info", duration: 1700 });
      return;
    }

    const nextStop = {
      type: normalizedType,
      id: itemId,
      name: String(item?.name || "Saved stop"),
      city: String(item?.city || plan.city || ""),
      time: String(item?.time || "").trim() || null,
      dayLabel: normalizedType === "event" ? String(item?.date || "").slice(0, 10) || null : null,
    };
    await updatePlan(plan.id, {
      ...plan,
      stops: [...(plan.stops || []), nextStop],
      feedback: false,
    });
    setPendingTripItem(null);
    showToast(`Added to ${plan.title || "your trip"}.`, { tone: "ok", duration: 1800 });
  };

  const addSavedItemToTrip = (item, itemType = "place") => {
    const matchingPlans = (plans || []).filter(
      (plan) => normalizeCityKey(plan?.city) === normalizeCityKey(item?.city)
    );
    if (matchingPlans.length === 0) {
      setActiveProfileTab("trips");
      setTripWorkspaceMode("builder");
      showToast(`Create a ${formatCityLabel(item?.city || "city")} trip first.`, { tone: "info", duration: 2200 });
      window.setTimeout(() => tripSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
      return;
    }
    if (matchingPlans.length === 1) {
      addItemToPlan(matchingPlans[0], item, itemType);
      return;
    }
    setPendingTripItem({ item, itemType, matchingPlans });
  };

  useEffect(() => {
    if (typeof window === "undefined" || isAtlasLoading) return;
    const params = new URLSearchParams(window.location.search);
    const itemType = params.get("trip_add_type") === "event" ? "event" : "place";
    const itemId = String(params.get("trip_add_id") || "").trim();
    if (!itemId) return;
    const requestKey = `${itemType}-${itemId}`;
    if (handledTripAddRef.current === requestKey) return;
    const source = itemType === "event"
      ? (events || []).find((item) => String(item.id) === itemId)
      : (places || []).find((item) => String(item.id) === itemId);
    if (!source) return;
    handledTripAddRef.current = requestKey;
    queueMicrotask(() => addSavedItemToTrip(source, itemType));
    params.delete("trip_add_type");
    params.delete("trip_add_id");
    params.delete("trip_add_city");
    const nextSearch = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`);
    // addSavedItemToTrip intentionally runs once for the URL handoff.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isAtlasLoading, places, plans]);

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
    const note = `V2 plan - variant: ${payload?.variant || "custom"} - vibes: ${selectedVibeTags.join(", ") || "mixed"} - budget: ${payload?.budget || "balanced"} - energy: ${payload?.energy || 70} - solo-safe: ${payload?.soloSafe ? "on" : "off"}`;

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
    setTripWorkspaceMode("home");
    trackKpiEvent("plan_saved", {
      city: cityName,
      targetType: "plan",
      targetId: String(savedPlan.id || ""),
      memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
    });
    showToast("Plan saved.", { tone: "ok", duration: 2200 });
    return true;
  };

  const saveBlankPlan = async ({ city, planDate, horizon }) => {
    const cityName = String(city || "").trim();
    if (!cityName) return false;
    const draftPlan = {
      id: `plan-blank-${Date.now()}`,
      title: `${cityName} trip`,
      city: cityName,
      date: String(planDate || "").trim() || null,
      placeIds: [],
      eventIds: [],
      stops: [],
      note: `Blank ${String(horizon || "trip").replaceAll("_", " ")} plan`,
      createdAt: new Date().toISOString(),
    };
    let savedPlan = draftPlan;
    if (user?.id) {
      const { data, error } = await supabase.from("member_plans").insert([{
        user_id: user.id,
        client_id: draftPlan.id,
        title: draftPlan.title,
        city: draftPlan.city,
        date: draftPlan.date,
        place_ids: [],
        event_ids: [],
        stops: [],
        note: draftPlan.note,
      }]).select("*").single();
      if (error || !data) setSyncWarning("Trip created locally. Cloud sync unavailable.");
      else savedPlan = mapPlanRow(data);
    }
    setPlans((current) => [savedPlan, ...current]);
    setExpandedPlanId(savedPlan.id);
    setTripWorkspaceMode("home");
    showToast("Blank trip created. Add your first stop when you are ready.", { tone: "ok", duration: 2200 });
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
    <main className="qa-page min-h-screen bg-[radial-gradient(circle_at_12%_9%,rgba(56,189,248,0.11),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(244,114,182,0.11),transparent_26%),linear-gradient(180deg,#040406_0%,#070911_48%,#040406_100%)] px-4 py-6 pb-8 text-white sm:px-6 sm:py-8 sm:pb-12">
      <ActionToast toast={toast} />
      <div className="qa-shell relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(45,212,191,0.14),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute -left-10 top-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-28 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <section className={`qa-panel qa-premium-card relative mb-6 overflow-hidden rounded-[30px] border border-white/12 bg-[#060910] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.44)] sm:rounded-[34px] sm:p-6 sm:shadow-[0_42px_132px_rgba(0,0,0,0.56)] ${(isProfileAboutTab || isProfileMapTab) ? (isReadOnlyPublicProfileView ? "hidden" : "border-0 !bg-transparent !p-0 !shadow-none [&>div:not(:last-child)]:hidden") : ""}`}>
          <div className="pointer-events-none absolute inset-0">
            <Image
              src="/favorites/queer-atlas-saved-places-neon-waves-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,14,0.58),rgba(4,7,14,0.8)_56%,rgba(4,7,14,0.92)_100%)] sm:bg-[linear-gradient(180deg,rgba(4,7,14,0.48),rgba(4,7,14,0.74)_56%,rgba(4,7,14,0.9)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(244,114,182,0.08),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(56,189,248,0.08),transparent_30%)] sm:bg-[radial-gradient(circle_at_16%_16%,rgba(244,114,182,0.14),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(56,189,248,0.14),transparent_30%)]" />
          </div>
          <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-rose-400/8 blur-3xl sm:bg-rose-400/12" />
          <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-cyan-400/7 blur-3xl sm:bg-cyan-400/10" />
          <div className="relative z-10 max-w-4xl">
            <p className="mt-1 max-w-[calc(100%-0.25rem)] bg-gradient-to-r from-amber-100 via-rose-100 to-cyan-100 bg-clip-text text-lg font-semibold tracking-[-0.01em] text-transparent sm:text-3xl sm:drop-shadow-[0_10px_24px_rgba(251,191,36,0.2)]">
              {isReadOnlyPublicProfileView ? `${effectiveDisplayName}'s profile` : `${greeting}, ${displayName}`}
            </p>
            <h1 className="qa-display qa-h1 mt-3 inline-flex items-center gap-3 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-3xl font-bold text-transparent sm:mt-4 sm:gap-4 sm:text-6xl">
              <BrandMark iconOnly className="h-10 w-10 sm:h-14 sm:w-14" />
              {isReadOnlyPublicProfileView ? "Member Profile" : "Your Atlas"}
            </h1>
            <p className="qa-lead mt-3 max-w-2xl text-sm text-white/64 sm:mt-5 sm:text-base">
              {isReadOnlyPublicProfileView
                ? "Public queer signal across identity, vibe, and contributor presence."
                : "Your saved queer map across cities, places, and events. This is where discovery becomes direction."}
            </p>
            {!isReadOnlyPublicProfileView && isAtlasLoading && (
              <div className="mt-4 max-w-sm animate-pulse" aria-hidden="true">
                <div className="h-3 w-40 rounded-full bg-white/12" />
              </div>
            )}
            {!isReadOnlyPublicProfileView && atlasLoadError && (
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
            {!isReadOnlyPublicProfileView && syncWarning && (
              <div className="mt-3 inline-flex rounded-xl border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                {syncWarning}
              </div>
            )}
          </div>
          {!isReadOnlyPublicProfileView ? (
            <div className="relative z-10 mt-4 sm:mt-5">
              <PageControls
                variant="favorites-desktop-luxe"
                controlsRef={favoritesControlsRef}
                controlButtonsRef={favoritesControlButtonsRef}
                buttons={profileTabs.map((tab) => ({ id: tab.id, label: tab.label }))}
                ariaLabel="My Atlas sections"
                mobileCompact
                mobileLayout="fit"
                mobileLabelsById={{
                  about: "Home",
                  map: "Map",
                  trips: "Trips",
                  calendar: "Calendar",
                }}
                activeButtonThemeById={{
                  about: {
                    className:
                      "sm:bg-[#A855F7] sm:text-white",
                  },
                  map: {
                    className:
                      "sm:bg-violet-300 sm:text-[#0d1230]",
                  },
                  trips: {
                    className:
                      "sm:bg-[#8B5CF6] sm:text-white",
                  },
                  calendar: {
                    className:
                      "sm:bg-fuchsia-300 sm:text-[#2b0c15]",
                  },
                }}
                activeId={activeProfileTab}
                onSelect={(tabId) => setActiveProfileTab(tabId)}
              />
            </div>
          ) : null}
        </section>

        {isProfileAboutTab && !isEditingAbout ? (
          <FavoritesProfileHome
            isReadOnly={isReadOnlyPublicProfileView}
            isLoading={viewedProfileLoading}
            error={viewedProfileError}
            displayName={effectiveDisplayName}
            displayInitials={displayInitials}
            avatarUrl={effectiveAvatarUrl}
            showAvatarImage={shouldRenderAvatarImage}
            avatarInputRef={avatarFileInputRef}
            onAvatarSelected={onProfileAvatarSelected}
            onEditAvatar={openAvatarEditor}
            onAvatarError={() => setProfileAvatarLoadFailed(true)}
            titleLabel={memberTitleMeta.label || "Contributor"}
            visibilityLabel={profileVisibilityLabel}
            locationLabel={profileLocationLabel}
            pronouns={effectivePronouns}
            about={profileAboutMe}
            vibeChips={profileVibeChips}
            stats={isReadOnlyPublicProfileView
              ? [
                  { label: "Contributions", value: atlasCredScore },
                  { label: "Places", value: atlasPlacesAdded },
                  { label: "Events", value: atlasEventsAdded },
                  { label: "Friends", value: effectiveProfileFriends.length },
                ]
              : [
                  { label: "Saved", value: totalPlaces + totalEvents, onClick: () => { setMyMapView("saved"); setActiveProfileTab("map"); } },
                  { label: "Check-ins", value: checkins.length, onClick: () => { setMyMapView("checkins"); setActiveProfileTab("map"); } },
                  { label: "Cities", value: totalCities, onClick: () => setActiveProfileTab("map") },
                  { label: "Friends", value: effectiveProfileFriends.length },
                ]}
            recentSaves={recentSaves}
            friends={effectiveProfileFriends}
            friendsLoading={viewedProfileFriendsLoading}
            memories={effectiveProfileMemories}
            memoriesLoading={viewedProfileMemoriesLoading}
            stories={effectiveProfileStories}
            storiesLoading={profileStoriesLoading}
            showStoryForm={showProfileStoryForm}
            storyForm={profileStoryForm}
            setStoryForm={setProfileStoryForm}
            onToggleStoryForm={() => setShowProfileStoryForm((current) => !current)}
            onPublishStory={publishProfileStory}
            onUploadMoment={openMemoriesEditor}
            memoryInputRef={memoryFileInputRef}
            onMemoriesSelected={onProfileMemoriesSelected}
            onRemoveMoment={removeProfileMemory}
            onOpenFriend={openMemberProfileFromFriend}
            onOpenRecentSave={(item) => router.push(citySelectionPath(item.city, item.type === "event" ? { eventId: item.id } : { placeId: item.id }))}
            onAddRecentSaveToTrip={(item) => addSavedItemToTrip(item, item.type === "event" ? "event" : "place")}
            onEditProfile={() => {
              setProfileForm({
                displayName: memberProfile?.displayName || authMemberName || memberName,
                pronouns: memberProfile?.pronouns || "",
                homeCity: memberProfile?.homeCity || "",
                residentCountry: memberProfile?.residentCountry || "",
              });
              setIsEditingAbout(true);
              setIsEditingProfile(true);
            }}
            onCloseProfile={() => router.push("/community")}
            onFollow={toggleProfileFollow}
            isFollowed={isViewedProfileFollowed}
            onMessage={openProfileMessage}
            onReport={reportProfile}
          />
        ) : null}

        {isProfileAboutTab && isEditingAbout ? (
        <section className="qa-premium-card relative mb-6 overflow-hidden rounded-[28px] border border-fuchsia-200/18 bg-[radial-gradient(circle_at_12%_16%,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_84%_10%,rgba(244,114,182,0.18),transparent_36%),radial-gradient(circle_at_52%_88%,rgba(168,85,247,0.14),transparent_42%),linear-gradient(180deg,rgba(18,14,28,0.97),rgba(8,8,12,0.99))] p-4 shadow-[0_34px_108px_rgba(0,0,0,0.5)] sm:rounded-[30px] sm:p-5">
          <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-cyan-400/7 blur-3xl sm:bg-cyan-400/10" />
          <div className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full bg-fuchsia-400/7 blur-3xl sm:bg-fuchsia-400/10" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.03),transparent_32%)]" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="mt-1 bg-gradient-to-r from-cyan-100 via-fuchsia-100 to-amber-100 bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent sm:text-3xl sm:drop-shadow-[0_10px_26px_rgba(217,70,239,0.24)]">
                {isEditingAbout ? "Edit profile" : "Member Signal"}
              </h2>
              <p className="mt-1 text-xs text-white/56 sm:text-sm">
                {isEditingAbout ? "Update the details that make your Atlas feel personal." : "A warmer profile card for identity, vibe, trust, and community presence."}
              </p>
            </div>
            {isViewingAnotherMember ? (
            <div className="sm:absolute sm:right-5 sm:top-5">
              <button
                type="button"
                onClick={() => router.push("/community")}
                className="rounded-full border border-rose-200/60 bg-[linear-gradient(135deg,rgba(251,113,133,0.34),rgba(217,70,239,0.26),rgba(24,10,24,0.92))] px-3 py-2 text-[11px] uppercase tracking-[0.11em] text-rose-50 shadow-[0_0_0_1px_rgba(251,113,133,0.34),0_0_26px_rgba(244,114,182,0.34)] transition duration-300 hover:-translate-y-0.5 hover:border-rose-100/80 hover:shadow-[0_0_0_1px_rgba(251,113,133,0.5),0_0_32px_rgba(244,114,182,0.42)] sm:px-3.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.11em]"
              >
                Close
              </button>
            </div>
            ) : null}
          </div>

          {isViewingAnotherMember && viewedProfileLoading ? (
            <p className="mt-3 text-xs text-white/66">Loading member profile...</p>
          ) : null}
          {isViewingAnotherMember && viewedProfileError ? (
            <p className="mt-3 rounded-xl border border-amber-200/24 bg-amber-200/12 px-3 py-2 text-xs text-amber-100">
              {viewedProfileError}
            </p>
          ) : null}

          {!isEditingAbout ? (
            <div className="relative z-10 mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <div className="overflow-hidden rounded-[30px] border border-white/16 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.045)_42%,rgba(8,8,12,0.72))] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur">
                <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-[radial-gradient(circle_at_18%_12%,rgba(244,114,182,0.36),transparent_31%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.30),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.09),rgba(0,0,0,0.34))] p-4 sm:p-5">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-fuchsia-300/20 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-12 left-8 h-40 w-40 rounded-full bg-cyan-300/16 blur-3xl" />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (!canEditOwnAvatar) return;
                        openAvatarEditor();
                      }}
                      className="group relative inline-flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[26px] border border-white/24 bg-black/26 text-3xl font-semibold text-white shadow-[0_18px_46px_rgba(0,0,0,0.36)] transition hover:-translate-y-0.5 hover:border-white/40 sm:h-36 sm:w-36 sm:text-4xl"
                      aria-label={canEditOwnAvatar ? "Edit profile image" : "Member profile image"}
                    >
                      <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_48%,rgba(244,114,182,0.16))]" aria-hidden="true" />
                      {shouldRenderAvatarImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={effectiveAvatarUrl}
                          alt={`${displayName || "Queer Atlas member"} profile photo`}
                          className="relative h-[88%] w-[88%] rounded-[22px] object-cover"
                          onError={() => setProfileAvatarLoadFailed(true)}
                        />
                      ) : (
                        <span className="relative inline-flex h-[88%] w-[88%] items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,rgba(244,114,182,0.26),rgba(34,211,238,0.18))]">
                          {displayInitials}
                        </span>
                      )}
                      {canEditOwnAvatar ? (
                        <span className="absolute inset-x-3 bottom-3 rounded-full bg-black/56 px-2 py-1 text-center text-[10px] uppercase tracking-[0.12em] text-white/90 opacity-0 transition group-hover:opacity-100">
                          Change
                        </span>
                      ) : null}
                    </button>
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onProfileAvatarSelected}
                      className="hidden"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.09em] ${memberTitleMeta.className}`}>
                          {memberTitleMeta.label || "Contributor"}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-cyan-200/24 bg-cyan-200/12 px-2.5 py-1 text-[11px] uppercase tracking-[0.09em] text-cyan-100">
                          {profileVisibilityLabel}
                        </span>
                      </div>
                      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                        {effectiveDisplayName}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/72">
                        {profileAboutMe || (isViewingAnotherMember ? "This member has not added an about line yet." : "Add a short intro so other members understand your vibe.")}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/78">
                        <span className="rounded-full border border-white/12 bg-black/22 px-3 py-1.5">
                          {profileLocationLabel}
                        </span>
                        <span className="rounded-full border border-white/12 bg-black/22 px-3 py-1.5">
                          {effectivePronouns || "Pronouns not set"}
                        </span>
                      </div>
                      {isViewingAnotherMember ? (
                        <div className="mt-5 grid gap-2 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={toggleProfileFollow}
                            disabled={!viewedTargetUserId || viewedProfileLoading}
                            className="rounded-full border border-cyan-200/30 bg-cyan-200/14 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-cyan-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/60 hover:bg-cyan-200/24 disabled:cursor-not-allowed disabled:opacity-55 sm:shadow-[0_10px_24px_rgba(34,211,238,0.16)]"
                          >
                            {isViewedProfileFollowed ? "Following" : "Follow"}
                          </button>
                          <button
                            type="button"
                            onClick={openProfileMessage}
                            disabled={!viewedTargetUserId || viewedProfileLoading}
                            className="rounded-full border border-emerald-200/30 bg-emerald-200/14 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-100 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-100/60 hover:bg-emerald-200/24 disabled:cursor-not-allowed disabled:opacity-55 sm:shadow-[0_10px_24px_rgba(16,185,129,0.16)]"
                          >
                            Message
                          </button>
                          <button
                            type="button"
                            onClick={reportProfile}
                            disabled={!viewedTargetUserId || viewedProfileLoading}
                            className="rounded-full border border-rose-200/30 bg-rose-200/14 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-100 transition duration-300 hover:-translate-y-0.5 hover:border-rose-100/60 hover:bg-rose-200/24 disabled:cursor-not-allowed disabled:opacity-55 sm:shadow-[0_10px_24px_rgba(251,113,133,0.16)]"
                          >
                            Report
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="relative mt-4 rounded-2xl border border-white/12 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.13em] text-white/70">
                          {isReadOnlyPublicProfileView ? "Friends" : "Your friends"}
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          {isReadOnlyPublicProfileView
                            ? "Visible trusted connections for this member."
                            : "Members in your trusted signal network."}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/14 bg-white/8 px-2.5 py-1 text-[11px] text-white/62">
                        {effectiveProfileFriends.length}
                      </span>
                    </div>
                    {isReadOnlyPublicProfileView && viewedProfileFriendsLoading ? (
                      <p className="mt-3 text-xs text-white/56">Loading friends...</p>
                    ) : effectiveProfileFriends.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {effectiveProfileFriends.slice(0, 5).map((friend) => {
                          const friendInitials = String(friend.displayName || "M")
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part.charAt(0).toUpperCase())
                            .join("") || "M";
                          return (
                            <button
                              key={`profile-friend-${friend.userId || friend.displayName}`}
                              type="button"
                              onClick={() => openMemberProfileFromFriend(friend)}
                              className="rounded-2xl border border-white/12 bg-white/[0.055] p-2 text-left transition hover:-translate-y-0.5 hover:border-fuchsia-200/32 hover:bg-white/[0.08]"
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/14 bg-black/25 text-xs font-semibold text-white">
                                  {friend.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={friend.avatarUrl} alt={`${friend.displayName || "Queer Atlas member"} profile photo`} className="h-full w-full object-cover" />
                                  ) : (
                                    friendInitials
                                  )}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-xs font-semibold text-white/90">{friend.displayName}</span>
                                  <span className="block truncate text-[11px] text-white/50">{friend.homeCity || "Atlas member"}</span>
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-xl border border-dashed border-white/12 bg-white/[0.035] px-3 py-2 text-xs text-white/54">
                        {isReadOnlyPublicProfileView
                          ? "No friends are visible for this member yet."
                          : "Follow members from Community to build this row."}
                      </p>
                    )}
                  </div>
                  {!isViewingAnotherMember ? (
                    <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-cyan-200/18 bg-cyan-200/[0.09] px-3 py-2.5">
                      <p className="text-xs leading-5 text-cyan-50/82">Keep this card clear, warm, and current. It is the first thing members read before they follow or message you.</p>
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
                        className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:-translate-y-0.5 hover:border-white/32"
                      >
                        Edit profile
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <aside className="grid gap-3">
                <div className="rounded-[26px] border border-amber-200/24 bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(0,0,0,0.26))] p-4 shadow-[0_18px_48px_rgba(245,158,11,0.10)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-amber-100/74">Atlas Cred</p>
                      <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">{atlasCredLevel}</p>
                    </div>
                    <div className="rounded-2xl border border-white/16 bg-black/24 px-3 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-white/52">Signal</p>
                      <p className="text-lg font-semibold text-white">{atlasSignalScore || atlasCredScore}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Number.isFinite(Number(activeMemberRank?.rank)) ? (
                      <span className="rounded-full border border-white/18 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.09em] text-white/84">
                        Rank #{Number(activeMemberRank.rank)}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-white/18 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.09em] text-white/84">
                      {atlasCredScore} contributions
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {atlasCredBadges.map((badge) => (
                      <span
                        key={`atlas-badge-${badge}`}
                        className="inline-flex items-center rounded-full border border-amber-200/28 bg-amber-100/12 px-2.5 py-1 text-[11px] uppercase tracking-[0.09em] text-amber-100/90"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-fuchsia-200/22 bg-fuchsia-200/[0.10] p-4 shadow-[0_18px_42px_rgba(217,70,239,0.10)]">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/78">Vibe DNA</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profileVibeChips.length > 0 ? (
                      profileVibeChips.map((chip) => (
                        <span
                          key={`profile-vibe-${chip.key}`}
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.09em] transition duration-300 sm:shadow-[0_8px_22px_rgba(0,0,0,0.22)] sm:hover:-translate-y-0.5 ${chip.tone}`}
                        >
                          {chip.label}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-white/20 bg-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.09em] text-white/76">
                        Open Circle
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {publicHighlights.map((item) => (
                    <article
                      key={`public-highlight-${item.label}`}
                      className="rounded-2xl border border-white/12 bg-black/26 px-3 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.1em] text-white/50">{item.label}</p>
                      <p className="mt-1 text-sm font-medium text-white/90">{item.value}</p>
                    </article>
                  ))}
                </div>
              </aside>

              <div className="lg:col-span-2 overflow-hidden rounded-[30px] border border-white/14 bg-[radial-gradient(circle_at_14%_16%,rgba(244,114,182,0.18),transparent_32%),radial-gradient(circle_at_86%_10%,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.28))] p-3.5 shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/78">
                      {isReadOnlyPublicProfileView ? "Moments & stories" : "Your moments & stories"}
                    </p>
                    <p className="mt-1 text-xs text-white/52">Images for the mood, stories for the context.</p>
                  </div>
                  {!isReadOnlyPublicProfileView ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={openMemoriesEditor}
                        className="rounded-full border border-cyan-200/30 bg-cyan-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-cyan-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/60 hover:bg-cyan-200/20"
                      >
                        Upload moment
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowProfileStoryForm((current) => !current)}
                        className="rounded-full border border-fuchsia-200/34 bg-fuchsia-200/14 px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-fuchsia-100 transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-100/60 hover:bg-fuchsia-200/22"
                      >
                        {showProfileStoryForm ? "Close story" : "Add story"}
                      </button>
                    </div>
                  ) : null}
                </div>
                <input
                  ref={memoryFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onProfileMemoriesSelected}
                  className="hidden"
                />

                {showProfileStoryForm && !isReadOnlyPublicProfileView ? (
                  <form onSubmit={publishProfileStory} className="mt-4 rounded-[24px] border border-fuchsia-200/20 bg-black/26 p-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        value={profileStoryForm.title}
                        onChange={(event) => setProfileStoryForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Story title"
                        className="rounded-xl border border-white/10 bg-black/28 px-3 py-2 text-sm text-white outline-none placeholder:text-white/34"
                      />
                      <input
                        value={profileStoryForm.city}
                        onChange={(event) => setProfileStoryForm((current) => ({ ...current, city: event.target.value }))}
                        placeholder="City or scene"
                        className="rounded-xl border border-white/10 bg-black/28 px-3 py-2 text-sm text-white outline-none placeholder:text-white/34"
                      />
                      <input
                        value={profileStoryForm.category}
                        onChange={(event) => setProfileStoryForm((current) => ({ ...current, category: event.target.value }))}
                        placeholder="Category"
                        className="rounded-xl border border-white/10 bg-black/28 px-3 py-2 text-sm text-white outline-none placeholder:text-white/34"
                      />
                    </div>
                    <textarea
                      value={profileStoryForm.body}
                      onChange={(event) => setProfileStoryForm((current) => ({ ...current, body: event.target.value }))}
                      placeholder="Write a short memory, tip, or scene note for members visiting your profile."
                      className="mt-2 min-h-[96px] w-full rounded-xl border border-white/10 bg-black/28 px-3 py-2 text-sm text-white outline-none placeholder:text-white/34"
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <input
                        value={profileStoryForm.excerpt}
                        onChange={(event) => setProfileStoryForm((current) => ({ ...current, excerpt: event.target.value }))}
                        placeholder="Optional teaser line"
                        className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-black/28 px-3 py-2 text-sm text-white outline-none placeholder:text-white/34"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-gradient-to-r from-fuchsia-200 via-rose-200 to-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-black shadow-[0_12px_30px_rgba(244,114,182,0.18)]"
                      >
                        Publish story
                      </button>
                    </div>
                  </form>
                ) : null}

                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                  <div className="rounded-[24px] border border-white/12 bg-black/22 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.13em] text-cyan-100/76">Photo moments</p>
                      <span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] text-white/56">
                        {effectiveProfileMemories.length}/5
                      </span>
                    </div>
                    {isReadOnlyPublicProfileView && viewedProfileMemoriesLoading ? (
                      <p className="mt-3 text-xs text-white/62">Loading moments...</p>
                    ) : null}
                    {effectiveProfileMemories.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {effectiveProfileMemories.map((memory, index) => (
                          <article
                            key={String(memory.id)}
                            className={`group relative overflow-hidden rounded-[22px] border border-white/12 bg-black/30 shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-200/34 ${
                              index === 0 ? "col-span-2 sm:col-span-2" : ""
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={String(memory.url || "")}
                              alt={`${effectiveDisplayName || "Queer Atlas member"} travel memory ${index + 1}`}
                              className={`${index === 0 ? "h-44" : "h-32"} w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]`}
                            />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_42%,rgba(0,0,0,0.46))]" />
                            {!isReadOnlyPublicProfileView ? (
                              <button
                                type="button"
                                onClick={() => removeProfileMemory(memory.id)}
                                className="absolute right-2 top-2 rounded-full border border-black/45 bg-black/62 px-2 py-1 text-[10px] uppercase tracking-[0.09em] text-white/90"
                              >
                                Remove
                              </button>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[22px] border border-dashed border-cyan-200/18 bg-cyan-200/[0.045] px-4 py-5 text-sm text-white/62">
                        {isReadOnlyPublicProfileView
                          ? "No public moments yet."
                          : "No moments yet. Upload up to 5 images to make your profile feel more alive."}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-fuchsia-200/16 bg-fuchsia-200/[0.08] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.13em] text-fuchsia-100/78">Profile stories</p>
                      <span className="rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] text-white/56">
                        {effectiveProfileStories.length}
                      </span>
                    </div>
                    {profileStoriesLoading ? (
                      <p className="mt-3 text-xs text-white/58">Loading stories...</p>
                    ) : effectiveProfileStories.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {effectiveProfileStories.slice(0, 4).map((story) => (
                          <article
                            key={`profile-story-${story.id}`}
                            className="rounded-[20px] border border-white/12 bg-black/24 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-fuchsia-200/24 bg-fuchsia-200/12 px-2 py-0.5 text-[10px] uppercase tracking-[0.09em] text-fuchsia-100">
                                {story.category || "Profile"}
                              </span>
                              {story.city ? (
                                <span className="text-[11px] text-white/48">{story.city}</span>
                              ) : null}
                            </div>
                            <h4 className="mt-2 text-sm font-semibold text-white">{story.title}</h4>
                            <p className="mt-1 line-clamp-3 text-xs leading-5 text-white/64">
                              {story.excerpt || story.body}
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[22px] border border-dashed border-fuchsia-200/18 bg-black/16 px-4 py-5 text-sm text-white/62">
                        {isReadOnlyPublicProfileView
                          ? "No profile stories yet."
                          : "Add a story so members can read more than a bio."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={saveAboutProfile} className="qa-profile-edit mt-4 space-y-5">
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
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">What I&apos;m into</p>
                  <p className="mb-1 text-[11px] text-white/44">Choose up to 5 keywords. These power your Vibe DNA chips.</p>
                  <input
                    value={profileExtras.vibe}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        vibe: String(event.target.value || "").slice(0, 80),
                      }))
                    }
                    placeholder="Techno, late nights, festivals, underground..."
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PROFILE_VIBE_PRESETS.map((preset) => {
                      const selected = String(profileExtras.vibe || "")
                        .toLowerCase()
                        .split(/[,+/|]/)
                        .map((token) => token.trim())
                        .includes(preset.key);
                      return (
                        <button
                          key={`vibe-preset-${preset.key}`}
                          type="button"
                          onClick={() => {
                            const tokens = String(profileExtras.vibe || "")
                              .split(/[,+/|]/)
                              .map((token) => token.trim().toLowerCase())
                              .filter(Boolean);
                            const nextTokens = selected
                              ? tokens.filter((token) => token !== preset.key)
                              : [...tokens, preset.key];
                            setProfileExtras((current) => ({
                              ...current,
                              vibe: nextTokens.slice(0, 5).join(", "),
                            }));
                          }}
                          className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition ${
                            selected
                              ? "border-fuchsia-200/45 bg-fuchsia-200/16 text-fuchsia-100"
                              : "border-white/18 bg-white/8 text-white/78 hover:border-white/30"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
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
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/56">About me (max 300)</p>
                  <p className="mb-1 text-[11px] text-white/44">A short profile line so people quickly understand you.</p>
                  <textarea
                    value={profileExtras.about}
                    onChange={(event) =>
                      setProfileExtras((current) => ({
                        ...current,
                        about: String(event.target.value || "").slice(0, 300),
                      }))
                    }
                    placeholder="Short intro about who you are and your social vibe."
                    className="min-h-[90px] w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.11em] text-black"
                >
                  Save profile home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingAbout(false);
                    setIsEditingProfile(false);
                  }}
                  className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.12em] text-white/80 transition duration-300 hover:-translate-y-0.5 hover:border-white/26"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
        ) : null}

        {isProfileActivityTab ? (
        <section className="qa-premium-card mb-6 rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(14,16,20,0.96),rgba(8,8,10,0.99))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.3)] sm:rounded-[30px] sm:p-5 sm:shadow-[0_24px_72px_rgba(0,0,0,0.38)]">
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
        <section className="qa-premium-card mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,14,22,0.94),rgba(10,10,10,0.98))] p-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] sm:shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
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
          className="qa-atlas-section mb-6"
        >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100/72">My queer atlas</p>
              <h2 className="qa-h2 mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                My map
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-50/68">
                Places you love and moments you’ve lived.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-violet-50/58 sm:justify-end">
              <span><strong className="font-semibold text-white">{savedPlaces.length}</strong> saved</span>
              <span aria-hidden="true">·</span>
              <span><strong className="font-semibold text-white">{checkins.length}</strong> check-ins</span>
              <span aria-hidden="true">·</span>
              <span><strong className="font-semibold text-white">{myMapView === "checkins" ? checkinCities.length : savedPlaceCities}</strong> cities</span>
            </div>
          </div>
          <div className="mb-4 inline-flex rounded-full border border-white/16 bg-white/10 p-1 shadow-[0_14px_38px_rgba(72,36,94,0.22)] backdrop-blur-xl">
            {[
              { id: "saved", label: "Saved" },
              { id: "checkins", label: "Check-ins" },
              { id: "trips", label: "Trips" },
            ].map((view) => {
              const isActive = myMapView === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setMyMapView(view.id)}
                  aria-pressed={isActive}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? view.id === "checkins"
                        ? "bg-gradient-to-r from-rose-200 to-fuchsia-200 text-[#32152e] shadow-[0_8px_24px_rgba(244,114,182,0.28)]"
                        : view.id === "trips"
                          ? "bg-gradient-to-r from-fuchsia-100 to-rose-100 text-[#32152e] shadow-[0_8px_24px_rgba(245,169,198,0.22)]"
                          : "bg-gradient-to-r from-emerald-100 via-teal-100 to-amber-100 text-[#17322c] shadow-[0_8px_24px_rgba(167,243,208,0.24)]"
                      : "text-violet-50/62 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </div>

          <div>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.38fr)_minmax(19rem,0.62fr)]">
            <div
              ref={checkinMapCardRef}
              className={`relative rounded-[28px] border bg-[radial-gradient(circle_at_10%_0%,rgba(139,92,246,0.15),transparent_32%),linear-gradient(155deg,#26213f,#171c2e)] p-2 shadow-[0_24px_66px_rgba(10,8,25,0.36)] transition sm:p-3 ${
                selectedCheckin
                  ? myMapView === "saved"
                    ? "border-emerald-200/42"
                    : "border-rose-200/42"
                  : "border-white/14"
              }`}
            >
              {selectedCheckin ? (
                <div className="mb-2 inline-flex max-w-[calc(100%-7rem)] items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-[11px] text-white/88 backdrop-blur-xl">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-200 shadow-[0_0_14px_rgba(244,114,182,0.85)]" />
                  <span className="truncate">
                    Selected: {selectedCheckin.label || "Check-in"} | {selectedCheckin.city || "City"}
                  </span>
                </div>
              ) : null}
              <div className="qa-profile-map-canvas relative overflow-hidden rounded-[22px] border border-white/12 bg-[#342c3c] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                {mapboxToken && !checkinMapLoadFailed ? (
                  <div
                    ref={checkinMapContainerRef}
                    className="h-[360px] w-full overflow-hidden bg-[#342c3c] sm:h-[430px] xl:h-[570px]"
                  />
                ) : checkinMapEmbedUrl ? (
                  <iframe
                    title="Your check-in map"
                    src={checkinMapEmbedUrl}
                    className="h-[360px] w-full bg-[#342c3c] brightness-110 saturate-[0.72] sm:h-[430px] xl:h-[570px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : staticMapUrl && !checkinMapLoadFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={staticMapUrl}
                    alt="Your check-in map"
                    onError={() => setCheckinMapLoadFailed(true)}
                    className="h-[360px] w-full bg-[#342c3c] object-contain brightness-110 saturate-[0.72] sm:h-[430px] xl:h-[570px]"
                  />
                ) : openStreetMapStaticUrl && !checkinStaticFallbackFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={openStreetMapStaticUrl}
                    alt="Your check-in map fallback"
                    onError={() => setCheckinStaticFallbackFailed(true)}
                    className="h-[360px] w-full bg-[#342c3c] object-contain brightness-110 saturate-[0.72] sm:h-[430px] xl:h-[570px]"
                  />
                ) : (
                  <div className="flex h-[360px] items-center justify-center bg-[radial-gradient(circle_at_24%_18%,rgba(244,114,182,0.16),transparent_34%),radial-gradient(circle_at_82%_76%,rgba(52,211,153,0.09),transparent_36%),linear-gradient(145deg,#3a293f,#252b36)] px-7 text-center text-sm text-white/68 sm:h-[430px] xl:h-[570px]">
                    <span><strong className="block text-lg font-semibold text-white">Your queer world starts here ✦</strong><span className="mt-2 block">Save a venue or check in somewhere you loved. Your map will grow with you.</span></span>
                  </div>
                )}
                {myMapView === "checkins" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isCheckinComposerOpen) {
                        cancelEditCheckin();
                        return;
                      }
                      setIsCheckinComposerOpen(true);
                      window.setTimeout(() => checkinFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
                    }}
                    className="absolute bottom-4 right-4 z-20 rounded-full border border-white/50 bg-[linear-gradient(135deg,#ffd4df,#f3d8ff)] px-4 py-2.5 text-xs font-semibold text-[#38152f] shadow-[0_14px_38px_rgba(28,12,31,0.42)] transition hover:-translate-y-0.5 hover:brightness-105 sm:bottom-5 sm:right-5"
                  >
                    {isCheckinComposerOpen ? "Close" : "+ Check in"}
                  </button>
                ) : null}
              </div>

              {myMapView === "checkins" && isCheckinComposerOpen ? (
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
                  className="mt-3 grid gap-3 rounded-[22px] border border-orange-100/22 bg-[radial-gradient(circle_at_0%_0%,rgba(251,146,60,0.16),transparent_34%),linear-gradient(145deg,#4a2338,#4a3029)] p-4 shadow-[0_18px_48px_rgba(30,12,25,0.28)] sm:grid-cols-2"
                >
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-100/70">
                        Add signal
                      </p>
                      <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-white">
                        Check in to your map
                      </h3>
                    </div>
                    <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/56">
                      {editingCheckinId ? "Editing" : "New pin"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Choose an atlas venue/event or add a manual place. Coordinates are resolved automatically when possible.
                  </p>
                </div>
                <select
                  value={checkinForm.mode}
                  onChange={(event) => setCheckinForm((current) => ({ ...current, mode: event.target.value }))}
                  className={PREMIUM_CHECKIN_SELECT_CLASS}
                >
                  <option value="trip">Trip</option>
                  <option value="home">Home</option>
                  <option value="night_out">Night out</option>
                </select>
                <select
                  value={checkinForm.privacy}
                  onChange={(event) => setCheckinForm((current) => ({ ...current, privacy: event.target.value }))}
                  className={PREMIUM_CHECKIN_SELECT_CLASS}
                >
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
                  className={PREMIUM_CHECKIN_SELECT_CLASS}
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
                  className={PREMIUM_CHECKIN_SELECT_CLASS}
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
                  className={`${PREMIUM_CHECKIN_SELECT_CLASS} sm:col-span-2`}
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
                    className={`${PREMIUM_CHECKIN_SELECT_CLASS} sm:col-span-2`}
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
                    className={`${PREMIUM_CHECKIN_SELECT_CLASS} sm:col-span-2`}
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
                      className="rounded-2xl border border-white/12 bg-black/38 px-3.5 py-2.5 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition placeholder:text-white/34 focus:border-fuchsia-200/42 focus:ring-2 focus:ring-fuchsia-200/12 sm:col-span-2"
                    />
                    <input
                      value={checkinForm.address}
                      onChange={(event) => setCheckinForm((current) => ({ ...current, address: event.target.value }))}
                      placeholder="Address (recommended for accurate map pin)"
                      className="rounded-2xl border border-white/12 bg-black/38 px-3.5 py-2.5 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition placeholder:text-white/34 focus:border-fuchsia-200/42 focus:ring-2 focus:ring-fuchsia-200/12 sm:col-span-2"
                    />
                  </>
                ) : null}
                <textarea
                  value={checkinForm.note}
                  onChange={(event) => setCheckinForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Note (optional)"
                  className="min-h-[82px] rounded-2xl border border-white/12 bg-black/38 px-3.5 py-2.5 text-sm text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition placeholder:text-white/34 focus:border-fuchsia-200/42 focus:ring-2 focus:ring-fuchsia-200/12 sm:col-span-2"
                />
                <button
                  type="submit"
                  disabled={isSavingCheckin}
                  className="qa-action qa-action-strong rounded-2xl border border-amber-100/65 bg-gradient-to-r from-amber-200 via-rose-200 to-emerald-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#34221f] shadow-[0_12px_32px_rgba(251,191,36,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {isSavingCheckin ? "Saving check-in..." : editingCheckinId ? "Save check-in changes" : "Check in now"}
                </button>
                {editingCheckinId ? (
                  <button
                    type="button"
                    onClick={cancelEditCheckin}
                    className="rounded-2xl border border-white/16 bg-white/7 px-3 py-2.5 text-xs uppercase tracking-[0.12em] text-white/75 transition hover:border-white/24 sm:col-span-2"
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
                      onClick={() => {
                        setPendingCheckinVibe(null);
                        setIsCheckinComposerOpen(false);
                      }}
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
              ) : null}
            </div>

            <div className={`relative z-10 mx-0 mt-3 flex min-h-0 flex-col overflow-hidden rounded-[26px] border p-4 shadow-[0_22px_58px_rgba(8,8,18,0.36)] backdrop-blur-xl transition-colors duration-300 xl:mt-0 xl:h-[39rem] ${
              myMapView === "checkins"
                ? "border-emerald-100/20 bg-[radial-gradient(circle_at_100%_0%,rgba(110,231,183,0.13),transparent_34%),linear-gradient(155deg,#173a35,#142925)]"
                : "border-emerald-100/20 bg-[radial-gradient(circle_at_100%_0%,rgba(167,243,208,0.11),transparent_34%),linear-gradient(155deg,#173a35,#142925)]"
            }`}>
              <div className="mb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">
                    {myMapView === "checkins" ? "Check-ins" : myMapView === "trips" ? "Trip route" : "Saved places"}
                  </p>
                  <p className="mt-1 text-xs text-white/58">
                    {myMapView === "checkins"
                      ? "Tap a card to focus the map."
                      : myMapView === "trips" ? "Numbered stops match your plan." : "Tap a place to find it on your map."}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                  myMapView === "checkins"
                    ? "border-rose-100/28 bg-rose-100/12 text-rose-50/90"
                    : "border-emerald-100/30 bg-emerald-100/12 text-emerald-50/90"
                }`}>
                  {myMapView === "checkins" ? filteredRecentCheckins.length : myMapView === "trips" ? tripMapMarkers.length : savedPlaces.length}
                </span>
              </div>
              </div>
              {myMapView === "checkins" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                {checkins.length > 4 ? <div className="mt-2 flex flex-wrap gap-1.5">
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
                      className={`rounded-full px-3 py-1.5 text-[11px] transition ${
                        checkinViewFilter === filter.id
                          ? "bg-rose-100/24 text-rose-50"
                          : "text-violet-50/54 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div> : null}
                <div
                  className={`${FAVORITES_CHECKIN_LIST_SCROLL_CLASS} mt-3 xl:h-auto xl:min-h-0 xl:flex-1`}
                  style={{ scrollbarGutter: "stable" }}
                >
                {filteredRecentCheckins.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {filteredRecentCheckins.map((entry) => (
                        <article
                          key={entry.id}
                          onClick={() => focusCheckinOnMap(entry)}
                          className={`cursor-pointer px-1 py-4 transition ${
                            String(selectedCheckinId) === String(entry.id)
                              ? "text-rose-50"
                              : "hover:bg-white/[0.045]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                                {entry.city || "Unknown city"}{entry.country ? ` | ${entry.country}` : ""}
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-white">{entry.label || "Unnamed check-in"}</p>
                            </div>
                            <span className="shrink-0 rounded-full border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white/62">
                              {String(entry.mode).replaceAll("_", " ")}
                            </span>
                          </div>
                          {entry.address ? <p className="mt-1 text-xs text-white/62">{entry.address}</p> : null}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/55">
                            <span>{formatCheckinTime(entry.checkedInAt)}</span>
                          </div>
                          {entry.note ? <p className="mt-1 text-xs text-white/62">{entry.note}</p> : null}
                          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/8 pt-3">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                startEditCheckin(entry);
                              }}
                              className="rounded-full border border-amber-100/26 bg-amber-100/10 px-3 py-1 text-[11px] text-amber-50/90 transition hover:border-amber-100/42"
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
                      onClick={() => setIsCheckinComposerOpen(true)}
                      className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-3 py-1.5 text-[11px] uppercase tracking-[0.11em] text-fuchsia-100 transition hover:border-fuchsia-200/45"
                    >
                      Create check-in
                    </button>
                  </div>
                )}
                </div>
              </div>
              ) : myMapView === "trips" ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  {plans.length > 0 ? (
                    <>
                      <select value={selectedMapTrip?.id || ""} onChange={(event) => setSelectedTripMapId(event.target.value)} className="mt-2 min-h-11 rounded-2xl border border-white/12 bg-[#151018] px-3 text-sm text-white outline-none focus:border-[#f5a9c6]/45">
                        {plans.map((plan) => <option key={`map-trip-${plan.id}`} value={plan.id}>{plan.title || `${plan.city} trip`}</option>)}
                      </select>
                      <div className={`${FAVORITES_CHECKIN_LIST_SCROLL_CLASS} mt-3 space-y-1.5 xl:h-auto xl:min-h-0 xl:flex-1`} style={{ scrollbarGutter: "stable" }}>
                        {(selectedMapTrip?.stops || []).map((stop, index) => {
                          const marker = tripMapMarkers.find((item) => item.tripStopNumber === index + 1);
                          return (
                            <button key={`map-trip-stop-${stop.type}-${stop.id}-${index}`} type="button" onClick={() => marker ? setSelectedCheckinId(marker.id) : openPlannerStopOnMap({ ...stop, itemType: stop.type })} className="flex min-h-14 w-full items-center gap-3 rounded-[15px] px-2.5 text-left transition hover:bg-white/[0.05] focus-visible:outline-2 focus-visible:outline-[#f5a9c6]">
                              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#f5a9c6] text-xs font-bold text-[#24131d]">{index + 1}</span>
                              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-white/88">{stop.name}</span><span className="mt-0.5 block text-xs text-white/44">{stop.time || "Time open"} · {stop.type}</span></span>
                              <span className="text-[10px] text-[#ffd8e7]">{marker ? "Map" : "Open"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : <div className="mt-3 rounded-2xl border border-dashed border-white/12 px-4 py-6 text-sm text-white/48">Create a trip to see its route here.</div>}
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div
                    className={`${FAVORITES_CHECKIN_LIST_SCROLL_CLASS} mt-3 xl:h-auto xl:min-h-0 xl:flex-1`}
                    style={{ scrollbarGutter: "stable" }}
                  >
                    {savedPlaces.length > 0 ? (
                      <div className="divide-y divide-white/10">
                      {savedPlaces.map((place) => (
                        <article
                          key={`saved-map-${place.id}`}
                          onClick={() => focusSavedPlaceOnMap(place)}
                          className="cursor-pointer px-1 py-4 transition hover:bg-white/[0.045]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                                {place.city || "Unknown city"}
                              </p>
                              <p className="mt-1 truncate text-sm font-semibold text-white">{place.name || "Unnamed place"}</p>
                            </div>
                            <BookmarkCheck className="shrink-0 text-emerald-100/78" size={17} strokeWidth={1.8} />
                          </div>
                          {place.location || place.address ? (
                            <p className="mt-1 text-xs text-white/62">{place.location || place.address}</p>
                          ) : null}
                          <div className="mt-1 text-xs text-white/55">
                            Saved {formatSavedTime(place.addedAt)}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/8 pt-3">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                addSavedItemToTrip(place, "place");
                              }}
                              className="min-h-9 rounded-full border border-[#f5a9c6]/24 bg-[#f5a9c6]/10 px-3 text-[11px] font-semibold text-[#ffd8e7] transition hover:border-[#f5a9c6]/42 hover:bg-[#f5a9c6]/16 focus-visible:outline-2 focus-visible:outline-[#f5a9c6]"
                            >
                              + Add to trip
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                router.push(citySelectionPath(place.city, { placeId: place.id }));
                              }}
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
                              className="rounded-full border border-emerald-100/30 bg-emerald-100/12 px-3 py-1 text-[11px] text-emerald-50/92 transition hover:border-emerald-100/48"
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
                </div>
              )}
            </div>
          </div>
          </div>
        </section>
        )
        ) : null}

        {showTripSection ? (
        isCompactTripSection ? (
        <section className="qa-premium-card mb-4 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,24,0.94),rgba(10,10,10,0.98))] p-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] sm:shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
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
        <section ref={tripSectionRef} className="qa-atlas-section mb-8">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#9ce9e3]/80">
                {tripWorkspaceMode === "home" ? "Plan a trip" : "New trip"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {tripWorkspaceMode === "home" ? "Trip plans" : "Build your trip"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                {tripWorkspaceMode === "home"
                  ? "Saved places and events, shaped into simple plans you can actually use."
                  : "Choose the mood, city and pace. You can refine everything before saving."}
              </p>
            </div>
            {tripWorkspaceMode === "builder" ? (
              <button
                type="button"
                onClick={() => setTripWorkspaceMode("home")}
                className="min-h-11 self-start rounded-full border border-white/12 bg-white/[0.035] px-4 text-sm font-semibold text-white/72 transition hover:border-white/22 hover:bg-white/[0.065] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#88d9d4]"
              >
                Back to trips
              </button>
            ) : null}
          </div>

          {tripWorkspaceMode === "home" ? (
            <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_8%_0%,rgba(136,217,212,0.08),transparent_28%),radial-gradient(circle_at_92%_0%,rgba(245,169,198,0.07),transparent_26%),linear-gradient(180deg,rgba(20,15,23,0.94),rgba(10,9,12,0.98))] px-3 py-5 shadow-[0_28px_82px_rgba(0,0,0,0.30)] sm:px-6 sm:py-7">
              <TripPlansHome
                plans={plans}
                expandedPlanId={expandedPlanId}
                onExpandedPlanChange={setExpandedPlanId}
                onCreateTrip={() => setTripWorkspaceMode("builder")}
                onOpenStop={openPlannerStopOnMap}
                onRemovePlan={removePlan}
                onUpdatePlan={updatePlan}
              />
            </div>
          ) : (
          <div className="mx-auto grid max-w-5xl gap-5">
            <div className="min-w-0">
              <TripPlannerV2
            plannerCities={plannerCities}
            places={places}
            events={events}
            trustedFavoriteIds={(followingFeedRows || [])
              .map((row) => String(row.favorite_id || ""))
              .filter(Boolean)}
            savedFavoriteIds={favorites}
            trustedFavoriteStats={(followingFeedRows || []).reduce((acc, row) => {
              const favoriteId = String(row.favorite_id || "");
              if (!favoriteId) return acc;
              acc[favoriteId] = (acc[favoriteId] || 0) + 1;
              return acc;
            }, {})}
            onOpenStop={openPlannerStopOnMap}
            onSavePlan={saveV2Plan}
            onCreateBlankPlan={saveBlankPlan}
            hotelSuggestionsPortalId="trip-hotel-suggestions-panel"
              />
            </div>

            <aside className="hidden">
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/70">Saved itineraries</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Your route library</h3>
                <p className="mt-2 text-xs leading-5 text-white/56">
                  Open a saved plan, check the route, or remove flows you no longer need.
                </p>
              </div>

              <div id="trip-hotel-suggestions-panel" />

              <div className="min-h-[14rem] space-y-3 overflow-y-auto pr-1 xl:min-h-0 xl:flex-1" style={{ scrollbarGutter: "stable" }}>
                {isAtlasLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <FavoritesCardSkeleton key={`plan-skeleton-${index}`} />
                  ))
                ) : plans.length > 0 ? (
                  plans.map((plan, index) => (
                    <article
                      key={plan.id}
                      className="qa-premium-card animate-rise-in rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-4"
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
                  <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.025] px-5 py-8 text-sm leading-6 text-white/48">
                    No plans yet. Build your first night or city flow from saved places and events.
                  </div>
                )}
              </div>
            </aside>
          </div>
          )}
        </section>
        )
        ) : null}

        {showCalendarSection ? (
        <section className="qa-atlas-section mb-6">
          <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-rose-100/78">My Calendar</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Your plans, beautifully in sync.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                Saved events, trip plans and personal moments — arranged around where you are going next.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-[#17121d]/90 p-1 shadow-[0_14px_38px_rgba(0,0,0,0.26)]">
              {[{ id: "agenda", label: "Agenda" }, { id: "month", label: "Month" }].map((view) => (
                <button
                  key={`calendar-view-${view.id}`}
                  type="button"
                  onClick={() => setCalendarView(view.id)}
                  aria-pressed={calendarView === view.id}
                  className={`min-h-10 rounded-full px-4 text-xs font-semibold transition ${
                    calendarView === view.id
                      ? "bg-[#f5a9c6] text-[#24131d] shadow-[0_8px_24px_rgba(245,169,198,0.20)]"
                      : "text-white/58 hover:bg-white/[0.055] hover:text-white"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {calendarView === "agenda" ? (
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(245,169,198,0.10),transparent_30%),linear-gradient(180deg,#19131f_0%,#120e17_100%)] shadow-[0_28px_82px_rgba(0,0,0,0.32)]">
              <div className="border-b border-white/8 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#f5a9c6]/70">Coming up</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#fff7fb]">Your agenda</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={enableCalendarPush} disabled={calendarPushState === "loading" || calendarPushState === "enabled"} className="min-h-10 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-white/62 disabled:opacity-60">
                      {calendarPushState === "enabled" ? "Reminders on" : calendarPushState === "loading" ? "Enabling…" : "Enable reminders"}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/events")}
                      className="min-h-10 rounded-full border border-[#f5a9c6]/22 bg-[#f5a9c6]/10 px-4 text-xs font-semibold text-[#ffd8e7] transition hover:border-[#f5a9c6]/38 hover:bg-[#f5a9c6]/14"
                    >
                      Browse events
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {calendarDateStrip.map((day, index) => {
                    const isSelected = selectedCalendarDateKey === day.dateKey;
                    const itemCount = (calendarEntriesByDate.get(day.dateKey) || []).length;
                    return (
                      <button
                        key={`agenda-strip-${day.dateKey}`}
                        type="button"
                        onClick={() => {
                          selectCalendarDate(day.dateKey);
                          document.getElementById(`agenda-date-${day.dateKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        aria-label={`${day.weekday} ${day.day}${itemCount ? `, ${itemCount} plans` : ", no plans"}`}
                        className={`relative flex min-h-[4.4rem] min-w-[3.6rem] flex-col items-center justify-center rounded-[18px] border px-3 transition ${
                          isSelected
                            ? "border-[#f5a9c6]/48 bg-[#f5a9c6]/15 text-[#fff7fb]"
                            : index === 0
                              ? "border-[#f5a9c6]/24 bg-[#241825] text-[#fff7fb]"
                              : "border-white/8 bg-white/[0.025] text-white/58 hover:border-white/16 hover:bg-white/[0.045]"
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-[0.13em]">{day.weekday}</span>
                        <span className="mt-1 text-lg font-semibold">{day.day}</span>
                        {itemCount > 0 ? <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#ff78ad]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-4 py-5 sm:px-6 sm:py-7">
                {calendarAgendaGroups.length > 0 ? (
                  <div className="mx-auto max-w-3xl space-y-8">
                    {calendarAgendaGroups.map((group) => {
                      const dayOffset = Math.round((new Date(`${group.dateKey}T12:00:00`).getTime() - new Date(`${todayDateKey}T12:00:00`).getTime()) / 86400000);
                      const dateLabel = dayOffset === 0
                        ? "Today"
                        : dayOffset === 1
                          ? "Tomorrow"
                          : new Date(`${group.dateKey}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                      return (
                        <section key={`agenda-group-${group.dateKey}`} id={`agenda-date-${group.dateKey}`} className="scroll-mt-36">
                          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-white/8 pb-2">
                            <h4 className="text-sm font-semibold text-[#fff7fb]">{dateLabel}</h4>
                            <span className="text-[10px] uppercase tracking-[0.14em] text-white/34">{group.entries.length} {group.entries.length === 1 ? "plan" : "plans"}</span>
                          </div>
                          <div className="space-y-2">
                            {group.entries.map((entry) => {
                              const isEvent = entry.kind === "event";
                              const isPlan = entry.kind === "plan";
                              const railClass = isEvent ? "bg-[#ff78ad]" : isPlan ? "bg-[#88d9d4]" : "bg-[#d8b678]";
                              const sourceLabel = isEvent ? (entry.status === "going" ? "Going" : "Saved event") : isPlan ? "Trip plan" : entry.type || "Personal";
                              return (
                                <article key={`agenda-${entry.id}`} className="group relative overflow-hidden rounded-[18px] border border-white/8 bg-white/[0.028] transition hover:border-white/14 hover:bg-white/[0.045]">
                                  <span className={`absolute inset-y-0 left-0 w-[3px] ${railClass}`} />
                                  <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                                    <div className="w-12 flex-none text-center">
                                      <span className="block text-sm font-semibold text-[#fff7fb]">{entry.time || "All day"}</span>
                                    </div>
                                    <div className="min-w-0 flex-1 border-l border-white/8 pl-3 sm:pl-4">
                                      <p className="text-[9px] uppercase tracking-[0.15em] text-white/38">{sourceLabel}</p>
                                      <h5 className="mt-1 truncate text-sm font-semibold text-[#fff7fb] sm:text-base">{entry.title}</h5>
                                      <p className="mt-1 truncate text-xs text-[#bcaeb9]">{entry.city ? formatCityLabel(entry.city) : "Location not set"}</p>
                                    </div>
                                    {isEvent ? (
                                      <button
                                        type="button"
                                        onClick={() => toggleCalendarGoing(entry.sourceId)}
                                        className={`min-h-10 flex-none rounded-full px-3 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${entry.status === "going" ? "border border-[#f5a9c6]/26 bg-[#f5a9c6]/12 text-[#ffd8e7]" : "bg-[#f5a9c6] text-[#24131d] hover:bg-[#ffc0d7]"}`}
                                      >
                                        {entry.status === "going" ? "Going" : "Going?"}
                                      </button>
                                    ) : isPlan ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveProfileTab("trips");
                                          setTripWorkspaceMode("home");
                                          setExpandedPlanId(entry.sourceId);
                                          window.setTimeout(() => tripSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
                                        }}
                                        className="min-h-10 flex-none rounded-full border border-[#88d9d4]/20 bg-[#88d9d4]/8 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#bff5ef] transition hover:border-[#88d9d4]/36"
                                      >
                                        Open trip
                                      </button>
                                    ) : null}
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mx-auto flex min-h-72 max-w-md flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f5a9c6]/18 bg-[#f5a9c6]/8 text-2xl" aria-hidden="true">✦</div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#fff7fb]">Your next plan starts here</h3>
                    <p className="mt-2 text-sm leading-6 text-[#bcaeb9]">Save an event and it will appear here automatically.</p>
                    <button type="button" onClick={() => router.push("/events")} className="mt-5 min-h-11 rounded-full bg-[#f5a9c6] px-5 text-sm font-semibold text-[#24131d]">Explore events</button>
                  </div>
                )}
              </div>
            </div>
          ) : calendarView === "month" ? (
            <CalendarMonthExperience
              monthKey={calendarMonthKey}
              monthCells={calendarMonthCells}
              entriesByDate={calendarEntriesByDate}
              selectedDateKey={selectedCalendarDateKey}
              todayDateKey={todayDateKey}
              selectedEntries={selectedCalendarEntries}
              itemForm={calendarItemForm}
              setItemForm={setCalendarItemForm}
              onMoveMonth={moveCalendarMonth}
              onToday={() => {
                const today = formatCalendarDateKey(new Date());
                setCalendarMonthKey(getCalendarMonthKey(new Date()));
                selectCalendarDate(today);
              }}
              onSelectDate={selectCalendarDate}
              onSaveItem={savePersonalCalendarItem}
              onRemovePersonal={removePersonalCalendarItem}
              onSetEventReminder={setCalendarReminderMode}
              onSetPersonalReminder={setPersonalCalendarReminderMode}
              onToggleGoing={toggleCalendarGoing}
              onShowOnMap={openCalendarEntryOnMap}
              onDirections={openCalendarDirections}
              onAddToTrip={addCalendarEventToTrip}
              onEnablePush={enableCalendarPush}
              pushState={calendarPushState}
              onOpenEvent={(entry) => router.push(citySelectionPath(entry.city, { eventId: entry.sourceId }))}
              onOpenTrip={(entry) => {
                setActiveProfileTab("trips");
                setTripWorkspaceMode("home");
                setExpandedPlanId(entry.sourceId);
                window.setTimeout(() => tripSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
              }}
            />
          ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(24rem,0.82fr)] xl:items-stretch">
            <div className="qa-premium-card rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.13),transparent_32%),radial-gradient(circle_at_92%_4%,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(18,16,22,0.96),rgba(9,9,11,0.99))] p-4 shadow-[0_28px_82px_rgba(0,0,0,0.38)] sm:p-5 xl:h-[54rem] xl:overflow-y-auto">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/48">Month view</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
                    {new Date(`${calendarMonthKey}-01T12:00:00`).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveCalendarMonth(-1)}
                    className="rounded-full border border-white/14 bg-white/7 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-white/72 transition hover:border-white/26"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const today = formatCalendarDateKey(new Date());
                      setCalendarMonthKey(getCalendarMonthKey(new Date()));
                      selectCalendarDate(today);
                    }}
                    className="rounded-full border border-rose-200/24 bg-rose-200/12 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-rose-100 transition hover:border-rose-200/42"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCalendarMonth(1)}
                    className="rounded-full border border-white/14 bg-white/7 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-white/72 transition hover:border-white/26"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[10px] uppercase tracking-[0.14em] text-white/42">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayLabel) => (
                  <div key={`calendar-weekday-${dayLabel}`} className="py-1">
                    {dayLabel}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarMonthCells.map((day) => {
                  const entries = calendarEntriesByDate.get(day.dateKey) || [];
                  const isSelected = selectedCalendarDateKey === day.dateKey;
                  const isToday = todayDateKey === day.dateKey;
                  const hasEvent = entries.some((entry) => entry.kind === "event");
                  const hasPlan = entries.some((entry) => entry.kind === "plan");
                  const hasPersonal = entries.some((entry) => entry.kind === "personal");
                  return (
                    <button
                      key={`calendar-day-${day.dateKey}`}
                      type="button"
                      onClick={() => selectCalendarDate(day.dateKey)}
                      className={`min-h-[5.8rem] rounded-[20px] border p-2 text-left transition ${
                        isSelected
                          ? "border-cyan-100/48 bg-cyan-200/14 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_18px_42px_rgba(34,211,238,0.10)]"
                          : isToday
                            ? "border-rose-200/34 bg-rose-200/12"
                            : day.isCurrentMonth
                              ? "border-white/10 bg-white/[0.035] hover:border-white/22 hover:bg-white/[0.055]"
                              : "border-white/6 bg-white/[0.018] opacity-45 hover:opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm font-semibold ${isSelected ? "text-cyan-50" : "text-white/82"}`}>
                          {day.dayNumber}
                        </span>
                        {entries.length > 0 ? (
                          <span className="rounded-full border border-white/12 bg-black/30 px-1.5 py-0.5 text-[10px] text-white/70">
                            {entries.length}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {hasEvent ? <span className="h-2 w-2 rounded-full bg-rose-300" /> : null}
                        {hasPlan ? <span className="h-2 w-2 rounded-full bg-cyan-300" /> : null}
                        {hasPersonal ? <span className="h-2 w-2 rounded-full bg-amber-300" /> : null}
                      </div>
                      {entries[0]?.title ? (
                        <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/54">
                          {entries[0].title}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>

            </div>

            <aside className="qa-premium-card rounded-[30px] border border-white/12 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.12),transparent_34%),linear-gradient(180deg,rgba(22,15,20,0.96),rgba(9,9,11,0.99))] p-5 shadow-[0_28px_82px_rgba(0,0,0,0.38)] xl:h-[54rem] xl:overflow-y-auto">
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-rose-100/70">Selected day</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                  {formatDate(selectedCalendarDateKey)}
                </h3>
                <p className="mt-2 text-xs leading-5 text-white/56">
                  {selectedCalendarEntries.length > 0
                    ? `${selectedCalendarEntries.length} item${selectedCalendarEntries.length === 1 ? "" : "s"} planned.`
                    : "Nothing planned yet. Add something cute."}
                </p>
              </div>

              <div className="space-y-3">
                {selectedCalendarEntries.length > 0 ? (
                  selectedCalendarEntries.map((entry) => {
                    const isPersonal = entry.kind === "personal";
                    const isEvent = entry.kind === "event";
                    const isPlan = entry.kind === "plan";
                    const toneClass = isEvent
                      ? "border-rose-200/18 bg-rose-200/[0.075] text-rose-100"
                      : isPlan
                        ? "border-cyan-200/18 bg-cyan-200/[0.075] text-cyan-100"
                        : "border-amber-200/18 bg-amber-200/[0.075] text-amber-100";
                    return (
                      <article
                        key={`selected-calendar-${entry.id}`}
                        className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${toneClass}`}>
                              {isEvent ? "Saved event" : isPlan ? "Trip plan" : entry.type || "Personal"}
                            </span>
                            <h4 className="mt-2 truncate text-sm font-semibold text-white">{entry.title}</h4>
                            <p className="mt-1 text-xs text-white/54">
                              {entry.time ? `${entry.time} - ` : ""}
                              {entry.city ? formatCityLabel(entry.city) : "No city set"}
                            </p>
                            {entry.notes ? (
                              <p className="mt-2 text-xs leading-5 text-white/58">{entry.notes}</p>
                            ) : null}
                          </div>
                          {entry.reminderMode && entry.reminderMode !== "off" ? (
                            <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2 py-1 text-[10px] text-emerald-100">
                              Reminder
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {isEvent ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setCalendarReminderMode(entry.sourceId, entry.reminderMode === "day_of" ? "off" : "day_of")}
                                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.11em] transition ${
                                  entry.reminderMode === "day_of"
                                    ? "border-cyan-200/36 bg-cyan-200/16 text-cyan-100"
                                    : "border-white/14 bg-white/8 text-white/70 hover:border-white/26"
                                }`}
                              >
                                Day-of
                              </button>
                              <button
                                type="button"
                                onClick={() => setCalendarReminderMode(entry.sourceId, entry.reminderMode === "day_before" ? "off" : "day_before")}
                                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.11em] transition ${
                                  entry.reminderMode === "day_before"
                                    ? "border-amber-200/36 bg-amber-200/16 text-amber-100"
                                    : "border-white/14 bg-white/8 text-white/70 hover:border-white/26"
                                }`}
                              >
                                1 day before
                              </button>
                              <button
                                type="button"
                                onClick={() => router.push(citySelectionPath(entry.city, { eventId: entry.sourceId }))}
                                className="rounded-full border border-rose-200/24 bg-rose-200/12 px-3 py-1 text-[10px] uppercase tracking-[0.11em] text-rose-100 transition hover:border-rose-200/42"
                              >
                                Open
                              </button>
                              <button
                                type="button"
                                onClick={() => quickCheckinFromItem(entry.raw, "event")}
                                className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-1 text-[10px] uppercase tracking-[0.11em] text-fuchsia-100 transition hover:border-fuchsia-200/38"
                              >
                                Check in
                              </button>
                            </>
                          ) : null}
                          {isPersonal ? (
                            <>
                              {[
                                { id: "day_of", label: "Day-of" },
                                { id: "day_before", label: "1 day before" },
                                { id: "hour_before", label: "1 hour" },
                              ].map((mode) => (
                                <button
                                  key={`personal-reminder-${entry.id}-${mode.id}`}
                                  type="button"
                                  onClick={() => setPersonalCalendarReminderMode(entry.sourceId, entry.reminderMode === mode.id ? "off" : mode.id)}
                                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.11em] transition ${
                                    entry.reminderMode === mode.id
                                      ? "border-amber-200/36 bg-amber-200/16 text-amber-100"
                                      : "border-white/14 bg-white/8 text-white/70 hover:border-white/26"
                                  }`}
                                >
                                  {mode.label}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => removePersonalCalendarItem(entry.sourceId)}
                                className="rounded-full border border-rose-200/20 bg-rose-200/10 px-3 py-1 text-[10px] uppercase tracking-[0.11em] text-rose-100 transition hover:border-rose-200/38"
                              >
                                Remove
                              </button>
                            </>
                          ) : null}
                          {isPlan ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveProfileTab("trips");
                                setTripWorkspaceMode("home");
                                setExpandedPlanId(entry.sourceId);
                                window.setTimeout(() => tripSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
                              }}
                              className="rounded-full border border-cyan-200/24 bg-cyan-200/12 px-3 py-1 text-[10px] uppercase tracking-[0.11em] text-cyan-100 transition hover:border-cyan-200/42"
                            >
                              Open plan
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.025] px-4 py-6 text-sm leading-6 text-white/48">
                    No items on this day yet. Add a plan, reminder, meetup, or travel note below.
                  </div>
                )}
              </div>

              <form onSubmit={savePersonalCalendarItem} className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/46">Add to calendar</p>
                <div className="mt-3 grid gap-2">
                  <input
                    value={calendarItemForm.title}
                    onChange={(event) => setCalendarItemForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Title"
                    className="rounded-2xl border border-white/12 bg-black/30 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-rose-200/40"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      value={calendarItemForm.type}
                      onChange={(event) => setCalendarItemForm((current) => ({ ...current, type: event.target.value }))}
                      className="rounded-2xl border border-white/12 bg-[#151018] px-3.5 py-3 text-sm text-white outline-none focus:border-rose-200/40 [&_option]:bg-[#151018]"
                    >
                      <option value="plan">Plan</option>
                      <option value="reminder">Reminder</option>
                      <option value="meetup">Meetup</option>
                      <option value="travel">Travel</option>
                      <option value="personal">Personal</option>
                    </select>
                    <input
                      type="date"
                      value={calendarItemForm.date}
                      onChange={(event) => {
                        const nextDate = event.target.value;
                        setCalendarItemForm((current) => ({ ...current, date: nextDate }));
                        selectCalendarDate(nextDate);
                        setCalendarMonthKey(getCalendarMonthKey(new Date(`${nextDate}T12:00:00`)));
                      }}
                      className="rounded-2xl border border-white/12 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-rose-200/40"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="time"
                      value={calendarItemForm.time}
                      onChange={(event) => setCalendarItemForm((current) => ({ ...current, time: event.target.value }))}
                      className="rounded-2xl border border-white/12 bg-black/30 px-3.5 py-3 text-sm text-white outline-none focus:border-rose-200/40"
                    />
                    <input
                      value={calendarItemForm.city}
                      onChange={(event) => setCalendarItemForm((current) => ({ ...current, city: event.target.value }))}
                      placeholder="City optional"
                      className="rounded-2xl border border-white/12 bg-black/30 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-rose-200/40"
                    />
                  </div>
                  <select
                    value={calendarItemForm.reminderMode}
                    onChange={(event) => setCalendarItemForm((current) => ({ ...current, reminderMode: event.target.value }))}
                    className="rounded-2xl border border-white/12 bg-[#151018] px-3.5 py-3 text-sm text-white outline-none focus:border-rose-200/40 [&_option]:bg-[#151018]"
                  >
                    <option value="off">No reminder</option>
                    <option value="day_of">Day-of reminder</option>
                    <option value="day_before">1 day before</option>
                    <option value="hour_before">1 hour before</option>
                  </select>
                  <textarea
                    value={calendarItemForm.notes}
                    onChange={(event) => setCalendarItemForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Notes optional"
                    className="min-h-20 resize-none rounded-2xl border border-white/12 bg-black/30 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-rose-200/40"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-r from-rose-200 via-fuchsia-200 to-cyan-200 px-4 py-3 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(244,114,182,0.18)] transition hover:brightness-105"
                  >
                    Save calendar item
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/events")}
                    className="rounded-full border border-white/14 bg-white/[0.065] px-4 py-2.5 text-xs uppercase tracking-[0.12em] text-white/72 transition hover:border-white/26"
                  >
                    Browse events
                  </button>
                </div>
              </form>
            </aside>
          </div>
          )}
        </section>
        ) : null}

        {pendingTripItem ? (
          <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/68 p-3 backdrop-blur-sm sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-picker-title"
            onClick={() => setPendingTripItem(null)}
          >
            <div
              className="w-full max-w-md rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,#211721,#110f14)] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.62)] sm:p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9ce9e3]/72">Add to trip</p>
                  <h3 id="trip-picker-title" className="mt-1 text-xl font-semibold tracking-[-0.025em] text-white">
                    Choose a {pendingTripItem.item?.city || "matching"} trip
                  </h3>
                  <p className="mt-1.5 text-sm text-white/52">{pendingTripItem.item?.name}</p>
                </div>
                <button type="button" onClick={() => setPendingTripItem(null)} aria-label="Close trip chooser" className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-xl text-white/48 transition hover:bg-white/[0.06] hover:text-white">×</button>
              </div>
              <div className="mt-4 space-y-2">
                {pendingTripItem.matchingPlans.map((plan) => {
                  const alreadyAdded = (plan.stops || []).some((stop) => stop.type === pendingTripItem.itemType && String(stop.id) === String(pendingTripItem.item?.id));
                  return (
                    <button
                      key={`trip-picker-${plan.id}`}
                      type="button"
                      onClick={() => addItemToPlan(plan, pendingTripItem.item, pendingTripItem.itemType)}
                      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-[16px] border border-white/9 bg-white/[0.035] px-4 text-left transition hover:border-[#88d9d4]/28 hover:bg-[#88d9d4]/7 focus-visible:outline-2 focus-visible:outline-[#88d9d4]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white/88">{plan.title || "Untitled trip"}</span>
                        <span className="mt-0.5 block text-xs text-white/42">{plan.date ? formatDate(plan.date) : "Dates undecided"} · {(plan.stops || []).length} stops</span>
                      </span>
                      <span className={`flex-none text-[10px] font-semibold uppercase tracking-[0.1em] ${alreadyAdded ? "text-white/36" : "text-[#9ce9e3]"}`}>{alreadyAdded ? "Added" : "Choose"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}





