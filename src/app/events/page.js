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
import { mapGlobalEventRow, qualityPillClass } from "@/features/events/eventViewUtils";
import { ADDED_STORAGE_KEY, FAVORITES_STORAGE_KEY } from "@/features/favorites/favoritesStateDefaults";
import { addFavoriteLocalState, mergeFavoriteIds } from "@/features/favorites/logic/favoritesMutations";
import CityEventEditModal from "@/components/events/CityEventEditModal";
import EventSkeletonCard from "@/components/events/EventSkeletonCard";
import EventReportModal from "@/components/events/EventReportModal";
import EventQualityModal from "@/components/events/EventQualityModal";
import GlobalEventForm from "@/components/events/GlobalEventForm";
import HappeningSoonPanel from "@/components/events/HappeningSoonPanel";
import EmptyState from "@/components/ui/EmptyState";
import ActionToast from "@/components/ui/ActionToast";
import PageControls from "@/components/ui/PageControls";
import VibeTagChips from "@/components/ui/VibeTagChips";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEventDateBadgeParts(event = {}) {
  const { startDate } = normalizeEventRange(event);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startDate || ""))) {
    return { day: "--", month: "TBA" };
  }

  const [, monthNumber, dayNumber] = startDate.split("-").map(Number);
  const badgeDate = new Date(2000, monthNumber - 1, dayNumber);
  return {
    day: String(dayNumber),
    month: badgeDate.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function normalizeExternalUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
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

function resolveEventEffectiveEndDate(event = {}) {
  const endDate = String(event?.endDate || event?.end_date || "").trim();
  if (endDate) return endDate;
  const startDate = String(event?.startDate || event?.start_date || "").trim();
  if (startDate) return startDate;
  return String(event?.date || "").trim();
}

function isExpiredEvent(event = {}, todayIso = "") {
  const effectiveEndDate = resolveEventEffectiveEndDate(event);
  if (!effectiveEndDate || !todayIso) return false;
  return effectiveEndDate < todayIso;
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

export default function EventsPage({ initialSection = "calendar" }) {
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
  const [, setQualityTick] = useState(0);
  const [globalEvents, setGlobalEvents] = useState([]);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [offgridVisibleLimit, setOffgridVisibleLimit] = useState(6);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingGlobalEventId, setEditingGlobalEventId] = useState("");
  const [globalForm, setGlobalForm] = useState(EMPTY_GLOBAL_FORM);
  const [selectedDate, setSelectedDate] = useState("");
  const [agendaVisibleLimit, setAgendaVisibleLimit] = useState(5);
  const [searchDate, setSearchDate] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchVibe, setSearchVibe] = useState("");
  const [searchVisibleLimit, setSearchVisibleLimit] = useState(8);
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
    ticket_url: "",
  });
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState(() => createInitialReportDraft(REPORT_REASONS[0].value));
  const [qualityModal, setQualityModal] = useState(() => createInitialQualityModal());
  const [offgridEventParam, setOffgridEventParam] = useState(() => {
    if (typeof window === "undefined") return "";
    return String(new URLSearchParams(window.location.search).get("offgridEventId") || "").trim();
  });
  const [favoriteIds, setFavoriteIds] = useState(() => readLocalJson(FAVORITES_STORAGE_KEY, []));
  const [addedEntries, setAddedEntries] = useState(() => readLocalJson(ADDED_STORAGE_KEY, []));
  const [activeEventsSection, setActiveEventsSection] = useState(initialSection);
  const [happeningInitialScope] = useState(() => {
    if (typeof window === "undefined") return "month";
    const value = String(new URLSearchParams(window.location.search).get("scope") || "");
    return ["tonight", "weekend", "month"].includes(value) ? value : "month";
  });

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
    const todayIso = getLocalDateKey();
    const offGrid = globalEvents.map((event) => ({
      ...event,
      city: "Global",
      isGlobal: true,
    }));
    return [...events, ...offGrid]
      .map((event) => normalizeEventRange(event))
      .filter((event) => !blockedEventIds.has(String(event.id)))
      .filter((event) => !isExpiredEvent(event, todayIso));
  }, [blockedEventIds, events, globalEvents]);

  const filteredEvents = useMemo(() => {
    const datedEvents = calendarEvents.filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(String(event?.startDate || "")));
    return selectedDate
      ? datedEvents.filter((event) => eventOverlapsDate(event, selectedDate))
      : datedEvents;
  }, [calendarEvents, selectedDate]);

  const displayedGlobalEvents = useMemo(
    () => (normalizedFocusedOffgridId ? globalEvents : globalEvents.slice(0, offgridVisibleLimit)),
    [globalEvents, normalizedFocusedOffgridId, offgridVisibleLimit]
  );

  const eventsByCity = useMemo(() => (
    filteredEvents.reduce((acc, event) => {
      const cityKey = normalizeCityKey(event.city || "Other");
      const cityLabel = formatCityLabel(event.city || "Other");
      if (!acc[cityKey]) acc[cityKey] = { label: cityLabel, events: [] };
      acc[cityKey].events.push(event);
      return acc;
    }, {})
  ), [filteredEvents]);
  const sortedCities = useMemo(() => (
    Object.keys(eventsByCity).sort((a, b) => (
      (eventsByCity[a]?.label || formatCityLabel(a)).localeCompare(eventsByCity[b]?.label || formatCityLabel(b))
    ))
  ), [eventsByCity]);
  const sortedEventsByCity = useMemo(() => (
    sortedCities.reduce((acc, cityKey) => {
      const cityEvents = (eventsByCity[cityKey]?.events || []).slice().sort((a, b) =>
        String(a?.startDate || "").localeCompare(String(b?.startDate || ""))
      );
      if (cityEvents.length) acc[cityKey] = cityEvents;
      return acc;
    }, {})
  ), [eventsByCity, sortedCities]);
  const agendaEvents = useMemo(
    () => sortedCities.flatMap((cityKey) => sortedEventsByCity[cityKey] || []),
    [sortedCities, sortedEventsByCity]
  );
  const visibleAgendaEventKeys = useMemo(() => new Set(
    agendaEvents.slice(0, agendaVisibleLimit).map((event) => `${event.isGlobal ? "global" : "city"}-${event.id}`)
  ), [agendaEvents, agendaVisibleLimit]);
  const visibleAgendaCities = useMemo(() => sortedCities.filter((cityKey) =>
    (sortedEventsByCity[cityKey] || []).some((event) =>
      visibleAgendaEventKeys.has(`${event.isGlobal ? "global" : "city"}-${event.id}`)
    )
  ), [sortedCities, sortedEventsByCity, visibleAgendaEventKeys]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });
  const displayMonthName = titleCaseWords(monthName);
  const todayDateKey = getLocalDateKey();
  const isViewingCurrentMonth = todayDateKey.startsWith(
    `${year}-${String(month + 1).padStart(2, "0")}`
  );

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
      ticket_url: String(event?.ticket_url || event?.ticketUrl || ""),
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
      ticket_url: String(cityEditDraft.ticket_url || "").trim() || null,
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
      setActiveEventsSection("offgrid");
      focusOffgridEvent(intent.id);
      return;
    }
    if (intent.kind === "city") {
      router.push(citySelectionPath(intent.city, { eventId: intent.id }));
    }
  };

  const selectCalendarDate = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    setAgendaVisibleLimit(5);
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;

    requestAnimationFrame(() => {
      eventListSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const clearCalendarDate = useCallback(() => {
    setSelectedDate("");
    setAgendaVisibleLimit(5);
  }, []);

  const eventSectionButtons = useMemo(
    () => ([
      { id: "calendar", label: "Calendar", href: "/events/calendar" },
      { id: "offgrid", label: "Off-grid events", href: "/events/off-grid" },
      { id: "search", label: "Search", href: "/events/search" },
      { id: "happening", label: "Happening soon", href: "/events/happening-soon" },
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
  const showHappeningSection = activeEventsSection === "happening";

  return (
    <main className="qa-page qa-events min-h-screen overflow-x-hidden bg-[#050608] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(56,189,248,0.12),transparent_25%),radial-gradient(circle_at_92%_14%,rgba(236,72,153,0.11),transparent_24%),radial-gradient(circle_at_45%_80%,rgba(249,115,22,0.10),transparent_30%),linear-gradient(180deg,#050608_0%,#090b10_48%,#050608_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute left-[-6%] top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5%] top-32 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-orange-400/8 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-[23rem] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="qa-shell relative md:!pb-32">
          <div className="flex flex-col">
          <section
            ref={overviewSectionRef}
            data-events-section-id="hero"
            className="relative order-1 overflow-hidden border-b border-white/[0.08] px-1 pb-5 pt-2 sm:px-2 sm:pb-7 sm:pt-5"
          >
            <div className="pointer-events-none absolute -left-24 top-0 h-40 w-80 rounded-full bg-cyan-400/[0.055] blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/52">Queer Atlas</p>
              <h1 className="qa-display mt-2 text-[2.8rem] font-semibold leading-[0.92] tracking-[-0.055em] text-white sm:text-7xl">Events</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/58 sm:mt-4 sm:text-lg">What&apos;s happening in queer cities now and next.</p>

              <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                <button type="button" onClick={() => router.push("/events/happening-soon?scope=tonight")} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-100">Tonight</button>
                <button type="button" onClick={() => router.push("/events/happening-soon?scope=weekend")} className="rounded-full border border-white/16 bg-white/[0.045] px-4 py-2 text-xs font-semibold text-white/76 transition hover:border-white/30 hover:text-white">This weekend</button>
                <button type="button" onClick={() => router.push("/events/search")} className="rounded-full border border-white/16 bg-transparent px-4 py-2 text-xs font-semibold text-white/58 transition hover:border-cyan-200/34 hover:text-cyan-50">Choose city</button>
              </div>

              {loadError ? <p className="mt-3 text-xs text-rose-100/68">Event data is temporarily unavailable.</p> : null}
            </div>
          </section>

          <section className="order-2 mb-5 mt-1 w-full sm:mb-7 sm:mt-2">
            <PageControls
              controlsRef={eventsControlsRef}
              controlButtonsRef={eventsControlButtonsRef}
              buttons={eventSectionButtons}
              activeId={activeEventsSection}
              onSelect={scrollToEventsSection}
              ariaLabel="Event sections"
              mobileCompact
              mobileLayout="fit"
              mobileLabelsById={{ offgrid: "Off-grid", happening: "Soon" }}
              variant="events-compact"
            />
          </section>
          </div>

          {showHappeningSection ? (
            <HappeningSoonPanel
              events={calendarEvents}
              isLoading={isLoading}
              initialScope={happeningInitialScope}
              onOpenEvent={openEvent}
              onOpenCalendar={() => router.push("/events/calendar")}
              onSaveEvent={saveEventToFavorites}
              isSaved={(event) => favoriteIdSet.has(`event-${String(event?.id || "")}`)}
            />
          ) : null}

          {showSearchSection ? (
          <section
            ref={searchSectionRef}
            data-events-section-id="search"
            className="qa-premium-card mt-8 overflow-hidden rounded-[30px] border border-cyan-300/14 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.10),transparent_32%),linear-gradient(180deg,rgba(14,18,24,0.97),rgba(8,8,10,0.99))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/58">Search</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Find events by date, city, or vibe
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-white/[0.09] bg-black/20 p-3 sm:p-4">
              <div className="grid gap-3 md:grid-cols-4">
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-white/62">
                  Date
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(event) => {
                      setSearchDate(String(event.target.value || ""));
                      setSearchVisibleLimit(8);
                    }}
                    className="rounded-xl border border-white/16 bg-white/6 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-200/55"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.16em] text-white/62">
                  City
                  <select
                    value={searchCity}
                    onChange={(event) => {
                      setSearchCity(String(event.target.value || ""));
                      setSearchVisibleLimit(8);
                    }}
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
                    onChange={(event) => {
                      setSearchVibe(String(event.target.value || ""));
                      setSearchVisibleLimit(8);
                    }}
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
                      setSearchVisibleLimit(8);
                    }}
                    disabled={!hasActiveSearchFilter}
                    className="w-full rounded-xl border border-white/16 bg-white/8 px-4 py-2 text-sm text-white/80 transition hover:border-white/28 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Clear filters
                  </button>
                </div>
              </div>

              {hasActiveSearchFilter ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.07] pt-3" aria-label="Active filters">
                  {searchDate ? <span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1 text-[11px] text-cyan-50">Date · {formatDateLabel(searchDate)}</span> : null}
                  {searchCity ? <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/[0.08] px-3 py-1 text-[11px] text-fuchsia-50">City · {searchCity}</span> : null}
                  {searchVibe ? <span className="rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-3 py-1 text-[11px] text-amber-50">Vibe · {titleCaseWords(searchVibe.replaceAll("_", " "))}</span> : null}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <p className="text-sm text-white/70">
                  {searchResults.length} {searchResults.length === 1 ? "event match" : "event matches"}
                </p>
                <p className="text-xs text-white/50">
                  {searchCityOptions.length} cities | {searchVibeOptions.length} vibes
                </p>
              </div>
            </div>

            <div className="qa-defer-render mt-4 space-y-3">
              {searchResults.length === 0 ? (
                <EmptyState
                  title="No events found."
                  description="Try another date, city, or vibe."
                  className="px-5 py-7"
                />
              ) : (
                searchResults.slice(0, searchVisibleLimit).map((event) => (
                  <button
                    key={`search-event-${event.isGlobal ? "global" : "city"}-${event.id}`}
                    type="button"
                    onClick={() => openEvent(event)}
                    className="group flex w-full items-start gap-3 rounded-[18px] border border-white/[0.09] bg-white/[0.035] p-3.5 text-left transition hover:-translate-y-px hover:border-cyan-200/28 hover:bg-white/[0.055] sm:items-center sm:p-4"
                  >
                    <span className="min-w-[70px] shrink-0 rounded-xl border border-cyan-200/14 bg-cyan-200/[0.06] px-2.5 py-2 text-center text-[11px] font-medium leading-5 text-cyan-50/82">
                      {formatEventDateLabel(event)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] uppercase tracking-[0.16em] text-white/42">
                        {formatCityLabel(event.city || "Global")}
                      </span>
                      <span className="mt-1 block text-base font-semibold text-white transition group-hover:text-cyan-50">{event.name}</span>
                      <span className="mt-1 line-clamp-1 block text-sm text-white/48">
                        {event.description || event.location || "Open event details"}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-xs font-medium text-cyan-100/65 transition group-hover:translate-x-0.5 group-hover:text-cyan-50 sm:inline">View →</span>
                  </button>
                ))
              )}
              {searchResults.length > searchVisibleLimit ? (
                <div className="flex flex-col items-center gap-2 border-t border-white/[0.07] pt-5">
                  <button
                    type="button"
                    onClick={() => setSearchVisibleLimit((current) => current + 8)}
                    className="rounded-full border border-cyan-200/22 bg-cyan-200/[0.08] px-5 py-2.5 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/38 hover:bg-cyan-200/[0.13]"
                  >
                    Show more results
                  </button>
                  <p className="text-[11px] text-white/38">Showing {Math.min(searchVisibleLimit, searchResults.length)} of {searchResults.length}</p>
                </div>
              ) : null}
            </div>
          </section>
          ) : null}

          {showCalendarSection ? (
          <section
            ref={calendarSectionRef}
            data-events-section-id="calendar"
            className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="qa-premium-card relative overflow-hidden rounded-[30px] border border-cyan-200/14 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.10),transparent_34%),radial-gradient(circle_at_92%_8%,rgba(168,85,247,0.09),transparent_32%),linear-gradient(180deg,rgba(16,20,27,0.97),rgba(8,10,14,0.99))] p-5 shadow-[0_26px_72px_rgba(0,0,0,0.32)] sm:p-6">
              <div className="pointer-events-none absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-cyan-100/18 to-transparent" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-fuchsia-100/58">
                    Calendar
                  </p>
                  <h2 className="mt-2 bg-gradient-to-r from-fuchsia-100 via-white to-cyan-100 bg-clip-text text-2xl font-semibold tracking-[-0.03em] text-transparent">
                    {displayMonthName} {year}
                  </h2>
                  <p className="mt-2 text-xs text-white/52">
                    {eventsThisMonth} {eventsThisMonth === 1 ? "event" : "events"} this month
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      setCurrentDate(today);
                      selectCalendarDate(getLocalDateKey());
                    }}
                    aria-pressed={isViewingCurrentMonth && selectedDate === todayDateKey}
                    className="rounded-full border border-white/14 bg-white/[0.055] px-4 py-2 text-sm text-white/72 transition hover:border-white/26 hover:bg-white/[0.09] hover:text-white"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-4 py-2 text-sm text-fuchsia-100/85 transition hover:border-fuchsia-200/35 hover:bg-fuchsia-200/16 hover:text-white"
                  >
                    <span aria-hidden="true">←</span><span className="sr-only">Previous month</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100/85 transition hover:border-cyan-200/35 hover:bg-cyan-200/16 hover:text-white"
                  >
                    <span aria-hidden="true">→</span><span className="sr-only">Next month</span>
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

              <div className="mt-5 grid grid-cols-7 gap-1 text-[9px] uppercase tracking-[0.08em] text-white/35 sm:mt-8 sm:gap-2 sm:text-[11px] sm:tracking-[0.2em]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="rounded-lg border border-white/6 bg-white/[0.03] px-1 py-1.5 text-center sm:rounded-xl sm:px-2 sm:py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-1.5 grid grid-cols-7 gap-1 sm:mt-2 sm:gap-2">
                {[...Array(firstDay)].map((_, index) => (
                  <div key={`empty-${index}`} className="h-12 rounded-xl border border-transparent sm:h-24 sm:rounded-2xl" />
                ))}

                {[...Array(daysInMonth)].map((_, index) => {
                  const day = index + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const eventsCount = dayEventCounts[dateStr] || 0;
                  const isSelected = selectedDate === dateStr;
                  const isToday = todayDateKey === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => selectCalendarDate(dateStr)}
                      aria-label={`${formatDateLabel(dateStr)}${eventsCount > 0 ? `, ${eventsCount} ${eventsCount === 1 ? "event" : "events"}` : ", no events"}${isToday ? ", today" : ""}`}
                      aria-pressed={isSelected}
                      className={`relative flex h-12 flex-col justify-between rounded-xl border p-1.5 text-left transition sm:h-24 sm:rounded-2xl sm:p-3 ${
                        isSelected
                          ? "border-fuchsia-200/72 bg-[linear-gradient(180deg,rgba(232,121,249,0.20),rgba(76,29,149,0.34))] shadow-[0_0_0_1px_rgba(244,114,182,0.45),0_18px_44px_rgba(168,85,247,0.30)]"
                          : eventsCount > 0
                            ? "border-cyan-300/38 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.02))] shadow-[0_0_0_1px_rgba(56,189,248,0.14)] hover:border-cyan-200/52 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(255,255,255,0.03))] hover:shadow-[0_0_0_1px_rgba(103,232,249,0.30),0_14px_32px_rgba(6,182,212,0.20)]"
                            : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] hover:border-white/18 hover:bg-white/8"
                      } ${isToday && !isSelected ? "ring-1 ring-amber-200/70 ring-offset-1 ring-offset-[#0b0d12]" : ""}`}
                    >
                      <span className={`inline-block whitespace-nowrap break-normal [overflow-wrap:normal] [word-break:normal] text-[13px] font-semibold leading-none tracking-normal sm:text-sm sm:font-medium ${
                        isSelected ? "text-white" : eventsCount > 0 ? "text-cyan-100" : "text-white"
                      }`}>
                        {day}
                      </span>
                      {eventsCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-[9px] font-semibold text-cyan-100/82 sm:text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" aria-hidden="true" />
                          <span className="hidden sm:inline">{eventsCount} {eventsCount === 1 ? "event" : "events"}</span>
                        </span>
                      ) : null}
                      {isToday ? <span className="sr-only">Today</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={eventListSectionRef} className="qa-premium-card relative scroll-mt-24 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,20,24,0.97),rgba(10,10,12,0.99))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.32)] sm:p-6">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/28 to-transparent" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/58">
                    Event list
                  </p>
                  <h2 className="mt-2 bg-gradient-to-r from-cyan-100 via-white to-fuchsia-100 bg-clip-text text-2xl font-semibold tracking-[-0.03em] text-transparent">
                    {selectedDate ? `Events on ${formatDateLabel(selectedDate)}` : "All events"}
                  </h2>
                  <p className="mt-2 text-xs text-white/48">
                    {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} across {sortedCities.length} {sortedCities.length === 1 ? "city" : "cities"}
                  </p>
                </div>
                {selectedDate ? (
                  <button
                    type="button"
                    onClick={clearCalendarDate}
                    className="w-fit rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/66 transition hover:border-white/22 hover:bg-white/[0.08] hover:text-white"
                  >
                    Show all dates
                  </button>
                ) : null}
              </div>
              <div className="qa-defer-render mt-6 space-y-8">
                {isLoading && (
                  <div className="space-y-3">
                    <EventSkeletonCard tone="cyan" />
                    <EventSkeletonCard tone="cyan" />
                    <EventSkeletonCard tone="cyan" />
                  </div>
                )}
                {visibleAgendaCities.map((cityKey) => {
                  const cityGroup = eventsByCity[cityKey];
                  const cityEvents = (sortedEventsByCity[cityKey] || []).filter((event) =>
                    visibleAgendaEventKeys.has(`${event.isGlobal ? "global" : "city"}-${event.id}`)
                  );
                  const cityLabel = cityGroup?.label || formatCityLabel(cityKey);
                  if (!cityEvents.length) return null;
                  return (
                    <section key={cityKey} aria-labelledby={`event-city-${cityKey}`}>
                      <div className="mb-3 flex items-center gap-3">
                        <h3 id={`event-city-${cityKey}`} className="text-sm font-semibold uppercase tracking-[0.16em] text-white/72">{cityLabel}</h3>
                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/44">{cityEvents.length}</span>
                        <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      <div className="space-y-2">
                        {cityEvents.map((event) => {
                          const eventKey = `${event.isGlobal ? "global" : "city"}-${event.id}`;
                          const eventDateBadge = getEventDateBadgeParts(event);
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
                            className="group cursor-pointer rounded-[18px] border border-white/[0.09] bg-white/[0.035] p-3 shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-px hover:border-cyan-200/24 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 [content-visibility:auto] [contain-intrinsic-size:150px]"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="relative flex h-[68px] w-[64px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[16px] border border-violet-200/22 bg-[linear-gradient(145deg,rgba(82,72,130,0.48),rgba(34,80,104,0.38))] shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_8px_22px_rgba(15,18,38,0.24)]"
                                aria-label={formatEventDateLabel(event)}
                                title={formatEventDateLabel(event)}
                              >
                                <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent" />
                                <span className="text-[25px] font-semibold leading-none tracking-[-0.04em] text-white">
                                  {eventDateBadge.day}
                                </span>
                                <span className="mt-1.5 text-[10px] font-semibold leading-none tracking-[0.18em] text-cyan-100/82">
                                  {eventDateBadge.month}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-base font-semibold leading-5 tracking-[-0.015em] text-white transition group-hover:text-cyan-50">{event.name}</h4>
                                <p className="mt-1 line-clamp-1 text-xs leading-5 text-white/50">{event.description || event.location || "Open for event details."}</p>
                              </div>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] pt-2">
                              <button
                                onClick={(eventClick) => saveEventToFavorites(event, eventClick)}
                                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                                  favoriteIdSet.has(`event-${String(event.id)}`)
                                    ? "cursor-default border-emerald-200/28 bg-emerald-200/12 text-emerald-100"
                                    : "border-emerald-200/20 bg-emerald-200/8 text-emerald-100/90 hover:border-emerald-200/34 hover:bg-emerald-200/14"
                                }`}
                              >
                                {favoriteIdSet.has(`event-${String(event.id)}`) ? "Saved" : "Save event"}
                              </button>
                              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/[0.07] px-3 py-1.5 text-[11px] font-medium text-cyan-50/88 transition group-hover:border-cyan-200/30 group-hover:bg-cyan-200/[0.1]">
                                View details →
                              </span>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                {!isLoading && agendaVisibleLimit < agendaEvents.length ? (
                  <div className="flex flex-col items-center gap-2 border-t border-white/[0.07] pt-5">
                    <button
                      type="button"
                      onClick={() => setAgendaVisibleLimit((current) => current + 5)}
                      className="rounded-full border border-cyan-200/22 bg-cyan-200/[0.08] px-5 py-2.5 text-sm font-medium text-cyan-50 transition hover:border-cyan-200/38 hover:bg-cyan-200/[0.13]"
                    >
                      Show more events
                    </button>
                    <p className="text-[11px] text-white/38">
                      Showing {Math.min(agendaVisibleLimit, agendaEvents.length)} of {agendaEvents.length}
                    </p>
                  </div>
                ) : null}

                {!isLoading && sortedCities.length === 0 && (
                  <EmptyState
                    title="No events match this date yet."
                    description="Try all dates or add a new off-grid entry."
                    className="rounded-[28px]"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={clearCalendarDate}
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
            className="qa-premium-card mt-8 overflow-hidden rounded-[30px] border border-emerald-300/13 bg-[radial-gradient(circle_at_88%_0%,rgba(34,211,238,0.08),transparent_30%),linear-gradient(165deg,rgba(14,19,18,0.98),rgba(8,9,10,0.99))] p-4 shadow-[0_28px_82px_rgba(0,0,0,0.34)] sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-emerald-100/58">
                  Discover off-grid
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Queer events beyond city limits
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
                  Cruises, ski weekends, destination pop-ups, and nomadic formats—all in one focused feed.
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
                className="qa-action rounded-full border border-cyan-300/24 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/38 hover:bg-cyan-300/14 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {showGlobalForm ? "Close form" : "Add off-grid event"}
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
                <p className="text-xs font-medium text-white/72">{globalEvents.length} off-grid {globalEvents.length === 1 ? "event" : "events"}</p>
                <p className="mt-1 text-xs leading-5 text-white/42">Use this feed when the experience travels or does not belong to one Atlas city.</p>
              </div>
              {!isMember ? (
                <p className="px-2 text-xs text-white/44">Members can suggest new events.</p>
              ) : null}
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
                    className={`rounded-[20px] border p-4 transition [content-visibility:auto] [contain-intrinsic-size:220px] ${
                      isFocused
                        ? "border-cyan-200/55 bg-[linear-gradient(180deg,rgba(34,211,238,0.20),rgba(10,10,10,0.94))] shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_24px_80px_rgba(34,211,238,0.18)]"
                        : "border-white/[0.09] bg-white/[0.035] hover:-translate-y-px hover:border-cyan-200/24 hover:bg-white/[0.05]"
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
                    {isFocused ? <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/[0.07] pt-3">
                      {isAdmin && (
                        <button
                          onClick={(clickEvent) => startEditGlobalEvent(event, clickEvent)}
                          className="rounded-full border border-emerald-200/22 bg-emerald-200/[0.08] px-3 py-1 text-[11px] font-medium text-emerald-100/88 transition hover:border-emerald-200/40 hover:bg-emerald-200/14"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={(clickEvent) => handleReport(event, clickEvent)}
                        className="rounded-full border border-rose-200/20 bg-rose-200/[0.07] px-3 py-1 text-[11px] font-medium text-rose-100/82 transition hover:border-rose-200/38 hover:bg-rose-200/12"
                      >
                        Report
                      </button>
                    </div> : null}
                    {isFocused && quality.lastChecked && (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/50">
                        Checked {formatDateLabel(quality.lastChecked)}
                      </p>
                    )}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-200/72">
                      {event.location}
                    </p>
                    <VibeTagChips entity={event} tone="amber" className="mt-2" includeMixedFallback />
                    {event.description && (
                      <p className={`mt-3 text-sm leading-6 text-white/60 ${isFocused ? "qa-copy-justify" : "line-clamp-2"}`}>{event.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.07] pt-3">
                      {isFocused && event.link && (
                        <a
                          href={normalizeExternalUrl(event.link)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-xl border border-cyan-200/24 bg-cyan-200/10 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/36 hover:bg-cyan-200/14"
                        >
                          Open official link
                        </a>
                      )}
                      {isFocused && (event.ticket_url || event.ticketUrl) && (
                        <a
                          href={normalizeExternalUrl(event.ticket_url || event.ticketUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-xl border border-emerald-200/24 bg-emerald-200/10 px-3 py-2 text-xs text-emerald-100 transition hover:border-emerald-200/36 hover:bg-emerald-200/16"
                        >
                          Get tickets
                        </a>
                      )}
                      {isFocused && isAdmin && (
                        <button
                          onClick={(clickEvent) => deleteGlobalEvent(event.id, clickEvent)}
                          disabled={deletingGlobalEventId === String(event.id || "")}
                          className="inline-flex rounded-xl border border-rose-300/24 bg-rose-300/10 px-3 py-2 text-xs text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-300/16 disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          {deletingGlobalEventId === String(event.id || "") ? "Deleting..." : "Delete event"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(clickEvent) => saveEventToFavorites(event, clickEvent)}
                        className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                          favoriteIdSet.has(`event-${String(event.id)}`)
                            ? "border-emerald-200/28 bg-emerald-200/12 text-emerald-100"
                            : "border-emerald-200/20 bg-emerald-200/[0.08] text-emerald-100/88 hover:border-emerald-200/34"
                        }`}
                      >
                        {favoriteIdSet.has(`event-${String(event.id)}`) ? "Saved" : "Save"}
                      </button>
                      {!isFocused ? (
                        <button
                          type="button"
                          onClick={() => openEvent(event)}
                          className="rounded-full border border-cyan-200/22 bg-cyan-200/[0.08] px-3.5 py-2 text-xs font-medium text-cyan-50 transition hover:border-cyan-200/38 hover:bg-cyan-200/[0.13]"
                        >
                          View details →
                        </button>
                      ) : null}
                    </div>
                  </div>
                    );
                  })()
                ))
              )}
              {!isLoading && !normalizedFocusedOffgridId && globalEvents.length > offgridVisibleLimit ? (
                <div className="flex flex-col items-center gap-2 border-t border-white/[0.07] pt-5">
                  <button
                    type="button"
                    onClick={() => setOffgridVisibleLimit((current) => current + 6)}
                    className="rounded-full border border-emerald-200/22 bg-emerald-200/[0.08] px-5 py-2.5 text-sm font-medium text-emerald-50 transition hover:border-emerald-200/38 hover:bg-emerald-200/[0.13]"
                  >
                    Show more off-grid events
                  </button>
                  <p className="text-[11px] text-white/38">Showing {Math.min(offgridVisibleLimit, globalEvents.length)} of {globalEvents.length}</p>
                </div>
              ) : null}
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


