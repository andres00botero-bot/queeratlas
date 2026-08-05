import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const FIELDS = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const CURATED_IDS = new Set([1, 2, 3, 7, 8, 27, 31, 32, 33]);
const SOURCE_CACHE_PATH = ".tmp/venue-approved-source-cache.json";
const WEB_CACHE_PATH = ".tmp/venue-web-research.json";
const REVIEW_PAGE_CACHE_PATH = ".tmp/venue-review-page-cache.json";
const OUT_PREFIX = process.argv.includes("--production-sql")
  ? "supabase/venue-intelligence-reviewed-all-v1"
  : ".tmp/venue-intelligence-reviewed-all-v1";
const BATCH_SIZE = 200;
const CHECKED_AT = "2026-08-05T00:00:00Z";

const TOPIC_PATTERNS = {
  queue_wait: [
    /\bqueue(?:s|d|ing)?\b/i, /\bline(?:s|d)?\b.{0,55}\b(?:door|entry|entrance|wait|minute|hour)\b/i,
    /\bwait(?:ed|ing|s)?\b.{0,55}\b(?:door|entry|entrance|queue|line|minute|hour)\b/i,
    /\barriv(?:e|ed|ing) early\b/i, /\bcapacity\b/i, /\bsold out\b/i,
    /\b(?:very |seriously |completely )?(?:crowded|packed|rammed|full)\b/i,
    /\bstanding room\b|\broom fills?\b|\bgets? busy\b/i,
  ],
  best_nights: [
    /\b(?:best|busiest|strongest|peak|popular|signature|iconic|quietest)\b.{0,70}\b(?:night|day|time|evening|morning|afternoon|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.{0,70}\b(?:best|busiest|strongest|peak|popular|signature|karaoke|quiz|drag|brunch|party|event|session)\b/i,
    /\b(?:especially|packed|crowded|busiest|buzzing|liveliest)\b.{0,55}\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekends?)\b/i,
    /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:and|or|&)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+nights?\b/i,
    /\b(?:weekly|regular|signature|cult|popular)\b.{0,55}\b(?:karaoke|quiz|drag|brunch|tea.?dance|club night|party|session)\b/i,
  ],
  crowd_mix: [
    /\b(?:locals?|regulars?|residents?|tourists?|travell?ers?|visitors?|international|expats?)\b/i,
    /\b(?:queer|lgbtq?\+?|lesbian|sapphic|gay men|gay crowd|trans|non.?binary|flinta|bear(?:s)?|leather|fetish|mixed crowd|all ages|older crowd|younger crowd|students?)\b/i,
  ],
  dress_code: [
    /\bdress\s*code\b/i, /\bwhat to wear\b/i, /\b(?:no|strict) streetwear\b/i,
    /\b(?:latex|leather|rubber|fetishwear|fetish wear|harness(?:es)?|underwear|lingerie|nudity|nude|textile.?free|smart casual|sportswear)\b/i,
  ],
  staff_inclusivity: [
    /\b(?:staff|team|bartender|bar staff|server|reception|security|bouncer|door staff|host|owner|manager)\b.{0,90}\b(?:friendly|helpful|welcoming|warm|kind|attentive|professional|inclusive|safe|great|lovely|nice|excellent|amazing|rude|unfriendly|aggressive|hostile|discriminat|ignored|supportive|service)\b/i,
    /\b(?:friendly|helpful|welcoming|warm|kind|attentive|professional|inclusive|safe|great|lovely|nice|excellent|amazing|rude|unfriendly|aggressive|hostile|discriminat|supportive)\b.{0,90}\b(?:staff|team|bartender|server|reception|security|bouncer|door|host|owner|manager)\b/i,
    /\b(?:consent|zero tolerance|safe space|all genders welcome|inclusion policy|awareness team)\b/i,
  ],
};

