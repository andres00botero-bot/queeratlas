"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, LocateFixed, MapPin, Search } from "lucide-react";
import {
  isCoordinateInsideBounds,
  resolveCityGeocodingContext,
} from "@/lib/cityGeocodingContext";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";

function createSessionToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `qa-location-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function VenueLocationPicker({
  address,
  city,
  location,
  onAddressChange,
  onLocationChange,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const updateMarkerRef = useRef(null);
  const sessionTokenRef = useRef(createSessionToken());
  const previousCityRef = useRef(String(city || ""));
  const addressRef = useRef(address);
  const locationRef = useRef(location);
  const onLocationChangeRef = useRef(onLocationChange);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [showMap, setShowMap] = useState(Boolean(location));
  const [message, setMessage] = useState("");
  const mapboxReady = useMapboxStylesheet();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const cityContext = useMemo(() => resolveCityGeocodingContext(city), [city]);
  const cityCenterKey = cityContext.center?.join(",") || "";
  const boundsRef = useRef(cityContext.bounds);

  useEffect(() => {
    addressRef.current = address;
    locationRef.current = location;
    onLocationChangeRef.current = onLocationChange;
    boundsRef.current = cityContext.bounds;
  }, [address, cityContext.bounds, location, onLocationChange]);

  const confirmCoordinates = useCallback((lat, lng, source = "manual") => {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    if (!isCoordinateInsideBounds({ lat: latitude, lng: longitude }, boundsRef.current)) {
      setMessage("The pin is outside the selected city area. Place it closer to the venue's city.");
      return;
    }
    onLocationChangeRef.current?.({
      address: String(addressRef.current || "").trim(),
      label: source === "manual" ? "Pin confirmed on map" : locationRef.current?.label || "Selected address",
      lat: latitude,
      lng: longitude,
      source,
    });
    setMessage(source === "manual" ? "Pin position confirmed." : "Address and pin confirmed.");
  }, []);

  useEffect(() => {
    const currentCity = String(city || "");
    if (previousCityRef.current === currentCity) return;
    previousCityRef.current = currentCity;
    sessionTokenRef.current = createSessionToken();
    setSuggestions([]);
    setMessage("");
    setShowMap(false);
    onLocationChange?.(null);
  }, [city, onLocationChange]);

  useEffect(() => {
    const query = String(address || "").trim();
    if (query.length < 3 || !cityContext.city || location) {
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setMessage("");
      try {
        const params = new URLSearchParams({
          city: cityContext.city,
          q: query,
          sessionToken: sessionTokenRef.current,
        });
        const response = await fetch(`/api/geocode/suggest?${params}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Address search failed.");
        setSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : []);
        if (!payload?.suggestions?.length) {
          setMessage("No exact suggestion found. Open the map and place the pin manually.");
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          setSuggestions([]);
          setMessage(error?.message || "Address search failed.");
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [address, cityContext.city, location]);

  useEffect(() => {
    if (!showMap || !mapboxReady || !mapboxToken || !mapContainerRef.current || !cityContext.center) {
      return undefined;
    }

    let cancelled = false;
    let activeMap = null;

    const setup = async () => {
      const mapboxgl = await loadMapboxGl();
      if (cancelled || !mapContainerRef.current) return;
      mapboxgl.accessToken = mapboxToken;
      const initialLocation = locationRef.current;
      const initialCenter = initialLocation
        ? [Number(initialLocation.lng), Number(initialLocation.lat)]
        : cityContext.center;
      activeMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: initialLocation ? 16 : 12,
      });
      mapRef.current = activeMap;

      const setMarker = (lng, lat, source) => {
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ color: "#22d3ee", draggable: true })
            .setLngLat([lng, lat])
            .addTo(activeMap);
          markerRef.current.on("dragend", () => {
            const point = markerRef.current.getLngLat();
            confirmCoordinates(point.lat, point.lng, "manual");
          });
        } else {
          markerRef.current.setLngLat([lng, lat]);
        }
        if (source === "manual") confirmCoordinates(lat, lng, source);
      };
      updateMarkerRef.current = setMarker;

      if (initialLocation) {
        setMarker(Number(initialLocation.lng), Number(initialLocation.lat), initialLocation.source || "selected");
      }
      activeMap.on("click", (event) => setMarker(event.lngLat.lng, event.lngLat.lat, "manual"));
    };

    setup().catch(() => setMessage("The map preview could not be opened."));
    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      updateMarkerRef.current = null;
      activeMap?.remove();
      mapRef.current = null;
    };
  }, [cityCenterKey, cityContext.center, confirmCoordinates, mapboxReady, mapboxToken, showMap]);

  useEffect(() => {
    if (!location || !mapRef.current) return;
    updateMarkerRef.current?.(Number(location.lng), Number(location.lat), location.source || "selected");
    mapRef.current.easeTo({ center: [Number(location.lng), Number(location.lat)], zoom: 16 });
  }, [location]);

  const handleAddressInput = (event) => {
    onAddressChange?.(event.target.value);
    onLocationChange?.(null);
    setIsSearching(false);
    setSuggestions([]);
    setMessage("");
    setShowMap(false);
  };

  const selectSuggestion = async (suggestion) => {
    setIsRetrieving(true);
    setMessage("");
    try {
      if (suggestion.provider === "mapbox-geocoding-v6") {
        const nextLocation = {
          address: suggestion.address,
          label: suggestion.name || suggestion.address,
          lat: Number(suggestion.lat),
          lng: Number(suggestion.lng),
          source: suggestion.provider,
        };
        onAddressChange?.(suggestion.address);
        onLocationChange?.(nextLocation);
        setSuggestions([]);
        setShowMap(true);
        setMessage("Address selected. Check the pin and drag it if needed.");
        return;
      }
      const params = new URLSearchParams({
        city: cityContext.city,
        id: suggestion.id,
        sessionToken: sessionTokenRef.current,
      });
      const response = await fetch(`/api/geocode/retrieve?${params}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Could not retrieve the selected address.");
      onAddressChange?.(payload.address || suggestion.address);
      onLocationChange?.(payload);
      setSuggestions([]);
      setShowMap(true);
      setMessage("Address selected. Check the pin and drag it if needed.");
      sessionTokenRef.current = createSessionToken();
    } catch (error) {
      setMessage(error?.message || "Could not retrieve the selected address.");
    } finally {
      setIsRetrieving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-200/18 bg-cyan-200/[0.045] p-3">
      <label htmlFor="venue-location-address" className="text-xs font-semibold text-white/82">
        Venue address and map position
      </label>
      <p className="mt-1 text-[11px] leading-4 text-white/46">
        Type the address, choose the intended result, then confirm the pin on the map.
      </p>
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" aria-hidden="true" />
        <input
          id="venue-location-address"
          value={address}
          onChange={handleAddressInput}
          placeholder={cityContext.city ? `Search an address in ${cityContext.city}` : "Enter city first, then search address"}
          autoComplete="off"
          disabled={!cityContext.center}
          className="min-h-12 w-full rounded-xl border border-white/14 bg-black/42 py-3 pl-10 pr-3.5 text-base text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/48 focus:ring-2 focus:ring-cyan-200/14 sm:text-sm"
        />
      </div>

      {suggestions.length > 0 ? (
        <div role="listbox" aria-label="Address suggestions" className="mt-2 overflow-hidden rounded-xl border border-white/14 bg-[#080a0e] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.45)]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              role="option"
              aria-selected="false"
              disabled={isRetrieving}
              onClick={() => selectSuggestion(suggestion)}
              className="flex min-h-12 w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200/72" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white/88">{suggestion.name || suggestion.address}</span>
                <span className="mt-0.5 block text-xs leading-4 text-white/46">{suggestion.secondary || suggestion.address}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!cityContext.center || !mapboxToken}
          onClick={() => setShowMap((current) => !current)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/16 bg-white/[0.055] px-3 text-xs font-semibold text-white/76 transition hover:border-cyan-100/36 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LocateFixed className="h-4 w-4" aria-hidden="true" />
          {showMap ? "Hide map" : location ? "Check pin" : "Place pin manually"}
        </button>
        {isSearching ? <span className="text-xs text-white/42">Searching addresses…</span> : null}
        {location ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200/86">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Pin confirmed
          </span>
        ) : null}
      </div>

      {showMap ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/14 bg-black/35">
          <div ref={mapContainerRef} aria-label="Venue pin confirmation map" className="h-60 w-full" />
          <p className="border-t border-white/10 px-3 py-2 text-[11px] leading-4 text-white/48">
            Click the exact location or drag the pin. The venue cannot be saved until a pin is confirmed.
          </p>
        </div>
      ) : null}

      {message ? <p role="status" className="mt-2 text-xs leading-5 text-cyan-50/70">{message}</p> : null}
    </div>
  );
}
