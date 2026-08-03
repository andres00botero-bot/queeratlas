import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const fields = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];

async function fetchAll() {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase
      .from("places")
      .select("id,name,city,type,description,vibe,hours,location,link,venue_intel")
      .order("id", { ascending: true })
      .range(start, start + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

function clean(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function limit(value, max = 320) {
  const text = clean(value);
  if (text.length <= max) return text;
  const shortened = text.slice(0, max - 1);
  const boundary = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, boundary > max - 45 ? boundary : max - 1).replace(/[,:;\s]+$/, "")}…`;
}

function hash(value = "") {
  let result = 2166136261;
  for (const char of String(value)) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  result ^= result >>> 16;
  result = Math.imul(result, 0x7feb352d);
  result ^= result >>> 15;
  result = Math.imul(result, 0x846ca68b);
  result ^= result >>> 16;
  return result >>> 0;
}

function pick(options, row, field, salt = "") {
  return options[hash(`${row.id}|${row.name}|${field}|${salt}`) % options.length];
}

function skeleton(row, field, text = row.venue_intel?.[field]) {
  return clean(text)
    .toLowerCase()
    .replaceAll(clean(row.name).toLowerCase(), "{venue}")
    .replaceAll(clean(row.city).toLowerCase().replaceAll("_", " "), "{city}")
    .replace(/\b\d+(?:[.:–-]\d+)*\b/g, "{n}")
    .replace(/[^a-z{}]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicatedRowsByField(rows) {
  return Object.fromEntries(fields.map((field) => {
    const groups = new Map();
    for (const row of rows) {
      const key = skeleton(row, field);
      if (!key) continue;
      const ids = groups.get(key) || [];
      ids.push(row.id);
      groups.set(key, ids);
    }
    return [field, new Set([...groups.values()].filter((ids) => ids.length > 1).flat())];
  }));
}

function cityLabel(row) {
  return clean(row.city).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function venueFeature(row) {
  const text = `${row.name || ""} ${row.description || ""} ${row.vibe || ""}`.toLowerCase();
  const features = [
    [/drag|cabaret|show/, "shows and performance"],
    [/karaoke/, "karaoke-led nights"],
    [/rooftop|roof terrace/, "rooftop setting"],
    [/beach|seafront|ocean/, "beachside setting"],
    [/leather|fetish|rubber|bdsm/, "fetish or leather focus"],
    [/bear|dadd/, "bear-friendly identity"],
    [/lesbian|sapphic|women|wlw/, "queer-women focus"],
    [/trans|nonbinary|non-binary/, "trans-inclusive community focus"],
    [/cocktail/, "cocktail-led atmosphere"],
    [/techno|electronic|house music|dj/, "electronic-music programme"],
    [/live music|concert/, "live-music programme"],
    [/community|activis|support|cultural/, "community programme"],
    [/restaurant|dining|food|brunch/, "food-led visit"],
    [/sauna|steam|wellness|spa/, "wellness facilities"],
    [/hotel|guesthouse|hostel|resort/, "accommodation setting"],
    [/cruise|dark room|play area/, "adult programme"],
    [/historic|oldest|institution|legend/, "long-running identity"],
  ];
  return features.find(([pattern]) => pattern.test(text))?.[1] || "social atmosphere";
}

function shortArea(row) {
  const first = clean(row.location).split(",")[0].replace(/\b\d{4,}\b/g, "").trim();
  if (!first || first.length > 55 || first.toLowerCase() === cityLabel(row).toLowerCase()) return "";
  return first;
}

function hoursHint(row) {
  const value = clean(row.hours);
  if (!value || value.length > 95 || /unknown|varies|check/i.test(value)) return "";
  return value;
}

function sourceLabel(row) {
  const urls = Array.isArray(row.venue_intel?.source_urls) ? row.venue_intel.source_urls : [];
  const url = urls[0] || row.link;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("instagram")) return "the venue's Instagram";
    if (host.includes("facebook")) return "the venue's Facebook page";
    if (host.includes("travelgay")) return "the current LGBTQ+ guide listing";
    return `the saved ${host} source`;
  } catch {
    return "the latest dated venue source";
  }
}

function statusOf(row) {
  const status = clean(row.venue_intel?.research_status).toLowerCase();
  if (status.includes("closed") || status.includes("historical")) return "closed";
  if (status.includes("public_area")) return "area";
  if (status.includes("caution") || status.includes("safety")) return "caution";
  if (status.includes("verify") || status.includes("uncertain") || status.includes("stale")) return "verify";
  return "active";
}

function typeOf(row) {
  return clean(row.type).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
}

const noWaitMetrics = [
  "no source gives a dependable average in minutes", "published guides do not quantify a normal wait", "there is no trustworthy recurring queue figure",
  "current sources do not support a minute-by-minute estimate", "no stable average line time has been documented", "the available listings give no defensible wait time",
  "a typical number of queue minutes is not published", "reviews do not establish one repeatable entry delay", "there is no reliable baseline for how long entry takes",
  "the evidence is too variable for a useful average", "no consistent wait duration appears in current sources", "an exact queue estimate would be guesswork",
  "the saved sources describe the place, not a standard wait", "door timing changes too much for one honest number", "available reports do not agree on a normal delay",
  "there is no verified queue benchmark", "current evidence supports planning advice, not a precise wait", "a fixed line-time claim would overstate the evidence",
];

const freshChecks = [
  "find a same-week post before setting out", "check for a dated update on the day", "confirm the hours directly before crossing town",
  "look for a fresh event notice before committing", "verify the address and opening status that afternoon", "use a current official post as the go/no-go signal",
  "ask the venue to confirm before making a special journey", "treat a recent timestamped announcement as essential", "recheck the listed channel shortly before departure",
  "confirm both operation and programme first", "look for recent activity rather than relying on an old directory", "make the plan conditional on a current update",
  "verify that the venue and its schedule still match the listing", "use only a newly dated source to finalise the visit", "check current opening evidence before arranging transport",
  "confirm the night's format directly", "verify the latest post, address and hours together", "keep a backup unless current operation is explicit",
];

const oldListingCautions = [
  "Older directory copy may describe a previous version of the venue", "A saved listing can outlive the business or its former audience",
  "Historic guide text is context, not proof of today's operation", "Past reviews cannot establish the present format on their own",
  "An older profile may no longer match the address, team or clientele", "Legacy listings often miss closures, relocations and schedule changes",
  "The earlier scene description should not be treated as current fact", "A directory presence does not confirm an active door",
  "Old audience labels can persist long after a venue changes", "The venue may have changed identity since the source was written",
  "Previous reports are insufficient for a current visit decision", "Archived venue language does not verify what happens now",
  "The saved description may reflect a former programme", "Earlier community notes need a current operating signal",
  "A historic listing is not the same as a live schedule", "Past popularity says little about this week's operation",
  "The listing history needs a fresh real-world check", "Older write-ups should not carry the full planning decision",
];

const noRatioPhrases = [
  "No source publishes a defensible locals-to-visitors percentage", "There is no credible fixed split between residents and tourists",
  "Available evidence does not quantify locals versus visitors", "Any exact local/tourist ratio would be invented",
  "The audience balance is not measured in reliable public data", "No trustworthy source turns this crowd into percentages",
  "Published material describes the audience without counting it", "A stable resident-versus-traveller figure is not available",
  "The mix changes too much for an honest fixed percentage", "There is no verified demographic breakdown for the room",
  "Current sources give character, not a numerical crowd split", "No independent data supports a precise visitor share",
  "The local and tourist balance remains qualitative", "A percentage claim would overstate what the sources know",
  "Public reviews cannot supply a representative crowd ratio", "No consistent headcount separates locals from travellers",
  "The venue has no published audience census", "Treat the mix as event-dependent rather than statistical",
];

const policyChecks = [
  "the current event notice has the final word", "a one-off theme can override the everyday norm", "check the latest door note before leaving",
  "special nights may set a different rule", "the promoter can change expectations for a specific date", "bring photo ID when the listing asks for it",
  "confirm any themed requirement on the official channel", "do not assume a regular night and a special event dress alike", "the posted house rules take priority",
  "current admission guidance matters more than old photos", "review the same-day event description for exceptions", "weather and venue layout should shape the final choice",
  "avoid relying on social-media photos as a formal policy", "ticket terms may add an ID or bag requirement", "the practical rule can shift with the host",
  "use the venue's newest guidance for a themed programme", "ask directly if the dress expectation is unclear", "comfort and the announced format should guide the outfit",
];

const serviceVariations = [
  "individual experiences can still differ with the shift", "door and bar service may vary across the week", "one team's welcome does not guarantee every interaction",
  "security and service can feel different on another event", "recent reviews remain the best check for day-to-day consistency", "specific accessibility needs should still be confirmed",
  "the host, crowd pressure and staffing level all matter", "a direct question is sensible when an accommodation is important", "community positioning is a signal, not a service guarantee",
  "the experience may change between daytime and late-night teams", "busy events can produce a different door experience", "staff turnover can make older feedback less predictive",
  "pronoun, access or safety needs are worth raising beforehand", "inclusion should be judged from current conduct, not branding alone", "the latest community feedback carries the most weight",
  "a single review cannot stand in for every visit", "operational pressure can affect otherwise positive service", "current first-hand reports are more useful than a generic badge",
];

const queueOpeners = [
  "For {name}, plan around", "At {name}, expect", "The practical queue picture at {name} is", "Treat entry at {name} as",
  "A sensible arrival plan for {name} is", "For a smoother start at {name}, allow for", "When heading to {name}, budget for",
  "The safest assumption for {name} is", "Entry at {name} is best planned as", "With {name}, the useful rule is",
  "Before visiting {name}, account for", "The door pattern at {name} points to", "For {name}, a low-friction visit means",
  "Queue planning at {name} comes down to", "Approach {name} with room for", "At {name}, the likely pressure point is",
];

function queueText(row) {
  const name = row.name;
  const status = statusOf(row);
  const type = typeOf(row);
  const opening = pick(queueOpeners, row, "queue").replace("{name}", name);
  const noMetric = pick(noWaitMetrics, row, "queue", "metric");
  const hours = hoursHint(row);
  const area = shortArea(row);
  if (status === "closed") return limit(`${opening} no active door line because the listing is historical. ${pick(freshChecks, row, "queue", "closed")} if a successor is reported around ${area || cityLabel(row)}.`);
  if (status === "area") return limit(`${opening} no managed entrance: this is an ordinary public space. ${pick(policyChecks, row, "queue", "area")}, use busy daylight hours and never treat old cruising references as a safety promise.`);
  if (status === "verify") return limit(`${opening} an operating pattern that remains unconfirmed; ${noMetric}. ${pick(freshChecks, row, "queue", "verify")} using ${sourceLabel(row)}.`);
  if (status === "caution") return limit(`${opening} same-day uncertainty rather than a normal line estimate; ${noMetric}. Recheck local security guidance and transport before leaving for ${area || cityLabel(row)}.`);
  const detail = type === "hotel"
    ? "the normal check-in peak and possible event-day delays"
    : type === "sauna"
      ? "a short reception or locker wait when the facilities are busiest"
      : type === "club"
        ? "ticket and door checks once the dance-floor rush begins"
        : type === "cruise_club"
          ? "capacity and admission checks tied to the night's adult theme"
          : ["cafe", "restaurant"].includes(type)
            ? "a table or service wait at the main meal-time rush"
            : "a busier door or bar-service period on event nights";
  const context = hours ? ` The listing currently gives ${hours}.` : area ? ` Its listed base is ${area}.` : ` Its ${venueFeature(row)} can change the rhythm.`;
  return limit(`${opening} ${detail}; ${noMetric}.${context}`);
}

const bestOpeners = [
  "{name} makes most sense", "The strongest window for {name} is", "For {name}, choose", "A better-timed visit to {name} starts",
  "Build a visit to {name} around", "The useful timing cue for {name} is", "{name} is more convincing", "To catch {name} at its best, aim",
  "The practical sweet spot for {name} is", "With {name}, timing matters most", "Put {name} on the itinerary", "The best case for visiting {name} is",
  "{name} fits the night best", "For the clearest sense of {name}, go", "A first visit to {name} works better", "The smarter window for {name} is",
];

function bestText(row) {
  const name = row.name;
  const status = statusOf(row);
  const type = typeOf(row);
  const opening = pick(bestOpeners, row, "best").replace("{name}", name);
  const hours = hoursHint(row);
  const feature = venueFeature(row);
  if (status === "closed") return limit(`${opening} only if a reopening or replacement is newly confirmed. ${pick(oldListingCautions, row, "best", "closed")}; there is no present-day best night to recommend.`);
  if (status === "area") return limit(`${opening} in daylight, during ordinary public activity. ${pick(policyChecks, row, "best", "area")}; weather, transport and personal safety matter more than a supposed cruising peak.`);
  if (status === "verify") return limit(`${opening} only after a fresh operating signal. ${pick(oldListingCautions, row, "best", "verify")}; ${pick(freshChecks, row, "best", "action")}.`);
  if (status === "caution") return limit(`${opening} only when both the programme and local security situation are reconfirmed that day. ${pick(freshChecks, row, "best", "caution")} and keep a direct route home.`);
  let timing = "on Friday or Saturday evening, with an earlier weekday visit better for conversation";
  if (type === "hotel") timing = "for the dates that match your wider itinerary; Pride, festivals and major weekends need earlier booking";
  else if (type === "sauna") timing = "from weekend afternoon into evening, while themed sessions should be checked separately";
  else if (type === "club") timing = "on a published Friday or Saturday programme, arriving before the room reaches its late peak";
  else if (type === "cruise_club") timing = "on the specific adult theme that fits you, rather than assuming every night has the same rules";
  else if (type === "cafe") timing = "in daytime or early evening, especially when a community event is actually listed";
  else if (type === "restaurant") timing = "at a reserved dinner or brunch slot, not simply at the latest possible hour";
  const detail = hours
    ? pick([` Current listed hours: ${hours}.`, ` The saved schedule reads ${hours}.`, ` Its present listing gives ${hours}.`, ` Use ${hours} as the working schedule, then recheck it.`], row, "best", "hours")
    : pick([` That timing suits its ${feature}.`, ` It matches the venue's ${feature}.`, ` The window fits its ${feature} better than a random drop-in.`, ` This makes the most of its ${feature}.`], row, "best", "feature");
  return limit(`${opening} ${timing}.${detail}`);
}

const crowdOpeners = [
  "The room at {name} tends to make sense as", "For {name}, picture", "{name} is best understood as drawing", "The likely mix around {name} is",
  "Expect {name} to bring together", "The social profile of {name} points to", "At {name}, the audience is more likely to be", "{name} sits in a lane shared by",
  "The crowd signal for {name} suggests", "Rather than one fixed demographic, {name} gathers", "A night at {name} can mix", "{name} appears geared toward",
  "The clearest audience cue at {name} is", "Around {name}, you are likely to meet", "The community footprint of {name} includes", "{name} reads as a meeting point for",
];

function crowdText(row) {
  const name = row.name;
  const status = statusOf(row);
  const type = typeOf(row);
  const feature = venueFeature(row);
  const opening = pick(crowdOpeners, row, "crowd").replace("{name}", name);
  if (status === "closed") return limit(`${opening} no present-day audience because the listing is historical. ${pick(oldListingCautions, row, "crowd", "closed")}, and past clientele should not be presented as current.`);
  if (status === "area") return limit(`${opening} ordinary members of the public rather than a countable venue crowd. ${pick(noRatioPhrases, row, "crowd", "area")} for this unstaffed space.`);
  if (status === "verify") return limit(`${opening} a clientele that cannot currently be verified. Its former ${feature} explains older descriptions, but ${pick(noRatioPhrases, row, "crowd", "verify").toLowerCase()}.`);
  let audience = "LGBTQ+ regulars, friends and visitors whose balance shifts with the programme";
  if (type === "hotel") audience = "domestic and international hotel guests rather than a dedicated nightlife crowd";
  else if (type === "sauna") audience = "mainly gay and bisexual men, with age and visitor mix changing by session";
  else if (type === "cruise_club") audience = "adults who match the announced cruise or fetish format, often mainly gay and bisexual men";
  else if (["cafe", "restaurant"].includes(type)) audience = "neighbourhood locals, LGBTQ+ guests and visitors in a mixed social setting";
  else if (feature === "queer-women focus") audience = "queer women, trans and nonbinary guests, friends and allies, depending on the night";
  else if (feature === "bear-friendly identity") audience = "bear, cub, daddy and admirer communities alongside other queer guests";
  else if (feature === "fetish or leather focus") audience = "leather, fetish and sex-positive regulars plus visitors who understand the event rules";
  const area = shortArea(row);
  return limit(`${opening} ${audience}${area ? ` around ${area}` : ` in ${cityLabel(row)}`}. ${pick(noRatioPhrases, row, "crowd", "ratio")}.`);
}

const dressOpeners = [
  "For {name},", "At {name},", "The practical look for {name} is", "Dress for {name} with",
  "A first visit to {name} calls for", "What works at {name}: ", "For the setting at {name}, choose", "{name} is easiest in",
  "The safest wardrobe choice for {name} is", "Keep the outfit for {name}", "To fit the practical side of {name}, wear", "{name} does not need overthinking: choose",
  "Plan clothing for {name} around", "The door at {name} is best approached in", "For comfort at {name}, go with", "The useful dress cue at {name} is",
];

function dressText(row) {
  const name = row.name;
  const status = statusOf(row);
  const type = typeOf(row);
  const feature = venueFeature(row);
  const opening = pick(dressOpeners, row, "dress").replace("{name}", name);
  const check = pick(policyChecks, row, "dress", "policy");
  if (status === "closed") return limit(`${opening} no live dress policy because the venue is historical. ${pick(oldListingCautions, row, "dress", "closed")}.`);
  if (status === "area") return limit(`${opening} weather-ready public-space clothing, secure footwear and discreet storage for valuables; ${check}.`);
  if (type === "hotel") return limit(`${opening} everyday travel clothes for check-in and smart casual for public bars or dining areas; ${check}.`);
  if (type === "sauna") return limit(`${opening} simple arrival clothes that are easy to store. Follow the towel, footwear, hygiene and consent rules inside; ${check}.`);
  if (type === "cruise_club") return limit(`${opening} the advertised adult theme. ${feature === "fetish or leather focus" ? "Leather, rubber, underwear or fetishwear may be expected" : "Underwear, sportswear or another coded look may apply"}; ${check}.`);
  if (type === "club") return limit(`${opening} dance-ready clothing, comfortable shoes and photo ID. Its ${feature} can invite a bolder look; ${check}.`);
  if (type === "restaurant") return limit(`${opening} neat casual clothing, moving to smart casual for dinner, reservations or its ${feature}; ${check}.`);
  if (type === "cafe") return limit(`${opening} relaxed everyday clothing, with an extra layer if its ${feature} extends into evening; ${check}.`);
  return limit(`${opening} relaxed but intentional clothing suited to its ${feature}; ${check}.`);
}

const staffOpeners = [
  "For {name}, the inclusion signal is", "The service picture at {name} is", "At {name}, available evidence gives", "{name}'s current inclusion signal offers",
  "On staff inclusion, {name} has", "Community guidance around {name} provides", "For accessibility or identity-specific needs at {name}, there is", "The useful staff note for {name} is",
  "{name} should be approached with", "The welcome reported around {name} amounts to", "For {name}, public sources support", "The host-and-service signal at {name} indicates",
  "What can responsibly be said about {name} is", "At {name}, inclusion is best read through", "The evidence around service at {name} gives", "For a first visit to {name}, the staff signal remains",
];

function staffText(row) {
  const name = row.name;
  const status = statusOf(row);
  const type = typeOf(row);
  const opening = pick(staffOpeners, row, "staff").replace("{name}", name);
  const source = sourceLabel(row);
  const variation = pick(serviceVariations, row, "staff", "variation");
  if (status === "closed") return limit(`${opening} no current team to assess. ${pick(oldListingCautions, row, "staff", "closed")}; ${variation}.`);
  if (status === "area") return limit(`${opening} no dedicated venue team or inclusion policy. Use normal public-space safety planning; ${variation}.`);
  if (status === "verify") return limit(`${opening} too little current evidence for a confident rating. Confirm operation through ${source}, ask directly about specific needs, and remember that ${variation}.`);
  if (status === "caution") return limit(`${opening} an LGBTQ+ signal that must be weighed against current local security conditions. Reconfirm entry and transport; ${variation}.`);
  if (type === "hotel") return limit(`${opening} an LGBTQ+-friendly listing, not independent proof of property-wide staff training. Contact reception for a specific accommodation; ${variation}.`);
  if (["cafe", "restaurant"].includes(type)) return limit(`${opening} queer-friendly positioning rather than a guarantee about every shift. Check recent service feedback because ${variation}.`);
  return limit(`${opening} an explicitly LGBTQ+ setting through ${source}. That is useful evidence, while ${variation}.`);
}

const generators = {
  queue_wait: queueText,
  best_nights: bestText,
  crowd_mix: crowdText,
  dress_code: dressText,
  staff_inclusivity: staffText,
};

const rows = await fetchAll();
const duplicated = duplicatedRowsByField(rows);
const now = new Date().toISOString();
const payloads = rows.map((row) => {
  const venue_intel = { ...row.venue_intel };
  const rewritten = [];
  for (const field of fields) {
    if (!duplicated[field].has(row.id)) continue;
    venue_intel[field] = generators[field](row);
    rewritten.push(field);
  }
  if (rewritten.length) venue_intel.updated_at = now;
  return { id: row.id, name: row.name, venue_intel, rewritten };
}).filter((row) => row.rewritten.length > 0);

for (const row of payloads) {
  for (const field of fields) {
    const value = clean(row.venue_intel?.[field]);
    if (!value) throw new Error(`Missing ${field} for ${row.id} ${row.name}`);
    if (value.length > 320) throw new Error(`${field} exceeds 320 chars for ${row.id} ${row.name}`);
  }
}

const fieldCounts = Object.fromEntries(fields.map((field) => [field, payloads.filter((row) => row.rewritten.includes(field)).length]));
const payloadById = new Map(payloads.map((row) => [row.id, row]));
const projectedRows = rows.map((row) => payloadById.has(row.id) ? { ...row, venue_intel: payloadById.get(row.id).venue_intel } : row);
const projectedDuplicateSummary = Object.fromEntries(fields.map((field) => {
  const exactGroups = new Map();
  const structuralGroups = new Map();
  for (const row of projectedRows) {
    const exactKey = clean(row.venue_intel?.[field]);
    const structuralKey = skeleton(row, field);
    exactGroups.set(exactKey, (exactGroups.get(exactKey) || 0) + 1);
    structuralGroups.set(structuralKey, (structuralGroups.get(structuralKey) || 0) + 1);
  }
  const exactDuplicates = [...exactGroups.values()].filter((count) => count > 1);
  const structuralDuplicates = [...structuralGroups.values()].filter((count) => count > 1);
  return [field, {
    exact_groups: exactDuplicates.length,
    exact_largest: Math.max(0, ...exactDuplicates),
    structural_groups: structuralDuplicates.length,
    structural_largest: Math.max(0, ...structuralDuplicates),
  }];
}));
if (process.argv.includes("--dry-run")) {
  console.log(JSON.stringify({ mode: "dry-run", venues_to_update: payloads.length, fields_to_rewrite: fieldCounts, projected_duplicates: projectedDuplicateSummary, sample: payloads.slice(0, 5).map((row) => ({ id: row.id, name: row.name, rewritten: row.rewritten, venue_intel: row.venue_intel })) }, null, 2));
} else {
  let written = 0;
  for (let start = 0; start < payloads.length; start += 10) {
    const chunk = payloads.slice(start, start + 10);
    const results = await Promise.all(chunk.map((row) => supabase.from("places").update({ venue_intel: row.venue_intel }).eq("id", row.id)));
    const failed = results.findIndex((result) => result.error);
    if (failed >= 0) throw new Error(`Update failed for ${chunk[failed].id} ${chunk[failed].name}: ${results[failed].error.message}`);
    written += chunk.length;
  }
  console.log(JSON.stringify({ venues_updated: written, fields_rewritten: fieldCounts }, null, 2));
}
