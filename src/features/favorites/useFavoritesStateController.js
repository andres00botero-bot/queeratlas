import { useRef, useState } from "react";
import { getBlockedItems } from "@/lib/moderation";

const INITIAL_NOW_TS = Date.now();

export function useFavoritesStateController() {
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
  const [syncWarning, setSyncWarning] = useState("");
  const [memberRank, setMemberRank] = useState(null);
  const [networkMembers, setNetworkMembers] = useState([]);
  const [followingUserIds, setFollowingUserIds] = useState([]);
  const [followingFeedRows, setFollowingFeedRows] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkWarning, setNetworkWarning] = useState("");
  const [recommendationMode, setRecommendationMode] = useState("balanced");
  const [showSignalDeck, setShowSignalDeck] = useState(false);
  const [nowTs, setNowTs] = useState(INITIAL_NOW_TS);
  const [checkins, setCheckins] = useState([]);
  const [checkinsWarning, setCheckinsWarning] = useState("");
  const [isSavingCheckin, setIsSavingCheckin] = useState(false);
  const [pendingCheckinVibe, setPendingCheckinVibe] = useState(null);
  const [isSubmittingCheckinVibe, setIsSubmittingCheckinVibe] = useState(false);
  const [checkinVibeCooldownUntil, setCheckinVibeCooldownUntil] = useState(0);
  const [followingCheckins, setFollowingCheckins] = useState([]);
  const [followingCheckinsWarning, setFollowingCheckinsWarning] = useState("");
  const [followingPresenceByUserId, setFollowingPresenceByUserId] = useState({});
  const [checkinMapLoadFailed, setCheckinMapLoadFailed] = useState(false);
  const [checkinStaticFallbackFailed, setCheckinStaticFallbackFailed] = useState(false);
  const [editingCheckinId, setEditingCheckinId] = useState("");
  const [selectedCheckinId, setSelectedCheckinId] = useState("");
  const [checkinViewFilter, setCheckinViewFilter] = useState("all");
  const checkinMapContainerRef = useRef(null);
  const checkinMapCardRef = useRef(null);
  const checkinFormRef = useRef(null);
  const checkinMapRef = useRef(null);
  const checkinMapMarkersRef = useRef([]);
  const [checkinForm, setCheckinForm] = useState({
    mode: "trip",
    privacy: "friends",
    country: "",
    city: "",
    sourceType: "manual",
    sourceId: "",
    label: "",
    address: "",
    note: "",
  });

  return {
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
  };
}
