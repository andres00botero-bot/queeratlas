"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cityConfig } from "@/lib/cities";
import { mergeSeedEvents } from "@/lib/seedContent";
import { useAuth } from "@/lib/auth";
import { addReport, getBlockedItems } from "@/lib/moderation";
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import { useActionToast } from "@/lib/useActionToast";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { usePlaces } from "@/lib/usePlaces";
import { supabase } from "@/lib/supabase";
import ActionToast from "@/components/ui/ActionToast";

const TYPES = [
  { value: "club", label: "Clubs", color: "#ef4444" },
  { value: "bar", label: "Bars", color: "#3b82f6" },
  { value: "sauna", label: "Saunas", color: "#a855f7" },
  { value: "cruise_club", label: "Cruise Clubs", color: "#111111" },
  { value: "cruising_area", label: "Cruising Areas", color: "#f97316" },
  { value: "cafe", label: "Cafes", color: "#22c55e" },
  { value: "hotel", label: "Hotels", color: "#eab308" },
];

const TYPE_LABELS = {
  club: "Club",
  bar: "Bar",
  sauna: "Sauna",
  cruise_club: "Cruise Club",
  cruising_area: "Cruising Area",
  cafe: "Cafe",
  hotel: "Hotel",
};

const TYPE_STYLES = {
  club: {
    card: "border-rose-300/12 bg-[linear-gradient(180deg,rgba(76,12,30,0.34),rgba(15,15,15,0.96))]",
    selected: "border-rose-200/30 bg-[linear-gradient(180deg,rgba(190,24,93,0.20),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(244,63,94,0.12)]",
    label: "text-rose-200",
    line: "from-rose-300/75 via-pink-300/45 to-transparent",
  },
  bar: {
    card: "border-sky-300/12 bg-[linear-gradient(180deg,rgba(10,35,72,0.34),rgba(15,15,15,0.96))]",
    selected: "border-sky-200/30 bg-[linear-gradient(180deg,rgba(14,116,244,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(59,130,246,0.12)]",
    label: "text-sky-200",
    line: "from-sky-300/75 via-cyan-300/45 to-transparent",
  },
  sauna: {
    card: "border-fuchsia-300/12 bg-[linear-gradient(180deg,rgba(78,18,90,0.34),rgba(15,15,15,0.96))]",
    selected: "border-fuchsia-200/30 bg-[linear-gradient(180deg,rgba(192,38,211,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(217,70,239,0.12)]",
    label: "text-fuchsia-200",
    line: "from-fuchsia-300/75 via-violet-300/45 to-transparent",
  },
  cruise_club: {
    card: "border-red-950/40 bg-[linear-gradient(180deg,rgba(30,6,6,0.78),rgba(10,10,10,0.98))]",
    selected: "border-red-700/40 bg-[linear-gradient(180deg,rgba(91,11,11,0.42),rgba(12,12,12,0.98))] shadow-[0_18px_50px_rgba(127,29,29,0.18)]",
    label: "text-red-200",
    line: "from-red-500/60 via-red-300/35 to-transparent",
  },
  cruising_area: {
    card: "border-amber-300/12 bg-[linear-gradient(180deg,rgba(84,44,7,0.34),rgba(15,15,15,0.96))]",
    selected: "border-amber-200/30 bg-[linear-gradient(180deg,rgba(217,119,6,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(245,158,11,0.12)]",
    label: "text-amber-200",
    line: "from-amber-300/75 via-orange-300/45 to-transparent",
  },
  cafe: {
    card: "border-emerald-300/12 bg-[linear-gradient(180deg,rgba(8,63,46,0.34),rgba(15,15,15,0.96))]",
    selected: "border-emerald-200/30 bg-[linear-gradient(180deg,rgba(5,150,105,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(16,185,129,0.12)]",
    label: "text-emerald-200",
    line: "from-emerald-300/75 via-teal-300/45 to-transparent",
  },
  hotel: {
    card: "border-yellow-200/12 bg-[linear-gradient(180deg,rgba(90,68,10,0.32),rgba(15,15,15,0.96))]",
    selected: "border-yellow-100/30 bg-[linear-gradient(180deg,rgba(202,138,4,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(234,179,8,0.12)]",
    label: "text-yellow-100",
    line: "from-yellow-200/75 via-amber-200/45 to-transparent",
  },
};

