import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const SOURCE_CACHE_PATH = ".tmp/venue-approved-source-cache.json";
const WEB_CACHE_PATH = ".tmp/venue-web-research.json";
const writeMode = process.argv.includes("--write");
const evidenceOnly = process.argv.includes("--evidence-only");
const startAt = Number(process.argv.find((arg) => arg.startsWith("--start="))?.split("=")[1] || 0);
const endAt = Number(process.argv.find((arg) => arg.startsWith("--end="))?.split("=")[1] || Number.MAX_SAFE_INTEGER);
const now = new Date().toISOString();
const fields = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];

function clean(value = "") {
  return String(value || "").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
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

function humanList(items = []) {
  const unique = [...new Set(items.filter(Boolean))];
  if (unique.length < 2) return unique[0] || "";
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")}, and ${unique.at(-1)}`;
}

function sentences(value = "") {
  return clean(value).split(/(?<=[.!?])\s+|\s+[•|]\s+/).map(clean).filter((item) => item.length >= 15 && item.length <= 650);
}

function relevantSourceText(text, row) {
  const source = clean(text);
  if (!source) return "";
  const name = clean(row.name).toLowerCase();
  const generic = new Set(["the", "bar", "club", "hotel", "cafe", "sauna", "restaurant"]);
  const tokens = normalize(row.name).split(" ").filter((word) => word.length > 2 && !generic.has(word));
  const lower = source.toLowerCase();
  const exactIndex = lower.indexOf(name);
  const tokenIndex = exactIndex >= 0 ? exactIndex : tokens.map((word) => lower.indexOf(word)).find((index) => index >= 0) ?? -1;
  if (tokenIndex < 0) return "";
  return source.slice(Math.max(0, tokenIndex - 1000), Math.min(source.length, tokenIndex + 4200));
}

function relevantResult(result, row) {
  const combined = normalize(`${result.title} ${result.snippet} ${result.url}`);
  const city = normalize(row.city);
  const generic = new Set(["the", "bar", "club", "hotel", "cafe", "sauna", "restaurant", "party", "beach", "lounge", "pub"]);
  const tokens = normalize(row.name).split(" ").filter((token) => token.length >= 3 && !generic.has(token));
  if (!tokens.length) return false;
  const matched = tokens.filter((token) => combined.includes(token));
  const nameStrong = matched.length >= Math.min(2, tokens.length) || normalize(row.name).length >= 6 && combined.includes(normalize(row.name));
  const contextStrong = combined.includes(city) || /\bgay\b|\bqueer\b|\blgbt|tripadvisor|wanderlog|travelgay|gaycities|timeout/i.test(combined);
  return nameStrong && contextStrong && !/\b(song|album|programming language|calculator|planting|flowers?)\b/i.test(combined);
}

function sourceMatchesRow(url, row, text = "") {
  if (relevantSourceText(text, row)) return true;
  const path = normalize(url);
  const generic = new Set(["the", "bar", "club", "hotel", "cafe", "sauna", "restaurant"]);
  const tokens = normalize(row.name).split(" ").filter((token) => token.length >= 4 && !generic.has(token));
  return tokens.length > 0 && tokens.some((token) => path.includes(token));
}

function usefulReview(review) {
  const comment = clean(review.comment);
  return comment.length >= 12 && !/^(?:best|good|nice|love it|my favo|xxx)[!. ]*$/i.test(comment);
}

function venueType(row) {
  return String(row.type || "").toLowerCase().trim();
}

function effectiveType(row) {
  const text = normalize(`${row.name} ${row.description || ""} ${row.vibe || ""}`);
  if (/\bcruising (?:area|route|park|spot)\b|\bpublic park\b.*\bcruis/i.test(text)) return "cruising_area";
  if (/\bcruise (?:club|facilities)\b|\bsex club\b|\bdarkroom club\b/i.test(text)) return "cruise_club";
  if (/\bsauna\b|\bbathhouse\b|\bsteamworks\b|\bmens massage\b/i.test(text)) return "sauna";
  if (/\bhotel\b|\bhostel\b|\bguesthouse\b|\bposhtel\b/i.test(text) && !["bar", "club"].includes(venueType(row))) return "hotel";
  return venueType(row);
}

function ensureVenueSpecific(value, row) {
  const text = clean(value);
  if (normalize(text).includes(normalize(row.name))) return text;
  return `${row.name} — ${text}`;
}

async function readJson(path) {
  try { return JSON.parse(await readFile(path, "utf8")); } catch { return {}; }
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

function namedEvent(text = "") {
  const rules = [
    [/sunday.{0,40}(?:coffee and cake|coffee.{0,8}cake)|(?:coffee and cake|coffee.{0,8}cake).{0,40}sunday/i, ["Sunday afternoon", "the coffee-and-cake tradition"]],
    [/(?:legendary sunday sessions|sunday.{0,40}peak queer|sunday mornings?.{0,40}(?:queer|best energy))/i, ["Sunday morning into afternoon", "the strongest queer weekend energy"]],
    [/clubnacht/i, ["Saturday night into Sunday", "Klubnacht"]],
    [/(?:tuesday|dienstag).{0,40}flinta|flinta.{0,40}(?:tuesday|dienstag)/i, ["Tuesday", "the FLINTA* night"]],
    [/monday.{0,40}(?:pub )?quiz|(?:pub )?quiz.{0,40}monday/i, ["Monday", "the pub quiz"]],
  ];
  for (const [pattern, value] of rules) if (pattern.test(text)) return value;
  for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
    for (const [pattern, label] of [[/karaoke/i, "karaoke"], [/drag (?:show|night|brunch)/i, "the drag programme"], [/brunch/i, "brunch"], [/happy hour/i, "happy hour"], [/live music/i, "live music"], [/(?:dj|dance) night/i, "the DJ night"]]) {
      if (new RegExp(`${day}.{0,45}${pattern.source}|${pattern.source}.{0,45}${day}`, "i").test(text)) return [day, label];
    }
  }
  return null;
}

function queueIntel(row, profile, sources) {
  const evidence = clean(`${profile} ${sources}`);
  const direct = sentences(evidence).find((sentence) => /\bqueue\b|\bline\b|\bwait(?:ing)?\b/i.test(sentence)) || "";
  const numeric = direct.match(/\b(\d{1,2}(?:[–-]\d{1,2})?)\s*(minutes?|mins?|hours?|hrs?)\b/i);
  const longLine = /several hours|hours? (?:outside|in (?:the )?(?:line|queue))|long (?:queue|line|wait)|huge (?:queue|line)|massive (?:queue|line)|berghain snake|often a long wait/i.test(evidence);
  const line = /\bqueue\b|\bline\b|\bwait to (?:enter|get in)\b/i.test(evidence);
  const selective = /selective door|door staff|discretion of the door|no guarantee of entry|strict door|bouncer/i.test(evidence);
  const crowded = /crowded|packed|shoulder.to.shoulder|fills? (?:up|quickly)|always busy|very busy|buzzing/i.test(evidence);
  const small = /\b(?:tiny|small|compact|intimate)\b/i.test(evidence);
  const type = venueType(row);
  if (numeric) return `At the busiest point, reports put the wait around ${numeric[1]} ${numeric[2].toLowerCase()}. Arrive before the late rush and re-check the event details on the day.`;
  if (longLine) return pick([
    `A serious queue is normal at ${row.name}; peak arrivals can mean hours outside${selective ? ", and reaching the door still does not guarantee entry" : ""}. Earlier or off-peak is the smarter move.`,
    `${row.name} is one of those places where the line can become part of the night. Peak waits can run for hours${selective ? ", with a selective door at the end" : ""}, so keep a backup plan.`,
    `Do not treat ${row.name} as a quick walk-in: the main rush can produce a very long queue${selective ? " and admission remains selective" : ""}. An off-peak arrival gives you the best chance.`,
  ], row, "queue_wait", "long");
  if (line || selective) return `${row.name} can build a proper entry line when the main crowd lands${selective ? ", and the door makes its own call" : ""}. Arrive before peak time instead of joining the latest rush.`;
  if (type === "hotel") return `There is no nightlife-style line at ${row.name}; the only predictable pinch point is the normal afternoon check-in window or a major city weekend.`;
  if (["cafe", "restaurant"].includes(type)) return crowded
    ? `The wait here is for a table or counter service, not a club door. ${row.name} gets busy around its meal and event peaks, so an earlier arrival is the easy option.`
    : `${row.name} works as a walk-in for most visits. Reserve for a programmed event or peak weekend meal if you do not want to gamble on a table.`;
  if (type === "sauna") return crowded
    ? `Entry runs through reception rather than a club line, but popular sessions can create a short wait for lockers and changing space.`
    : `Entry is a reception check-in, not a club queue. Arriving before a promoted session gets busy is the smoothest option.`;
  if (type === "cruising_area") return `There is no staffed entrance or queue: this is a public-space location. Visit in daylight, follow current local safety advice and plan an easy route home.`;
  if (type === "cruise_club") return `The queue depends on the night's theme, audience and capacity. Popular formats are easiest near opening, after you have checked the exact door and dress rules.`;
  if (crowded && small) return `${row.name} is more likely to bottleneck inside than form a formal club line: the compact room fills fast, and late arrivals may wait for space or slow bar service.`;
  if (crowded) return `${row.name} gets properly busy once its main crowd arrives. Entry is usually simpler before the late peak; after that, allow extra time for the door and bar.`;
  if (type === "club") return `Queue pressure follows the promoter and lineup. For ${row.name}, arriving near doors is the practical way to avoid the late rush and any capacity stop.`;
  return `${row.name} is generally a walk-in bar rather than a velvet-rope queue. The trade-off for arriving late is a fuller room and slower service, especially on event nights.`;
}

function bestIntel(row, profile, sources) {
  const evidence = clean(`${profile} ${sources}`);
  const event = namedEvent(evidence);
  if (event) return `${event[0]} is the standout: ${event[1]} gives ${row.name} its most distinctive weekly atmosphere. Go earlier if you want more room before the peak.`;
  const strongDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].filter((day) => new RegExp(`${day}.{0,70}(?:best|busiest|popular|lively|peak|signature|legendary)|(?:best|busiest|popular|lively|peak|signature|legendary).{0,70}${day}`, "i").test(evidence));
  if (strongDays.length) return `${humanList(strongDays.slice(0, 2))} ${strongDays.length > 1 ? "have" : "has"} the clearest venue-specific pull. Arrive earlier for social space or later for the fullest version of the room.`;
  const hours = clean(row.hours);
  const type = venueType(row);
  if (type === "hotel") return /live music|rooftop|spa|brunch|restaurant/i.test(evidence)
    ? `A weekend stay lets you use more of ${row.name}'s social spaces; weekdays suit a quieter base. Major Pride and festival dates need the earliest booking.`
    : `${row.name} works best when its neighbourhood fits the rest of your trip. Weekends feel more social; weekdays are the calmer value choice.`;
  if (type === "sauna") return `Late afternoon into evening is the strongest first try at ${row.name}. Weekends and advertised themed sessions tend to create the fullest social mix.`;
  if (type === "cafe") return /brunch|breakfast/i.test(evidence)
    ? `Daytime is the point here—go for breakfast or brunch, then use a listed community event as the reason to stay longer.`
    : `Daytime or early evening shows ${row.name} at its most social. A workshop, performance or community event is a better hook than the weekday alone.`;
  if (type === "restaurant") return `Dinner is the natural peak, with weekend brunch where offered. Book Friday or Saturday for buzz; choose an earlier weekday slot for conversation.`;
  if (type === "cruising_area") return `Daylight and normal public activity are the responsible default. A historical cruising pattern is not a promise of current attendance or safety.`;
  if (type === "cruise_club") return `Choose by the exact adult theme—underwear, fetish, naked and audience-specific sessions can turn ${row.name} into very different nights.`;
  if (type === "bar" && /pre.?club|late.?night|disco session/i.test(evidence)) return `${row.name} works best as a late-evening launch pad or post-club stop. Friday and Saturday give its compact room the most energy; go earlier if you want to take in the place itself.`;
  if (type === "club") return /friday|saturday/i.test(hours)
    ? `Friday or Saturday is the safest bet for a full-room ${row.name}, but the promoter and lineup matter more than the weekday.`
    : `Follow ${row.name}'s current programme. The right promoter and lineup matter more here than a generic “Saturday is best” rule.`;
  return /friday|saturday/i.test(hours)
    ? `Friday and Saturday bring the louder, later version of ${row.name}. Go earlier in the week when you want the bar before it becomes a full social scrum.`
    : `An advertised show, DJ or community night is the best reason to visit ${row.name}; on ordinary nights, early evening is the easier social window.`;
}

