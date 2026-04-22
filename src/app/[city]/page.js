"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cityConfig } from "@/lib/cities";
import { mergeSeedEventsAsync } from "@/lib/seedMerge";
import { useAuth } from "@/lib/auth";
import {
  addReport,
  getBlockedItems,
  subscribeBlockedItems,
  syncBlockedItemsFromCloud,
} from "@/lib/moderation";
import { getEntityQuality, getQualityMap, getQualityStatus, upsertQuality } from "@/lib/quality";
import { getMemberTitleMeta } from "@/lib/communityRanking";
import { useActionToast } from "@/lib/useActionToast";
import { readLocalJson, writeLocalJson, writeLocalValue } from "@/lib/storage";
import { captureOperationalError } from "@/lib/monitoring";
import { trackKpiEvent } from "@/lib/analytics";
import {
  buildLiveVibeHeadline,
  formatLiveVibeUpdatedAt,
  getLiveVibeConsensus,
  getLiveVibeMemberMomentum,
  getLiveVibePulse,
  isMissingTableError,
  LIVE_VIBE_OPTIONS,
  summarizeLiveVibeSignals,
} from "@/lib/liveVibe";
import { usePlaces } from "@/lib/usePlaces";
import { supabase } from "@/lib/supabase";
import ActionToast from "@/components/ui/ActionToast";
import DateInput from "@/components/ui/DateInput";

const TYPES = [
  { value: "club", label: "Clubs", color: "#ef4444" },
  { value: "bar", label: "Bars", color: "#3b82f6" },
  { value: "restaurant", label: "Restaurants", color: "#14b8a6" },
  { value: "sauna", label: "Saunas", color: "#a855f7" },
  { value: "cruise_club", label: "Cruise Clubs", color: "#111111" },
  { value: "cruising_area", label: "Cruising Areas", color: "#f97316" },
  { value: "cafe", label: "Cafes", color: "#22c55e" },
  { value: "hotel", label: "Hotels", color: "#eab308" },
];

