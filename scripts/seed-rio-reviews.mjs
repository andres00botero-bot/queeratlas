import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const RIO_CITY = "rio_de_janeiro";

const RIO_VENUE_REVIEWS = [
  {
    name: "Galeria Cafe",
    targetCount: 3,
    reviews: [
      {
        alias: "CariocaComet",
        rating: 5,
        comment:
          "Perfekt startpunkt i Ipanema. Bra mix av locals och resenärer, lätt att börja snacka med folk utan att det känns stelt.",
      },
      {
        alias: "JetLagJungle",
        rating: 4,
        comment:
          "DJ-setet byggde upp kvällen snyggt. Inte den största lokalen, men energin var varm och social hela natten.",
      },
      {
        alias: "LapaLantern",
        rating: 5,
        comment:
          "Prisnivån var rimlig för området och personalen var snabb i baren. Väldigt bra pre-club-vibe.",
      },
    ],
  },
  {
    name: "Boate La Cueva",
    targetCount: 2,
    reviews: [
      {
        alias: "VelvetMarujo",
        rating: 4,
        comment:
          "Klassisk Copacabana-känsla med äldre crowd och skön stämning. Kul att se en venue med historia som fortfarande lever.",
      },
      {
        alias: "NoiteAtlas",
        rating: 5,
        comment:
          "Lite kitsch på bästa sätt. Bra musikmix och folk var öppna och trevliga, lätt att känna sig inkluderad.",
      },
    ],
  },
  {
    name: "Rainbow Kiosk",
    targetCount: 2,
    reviews: [
      {
        alias: "SunsetSignal",
        rating: 4,
        comment:
          "Toppen för dag till kväll. Utsikten över stranden gör hela upplevelsen, perfekt för en avslappnad check-in.",
      },
      {
        alias: "CopacabanaCode",
        rating: 5,
        comment:
          "Bra stopp innan nattlivet. Chill crowd, bra people-watching och lätt att träffa andra queer-resenärer.",
      },
    ],
  },
  {
    name: "Pink Flamingo",
    targetCount: 3,
    reviews: [
      {
        alias: "DragDrift",
        rating: 5,
        comment:
          "Dragnummerna var riktigt starka och publiken var med från första sekund. Hög energi utan att bli kaotiskt.",
      },
      {
        alias: "NeonCaju",
        rating: 4,
        comment:
          "Yngre crowd och mycket pop. Bra ljud, bra golv, och trygg känsla även när det blev fullt.",
      },
      {
        alias: "MoonRua",
        rating: 5,
        comment:
          "En av de roligaste kvällarna jag haft i Rio. Lätt att dansa hela natten och bra flow mellan scen och bar.",
      },
    ],
  },
  {
    name: "Silencio",
    targetCount: 2,
    reviews: [
      {
        alias: "IpanemaPulse",
        rating: 4,
        comment:
          "Bra cocktails och social stämning. Funkade perfekt för en lugn start som senare blev en hel kväll.",
      },
      {
        alias: "RuaRhythm",
        rating: 5,
        comment:
          "Liten venue men väldigt bra community-känsla. Folk var respektfulla och snackvänliga hela kvällen.",
      },
    ],
  },
  {
    name: "The Home - Rio",
    targetCount: 3,
    reviews: [
      {
        alias: "WarehouseWink",
        rating: 5,
        comment:
          "Stor klubbkänsla med bra ljusproduktion. När golvet fylldes blev det riktigt stark peak-time energi.",
      },
      {
        alias: "BassCarioca",
        rating: 4,
        comment:
          "Bra alternativ när man vill ha full skala och sent stängning. Crowd var blandad och dansfokuserad.",
      },
      {
        alias: "NightHarbor",
        rating: 5,
        comment:
          "En av få venues i Rio där man verkligen känner storstadsklubb. Perfekt om man vill avsluta sent.",
      },
    ],
  },
  {
    name: "Black Cat",
    targetCount: 2,
    reviews: [
      {
        alias: "PrincesaPilot",
        rating: 4,
        comment:
          "Bra pre-game-spot i Copacabana. Enkel att hitta och crowden var öppen för nya ansikten.",
      },
      {
        alias: "MetroMango",
        rating: 5,
        comment:
          "Bra balans mellan barhäng och dans. Kändes lokalt och genuint snarare än turistigt.",
      },
    ],
  },
  {
    name: "Club Point 202",
    targetCount: 2,
    reviews: [
      {
        alias: "SiqueiraSpin",
        rating: 4,
        comment:
          "Bra dansgolv och tydlig klubbprofil. Musikvalet var pop-heavy men höll tempot uppe hela kvällen.",
      },
      {
        alias: "CopacabanaCircuit",
        rating: 5,
        comment:
          "Riktigt bra senkvällsstopp. Bra crowd flow, trygg entré och lätt att hålla ihop gruppen.",
      },
    ],
  },
  {
    name: "Rio G SPA Men's Club",
    targetCount: 2,
    reviews: [
      {
        alias: "SteamVector",
        rating: 4,
        comment:
          "Välorganiserad venue med tydliga zoner. Personalen var hjälpsam och det kändes rent och säkert.",
      },
      {
        alias: "SaunaOrbit",
        rating: 5,
        comment:
          "Bra facilitet i Ipanema när man vill ha något annat än bar/klubb. Smidig incheckning och respektfull crowd.",
      },
    ],
  },
];

function readDotEnvLocal(cwd) {
  const envPath = path.join(cwd, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function normalizeName(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function main() {
  readDotEnvLocal(process.cwd());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select("id,name,city")
    .eq("city", RIO_CITY);
  if (placesError) throw placesError;

  const placeByName = new Map((places || []).map((p) => [normalizeName(p.name), p]));

  const { data: existingReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id,place_id,comment");
  if (reviewsError) throw reviewsError;

  const reviewsByPlaceId = new Map();
  for (const row of existingReviews || []) {
    const key = String(row.place_id || "");
    if (!key) continue;
    if (!reviewsByPlaceId.has(key)) reviewsByPlaceId.set(key, []);
    reviewsByPlaceId.get(key).push(String(row.comment || ""));
  }

  const rowsToInsert = [];
  const missingVenues = [];
  for (const venue of RIO_VENUE_REVIEWS) {
    const place = placeByName.get(normalizeName(venue.name));
    if (!place) {
      missingVenues.push(venue.name);
      continue;
    }

    const placeId = String(place.id);
    const existingComments = reviewsByPlaceId.get(placeId) || [];
    const existingCount = existingComments.length;
    const needed = Math.max(0, venue.targetCount - existingCount);
    if (needed === 0) continue;

    const existingCommentSet = new Set(existingComments.map((c) => c.trim()));
    let addedForVenue = 0;
    for (const candidate of venue.reviews) {
      if (addedForVenue >= needed) break;
      const body = `[${candidate.alias}] ${candidate.comment}`.trim();
      if (existingCommentSet.has(body)) continue;
      rowsToInsert.push({
        place_id: place.id,
        rating: candidate.rating,
        comment: body,
      });
      existingCommentSet.add(body);
      addedForVenue += 1;
    }
  }

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("reviews").insert(rowsToInsert);
    if (insertError) throw insertError;
  }

  console.log(
    JSON.stringify(
      {
        city: RIO_CITY,
        venuesInDb: (places || []).length,
        insertedReviews: rowsToInsert.length,
        missingVenues,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("seed-rio-reviews failed:", error?.message || error);
  process.exit(1);
});