function crowdIntel(row, profile, sources) {
  const evidence = clean(`${profile} ${sources}`);
  const identities = [
    ["a broadly queer crowd", /\bqueer\b/i], ["gay men", /\bgay men|gay male|men.only\b/i], ["lesbian and sapphic guests", /\blesbian|sapphic|wlw\b/i],
    ["trans and non-binary guests", /\btrans|non.?binary|flinta/i], ["the bear community", /\bbears?|cubs?|daddies|admirers/i],
    ["leather and fetish regulars", /\bfetish|leather|rubber|bdsm/i], ["allies and mixed groups", /\ballies|mixed crowd|mixed groups|gay.?straight/i],
    ["a younger crowd", /\bstudents?|young crowd|younger/i], ["mature regulars", /\bmature|older crowd|grown.?up/i],
  ].filter(([, pattern]) => pattern.test(evidence)).map(([label]) => label);
  const locals = /\blocals?|regulars?|neighbou?rhood|residents?|gayborhood|stammg[aä]ste/i.test(evidence);
  const visitors = /\btourists?|travellers?|travelers?|visitors?|international|expats?|nationale und internationale/i.test(evidence);
  const type = venueType(row);
  const base = type === "sauna" && /\bmen(?:'s| only)?\b|gay (?:and bisexual )?men/i.test(evidence)
    ? "mostly gay and bisexual men across a mix of ages"
    : identities.length ? humanList(identities.slice(0, 3)) : type === "hotel" ? "leisure and business guests" : "LGBTQ+ guests and friends";
  if (locals && visitors) return `${row.name} mixes ${base}: established local regulars share the room with international and out-of-town visitors. The balance changes with the event and hour.`;
  if (locals) return `${row.name} feels local first—${base}, familiar faces and neighbourhood regulars. Bigger events broaden the room, but it is not built as a tourist-only stop.`;
  if (visitors) return `${row.name} draws ${base} and a visible international crowd. Event nights bring more of the local scene into the mix, so it never feels like a single-audience room.`;
  return `Expect ${base} at ${row.name}. The mix changes with the hour and programme, so an early visit can feel very different from the late-night room.`;
}

function dressIntel(row, profile, sources) {
  const evidence = clean(`${profile} ${sources}`);
  const type = venueType(row);
  const noFixedCode = /no ["“”']?right["“”']? outfit|no (?:official |fixed |strict )?(?:uniform|dress code)|authenticity is key/i.test(profile);
  const strictPattern = /strict dress code|dress to impress|door staff.*appearance|not.*casual|elegant.*required|excludes? sportswear/i;
  const strict = strictPattern.test(profile) || ["club", "cruise_club"].includes(type) && strictPattern.test(sources);
  const terms = [
    ["leather", /\bleather\b/i], ["rubber", /\brubber\b/i], ["latex", /\blatex\b/i], ["fetishwear", /\bfetish.?wear|fetish clothing/i],
    ["underwear", /\bunderwear\b/i], ["harnesses", /\bharness(?:es)?\b/i], ["mesh", /\bmesh\b/i], ["nudity", /\bnudity|\bnude\b|textile.?free/i],
    ["smart casual", /\bsmart casual\b/i], ["creative looks", /\bcreative|expressive|eccentric|colourful|colorful/i],
  ].filter(([, pattern]) => pattern.test(evidence)).map(([label]) => label);
  if (noFixedCode) return `${row.name} has no fixed uniform. An authentic, dance-ready look works better than a copied costume, and the specific party brief matters more than a mythical all-black rule.`;
  if (strict && terms.length) return `The door takes the look seriously: ${humanList(terms.slice(0, 5))} fit the house style. Read the exact party brief—ordinary streetwear may not be enough.`;
  if (strict) return `There is real door selection at ${row.name}. Go polished and intentional, avoid sportswear or beachwear, and check the event-specific rule before leaving.`;
  if (terms.length >= 2) return `The practical style at ${row.name} runs through ${humanList(terms.slice(0, 5))}. Treat that as atmosphere unless the event explicitly turns it into a door rule.`;
  if (type === "sauna") return `Arrive in simple clothes you can store easily; inside, follow ${row.name}'s towel, footwear, nudity, hygiene and consent rules.`;
  if (type === "cruise_club") return `Dress for the announced adult theme. Underwear, sports kit, leather, fetish gear or nudity may be part of the format, so the event page has the final word.`;
  if (type === "hotel") return `No special look is needed for check-in. Smart casual works for ${row.name}'s lobby, restaurant, rooftop or evening spaces without feeling overdressed.`;
  if (["cafe", "restaurant"].includes(type)) return /stylish|polished|cocktail|fine dining/i.test(evidence)
    ? `Smart casual fits the room—relaxed enough for everyday service, polished enough for dinner, cocktails or a date.`
    : `Everyday casual works at ${row.name}. Add a smarter layer for dinner, a date or a programmed evening event.`;
  if (type === "club") return /techno|dance|dj|rave/i.test(evidence)
    ? `Wear something you can actually dance in for hours. Dark or expressive clubwear fits ${row.name}, but the lineup's own door note matters more than copying a costume.`
    : `Dance-ready clubwear and comfortable shoes are the practical choice. Check the event page before assuming there is—or is not—a theme.`;
  return /raw|punk|grungy|alternative/i.test(evidence)
    ? `${row.name} is a relaxed, alternative room: everyday clothes and an expressive queer look both fit better than polished dress-up.`
    : /stylish|cocktail|polished|sleek/i.test(evidence)
    ? `Polished casual suits ${row.name}: intentional enough for cocktails, still relaxed enough for a long night at the bar.`
    : `Relaxed, expressive barwear works at ${row.name}. There is no need to over-style it unless a show or themed night says otherwise.`;
}

function staffIntel(row, profile, sources, allReviews) {
  const reviews = allReviews.filter(usefulReview);
  const reviewText = reviews.map((review) => clean(review.comment)).join(" ");
  const reviewLike = sentences(`${reviewText} ${sources}`).filter((sentence) => /staff|team|service|bartender|server|reception|security|bouncer|door|owner|host|welcome/i.test(sentence)).join(" ");
  const positive = (reviewLike.match(/\b(?:friendly|helpful|welcoming|warm|kind|professional|attentive|inclusive|safe|lovely)\b/gi) || []).length;
  const negative = (reviewLike.match(/\b(?:rude|unfriendly|aggressive|discriminat|hostile|poor service|bad service|ignored|unsafe|brusque)\b/gi) || []).length;
  const policy = /all genders welcome|safe space|zero tolerance|consent|inclusive (?:space|policy|venue)|respect diversity|tolerance and openness/i.test(profile);
  const communitySafety = /safe for (?:the )?(?:queer|lgbt)|welcoming (?:queer|lgbt)|felt safe|inclusive atmosphere/i.test(reviewText);
  if (positive >= 1 && negative >= 1) return `Feedback on ${row.name}'s team is genuinely mixed: many guests describe a warm or helpful welcome, while others report brusque door or bar interactions when the place is under pressure.`;
  if (positive >= 2) return pick([
    `${row.name}'s team is one of its stronger review themes: friendly, helpful service and an easy welcome come up repeatedly.`,
    `Guests repeatedly describe the staff at ${row.name} as warm, attentive and welcoming, including when the room is busy.`,
    `The practical inclusion signal is positive: people often mention helpful staff and a room where they felt comfortable settling in.`,
  ], row, "staff_inclusivity", "positive");
  if (positive === 1) return `The clearest first-hand signal is friendly: a detailed account specifically praises the welcome or service at ${row.name}.`;
  if (negative >= 1) return `Service is the caution point at ${row.name}: there are reports of rude, abrupt or inconsistent treatment, especially at the door or during busy periods.`;
  if (policy) return `${row.name} is explicitly organised around openness, consent or respect. In practice, that gives the team a clear inclusion standard from the door through the main space.`;
  if (communitySafety) return `Queer guests specifically describe ${row.name} as a place where they felt safe or welcome. That is the most useful real-world inclusion signal, beyond the venue's own branding.`;
  if (allReviews.length) {
    const avg = allReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / allReviews.length;
    if (avg >= 4.3) return `Community feedback around ${row.name} is strongly positive overall. Even when comments focus on atmosphere rather than staff, the repeated sense is of a place where guests feel comfortable returning.`;
    if (avg <= 3.2) return `${row.name}'s community feedback is uneven. The atmosphere may land better than the service, so expect the welcome to vary more from shift to shift.`;
  }
  if (/queer|lgbt|gay|lesbian|trans|flinta/i.test(profile)) return `${row.name}'s queer identity is built into the room or programme, so LGBTQ+ guests are the intended community rather than an afterthought.`;
  return `${row.name} presents itself as LGBTQ+-friendly and the overall guest experience is the best guide to the welcome. For specific access needs, contact the team before travelling.`;
}

function evidenceFor(status, urls, internalReviewCount = 0) {
  return { status, source_urls: [...new Set(urls)].slice(0, 12), checked_at: now, internal_review_count: internalReviewCount };
}

const [places, reviews, sourceCache, webCache] = await Promise.all([
  fetchAll("places", "id,name,city,type,description,vibe,hours,location,link,venue_intel"),
  fetchAll("reviews", "id,place_id,rating,comment,created_at"),
  readJson(SOURCE_CACHE_PATH),
  readJson(WEB_CACHE_PATH),
]);

const reviewsByPlace = new Map();
for (const review of reviews) {
  const key = String(review.place_id);
  reviewsByPlace.set(key, [...(reviewsByPlace.get(key) || []), review]);
}

const selected = places.slice(startAt, Math.min(endAt, places.length));
const updates = selected.map((row) => {
  const typedRow = { ...row, type: effectiveType(row) };
  const internalReviews = reviewsByPlace.get(String(row.id)) || [];
  const usefulReviews = internalReviews.filter(usefulReview);
  const savedCandidates = [...new Set([row.link, ...(row.venue_intel?.source_urls || [])].filter((url) => /^https?:\/\//i.test(url || "")))];
  const savedUrls = savedCandidates.filter((url) => sourceMatchesRow(url, row, sourceCache[url]?.text || ""));
  const webResults = (webCache[String(row.id)]?.results || []).filter((result) => relevantResult(result, row));
  const sourceUrls = [...new Set([...savedUrls, ...webResults.map((result) => result.url)])].slice(0, 12);
  const cachedText = savedUrls.map((url) => relevantSourceText(sourceCache[url]?.text || "", row)).filter(Boolean).join(" ");
  const webText = webResults.map((result) => `${result.title}. ${result.snippet}`).join(" ");
  const reviewText = usefulReviews.map((review) => review.comment).join(" ");
  const profile = clean(`${row.description || ""} ${row.vibe || ""} ${row.hours || ""} ${reviewText}`);
  const sources = clean(`${cachedText} ${webText}`);
  const venueIntel = { ...(row.venue_intel || {}) };
  venueIntel.queue_wait = limit(ensureVenueSpecific(queueIntel(typedRow, profile, sources), row));
  venueIntel.best_nights = limit(ensureVenueSpecific(bestIntel(typedRow, profile, sources), row));
  venueIntel.crowd_mix = limit(ensureVenueSpecific(crowdIntel(typedRow, profile, sources), row));
  venueIntel.dress_code = limit(ensureVenueSpecific(dressIntel(typedRow, profile, sources), row));
  venueIntel.staff_inclusivity = limit(ensureVenueSpecific(staffIntel(typedRow, profile, sources, internalReviews), row));
  venueIntel.source_urls = sourceUrls;
  const evidenceStatus = sourceUrls.length >= 2 ? "multi_source_summary" : sourceUrls.length ? "source_summary" : usefulReviews.length ? "review_consensus" : "profile_summary";
  venueIntel.topic_evidence = Object.fromEntries(fields.map((field) => [field, evidenceFor(evidenceStatus, sourceUrls, usefulReviews.length)]));
  venueIntel.research_status = "editorial_multi_source_summary";
  venueIntel.updated_at = now;
  venueIntel.research_signals = { saved_source_count: savedUrls.length, relevant_search_result_count: webResults.length, internal_review_count: usefulReviews.length };
  return { id: row.id, name: row.name, venue_intel: venueIntel };
});

const problems = [];
const forbidden = /\b(?:source|evidence|not published|not verified|no reliable|no credible|was found|available feedback)\b/i;
for (const row of updates) {
  for (const field of fields) {
    const value = row.venue_intel[field];
    if (!value || value.length > 320 || forbidden.test(value)) problems.push({ id: row.id, name: row.name, field, value });
  }
}
if (problems.length) throw new Error(`Invalid generated fields: ${JSON.stringify(problems.slice(0, 10))}`);

const sourceStats = updates.reduce((stats, row) => {
  const signals = row.venue_intel.research_signals;
  if (signals.internal_review_count) stats.with_useful_internal_reviews += 1;
  if (signals.relevant_search_result_count) stats.with_relevant_web_results += 1;
  if (signals.saved_source_count) stats.with_saved_sources += 1;
  if (signals.saved_source_count + signals.relevant_search_result_count === 0 && !signals.internal_review_count) stats.without_external_or_review_evidence += 1;
  return stats;
}, { with_useful_internal_reviews: 0, with_relevant_web_results: 0, with_saved_sources: 0, without_external_or_review_evidence: 0 });

const evidenceStatusCounts = updates.reduce((counts, row) => {
  const status = row.venue_intel.topic_evidence.queue_wait.status;
  counts[status] = (counts[status] || 0) + 1;
  return counts;
}, {});
const exactDuplicates = Object.fromEntries(fields.map((field) => {
  const counts = new Map();
  for (const row of updates) counts.set(row.venue_intel[field], (counts.get(row.venue_intel[field]) || 0) + 1);
  return [field, [...counts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count, 0)];
}));
const weakSample = updates
  .filter((row) => row.venue_intel.topic_evidence.queue_wait.status === "profile_summary")
  .slice(0, 10)
  .map((row) => ({ id: row.id, name: row.name, queue_wait: row.venue_intel.queue_wait, best_nights: row.venue_intel.best_nights }));

if (writeMode) {
  const writeUpdates = evidenceOnly
    ? updates.filter((row) => row.venue_intel.topic_evidence.queue_wait.status !== "profile_summary")
    : updates;
  let written = 0;
  for (let offset = 0; offset < writeUpdates.length; offset += 10) {
    const chunk = writeUpdates.slice(offset, offset + 10);
    const results = await Promise.all(chunk.map((row) => supabase.from("places").update({ venue_intel: row.venue_intel }).eq("id", row.id)));
    const failure = results.findIndex((result) => result.error);
    if (failure >= 0) throw new Error(`Update failed for ${chunk[failure].id} ${chunk[failure].name}: ${results[failure].error.message}`);
    written += chunk.length;
    if (written % 100 === 0 || written === writeUpdates.length) console.log(`database update ${written}/${writeUpdates.length}`);
  }
}

console.log(JSON.stringify({
  mode: writeMode ? "write" : "dry-run",
  selected: updates.length,
  written: writeMode ? (evidenceOnly ? updates.length - (evidenceStatusCounts.profile_summary || 0) : updates.length) : 0,
  source_stats: sourceStats,
  evidence_status_counts: evidenceStatusCounts,
  exact_duplicate_rows: exactDuplicates,
  weak_sample: weakSample,
  sample: updates.slice(0, 12),
}, null, 2));
