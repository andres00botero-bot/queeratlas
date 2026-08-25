"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleAlert, MapPin, Search, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { normalizeRegistrySlug } from "@/lib/cityRegistryShared";
import { loadMapboxGl } from "@/lib/mapboxGlLoader";
import { useMapboxStylesheet } from "@/lib/useMapboxStylesheet";

const EMPTY_FORM = {
  name: "",
  slug: "",
  country: "",
  countryCode: "",
  latitude: null,
  longitude: null,
  mapConfirmed: false,
  timezone: "",
  vibe: "",
  introduction: "",
  safetyContext: "",
  qariDestinationKey: "",
};

async function adminHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function ReadinessPill({ ready, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
      ready
        ? "border-emerald-200/22 bg-emerald-200/10 text-emerald-100"
        : "border-white/12 bg-white/[0.04] text-white/55"
    }`}>
      {ready ? <Check size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-white/30" />}
      {children}
    </span>
  );
}

function CityPointMap({ form, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const mapboxReady = useMapboxStylesheet();
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const hasPoint = Number.isFinite(form.longitude) && Number.isFinite(form.latitude);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!hasPoint || !mapboxReady || !token || !containerRef.current) return undefined;
    let cancelled = false;
    let map;
    loadMapboxGl().then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;
      mapboxgl.accessToken = token;
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [form.longitude, form.latitude],
        zoom: 10.5,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      const update = (lng, lat) => onChangeRef.current?.({ longitude: lng, latitude: lat, mapConfirmed: true });
      markerRef.current = new mapboxgl.Marker({ color: "#22d3ee", draggable: true })
        .setLngLat([form.longitude, form.latitude])
        .addTo(map);
      markerRef.current.on("dragend", () => {
        const point = markerRef.current.getLngLat();
        update(point.lng, point.lat);
      });
      map.on("click", (event) => {
        markerRef.current.setLngLat(event.lngLat);
        update(event.lngLat.lng, event.lngLat.lat);
      });
      mapRef.current = map;
    }).catch(() => {});
    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      map?.remove();
      mapRef.current = null;
    };
  }, [form.latitude, form.longitude, hasPoint, mapboxReady, token]);

  if (!hasPoint) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-cyan-200/18 bg-black/30">
      <div ref={containerRef} className="h-64 w-full" aria-label="Confirm city map point" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
        <p className="text-[11px] text-white/58">Click the map or drag the pin to correct the city centre.</p>
        <button
          type="button"
          onClick={() => onChange({ mapConfirmed: true })}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${form.mapConfirmed
            ? "border-emerald-200/25 bg-emerald-200/12 text-emerald-100"
            : "border-cyan-200/30 bg-cyan-200/12 text-cyan-50 hover:bg-cyan-200/18"}`}
        >
          {form.mapConfirmed ? "Pin confirmed" : "Confirm this pin"}
        </button>
      </div>
    </div>
  );
}

