"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cityConfig } from "@/lib/cities";
import { useAuth } from "@/lib/auth";
import { usePlaces } from "@/lib/usePlaces";
import { supabase } from "@/lib/supabase";
import { mergeSeedEvents, mergeSeedPlaces } from "@/lib/seedContent";
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
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import { useActionToast } from "@/lib/useActionToast";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import ActionToast from "@/components/ui/ActionToast";
import DateInput from "@/components/ui/DateInput";
import PageOpeningState from "@/components/ui/PageOpeningState";

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
  { value: "sauna", label: "Sauna" },
  { value: "cruise_club", label: "Cruise Club" },
  { value: "cruising_area", label: "Cruising Area" },
  { value: "cafe", label: "Cafe" },
  { value: "hotel", label: "Hotel" },
];

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

export default function ContributePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isMember, isLoading: isAuthLoading, user } = useAuth();
  const [selectedCity, setSelectedCity] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [addEventMode, setAddEventMode] = useState(false);
  const [atlasNotice, setAtlasNotice] = useState("");
  const [placeNotice, setPlaceNotice] = useState("");
  const [eventNotice, setEventNotice] = useState("");
  const [isSavingPlace, setIsSavingPlace] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const { addPlace } = usePlaces();
  const [requests, setRequests] = useState(initialRequests);
  const [reports, setReports] = useState([]);
  const [blockedItems, setBlockedItems] = useState([]);
  const [reportFilter, setReportFilter] = useState("open");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { toast, showToast } = useActionToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [moderationSyncNotice, setModerationSyncNotice] = useState("");
  const [qaSnapshot, setQaSnapshot] = useState({
    places: [],
    events: [],
    loading: false,
    error: "",
  });
  const [placeForm, setPlaceForm] = useState({
    name: "",
    city: "",
    type: "club",
    address: "",
    description: "",
    vibe: "",
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
    source: "",
    lastChecked: "",
  });
  const [requestForm, setRequestForm] = useState({
    type: "Correction",
    city: "",
    title: "",
    detail: "",
  });

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isMember) {
      writeLocalValue("qa_redirect", "/contribute");
      writeLocalValue("qa_post_login_target", "/contribute");
      router.replace("/?join=true");
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
      setReports(getReports());
      setBlockedItems(getBlockedItems());

      let adminAccess = false;
      const notices = [];
      const currentEmail = String(user?.email || "").trim().toLowerCase();
      if (currentEmail) {
        const { data, error } = await supabase
          .from("qa_admin_users")
          .select("email")
          .ilike("email", currentEmail)
          .limit(1);

        if (!error) {
          adminAccess = (data || []).length > 0;
          setIsAdmin(adminAccess);
        } else {
          setIsAdmin(false);
          if (isMissingTableError(error)) {
            notices.push("Admin table is missing. Run the latest Supabase SQL scripts.");
          }
        }
      } else {
        setIsAdmin(false);
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
      setIsReady(true);
    });
  }, [isAuthLoading, isMember, router, user?.email]);

  useEffect(() => {
    if (!isReady || !isMember) return;
    writeLocalJson(STORAGE_KEY, requests);
  }, [isReady, isMember, requests]);

  useEffect(() => {
    if (!isMember || !isAdmin) {
      setQaSnapshot({ places: [], events: [], loading: false, error: "" });
      return;
    }

    let active = true;

    queueMicrotask(async () => {
      setQaSnapshot((current) => ({ ...current, loading: true, error: "" }));
      const [{ data: placesData, error: placesError }, { data: eventsData, error: eventsError }] =
        await Promise.all([
          supabase
            .from("places_with_stats")
            .select("id, name, city, type, vibe, description, hours, lat, lng, source, lastChecked, verified"),
          supabase
            .from("events")
            .select("id, name, city, description, date, link, lat, lng, source, lastChecked, verified"),
        ]);

      if (!active) return;

      if (placesError || eventsError) {
        setQaSnapshot({
          places: [],
          events: [],
          loading: false,
          error: "Could not load complete QA snapshot from Supabase.",
        });
        return;
      }

      setQaSnapshot({
        places: mergeSeedPlaces(placesData || []),
        events: mergeSeedEvents(eventsData || []),
        loading: false,
        error: "",
      });
    });

    return () => {
      active = false;
    };
  }, [isAdmin, isMember]);

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
    if (!placeForm.name || !placeForm.address || !placeForm.description || !(selectedCity || placeForm.city)) {
      setPlaceNotice("Fill in city, place name, address and description.");
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

      const createdPlace = await addPlace({
        name: placeForm.name,
        type: placeForm.type,
        description: placeForm.description,
        vibe: placeForm.vibe,
        lat: coords.lat,
        lng: coords.lng,
        city: cityName,
      });

      if (createdPlace?.id) {
        upsertQuality({
          targetType: "place",
          targetId: createdPlace.id,
          source: placeForm.source,
          lastChecked: placeForm.lastChecked,
          verified: Boolean(placeForm.source && placeForm.lastChecked),
        });
      }

      setPlaceForm({
        name: "",
        city: "",
        type: "club",
        address: "",
        description: "",
        vibe: "",
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

      const { data: createdEvent, error } = await supabase
        .from("events")
        .insert([
          {
            name: eventForm.name,
            city: cityName,
            lat: coords.lat,
            lng: coords.lng,
            date: eventForm.date,
            description: eventForm.description,
            link: eventForm.link,
          },
        ])
        .select("*")
        .single();

      if (error) {
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
      }

      setEventForm({
        name: "",
        city: "",
        address: "",
        date: "",
        description: "",
        link: "",
        source: "",
        lastChecked: "",
      });
      setAddEventMode(false);
      setAtlasNotice("Event added to atlas.");
      showToast("Event saved to atlas.", { tone: "ok", duration: 2400 });
    } catch (error) {
      setEventNotice(error?.message || "Could not save event right now.");
      showToast(error?.message || "Could not save event right now.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingEvent(false);
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
  const visibleReports =
    reportFilter === "all"
      ? reports
      : reportFilter === "resolved"
        ? resolvedReports
        : openReports;
  const qaFindings = (() => {
    if (!isAdmin) return { places: [], events: [], stale: [], cityCounts: [], totals: { places: 0, events: 0, stale: 0 } };

    const qualityMap = getQualityMap();

    const placeIssues = qaSnapshot.places
      .map((place) => {
        const issues = [];
        if (!String(place.description || "").trim()) issues.push("Missing description");
        if (String(place.description || "").trim().length < 140) issues.push("Description is short");
        if (!String(place.vibe || "").trim()) issues.push("Missing vibe");
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
        if (!String(event.description || "").trim()) issues.push("Missing description");
        if (String(event.description || "").trim().length < 120) issues.push("Description is short");
        if (!String(event.date || "").trim()) issues.push("Missing date");
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

    const staleItems = [
      ...qaSnapshot.places.map((item) => ({ ...item, entityType: "place" })),
      ...qaSnapshot.events.map((item) => ({ ...item, entityType: "event" })),
    ]
      .map((entity) => {
        const quality = getEntityQuality({
          targetType: entity.entityType,
          targetId: entity.id,
          entity,
          map: qualityMap,
        });
        const status = getQualityStatus(quality);
        if (!status.stale) return null;
        return {
          id: `${entity.entityType}-${entity.id}`,
          city: entity.city || "",
          name: entity.name || "Untitled",
          entityType: entity.entityType,
          label: status.label,
        };
      })
      .filter(Boolean);

    const cityAccumulator = {};
    [...placeIssues, ...eventIssues, ...staleItems].forEach((item) => {
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
      stale: staleItems.slice(0, 10),
      cityCounts,
      totals: {
        places: placeIssues.length,
        events: eventIssues.length,
        stale: staleItems.length,
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
                  const mappedCity = cityConfig[event.target.value]?.title?.replace("Queer ", "") || "";
                  setPlaceForm((current) => ({ ...current, city: mappedCity }));
                  setEventForm((current) => ({ ...current, city: mappedCity }));
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

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[28px] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(8,39,32,0.94),rgba(10,10,10,1))] p-6 shadow-[0_24px_80px_rgba(16,185,129,0.08)]">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Add to Atlas</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Publish to {cityTitle}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => {
                  setAtlasNotice("");
                  setPlaceNotice("");
                  setAddMode((current) => !current);
                  setAddEventMode(false);
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
                  setAddEventMode((current) => !current);
                  setAddMode(false);
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
            </div>
            {!selectedCity && (
              <p className="mt-4 text-xs text-emerald-200/80">Choose city once, then add places and events directly here.</p>
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
                  <Field value={placeForm.vibe} onChange={(event) => setPlaceForm((current) => ({ ...current, vibe: event.target.value }))} placeholder="Vibe" />
                </div>
                <Field value={placeForm.address} onChange={(event) => setPlaceForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" />
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
                  Fast check of missing signal and stale entries before publishing updates.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-cyan-100">
                  Places: {qaFindings.totals.places}
                </span>
                <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-violet-100">
                  Events: {qaFindings.totals.events}
                </span>
                <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-amber-100">
                  Needs refresh: {qaFindings.totals.stale}
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
                        onClick={() => router.push(item.city ? `/${item.city}` : "/cities")}
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
                          onClick={() =>
                            router.push(item.city ? `/${item.city}?placeId=${item.id}` : "/cities")
                          }
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

                  <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-amber-100/90">Needs refresh</p>
                    <div className="mt-3 space-y-2">
                      {qaFindings.stale.length === 0 && (
                        <p className="text-sm text-white/55">No stale items right now.</p>
                      )}
                      {qaFindings.stale.map((item) => (
                        <button
                          key={`qa-stale-${item.id}`}
                          onClick={() =>
                            router.push(
                              item.entityType === "event"
                                ? "/events"
                                : item.city
                                  ? `/${item.city}`
                                  : "/cities"
                            )
                          }
                          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-200/30"
                        >
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-xs text-white/60">
                            {formatCityLabel(item.city)} · {item.entityType}
                          </p>
                          <p className="mt-2 text-xs text-amber-100/90">{item.label}</p>
                        </button>
                      ))}
                    </div>
                  </article>
                </div>
              </>
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
