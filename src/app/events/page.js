"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { addReport, getBlockedItems, subscribeBlockedItems, syncBlockedItemsFromCloud } from "@/lib/moderation";
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import { trackKpiEvent } from "@/lib/analytics";
import { useActionToast } from "@/lib/useActionToast";
import { logDevError } from "@/lib/devLogger";
import {
  fetchEventsData,
  fetchGlobalEventsData,
  migrateLegacyGlobalEventsToSupabase,
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
import { qualityPillClass } from "@/features/events/eventViewUtils";
import EventSkeletonCard from "@/components/events/EventSkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import DateInput from "@/components/ui/DateInput";
import ActionToast from "@/components/ui/ActionToast";

export default function EventsPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user, memberName } = useAuth();
  const { toast, showToast } = useActionToast();
  const offgridSectionRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [, setQualityTick] = useState(0);
  const [globalEvents, setGlobalEvents] = useState([]);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingGlobalEventId, setEditingGlobalEventId] = useState("");
  const [globalForm, setGlobalForm] = useState(EMPTY_GLOBAL_FORM);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
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
    description: "",
    link: "",
  });
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState(() => createInitialReportDraft(REPORT_REASONS[0].value));
  const [qualityModal, setQualityModal] = useState(() => createInitialQualityModal());
  const [offgridEventParam, setOffgridEventParam] = useState(() => {
    if (typeof window === "undefined") return "";
    return String(new URLSearchParams(window.location.search).get("offgridEventId") || "").trim();
  });

  const blockedEventIds = useMemo(() => (
    new Set(
      blockedItems
        .filter((item) => item.targetType === "event")
        .map((item) => String(item.targetId))
    )
  ), [blockedItems]);

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
      let adminState = false;
      try {
        const rpcRes = await supabase.rpc("qa_is_admin");
        if (!rpcRes.error) {
          adminState = Boolean(rpcRes.data);
        }
      } catch {
        adminState = false;
      }

      if (!adminState && user?.email) {
        try {
          const { data, error } = await supabase
            .from("qa_admin_users")
            .select("email")
            .ilike("email", String(user.email).trim().toLowerCase())
            .limit(1);
          adminState = !error && (data || []).length > 0;
        } catch {
          adminState = false;
        }
      }

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

  const qualityMap = getQualityMap();
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
      setGlobalEvents(globalRes.data || []);
      const migration = await migrateLegacyGlobalEventsToSupabase();
      if (migration.migrated && !migration.error && Array.isArray(migration.data)) {
        setGlobalEvents(migration.data);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadAllEvents();
    });
  }, [loadAllEvents]);

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dated = calendarEvents.filter((event) => event.startDate);
    const futureFirst = dated
      .filter((event) => new Date(event.startDate) >= today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    if (futureFirst.length >= 3) return futureFirst.slice(0, 3);

    const fallbackPast = dated
      .filter((event) => new Date(event.startDate) < today)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    return [...futureFirst, ...fallbackPast].slice(0, 3);
  }, [calendarEvents]);
  const activeCities = new Set(events.map((event) => event.city).filter(Boolean)).size;
  const eventsThisMonth = calendarEvents.filter((event) => {
    return eventOverlapsMonth(event, year, month);
  }).length;

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
    if (!isAdmin) {
      setGlobalError("Admin access required to add or edit off-grid events.");
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

  const openCityEdit = (event, clickEvent) => {
    clickEvent?.stopPropagation();
    if (!isAdmin || event?.isGlobal) return;

    const normalized = normalizeEventRange(event || {});
    setCityEditError("");
    setCityEditDraft({
      id: String(event?.id || ""),
      city: String(event?.city || ""),
      name: String(event?.name || ""),
      startDate: String(normalized.startDate || ""),
      endDate: String(normalized.endDate || ""),
      location: String(event?.location || ""),
      vibe: String(event?.vibe || ""),
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

  const openEvent = (event) => {
    if (event.isGlobal) {
      if (event.link) {
        window.open(event.link, "_blank", "noopener,noreferrer");
      }
      return;
    }

    router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}`);
  };

  return (
    <main className="qa-page min-h-screen overflow-x-hidden bg-[#040404] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.11),transparent_18%),radial-gradient(circle_at_20%_22%,rgba(236,72,153,0.12),transparent_24%),radial-gradient(circle_at_85%_16%,rgba(59,130,246,0.11),transparent_19%),linear-gradient(180deg,#040404_0%,#090909_48%,#040404_100%)]" />
        <div className="pointer-events-none absolute left-[-6%] top-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5%] top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-orange-400/9 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-[23rem] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="qa-shell relative">
          <section className="qa-panel overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(145deg,rgba(30,30,30,0.96),rgba(8,8,8,0.99))] px-6 py-7 shadow-[0_35px_120px_rgba(0,0,0,0.42)] sm:px-8">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="qa-eyebrow inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-white/72 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_20px_rgba(253,186,116,0.9)]" />
                  Time-based queer signal
                </div>

                <h1 className="qa-display qa-h1 mt-6 text-4xl font-semibold text-white sm:text-5xl xl:text-6xl">
                  Events
                </h1>

                <p className="qa-lead mt-5 max-w-2xl text-base text-white/68 sm:text-lg">
                  Track what is happening across the atlas, follow the live calendar,
                  and jump straight into cities where queer energy is gathering.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="qa-card qa-metric-card rounded-3xl border border-fuchsia-300/20 bg-[linear-gradient(180deg,rgba(244,114,182,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/70">All events</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{calendarEvents.length}</p>
                  </div>
                  <div className="qa-card qa-metric-card rounded-3xl border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Active cities</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{activeCities}</p>
                  </div>
                  <div className="qa-card qa-metric-card rounded-3xl border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(125,211,252,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">This month</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{eventsThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-200/70">
                      Next up
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Upcoming signal
                    </h2>
                  </div>

                  <button
                    onClick={() => router.push("/now")}
                    className="qa-action rounded-full border border-fuchsia-200/24 bg-fuchsia-200/10 px-4 py-2 text-xs text-fuchsia-100 transition hover:border-fuchsia-200/42 hover:bg-fuchsia-200/16"
                  >
                    Open Now
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {isLoading && (
                    <div className="space-y-3 rounded-2xl border border-orange-200/14 bg-orange-200/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-orange-100/62">Loading upcoming signal</p>
                      <EventSkeletonCard tone="orange" />
                      <EventSkeletonCard tone="orange" />
                    </div>
                  )}
                  {upcomingEvents.map((event) => (
                    (() => {
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
                      className="w-full rounded-2xl border border-orange-200/15 bg-[linear-gradient(180deg,rgba(101,33,14,0.5),rgba(14,14,14,0.96))] p-4 text-left transition hover:-translate-y-[1px] hover:border-orange-200/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200/45"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-orange-100/72">
                          {formatCityLabel(event.city)} | {formatEventDateLabel(event)}
                        </p>
                        <button
                          onClick={(clickEvent) => refreshQuality(event, clickEvent)}
                          className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}>
                          {qualityStatus.label}
                        </button>
                      </div>
                      <p className="mt-3 text-base font-semibold text-white">{event.name}</p>
                      {event.vibe && (
                        <p className="mt-2 inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                          Vibe: {event.vibe}
                        </p>
                      )}
                      {quality.lastChecked && (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
                          Checked {formatDateLabel(quality.lastChecked)}
                        </p>
                      )}
                    </div>
                      );
                    })()
                  ))}

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

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[34px] border border-fuchsia-300/16 bg-[radial-gradient(circle_at_14%_10%,rgba(236,72,153,0.18),transparent_36%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_50%_85%,rgba(249,115,22,0.12),transparent_40%),linear-gradient(180deg,rgba(19,19,19,0.96),rgba(9,9,9,0.99))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)]">
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

              <div className="relative mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedDate("")}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                    !selectedDate
                      ? "border-fuchsia-300/38 bg-fuchsia-300/16 text-fuchsia-100"
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
                  const eventsCount = calendarEvents.filter((event) => eventOverlapsDate(event, dateStr)).length;
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-20 rounded-2xl border p-2 text-left transition sm:h-24 sm:p-3 ${
                        isSelected
                          ? "border-fuchsia-300/34 bg-[linear-gradient(180deg,rgba(236,72,153,0.22),rgba(91,33,182,0.30))] shadow-[0_20px_48px_rgba(217,70,239,0.20)]"
                          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] hover:border-white/18 hover:bg-white/8"
                      }`}
                    >
                      <p className="inline-block whitespace-nowrap break-normal [overflow-wrap:normal] [word-break:normal] text-[13px] font-semibold leading-none tracking-normal text-white sm:text-sm sm:font-medium">
                        {day}
                      </p>

                      {eventsCount > 0 && (
                        <div className="mt-2 sm:mt-3">
                          <p className="hidden text-[11px] text-white/48 sm:block">
                            {eventsCount} {eventsCount === 1 ? "event" : "events"}
                          </p>
                          <div className="mt-2 flex gap-1 sm:gap-1.5">
                            {[...Array(Math.min(eventsCount, 3))].map((_, dotIndex) => (
                              <span
                                key={`${day}-${dotIndex}`}
                                className={`h-2 w-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-400 to-orange-300 shadow-[0_0_16px_rgba(244,114,182,0.65)] sm:h-2.5 sm:w-2.5 ${
                                  dotIndex > 0 ? "hidden sm:inline-flex" : "inline-flex"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-cyan-300/16 bg-[radial-gradient(circle_at_86%_10%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_18%_20%,rgba(168,85,247,0.10),transparent_35%),linear-gradient(180deg,rgba(18,18,18,0.96),rgba(8,8,8,1))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)]">
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

                <div className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100/80">
                  {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
                </div>
              </div>
              <div className="mt-6 max-h-[900px] space-y-6 overflow-y-auto pr-1">
                {isLoading && (
                  <div className="space-y-3">
                    <EventSkeletonCard tone="cyan" />
                    <EventSkeletonCard tone="cyan" />
                    <EventSkeletonCard tone="cyan" />
                  </div>
                )}
                {sortedCities.map((cityKey) => {
                  const cityGroup = eventsByCity[cityKey];
                  const cityEvents = (cityGroup?.events || []).slice().sort((a, b) => {
                    const aStart = normalizeEventRange(a).startDate;
                    const bStart = normalizeEventRange(b).startDate;
                    return String(aStart || "").localeCompare(String(bStart || ""));
                  });
                  const cityLabel = cityGroup?.label || formatCityLabel(cityKey);

                  if (!cityEvents || cityEvents.length === 0) return null;

                  return (
                    <section key={cityKey}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-white">{cityLabel}</h3>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/42">
                          {cityEvents.length} live
                        </span>
                      </div>

                      <div className="space-y-3">
                        {cityEvents.map((event) => (
                          (() => {
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
                            className="cursor-pointer rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 transition hover:-translate-y-[1px] hover:border-cyan-200/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45"
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
                              {event.vibe && (
                                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-200/75">
                                  Vibe: {event.vibe}
                                </p>
                              )}
                              {event.isGlobal && event.location && (
                                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-200/75">
                                  Location: {event.location}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                              {event.link && (
                                <a
                                  href={event.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(eventClick) => eventClick.stopPropagation()}
                                  className="rounded-2xl bg-gradient-to-r from-fuchsia-300 via-pink-300 to-orange-200 px-4 py-3 text-center text-sm font-semibold text-black transition hover:opacity-95"
                                >
                                  Open official link
                                </a>
                              )}

                              {!event.isGlobal && (
                                <button
                                  onClick={(eventClick) => {
                                    eventClick.stopPropagation();
                                    router.push(`/${event.city?.toLowerCase()}?eventId=${event.id}&lat=${event.lat}&lng=${event.lng}`);
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
                          })()
                        ))}
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
                          if (!isAdmin) return;
                          setShowGlobalForm(true);
                        }}
                        disabled={!isAdmin}
                        className="qa-action rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/32 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {isAdmin ? "Add off-grid event" : "Admin only"}
                      </button>
                    </div>
                  </EmptyState>
                )}
              </div>
            </div>
          </section>

          <section ref={offgridSectionRef} className="mt-8 overflow-hidden rounded-[34px] border border-emerald-300/14 bg-[linear-gradient(165deg,rgba(20,20,20,0.96),rgba(8,8,8,0.98))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)] sm:p-7">
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
                  if (!isAdmin) return;
                  setShowGlobalForm((current) => !current);
                  if (showGlobalForm) {
                    resetGlobalForm();
                  }
                }}
                disabled={!isAdmin}
                className="qa-action rounded-2xl border border-cyan-300/24 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/38 hover:bg-cyan-300/14 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isAdmin ? (showGlobalForm ? "Close form" : "Add off-grid event") : "Admin only"}
              </button>
            </div>
            {!isAdmin && !isAuthLoading && (
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/45">
                Off-grid event editing is restricted to admins.
              </p>
            )}

            {isAdmin && showGlobalForm && (
              <form onSubmit={saveGlobalEvent} className="mt-6 grid gap-3 md:grid-cols-2">
                {editingGlobalEventId && (
                  <p className="rounded-2xl border border-emerald-200/24 bg-emerald-200/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-emerald-100 md:col-span-2">
                    Editing off-grid event
                  </p>
                )}
                <input
                  value={globalForm.name}
                  onChange={(event) => setGlobalForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30"
                  placeholder="Event name *"
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">From</p>
                    <DateInput
                      value={globalForm.startDate}
                      onChange={(event) => setGlobalForm((current) => ({ ...current, startDate: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
                      required
                      tone="cyan"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">To</p>
                    <DateInput
                      value={globalForm.endDate}
                      onChange={(event) => setGlobalForm((current) => ({ ...current, endDate: event.target.value }))}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
                      tone="cyan"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-white/50 md:col-span-2">
                  Use a single-day event by leaving <span className="font-medium text-white/70">To</span> empty.
                </p>
                <input
                  value={globalForm.location}
                  onChange={(event) => setGlobalForm((current) => ({ ...current, location: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
                  placeholder="Location (e.g. Mediterranean Sea, Alps, Desert Camp) *"
                  required
                />
                <input
                  value={globalForm.vibe}
                  onChange={(event) => setGlobalForm((current) => ({ ...current, vibe: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
                  placeholder="Vibe (e.g. circuit, beach, queer arts, cozy social)"
                />
                <textarea
                  value={globalForm.description}
                  onChange={(event) => setGlobalForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-[110px] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
                  placeholder="Description (vibe, crowd, format, what makes it special)"
                />
                <input
                  value={globalForm.link}
                  onChange={(event) => setGlobalForm((current) => ({ ...current, link: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30 md:col-span-2"
                  placeholder="External link (optional)"
                />
                <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                  <input
                    value={globalForm.source}
                    onChange={(event) => setGlobalForm((current) => ({ ...current, source: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-cyan-300/30"
                    placeholder="Source URL or name (optional)"
                  />
                  <DateInput
                    value={globalForm.lastChecked}
                    onChange={(event) => setGlobalForm((current) => ({ ...current, lastChecked: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
                    tone="cyan"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingGlobal}
                  className="rounded-2xl bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-95 md:col-span-2"
                >
                  {isSavingGlobal ? "Saving..." : editingGlobalEventId ? "Save changes" : "Save to calendar"}
                </button>
                {editingGlobalEventId && (
                  <button
                    type="button"
                    onClick={resetGlobalForm}
                    className="rounded-2xl border border-white/16 bg-white/7 px-4 py-3 text-sm text-white/82 transition hover:border-white/28 md:col-span-2"
                  >
                    Cancel edit
                  </button>
                )}
              </form>
            )}

            {globalError && (
              <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
                {globalError}
              </div>
            )}

            <div className="mt-6 space-y-3">
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
                  primaryActionLabel={isAdmin ? "Add off-grid event" : "Open all events"}
                  onPrimaryAction={() => {
                    if (isAdmin) {
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
                    {event.vibe && (
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-amber-200/75">
                        Vibe: {event.vibe}
                      </p>
                    )}
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
        </div>
      </div>
      {cityEditOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-emerald-200/22 bg-[linear-gradient(165deg,rgba(8,44,30,0.9),rgba(11,11,11,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/75">Admin edit</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Edit event</h3>
                <p className="mt-1 text-sm text-white/70">{cityEditDraft.city || "City event"}</p>
              </div>

              <form onSubmit={saveCityEdit} className="space-y-4 px-5 py-5">
                <input
                  value={cityEditDraft.name}
                  onChange={(event) => setCityEditDraft((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
                  placeholder="Event name *"
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">From</p>
                    <DateInput
                      value={cityEditDraft.startDate}
                      onChange={(event) => setCityEditDraft((current) => ({ ...current, startDate: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/30"
                      required
                      tone="cyan"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">To</p>
                    <DateInput
                      value={cityEditDraft.endDate}
                      onChange={(event) => setCityEditDraft((current) => ({ ...current, endDate: event.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/30"
                      tone="cyan"
                    />
                  </div>
                </div>

                <input
                  value={cityEditDraft.location}
                  onChange={(event) => setCityEditDraft((current) => ({ ...current, location: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
                  placeholder="Location (optional)"
                />
                <input
                  value={cityEditDraft.vibe}
                  onChange={(event) => setCityEditDraft((current) => ({ ...current, vibe: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
                  placeholder="Vibe (optional)"
                />
                <textarea
                  value={cityEditDraft.description}
                  onChange={(event) => setCityEditDraft((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
                  placeholder="Description"
                />
                <input
                  value={cityEditDraft.link}
                  onChange={(event) => setCityEditDraft((current) => ({ ...current, link: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-300/30"
                  placeholder="External link (optional)"
                />

                {cityEditError && (
                  <p className="rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
                    {cityEditError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={closeCityEdit}
                    className="rounded-full border border-white/16 bg-white/7 px-4 py-2 text-sm text-white/78 transition hover:border-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCityEdit}
                    className="rounded-full border border-emerald-200/34 bg-emerald-200/16 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/55 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSavingCityEdit ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[91] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-rose-200/22 bg-[linear-gradient(165deg,rgba(64,18,38,0.88),rgba(11,11,11,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-rose-100/75">Safety report</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Report event</h3>
                <p className="mt-1 line-clamp-1 text-sm text-white/70">{reportDraft.title}</p>
              </div>

              <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-5 sm:max-h-[70vh]">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/58">Reason</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {REPORT_REASONS.map((item) => {
                      const active = reportDraft.reasonKey === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setReportDraft((current) => ({ ...current, reasonKey: item.value }))}
                          className={`rounded-2xl border px-3 py-2 text-left transition ${
                            active
                              ? "border-rose-200/42 bg-rose-200/16 text-rose-50 shadow-[0_8px_28px_rgba(244,63,94,0.18)]"
                              : "border-white/12 bg-white/[0.03] text-white/82 hover:border-white/24"
                          }`}
                        >
                          <p className="text-sm font-semibold">{item.label}</p>
                          <p className="mt-1 text-xs text-white/60">{item.helper}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-white/58" htmlFor="event-report-details">
                    What is wrong?
                  </label>
                  <textarea
                    id="event-report-details"
                    value={reportDraft.details}
                    onChange={(event) => setReportDraft((current) => ({ ...current, details: event.target.value }))}
                    placeholder="Example: wrong date, broken link, inaccurate location, or safety concern around venue access..."
                    className="mt-2 min-h-[116px] w-full rounded-2xl border border-white/14 bg-black/40 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-rose-200/45"
                  />
                  <p className="mt-2 text-xs text-white/52">This note goes directly to admin moderation inbox.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="rounded-full border border-white/16 bg-white/7 px-4 py-2 text-sm text-white/78 transition hover:border-white/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitReport}
                  className="rounded-full border border-rose-200/34 bg-rose-200/16 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:border-rose-200/55"
                >
                  Send report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {qualityModal.open && (
        <div className="fixed inset-0 z-[92] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-cyan-200/22 bg-[linear-gradient(165deg,rgba(7,38,44,0.9),rgba(11,11,11,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/75">Trust status</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Update quality</h3>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div className="grid gap-2 sm:grid-cols-3">
                  {TRUST_ACTIONS.map((item) => {
                    const active = qualityModal.action === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setQualityModal((current) => ({ ...current, action: item.value }))}
                        className={`rounded-2xl border px-3 py-2 text-sm transition ${
                          active
                            ? "border-cyan-200/42 bg-cyan-200/18 text-cyan-50"
                            : "border-white/12 bg-white/[0.03] text-white/82 hover:border-white/24"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.18em] text-white/58" htmlFor="events-quality-source">
                    Source note (optional)
                  </label>
                  <input
                    id="events-quality-source"
                    value={qualityModal.sourceInput}
                    onChange={(event) => setQualityModal((current) => ({ ...current, sourceInput: event.target.value }))}
                    placeholder="Official URL/name or internal verification note"
                    className="mt-2 w-full rounded-2xl border border-white/14 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-200/45"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
                <button
                  type="button"
                  onClick={closeQualityModal}
                  className="rounded-full border border-white/16 bg-white/7 px-4 py-2 text-sm text-white/78 transition hover:border-white/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitQualityModal}
                  className="rounded-full border border-cyan-200/34 bg-cyan-200/16 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/55"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ActionToast toast={toast} />
    </main>
  );
}