export default function AdminCityManager() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [cities, setCities] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = await adminHeaders();
      const response = await fetch("/api/admin/cities", { headers, cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load city registry.");
      setCities(payload.cities || []);
      setProfiles(payload.qariProfiles || []);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Could not load city registry. Run the city registry SQL first.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => load());
  }, [load]);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const headers = await adminHeaders();
        const response = await fetch(`/api/admin/cities/search?q=${encodeURIComponent(value)}`, { headers, signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "City search failed.");
        setResults(payload.results || []);
      } catch (searchError) {
        if (searchError.name !== "AbortError") setError(searchError.message);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  const matchingProfile = useMemo(
    () => profiles.find((profile) => profile.destination_key === form.qariDestinationKey) || null,
    [form.qariDestinationKey, profiles],
  );

  const requirements = {
    identity: form.name.trim().length >= 2 && form.country.trim().length >= 2,
    map: form.mapConfirmed && Number.isFinite(form.latitude) && Number.isFinite(form.longitude),
    introduction: form.introduction.trim().length >= 120,
    safety: form.safetyContext.trim().length >= 80,
    qari: Boolean(matchingProfile),
    timezone: /^[A-Za-z_+-]+\/[A-Za-z0-9_+\-/]+$/.test(form.timezone.trim()),
  };
  const canSave = Object.values(requirements).every(Boolean) && form.vibe.trim().length >= 3;

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }));

  const selectResult = (result) => {
    const profile = profiles.find((item) => item.country.toLowerCase() === result.country.toLowerCase());
    setForm((current) => ({
      ...current,
      name: result.name,
      slug: normalizeRegistrySlug(result.name),
      country: result.country,
      countryCode: result.countryCode,
      latitude: result.latitude,
      longitude: result.longitude,
      mapConfirmed: false,
      qariDestinationKey: profile?.destination_key || "",
    }));
    setQuery(result.label);
    setResults([]);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canSave || isSaving) return;
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const headers = await adminHeaders();
      const response = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not create city.");
      setNotice(`${form.name} is live but remains noindex until three approved venues or hotels exist.`);
      setForm(EMPTY_FORM);
      setQuery("");
      await load();
    } catch (saveError) {
      setError(saveError.message || "Could not create city.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-8 overflow-hidden rounded-[32px] border border-cyan-300/18 bg-[radial-gradient(circle_at_12%_8%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(236,72,153,0.12),transparent_26%),linear-gradient(155deg,rgba(15,23,42,0.96),rgba(8,8,12,0.99))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/78"><Sparkles size={14} /> City registry</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">Add a complete Atlas city</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">The city is published with noindex first. Indexing switches on automatically after every quality requirement and three approved venues or hotels are present.</p>
        </div>
        <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-xs text-cyan-50">{cities.length} registry cities</span>
      </div>

      {error && <div className="mt-4 flex gap-2 rounded-2xl border border-rose-200/20 bg-rose-200/10 p-3 text-sm text-rose-100"><CircleAlert size={18} className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm text-emerald-100">{notice}</div>}

      <form onSubmit={submit} className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
            <p className="text-sm font-semibold text-white">1. City identity and map point</p>
            <div className="relative mt-3">
              <Search size={16} className="absolute left-3 top-3.5 text-cyan-100/60" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim().length < 2) setResults([]); }} placeholder="Search the real city…" className="w-full rounded-2xl border border-white/12 bg-black/35 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-200/40" />
              {(results.length > 0 || isSearching) && <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-white/12 bg-[#10141d] p-1 shadow-2xl">
                {isSearching && <p className="p-3 text-xs text-white/50">Searching verified map data…</p>}
                {results.map((result) => <button key={result.id} type="button" onClick={() => selectResult(result)} className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-cyan-200/10"><MapPin size={15} className="mt-0.5 shrink-0 text-cyan-200" /><span><span className="block text-sm text-white">{result.name}</span><span className="block text-xs text-white/45">{result.label}</span></span></button>)}
              </div>}
            </div>
            {form.name && <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-white/60">City name<input value={form.name} onChange={(event) => updateForm({ name: event.target.value, slug: normalizeRegistrySlug(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
              <label className="text-xs text-white/60">URL slug<input value={form.slug} onChange={(event) => updateForm({ slug: normalizeRegistrySlug(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white" /></label>
              <label className="text-xs text-white/60">Country<input value={form.country} readOnly className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm text-white/72" /></label>
              <label className="text-xs text-white/60">IANA timezone<input value={form.timezone} onChange={(event) => updateForm({ timezone: event.target.value })} placeholder="Europe/Stockholm" className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/25" /></label>
            </div>}
            <CityPointMap form={form} onChange={updateForm} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
            <p className="text-sm font-semibold text-white">2. Editorial city profile</p>
            <label className="mt-3 block text-xs text-white/60">City vibe<input value={form.vibe} onChange={(event) => updateForm({ vibe: event.target.value })} placeholder="Creative, coastal, late-night…" className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/25" /></label>
            <label className="mt-3 block text-xs text-white/60">Basic introduction · minimum 120 characters<textarea value={form.introduction} onChange={(event) => updateForm({ introduction: event.target.value })} rows={5} placeholder="An original, useful introduction to queer life in this city…" className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm leading-6 text-white placeholder:text-white/25" /><span className="mt-1 block text-right text-[10px] text-white/35">{form.introduction.trim().length}/120</span></label>
            <label className="mt-3 block text-xs text-white/60">City-specific safety context · minimum 80 characters<textarea value={form.safetyContext} onChange={(event) => updateForm({ safetyContext: event.target.value })} rows={4} placeholder="Practical, sourced local context beyond the country-level QARI baseline…" className="mt-1.5 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm leading-6 text-white placeholder:text-white/25" /><span className="mt-1 block text-right text-[10px] text-white/35">{form.safetyContext.trim().length}/80</span></label>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-violet-200/16 bg-violet-200/[0.06] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">QARI baseline</p>
            {matchingProfile ? <><div className="mt-3 flex items-center justify-between gap-3"><p className="text-lg font-semibold text-white">{matchingProfile.country}</p><span className="rounded-full border border-violet-200/20 bg-violet-200/10 px-3 py-1 text-sm text-violet-50">Risk {matchingProfile.qari_score}/100</span></div><p className="mt-3 text-sm leading-6 text-white/62">{matchingProfile.summary}</p><p className="mt-3 text-[11px] text-violet-100/55">{matchingProfile.confidence} confidence · reviewed {matchingProfile.reviewed_at}</p></> : <p className="mt-3 text-sm leading-6 text-white/50">Select a city whose country has a published QARI profile. The score and summary are attached automatically.</p>}
          </div>

          <div className="rounded-3xl border border-emerald-200/16 bg-emerald-200/[0.055] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Publishing gate</p>
            <div className="mt-4 flex flex-wrap gap-2"><ReadinessPill ready={requirements.identity}>City + country</ReadinessPill><ReadinessPill ready={requirements.map}>Confirmed map point</ReadinessPill><ReadinessPill ready={requirements.timezone}>Timezone</ReadinessPill><ReadinessPill ready={requirements.introduction}>Introduction</ReadinessPill><ReadinessPill ready={requirements.safety}>Safety context</ReadinessPill><ReadinessPill ready={requirements.qari}>QARI attached</ReadinessPill><ReadinessPill ready={false}>0/3 venues at creation</ReadinessPill></div>
            <p className="mt-4 text-xs leading-5 text-white/48">Saving publishes the city route, but robots remain noindex. The database promotes it automatically when the venue threshold is reached.</p>
            <button type="submit" disabled={!canSave || isSaving || isLoading} className="mt-5 w-full rounded-2xl border border-cyan-200/30 bg-gradient-to-r from-cyan-300/20 via-blue-300/16 to-violet-300/18 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(34,211,238,0.10)] transition hover:border-cyan-100/50 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">{isSaving ? "Creating city…" : "Create city with automatic SEO gate"}</button>
          </div>

          {cities.length > 0 && <div className="rounded-3xl border border-white/10 bg-black/25 p-5"><p className="text-xs uppercase tracking-[0.18em] text-white/50">Recently added</p><div className="mt-3 space-y-2">{cities.slice(0, 6).map((city) => <div key={city.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2"><div><p className="text-sm text-white/82">{city.name}</p><p className="text-[10px] text-white/38">{city.verified_place_count || 0}/3 verified places</p></div><span className={`rounded-full px-2 py-1 text-[10px] ${city.seo_indexable ? "bg-emerald-200/12 text-emerald-100" : "bg-amber-200/10 text-amber-100"}`}>{city.seo_indexable ? "index" : "noindex"}</span></div>)}</div></div>}
        </aside>
      </form>
    </section>
  );
}