function formatDate(value) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function qualityPillClass(tone) {
  if (tone === "verified") {
    return "border-emerald-200/24 bg-emerald-200/12 text-emerald-100";
  }

  if (tone === "stale") {
    return "border-amber-200/24 bg-amber-200/12 text-amber-100";
  }

  return "border-white/16 bg-white/7 text-white/70";
}

export default function CityPage() {
  const { city } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = cityConfig[city] || cityConfig.berlin;
  const placeId = searchParams.get("placeId");
  const eventId = searchParams.get("eventId");
  const contributeMode = searchParams.get("contribute");

  const {
    places,
    addPlace,
    addReview,
    getReviews,
    isLoading: placesLoading,
    loadError: placesLoadError,
    reloadPlaces,
  } = usePlaces();
  const [eventsData, setEventsData] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [addEventMode, setAddEventMode] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("club");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [vibe, setVibe] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState("");
  const { toast, showToast } = useActionToast();
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsLoadError, setEventsLoadError] = useState("");
  const [mapError, setMapError] = useState("");
  const [, setQualityTick] = useState(0);
  const { isMember } = useAuth();

  const mapContainerRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const cityPlaces = useMemo(
    () => {
      const blocked = getBlockedItems();
      return places.filter((place) => (
        place.city?.toLowerCase() === city.toLowerCase()
        && !blocked.some(
          (item) =>
            item.targetType === "place" &&
            String(item.targetId) === String(place.id)
        )
      ));
    },
    [city, places]
  );

  const cityEvents = useMemo(
    () => {
      const blocked = getBlockedItems();
      return eventsData.filter((event) => (
        event.city?.toLowerCase() === city.toLowerCase()
        && !blocked.some(
          (item) =>
            item.targetType === "event" &&
            String(item.targetId) === String(event.id)
        )
      ));
    },
    [city, eventsData]
  );

  const qualityMap = getQualityMap();

  const selectedPlace = useMemo(() => {
    if (!placeId) return null;
    return cityPlaces.find((place) => String(place.id) === String(placeId)) || null;
  }, [cityPlaces, placeId]);

  const selectedEvent = useMemo(() => {
    if (!eventId) return null;
    return cityEvents.find((event) => String(event.id) === String(eventId)) || null;
  }, [cityEvents, eventId]);

  const canReviewSelectedPlace = Boolean(selectedPlace && !selectedPlace.seeded);

  const selectedPlaceQuality = selectedPlace
    ? getEntityQuality({
      targetType: "place",
      targetId: selectedPlace.id,
      entity: selectedPlace,
      map: qualityMap,
    })
    : null;

  const selectedEventQuality = selectedEvent
    ? getEntityQuality({
      targetType: "event",
      targetId: selectedEvent.id,
      entity: selectedEvent,
      map: qualityMap,
    })
    : null;

  const groupedPlaces = useMemo(
    () => TYPES.map((item) => ({
      ...item,
      items: cityPlaces.filter((place) => place.type === item.value),
    })),
    [cityPlaces]
  );

  const sortedEvents = useMemo(
    () => [...cityEvents].filter((event) => event.date).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [cityEvents]
  );

  const featuredEvent = useMemo(() => {
    if (sortedEvents.length === 0) return null;
    const now = new Date();
    const upcoming = sortedEvents.find((event) => new Date(event.date) >= now);
    return upcoming || sortedEvents[0];
  }, [sortedEvents]);

  const remainingEvents = useMemo(() => {
    if (!featuredEvent) return sortedEvents;
    return sortedEvents.filter((event) => String(event.id) !== String(featuredEvent.id));
  }, [featuredEvent, sortedEvents]);
  const isFocusMode = Boolean(selectedPlace || selectedEvent);
  const cityPlaceCount = cityPlaces.length;
  const cityEventCount = cityEvents.length;
  const hasAnyPlaces = cityPlaceCount > 0;

  const buildSelectionUrl = useCallback(({ nextPlaceId = placeId, nextEventId = eventId } = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPlaceId) {
      params.set("placeId", String(nextPlaceId));
    } else {
      params.delete("placeId");
    }

    if (nextEventId) {
      params.set("eventId", String(nextEventId));
    } else {
      params.delete("eventId");
    }

    params.delete("lat");
    params.delete("lng");

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [eventId, pathname, placeId, searchParams]);

  const openPlace = (place) => {
    router.push(buildSelectionUrl({ nextPlaceId: place.id, nextEventId: null }));
  };

  const openEvent = (event) => {
    router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: event.id }));
  };

  const closePlace = () => {
    router.push(buildSelectionUrl({ nextPlaceId: null }));
  };

  const closeEvent = () => {
    router.push(buildSelectionUrl({ nextEventId: null }));
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

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsLoadError("");
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      setEventsLoadError("Could not load city events right now.");
    }

    setEventsData(mergeSeedEvents(data || []));
    setEventsLoading(false);
  };

  const geocodeAddress = async (value) => {
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
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchEvents();
    });
  }, []);

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
      } else if (contributeMode === "event") {
        setAddEventMode(true);
        setAddMode(false);
      }
    });
  }, [contributeMode]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      queueMicrotask(() => {
        setMapError("Map is unavailable right now. You can still browse venues and events below.");
      });
      return;
    }

    queueMicrotask(() => {
      setMapError("");
    });

    try {
      mapboxgl.accessToken = token;
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: config.center,
        zoom: 11,
      });
    } catch {
      queueMicrotask(() => {
        setMapError("Map failed to initialize. You can still browse venues and events below.");
      });
      return;
    }

    mapRef.current.on("error", () => {
      queueMicrotask(() => {
        setMapError("Map had trouble loading. Venue and event lists are still fully available.");
      });
    });

    const handleResize = () => mapRef.current?.resize();
    window.addEventListener("resize", handleResize);

    queueMicrotask(() => {
      mapRef.current?.resize();
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [config.center]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    cityPlaces.forEach((place) => {
      if (place.lat == null || place.lng == null) return;

      const typeConfig = TYPES.find((item) => item.value === place.type);
      const marker = new mapboxgl.Marker({ color: typeConfig?.color || "#9ca3af" })
        .setLngLat([place.lng, place.lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        router.push(buildSelectionUrl({ nextPlaceId: place.id, nextEventId: null }));
      });

      markersRef.current.push(marker);
    });

    cityEvents.forEach((event) => {
      if (event.lat == null || event.lng == null) return;

      const element = document.createElement("div");
      element.style.width = "16px";
      element.style.height = "16px";
      element.style.background = "#8b5cf6";
      element.style.borderRadius = "4px";
      element.style.border = "2px solid white";

      const marker = new mapboxgl.Marker(element)
        .setLngLat([event.lng, event.lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: event.id }));
      });

      markersRef.current.push(marker);
    });
  }, [buildSelectionUrl, cityPlaces, cityEvents, router]);

  useEffect(() => {
    if (!selectedPlace) {
      queueMicrotask(() => {
        setReviews([]);
      });
      return;
    }

    getReviews(selectedPlace.id).then((data) => {
      setReviews(data);
    });
  }, [getReviews, selectedPlace]);

  useEffect(() => {
    const target = selectedPlace || selectedEvent;

    if (!target || !mapRef.current || target.lat == null || target.lng == null) {
      if (!selectedPlace && !selectedEvent && mapRef.current) {
        mapRef.current.flyTo({
          center: config.center,
          zoom: 11,
        });
      }
      return;
    }

    mapRef.current.flyTo({
      center: [target.lng, target.lat],
      zoom: 13,
    });

    mapWrapperRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [config.center, selectedEvent, selectedPlace]);

  const handleAddPlace = async () => {
    if (!name.trim() || !address.trim() || !description.trim()) {
      showToast("Fill in name, address, and description before saving place.", { tone: "warn", duration: 2400 });
      return;
    }

    try {
      const coords = await geocodeAddress(address);

      if (!coords) {
        showToast("Address not found. Try a more specific address.", { tone: "warn", duration: 2400 });
        return;
      }

      const createdPlace = await addPlace({
        name,
        type,
        description,
        vibe,
        lat: coords.lat,
        lng: coords.lng,
        city,
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

      setName("");
      setAddress("");
      setDescription("");
      setVibe("");
      setAddMode(false);
      showToast("Place added to city atlas.", { tone: "ok", duration: 2200 });
    } catch (error) {
      showToast(error?.message || "Could not save place right now.", { tone: "warn", duration: 2600 });
    }
  };

  const handleAddEvent = async () => {
    if (!eventName.trim() || !eventAddress.trim() || !eventDate) {
      showToast("Fill in event name, address, and date before saving.", { tone: "warn", duration: 2400 });
      return;
    }

    try {
      const coords = await geocodeAddress(eventAddress);

      if (!coords) {
        showToast("Address not found. Try a more specific address.", { tone: "warn", duration: 2400 });
        return;
      }

      const { data: createdEvent, error } = await supabase
        .from("events")
        .insert([
          {
            name: eventName,
            city,
            lat: coords.lat,
            lng: coords.lng,
            date: eventDate,
            description: eventDescription,
            link: eventLink,
          },
        ])
        .select("*")
        .single();

      if (error) {
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
      setEventName("");
      setEventAddress("");
      setEventDate("");
      setEventDescription("");
      setEventLink("");
      setAddEventMode(false);
      showToast("Event added to city atlas.", { tone: "ok", duration: 2200 });
    } catch (error) {
      showToast(error?.message || "Could not save event right now.", { tone: "warn", duration: 2600 });
    }
  };

  const handleReport = ({ targetType, targetId, title }) => {
    const reason = window.prompt("Why are you reporting this? (safety, wrong info, spam, abuse)");
    if (!reason) return;

    addReport({
      targetType,
      targetId,
      city: config.title?.replace("Queer ", "") || city,
      title,
      reason,
    });

    showToast("Report sent. Thanks for keeping the atlas safe.", { tone: "info", duration: 2600 });
  };

  const refreshEntityQuality = ({ targetType, targetId, fallbackSource = "" }, clickEvent) => {
    clickEvent?.stopPropagation();

    const existing = getEntityQuality({
      targetType,
      targetId,
      entity: { source: fallbackSource },
      map: qualityMap,
    });

    const sourceInput = window.prompt(
      "Update source (URL or name)",
      existing?.source || fallbackSource || ""
    );
    if (sourceInput === null) return;

    const defaultChecked = existing?.lastChecked || new Date().toISOString().slice(0, 10);
    const checkedInput = window.prompt(
      "Update last checked date (YYYY-MM-DD)",
      defaultChecked
    );
    if (checkedInput === null) return;

    upsertQuality({
      targetType,
      targetId,
      source: sourceInput,
      lastChecked: checkedInput || defaultChecked,
      verified: Boolean(sourceInput.trim() && (checkedInput || defaultChecked)),
    });

    setQualityTick((value) => value + 1);
  };

  return (
    <main className="flex min-h-screen bg-[#050505] text-white">
      <ActionToast toast={toast} />
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="relative mb-6 overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_8%_0%,rgba(244,114,182,0.14),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(45,212,191,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.10),transparent_30%),linear-gradient(135deg,rgba(24,24,24,0.96),rgba(10,10,10,0.99),rgba(25,22,20,0.97))] p-7 shadow-[0_30px_110px_rgba(0,0,0,0.42)]">
          <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-fuchsia-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-4 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="mb-2 flex items-center gap-4">
            <Image
              src="/queer-atlas-heart-logo-progress.svg"
              alt="Queer Atlas heart"
              width={64}
              height={64}
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
            />
            <h1 className="text-4xl font-bold tracking-[-0.03em]">{config.title}</h1>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-fuchsia-100/90">
              {cityPlaceCount} places
            </span>
            <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/90">
              {cityEventCount} events
            </span>
            <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70">
              Queer signal live
            </span>
          </div>
          {config.guide?.[0] && (
            <div className="max-w-6xl text-justify text-sm leading-7 text-gray-300 [text-wrap:pretty] sm:text-[15px]">
              {config.guide[0].text}
            </div>
          )}
          {config.guide?.[0]?.extra && (
            <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/45">
              {config.guide[0].extra}
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (!isMember) {
                writeLocalValue("qa_redirect", pathname);
                router.push("/?join=true");
                return;
              }

              setAddMode((current) => !current);
              setAddEventMode(false);
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              addMode
                ? "bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.16)]"
                : "bg-gradient-to-r from-emerald-300 to-teal-200 text-black shadow-[0_14px_40px_rgba(45,212,191,0.16)]"
            }`}
          >
            {addMode ? "Cancel adding" : "+ Add place"}
          </button>

          <button
            onClick={() => {
              if (!isMember) {
                writeLocalValue("qa_redirect", pathname);
                router.push("/?join=true");
                return;
              }

              setAddEventMode((current) => !current);
              setAddMode(false);
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              addEventMode
                ? "bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.16)]"
                : "bg-gradient-to-r from-violet-300 to-fuchsia-200 text-black shadow-[0_14px_40px_rgba(192,132,252,0.16)]"
            }`}
          >
            {addEventMode ? "Cancel event" : "+ Add event"}
          </button>
        </div>

        {addMode && (
          <div className="mb-6 space-y-3 rounded-[28px] border border-emerald-300/12 bg-[linear-gradient(180deg,rgba(9,36,30,0.92),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Place name" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description (vibe, crowd, energy...)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={vibe} onChange={(event) => setVibe(event.target.value)} placeholder="Vibe (for example Chill, Techno, Luxury)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 outline-none">
              {TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button onClick={handleAddPlace} className="w-full rounded-2xl bg-gradient-to-r from-emerald-300 to-teal-200 py-3 font-semibold text-black">
              Save
            </button>
          </div>
        )}

        {addEventMode && (
          <div className="mb-6 space-y-3 rounded-[28px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(28,19,56,0.92),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(139,92,246,0.08)]">
            <input value={eventName} onChange={(event) => setEventName(event.target.value)} placeholder="Event name" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <textarea value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} placeholder="Description (what is this event?)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={eventLink} onChange={(event) => setEventLink(event.target.value)} placeholder="Event link (Instagram, RA, etc)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={eventAddress} onChange={(event) => setEventAddress(event.target.value)} placeholder="Address" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <button onClick={handleAddEvent} className="w-full rounded-2xl bg-gradient-to-r from-violet-300 to-fuchsia-200 py-3 font-semibold text-black">
              Save event
            </button>
          </div>
        )}

        <div ref={mapWrapperRef} className="mb-8">
          <div className="relative h-[460px] w-full overflow-hidden rounded-[30px] border border-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.30)]">
            <div ref={mapContainerRef} className="h-full w-full" />
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center backdrop-blur-sm">
                <div>
                  <p className="text-sm text-white/80">{mapError}</p>
                  <button
                    onClick={() => {
                      mapWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="mt-4 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-xs text-white/75 transition hover:border-white/30 hover:text-white"
                  >
                    Continue in list mode
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-10 rounded-[30px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(34,18,56,0.90),rgba(10,10,10,0.98))] p-6 shadow-[0_20px_60px_rgba(139,92,246,0.08)]">
          <h2 className="sticky top-0 z-20 -mx-2 mb-4 border-b border-violet-300/10 bg-[#050505]/92 px-2 py-3 text-xl tracking-wide text-violet-200 backdrop-blur">
            Events
          </h2>
          {eventsLoadError && (
            <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
              <p>{eventsLoadError}</p>
              <button
                onClick={fetchEvents}
                className="mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
              >
                Retry
              </button>
            </div>
          )}
          {eventsLoading && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
              Loading city events...
            </div>
          )}

          {featuredEvent && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm text-purple-400">Featured upcoming</h3>
              <div
                onClick={() => openEvent(featuredEvent)}
                role="button"
                tabIndex={0}
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                    keyEvent.preventDefault();
                    openEvent(featuredEvent);
                  }
                }}
                className={`animate-rise-in relative cursor-pointer overflow-hidden rounded-[24px] border border-violet-300/16 bg-[linear-gradient(130deg,rgba(109,40,217,0.36),rgba(244,114,182,0.14),rgba(16,16,16,0.96))] p-5 transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
                  isFocusMode && String(selectedEvent?.id) !== String(featuredEvent.id)
                    ? "opacity-55 saturate-75"
                    : ""
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-violet-300/18 blur-3xl" />
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{featuredEvent.name}</h3>
                  {featuredEvent.date && (
                    <span className="rounded bg-purple-500 px-2 py-1 text-xs text-black">
                      {formatDate(featuredEvent.date)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-purple-200/90">Next notable event in this city</p>
                  <button
                    onClick={(clickEvent) =>
                      refreshEntityQuality(
                        { targetType: "event", targetId: featuredEvent.id, fallbackSource: featuredEvent.link || "" },
                        clickEvent
                      )
                    }
                    className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(getQualityStatus(getEntityQuality({
                    targetType: "event",
                    targetId: featuredEvent.id,
                    entity: featuredEvent,
                    map: qualityMap,
                  })).tone)}`}>
                    {getQualityStatus(getEntityQuality({
                      targetType: "event",
                      targetId: featuredEvent.id,
                      entity: featuredEvent,
                      map: qualityMap,
                    })).label}
                  </button>
                </div>
                <div className="mt-3 h-1.5 w-28 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-200" />
              </div>
            </div>
          )}

          {remainingEvents.map((event) => (
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
                  onClick={() => openEvent(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                      keyEvent.preventDefault();
                      openEvent(event);
                    }
                  }}
                  className={`animate-rise-in mb-3 cursor-pointer rounded-[22px] border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
                    String(selectedEvent?.id) === String(event.id)
                      ? "border-violet-200/24 bg-[linear-gradient(180deg,rgba(90,35,170,0.35),rgba(15,15,15,0.96))]"
                      : `border-violet-300/12 bg-[linear-gradient(180deg,rgba(34,24,46,0.82),rgba(15,15,15,0.96))] hover:border-violet-200/22 ${
                        isFocusMode ? "opacity-55 saturate-75" : ""
                      }`
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-semibold">{event.name}</h3>
                    {event.date && (
                      <span className="rounded bg-purple-500 px-2 py-1 text-xs text-black">
                        {formatDate(event.date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-purple-400">Community event</p>
                    <button
                      onClick={(clickEvent) =>
                        refreshEntityQuality(
                          { targetType: "event", targetId: event.id, fallbackSource: event.link || "" },
                          clickEvent
                        )
                      }
                      className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}
                    >
                      {qualityStatus.label}
                    </button>
                  </div>
                </div>
              );
            })()
          ))}
          {!eventsLoading && !featuredEvent && remainingEvents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/12 px-4 py-8 text-center text-sm text-white/50">
              <p>No events published in this city yet.</p>
              {isMember && (
                <button
                  onClick={() => {
                    setAddEventMode(true);
                    setAddMode(false);
                  }}
                  className="mt-4 rounded-full border border-violet-200/24 bg-violet-200/10 px-4 py-2 text-xs text-violet-100 transition hover:border-violet-200/40"
                >
                  Add first event
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mb-10 rounded-[30px] border border-amber-200/10 bg-[linear-gradient(180deg,rgba(36,28,15,0.82),rgba(12,12,12,0.98))] p-6 shadow-[0_20px_60px_rgba(251,191,36,0.06)]">
          <h2 className="sticky top-0 z-20 -mx-2 mb-4 border-b border-amber-200/10 bg-[#050505]/92 px-2 py-3 text-xl tracking-wide text-amber-100 backdrop-blur">
            Quick Guide
          </h2>
          {placesLoading && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
              Loading places...
            </div>
          )}
          {placesLoadError && (
            <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
              <p>{placesLoadError}</p>
              <button
                onClick={reloadPlaces}
                className="mt-3 rounded-full border border-rose-200/25 bg-rose-200/10 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/40"
              >
                Retry
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {config.guide.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className={`rounded-[22px] border p-4 transition hover:-translate-y-[1px] ${
                  index === 0
                    ? "col-span-2 border-amber-200/20 bg-[linear-gradient(135deg,rgba(180,83,9,0.20),rgba(251,191,36,0.08),rgba(12,12,12,0.98))] shadow-[0_14px_34px_rgba(251,191,36,0.10)]"
                    : index % 3 === 1
                      ? "border-cyan-200/14 bg-[linear-gradient(180deg,rgba(14,48,64,0.36),rgba(12,12,12,0.98))] hover:border-cyan-200/24"
                      : index % 3 === 2
                        ? "border-violet-200/14 bg-[linear-gradient(180deg,rgba(47,28,78,0.34),rgba(12,12,12,0.98))] hover:border-violet-200/24"
                        : "border-emerald-200/14 bg-[linear-gradient(180deg,rgba(16,70,52,0.34),rgba(12,12,12,0.98))] hover:border-emerald-200/24"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs uppercase ${
                  index === 0
                    ? "border-amber-200/40 bg-amber-200/14 text-amber-100"
                    : "border-white/12 bg-white/5 text-white/72"
                }`}>
                  {item.title.slice(0, 1)}
                </div>
                <h3 className={`mt-2 font-semibold ${index === 0 ? "text-base text-amber-50" : "text-sm"}`}>{item.title}</h3>
                <p className={`mt-2 text-xs text-gray-300 ${index === 0 ? "leading-7" : "leading-6"}`}>{item.text}</p>
                {item.extra && (
                  <p className={`mt-2 text-xs uppercase tracking-[0.14em] ${index === 0 ? "text-amber-100/65" : "text-white/36"}`}>{item.extra}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {!hasAnyPlaces && (
          <div className="mb-10 rounded-[30px] border border-dashed border-white/12 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(10,10,10,0.99))] p-8 text-center">
            <p className="text-sm text-white/55">No places published in this city yet.</p>
            {isMember && (
              <button
                onClick={() => {
                  setAddMode(true);
                  setAddEventMode(false);
                }}
                className="mt-4 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-4 py-2 text-xs text-emerald-100 transition hover:border-emerald-200/35"
              >
                Add first place
              </button>
            )}
          </div>
        )}

        {groupedPlaces.map((group) => {
          if (group.items.length === 0) return null;

          return (
            <div key={group.value} className="mb-10 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <h2 className="sticky top-0 z-20 -mx-2 mb-4 border-b border-white/8 bg-[#050505]/92 px-2 py-3 text-lg tracking-wide text-white/82 backdrop-blur">
                {group.label}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {group.items.map((place, index) => (
                  (() => {
                    const style = TYPE_STYLES[place.type] || TYPE_STYLES.bar;
                    const isSelected = String(selectedPlace?.id) === String(place.id);
                    const quality = getEntityQuality({
                      targetType: "place",
                      targetId: place.id,
                      entity: place,
                      map: qualityMap,
                    });
                    const qualityStatus = getQualityStatus(quality);

                    return (
                  <div
                    key={place.id}
                    onClick={() => openPlace(place)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                        keyEvent.preventDefault();
                        openPlace(place);
                      }
                    }}
                    style={{ animationDelay: `${Math.min(index * 45, 280)}ms` }}
                    className={`animate-rise-in cursor-pointer rounded-[24px] border p-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 ${
                      index === 0 ? "md:col-span-2" : ""
                    } ${
                      isFocusMode && !isSelected ? "opacity-60 saturate-75" : ""
                    } ${
                      isSelected
                        ? style.selected
                        : `${style.card} hover:border-white/16`
                    }`}
                  >
                    <div className={`mb-4 h-px w-20 bg-gradient-to-r ${style.line}`} />
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className={`${index === 0 ? "text-base" : "text-sm"} font-semibold leading-tight`}>{place.name}</h3>
                        {place.vibe && (
                          <div className={`mt-1 text-xs ${style.label}`}>
                            {(TYPE_LABELS[place.type] || "Place")} / {place.vibe}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(place.id);
                          }}
                          className={`text-sm ${
                            favorites.includes(String(place.id))
                              ? "text-pink-500"
                              : "text-gray-400 hover:text-pink-400"
                          }`}
                        >
                          {favorites.includes(String(place.id)) ? "Saved" : "Save"}
                        </button>

                        <div className="text-xs text-gray-400">
                          Rating {place.avgRating?.toFixed(1) || "-"}
                        </div>
                      </div>
                    </div>

                    {place.description && (
                      <p className={`mb-3 ${index === 0 ? "line-clamp-3" : "line-clamp-2"} text-xs leading-snug text-gray-400`}>
                        {place.description}
                      </p>
                    )}

                    {place.hours && (
                      <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-cyan-200/72">
                        {place.hours}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{place.reviewCount || 0} reviews</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(clickEvent) =>
                            refreshEntityQuality(
                              { targetType: "place", targetId: place.id, fallbackSource: "" },
                              clickEvent
                            )
                          }
                          className={`rounded-full border px-2 py-0.5 transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}
                        >
                          {qualityStatus.label}
                        </button>
                        <span>{group.label}</span>
                      </div>
                    </div>
                  </div>
                    );
                  })()
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlace && (
        <div className="relative w-[420px] overflow-y-auto border-l border-white/10 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.10),transparent_22%),linear-gradient(180deg,rgba(17,17,17,0.98),rgba(10,10,10,1))] p-6 shadow-[-24px_0_80px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />
          <button className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:text-white" onClick={closePlace}>
            Close
          </button>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-100">
                {selectedPlace.city || config.title?.replace("Queer ", "")}
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
                {TYPE_LABELS[selectedPlace.type] || "Place"}
              </span>
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em]">{selectedPlace.name}</h2>
            <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-fuchsia-300" />
            {selectedPlace.description && (
              <p className="mb-2 text-sm text-gray-300">{selectedPlace.description}</p>
            )}
            {selectedPlace.hours && (
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-200/72">
                {selectedPlace.hours}
              </p>
            )}
            <p className="text-sm text-white/78">
              Rating {selectedPlace.avgRating?.toFixed(1) || "-"} ({selectedPlace.reviewCount || 0})
            </p>
            {selectedPlaceQuality && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={(clickEvent) =>
                    refreshEntityQuality(
                      { targetType: "place", targetId: selectedPlace.id, fallbackSource: selectedPlaceQuality.source || "" },
                      clickEvent
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition hover:opacity-90 ${qualityPillClass(getQualityStatus(selectedPlaceQuality).tone)}`}
                >
                  {getQualityStatus(selectedPlaceQuality).label}
                </button>
                {selectedPlaceQuality.lastChecked && (
                  <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Checked {formatDate(selectedPlaceQuality.lastChecked)}
                  </span>
                )}
                {selectedPlaceQuality.source && (
                  <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Source set
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() =>
                handleReport({
                  targetType: "place",
                  targetId: selectedPlace.id,
                  title: selectedPlace.name,
                })
              }
              className="rounded-full border border-rose-200/20 bg-rose-200/8 px-4 py-2 text-xs text-rose-100 transition hover:border-rose-200/35 hover:bg-rose-200/12"
            >
              Report place
            </button>
            <button
              onClick={() => toggleFavorite(selectedPlace.id)}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                favorites.includes(String(selectedPlace.id))
                  ? "border-pink-300/30 bg-pink-300/12 text-pink-100"
                  : "border-white/12 bg-white/6 text-white/70 hover:border-white/20 hover:text-white"
              }`}
            >
              {favorites.includes(String(selectedPlace.id)) ? "Saved" : "Save place"}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <p className="text-sm text-white/80">Rating {review.rating}</p>
                <p className="mt-2 text-sm text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/45">Add your review</p>
            <div className="mb-2 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-600"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mb-2 w-full rounded-2xl border border-white/10 bg-black/40 p-3"
            />

            <button
              onClick={async () => {
                if (!comment) return;

                await addReview({
                  placeId: selectedPlace.id,
                  rating,
                  comment,
                });

                setComment("");
                setRating(5);
                const updated = await getReviews(selectedPlace.id);
                setReviews(updated);
              }}
              className="w-full rounded-2xl bg-white py-3 font-semibold text-black"
            >
              Submit review
            </button>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="relative w-[420px] overflow-y-auto border-l border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_26%),linear-gradient(180deg,rgba(21,17,32,0.98),rgba(10,10,10,1))] p-6 shadow-[-24px_0_80px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-violet-400/14 blur-3xl" />
          <button className="rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:text-white" onClick={closeEvent}>
            Close
          </button>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-violet-100">
                {selectedEvent.city || config.title?.replace("Queer ", "")}
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
                Community event
              </span>
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em]">{selectedEvent.name}</h2>
            <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200" />
            {selectedEvent.date && (
              <p className="mb-2 text-sm text-purple-300">{formatDate(selectedEvent.date)}</p>
            )}
            {selectedEvent.description && (
              <div className="mb-1">
                <p className="mb-1 text-xs text-gray-500">About event</p>
                <p className="text-sm leading-relaxed text-gray-300">{selectedEvent.description}</p>
              </div>
            )}
            {selectedEventQuality && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={(clickEvent) =>
                    refreshEntityQuality(
                      { targetType: "event", targetId: selectedEvent.id, fallbackSource: selectedEventQuality.source || selectedEvent.link || "" },
                      clickEvent
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] transition hover:opacity-90 ${qualityPillClass(getQualityStatus(selectedEventQuality).tone)}`}
                >
                  {getQualityStatus(selectedEventQuality).label}
                </button>
                {selectedEventQuality.lastChecked && (
                  <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Checked {formatDate(selectedEventQuality.lastChecked)}
                  </span>
                )}
                {selectedEventQuality.source && (
                  <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
                    Source set
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => toggleFavorite(`event-${selectedEvent.id}`)}
              className={`w-full rounded-2xl border px-4 py-3 text-sm transition ${
                favorites.includes(`event-${selectedEvent.id}`)
                  ? "border-pink-300/30 bg-pink-300/12 text-pink-100"
                  : "border-white/12 bg-white/6 text-white/70 hover:border-white/20 hover:text-white"
              }`}
            >
              {favorites.includes(`event-${selectedEvent.id}`) ? "Saved" : "Save event"}
            </button>
            {selectedEvent.link && (
              <a
                href={selectedEvent.link}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-2xl bg-gradient-to-r from-violet-300 to-fuchsia-200 py-3 text-center font-semibold text-black"
              >
                Open event link
              </a>
            )}

            <button
              onClick={() => {
                if (!mapRef.current || selectedEvent.lat == null || selectedEvent.lng == null) return;

                mapRef.current.flyTo({
                  center: [selectedEvent.lng, selectedEvent.lat],
                  zoom: 14,
                });
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3"
            >
              Show on map
            </button>
            <button
              onClick={() =>
                handleReport({
                  targetType: "event",
                  targetId: selectedEvent.id,
                  title: selectedEvent.name,
                })
              }
              className="w-full rounded-2xl border border-rose-200/20 bg-rose-200/8 py-3 text-sm text-rose-100 transition hover:border-rose-200/35 hover:bg-rose-200/12"
            >
              Report event
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
