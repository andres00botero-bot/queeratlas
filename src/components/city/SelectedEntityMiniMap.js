"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, MapPin } from "lucide-react";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";

const TONES = {
  venue: {
    border: "border-cyan-100/28",
    badge: "border-cyan-100/30 bg-cyan-300/16 text-cyan-50",
    marker: "#22d3ee",
  },
  event: {
    border: "border-violet-200/26",
    badge: "border-violet-100/30 bg-violet-300/16 text-violet-50",
    marker: "#c084fc",
  },
  service: {
    border: "border-emerald-200/26",
    badge: "border-emerald-100/30 bg-emerald-300/16 text-emerald-50",
    marker: "#34d399",
  },
};

export default function SelectedEntityMiniMap({ entity, kind = "venue", onExpand }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapFailed, setMapFailed] = useState(false);
  const isMapboxStylesReady = useMapboxStylesheet();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const lat = Number(entity?.lat);
  const lng = Number(entity?.lng);
  const hasCoordinates =
    entity?.lat !== null &&
    entity?.lat !== undefined &&
    entity?.lat !== "" &&
    entity?.lng !== null &&
    entity?.lng !== undefined &&
    entity?.lng !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);
  const tone = TONES[kind] || TONES.venue;

  useEffect(() => {
    if (!hasCoordinates || !token || !isMapboxStylesReady || !containerRef.current) return;

    let cancelled = false;
    let marker = null;

    (async () => {
      try {
        const mapboxgl = await loadMapboxGl();
        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = token;
        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [lng, lat],
          zoom: 15.4,
          interactive: false,
          attributionControl: true,
          fadeDuration: 0,
        });
        mapRef.current = map;
        marker = new mapboxgl.Marker({ color: tone.marker, scale: 0.9 })
          .setLngLat([lng, lat])
          .addTo(map);
        map.on("load", () => map.resize());
        map.on("error", () => setMapFailed(true));
      } catch {
        if (!cancelled) setMapFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      marker?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [hasCoordinates, isMapboxStylesReady, lat, lng, token, tone.marker]);

  if (!hasCoordinates || !token || mapFailed) return null;

  return (
    <div className={`relative mb-4 h-[190px] overflow-hidden rounded-[20px] border bg-[#101018] shadow-[0_16px_40px_rgba(0,0,0,0.22)] sm:hidden ${tone.border}`}>
      <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,15,0.04),rgba(6,8,15,0.34))]" />
      <div className={`pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md ${tone.badge}`}>
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        Location
      </div>
      <button
        type="button"
        onClick={onExpand}
        className="qa-action absolute inset-0 flex items-end justify-end p-3 text-left"
        aria-label={`Expand map for ${entity?.name || "this location"}`}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/22 bg-black/72 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Expand map
        </span>
      </button>
    </div>
  );
}