const TYPE_LABELS = {
  club: "Club",
  bar: "Bar",
  restaurant: "Restaurant",
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
  restaurant: {
    card: "border-teal-300/12 bg-[linear-gradient(180deg,rgba(8,64,58,0.34),rgba(15,15,15,0.96))]",
    selected: "border-teal-200/30 bg-[linear-gradient(180deg,rgba(20,184,166,0.18),rgba(15,15,15,0.98))] shadow-[0_18px_50px_rgba(20,184,166,0.12)]",
    label: "text-teal-200",
    line: "from-teal-300/75 via-cyan-300/45 to-transparent",
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
const LIVE_VIBE_COOLDOWN_MS = 30 * 1000;
const PRIVATE_EVENT_TYPES = [
  { value: "afterparty", label: "Afterparty" },
  { value: "chill", label: "Chill" },
  { value: "private_party", label: "Private party" },
];
const PRIVATE_EVENT_TYPE_LABELS = Object.fromEntries(
  PRIVATE_EVENT_TYPES.map((entry) => [entry.value, entry.label]),
);

function formatDateTime(value) {
  if (!value) return "Time TBA";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Time TBA";
  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPrivateEventStatus(event = {}, now = Date.now()) {
  const startTs = new Date(event.start_at || event.startAt || "").getTime();
  const endTs = new Date(event.end_at || event.endAt || event.expires_at || event.expiresAt || "").getTime();

  if (Number.isFinite(startTs) && startTs > now) {
    return { key: "upcoming", label: "Starting soon" };
  }
  if (Number.isFinite(endTs) && endTs <= now) {
    return { key: "ended", label: "Ended" };
  }
  return { key: "live", label: "Live now" };
}

function combineDateAndTime(dateValue = "", timeValue = "") {
  const datePart = String(dateValue || "").trim();
  const timePart = String(timeValue || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  if (!/^\d{2}:\d{2}$/.test(timePart)) return null;
  const parsed = new Date(`${datePart}T${timePart}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatEndsIn(value, now = Date.now()) {
  const expiresTs = new Date(value || "").getTime();
  if (!Number.isFinite(expiresTs)) return "";
  const diffMs = expiresTs - now;
  if (diffMs <= 0) return "Ended";
  const totalMinutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `Ends in ${minutes}m`;
  if (hours >= 24) return `Ends in ${hours}h`;
  return `Ends in ${hours}h ${minutes}m`;
}

function fallbackMemberAlias(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "Member";
  if (raw.includes("@")) return raw.split("@")[0] || "Member";
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 8)}...`;
}

function arePrivateEventsEquivalent(nextRows = [], prevRows = []) {
  const next = Array.isArray(nextRows) ? nextRows : [];
  const prev = Array.isArray(prevRows) ? prevRows : [];
  if (next.length !== prev.length) return false;

  for (let index = 0; index < next.length; index += 1) {
    const a = next[index] || {};
    const b = prev[index] || {};
    if (String(a.id || "") !== String(b.id || "")) return false;
    if (String(a.status || "") !== String(b.status || "")) return false;
    if (String(a.updated_at || "") !== String(b.updated_at || "")) return false;
    if (String(a.expires_at || "") !== String(b.expires_at || "")) return false;
  }
  return true;
}

function humanizeCitySlug(value = "") {
  return String(value)
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeCityKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[-\s]+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

function cityNameFromConfig(config, citySlug) {
  const titleName = String(config?.title || "").replace(/^Queer\s+/i, "").trim();
  return titleName || humanizeCitySlug(citySlug) || "this city";
}

function getEntityAddressLabel(entity) {
  const directAddress = String(entity?.location || entity?.address || "").trim();
  if (directAddress) return directAddress;

  const lat = Number(entity?.lat);
  const lng = Number(entity?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)} (map coordinates)`;
  }

  return "Address not available yet.";
}

const REPORT_REASONS = [
  { value: "safety", label: "Safety issue", helper: "Unsafe behavior, consent issues, harassment or risky conditions." },
  { value: "wrong_info", label: "Wrong info", helper: "Hours, location, link, category, or details are incorrect." },
  { value: "spam", label: "Spam or scam", helper: "Misleading promos, fake listings, or low-trust content." },
  { value: "abuse", label: "Abuse or hate", helper: "Hate speech, threats, discrimination, or abusive language." },
  { value: "other", label: "Other issue", helper: "Anything else that should be reviewed by admin." },
];
const TRUST_ACTIONS = [
  { value: "1", label: "Verified now" },
  { value: "2", label: "Needs refresh" },
  { value: "3", label: "Closed or moved" },
];

const CITY_HERO_COPY = {
  berlin: 'Hook: Raw and magnetic, Berlin rewards curiosity after dark. Queer status: Deeply alive and historically foundational, with strong visibility across scenes. Crowd: Club kids, leather, artists, trans community, and global nightlife pilgrims. "Not the loudest scene in Europe, but one of the deepest."',
  madrid: 'Hook: Warm, social, and addictive from terrace hour to sunrise. Queer status: Very visible and highly lived-in, especially in Chueca and nearby lanes. Crowd: Drag lovers, late-night flirts, stylish locals, and first-timers who quickly become regulars. "Come for one night, stay for the rhythm."',
  copenhagen: 'Hook: Clean design city with low-noise confidence. Queer status: Safe and progressive, with a smaller but reliable community pulse. Crowd: Creative locals, bike-city romantics, and quality-over-chaos travelers. "Soft volume, strong signal."',
  paris: 'Hook: Cinematic, sensual, and precise in its nightlife choices. Queer status: Le Marais remains highly active, with strong visibility and cultural depth. Crowd: Fashion minds, cocktail crowd, art-world drifters, and intentional daters. "Less noise, more seduction."',
  amsterdam: 'Hook: Canal-soft by day, playful and social by night. Queer status: Historically progressive and consistently welcoming across central zones. Crowd: Mixed global travelers, locals, party crews, and easy-entry social groups. "Freedom without friction."',
  london: 'Hook: Massive and layered, with a lane for every mood. Queer status: Highly active and diverse, from Soho heritage to East London edge. Crowd: Drag fans, kink scenes, queer creatives, finance gays, and everyone in between. "A thousand scenes in one city."',
  barcelona: 'Hook: Sun-soaked and flirt-first, built for movement. Queer status: Strong visibility around Eixample and beach-party circuits. Crowd: International summer crowd, locals with style, and party-forward travelers. "Heat, skin, and instant chemistry."',
  lisbon: 'Hook: Hilltop glow and soft-start nights that escalate late. Queer status: Increasingly visible and traveler-friendly with strong city energy. Crowd: Creative nomads, romantic weekenders, and terrace-to-club roamers. "Slow burn, high reward."',
  torremolinos: 'Hook: Full holiday mode with zero identity apology. Queer status: Very visible, especially near La Nogalera and beachfront routes. Crowd: Resort regulars, pride-week veterans, and beach-to-bar marathoners. "Sun by day, sparkle by night."',
  sitges: 'Hook: Compact queer fantasy by the sea. Queer status: Exceptionally visible in central nightlife and beach zones. Crowd: International regulars, couples, event-week crowds, and social bar-hoppers. "Tiny town, giant energy."',
  gran_canaria: 'Hook: Resort circuit built for freedom and stamina. Queer status: One of Europe\'s most visible queer holiday ecosystems. Crowd: Pool-party crews, resort loyalists, circuit travelers, and winter-escape regulars. "Where vacation becomes lifestyle."',
  cologne: 'Hook: Friendly, social, and built for community nights. Queer status: Strong and welcoming with major festival credibility. Crowd: Bears, club crews, karaoke lovers, and warm regulars. "Less attitude, more belonging."',
  brighton: 'Hook: Coastal queer capital with easy charm. Queer status: Highly visible and culturally embedded, especially in Kemptown. Crowd: Local creatives, drag crowd, queer couples, and London escapees. "Sea air, safe vibe, real community."',
  prague: 'Hook: Gothic beauty with an increasingly bold queer layer. Queer status: Smaller scene, but active and growing around key venues. Crowd: City-break travelers, nightlife seekers, and curation-first explorers. "Pick the right room and it clicks."',
  vienna: 'Hook: Elegant city breaks with curated nightlife moments. Queer status: Stable and welcoming, with selective but quality scene options. Crowd: Culture lovers, polished locals, and intimate social circles. "Grace first, chaos optional."',
  stockholm: 'Hook: Crisp, modern, and confidence-led. Queer status: Safe and progressive, with a focused event-driven nightlife scene. Crowd: Design-minded locals, music lovers, and weekend travelers. "Minimal drama, maximum ease."',
  manchester: 'Hook: Fast, loud, and emotionally direct. Queer status: Very active around Canal Street with strong legacy and nightlife depth. Crowd: Party groups, drag devotees, football gays, and friendly regulars. "No pretense, just pulse."',
  brussels: 'Hook: Compact European mix with multilingual energy. Queer status: Visible and social, with central scene lanes that stay active. Crowd: EU crowd, locals, art students, and crossover nightlife roamers. "Small map, big mix."',
  athens: 'Hook: Hot, textured, and gloriously imperfect. Queer status: Growing visibility with strong nightlife pull in key areas. Crowd: Local night owls, terrace lovers, queer creatives, and summer visitors. "Messy in the best way."',
  rome: 'Hook: Monumental backdrop, intimate queer flow. Queer status: Visible and active through selected venues and event nights. Crowd: Stylish locals, curious travelers, and late-start social groups. "History outside, desire inside."',
  milano: 'Hook: Sharp silhouettes and curated after-dark decisions. Queer status: Solid and modern, especially around Porta Venezia circuits. Crowd: Fashion crowd, design people, nightlife editors, and polished locals. "Dress good, move smart."',
  oslo: 'Hook: Calm city comfort with a quietly loyal scene. Queer status: Very safe and progressive with reliable venue anchors. Crowd: Community regulars, low-drama travelers, and quality-night seekers. "Small scene, clear heart."',
  dublin: 'Hook: Big social warmth packed into a compact city. Queer status: Welcoming and visible with strong drag and pub culture roots. Crowd: Friendly locals, students, weekenders, and singalong energy. "It starts as a pint, ends as a memory."',
  mykonos: 'Hook: Luxury sun, sunset drama, and nonstop temptation. Queer status: Extremely visible in high season with iconic gay travel pull. Crowd: Global circuit crowd, beach-club regulars, glam couples, and high-energy crews. "Come rested, leave legendary."',
  warsaw: 'Hook: Urban intensity with a rising queer confidence. Queer status: Growing and increasingly visible, especially in progressive circles. Crowd: Young locals, expats, party crews, and culture-forward travelers. "New energy, real momentum."',
  malta: 'Hook: Mediterranean escape with compact social routes. Queer status: Friendly and increasingly visible, with seasonal nightlife spikes. Crowd: Beach travelers, couples, weekend groups, and event-led visitors. "Small island, big release."',
  toronto: 'Hook: Big-city comfort with strong community backbone. Queer status: Highly visible and institutionally strong in the Village and beyond. Crowd: Drag fans, leather community, queer professionals, and global migrants. "Inclusive by design, wild by choice."',
  montreal: 'Hook: Bilingual nightlife with fearless performance culture. Queer status: Very alive in the Village with deep queer infrastructure. Crowd: Drag lovers, nightlife pros, terrace socialites, and art-school edge. "Camp, confidence, and late hours."',
  vancouver: 'Hook: Mountain-air calm meets Davie nightlife glow. Queer status: Welcoming and visible with a stable local community scene. Crowd: Outdoor queers, cocktail crowd, bears, and sunset terrace roamers. "Soft city, strong signal."',
  bangkok: 'Hook: Neon heat and nonstop movement. Queer status: Highly active with major nightlife density and broad LGBTQ visibility. Crowd: International party travelers, local regulars, drag fans, and late-night explorers. "You do not chase the night, you ride it."',
  phuket: 'Hook: Tropical party routes with beach-first freedom. Queer status: Visible and active around core nightlife strips and resorts. Crowd: Holiday groups, circuit visitors, couples, and bar-hopping travelers. "Saltwater by day, strobe light by night."',
  sydney: 'Hook: Harbour glamour with polished queer nightlife. Queer status: Strong and visible, especially around Oxford Street and seasonal events. Crowd: Locals with pace, beach-fit social circles, and global visitors. "Sunrise city, after-dark heart."',
  san_francisco: 'Hook: Legendary queer ground with modern tech-city edge. Queer status: Deeply rooted, highly visible, and culturally foundational. Crowd: Leather elders, startup gays, activists, artists, and neighborhood regulars. "History still dances here."',
  new_york: 'Hook: Maximum options, maximum identity range. Queer status: Intensely active across boroughs with global cultural influence. Crowd: Every subculture, every style, every schedule. "If it exists, it exists here."',
  buenos_aires: 'Hook: Seductive nights, deep emotions, and dance-floor tension. Queer status: Strong and socially alive with visible nightlife flow. Crowd: Local party culture, travelers, drag fans, and late-night romantics. "Drama, desire, and no early bedtime."',
  sao_paulo: 'Hook: Mega-city scale with serious queer horsepower. Queer status: Very active and globally relevant for parties and pride culture. Crowd: Circuit crowds, underground selectors, fashion energy, and local legends. "Big city, bigger appetite."',
  rio_de_janeiro: 'Hook: Beach confidence and nightlife sparkle under tropical heat. Queer status: Visible and lively, especially in key beach and party zones. Crowd: Beach crowd, party travelers, locals, and carnival-influenced nightlife lovers. "Body positive, sun powered."',
  mexico_city: 'Hook: Huge urban energy with layered queer neighborhoods. Queer status: Very alive and increasingly international across nightlife circuits. Crowd: Creative locals, expats, club kids, and culture-first travelers. "Chaos, culture, and connection."',
  puerto_vallarta: 'Hook: Seafront queer holiday machine with easy flow. Queer status: Exceptionally visible around Zona Romantica and beach strips. Crowd: Resort regulars, retirement glam, party groups, and weekend escapes. "Vacation mode, fully unlocked."',
  bogota: 'Hook: High-altitude city nights with sharp social energy. Queer status: Growing and active, with major nightlife anchors and community life. Crowd: Young locals, underground music lovers, and adventurous travelers. "Cool air, hot rooms."',
  medellin: 'Hook: Warm weather and nightlife that builds fast. Queer status: Increasingly visible with strong venue clusters and local momentum. Crowd: Stylish locals, digital nomads, party travelers, and terrace social circles. "Easy smile, late finish."',
  taipei: 'Hook: Tech-modern city with one of Asia\'s strongest queer signals. Queer status: Highly progressive and visible, especially around Ximen and pride culture. Crowd: Local regulars, queer youth, travelers, and nightlife explorers. "Safe, bright, and genuinely alive."',
  zurich: 'Hook: Precision city with surprisingly hot nightlife pockets. Queer status: Stable and welcoming with quality venues and clear social flow. Crowd: Finance polish, creative circles, and curated weekenders. "Clean lines, dirty little nights."',
  geneva: 'Hook: International calm with selective queer nightlife. Queer status: Smaller scene but reliable and socially welcoming. Crowd: Diplomat crowd, expats, local regulars, and elegant weekender energy. "Quiet city, quality signal."',
  tel_aviv: 'Hook: Beach city intensity with fearless queer expression. Queer status: Very visible and community-strong in nightlife and daytime life. Crowd: Locals, global travelers, party crews, and culture-mix social circles. "Heat, freedom, and zero half-measures."',
  los_angeles: 'Hook: Spread-out city, high-impact queer islands. Queer status: Strong and diverse across WeHo, Eastside, and event circuits. Crowd: Industry people, performers, fitness crowd, and after-hours regulars. "Choose your lane, own your night."',
  miami: 'Hook: Tropical glamour and nightlife built for excess. Queer status: Highly visible in key districts with strong event culture. Crowd: Beach bodies, nightlife tourists, local creators, and festival travelers. "Humidity, high heels, and high energy."',
  tokyo: 'Hook: Neon precision with deep nightlife density. Queer status: Strong and concentrated in key queer streets and bars. Crowd: Local regulars, international travelers, karaoke lovers, and style-forward night owls. "Tiny bars, massive personality."',
  palm_springs: 'Hook: Desert luxury and pool-party ease. Queer status: Extremely welcoming and deeply integrated into local culture. Crowd: Resort regulars, weekend groups, retirees, and festival crowds. "Sun, shade, and no judgment."',
  provincetown: 'Hook: Seaside queer pilgrimage with full summer magic. Queer status: Exceptionally visible and community-centered all season. Crowd: Bears, artists, drag lovers, couples, and returning regulars. "A small town where everyone can be loud."',
  cape_town: 'Hook: Epic landscapes with a growing queer city pulse. Queer status: Visible in key nightlife corridors and travel-friendly zones. Crowd: Local creatives, global travelers, beach lovers, and nightlife crews. "One city, five different moods."',
  seoul: 'Hook: High-speed city energy with rising queer nightlife. Queer status: Scene is concentrated but alive, with strong community pockets. Crowd: Local regulars, expats, students, and after-hours explorers. "Subtle by day, electric by night."',
  ibiza: 'Hook: Island hedonism where sunset becomes strategy. Queer status: Very visible in season with iconic party and beach circuits. Crowd: Global party travelers, DJs, style crowd, and holiday groups. "No casual nights here."',
  santiago: 'Hook: Urban Andes backdrop with increasingly bold queer flow. Queer status: Growing visibility and active nightlife in key neighborhoods. Crowd: Local creatives, social groups, and culture-forward travelers. "Rising city, rising signal."',
  lima: 'Hook: Coastal capital with a late-night social arc. Queer status: Active and growing, especially across curated nightlife lanes. Crowd: Local party circles, travelers, drag fans, and weekend explorers. "Understated start, strong finish."',
  quito: 'Hook: High-altitude city heat with late-night queer momentum. Queer status: Active and resilient, with visible nightlife lanes and a growing community pulse. Crowd: Local regulars, drag-night lovers, party travelers, and social bar hoppers. "Altitude by day, release by night."',
  bucharest: 'Hook: Grit, glamour, and late-night queer voltage in one city loop. Queer status: Compact but alive, with resilient community spaces and rising visibility. Crowd: Local regulars, alt-club lovers, drag-night travelers, and weekend social crews. "Smaller scene, sharper chemistry."',
  sofia: 'Hook: Balkan city edge with emerging queer confidence. Queer status: Smaller but resilient and increasingly visible community scene. Crowd: Local regulars, students, creatives, and intentional travelers. "Not huge, but absolutely real."',
  montevideo: 'Hook: Relaxed coastal capital with loyal nightlife pockets. Queer status: Visible and welcoming, especially around core social venues. Crowd: Local regulars, South American travelers, and low-drama bar hoppers. "Calm pace, strong connection."',
  hamburg: 'Hook: Port-city grit with polished nightlife options. Queer status: Active and welcoming, with strong bar and club routes. Crowd: Music lovers, locals, leather crowd, and weekend travelers. "Salt, steel, and after-dark glow."',
  munich: 'Hook: Classic city form with modern queer confidence. Queer status: Stable and visible, especially around event-led nightlife. Crowd: Locals, professionals, travelers, and social bar regulars. "Tradition outside, freedom inside."',
  frankfurt: 'Hook: Skyline speed and compact nightlife precision. Queer status: Solid and active with reliable scene anchors. Crowd: Finance crowd, locals, expats, and weekend city-break visitors. "Fast city, focused scene."',
  chicago: 'Hook: Big-room nightlife and neighborhood soul. Queer status: Strongly visible with deep history and active community lanes. Crowd: House music faithful, drag fans, leather scene, and social locals. "Windy city, heavy pull."',
  las_vegas: 'Hook: Spectacle-first nights and no-off-switch weekends. Queer status: Visible and event-heavy, especially around parties and festivals. Crowd: Weekend blowout crews, performers, travelers, and nightlife loyalists. "Go big or go home tired."',
  san_diego: 'Hook: Coastal chill with nightlife that still hits hard. Queer status: Welcoming and active, especially around Hillcrest circuits. Crowd: Beach crowd, military locals, students, and social weekenders. "Easy day, spicy night."',
  philadelphia: 'Hook: Historic city grit with loyal queer neighborhoods. Queer status: Strong and community-driven, especially in the Gayborhood. Crowd: Locals, artists, students, and nightlife regulars. "Real people, real scene."',
  new_orleans: 'Hook: Ritual nightlife city with queer flair built in. Queer status: Visible and culturally embedded in major social zones. Crowd: Drag lovers, party tourists, locals, and music-night wanderers. "Jazz, joy, and beautiful chaos."',
  orlando: 'Hook: Theme-park city by day, queer takeover by night. Queer status: Highly active during major event weekends and local circuit nights. Crowd: Festival travelers, local crews, and pool-party regulars. "Magic, but make it queer."',
  melbourne: 'Hook: Artsy city depth with smart nightlife curation. Queer status: Strong and progressive, with visible community and events. Crowd: Creatives, students, culture lovers, and late-bar roamers. "Coffee first, chaos later."',
  budapest: 'Hook: Grand city architecture with rising queer momentum. Queer status: Smaller but active scene with resilient community energy. Crowd: Travelers, local regulars, and event-night seekers. "Beautiful city, brave nights."',
  valencia: 'Hook: Mediterranean ease and warm nightlife flow. Queer status: Growing and increasingly visible with strong seasonal energy. Crowd: Beach lovers, local social circles, and weekend travelers. "Sunset city, social nights."',
  seville: 'Hook: Andalusian heat with intimate queer nightlife lanes. Queer status: Friendly and active in selected core zones. Crowd: Locals, visitors, dance lovers, and terrace-first groups. "Slow start, blazing finish."',
};

function buildCityHeroText({ config, citySlug }) {
  const key = String(citySlug || "").toLowerCase();
  const direct = CITY_HERO_COPY[key];
  if (direct) return direct;

  const cityName = cityNameFromConfig(config, citySlug);
  return `Hook: ${cityName} has strong queer momentum. Queer status: Visible and evolving with active community routes. Crowd: Mixed locals and travelers shaping the night together. "${cityName} rewards intention."`;
}

function parseCityHeroText(copy = "") {
  const text = String(copy || "");
  const extract = (label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`${escaped}:\\s*([\\s\\S]*?)(?=\\s*(Hook|Queer status|Crowd):|\\s*\"[^\"]+\"\\s*$|$)`, "i"));
    return match?.[1]?.trim() || "";
  };

  const taglineMatch = text.match(/"([^"]+)"\s*$/);

  return {
    hook: extract("Hook"),
    status: extract("Queer status"),
    crowd: extract("Crowd"),
    tagline: taglineMatch?.[1]?.trim() || "",
  };
}

function polishGuideText(text, { sectionTitle = "", cityName = "this city", vibe = "" } = {}) {
  const clean = String(text || "").trim();
  if (!clean) return "";
  if (clean.length >= 340) return clean;

  const key = String(sectionTitle).toLowerCase();
  const additions = {
    about: `${cityName} rewards travelers who mix curiosity with intention: start with one iconic lane, then follow community signal into the rooms locals actually return to.`,
    districts: `The best version of ${cityName} is usually route-based, not random: pick one anchor zone, then move out in layers as the energy builds.`,
    safety: `Treat pacing as part of safety, especially on big nights: charged phone, clear route, and one trusted fallback always make the night better.`,
    nightlife: `Use a two-phase flow for stronger nights: social warm-up first, then commit to one room with real pull instead of chasing every option.`,
    cost: `Spend for position and vibe, save on everything else. In ${cityName}, location and timing usually matter more than flashy upgrades.`,
  };

  const generic = `${cityName} has ${vibe || "strong"} queer momentum, and the best experiences usually come from layered choices instead of rushed checklists.`;
  const addition = additions[key] || generic;
  return `${clean} ${addition}`;
}

function polishVenueDescription(place, cityName = "this city") {
  const existing = String(place?.description || "").trim();
  if (existing.length >= 240) return existing;

  const typeLabel = TYPE_LABELS[place?.type] || "venue";
  const vibeText = place?.vibe ? `${place.vibe}` : `distinct ${typeLabel.toLowerCase()} energy`;

  if (!existing) {
    return `${place?.name || "This venue"} is a community-facing ${typeLabel.toLowerCase()} in ${cityName} with ${vibeText}. It works best as a strong stop in your night route, especially when you want social momentum with local signal instead of generic tourist flow.`;
  }

  return `${existing} In ${cityName}, this spot stands out for ${vibeText} and works best when you use it as a deliberate part of your route, not just a random pass-through.`;
}

function polishEventDescription(event, cityName = "this city") {
  const existing = String(event?.description || "").trim();
  if (existing.length >= 220) return existing;

  if (!existing) {
    return `${event?.name || "This event"} is part of ${cityName}'s live queer pulse and is best treated as a momentum anchor for your night: start social, arrive with intention, and let the crowd chemistry do the rest.`;
  }

  return `${existing} Expect a mixed crowd, strong community energy, and the kind of night that lands best when you arrive early enough to catch the room build.`;
}

function formatDate(value) {
  if (!value) return "Date TBA";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeIsoDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
}

function normalizeEventRange(event = {}) {
  const startDate = normalizeIsoDate(event.startDate || event.start_date || event.date);
  const endDateRaw = normalizeIsoDate(event.endDate || event.end_date || event.date);
  const endDate = endDateRaw && endDateRaw >= startDate ? endDateRaw : startDate;
  return {
    ...event,
    startDate,
    endDate: endDate || startDate,
    date: startDate,
  };
}

function formatEventDateLabel(event = {}) {
  const normalized = normalizeEventRange(event);
  if (!normalized.startDate) return "Date TBA";
  if (!normalized.endDate || normalized.endDate === normalized.startDate) {
    return formatDate(normalized.startDate);
  }

  const start = new Date(normalized.startDate);
  const end = new Date(normalized.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return formatDate(normalized.startDate);
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString("en-GB", { month: "short" })} ${start.getFullYear()}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}-${end.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${start.getFullYear()}`;
  }

  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}-${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

function normalizeExternalUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isEventVisibleOnCityPage(event) {
  const normalized = normalizeEventRange(event || {});
  if (!normalized.startDate) return false;

  const parsedEnd = new Date(normalized.endDate || normalized.startDate);
  if (Number.isNaN(parsedEnd.getTime())) return true;
  const endOfDay = new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 23, 59, 59, 999);
  return endOfDay.getTime() >= Date.now();
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

function buildPlaceAdminDraft(place) {
  return {
    name: String(place?.name || ""),
    type: String(place?.type || "bar"),
    description: String(place?.description || ""),
    vibe: String(place?.vibe || ""),
    location: String(place?.location || ""),
    hours: String(place?.hours || ""),
    link: String(place?.link || ""),
  };
}

function buildEventAdminDraft(event) {
  const normalized = normalizeEventRange(event || {});
  return {
    name: String(event?.name || ""),
    startDate: String(normalized.startDate || ""),
    endDate: String(normalized.endDate || ""),
    location: String(event?.location || ""),
    vibe: String(event?.vibe || ""),
    description: String(event?.description || ""),
    link: String(event?.link || ""),
  };
}

function SectionSkeleton({ tone = "violet", rows = 3 }) {
  const toneMap = {
    violet: {
      outer: "border-violet-200/14 bg-[linear-gradient(180deg,rgba(109,40,217,0.14),rgba(10,10,10,0.86))]",
      glow: "bg-violet-300/12",
    },
    amber: {
      outer: "border-amber-200/14 bg-[linear-gradient(180deg,rgba(217,119,6,0.12),rgba(10,10,10,0.86))]",
      glow: "bg-amber-300/12",
    },
  };

  const selectedTone = toneMap[tone] || toneMap.violet;

  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`skeleton-${tone}-${index}`}
          className={`relative overflow-hidden rounded-[24px] border p-4 ${selectedTone.outer} animate-pulse`}
        >
          <div className={`pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-3xl ${selectedTone.glow}`} />
          <div className="h-4 w-44 rounded-full bg-white/14" />
          <div className="mt-3 h-3 w-28 rounded-full bg-white/10" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-white/8" />
            <div className="h-3 w-5/6 rounded-full bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CityPage() {
  const { city } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = cityConfig[city] || cityConfig.berlin;
  const cityName = cityNameFromConfig(config, city);
  const cityHeroText = buildCityHeroText({ config, citySlug: city });
  const cityHero = parseCityHeroText(cityHeroText);
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
  const [privateEvents, setPrivateEvents] = useState([]);
  const [privateEventsLoading, setPrivateEventsLoading] = useState(true);
  const [privateEventsError, setPrivateEventsError] = useState("");
  const [privateEventsTableMissing, setPrivateEventsTableMissing] = useState(false);
  const [privateEventInvites, setPrivateEventInvites] = useState({});
  const [privateInviteRequestsByEvent, setPrivateInviteRequestsByEvent] = useState({});
  const [privateInviteRequesterProfiles, setPrivateInviteRequesterProfiles] = useState({});
  const [expandedPrivateHostEventId, setExpandedPrivateHostEventId] = useState("");
  const [privateInvitesTableMissing, setPrivateInvitesTableMissing] = useState(false);
  const [isSubmittingPrivateInvite, setIsSubmittingPrivateInvite] = useState(false);
  const [isUpdatingPrivateInviteStatus, setIsUpdatingPrivateInviteStatus] = useState(false);
  const [deletingPrivateEventId, setDeletingPrivateEventId] = useState("");
  const [privateFeedNowTick, setPrivateFeedNowTick] = useState(Date.now());
  const [tonightFeedTab, setTonightFeedTab] = useState("public");
  const [hostPrivateEventOpen, setHostPrivateEventOpen] = useState(false);
  const [isSubmittingPrivateEvent, setIsSubmittingPrivateEvent] = useState(false);
  const [privateEventForm, setPrivateEventForm] = useState({
    title: "",
    eventType: PRIVATE_EVENT_TYPES[0].value,
    startDate: "",
    startTime: "",
    approxArea: "",
    exactLocation: "",
    notes: "",
  });
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [addEventMode, setAddEventMode] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("club");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [vibe, setVibe] = useState("");
  const [placeHours, setPlaceHours] = useState("");
  const [placeLink, setPlaceLink] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventVibe, setEventVibe] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast, showToast } = useActionToast();
  const [selectedPlaceDbId, setSelectedPlaceDbId] = useState("");
  const [liveVibeRows, setLiveVibeRows] = useState([]);
  const [isLoadingLiveVibe, setIsLoadingLiveVibe] = useState(false);
  const [liveVibeError, setLiveVibeError] = useState("");
  const [isSubmittingLiveVibe, setIsSubmittingLiveVibe] = useState(false);
  const [liveVibeTableMissing, setLiveVibeTableMissing] = useState(false);
  const [liveVibeRefreshTick, setLiveVibeRefreshTick] = useState(0);
  const [showLiveVibeMomentum, setShowLiveVibeMomentum] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsLoadError, setEventsLoadError] = useState("");
  const [mapError, setMapError] = useState("");
  const [, setQualityTick] = useState(0);
  const [blockedItems, setBlockedItems] = useState(() => getBlockedItems());
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const { isMember, user, memberName } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [placeAdminOpen, setPlaceAdminOpen] = useState(false);
  const [eventAdminOpen, setEventAdminOpen] = useState(false);
  const [placeAdminDraft, setPlaceAdminDraft] = useState(() => buildPlaceAdminDraft(null));
  const [eventAdminDraft, setEventAdminDraft] = useState(() => buildEventAdminDraft(null));
  const [isSavingPlaceAdmin, setIsSavingPlaceAdmin] = useState(false);
  const [isSavingEventAdmin, setIsSavingEventAdmin] = useState(false);
  const [isSavingPlaceAddressOnly, setIsSavingPlaceAddressOnly] = useState(false);
  const [isSavingEventAddressOnly, setIsSavingEventAddressOnly] = useState(false);
  const [isDeletingPlaceAdmin, setIsDeletingPlaceAdmin] = useState(false);
  const [isDeletingEventAdmin, setIsDeletingEventAdmin] = useState(false);
  const [trustedPlaceSavesCount, setTrustedPlaceSavesCount] = useState(0);
  const [trustedEventSavesCount, setTrustedEventSavesCount] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDraft, setReportDraft] = useState({
    targetType: "place",
    targetId: "",
    title: "",
    reasonKey: REPORT_REASONS[0].value,
    details: "",
  });
  const [qualityModal, setQualityModal] = useState({
    open: false,
    targetType: "place",
    targetId: "",
    action: "1",
    sourceInput: "",
    fallbackSource: "",
  });

  const mapContainerRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const mainScrollRef = useRef(null);
  const eventsSectionRef = useRef(null);
  const tonightSectionRef = useRef(null);
  const guideSectionRef = useRef(null);
  const placesSectionRef = useRef(null);
  const addEventFormRef = useRef(null);
  const mapRef = useRef(null);
  const hoverPopupRef = useRef(null);
  const markersRef = useRef([]);
  const placeMarkersRef = useRef(new Map());
  const eventMarkersRef = useRef(new Map());
  const isMapInteractingRef = useRef(false);
  const keepMapViewOnNextCloseRef = useRef(false);
  const autoCheckinCooldownRef = useRef(new Map());

  const openEventContribution = useCallback(() => {
    setAddEventMode(true);
    setAddMode(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        addEventFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }, []);

  const scrollToSection = useCallback((ref) => {
    ref?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleDesktopPanelWheel = useCallback((event) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;

    event.preventDefault();
    const scrollContainer = mainScrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTop += event.deltaY;
    }
    window.scrollBy({ top: event.deltaY, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    isMapInteractingRef.current = isMapInteracting;
  }, [isMapInteracting]);

  useEffect(() => {
    let active = true;

    queueMicrotask(async () => {
      if (!isMember || !user?.email) {
        if (active) setIsAdmin(false);
        return;
      }

      let adminState = false;
      try {
        const rpcRes = await supabase.rpc("qa_is_admin");
        if (!rpcRes.error) {
          adminState = Boolean(rpcRes.data);
        } else {
          const { data, error } = await supabase
            .from("qa_admin_users")
            .select("email")
            .ilike("email", String(user.email).trim().toLowerCase())
            .limit(1);

          adminState = !error && (data || []).length > 0;
        }
      } catch {
        adminState = false;
      }

      if (active) {
        setIsAdmin(adminState);
      }
    });

    return () => {
      active = false;
    };
  }, [isMember, user?.email]);

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

  const cityPlaces = useMemo(
    () => {
      const normalizedCity = normalizeCityKey(city);
      return places.filter((place) => (
        normalizeCityKey(place.city) === normalizedCity
        && !blockedItems.some(
          (item) =>
            item.targetType === "place" &&
            String(item.targetId) === String(place.id)
        )
      ));
    },
    [blockedItems, city, places]
  );

  const cityEvents = useMemo(
    () => {
      const normalizedCity = normalizeCityKey(city);
      return eventsData.filter((event) => (
        normalizeCityKey(event.city) === normalizedCity
        && isEventVisibleOnCityPage(event)
        && !blockedItems.some(
          (item) =>
            item.targetType === "event" &&
            String(item.targetId) === String(event.id)
        )
      ));
    },
    [blockedItems, city, eventsData]
  );

  const cityPrivateEvents = useMemo(() => {
    const normalizedCity = normalizeCityKey(city);
    const currentUserId = String(user?.id || "");
    return privateEvents
      .filter((event) => normalizeCityKey(event.city) === normalizedCity)
      .filter((event) => {
        const isHost = String(event.host_user_id || "") === currentUserId;
        if (isHost) return true;
        if (String(event.status || "active") !== "active") return false;
        const expiresAt = new Date(event.expires_at || "").getTime();
        return !Number.isFinite(expiresAt) || expiresAt > Date.now();
      })
      .sort((a, b) => {
        const statusA = getPrivateEventStatus(a).key;
        const statusB = getPrivateEventStatus(b).key;
        const rank = { live: 0, upcoming: 1, ended: 2 };
        if (rank[statusA] !== rank[statusB]) return rank[statusA] - rank[statusB];
        return new Date(a.start_at || 0).getTime() - new Date(b.start_at || 0).getTime();
      });
  }, [city, privateEvents, liveVibeRefreshTick, user?.id]);

  const qualityMap = getQualityMap();

  const selectedPlace = useMemo(() => {
    if (!placeId) return null;
    return cityPlaces.find((place) => String(place.id) === String(placeId)) || null;
  }, [cityPlaces, placeId]);

  const selectedEvent = useMemo(() => {
    if (!eventId) return null;
    return cityEvents.find((event) => String(event.id) === String(eventId)) || null;
  }, [cityEvents, eventId]);

  useEffect(() => {
    if (!selectedPlace) {
      setPlaceAdminOpen(false);
      setPlaceAdminDraft(buildPlaceAdminDraft(null));
      return;
    }
    setPlaceAdminOpen(false);
    setPlaceAdminDraft(buildPlaceAdminDraft(selectedPlace));
  }, [selectedPlace]);

  useEffect(() => {
    if (!selectedEvent) {
      setEventAdminOpen(false);
      setEventAdminDraft(buildEventAdminDraft(null));
      return;
    }
    setEventAdminOpen(false);
    setEventAdminDraft(buildEventAdminDraft(selectedEvent));
  }, [selectedEvent]);

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      if (!isMember || !user?.id || !selectedPlace?.id) {
        if (active) setTrustedPlaceSavesCount(0);
        return;
      }
      const { data, error } = await supabase.rpc("qa_following_favorite_count", {
        target_favorite_id: String(selectedPlace.id),
      });
      if (!active) return;
      if (error) {
        setTrustedPlaceSavesCount(0);
        return;
      }
      setTrustedPlaceSavesCount(Number(data || 0));
    });
    return () => {
      active = false;
    };
  }, [isMember, selectedPlace?.id, user?.id]);

  useEffect(() => {
    let active = true;
    queueMicrotask(async () => {
      if (!isMember || !user?.id || !selectedEvent?.id) {
        if (active) setTrustedEventSavesCount(0);
        return;
      }
      const { data, error } = await supabase.rpc("qa_following_favorite_count", {
        target_favorite_id: `event-${String(selectedEvent.id)}`,
      });
      if (!active) return;
      if (error) {
        setTrustedEventSavesCount(0);
        return;
      }
      setTrustedEventSavesCount(Number(data || 0));
    });
    return () => {
      active = false;
    };
  }, [isMember, selectedEvent?.id, user?.id]);

  const canReviewSelectedPlace = Boolean(selectedPlace);
  const liveVibeSummary = useMemo(() => summarizeLiveVibeSignals(liveVibeRows), [liveVibeRows]);
  const liveVibeHeadline = useMemo(() => buildLiveVibeHeadline(liveVibeSummary), [liveVibeSummary]);
  const liveVibeUpdatedLabel = useMemo(
    () => formatLiveVibeUpdatedAt(liveVibeSummary.latestTimestamp),
    [liveVibeSummary.latestTimestamp]
  );
  const liveVibePulse = useMemo(() => getLiveVibePulse(liveVibeSummary), [liveVibeSummary]);
  const liveVibeConsensus = useMemo(() => getLiveVibeConsensus(liveVibeSummary), [liveVibeSummary]);
  const liveVibeMemberMomentum = useMemo(
    () => getLiveVibeMemberMomentum(liveVibeRows, user?.id),
    [liveVibeRows, user?.id]
  );
  const liveVibeMyLastTapMs = useMemo(() => {
    if (!user?.id) return null;
    let latest = null;
    for (const row of Array.isArray(liveVibeRows) ? liveVibeRows : []) {
      if (String(row?.user_id || "") !== String(user.id)) continue;
      const ms = new Date(row?.created_at || "").getTime();
      if (!Number.isFinite(ms)) continue;
      if (!latest || ms > latest) latest = ms;
    }
    return latest;
  }, [liveVibeRows, user?.id]);
  const liveVibeCooldownRemainingSec = useMemo(() => {
    if (!liveVibeMyLastTapMs) return 0;
    const remaining = LIVE_VIBE_COOLDOWN_MS - (Date.now() - liveVibeMyLastTapMs);
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / 1000);
  }, [liveVibeMyLastTapMs, liveVibeRefreshTick]);
  const liveVibeStreakNudge = useMemo(() => {
    if (!isMember) return "";
    if (liveVibeMemberMomentum.todayTapped) return "Nice. You already locked your streak today.";

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const hoursLeft = Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (60 * 60 * 1000)));
    return `No tap today yet. One quick signal in the next ${hoursLeft}h keeps your streak alive.`;
  }, [isMember, liveVibeMemberMomentum.todayTapped]);

  useEffect(() => {
    setShowLiveVibeMomentum(false);
  }, [selectedPlace?.id]);

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
  const visiblePlaceGroups = useMemo(
    () => groupedPlaces.filter((group) => group.items.length > 0),
    [groupedPlaces]
  );

  const sortedEvents = useMemo(
    () => [...cityEvents]
      .filter((event) => normalizeEventRange(event).startDate)
      .sort((a, b) => String(normalizeEventRange(a).startDate).localeCompare(String(normalizeEventRange(b).startDate))),
    [cityEvents]
  );

  const featuredEvent = useMemo(() => {
    if (sortedEvents.length === 0) return null;
    const now = new Date();
    const nowIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const upcoming = sortedEvents.find((event) => normalizeEventRange(event).endDate >= nowIso);
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
  const placesChipLabel = placesLoading
    ? "Places syncing"
    : cityPlaceCount > 0
      ? `${cityPlaceCount} places`
      : "Places incoming";
  const eventsChipLabel = eventsLoading
    ? "Events syncing"
    : cityEventCount > 0
      ? `${cityEventCount} events`
      : "Events incoming";
  const privateEventStartPreview = useMemo(
    () => combineDateAndTime(privateEventForm.startDate, privateEventForm.startTime),
    [privateEventForm.startDate, privateEventForm.startTime],
  );
  const privateEventExpiresPreview = useMemo(() => {
    if (!privateEventStartPreview) return null;
    return new Date(privateEventStartPreview.getTime() + (24 * 60 * 60 * 1000));
  }, [privateEventStartPreview]);

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

  const autoCheckinFromPlaceTap = useCallback(async (place) => {
    if (!isMember || !user?.id || !place) return;

    const tapKey = String(place.id || "");
    const nowMs = Date.now();
    const lastTapMs = Number(autoCheckinCooldownRef.current.get(tapKey) || 0);
    if (nowMs - lastTapMs < 90 * 1000) return;
    autoCheckinCooldownRef.current.set(tapKey, nowMs);

    const resolvePlaceDbIdInline = async (targetPlace) => {
      const placeId = String(targetPlace?.id || "");
      const placeName = String(targetPlace?.name || "").trim();
      const placeCity = String(targetPlace?.city || city).trim();
      const normalizeCity = (value) =>
        String(value || "")
          .toLowerCase()
          .replaceAll("_", " ")
          .replaceAll("-", " ")
          .replace(/\s+/g, " ")
          .trim();

      if (placeId && !placeId.startsWith("seed-place-")) {
        return placeId;
      }
      if (!placeName || !placeCity) return null;

      const lookup = await supabase
        .from("places")
        .select("id, city, name")
        .ilike("name", placeName)
        .limit(20);
      const rows = Array.isArray(lookup?.data) ? lookup.data : [];
      const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(placeCity));
      return matched?.id ? String(matched.id) : null;
    };

    const dbPlaceId = await resolvePlaceDbIdInline(place);
    if (!dbPlaceId) return;

    const { error } = await supabase
      .from("qa_member_checkins")
      .insert([
        {
          user_id: user.id,
          mode: "trip",
          privacy: "friends",
          country: null,
          city: String(place.city || city),
          label: String(place.name || "Venue"),
          address: String(place.location || "").trim() || null,
          note: null,
          place_id: String(dbPlaceId),
          event_id: null,
          lat: Number.isFinite(Number(place.lat)) ? Number(place.lat) : null,
          lng: Number.isFinite(Number(place.lng)) ? Number(place.lng) : null,
          checked_in_at: new Date().toISOString(),
        },
      ]);

    if (error && isMissingTableError(error)) {
      showToast("Check-ins table missing. Run latest check-in SQL.", {
        tone: "warn",
        duration: 2600,
      });
      return;
    }
    if (!error) {
      trackKpiEvent("checkin_saved", {
        city: String(place.city || city),
        targetType: "checkin",
        targetId: String(place.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
    }
  }, [city, isMember, memberName, showToast, user?.email, user?.id]);

  const openPlace = useCallback((place) => {
    router.push(buildSelectionUrl({ nextPlaceId: place.id, nextEventId: null }));
    void autoCheckinFromPlaceTap(place);
  }, [autoCheckinFromPlaceTap, buildSelectionUrl, router]);

  const openEvent = (event) => {
    router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: event.id }));
  };

  const closePlace = useCallback(() => {
    router.push(buildSelectionUrl({ nextPlaceId: null }));
  }, [buildSelectionUrl, router]);

  const closeEvent = useCallback(() => {
    router.push(buildSelectionUrl({ nextEventId: null }));
  }, [buildSelectionUrl, router]);

  const showEventOnMap = () => {
    if (!selectedEvent || !mapRef.current || selectedEvent.lat == null || selectedEvent.lng == null) return;

    mapRef.current.flyTo({
      center: [selectedEvent.lng, selectedEvent.lat],
      zoom: 14,
    });

    const isMobileViewport =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 1024px)").matches;

    if (isMobileViewport) {
      keepMapViewOnNextCloseRef.current = true;
      closeEvent();
      requestAnimationFrame(() => {
        mapWrapperRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }

    mapWrapperRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsLoadError("");
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        setEventsLoadError("Could not load city events right now.");
        setEventsData((await mergeSeedEventsAsync([])).map((event) => normalizeEventRange(event)));
        return;
      }

      setEventsData((await mergeSeedEventsAsync(data || [])).map((event) => normalizeEventRange(event)));
    } catch {
      setEventsLoadError("Could not reach event service right now.");
      setEventsData((await mergeSeedEventsAsync([])).map((event) => normalizeEventRange(event)));
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchPrivateEvents = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setPrivateEventsLoading(true);
    }
    setPrivateEventsError("");
    try {
      const { data, error } = await supabase
        .from("qa_private_events")
        .select("*")
        .eq("city", String(city || "").trim())
        .order("start_at", { ascending: true });

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateEventsTableMissing(true);
          setPrivateEvents([]);
          setPrivateEventsError("");
        } else {
          setPrivateEventsError("Could not load VIP invites right now.");
          setPrivateEvents([]);
        }
        return;
      }

      setPrivateEventsTableMissing(false);
      const normalized = Array.isArray(data) ? data : [];
      setPrivateEvents((current) => (
        arePrivateEventsEquivalent(normalized, current) ? current : normalized
      ));
    } catch {
      setPrivateEventsError("Could not load VIP invites right now.");
      setPrivateEvents((current) => (current.length === 0 ? current : []));
    } finally {
      if (!silent) {
        setPrivateEventsLoading(false);
      }
    }
  }, [city]);

  const fetchMyPrivateInvites = useCallback(async (eventRows = []) => {
    if (!isMember || !user?.id) {
      setPrivateEventInvites({});
      return;
    }

    const eventIds = (Array.isArray(eventRows) ? eventRows : [])
      .map((row) => String(row?.id || "").trim())
      .filter(Boolean);

    if (eventIds.length === 0) {
      setPrivateEventInvites({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from("qa_private_event_invites")
        .select("event_id,status")
        .eq("requester_user_id", user.id)
        .in("event_id", eventIds);

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
        }
        setPrivateEventInvites({});
        return;
      }

      setPrivateInvitesTableMissing(false);
      const nextMap = {};
      for (const row of Array.isArray(data) ? data : []) {
        const key = String(row?.event_id || "").trim();
        if (!key) continue;
        nextMap[key] = String(row?.status || "requested");
      }
      setPrivateEventInvites(nextMap);
    } catch {
      setPrivateEventInvites({});
    }
  }, [isMember, user?.id]);

  const fetchPrivateInviteRequests = useCallback(async (eventRows = []) => {
    if (!isMember || !user?.id) {
      setPrivateInviteRequestsByEvent({});
      setPrivateInviteRequesterProfiles({});
      return;
    }

    const hostEventIds = (Array.isArray(eventRows) ? eventRows : [])
      .filter((row) => String(row?.host_user_id || "") === String(user.id))
      .map((row) => String(row?.id || "").trim())
      .filter(Boolean);

    if (hostEventIds.length === 0) {
      setPrivateInviteRequestsByEvent({});
      setPrivateInviteRequesterProfiles({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from("qa_private_event_invites")
        .select("id,event_id,requester_user_id,status,message,created_at")
        .in("event_id", hostEventIds)
        .order("created_at", { ascending: false });

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
        }
        setPrivateInviteRequestsByEvent({});
        setPrivateInviteRequesterProfiles({});
        return;
      }

      const nextMap = {};
      for (const row of Array.isArray(data) ? data : []) {
        const eventId = String(row?.event_id || "").trim();
        if (!eventId) continue;
        if (!nextMap[eventId]) nextMap[eventId] = [];
        nextMap[eventId].push(row);
      }
      setPrivateInviteRequestsByEvent(nextMap);

      const requesterIds = [...new Set(
        (Array.isArray(data) ? data : [])
          .map((row) => String(row?.requester_user_id || "").trim())
          .filter(Boolean),
      )];

      if (requesterIds.length === 0) {
        setPrivateInviteRequesterProfiles({});
        return;
      }

      const { data: profileRows, error: profileError } = await supabase
        .from("member_profiles")
        .select("user_id,display_name")
        .in("user_id", requesterIds);

      if (profileError) {
        setPrivateInviteRequesterProfiles({});
        return;
      }

      const profileMap = {};
      for (const row of Array.isArray(profileRows) ? profileRows : []) {
        const key = String(row?.user_id || "").trim();
        if (!key) continue;
        profileMap[key] = String(row?.display_name || "").trim();
      }
      setPrivateInviteRequesterProfiles(profileMap);
    } catch {
      setPrivateInviteRequestsByEvent({});
      setPrivateInviteRequesterProfiles({});
    }
  }, [isMember, user?.id]);

  const submitPrivateEvent = useCallback(async (submitEvent) => {
    submitEvent.preventDefault();
    if (!isMember || !user?.id) {
      writeLocalValue("qa_redirect", pathname);
      router.push("/?join=true");
      return;
    }
    if (privateEventsTableMissing) {
      showToast("Run VIP invites SQL first.", { tone: "warn", duration: 2400 });
      return;
    }

    const title = String(privateEventForm.title || "").trim();
    const approxArea = String(privateEventForm.approxArea || "").trim();
    const exactLocation = String(privateEventForm.exactLocation || "").trim();
    const startDateRaw = String(privateEventForm.startDate || "").trim();
    const startTimeRaw = String(privateEventForm.startTime || "").trim();

    if (!title || !approxArea || !startDateRaw || !startTimeRaw) {
      showToast("Title, start time, and area are required.", { tone: "warn", duration: 2200 });
      return;
    }

    const startAt = combineDateAndTime(startDateRaw, startTimeRaw);
    if (!startAt) {
      showToast("Start time is invalid.", { tone: "warn", duration: 2200 });
      return;
    }

    const expiresAt = new Date(startAt.getTime() + (24 * 60 * 60 * 1000));
    setIsSubmittingPrivateEvent(true);
    try {
      const payload = {
        city: String(city || "").trim(),
        host_user_id: user.id,
        host_alias: String(memberName || user.email || "Member").trim().slice(0, 80),
        title,
        event_type: String(privateEventForm.eventType || PRIVATE_EVENT_TYPES[0].value),
        visibility: "invite_only",
        approx_area: approxArea,
        exact_location: exactLocation || null,
        notes: String(privateEventForm.notes || "").trim() || null,
        start_at: startAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: "active",
      };

      const { error } = await supabase.from("qa_private_events").insert([payload]);
      if (error) {
        if (isMissingTableError(error)) {
          setPrivateEventsTableMissing(true);
          showToast("VIP invites table missing. Run SQL setup first.", {
            tone: "warn",
            duration: 2500,
          });
          return;
        }
        throw error;
      }

      setPrivateEventForm({
        title: "",
        eventType: PRIVATE_EVENT_TYPES[0].value,
        startDate: "",
        startTime: "",
        approxArea: "",
        exactLocation: "",
        notes: "",
      });
      setHostPrivateEventOpen(false);
      await fetchPrivateEvents();
      showToast("Private event posted.", { tone: "ok", duration: 1800 });
    } catch {
      showToast("Could not post private event right now.", { tone: "warn", duration: 2200 });
    } finally {
      setIsSubmittingPrivateEvent(false);
    }
  }, [
    city,
    fetchPrivateEvents,
    isMember,
    memberName,
    pathname,
    privateEventForm.approxArea,
    privateEventForm.exactLocation,
    privateEventForm.eventType,
    privateEventForm.notes,
    privateEventForm.startDate,
    privateEventForm.startTime,
    privateEventForm.title,
    privateEventsTableMissing,
    router,
    showToast,
    user?.email,
    user?.id,
  ]);

  const respondPrivateInviteRequest = useCallback(async (inviteRow, nextStatus) => {
    const inviteId = String(inviteRow?.id || "").trim();
    const status = String(nextStatus || "").trim();
    const allowed = new Set(["accepted", "declined"]);
    if (!inviteId || !allowed.has(status)) return;

    setIsUpdatingPrivateInviteStatus(true);
    try {
      const { error } = await supabase
        .from("qa_private_event_invites")
        .update({ status })
        .eq("id", inviteId);

      if (error) {
        if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
          showToast("Invites are not activated yet.", { tone: "warn", duration: 2200 });
          return;
        }
        throw error;
      }

      await Promise.all([
        fetchPrivateInviteRequests(cityPrivateEvents),
        fetchMyPrivateInvites(cityPrivateEvents),
      ]);
      showToast(status === "accepted" ? "Invite accepted." : "Invite declined.", {
        tone: "ok",
        duration: 1800,
      });
    } catch {
      showToast("Could not update invite right now.", { tone: "warn", duration: 2200 });
    } finally {
      setIsUpdatingPrivateInviteStatus(false);
    }
  }, [cityPrivateEvents, fetchMyPrivateInvites, fetchPrivateInviteRequests, showToast]);

  const deletePrivateEvent = useCallback(async (eventRow) => {
    const eventId = String(eventRow?.id || "").trim();
    if (!eventId || !user?.id) return;
    if (String(eventRow?.host_user_id || "") !== String(user.id)) return;

    const confirmed = typeof window === "undefined"
      ? true
      : window.confirm("Delete this VIP event? This also removes all invite requests for it.");
    if (!confirmed) return;

    setDeletingPrivateEventId(eventId);
    try {
      const { error: invitesError } = await supabase
        .from("qa_private_event_invites")
        .delete()
        .eq("event_id", eventId);

      if (invitesError && !isMissingTableError(invitesError)) {
        throw invitesError;
      }

      const { data: deletedEvents, error: eventDeleteError } = await supabase
        .from("qa_private_events")
        .delete()
        .eq("id", eventId)
        .eq("host_user_id", user.id)
        .select("id");

      if (eventDeleteError) throw eventDeleteError;
      if (!Array.isArray(deletedEvents) || deletedEvents.length === 0) {
        showToast("Delete failed. You can only delete events you host from this account.", {
          tone: "warn",
          duration: 2600,
        });
        return;
      }

      setPrivateEvents((current) => current.filter((row) => String(row?.id || "") !== eventId));
      setPrivateEventInvites((current) => {
        if (!current || typeof current !== "object") return {};
        const next = { ...current };
        delete next[eventId];
        return next;
      });
      setPrivateInviteRequestsByEvent((current) => {
        if (!current || typeof current !== "object") return {};
        const next = { ...current };
        delete next[eventId];
        return next;
      });

      if (String(expandedPrivateHostEventId) === eventId) {
        setExpandedPrivateHostEventId("");
      }

      await Promise.all([
        fetchPrivateEvents({ silent: true }),
        fetchMyPrivateInvites(cityPrivateEvents),
        fetchPrivateInviteRequests(cityPrivateEvents),
      ]);

      showToast("VIP event deleted.", { tone: "ok", duration: 1800 });
    } catch {
      showToast("Could not delete VIP event right now.", { tone: "warn", duration: 2200 });
    } finally {
      setDeletingPrivateEventId("");
    }
  }, [
    cityPrivateEvents,
    expandedPrivateHostEventId,
    fetchMyPrivateInvites,
    fetchPrivateEvents,
    fetchPrivateInviteRequests,
    showToast,
    user?.id,
  ]);

  const requestPrivateInvite = useCallback(async (eventRow) => {
    if (!isMember || !user?.id) {
      writeLocalValue("qa_redirect", pathname);
      router.push("/?join=true");
      return;
    }
    if (!eventRow?.id || privateInvitesTableMissing) {
      showToast("Invites are not activated yet.", { tone: "warn", duration: 2200 });
      return;
    }
    if (String(eventRow.host_user_id || "") === String(user.id)) {
      showToast("You are hosting this event.", { tone: "info", duration: 1800 });
      return;
    }

    setIsSubmittingPrivateInvite(true);
    try {
      const { error } = await supabase.from("qa_private_event_invites").insert([
        {
          event_id: eventRow.id,
          requester_user_id: user.id,
          status: "requested",
        },
      ]);

      if (error) {
        if (String(error.code || "") === "23505") {
          showToast("Invite already requested.", { tone: "info", duration: 1800 });
        } else if (isMissingTableError(error)) {
          setPrivateInvitesTableMissing(true);
          showToast("Invites are not activated yet.", { tone: "warn", duration: 2200 });
        } else {
          throw error;
        }
      } else {
        showToast("Invite request sent.", { tone: "ok", duration: 1800 });
      }

      await fetchMyPrivateInvites(cityPrivateEvents);
    } catch {
      showToast("Could not send invite request.", { tone: "warn", duration: 2200 });
    } finally {
      setIsSubmittingPrivateInvite(false);
    }
  }, [
    cityPrivateEvents,
    fetchMyPrivateInvites,
    isMember,
    pathname,
    privateInvitesTableMissing,
    router,
    showToast,
    user?.id,
  ]);

  const geocodeAddress = useCallback(async (value) => {
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
  }, [city]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchEvents();
    });
  }, [fetchEvents]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPrivateEvents();
    });
  }, [fetchPrivateEvents]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchMyPrivateInvites(cityPrivateEvents);
    });
  }, [cityPrivateEvents, fetchMyPrivateInvites, liveVibeRefreshTick]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPrivateInviteRequests(cityPrivateEvents);
    });
  }, [cityPrivateEvents, fetchPrivateInviteRequests, liveVibeRefreshTick]);

  useEffect(() => {
    const id = setInterval(() => {
      setPrivateFeedNowTick(Date.now());
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isMember) return undefined;

    const id = setInterval(() => {
      fetchPrivateEvents({ silent: true });
      fetchMyPrivateInvites(cityPrivateEvents);
      fetchPrivateInviteRequests(cityPrivateEvents);
    }, 15000);

    return () => clearInterval(id);
  }, [cityPrivateEvents, fetchMyPrivateInvites, fetchPrivateEvents, fetchPrivateInviteRequests, isMember]);

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
      hoverPopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        anchor: "top",
        offset: 22,
        className: "qa-map-hover-popup",
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

    const beginInteraction = () => {
      isMapInteractingRef.current = true;
      setIsMapInteracting(true);
      hoverPopupRef.current?.remove();
    };
    const endInteraction = () => {
      isMapInteractingRef.current = false;
      setIsMapInteracting(false);
    };

    mapRef.current.on("dragstart", beginInteraction);
    mapRef.current.on("dragend", endInteraction);
    mapRef.current.on("zoomstart", beginInteraction);
    mapRef.current.on("zoomend", endInteraction);
    mapRef.current.on("rotatestart", beginInteraction);
    mapRef.current.on("rotateend", endInteraction);
    mapRef.current.on("pitchstart", beginInteraction);
    mapRef.current.on("pitchend", endInteraction);

    const handleResize = () => mapRef.current?.resize();
    window.addEventListener("resize", handleResize);

    queueMicrotask(() => {
      mapRef.current?.resize();
    });

    return () => {
      mapRef.current?.off("dragstart", beginInteraction);
      mapRef.current?.off("dragend", endInteraction);
      mapRef.current?.off("zoomstart", beginInteraction);
      mapRef.current?.off("zoomend", endInteraction);
      mapRef.current?.off("rotatestart", beginInteraction);
      mapRef.current?.off("rotateend", endInteraction);
      mapRef.current?.off("pitchstart", beginInteraction);
      mapRef.current?.off("pitchend", endInteraction);
      window.removeEventListener("resize", handleResize);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      hoverPopupRef.current?.remove();
      hoverPopupRef.current = null;
    };
  }, [config.center]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    placeMarkersRef.current = new Map();
    eventMarkersRef.current = new Map();

    const showHoverPopup = (name, lng, lat) => {
      if (!hoverPopupRef.current || isMapInteractingRef.current) return;
      const popupNode = document.createElement("div");
      popupNode.className = "text-xs font-semibold tracking-[0.02em] text-white";
      popupNode.textContent = name;
      hoverPopupRef.current
        .setLngLat([lng, lat])
        .setDOMContent(popupNode)
        .addTo(mapRef.current);
      const popupEl = hoverPopupRef.current.getElement();
      if (popupEl) {
        popupEl.style.zIndex = "9999";
        popupEl.style.pointerEvents = "none";
      }
    };

    const hideHoverPopup = () => {
      hoverPopupRef.current?.remove();
    };

    cityPlaces.forEach((place) => {
      if (place.lat == null || place.lng == null) return;

      const typeConfig = TYPES.find((item) => item.value === place.type);
      const marker = new mapboxgl.Marker({ color: typeConfig?.color || "#9ca3af" })
        .setLngLat([place.lng, place.lat])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", () => {
        router.push(buildSelectionUrl({ nextPlaceId: place.id, nextEventId: null }));
      });
      marker.getElement().addEventListener("mouseenter", () => {
        if (isMapInteractingRef.current) return;
        setHoveredPlaceId(String(place.id));
        showHoverPopup(place.name || "Venue", place.lng, place.lat);
      });
      marker.getElement().addEventListener("mouseleave", () => {
        setHoveredPlaceId(null);
        hideHoverPopup();
      });

      markersRef.current.push(marker);
      placeMarkersRef.current.set(String(place.id), marker);
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
      marker.getElement().addEventListener("mouseenter", () => {
        if (isMapInteractingRef.current) return;
        setHoveredEventId(String(event.id));
        showHoverPopup(event.name || "Event", event.lng, event.lat);
      });
      marker.getElement().addEventListener("mouseleave", () => {
        setHoveredEventId(null);
        hideHoverPopup();
      });

      markersRef.current.push(marker);
      eventMarkersRef.current.set(String(event.id), marker);
    });
  }, [buildSelectionUrl, cityPlaces, cityEvents, router]);

  useEffect(() => {
    placeMarkersRef.current.forEach((marker, id) => {
      const active = !isMapInteracting && hoveredPlaceId && String(id) === String(hoveredPlaceId);
      const el = marker.getElement();
      el.style.transition = "box-shadow 160ms ease, filter 160ms ease";
      el.style.boxShadow = active ? "0 0 0 4px rgba(255,255,255,0.22), 0 0 22px rgba(255,255,255,0.35)" : "none";
      el.style.filter = active ? "saturate(1.2)" : "saturate(1)";
      el.style.zIndex = active ? "30" : "10";
    });

    eventMarkersRef.current.forEach((marker, id) => {
      const active = !isMapInteracting && hoveredEventId && String(id) === String(hoveredEventId);
      const el = marker.getElement();
      el.style.transition = "box-shadow 160ms ease, filter 160ms ease";
      el.style.boxShadow = active ? "0 0 0 4px rgba(139,92,246,0.24), 0 0 22px rgba(139,92,246,0.45)" : "none";
      el.style.filter = active ? "brightness(1.15)" : "brightness(1)";
      el.style.zIndex = active ? "32" : "12";
    });
  }, [hoveredEventId, hoveredPlaceId, isMapInteracting]);

  useEffect(() => {
    if (!selectedPlace) {
      queueMicrotask(() => {
        setReviews([]);
      });
      return;
    }

    getReviews(selectedPlace.id, selectedPlace).then((data) => {
      setReviews(data);
    });
  }, [getReviews, selectedPlace]);

  useEffect(() => {
    let active = true;

    queueMicrotask(async () => {
      const resolvePlaceDbIdInline = async (place) => {
        const placeId = String(place?.id || "");
        const placeName = String(place?.name || "").trim();
        const placeCity = String(place?.city || city).trim();
        const normalizeCity = (value) =>
          String(value || "")
            .toLowerCase()
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(/\s+/g, " ")
            .trim();

        if (placeId && !placeId.startsWith("seed-place-")) {
          return placeId;
        }

        if (!placeName || !placeCity) return null;

        const lookup = await supabase
          .from("places")
          .select("id, city, name")
          .ilike("name", placeName)
          .limit(20);

        const rows = Array.isArray(lookup?.data) ? lookup.data : [];
        const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(placeCity));

        return matched?.id ? String(matched.id) : null;
      };

      if (!selectedPlace) {
        if (!active) return;
        setSelectedPlaceDbId("");
        setLiveVibeRows([]);
        setLiveVibeError("");
        setLiveVibeTableMissing(false);
        setIsLoadingLiveVibe(false);
        return;
      }

      if (active) {
        setIsLoadingLiveVibe(true);
        setLiveVibeError("");
      }

      const dbId = await resolvePlaceDbIdInline(selectedPlace);
      if (!active) return;

      if (!dbId) {
        setSelectedPlaceDbId("");
        setLiveVibeRows([]);
        setLiveVibeError("");
        setLiveVibeTableMissing(false);
        setIsLoadingLiveVibe(false);
        return;
      }

      setSelectedPlaceDbId(String(dbId));
      const lookbackIso = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("qa_place_vibe_signals")
        .select("id, place_id, user_id, signal_key, created_at")
        .eq("place_id", dbId)
        .gte("created_at", lookbackIso)
        .order("created_at", { ascending: false })
        .limit(400);

      if (!active) return;

      if (error) {
        if (isMissingTableError(error)) {
          setLiveVibeTableMissing(true);
          setLiveVibeRows([]);
          setLiveVibeError("");
        } else {
          setLiveVibeError("Live vibe could not load right now.");
        }
        setIsLoadingLiveVibe(false);
        return;
      }

      setLiveVibeTableMissing(false);
      setLiveVibeRows(Array.isArray(data) ? data : []);
      setLiveVibeError("");
      setIsLoadingLiveVibe(false);
    });

    return () => {
      active = false;
    };
  }, [city, liveVibeRefreshTick, selectedPlace]);

  useEffect(() => {
    if (!selectedPlaceDbId || liveVibeTableMissing) return undefined;

    const channel = supabase
      .channel(`qa-place-vibe-${selectedPlaceDbId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "qa_place_vibe_signals" },
        (payload) => {
          const changedPlaceId = String(
            payload?.new?.place_id ??
            payload?.old?.place_id ??
            ""
          );
          if (changedPlaceId && changedPlaceId === String(selectedPlaceDbId)) {
            setLiveVibeRefreshTick((value) => value + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveVibeTableMissing, selectedPlaceDbId]);

  useEffect(() => {
    const target = selectedPlace || selectedEvent;

    if (!target || !mapRef.current || target.lat == null || target.lng == null) {
      if (!selectedPlace && !selectedEvent && mapRef.current) {
        if (keepMapViewOnNextCloseRef.current) {
          keepMapViewOnNextCloseRef.current = false;
          return;
        }
        mapRef.current.flyTo({
          center: config.center,
          zoom: 11,
        });
      }
      return;
    }

    mapRef.current.flyTo({
      center: [target.lng, target.lat],
      zoom: 14.8,
    });

    mapWrapperRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [config.center, selectedEvent, selectedPlace]);

  const handleAddPlace = async () => {
    if (!name.trim() || !address.trim() || !description.trim() || !placeHours.trim()) {
      showToast("Fill in name, address, description, and opening hours before saving place.", { tone: "warn", duration: 2400 });
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
        hours: placeHours,
        link: placeLink,
        location: address,
        address,
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
      setPlaceHours("");
      setPlaceLink("");
      setAddMode(false);
      trackKpiEvent("place_added", {
        city,
        targetType: "place",
        targetId: String(createdPlace.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Place added to city atlas.", { tone: "ok", duration: 2200 });
    } catch (error) {
      showToast(error?.message || "Could not save place right now.", { tone: "warn", duration: 2600 });
    }
  };

  const handleAddEvent = async () => {
    const startDate = normalizeIsoDate(eventStartDate);
    const endDateInput = normalizeIsoDate(eventEndDate);
    const endDate = endDateInput && endDateInput >= startDate ? endDateInput : startDate;
    if (!eventName.trim() || !eventAddress.trim() || !startDate) {
      showToast("Fill in event name, address, and start date before saving.", { tone: "warn", duration: 2400 });
      return;
    }
    if (endDateInput && endDateInput < startDate) {
      showToast("End date must be same day or after start date.", { tone: "warn", duration: 2400 });
      return;
    }

    try {
      const coords = await geocodeAddress(eventAddress);

      if (!coords) {
        showToast("Address not found. Try a more specific address.", { tone: "warn", duration: 2400 });
        return;
      }

      const insertBasePayload = {
        name: eventName,
        city,
        lat: coords.lat,
        lng: coords.lng,
        date: startDate,
        start_date: startDate,
        end_date: endDate || startDate,
        location: eventAddress,
        vibe: eventVibe.trim() || null,
        description: eventDescription,
        link: eventLink,
      };

      let insertResult = await supabase.from("events").insert([insertBasePayload]).select("*").single();

      if (insertResult.error) {
        const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
        const missingDateRange =
          (errorText.includes("start_date") || errorText.includes("end_date")) &&
          (errorText.includes("column") || errorText.includes("schema cache"));
        const missingVibe =
          errorText.includes("vibe") && (errorText.includes("column") || errorText.includes("schema cache"));
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingDateRange || missingVibe || missingLocation) {
          const legacyPayload = {
            name: eventName,
            city,
            lat: coords.lat,
            lng: coords.lng,
            date: startDate,
            description: eventDescription,
            link: eventLink,
          };
          if (!missingVibe) {
            legacyPayload.vibe = eventVibe.trim() || null;
          }
          insertResult = await supabase.from("events").insert([legacyPayload]).select("*").single();
        }
      }

      const { data: createdEvent, error } = insertResult;

      if (error) {
        captureOperationalError("save_event_fail", error, {
          city: String(city || ""),
          flow: "city_add_event",
          hasDate: Boolean(startDate),
        });
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
      setEventStartDate("");
      setEventEndDate("");
      setEventVibe("");
      setEventDescription("");
      setEventLink("");
      setAddEventMode(false);
      trackKpiEvent("event_added", {
        city,
        targetType: "event",
        targetId: String(createdEvent?.id || ""),
        memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      });
      showToast("Event added to city atlas.", { tone: "ok", duration: 2200 });
    } catch (error) {
      captureOperationalError("save_event_fail", error, {
        city: String(city || ""),
        flow: "city_add_event_catch",
        hasDate: Boolean(startDate),
      });
      showToast(error?.message || "Could not save event right now.", { tone: "warn", duration: 2600 });
    }
  };

  const handleReport = ({ targetType, targetId, title }) => {
    setReportDraft({
      targetType: String(targetType || "place"),
      targetId: String(targetId || ""),
      title: String(title || "Reported item"),
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
      targetType: reportDraft.targetType,
      targetId: reportDraft.targetId,
      city: config.title?.replace("Queer ", "") || city,
      title: reportDraft.title,
      reason: selectedReason.label,
      message: details,
    });

    trackKpiEvent("report_submitted", {
      city: config.title?.replace("Queer ", "") || city,
      targetType: reportDraft.targetType,
      targetId: String(reportDraft.targetId),
      memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
      meta: { reason: selectedReason.label },
    });

    setReportModalOpen(false);
    showToast("Report sent to admin inbox.", { tone: "info", duration: 2400 });
  };

  const refreshEntityQuality = ({ targetType, targetId, fallbackSource = "" }, clickEvent) => {
    clickEvent?.stopPropagation();

    const existing = getEntityQuality({ targetType, targetId, entity: { source: fallbackSource }, map: qualityMap });
    const knownSource = (existing?.source || fallbackSource || "").trim();
    setQualityModal({
      open: true,
      targetType,
      targetId: String(targetId || ""),
      action: "1",
      sourceInput: knownSource,
      fallbackSource: knownSource,
    });
  };

  const closeQualityModal = () => {
    setQualityModal((current) => ({ ...current, open: false }));
  };

  const submitQualityModal = () => {
    const action = String(qualityModal.action || "").trim();
    if (!["1", "2", "3"].includes(action)) {
      showToast("Please choose a trust status.", { tone: "warn", duration: 2200 });
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
      targetType: qualityModal.targetType,
      targetId: qualityModal.targetId,
      source: sourceByAction,
      lastChecked,
      verified,
    });

    setQualityTick((value) => value + 1);

    if (action === "1") {
      showToast("Trust status updated: verified.", { tone: "ok", duration: 2000 });
      closeQualityModal();
      return;
    }

    if (action === "2") {
      showToast("Trust status updated: needs refresh.", { tone: "info", duration: 2200 });
      closeQualityModal();
      return;
    }

    showToast("Trust status updated: closed or moved.", { tone: "warn", duration: 2300 });
    closeQualityModal();
  };

  const resolvePlaceDbId = useCallback(async (place) => {
    const placeId = String(place?.id || "");
    const placeName = String(place?.name || "").trim();
    const placeCity = String(place?.city || city).trim();
    const normalizeCity = (value) =>
      String(value || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim();

    if (placeId && !placeId.startsWith("seed-place-")) {
      return placeId;
    }

    if (!placeName || !placeCity) return null;

    const lookup = await supabase
      .from("places")
      .select("id, city, name")
      .ilike("name", placeName)
      .limit(20);

    const rows = Array.isArray(lookup?.data) ? lookup.data : [];
    const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(placeCity));

    return matched?.id ? String(matched.id) : null;
  }, [city]);

  const resolveEventDbId = useCallback(async (event) => {
    const eventId = String(event?.id || "");
    const eventName = String(event?.name || "").trim();
    const eventCity = String(event?.city || city).trim();
    const eventDateValue = normalizeEventRange(event || {}).startDate;
    const normalizeCity = (value) =>
      String(value || "")
        .toLowerCase()
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .replace(/\s+/g, " ")
        .trim();

    if (eventId && !eventId.startsWith("seed-event-")) {
      return eventId;
    }

    if (!eventName || !eventCity) return null;

    let query = supabase
      .from("events")
      .select("id, city, name, date")
      .ilike("name", eventName)
      .limit(20);

    if (eventDateValue) {
      query = query.eq("date", eventDateValue);
    }

    const lookup = await query;
    const rows = Array.isArray(lookup?.data) ? lookup.data : [];
    const matched = rows.find((row) => normalizeCity(row?.city) === normalizeCity(eventCity));
    return matched?.id ? String(matched.id) : null;
  }, [city]);

  const handleSubmitLiveVibe = useCallback(async (signalKey) => {
    if (!selectedPlace) return;

    if (!isMember || !user?.id) {
      showToast("Join as member to share live vibe.", { tone: "info", duration: 2200 });
      const redirectTarget = buildSelectionUrl({
        nextPlaceId: selectedPlace.id,
        nextEventId: null,
      });
      writeLocalValue("qa_redirect", redirectTarget);
      writeLocalValue("qa_post_login_target", redirectTarget);
      router.push("/?join=true");
      return;
    }

    if (liveVibeMyLastTapMs && Date.now() - liveVibeMyLastTapMs < LIVE_VIBE_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((LIVE_VIBE_COOLDOWN_MS - (Date.now() - liveVibeMyLastTapMs)) / 1000);
      showToast(`Hold for ${secondsLeft}s before sending another live tap.`, {
        tone: "info",
        duration: 1800,
      });
      return;
    }

    setIsSubmittingLiveVibe(true);
    try {
      const dbId = selectedPlaceDbId || (await resolvePlaceDbId(selectedPlace));
      if (!dbId) {
        showToast("Could not resolve this venue for live signal.", {
          tone: "warn",
          duration: 2400,
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("qa_place_vibe_signals")
        .upsert(
          [
            {
              place_id: Number(dbId),
              user_id: user.id,
              signal_key: signalKey,
              created_at: nowIso,
            },
          ],
          { onConflict: "place_id,user_id" }
        );

      if (error) {
        if (isMissingTableError(error)) {
          setLiveVibeTableMissing(true);
          showToast("Live vibe is not activated in DB yet.", {
            tone: "warn",
            duration: 2600,
          });
          return;
        }

        showToast("Could not publish live vibe right now.", {
          tone: "warn",
          duration: 2400,
        });
        return;
      }

      setLiveVibeTableMissing(false);
      setSelectedPlaceDbId(String(dbId));
      setLiveVibeRows((current) => {
        const next = (Array.isArray(current) ? current : []).filter(
          (row) => String(row?.user_id || "") !== String(user.id)
        );
        return [
          {
            id: `local-${nowIso}`,
            place_id: Number(dbId),
            user_id: user.id,
            signal_key: signalKey,
            created_at: nowIso,
          },
          ...next,
        ];
      });
      setLiveVibeRefreshTick((value) => value + 1);
      showToast("Live vibe shared.", { tone: "ok", duration: 1600 });
    } finally {
      setIsSubmittingLiveVibe(false);
    }
  }, [
    buildSelectionUrl,
    isMember,
    liveVibeMyLastTapMs,
    resolvePlaceDbId,
    router,
    selectedPlace,
    selectedPlaceDbId,
    showToast,
    user?.id,
  ]);

  const handleAdminSavePlace = useCallback(async () => {
    if (!isAdmin || !selectedPlace) return;
    if (!placeAdminDraft.name.trim() || !placeAdminDraft.description.trim() || !placeAdminDraft.hours.trim()) {
      showToast("Name, description, and opening hours are required.", { tone: "warn", duration: 2400 });
      return;
    }

    setIsSavingPlaceAdmin(true);
    try {
      const dbId = await resolvePlaceDbId(selectedPlace);
      const locationValue = String(placeAdminDraft.location || "").trim();
      let nextLat = selectedPlace.lat ?? null;
      let nextLng = selectedPlace.lng ?? null;

      if (locationValue) {
        const coords = await geocodeAddress(locationValue);
        if (!coords) {
          showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
          return;
        }
        nextLat = coords.lat;
        nextLng = coords.lng;
      }

      const payload = {
        name: placeAdminDraft.name.trim(),
        type: placeAdminDraft.type,
        description: placeAdminDraft.description.trim(),
        vibe: placeAdminDraft.vibe.trim(),
        location: locationValue || null,
        hours: placeAdminDraft.hours.trim(),
        link: placeAdminDraft.link.trim() || null,
        lat: nextLat,
        lng: nextLng,
      };

      if (dbId) {
        let updateResult = await supabase
          .from("places")
          .update(payload)
          .eq("id", dbId)
          .select("id")
          .single();

        if (updateResult.error) {
          const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingLocation) {
            const fallbackPayload = { ...payload };
            delete fallbackPayload.location;
            updateResult = await supabase
              .from("places")
              .update(fallbackPayload)
              .eq("id", dbId)
              .select("id")
              .single();
          }
        }
        const { error } = updateResult;

        if (error) {
          showToast(error.message || "Could not save venue changes.", { tone: "warn", duration: 2600 });
          return;
        }
      } else {
        let insertPayload = {
          ...payload,
          city: String(selectedPlace.city || city).trim(),
        };
        let insertResult = await supabase
          .from("places")
          .insert([insertPayload])
          .select("id")
          .single();

        if (insertResult.error) {
          const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingLocation) {
            insertPayload = { ...insertPayload };
            delete insertPayload.location;
            insertResult = await supabase
              .from("places")
              .insert([insertPayload])
              .select("id")
              .single();
          }
        }
        const { data: inserted, error } = insertResult;

        if (error || !inserted?.id) {
          showToast(error?.message || "Could not save venue changes.", { tone: "warn", duration: 2600 });
          return;
        }

        router.push(buildSelectionUrl({ nextPlaceId: inserted.id, nextEventId: null }));
      }

      await reloadPlaces();
      setPlaceAdminOpen(false);
      showToast("Venue updated and saved.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save venue changes.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingPlaceAdmin(false);
    }
  }, [buildSelectionUrl, city, geocodeAddress, isAdmin, placeAdminDraft, reloadPlaces, resolvePlaceDbId, router, selectedPlace, showToast]);

  const handleAdminDeletePlace = useCallback(async () => {
    if (!isAdmin || !selectedPlace) return;
    const confirmed = window.confirm(`Delete venue "${selectedPlace.name}" from atlas?`);
    if (!confirmed) return;

    setIsDeletingPlaceAdmin(true);
    try {
      const dbId = await resolvePlaceDbId(selectedPlace);
      if (!dbId) {
        showToast("Could not resolve place record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      const { error } = await supabase
        .from("places")
        .delete()
        .eq("id", dbId);

      if (error) {
        showToast(error.message || "Could not delete venue.", { tone: "warn", duration: 2600 });
        return;
      }

      await reloadPlaces();
      closePlace();
      showToast("Venue deleted.", { tone: "ok", duration: 2000 });
    } catch (error) {
      showToast(error?.message || "Could not delete venue.", { tone: "warn", duration: 2600 });
    } finally {
      setIsDeletingPlaceAdmin(false);
    }
  }, [closePlace, isAdmin, reloadPlaces, resolvePlaceDbId, selectedPlace, showToast]);

  const handleAdminSavePlaceAddressOnly = useCallback(async () => {
    if (!isAdmin || !selectedPlace) return;
    const locationValue = String(placeAdminDraft.location || "").trim();
    if (!locationValue) {
      showToast("Address is required.", { tone: "warn", duration: 2200 });
      return;
    }

    setIsSavingPlaceAddressOnly(true);
    try {
      const coords = await geocodeAddress(locationValue);
      if (!coords) {
        showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
        return;
      }

      const dbId = await resolvePlaceDbId(selectedPlace);
      if (!dbId) {
        showToast("Could not resolve place record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      let updateResult = await supabase
        .from("places")
        .update({
          location: locationValue,
          lat: coords.lat,
          lng: coords.lng,
        })
        .eq("id", dbId)
        .select("id")
        .single();

      if (updateResult.error) {
        const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingLocation) {
          updateResult = await supabase
            .from("places")
            .update({
              lat: coords.lat,
              lng: coords.lng,
            })
            .eq("id", dbId)
            .select("id")
            .single();
        }
      }

      if (updateResult.error) {
        showToast(updateResult.error.message || "Could not save venue address.", { tone: "warn", duration: 2600 });
        return;
      }

      await reloadPlaces();
      showToast("Venue address updated.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save venue address.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingPlaceAddressOnly(false);
    }
  }, [geocodeAddress, isAdmin, placeAdminDraft.location, reloadPlaces, resolvePlaceDbId, selectedPlace, showToast]);

  const handleAdminSaveEvent = useCallback(async () => {
    if (!isAdmin || !selectedEvent) return;
    const startDate = normalizeIsoDate(eventAdminDraft.startDate);
    const endDateInput = normalizeIsoDate(eventAdminDraft.endDate);
    const endDate = endDateInput && endDateInput >= startDate ? endDateInput : startDate;
    const locationValue = String(eventAdminDraft.location || "").trim();

    if (!eventAdminDraft.name.trim() || !startDate) {
      showToast("Event name and start date are required.", { tone: "warn", duration: 2400 });
      return;
    }
    if (endDateInput && endDateInput < startDate) {
      showToast("End date must be same day or after start date.", { tone: "warn", duration: 2400 });
      return;
    }
    setIsSavingEventAdmin(true);
    try {
      const dbId = await resolveEventDbId(selectedEvent);
      let nextLat = selectedEvent.lat ?? null;
      let nextLng = selectedEvent.lng ?? null;

      if (locationValue) {
        const coords = await geocodeAddress(locationValue);
        if (!coords) {
          showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
          return;
        }
        nextLat = coords.lat;
        nextLng = coords.lng;
      }

      const payload = {
        name: eventAdminDraft.name.trim(),
        date: startDate,
        start_date: startDate,
        end_date: endDate || startDate,
        location: locationValue,
        lat: nextLat,
        lng: nextLng,
        vibe: eventAdminDraft.vibe.trim() || null,
        description: eventAdminDraft.description.trim(),
        link: eventAdminDraft.link.trim() || null,
      };

      if (dbId) {
        let updateResult = await supabase
          .from("events")
          .update(payload)
          .eq("id", dbId)
          .select("*")
          .single();

        if (updateResult.error) {
          const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
          const missingDateRange =
            (errorText.includes("start_date") || errorText.includes("end_date")) &&
            (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibe =
            errorText.includes("vibe") && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingDateRange || missingVibe || missingLocation) {
            const legacyPayload = {
              name: eventAdminDraft.name.trim(),
              date: startDate,
              lat: nextLat,
              lng: nextLng,
              description: eventAdminDraft.description.trim(),
              link: eventAdminDraft.link.trim() || null,
            };
            if (!missingVibe) {
              legacyPayload.vibe = eventAdminDraft.vibe.trim() || null;
            }
            updateResult = await supabase
              .from("events")
              .update(legacyPayload)
              .eq("id", dbId)
              .select("*")
              .single();
          }
        }
        const { error } = updateResult;

        if (error) {
          captureOperationalError("save_event_fail", error, {
            city: String(selectedEvent?.city || city || ""),
            flow: "city_admin_update_event",
            eventId: String(dbId),
          });
          showToast(error.message || "Could not save event changes.", { tone: "warn", duration: 2600 });
          return;
        }
      } else {
        const insertPayload = {
          ...payload,
          city: String(selectedEvent.city || city).trim(),
        };

        let insertResult = await supabase
          .from("events")
          .insert([insertPayload])
          .select("*")
          .single();

        if (insertResult.error) {
          const errorText = `${insertResult.error?.code || ""} ${insertResult.error?.message || ""}`.toLowerCase();
          const missingDateRange =
            (errorText.includes("start_date") || errorText.includes("end_date")) &&
            (errorText.includes("column") || errorText.includes("schema cache"));
          const missingVibe =
            errorText.includes("vibe") && (errorText.includes("column") || errorText.includes("schema cache"));
          const missingLocation =
            errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

          if (missingDateRange || missingVibe || missingLocation) {
            const legacyInsertPayload = {
              name: eventAdminDraft.name.trim(),
              date: startDate,
              description: eventAdminDraft.description.trim(),
              link: eventAdminDraft.link.trim() || null,
              city: String(selectedEvent.city || city).trim(),
              lat: nextLat,
              lng: nextLng,
            };
            if (!missingVibe) {
              legacyInsertPayload.vibe = eventAdminDraft.vibe.trim() || null;
            }
            insertResult = await supabase
              .from("events")
              .insert([legacyInsertPayload])
              .select("*")
              .single();
          }
        }

        const { data: inserted, error } = insertResult;

        if (error || !inserted?.id) {
          captureOperationalError("save_event_fail", error || new Error("Event insert returned no id."), {
            city: String(selectedEvent?.city || city || ""),
            flow: "city_admin_upsert_event",
          });
          showToast(error?.message || "Could not save event changes.", { tone: "warn", duration: 2600 });
          return;
        }

        router.push(buildSelectionUrl({ nextPlaceId: null, nextEventId: inserted.id }));
      }

      await fetchEvents();
      setEventAdminOpen(false);
      showToast("Event updated and saved.", { tone: "ok", duration: 2000 });
    } catch (error) {
      captureOperationalError("save_event_fail", error, {
        city: String(selectedEvent?.city || city || ""),
        flow: "city_admin_save_event_catch",
        eventId: String(selectedEvent?.id || ""),
      });
      showToast(error?.message || "Could not save event changes.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingEventAdmin(false);
    }
  }, [buildSelectionUrl, city, eventAdminDraft, fetchEvents, geocodeAddress, isAdmin, resolveEventDbId, router, selectedEvent, showToast]);

  const handleAdminSaveEventAddressOnly = useCallback(async () => {
    if (!isAdmin || !selectedEvent) return;
    const locationValue = String(eventAdminDraft.location || "").trim();
    if (!locationValue) {
      showToast("Address is required.", { tone: "warn", duration: 2200 });
      return;
    }

    setIsSavingEventAddressOnly(true);
    try {
      const coords = await geocodeAddress(locationValue);
      if (!coords) {
        showToast("Could not find that location. Use a more specific place/address.", { tone: "warn", duration: 3000 });
        return;
      }

      const dbId = await resolveEventDbId(selectedEvent);
      if (!dbId) {
        showToast("Could not resolve event record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      let updateResult = await supabase
        .from("events")
        .update({
          location: locationValue,
          lat: coords.lat,
          lng: coords.lng,
        })
        .eq("id", dbId)
        .select("id")
        .single();

      if (updateResult.error) {
        const errorText = `${updateResult.error?.code || ""} ${updateResult.error?.message || ""}`.toLowerCase();
        const missingLocation =
          errorText.includes("location") && (errorText.includes("column") || errorText.includes("schema cache"));

        if (missingLocation) {
          updateResult = await supabase
            .from("events")
            .update({
              lat: coords.lat,
              lng: coords.lng,
            })
            .eq("id", dbId)
            .select("id")
            .single();
        }
      }

      if (updateResult.error) {
        showToast(updateResult.error.message || "Could not save event address.", { tone: "warn", duration: 2600 });
        return;
      }

      await fetchEvents();
      showToast("Event address updated.", { tone: "ok", duration: 2100 });
    } catch (error) {
      showToast(error?.message || "Could not save event address.", { tone: "warn", duration: 2600 });
    } finally {
      setIsSavingEventAddressOnly(false);
    }
  }, [eventAdminDraft.location, fetchEvents, geocodeAddress, isAdmin, resolveEventDbId, selectedEvent, showToast]);

  const handleAdminDeleteEvent = useCallback(async () => {
    if (!isAdmin || !selectedEvent) return;
    const confirmed = window.confirm(`Delete event "${selectedEvent.name}" from atlas?`);
    if (!confirmed) return;

    setIsDeletingEventAdmin(true);
    try {
      const dbId = await resolveEventDbId(selectedEvent);
      if (!dbId) {
        showToast("Could not resolve event record in database.", { tone: "warn", duration: 2600 });
        return;
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", dbId);

      if (error) {
        showToast(error.message || "Could not delete event.", { tone: "warn", duration: 2600 });
        return;
      }

      await fetchEvents();
      closeEvent();
      showToast("Event deleted.", { tone: "ok", duration: 2000 });
    } catch (error) {
      showToast(error?.message || "Could not delete event.", { tone: "warn", duration: 2600 });
    } finally {
      setIsDeletingEventAdmin(false);
    }
  }, [closeEvent, fetchEvents, isAdmin, resolveEventDbId, selectedEvent, showToast]);

  return (
    <main className="flex min-h-screen bg-[#050505] text-white">
      <ActionToast toast={toast} />
      <div ref={mainScrollRef} className="flex-1 overflow-y-auto px-5 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8">
        <div className="animate-cinematic-in relative mb-6 overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(244,114,182,0.11),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(34,211,238,0.10),transparent_32%),linear-gradient(135deg,rgba(22,22,22,0.97),rgba(10,10,10,0.99),rgba(18,18,18,0.97))] p-6 shadow-[0_28px_96px_rgba(0,0,0,0.40)] sm:p-7">
          <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-fuchsia-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-4 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
          <div>
            <div className="mb-2 flex items-center gap-4">
              <Image
                src="/queer-atlas-heart-logo-progress.png"
                alt="Queer Atlas heart"
                width={64}
                height={64}
                className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              />
              <h1 className="text-4xl font-bold tracking-[-0.03em]">{config.title}</h1>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/90">
                {placesChipLabel}
              </span>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100/90">
                {eventsChipLabel}
              </span>
              <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/70">
                Queer signal live
              </span>
            </div>
            <div className="max-w-4xl rounded-2xl border border-white/10 bg-black/28 p-4 sm:p-5">
              <div className="space-y-3">
                {cityHero.hook && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
                    <p className="text-sm leading-7 text-white/86 sm:text-[15px]">
                      <span className="mr-2 text-[11px] uppercase tracking-[0.18em] text-fuchsia-200/90">Hook</span>
                      {cityHero.hook}
                    </p>
                  </div>
                )}
                {cityHero.status && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                    <p className="text-sm leading-7 text-white/82 sm:text-[15px]">
                      <span className="mr-2 text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">Queer Status</span>
                      {cityHero.status}
                    </p>
                  </div>
                )}
                {cityHero.crowd && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)]" />
                    <p className="text-sm leading-7 text-white/82 sm:text-[15px]">
                      <span className="mr-2 text-[11px] uppercase tracking-[0.18em] text-amber-200/90">Crowd</span>
                      {cityHero.crowd}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="animate-cinematic-in mb-4 flex flex-wrap gap-2" style={{ animationDelay: "70ms" }}>
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
            aria-pressed={addMode}
            aria-label={addMode ? "Cancel add place form" : "Open add place form"}
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

              if (addEventMode) {
                setAddEventMode(false);
                return;
              }

              openEventContribution();
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              addEventMode
                ? "bg-red-400 text-black shadow-[0_14px_40px_rgba(248,113,113,0.16)]"
                : "bg-gradient-to-r from-violet-300 to-fuchsia-200 text-black shadow-[0_14px_40px_rgba(192,132,252,0.16)]"
            }`}
            aria-pressed={addEventMode}
            aria-label={addEventMode ? "Cancel add event form" : "Open add event form"}
          >
            {addEventMode ? "Cancel event" : "+ Add event"}
          </button>
        </div>

        {addMode && (
          <div className="mb-6 space-y-3 rounded-[28px] border border-emerald-300/12 bg-[linear-gradient(180deg,rgba(9,36,30,0.92),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Place name" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description (vibe, crowd, energy...)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={vibe} onChange={(event) => setVibe(event.target.value)} placeholder="Vibe (for example Chill, Techno, Luxury)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={placeHours} onChange={(event) => setPlaceHours(event.target.value)} placeholder="Opening hours (for example Thu-Sat 22:00-05:00)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={placeLink} onChange={(event) => setPlaceLink(event.target.value)} placeholder="Official link (website, Instagram, Facebook) - optional" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
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
          <div ref={addEventFormRef} className="mb-6 space-y-3 rounded-[28px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(28,19,56,0.92),rgba(14,14,14,0.96))] p-5 shadow-[0_18px_50px_rgba(139,92,246,0.08)]">
            <input value={eventName} onChange={(event) => setEventName(event.target.value)} placeholder="Event name" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <textarea value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} placeholder="Description (what is this event?)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={eventVibe} onChange={(event) => setEventVibe(event.target.value)} placeholder="Vibe (for example Festival, Circuit, Queer arts)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={eventLink} onChange={(event) => setEventLink(event.target.value)} placeholder="Event link (Instagram, RA, etc)" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <input value={eventAddress} onChange={(event) => setEventAddress(event.target.value)} placeholder="Address" className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">From</p>
                <DateInput value={eventStartDate} onChange={(event) => setEventStartDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" tone="violet" />
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">To</p>
                <DateInput value={eventEndDate} onChange={(event) => setEventEndDate(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 outline-none" tone="violet" />
              </div>
            </div>
            <p className="text-[11px] text-white/50">Leave &quot;To&quot; empty for single-day events.</p>
            <button onClick={handleAddEvent} className="w-full rounded-2xl bg-gradient-to-r from-violet-300 to-fuchsia-200 py-3 font-semibold text-black">
              Save event
            </button>
          </div>
        )}

        <div ref={mapWrapperRef} className="animate-cinematic-in mb-8" style={{ animationDelay: "120ms" }}>
          <div className="relative h-[460px] w-full overflow-hidden rounded-[32px] border border-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.30)]">
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

        <div className="animate-cinematic-in mb-8 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_14px_44px_rgba(0,0,0,0.22)]" style={{ animationDelay: "170ms" }}>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Quick Navigation</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => scrollToSection(tonightSectionRef)}
              className="qa-cinematic-hover rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] px-4 py-3 text-left text-sm text-cyan-100 hover:border-cyan-200/32"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">Jump To</p>
              <p className="mt-1 font-semibold">Tonight</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(guideSectionRef)}
              className="qa-cinematic-hover rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] px-4 py-3 text-left text-sm text-cyan-100 hover:border-cyan-200/32"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">Jump To</p>
              <p className="mt-1 font-semibold">Quick Guide</p>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(placesSectionRef)}
              className="qa-cinematic-hover rounded-2xl border border-cyan-200/16 bg-cyan-200/[0.06] px-4 py-3 text-left text-sm text-cyan-100 hover:border-cyan-200/32"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100/75">Jump To</p>
              <p className="mt-1 font-semibold">Venues</p>
            </button>
          </div>
        </div>

        <div ref={tonightSectionRef} className="animate-cinematic-in mb-10 rounded-[32px] border border-fuchsia-300/12 bg-[linear-gradient(180deg,rgba(38,20,44,0.84),rgba(10,10,10,0.98))] p-6 shadow-[0_18px_52px_rgba(217,70,239,0.08)]" style={{ animationDelay: "195ms" }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-fuchsia-100/65">Tonight in {cityName}</p>
              <h2 className="mt-1 text-xl tracking-[0.02em] text-fuchsia-100">Live plans from the community</h2>
            </div>
            <div className="inline-flex rounded-full border border-white/12 bg-black/35 p-1 text-xs">
              <button
                type="button"
                onClick={() => setTonightFeedTab("public")}
                className={`rounded-full px-3 py-1.5 transition ${
                  tonightFeedTab === "public"
                    ? "border border-fuchsia-200/34 bg-fuchsia-200/18 text-fuchsia-100"
                    : "text-white/65 hover:text-white"
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setTonightFeedTab("vip")}
                className={`rounded-full px-3 py-1.5 transition ${
                  tonightFeedTab === "vip"
                    ? "border border-fuchsia-200/34 bg-fuchsia-200/18 text-fuchsia-100"
                    : "text-white/65 hover:text-white"
                }`}
              >
                VIP / Invites
              </button>
            </div>
          </div>

          {tonightFeedTab === "public" ? (
            <div className="rounded-[24px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(38,30,60,0.58),rgba(15,15,15,0.96))] p-5">
              <p className="text-sm text-white/74">
                Browse the city's public events feed for club nights, Pride blocks, and official listings.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => scrollToSection(eventsSectionRef)}
                  className="qa-cinematic-hover rounded-full border border-violet-200/28 bg-violet-200/12 px-4 py-2 text-xs text-violet-100 hover:border-violet-200/46"
                >
                  Open public events
                </button>
                {isMember ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTonightFeedTab("vip");
                      setHostPrivateEventOpen(true);
                    }}
                    className="qa-cinematic-hover rounded-full border border-fuchsia-200/24 bg-fuchsia-200/12 px-4 py-2 text-xs text-fuchsia-100 hover:border-fuchsia-200/40"
                  >
                    Host tonight (VIP)
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {privateEventsTableMissing ? (
                <div className="rounded-2xl border border-amber-300/24 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  VIP invites are not activated in DB yet. Run <code>supabase/vip-invites-v1.sql</code> first.
                </div>
              ) : null}
              {privateEventsError ? (
                <div className="rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3 text-sm text-rose-100">
                  {privateEventsError}
                </div>
              ) : null}
              {privateEventsLoading ? (
                <div className="rounded-2xl border border-fuchsia-200/10 bg-fuchsia-200/[0.03] p-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.16em] text-fuchsia-100/60">Loading VIP feed</p>
                  <SectionSkeleton tone="fuchsia" rows={2} />
                </div>
              ) : null}

              {!privateEventsLoading && cityPrivateEvents.map((item) => {
                const status = getPrivateEventStatus(item);
                const isHost = String(item.host_user_id || "") === String(user?.id || "");
                const inviteStatus = String(privateEventInvites[String(item.id)] || "");
                const canSeeExactLocation = isHost || inviteStatus === "accepted";
                const displayArea = canSeeExactLocation
                  ? String(item.exact_location || item.approx_area || "TBA")
                  : String(item.approx_area || "TBA");
                const requestRows = privateInviteRequestsByEvent[String(item.id)] || [];
                const isExpandedHostCard = String(expandedPrivateHostEventId) === String(item.id);
                const endsInLabel = formatEndsIn(item.expires_at, privateFeedNowTick);
                const inviteLabelMap = {
                  requested: "Invite requested",
                  accepted: "Invite accepted",
                  declined: "Invite declined",
                  cancelled: "Invite cancelled",
                };

                return (
                  <article key={String(item.id)} className="qa-cinematic-hover rounded-[22px] border border-fuchsia-200/18 bg-[linear-gradient(160deg,rgba(86,15,96,0.22),rgba(18,18,18,0.96))] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100">
                        Invite-only
                      </span>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                        status.key === "live"
                          ? "border-emerald-200/30 bg-emerald-200/14 text-emerald-100"
                          : "border-cyan-200/30 bg-cyan-200/14 text-cyan-100"
                      }`}>
                        {status.label}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/7 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/80">
                        {PRIVATE_EVENT_TYPE_LABELS[String(item.event_type || "")] || "Private event"}
                      </span>
                      {endsInLabel ? (
                        <span className="rounded-full border border-amber-200/24 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                          {endsInLabel}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-white/70">
                      {canSeeExactLocation ? "Location" : "Area"}: {displayArea}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/55">
                      Starts {formatDateTime(item.start_at)} · Ends {formatDateTime(item.expires_at)}
                    </p>
                    {item.notes ? (
                      <p className="mt-2 line-clamp-2 text-sm text-white/64">{item.notes}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] text-white/78">
                        Host: {String(item.host_alias || "Member").trim() || "Member"}
                      </span>
                      {isHost ? (
                        <>
                          <span className="rounded-full border border-cyan-200/26 bg-cyan-200/12 px-3 py-1 text-[11px] text-cyan-100">
                            You host this
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedPrivateHostEventId((current) => (
                              String(current) === String(item.id) ? "" : String(item.id)
                            ))}
                            className="qa-cinematic-hover rounded-full border border-cyan-200/26 bg-cyan-200/12 px-3 py-1 text-[11px] text-cyan-100 transition hover:border-cyan-200/45"
                          >
                            Requests ({requestRows.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePrivateEvent(item)}
                            disabled={deletingPrivateEventId === String(item.id)}
                            className="qa-cinematic-hover rounded-full border border-rose-200/28 bg-rose-200/12 px-3 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/45 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingPrivateEventId === String(item.id) ? "Deleting..." : "Delete event"}
                          </button>
                        </>
                      ) : inviteStatus ? (
                        <span className="rounded-full border border-violet-200/26 bg-violet-200/12 px-3 py-1 text-[11px] text-violet-100">
                          {inviteLabelMap[inviteStatus] || "Invite status"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requestPrivateInvite(item)}
                          disabled={!isMember || isSubmittingPrivateInvite || privateInvitesTableMissing}
                          className="qa-cinematic-hover rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-3 py-1.5 text-[11px] text-fuchsia-100 transition hover:border-fuchsia-200/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Request invite
                        </button>
                      )}
                    </div>
                    {isHost && isExpandedHostCard ? (
                      <div className="mt-3 rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.06] p-3">
                        {requestRows.length === 0 ? (
                          <p className="text-xs text-white/62">No invite requests yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {requestRows.map((request) => {
                              const requestStatus = String(request.status || "requested");
                              const requesterId = String(request.requester_user_id || "").trim();
                              const requesterAlias = String(privateInviteRequesterProfiles[requesterId] || "").trim()
                                || fallbackMemberAlias(requesterId);
                              const requesterInitial = requesterAlias.charAt(0).toUpperCase() || "M";
                              return (
                                <div key={String(request.id)} className="rounded-xl border border-white/12 bg-black/25 p-2.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200/30 bg-cyan-200/12 text-[11px] font-semibold text-cyan-100">
                                        {requesterInitial}
                                      </span>
                                      <p className="text-xs text-white/75">
                                        {requesterAlias} · {formatDate(request.created_at)}
                                      </p>
                                    </div>
                                    <span className="rounded-full border border-white/16 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/80">
                                      {requestStatus}
                                    </span>
                                  </div>
                                  {request.message ? (
                                    <p className="mt-1 text-xs text-white/65 line-clamp-2">{request.message}</p>
                                  ) : null}
                                  {requestStatus === "requested" ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() => respondPrivateInviteRequest(request, "accepted")}
                                        disabled={isUpdatingPrivateInviteStatus}
                                        className="rounded-full border border-emerald-200/28 bg-emerald-200/12 px-2.5 py-1 text-[11px] text-emerald-100 transition hover:border-emerald-200/45 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => respondPrivateInviteRequest(request, "declined")}
                                        disabled={isUpdatingPrivateInviteStatus}
                                        className="rounded-full border border-rose-200/28 bg-rose-200/12 px-2.5 py-1 text-[11px] text-rose-100 transition hover:border-rose-200/45 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })}

              {!privateEventsLoading && cityPrivateEvents.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-fuchsia-200/24 bg-[linear-gradient(180deg,rgba(67,20,69,0.35),rgba(14,14,14,0.96))] px-5 py-8 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200/70">VIP signal</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">No invite-only plans yet</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
                    Be first to host a private afterparty, chill session, or invite-only gathering for tonight.
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                {isMember ? (
                  <button
                    type="button"
                    onClick={() => setHostPrivateEventOpen((current) => !current)}
                    className="qa-cinematic-hover rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-4 py-2 text-xs text-fuchsia-100 hover:border-fuchsia-200/46"
                  >
                    {hostPrivateEventOpen ? "Close host form" : "Host tonight"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      writeLocalValue("qa_redirect", pathname);
                      router.push("/?join=true");
                    }}
                    className="qa-cinematic-hover rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-4 py-2 text-xs text-fuchsia-100 hover:border-fuchsia-200/46"
                  >
                    Join to host
                  </button>
                )}
              </div>

              {hostPrivateEventOpen && isMember ? (
                <form onSubmit={submitPrivateEvent} className="rounded-[24px] border border-fuchsia-200/18 bg-[linear-gradient(180deg,rgba(50,18,56,0.55),rgba(14,14,14,0.98))] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-100/70">Host a private plan</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input
                      value={privateEventForm.title}
                      onChange={(event) => setPrivateEventForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Title (e.g. Rooftop afterparty)"
                      className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45"
                      maxLength={120}
                      required
                    />
                    <select
                      value={privateEventForm.eventType}
                      onChange={(event) => setPrivateEventForm((current) => ({ ...current, eventType: event.target.value }))}
                      className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none focus:border-fuchsia-200/45"
                    >
                      {PRIVATE_EVENT_TYPES.map((entry) => (
                        <option key={entry.value} value={entry.value}>{entry.label}</option>
                      ))}
                    </select>
                    <DateInput
                      value={privateEventForm.startDate}
                      onChange={(event) => setPrivateEventForm((current) => ({ ...current, startDate: event.target.value }))}
                      className="w-full"
                      tone="violet"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                    />
                    <div className="relative">
                      <input
                        type="time"
                        value={privateEventForm.startTime}
                        onChange={(event) => setPrivateEventForm((current) => ({ ...current, startTime: event.target.value }))}
                        className="w-full rounded-2xl border border-white/12 bg-black/30 p-3 pr-20 text-sm text-white outline-none focus:border-fuchsia-200/45"
                        required
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-white/14 bg-white/8 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90">
                        Time
                      </span>
                    </div>
                    <input
                      value={privateEventForm.approxArea}
                      onChange={(event) => setPrivateEventForm((current) => ({ ...current, approxArea: event.target.value }))}
                      placeholder="Approx area (not exact address)"
                      className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45"
                      maxLength={120}
                      required
                    />
                    <input
                      value={privateEventForm.exactLocation}
                      onChange={(event) => setPrivateEventForm((current) => ({ ...current, exactLocation: event.target.value }))}
                      placeholder="Exact location (visible only to accepted)"
                      className="rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45 md:col-span-2"
                      maxLength={180}
                    />
                  </div>
                  <textarea
                    value={privateEventForm.notes}
                    onChange={(event) => setPrivateEventForm((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Optional notes"
                    className="mt-3 min-h-[84px] w-full rounded-2xl border border-white/12 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-fuchsia-200/45"
                    maxLength={320}
                  />
                  <p className="mt-2 text-[11px] text-white/55">
                    Invite-only. Event auto-expires 24h after your selected start.
                  </p>
                  {privateEventStartPreview ? (
                    <p className="mt-1 text-[11px] text-fuchsia-100/80">
                      Starts {formatDateTime(privateEventStartPreview)} · Expires {formatDateTime(privateEventExpiresPreview)}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmittingPrivateEvent || privateEventsTableMissing}
                    className="qa-cinematic-hover mt-3 rounded-full border border-fuchsia-200/30 bg-fuchsia-200/14 px-4 py-2 text-xs text-fuchsia-100 transition hover:border-fuchsia-200/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingPrivateEvent ? "Posting..." : "Post private event"}
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </div>

        <div ref={eventsSectionRef} className="animate-cinematic-in mb-10 rounded-[32px] border border-violet-300/12 bg-[linear-gradient(180deg,rgba(26,20,42,0.86),rgba(10,10,10,0.98))] p-6 shadow-[0_18px_52px_rgba(139,92,246,0.07)]" style={{ animationDelay: "210ms" }}>
          <h2 className="sticky top-0 z-20 -mx-2 mb-4 border-b border-violet-300/10 bg-[#050505]/92 px-2 py-3 text-xl tracking-[0.02em] text-violet-200 backdrop-blur">
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
            <div className="mb-4 rounded-2xl border border-violet-200/10 bg-violet-200/[0.03] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-violet-100/60">Loading events</p>
              <SectionSkeleton tone="violet" rows={2} />
            </div>
          )}

          {featuredEvent && (
            (() => {
              const featuredEventQuality = getEntityQuality({
                targetType: "event",
                targetId: featuredEvent.id,
                entity: featuredEvent,
                map: qualityMap,
              });
              const featuredEventQualityStatus = getQualityStatus(featuredEventQuality);

              return (
            <div className="mb-4">
              <h3 className="mb-2 text-sm text-purple-400">Featured upcoming</h3>
              <div
                onClick={() => openEvent(featuredEvent)}
                role="button"
                tabIndex={0}
                aria-label={`Open event details for ${featuredEvent.name}`}
                onMouseEnter={() => setHoveredEventId(String(featuredEvent.id))}
                onMouseLeave={() => setHoveredEventId(null)}
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                    keyEvent.preventDefault();
                    openEvent(featuredEvent);
                  }
                }}
                className={`qa-cinematic-hover animate-rise-in relative cursor-pointer overflow-hidden rounded-[24px] border border-violet-300/16 bg-[linear-gradient(130deg,rgba(109,40,217,0.36),rgba(244,114,182,0.14),rgba(16,16,16,0.96))] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
                  String(hoveredEventId) === String(featuredEvent.id)
                    ? "border-violet-200/45 shadow-[0_24px_70px_rgba(139,92,246,0.22)]"
                    : ""
                } ${
                  isFocusMode && String(selectedEvent?.id) !== String(featuredEvent.id)
                    ? "opacity-55 saturate-75"
                    : ""
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-violet-300/18 blur-3xl" />
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{featuredEvent.name}</h3>
                  {normalizeEventRange(featuredEvent).startDate && (
                    <span className="rounded bg-purple-500 px-2 py-1 text-xs text-black">
                      {formatEventDateLabel(featuredEvent)}
                    </span>
                  )}
                </div>
                <p className="mb-2 line-clamp-2 text-sm leading-6 text-white/72">
                  {polishEventDescription(featuredEvent, cityName)}
                </p>
                {featuredEvent.vibe && (
                  <p className="mb-2 inline-flex rounded-full border border-amber-200/26 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                    Vibe: {featuredEvent.vibe}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-purple-200/90">Next notable event in this city</p>
                  <button
                    onClick={(clickEvent) =>
                      refreshEntityQuality(
                        { targetType: "event", targetId: featuredEvent.id, fallbackSource: featuredEvent.link || "" },
                        clickEvent
                      )
                    }
                    className={`rounded-full border px-2 py-0.5 text-[10px] transition hover:opacity-90 ${qualityPillClass(featuredEventQualityStatus.tone)}`}
                    aria-label={`Update quality status for event ${featuredEvent.name}`}
                  >
                    {featuredEventQualityStatus.label}
                  </button>
                </div>
                {featuredEventQuality.lastChecked && (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
                    Checked {formatDate(featuredEventQuality.lastChecked)}
                  </p>
                )}
                <div className="mt-3 h-1.5 w-28 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-200" />
              </div>
            </div>
              );
            })()
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
                  aria-label={`Open event details for ${event.name}`}
                  onMouseEnter={() => setHoveredEventId(String(event.id))}
                  onMouseLeave={() => setHoveredEventId(null)}
                  onKeyDown={(keyEvent) => {
                    if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                      keyEvent.preventDefault();
                      openEvent(event);
                    }
                  }}
                  className={`qa-cinematic-hover animate-rise-in mb-3 cursor-pointer rounded-[24px] border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/45 ${
                    String(selectedEvent?.id) === String(event.id)
                      ? "border-violet-200/24 bg-[linear-gradient(180deg,rgba(90,35,170,0.35),rgba(15,15,15,0.96))]"
                      : `border-violet-300/12 bg-[linear-gradient(180deg,rgba(34,24,46,0.82),rgba(15,15,15,0.96))] hover:border-violet-200/22 ${
                        isFocusMode ? "opacity-55 saturate-75" : ""
                      }`
                  } ${
                    String(hoveredEventId) === String(event.id)
                      ? "border-violet-200/45 shadow-[0_18px_48px_rgba(139,92,246,0.18)]"
                      : ""
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-semibold">{event.name}</h3>
                    {normalizeEventRange(event).startDate && (
                      <span className="rounded bg-purple-500 px-2 py-1 text-xs text-black">
                        {formatEventDateLabel(event)}
                      </span>
                    )}
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm leading-6 text-white/70">
                    {polishEventDescription(event, cityName)}
                  </p>
                  {event.vibe && (
                    <p className="mb-2 inline-flex rounded-full border border-amber-200/26 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                      Vibe: {event.vibe}
                    </p>
                  )}
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
                      aria-label={`Update quality status for event ${event.name}`}
                    >
                      {qualityStatus.label}
                    </button>
                  </div>
                  {quality.lastChecked && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/50">
                      Checked {formatDate(quality.lastChecked)}
                    </p>
                  )}
                </div>
              );
            })()
          ))}
          {!eventsLoading && !featuredEvent && remainingEvents.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-violet-200/22 bg-[linear-gradient(160deg,rgba(76,29,149,0.16),rgba(18,18,18,0.96))] px-5 py-8 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Event signal</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Event pulse is warming up</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
                This city&apos;s event lane is being refreshed. Check back soon, or add the first trusted event to kickstart the pulse.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollToSection(guideSectionRef)}
                  className="qa-cinematic-hover rounded-full border border-white/18 bg-white/7 px-4 py-2 text-xs text-white/80 hover:border-white/30 hover:text-white"
                >
                  Open guide lane
                </button>
                {isMember ? (
                  <button
                    type="button"
                    onClick={() => {
                      openEventContribution();
                    }}
                    className="qa-cinematic-hover rounded-full border border-violet-200/28 bg-violet-200/12 px-4 py-2 text-xs text-violet-100 hover:border-violet-200/46"
                  >
                    Publish first event
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      writeLocalValue("qa_redirect", pathname);
                      router.push("/?join=true");
                    }}
                    className="qa-cinematic-hover rounded-full border border-violet-200/28 bg-violet-200/12 px-4 py-2 text-xs text-violet-100 hover:border-violet-200/46"
                  >
                    Join to publish
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={guideSectionRef} className="animate-cinematic-in mb-10 rounded-[32px] border border-amber-200/10 bg-[linear-gradient(180deg,rgba(30,26,18,0.82),rgba(12,12,12,0.98))] p-6 shadow-[0_18px_52px_rgba(251,191,36,0.05)]" style={{ animationDelay: "250ms" }}>
          <h2 className="sticky top-0 z-20 -mx-2 mb-4 border-b border-amber-200/10 bg-[#050505]/92 px-2 py-3 text-xl tracking-[0.02em] text-amber-100 backdrop-blur">
            Quick Guide
          </h2>
          {placesLoading && (
            <div className="mb-4 rounded-2xl border border-amber-200/10 bg-amber-200/[0.03] p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.16em] text-amber-100/60">Loading guide signal</p>
              <SectionSkeleton tone="amber" rows={2} />
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
          <div className="grid gap-4 md:grid-cols-2">
            {config.guide.map((item, index) => {
              const guideTone =
                index % 4 === 0
                  ? {
                      card: "border-amber-200/20 bg-[linear-gradient(135deg,rgba(180,83,9,0.20),rgba(251,191,36,0.08),rgba(12,12,12,0.98))] hover:border-amber-200/34",
                      strip: "from-amber-300/90 via-orange-300/60 to-transparent",
                      type: "text-amber-100 border-amber-200/30 bg-amber-200/12",
                      vibe: "Night pulse",
                    }
                  : index % 4 === 1
                    ? {
                        card: "border-cyan-200/18 bg-[linear-gradient(180deg,rgba(14,48,64,0.36),rgba(12,12,12,0.98))] hover:border-cyan-200/30",
                        strip: "from-cyan-300/90 via-sky-300/60 to-transparent",
                        type: "text-cyan-100 border-cyan-200/30 bg-cyan-200/12",
                        vibe: "Local rhythm",
                      }
                    : index % 4 === 2
                      ? {
                          card: "border-violet-200/18 bg-[linear-gradient(180deg,rgba(47,28,78,0.34),rgba(12,12,12,0.98))] hover:border-violet-200/30",
                          strip: "from-violet-300/90 via-fuchsia-300/60 to-transparent",
                          type: "text-violet-100 border-violet-200/30 bg-violet-200/12",
                          vibe: "After-dark flow",
                        }
                      : {
                          card: "border-emerald-200/18 bg-[linear-gradient(180deg,rgba(16,70,52,0.34),rgba(12,12,12,0.98))] hover:border-emerald-200/30",
                          strip: "from-emerald-300/90 via-teal-300/60 to-transparent",
                          type: "text-emerald-100 border-emerald-200/30 bg-emerald-200/12",
                          vibe: "Soft start",
                        };
              return (
                <div
                  key={`${item.title}-${index}`}
                  className={`qa-cinematic-hover rounded-[24px] border p-5 ${guideTone.card} ${index === 0 ? "md:col-span-2" : ""}`}
                >
                  <div className={`mb-4 h-1.5 w-28 rounded-full bg-gradient-to-r ${guideTone.strip}`} />
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className={`${index === 0 ? "text-xl md:text-2xl" : "text-lg"} font-semibold leading-tight tracking-[-0.01em] text-white`}>
                        {item.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${guideTone.type}`}>
                          Guide
                        </span>
                        <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/72">
                          {guideTone.vibe}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-black/24 p-4">
                    <p className={`${index === 0 ? "text-sm leading-7" : "text-sm leading-6"} text-white/68`}>
                      {polishGuideText(item.text, {
                        sectionTitle: item.title,
                        cityName,
                        vibe: config.vibe,
                      })}
                    </p>
                  </div>

                  {item.extra && (
                    <p className="mt-4 text-xs uppercase tracking-[0.14em] text-white/42">{item.extra}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!placesLoading && !hasAnyPlaces && (
          <div className="mb-10 rounded-[30px] border border-dashed border-emerald-200/22 bg-[linear-gradient(150deg,rgba(6,78,59,0.20),rgba(17,17,17,0.96))] p-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Venue signal</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Venue map is taking shape</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/65">
              We&apos;re curating trusted drops for this city. Explore the guide lane now, or add a venue locals can rely on.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => scrollToSection(guideSectionRef)}
                className="qa-cinematic-hover rounded-full border border-white/18 bg-white/7 px-4 py-2 text-xs text-white/80 hover:border-white/30 hover:text-white"
                >
                  Read guide lane
                </button>
              {isMember ? (
                <button
                  type="button"
                  onClick={() => {
                    setAddMode(true);
                    setAddEventMode(false);
                  }}
                  className="qa-cinematic-hover rounded-full border border-emerald-200/28 bg-emerald-200/12 px-4 py-2 text-xs text-emerald-100 hover:border-emerald-200/45"
                >
                  Publish first venue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    writeLocalValue("qa_redirect", pathname);
                    router.push("/?join=true");
                  }}
                  className="qa-cinematic-hover rounded-full border border-emerald-200/28 bg-emerald-200/12 px-4 py-2 text-xs text-emerald-100 hover:border-emerald-200/45"
                >
                  Join to publish
                </button>
              )}
            </div>
          </div>
        )}

        {visiblePlaceGroups.map((group, groupIndex) => {
          return (
            <div ref={groupIndex === 0 ? placesSectionRef : null} key={group.value} className="animate-cinematic-in mb-10 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,17,17,0.96),rgba(10,10,10,0.99))] p-6 shadow-[0_18px_52px_rgba(0,0,0,0.24)]" style={{ animationDelay: `${300 + groupIndex * 40}ms` }}>
              <h2 className="sticky top-0 z-20 -mx-2 mb-6 border-b border-white/8 bg-[#050505]/92 px-2 py-3 text-lg tracking-wide text-white/82 backdrop-blur">
                {group.label}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {group.items.map((place, index) => (
                  (() => {
                    const style = TYPE_STYLES[place.type] || TYPE_STYLES.bar;
                    const isSelected = String(selectedPlace?.id) === String(place.id);
                    const isHovered = String(hoveredPlaceId) === String(place.id);
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
                    aria-label={`Open place details for ${place.name}`}
                    onMouseEnter={() => setHoveredPlaceId(String(place.id))}
                    onMouseLeave={() => setHoveredPlaceId(null)}
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                        keyEvent.preventDefault();
                        openPlace(place);
                      }
                    }}
                    style={{ animationDelay: `${Math.min(index * 45, 280)}ms` }}
                    className={`qa-cinematic-hover animate-rise-in relative cursor-pointer overflow-hidden rounded-[24px] border p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/45 ${
                      index === 0 ? "md:col-span-2" : ""
                    } ${
                      isFocusMode && !isSelected ? "opacity-60 saturate-75" : ""
                    } ${
                      isSelected
                        ? style.selected
                        : `${style.card} hover:border-white/16`
                    } ${
                      isHovered
                        ? "border-white/30 shadow-[0_20px_58px_rgba(255,255,255,0.12)]"
                        : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                    <div className={`mb-5 h-1.5 w-36 rounded-full bg-gradient-to-r ${style.line}`} />
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className={`${index === 0 ? "text-xl md:text-[1.65rem]" : "text-lg"} font-semibold leading-tight tracking-[-0.015em] text-white`}>{place.name}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border border-white/16 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${style.label}`}>
                            {TYPE_LABELS[place.type] || "Place"}
                          </span>
                          {place.vibe && (
                            <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/72">
                              {place.vibe}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(place.id);
                          }}
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            favorites.includes(String(place.id))
                              ? "border-pink-300/36 bg-gradient-to-r from-pink-300/20 to-fuchsia-300/16 text-pink-100"
                              : "border-white/14 bg-white/5 text-white/65 hover:border-pink-300/25 hover:text-pink-100"
                          }`}
                          aria-label={favorites.includes(String(place.id)) ? `Remove ${place.name} from favorites` : `Save ${place.name} to favorites`}
                          aria-pressed={favorites.includes(String(place.id))}
                        >
                          {favorites.includes(String(place.id)) ? "Saved" : "Save"}
                        </button>

                        <span className={`rounded-full border border-white/14 bg-black/45 px-3 py-1 text-xs font-semibold ${style.label}`}>
                          Rating {place.avgRating?.toFixed(1) || "-"}
                        </span>
                      </div>
                    </div>

                    {polishVenueDescription(place, cityName) && (
                      <div className="mb-4 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.52))] p-4">
                        <p className={`${index === 0 ? "line-clamp-4 text-sm leading-7" : "line-clamp-3 text-sm leading-6"} text-white/68`}>
                          {polishVenueDescription(place, cityName)}
                        </p>
                      </div>
                    )}

                    <div className="mb-4 rounded-2xl border border-cyan-200/14 bg-cyan-200/[0.07] p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/75">Opening Hours</p>
                      <p className="mt-1 text-xs leading-6 text-cyan-50/90">
                        {String(place.hours || "").trim() || "Hours vary by night. Check official channels before going."}
                      </p>
                    </div>
                    {place.link && (
                      <div className="mb-4">
                        <a
                          href={normalizeExternalUrl(place.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex items-center rounded-full border border-cyan-200/18 bg-cyan-200/[0.08] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/34"
                        >
                          Official Link
                        </a>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {place.reviewCount || 0} reviews
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(clickEvent) =>
                            refreshEntityQuality(
                              { targetType: "place", targetId: place.id, fallbackSource: "" },
                              clickEvent
                            )
                          }
                          className={`rounded-full border px-2.5 py-1 text-[11px] transition hover:opacity-90 ${qualityPillClass(qualityStatus.tone)}`}
                          aria-label={`Update quality status for place ${place.name}`}
                        >
                          {qualityStatus.label}
                        </button>
                        <span>{group.label}</span>
                      </div>
                    </div>
                    {quality.lastChecked && (
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/50">
                        Checked {formatDate(quality.lastChecked)}
                      </p>
                    )}
                  </div>
                    );
                  })()
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {(selectedPlace || selectedEvent) && (
        <button
          type="button"
          aria-label="Close details panel"
          onClick={() => {
            if (selectedPlace) closePlace();
            if (selectedEvent) closeEvent();
          }}
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {selectedPlace && (
        <div onWheel={handleDesktopPanelWheel} className="animate-panel-in fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border border-white/10 border-b-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.08),transparent_22%),linear-gradient(180deg,rgba(17,17,17,0.98),rgba(10,10,10,1))] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)] backdrop-blur lg:relative lg:inset-auto lg:w-[520px] lg:max-h-none lg:overflow-visible lg:overscroll-auto lg:rounded-none lg:border-b-0 lg:border-l lg:border-r-0 lg:border-t-0 lg:pb-6 lg:shadow-[-24px_0_80px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />
          <button className="sticky top-0 z-20 qa-cinematic-hover rounded-full border border-white/14 bg-[#0e0e0e]/90 px-4 py-2.5 text-sm text-white/80 backdrop-blur hover:border-white/25 hover:text-white" onClick={closePlace}>
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
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/60">
              Address: {getEntityAddressLabel(selectedPlace)}
            </p>
            <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-fuchsia-300" />
            {polishVenueDescription(selectedPlace, cityName) && (
              <div className="mb-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm leading-relaxed text-white/68">{polishVenueDescription(selectedPlace, cityName)}</p>
              </div>
            )}
            <div className="mb-2 rounded-xl border border-cyan-200/14 bg-cyan-200/[0.07] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/75">Opening Hours</p>
              <p className="mt-1 text-xs leading-6 text-cyan-50/90">
                {String(selectedPlace.hours || "").trim() || "Hours vary by night. Check official channels before going."}
              </p>
            </div>
            {selectedPlace.link && (
              <a
                href={normalizeExternalUrl(selectedPlace.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 inline-flex items-center rounded-full border border-cyan-200/18 bg-cyan-200/[0.08] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/34"
              >
                Official Link
              </a>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Rating</p>
                <p className="mt-1 text-sm text-white/84">{selectedPlace.avgRating?.toFixed(1) || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Reviews</p>
                <p className="mt-1 text-sm text-white/84">{selectedPlace.reviewCount || 0}</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-fuchsia-200/18 bg-fuchsia-200/[0.07] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/80">Live vibe now</p>
                <span className="rounded-full border border-fuchsia-200/20 bg-fuchsia-200/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-fuchsia-100/80">
                  {liveVibeSummary.total} signal{liveVibeSummary.total === 1 ? "" : "s"} - 6h
                </span>
              </div>
              <p className="mt-1 text-sm text-fuchsia-50/95">{liveVibeHeadline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${liveVibePulse.className}`}
                >
                  {liveVibePulse.label}
                </span>
                {liveVibeConsensus > 0 && (
                  <span className="rounded-full border border-white/18 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/80">
                    {liveVibeConsensus}% consensus
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-[0.12em] text-fuchsia-100/68">
                  {liveVibePulse.hint}
                </span>
              </div>
              {liveVibeUpdatedLabel && (
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/70">
                  {liveVibeUpdatedLabel}
                </p>
              )}
              {liveVibeSummary.total === 0 && !liveVibeTableMissing && (
                <button
                  type="button"
                  onClick={() => handleSubmitLiveVibe("packed")}
                  disabled={isSubmittingLiveVibe}
                  className="mt-2 rounded-full border border-fuchsia-200/28 bg-fuchsia-200/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-200/48 disabled:opacity-60"
                >
                  Be first now
                </button>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {LIVE_VIBE_OPTIONS.map((option) => {
                  const count = liveVibeSummary.countsByKey?.[option.key] || 0;
                  return (
                    <button
                      key={`live-vibe-${option.key}`}
                      type="button"
                      disabled={isSubmittingLiveVibe || liveVibeTableMissing}
                      onClick={() => {
                        handleSubmitLiveVibe(option.key);
                      }}
                      className={`qa-cinematic-hover rounded-xl border px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${option.buttonClass}`}
                    >
                      <span className="block text-sm font-semibold">
                        {option.emoji} {option.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] opacity-85">
                        {count} tap{count === 1 ? "" : "s"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {isLoadingLiveVibe && (
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-fuchsia-100/65">Loading live vibe...</p>
              )}
              {!!liveVibeError && (
                <p className="mt-2 text-xs text-rose-100">{liveVibeError}</p>
              )}
              {liveVibeTableMissing && (
                <p className="mt-2 text-xs text-amber-100">
                  Live vibe table is not activated yet. Run the SQL setup block first.
                </p>
              )}
              <p className="mt-2 text-[11px] text-fuchsia-100/76">
                One tap updates the room signal for everyone right now.
              </p>
              {liveVibeCooldownRemainingSec > 0 && (
                <p className="mt-1 text-[11px] text-cyan-100/85">
                  Cooldown active: {liveVibeCooldownRemainingSec}s
                </p>
              )}
              {isMember && (
                <div className="mt-2 rounded-xl border border-white/12 bg-white/[0.05] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/62">Your momentum</p>
                    <button
                      type="button"
                      onClick={() => setShowLiveVibeMomentum((value) => !value)}
                      className="rounded-full border border-white/16 bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/78 transition hover:border-white/28"
                    >
                      {showLiveVibeMomentum ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showLiveVibeMomentum && (
                    <>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/82">
                        <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5">
                          {liveVibeMemberMomentum.streakDays}d streak
                        </span>
                        <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5">
                          {liveVibeMemberMomentum.weekTaps} taps / 7d
                        </span>
                        <span className="rounded-full border border-white/14 bg-white/8 px-2 py-0.5">
                          {liveVibeMemberMomentum.todayTapped ? "Tapped today" : "No tap today"}
                        </span>
                        {liveVibeMemberMomentum.lastTapLabel && (
                          <span className="text-white/64">Last: {liveVibeMemberMomentum.lastTapLabel}</span>
                        )}
                      </div>
                      {liveVibeStreakNudge && (
                        <p
                          className={`mt-1.5 text-[11px] ${
                            liveVibeMemberMomentum.todayTapped ? "text-emerald-100/85" : "text-amber-100/88"
                          }`}
                        >
                          {liveVibeStreakNudge}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
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
                    Source added
                  </span>
                )}
              </div>
            )}
            {trustedPlaceSavesCount > 0 && (
              <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200/24 bg-emerald-200/[0.10] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100">
                Saved by {trustedPlaceSavesCount} trusted member{trustedPlaceSavesCount > 1 ? "s" : ""}
              </div>
            )}
            {isAdmin && (
              <div className="mt-3 rounded-2xl border border-amber-200/18 bg-amber-200/[0.08] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/82">Admin controls</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaceAdminOpen((value) => !value);
                      setPlaceAdminDraft(buildPlaceAdminDraft(selectedPlace));
                    }}
                    className="rounded-full border border-amber-100/30 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-100/50"
                  >
                    {placeAdminOpen ? "Close editor" : "Edit venue"}
                  </button>
                </div>

                {placeAdminOpen && (
                  <div className="mt-3 space-y-2">
                    <input
                      value={placeAdminDraft.name}
                      onChange={(event) => setPlaceAdminDraft((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Venue name"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <select
                      value={placeAdminDraft.type}
                      onChange={(event) => setPlaceAdminDraft((current) => ({ ...current, type: event.target.value }))}
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    >
                      {TYPES.map((item) => (
                        <option key={`admin-place-type-${item.value}`} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={placeAdminDraft.description}
                      onChange={(event) => setPlaceAdminDraft((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Description"
                      className="min-h-[95px] w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <input
                      value={placeAdminDraft.vibe}
                      onChange={(event) => setPlaceAdminDraft((current) => ({ ...current, vibe: event.target.value }))}
                      placeholder="Vibe"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <input
                      value={placeAdminDraft.location}
                      onChange={(event) => setPlaceAdminDraft((current) => ({ ...current, location: event.target.value }))}
                      placeholder="Address / location (updates map pin)"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <button
                      type="button"
                      onClick={handleAdminSavePlaceAddressOnly}
                      disabled={isSavingPlaceAddressOnly}
                      className="w-full rounded-xl border border-cyan-200/30 bg-cyan-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/55 disabled:opacity-60"
                    >
                      {isSavingPlaceAddressOnly ? "Saving address..." : "Save address only"}
                    </button>
                    <input
                      value={placeAdminDraft.hours}
                      onChange={(event) => setPlaceAdminDraft((current) => ({ ...current, hours: event.target.value }))}
                      placeholder="Opening hours"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <input
                      value={placeAdminDraft.link}
                      onChange={(event) => setPlaceAdminDraft((current) => ({ ...current, link: event.target.value }))}
                      placeholder="Official link"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleAdminSavePlace}
                        disabled={isSavingPlaceAdmin}
                        className="rounded-xl border border-emerald-200/30 bg-emerald-200/16 px-3 py-2 text-xs uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/55 disabled:opacity-60"
                      >
                        {isSavingPlaceAdmin ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleAdminDeletePlace}
                        disabled={isDeletingPlaceAdmin}
                        className="rounded-xl border border-rose-200/30 bg-rose-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/55 disabled:opacity-60"
                      >
                        {isDeletingPlaceAdmin ? "Deleting..." : "Delete venue"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() =>
                handleReport({
                  targetType: "place",
                  targetId: selectedPlace.id,
                  title: selectedPlace.name,
                })
              }
              className="qa-cinematic-hover rounded-full border border-rose-200/20 bg-rose-200/8 px-4 py-2.5 text-xs text-rose-100 hover:border-rose-200/35 hover:bg-rose-200/12"
              aria-label={`Report place ${selectedPlace.name}`}
            >
              Report issue
            </button>
            <button
              onClick={() => toggleFavorite(selectedPlace.id)}
              className={`qa-cinematic-hover rounded-full border px-4 py-2.5 text-xs ${
                favorites.includes(String(selectedPlace.id))
                  ? "border-pink-300/30 bg-pink-300/12 text-pink-100"
                  : "border-white/12 bg-white/6 text-white/70 hover:border-white/20 hover:text-white"
              }`}
              aria-label={favorites.includes(String(selectedPlace.id)) ? `Remove ${selectedPlace.name} from favorites` : `Save ${selectedPlace.name} to favorites`}
              aria-pressed={favorites.includes(String(selectedPlace.id))}
            >
              {favorites.includes(String(selectedPlace.id)) ? "Saved in atlas" : "Save to atlas"}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleAdminDeletePlace}
                disabled={isDeletingPlaceAdmin}
                className="qa-cinematic-hover rounded-full border border-rose-200/25 bg-rose-200/12 px-4 py-2.5 text-xs text-rose-100 hover:border-rose-200/45 disabled:opacity-60"
                aria-label={`Delete venue ${selectedPlace.name}`}
              >
                {isDeletingPlaceAdmin ? "Deleting..." : "Delete venue"}
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {reviews.map((review) => {
              const titleMeta = getMemberTitleMeta(review.memberTitle);
              return (
                <div key={review.id} className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-white/85">{review.authorName || "Member"}</p>
                      {review.memberTitle && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${titleMeta.className}`}
                        >
                          <span>{titleMeta.icon}</span>
                          {titleMeta.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-[0.14em] text-yellow-300/90">Rating {review.rating}/5</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-200">{review.comment}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/45">Add your review</p>
            {!isMember && (
              <div className="mb-3 rounded-2xl border border-amber-300/20 bg-amber-200/10 p-3">
                <p className="text-sm text-amber-100">
                  Log in as member to add reviews and strengthen quality signal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const redirectTarget = buildSelectionUrl({
                      nextPlaceId: selectedPlace.id,
                      nextEventId: null,
                    });
                    writeLocalValue("qa_redirect", redirectTarget);
                    writeLocalValue("qa_post_login_target", redirectTarget);
                    router.push("/?join=true");
                  }}
                  className="mt-3 rounded-full border border-amber-200/28 bg-amber-200/14 px-4 py-2 text-xs text-amber-100 transition hover:border-amber-200/45"
                >
                  Join to review
                </button>
              </div>
            )}
            <div className={`mb-3 flex items-center gap-1 ${!isMember || !canReviewSelectedPlace ? "hidden" : ""}`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmittingReview}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  aria-label={`Set rating to ${star} star${star > 1 ? "s" : ""}`}
                  aria-pressed={rating === star}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-2xl transition ${
                    (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-600"
                  } ${isSubmittingReview ? "opacity-60" : "hover:bg-white/8"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              disabled={!isMember || !canReviewSelectedPlace || isSubmittingReview}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share vibe, safety, crowd energy, music, and what to expect."
              className={`mb-2 min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/40 p-3 ${
                !isMember || !canReviewSelectedPlace ? "hidden" : ""
              }`}
            />

            <button
              disabled={!isMember || !canReviewSelectedPlace || isSubmittingReview}
              onClick={async () => {
                const trimmedComment = comment.trim();
                if (!trimmedComment) {
                  showToast("Write a short comment before submitting.", {
                    tone: "warn",
                    duration: 2200,
                  });
                  return;
                }

                setIsSubmittingReview(true);
                try {
                  const result = await addReview({
                    placeId: selectedPlace.id,
                    place: selectedPlace,
                    rating,
                    comment: trimmedComment,
                  });

                  if (!result?.ok) {
                    showToast("Could not submit review right now.", {
                      tone: "warn",
                      duration: 2400,
                    });
                    return;
                  }

                  setComment("");
                  setRating(5);
                  const updated = await getReviews(selectedPlace.id, selectedPlace);
                  setReviews(updated);
                  trackKpiEvent("review_submitted", {
                    city,
                    targetType: "place",
                    targetId: String(selectedPlace.id || ""),
                    memberKey: String(user?.email || memberName || "").trim().toLowerCase(),
                  });
                  showToast("Review submitted.", { tone: "ok", duration: 1800 });
                } finally {
                  setIsSubmittingReview(false);
                }
              }}
              className={`qa-cinematic-hover w-full rounded-2xl bg-white py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60 ${
                !isMember || !canReviewSelectedPlace ? "hidden" : ""
              }`}
            >
              {isSubmittingReview ? "Submitting..." : "Submit review"}
            </button>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div onWheel={handleDesktopPanelWheel} className="animate-panel-in fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto overscroll-contain rounded-t-[24px] border border-white/10 border-b-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.10),transparent_26%),linear-gradient(180deg,rgba(21,17,32,0.98),rgba(10,10,10,1))] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-20px_70px_rgba(0,0,0,0.45)] backdrop-blur lg:relative lg:inset-auto lg:w-[520px] lg:max-h-none lg:overflow-visible lg:overscroll-auto lg:rounded-none lg:border-b-0 lg:border-l lg:border-r-0 lg:border-t-0 lg:pb-6 lg:shadow-[-24px_0_80px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute right-[-60px] top-8 h-44 w-44 rounded-full bg-violet-400/14 blur-3xl" />
          <button className="sticky top-0 z-20 qa-cinematic-hover rounded-full border border-white/14 bg-[#111021]/90 px-4 py-2.5 text-sm text-white/80 backdrop-blur hover:border-white/25 hover:text-white" onClick={closeEvent}>
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
              {normalizeEventRange(selectedEvent).startDate && (
                <span className="rounded-full border border-violet-200/24 bg-violet-200/12 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-violet-100">
                  {formatEventDateLabel(selectedEvent)}
                </span>
              )}
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-[-0.02em]">{selectedEvent.name}</h2>
            {selectedEvent.vibe && (
              <p className="mb-2 inline-flex rounded-full border border-amber-200/26 bg-amber-200/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-amber-100">
                Vibe: {selectedEvent.vibe}
              </p>
            )}
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/60">
              Address: {getEntityAddressLabel(selectedEvent)}
            </p>
            <div className="mb-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200" />
            {polishEventDescription(selectedEvent, cityName) && (
              <div className="mb-1 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-white/45">About event</p>
                <p className="text-sm leading-relaxed text-white/68">{polishEventDescription(selectedEvent, cityName)}</p>
              </div>
            )}
            {(selectedEvent.link || selectedEventQuality?.lastChecked || selectedEventQuality?.source) && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selectedEvent.link && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Link</p>
                    <p className="mt-1 text-xs text-white/78">Official event link available</p>
                  </div>
                )}
                {selectedEventQuality?.lastChecked && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Last checked</p>
                    <p className="mt-1 text-xs text-white/78">{formatDate(selectedEventQuality.lastChecked)}</p>
                  </div>
                )}
                {selectedEventQuality?.source && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Source note</p>
                    <p className="mt-1 text-xs text-white/78 line-clamp-2">{selectedEventQuality.source}</p>
                  </div>
                )}
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
              </div>
            )}
            {trustedEventSavesCount > 0 && (
              <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200/24 bg-emerald-200/[0.10] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-emerald-100">
                Saved by {trustedEventSavesCount} trusted member{trustedEventSavesCount > 1 ? "s" : ""}
              </div>
            )}
            {isAdmin && (
              <div className="mt-3 rounded-2xl border border-amber-200/18 bg-amber-200/[0.08] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-amber-100/82">Admin controls</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEventAdminOpen((value) => !value);
                      setEventAdminDraft(buildEventAdminDraft(selectedEvent));
                    }}
                    className="rounded-full border border-amber-100/30 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100 transition hover:border-amber-100/50"
                  >
                    {eventAdminOpen ? "Close editor" : "Edit event"}
                  </button>
                </div>

                {eventAdminOpen && (
                  <div className="mt-3 space-y-2">
                    <input
                      value={eventAdminDraft.name}
                      onChange={(event) => setEventAdminDraft((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Event name"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <DateInput
                        value={eventAdminDraft.startDate}
                        onChange={(event) => setEventAdminDraft((current) => ({ ...current, startDate: event.target.value }))}
                        placeholder="From"
                      />
                      <DateInput
                        value={eventAdminDraft.endDate}
                        onChange={(event) => setEventAdminDraft((current) => ({ ...current, endDate: event.target.value }))}
                        placeholder="To"
                      />
                    </div>
                    <input
                      value={eventAdminDraft.vibe}
                      onChange={(event) => setEventAdminDraft((current) => ({ ...current, vibe: event.target.value }))}
                      placeholder="Vibe"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <input
                      value={eventAdminDraft.location}
                      onChange={(event) => setEventAdminDraft((current) => ({ ...current, location: event.target.value }))}
                      placeholder="Address / location (area / venue / neighborhood)"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <button
                      type="button"
                      onClick={handleAdminSaveEventAddressOnly}
                      disabled={isSavingEventAddressOnly}
                      className="w-full rounded-xl border border-cyan-200/30 bg-cyan-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-200/55 disabled:opacity-60"
                    >
                      {isSavingEventAddressOnly ? "Saving address..." : "Save address only"}
                    </button>
                    <textarea
                      value={eventAdminDraft.description}
                      onChange={(event) => setEventAdminDraft((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Description"
                      className="min-h-[95px] w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <input
                      value={eventAdminDraft.link}
                      onChange={(event) => setEventAdminDraft((current) => ({ ...current, link: event.target.value }))}
                      placeholder="Official link"
                      className="w-full rounded-xl border border-white/14 bg-black/45 px-3 py-2 text-sm outline-none focus:border-amber-100/50"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleAdminSaveEvent}
                        disabled={isSavingEventAdmin}
                        className="rounded-xl border border-emerald-200/30 bg-emerald-200/16 px-3 py-2 text-xs uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/55 disabled:opacity-60"
                      >
                        {isSavingEventAdmin ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={handleAdminDeleteEvent}
                        disabled={isDeletingEventAdmin}
                        className="rounded-xl border border-rose-200/30 bg-rose-200/14 px-3 py-2 text-xs uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/55 disabled:opacity-60"
                      >
                        {isDeletingEventAdmin ? "Deleting..." : "Delete event"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <button
              onClick={() => toggleFavorite(`event-${selectedEvent.id}`)}
              className={`qa-cinematic-hover w-full rounded-2xl border px-4 py-3 text-sm ${
                favorites.includes(`event-${selectedEvent.id}`)
                  ? "border-pink-300/30 bg-pink-300/12 text-pink-100"
                  : "border-white/12 bg-white/6 text-white/70 hover:border-white/20 hover:text-white"
              }`}
              aria-label={favorites.includes(`event-${selectedEvent.id}`) ? `Remove ${selectedEvent.name} from favorites` : `Save ${selectedEvent.name} to favorites`}
              aria-pressed={favorites.includes(`event-${selectedEvent.id}`)}
            >
              {favorites.includes(`event-${selectedEvent.id}`) ? "Saved in atlas" : "Save to atlas"}
            </button>
            {selectedEvent.link && (
              <a
                href={selectedEvent.link}
                target="_blank"
                rel="noreferrer"
                className="qa-cinematic-hover block w-full rounded-2xl bg-gradient-to-r from-violet-300 to-fuchsia-200 py-3 text-center font-semibold text-black"
              >
                Open official link
              </a>
            )}

            <button
              onClick={showEventOnMap}
              className="qa-cinematic-hover w-full rounded-2xl border border-white/10 bg-white/5 py-3"
            >
              Show on map
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleAdminDeleteEvent}
                disabled={isDeletingEventAdmin}
                className="qa-cinematic-hover w-full rounded-2xl border border-rose-200/25 bg-rose-200/12 py-3 text-sm text-rose-100 hover:border-rose-200/45 disabled:opacity-60"
                aria-label={`Delete event ${selectedEvent.name}`}
              >
                {isDeletingEventAdmin ? "Deleting..." : "Delete event"}
              </button>
            )}
            <button
              onClick={() =>
                handleReport({
                  targetType: "event",
                  targetId: selectedEvent.id,
                  title: selectedEvent.name,
                })
              }
              className="qa-cinematic-hover w-full rounded-2xl border border-rose-200/20 bg-rose-200/8 py-3 text-sm text-rose-100 hover:border-rose-200/35 hover:bg-rose-200/12"
              aria-label={`Report event ${selectedEvent.name}`}
            >
              Report issue
            </button>
          </div>
        </div>
      )}

      {reportModalOpen && (
        <div className="fixed inset-0 z-[91] overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-6">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-rose-200/22 bg-[linear-gradient(165deg,rgba(64,18,38,0.88),rgba(11,11,11,0.98))] shadow-[0_28px_120px_rgba(0,0,0,0.58)]">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-rose-100/75">Safety report</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Report {reportDraft.targetType}</h3>
              <p className="mt-1 text-sm text-white/70 line-clamp-1">{reportDraft.title}</p>
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
                        <p className="mt-1 text-xs text-white/65">{item.helper}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-white/58" htmlFor="report-details">
                  What is wrong?
                </label>
                <textarea
                  id="report-details"
                  value={reportDraft.details}
                  onChange={(event) => setReportDraft((current) => ({ ...current, details: event.target.value }))}
                  placeholder="Example: venue is closed, link is dead, or safety issue happened around 01:30 near entrance..."
                  className="mt-2 min-h-[116px] w-full rounded-2xl border border-white/14 bg-black/40 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-rose-200/45"
                />
                <p className="mt-2 text-xs text-white/52">This note goes directly to admin moderation inbox.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
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
                  <label className="text-xs uppercase tracking-[0.18em] text-white/58" htmlFor="city-quality-source">
                    Source note (optional)
                  </label>
                  <input
                    id="city-quality-source"
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
    </main>
  );
}

