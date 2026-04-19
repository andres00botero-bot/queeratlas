"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { addReport, getBlockedItems, subscribeBlockedItems, syncBlockedItemsFromCloud } from "@/lib/moderation";
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import { mergeSeedEvents } from "@/lib/seedContent";
import { readLocalJson, writeLocalJson } from "@/lib/storage";
import { trackKpiEvent } from "@/lib/analytics";
import { useActionToast } from "@/lib/useActionToast";
import EmptyState from "@/components/ui/EmptyState";
import DateInput from "@/components/ui/DateInput";
import ActionToast from "@/components/ui/ActionToast";

const LEGACY_GLOBAL_EVENTS_KEY = "qa_global_events";
const REPORT_REASONS = [
  { value: "safety", label: "Safety issue", helper: "Unsafe behavior, consent issues, harassment, or risky conditions." },
  { value: "wrong_info", label: "Wrong info", helper: "Date, location, link, or event details are incorrect." },
  { value: "spam", label: "Spam or scam", helper: "Misleading promos, fake listings, or low-trust content." },
  { value: "abuse", label: "Abuse or hate", helper: "Hate speech, threats, discrimination, or abusive language." },
  { value: "other", label: "Other issue", helper: "Anything else that should be reviewed by admin." },
];

function splitLegacyVibe(description = "") {
  const raw = String(description || "");
  const match = raw.match(/^\[Vibe:\s*([^\]]+)\]\s*(?:\n\n)?([\s\S]*)$/i);
  if (!match) {
    return {
      vibe: "",
      description: raw,
    };
  }

  return {
    vibe: String(match[1] || "").trim(),
    description: String(match[2] || "").trim(),
  };
}

function mergeVibeIntoDescription(vibe = "", description = "") {
  const cleanVibe = String(vibe || "").trim();
  const cleanDescription = String(description || "").trim();
  if (!cleanVibe) return cleanDescription || null;
  return `[Vibe: ${cleanVibe}]${cleanDescription ? `\n\n${cleanDescription}` : ""}`;
}

function formatDateLabel(value) {
  if (!value) return "Date TBA";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCityLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "City";
  if (raw.toLowerCase() === "global") return "Global";

  return raw
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeCityKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "other";
  return raw.replace(/[\s-]+/g, "_");
}

function qualityPillClass(tone) {
  if (tone === "verified") {
    return "border-emerald-200/24 bg-emerald-200/12 text-emerald-100";
  }

  if (tone === "stale") {
    return "border-amber-200/24 bg-amber-200/12 text-amber-100";
  }

  if (tone === "community") {
    return "border-cyan-200/24 bg-cyan-200/12 text-cyan-100";
  }

  return "border-white/16 bg-white/7 text-white/70";
}

function mapGlobalEventRow(row) {
  const parsed = splitLegacyVibe(row.description || "");
  return {
    id: String(row.id),
    name: row.name || "",
    date: row.date || "",
    location: row.location || "",
    vibe: row.vibe || parsed.vibe || "",
    description: parsed.description || "",
    link: row.link || "",
    source: row.source || "",
    lastChecked: row.last_checked || "",
    city: "Global",
    isGlobal: true,
  };
}

