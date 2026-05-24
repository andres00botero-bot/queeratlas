"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { addReport, getBlockedItems, subscribeBlockedItems, syncBlockedItemsFromCloud } from "@/lib/moderation";
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import { citySelectionPath } from "@/lib/cityRouting";
import { trackKpiEvent } from "@/lib/analytics";
import { useActionToast } from "@/lib/useActionToast";
import { logDevError } from "@/lib/devLogger";
import { resolveAdminAccess } from "@/lib/adminAccess";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { inferVibeTagsFromLegacyVibe, normalizeVibeTags } from "@/lib/vibeTaxonomy";
import {
  fetchEventsData,
  fetchGlobalEventsData,
  migrateLegacyGlobalEventsToSupabase,
  splitGlobalEventsByExpiry,
} from "@/features/events/eventDataApi";
import {
  buildGlobalEventPayloadFromForm,
  buildGlobalFormFromEvent,
  EMPTY_GLOBAL_FORM,
} from "@/features/events/eventGlobalFormUtils";
import {
  insertGlobalEventRecord,
  updateGlobalEventRecord,
} from "@/features/events/eventGlobalApiUtils";
import { updateCityEventRecord } from "@/features/events/eventCityApiUtils";
import {
  eventOverlapsDate,
  eventOverlapsMonth,
  formatCityLabel,
  formatDateLabel,
  formatEventDateLabel,
  normalizeCityKey,
} from "@/features/events/eventDateUtils";
import {
  createInitialQualityModal,
  createInitialReportDraft,
  createQualityModalFromEvent,
  createReportDraftFromEvent,
} from "@/features/events/eventModalStateUtils";
import { REPORT_REASONS, TRUST_ACTIONS } from "@/features/events/eventPageConstants";
import { normalizeEventRange } from "@/features/events/eventFormatUtils";
import { resolveEventOpenIntent } from "@/features/events/eventOpenGuards";
import { qualityPillClass } from "@/features/events/eventViewUtils";
import { ADDED_STORAGE_KEY, FAVORITES_STORAGE_KEY } from "@/features/favorites/favoritesStateDefaults";
import { addFavoriteLocalState, mergeFavoriteIds } from "@/features/favorites/logic/favoritesMutations";
import CityEventEditModal from "@/components/events/CityEventEditModal";
import EventSkeletonCard from "@/components/events/EventSkeletonCard";
import EventReportModal from "@/components/events/EventReportModal";
import EventQualityModal from "@/components/events/EventQualityModal";
import GlobalEventForm from "@/components/events/GlobalEventForm";
import EmptyState from "@/components/ui/EmptyState";
import ActionToast from "@/components/ui/ActionToast";
import PageControls from "@/components/ui/PageControls";
import VibeTagChips from "@/components/ui/VibeTagChips";

const EVENTS_METRICS_DAILY_CACHE_KEY = "qa_events_metrics_daily_v1";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDuplicateKeyError(error) {
  const code = String(error?.code || "").toUpperCase();
  return code === "23505";
}

