"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cityCoreConfig as cityConfig } from "@/lib/cityCore";
import { useAuth } from "@/lib/auth";
import { cityPath, citySelectionPath } from "@/lib/cityRouting";
import { usePlaces } from "@/lib/usePlaces";
import { supabase } from "@/lib/supabase";
import { mergeSeedEventsAsync, mergeSeedPlacesAsync } from "@/lib/seedMerge";
import { fetchPlacesQueryWithFallback } from "@/lib/placesDataApi";
import { fetchServicesQuery } from "@/lib/servicesDataApi";
import { resolveAdminAccess } from "@/lib/adminAccess";
import {
  createContentSubmission,
  listContentSubmissions,
  publishContentSubmission,
  updateContentSubmissionStatus,
} from "@/lib/contentSubmissions";
import {
  blockItem,
  getBlockedItems,
  getReports,
  removeReport,
  saveReports,
  syncBlockedItemsFromCloud,
  syncModerationFromCloud,
  unblockItem,
} from "@/lib/moderation";
import { upsertQuality } from "@/lib/quality";
import { useActionToast } from "@/lib/useActionToast";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { captureOperationalError } from "@/lib/monitoring";
import {
  buildVibeDualWriteFields,
  inferVibeTagsFromLegacyVibe,
  isMissingVibeTagsColumnError,
  normalizeVibeTags,
} from "@/lib/vibeTaxonomy";
import ActionToast from "@/components/ui/ActionToast";
import DateInput from "@/components/ui/DateInput";
import PageOpeningState from "@/components/ui/PageOpeningState";
import VibeTagPicker from "@/components/ui/VibeTagPicker";
import { SERVICE_TYPES as CITY_SERVICE_TYPES } from "@/features/city/cityPageConstants";
import { buildPublishedEntityIndexNowUrls } from "@/lib/seo/indexNow";
import { notifyIndexNowUrls } from "@/lib/seo/indexNowClient";

const STORAGE_KEY = "qa_contribute_requests";

const initialRequests = [
  {
    id: "seed-1",
    type: "Correction",
    city: "Berlin",
    title: "Update opening hours",
    detail: "This venue now opens later on Sundays. Worth updating before weekend traffic rises.",
    createdAt: "2026-04-07T09:00:00.000Z",
  },
];

const PLACE_TYPES = [
  { value: "club", label: "Club" },
  { value: "bar", label: "Bar" },
  { value: "restaurant", label: "Restaurant" },
  { value: "sauna", label: "Sauna" },
  { value: "cruise_club", label: "Cruise Club" },
  { value: "cruising_area", label: "Cruising Area" },
  { value: "cafe", label: "Cafe" },
  { value: "hotel", label: "Hotel" },
];

const SERVICE_PRICE_TIERS = [
  { value: "", label: "Price tier (optional)" },
  { value: "$", label: "$ Budget" },
  { value: "$$", label: "$$ Mid" },
  { value: "$$$", label: "$$$ Premium" },
  { value: "$$$$", label: "$$$$ Luxury" },
];

const SERVICE_MEDIA_BUCKET = "service-media";
const SERVICE_MAX_IMAGES = 8;
const SERVICE_MAX_FILE_BYTES = 8 * 1024 * 1024;
const SERVICE_ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function createEmptyServiceForm() {
  return {
    name: "",
    city: "",
    type: "massage",
    provider_name: "",
    contact: "",
    booking_link: "",
    image_urls: [],
    address: "",
    description: "",
    hours: "",
    link: "",
    price_tier: "",
    vibe: "",
    vibe_tags: [],
    source: "",
    lastChecked: "",
  };
}

function timeAgo(value) {
  const diffHours = Math.round((new Date() - new Date(value)) / 3600000);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function Field({ value, onChange, placeholder, area = false }) {
  if (area) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-28 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
      />
    );
  }

  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
    />
  );
}

function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