function EventSkeletonCard({ tone = "orange" }) {
  const toneStyle =
    tone === "cyan"
      ? "border-cyan-200/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.10),rgba(12,12,12,0.94))]"
      : "border-orange-200/14 bg-[linear-gradient(180deg,rgba(251,146,60,0.12),rgba(12,12,12,0.94))]";

  return (
    <div className={`animate-pulse rounded-2xl border p-4 ${toneStyle}`} aria-hidden="true">
      <div className="h-3 w-40 rounded-full bg-white/14" />
      <div className="mt-3 h-5 w-3/4 rounded-full bg-white/12" />
      <div className="mt-4 h-3 w-full rounded-full bg-white/8" />
      <div className="mt-2 h-3 w-5/6 rounded-full bg-white/8" />
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const { isMember, isLoading: isAuthLoading, user, memberName } = useAuth();
  const { toast, showToast } = useActionToast();

  const [events, setEvents] = useState([]);
  const [, setQualityTick] = useState(0);
  const [globalEvents, setGlobalEvents] = useState([]);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingGlobalEventId, setEditingGlobalEventId] = useState("");
  const [globalForm, setGlobalForm] = useState({
    name: "",
    date: "",
    location: "",
    vibe: "",
    description: "",
    link: "",
    source: "",
    lastChecked: "",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState({
    targetId: "",
    title: "",
    city: "",
    reasonKey: REPORT_REASONS[0].value,
    details: "",
  });

  const blockedEventIds = useMemo(() => (
    new Set(
      blockedItems
        .filter((item) => item.targetType === "event")
        .map((item) => String(item.targetId))
    )
  ), [blockedItems]);

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
      setIsAdmin(false);
      setShowGlobalForm(false);
      setEditingGlobalEventId("");
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
    const actionInput = window.prompt(
      "Update trust status:\n1 = Verified now\n2 = Needs refresh\n3 = Closed or moved\n\nEnter 1, 2, or 3",
      "1"
    );
    if (actionInput === null) return;

    const action = String(actionInput).trim();
    if (!["1", "2", "3"].includes(action)) {
      window.alert("Use 1, 2, or 3 to continue.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const fallbackSource = (existing?.source || event.link || "").trim();
    const sourceDefaultByAction =
      action === "1"
        ? fallbackSource || "Community verified"
        : action === "2"
          ? fallbackSource || "Community flagged: needs review"
          : fallbackSource || "Community flagged: closed or moved";
    const sourceInput = window.prompt(
      "Source note (optional):\nAdd official link/name if you have one.\nLeave blank to keep current source.",
      fallbackSource
    );
    if (sourceInput === null) return;

    const sourceByAction = String(sourceInput).trim() || sourceDefaultByAction;
    const verified = action === "1";
    const lastChecked = action === "1" ? today : "";

    upsertQuality({
      targetType: "event",
      targetId: event.id,
      source: sourceByAction,
      lastChecked,
      verified,
    });

    if (event.isGlobal) {
      const { error } = await supabase
        .from("global_events")
        .update({
          source: sourceByAction || null,
          last_checked: lastChecked || null,
        })
        .eq("id", event.id);

      if (error) {
        setGlobalError("Could not update quality metadata in Supabase.");
      } else {
        setGlobalEvents((current) => current.map((item) => (
          String(item.id) === String(event.id)
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
  };

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    return {
      data: mergeSeedEvents(data || []),
      error,
    };
  }, []);

  const fetchGlobalEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("global_events")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: false });

    return {
      data: (data || []).map(mapGlobalEventRow),
      error,
    };
  }, []);

  const migrateLegacyGlobalEvents = useCallback(async () => {
    const legacy = readLocalJson(LEGACY_GLOBAL_EVENTS_KEY, []);
    if (!Array.isArray(legacy) || legacy.length === 0) return;

    const payload = legacy
      .filter((item) => item?.name && item?.date && item?.location)
      .map((item) => ({
        name: item.name,
        date: item.date,
        location: item.location,
        description: item.description || null,
        link: item.link || null,
        source: item.source || null,
        last_checked: item.lastChecked || null,
      }));

    if (payload.length === 0) {
      writeLocalJson(LEGACY_GLOBAL_EVENTS_KEY, []);
      return;
    }

    const { error } = await supabase
      .from("global_events")
      .insert(payload);

    if (error) return;

    writeLocalJson(LEGACY_GLOBAL_EVENTS_KEY, []);
    const refreshed = await fetchGlobalEvents();
    if (!refreshed.error) {
      setGlobalEvents(refreshed.data);
    }
  }, [fetchGlobalEvents]);

  const loadAllEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    setGlobalError("");

    const [eventsRes, globalRes] = await Promise.all([fetchEvents(), fetchGlobalEvents()]);

    setEvents(eventsRes.data || []);
    if (eventsRes.error) {
      setLoadError("Could not load events right now.");
    }

    if (globalRes.error) {
      setGlobalEvents([]);
      setGlobalError("Off-grid sync is unavailable right now.");
    } else {
      setGlobalEvents(globalRes.data || []);
      await migrateLegacyGlobalEvents();
    }

    setIsLoading(false);
  }, [fetchEvents, fetchGlobalEvents, migrateLegacyGlobalEvents]);

  useEffect(() => {
    queueMicrotask(() => {
      loadAllEvents();
    });
  }, [loadAllEvents]);

  const calendarEvents = useMemo(() => {
    const offGrid = globalEvents.map((event) => ({
      ...event,
      city: "Global",
      isGlobal: true,
    }));
    return [...events, ...offGrid].filter((event) => !blockedEventIds.has(String(event.id)));
  }, [blockedEventIds, events, globalEvents]);

  const filteredEvents = useMemo(() => (
    selectedDate
      ? calendarEvents.filter((event) => event.date === selectedDate)
      : calendarEvents
  ), [calendarEvents, selectedDate]);

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

    const dated = calendarEvents.filter((event) => event.date);
    const futureFirst = dated
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (futureFirst.length >= 3) return futureFirst.slice(0, 3);

    const fallbackPast = dated
      .filter((event) => new Date(event.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return [...futureFirst, ...fallbackPast].slice(0, 3);
  }, [calendarEvents]);
  const activeCities = new Set(events.map((event) => event.city).filter(Boolean)).size;
  const eventsThisMonth = calendarEvents.filter((event) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  }).length;

  const handleReport = (event, clickEvent) => {
    clickEvent?.stopPropagation();
    setReportDraft({
      targetId: String(event?.id || ""),
      title: String(event?.name || "Reported event"),
      city: String(event?.city || "Global"),
      reasonKey: REPORT_REASONS[0].value,
      details: "",
    });
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

  const insertGlobalEvent = async (payload) => {
    const withVibe = {
      ...payload,
      vibe: payload.vibe || null,
    };

    const primaryInsert = await supabase
      .from("global_events")
      .insert([withVibe])
      .select("*")
      .single();

    if (!primaryInsert.error) return primaryInsert;

    const errorText = `${primaryInsert.error?.code || ""} ${primaryInsert.error?.message || ""}`.toLowerCase();
    const missingVibeColumn = errorText.includes("vibe") && (errorText.includes("column") || errorText.includes("schema cache"));

    if (!missingVibeColumn) return primaryInsert;

    const fallbackInsert = await supabase
      .from("global_events")
      .insert([{
        ...payload,
        description: mergeVibeIntoDescription(payload.vibe, payload.description),
      }])
      .select("*")
      .single();

    return fallbackInsert;
  };

  const updateGlobalEvent = async (eventId, payload) => {
    const withVibe = {
      ...payload,
      vibe: payload.vibe || null,
    };

    const primaryUpdate = await supabase
      .from("global_events")
      .update(withVibe)
      .eq("id", String(eventId))
      .select("*")
      .single();

    if (!primaryUpdate.error) return primaryUpdate;

    const errorText = `${primaryUpdate.error?.code || ""} ${primaryUpdate.error?.message || ""}`.toLowerCase();
    const missingVibeColumn = errorText.includes("vibe") && (errorText.includes("column") || errorText.includes("schema cache"));
    if (!missingVibeColumn) return primaryUpdate;

    const fallbackUpdate = await supabase
      .from("global_events")
      .update({
        name: payload.name,
        date: payload.date,
        location: payload.location,
        description: mergeVibeIntoDescription(payload.vibe, payload.description),
        link: payload.link,
        source: payload.source,
        last_checked: payload.last_checked,
      })
      .eq("id", String(eventId))
      .select("*")
      .single();

    return fallbackUpdate;
  };

  const startEditGlobalEvent = (event, clickEvent) => {
    clickEvent?.stopPropagation();
    if (!isAdmin) return;

    setEditingGlobalEventId(String(event?.id || ""));
    setGlobalForm({
      name: String(event?.name || ""),
      date: String(event?.date || ""),
      location: String(event?.location || ""),
      vibe: String(event?.vibe || ""),
      description: String(event?.description || ""),
      link: String(event?.link || ""),
      source: String(event?.source || ""),
      lastChecked: String(event?.lastChecked || ""),
    });
    setShowGlobalForm(true);
  };

  const resetGlobalForm = () => {
    setEditingGlobalEventId("");
    setGlobalForm({
      name: "",
      date: "",
      location: "",
      vibe: "",
      description: "",
      link: "",
      source: "",
      lastChecked: "",
    });
  };

  const saveGlobalEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!isAdmin) {
      setGlobalError("Admin access required to add or edit off-grid events.");
      return;
    }
    if (!globalForm.name || !globalForm.date || !globalForm.location) return;
    setIsSavingGlobal(true);
    setGlobalError("");

    const payload = {
      name: globalForm.name,
      date: globalForm.date,
      location: globalForm.location,
      vibe: globalForm.vibe || null,
      description: globalForm.description || null,
      link: globalForm.link || null,
      source: globalForm.source || null,
      last_checked: globalForm.lastChecked || null,
    };

    const { data, error } = editingGlobalEventId
      ? await updateGlobalEvent(editingGlobalEventId, payload)
      : await insertGlobalEvent(payload);

    if (error || !data) {
      const code = String(error?.code || "").trim();
      const message = String(error?.message || error?.details || "Unknown error").trim();
      const hint = String(error?.hint || "").trim();
      const suffix = [code ? `[${code}]` : "", message, hint].filter(Boolean).join(" ");
      setGlobalError(`Could not save off-grid event to Supabase yet. ${suffix}`);
      // Keep full server error in console for faster ops debugging.
      console.error("Off-grid save failed", { error, payload, editingGlobalEventId });
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
    <main className="min-h-screen overflow-x-hidden bg-[#040404] text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.11),transparent_18%),radial-gradient(circle_at_20%_22%,rgba(236,72,153,0.12),transparent_24%),radial-gradient(circle_at_85%_16%,rgba(59,130,246,0.11),transparent_19%),linear-gradient(180deg,#040404_0%,#090909_48%,#040404_100%)]" />
        <div className="pointer-events-none absolute left-[-6%] top-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5%] top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-orange-400/9 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-[23rem] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <section className="overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(145deg,rgba(30,30,30,0.96),rgba(8,8,8,0.99))] px-6 py-7 shadow-[0_35px_120px_rgba(0,0,0,0.42)] sm:px-8">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/72 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_20px_rgba(253,186,116,0.9)]" />
                  Time-based queer signal
                </div>

                <h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl xl:text-6xl">
                  Events
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                  Track what is happening across the atlas, follow the live calendar,
                  and jump straight into cities where queer energy is gathering.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-fuchsia-300/20 bg-[linear-gradient(180deg,rgba(244,114,182,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100/70">All events</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{calendarEvents.length}</p>
                  </div>
                  <div className="rounded-3xl border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Active cities</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{activeCities}</p>
                  </div>
                  <div className="rounded-3xl border border-orange-300/20 bg-[linear-gradient(180deg,rgba(251,146,60,0.14),rgba(255,255,255,0.03))] p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-100/75">This month</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{eventsThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-orange-200/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-orange-200/70">
                      Next up
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Upcoming signal
                    </h2>
                  </div>

                  <button
                    onClick={() => router.push("/now")}
                    className="rounded-full border border-orange-200/24 bg-orange-200/10 px-4 py-2 text-xs text-orange-100 transition hover:border-orange-200/42 hover:bg-orange-200/16"
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
                          {formatCityLabel(event.city)} | {formatDateLabel(event.date)}
                        </p>
                        <button
                          onClick={(clickEvent) => refreshQuality(event, clickEvent)}
                          className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}>
                          {qualityStatus.label}
                        </button>
                      </div>
                      <p className="mt-3 text-base font-semibold text-white">{event.name}</p>
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
                  const eventsCount = calendarEvents.filter((event) => event.date === dateStr).length;
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
                  const cityEvents = cityGroup?.events || [];
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

                              {event.date && (
                                <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-xs text-fuchsia-100">
                                  {formatDateLabel(event.date)}
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
                        className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-xs text-cyan-100 transition hover:border-cyan-200/32 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {isAdmin ? "Add off-grid event" : "Admin only"}
                      </button>
                    </div>
                  </EmptyState>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-[34px] border border-emerald-300/14 bg-[linear-gradient(165deg,rgba(20,20,20,0.96),rgba(8,8,8,0.98))] p-6 shadow-[0_32px_95px_rgba(0,0,0,0.35)] sm:p-7">
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
                className="rounded-2xl border border-cyan-300/24 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/38 hover:bg-cyan-300/14 disabled:cursor-not-allowed disabled:opacity-45"
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
                <DateInput
                  value={globalForm.date}
                  onChange={(event) => setGlobalForm((current) => ({ ...current, date: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30"
                  required
                  tone="cyan"
                />
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
                />
              ) : (
                globalEvents.slice(0, 8).map((event) => (
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
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(10,10,10,0.94))] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-semibold text-white">{event.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">
                          {formatDateLabel(event.date)}
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
      <ActionToast toast={toast} />
    </main>
  );
}