function titleCaseWords(value = "") {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeEventVibeKeys(event) {
  const tagKeys = normalizeVibeTags(event?.vibe_tags, event?.vibe)
    .map((tag) => String(tag || "").trim().toLowerCase())
    .filter(Boolean);
  if (tagKeys.length > 0) return Array.from(new Set(tagKeys));

  const legacy = String(event?.vibe || "")
    .split(/[,/|]/)
    .map((part) => String(part || "").trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(legacy));
}

export default function EventsPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user, memberName } = useAuth();
  const { toast, showToast } = useActionToast();
  const overviewSectionRef = useRef(null);
  const searchSectionRef = useRef(null);
  const offgridSectionRef = useRef(null);
  const eventListSectionRef = useRef(null);
  const calendarSectionRef = useRef(null);
  const eventsControlsRef = useRef(null);
  const eventsControlButtonsRef = useRef({});

  const [events, setEvents] = useState([]);
  const [qualityTick, setQualityTick] = useState(0);
  const [globalEvents, setGlobalEvents] = useState([]);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingGlobalEventId, setEditingGlobalEventId] = useState("");
  const [globalForm, setGlobalForm] = useState(EMPTY_GLOBAL_FORM);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchVibe, setSearchVibe] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [deletingGlobalEventId, setDeletingGlobalEventId] = useState("");
  const [cityEditOpen, setCityEditOpen] = useState(false);
  const [isSavingCityEdit, setIsSavingCityEdit] = useState(false);
  const [cityEditError, setCityEditError] = useState("");
  const [cityEditDraft, setCityEditDraft] = useState({
    id: "",
    city: "",
    name: "",
    startDate: "",
    endDate: "",
    location: "",
    vibe: "",
    vibe_tags: [],
    description: "",
    link: "",
  });
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState(() => createInitialReportDraft(REPORT_REASONS[0].value));
  const [qualityModal, setQualityModal] = useState(() => createInitialQualityModal());
  const [dailyMetricsSnapshot, setDailyMetricsSnapshot] = useState(null);
  const [offgridEventParam, setOffgridEventParam] = useState(() => {
    if (typeof window === "undefined") return "";
    return String(new URLSearchParams(window.location.search).get("offgridEventId") || "").trim();
  });
  const [favoriteIds, setFavoriteIds] = useState(() => readLocalJson(FAVORITES_STORAGE_KEY, []));
  const [addedEntries, setAddedEntries] = useState(() => readLocalJson(ADDED_STORAGE_KEY, []));
  const [activeEventsSection, setActiveEventsSection] = useState("search");

  const blockedEventIds = useMemo(() => (
    new Set(
      blockedItems
        .filter((item) => item.targetType === "event")
        .map((item) => String(item.targetId))
    )
  ), [blockedItems]);
  const favoriteIdSet = useMemo(
    () => new Set((favoriteIds || []).map((id) => String(id))),
    [favoriteIds]
  );

  const normalizedFocusedOffgridId = useMemo(
    () => offgridEventParam.replace(/^global-/i, ""),
    [offgridEventParam]
  );

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
    if (!isMember) {
      queueMicrotask(() => {
        setIsAdmin(false);
        setShowGlobalForm(false);
        setEditingGlobalEventId("");
      });
      return;
    }

    let active = true;

    queueMicrotask(async () => {
      const { isAdmin: adminState } = await resolveAdminAccess({
        email: user?.email,
      });

      if (!active) return;
      setIsAdmin(adminState);
      if (!adminState) {
        setShowGlobalForm(false);
        setEditingGlobalEventId("");
      }
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember, user?.email]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isMember || !user?.id) return;

    let active = true;

    queueMicrotask(async () => {
      const localFavoriteIds = readLocalJson(FAVORITES_STORAGE_KEY, []);
      const { data, error } = await supabase
        .from("member_favorites")
        .select("favorite_id")
        .eq("user_id", user.id);

      if (!active) return;

      if (error) {
        setFavoriteIds(localFavoriteIds);
        return;
      }

      const remoteFavoriteIds = Array.isArray(data)
        ? data.map((row) => String(row.favorite_id || "")).filter(Boolean)
        : [];
      const merged = mergeFavoriteIds(remoteFavoriteIds, localFavoriteIds);
      setFavoriteIds(merged);
      writeLocalJson(FAVORITES_STORAGE_KEY, merged);
    });

    return () => {
      active = false;
    };
  }, [isAuthLoading, isMember, user?.id]);

  const qualityMap = getQualityMap();

  const saveEventToFavorites = async (event, clickEvent) => {
    clickEvent?.stopPropagation();
    if (!isMember || !user?.id) {
      showToast("Join as member to save events.", { tone: "info", duration: 2200 });
      return;
    }

    const favoriteId = `event-${String(event?.id || "")}`;
    const nextState = addFavoriteLocalState({
      favorites: favoriteIds,
      added: addedEntries,
      favoriteId,
      nowIso: new Date().toISOString(),
    });

    if (!nextState.isValid) return;

    if (nextState.alreadySaved) {
      showToast("Already saved in favorites.", { tone: "info", duration: 1600 });
      return;
    }

    setFavoriteIds(nextState.favorites);
    setAddedEntries(nextState.added);
    writeLocalJson(FAVORITES_STORAGE_KEY, nextState.favorites);
    writeLocalJson(ADDED_STORAGE_KEY, nextState.added);

    const { error } = await supabase.from("member_favorites").insert([
      {
        user_id: user.id,
        favorite_id: favoriteId,
      },
    ]);

    if (error && !isDuplicateKeyError(error)) {
      showToast("Saved locally. Cloud sync unavailable.", { tone: "info", duration: 2300 });
    } else {
      showToast("Event saved to favorites.", { tone: "success", duration: 1700 });
    }
  };

  const refreshQuality = async (event, clickEvent) => {
    clickEvent?.stopPropagation();
    if (event?.isGlobal && !isAdmin) {
      setGlobalError("Admin access required to edit off-grid event metadata.");
      return;
    }

    const existing = getEntityQuality({
      targetType: "event",
      targetId: event.id,
      entity: event,
      map: qualityMap,
    });
    const fallbackSource = (existing?.source || event.link || "").trim();
    setQualityModal(createQualityModalFromEvent(event, fallbackSource));
  };

  const closeQualityModal = () => {
    setQualityModal((current) => ({ ...current, open: false }));
  };

  const submitQualityModal = async () => {
    const action = String(qualityModal.action || "").trim();
    if (!["1", "2", "3"].includes(action)) {
      showToast("Use 1, 2, or 3 to continue.", { tone: "warn", duration: 2200 });
      return;
    }

    const selectedEvent = [...events, ...globalEvents].find(
      (item) => String(item.id || "") === String(qualityModal.eventId || "")
    );
    if (!selectedEvent) {
      closeQualityModal();
      return;
    }

    if (qualityModal.isGlobal && !isAdmin) {
      setGlobalError("Admin access required to edit off-grid event metadata.");
      closeQualityModal();
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const sourceDefaultByAction =
      action === "1"
        ? qualityModal.fallbackSource || "Community verified"
        : action === "2"
          ? qualityModal.fallbackSource || "Community flagged: needs review"
          : qualityModal.fallbackSource || "Community flagged: closed or moved";
    const sourceByAction = String(qualityModal.sourceInput || "").trim() || sourceDefaultByAction;
    const verified = action === "1";
    const lastChecked = action === "1" ? today : "";

    upsertQuality({
      targetType: "event",
      targetId: selectedEvent.id,
      source: sourceByAction,
      lastChecked,
      verified,
    });

    if (selectedEvent.isGlobal) {
      const { error } = await supabase
        .from("global_events")
        .update({
          source: sourceByAction || null,
          last_checked: lastChecked || null,
        })
        .eq("id", selectedEvent.id);

      if (error) {
        setGlobalError("Could not update quality metadata in Supabase.");
      } else {
        setGlobalEvents((current) => current.map((item) => (
          String(item.id) === String(selectedEvent.id)
            ? {
                ...item,
                source: sourceByAction,
                lastChecked,
              }
            : item
        )));
      }
    }

    setQualityTick((value) => value + 1);
    closeQualityModal();
  };

  const loadAllEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    setGlobalError("");

    const [eventsRes, globalRes] = await Promise.all([fetchEventsData(), fetchGlobalEventsData()]);

    setEvents(eventsRes.data || []);
    if (eventsRes.error) {
      setLoadError("Could not load events right now.");
    }

    if (globalRes.error) {
      setGlobalEvents([]);
      setGlobalError("Off-grid sync is unavailable right now.");
    } else {
      const todayIso = new Date().toISOString().slice(0, 10);
      const activeRows = Array.isArray(globalRes.data) ? globalRes.data : [];
      const { active, expiredIds } = splitGlobalEventsByExpiry(activeRows, todayIso);

      if (isAdmin && expiredIds.length > 0) {
        const { error: pruneError } = await supabase
          .from("global_events")
          .delete()
          .in("id", expiredIds);
        if (pruneError) {
          setGlobalError(`Off-grid cleanup warning: ${String(pruneError.message || "could not remove expired events")}`);
        }
      }

      setGlobalEvents(active);
      const migration = await migrateLegacyGlobalEventsToSupabase();
      if (migration.migrated && !migration.error && Array.isArray(migration.data)) {
        const migratedSplit = splitGlobalEventsByExpiry(migration.data, todayIso);
        setGlobalEvents(migratedSplit.active);
      }
    }

    setIsLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    queueMicrotask(() => {
      loadAllEvents();
    });
  }, [loadAllEvents]);

  useEffect(() => {
    if (!isAdmin) return;
    queueMicrotask(() => {
      loadAllEvents();
    });
  }, [isAdmin, loadAllEvents]);

  useEffect(() => {
    if (!normalizedFocusedOffgridId || globalEvents.length === 0) return;

    const exists = globalEvents.some(
      (event) => String(event.id || "") === normalizedFocusedOffgridId
    );
    if (!exists) return;

    const timeoutId = setTimeout(() => {
      offgridSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const card = document.getElementById(`offgrid-event-${normalizedFocusedOffgridId}`);
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [globalEvents, normalizedFocusedOffgridId]);

  const calendarEvents = useMemo(() => {
    const offGrid = globalEvents.map((event) => ({
      ...event,
      city: "Global",
      isGlobal: true,
    }));
    return [...events, ...offGrid]
      .map((event) => normalizeEventRange(event))
      .filter((event) => !blockedEventIds.has(String(event.id)));
  }, [blockedEventIds, events, globalEvents]);

  const filteredEvents = useMemo(() => (
    selectedDate
      ? calendarEvents.filter((event) => eventOverlapsDate(event, selectedDate))
      : calendarEvents
  ), [calendarEvents, selectedDate]);

  const displayedGlobalEvents = useMemo(
    () => (normalizedFocusedOffgridId ? globalEvents : globalEvents.slice(0, 8)),
    [globalEvents, normalizedFocusedOffgridId]
  );

  const eventsByCity = useMemo(() => (
    filteredEvents.reduce((acc, event) => {
      const cityKey = normalizeCityKey(event.city || "Other");
      const cityLabel = formatCityLabel(event.city || "Other");

      if (!acc[cityKey]) {
        acc[cityKey] = {
          label: cityLabel,
          events: [],
        };
      }

      acc[cityKey].events.push(event);
      return acc;
    }, {})
  ), [filteredEvents]);

  const sortedCities = useMemo(() => (
    Object.keys(eventsByCity).sort((a, b) => (
      (eventsByCity[a]?.label || formatCityLabel(a)).localeCompare(eventsByCity[b]?.label || formatCityLabel(b))
    ))
  ), [eventsByCity]);

  const sortedEventsByCity = useMemo(
    () =>
      sortedCities.reduce((acc, cityKey) => {
        const cityGroup = eventsByCity[cityKey];
        const cityEvents = (cityGroup?.events || []).slice().sort((a, b) => {
          const aStart = String(a?.startDate || "");
          const bStart = String(b?.startDate || "");
          return String(aStart || "").localeCompare(String(bStart || ""));
        });
        if (cityEvents.length > 0) {
          acc[cityKey] = cityEvents;
        }
        return acc;
      }, {}),
    [eventsByCity, sortedCities]
  );

  const qualityByEventKey = useMemo(
    () => {
      const currentQualityMap = qualityTick >= 0 ? getQualityMap() : {};
      return filteredEvents.reduce((acc, event) => {
        const eventKey = `${event.isGlobal ? "global" : "city"}-${event.id}`;
        const quality = getEntityQuality({
          targetType: "event",
          targetId: event.id,
          entity: event,
          map: currentQualityMap,
        });
        acc[eventKey] = {
          quality,
          qualityStatus: getQualityStatus(quality),
        };
        return acc;
      }, {});
    },
    [filteredEvents, qualityTick]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const dayEventCounts = useMemo(() => {
    const viewYear = currentDate.getFullYear();
    const viewMonth = currentDate.getMonth();
    const viewDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const counts = {};
    if (calendarEvents.length === 0) return counts;
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    const monthStart = `${monthPrefix}-01`;
    const monthEnd = `${monthPrefix}-${String(viewDaysInMonth).padStart(2, "0")}`;

    const incrementDateString = (dateStr) => {
      const [yearPart, monthPart, dayPart] = dateStr.split("-").map((value) => Number(value));
      const next = new Date(Date.UTC(yearPart, monthPart - 1, dayPart + 1));
      return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
    };

    for (const event of calendarEvents) {
      const startDate = String(event?.startDate || "").trim();
      if (!startDate) continue;
      const endDate = String(event?.endDate || startDate).trim() || startDate;

      const clampedStart = startDate < monthStart ? monthStart : startDate;
      const clampedEnd = endDate > monthEnd ? monthEnd : endDate;
      if (clampedStart > clampedEnd) continue;

      let cursor = clampedStart;
      while (cursor <= clampedEnd) {
        counts[cursor] = (counts[cursor] || 0) + 1;
        cursor = incrementDateString(cursor);
      }
    }

    return counts;
  }, [calendarEvents, currentDate]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    const dated = calendarEvents.reduce((acc, event) => {
      const startDate = String(event.startDate || "");
      if (!startDate) return acc;
      const startMs = new Date(startDate).getTime();
      if (!Number.isFinite(startMs)) return acc;
      acc.push({ event, startMs });
      return acc;
    }, []);

    const futureFirst = dated
      .filter((entry) => entry.startMs >= todayMs)
      .sort((a, b) => a.startMs - b.startMs)
      .map((entry) => entry.event);

    if (futureFirst.length >= 3) return futureFirst.slice(0, 3);

    const fallbackPast = dated
      .filter((entry) => entry.startMs < todayMs)
      .sort((a, b) => b.startMs - a.startMs)
      .map((entry) => entry.event);

    return [...futureFirst, ...fallbackPast].slice(0, 3);
  }, [calendarEvents]);
  const searchCityOptions = useMemo(() => {
    const counts = new Map();
    calendarEvents.forEach((event) => {
      const label = formatCityLabel(event.city || "Global");
      if (!label) return;
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [calendarEvents]);
  const searchVibeOptions = useMemo(() => {
    const counts = new Map();
    calendarEvents.forEach((event) => {
      normalizeEventVibeKeys(event).forEach((key) => {
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([key, count]) => ({
        key,
        label: titleCaseWords(key.replaceAll("_", " ")),
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [calendarEvents]);
  const searchResults = useMemo(() => {
    return calendarEvents.filter((event) => {
      if (searchDate && !eventOverlapsDate(event, searchDate)) return false;
      if (searchCity) {
        const cityLabel = formatCityLabel(event.city || "Global");
        if (cityLabel !== searchCity) return false;
      }
      if (searchVibe) {
        const tags = normalizeEventVibeKeys(event);
        if (!tags.includes(searchVibe)) return false;
      }
      return true;
    });
  }, [calendarEvents, searchCity, searchDate, searchVibe]);
  const hasActiveSearchFilter = Boolean(searchDate || searchCity || searchVibe);
  const activeCities = useMemo(
    () => new Set(events.map((event) => event.city).filter(Boolean)).size,
    [events]
  );
  const eventsThisMonth = useMemo(
    () => {
      const viewYear = currentDate.getFullYear();
      const viewMonth = currentDate.getMonth();
      return (
      calendarEvents.filter((event) => {
          return eventOverlapsMonth(event, viewYear, viewMonth);
        }).length
      );
    },
    [calendarEvents, currentDate]
  );
  const metricsForCards = useMemo(
    () => ({
      allEvents:
        Number.isFinite(Number(dailyMetricsSnapshot?.allEvents))
          ? Number(dailyMetricsSnapshot.allEvents)
          : calendarEvents.length,
      activeCities:
        Number.isFinite(Number(dailyMetricsSnapshot?.activeCities))
          ? Number(dailyMetricsSnapshot.activeCities)
          : activeCities,
      thisMonth:
        Number.isFinite(Number(dailyMetricsSnapshot?.thisMonth))
          ? Number(dailyMetricsSnapshot.thisMonth)
          : eventsThisMonth,
    }),
    [activeCities, calendarEvents.length, dailyMetricsSnapshot, eventsThisMonth]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(EVENTS_METRICS_DAILY_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (String(parsed?.dateKey || "") !== getLocalDateKey()) return;
      queueMicrotask(() => {
        setDailyMetricsSnapshot({
          dateKey: String(parsed.dateKey),
          allEvents: Number(parsed.allEvents) || 0,
          activeCities: Number(parsed.activeCities) || 0,
          thisMonth: Number(parsed.thisMonth) || 0,
        });
      });
    } catch {
      // Ignore local cache parse issues.
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const dateKey = getLocalDateKey();
    if (String(dailyMetricsSnapshot?.dateKey || "") === dateKey) return;

    const nextSnapshot = {
      dateKey,
      allEvents: Number(calendarEvents.length) || 0,
      activeCities: Number(activeCities) || 0,
      thisMonth: Number(eventsThisMonth) || 0,
    };

    try {
      localStorage.setItem(EVENTS_METRICS_DAILY_CACHE_KEY, JSON.stringify(nextSnapshot));
    } catch {
      // Ignore local cache write issues.
    }

    queueMicrotask(() => {
      setDailyMetricsSnapshot(nextSnapshot);
    });
  }, [activeCities, calendarEvents.length, dailyMetricsSnapshot?.dateKey, eventsThisMonth, isLoading]);

  const handleReport = (event, clickEvent) => {
    clickEvent?.stopPropagation();
    setReportDraft(createReportDraftFromEvent(event, REPORT_REASONS[0].value));
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
      targetType: "event",
      targetId: String(reportDraft.targetId || ""),
      city: reportDraft.city || "Global",
      title: reportDraft.title,
      reason: selectedReason.label,
      message: details,
    });

    trackKpiEvent("report_submitted", {
      city: String(reportDraft.city || "Global"),
      targetType: "event",
      targetId: String(reportDraft.targetId || ""),
      memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      meta: { reason: selectedReason.label },
    });

    setReportModalOpen(false);
    showToast("Report sent to admin inbox.", { tone: "info", duration: 2400 });
  };

  const startEditGlobalEvent = (event, clickEvent) => {
    clickEvent?.stopPropagation();
    if (!isAdmin) return;

    setEditingGlobalEventId(String(event?.id || ""));
    setGlobalForm(buildGlobalFormFromEvent(event));
    setShowGlobalForm(true);
  };

  const resetGlobalForm = () => {
    setEditingGlobalEventId("");
    setGlobalForm(EMPTY_GLOBAL_FORM);
  };

  const saveGlobalEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!isMember) {
      setGlobalError("Join as member to add off-grid events.");
      return;
    }
    if (editingGlobalEventId && !isAdmin) {
      setGlobalError("Admin access required to edit off-grid events.");
      return;
    }
    const { startDate, endDateCandidate, payload } = buildGlobalEventPayloadFromForm(globalForm);

    if (!globalForm.name || !startDate || !globalForm.location) return;
    if (endDateCandidate && endDateCandidate < startDate) {
      setGlobalError("End date must be the same day or after start date.");
      return;
    }
    setIsSavingGlobal(true);
    setGlobalError("");

    const { data, error } = editingGlobalEventId
      ? await updateGlobalEventRecord(editingGlobalEventId, payload)
      : await insertGlobalEventRecord(payload);

    if (error || !data) {
      const code = String(error?.code || "").trim();
      const message = String(error?.message || error?.details || "Unknown error").trim();
      const hint = String(error?.hint || "").trim();
      const suffix = [code ? `[${code}]` : "", message, hint].filter(Boolean).join(" ");
      setGlobalError(`Could not save off-grid event to Supabase yet. ${suffix}`);
      logDevError("Off-grid save failed", { error, payload, editingGlobalEventId });
      setIsSavingGlobal(false);
      return;
    }

    const createdId = String(data.id);
    setGlobalEvents((current) => {
      const mapped = mapGlobalEventRow(data);
      if (editingGlobalEventId) {
        return current.map((item) => (String(item.id) === createdId ? mapped : item));
      }
      return [mapped, ...current];
    });

    if (!editingGlobalEventId) {
      trackKpiEvent("event_added", {
        city: "Global",
        targetType: "event",
        targetId: createdId,
      });
    }

    upsertQuality({
      targetType: "event",
      targetId: createdId,
      source: globalForm.source,
      lastChecked: globalForm.lastChecked,
      verified: Boolean(globalForm.source && globalForm.lastChecked),
    });

    resetGlobalForm();
    setShowGlobalForm(false);
    setIsSavingGlobal(false);
  };

  const deleteGlobalEvent = useCallback(
    async (eventId, clickEvent) => {
      clickEvent?.stopPropagation();
      if (!isAdmin) {
        setGlobalError("Admin access required to delete off-grid events.");
        return;
      }
      const id = String(eventId || "").trim();
      if (!id) return;
      setDeletingGlobalEventId(id);
      setGlobalError("");
      try {
        const { error } = await supabase.from("global_events").delete().eq("id", id);
        if (error) {
          setGlobalError(`Could not delete off-grid event: ${String(error.message || "unknown error")}`);
          return;
        }
        setGlobalEvents((current) => current.filter((item) => String(item.id || "") !== id));
        showToast("Off-grid event deleted.", { tone: "success", duration: 1800 });
      } finally {
        setDeletingGlobalEventId("");
      }
    },
    [isAdmin, showToast]
  );

  const openCityEdit = (event, clickEvent) => {
    clickEvent?.stopPropagation();
    if (!isAdmin || event?.isGlobal) return;

    const normalized = normalizeEventRange(event || {});
    setCityEditError("");
    const eventVibe = String(event?.vibe || "");
    const eventVibeTags = normalizeVibeTags(
      Array.isArray(event?.vibe_tags) && event.vibe_tags.length > 0
        ? event.vibe_tags
        : inferVibeTagsFromLegacyVibe(eventVibe),
      { max: 3 }
    );
    setCityEditDraft({
      id: String(event?.id || ""),
      city: String(event?.city || ""),
      name: String(event?.name || ""),
      startDate: String(normalized.startDate || ""),
      endDate: String(normalized.endDate || ""),
      location: String(event?.location || ""),
      vibe: eventVibe,
      vibe_tags: eventVibeTags,
      description: String(event?.description || ""),
      link: String(event?.link || ""),
    });
    setCityEditOpen(true);
  };

  const closeCityEdit = () => {
    if (isSavingCityEdit) return;
    setCityEditOpen(false);
    setCityEditError("");
  };

  const saveCityEdit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!isAdmin) {
      setCityEditError("Admin access required to edit events.");
      return;
    }

    const startDate = String(cityEditDraft.startDate || "").trim();
    const endDateCandidate = String(cityEditDraft.endDate || "").trim();
    const endDate = endDateCandidate && endDateCandidate >= startDate ? endDateCandidate : startDate;

    if (!cityEditDraft.id || !cityEditDraft.name || !startDate) {
      setCityEditError("Name and start date are required.");
      return;
    }
    if (endDateCandidate && endDateCandidate < startDate) {
      setCityEditError("End date must be the same day or after start date.");
      return;
    }

    setIsSavingCityEdit(true);
    setCityEditError("");

    const payload = {
      name: cityEditDraft.name,
      date: startDate,
      start_date: startDate,
      end_date: endDate || startDate,
      location: cityEditDraft.location || null,
      vibe: cityEditDraft.vibe || null,
      vibe_tags: normalizeVibeTags(cityEditDraft.vibe_tags, { max: 3 }),
      description: cityEditDraft.description || null,
      link: cityEditDraft.link || null,
    };

    const { data, error } = await updateCityEventRecord(cityEditDraft.id, payload);
    if (error || !data) {
      const code = String(error?.code || "").trim();
      const message = String(error?.message || error?.details || "Unknown error").trim();
      const hint = String(error?.hint || "").trim();
      const suffix = [code ? `[${code}]` : "", message, hint].filter(Boolean).join(" ");
      setCityEditError(`Could not save event changes yet. ${suffix}`);
      logDevError("City event save failed", { error, payload, cityEditId: cityEditDraft.id });
      setIsSavingCityEdit(false);
      return;
    }

    const normalized = normalizeEventRange(data);
    setEvents((current) => current.map((item) => (
      String(item.id) === String(cityEditDraft.id)
        ? { ...item, ...normalized }
        : item
    )));

    setIsSavingCityEdit(false);
    setCityEditOpen(false);
    showToast("Event updated.", { tone: "success", duration: 1900 });
  };

  const focusOffgridEvent = useCallback((eventId) => {
    const id = String(eventId || "").trim();
    if (!id) return;

    setOffgridEventParam(id);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search || "");
      params.set("offgridEventId", `global-${id}`);
      const query = params.toString();
      const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, "", url);
    }
  }, []);

  const openEvent = (event) => {
    const intent = resolveEventOpenIntent(event);
    if (intent.kind === "offgrid") {
      focusOffgridEvent(intent.id);
      return;
    }
    if (intent.kind === "city") {
      router.push(citySelectionPath(intent.city, { eventId: intent.id }));
    }
  };

  const selectCalendarDate = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;

    requestAnimationFrame(() => {
      eventListSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const openNowSignal = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    setSelectedDate(today);

    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      eventListSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const eventSectionButtons = useMemo(
    () => ([
      { id: "search", label: "Search" },
      { id: "calendar", label: "Calender" },
      { id: "offgrid", label: "Off-grid events" },
    ]),
    []
  );

  const scrollToEventsSection = useCallback((sectionId) => {
    const normalizedId = String(sectionId || "").trim();
    setActiveEventsSection(normalizedId);
  }, []);
  const showSearchSection = activeEventsSection === "search";
  const showCalendarSection = activeEventsSection === "calendar";
  const showOffgridSection = activeEventsSection === "offgrid";

  return (
    <main className="qa-page qa-events min-h-screen overflow-x-hidden bg-[#050608] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(56,189,248,0.12),transparent_25%),radial-gradient(circle_at_92%_14%,rgba(236,72,153,0.11),transparent_24%),radial-gradient(circle_at_45%_80%,rgba(249,115,22,0.10),transparent_30%),linear-gradient(180deg,#050608_0%,#090b10_48%,#050608_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute left-[-6%] top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5%] top-32 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-orange-400/8 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-[23rem] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="qa-shell relative">
          <section
            ref={overviewSectionRef}
            data-events-section-id="hero"
            className="qa-panel qa-premium-card overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(145deg,rgba(22,24,30,0.96),rgba(8,8,10,0.99))] px-6 py-7 shadow-[0_35px_120px_rgba(0,0,0,0.42)] sm:px-8"
          >
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="flex min-h-[380px] flex-col">
                <div className="qa-eyebrow inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-white/72 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />
                  Live Discovery + Event Signal
                </div>

                <div className="flex flex-1 items-center pt-3 sm:pt-4 xl:pt-0">
                  <div className="mx-auto w-full max-w-3xl text-center xl:mx-0 xl:max-w-none xl:text-left">
                    <h1 className="qa-display qa-h1 text-4xl font-semibold text-white sm:text-5xl xl:max-w-2xl xl:text-6xl">
                      Events Radar
                    </h1>

                    <p className="qa-lead mx-auto mt-5 max-w-2xl text-base text-white/68 sm:text-lg xl:mx-0">
                      Follow the global queer calendar with precision: discover what is live,
                      what is next, and where city energy is building right now.
                    </p>
                  </div>
                </div>

                <div className="mt-auto grid gap-2.5 pt-6 sm:grid-cols-3">
                  <div className="qa-card qa-premium-card rounded-2xl border border-cyan-300/24 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(255,255,255,0.03))] p-3.5 shadow-[0_14px_30px_rgba(6,182,212,0.16),0_8px_20px_rgba(0,0,0,0.24)] backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/72">All events</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{metricsForCards.allEvents}</p>
                  </div>
                  <div className="qa-card qa-premium-card rounded-2xl border border-fuchsia-300/24 bg-[linear-gradient(180deg,rgba(244,114,182,0.14),rgba(255,255,255,0.03))] p-3.5 shadow-[0_14px_30px_rgba(236,72,153,0.15),0_8px_20px_rgba(0,0,0,0.24)] backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Active cities</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{metricsForCards.activeCities}</p>
                  </div>
                  <div className="qa-card qa-premium-card rounded-2xl border border-orange-300/22 bg-[linear-gradient(180deg,rgba(251,146,60,0.14),rgba(255,255,255,0.03))] p-3.5 shadow-[0_14px_30px_rgba(249,115,22,0.15),0_8px_20px_rgba(0,0,0,0.24)] backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-100/75">This month</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{metricsForCards.thisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="qa-premium-card rounded-[30px] border border-cyan-200/18 bg-[linear-gradient(180deg,rgba(13,24,34,0.92),rgba(8,8,10,0.98))] p-5 shadow-[0_28px_84px_rgba(8,145,178,0.22),0_14px_36px_rgba(0,0,0,0.34)] backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">
                      Next up
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Upcoming signal
                    </h2>
                  </div>

                  <button
                    onClick={openNowSignal}
                    className="qa-action qa-cta-primary rounded-full border border-cyan-200/30 bg-cyan-200/14 px-4 py-2 text-xs text-cyan-50 transition hover:border-cyan-200/42 hover:bg-cyan-200/20"
                  >
                    Open Now
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {isLoading && (
                    <div className="space-y-3 rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/62">Loading upcoming signal</p>
                      <EventSkeletonCard tone="cyan" />
                      <EventSkeletonCard tone="cyan" />
                    </div>
                  )}
                  {upcomingEvents.map((event) => {
                    const quality = getEntityQuality({
                      targetType: "event",
                      targetId: event.id,
                      entity: event,
                      map: qualityMap,
                    });
                    const qualityStatus = getQualityStatus(quality);

                    return (
                    <div
                      key={`${event.isGlobal ? "global" : "city"}-${event.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => openEvent(event)}
                      onKeyDown={(keyEvent) => {
                        if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                          keyEvent.preventDefault();
                          openEvent(event);
                        }
                      }}
                      className="w-full rounded-2xl border border-cyan-200/15 bg-[linear-gradient(180deg,rgba(14,36,56,0.55),rgba(14,14,14,0.96))] p-4 text-left shadow-[0_16px_34px_rgba(8,145,178,0.16),0_8px_20px_rgba(0,0,0,0.28)] transition hover:-translate-y-[1px] hover:border-cyan-200/35 hover:shadow-[0_22px_42px_rgba(8,145,178,0.22),0_10px_24px_rgba(0,0,0,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/72">
                          {formatCityLabel(event.city)} | {formatEventDateLabel(event)}
                        </p>
                        <button
                          onClick={(clickEvent) => refreshQuality(event, clickEvent)}
                          className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}>
                          {qualityStatus.label}
                        </button>
                      </div>
                      <p className="mt-3 text-base font-semibold text-white">{event.name}</p>
                      <VibeTagChips entity={event} tone="amber" className="mt-2" includeMixedFallback />
                      {quality.lastChecked && (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
                          Checked {formatDateLabel(quality.lastChecked)}
                        </p>
                      )}
                    </div>
                    );
                  })}

                  {!isLoading && upcomingEvents.length === 0 && (
                    <EmptyState
                      title="No upcoming event signal yet."
                      description="Check all dates or add a new off-grid event."
                      className="px-4 py-8"
                      primaryActionLabel="Show all dates"
                      onPrimaryAction={() => setSelectedDate("")}
                    />
                  )}
                  {loadError && (
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
                      <p>{loadError}</p>
                      <button
                        onClick={loadAllEvents}
                        className="mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 mt-8">
            <PageControls
              controlsRef={eventsControlsRef}
              controlButtonsRef={eventsControlButtonsRef}
              buttons={eventSectionButtons}
              activeId={activeEventsSection}
              onSelect={scrollToEventsSection}
              className="qa-panel"
            />
          </section>

          {showSearchSection ? (
          <section
            ref={searchSectionRef}
            data-events-section-id="search"
            className="qa-premium-card mt-8 overflow-hidden rounded-[34px] border border-cyan-300/16 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(236,72,153,0.10),transparent_34%),linear-gradient(180deg,rgba(14,18,24,0.96),rgba(8,8,8,0.99))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)] sm:p-7"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/58">Search</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Find events by date, city, or vibe
                </h2>
              </div>
            </div>

            <div className="sticky top-2 z-30 -mx-2 mt-6 rounded-2xl border border-cyan-200/18 bg-[linear-gradient(180deg,rgba(6,10,14,0.95),rgba(6,10,14,0.90))] px-3 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur-xl md:mx-0 md:px-4 md:py-4">
              <div className="grid gap-3 md:grid-cols-4">
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-white/62">
                  Date
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(event) => setSearchDate(String(event.target.value || ""))}
                    className="rounded-xl border border-white/16 bg-white/6 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-200/55"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-white/62">
                  City
                  <select
                    value={searchCity}
                    onChange={(event) => setSearchCity(String(event.target.value || ""))}
                    className="rounded-xl border border-white/16 bg-white/6 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-200/55 [&>option]:bg-[#0b0f14] [&>option]:text-white"
                  >
                    <option value="">All cities</option>
                    {searchCityOptions.map((cityOption) => (
                      <option key={`city-option-${cityOption.label}`} value={cityOption.label}>
                        {cityOption.label} ({cityOption.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-white/62">
                  Vibe
                  <select
                    value={searchVibe}
                    onChange={(event) => setSearchVibe(String(event.target.value || ""))}
                    className="rounded-xl border border-white/16 bg-white/6 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-200/55 [&>option]:bg-[#0b0f14] [&>option]:text-white"
                  >
                    <option value="">All vibes</option>
                    {searchVibeOptions.map((vibeOption) => (
                      <option key={`vibe-option-${vibeOption.key}`} value={vibeOption.key}>
                        {vibeOption.label} ({vibeOption.count})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchDate("");
                      setSearchCity("");
                      setSearchVibe("");
                    }}
                    disabled={!hasActiveSearchFilter}
                    className="w-full rounded-xl border border-white/16 bg-white/8 px-4 py-2 text-sm text-white/80 transition hover:border-white/28 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Clear filters
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <p className="text-sm text-white/70">
                  {searchResults.length} {searchResults.length === 1 ? "event match" : "event matches"}
                </p>
                <p className="text-xs text-white/50">
                  {searchCityOptions.length} cities | {searchVibeOptions.length} vibes
                </p>
              </div>
            </div>

            <div className="qa-defer-render mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
              {searchResults.length === 0 ? (
                <EmptyState
                  title="No events found."
                  description="Try another date, city, or vibe."
                  className="px-5 py-7"
                />
              ) : (
                searchResults.slice(0, 50).map((event) => (
                  <button
                    key={`search-event-${event.isGlobal ? "global" : "city"}-${event.id}`}
                    type="button"
                    onClick={() => openEvent(event)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-200/30 hover:bg-white/[0.07]"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/74">
                      {formatCityLabel(event.city || "Global")} | {formatEventDateLabel(event)}
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">{event.name}</p>
                    <VibeTagChips entity={event} tone="amber" className="mt-2" includeMixedFallback />
                  </button>
                ))
              )}
            </div>
          </section>
          ) : null}

          {showCalendarSection ? (
          <section
            ref={calendarSectionRef}
            data-events-section-id="calendar"
            className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="qa-premium-card relative overflow-hidden rounded-[34px] border border-cyan-300/16 bg-[radial-gradient(circle_at_14%_10%,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_85%_12%,rgba(168,85,247,0.14),transparent_34%),radial-gradient(circle_at_50%_85%,rgba(249,115,22,0.10),transparent_40%),linear-gradient(180deg,rgba(17,20,24,0.96),rgba(9,10,12,0.99))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)]">
              <div className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-fuchsia-500/14 blur-3xl" />
              <div className="pointer-events-none absolute -right-12 top-16 h-52 w-52 rounded-full bg-blue-500/14 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-96px] left-1/3 h-56 w-56 rounded-full bg-orange-400/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-fuchsia-200/28 to-transparent" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-fuchsia-100/58">
                    Calendar
                  </p>
                  <h2 className="mt-2 bg-gradient-to-r from-fuchsia-100 via-white to-cyan-100 bg-clip-text text-2xl font-semibold tracking-[-0.03em] text-transparent">
                    {monthName} {year}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-4 py-2 text-sm text-fuchsia-100/85 transition hover:border-fuchsia-200/35 hover:bg-fuchsia-200/16 hover:text-white"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100/85 transition hover:border-cyan-200/35 hover:bg-cyan-200/16 hover:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="relative mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => selectCalendarDate("")}
                    className={`qa-action rounded-full border px-4 py-2 text-sm transition ${
                    !selectedDate
                      ? "border-cyan-300/38 bg-cyan-300/16 text-cyan-100"
                      : "border-white/14 bg-white/8 text-white/72 hover:border-white/22 hover:text-white"
                  }`}
                >
                  All dates
                </button>

                {selectedDate && (
                  <div className="rounded-full border border-orange-200/20 bg-orange-200/8 px-4 py-2 text-sm text-orange-100">
                    {formatDateLabel(selectedDate)}
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-7 gap-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="rounded-xl border border-white/6 bg-white/[0.03] px-2 py-2 text-center">
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {[...Array(firstDay)].map((_, index) => (
                  <div key={`empty-${index}`} className="h-20 rounded-2xl border border-transparent sm:h-24" />
                ))}

                {[...Array(daysInMonth)].map((_, index) => {
                  const day = index + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const eventsCount = dayEventCounts[dateStr] || 0;
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => selectCalendarDate(dateStr)}
                      className={`h-20 rounded-2xl border p-2 text-left transition sm:h-24 sm:p-3 ${
                        isSelected
                          ? "border-fuchsia-200/72 bg-[linear-gradient(180deg,rgba(232,121,249,0.20),rgba(76,29,149,0.34))] shadow-[0_0_0_1px_rgba(244,114,182,0.45),0_18px_44px_rgba(168,85,247,0.30)]"
                          : eventsCount > 0
                            ? "border-cyan-300/38 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.02))] shadow-[0_0_0_1px_rgba(56,189,248,0.14)] hover:border-cyan-200/52 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(255,255,255,0.03))] hover:shadow-[0_0_0_1px_rgba(103,232,249,0.30),0_14px_32px_rgba(6,182,212,0.20)]"
                            : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] hover:border-white/18 hover:bg-white/8"
                      }`}
                    >
                      <p className={`inline-block whitespace-nowrap break-normal [overflow-wrap:normal] [word-break:normal] text-[13px] font-semibold leading-none tracking-normal sm:text-sm sm:font-medium ${
                        isSelected ? "text-white" : eventsCount > 0 ? "text-cyan-100" : "text-white"
                      }`}>
                        {day}
                      </p>

                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={eventListSectionRef} className="qa-premium-card relative overflow-hidden rounded-[34px] border border-fuchsia-300/16 bg-[radial-gradient(circle_at_86%_10%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_18%_20%,rgba(236,72,153,0.14),transparent_35%),linear-gradient(180deg,rgba(18,18,20,0.96),rgba(8,8,8,1))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)]">
              <div className="pointer-events-none absolute -right-10 top-24 h-48 w-48 rounded-full bg-cyan-500/12 blur-3xl" />
              <div className="pointer-events-none absolute -left-12 bottom-12 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-8 top-20 h-px bg-gradient-to-r from-transparent via-cyan-200/24 to-transparent" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/58">
                    Event list
                  </p>
                  <h2 className="mt-2 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-2xl font-semibold tracking-[-0.03em] text-transparent">
                    {selectedDate ? `Events on ${formatDateLabel(selectedDate)}` : "All events"}
                  </h2>
                </div>

              </div>
              <div className="qa-defer-render mt-6 max-h-[900px] space-y-6 overflow-y-auto pr-1">
                {isLoading && (
                  <div className="space-y-3">
                    <EventSkeletonCard tone="cyan" />
                    <EventSkeletonCard tone="cyan" />
                    <EventSkeletonCard tone="cyan" />
                  </div>
                )}
                {sortedCities.map((cityKey) => {
                  const cityGroup = eventsByCity[cityKey];
                  const cityEvents = sortedEventsByCity[cityKey] || [];
                  const cityLabel = cityGroup?.label || formatCityLabel(cityKey);

                  if (!cityEvents || cityEvents.length === 0) return null;

                  return (
                    <section key={cityKey}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">{cityLabel}</h3>
                      </div>

                      <div className="space-y-3">
                        {cityEvents.map((event) => {
                          const eventKey = `${event.isGlobal ? "global" : "city"}-${event.id}`;
                          const qualityEntry = qualityByEventKey[eventKey];
                          const quality = qualityEntry?.quality;
                          const qualityStatus = qualityEntry?.qualityStatus || getQualityStatus(quality);

                          return (
                          <div
                            key={eventKey}
                            role="button"
                            tabIndex={0}
                            onClick={() => openEvent(event)}
                            onKeyDown={(keyEvent) => {
                              if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                                keyEvent.preventDefault();
                                openEvent(event);
                              }
                            }}
                            className="qa-premium-card cursor-pointer rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition hover:-translate-y-[1px] hover:border-cyan-200/28 hover:shadow-[0_24px_54px_rgba(6,182,212,0.14),0_12px_30px_rgba(0,0,0,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200/70">
                                  {event.isGlobal ? "Global off-grid event" : "Community event"}
                                </p>
                                <h4 className="mt-2 text-xl font-semibold text-white">
                                  {event.name}
                                </h4>
                              </div>

                              {event.startDate && (
                                <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-xs text-fuchsia-100">
                                  {formatEventDateLabel(event)}
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <button
                                onClick={(clickEvent) => refreshQuality(event, clickEvent)}
                                disabled={event.isGlobal && !isAdmin}
                                className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 ${qualityPillClass(qualityStatus.tone)}`}>
                                {qualityStatus.label}
                              </button>
                            </div>
                            {quality.lastChecked && (
                              <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/50">
                                Checked {formatDateLabel(quality.lastChecked)}
                              </p>
                            )}

                            <div className="mt-4 rounded-2xl border border-white/6 bg-black/20 p-4">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-white/36">
                                About event
                              </p>
                              <p className="mt-3 text-sm leading-7 text-white/68">
                                {event.description || "No description yet."}
                              </p>
                              <VibeTagChips entity={event} tone="amber" className="mt-3" includeMixedFallback />
                              {event.isGlobal && event.location && (
                                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-200/75">
                                  Location: {event.location}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                              <button
                                onClick={(eventClick) => saveEventToFavorites(event, eventClick)}
                                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                                  favoriteIdSet.has(`event-${String(event.id)}`)
                                    ? "cursor-default border-emerald-200/28 bg-emerald-200/12 text-emerald-100"
                                    : "border-emerald-200/20 bg-emerald-200/8 text-emerald-100/90 hover:border-emerald-200/34 hover:bg-emerald-200/14"
                                }`}
                              >
                                {favoriteIdSet.has(`event-${String(event.id)}`) ? "Saved" : "Save event"}
                              </button>
                              {event.link && (
                                <a
                                  href={event.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(eventClick) => eventClick.stopPropagation()}
                                  className="qa-action qa-cta-primary rounded-2xl bg-gradient-to-r from-cyan-200 via-sky-200 to-fuchsia-200 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:opacity-95"
                                >
                                  Open official link
                                </a>
                              )}

                              {!event.isGlobal && (
                                <button
                                  onClick={(eventClick) => {
                                    eventClick.stopPropagation();
                                    router.push(
                                      citySelectionPath(event.city, {
                                        eventId: event.id,
                                        extraParams: { lat: event.lat, lng: event.lng },
                                      })
                                    );
                                  }}
                                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/72 transition hover:border-white/16 hover:bg-white/8 hover:text-white"
                                >
                                  Show on map
                                </button>
                              )}

                              {!event.isGlobal && isAdmin && (
                                <button
                                  onClick={(eventClick) => openCityEdit(event, eventClick)}
                                  className="rounded-2xl border border-emerald-200/24 bg-emerald-200/10 px-4 py-3 text-sm text-emerald-100 transition hover:border-emerald-200/36 hover:bg-emerald-200/16"
                                >
                                  Edit event
                                </button>
                              )}

                              <button
                                onClick={(eventClick) => handleReport(event, eventClick)}
                                className="rounded-2xl border border-rose-200/24 bg-rose-200/10 px-4 py-3 text-sm text-rose-100 transition hover:border-rose-200/36 hover:bg-rose-200/16"
                              >
                                Report event
                              </button>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                {!isLoading && sortedCities.length === 0 && (
                  <EmptyState
                    title="No events match this date yet."
                    description="Try all dates or add a new off-grid entry."
                    className="rounded-[28px]"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedDate("")}
                        className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
                      >
                        Show all dates
                      </button>
                      <button
                        onClick={() => {
                          if (!isMember) return;
                          setShowGlobalForm(true);
                        }}
                        disabled={!isMember}
                        className="qa-action rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/32 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {isMember ? "Add off-grid event" : "Members only"}
                      </button>
                    </div>
                  </EmptyState>
                )}
              </div>
            </div>
          </section>
          ) : null}

          {showOffgridSection ? (
          <section
            ref={offgridSectionRef}
            data-events-section-id="offgrid"
            className="qa-premium-card mt-8 overflow-hidden rounded-[34px] border border-emerald-300/14 bg-[linear-gradient(165deg,rgba(16,20,18,0.96),rgba(8,8,8,0.98))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)] sm:p-7"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-emerald-100/58">
                  Off-grid calendar
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Add global events outside city pages
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
                  For queer cruises, ski weekends, destination pop-ups, and nomadic party formats.
                  Use this when an event does not belong to any city in our atlas yet.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!isMember) return;
                  setShowGlobalForm((current) => !current);
                  if (showGlobalForm) {
                    resetGlobalForm();
                  }
                }}
                disabled={!isMember}
                className="qa-action rounded-2xl border border-cyan-300/24 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/38 hover:bg-cyan-300/14 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {showGlobalForm ? "Close form" : "Add off-grid event"}
              </button>
            </div>

            <GlobalEventForm
              open={isMember && showGlobalForm}
              editingGlobalEventId={editingGlobalEventId}
              globalForm={globalForm}
              setGlobalForm={setGlobalForm}
              isSavingGlobal={isSavingGlobal}
              onSubmit={saveGlobalEvent}
              onCancelEdit={resetGlobalForm}
            />

            {globalError && (
              <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
                {globalError}
              </div>
            )}

            <div className="qa-defer-render mt-6 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <EventSkeletonCard tone="cyan" />
                  <EventSkeletonCard tone="cyan" />
                </div>
              ) : globalEvents.length === 0 ? (
                <EmptyState
                  title="No off-grid events yet."
                  description="Add cruises, ski weekends, and destination events here."
                  className="px-5 py-7"
                  primaryActionLabel={isMember ? "Add off-grid event" : "Open all events"}
                  onPrimaryAction={() => {
                    if (isMember) {
                      setShowGlobalForm(true);
                      return;
                    }
                    router.push("/events");
                  }}
                />
              ) : (
                displayedGlobalEvents.map((event) => (
                  (() => {
                    const quality = getEntityQuality({
                      targetType: "event",
                      targetId: event.id,
                      entity: event,
                      map: qualityMap,
                    });
                    const qualityStatus = getQualityStatus(quality);
                    const isFocused = normalizedFocusedOffgridId && String(event.id) === String(normalizedFocusedOffgridId);

                    return (
                  <div
                    id={`offgrid-event-${event.id}`}
                    key={event.id}
                    className={`rounded-2xl border p-4 transition ${
                      isFocused
                        ? "border-cyan-200/55 bg-[linear-gradient(180deg,rgba(34,211,238,0.20),rgba(10,10,10,0.94))] shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_24px_80px_rgba(34,211,238,0.18)]"
                        : "border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-semibold text-white">{event.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">
                          {formatEventDateLabel(event)}
                        </span>
                        <button
                          onClick={(clickEvent) => refreshQuality(event, clickEvent)}
                          disabled={!isAdmin}
                          className={`rounded-full border px-3 py-1 text-xs transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 ${qualityPillClass(qualityStatus.tone)}`}>
                          {qualityStatus.label}
                        </button>
                      </div>
                    </div>
                    {quality.lastChecked && (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/50">
                        Checked {formatDateLabel(quality.lastChecked)}
                      </p>
                    )}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-200/72">
                      {event.location}
                    </p>
                    <VibeTagChips entity={event} tone="amber" className="mt-2" includeMixedFallback />
                    {event.description && (
                      <p className="mt-3 text-sm leading-7 text-white/66">{event.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-xl border border-cyan-200/24 bg-cyan-200/10 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/36 hover:bg-cyan-200/14"
                        >
                          Open official link
                        </a>
                      )}
                      {isAdmin && (
                        <button
                          onClick={(clickEvent) => startEditGlobalEvent(event, clickEvent)}
                          className="inline-flex rounded-xl border border-emerald-200/24 bg-emerald-200/10 px-3 py-2 text-xs text-emerald-100 transition hover:border-emerald-200/36 hover:bg-emerald-200/16"
                        >
                          Edit event
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={(clickEvent) => deleteGlobalEvent(event.id, clickEvent)}
                          disabled={deletingGlobalEventId === String(event.id || "")}
                          className="inline-flex rounded-xl border border-rose-300/24 bg-rose-300/10 px-3 py-2 text-xs text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-300/16 disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          {deletingGlobalEventId === String(event.id || "") ? "Deleting..." : "Delete event"}
                        </button>
                      )}
                      <button
                        onClick={(clickEvent) => handleReport(event, clickEvent)}
                        className="inline-flex rounded-xl border border-rose-200/24 bg-rose-200/10 px-3 py-2 text-xs text-rose-100 transition hover:border-rose-200/36 hover:bg-rose-200/16"
                      >
                        Report event
                      </button>
                    </div>
                  </div>
                    );
                  })()
                ))
              )}
            </div>
          </section>
          ) : null}
        </div>
      </div>
      <CityEventEditModal
        open={cityEditOpen}
        draft={cityEditDraft}
        setDraft={setCityEditDraft}
        error={cityEditError}
        isSaving={isSavingCityEdit}
        onClose={closeCityEdit}
        onSubmit={saveCityEdit}
      />
      <EventReportModal
        open={reportModalOpen}
        draft={reportDraft}
        setDraft={setReportDraft}
        reasons={REPORT_REASONS}
        onClose={closeReportModal}
        onSubmit={submitReport}
      />
      <EventQualityModal
        open={qualityModal.open}
        modal={qualityModal}
        setModal={setQualityModal}
        actions={TRUST_ACTIONS}
        onClose={closeQualityModal}
        onSubmit={submitQualityModal}
      />
      <ActionToast toast={toast} />
    </main>
  );
}


