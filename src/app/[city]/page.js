"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import "../signal-motion.css";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { useAuth } from "@/lib/auth";
import {
  addReport,
  getBlockedItems,
  getReports,
  subscribeBlockedItems,
  syncBlockedItemsFromCloud,
} from "@/lib/moderation";
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import { useActionToast } from "@/lib/useActionToast";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { captureOperationalError } from "@/lib/monitoring";
import { QA_ORGANIZATION_ID, QA_WEBSITE_ID } from "@/lib/seo/entityAuthority";
import { trackKpiEvent } from "@/lib/analytics";
import { showActionFeedback } from "@/lib/actionFeedback";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { createContentSubmission } from "@/lib/contentSubmissions";
import {
  buildVibeDualWriteFields,
  isMissingVibeTagsColumnError,
  normalizeVibeTags,
} from "@/lib/vibeTaxonomy";
import {
  buildLiveVibeHeadline,
  formatLiveVibeUpdatedAt,
  getLiveVibeConsensus,
  getLiveVibeMemberMomentum,
  getLiveVibePulse,
  isMissingTableError,
  LIVE_VIBE_OPTIONS,
  summarizeLiveVibeSignals,
} from "@/lib/liveVibe";
import { usePlaces } from "@/lib/usePlaces";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";
import { evaluateMapInitReadiness, shouldTriggerMapFallback } from "@/lib/mapInitGuard";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { fetchServicesQuery } from "@/lib/servicesDataApi";
import { supabase } from "@/lib/supabase";
import { buildPlaceSafetySignalMap } from "@/lib/placeSafetySignals";
import ActionToast from "@/components/ui/ActionToast";
import { useCityRouteConfig } from "@/components/city/CityRouteConfigProvider";
import CityDetailsLayer from "@/components/city/CityDetailsLayer";
import CityEventsRailSection from "@/components/city/CityEventsRailSection";
import CityGuideCluster from "@/components/city/CityGuideCluster";
import CityMapSection from "@/components/city/CityMapSection";
import CityNavigationCluster from "@/components/city/CityNavigationCluster";
import CityPlacesCluster from "@/components/city/CityPlacesCluster";
import SelectedEventPanel from "@/components/city/SelectedEventPanel";
import SelectedPlacePanel from "@/components/city/SelectedPlacePanel";
import SelectedServicePanel from "@/components/city/SelectedServicePanel";
import CityServicesCluster from "@/components/city/CityServicesCluster";
import CitySeoScaffold from "@/components/city/CitySeoScaffold";
import CitySeoTopicLinks from "@/components/city/CitySeoTopicLinks";
import CityTopCluster from "@/components/city/CityTopCluster";
import CityTonightCluster from "@/components/city/CityTonightCluster";
import SafetyShields from "@/components/city/SafetyShields";
import { buildEventAdminDraft, buildPlaceAdminDraft, buildServiceAdminDraft, normalizeExternalUrl } from "@/features/city/adminDrawerFeature";
import { cityNameFromConfig, normalizeCityKey } from "@/features/city/checkinFeature";
import {
  createCityQualityModalFromTarget,
  createCityReportDraftFromTarget,
  createInitialCityQualityModal,
  createInitialCityReportDraft,
} from "@/features/city/cityModalStateUtils";
import { getQualityToastConfig, resolveQualityUpdate } from "@/features/city/qualityModalFeature";
import { formatDate, formatEventDateLabel, isEventVisibleOnCityPage, normalizeEventRange, normalizeIsoDate } from "@/features/city/eventRailFeature";
import {
  selectCityEventById,
  selectCityEventsAll,
  selectVisibleCityEvents,
} from "@/features/city/cityEventGuards";
import {
  buildCityHeroText,
  LIVE_VIBE_COOLDOWN_MS,
  parseCityHeroText,
  polishEventDescription,
} from "@/features/city/liveVibeFeature";
import {
  normalizeServiceImageUrls,
  resolveCityFromPathname,
  SERVICE_PRICE_TIER_OPTIONS,
} from "@/features/city/cityPageUtils";
import { useCityContributionForms } from "@/features/city/useCityContributionForms";
import { useCityContributionToggles } from "@/features/city/useCityContributionToggles";
import { useCityAdminEditors } from "@/features/city/useCityAdminEditors";
import { useJoinRedirect } from "@/features/city/useJoinRedirect";
import { useCitySelectionRouting } from "@/features/city/useCitySelectionRouting";
import { useCityServiceForm } from "@/features/city/useCityServiceForm";
import {
  arePrivateEventsEquivalent,
  areRequestMapsEqual,
  areStringMapsEqual,
  combineDateAndTime,
  fallbackMemberAlias,
  formatDateTime,
  formatEndsIn,
  getPrivateEventStatus,
  PRIVATE_EVENT_TYPES,
  PRIVATE_EVENT_TYPE_LABELS,
} from "@/features/city/vipFeature";
import {
  REPORT_REASONS,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES,
  SERVICE_TYPE_STYLES,
  TRUST_ACTIONS,
  TYPE_LABELS,
  TYPES,
  TYPE_STYLES,
} from "@/features/city/cityPageConstants";
import styles from "./page.module.css";

const LAST_EXPLORED_CITY_KEY = "qa_last_explored_city";

