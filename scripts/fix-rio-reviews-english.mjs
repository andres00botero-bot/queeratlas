import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const CITY = "rio_de_janeiro";

const ENGLISH_BY_ALIAS = {
  CariocaComet:
    "Perfect launch point in Ipanema. Great mix of locals and travelers, and it is easy to meet people naturally.",
  JetLagJungle:
    "The DJ pacing built the night nicely. Not the biggest room, but the energy stayed warm and social.",
  LapaLantern:
    "Prices felt fair for the area and bar service was quick. Excellent pre-club vibe.",
  VelvetMarujo:
    "Classic Copacabana feeling with a more mature crowd and a relaxed atmosphere. Great to see a historic venue still thriving.",
  NoiteAtlas:
    "Campy in the best way. Good music blend and people were open and friendly all night.",
  SunsetSignal:
    "Great from daytime into evening. The beachfront view carries the whole experience, perfect for a relaxed check-in.",
  CopacabanaCode:
    "Strong stop before nightlife. Chill crowd, great people-watching, and easy to connect with other queer travelers.",
  DragDrift:
    "The drag performances were genuinely strong and the crowd was fully engaged from the start. High energy without chaos.",
  NeonCaju:
    "Younger crowd and very pop-forward. Good sound, good dance floor, and a safe vibe even when packed.",
  MoonRua:
    "One of my most fun nights in Rio. Easy to dance for hours and strong flow between stage and bar.",
  IpanemaPulse:
    "Great cocktails and social atmosphere. Worked perfectly as a relaxed start that turned into a full night.",
  RuaRhythm:
    "Small venue but excellent community feel. People were respectful and easy to talk to all evening.",
  WarehouseWink:
    "Big-club feel with strong lighting production. When the floor filled up, peak-time energy was excellent.",
  BassCarioca:
    "Great option when you want full scale and late closing. Mixed crowd and dance-first energy.",
  NightHarbor:
    "One of the few places in Rio that really delivers large-format queer club energy. Ideal for late endings.",
  PrincesaPilot:
    "Great pre-game spot in Copacabana. Easy to find and the crowd was open to new faces.",
  MetroMango:
    "Nice balance between bar socializing and dancing. It felt local and authentic, not touristy.",
  SiqueiraSpin:
    "Good dance floor and clear club profile. Music was pop-heavy but kept momentum all night.",
  CopacabanaCircuit:
    "Very good late-night stop. Good crowd flow, smooth entry, and easy to keep your group together.",
  SteamVector:
    "Well-organized venue with clear zones. Staff was helpful and the space felt clean and safe.",
  SaunaOrbit:
    "Solid Ipanema option when you want something different from bars and clubs. Smooth check-in and respectful crowd.",
};

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

function parseAlias(comment = "") {
  const match = String(comment || "").match(/^\[([^\]]+)\]\s*/);
  return match ? match[1] : "";
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
    .select("id")
    .eq("city", CITY);
  if (placesError) throw placesError;

  const placeIds = (places || []).map((p) => p.id);
  if (placeIds.length === 0) {
    console.log(JSON.stringify({ city: CITY, updated: 0, note: "No places found" }, null, 2));
    return;
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id,place_id,comment")
    .in("place_id", placeIds);
  if (reviewsError) throw reviewsError;

  let updated = 0;
  for (const review of reviews || []) {
    const alias = parseAlias(review.comment);
    if (!alias) continue;
    const english = ENGLISH_BY_ALIAS[alias];
    if (!english) continue;
    const nextComment = `[${alias}] ${english}`;
    if (String(review.comment || "").trim() === nextComment) continue;

    const { error: updateError } = await supabase
      .from("reviews")
      .update({ comment: nextComment })
      .eq("id", review.id);
    if (updateError) throw updateError;
    updated += 1;
  }

  const { data: remaining, error: remainingError } = await supabase
    .from("reviews")
    .select("id,comment")
    .in("place_id", placeIds);
  if (remainingError) throw remainingError;

  const swedishLikeCount = (remaining || []).filter((row) => /[åäöÅÄÖ]/.test(String(row.comment || ""))).length;

  console.log(
    JSON.stringify(
      {
        city: CITY,
        updated,
        swedishLikeCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("fix-rio-reviews-english failed:", error?.message || error);
  process.exit(1);
});