function formatCityLabel(city) {
  return String(city || "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeLooseSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeServiceImageUrls(input, max = SERVICE_MAX_IMAGES) {
  const urls = Array.isArray(input) ? input : [];
  const out = [];
  const seen = new Set();

  for (const rawValue of urls) {
    const value = String(rawValue || "").trim();
    if (!value) continue;
    if (!/^https?:\/\//i.test(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= max) break;
  }

  return out;
}

function resolveCitySlugFromQueryValue(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) return "";
  if (cityConfig[normalized]) return normalized;

  return (
    Object.keys(cityConfig).find((key) => {
      const titleNormalized = String(cityConfig[key]?.title || "")
        .replace(/^queer\s+/i, "")
        .trim()
        .toLowerCase()
        .replace(/[-\s]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
      return titleNormalized === normalized;
    }) || ""
  );
}

export default function ContributePage() {
  const router = useRouter();
  const serviceFormPanelRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const { isMember, isLoading: isAuthLoading, user, memberName, session } = useAuth();
  const [selectedCity, setSelectedCity] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [addEventMode, setAddEventMode] = useState(false);
  const [addServiceMode, setAddServiceMode] = useState(false);
  const [atlasNotice, setAtlasNotice] = useState("");
  const [placeNotice, setPlaceNotice] = useState("");
  const [eventNotice, setEventNotice] = useState("");
  const [serviceNotice, setServiceNotice] = useState("");
  const [isSavingPlace, setIsSavingPlace] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isUploadingServiceImages, setIsUploadingServiceImages] = useState(false);
  const [serviceImageUrlDraft, setServiceImageUrlDraft] = useState("");
  const [shouldScrollToServiceForm, setShouldScrollToServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState("");
  const [isLoadingServiceDraft, setIsLoadingServiceDraft] = useState(false);
  const { addPlace } = usePlaces();
  const [requests, setRequests] = useState(initialRequests);
  const [reports, setReports] = useState([]);
  const [blockedItems, setBlockedItems] = useState([]);
  const [reportFilter, setReportFilter] = useState("open");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { toast, showToast } = useActionToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTrustedContributor, setIsTrustedContributor] = useState(false);
  const [moderationSyncNotice, setModerationSyncNotice] = useState("");
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isLoadingPendingSubmissions, setIsLoadingPendingSubmissions] = useState(false);
  const [isProcessingSubmissionId, setIsProcessingSubmissionId] = useState("");
  const [submissionSyncNotice, setSubmissionSyncNotice] = useState("");
  const [qaSnapshot, setQaSnapshot] = useState({
    places: [],
    events: [],
    services: [],
    loading: false,
    error: "",
  });
  const [placeForm, setPlaceForm] = useState({
    name: "",
    city: "",
    type: "club",
    address: "",
    description: "",
    hours: "",
    link: "",
    vibe: "",
    vibe_tags: [],
    source: "",
    lastChecked: "",
  });
  const [eventForm, setEventForm] = useState({
    name: "",
    city: "",
    address: "",
    date: "",
    description: "",
    link: "",
    ticket_url: "",
    vibe: "",
    vibe_tags: [],
    source: "",
    lastChecked: "",
  });
  const [serviceForm, setServiceForm] = useState(createEmptyServiceForm);
  const [requestForm, setRequestForm] = useState({
    type: "Correction",
    city: "",
    title: "",
    detail: "",
  });
  const canPublishDirect = isAdmin || isTrustedContributor;
  const notifyPublishedEntity = useCallback(
    async (entityType, entity, submission = {}, source = "contribute-publish") => {
      const urls = buildPublishedEntityIndexNowUrls(entityType, entity, submission);
      if (urls.length === 0) return;

      let accessToken = String(session?.access_token || "");
      if (!accessToken) {
        const { data } = await supabase.auth.getSession();
        accessToken = String(data?.session?.access_token || "");
      }
      await notifyIndexNowUrls({ urls, accessToken, source });
    },
    [session?.access_token]
  );

  useEffect(() => {
    if (!isMember) return;
    if (typeof window === "undefined") return;

    const currentParams = new URLSearchParams(window.location.search);
    const queryCity = currentParams.get("city");
    const queryEntity = String(currentParams.get("entity") || "").trim().toLowerCase();
    const queryFocus = String(currentParams.get("focus") || "").trim().toLowerCase();
    const queryServiceId = String(currentParams.get("serviceId") || "").trim();
    const citySlug = resolveCitySlugFromQueryValue(queryCity);

    if (!citySlug && !queryEntity && !queryServiceId) return;

    if (citySlug) {
      const mappedCity = cityConfig[citySlug]?.title?.replace("Queer ", "") || "";
      queueMicrotask(() => {
        setSelectedCity(citySlug);
        setPlaceForm((current) => ({ ...current, city: mappedCity }));
        setEventForm((current) => ({ ...current, city: mappedCity }));
        setServiceForm((current) => ({ ...current, city: mappedCity }));
        setRequestForm((current) => ({ ...current, city: mappedCity }));
      });
    }

    if (queryEntity === "service") {
      queueMicrotask(() => {
        setAddServiceMode(true);
        setAddMode(false);
        setAddEventMode(false);
        setShouldScrollToServiceForm(true);
        if (queryServiceId) {
          setEditingServiceId(queryServiceId);
        }
      });
    } else if (queryEntity === "event") {
      queueMicrotask(() => {
        setAddEventMode(true);
        setAddMode(false);
        setAddServiceMode(false);
      });
    } else if (queryEntity === "place") {
      queueMicrotask(() => {
        setAddMode(true);
        setAddEventMode(false);
        setAddServiceMode(false);
      });
    }
    if (queryFocus === "service-form") {
      queueMicrotask(() => {
        setShouldScrollToServiceForm(true);
        if (queryServiceId) {
          setEditingServiceId(queryServiceId);
        }
      });
    }

    const nextParams = new URLSearchParams(currentParams.toString());
    nextParams.delete("city");
    nextParams.delete("entity");
    nextParams.delete("focus");
    nextParams.delete("serviceId");
    const nextUrl = nextParams.toString() ? `/contribute?${nextParams.toString()}` : "/contribute";
    router.replace(nextUrl);
  }, [isMember, router]);

  useEffect(() => {
    if (!shouldScrollToServiceForm || !addServiceMode) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        serviceFormPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setShouldScrollToServiceForm(false);
      });
    });
  }, [addServiceMode, shouldScrollToServiceForm]);

  useEffect(() => {
    if (!isMember || !editingServiceId) return;

    let active = true;
    queueMicrotask(async () => {
      setIsLoadingServiceDraft(true);
      setServiceNotice("");
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, name, city, type, provider_name, contact, booking_link, image_urls, location, description, hours, link, price_tier, vibe, vibe_tags, source, lastChecked, created_by")
          .eq("id", editingServiceId)
          .maybeSingle();

        if (!active) return;

        if (error) {
          if (isMissingTableError(error)) {
            setServiceNotice("Services table missing. Run latest Supabase services SQL.");
          } else {
            setServiceNotice(error.message || "Could not load service draft.");
          }
          return;
        }

        if (!data) {
          setServiceNotice("Service not found.");
          return;
        }

        const ownerId = String(data.created_by || "");
        const currentUserId = String(user?.id || "");
        if (!isAdmin && (!ownerId || ownerId !== currentUserId)) {
          setServiceNotice("Only the service owner or admin can edit this listing.");
          return;
        }

        const mappedSlug = resolveCitySlugFromQueryValue(data.city);
        if (mappedSlug) {
          setSelectedCity(mappedSlug);
        }

        setServiceForm({
          name: String(data.name || ""),
          city: String(data.city || ""),
          type: String(data.type || "massage"),
          provider_name: String(data.provider_name || ""),
          contact: String(data.contact || ""),
          booking_link: String(data.booking_link || ""),
          image_urls: normalizeServiceImageUrls(data.image_urls),
          address: String(data.location || ""),
          description: String(data.description || ""),
          hours: String(data.hours || ""),
          link: String(data.link || ""),
          price_tier: String(data.price_tier || ""),
          vibe: String(data.vibe || ""),
          vibe_tags: normalizeVibeTags(data.vibe_tags, { max: 3 }),
          source: String(data.source || ""),
          lastChecked: String(data.lastChecked || ""),
        });
        setAddServiceMode(true);
        setAddMode(false);
        setAddEventMode(false);
        setShouldScrollToServiceForm(true);
      } finally {
        if (active) {
          setIsLoadingServiceDraft(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [editingServiceId, isAdmin, isMember, user?.id]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isMember) {
      writeLocalValue("qa_redirect", "/contribute");
      writeLocalValue("qa_post_login_target", "/contribute");
      queueMicrotask(() => {
        setIsReady(true);
      });
      return;
    }

    const parsed = readLocalJson(STORAGE_KEY, initialRequests);
    if (Array.isArray(parsed)) {
      queueMicrotask(() => {
        setRequests(parsed);
      });
    }

    queueMicrotask(async () => {
      try {
        setReports(getReports());
        setBlockedItems(getBlockedItems());

        let adminAccess = false;
        let trustedAccess = false;
        const notices = [];
        const adminRes = await resolveAdminAccess({
          email: user?.email,
        });
        adminAccess = Boolean(adminRes?.isAdmin);
        if (adminAccess) {
          trustedAccess = true;
        } else if (user?.id) {
          const profileRes = await supabase
            .from("member_profiles")
            .select("trusted_contributor")
            .eq("user_id", user.id)
            .maybeSingle();
          if (profileRes.error && isMissingTableError(profileRes.error)) {
            notices.push("Member profiles are missing trusted contributor column. Run the latest Supabase SQL scripts.");
          }
          trustedAccess = Boolean(profileRes?.data?.trusted_contributor);
        }
        setIsAdmin(adminAccess);
        setIsTrustedContributor(trustedAccess);
        if (adminRes?.error && isMissingTableError(adminRes.error)) {
          notices.push("Admin table is missing. Run the latest Supabase SQL scripts.");
        }

        const synced = adminAccess
          ? await syncModerationFromCloud()
          : await syncBlockedItemsFromCloud();

        if (adminAccess) {
          setReports(synced.reports || []);
        } else {
          setReports([]);
        }
        setBlockedItems(synced.blockedItems || []);

        if (synced.warning) {
          notices.push(synced.warning);
        }

        setModerationSyncNotice(notices.join(" "));
      } catch {
        setIsAdmin(false);
        setIsTrustedContributor(false);
        setReports([]);
        setBlockedItems(getBlockedItems());
        setModerationSyncNotice("Could not sync moderation right now.");
      } finally {
        setIsReady(true);
      }
    });
  }, [isAuthLoading, isMember, user?.email, user?.id]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(STORAGE_KEY, requests);
  }, [isReady, isMember, requests]);

  useEffect(() => {
    if (!isMember || !isAdmin) {
      queueMicrotask(() => {
        setQaSnapshot({ places: [], events: [], services: [], loading: false, error: "" });
      });
      return;
    }

    let active = true;

    queueMicrotask(async () => {
      try {
        setQaSnapshot((current) => ({ ...current, loading: true, error: "" }));
        const [placesRes, { data: eventsData, error: eventsError }, servicesRes] =
          await Promise.all([
            fetchPlacesQueryWithFallback({
              select: "id, name, city, type, vibe, vibe_tags, description, hours, link, lat, lng, source, lastChecked, verified",
            }),
            supabase
              .from("events")
              .select("id, name, city, vibe, vibe_tags, description, date, link, lat, lng, source, lastChecked, verified"),
            fetchServicesQuery({
              select:
                "id, name, city, type, vibe, vibe_tags, description, hours, link, lat, lng, source, lastChecked, verified",
            }),
          ]);
        const placesData = placesRes?.data || [];
        const placesError = placesRes?.error || null;
        const servicesData = servicesRes?.data || [];
        const servicesError = servicesRes?.error || null;

        if (!active) return;

        if (placesError || eventsError || servicesError) {
          setQaSnapshot({
            places: [],
            events: [],
            services: [],
            loading: false,
            error: "Could not load complete QA snapshot from Supabase.",
          });
          return;
        }

        setQaSnapshot({
          places: await mergeSeedPlacesAsync(placesData || []),
          events: await mergeSeedEventsAsync(eventsData || []),
          services: servicesData || [],
          loading: false,
          error: "",
        });
      } catch {
        if (!active) return;
        setQaSnapshot({
          places: [],
          events: [],
          services: [],
          loading: false,
          error: "Network issue while loading QA snapshot.",
        });
      }
    });

    return () => {
      active = false;
    };
  }, [isAdmin, isMember]);

  const refreshPendingSubmissions = useCallback(async () => {
    if (!isAdmin) {
      setPendingSubmissions([]);
      setSubmissionSyncNotice("");
      return;
    }

    setIsLoadingPendingSubmissions(true);
    const result = await listContentSubmissions({ status: "pending", limit: 120 });
    if (result.tableMissing) {
      setPendingSubmissions([]);
      setSubmissionSyncNotice("Submission queue is not configured yet. Run supabase/content-submissions-v1.sql.");
      setIsLoadingPendingSubmissions(false);
      return;
    }
    if (result.error) {
      setPendingSubmissions([]);
      setSubmissionSyncNotice("Could not load pending submissions right now.");
      setIsLoadingPendingSubmissions(false);
      return;
    }
    setPendingSubmissions(result.data || []);
    setSubmissionSyncNotice("");
    setIsLoadingPendingSubmissions(false);
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      queueMicrotask(() => {
        setPendingSubmissions([]);
        setSubmissionSyncNotice("");
      });
      return;
    }
    queueMicrotask(() => {
      refreshPendingSubmissions();
    });
  }, [isAdmin, refreshPendingSubmissions]);

  if (!isReady || !isMember) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <PageOpeningState
          title="Opening contribution hub..."
          subtitle="Syncing moderation, requests, and atlas contribution tools."
          tone="emerald"
        />
      </main>
    );
  }

  const cityTitle = selectedCity
    ? cityConfig[selectedCity]?.title?.replace("Queer ", "") || "Selected city"
    : "Any city";

  const geocodeAddress = async (address, cityName) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      throw new Error("Map token is missing.");
    }

    const query = `${address} ${cityName}`.trim();
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`
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
  };

  const submitRequest = (event) => {
    event.preventDefault();

    if (!requestForm.title || !requestForm.detail) {
      showToast("Add title and detail before saving request.", { tone: "warn", duration: 2400 });
      return;
    }

    setRequests((current) => [
      {
        id: `request-${Date.now()}`,
        ...requestForm,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    setRequestForm({
      type: "Correction",
      city: selectedCity ? cityConfig[selectedCity]?.title?.replace("Queer ", "") || "" : "",
      title: "",
      detail: "",
    });
    setShowRequestForm(false);
    showToast("Request saved in quality control.", { tone: "ok", duration: 2400 });
  };

  const submitPlaceDirect = async () => {
    if (!isMember || !user?.id) {
      setPlaceNotice("Join as member to contribute places.");
      showToast("Join as member to contribute places.", { tone: "warn", duration: 2200 });
      return;
    }

    if (!placeForm.name || !placeForm.address || !placeForm.description || !placeForm.hours || !(selectedCity || placeForm.city)) {
      setPlaceNotice("Fill in city, place name, address, description and opening hours.");
      showToast("Place not saved. Required fields are missing.", { tone: "warn", duration: 2400 });
      return;
    }

    setIsSavingPlace(true);
    setPlaceNotice("");

    try {
      const cityName =
        (selectedCity ? cityConfig[selectedCity]?.title?.replace("Queer ", "") : "") ||
        placeForm.city.trim();
      const coords = await geocodeAddress(placeForm.address, cityName);

      if (!coords) {
        setPlaceNotice("Address not found. Try a more specific address.");
        return;
      }

      const placePayload = {
        name: placeForm.name,
        type: placeForm.type,
        description: placeForm.description,
        hours: placeForm.hours,
        link: placeForm.link || null,
        vibe: placeForm.vibe,
        vibe_tags: normalizeVibeTags(placeForm.vibe_tags, { max: 3 }),
        lat: coords.lat,
        lng: coords.lng,
        city: cityName,
        location: placeForm.address,
      };

      if (!canPublishDirect) {
        const submissionRes = await createContentSubmission({
          entityType: "place",
          actionType: "create",
          city: cityName,
          title: placeForm.name.trim(),
          payload: placePayload,
          user: {
            id: user?.id,
            email: user?.email,
            memberName,
          },
          isTrustedContributor: false,
        });

        if (submissionRes.tableMissing) {
          setPlaceNotice("Moderation queue missing. Run supabase/content-submissions-v1.sql.");
          showToast("Moderation queue is not configured yet.", { tone: "warn", duration: 3000 });
          return;
        }
        if (submissionRes.error) {
          setPlaceNotice(submissionRes.error.message || "Could not submit place for review.");
          showToast(submissionRes.error.message || "Could not submit place for review.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        setPlaceForm({
          name: "",
          city: "",
          type: "club",
          address: "",
          description: "",
          hours: "",
          link: "",
          vibe: "",
          vibe_tags: [],
          source: "",
          lastChecked: "",
        });
        setAddMode(false);
        setAtlasNotice("Place submitted for admin review.");
        showToast("Place submitted. Waiting for admin approval.", { tone: "info", duration: 2500 });
        return;
      }

      const createdPlace = await addPlace({
        ...placePayload,
      });

      if (createdPlace?.id) {
        upsertQuality({
          targetType: "place",
          targetId: createdPlace.id,
          source: placeForm.source,
          lastChecked: placeForm.lastChecked,
          verified: Boolean(placeForm.source && placeForm.lastChecked),
        });
        void notifyPublishedEntity("place", createdPlace);
      }

      setPlaceForm({
        name: "",
        city: "",
        type: "club",
        address: "",
        description: "",
        hours: "",
        link: "",
        vibe: "",
        vibe_tags: [],
        source: "",
        lastChecked: "",
      });
      setAddMode(false);
      setAtlasNotice("Place added to atlas.");
      showToast("Place saved to atlas.", { tone: "ok", duration: 2400 });
    } catch (error) {
      setPlaceNotice(error?.message || "Could not save place right now.");
      showToast(error?.message || "Could not save place right now.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingPlace(false);
    }
  };

  const submitEventDirect = async () => {
    if (!isMember || !user?.id) {
      setEventNotice("Join as member to contribute events.");
      showToast("Join as member to contribute events.", { tone: "warn", duration: 2200 });
      return;
    }

    if (!eventForm.name || !eventForm.address || !eventForm.date || !(selectedCity || eventForm.city)) {
      setEventNotice("Fill in city, event name, address and date.");
      showToast("Event not saved. Required fields are missing.", { tone: "warn", duration: 2400 });
      return;
    }

    setIsSavingEvent(true);
    setEventNotice("");

    try {
      const cityName =
        (selectedCity ? cityConfig[selectedCity]?.title?.replace("Queer ", "") : "") ||
        eventForm.city.trim();
      const coords = await geocodeAddress(eventForm.address, cityName);

      if (!coords) {
        setEventNotice("Address not found. Try a more specific address.");
        return;
      }

      const startDate = String(eventForm.date || "").trim();
      const insertBasePayload = {
        name: eventForm.name,
        city: cityName,
        lat: coords.lat,
        lng: coords.lng,
        date: startDate,
        start_date: startDate,
        end_date: startDate,
        location: eventForm.address,
        ...buildVibeDualWriteFields({
          vibe: eventForm.vibe,
          vibeTags: normalizeVibeTags(eventForm.vibe_tags, { max: 3 }),
        }),
        description: eventForm.description,
        link: eventForm.link,
        ticket_url: String(eventForm.ticket_url || "").trim() || null,
      };

      if (!canPublishDirect) {
        const submissionRes = await createContentSubmission({
          entityType: "event",
          actionType: "create",
          city: cityName,
          title: eventForm.name.trim(),
          payload: insertBasePayload,
          user: {
            id: user?.id,
            email: user?.email,
            memberName,
          },
          isTrustedContributor: false,
        });

        if (submissionRes.tableMissing) {
          setEventNotice("Moderation queue missing. Run supabase/content-submissions-v1.sql.");
          showToast("Moderation queue is not configured yet.", { tone: "warn", duration: 3000 });
          return;
        }
        if (submissionRes.error) {
          setEventNotice(submissionRes.error.message || "Could not submit event for review.");
          showToast(submissionRes.error.message || "Could not submit event for review.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        setEventForm({
          name: "",
          city: "",
          address: "",
          date: "",
          description: "",
          link: "",
          ticket_url: "",
          vibe: "",
          vibe_tags: [],
          source: "",
          lastChecked: "",
        });
        setAddEventMode(false);
        setAtlasNotice("Event submitted for admin review.");
        showToast("Event submitted. Waiting for admin approval.", { tone: "info", duration: 2500 });
        return;
      }

      let insertResult = await supabase
        .from("events")
        .insert([insertBasePayload])
        .select("*")
        .single();

      if (insertResult.error) {
        const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
        const missingDateRange =
          (errorText.includes("start_date") || errorText.includes("end_date")) &&
          (errorText.includes("column") || errorText.includes("schema cache"));
        const missingVibe =
          /\bvibe\b/.test(errorText) &&
          (errorText.includes("column") || errorText.includes("schema cache"));
        const missingVibeTags = isMissingVibeTagsColumnError(insertResult.error);
        const missingLocation =
          errorText.includes("location") &&
          (errorText.includes("column") || errorText.includes("schema cache"));
        const missingTicketUrl =
          errorText.includes("ticket_url") &&
          (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingDateRange || missingVibe || missingVibeTags || missingLocation || missingTicketUrl) {
          const legacyPayload = {
            name: eventForm.name,
            city: cityName,
            lat: coords.lat,
            lng: coords.lng,
            date: startDate,
            description: eventForm.description,
            link: eventForm.link,
          };
          if (!missingTicketUrl) {
            legacyPayload.ticket_url = String(eventForm.ticket_url || "").trim() || null;
          }
          if (!missingVibe) {
            legacyPayload.vibe = eventForm.vibe.trim() || null;
          }
          if (!missingVibeTags) {
            legacyPayload.vibe_tags = buildVibeDualWriteFields({
              vibe: eventForm.vibe,
              vibeTags: normalizeVibeTags(eventForm.vibe_tags, { max: 3 }),
            }).vibe_tags;
          }
          insertResult = await supabase
            .from("events")
            .insert([legacyPayload])
            .select("*")
            .single();
        }
      }

      const { data: createdEvent, error } = insertResult;

      if (error) {
        captureOperationalError("save_event_fail", error, {
          city: String(cityName || ""),
          flow: "contribute_add_event",
          hasDate: Boolean(eventForm.date),
        });
        setEventNotice(error.message || "Could not save event right now.");
        showToast(error.message || "Could not save event right now.", { tone: "warn", duration: 2600 });
        return;
      }

      if (createdEvent?.id) {
        upsertQuality({
          targetType: "event",
          targetId: createdEvent.id,
          source: eventForm.source,
          lastChecked: eventForm.lastChecked,
          verified: Boolean(eventForm.source && eventForm.lastChecked),
        });
        void notifyPublishedEntity("event", createdEvent);
      }

      setEventForm({
        name: "",
        city: "",
        address: "",
        date: "",
        description: "",
        link: "",
        ticket_url: "",
        vibe: "",
        vibe_tags: [],
        source: "",
        lastChecked: "",
      });
      setAddEventMode(false);
      setAtlasNotice("Event added to atlas.");
      showToast("Event saved to atlas.", { tone: "ok", duration: 2400 });
    } catch (error) {
      captureOperationalError("save_event_fail", error, {
        city: String(
          (selectedCity ? cityConfig[selectedCity]?.title?.replace("Queer ", "") : "") ||
            eventForm.city ||
            ""
        ),
        flow: "contribute_add_event_catch",
        hasDate: Boolean(eventForm.date),
      });
      setEventNotice(error?.message || "Could not save event right now.");
      showToast(error?.message || "Could not save event right now.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingEvent(false);
    }
  };

  const submitServiceDirect = async () => {
    if (!isMember || !user?.id) {
      setServiceNotice("Join as member to publish services.");
      showToast("Join as member to publish services.", { tone: "warn", duration: 2200 });
      return;
    }

    if (!serviceForm.name || !serviceForm.address || !serviceForm.description || !(selectedCity || serviceForm.city)) {
      setServiceNotice("Fill in city, service name, address and description.");
      showToast("Service not saved. Required fields are missing.", { tone: "warn", duration: 2400 });
      return;
    }

    setIsSavingService(true);
    setServiceNotice("");

    try {
      const cityName =
        (selectedCity ? cityConfig[selectedCity]?.title?.replace("Queer ", "") : "") ||
        serviceForm.city.trim();
      const coords = await geocodeAddress(serviceForm.address, cityName);

      if (!coords) {
        setServiceNotice("Address not found. Try a more specific address.");
        return;
      }

      const vibeFields = buildVibeDualWriteFields({
        vibe: serviceForm.vibe,
        vibeTags: normalizeVibeTags(serviceForm.vibe_tags, { max: 3 }),
      });
      const announcerName = String(memberName || user?.email || "Member").trim();
      const isEditing = Boolean(editingServiceId);
      let savePayload = {
        name: serviceForm.name,
        city: cityName,
        type: serviceForm.type,
        provider_name: announcerName || null,
        contact: serviceForm.contact || null,
        booking_link: serviceForm.booking_link || null,
        description: serviceForm.description,
        hours: serviceForm.hours || null,
        link: serviceForm.link || null,
        image_urls: normalizeServiceImageUrls(serviceForm.image_urls),
        price_tier: serviceForm.price_tier || null,
        location: serviceForm.address,
        lat: coords.lat,
        lng: coords.lng,
        source: serviceForm.source || null,
        lastChecked: serviceForm.lastChecked || null,
        verified: Boolean(serviceForm.source && serviceForm.lastChecked),
        ...vibeFields,
      };
      if (!isEditing) {
        savePayload.created_by = user.id;
      }

      if (!canPublishDirect && !isEditing) {
        const submissionRes = await createContentSubmission({
          entityType: "service",
          actionType: "create",
          city: cityName,
          title: serviceForm.name.trim(),
          payload: savePayload,
          user: {
            id: user?.id,
            email: user?.email,
            memberName,
          },
          isTrustedContributor: false,
        });

        if (submissionRes.tableMissing) {
          setServiceNotice("Moderation queue missing. Run supabase/content-submissions-v1.sql.");
          showToast("Moderation queue is not configured yet.", { tone: "warn", duration: 3000 });
          return;
        }
        if (submissionRes.error) {
          setServiceNotice(submissionRes.error.message || "Could not submit service for review.");
          showToast(submissionRes.error.message || "Could not submit service for review.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        const mappedCity = cityConfig[selectedCity]?.title?.replace("Queer ", "") || "";
        setServiceForm({ ...createEmptyServiceForm(), city: mappedCity });
        setServiceImageUrlDraft("");
        setEditingServiceId("");
        setAddServiceMode(false);
        setAtlasNotice("Service submitted for admin review.");
        showToast("Service submitted. Waiting for admin approval.", { tone: "info", duration: 2500 });
        return;
      }

      let saveResult = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        saveResult = isEditing
          ? await supabase
            .from("services")
            .update(savePayload)
            .eq("id", editingServiceId)
            .select("*")
            .single()
          : await supabase.from("services").insert([savePayload]).select("*").single();
        if (!saveResult.error) break;

        const errorText = `${saveResult.error?.code || ""} ${saveResult.error?.message || ""}`.toLowerCase();
        if (errorText.includes("relation") && errorText.includes("does not exist")) {
          setServiceNotice("Services table is missing. Run the latest Supabase services SQL script.");
          showToast("Services table is missing in Supabase.", { tone: "warn", duration: 3000 });
          return;
        }

        const missingVibeTags = isMissingVibeTagsColumnError(saveResult.error);
        const missingColumnMatch = errorText.match(/column\s+["']?([a-z0-9_]+)["']?\s+does not exist/i);
        const missingColumn = missingVibeTags ? "vibe_tags" : String(missingColumnMatch?.[1] || "");
        if (!missingColumn || !(missingColumn in savePayload)) {
          break;
        }
        const nextPayload = { ...savePayload };
        delete nextPayload[missingColumn];
        savePayload = nextPayload;
      }

      const { data: createdService, error } = saveResult || {};
      if (error) {
        setServiceNotice(error.message || "Could not save service right now.");
        showToast(error.message || "Could not save service right now.", { tone: "warn", duration: 2600 });
        return;
      }

      if (createdService?.id) {
        upsertQuality({
          targetType: "service",
          targetId: createdService.id,
          source: serviceForm.source,
          lastChecked: serviceForm.lastChecked,
          verified: Boolean(serviceForm.source && serviceForm.lastChecked),
        });
        void notifyPublishedEntity("service", createdService);
      }

      const mappedCity = cityConfig[selectedCity]?.title?.replace("Queer ", "") || "";
      setServiceForm({ ...createEmptyServiceForm(), city: mappedCity });
      setServiceImageUrlDraft("");
      setEditingServiceId("");
      setAddServiceMode(false);
      setAtlasNotice(isEditing ? "Service updated." : "Service added to atlas.");
      showToast(isEditing ? "Service updated." : "Service saved to atlas.", { tone: "ok", duration: 2400 });
    } catch (error) {
      setServiceNotice(error?.message || "Could not save service right now.");
      showToast(error?.message || "Could not save service right now.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingService(false);
    }
  };

  const addServiceImageFromUrl = () => {
    const rawUrl = String(serviceImageUrlDraft || "").trim();
    if (!rawUrl) return;

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      setServiceNotice("Image URL is invalid.");
      showToast("Use a valid image URL (https://...).", { tone: "warn", duration: 2200 });
      return;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      setServiceNotice("Only http/https image URLs are supported.");
      showToast("Only http/https image URLs are supported.", { tone: "warn", duration: 2200 });
      return;
    }

    const nextUrl = parsed.toString();
    setServiceForm((current) => ({
      ...current,
      image_urls: normalizeServiceImageUrls([...(current.image_urls || []), nextUrl]),
    }));
    setServiceImageUrlDraft("");
    setServiceNotice("");
  };

  const removeServiceImage = (targetUrl) => {
    setServiceForm((current) => ({
      ...current,
      image_urls: normalizeServiceImageUrls(
        (current.image_urls || []).filter((entry) => String(entry) !== String(targetUrl))
      ),
    }));
  };

  const handleServiceImageUpload = async (event) => {
    if (!isMember || !user?.id) {
      setServiceNotice("Sign in as member to upload images.");
      showToast("Sign in as member to upload images.", { tone: "warn", duration: 2200 });
      if (event?.target) event.target.value = "";
      return;
    }

    const files = Array.from(event?.target?.files || []);
    if (files.length === 0) return;

    const existingUrls = normalizeServiceImageUrls(serviceForm.image_urls);
    const slotsLeft = Math.max(0, SERVICE_MAX_IMAGES - existingUrls.length);
    if (slotsLeft === 0) {
      setServiceNotice(`Maximum ${SERVICE_MAX_IMAGES} images per service.`);
      showToast(`Maximum ${SERVICE_MAX_IMAGES} images per service.`, { tone: "info", duration: 2200 });
      if (event?.target) event.target.value = "";
      return;
    }

    setIsUploadingServiceImages(true);
    setServiceNotice("");

    try {
      const uploadBatch = files.slice(0, slotsLeft);
      const uploadedUrls = [];
      const uploadIssues = [];
      const safeCity = normalizeLooseSlug(
        serviceForm.city ||
          cityConfig[selectedCity]?.title?.replace("Queer ", "") ||
          selectedCity ||
          "global"
      );
      const safeUserId = normalizeLooseSlug(user?.id || "member");

      for (const file of uploadBatch) {
        const mimeType = String(file?.type || "").toLowerCase();
        if (!SERVICE_ALLOWED_IMAGE_TYPES.has(mimeType)) {
          uploadIssues.push(`${file.name}: unsupported format`);
          continue;
        }
        if (Number(file?.size || 0) > SERVICE_MAX_FILE_BYTES) {
          uploadIssues.push(`${file.name}: file too large (max 8MB)`);
          continue;
        }

        const extension = mimeType.includes("png")
          ? "png"
          : mimeType.includes("webp")
            ? "webp"
            : "jpg";
        const safeFileName = normalizeLooseSlug(file.name || "service-image");
        const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const objectPath = `${safeCity}/${safeUserId}/${safeFileName || "service-image"}-${uniquePart}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(SERVICE_MEDIA_BUCKET)
          .upload(objectPath, file, { cacheControl: "3600", upsert: false, contentType: mimeType });

        if (uploadError) {
          const errorText = `${uploadError?.code || ""} ${uploadError?.message || ""}`.toLowerCase();
          if (errorText.includes("bucket") || errorText.includes("not found")) {
            setServiceNotice("Image upload bucket missing. Run latest services SQL to create service-media bucket.");
          } else if (errorText.includes("row-level security")) {
            setServiceNotice("Image upload policy blocked this upload. Check storage policies for service-media.");
          } else {
            uploadIssues.push(`${file.name}: ${uploadError?.message || "upload failed"}`);
          }
          continue;
        }

        const { data: publicData } = supabase.storage.from(SERVICE_MEDIA_BUCKET).getPublicUrl(objectPath);
        const publicUrl = String(publicData?.publicUrl || "").trim();
        if (!publicUrl) {
          uploadIssues.push(`${file.name}: missing public URL`);
          continue;
        }
        uploadedUrls.push(publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setServiceForm((current) => ({
          ...current,
          image_urls: normalizeServiceImageUrls([...(current.image_urls || []), ...uploadedUrls]),
        }));
        showToast(`${uploadedUrls.length} service image${uploadedUrls.length === 1 ? "" : "s"} uploaded.`, {
          tone: "ok",
          duration: 2200,
        });
      }

      if (uploadIssues.length > 0) {
        setServiceNotice(uploadIssues.slice(0, 2).join(" | "));
      }
    } finally {
      setIsUploadingServiceImages(false);
      if (event?.target) event.target.value = "";
    }
  };

  const approvePendingSubmission = async (submission) => {
    if (!isAdmin || !submission?.id) return;
    setIsProcessingSubmissionId(String(submission.id));
    try {
      const publishRes = await publishContentSubmission({
        submission,
        reviewer: { id: user?.id, email: user?.email },
      });

      if (publishRes.tableMissing) {
        showToast("Target table is missing in Supabase for this submission.", {
          tone: "warn",
          duration: 2600,
        });
        return;
      }
      if (publishRes.error) {
        showToast(publishRes.error.message || "Could not publish submission.", {
          tone: "warn",
          duration: 2600,
        });
        return;
      }

      void notifyPublishedEntity(
        submission.entity_type,
        publishRes.data || submission.payload || {},
        submission,
        "contribute-admin-publish"
      );
      showToast("Submission approved and published.", { tone: "ok", duration: 2200 });
      await refreshPendingSubmissions();
    } finally {
      setIsProcessingSubmissionId("");
    }
  };

  const rejectPendingSubmission = async (submission) => {
    if (!isAdmin || !submission?.id) return;
    setIsProcessingSubmissionId(String(submission.id));
    try {
      const result = await updateContentSubmissionStatus({
        submissionId: submission.id,
        status: "rejected",
        reviewer: { id: user?.id, email: user?.email },
      });
      if (result.tableMissing) {
        showToast("Moderation queue is not configured yet.", { tone: "warn", duration: 2600 });
        return;
      }
      if (result.error) {
        showToast(result.error.message || "Could not reject submission.", { tone: "warn", duration: 2600 });
        return;
      }
      showToast("Submission rejected.", { tone: "info", duration: 2200 });
      await refreshPendingSubmissions();
    } finally {
      setIsProcessingSubmissionId("");
    }
  };

  const resolveReport = (reportId) => {
    if (!isAdmin) return;
    const updated = reports.map((report) =>
      report.id === reportId
        ? { ...report, status: "resolved", resolvedAt: new Date().toISOString() }
        : report
    );
    setReports(updated);
    saveReports(updated);
  };

  const blockFromReport = (report) => {
    if (!isAdmin) return;
    const mappedType =
      report.targetType === "community-story"
        ? "community-story"
        : report.targetType === "community-message"
          ? "community-message"
          : report.targetType === "community-guide"
            ? "community-guide"
            : report.targetType === "community-idea"
              ? "community-idea"
              : report.targetType;

    blockItem({
      targetType: mappedType,
      targetId: report.targetId,
      city: report.city || "",
      title: report.title || "Item",
    });

    setBlockedItems(getBlockedItems());
  };

  const unblockFromReport = (report) => {
    if (!isAdmin) return;
    const mappedType =
      report.targetType === "community-story"
        ? "community-story"
        : report.targetType === "community-message"
          ? "community-message"
          : report.targetType === "community-guide"
            ? "community-guide"
            : report.targetType === "community-idea"
              ? "community-idea"
              : report.targetType;

    unblockItem({
      targetType: mappedType,
      targetId: report.targetId,
    });

    setBlockedItems(getBlockedItems());
  };

  const isBlockedReport = (report) => {
    return blockedItems.some(
      (item) =>
        item.targetType === report.targetType &&
        String(item.targetId) === String(report.targetId)
    );
  };

  const deleteReport = async (reportId) => {
    if (!isAdmin) return;
    const updated = reports.filter((report) => report.id !== reportId);
    setReports(updated);
    await removeReport(reportId);
  };

  const openReports = reports.filter((report) => report.status !== "resolved");
  const resolvedReports = reports.filter((report) => report.status === "resolved");
  const pendingSubmissionCount = pendingSubmissions.length;
  const visibleReports =
    reportFilter === "all"
      ? reports
      : reportFilter === "resolved"
        ? resolvedReports
        : openReports;
  const qaFindings = (() => {
    if (!isAdmin) {
      return {
        places: [],
        events: [],
        services: [],
        cityCounts: [],
        totals: { places: 0, events: 0, services: 0 },
      };
    }

    const placeIssues = qaSnapshot.places
      .map((place) => {
        const issues = [];
        const placeVibeTags = normalizeVibeTags(
          Array.isArray(place?.vibe_tags) && place.vibe_tags.length > 0
            ? place.vibe_tags
            : inferVibeTagsFromLegacyVibe(String(place?.vibe || "")),
          { max: 3 }
        );
        if (!String(place.description || "").trim()) issues.push("Missing description");
        if (String(place.description || "").trim().length < 140) issues.push("Description is short");
        if (!String(place.vibe || "").trim() && placeVibeTags.length === 0) issues.push("Missing vibe");
        if (!String(place.hours || "").trim()) issues.push("Missing opening hours");
        if (!Number.isFinite(Number(place.lat)) || !Number.isFinite(Number(place.lng))) issues.push("Missing coordinates");
        return {
          id: String(place.id),
          city: place.city || "",
          name: place.name || "Unnamed place",
          type: place.type || "place",
          issues,
        };
      })
      .filter((item) => item.issues.length > 0);

    const eventIssues = qaSnapshot.events
      .map((event) => {
        const issues = [];
        const eventVibeTags = normalizeVibeTags(
          Array.isArray(event?.vibe_tags) && event.vibe_tags.length > 0
            ? event.vibe_tags
            : inferVibeTagsFromLegacyVibe(String(event?.vibe || "")),
          { max: 3 }
        );
        if (!String(event.description || "").trim()) issues.push("Missing description");
        if (String(event.description || "").trim().length < 120) issues.push("Description is short");
        if (!String(event.date || "").trim()) issues.push("Missing date");
        if (!String(event.vibe || "").trim() && eventVibeTags.length === 0) issues.push("Missing vibe");
        if (!String(event.link || "").trim()) issues.push("No official link");
        if (!Number.isFinite(Number(event.lat)) || !Number.isFinite(Number(event.lng))) issues.push("Missing coordinates");
        return {
          id: String(event.id),
          city: event.city || "",
          name: event.name || "Unnamed event",
          type: "event",
          issues,
        };
      })
      .filter((item) => item.issues.length > 0);

    const serviceIssues = qaSnapshot.services
      .map((service) => {
        const issues = [];
        const serviceVibeTags = normalizeVibeTags(
          Array.isArray(service?.vibe_tags) && service.vibe_tags.length > 0
            ? service.vibe_tags
            : inferVibeTagsFromLegacyVibe(String(service?.vibe || "")),
          { max: 3 }
        );
        if (!String(service.description || "").trim()) issues.push("Missing description");
        if (String(service.description || "").trim().length < 100) issues.push("Description is short");
        if (!String(service.vibe || "").trim() && serviceVibeTags.length === 0) issues.push("Missing vibe");
        if (!String(service.hours || "").trim()) issues.push("Missing availability");
        if (!String(service.link || "").trim()) issues.push("No booking/contact link");
        if (!Number.isFinite(Number(service.lat)) || !Number.isFinite(Number(service.lng))) issues.push("Missing coordinates");
        return {
          id: String(service.id),
          city: service.city || "",
          name: service.name || "Unnamed service",
          type: service.type || "service",
          issues,
        };
      })
      .filter((item) => item.issues.length > 0);

    const cityAccumulator = {};
    [...placeIssues, ...eventIssues, ...serviceIssues].forEach((item) => {
      const cityKey = String(item.city || "global").toLowerCase();
      cityAccumulator[cityKey] = (cityAccumulator[cityKey] || 0) + 1;
    });

    const cityCounts = Object.entries(cityAccumulator)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      places: placeIssues.slice(0, 10),
      events: eventIssues.slice(0, 10),
      services: serviceIssues.slice(0, 10),
      cityCounts,
      totals: {
        places: placeIssues.length,
        events: eventIssues.length,
        services: serviceIssues.length,
      },
    };
  })();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <ActionToast toast={toast} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[32px] border border-fuchsia-300/15 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_28%),linear-gradient(135deg,rgba(57,18,47,0.96),rgba(10,10,10,0.98),rgba(30,41,59,0.88))] p-8 shadow-[0_30px_120px_rgba(217,70,239,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200/90">Member Contribution Hub</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Contribute</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-200">
                Grow the atlas with places, events, stories, guides, and corrections.
                This is where community turns signal into infrastructure.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
                  canPublishDirect
                    ? "border-emerald-200/28 bg-emerald-200/14 text-emerald-100"
                    : "border-amber-200/26 bg-amber-200/14 text-amber-100"
                }`}>
                  {canPublishDirect ? "Live publish enabled" : "Pending review mode"}
                </span>
                {isTrustedContributor && (
                  <span className="rounded-full border border-cyan-200/28 bg-cyan-200/14 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100">
                    Trusted contributor
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Contribution city</p>
              <select
                value={selectedCity}
                onChange={(event) => {
                  setSelectedCity(event.target.value);
                  setAtlasNotice("");
                  setPlaceNotice("");
                  setEventNotice("");
                  setServiceNotice("");
                  const mappedCity = cityConfig[event.target.value]?.title?.replace("Queer ", "") || "";
                  setPlaceForm((current) => ({ ...current, city: mappedCity }));
                  setEventForm((current) => ({ ...current, city: mappedCity }));
                  setServiceForm((current) => ({ ...current, city: mappedCity }));
                  setRequestForm((current) => ({
                    ...current,
                    city: mappedCity,
                  }));
                }}
                className="mt-3 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none focus:border-fuchsia-300"
              >
                <option value="">Choose city</option>
                {Object.keys(cityConfig).map((city) => (
                  <option key={city} value={city}>
                    {cityConfig[city].title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {moderationSyncNotice && (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {moderationSyncNotice}
          </div>
        )}
        {submissionSyncNotice && (
          <div className="mb-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            {submissionSyncNotice}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[28px] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(8,39,32,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(16,185,129,0.08)]">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Add to Atlas</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {canPublishDirect ? `Publish to ${cityTitle}` : `Submit to ${cityTitle}`}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => {
                  setAtlasNotice("");
                  setPlaceNotice("");
                  setServiceNotice("");
                  setEditingServiceId("");
                  setAddMode((current) => !current);
                  setAddEventMode(false);
                  setAddServiceMode(false);
                }}
                className={`rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(10,43,33,0.76),rgba(11,11,11,0.96))] p-5 text-left transition ${
                  selectedCity
                    ? "hover:-translate-y-[1px] hover:border-emerald-200/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
                    : "hover:border-emerald-200/20"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Place</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Add a place</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">Add directly here to any city.</p>
              </button>

              <button
                onClick={() => {
                  setAtlasNotice("");
                  setEventNotice("");
                  setServiceNotice("");
                  setEditingServiceId("");
                  setAddEventMode((current) => !current);
                  setAddMode(false);
                  setAddServiceMode(false);
                }}
                className={`rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(10,43,33,0.76),rgba(11,11,11,0.96))] p-5 text-left transition ${
                  selectedCity
                    ? "hover:-translate-y-[1px] hover:border-emerald-200/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
                    : "hover:border-emerald-200/20"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Event</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Add an event</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">Publish event details without leaving this page.</p>
              </button>

              <button
                onClick={() => {
                  setAtlasNotice("");
                  setServiceNotice("");
                  setPlaceNotice("");
                  setEventNotice("");
                  setAddServiceMode((current) => {
                    const next = !current;
                    if (next) {
                      const mappedCity = cityConfig[selectedCity]?.title?.replace("Queer ", "") || "";
                      setEditingServiceId("");
                      setServiceImageUrlDraft("");
                      setServiceForm({ ...createEmptyServiceForm(), city: mappedCity });
                    }
                    return next;
                  });
                  setAddMode(false);
                  setAddEventMode(false);
                }}
                className={`rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(7,47,59,0.76),rgba(11,11,11,0.96))] p-5 text-left transition ${
                  selectedCity
                    ? "hover:-translate-y-[1px] hover:border-cyan-200/30 hover:shadow-[0_20px_50px_rgba(34,211,238,0.12)]"
                    : "hover:border-cyan-200/20"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Service</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Add a service</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">Publish massage, tour, concierge, and private service signal.</p>
              </button>
            </div>
            {!selectedCity && (
              <p className="mt-4 text-xs text-emerald-200/80">Choose city once, then add places, events, and services directly here.</p>
            )}
            {atlasNotice && (
              <p className="mt-2 text-xs text-amber-200">{atlasNotice}</p>
            )}

            {addMode && (
              <div className="mt-4 space-y-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/6 p-4">
                <Field value={placeForm.name} onChange={(event) => setPlaceForm((current) => ({ ...current, name: event.target.value }))} placeholder="Place name" />
                <Field value={placeForm.city} onChange={(event) => setPlaceForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      value={placeForm.type}
                      onChange={(event) => setPlaceForm((current) => ({ ...current, type: event.target.value }))}
                      className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
                  >
                    {PLACE_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <Field
                      value={placeForm.vibe}
                      onChange={(event) => setPlaceForm((current) => ({ ...current, vibe: event.target.value }))}
                      placeholder="Legacy vibe label (optional)"
                    />
                  </div>
                  <VibeTagPicker
                    value={placeForm.vibe_tags}
                    onChange={(nextTags) => setPlaceForm((current) => ({ ...current, vibe_tags: nextTags }))}
                    title="Place vibe tags"
                    hint="Pick up to 3 standardized tags."
                    tone="emerald"
                  />
                  <Field value={placeForm.address} onChange={(event) => setPlaceForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" />
                  <Field value={placeForm.hours} onChange={(event) => setPlaceForm((current) => ({ ...current, hours: event.target.value }))} placeholder="Opening hours (for example Thu-Sat 22:00-05:00)" />
                  <Field value={placeForm.link} onChange={(event) => setPlaceForm((current) => ({ ...current, link: event.target.value }))} placeholder="Official link (website, Instagram, Facebook) - optional" />
                <div className="grid gap-3 md:grid-cols-2">
                  <Field value={placeForm.source} onChange={(event) => setPlaceForm((current) => ({ ...current, source: event.target.value }))} placeholder="Source URL or name (optional)" />
                  <DateInput
                    value={placeForm.lastChecked}
                    onChange={(event) => setPlaceForm((current) => ({ ...current, lastChecked: event.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
                    tone="emerald"
                  />
                </div>
                <Field value={placeForm.description} onChange={(event) => setPlaceForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" area />
                <button
                  type="button"
                  onClick={submitPlaceDirect}
                  disabled={isSavingPlace}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95"
                >
                  {isSavingPlace ? "Saving..." : "Save place"}
                </button>
                {placeNotice && <p className="text-xs text-amber-200">{placeNotice}</p>}
              </div>
            )}

            {addEventMode && (
                <div className="mt-4 space-y-3 rounded-2xl border border-violet-300/20 bg-violet-300/6 p-4">
                  <Field value={eventForm.name} onChange={(event) => setEventForm((current) => ({ ...current, name: event.target.value }))} placeholder="Event name" />
                  <Field value={eventForm.city} onChange={(event) => setEventForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
                  <Field value={eventForm.address} onChange={(event) => setEventForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" />
                <DateInput
                  value={eventForm.date}
                  onChange={(event) => setEventForm((current) => ({ ...current, date: event.target.value }))}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
                  tone="violet"
                  />
                  <Field value={eventForm.link} onChange={(event) => setEventForm((current) => ({ ...current, link: event.target.value }))} placeholder="Event link (optional)" />
                  <label className="block rounded-xl border border-emerald-200/28 bg-emerald-200/[0.10] p-3">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                      Ticket URL / Get tickets button
                    </span>
                    <span className="mt-1 block text-xs text-emerald-50/70">
                      Optional. Paste the page where people can buy tickets for this event.
                    </span>
                    <input
                      value={eventForm.ticket_url || ""}
                      onChange={(event) => setEventForm((current) => ({ ...current, ticket_url: event.target.value }))}
                      placeholder="https://tickets.example.com/event"
                      className="mt-2 w-full rounded-xl border border-emerald-100/24 bg-black px-4 py-3 text-sm outline-none transition focus:border-emerald-100/55"
                    />
                  </label>
                  <Field
                    value={eventForm.vibe}
                    onChange={(event) => setEventForm((current) => ({ ...current, vibe: event.target.value }))}
                    placeholder="Legacy vibe label (optional)"
                  />
                  <VibeTagPicker
                    value={eventForm.vibe_tags}
                    onChange={(nextTags) => setEventForm((current) => ({ ...current, vibe_tags: nextTags }))}
                    title="Event vibe tags"
                    hint="Pick up to 3 standardized tags."
                    tone="violet"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field value={eventForm.source} onChange={(event) => setEventForm((current) => ({ ...current, source: event.target.value }))} placeholder="Source URL or name (optional)" />
                    <DateInput
                    value={eventForm.lastChecked}
                    onChange={(event) => setEventForm((current) => ({ ...current, lastChecked: event.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
                    tone="violet"
                  />
                </div>
                <Field value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" area />
                <button
                  type="button"
                  onClick={submitEventDirect}
                  disabled={isSavingEvent}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-200 via-fuchsia-200 to-sky-200 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95"
                >
                  {isSavingEvent ? "Saving..." : "Save event"}
                </button>
                {eventNotice && <p className="text-xs text-amber-200">{eventNotice}</p>}
              </div>
            )}

            {addServiceMode && (
              <div ref={serviceFormPanelRef} className="mt-4 space-y-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/88">
                    {editingServiceId ? "Editing service" : "New service"}
                  </p>
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        const mappedCity = cityConfig[selectedCity]?.title?.replace("Queer ", "") || "";
                        setEditingServiceId("");
                        setServiceForm({ ...createEmptyServiceForm(), city: mappedCity });
                        setServiceImageUrlDraft("");
                        setServiceNotice("");
                      }}
                      className="rounded-lg border border-cyan-200/28 bg-cyan-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/45"
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
                {isLoadingServiceDraft && (
                  <p className="text-xs text-cyan-100/78">Loading service draft...</p>
                )}
                <Field
                  value={serviceForm.name}
                  onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Service name"
                />
                <Field
                  value={serviceForm.city}
                  onChange={(event) => setServiceForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="City"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={serviceForm.type}
                    onChange={(event) => setServiceForm((current) => ({ ...current, type: event.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
                  >
                    {CITY_SERVICE_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={serviceForm.price_tier}
                    onChange={(event) => setServiceForm((current) => ({ ...current, price_tier: event.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
                  >
                    {SERVICE_PRICE_TIERS.map((item, index) => (
                      <option key={`service-price-tier-${index}-${item.value || "empty"}`} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-cyan-200/20 bg-cyan-200/[0.08] px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/80">Service announcer</p>
                      {isTrustedContributor && (
                        <span className="rounded-full border border-cyan-200/35 bg-cyan-200/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                          Trusted contributor
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-cyan-50/95">{String(memberName || user?.email || "Member account")}</p>
                    <p className="mt-1 text-xs text-cyan-100/70">Only member-owned services are allowed. Third-party partner listings are blocked.</p>
                  </div>
                  <Field
                    value={serviceForm.contact}
                    onChange={(event) => setServiceForm((current) => ({ ...current, contact: event.target.value }))}
                    placeholder="Contact (WhatsApp, Telegram, email)"
                  />
                </div>
                <Field
                  value={serviceForm.booking_link}
                  onChange={(event) => setServiceForm((current) => ({ ...current, booking_link: event.target.value }))}
                  placeholder="Booking link (optional)"
                />
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Field
                    value={serviceImageUrlDraft}
                    onChange={(event) => setServiceImageUrlDraft(event.target.value)}
                    placeholder="Image URL (https://...)"
                  />
                  <button
                    type="button"
                    onClick={addServiceImageFromUrl}
                    className="rounded-xl border border-cyan-200/28 bg-cyan-200/12 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/45"
                  >
                    Add image URL
                  </button>
                </div>
                <div className="rounded-xl border border-cyan-200/20 bg-cyan-200/[0.06] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-100/82">Upload photos</p>
                  <p className="mt-1 text-xs text-cyan-100/70">JPG/PNG/WEBP up to 8MB each. Max {SERVICE_MAX_IMAGES} images.</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleServiceImageUpload}
                    disabled={isUploadingServiceImages}
                    className="mt-2 block w-full rounded-lg border border-white/12 bg-black/40 px-3 py-2 text-xs text-white/85 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-200/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-cyan-100"
                  />
                  {isUploadingServiceImages && (
                    <p className="mt-2 text-xs text-cyan-100/80">Uploading images...</p>
                  )}
                  {Array.isArray(serviceForm.image_urls) && serviceForm.image_urls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {serviceForm.image_urls.map((imageUrl) => (
                        <div key={`service-form-image-${imageUrl}`} className="group relative overflow-hidden rounded-lg border border-white/12 bg-black/40">
                          <Image
                            src={imageUrl}
                            alt="Service upload preview"
                            width={360}
                            height={240}
                            unoptimized
                            className="h-24 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeServiceImage(imageUrl)}
                            className="absolute right-1 top-1 rounded-md border border-black/30 bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/90 opacity-0 transition group-hover:opacity-100"
                            aria-label="Remove service image"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Field
                  value={serviceForm.link}
                  onChange={(event) => setServiceForm((current) => ({ ...current, link: event.target.value }))}
                  placeholder="Official link (optional)"
                />
                <Field
                  value={serviceForm.address}
                  onChange={(event) => setServiceForm((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Address"
                />
                <Field
                  value={serviceForm.hours}
                  onChange={(event) => setServiceForm((current) => ({ ...current, hours: event.target.value }))}
                  placeholder="Availability / opening hours"
                />
                <Field
                  value={serviceForm.vibe}
                  onChange={(event) => setServiceForm((current) => ({ ...current, vibe: event.target.value }))}
                  placeholder="Legacy vibe label (optional)"
                />
                <VibeTagPicker
                  value={serviceForm.vibe_tags}
                  onChange={(nextTags) => setServiceForm((current) => ({ ...current, vibe_tags: nextTags }))}
                  title="Service vibe tags"
                  hint="Pick up to 3 standardized tags."
                  tone="cyan"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    value={serviceForm.source}
                    onChange={(event) => setServiceForm((current) => ({ ...current, source: event.target.value }))}
                    placeholder="Source URL or name (optional)"
                  />
                  <DateInput
                    value={serviceForm.lastChecked}
                    onChange={(event) => setServiceForm((current) => ({ ...current, lastChecked: event.target.value }))}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none transition focus:border-white/50"
                    tone="cyan"
                  />
                </div>
                <Field
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Description"
                  area
                />
                <button
                  type="button"
                  onClick={submitServiceDirect}
                  disabled={isSavingService || isUploadingServiceImages || isLoadingServiceDraft}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-200 via-sky-200 to-teal-200 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95"
                >
                  {isSavingService
                    ? "Saving..."
                    : isUploadingServiceImages
                      ? "Uploading images..."
                      : editingServiceId
                        ? "Update service"
                        : "Save service"}
                </button>
                {serviceNotice && <p className="text-xs text-amber-200">{serviceNotice}</p>}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-violet-300/15 bg-[linear-gradient(180deg,rgba(27,19,52,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(139,92,246,0.08)]">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-violet-200">Community Contributions</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Add lived experience</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => router.push("/community")}
                className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(28,21,54,0.76),rgba(11,11,11,0.96))] p-5 text-left transition hover:-translate-y-[1px] hover:border-violet-200/30 hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)]"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">Story</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Write a story</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">Share how a city, venue, or night actually felt.</p>
              </button>

              <button
                onClick={() => router.push("/community")}
                className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(28,21,54,0.76),rgba(11,11,11,0.96))] p-5 text-left transition hover:-translate-y-[1px] hover:border-violet-200/30 hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)]"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">Guide</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Publish a guide</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">Turn experience into reusable queer navigation wisdom.</p>
              </button>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-amber-300/15 bg-[linear-gradient(180deg,rgba(45,31,10,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(251,191,36,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-200">Quality Control</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Corrections and missing signal</h2>
            </div>
            <button
              onClick={() => setShowRequestForm((current) => !current)}
              className="rounded-full border border-amber-300/30 bg-amber-300/8 px-4 py-2 text-xs text-amber-100 transition hover:border-amber-200 hover:bg-amber-300/15"
            >
              {showRequestForm ? "Close form" : "New request"}
            </button>
          </div>

          {showRequestForm && (
            <form onSubmit={submitRequest} className="mb-5 rounded-2xl border border-amber-300/20 bg-amber-300/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="grid gap-3 md:grid-cols-[0.22fr_0.28fr_1fr]">
                <select
                  value={requestForm.type}
                  onChange={(event) => setRequestForm((current) => ({ ...current, type: event.target.value }))}
                  className="rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none focus:border-amber-200"
                >
                  <option>Correction</option>
                  <option>Missing place</option>
                  <option>Missing event</option>
                  <option>Expansion request</option>
                </select>

                <input
                  value={requestForm.city}
                  onChange={(event) => setRequestForm((current) => ({ ...current, city: event.target.value }))}
                  placeholder="City"
                  className="rounded-xl border border-gray-700 bg-black px-4 py-3 text-sm outline-none focus:border-amber-200"
                />

                <Field
                  value={requestForm.title}
                  onChange={(event) => setRequestForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Title"
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                <Field
                  value={requestForm.detail}
                  onChange={(event) => setRequestForm((current) => ({ ...current, detail: event.target.value }))}
                  placeholder="Explain what should change or what is missing"
                  area
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:opacity-95 md:self-end"
                >
                  Save request
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => (
              <article
                key={request.id}
                className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(46,31,10,0.78),rgba(11,11,11,0.96))] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">{request.city} · {request.type}</p>
                  <p className="text-xs text-gray-500">{timeAgo(request.createdAt)}</p>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{request.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">{request.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {isAdmin && (
          <section className="mt-6 rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(10,34,45,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(56,189,248,0.08)]">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Admin Content QA</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Atlas quality snapshot</h2>
                <p className="mt-2 text-sm text-white/65">
                  Fast check of missing content signals before publishing updates.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-cyan-100">
                  Places: {qaFindings.totals.places}
                </span>
                <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-violet-100">
                  Events: {qaFindings.totals.events}
                </span>
                <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-emerald-100">
                  Services: {qaFindings.totals.services}
                </span>
              </div>
            </div>

            {qaSnapshot.loading ? (
              <div className="rounded-2xl border border-dashed border-white/12 px-5 py-8 text-sm text-white/60">
                Loading QA snapshot...
              </div>
            ) : qaSnapshot.error ? (
              <div className="rounded-2xl border border-amber-300/22 bg-amber-300/10 px-5 py-4 text-sm text-amber-100">
                {qaSnapshot.error}
              </div>
            ) : (
              <>
                {qaFindings.cityCounts.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {qaFindings.cityCounts.map((item) => (
                      <button
                        key={item.city}
                        onClick={() => router.push(cityPath(item.city))}
                        className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/80 transition hover:border-cyan-200/30 hover:text-cyan-100"
                      >
                        {formatCityLabel(item.city)}: {item.count}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-3">
                  <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/80">Place issues</p>
                    <div className="mt-3 space-y-2">
                      {qaFindings.places.length === 0 && (
                        <p className="text-sm text-white/55">No place issues detected.</p>
                      )}
                      {qaFindings.places.map((item) => (
                        <button
                          key={`qa-place-${item.id}`}
                          onClick={() => router.push(citySelectionPath(item.city, { placeId: item.id }))}
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-cyan-200/30"
                        >
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-xs text-white/60">
                            {formatCityLabel(item.city)} · {item.type}
                          </p>
                          <p className="mt-2 text-xs text-amber-100/90">{item.issues.join(" · ")}</p>
                        </button>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/80">Service issues</p>
                    <div className="mt-3 space-y-2">
                      {qaFindings.services.length === 0 && (
                        <p className="text-sm text-white/55">No service issues detected.</p>
                      )}
                      {qaFindings.services.map((item) => (
                        <button
                          key={`qa-service-${item.id}`}
                          onClick={() =>
                            router.push(citySelectionPath(item.city, { extraParams: { serviceId: item.id } }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-emerald-200/30"
                        >
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-xs text-white/60">
                            {formatCityLabel(item.city)} · {item.type}
                          </p>
                          <p className="mt-2 text-xs text-amber-100/90">{item.issues.join(" · ")}</p>
                        </button>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-violet-100/80">Event issues</p>
                    <div className="mt-3 space-y-2">
                      {qaFindings.events.length === 0 && (
                        <p className="text-sm text-white/55">No event issues detected.</p>
                      )}
                      {qaFindings.events.map((item) => (
                        <button
                          key={`qa-event-${item.id}`}
                          onClick={() => router.push("/events")}
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-violet-200/30"
                        >
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-xs text-white/60">{formatCityLabel(item.city)}</p>
                          <p className="mt-2 text-xs text-amber-100/90">{item.issues.join(" · ")}</p>
                        </button>
                      ))}
                    </div>
                  </article>


                </div>
              </>
            )}
          </section>
        )}

        {isAdmin && (
          <section className="mt-6 rounded-[28px] border border-indigo-300/15 bg-[linear-gradient(180deg,rgba(24,22,58,0.95),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(129,140,248,0.08)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-200">Submission Queue</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Pending member entries</h2>
                <p className="mt-2 text-sm text-white/65">
                  Review member-added venues, events, and services before they go live.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-indigo-200/24 bg-indigo-200/10 px-3 py-1 text-xs text-indigo-100">
                  Pending: {pendingSubmissionCount}
                </span>
                <button
                  type="button"
                  onClick={refreshPendingSubmissions}
                  className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-xs text-white/80 transition hover:border-indigo-200/35 hover:text-indigo-100"
                >
                  Refresh
                </button>
              </div>
            </div>

            {isLoadingPendingSubmissions ? (
              <div className="rounded-2xl border border-dashed border-white/12 px-5 py-8 text-sm text-white/55">
                Loading pending submissions...
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/12 px-5 py-8 text-sm text-white/55">
                No pending submissions right now.
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {pendingSubmissions.map((submission) => {
                  const payload = submission?.payload && typeof submission.payload === "object" ? submission.payload : {};
                  const statusBusy = isProcessingSubmissionId === String(submission.id);
                  const submissionName = String(submission?.title || payload?.name || "Untitled");
                  return (
                    <article key={submission.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-indigo-100/85">
                          {String(submission.entity_type || "item")} · {formatCityLabel(String(submission.city || "global"))}
                        </p>
                        <p className="text-xs text-white/45">{timeAgo(submission.created_at)}</p>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-white">{submissionName}</h3>
                      <p className="mt-2 text-xs text-white/65">
                        by {String(submission.submitted_by_name || submission.submitted_by_email || "Member")}
                        {submission.is_trusted_contributor ? " · trusted" : ""}
                      </p>
                      {payload?.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-white/70">{String(payload.description)}</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => approvePendingSubmission(submission)}
                          disabled={statusBusy}
                          className="rounded-full border border-emerald-200/26 bg-emerald-200/12 px-3 py-1 text-xs text-emerald-100 transition hover:border-emerald-200/45 disabled:opacity-60"
                        >
                          {statusBusy ? "Working..." : "Approve & publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectPendingSubmission(submission)}
                          disabled={statusBusy}
                          className="rounded-full border border-rose-200/26 bg-rose-200/12 px-3 py-1 text-xs text-rose-100 transition hover:border-rose-200/45 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="mt-6 rounded-[28px] border border-rose-300/15 bg-[linear-gradient(180deg,rgba(44,18,27,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(244,114,182,0.08)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-rose-200">Safety Inbox</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Reported content</h2>
              <p className="mt-2 text-xs text-rose-100/70">
                Review standards in{" "}
                <Link href="/community-policy" className="underline underline-offset-2 transition hover:text-white">
                  Community Policy
                </Link>
                .
              </p>
            </div>
            <div className="rounded-full border border-rose-200/20 bg-rose-200/8 px-4 py-2 text-xs text-rose-100">
              {openReports.length} open · {blockedItems.length} blocked
            </div>
          </div>

          {isAdmin ? (
            <>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { id: "open", label: "Open" },
              { id: "resolved", label: "Resolved" },
              { id: "all", label: "All" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setReportFilter(item.id)}
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  reportFilter === item.id
                    ? "border-rose-200/28 bg-rose-200/12 text-rose-100"
                    : "border-white/12 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 px-5 py-8 text-sm text-white/50">
              No reports yet.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visibleReports.map((report) => (
                <article key={report.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-rose-100/70">
                      {report.targetType} · {report.city || "Global"}
                    </p>
                    <p className="text-xs text-white/45">{timeAgo(report.createdAt)}</p>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{report.title || "Reported content"}</h3>
                  <p className="mt-2 text-sm text-white/65">{report.reason}</p>
                  <div className="mt-4 flex gap-2">
                    {!isBlockedReport(report) ? (
                      <button
                        onClick={() => blockFromReport(report)}
                        className="rounded-full border border-amber-200/20 bg-amber-200/8 px-3 py-1 text-xs text-amber-100 transition hover:border-amber-200/35"
                      >
                        Block content
                      </button>
                    ) : (
                      <button
                        onClick={() => unblockFromReport(report)}
                        className="rounded-full border border-cyan-200/20 bg-cyan-200/8 px-3 py-1 text-xs text-cyan-100 transition hover:border-cyan-200/35"
                      >
                        Unblock
                      </button>
                    )}
                    {report.status !== "resolved" && (
                      <button
                        onClick={() => resolveReport(report.id)}
                        className="rounded-full border border-emerald-200/20 bg-emerald-200/8 px-3 py-1 text-xs text-emerald-100 transition hover:border-emerald-200/35"
                      >
                        Mark resolved
                      </button>
                    )}
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}

              {visibleReports.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/12 px-5 py-8 text-sm text-white/50 md:col-span-2">
                  No reports in this filter.
                </div>
              )}
            </div>
          )}

          {resolvedReports.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Recently resolved</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {resolvedReports.slice(0, 8).map((report) => (
                  <span key={report.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
                    {report.targetType} · {report.title || "Item"}
                  </span>
                ))}
              </div>
            </div>
          )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.03] px-5 py-8 text-sm text-white/70">
              Safety Inbox is visible only for admin members. Reporting still works globally.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