export default function CityPage() {
  const isMapboxStylesReady = useMapboxStylesheet();
  const config = useCityRouteConfig();
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const cityParam = Array.isArray(params?.city) ? params.city[0] : params?.city;
  const city = useMemo(() => {
    const normalizedParam = normalizeCityKey(cityParam || "");
    if (normalizedParam) return normalizedParam;
    const fromPath = resolveCityFromPathname(pathname);
    return fromPath || "berlin";
  }, [cityParam, pathname]);

  const cityName = cityNameFromConfig(config, city);
  const cityHeroText = buildCityHeroText({ config, citySlug: city });
  const cityHero = parseCityHeroText(cityHeroText);
  const cityHeroIntro = useMemo(() => {
    const country = String(config?.country || "").trim();
    const vibe = String(config?.vibe || "").trim();
    const vibeTail = vibe ? ` with a ${vibe} vibe` : "";
    const tagline = String(cityHero?.tagline || "").trim();
    if (tagline) {
      return `${cityName} in ${country}${vibeTail}: ${tagline}`;
    }
    return `${cityName} in ${country}${vibeTail}: queer nightlife, trusted venues, and live community signal in one route-first guide.`;
  }, [cityHero?.tagline, cityName, config?.country, config?.vibe]);
  const placeId = searchParams?.get("placeId") || "";
  const eventId = searchParams?.get("eventId") || "";
  const serviceId = searchParams?.get("serviceId") || "";
  const contributeMode = searchParams?.get("contribute") || "";

  useEffect(() => {
    if (!city) return;
    try {
      localStorage.setItem(LAST_EXPLORED_CITY_KEY, String(city));
    } catch {
      // Ignore storage write issues in restricted browsing contexts.
    }
  }, [city]);

  const {
    places,
    addPlace,
    addReview,
    getReviews,
    isLoading: placesLoading,
    loadError: placesLoadError,
    reloadPlaces,
  } = usePlaces(city);
  const [eventsData, setEventsData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesLoadError, setServicesLoadError] = useState("");
  const [privateEvents, setPrivateEvents] = useState([]);
  const [privateEventsLoading, setPrivateEventsLoading] = useState(true);
  const [privateEventsError, setPrivateEventsError] = useState("");
  const [privateEventsTableMissing, setPrivateEventsTableMissing] = useState(false);
  const [privateEventInvites, setPrivateEventInvites] = useState({});
  const [privateInviteRequestsByEvent, setPrivateInviteRequestsByEvent] = useState({});
  const [privateInviteRequesterProfiles, setPrivateInviteRequesterProfiles] = useState({});
  const [expandedPrivateHostEventId, setExpandedPrivateHostEventId] = useState("");
  const [privateInvitesTableMissing, setPrivateInvitesTableMissing] = useState(false);
  const [isSubmittingPrivateInvite, setIsSubmittingPrivateInvite] = useState(false);
  const [isUpdatingPrivateInviteStatus, setIsUpdatingPrivateInviteStatus] = useState(false);
  const [deletingPrivateEventId, setDeletingPrivateEventId] = useState("");
  const [vipRealtimeHealthy, setVipRealtimeHealthy] = useState(false);
  const [privateFeedNowTick, setPrivateFeedNowTick] = useState(0);
  const [tonightFeedTab, setTonightFeedTab] = useState("public");
  const [hostPrivateEventOpen, setHostPrivateEventOpen] = useState(false);
  const [isSubmittingPrivateEvent, setIsSubmittingPrivateEvent] = useState(false);
  const [privateEventForm, setPrivateEventForm] = useState({
    title: "",
    eventType: PRIVATE_EVENT_TYPES[0].value,
    startDate: "",
    startTime: "",
    approxArea: "",
    exactLocation: "",
    notes: "",
  });
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [addEventMode, setAddEventMode] = useState(false);
  const [addServiceMode, setAddServiceMode] = useState(false);
  const {
    name,
    setName,
    type,
    setType,
    address,
    setAddress,
    description,
    setDescription,
    vibe,
    setVibe,
    vibeTags,
    setVibeTags,
    placeHours,
    setPlaceHours,
    placeLink,
    setPlaceLink,
    eventName,
    setEventName,
    eventAddress,
    setEventAddress,
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
    eventVibe,
    setEventVibe,
    eventVibeTags,
    setEventVibeTags,
    eventDescription,
    setEventDescription,
    eventLink,
    setEventLink,
    eventTicketUrl,
    setEventTicketUrl,
    resetPlaceForm,
    resetEventForm,
  } = useCityContributionForms();
  const {
    serviceName,
    setServiceName,
    serviceType,
    setServiceType,
    serviceAddress,
    setServiceAddress,
    serviceDescription,
    setServiceDescription,
    serviceVibe,
    setServiceVibe,
    serviceVibeTags,
    setServiceVibeTags,
    serviceHours,
    setServiceHours,
    serviceLink,
    setServiceLink,
    serviceBookingLink,
    setServiceBookingLink,
    serviceContact,
    setServiceContact,
    serviceProviderName,
    setServiceProviderName,
    servicePriceTier,
    setServicePriceTier,
    serviceImageUrlsInput,
    setServiceImageUrlsInput,
    resetServiceForm,
  } = useCityServiceForm();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [safetyRating, setSafetyRating] = useState(4);
  const [hoverSafetyRating, setHoverSafetyRating] = useState(null);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast, showToast } = useActionToast();
  const [selectedPlaceDbId, setSelectedPlaceDbId] = useState("");
  const [liveVibeRows, setLiveVibeRows] = useState([]);
  const [isLoadingLiveVibe, setIsLoadingLiveVibe] = useState(false);
  const [liveVibeError, setLiveVibeError] = useState("");
  const [isSubmittingLiveVibe, setIsSubmittingLiveVibe] = useState(false);
  const [liveVibeTableMissing, setLiveVibeTableMissing] = useState(false);
  const [liveVibeSubmittingKey, setLiveVibeSubmittingKey] = useState("");
  const [liveVibeJustSentKey, setLiveVibeJustSentKey] = useState("");
  const [showLiveVibeMomentum, setShowLiveVibeMomentum] = useState(false);
  const [isSubmittingEventLiveVibe, setIsSubmittingEventLiveVibe] = useState(false);
  const [eventLiveVibeSubmittingKey, setEventLiveVibeSubmittingKey] = useState("");
  const [eventLiveVibeJustSentKey, setEventLiveVibeJustSentKey] = useState("");
  const [eventLiveVibeSignalKey, setEventLiveVibeSignalKey] = useState("");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsLoadError, setEventsLoadError] = useState("");
  const [mapError, setMapError] = useState("");
  const [safetySignalsByPlaceId, setSafetySignalsByPlaceId] = useState({});
  const [, setQualityTick] = useState(0);
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [activeCitySection, setActiveCitySection] = useState("map");
  const [desktopContentSection, setDesktopContentSection] = useState("home");
  const [activeVenueFilter, setActiveVenueFilter] = useState("");
  const { isMember, user, memberName } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTrustedContributor, setIsTrustedContributor] = useState(false);
  const [placeAdminOpen, setPlaceAdminOpen] = useState(false);
  const [eventAdminOpen, setEventAdminOpen] = useState(false);
  const [serviceAdminOpen, setServiceAdminOpen] = useState(false);
  const [placeAdminDraft, setPlaceAdminDraft] = useState(() => buildPlaceAdminDraft(null));
  const [eventAdminDraft, setEventAdminDraft] = useState(() => buildEventAdminDraft(null));
  const [serviceAdminDraft, setServiceAdminDraft] = useState(() => buildServiceAdminDraft(null));
  const [isSavingPlaceAdmin, setIsSavingPlaceAdmin] = useState(false);
  const [isSavingEventAdmin, setIsSavingEventAdmin] = useState(false);
  const [isSavingServiceAdmin, setIsSavingServiceAdmin] = useState(false);
  const [isSavingPlaceAddressOnly, setIsSavingPlaceAddressOnly] = useState(false);
  const [isSavingEventAddressOnly, setIsSavingEventAddressOnly] = useState(false);
  const [isSavingServiceAddressOnly, setIsSavingServiceAddressOnly] = useState(false);
  const [isDeletingPlaceAdmin, setIsDeletingPlaceAdmin] = useState(false);
  const [isDeletingEventAdmin, setIsDeletingEventAdmin] = useState(false);
  const [isDeletingServiceAdmin, setIsDeletingServiceAdmin] = useState(false);
  const [trustedPlaceSavesCount, setTrustedPlaceSavesCount] = useState(0);
  const [trustedEventSavesCount, setTrustedEventSavesCount] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState(() => createInitialCityReportDraft(REPORT_REASONS[0].value));
  const [qualityModal, setQualityModal] = useState(() => createInitialCityQualityModal());

  const mapContainerRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const mainScrollRef = useRef(null);
  const centerColumnScrollRef = useRef(null);
  const eventsSectionRef = useRef(null);
  const tonightSectionRef = useRef(null);
  const guideSectionRef = useRef(null);
  const servicesSectionRef = useRef(null);
  const placesSectionRef = useRef(null);
  const venueGroupRefs = useRef({});
  const addEventFormRef = useRef(null);
  const addServiceFormRef = useRef(null);
  const mapRef = useRef(null);
  const mapboxGlRef = useRef(null);
  const hoverPopupRef = useRef(null);
  const markersRef = useRef([]);
  const placeMarkersRef = useRef(new Map());
  const eventMarkersRef = useRef(new Map());
  const serviceMarkersRef = useRef(new Map());
  const isMapInteractingRef = useRef(false);
  const keepMapViewOnNextCloseRef = useRef(false);
  const selectionOriginRef = useRef("init");
  const lastSelectionKeyRef = useRef("");

  const openEventContribution = useCallback(() => {
    setAddEventMode(true);
    setAddMode(false);
    setAddServiceMode(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        addEventFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }, []);

  const scrollToSection = useCallback((ref) => {
    ref?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const goToMobileSection = useCallback((sectionKey, ref) => {
    setActiveCitySection(String(sectionKey || "guide"));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(ref);
      });
    });
  }, [scrollToSection]);

  const showDesktopSection = useCallback((sectionKey) => {
    setDesktopContentSection(String(sectionKey || "home"));
    requestAnimationFrame(() => {
      const scrollContainer = centerColumnScrollRef.current || mainScrollRef.current;
      scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, []);

  const clearSelectedDetailFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const hadSelection =
      url.searchParams.has("placeId") ||
      url.searchParams.has("eventId") ||
      url.searchParams.has("serviceId");
    if (!hadSelection) return;
    url.searchParams.delete("placeId");
    url.searchParams.delete("eventId");
    url.searchParams.delete("serviceId");
    url.searchParams.delete("lat");
    url.searchParams.delete("lng");
    const nextQuery = url.searchParams.toString();
    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextHref);
  }, [pathname, router]);

  const handleDesktopSectionNav = useCallback((sectionKey, ref) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1280) {
      const currentDetailSection = eventId
        ? "events"
        : placeId
          ? "venues"
          : serviceId
            ? "services"
            : "";
      if (currentDetailSection && currentDetailSection !== sectionKey) {
        selectionOriginRef.current = "left-nav";
        clearSelectedDetailFromUrl();
      }
      showDesktopSection(sectionKey);
      return;
    }
    scrollToSection(ref);
  }, [clearSelectedDetailFromUrl, eventId, placeId, scrollToSection, serviceId, showDesktopSection]);

  const resetMapToCityOverview = useCallback(() => {
    const map = mapRef.current;
    if (!map || !Array.isArray(config?.center) || config.center.length < 2) return;
    map.flyTo({
      center: config.center,
      zoom: config.zoom ?? 11,
      essential: true,
      duration: 900,
    });
  }, [config?.center, config?.zoom]);

  const handleGoHomeDesktop = useCallback(() => {
    setAddMode(false);
    setAddEventMode(false);
    setAddServiceMode(false);
    handleDesktopSectionNav("home", guideSectionRef);
    resetMapToCityOverview();
  }, [handleDesktopSectionNav, resetMapToCityOverview]);

  const setVenueGroupRef = useCallback((groupValue, node) => {
    const key = String(groupValue || "").trim();
    if (!key) return;
    if (!node) {
      delete venueGroupRefs.current[key];
      return;
    }
    venueGroupRefs.current[key] = node;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const sections = [
      { key: "map", ref: mapWrapperRef },
      { key: "guide", ref: guideSectionRef },
      { key: "events", ref: tonightSectionRef },
      { key: "services", ref: servicesSectionRef },
      { key: "venues", ref: placesSectionRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const key = visible[0].target.getAttribute("data-section-key");
        if (key) setActiveCitySection(key);
      },
      {
        root: null,
        threshold: [0.35, 0.6, 0.85],
        rootMargin: "-10% 0px -45% 0px",
      }
    );

    sections.forEach((section) => {
      const node = section.ref?.current;
      if (!node) return;
      node.setAttribute("data-section-key", section.key);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.documentElement.classList.add("qa-city-scroll-lock");
    document.body.classList.add("qa-city-scroll-lock");
    return () => {
      document.documentElement.classList.remove("qa-city-scroll-lock");
      document.body.classList.remove("qa-city-scroll-lock");
    };
  }, []);

  const handleDesktopPanelWheel = useCallback((event) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;

    event.preventDefault();
    const scrollContainer = centerColumnScrollRef.current || mainScrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTop += event.deltaY;
    }
  }, []);

  useEffect(() => {
    isMapInteractingRef.current = isMapInteracting;
  }, [isMapInteracting]);

  useEffect(() => {
    let active = true;

    queueMicrotask(async () => {
      if (!isMember || !user?.email) {
        if (active) setIsAdmin(false);
        return;
      }

      const adminRes = await resolveAdminAccess({
        email: user?.email,
      });
      const isAdminAccess = Boolean(adminRes?.isAdmin);
      let trustedAccess = false;
      if (isAdminAccess) {
        trustedAccess = true;
      } else if (user?.id) {
        const profileRes = await supabase
          .from("member_profiles")
          .select("trusted_contributor")
          .eq("user_id", user.id)
          .maybeSingle();
        trustedAccess = Boolean(profileRes?.data?.trusted_contributor);
      }

      if (active) {
        setIsAdmin(isAdminAccess);
        setIsTrustedContributor(trustedAccess);
      }
    });

    return () => {
      active = false;
    };
  }, [isMember, user?.email, user?.id]);

  const canPublishDirect = isAdmin || isTrustedContributor;
  const canRefreshQuality = isAdmin || isTrustedContributor;

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

  const cityPlaces = useMemo(
    () => {
      const normalizedCity = normalizeCityKey(city);
      return places.filter((place) => (
        normalizeCityKey(place.city) === normalizedCity
        && !blockedItems.some(
          (item) =>
            item.targetType === "place" &&
            String(item.targetId) === String(place.id)
        )
      ));
    },
    [blockedItems, city, places]
  );

  const cityServices = useMemo(() => {
    const normalizedCity = normalizeCityKey(city);
    return (Array.isArray(servicesData) ? servicesData : [])
      .filter((service) => normalizeCityKey(service?.city) === normalizedCity)
      .filter((service) => !blockedItems.some(
        (item) =>
          item.targetType === "service" &&
          String(item.targetId) === String(service?.id)
      ))
      .map((service) => ({
        ...service,
        image_urls: normalizeServiceImageUrls(service?.image_urls),
        vibe_tags: normalizeVibeTags(service?.vibe_tags, { max: 3 }),
      }));
  }, [blockedItems, city, servicesData]);

  const cityEventsAll = useMemo(
    () => selectCityEventsAll({ eventsData, city, blockedItems, normalizeCityKey }),
    [blockedItems, city, eventsData]
  );

  const cityEvents = useMemo(
    () => selectVisibleCityEvents(cityEventsAll, isEventVisibleOnCityPage),
    [cityEventsAll]
  );

  const cityPrivateEvents = useMemo(() => {
    const normalizedCity = normalizeCityKey(city);
    const nowMs = privateFeedNowTick;
    return privateEvents
      .filter((event) => normalizeCityKey(event.city) === normalizedCity)
      .filter((event) => {
        if (String(event.status || "active") !== "active") return false;
        const expiresAt = new Date(event.expires_at || "").getTime();
        return !Number.isFinite(expiresAt) || expiresAt > nowMs;
      })
      .sort((a, b) => {
        const statusA = getPrivateEventStatus(a).key;
        const statusB = getPrivateEventStatus(b).key;
        const rank = { live: 0, upcoming: 1, ended: 2 };
        if (rank[statusA] !== rank[statusB]) return rank[statusA] - rank[statusB];
        return new Date(a.start_at || 0).getTime() - new Date(b.start_at || 0).getTime();
      });
  }, [city, privateEvents, privateFeedNowTick]);

  const qualityMap = getQualityMap();

  const selectedPlace = useMemo(() => {
    if (!placeId) return null;
    return cityPlaces.find((place) => String(place.id) === String(placeId)) || null;
  }, [cityPlaces, placeId]);

  const selectedEvent = useMemo(() => {
    return selectCityEventById(cityEventsAll, eventId);
  }, [cityEventsAll, eventId]);

  const selectedService = useMemo(() => {
    if (!serviceId) return null;
    return cityServices.find((service) => String(service.id) === String(serviceId)) || null;
  }, [cityServices, serviceId]);

  useEffect(() => {
    let active = true;
    const placeIds = cityPlaces
      .map((place) => String(place?.id || "").trim())
      .filter(Boolean);

    if (placeIds.length === 0) {
      queueMicrotask(() => {
        if (active) setSafetySignalsByPlaceId({});
      });
      return () => {
        active = false;
      };
    }

    const refreshSignals = async () => {
      const numericPlaceIds = placeIds
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);
      const checkinLookbackIso = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
      const reportLookbackIso = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
      const liveLookbackIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [checkinsRes, reportsRes, liveSignalsRes, reviewSafetyRes] = await Promise.all([
        numericPlaceIds.length > 0
          ? supabase
              .from("qa_member_checkins")
              .select("place_id, checked_in_at")
              .in("place_id", numericPlaceIds)
              .gte("checked_in_at", checkinLookbackIso)
              .limit(2000)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("qa_reports")
          .select("target_id, status, created_at, target_type")
          .eq("target_type", "place")
          .in("target_id", placeIds)
          .gte("created_at", reportLookbackIso)
          .limit(1200),
        numericPlaceIds.length > 0
          ? supabase
              .from("qa_place_vibe_signals")
              .select("place_id, signal_key, created_at")
              .in("place_id", numericPlaceIds)
              .gte("created_at", liveLookbackIso)
              .limit(2000)
          : Promise.resolve({ data: [], error: null }),
        numericPlaceIds.length > 0
          ? supabase
              .from("reviews")
              .select("place_id, safety, created_at")
              .in("place_id", numericPlaceIds)
              .limit(3000)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (!active) return;

      const localReports = getReports()
        .filter((row) => String(row?.targetType || "").toLowerCase() === "place")
        .filter((row) => placeIds.includes(String(row?.targetId || "")))
        .map((row) => ({
          target_id: String(row.targetId || ""),
          status: row.status || "open",
          created_at: row.createdAt || null,
        }));
      const cloudReports = Array.isArray(reportsRes?.data) ? reportsRes.data : [];
      const reportsRows = cloudReports.length > 0 ? cloudReports : localReports;
      const checkinsRows = Array.isArray(checkinsRes?.data) ? checkinsRes.data : [];
      const liveRows = Array.isArray(liveSignalsRes?.data) ? liveSignalsRes.data : [];
      const reviewSafetyRows = Array.isArray(reviewSafetyRes?.data) ? reviewSafetyRes.data : [];

      const nextMap = buildPlaceSafetySignalMap({
        places: cityPlaces,
        checkins: checkinsRows,
        reports: reportsRows,
        liveSignals: liveRows,
        reviewSafety: reviewSafetyRows,
      });
      setSafetySignalsByPlaceId(nextMap);
    };

    queueMicrotask(refreshSignals);
    const interval = window.setInterval(refreshSignals, 5 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [cityPlaces]);

  useEffect(() => {
    queueMicrotask(() => {
      setPlaceAdminOpen(false);
      setPlaceAdminDraft(buildPlaceAdminDraft(selectedPlace || null));
    });
  }, [selectedPlace]);

  useEffect(() => {
    queueMicrotask(() => {
      setEventAdminOpen(false);
      setEventAdminDraft(buildEventAdminDraft(selectedEvent || null));
    });
  }, [selectedEvent]);

  useEffect(() => {
    queueMicrotask(() => {
      setServiceAdminOpen(false);
      setServiceAdminDraft(buildServiceAdminDraft(selectedService || null));
    });
  }, [selectedService]);

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      if (!isMember || !user?.id || !selectedPlace?.id) {
        if (active) setTrustedPlaceSavesCount(0);
        return;
      }
      const { data, error } = await supabase.rpc("qa_following_favorite_count", {
        target_favorite_id: String(selectedPlace.id),
      });
      if (!active) return;
      if (error) {
        setTrustedPlaceSavesCount(0);
        return;
      }
      setTrustedPlaceSavesCount(Number(data || 0));
    });
    return () => {
      active = false;
    };
  }, [isMember, selectedPlace?.id, user?.id]);

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      if (!isMember || !user?.id || !selectedEvent?.id) {
        if (active) setTrustedEventSavesCount(0);
        return;
      }
      const { data, error } = await supabase.rpc("qa_following_favorite_count", {
        target_favorite_id: `event-${String(selectedEvent.id)}`,
      });
      if (!active) return;
      if (error) {
        setTrustedEventSavesCount(0);
        return;
      }
      setTrustedEventSavesCount(Number(data || 0));
    });
    return () => {
      active = false;
    };
  }, [isMember, selectedEvent?.id, user?.id]);

  const canReviewSelectedPlace = Boolean(selectedPlace);
  const liveVibeSummary = useMemo(() => summarizeLiveVibeSignals(liveVibeRows), [liveVibeRows]);
  const liveVibeHeadline = useMemo(() => buildLiveVibeHeadline(liveVibeSummary), [liveVibeSummary]);
  const liveVibeUpdatedLabel = useMemo(
    () => formatLiveVibeUpdatedAt(liveVibeSummary.latestTimestamp),
    [liveVibeSummary.latestTimestamp]
  );
  const liveVibePulse = useMemo(() => getLiveVibePulse(liveVibeSummary), [liveVibeSummary]);
  const liveVibeConsensus = useMemo(() => getLiveVibeConsensus(liveVibeSummary), [liveVibeSummary]);
  const liveVibeMemberMomentum = useMemo(
    () => getLiveVibeMemberMomentum(liveVibeRows, user?.id),
    [liveVibeRows, user?.id]
  );
  const liveVibeMyLastTapMs = useMemo(() => {
    if (!user?.id) return null;
    let latest = null;
    for (const row of Array.isArray(liveVibeRows) ? liveVibeRows : []) {
      if (String(row?.user_id || "") !== String(user.id)) continue;
      const ms = new Date(row?.created_at || "").getTime();
      if (!Number.isFinite(ms)) continue;
      if (!latest || ms > latest) latest = ms;
    }
    return latest;
  }, [liveVibeRows, user?.id]);
  const liveVibeCooldownRemainingSec = useMemo(() => {
    const nowMs = privateFeedNowTick;
    if (!liveVibeMyLastTapMs) return 0;
    const remaining = LIVE_VIBE_COOLDOWN_MS - (nowMs - liveVibeMyLastTapMs);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / 1000);
  }, [liveVibeMyLastTapMs, privateFeedNowTick]);
  const liveVibeStreakNudge = useMemo(() => {
    if (!isMember) return "";
    if (liveVibeMemberMomentum.todayTapped) return "Nice. You already locked your streak today.";
    if (privateFeedNowTick <= 0) return "Signal updates are syncing.";

    const now = new Date(privateFeedNowTick);
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const hoursLeft = Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (60 * 60 * 1000)));
    return `No tap today yet. One quick signal in the next ${hoursLeft}h keeps your streak alive.`;
  }, [isMember, liveVibeMemberMomentum.todayTapped, privateFeedNowTick]);
  const liveVibeMyActiveSignalKey = useMemo(() => {
    if (!user?.id) return "";
    if (privateFeedNowTick <= 0) return "";
    const cutoffMs = privateFeedNowTick - (6 * 60 * 60 * 1000);
    const myRows = (Array.isArray(liveVibeRows) ? liveVibeRows : [])
      .filter((row) => String(row?.user_id || "") === String(user.id))
      .filter((row) => {
        const ms = new Date(row?.created_at || "").getTime();
        return Number.isFinite(ms) && ms >= cutoffMs;
      })
      .sort((a, b) => new Date(b?.created_at || "").getTime() - new Date(a?.created_at || "").getTime());
    return String(myRows[0]?.signal_key || "");
  }, [liveVibeRows, privateFeedNowTick, user?.id]);
  const liveVibeSelectedOption = useMemo(
    () => LIVE_VIBE_OPTIONS.find((option) => option.key === liveVibeMyActiveSignalKey) || null,
    [liveVibeMyActiveSignalKey]
  );
  const eventLiveVibeSelectedOption = useMemo(
    () => LIVE_VIBE_OPTIONS.find((option) => option.key === eventLiveVibeSignalKey) || null,
    [eventLiveVibeSignalKey]
  );

  useEffect(() => {
    queueMicrotask(() => {
      setShowLiveVibeMomentum(false);
    });
  }, [selectedPlace?.id]);

  useEffect(() => {
    queueMicrotask(() => {
      setEventLiveVibeSignalKey("");
      setEventLiveVibeJustSentKey("");
    });
  }, [selectedEvent?.id]);

  const selectedPlaceQuality = selectedPlace
    ? getEntityQuality({
      targetType: "place",
      targetId: selectedPlace.id,
      entity: selectedPlace,
      map: qualityMap,
    })
    : null;
  const selectedPlaceQualityStatus = useMemo(
    () => (selectedPlaceQuality ? getQualityStatus(selectedPlaceQuality) : null),
    [selectedPlaceQuality]
  );
  const selectedPlaceSafetySignal = useMemo(() => {
    if (!selectedPlace) return null;
    return safetySignalsByPlaceId[String(selectedPlace.id)] || null;
  }, [safetySignalsByPlaceId, selectedPlace]);

  const selectedEventQuality = selectedEvent
    ? getEntityQuality({
      targetType: "event",
      targetId: selectedEvent.id,
      entity: selectedEvent,
      map: qualityMap,
    })
    : null;
  const selectedEventQualityStatus = useMemo(
    () => (selectedEventQuality ? getQualityStatus(selectedEventQuality) : null),
    [selectedEventQuality]
  );

  const selectedServiceQuality = selectedService
    ? getEntityQuality({
      targetType: "service",
      targetId: selectedService.id,
      entity: selectedService,
      map: qualityMap,
    })
    : null;
  const selectedServiceQualityStatus = useMemo(
    () => (selectedServiceQuality ? getQualityStatus(selectedServiceQuality) : null),
    [selectedServiceQuality]
  );
  const canShowSelectedServiceOnMap = useMemo(
    () => Number.isFinite(Number(selectedService?.lat)) && Number.isFinite(Number(selectedService?.lng)),
    [selectedService?.lat, selectedService?.lng]
  );
  const selectedServiceImages = useMemo(
    () => normalizeServiceImageUrls(selectedService?.image_urls),
    [selectedService?.image_urls]
  );
  const selectedServiceBookingUrl = useMemo(
    () => normalizeExternalUrl(selectedService?.booking_link || ""),
    [selectedService?.booking_link]
  );
  const selectedServiceLinkUrl = useMemo(
    () => normalizeExternalUrl(selectedService?.link || ""),
    [selectedService?.link]
  );

  const placesByType = useMemo(
    () =>
      cityPlaces.reduce((acc, place) => {
        const key = String(place?.type || "");
        if (!acc[key]) acc[key] = [];
        acc[key].push(place);
        return acc;
      }, {}),
    [cityPlaces]
  );
  const groupedPlaces = useMemo(
    () =>
      TYPES.map((item) => ({
        ...item,
        items: placesByType[item.value] || [],
      })),
    [placesByType]
  );
  const activeVenueFilterValues = useMemo(() => {
    const key = String(activeVenueFilter || "").trim();
    if (!key) return [];
    if (key === "cafe_restaurant") return ["cafe", "restaurant"];
    return [key];
  }, [activeVenueFilter]);
  const visiblePlaceGroups = useMemo(
    () =>
      groupedPlaces.filter((group) => {
        const hasItems = group.items.length > 0;
        if (!hasItems) return false;
        if (activeVenueFilterValues.length === 0) return true;
        return activeVenueFilterValues.includes(String(group.value || ""));
      }),
    [activeVenueFilterValues, groupedPlaces]
  );
  const venueJumpGroups = useMemo(
    () =>
      visiblePlaceGroups.map((group) => ({
        value: String(group.value || ""),
        label: String(group.label || group.value || "Venues"),
        count: Array.isArray(group.items) ? group.items.length : 0,
      })),
    [visiblePlaceGroups]
  );
  const handleGoVenueType = useCallback((groupValue) => {
    const rawKey = String(groupValue || "").trim();
    const venueKeys = rawKey === "cafe_restaurant" ? ["cafe", "restaurant"] : [rawKey];
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1280;
    if (isDesktop) {
      selectionOriginRef.current = "left-nav";
      clearSelectedDetailFromUrl();
    }
    setActiveVenueFilter(rawKey);

    if (isDesktop) {
      showDesktopSection("venues");
    }

    if (!rawKey) {
      scrollToSection(placesSectionRef);
      return;
    }

    const scrollToTargetVenue = () => {
      const targetNode = venueKeys
        .map((key) => venueGroupRefs.current[key])
        .find(Boolean);

      if (targetNode) {
        targetNode.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        scrollToSection(placesSectionRef);
      }
    };

    if (isDesktop) {
      window.setTimeout(scrollToTargetVenue, 90);
    } else {
      scrollToTargetVenue();
    }

    const targetGroup = visiblePlaceGroups.find((group) =>
      venueKeys.includes(String(group?.value || ""))
    );
    const firstPlace = targetGroup?.items?.[0];
    if (firstPlace?.id) {
      setHoveredPlaceId(String(firstPlace.id));
      window.setTimeout(() => setHoveredPlaceId(null), 1200);
    }
  }, [clearSelectedDetailFromUrl, scrollToSection, showDesktopSection, visiblePlaceGroups]);

  const servicesByType = useMemo(
    () =>
      cityServices.reduce((acc, service) => {
        const key = String(service?.type || "other");
        if (!acc[key]) acc[key] = [];
        acc[key].push(service);
        return acc;
      }, {}),
    [cityServices]
  );
  const groupedServices = useMemo(
    () =>
      SERVICE_TYPES.map((item) => ({
        ...item,
        items: servicesByType[item.value] || [],
      })),
    [servicesByType]
  );
  const visibleServiceGroups = useMemo(
    () => groupedServices.filter((group) => group.items.length > 0),
    [groupedServices]
  );

  const sortedEvents = useMemo(
    () =>
      cityEvents
        .reduce((acc, event) => {
          const normalized = normalizeEventRange(event);
          const startDate = String(normalized.startDate || "");
          if (!startDate) return acc;
          acc.push({ event: normalized, startDate });
          return acc;
        }, [])
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .map((entry) => entry.event),
    [cityEvents]
  );

  const featuredEvent = useMemo(() => {
    if (sortedEvents.length === 0) return null;
    const now = privateFeedNowTick > 0 ? new Date(privateFeedNowTick) : new Date(0);
    const nowIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const upcoming = sortedEvents.find((event) => normalizeEventRange(event).endDate >= nowIso);
    return upcoming || sortedEvents[0];
  }, [privateFeedNowTick, sortedEvents]);

  const remainingEvents = useMemo(() => {
    if (!featuredEvent) return sortedEvents;
    return sortedEvents.filter((event) => String(event.id) !== String(featuredEvent.id));
  }, [featuredEvent, sortedEvents]);
  const isFocusMode = Boolean(selectedPlace || selectedEvent || selectedService);
  const isAddComposerActive = Boolean(addMode || addEventMode || addServiceMode);
  const cityPlaceCount = cityPlaces.length;
  const cityEventCount = cityEvents.length;
  const cityServiceCount = cityServices.length;
  const cityCanonicalUrl = `https://www.queeratlas.app/${city}`;
  const cityBreadcrumbJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.queeratlas.app/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Cities",
          item: "https://www.queeratlas.app/cities",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: cityName,
          item: cityCanonicalUrl,
        },
      ],
    }),
    [cityCanonicalUrl, cityName]
  );
  const cityPlacesItemListJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${cityCanonicalUrl}#places-list`,
      url: cityCanonicalUrl,
      name: `Queer venues in ${cityName}`,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: cityPlaceCount,
      isPartOf: {
        "@id": QA_WEBSITE_ID,
      },
      publisher: {
        "@id": QA_ORGANIZATION_ID,
      },
      itemListElement: cityPlaces.slice(0, 12).map((place, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Place",
          name: String(place?.name || "Venue"),
          address: String(place?.location || ""),
          url: cityCanonicalUrl,
        },
      })),
    }),
    [cityCanonicalUrl, cityName, cityPlaceCount, cityPlaces]
  );
  const cityEventsItemListJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${cityCanonicalUrl}#events-list`,
      url: cityCanonicalUrl,
      name: `LGBTQ events in ${cityName}`,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: cityEventCount,
      isPartOf: {
        "@id": QA_WEBSITE_ID,
      },
      publisher: {
        "@id": QA_ORGANIZATION_ID,
      },
      itemListElement: sortedEvents.slice(0, 12).map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: String(event?.name || "Event"),
          startDate: String(event?.date || ""),
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: String(event?.location || cityName),
          },
          url: cityCanonicalUrl,
        },
      })),
    }),
    [cityCanonicalUrl, cityEventCount, cityName, sortedEvents]
  );
  const cityFaqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `What makes queer nightlife in ${cityName} different?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              cityHeroIntro ||
              `${cityName} combines local community signal with route-friendly nightlife planning so members can choose better stops with less guesswork.`,
          },
        },
        {
          "@type": "Question",
          name: `How should I plan a first queer night in ${cityName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              `Start with one social warm-up venue, then move to your peak stop based on timing and crowd fit. Keep one fallback option in the same zone to protect momentum.`,
          },
        },
        {
          "@type": "Question",
          name: `Can I use this ${cityName} guide for same-night decisions?`,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              `Yes. This page is built for same-night use with live venue signal, current events, and practical fallback choices.`,
          },
        },
      ],
    }),
    [cityHeroIntro, cityName]
  );
  const hasAnyPlaces = cityPlaceCount > 0;
  const hasAnyServices = cityServiceCount > 0;
  const placesChipLabel = placesLoading
    ? "Curated places"
    : cityPlaceCount > 0
      ? `${cityPlaceCount} places`
      : "Places incoming";
  const eventsChipLabel = eventsLoading
    ? "Event calendar"
    : cityEventCount > 0
      ? `${cityEventCount} events`
      : "Events incoming";
  const todayIso = useMemo(() => {
    if (privateFeedNowTick <= 0) return "";
    return new Date(privateFeedNowTick).toISOString().slice(0, 10);
  }, [privateFeedNowTick]);
  const privateEventStartPreview = useMemo(
    () => combineDateAndTime(privateEventForm.startDate, privateEventForm.startTime),
    [privateEventForm.startDate, privateEventForm.startTime],
  );
  const privateEventExpiresPreview = useMemo(() => {
    if (!privateEventStartPreview) return null;
    return new Date(privateEventStartPreview.getTime() + (24 * 60 * 60 * 1000));
  }, [privateEventStartPreview]);
  const pendingPrivateInviteCountByEvent = useMemo(
    () =>
      Object.keys(privateInviteRequestsByEvent || {}).reduce((acc, eventId) => {
        const rows = Array.isArray(privateInviteRequestsByEvent[eventId])
          ? privateInviteRequestsByEvent[eventId]
          : [];
        let pending = 0;
        for (const row of rows) {
          if (String(row?.status || "requested") === "requested") pending += 1;
        }
        acc[eventId] = pending;
        return acc;
      }, {}),
    [privateInviteRequestsByEvent]
  );

  const {
    buildSelectionUrl,
    openPlace: routeOpenPlace,
    openEvent: routeOpenEvent,
    openService: routeOpenService,
    closeService: routeCloseService,
    closePlace: routeClosePlace,
    closeEvent: routeCloseEvent,
    closeAllDetails: routeCloseAllDetails,
  } = useCitySelectionRouting({
    pathname,
    searchParams,
    placeId,
    eventId,
    serviceId,
    router,
  });

  const openPlace = useCallback(
    (place, { origin = "list", ...options } = {}) => {
      selectionOriginRef.current = origin;
      routeOpenPlace(place, options);
    },
    [routeOpenPlace]
  );

  const openEvent = useCallback(
    (event, { origin = "list", ...options } = {}) => {
      selectionOriginRef.current = origin;
      if (typeof window !== "undefined" && window.innerWidth >= 1280) {
        setDesktopContentSection("events");
      }
      routeOpenEvent(event, options);
    },
    [routeOpenEvent]
  );

  const openService = useCallback(
    (service, { origin = "list", ...options } = {}) => {
      selectionOriginRef.current = origin;
      routeOpenService(service, options);
    },
    [routeOpenService]
  );

  const closeService = useCallback(
    ({ origin = "panel-close", ...options } = {}) => {
      selectionOriginRef.current = origin;
      routeCloseService(options);
    },
    [routeCloseService]
  );

  const closePlace = useCallback(
    ({ origin = "panel-close", ...options } = {}) => {
      selectionOriginRef.current = origin;
      routeClosePlace(options);
    },
    [routeClosePlace]
  );

  const closeEvent = useCallback(
    ({ origin = "panel-close", ...options } = {}) => {
      selectionOriginRef.current = origin;
      routeCloseEvent(options);
    },
    [routeCloseEvent]
  );

  const closeAllDetails = useCallback(
    ({ origin = "panel-close", ...options } = {}) => {
      selectionOriginRef.current = origin;
      routeCloseAllDetails(options);
    },
    [routeCloseAllDetails]
  );

  const effectiveDesktopContentSection = useMemo(() => {
    if (eventId) return "events";
    if (placeId) return "venues";
    if (serviceId) return "services";
    return desktopContentSection;
  }, [desktopContentSection, eventId, placeId, serviceId]);

  const { redirectToJoin, redirectToJoinWithReturnTarget } = useJoinRedirect({
    pathname,
    router,
  });

  const {
    onToggleAddPlace,
    onToggleAddEvent,
    onToggleAddService,
  } = useCityContributionToggles({
    isMember,
    redirectToJoin,
    addEventMode,
    setAddMode,
    setAddEventMode,
    setAddServiceMode,
    openEventContribution,
    addServiceFormRef,
  });

  const {
    canEditSelectedService,
    toggleServiceAdminEditor,
    togglePlaceAdminEditor,
    toggleEventAdminEditor,
  } = useCityAdminEditors({
    isMember,
    isAdmin,
    userId: user?.id,
    selectedService,
    selectedPlace,
    selectedEvent,
    setServiceAdminOpen,
    setServiceAdminDraft,
    setPlaceAdminOpen,
    setPlaceAdminDraft,
    setEventAdminOpen,
    setEventAdminDraft,
    buildServiceAdminDraft,
    buildPlaceAdminDraft,
    buildEventAdminDraft,
  });
  const canDeleteSelectedService = isAdmin;


  const showServiceOnMap = () => {
    const lat = Number(selectedService?.lat);
    const lng = Number(selectedService?.lng);
    if (!selectedService || !mapRef.current || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 16.4,
    });

    const isMobileViewport =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 1024px)").matches;

    if (isMobileViewport) {
      keepMapViewOnNextCloseRef.current = true;
      closeService({ origin: "map-cta" });
      requestAnimationFrame(() => {
        mapWrapperRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }

    mapWrapperRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleReportSelectedService = () => {
    if (!selectedService) return;
    handleReport({
      targetType: "service",
      targetId: selectedService.id,
      title: selectedService.name,
    });
  };
  const showEventOnMap = () => {
    if (!selectedEvent || !mapRef.current || selectedEvent.lat == null || selectedEvent.lng == null) return;

    mapRef.current.flyTo({
      center: [selectedEvent.lng, selectedEvent.lat],
      zoom: 16.4,
    });

    const isMobileViewport =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 1024px)").matches;

    if (isMobileViewport) {
      keepMapViewOnNextCloseRef.current = true;
      closeEvent({ origin: "map-cta" });
      requestAnimationFrame(() => {
        mapWrapperRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }

    mapWrapperRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const toggleFavorite = (id) => {
    const key = String(id);
    let updated;

    if (favorites.includes(key)) {
      updated = favorites.filter((entry) => entry !== key);
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

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsLoadError("");
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        setEventsLoadError("Could not load city events right now.");
        setEventsData((await mergeSeedEventsAsync([])).map((event) => normalizeEventRange(event)));
        return;
      }

      setEventsData((await mergeSeedEventsAsync(data || [])).map((event) => normalizeEventRange(event)));
    } catch {
      setEventsLoadError("Could not reach event service right now.");
      setEventsData((await mergeSeedEventsAsync([])).map((event) => normalizeEventRange(event)));
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesLoadError("");
    try {
      const result = await fetchServicesQuery({
        select:
          "id, name, city, type, description, hours, link, location, lat, lng, price_tier, provider_name, contact, booking_link, image_urls, vibe, vibe_tags, source, lastChecked, verified, created_by",
      });

      if (result?.error) {
        setServicesLoadError("Could not load local services right now.");
        setServicesData([]);
        return;
      }

      setServicesData(Array.isArray(result?.data) ? result.data : []);
    } catch {
      setServicesLoadError("Could not reach service index right now.");
      setServicesData([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchPrivateEvents = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setPrivateEventsLoading(true);
    }
    setPrivateEventsError("");
    try {
      const { data, error } = await supabase
        .from("qa_private_events")
        .select("*")
        .eq("city", String(city || "").trim())
        .order("start_at", { ascending: true });

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateEventsTableMissing(true);
          setPrivateEvents([]);
          setPrivateEventsError("");
        } else {
          setPrivateEventsError("Could not load VIP invites right now.");
          setPrivateEvents([]);
        }
        return;
      }

      setPrivateEventsTableMissing(false);
      const normalized = Array.isArray(data) ? data : [];
      setPrivateEvents((current) => (
        arePrivateEventsEquivalent(normalized, current) ? current : normalized
      ));
    } catch {
      setPrivateEventsError("Could not load VIP invites right now.");
      setPrivateEvents((current) => (current.length === 0 ? current : []));
    } finally {
      if (!silent) {
        setPrivateEventsLoading(false);
      }
    }
  }, [city]);

  const fetchMyPrivateInvites = useCallback(async (eventRows = []) => {
    if (!isMember || !user?.id) {
      setPrivateEventInvites({});
      return;
    }

    const eventIds = (Array.isArray(eventRows) ? eventRows : [])
      .map((row) => String(row?.id || "").trim())
      .filter(Boolean);

    if (eventIds.length === 0) {
      setPrivateEventInvites({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from("qa_private_event_invites")
        .select("event_id,status")
        .eq("requester_user_id", user.id)
        .in("event_id", eventIds);

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
        }
        setPrivateEventInvites({});
        return;
      }

      setPrivateInvitesTableMissing(false);
      const nextMap = {};
      for (const row of Array.isArray(data) ? data : []) {
        const key = String(row?.event_id || "").trim();
        if (!key) continue;
        nextMap[key] = String(row?.status || "requested");
      }
      setPrivateEventInvites((current) => (
        areStringMapsEqual(nextMap, current) ? current : nextMap
      ));
    } catch {
      setPrivateEventInvites({});
    }
  }, [isMember, user?.id]);

  const fetchPrivateInviteRequests = useCallback(async (eventRows = []) => {
    if (!isMember || !user?.id) {
      setPrivateInviteRequestsByEvent({});
      setPrivateInviteRequesterProfiles({});
      return;
    }

    const hostEventIds = (Array.isArray(eventRows) ? eventRows : [])
      .filter((row) => String(row?.host_user_id || "") === String(user.id))
      .map((row) => String(row?.id || "").trim())
      .filter(Boolean);

    if (hostEventIds.length === 0) {
      setPrivateInviteRequestsByEvent({});
      setPrivateInviteRequesterProfiles({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from("qa_private_event_invites")
        .select("id,event_id,requester_user_id,status,message,created_at")
        .in("event_id", hostEventIds)
        .order("created_at", { ascending: false });

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
        }
        setPrivateInviteRequestsByEvent({});
        setPrivateInviteRequesterProfiles({});
        return;
      }

      const nextMap = {};
      for (const row of Array.isArray(data) ? data : []) {
        const eventId = String(row?.event_id || "").trim();
        if (!eventId) continue;
        if (!nextMap[eventId]) nextMap[eventId] = [];
        nextMap[eventId].push(row);
      }
      setPrivateInviteRequestsByEvent((current) => (
        areRequestMapsEqual(nextMap, current) ? current : nextMap
      ));

      const requesterIds = [...new Set(
        (Array.isArray(data) ? data : [])
          .map((row) => String(row?.requester_user_id || "").trim())
          .filter(Boolean),
      )];

      if (requesterIds.length === 0) {
        setPrivateInviteRequesterProfiles({});
        return;
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("member_profiles")
        .select("user_id,display_name")
        .in("user_id", requesterIds);

      if (profileError) {
        setPrivateInviteRequesterProfiles({});
        return;
      }

      const profileMap = {};
      for (const row of Array.isArray(profileRows) ? profileRows : []) {
        const key = String(row?.user_id || "").trim();
        if (!key) continue;
        profileMap[key] = String(row?.display_name || "").trim();
      }
      setPrivateInviteRequesterProfiles((current) => (
        areStringMapsEqual(profileMap, current) ? current : profileMap
      ));
    } catch {
      setPrivateInviteRequestsByEvent({});
      setPrivateInviteRequesterProfiles({});
    }
  }, [isMember, user?.id]);

  const submitPrivateEvent = useCallback(async (submitEvent) => {
    submitEvent.preventDefault();
    if (!isMember || !user?.id) {
      redirectToJoin();
      return;
    }
    if (privateEventsTableMissing) {
      showToast("Run VIP invites SQL first.", { tone: "warn", duration: 2400 });
      return;
    }

    const title = String(privateEventForm.title || "").trim();
    const approxArea = String(privateEventForm.approxArea || "").trim();
    const exactLocation = String(privateEventForm.exactLocation || "").trim();
    const startDateRaw = String(privateEventForm.startDate || "").trim();
    const startTimeRaw = String(privateEventForm.startTime || "").trim();

    if (!title || !approxArea || !startDateRaw || !startTimeRaw) {
      showToast("Title, start time, and area are required.", { tone: "warn", duration: 2200 });
      return;
    }

    const startAt = combineDateAndTime(startDateRaw, startTimeRaw);
    if (!startAt) {
      showToast("Start time is invalid.", { tone: "warn", duration: 2200 });
      return;
    }

    const expiresAt = new Date(startAt.getTime() + (24 * 60 * 60 * 1000));
    setIsSubmittingPrivateEvent(true);
    try {
      const payload = {
        city: String(city || "").trim(),
        host_user_id: user.id,
        host_alias: String(memberName || user.email || "Member").trim().slice(0, 80),
        title,
        event_type: String(privateEventForm.eventType || PRIVATE_EVENT_TYPES[0].value),
        visibility: "invite_only",
        approx_area: approxArea,
        exact_location: exactLocation || null,
        notes: String(privateEventForm.notes || "").trim() || null,
        start_at: startAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: "active",
      };

      const { error } = await supabase.from("qa_private_events").insert([payload]);
      if (error) {
        if (isMissingTableError(error)) {
          setPrivateEventsTableMissing(true);
          showToast("VIP invites table missing. Run SQL setup first.", {
            tone: "warn",
            duration: 2500,
          });
          return;
        }
        throw error;
      }

      setPrivateEventForm({
        title: "",
        eventType: PRIVATE_EVENT_TYPES[0].value,
        startDate: "",
        startTime: "",
        approxArea: "",
        exactLocation: "",
        notes: "",
      });
      setHostPrivateEventOpen(false);
      await fetchPrivateEvents();
      showActionFeedback(showToast, "privateEventPosted");
    } catch {
      showToast("Could not post private event right now.", { tone: "warn", duration: 2200 });
    } finally {
      setIsSubmittingPrivateEvent(false);
    }
  }, [
    city,
    fetchPrivateEvents,
    isMember,
    memberName,
    privateEventForm.approxArea,
    privateEventForm.exactLocation,
    privateEventForm.eventType,
    privateEventForm.notes,
    privateEventForm.startDate,
    privateEventForm.startTime,
    privateEventForm.title,
    privateEventsTableMissing,
    redirectToJoin,
    showToast,
    user?.email,
    user?.id,
  ]);

  const respondPrivateInviteRequest = useCallback(async (inviteRow, nextStatus) => {
    const inviteId = String(inviteRow?.id || "").trim();
    const status = String(nextStatus || "").trim();
    const allowed = new Set(["accepted", "declined"]);
    if (!inviteId || !allowed.has(status)) return;

    setIsUpdatingPrivateInviteStatus(true);
    try {
      const { error } = await supabase
        .from("qa_private_event_invites")
        .update({ status })
        .eq("id", inviteId);

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
          showToast("Invites are not activated yet.", { tone: "warn", duration: 2200 });
          return;
        }
        throw error;
      }

      await Promise.all([
        fetchPrivateInviteRequests(cityPrivateEvents),
        fetchMyPrivateInvites(cityPrivateEvents),
      ]);
      showActionFeedback(showToast, status === "accepted" ? "inviteAccepted" : "inviteDeclined");
    } catch {
      showToast("Could not update invite right now.", { tone: "warn", duration: 2200 });
    } finally {
      setIsUpdatingPrivateInviteStatus(false);
    }
  }, [cityPrivateEvents, fetchMyPrivateInvites, fetchPrivateInviteRequests, showToast]);

  const deletePrivateEvent = useCallback(async (eventRow) => {
    const eventId = String(eventRow?.id || "").trim();
    if (!eventId || !user?.id) return;
    if (String(eventRow?.host_user_id || "") !== String(user.id)) return;

    const confirmed = typeof window === "undefined"
      ? true
      : window.confirm("Delete this VIP event? This also removes all invite requests for it.");
    if (!confirmed) return;

    setDeletingPrivateEventId(eventId);
    try {
      const { error: invitesError } = await supabase
        .from("qa_private_event_invites")
        .delete()
        .eq("event_id", eventId);

      if (invitesError && !isMissingTableError(invitesError)) {
        throw invitesError;
      }

      const { error: eventDeleteError } = await supabase
        .from("qa_private_events")
        .delete()
        .eq("id", eventId)
        .eq("host_user_id", user.id);

      if (eventDeleteError) throw eventDeleteError;

      const { data: stillThereRows, error: verifyError } = await supabase
        .from("qa_private_events")
        .select("id")
        .eq("id", eventId)
        .limit(1);

      if (verifyError) throw verifyError;
      const removed = !Array.isArray(stillThereRows) || stillThereRows.length === 0;

      if (!removed) {
        showToast("Delete blocked by database policy. Run VIP delete RLS fix SQL, then retry.", {
          tone: "warn",
          duration: 4200,
        });
        return;
      }

      setPrivateEvents((current) => current.filter((row) => String(row?.id || "") !== eventId));
      setPrivateEventInvites((current) => {
        if (!current || typeof current !== "object") return {};
        const next = { ...current };
        delete next[eventId];
        return next;
      });
      setPrivateInviteRequestsByEvent((current) => {
        if (!current || typeof current !== "object") return {};
        const next = { ...current };
        delete next[eventId];
        return next;
      });

      if (String(expandedPrivateHostEventId) === eventId) {
        setExpandedPrivateHostEventId("");
      }

      await Promise.all([
        fetchPrivateEvents({ silent: true }),
        fetchMyPrivateInvites(cityPrivateEvents),
        fetchPrivateInviteRequests(cityPrivateEvents),
      ]);

      showToast("VIP event deleted.", { tone: "ok", duration: 1800 });
    } catch (error) {
      showToast(
        error?.message
          ? `Could not delete VIP event: ${error.message}`
          : "Could not delete VIP event right now.",
        { tone: "warn", duration: 3200 },
      );
    } finally {
      setDeletingPrivateEventId("");
    }
  }, [
    cityPrivateEvents,
    expandedPrivateHostEventId,
    fetchMyPrivateInvites,
    fetchPrivateEvents,
    fetchPrivateInviteRequests,
    showToast,
    user?.id,
  ]);

  const requestPrivateInvite = useCallback(async (eventRow) => {
    if (!isMember || !user?.id) {
      redirectToJoin();
      return;
    }
    if (!eventRow?.id || privateInvitesTableMissing) {
      showToast("Invites are not activated yet.", { tone: "warn", duration: 2200 });
      return;
    }
    if (String(eventRow.host_user_id || "") === String(user.id)) {
      showToast("You are hosting this event.", { tone: "info", duration: 1800 });
      return;
    }

    setIsSubmittingPrivateInvite(true);
    try {
      const { error } = await supabase.from("qa_private_event_invites").insert([
        {
          event_id: eventRow.id,
          requester_user_id: user.id,
          status: "requested",
        },
      ]);

      if (error) {
        if (String(error.code || "") === "23505") {
          showActionFeedback(showToast, "inviteAlreadyRequested");
        } else if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
          showToast("Invites are not activated yet.", { tone: "warn", duration: 2200 });
        } else {
          throw error;
        }
      } else {
        showActionFeedback(showToast, "inviteRequested");
      }

      await fetchMyPrivateInvites(cityPrivateEvents);
    } catch {
      showToast("Could not send invite request.", { tone: "warn", duration: 2200 });
    } finally {
      setIsSubmittingPrivateInvite(false);
    }
  }, [
    cityPrivateEvents,
    fetchMyPrivateInvites,
    isMember,
    privateInvitesTableMissing,
    redirectToJoin,
    showToast,
    user?.id,
  ]);

  const refreshVipFeed = useCallback(async ({ silent = true } = {}) => {
    await fetchPrivateEvents({ silent });
    await Promise.all([
      fetchMyPrivateInvites(cityPrivateEvents),
      fetchPrivateInviteRequests(cityPrivateEvents),
    ]);
  }, [cityPrivateEvents, fetchMyPrivateInvites, fetchPrivateEvents, fetchPrivateInviteRequests]);

  const geocodeAddress = useCallback(async (value) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      throw new Error("Map token is missing.");
    }

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(`${value} ${city}`)}.json?access_token=${token}&limit=1`
    );
    if (!res.ok) {
      throw new Error("Could not reach geocoding service.");
    }

    const data = await res.json();

    if (!data.features?.length) {
      return null;
    }

    const [lng, lat] = data.features[0].center;
    return { lat, lng };
  }, [city]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchEvents();
    });
  }, [fetchEvents]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchServices();
    });
  }, [fetchServices]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPrivateEvents();
    });
  }, [fetchPrivateEvents]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchMyPrivateInvites(cityPrivateEvents);
    });
  }, [cityPrivateEvents, fetchMyPrivateInvites]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPrivateInviteRequests(cityPrivateEvents);
    });
  }, [cityPrivateEvents, fetchPrivateInviteRequests]);

  useEffect(() => {
    queueMicrotask(() => {
      setPrivateFeedNowTick(Date.now());
    });
    const id = setInterval(() => {
      setPrivateFeedNowTick(Date.now());
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isMember) return undefined;
    if (vipRealtimeHealthy) return undefined;

    const id = setInterval(() => {
      refreshVipFeed({ silent: true });
    }, 45000);

    return () => clearInterval(id);
  }, [isMember, refreshVipFeed, vipRealtimeHealthy]);

  useEffect(() => {
    if (!isMember) return undefined;

    const channel = supabase
      .channel(`qa-city-vip-${String(city || "").trim()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "qa_private_events",
          filter: `city=eq.${String(city || "").trim()}`,
        },
        () => {
          refreshVipFeed({ silent: true });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "qa_private_event_invites",
        },
        () => {
          refreshVipFeed({ silent: true });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setVipRealtimeHealthy(true);
          refreshVipFeed({ silent: true });
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setVipRealtimeHealthy(false);
        }
      });

    return () => {
      setVipRealtimeHealthy(false);
      supabase.removeChannel(channel);
    };
  }, [city, isMember, refreshVipFeed]);

  useEffect(() => {
    const channel = supabase
      .channel(`qa-city-services-${String(city || "").trim()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "services",
          filter: `city=eq.${String(city || "").trim()}`,
        },
        () => {
          fetchServices();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [city, fetchServices]);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem("qa_favorites");
      if (stored) {
        setFavorites((readLocalJson("qa_favorites", []) || []).map((item) => String(item)));
      }
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      if (contributeMode === "place") {
        setAddMode(true);
        setAddEventMode(false);
        setAddServiceMode(false);
      } else if (contributeMode === "event") {
        setAddEventMode(true);
        setAddMode(false);
        setAddServiceMode(false);
      } else if (contributeMode === "service") {
        setAddServiceMode(true);
        setAddMode(false);
        setAddEventMode(false);
      }
    });
  }, [contributeMode]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    let isCancelled = false;

    (async () => {
      try {
        const mapboxgl = await loadMapboxGl();
        if (isCancelled) return;
        mapboxGlRef.current = mapboxgl;

        const readiness = evaluateMapInitReadiness({
          mapboxgl,
          isMapboxStylesReady,
          mapboxToken: token,
          container: mapContainerRef.current,
          mapInstance: mapRef.current,
          requireWebGl: true,
        });
        if (!readiness.ready) {
          if (shouldTriggerMapFallback(readiness.reason)) {
            queueMicrotask(() => {
              setMapError("Map is unavailable right now. You can still browse venues and events below.");
            });
          }
          return;
        }

        queueMicrotask(() => {
          setMapError("");
        });

        mapboxgl.accessToken = token;
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: config.center,
          zoom: config.zoom ?? 11,
        });
        hoverPopupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          closeOnMove: false,
          anchor: "top",
          offset: 22,
          className: styles.mapHoverPopup,
        });

        mapRef.current.on("error", handleMapError);
        mapRef.current.on("dragstart", beginInteraction);
        mapRef.current.on("dragend", endInteraction);
        mapRef.current.on("zoomstart", beginInteraction);
        mapRef.current.on("zoomend", endInteraction);
        mapRef.current.on("rotatestart", beginInteraction);
        mapRef.current.on("rotateend", endInteraction);
        mapRef.current.on("pitchstart", beginInteraction);
        mapRef.current.on("pitchend", endInteraction);
        mapRef.current.on("load", handleMapLoad);
      } catch {
        if (!isCancelled) {
          queueMicrotask(() => {
            setMapError("Map failed to initialize. You can still browse venues and events below.");
          });
        }
        return;
      }
    })();

    const handleMapError = () => {
      queueMicrotask(() => {
        setMapError("Map had trouble loading. Venue and event lists are still fully available.");
      });
    };

    const beginInteraction = () => {
      isMapInteractingRef.current = true;
      setIsMapInteracting(true);
      hoverPopupRef.current?.remove();
    };
    const endInteraction = () => {
      isMapInteractingRef.current = false;
      setIsMapInteracting(false);
    };
    const handleMapLoad = () => {
      const map = mapRef.current;
      if (!map) return;

      // Force a stable camera/fog state to avoid fog opacity runtime crashes in Mapbox internals.
      try {
        map.setProjection("mercator");
      } catch {
        // Projection override is optional across style/runtime combinations.
      }
      try {
        map.setFog(null);
      } catch {
        // Fog may be absent depending on style/runtime.
      }
    };

    const handleResize = () => mapRef.current?.resize();
    window.addEventListener("resize", handleResize);

    queueMicrotask(() => {
      mapRef.current?.resize();
    });

    return () => {
      isCancelled = true;
      mapRef.current?.off("error", handleMapError);
      mapRef.current?.off("dragstart", beginInteraction);
      mapRef.current?.off("dragend", endInteraction);
      mapRef.current?.off("zoomstart", beginInteraction);
      mapRef.current?.off("zoomend", endInteraction);
      mapRef.current?.off("rotatestart", beginInteraction);
      mapRef.current?.off("rotateend", endInteraction);
      mapRef.current?.off("pitchstart", beginInteraction);
      mapRef.current?.off("pitchend", endInteraction);
      mapRef.current?.off("load", handleMapLoad);
      window.removeEventListener("resize", handleResize);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      hoverPopupRef.current?.remove();
      hoverPopupRef.current = null;
    };
  }, [config.center, config.zoom, isMapboxStylesReady]);

  useEffect(() => {
    const mapboxgl = mapboxGlRef.current;
    if (!mapRef.current || !mapboxgl) return;
    const useNeonMarkers = true;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    placeMarkersRef.current = new Map();
    eventMarkersRef.current = new Map();
    serviceMarkersRef.current = new Map();

    const showHoverPopup = (name, lng, lat) => {
      if (!hoverPopupRef.current || isMapInteractingRef.current) return;
      const popupNode = document.createElement("div");
      popupNode.className = "text-xs font-semibold tracking-[0.02em] text-white";
      popupNode.textContent = name;
      hoverPopupRef.current
        .setLngLat([lng, lat])
        .setDOMContent(popupNode)
        .addTo(mapRef.current);
      const popupEl = hoverPopupRef.current.getElement();
      if (popupEl) {
        popupEl.style.zIndex = "9999";
        popupEl.style.pointerEvents = "none";
      }
    };

    const hideHoverPopup = () => {
      hoverPopupRef.current?.remove();
    };

    const createNeonPinElement = (baseColor = "#9ca3af") => {
      const wrapper = document.createElement("div");
      wrapper.dataset.neonColor = baseColor;
      wrapper.style.width = "22px";
      wrapper.style.height = "30px";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "flex-start";
      wrapper.style.justifyContent = "center";
      wrapper.style.filter = "saturate(1.9) brightness(1.16)";
      wrapper.style.transform = "translateY(-3px)";

      const pin = document.createElement("div");
      pin.className = "qa-neon-pin";
      pin.style.width = "20px";
      pin.style.height = "20px";
      pin.style.transform = "rotate(-45deg)";
      pin.style.borderRadius = "999px 999px 999px 2px";
      pin.style.background = `radial-gradient(circle at 22% 16%,rgba(255,255,255,0.82),${baseColor} 34%)`;
      pin.style.border = "1.6px solid rgba(255,255,255,0.92)";
      pin.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.16), 0 0 8px ${baseColor}, 0 0 16px ${baseColor}`;

      const core = document.createElement("div");
      core.style.width = "6px";
      core.style.height = "6px";
      core.style.borderRadius = "999px";
      core.style.background = "rgba(10,10,15,0.82)";
      core.style.border = "1px solid rgba(255,255,255,0.7)";
      core.style.position = "absolute";
      core.style.left = "50%";
      core.style.top = "50%";
      core.style.transform = "translate(-50%, -50%) rotate(45deg)";

      pin.style.position = "relative";
      pin.appendChild(core);
      wrapper.appendChild(pin);
      return wrapper;
    };
    const EVENT_MARKER_COLOR = "#ff4ec4";

    cityPlaces.forEach((place) => {
      if (place.lat == null || place.lng == null) return;

      const typeConfig = TYPES.find((item) => item.value === place.type);
      const neonColor = useNeonMarkers
        ? typeConfig?.color || "#36e5ff"
        : typeConfig?.color || "#9ca3af";
      const marker = useNeonMarkers
        ? new mapboxgl.Marker(createNeonPinElement(neonColor))
        : new mapboxgl.Marker({ color: neonColor });
      marker
        .setLngLat([place.lng, place.lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        openPlace(place, { origin: "map" });
      });
      marker.getElement().addEventListener("mouseenter", () => {
        if (isMapInteractingRef.current) return;
        setHoveredPlaceId(String(place.id));
        showHoverPopup(place.name || "Venue", place.lng, place.lat);
      });
      marker.getElement().addEventListener("mouseleave", () => {
        setHoveredPlaceId(null);
        hideHoverPopup();
      });

      markersRef.current.push(marker);
      placeMarkersRef.current.set(String(place.id), marker);
    });

    cityEvents.forEach((event) => {
      if (event.lat == null || event.lng == null) return;
      const eventNeonColor = useNeonMarkers
        ? EVENT_MARKER_COLOR
        : "#8b5cf6";

      const element = useNeonMarkers
        ? createNeonPinElement(eventNeonColor)
        : document.createElement("div");
      if (!useNeonMarkers) {
        element.style.width = "16px";
        element.style.height = "16px";
        element.style.background = "#8b5cf6";
        element.style.borderRadius = "4px";
        element.style.border = "2px solid white";
      }

      const marker = new mapboxgl.Marker(element)
        .setLngLat([event.lng, event.lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        openEvent(event, { origin: "map" });
      });
      marker.getElement().addEventListener("mouseenter", () => {
        if (isMapInteractingRef.current) return;
        setHoveredEventId(String(event.id));
        showHoverPopup(event.name || "Event", event.lng, event.lat);
      });
      marker.getElement().addEventListener("mouseleave", () => {
        setHoveredEventId(null);
        hideHoverPopup();
      });

      markersRef.current.push(marker);
      eventMarkersRef.current.set(String(event.id), marker);
    });

    cityServices.forEach((service) => {
      const lat = Number(service?.lat);
      const lng = Number(service?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const typeConfig = SERVICE_TYPES.find((item) => item.value === service.type);
      const serviceNeonColor = useNeonMarkers
        ? typeConfig?.color || "#2ef2c8"
        : typeConfig?.color || "#10b981";

      const element = useNeonMarkers
        ? createNeonPinElement(serviceNeonColor)
        : document.createElement("div");
      if (!useNeonMarkers) {
        element.style.width = "14px";
        element.style.height = "14px";
        element.style.background = typeConfig?.color || "#10b981";
        element.style.borderRadius = "999px";
        element.style.border = "2px solid rgba(255,255,255,0.95)";
      }

      const marker = new mapboxgl.Marker(element)
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        openService(service, { origin: "map" });
      });
      marker.getElement().addEventListener("mouseenter", () => {
        if (isMapInteractingRef.current) return;
        setHoveredServiceId(String(service.id));
        showHoverPopup(service.name || "Service", lng, lat);
      });
      marker.getElement().addEventListener("mouseleave", () => {
        setHoveredServiceId(null);
        hideHoverPopup();
      });

      markersRef.current.push(marker);
      serviceMarkersRef.current.set(String(service.id), marker);
    });
  }, [city, cityEvents, cityPlaces, cityServices, openEvent, openPlace, openService]);

  useEffect(() => {
    const useNeonMarkers = true;
    placeMarkersRef.current.forEach((marker, id) => {
      const hovered = !isMapInteracting && hoveredPlaceId && String(id) === String(hoveredPlaceId);
      const selected = selectedPlace && String(id) === String(selectedPlace.id);
      const active = Boolean(hovered || selected);
      const el = marker.getElement();
      const neonPin = el.querySelector(".qa-neon-pin");
      el.style.transition = "box-shadow 160ms ease, filter 160ms ease";
      if (useNeonMarkers) {
        const markerColor = el.dataset.neonColor || "#9ca3af";
        el.style.boxShadow = "none";
        if (neonPin) {
          neonPin.style.boxShadow = active
            ? `0 0 0 2px rgba(255,255,255,0.22), 0 0 18px ${markerColor}, 0 0 36px ${markerColor}`
            : `0 0 0 1px rgba(255,255,255,0.14), 0 0 12px ${markerColor}, 0 0 24px ${markerColor}`;
        }
      } else {
        el.style.boxShadow = active ? "0 0 0 4px rgba(255,255,255,0.22), 0 0 22px rgba(255,255,255,0.35)" : "none";
      }
      el.style.filter = active ? "saturate(1.2)" : "saturate(1)";
      el.style.zIndex = active ? "30" : "10";
    });

    eventMarkersRef.current.forEach((marker, id) => {
      const hovered = !isMapInteracting && hoveredEventId && String(id) === String(hoveredEventId);
      const selected = selectedEvent && String(id) === String(selectedEvent.id);
      const active = Boolean(hovered || selected);
      const el = marker.getElement();
      const neonPin = el.querySelector(".qa-neon-pin");
      el.style.transition = "box-shadow 160ms ease, filter 160ms ease";
      if (useNeonMarkers) {
        const markerColor = el.dataset.neonColor || "#8b5cf6";
        el.style.boxShadow = "none";
        if (neonPin) {
          neonPin.style.boxShadow = active
            ? `0 0 0 2px rgba(255,255,255,0.22), 0 0 18px ${markerColor}, 0 0 36px ${markerColor}`
            : `0 0 0 1px rgba(255,255,255,0.14), 0 0 12px ${markerColor}, 0 0 24px ${markerColor}`;
        }
      } else {
        el.style.boxShadow = active ? "0 0 0 4px rgba(139,92,246,0.24), 0 0 22px rgba(139,92,246,0.45)" : "none";
      }
      el.style.filter = active ? "brightness(1.15)" : "brightness(1)";
      el.style.zIndex = active ? "32" : "12";
    });
    serviceMarkersRef.current.forEach((marker, id) => {
      const hovered = !isMapInteracting && hoveredServiceId && String(id) === String(hoveredServiceId);
      const selected = selectedService && String(id) === String(selectedService.id);
      const active = Boolean(hovered || selected);
      const el = marker.getElement();
      const neonPin = el.querySelector(".qa-neon-pin");
      el.style.transition = "box-shadow 160ms ease, filter 160ms ease";
      if (useNeonMarkers) {
        const markerColor = el.dataset.neonColor || "#10b981";
        el.style.boxShadow = "none";
        if (neonPin) {
          neonPin.style.boxShadow = active
            ? `0 0 0 2px rgba(255,255,255,0.22), 0 0 18px ${markerColor}, 0 0 36px ${markerColor}`
            : `0 0 0 1px rgba(255,255,255,0.14), 0 0 12px ${markerColor}, 0 0 24px ${markerColor}`;
        }
      } else {
        el.style.boxShadow = active ? "0 0 0 4px rgba(16,185,129,0.24), 0 0 22px rgba(16,185,129,0.42)" : "none";
      }
      el.style.filter = active ? "brightness(1.15)" : "brightness(1)";
      el.style.zIndex = active ? "34" : "14";
    });
  }, [
    city,
    hoveredEventId,
    hoveredPlaceId,
    hoveredServiceId,
    isMapInteracting,
    selectedEvent,
    selectedPlace,
    selectedService,
  ]);

  useEffect(() => {
    if (!selectedPlace) {
      queueMicrotask(() => {
        setReviews([]);
      });
      return;
    }

    getReviews(selectedPlace.id, selectedPlace).then((data) => {
      setReviews(data);
    });
  }, [getReviews, selectedPlace]);

  useEffect(() => {
    let active = true;

    queueMicrotask(async () => {
      const resolvePlaceDbIdInline = async (place) => {
        const placeId = String(place?.id || "");
        const placeName = String(place?.name || "").trim();
        const placeCity = String(place?.city || city).trim();
        const normalizeCity = (value) =>
          String(value || "")
            .toLowerCase()
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\s+/g, " ")
            .trim();

        if (placeId && !placeId.startsWith("seed-place-")) {
          return placeId;
        }

        if (!placeName || !placeCity) return null;

        const lookup = await supabase
          .from("places")
          .select("id, city, name")
          .ilike("name", placeName)
          .limit(20);

        const rows = Array.isArray(lookup?.data) ? lookup.data : [];
        const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(placeCity));

        return matched?.id ? String(matched.id) : null;
      };

      if (!selectedPlace) {
        if (!active) return;
        setSelectedPlaceDbId("");
        setLiveVibeRows([]);
        setLiveVibeError("");
        setLiveVibeTableMissing(false);
        setIsLoadingLiveVibe(false);
        return;
      }

      if (active) {
        setIsLoadingLiveVibe(true);
        setLiveVibeError("");
      }

      const dbId = await resolvePlaceDbIdInline(selectedPlace);
      if (!active) return;

      if (!dbId) {
        setSelectedPlaceDbId("");
        setLiveVibeRows([]);
        setLiveVibeError("");
        setLiveVibeTableMissing(false);
        setIsLoadingLiveVibe(false);
        return;
      }

      setSelectedPlaceDbId(String(dbId));
      const lookbackIso = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("qa_place_vibe_signals")
        .select("id, place_id, user_id, signal_key, created_at")
        .eq("place_id", dbId)
        .gte("created_at", lookbackIso)
        .order("created_at", { ascending: false })
        .limit(400);

      if (!active) return;

      if (error) {
        if (isMissingTableError(error)) {
          setLiveVibeTableMissing(true);
          setLiveVibeRows([]);
          setLiveVibeError("");
        } else {
          setLiveVibeError("Live vibe could not load right now.");
        }
        setIsLoadingLiveVibe(false);
        return;
      }

      setLiveVibeTableMissing(false);
      setLiveVibeRows(Array.isArray(data) ? data : []);
      setLiveVibeError("");
      setIsLoadingLiveVibe(false);
    });

    return () => {
      active = false;
    };
  }, [city, selectedPlace]);

  useEffect(() => {
    if (!selectedPlaceDbId || liveVibeTableMissing) return undefined;

    const applyRealtimeLiveVibeRow = (incomingRow, { remove = false } = {}) => {
      const row = incomingRow || {};
      const changedPlaceId = String(row?.place_id || "");
      if (!changedPlaceId || changedPlaceId !== String(selectedPlaceDbId)) return;

      setLiveVibeRows((current) => {
        const safe = Array.isArray(current) ? current : [];
        const rowId = String(row?.id || "");
        const rowUserId = String(row?.user_id || "");
        let next = safe.filter((item) => {
          const sameId = rowId && String(item?.id || "") === rowId;
          const sameUser = rowUserId && String(item?.user_id || "") === rowUserId;
          return !sameId && !sameUser;
        });

        if (!remove) {
          next = [row, ...next];
        }

        const cutoffMs = Date.now() - (6 * 60 * 60 * 1000);
        next = next
          .filter((item) => {
            const ms = new Date(item?.created_at || "").getTime();
            return Number.isFinite(ms) && ms >= cutoffMs;
          })
          .sort((a, b) => new Date(b?.created_at || "").getTime() - new Date(a?.created_at || "").getTime());

        return next.slice(0, 400);
      });
    };

    const channel = supabase
      .channel(`qa-place-vibe-${selectedPlaceDbId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "qa_place_vibe_signals",
          filter: `place_id=eq.${selectedPlaceDbId}`,
        },
        (payload) => {
          applyRealtimeLiveVibeRow(payload?.new, { remove: false });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "qa_place_vibe_signals",
          filter: `place_id=eq.${selectedPlaceDbId}`,
        },
        (payload) => {
          applyRealtimeLiveVibeRow(payload?.new, { remove: false });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "qa_place_vibe_signals",
          filter: `place_id=eq.${selectedPlaceDbId}`,
        },
        (payload) => {
          applyRealtimeLiveVibeRow(payload?.old, { remove: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveVibeTableMissing, selectedPlaceDbId]);

  useEffect(() => {
    const target = selectedPlace || selectedEvent || selectedService;
    const targetLat = Number(target?.lat);
    const targetLng = Number(target?.lng);

    if (!target || !mapRef.current || !Number.isFinite(targetLat) || !Number.isFinite(targetLng)) {
      lastSelectionKeyRef.current = "";
      if (!selectedPlace && !selectedEvent && !selectedService && keepMapViewOnNextCloseRef.current) {
        keepMapViewOnNextCloseRef.current = false;
      }
      return;
    }

    const targetKey = [
      selectedPlace ? `place:${selectedPlace.id}` : "",
      selectedEvent ? `event:${selectedEvent.id}` : "",
      selectedService ? `service:${selectedService.id}` : "",
    ]
      .filter(Boolean)
      .join("|");

    if (targetKey && targetKey === lastSelectionKeyRef.current) {
      return;
    }
    lastSelectionKeyRef.current = targetKey;

    const shouldScrollToMap =
      selectionOriginRef.current === "map" || selectionOriginRef.current === "map-cta";

    mapRef.current.flyTo({
      center: [targetLng, targetLat],
      zoom: 16.4,
      duration: shouldScrollToMap ? 760 : 520,
    });

    if (shouldScrollToMap) {
      mapWrapperRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    selectionOriginRef.current = "synced";
  }, [selectedEvent, selectedPlace, selectedService]);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth < 1280) return;
    if (!selectedEvent && !selectedPlace) return;
    const scrollContainer = centerColumnScrollRef.current || mainScrollRef.current;
    if (!scrollContainer) return;
    requestAnimationFrame(() => {
      scrollContainer.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [selectedEvent, selectedPlace]);

  const handleAddPlace = async () => {
    if (!name.trim() || !address.trim() || !description.trim() || !placeHours.trim()) {
      showToast("Fill in name, address, description, and opening hours before saving place.", { tone: "warn", duration: 2400 });
      return;
    }

    try {
      const coords = await geocodeAddress(address);

      if (!coords) {
        showToast("Address not found. Try a more specific address.", { tone: "warn", duration: 2400 });
        return;
      }

      const placePayload = {
        name: name.trim(),
        type,
        description: description.trim(),
        vibe: vibe.trim(),
        vibe_tags: normalizeVibeTags(vibeTags, { max: 3 }),
        hours: placeHours.trim(),
        link: placeLink.trim() || null,
        location: address.trim(),
        address: address.trim(),
        lat: coords.lat,
        lng: coords.lng,
        city,
      };

      if (!canPublishDirect) {
        const submissionRes = await createContentSubmission({
          entityType: "place",
          actionType: "create",
          city,
          title: name.trim(),
          payload: placePayload,
          user: {
            id: user?.id,
            email: user?.email,
            memberName,
          },
          isTrustedContributor: false,
        });

        if (submissionRes.tableMissing) {
          showToast("Moderation queue is not configured yet. Run supabase/content-submissions-v1.sql.", {
            tone: "warn",
            duration: 3200,
          });
          return;
        }

        if (submissionRes.error) {
          showToast(submissionRes.error.message || "Could not submit venue for review right now.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        resetPlaceForm();
        setAddMode(false);
        showToast("Venue submitted. Waiting for admin approval.", { tone: "info", duration: 2600 });
        return;
      }

      const createdPlace = await addPlace({
        ...placePayload,
      });

      if (createdPlace?.id) {
        upsertQuality({
          targetType: "place",
          targetId: createdPlace.id,
          source: "Community submission",
          lastChecked: new Date().toISOString().slice(0, 10),
          verified: false,
        });
      }
      if (!createdPlace?.id) {
        showToast("Could not save place right now.", { tone: "warn", duration: 2600 });
        return;
      }

      resetPlaceForm();
      setAddMode(false);
      trackKpiEvent("place_added", {
        city,
        targetType: "place",
        targetId: String(createdPlace.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Place added to city atlas.", { tone: "ok", duration: 2200 });
    } catch (error) {
      showToast(error?.message || "Could not save place right now.", { tone: "warn", duration: 2600 });
    }
  };

  const handleAddEvent = async () => {
    const startDate = normalizeIsoDate(eventStartDate);
    const endDateInput = normalizeIsoDate(eventEndDate);
    const endDate = endDateInput && endDateInput >= startDate ? endDateInput : startDate;
    if (!eventName.trim() || !eventAddress.trim() || !startDate) {
      showToast("Fill in event name, address, and start date before saving.", { tone: "warn", duration: 2400 });
      return;
    }
    if (endDateInput && endDateInput < startDate) {
      showToast("End date must be same day or after start date.", { tone: "warn", duration: 2400 });
      return;
    }

    try {
      const coords = await geocodeAddress(eventAddress);

      if (!coords) {
        showToast("Address not found. Try a more specific address.", { tone: "warn", duration: 2400 });
        return;
      }

      const insertBasePayload = {
        name: eventName,
        city,
        lat: coords.lat,
        lng: coords.lng,
        date: startDate,
        start_date: startDate,
        end_date: endDate || startDate,
        location: eventAddress,
        ...buildVibeDualWriteFields({
          vibe: eventVibe,
          vibeTags: normalizeVibeTags(eventVibeTags, { max: 3 }),
        }),
        description: eventDescription,
        link: eventLink,
        ticket_url: eventTicketUrl.trim() || null,
      };

      if (!canPublishDirect) {
        const submissionRes = await createContentSubmission({
          entityType: "event",
          actionType: "create",
          city,
          title: eventName.trim(),
          payload: insertBasePayload,
          user: {
            id: user?.id,
            email: user?.email,
            memberName,
          },
          isTrustedContributor: false,
        });

        if (submissionRes.tableMissing) {
          showToast("Moderation queue is not configured yet. Run supabase/content-submissions-v1.sql.", {
            tone: "warn",
            duration: 3200,
          });
          return;
        }

        if (submissionRes.error) {
          showToast(submissionRes.error.message || "Could not submit event for review right now.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        resetEventForm();
        setAddEventMode(false);
        showToast("Event submitted. Waiting for admin approval.", { tone: "info", duration: 2600 });
        return;
      }

      let insertResult = await supabase.from("events").insert([insertBasePayload]).select("*").single();

      if (insertResult.error) {
        const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
        const missingDateRange =
          (errorText.includes("start_date") || errorText.includes("end_date")) &&
          (errorText.includes("column") || errorText.includes("schema cache"));
        const missingVibe =
          /\bvibe\b/.test(errorText) && (errorText.includes("column") || errorText.includes("schema cache"));
        const missingVibeTags = isMissingVibeTagsColumnError(insertResult.error);
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));
        const missingTicketUrl =
          errorText.includes("ticket_url") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingDateRange || missingVibe || missingVibeTags || missingLocation || missingTicketUrl) {
          const legacyPayload = {
            name: eventName,
            city,
            lat: coords.lat,
            lng: coords.lng,
            date: startDate,
            description: eventDescription,
            link: eventLink,
          };
          if (!missingTicketUrl) {
            legacyPayload.ticket_url = eventTicketUrl.trim() || null;
          }
          if (!missingVibe) {
            legacyPayload.vibe = eventVibe.trim() || null;
          }
          if (!missingVibeTags) {
            legacyPayload.vibe_tags = buildVibeDualWriteFields({
              vibe: eventVibe,
              vibeTags: normalizeVibeTags(eventVibeTags, { max: 3 }),
            }).vibe_tags;
          }
          insertResult = await supabase.from("events").insert([legacyPayload]).select("*").single();
        }
      }

      const { data: createdEvent, error } = insertResult;

      if (error) {
        captureOperationalError("save_event_fail", error, {
          city: String(city || ""),
          flow: "city_add_event",
          hasDate: Boolean(startDate),
        });
        showToast("Could not save event right now.", { tone: "warn", duration: 2600 });
        return;
      }

      if (createdEvent?.id) {
        upsertQuality({
          targetType: "event",
          targetId: createdEvent.id,
          source: "Community submission",
          lastChecked: new Date().toISOString().slice(0, 10),
          verified: false,
        });
      }

      await fetchEvents();
      resetEventForm();
      setAddEventMode(false);
      trackKpiEvent("event_added", {
        city,
        targetType: "event",
        targetId: String(createdEvent?.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Event added to city atlas.", { tone: "ok", duration: 2200 });
    } catch (error) {
      captureOperationalError("save_event_fail", error, {
        city: String(city || ""),
        flow: "city_add_event_catch",
        hasDate: Boolean(startDate),
      });
      showToast(error?.message || "Could not save event right now.", { tone: "warn", duration: 2600 });
    }
  };

  const handleAddService = useCallback(async () => {
    if (!serviceName.trim() || !serviceAddress.trim() || !serviceDescription.trim()) {
      showToast("Fill in service name, address, and description before saving.", { tone: "warn", duration: 2400 });
      return;
    }

    try {
      const coords = await geocodeAddress(serviceAddress);

      if (!coords) {
        showToast("Address not found. Try a more specific address.", { tone: "warn", duration: 2400 });
        return;
      }

      const normalizedImageUrls = normalizeServiceImageUrls(
        String(serviceImageUrlsInput || "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      );

      const basePayload = {
        name: serviceName.trim(),
        city,
        type: serviceType || "other",
        provider_name: serviceProviderName.trim() || null,
        contact: serviceContact.trim() || null,
        booking_link: serviceBookingLink.trim() || null,
        description: serviceDescription.trim(),
        hours: serviceHours.trim() || null,
        link: serviceLink.trim() || null,
        image_urls: normalizedImageUrls,
        price_tier: servicePriceTier || null,
        location: serviceAddress.trim(),
        lat: coords.lat,
        lng: coords.lng,
        created_by: user?.id || null,
        ...buildVibeDualWriteFields({
          vibe: serviceVibe,
          vibeTags: normalizeVibeTags(serviceVibeTags, { max: 3 }),
        }),
      };

      if (!canPublishDirect) {
        const submissionRes = await createContentSubmission({
          entityType: "service",
          actionType: "create",
          city,
          title: serviceName.trim(),
          payload: basePayload,
          user: {
            id: user?.id,
            email: user?.email,
            memberName,
          },
          isTrustedContributor: false,
        });

        if (submissionRes.tableMissing) {
          showToast("Moderation queue is not configured yet. Run supabase/content-submissions-v1.sql.", {
            tone: "warn",
            duration: 3200,
          });
          return;
        }

        if (submissionRes.error) {
          showToast(submissionRes.error.message || "Could not submit service for review right now.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        resetServiceForm();
        setAddServiceMode(false);
        showToast("Service submitted. Waiting for admin approval.", { tone: "info", duration: 2600 });
        return;
      }

      let insertResult = await supabase
        .from("services")
        .insert([basePayload])
        .select("*")
        .single();

      if (insertResult.error) {
        const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
        const missingVibeTags = isMissingVibeTagsColumnError(insertResult.error);
        const missingVibe = /\bvibe\b/.test(errorText) && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingVibeTags || missingVibe) {
          const legacyPayload = {
            name: serviceName.trim(),
            city,
            type: serviceType || "other",
            provider_name: serviceProviderName.trim() || null,
            contact: serviceContact.trim() || null,
            booking_link: serviceBookingLink.trim() || null,
            description: serviceDescription.trim(),
            hours: serviceHours.trim() || null,
            link: serviceLink.trim() || null,
            image_urls: normalizedImageUrls,
            price_tier: servicePriceTier || null,
            location: serviceAddress.trim(),
            lat: coords.lat,
            lng: coords.lng,
            created_by: user?.id || null,
          };

          if (!missingVibe) {
            legacyPayload.vibe = serviceVibe.trim() || null;
          }
          if (!missingVibeTags) {
            legacyPayload.vibe_tags = normalizeVibeTags(serviceVibeTags, { max: 3 });
          }

          insertResult = await supabase
            .from("services")
            .insert([legacyPayload])
            .select("*")
            .single();
        }
      }

      const { data: createdService, error } = insertResult;

      if (error || !createdService?.id) {
        captureOperationalError("save_service_fail", error || new Error("Service insert returned no id."), {
          city: String(city || ""),
          flow: "city_add_service",
        });
        showToast(error?.message || "Could not save service right now.", { tone: "warn", duration: 2600 });
        return;
      }

      upsertQuality({
        targetType: "service",
        targetId: createdService.id,
        source: "Community submission",
        lastChecked: new Date().toISOString().slice(0, 10),
        verified: false,
      });

      await fetchServices();

      resetServiceForm();
      setAddServiceMode(false);

      trackKpiEvent("service_added", {
        city,
        targetType: "service",
        targetId: String(createdService?.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Service added to city atlas.", { tone: "ok", duration: 2200 });
    } catch (error) {
      captureOperationalError("save_service_fail", error, {
        city: String(city || ""),
        flow: "city_add_service_catch",
      });
      showToast(error?.message || "Could not save service right now.", { tone: "warn", duration: 2600 });
    }
  }, [canPublishDirect, city, fetchServices, geocodeAddress, memberName, resetServiceForm, serviceAddress, serviceBookingLink, serviceContact, serviceDescription, serviceHours, serviceImageUrlsInput, serviceLink, serviceName, servicePriceTier, serviceProviderName, serviceType, serviceVibe, serviceVibeTags, showToast, user?.email, user?.id]);

  const handleReport = ({ targetType, targetId, title }) => {
    setReportDraft(createCityReportDraftFromTarget({
      targetType,
      targetId,
      title,
    }, REPORT_REASONS[0].value));
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
  };

  const submitReport = () => {
    const selectedReason = REPORT_REASONS.find((item) => item.value === reportDraft.reasonKey) || REPORT_REASONS[0];
    const details = String(reportDraft.details || "").trim();

    if (details.length < 8) {
      showToast("Add a short note so admin can act quickly.", { tone: "warn", duration: 2300 });
      return;
    }

    addReport({
      targetType: reportDraft.targetType,
      targetId: reportDraft.targetId,
      city: config.title?.replace("Queer ", "") || city,
      title: reportDraft.title,
      reason: selectedReason.label,
      message: details,
    });

    trackKpiEvent("report_submitted", {
      city: config.title?.replace("Queer ", "") || city,
      targetType: reportDraft.targetType,
      targetId: String(reportDraft.targetId),
      memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      meta: { reason: selectedReason.label },
    });

    setReportModalOpen(false);
    showToast("Report sent to admin inbox.", { tone: "info", duration: 2400 });
  };

  const refreshEntityQuality = ({ targetType, targetId, fallbackSource = "" }, clickEvent) => {
    clickEvent?.stopPropagation();

    const existing = getEntityQuality({ targetType, targetId, entity: { source: fallbackSource }, map: qualityMap });
    const knownSource = (existing?.source || fallbackSource || "").trim();
    setQualityModal(createCityQualityModalFromTarget({
      targetType,
      targetId,
    }, knownSource));
  };

  const closeQualityModal = () => {
    setQualityModal((current) => ({ ...current, open: false }));
  };

  const submitQualityModal = () => {
    const action = String(qualityModal.action || "").trim();
    if (!["1", "2", "3"].includes(action)) {
      showToast("Please choose a trust status.", { tone: "warn", duration: 2200 });
      return;
    }

    const { sourceByAction, verified, lastChecked } = resolveQualityUpdate(
      action,
      qualityModal.fallbackSource,
      qualityModal.sourceInput
    );

    upsertQuality({
      targetType: qualityModal.targetType,
      targetId: qualityModal.targetId,
      source: sourceByAction,
      lastChecked,
      verified,
    });

    setQualityTick((value) => value + 1);
    const toastConfig = getQualityToastConfig(action);
    showToast(toastConfig.message, { tone: toastConfig.tone, duration: toastConfig.duration });
    closeQualityModal();
  };

  const resolvePlaceDbId = useCallback(async (place) => {
    const placeId = String(place?.id || "");
    const placeName = String(place?.name || "").trim();
    const placeCity = String(place?.city || city).trim();
    const normalizeCity = (value) =>
      String(value || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim();

    if (placeId && !placeId.startsWith("seed-place-")) {
      return placeId;
    }

    if (!placeName || !placeCity) return null;

    const lookup = await supabase
      .from("places")
      .select("id, city, name")
      .ilike("name", placeName)
      .limit(20);

    const rows = Array.isArray(lookup?.data) ? lookup.data : [];
    const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(placeCity));

    return matched?.id ? String(matched.id) : null;
  }, [city]);

  const resolveEventDbId = useCallback(async (event) => {
    const eventId = String(event?.id || "");
    const eventName = String(event?.name || "").trim();
    const eventCity = String(event?.city || city).trim();
    const eventDateValue = normalizeEventRange(event || {}).startDate;
    const normalizeCity = (value) =>
      String(value || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim();

    if (eventId && !eventId.startsWith("seed-event-")) {
      return eventId;
    }

    if (!eventName || !eventCity) return null;

    let query = supabase
      .from("events")
      .select("id, city, name, date")
      .ilike("name", eventName)
      .limit(20);

    if (eventDateValue) {
      query = query.eq("date", eventDateValue);
    }

    const lookup = await query;
    const rows = Array.isArray(lookup?.data) ? lookup.data : [];
    const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(eventCity));
    return matched?.id ? String(matched.id) : null;
  }, [city]);

  const resolveServiceDbId = useCallback(async (service) => {
    const serviceIdValue = String(service?.id || "");
    const serviceName = String(service?.name || "").trim();
    const serviceCity = String(service?.city || city).trim();
    const normalizeCity = (value) =>
      String(value || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim();

    if (serviceIdValue && !serviceIdValue.startsWith("seed-service-")) {
      return serviceIdValue;
    }

    if (!serviceName || !serviceCity) return null;

    const lookup = await supabase
      .from("services")
      .select("id, city, name")
      .ilike("name", serviceName)
      .limit(20);

    const rows = Array.isArray(lookup?.data) ? lookup.data : [];
    const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(serviceCity));
    return matched?.id ? String(matched.id) : null;
  }, [city]);

  const handleSubmitLiveVibe = useCallback(async (signalKey) => {
    if (!selectedPlace) return;

    if (!isMember || !user?.id) {
      showToast("Join as member to share live vibe.", { tone: "info", duration: 2200 });
      const redirectTarget = buildSelectionUrl({
        nextPlaceId: selectedPlace.id,
        nextEventId: null,
      });
      redirectToJoinWithReturnTarget(redirectTarget);
      return;
    }

    if (liveVibeMyLastTapMs && Date.now() - liveVibeMyLastTapMs < LIVE_VIBE_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((LIVE_VIBE_COOLDOWN_MS - (Date.now() - liveVibeMyLastTapMs)) / 1000);
      showToast(`Hold for ${secondsLeft}s before sending another live tap.`, {
        tone: "info",
        duration: 1800,
      });
      return;
    }

    setIsSubmittingLiveVibe(true);
    setLiveVibeSubmittingKey(String(signalKey || ""));
    try {
      const dbId = selectedPlaceDbId || (await resolvePlaceDbId(selectedPlace));
      if (!dbId) {
        showToast("Could not resolve this venue for live signal.", {
          tone: "warn",
          duration: 2400,
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("qa_place_vibe_signals")
        .upsert(
          [
            {
              place_id: Number(dbId),
              user_id: user.id,
              signal_key: signalKey,
              created_at: nowIso,
            },
          ],
          { onConflict: "place_id,user_id" }
        );

      if (error) {
        if (isMissingTableError(error)) {
          setLiveVibeTableMissing(true);
          showToast("Live vibe is not activated in DB yet.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        showToast("Could not publish live vibe right now.", {
          tone: "warn",
          duration: 2400,
        });
        return;
      }

      const checkinPayload = {
        user_id: user.id,
        mode: "trip",
        privacy: "friends",
        country: null,
        city: String(selectedPlace.city || city),
        label: String(selectedPlace.name || "Venue"),
        address: String(selectedPlace.location || "").trim() || null,
        note: null,
        place_id: String(dbId),
        event_id: null,
        lat: Number.isFinite(Number(selectedPlace.lat)) ? Number(selectedPlace.lat) : null,
        lng: Number.isFinite(Number(selectedPlace.lng)) ? Number(selectedPlace.lng) : null,
        checked_in_at: nowIso,
      };
      const { error: checkinError } = await supabase
        .from("qa_member_checkins")
        .insert([checkinPayload]);

      setLiveVibeTableMissing(false);
      setSelectedPlaceDbId(String(dbId));
      setLiveVibeRows((current) => {
        const next = (Array.isArray(current) ? current : []).filter(
          (row) => String(row?.user_id || "") !== String(user.id)
        );
        return [
          {
            id: `local-${nowIso}`,
            place_id: Number(dbId),
            user_id: user.id,
            signal_key: signalKey,
            created_at: nowIso,
          },
          ...next,
        ];
      });
      setLiveVibeJustSentKey(String(signalKey || ""));
      if (checkinError && isMissingTableError(checkinError)) {
        showToast("Live vibe shared. Check-ins need latest Supabase SQL.", {
          tone: "info",
          duration: 2600,
        });
        return;
      }
      if (checkinError) {
        showToast("Live vibe shared. Check-in sync unavailable right now.", {
          tone: "info",
          duration: 2400,
        });
        return;
      }

      trackKpiEvent("checkin_saved", {
        city: String(selectedPlace.city || city),
        targetType: "checkin",
        targetId: String(dbId || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Live vibe shared. Check-in saved.", { tone: "ok", duration: 1800 });
    } finally {
      setLiveVibeSubmittingKey("");
      setIsSubmittingLiveVibe(false);
    }
  }, [
    buildSelectionUrl,
    city,
    isMember,
    liveVibeMyLastTapMs,
    memberName,
    redirectToJoinWithReturnTarget,
    resolvePlaceDbId,
    selectedPlace,
    selectedPlaceDbId,
    showToast,
    user?.email,
    user?.id,
  ]);

  const handleSubmitEventLiveVibe = useCallback(async (signalKey) => {
    if (!selectedEvent) return;

    if (!isMember || !user?.id) {
      showToast("Join as member to share live vibe.", { tone: "info", duration: 2200 });
      const redirectTarget = buildSelectionUrl({
        nextPlaceId: null,
        nextEventId: selectedEvent.id,
        nextServiceId: null,
      });
      redirectToJoinWithReturnTarget(redirectTarget);
      return;
    }

    setIsSubmittingEventLiveVibe(true);
    setEventLiveVibeSubmittingKey(String(signalKey || ""));
    try {
      const dbId = await resolveEventDbId(selectedEvent);
      if (!dbId) {
        showToast("Could not resolve this event for live signal.", {
          tone: "warn",
          duration: 2400,
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const checkinPayload = {
        user_id: user.id,
        mode: "trip",
        privacy: "friends",
        country: null,
        city: String(selectedEvent.city || city),
        label: String(selectedEvent.name || "Event"),
        address: String(selectedEvent.location || "").trim() || null,
        note: null,
        place_id: null,
        event_id: String(dbId),
        lat: Number.isFinite(Number(selectedEvent.lat)) ? Number(selectedEvent.lat) : null,
        lng: Number.isFinite(Number(selectedEvent.lng)) ? Number(selectedEvent.lng) : null,
        checked_in_at: nowIso,
      };
      const { error: checkinError } = await supabase
        .from("qa_member_checkins")
        .insert([checkinPayload]);

      setEventLiveVibeSignalKey(String(signalKey || ""));
      setEventLiveVibeJustSentKey(String(signalKey || ""));

      if (checkinError && isMissingTableError(checkinError)) {
        showToast("Event live vibe shared. Check-ins need latest Supabase SQL.", {
          tone: "info",
          duration: 2600,
        });
        return;
      }
      if (checkinError) {
        showToast("Event live vibe shared. Check-in sync unavailable right now.", {
          tone: "info",
          duration: 2400,
        });
        return;
      }

      trackKpiEvent("checkin_saved", {
        city: String(selectedEvent.city || city),
        targetType: "checkin",
        targetId: `event-${String(dbId || "")}`,
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Event live vibe shared. Check-in saved.", { tone: "ok", duration: 1800 });
    } finally {
      setEventLiveVibeSubmittingKey("");
      setIsSubmittingEventLiveVibe(false);
    }
  }, [
    buildSelectionUrl,
    city,
    isMember,
    memberName,
    redirectToJoinWithReturnTarget,
    resolveEventDbId,
    selectedEvent,
    showToast,
    user?.email,
    user?.id,
  ]);

  const handleJoinToPlaceReview = useCallback(() => {
    if (!selectedPlace) return;
    const redirectTarget = buildSelectionUrl({
      nextPlaceId: selectedPlace.id,
      nextEventId: null,
    });
    redirectToJoinWithReturnTarget(redirectTarget);
  }, [buildSelectionUrl, redirectToJoinWithReturnTarget, selectedPlace]);

  const handleSubmitPlaceReview = useCallback(async () => {
    if (!selectedPlace) return;
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      showToast("Write a short comment before submitting.", {
        tone: "warn",
        duration: 2200,
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const result = await addReview({
        placeId: selectedPlace.id,
        place: selectedPlace,
        rating,
        safety: safetyRating,
        comment: trimmedComment,
      });

      if (!result?.ok) {
        showToast("Could not submit review right now.", {
          tone: "warn",
          duration: 2400,
        });
        return;
      }

      setComment("");
      setRating(5);
      setSafetyRating(4);
      const updated = await getReviews(selectedPlace.id, selectedPlace);
      setReviews(updated);
      trackKpiEvent("review_submitted", {
        city,
        targetType: "place",
        targetId: String(selectedPlace.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Review submitted.", { tone: "ok", duration: 1800 });
    } finally {
      setIsSubmittingReview(false);
    }
  }, [
    addReview,
    city,
    comment,
    getReviews,
    memberName,
    rating,
    safetyRating,
    selectedPlace,
    showToast,
    user?.email,
  ]);

  useEffect(() => {
    if (!liveVibeJustSentKey) return undefined;
    const timeout = window.setTimeout(() => {
      setLiveVibeJustSentKey("");
    }, 950);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [liveVibeJustSentKey]);

  useEffect(() => {
    if (!eventLiveVibeJustSentKey) return undefined;
    const timeout = window.setTimeout(() => {
      setEventLiveVibeJustSentKey("");
    }, 950);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [eventLiveVibeJustSentKey]);

  const handleAdminSavePlace = useCallback(async () => {
    if (!isAdmin || !selectedPlace) return;
    if (!placeAdminDraft.name.trim() || !placeAdminDraft.description.trim() || !placeAdminDraft.hours.trim()) {
      showToast("Name, description, and opening hours are required.", { tone: "warn", duration: 2400 });
      return;
    }

    setIsSavingPlaceAdmin(true);
    try {
      const dbId = await resolvePlaceDbId(selectedPlace);
      const locationValue = String(placeAdminDraft.location || "").trim();
      let nextLat = selectedPlace.lat ?? null;
      let nextLng = selectedPlace.lng ?? null;

      if (locationValue) {
        const coords = await geocodeAddress(locationValue);
        if (!coords) {
          showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
          return;
        }
        nextLat = coords.lat;
        nextLng = coords.lng;
      }

      const payload = {
        name: placeAdminDraft.name.trim(),
        type: placeAdminDraft.type,
        description: placeAdminDraft.description.trim(),
        ...buildVibeDualWriteFields({
          vibe: placeAdminDraft.vibe,
          vibeTags: normalizeVibeTags(placeAdminDraft.vibe_tags, { max: 3 }),
        }),
        legacy_vibe_user_set: Boolean(String(placeAdminDraft.vibe || "").trim()),
        location: locationValue || null,
        hours: placeAdminDraft.hours.trim(),
        link: placeAdminDraft.link.trim() || null,
        lat: nextLat,
        lng: nextLng,
      };

      if (dbId) {
        let updateResult = await supabase
          .from("places")
          .update(payload)
          .eq("id", dbId)
          .select("id")
          .single();

        if (updateResult.error) {
          const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibeTags = isMissingVibeTagsColumnError(updateResult.error);
          const missingLegacyVibeUserSet =
            errorText.includes("legacy_vibe_user_set") &&
            (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingLocation || missingVibeTags || missingLegacyVibeUserSet) {
            const fallbackPayload = { ...payload };
            if (missingLocation) {
              delete fallbackPayload.location;
            }
            if (missingVibeTags) {
              delete fallbackPayload.vibe_tags;
            }
            if (missingLegacyVibeUserSet) {
              delete fallbackPayload.legacy_vibe_user_set;
            }
            updateResult = await supabase
              .from("places")
              .update(fallbackPayload)
              .eq("id", dbId)
              .select("id")
              .single();
          }
        }
        const { error } = updateResult;

        if (error) {
          showToast(error.message || "Could not save venue changes.", { tone: "warn", duration: 2600 });
          return;
        }
      } else {
        let insertPayload = {
          ...payload,
          city: String(selectedPlace.city || city).trim(),
        };
        let insertResult = await supabase
          .from("places")
          .insert([insertPayload])
          .select("id")
          .single();

        if (insertResult.error) {
          const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibeTags = isMissingVibeTagsColumnError(insertResult.error);
          const missingLegacyVibeUserSet =
            errorText.includes("legacy_vibe_user_set") &&
            (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingLocation || missingVibeTags || missingLegacyVibeUserSet) {
            insertPayload = { ...insertPayload };
            if (missingLocation) {
              delete insertPayload.location;
            }
            if (missingVibeTags) {
              delete insertPayload.vibe_tags;
            }
            if (missingLegacyVibeUserSet) {
              delete insertPayload.legacy_vibe_user_set;
            }
            insertResult = await supabase
              .from("places")
              .insert([insertPayload])
              .select("id")
              .single();
          }
        }
        const { data: inserted, error } = insertResult;

        if (error || !inserted?.id) {
          showToast(error?.message || "Could not save venue changes.", { tone: "warn", duration: 2600 });
          return;
        }

        router.push(buildSelectionUrl({ nextPlaceId: inserted.id, nextEventId: null }));
      }

      await reloadPlaces();
      setPlaceAdminOpen(false);
      showToast("Venue updated and saved.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save venue changes.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingPlaceAdmin(false);
    }
  }, [buildSelectionUrl, city, geocodeAddress, isAdmin, placeAdminDraft, reloadPlaces, resolvePlaceDbId, router, selectedPlace, showToast]);

  const handleAdminDeletePlace = useCallback(async () => {
    if (!isAdmin || !selectedPlace) return;
    const confirmed = window.confirm(`Delete venue "${selectedPlace.name}" from atlas?`);
    if (!confirmed) return;

    setIsDeletingPlaceAdmin(true);
    try {
      const dbId = await resolvePlaceDbId(selectedPlace);
      if (!dbId) {
        showToast("Could not resolve place record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      const { error } = await supabase
        .from("places")
        .delete()
        .eq("id", dbId);

      if (error) {
        showToast(error.message || "Could not delete venue.", { tone: "warn", duration: 2600 });
        return;
      }

      await reloadPlaces();
      closePlace();
      showToast("Venue deleted.", { tone: "ok", duration: 2000 });
    } catch (error) {
      showToast(error?.message || "Could not delete venue.", { tone: "warn", duration: 2600 });
    } finally {
      setIsDeletingPlaceAdmin(false);
    }
  }, [closePlace, isAdmin, reloadPlaces, resolvePlaceDbId, selectedPlace, showToast]);

  const handleAdminSavePlaceAddressOnly = useCallback(async () => {
    if (!isAdmin || !selectedPlace) return;
    const locationValue = String(placeAdminDraft.location || "").trim();
    if (!locationValue) {
      showToast("Address is required.", { tone: "warn", duration: 2200 });
      return;
    }

    setIsSavingPlaceAddressOnly(true);
    try {
      const coords = await geocodeAddress(locationValue);
      if (!coords) {
        showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
        return;
      }

      const dbId = await resolvePlaceDbId(selectedPlace);
      if (!dbId) {
        showToast("Could not resolve place record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      let updateResult = await supabase
        .from("places")
        .update({
          location: locationValue,
          lat: coords.lat,
          lng: coords.lng,
        })
        .eq("id", dbId)
        .select("id")
        .single();

      if (updateResult.error) {
        const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingLocation) {
          updateResult = await supabase
            .from("places")
            .update({
              lat: coords.lat,
              lng: coords.lng,
            })
            .eq("id", dbId)
            .select("id")
            .single();
        }
      }

      if (updateResult.error) {
        showToast(updateResult.error.message || "Could not save venue address.", { tone: "warn", duration: 2600 });
        return;
      }

      await reloadPlaces();
      showToast("Venue address updated.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save venue address.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingPlaceAddressOnly(false);
    }
  }, [geocodeAddress, isAdmin, placeAdminDraft.location, reloadPlaces, resolvePlaceDbId, selectedPlace, showToast]);

  const handleAdminSaveEvent = useCallback(async () => {
    if (!isAdmin || !selectedEvent) return;
    const startDate = normalizeIsoDate(eventAdminDraft.startDate);
    const endDateInput = normalizeIsoDate(eventAdminDraft.endDate);
    const endDate = endDateInput && endDateInput >= startDate ? endDateInput : startDate;
    const locationValue = String(eventAdminDraft.location || "").trim();

    if (!eventAdminDraft.name.trim() || !startDate) {
      showToast("Event name and start date are required.", { tone: "warn", duration: 2400 });
      return;
    }
    if (endDateInput && endDateInput < startDate) {
      showToast("End date must be same day or after start date.", { tone: "warn", duration: 2400 });
      return;
    }
    setIsSavingEventAdmin(true);
    try {
      const ticketUrlValue = String(eventAdminDraft.ticket_url || "").trim();
      const dbId = await resolveEventDbId(selectedEvent);
      let nextLat = selectedEvent.lat ?? null;
      let nextLng = selectedEvent.lng ?? null;

      if (locationValue) {
        const coords = await geocodeAddress(locationValue);
        if (!coords) {
          showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
          return;
        }
        nextLat = coords.lat;
        nextLng = coords.lng;
      }

      const payload = {
        name: eventAdminDraft.name.trim(),
        date: startDate,
        start_date: startDate,
        end_date: endDate || startDate,
        location: locationValue,
        lat: nextLat,
        lng: nextLng,
        ...buildVibeDualWriteFields({
          vibe: eventAdminDraft.vibe,
          vibeTags: normalizeVibeTags(eventAdminDraft.vibe_tags, { max: 3 }),
        }),
        description: eventAdminDraft.description.trim(),
        link: eventAdminDraft.link.trim() || null,
        ticket_url: ticketUrlValue || null,
      };

      if (dbId) {
        let updateResult = await supabase
          .from("events")
          .update(payload)
          .eq("id", dbId)
          .select("*")
          .single();

        if (updateResult.error) {
          const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
          const missingDateRange =
            (errorText.includes("start_date") || errorText.includes("end_date")) &&
            (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibe =
            /\bvibe\b/.test(errorText) && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibeTags = isMissingVibeTagsColumnError(updateResult.error);
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingTicketUrl =
            errorText.includes("ticket_url") && (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingDateRange || missingVibe || missingVibeTags || missingLocation || missingTicketUrl) {
            const legacyPayload = {
              name: eventAdminDraft.name.trim(),
              date: startDate,
              lat: nextLat,
              lng: nextLng,
              description: eventAdminDraft.description.trim(),
              link: eventAdminDraft.link.trim() || null,
            };
            if (!missingTicketUrl) {
              legacyPayload.ticket_url = ticketUrlValue || null;
            }
            if (!missingVibe) {
              legacyPayload.vibe = eventAdminDraft.vibe.trim() || null;
            }
            if (!missingVibeTags) {
              legacyPayload.vibe_tags = buildVibeDualWriteFields({
                vibe: eventAdminDraft.vibe,
                vibeTags: normalizeVibeTags(eventAdminDraft.vibe_tags, { max: 3 }),
              }).vibe_tags;
            }
            updateResult = await supabase
              .from("events")
              .update(legacyPayload)
              .eq("id", dbId)
              .select("*")
              .single();
          }
        }
        const { error } = updateResult;

        if (error) {
          captureOperationalError("save_event_fail", error, {
            city: String(selectedEvent?.city || city || ""),
            flow: "city_admin_update_event",
            eventId: String(dbId),
          });
          showToast(error.message || "Could not save event changes.", { tone: "warn", duration: 2600 });
          return;
        }
      } else {
        const insertPayload = {
          ...payload,
          city: String(selectedEvent.city || city).trim(),
        };

        let insertResult = await supabase
          .from("events")
          .insert([insertPayload])
          .select("*")
          .single();

        if (insertResult.error) {
          const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
          const missingDateRange =
            (errorText.includes("start_date") || errorText.includes("end_date")) &&
            (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibe =
            /\bvibe\b/.test(errorText) && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibeTags = isMissingVibeTagsColumnError(insertResult.error);
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingTicketUrl =
            errorText.includes("ticket_url") && (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingDateRange || missingVibe || missingVibeTags || missingLocation || missingTicketUrl) {
            const legacyInsertPayload = {
              name: eventAdminDraft.name.trim(),
              date: startDate,
              description: eventAdminDraft.description.trim(),
              link: eventAdminDraft.link.trim() || null,
              city: String(selectedEvent.city || city).trim(),
              lat: nextLat,
              lng: nextLng,
            };
            if (!missingTicketUrl) {
              legacyInsertPayload.ticket_url = ticketUrlValue || null;
            }
            if (!missingVibe) {
              legacyInsertPayload.vibe = eventAdminDraft.vibe.trim() || null;
            }
            if (!missingVibeTags) {
              legacyInsertPayload.vibe_tags = buildVibeDualWriteFields({
                vibe: eventAdminDraft.vibe,
                vibeTags: normalizeVibeTags(eventAdminDraft.vibe_tags, { max: 3 }),
              }).vibe_tags;
            }
            insertResult = await supabase
              .from("events")
              .insert([legacyInsertPayload])
              .select("*")
              .single();
          }
        }

        const { data: inserted, error } = insertResult;

        if (error || !inserted?.id) {
          captureOperationalError("save_event_fail", error || new Error("Event insert returned no id."), {
            city: String(selectedEvent?.city || city || ""),
            flow: "city_admin_upsert_event",
          });
          showToast(error?.message || "Could not save event changes.", { tone: "warn", duration: 2600 });
          return;
        }

        router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: inserted.id }));
      }

      await fetchEvents();
      setEventAdminOpen(false);
      showToast("Event updated and saved.", { tone: "ok", duration: 2000 });
    } catch (error) {
      captureOperationalError("save_event_fail", error, {
        city: String(selectedEvent?.city || city || ""),
        flow: "city_admin_save_event_catch",
        eventId: String(selectedEvent?.id || ""),
      });
      showToast(error?.message || "Could not save event changes.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingEventAdmin(false);
    }
  }, [buildSelectionUrl, city, eventAdminDraft, fetchEvents, geocodeAddress, isAdmin, resolveEventDbId, router, selectedEvent, showToast]);

  const handleAdminSaveEventAddressOnly = useCallback(async () => {
    if (!isAdmin || !selectedEvent) return;
    const locationValue = String(eventAdminDraft.location || "").trim();
    if (!locationValue) {
      showToast("Address is required.", { tone: "warn", duration: 2200 });
      return;
    }

    setIsSavingEventAddressOnly(true);
    try {
      const coords = await geocodeAddress(locationValue);
      if (!coords) {
        showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
        return;
      }

      const dbId = await resolveEventDbId(selectedEvent);
      if (!dbId) {
        showToast("Could not resolve event record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      let updateResult = await supabase
        .from("events")
        .update({
          location: locationValue,
          lat: coords.lat,
          lng: coords.lng,
        })
        .eq("id", dbId)
        .select("id")
        .single();

      if (updateResult.error) {
        const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingLocation) {
          updateResult = await supabase
            .from("events")
            .update({
              lat: coords.lat,
              lng: coords.lng,
            })
            .eq("id", dbId)
            .select("id")
            .single();
        }
      }

      if (updateResult.error) {
        showToast(updateResult.error.message || "Could not save event address.", { tone: "warn", duration: 2600 });
        return;
      }

      await fetchEvents();
      showToast("Event address updated.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save event address.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingEventAddressOnly(false);
    }
  }, [eventAdminDraft.location, fetchEvents, geocodeAddress, isAdmin, resolveEventDbId, selectedEvent, showToast]);

  const handleAdminDeleteEvent = useCallback(async () => {
    if (!isAdmin || !selectedEvent) return;
    const confirmed = window.confirm(`Delete event "${selectedEvent.name}" from atlas?`);
    if (!confirmed) return;

    setIsDeletingEventAdmin(true);
    try {
      const dbId = await resolveEventDbId(selectedEvent);
      if (!dbId) {
        showToast("Could not resolve event record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", dbId);

      if (error) {
        showToast(error.message || "Could not delete event.", { tone: "warn", duration: 2600 });
        return;
      }

      await fetchEvents();
      closeEvent();
      showToast("Event deleted.", { tone: "ok", duration: 2000 });
    } catch (error) {
      showToast(error?.message || "Could not delete event.", { tone: "warn", duration: 2600 });
    } finally {
      setIsDeletingEventAdmin(false);
    }
  }, [closeEvent, fetchEvents, isAdmin, resolveEventDbId, selectedEvent, showToast]);

  const handleAdminSaveService = useCallback(async () => {
    if (!canEditSelectedService || !selectedService) return;

    if (!String(serviceAdminDraft.name || "").trim() || !String(serviceAdminDraft.description || "").trim()) {
      showToast("Service name and description are required.", { tone: "warn", duration: 2400 });
      return;
    }

    setIsSavingServiceAdmin(true);
    try {
      const dbId = await resolveServiceDbId(selectedService);
      if (!dbId) {
        showToast("Could not resolve service record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      const locationValue = String(serviceAdminDraft.location || "").trim();
      let nextLat = Number(selectedService?.lat);
      let nextLng = Number(selectedService?.lng);

      if (!Number.isFinite(nextLat)) nextLat = null;
      if (!Number.isFinite(nextLng)) nextLng = null;

      if (locationValue) {
        const coords = await geocodeAddress(locationValue);
        if (!coords) {
          showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
          return;
        }
        nextLat = coords.lat;
        nextLng = coords.lng;
      }

      const sourceValue = String(serviceAdminDraft.source || "").trim();
      const lastCheckedValue = normalizeIsoDate(serviceAdminDraft.lastChecked);
      const payload = {
        name: String(serviceAdminDraft.name || "").trim(),
        type: String(serviceAdminDraft.type || "other").trim() || "other",
        provider_name: String(serviceAdminDraft.provider_name || "").trim() || null,
        contact: String(serviceAdminDraft.contact || "").trim() || null,
        booking_link: String(serviceAdminDraft.booking_link || "").trim() || null,
        description: String(serviceAdminDraft.description || "").trim(),
        hours: String(serviceAdminDraft.hours || "").trim() || null,
        link: String(serviceAdminDraft.link || "").trim() || null,
        price_tier: String(serviceAdminDraft.price_tier || "").trim() || null,
        location: locationValue || null,
        lat: nextLat,
        lng: nextLng,
        ...buildVibeDualWriteFields({
          vibe: serviceAdminDraft.vibe,
          vibeTags: normalizeVibeTags(serviceAdminDraft.vibe_tags, { max: 3 }),
        }),
        source: sourceValue || null,
        lastChecked: lastCheckedValue || null,
        verified: Boolean(sourceValue && lastCheckedValue),
      };

      let updateResult = await supabase
        .from("services")
        .update(payload)
        .eq("id", dbId)
        .select("id")
        .single();

      if (updateResult.error) {
        const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));
        const missingVibeTags = isMissingVibeTagsColumnError(updateResult.error);

        if (missingLocation || missingVibeTags) {
          const fallbackPayload = { ...payload };
          if (missingLocation) {
            delete fallbackPayload.location;
          }
          if (missingVibeTags) {
            delete fallbackPayload.vibe_tags;
          }
          updateResult = await supabase
            .from("services")
            .update(fallbackPayload)
            .eq("id", dbId)
            .select("id")
            .single();
        }
      }

      if (updateResult.error) {
        showToast(updateResult.error.message || "Could not save service changes.", { tone: "warn", duration: 2600 });
        return;
      }

      await fetchServices();
      setServiceAdminOpen(false);
      showToast("Service updated and saved.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save service changes.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingServiceAdmin(false);
    }
  }, [
    canEditSelectedService,
    fetchServices,
    geocodeAddress,
    resolveServiceDbId,
    selectedService,
    serviceAdminDraft,
    showToast,
  ]);

  const handleAdminSaveServiceAddressOnly = useCallback(async () => {
    if (!canEditSelectedService || !selectedService) return;
    const locationValue = String(serviceAdminDraft.location || "").trim();
    if (!locationValue) {
      showToast("Address is required.", { tone: "warn", duration: 2200 });
      return;
    }

    setIsSavingServiceAddressOnly(true);
    try {
      const coords = await geocodeAddress(locationValue);
      if (!coords) {
        showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
        return;
      }

      const dbId = await resolveServiceDbId(selectedService);
      if (!dbId) {
        showToast("Could not resolve service record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      let updateResult = await supabase
        .from("services")
        .update({
          location: locationValue,
          lat: coords.lat,
          lng: coords.lng,
        })
        .eq("id", dbId)
        .select("id")
        .single();

      if (updateResult.error) {
        const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingLocation) {
          updateResult = await supabase
            .from("services")
            .update({
              lat: coords.lat,
              lng: coords.lng,
            })
            .eq("id", dbId)
            .select("id")
            .single();
        }
      }

      if (updateResult.error) {
        showToast(updateResult.error.message || "Could not save service address.", { tone: "warn", duration: 2600 });
        return;
      }

      await fetchServices();
      showToast("Service address updated.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save service address.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingServiceAddressOnly(false);
    }
  }, [
    canEditSelectedService,
    fetchServices,
    geocodeAddress,
    resolveServiceDbId,
    selectedService,
    serviceAdminDraft.location,
    showToast,
  ]);

  const handleAdminDeleteService = useCallback(async () => {
    if (!isAdmin || !selectedService) return;
    const confirmed = window.confirm(`Delete service "${selectedService.name}" from atlas?`);
    if (!confirmed) return;

    setIsDeletingServiceAdmin(true);
    try {
      const dbId = await resolveServiceDbId(selectedService);
      if (!dbId) {
        showToast("Could not resolve service record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", dbId);

      if (error) {
        showToast(error.message || "Could not delete service.", { tone: "warn", duration: 2600 });
        return;
      }

      await fetchServices();
      closeService();
      showToast("Service deleted.", { tone: "ok", duration: 2000 });
    } catch (error) {
      showToast(error?.message || "Could not delete service.", { tone: "warn", duration: 2600 });
    } finally {
      setIsDeletingServiceAdmin(false);
    }
  }, [closeService, fetchServices, isAdmin, resolveServiceDbId, selectedService, showToast]);

  return (
    <main className="qa-city flex min-h-screen bg-[#050505] text-white xl:h-screen xl:overflow-hidden">
      <CitySeoScaffold
        city={city}
        cityName={cityName}
        cityBreadcrumbJsonLd={cityBreadcrumbJsonLd}
        cityPlacesItemListJsonLd={cityPlacesItemListJsonLd}
        cityEventsItemListJsonLd={cityEventsItemListJsonLd}
        cityFaqJsonLd={cityFaqJsonLd}
      />
      <ActionToast toast={toast} />
      <div ref={mainScrollRef} className="flex-1 overflow-y-auto px-5 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8 xl:h-full xl:overflow-hidden">
        <div className="mx-auto w-full max-w-[1900px]">
          <div className="xl:grid xl:min-h-[calc(100vh-3rem)] xl:grid-cols-[224px_minmax(0,1fr)_minmax(360px,440px)] xl:items-start xl:gap-[0.9rem]">
            <aside className="hidden xl:self-start xl:block">
              <div className="sticky top-6 h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
                <CityNavigationCluster
                  cityPlacesCount={cityPlaces.length}
                  cityEventCount={cityEventCount}
                  cityServiceCount={cityServiceCount}
                  activeCitySection={effectiveDesktopContentSection}
                  onGoHome={handleGoHomeDesktop}
                  onGoMap={() => scrollToSection(mapWrapperRef)}
                  onGoEvents={() => handleDesktopSectionNav("events", tonightSectionRef)}
                  onGoGuide={() => handleDesktopSectionNav("guide", guideSectionRef)}
                  onGoServices={() => handleDesktopSectionNav("services", servicesSectionRef)}
                  onGoVenues={() => handleDesktopSectionNav("venues", placesSectionRef)}
                  onGoVenueType={handleGoVenueType}
                  onAddPlace={() => {
                    handleDesktopSectionNav("guide", guideSectionRef);
                    onToggleAddPlace();
                  }}
                  onAddEvent={() => {
                    handleDesktopSectionNav("events", tonightSectionRef);
                    onToggleAddEvent();
                  }}
                  onAddService={() => {
                    handleDesktopSectionNav("services", servicesSectionRef);
                    onToggleAddService();
                  }}
                  venueJumpGroups={venueJumpGroups}
                  activeVenueFilter={activeVenueFilter}
                  variant="rail"
                />
                <div className="mt-5">
                  <CityNavigationCluster
                    onAddPlace={() => {
                      handleDesktopSectionNav("guide", guideSectionRef);
                      onToggleAddPlace();
                    }}
                    onAddEvent={() => {
                      handleDesktopSectionNav("events", tonightSectionRef);
                      onToggleAddEvent();
                    }}
                    onAddService={() => {
                      handleDesktopSectionNav("services", servicesSectionRef);
                      onToggleAddService();
                    }}
                    variant="contribute"
                  />
                </div>
              </div>
            </aside>

            <aside className="min-w-0 xl:col-start-3 xl:row-start-1 xl:h-[calc(100vh-3rem)] xl:self-start">
              <div className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
                <CityMapSection
                  mapWrapperRef={mapWrapperRef}
                  mapContainerRef={mapContainerRef}
                  mapError={mapError}
                  onContinueInListMode={() => {
                    mapWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              </div>
            </aside>

            <section
              ref={centerColumnScrollRef}
              className="min-w-0 xl:col-start-2 xl:row-start-1 xl:h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto"
            >
              <CityTopCluster
                city={city}
                cityName={cityName}
                placesChipLabel={placesChipLabel}
                eventsChipLabel={eventsChipLabel}
                cityHero={cityHero}
                cityHeroIntro={cityHeroIntro}
                addMode={addMode}
                addEventMode={addEventMode}
                addServiceMode={addServiceMode}
                onToggleAddPlace={onToggleAddPlace}
                onToggleAddEvent={onToggleAddEvent}
                onToggleAddService={onToggleAddService}
                showHero={effectiveDesktopContentSection === "home"}
                showContributionActions={false}
                placeFormProps={{
                  name,
                  setName,
                  description,
                  setDescription,
                  vibeTags,
                  setVibeTags,
                  vibe,
                  setVibe,
                  placeHours,
                  setPlaceHours,
                  placeLink,
                  setPlaceLink,
                  address,
                  setAddress,
                  type,
                  setType,
                  types: TYPES,
                  onSave: handleAddPlace,
                }}
                eventFormProps={{
                  addEventFormRef,
                  eventName,
                  setEventName,
                  eventDescription,
                  setEventDescription,
                  eventVibeTags,
                  setEventVibeTags,
                  eventVibe,
                  setEventVibe,
                  eventLink,
                  setEventLink,
                  eventTicketUrl,
                  setEventTicketUrl,
                  eventAddress,
                  setEventAddress,
                  eventStartDate,
                  setEventStartDate,
                  eventEndDate,
                  setEventEndDate,
                  onSaveEvent: handleAddEvent,
                }}
                serviceFormProps={{
                  addServiceFormRef,
                  serviceName,
                  setServiceName,
                  serviceDescription,
                  setServiceDescription,
                  serviceVibeTags,
                  setServiceVibeTags,
                  serviceVibe,
                  setServiceVibe,
                  serviceAddress,
                  setServiceAddress,
                  serviceType,
                  setServiceType,
                  serviceTypes: SERVICE_TYPES,
                  servicePriceTier,
                  setServicePriceTier,
                  servicePriceTierOptions: SERVICE_PRICE_TIER_OPTIONS,
                  serviceHours,
                  setServiceHours,
                  serviceProviderName,
                  setServiceProviderName,
                  serviceContact,
                  setServiceContact,
                  serviceBookingLink,
                  setServiceBookingLink,
                  serviceLink,
                  setServiceLink,
                  serviceImageUrlsInput,
                  setServiceImageUrlsInput,
                  onSaveService: handleAddService,
                }}
              />

              <div className="xl:hidden">
                <CityNavigationCluster
                  cityPlacesCount={cityPlaces.length}
                  cityEventCount={cityEventCount}
                  cityServiceCount={cityServiceCount}
                  activeCitySection={activeCitySection}
                  onGoHome={() => goToMobileSection("guide", guideSectionRef)}
                  onGoMap={() => goToMobileSection("map", mapWrapperRef)}
                  onGoEvents={() => goToMobileSection("events", tonightSectionRef)}
                  onGoGuide={() => goToMobileSection("guide", guideSectionRef)}
                  onGoServices={() => goToMobileSection("services", servicesSectionRef)}
                  onGoVenues={() => goToMobileSection("venues", placesSectionRef)}
                  onGoVenueType={(value) => {
                    goToMobileSection("venues", placesSectionRef);
                    handleGoVenueType(value);
                  }}
                  venueJumpGroups={venueJumpGroups}
                  activeVenueFilter={activeVenueFilter}
                />
                <CitySeoTopicLinks city={city} cityName={cityName} />
              </div>

              <div className={`${activeCitySection === "guide" ? "block" : "hidden"} ${effectiveDesktopContentSection === "guide" && !isAddComposerActive ? "xl:block" : "xl:hidden"}`}>
                <CityGuideCluster
                  guideSectionRef={guideSectionRef}
                  cityName={cityName}
                  config={config}
                  placesLoading={placesLoading}
                  placesLoadError={placesLoadError}
                  reloadPlaces={reloadPlaces}
                />
              </div>

              <div className={`${activeCitySection === "events" ? "block" : "hidden"} ${effectiveDesktopContentSection === "events" && !isAddComposerActive ? "xl:block" : "xl:hidden"}`}>
                {selectedEvent && (
                  <div className="mb-6 hidden xl:block">
                    <SelectedEventPanel
                      selectedEvent={selectedEvent}
                      inlineMode
                      onWheel={handleDesktopPanelWheel}
                      onClose={closeEvent}
                      cityLabel={config.title?.replace("Queer ", "")}
                      cityName={cityName}
                      liveVibeOptions={LIVE_VIBE_OPTIONS}
                      eventLiveVibeSignalKey={eventLiveVibeSignalKey}
                      isSubmittingEventLiveVibe={isSubmittingEventLiveVibe}
                      eventLiveVibeSubmittingKey={eventLiveVibeSubmittingKey}
                      eventLiveVibeJustSentKey={eventLiveVibeJustSentKey}
                      handleSubmitEventLiveVibe={handleSubmitEventLiveVibe}
                      isMember={isMember}
                      eventLiveVibeSelectedOption={eventLiveVibeSelectedOption}
                      selectedEventQuality={selectedEventQuality}
                      formatDate={formatDate}
                      selectedEventQualityStatus={selectedEventQualityStatus}
                      refreshEntityQuality={refreshEntityQuality}
                      canRefreshQuality={canRefreshQuality}
                      trustedEventSavesCount={trustedEventSavesCount}
                      isAdmin={isAdmin}
                      eventAdminOpen={eventAdminOpen}
                      onToggleEventAdmin={toggleEventAdminEditor}
                      eventAdminDraft={eventAdminDraft}
                      setEventAdminDraft={setEventAdminDraft}
                      handleAdminSaveEventAddressOnly={handleAdminSaveEventAddressOnly}
                      isSavingEventAddressOnly={isSavingEventAddressOnly}
                      handleAdminSaveEvent={handleAdminSaveEvent}
                      isSavingEventAdmin={isSavingEventAdmin}
                      handleAdminDeleteEvent={handleAdminDeleteEvent}
                      isDeletingEventAdmin={isDeletingEventAdmin}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      showEventOnMap={showEventOnMap}
                      handleReport={handleReport}
                    />
                  </div>
                )}
                {!selectedEvent && (
                  <>
                    <CityTonightCluster
                      sectionRef={tonightSectionRef}
                      city={city}
                      cityName={cityName}
                      tonightFeedTab={tonightFeedTab}
                      setTonightFeedTab={setTonightFeedTab}
                      isMember={isMember}
                      hostPrivateEventOpen={hostPrivateEventOpen}
                      setHostPrivateEventOpen={setHostPrivateEventOpen}
                      redirectToJoin={redirectToJoin}
                      eventsLoadError={eventsLoadError}
                      fetchEvents={fetchEvents}
                      eventsLoading={eventsLoading}
                      featuredEvent={featuredEvent}
                      openEvent={openEvent}
                      setHoveredEventId={setHoveredEventId}
                      hoveredEventId={hoveredEventId}
                      isFocusMode={isFocusMode}
                      selectedEvent={selectedEvent}
                      formatEventDateLabel={formatEventDateLabel}
                      remainingEvents={remainingEvents}
                      openEventContribution={openEventContribution}
                      privateEventsTableMissing={privateEventsTableMissing}
                      privateEventsError={privateEventsError}
                      privateEventsLoading={privateEventsLoading}
                      cityPrivateEvents={cityPrivateEvents}
                      getPrivateEventStatus={getPrivateEventStatus}
                      user={user}
                      privateEventInvites={privateEventInvites}
                      privateInviteRequestsByEvent={privateInviteRequestsByEvent}
                      pendingPrivateInviteCountByEvent={pendingPrivateInviteCountByEvent}
                      expandedPrivateHostEventId={expandedPrivateHostEventId}
                      setExpandedPrivateHostEventId={setExpandedPrivateHostEventId}
                      formatEndsIn={formatEndsIn}
                      privateFeedNowTick={privateFeedNowTick}
                      privateEventTypeLabels={PRIVATE_EVENT_TYPE_LABELS}
                      formatDateTime={formatDateTime}
                      deletePrivateEvent={deletePrivateEvent}
                      deletingPrivateEventId={deletingPrivateEventId}
                      isSubmittingPrivateInvite={isSubmittingPrivateInvite}
                      requestPrivateInvite={requestPrivateInvite}
                      privateInviteRequesterProfiles={privateInviteRequesterProfiles}
                      formatDate={formatDate}
                      respondPrivateInviteRequest={respondPrivateInviteRequest}
                      isUpdatingPrivateInviteStatus={isUpdatingPrivateInviteStatus}
                      privateEventForm={privateEventForm}
                      setPrivateEventForm={setPrivateEventForm}
                      privateEventStartPreview={privateEventStartPreview}
                      privateEventExpiresPreview={privateEventExpiresPreview}
                      submitPrivateEvent={submitPrivateEvent}
                      isSubmittingPrivateEvent={isSubmittingPrivateEvent}
                      privateEventTypes={PRIVATE_EVENT_TYPES}
                      todayIso={todayIso}
                      router={router}
                    />
                    <CityEventsRailSection
                      sectionRef={eventsSectionRef}
                      guideSectionRef={guideSectionRef}
                      eventsLoadError={eventsLoadError}
                      fetchEvents={fetchEvents}
                      eventsLoading={eventsLoading}
                      featuredEvent={featuredEvent}
                      qualityMap={qualityMap}
                      openEvent={openEvent}
                      setHoveredEventId={setHoveredEventId}
                      hoveredEventId={hoveredEventId}
                      isFocusMode={isFocusMode}
                      selectedEvent={selectedEvent}
                      formatEventDateLabel={formatEventDateLabel}
                      city={city}
                      cityName={cityName}
                      refreshEntityQuality={refreshEntityQuality}
                      canRefreshQuality={canRefreshQuality}
                      formatDate={formatDate}
                      remainingEvents={remainingEvents}
                      isMember={isMember}
                      scrollToSection={scrollToSection}
                      openEventContribution={openEventContribution}
                      redirectToJoin={redirectToJoin}
                    />
                  </>
                )}
              </div>

              <div className={`${activeCitySection === "services" ? "block" : "hidden"} ${effectiveDesktopContentSection === "services" && !isAddComposerActive ? "xl:block" : "xl:hidden"}`}>
                {selectedService && (
                  <div className="mb-6 hidden xl:block">
                    <SelectedServicePanel
                      selectedService={selectedService}
                      inlineMode
                      onWheel={handleDesktopPanelWheel}
                      onClose={closeService}
                      selectedServiceImages={selectedServiceImages}
                      cityLabel={config.title?.replace("Queer ", "")}
                      serviceTypeLabels={SERVICE_TYPE_LABELS}
                      selectedServiceQuality={selectedServiceQuality}
                      selectedServiceQualityStatus={selectedServiceQualityStatus}
                      refreshEntityQuality={refreshEntityQuality}
                      canRefreshQuality={canRefreshQuality}
                      formatDate={formatDate}
                      canEditSelectedService={canEditSelectedService}
                      canDeleteSelectedService={canDeleteSelectedService}
                      serviceAdminOpen={serviceAdminOpen}
                      onToggleServiceAdmin={toggleServiceAdminEditor}
                      serviceAdminDraft={serviceAdminDraft}
                      setServiceAdminDraft={setServiceAdminDraft}
                      onSaveServiceAddressOnly={handleAdminSaveServiceAddressOnly}
                      isSavingServiceAddressOnly={isSavingServiceAddressOnly}
                      onSaveService={handleAdminSaveService}
                      isSavingServiceAdmin={isSavingServiceAdmin}
                      onDeleteService={handleAdminDeleteService}
                      isDeletingServiceAdmin={isDeletingServiceAdmin}
                      serviceTypes={SERVICE_TYPES}
                      priceTierOptions={SERVICE_PRICE_TIER_OPTIONS}
                      bookingUrl={selectedServiceBookingUrl}
                      linkUrl={selectedServiceLinkUrl}
                      canShowOnMap={canShowSelectedServiceOnMap}
                      onShowOnMap={showServiceOnMap}
                      onReportService={handleReportSelectedService}
                    />
                  </div>
                )}
                <div className={selectedService ? "xl:hidden" : ""}>
                  <CityServicesCluster
                    servicesSectionRef={servicesSectionRef}
                    servicesLoading={servicesLoading}
                    cityServiceCount={cityServiceCount}
                    visibleServiceGroups={visibleServiceGroups}
                    servicesLoadError={servicesLoadError}
                    fetchServices={fetchServices}
                    hasAnyServices={hasAnyServices}
                    openService={openService}
                    setHoveredServiceId={setHoveredServiceId}
                    serviceId={serviceId}
                    serviceTypeLabels={SERVICE_TYPE_LABELS}
                    serviceTypeStyles={SERVICE_TYPE_STYLES}
                  />
                </div>
              </div>

              <div className={`${activeCitySection === "venues" ? "block" : "hidden"} ${effectiveDesktopContentSection === "venues" && !isAddComposerActive ? "xl:block" : "xl:hidden"}`}>
                {selectedPlace && (
                  <div className="mb-6 hidden xl:block">
                    <SelectedPlacePanel
                      selectedPlace={selectedPlace}
                      inlineMode
                      onWheel={handleDesktopPanelWheel}
                      onClose={closePlace}
                      cityName={cityName}
                      typeLabels={TYPE_LABELS}
                      selectedPlaceSafetySignal={selectedPlaceSafetySignal}
                      liveVibeSummary={liveVibeSummary}
                      liveVibeHeadline={liveVibeHeadline}
                      liveVibePulse={liveVibePulse}
                      liveVibeConsensus={liveVibeConsensus}
                      liveVibeUpdatedLabel={liveVibeUpdatedLabel}
                      liveVibeTableMissing={liveVibeTableMissing}
                      handleSubmitLiveVibe={handleSubmitLiveVibe}
                      isSubmittingLiveVibe={isSubmittingLiveVibe}
                      liveVibeMyActiveSignalKey={liveVibeMyActiveSignalKey}
                      liveVibeSubmittingKey={liveVibeSubmittingKey}
                      liveVibeJustSentKey={liveVibeJustSentKey}
                      liveVibeOptions={LIVE_VIBE_OPTIONS}
                      isMember={isMember}
                      liveVibeSelectedOption={liveVibeSelectedOption}
                      isLoadingLiveVibe={isLoadingLiveVibe}
                      liveVibeError={liveVibeError}
                      liveVibeCooldownRemainingSec={liveVibeCooldownRemainingSec}
                      showLiveVibeMomentum={showLiveVibeMomentum}
                      setShowLiveVibeMomentum={setShowLiveVibeMomentum}
                      liveVibeMemberMomentum={liveVibeMemberMomentum}
                      liveVibeStreakNudge={liveVibeStreakNudge}
                      selectedPlaceQuality={selectedPlaceQuality}
                      selectedPlaceQualityStatus={selectedPlaceQualityStatus}
                      refreshEntityQuality={refreshEntityQuality}
                      canRefreshQuality={canRefreshQuality}
                      formatDate={formatDate}
                      trustedPlaceSavesCount={trustedPlaceSavesCount}
                      isAdmin={isAdmin}
                      placeAdminOpen={placeAdminOpen}
                      onTogglePlaceAdmin={togglePlaceAdminEditor}
                      placeAdminDraft={placeAdminDraft}
                      setPlaceAdminDraft={setPlaceAdminDraft}
                      handleAdminSavePlaceAddressOnly={handleAdminSavePlaceAddressOnly}
                      isSavingPlaceAddressOnly={isSavingPlaceAddressOnly}
                      handleAdminSavePlace={handleAdminSavePlace}
                      isSavingPlaceAdmin={isSavingPlaceAdmin}
                      handleAdminDeletePlace={handleAdminDeletePlace}
                      isDeletingPlaceAdmin={isDeletingPlaceAdmin}
                      placeTypes={TYPES}
                      handleReport={handleReport}
                      toggleFavorite={toggleFavorite}
                      favorites={favorites}
                      reviews={reviews}
                      canReviewSelectedPlace={canReviewSelectedPlace}
                      isSubmittingReview={isSubmittingReview}
                      onJoinToReview={handleJoinToPlaceReview}
                      rating={rating}
                      hoverRating={hoverRating}
                      setHoverRating={setHoverRating}
                      setRating={setRating}
                      safetyRating={safetyRating}
                      hoverSafetyRating={hoverSafetyRating}
                      setHoverSafetyRating={setHoverSafetyRating}
                      setSafetyRating={setSafetyRating}
                      comment={comment}
                      setComment={setComment}
                      onSubmitReview={handleSubmitPlaceReview}
                    />
                  </div>
                )}
                <div className={selectedPlace ? "xl:hidden" : ""}>
                  <CityPlacesCluster
                    placesLoading={placesLoading}
                    hasAnyPlaces={hasAnyPlaces}
                    onReadGuide={() => scrollToSection(guideSectionRef)}
                    canPublish={isMember}
                    onPublishFirstVenue={() => {
                      setAddMode(true);
                      setAddEventMode(false);
                    }}
                    onJoinToPublish={redirectToJoin}
                    visiblePlaceGroups={visiblePlaceGroups}
                    placesSectionRef={placesSectionRef}
                    setVenueGroupRef={setVenueGroupRef}
                    isFocusMode={isFocusMode}
                    selectedPlaceId={selectedPlace?.id}
                    hoveredPlaceId={hoveredPlaceId}
                    openPlace={openPlace}
                    setHoveredPlaceId={setHoveredPlaceId}
                    toggleFavorite={toggleFavorite}
                    favorites={favorites}
                    typeStyles={TYPE_STYLES}
                    typeLabels={TYPE_LABELS}
                    qualityMap={qualityMap}
                    refreshEntityQuality={refreshEntityQuality}
                    canRefreshQuality={canRefreshQuality}
                    formatDate={formatDate}
                    cityName={cityName}
                    safetySignalsByPlaceId={safetySignalsByPlaceId}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <CityDetailsLayer
        selectedPlace={selectedPlace}
        selectedEvent={selectedEvent}
        selectedService={selectedService}
        closeAllDetails={closeAllDetails}
        handleDesktopPanelWheel={handleDesktopPanelWheel}
        closeService={closeService}
        selectedServiceImages={selectedServiceImages}
        cityLabel={config.title?.replace("Queer ", "")}
        serviceTypeLabels={SERVICE_TYPE_LABELS}
        selectedServiceQuality={selectedServiceQuality}
        selectedServiceQualityStatus={selectedServiceQualityStatus}
        refreshEntityQuality={refreshEntityQuality}
        canRefreshQuality={canRefreshQuality}
        formatDate={formatDate}
          canEditSelectedService={canEditSelectedService}
          canDeleteSelectedService={canDeleteSelectedService}
          serviceAdminOpen={serviceAdminOpen}
        toggleServiceAdminEditor={toggleServiceAdminEditor}
        serviceAdminDraft={serviceAdminDraft}
        setServiceAdminDraft={setServiceAdminDraft}
        handleAdminSaveServiceAddressOnly={handleAdminSaveServiceAddressOnly}
        isSavingServiceAddressOnly={isSavingServiceAddressOnly}
        handleAdminSaveService={handleAdminSaveService}
        isSavingServiceAdmin={isSavingServiceAdmin}
        handleAdminDeleteService={handleAdminDeleteService}
        isDeletingServiceAdmin={isDeletingServiceAdmin}
        serviceTypes={SERVICE_TYPES}
        servicePriceTierOptions={SERVICE_PRICE_TIER_OPTIONS}
        selectedServiceBookingUrl={selectedServiceBookingUrl}
        selectedServiceLinkUrl={selectedServiceLinkUrl}
        canShowSelectedServiceOnMap={canShowSelectedServiceOnMap}
        showServiceOnMap={showServiceOnMap}
        handleReportSelectedService={handleReportSelectedService}
        closePlace={closePlace}
        cityName={cityName}
        typeLabels={TYPE_LABELS}
        selectedPlaceSafetySignal={selectedPlaceSafetySignal}
        liveVibeSummary={liveVibeSummary}
        liveVibeHeadline={liveVibeHeadline}
        liveVibePulse={liveVibePulse}
        liveVibeConsensus={liveVibeConsensus}
        liveVibeUpdatedLabel={liveVibeUpdatedLabel}
        liveVibeTableMissing={liveVibeTableMissing}
        handleSubmitLiveVibe={handleSubmitLiveVibe}
        isSubmittingLiveVibe={isSubmittingLiveVibe}
        liveVibeMyActiveSignalKey={liveVibeMyActiveSignalKey}
        liveVibeSubmittingKey={liveVibeSubmittingKey}
        liveVibeJustSentKey={liveVibeJustSentKey}
        liveVibeOptions={LIVE_VIBE_OPTIONS}
        isMember={isMember}
        liveVibeSelectedOption={liveVibeSelectedOption}
        isLoadingLiveVibe={isLoadingLiveVibe}
        liveVibeError={liveVibeError}
        liveVibeCooldownRemainingSec={liveVibeCooldownRemainingSec}
        showLiveVibeMomentum={showLiveVibeMomentum}
        setShowLiveVibeMomentum={setShowLiveVibeMomentum}
        liveVibeMemberMomentum={liveVibeMemberMomentum}
        liveVibeStreakNudge={liveVibeStreakNudge}
        selectedPlaceQuality={selectedPlaceQuality}
        selectedPlaceQualityStatus={selectedPlaceQualityStatus}
        trustedPlaceSavesCount={trustedPlaceSavesCount}
        isAdmin={isAdmin}
        placeAdminOpen={placeAdminOpen}
        togglePlaceAdminEditor={togglePlaceAdminEditor}
        placeAdminDraft={placeAdminDraft}
        setPlaceAdminDraft={setPlaceAdminDraft}
        handleAdminSavePlaceAddressOnly={handleAdminSavePlaceAddressOnly}
        isSavingPlaceAddressOnly={isSavingPlaceAddressOnly}
        handleAdminSavePlace={handleAdminSavePlace}
        isSavingPlaceAdmin={isSavingPlaceAdmin}
        handleAdminDeletePlace={handleAdminDeletePlace}
        isDeletingPlaceAdmin={isDeletingPlaceAdmin}
        placeTypes={TYPES}
        handleReport={handleReport}
        toggleFavorite={toggleFavorite}
        favorites={favorites}
        reviews={reviews}
        canReviewSelectedPlace={canReviewSelectedPlace}
        isSubmittingReview={isSubmittingReview}
        handleJoinToPlaceReview={handleJoinToPlaceReview}
        rating={rating}
        hoverRating={hoverRating}
        setHoverRating={setHoverRating}
        setRating={setRating}
        safetyRating={safetyRating}
        hoverSafetyRating={hoverSafetyRating}
        setHoverSafetyRating={setHoverSafetyRating}
        setSafetyRating={setSafetyRating}
        comment={comment}
        setComment={setComment}
        handleSubmitPlaceReview={handleSubmitPlaceReview}
        closeEvent={closeEvent}
        eventLiveVibeSignalKey={eventLiveVibeSignalKey}
        isSubmittingEventLiveVibe={isSubmittingEventLiveVibe}
        eventLiveVibeSubmittingKey={eventLiveVibeSubmittingKey}
        eventLiveVibeJustSentKey={eventLiveVibeJustSentKey}
        handleSubmitEventLiveVibe={handleSubmitEventLiveVibe}
        eventLiveVibeSelectedOption={eventLiveVibeSelectedOption}
        selectedEventQuality={selectedEventQuality}
        selectedEventQualityStatus={selectedEventQualityStatus}
        trustedEventSavesCount={trustedEventSavesCount}
        eventAdminOpen={eventAdminOpen}
        toggleEventAdminEditor={toggleEventAdminEditor}
        eventAdminDraft={eventAdminDraft}
        setEventAdminDraft={setEventAdminDraft}
        handleAdminSaveEventAddressOnly={handleAdminSaveEventAddressOnly}
        isSavingEventAddressOnly={isSavingEventAddressOnly}
        handleAdminSaveEvent={handleAdminSaveEvent}
        isSavingEventAdmin={isSavingEventAdmin}
        handleAdminDeleteEvent={handleAdminDeleteEvent}
        isDeletingEventAdmin={isDeletingEventAdmin}
        showEventOnMap={showEventOnMap}
        reportModalOpen={reportModalOpen}
        reportDraft={reportDraft}
        setReportDraft={setReportDraft}
        reportReasons={REPORT_REASONS}
        closeReportModal={closeReportModal}
        submitReport={submitReport}
        qualityModal={qualityModal}
        setQualityModal={setQualityModal}
        trustActions={TRUST_ACTIONS}
        closeQualityModal={closeQualityModal}
        submitQualityModal={submitQualityModal}
      />
    </main>
  );
}