const POSITIVE_STAFF = /\b(?:friendly|helpful|welcoming|warm|kind|attentive|professional|supportive|great|lovely|nice|excellent|amazing|felt safe|looked after)\b/i;
const NEGATIVE_STAFF = /\b(?:rude|unfriendly|aggressive|hostile|discriminat|ignored|poor service|bad service|unsafe|dismissive)\b/i;

function clean(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalize(value = "") {
  return clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function limit(value, max = 320) {
  const text = clean(value);
  if (text.length <= max) return text;
  const slice = text.slice(0, max - 1);
  const boundary = slice.lastIndexOf(" ");
  return `${slice.slice(0, boundary > max - 55 ? boundary : max - 1).replace(/[,:;\s]+$/, "")}…`;
}

function splitSentences(value = "") {
  return clean(value).split(/(?<=[.!?])\s+|\s+[•|]\s+/).map(clean)
    .filter((sentence) => sentence.length >= 18 && sentence.length <= 650);
}

function hash(value = "") {
  let result = 2166136261;
  for (const char of String(value)) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function pick(options, row, field, salt = "") {
  return options[hash(`${row.id}|${row.name}|${field}|${salt}`) % options.length];
}

function hostname(url = "") {
  try { return new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; }
}

function samePage(a = "", b = "") {
  try {
    const one = new URL(a); const two = new URL(b);
    return one.hostname.replace(/^www\./, "") === two.hostname.replace(/^www\./, "")
      && one.pathname.replace(/\/$/, "") === two.pathname.replace(/\/$/, "");
  } catch { return false; }
}

function sourceKind(url = "") {
  const host = hostname(url);
  if (/tripadvisor|yelp|wanderlog|trustpilot|google\.|reddit|restaurantguru|booking\./i.test(host)) return "review";
  if (/instagram|facebook|threads|x\.com|twitter/i.test(host)) return "social";
  return "source";
}

function relevantContext(text = "", row, official = false) {
  const source = clean(text);
  if (!source) return "";
  if (official) return source.slice(0, 120000);
  const fullName = normalize(row.name);
  const variants = [fullName, fullName.replace(/\b(?:the|bar|club|cafe|hotel|sauna|restaurant|lounge|pub|party)\b/g, " ").replace(/\s+/g, " ").trim()]
    .filter((value) => value.length >= 5);
  const normalizedSource = normalize(source);
  const variant = variants.find((value) => normalizedSource.includes(value));
  if (!variant) return "";
  const distinctiveTokens = variant.split(" ")
    .filter((token) => token.length >= 4 && !["hotel", "club", "cafe", "sauna", "restaurant", "lounge", "party", "beach"].includes(token))
    .sort((a, b) => b.length - a.length);
  const needle = distinctiveTokens[0] || variant.split(" ")[0];
  const lowerSource = source.toLowerCase();
  const windows = [];
  let cursor = 0;
  while (windows.length < 12) {
    const index = lowerSource.indexOf(needle, cursor);
    if (index < 0) break;
    windows.push(source.slice(Math.max(0, index - 900), Math.min(source.length, index + 3600)));
    cursor = index + Math.max(needle.length, 1);
  }
  if (!windows.length) return source.slice(0, 8000);
  return clean([...new Set(windows)].join(" ")).slice(0, 60000);
}

function relevantWebResult(result, row) {
  const haystack = normalize(`${result.title} ${result.snippet} ${result.url}`);
  const fullName = normalize(row.name);
  const tokens = fullName.split(" ").filter((word) => word.length >= 4 && !["hotel", "club", "cafe", "sauna", "restaurant", "lounge"].includes(word));
  const nameMatch = haystack.includes(fullName) || tokens.length > 0 && tokens.filter((token) => haystack.includes(token)).length >= Math.min(2, tokens.length);
  return nameMatch && (haystack.includes(normalize(row.city)) || sourceKind(result.url) === "review");
}

function uniqueRecords(records = []) {
  const seen = new Set();
  return records.filter((record) => {
    const key = `${record.url}|${normalize(record.text)}`;
    if (!record.text || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function topicRecords(records, field) {
  const patterns = TOPIC_PATTERNS[field];
  return records.flatMap((record) => splitSentences(record.text)
    .filter((sentence) => patterns.some((pattern) => pattern.test(sentence)))
    .map((sentence) => ({ ...record, text: sentence }))).slice(0, 20);
}

function urlsFor(records = []) {
  return [...new Set(records.map((record) => record.url).filter((url) => /^https?:\/\//i.test(url)))].slice(0, 6);
}

function evidenceStatus(records = [], policy = false) {
  if (!records.length) return "not_published";
  if (records.some((record) => record.kind === "review" || record.kind === "internal_review")) return "review_consensus";
  if (policy) return "verified_policy";
  return urlsFor(records).length >= 2 ? "multi_source_summary" : "source_summary";
}

function notPublished(row, field) {
  const labels = {
    queue_wait: "A current entry pattern",
    best_nights: "A recurring standout night",
    crowd_mix: "A dependable locals-to-visitors picture",
    dress_code: "A standing dress rule",
    staff_inclusivity: "A consistent staff-inclusion pattern",
  };
  const endings = [
    "still needs fresh first-hand reports.", "is still waiting for venue-specific community evidence.",
    "cannot be stated responsibly from the material currently available.", "remains open until stronger venue-specific reports are available.",
    "has not yet reached a publishable review consensus.", "needs a newer, topic-specific source before publication.",
  ];
  return {
    text: limit(`${labels[field]} for ${row.name} ${pick(endings, row, field, "gap")}`),
    status: "not_published",
    records: [],
  };
}

function queueIntel(row, records) {
  if (!records.length) return notPublished(row, "queue_wait");
  const joined = records.map((record) => record.text).join(" ");
  const time = joined.match(/\b(\d{1,3}(?:\s*[–-]\s*\d{1,3})?)\s*(minutes?|mins?|hours?|hrs?)\b/i);
  const long = /\b(?:long|huge|massive|very long)\s+(?:queue|line|wait)\b|\b(?:queue|wait)\b.{0,35}\b(?:hours?|over an hour)\b/i.test(joined);
  const short = /\b(?:no|zero|short|quick|five mins?|5 mins?)\s+(?:queue|line|wait)\b|\bwalk.?in\b/i.test(joined);
  const selective = /\b(?:selective|strict|unpredictable)\s+(?:door|entry)|\bno guarantee\b|\bturned away\b|\brejected\b/i.test(joined);
  const early = /\barriv(?:e|ed|ing) early\b|\bnear opening\b|\bjust after (?:it )?opens\b/i.test(joined);
  let text;
  if (long && short) {
    text = pick([
      `${row.name} can flip from almost walk-in to a proper wait as the night turns${selective ? "; a short line still does not promise entry" : ""}. Timing the event matters more than chasing one magic average.`,
      `The line at ${row.name} has two personalities: quick at softer hours, seriously committed at peak${selective ? ", with a selective door either way" : ""}. Read the night before choosing your arrival.`,
      `Some guests breeze into ${row.name}; others lose a chunk of the night outside${selective ? " and still face a door decision" : ""}. The honest answer is event-led, not one fixed number.`,
    ], row, "queue_wait", "mixed");
  } else if (time) {
    text = pick([
      `At the busy end, guests report roughly ${clean(time[1])} ${time[2].toLowerCase()} outside ${row.name}${selective ? "—and the door can still say no" : ""}. That is a peak-night reality, not an every-night promise.`,
      `${row.name} has produced waits around ${clean(time[1])} ${time[2].toLowerCase()} when the room is hot${selective ? ", without guaranteed entry" : ""}. Go earlier if you want more night and less pavement.`,
      `A real-world wait of about ${clean(time[1])} ${time[2].toLowerCase()} appears in the ${row.name} reports${selective ? ", followed by a selective door" : ""}. Keep a backup close enough to save the mood.`,
    ], row, "queue_wait", "timed");
  } else if (long) {
    text = pick([
      `${row.name} can grow a real queue when its main crowd lands${selective ? ", with no automatic yes at the door" : ""}. ${early ? "The smarter reports lean toward arriving close to opening." : "Give the wait space in your night plan."}`,
      `Peak ${row.name} is not a quick drop-in: the line can become part of the whole ritual${selective ? ", and selection continues at the front" : ""}. ${early ? "Earlier is the kinder move." : "Bring patience and a nearby plan B."}`,
      `When ${row.name} catches fire, the pavement fills too${selective ? "—and reaching the front is only half the story" : ""}. ${early ? "Near-opening arrivals fare better." : "Do not build the night around instant entry."}`,
    ], row, "queue_wait", "long");
  } else if (short) {
    text = pick([
      `${row.name} is usually described as an easy arrival, not a velvet-rope marathon. A standout event can tighten things up, but quick entry is the stronger guest pattern.`,
      `Most guests get into ${row.name} without donating the night to a queue. Leave extra room for special events, but ordinary arrival sounds refreshingly simple.`,
      `The practical win at ${row.name}: entry is more often quick than theatrical. Big nights can still bite, yet the usual review rhythm is walk up, get in, start living.`,
    ], row, "queue_wait", "short");
  } else {
    text = pick([
      `${row.name} gets door and capacity comments, but not one honest average. Let the exact event set your arrival plan; a soft weekday and a headline night are different creatures.`,
      `There is no single ${row.name} queue story—the room changes with the programme. Check the night itself and keep enough flexibility to stay in a good mood.`,
      `Entry at ${row.name} follows the event more than the calendar. Treat a big bill as its own night instead of borrowing expectations from an ordinary opening.`,
    ], row, "queue_wait", "event_led");
  }
  return { text: limit(text), status: evidenceStatus(records), records };
}

function extractDays(text = "") {
  const matches = text.match(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?\b/gi) || [];
  return [...new Set(matches.map((day) => day.replace(/s$/i, "").replace(/^./, (char) => char.toUpperCase())))];
}

function bestNightIntel(row, records) {
  if (!records.length) return notPublished(row, "best_nights");
  const joined = records.map((record) => record.text).join(" ");
  const days = extractDays(joined).slice(0, 2);
  const event = [
    ["karaoke", /\bkaraoke\b/i], ["the quiz", /\b(?:pub )?quiz\b/i], ["drag", /\bdrag\b/i],
    ["brunch", /\bbrunch\b/i], ["the tea dance", /\btea.?dance\b/i], ["the main club night", /\bklubnacht|club night\b/i],
    ["the themed session", /\bthemed? (?:night|session|party)\b/i], ["the DJ programme", /\bdj\b/i],
  ].find(([, pattern]) => pattern.test(joined))?.[0] || "";
  const timing = days.length ? days.join(" and ") : /\bsunday morning|morning\b/i.test(joined) ? "The morning session" : /\bafternoon\b/i.test(joined) ? "The afternoon" : "The published programme";
  const text = event
    ? pick([
      `${timing} is where ${row.name} really clicks: ${event} gives the visit its own flavour. Check the live calendar, because a guest promoter can remix the whole room.`,
      `For the most recognisable ${row.name}, aim at ${timing.toLowerCase()} and ${event}. That is the repeat favourite; one-off parties can still steal the crown.`,
      `${event.charAt(0).toUpperCase()}${event.slice(1)} makes ${timing.toLowerCase()} the sweet spot at ${row.name}. Go for that signature energy, then confirm the latest date before leaving home.`,
    ], row, "best_nights", "event")
    : pick([
      `${timing} carries the strongest repeat love for ${row.name}. It is a venue-shaped recommendation, not the lazy idea that every Saturday is automatically best.`,
      `The clearest ${row.name} rhythm points to ${timing.toLowerCase()}. That is when the room is most often described at its best, though the live programme still gets the final say.`,
      `If you want ${row.name} in full colour, ${timing.toLowerCase()} has the strongest pattern. Check what is actually on; the right event beats a generic weekend rule.`,
    ], row, "best_nights", "timing");
  return { text: limit(text), status: evidenceStatus(records), records };
}

function crowdIntel(row, records) {
  if (!records.length) return notPublished(row, "crowd_mix");
  const joined = records.map((record) => record.text).join(" ");
  const labels = [
    ["queer guests", /\bqueer\b/i], ["gay men", /\bgay men|gay male|mostly gay|predominantly gay\b/i],
    ["lesbian and sapphic guests", /\blesbian|sapphic|wlw\b/i], ["trans and non-binary guests", /\btrans|non.?binary|flinta\b/i],
    ["bear regulars", /\bbears?|cubs?|daddies\b/i], ["leather and fetish regulars", /\bleather|fetish\b/i],
    ["mixed groups", /\bmixed crowd|mixed groups|gay.?straight|allies\b/i], ["younger guests", /\byounger|young crowd|students?\b/i],
    ["mature regulars", /\bmature|older crowd|older men\b/i],
  ].filter(([, pattern]) => pattern.test(joined)).map(([label]) => label).slice(0, 3);
  const locals = /\blocals?|regulars?|residents?|neighbou?rhood\b/i.test(joined);
  const visitors = /\btourists?|travell?ers?|visitors?|international|expats?\b/i.test(joined);
  const audience = labels.length ? labels.join(labels.length > 1 ? ", " : "") : "the audience described in current venue reports";
  let balance = "The hour and programme change the room more than any fixed demographic ratio.";
  if (locals && visitors) balance = "Local regulars and out-of-town visitors are both visible; no credible source supports turning that into a fixed percentage.";
  else if (locals) balance = "The strongest signal is local and repeat-visitor energy rather than a tourist-only room.";
  else if (visitors) balance = "Visitors are clearly part of the mix, while event nights pull more of the local scene into the room.";
  const text = pick([
    `${row.name} pulls in ${audience}. ${balance}`,
    `The room at ${row.name} is best understood as ${audience}. ${balance}`,
    `Around ${row.name}, the recurring people-pattern is ${audience}. ${balance}`,
    `${audience.charAt(0).toUpperCase()}${audience.slice(1)} shape the social chemistry at ${row.name}. ${balance}`,
  ], row, "crowd_mix", "voice");
  return { text: limit(text), status: evidenceStatus(records), records };
}

function dressIntel(row, records) {
  if (!records.length) return notPublished(row, "dress_code");
  const joined = records.map((record) => record.text).join(" ");
  const noCode = /\bno (?:official |fixed |strict )?dress\s*code\b|\bno special dress\s*code\b/i.test(joined);
  const strict = /\bstrict dress\s*code\b|\bno streetwear\b|\bmust wear\b|\brequired\b.{0,35}\b(?:dress|wear|clothes|outfit)\b/i.test(joined);
  const terms = [
    ["latex", /\blatex\b/i], ["leather", /\bleather\b/i], ["rubber", /\brubber\b/i],
    ["fetishwear", /\bfetish\s*wear|fetishwear\b/i], ["harnesses", /\bharness(?:es)?\b/i],
    ["underwear", /\bunderwear\b/i], ["lingerie", /\blingerie\b/i], ["nudity", /\bnudity|\bnude\b/i],
    ["smart casual", /\bsmart casual\b/i], ["sportswear", /\bsportswear\b/i],
  ].filter(([, pattern]) => pattern.test(joined)).map(([term]) => term).slice(0, 5);
  let text;
  if (noCode) text = pick([
    `${row.name} has no house uniform. Wear something that feels like you, survives the night and does not look borrowed from a “how to be queer” mood board; named themes can still set their own rule.`,
    `No fixed costume runs ${row.name}. Personal and practical wins here—bring your own energy, then let a specific party brief override the everyday look.`,
    `The useful dress code at ${row.name} is authenticity, not uniform cosplay. Comfort belongs in the look; only a clearly named theme should make it stricter.`,
  ], row, "dress_code", "none");
  else if (strict && terms.length) text = pick([
    `${row.name} means the look: ${terms.join(", ")} recur in both the guidance and guest accounts. Basic streetwear can die at the door, so read the party brief before committing.`,
    `This is not a “nice top will do” situation. ${terms.join(", ")} fit the ${row.name} language, and the strictest nights expect visible intention from head to toe.`,
    `At ${row.name}, clothes are part of the event. Think ${terms.join(", ")}; check the exact edition because the door reads the whole look, not one token accessory.`,
  ], row, "dress_code", "strict_terms");
  else if (strict) text = pick([
    `${row.name} has a real door look on the nights covered by guest reports. Arrive intentional, event-aware and ready to own it—the newest promoter note matters more than old outfit folklore.`,
    `The door at ${row.name} notices effort. Build a complete look around the actual party, not a generic club costume, and recheck the brief before you leave.`,
    `${row.name} can be visually selective. The safest move is not “dress fancy” but “understand this event” and wear something that makes that understanding obvious.`,
  ], row, "dress_code", "strict");
  else if (terms.length) text = pick([
    `${terms.join(", ")} keep showing up in the real-world ${row.name} wardrobe. Read that as the room’s style, not an automatic rule, unless the event itself says otherwise.`,
    `The ${row.name} look often moves through ${terms.join(", ")}. You can echo the energy without dressing as a copy; the dated event note gets the final word.`,
    `Around ${row.name}, people repeatedly mention ${terms.join(", ")}. It is useful atmosphere-reading, while an actual requirement should always come from that night’s brief.`,
  ], row, "dress_code", "terms");
  else text = pick([
    `${row.name} has its own clothing cues, but no honest case for turning them into one permanent rule. Dress for the current night, not the venue’s oldest photos.`,
    `The practical ${row.name} look shifts with the programme. Let the latest party wording lead and keep social-media mythology in its lane.`,
    `Style at ${row.name} is event-shaped rather than frozen. Check the newest brief, wear something you can actually inhabit and skip second-hand costume rules.`,
  ], row, "dress_code", "event");
  return { text: limit(text), status: evidenceStatus(records, strict), records };
}

function staffIntel(row, records) {
  if (!records.length) return notPublished(row, "staff_inclusivity");
  const positive = records.filter((record) => POSITIVE_STAFF.test(record.text));
  const negative = records.filter((record) => NEGATIVE_STAFF.test(record.text));
  const policy = records.filter((record) => /\b(?:consent|zero tolerance|safe space|all genders welcome|inclusion policy|awareness team)\b/i.test(record.text));
  let text;
  if (positive.length && negative.length) {
    text = pick([
      `${row.name} gets genuinely mixed staff feedback: warm, helpful moments sit beside reports of abrupt or rude treatment. The split is part of the story, not something to airbrush into one shiny score.`,
      `The welcome at ${row.name} depends on whom and when you catch. Guests describe both lovely support and rough interactions, so “always friendly” would be too neat for the actual reviews.`,
      `Staff reviews for ${row.name} pull in both directions—some people feel immediately held, others dismissed. Go in open-eyed: the room’s inclusion signal is real but inconsistent.`,
    ], row, "staff_inclusivity", "mixed");
  } else if (positive.length) {
    text = pick([
      `The staff are part of why people warm to ${row.name}: helpful, attentive and easy welcomes repeat across the reviews. It reads less like branding and more like a lived community habit.`,
      `${row.name} earns real love for the human bit—guests keep mentioning kind, present staff who make the room easier to enter. That warmth is one of its clearest review signatures.`,
      `A good welcome is not background noise at ${row.name}; it is something guests actively remember. Friendly, helpful service comes up often enough to feel like part of the venue’s character.`,
    ], row, "staff_inclusivity", "positive");
  } else if (negative.length) {
    text = pick([
      `The caution at ${row.name} is the human contact: current accounts describe rude, abrupt or dismissive treatment. That does not define every shift, but it is too consistent to hide behind a friendly label.`,
      `${row.name} has a service problem in the review mix. Guests flag brusque or unhelpful interactions often enough that the welcome should be treated as uneven, not automatically inclusive.`,
      `Door or staff tone is where ${row.name} loses people. The critical reports are specific enough to matter, so arrive knowing the welcome may not match the venue’s public vibe.`,
    ], row, "staff_inclusivity", "negative");
  } else if (policy.length) {
    text = pick([
      `${row.name} puts consent, awareness or inclusion into an actual house standard. That gives the team something concrete to work from—stronger than a rainbow sticker, though real guest experience still matters.`,
      `There is a written inclusion backbone at ${row.name}: consent, awareness or respect is part of the operating language. The policy is meaningful; the floor team still has to make it real.`,
      `${row.name} does more than whisper “everyone welcome”—it publishes a consent or inclusion standard. That is a useful promise, with community reports remaining the test of how it lands.`,
    ], row, "staff_inclusivity", "policy");
  } else {
    return notPublished(row, "staff_inclusivity");
  }
  return { text: limit(text), status: evidenceStatus(records, policy.length > 0), records };
}

const GENERATORS = {
  queue_wait: queueIntel,
  best_nights: bestNightIntel,
  crowd_mix: crowdIntel,
  dress_code: dressIntel,
  staff_inclusivity: staffIntel,
};

async function readJson(filePath) {
  try { return JSON.parse(await readFile(filePath, "utf8")); } catch { return {}; }
}

async function fetchAll(table, select, order = "id") {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from(table).select(select).order(order).range(offset, offset + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

function recordsFor(row, reviews, sourceCache, webCache, reviewPageCache) {
  const records = [];
  for (const review of reviews) {
    const text = clean(review.comment);
    if (text.length >= 18) records.push({ text, url: "", kind: "internal_review" });
  }
  const sourceUrls = [...new Set([row.link, ...(row.venue_intel?.source_urls || [])].filter((url) => /^https?:\/\//i.test(url || "")))];
  for (const url of sourceUrls) {
    const cached = sourceCache[url];
    const context = relevantContext(cached?.text || "", row, samePage(url, row.link));
    if (context) records.push({ text: context, url, kind: sourceKind(url) });
  }
  for (const result of webCache[String(row.id)]?.results || []) {
    if (!relevantWebResult(result, row)) continue;
    const pageText = relevantContext(reviewPageCache[result.url]?.text || "", row, samePage(result.url, row.link));
    records.push({ text: pageText || `${result.title}. ${result.snippet}`, url: result.url, kind: sourceKind(result.url) });
  }
  return uniqueRecords(records);
}

function buildPatch(row, records) {
  const patch = {};
  const topicEvidence = {};
  let supported = 0;
  const usedUrls = new Set();
  for (const field of FIELDS) {
    const matching = topicRecords(records, field);
    const generated = GENERATORS[field](row, matching);
    patch[field] = generated.text;
    const sourceUrls = urlsFor(generated.records);
    sourceUrls.forEach((url) => usedUrls.add(url));
    if (generated.status !== "not_published") supported += 1;
    topicEvidence[field] = {
      status: generated.status,
      source_urls: sourceUrls,
      checked_at: CHECKED_AT,
      internal_review_count: generated.records.filter((record) => record.kind === "internal_review").length,
    };
  }
  patch.source_urls = [...usedUrls].slice(0, 12);
  patch.topic_evidence = topicEvidence;
  patch.research_status = supported === FIELDS.length ? "editorial_topic_evidence_complete" : supported ? "editorial_topic_evidence_partial" : "editorial_research_required";
  patch.updated_at = CHECKED_AT;
  patch.research_signals = {
    supported_topics: supported,
    source_count: patch.source_urls.length,
    internal_review_count: records.filter((record) => record.kind === "internal_review").length,
  };
  return patch;
}

function sqlJson(value) {
  return `$qa$${JSON.stringify(value)}$qa$::jsonb`;
}

function migrationSql(rows, part, totalParts) {
  const values = rows.map((row) => `    (${row.id}::bigint, ${sqlJson(row.patch)})`).join(",\n");
  const ids = rows.map((row) => row.id).join(", ");
  return `-- Queer Atlas venue intelligence evidence pass ${part}/${totalParts}.\n-- Generated from venue-specific cached sources and community reviews on ${CHECKED_AT}.\n\nbegin;\n\nwith reviewed(id, patch) as (\n  values\n${values}\n)\nupdate public.places as p\nset venue_intel = coalesce(p.venue_intel, '{}'::jsonb) || reviewed.patch\nfrom reviewed\nwhere p.id = reviewed.id;\n\ndo $$\ndeclare updated_count integer;\nbegin\n  select count(*) into updated_count from public.places\n  where id in (${ids}) and venue_intel->>'updated_at' = '${CHECKED_AT}';\n  if updated_count <> ${rows.length} then\n    raise exception 'Expected ${rows.length} venue intelligence rows in part ${part}, found %', updated_count;\n  end if;\nend $$;\n\ncommit;\n`;
}

const [places, reviews, sourceCache, webCache, reviewPageCache] = await Promise.all([
  fetchAll("places", "id,name,city,type,location,description,vibe,hours,link,venue_intel"),
  fetchAll("reviews", "id,place_id,rating,comment,created_at"),
  readJson(SOURCE_CACHE_PATH),
  readJson(WEB_CACHE_PATH),
  readJson(REVIEW_PAGE_CACHE_PATH),
]);

const reviewsByPlace = new Map();
for (const review of reviews) {
  const key = String(review.place_id);
  reviewsByPlace.set(key, [...(reviewsByPlace.get(key) || []), review]);
}

const generated = places.filter((row) => !CURATED_IDS.has(Number(row.id))).map((row) => {
  const records = recordsFor(row, reviewsByPlace.get(String(row.id)) || [], sourceCache, webCache, reviewPageCache);
  return { id: row.id, name: row.name, city: row.city, patch: buildPatch(row, records) };
});

const totalParts = Math.ceil(generated.length / BATCH_SIZE);
await mkdir(path.dirname(OUT_PREFIX), { recursive: true });
for (let index = 0; index < totalParts; index += 1) {
  const rows = generated.slice(index * BATCH_SIZE, (index + 1) * BATCH_SIZE);
  const filePath = `${OUT_PREFIX}-part-${String(index + 1).padStart(2, "0")}.sql`;
  await writeFile(filePath, migrationSql(rows, index + 1, totalParts), "utf8");
}

const summary = generated.reduce((acc, row) => {
  const supported = row.patch.research_signals.supported_topics;
  acc.supported_topics += supported;
  acc.hidden_unsupported_topics += FIELDS.length - supported;
  acc.statuses[row.patch.research_status] = (acc.statuses[row.patch.research_status] || 0) + 1;
  if (supported < FIELDS.length) acc.research_queue.push({ id: row.id, name: row.name, city: row.city, supported_topics: supported });
  return acc;
}, { venues: generated.length, supported_topics: 0, hidden_unsupported_topics: 0, statuses: {}, research_queue: [] });

console.log(JSON.stringify({
  ...summary,
  research_queue_count: summary.research_queue.length,
  research_queue: summary.research_queue.slice(0, 100),
  output_parts: totalParts,
  output_prefix: OUT_PREFIX,
}, null, 2));
