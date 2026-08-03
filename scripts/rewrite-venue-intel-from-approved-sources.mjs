import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const FIELDS = ["queue_wait", "best_nights", "crowd_mix", "dress_code", "staff_inclusivity"];
const CHECKED_AT = new Date().toISOString();
const CACHE_PATH = ".tmp/venue-approved-source-cache.json";
const args = new Set(process.argv.slice(2));
const writeMode = args.has("--write");
const refresh = args.has("--refresh");
const startArg = process.argv.find((item) => item.startsWith("--start="));
const endArg = process.argv.find((item) => item.startsWith("--end="));
const startAt = Number(startArg?.split("=")[1] || 0);
const endAt = Number(endArg?.split("=")[1] || Number.MAX_SAFE_INTEGER);

const EDITORIAL_DOMAINS = [
  "travelgay.com", "timeout.com", "queeratlas.app", "qlist.app", "misterbandb.com",
  "pridetravelers.com", "gaycities.com", "patroc.com", "nomadicboys.com", "everyqueer.com",
  "siegessaeule.de", "schwulesmuseum.de", "gaytravel4u.com", "ellgeebe.com",
];
const OFFICIAL_TOURISM_DOMAINS = [
  "visitberlin.de", "visitlondon.com", "visitmanchester.com", "visitbrighton.com", "visitscotland.com",
  "nyctourism.com", "discoverlosangeles.com", "sftravel.com", "choosechicago.com", "visitphilly.com",
  "destinationtoronto.com", "mtl.org", "destinationvancouver.com", "sydney.com", "visitmelbourne.com",
  "iamsterdam.com", "visit.brussels", "parisjetaime.com", "esmadrid.com", "barcelonaturisme.com",
  "wien.info", "prague.eu", "visitstockholm.com", "visitcopenhagen.com", "visitoslo.com", "myhelsinki.fi",
];
const REVIEW_DOMAINS = [
  "tripadvisor.com", "tripadvisor.co.uk", "google.com", "yelp.com", "trustpilot.com",
  "booking.com", "hostelworld.com",
];
const SOCIAL_DOMAINS = ["instagram.com", "facebook.com", "threads.net", "x.com", "twitter.com"];
const REJECTED_DOMAINS = [
  "wikipedia.org", "gayout.com", "cruisinggays.com", "gaymapper.com", "mapquest.com",
];

function clean(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function limit(value, max = 320) {
  const text = clean(value);
  if (text.length <= max) return text;
  const candidate = text.slice(0, max - 1);
  const boundary = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, boundary > max - 55 ? boundary : max - 1).replace(/[,:;\s]+$/, "")}…`;
}

function hostname(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

function labelFor(url) {
  const host = hostname(url);
  if (!host) return "the saved source";
  if (host.includes("instagram")) return "the venue's official Instagram";
  if (host.includes("facebook")) return "the venue's official Facebook page";
  if (host.includes("tripadvisor")) return "Tripadvisor reviews";
  if (host.includes("timeout")) return "Time Out";
  if (host.includes("travelgay")) return "Travel Gay";
  if (host.includes("visitberlin")) return "visitBerlin";
  if (host.includes("queeratlas")) return "Queer Atlas";
  if (host.includes("qlist")) return "QLIST";
  const label = host.replace(/\.(com|org|net|co\.uk|de|fr|es|it|nl|se|dk|no|fi|ca|au|nz|za|br|mx|jp)$/i, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function sameUrl(a, b) {
  try {
    const one = new URL(a); const two = new URL(b);
    return one.hostname.replace(/^www\./, "") === two.hostname.replace(/^www\./, "")
      && one.pathname.replace(/\/$/, "") === two.pathname.replace(/\/$/, "");
  } catch { return false; }
}

function classifySource(url, row) {
  const host = hostname(url);
  if (!host || REJECTED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))) return "rejected";
  if (SOCIAL_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    return sameUrl(url, row.link) ? "official_social" : "rejected";
  }
  if (sameUrl(url, row.link)) return "official";
  if (REVIEW_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`)) || /(^|\.)tripadvisor\./i.test(host)) return "review";
  if (EDITORIAL_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))) return "editorial";
  if (OFFICIAL_TOURISM_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`)) || /\.(gov|gov\.[a-z]{2})$/i.test(host)) return "tourism";
  return "unclassified";
}

function approvedSources(row) {
  const candidates = [row.link, ...(Array.isArray(row.venue_intel?.source_urls) ? row.venue_intel.source_urls : [])]
    .filter((url) => /^https?:\/\//i.test(url || ""));
  const unique = [...new Map(candidates.map((url) => [url.replace(/\/$/, ""), url])).values()];
  const classified = unique.map((url) => ({ url, kind: classifySource(url, row) }))
    .filter(({ kind }) => !["rejected", "unclassified"].includes(kind));
  const priority = { official: 0, tourism: 1, editorial: 2, review: 3, official_social: 4 };
  return classified.sort((a, b) => priority[a.kind] - priority[b.kind]).slice(0, 4);
}

function htmlToText(html = "") {
  return clean(String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&ndash;|&mdash;/gi, "–")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number))));
}

function normalizeMatch(value = "") {
  return clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function nameVariants(name = "") {
  const normalized = normalizeMatch(name);
  const withoutGeneric = normalized.replace(/\b(bar|club|cafe|café|hotel|sauna|restaurant|lounge|pub|the)\b/g, " ").replace(/\s+/g, " ").trim();
  return [...new Set([normalized, withoutGeneric].filter((item) => item.length >= 4))].sort((a, b) => b.length - a.length);
}

function venueContext(row, source) {
  const text = source.text || "";
  if (!text) return "";
  if (["official", "official_social"].includes(source.kind)) return text.slice(0, 120000);
  let index = -1;
  for (const variant of nameVariants(row.name)) {
    const words = variant.split(" ").filter(Boolean);
    if (!words.length) continue;
    const pattern = new RegExp(words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^a-z0-9]{0,5}"), "i");
    const match = pattern.exec(text);
    if (match) { index = match.index; break; }
  }
  if (index < 0) return "";
  return text.slice(Math.max(0, index - 2200), Math.min(text.length, index + 4200));
}

function splitSentences(text = "") {
  const navigationNoise = /skip to content|submit review|incorrect info|bars\s*&\s*clubs|privacy overview|cookie(?:s| policy)|all rights reserved|sign in|create account|newsletter|manage consent|menu things to do|proudly lgbtq\+ owned and operated|you need to be logged/i;
  return clean(text).split(/(?<=[.!?])\s+|\s+[•|]\s+/).map(clean)
    .filter((item) => item.length >= 18 && item.length <= 700 && !navigationNoise.test(item));
}

function evidenceSentence(context, patterns) {
  return splitSentences(context).find((sentence) => patterns.some((pattern) => pattern.test(sentence))) || "";
}

function shortEvidence(sentence = "") {
  if (!sentence) return "";
  const words = clean(sentence).split(" ").slice(0, 20).join(" ");
  return words.length < sentence.length ? `${words}…` : words;
}

function hash(value = "") {
  let result = 2166136261;
  for (const char of String(value)) { result ^= char.charCodeAt(0); result = Math.imul(result, 16777619); }
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

function sourceJoin(sources) {
  const labels = [...new Set(sources.map((item) => labelFor(item.url)))];
  if (!labels.length) return "the approved source set";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

function sourceCheckPhrase(sources) {
  const labels = [...new Set(sources.map((item) => labelFor(item.url)))];
  if (!labels.length) return "No accessible approved page was available";
  if (labels.length === 1) return `${labels[0]} was checked`;
  return `${sourceJoin(sources)} were checked`;
}

function humanList(items = []) {
  if (items.length < 2) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

const CHECK_CONTEXTS = [
  "In the latest evidence pass", "During the current source review", "For this venue check", "At the most recent verification",
  "In the approved-source audit", "While checking the saved references", "For the present research update", "In this topic-level review",
  "During the venue's evidence check", "At this review date", "In the current editorial check", "For today's source assessment",
  "When the venue record was reviewed", "During the latest content audit", "In the current verification round", "For this research snapshot",
];
const UNAVAILABLE_VERBS = [
  "did not return accessible venue content", "could not be opened reliably", "was unavailable to the checker", "did not provide a readable page",
  "could not be reached for verification", "returned no usable venue material", "was not machine-accessible", "could not be inspected successfully",
  "provided no accessible page content", "failed the accessibility check", "could not be read at review time", "did not yield verifiable page text",
];
const NOT_PUBLISHED_LINKERS = [
  "however", "even so", "in contrast", "while the page was accessible", "after the page content was reviewed", "on the available page",
  "within that material", "in the venue-specific section", "based on the readable content", "in the published copy",
  "after removing navigation and unrelated text", "for this particular topic",
];
const TOPIC_GAPS = {
  queue_wait: [
    "no typical queue duration is stated", "there is no recurring wait time to cite", "entry delays are not quantified", "the page gives no queue baseline",
    "a normal number of waiting minutes is absent", "no dependable door-wait figure is published", "the usual line length is not documented", "no stable entry estimate appears",
    "the material does not define a standard wait", "queue timing remains unmeasured", "there is no sourced average for entry", "a routine entrance delay cannot be established",
  ],
  best_nights: [
    "no single night is ranked as best", "a strongest evening is not identified", "the source does not recommend one recurring night", "no weekday is presented as the preferred visit",
    "a venue-specific peak night is not named", "the material does not choose a best evening", "no regular day is endorsed over another", "the published copy offers no best-night comparison",
    "a recurring top night cannot be established", "no date-independent recommendation appears", "the source does not rank the weekly programme", "the strongest visit window remains unstated",
  ],
  crowd_mix: [
    "no defensible local-to-visitor split is published", "the audience is not counted by residency", "there is no demographic ratio to report", "locals and travellers are not quantified",
    "the crowd composition is not measured", "no reliable attendee breakdown appears", "a visitor share cannot be supported", "the source gives no audience census",
    "resident and tourist numbers remain unknown", "no percentage-based crowd profile is stated", "the venue's clientele is not statistically described", "a stable audience mix cannot be verified",
  ],
  dress_code: [
    "no recurring clothing rule is published", "a venue-wide dress requirement is not stated", "the material gives no dependable wardrobe policy", "no formal dress standard appears",
    "the page does not define what guests must wear", "a routine admission outfit is not specified", "there is no verified everyday dress code", "clothing expectations remain unstated",
    "the source does not turn event imagery into a rule", "no standing attire requirement can be cited", "the venue's regular clothing policy is absent", "no general dress instruction is documented",
  ],
  staff_inclusivity: [
    "day-to-day staff inclusion is not documented", "there is no evidence strong enough to rate staff conduct", "an inclusion policy or service pattern is not published", "the page does not verify how each shift treats guests",
    "staff behaviour cannot be assessed from the material", "no current service-inclusion signal appears", "the welcome provided by staff is not independently described", "an operational inclusion standard is absent",
    "the source does not support a staff-experience rating", "no reliable account of door or service conduct is available", "staff inclusion remains unevidenced", "the material cannot establish consistency across shifts",
  ],
};
const TOPIC_ACTIONS = {
  queue_wait: ["Use a dated event post before assigning minutes.", "Keep the arrival plan flexible until the venue publishes guidance.", "Check the latest door update on the day.", "Do not replace the missing figure with a generic weekend estimate.", "Confirm current entry conditions directly before travelling.", "Treat any future queue report as date-specific."],
  best_nights: ["Choose from the newest dated programme.", "Let the current event calendar decide the visit.", "Avoid turning a general weekend pattern into a venue fact.", "Recheck the venue's latest schedule before choosing a date.", "Use only a current event listing for the final choice.", "A future recommendation should cite a specific dated source."],
  crowd_mix: ["An exact ratio would therefore be speculation.", "Publish percentages only if a source actually measures them.", "Do not infer residency from language or review profiles.", "A future crowd claim needs venue-specific evidence.", "Treat broad directory categories as labels, not demographic data.", "Keep local and visitor shares unquantified."],
  dress_code: ["Check the exact event notice for any themed exception.", "Do not infer admission rules from photographs.", "Only a current venue instruction should be treated as mandatory.", "Confirm event-specific requirements before dressing for the door.", "Keep suggestions separate from an official policy.", "Use the promoter's dated guidance when a theme is announced."],
  staff_inclusivity: ["Current member feedback is still needed.", "Confirm specific access or identity needs directly.", "Do not treat LGBTQ+ branding alone as proof of service quality.", "A future rating should distinguish policy from lived experience.", "Recent first-hand reports should carry more weight than branding.", "Keep the assessment open until reliable feedback exists."],
};

function notPublishedIntel(row, sources, field) {
  const text = `${pick(CHECK_CONTEXTS, row, field, "context")}, ${sourceCheckPhrase(sources).replace(/\.$/, "")} for ${row.name}; ${pick(NOT_PUBLISHED_LINKERS, row, field, "linker")}, ${pick(TOPIC_GAPS[field], row, field, "gap")}. ${pick(TOPIC_ACTIONS[field], row, field, "action")}`;
  return { text: limit(text), evidence: makeEvidence("not_published", sources) };
}

function unavailableIntel(row, sources, field) {
  const source = sourceJoin(sources);
  const text = `${pick(CHECK_CONTEXTS, row, field, "unavailable_context")}, ${source} ${pick(UNAVAILABLE_VERBS, row, field, "unavailable_verb")} for ${row.name}. Consequently, ${pick(TOPIC_GAPS[field], row, field, "unavailable_gap")}. ${pick(TOPIC_ACTIONS[field], row, field, "unavailable_action")}`;
  return {
    text: limit(text),
    evidence: makeEvidence("source_unavailable", sources),
  };
}

function checkedSources(sourceResults) {
  return sourceResults.filter((source) => source.ok && source.context);
}

function makeEvidence(status, sources, sentence = "") {
  return {
    status,
    source_urls: [...new Set(sources.map((source) => source.url))].slice(0, 4),
    checked_at: CHECKED_AT,
    ...(sentence ? { source_excerpt: shortEvidence(sentence) } : {}),
  };
}

const QUEUE_PATTERNS = [/\b(?:long|short|entry|entrance|door) queue(?:s|d|ing)?\b/i, /\bqueue(?:s|d|ing)?\b.{0,45}\b(?:minute|hour|wait|entry|door)\b/i, /\b(?:wait|waiting) time\b/i, /\bwait(?:ing|s|ed)?\b.{0,35}\b(?:entry|entrance|queue|line|minute|hour)\b/i, /\blong line\b/i, /\barriv(?:e|ing) early\b/i];
const BEST_PATTERNS = [/\bbest (?:night|day|time)\b/i, /\bbusiest\b/i, /\bpopular (?:night|day|time)\b/i, /\bfriday\b/i, /\bsaturday\b/i, /\bsunday\b/i, /\bmonday\b/i, /\btuesday\b/i, /\bwednesday\b/i, /\bthursday\b/i];
const CROWD_PATTERNS = [/\blgbtq?\+?\b/i, /\bqueer\b/i, /\blesbian\b/i, /\bgay\b/i, /\btrans(?:gender)?\b/i, /\bnon.?binary\b/i, /\bbears?\b/i, /\blocals?\b/i, /\btourists?\b/i, /\binternational\b/i, /\bmixed crowd\b/i];
const DRESS_PATTERNS = [/\bdress code\b/i, /\bwhat to wear\b/i, /\bfetishwear\b/i, /\bfetish wear\b/i, /\bleather\b/i, /\brubber\b/i, /\bunderwear\b/i, /\bnud(?:e|ity)\b/i, /\bsmart casual\b/i, /\bcasual dress\b/i];
const STAFF_POLICY_PATTERNS = [/\ball genders (?:are )?welcome\b/i, /\blgbtq?\+?[- ]friendly\b/i, /\bqueer[- ]friendly\b/i, /\binclusive (?:space|policy|environment|venue)\b/i, /\bsafe space\b/i, /\bconsent[- ]based\b/i, /\bzero tolerance\b.{0,45}\b(?:harassment|discrimination)\b/i, /\brespect.{0,40}(?:identity|gender|pronoun|consent)\b/i];
const STAFF_REVIEW_PATTERNS = [/\bstaff\b.{0,70}\b(?:friendly|helpful|welcoming|professional|kind|rude|unfriendly|aggressive|discriminat|service)\b/i, /\b(?:friendly|helpful|welcoming|professional|kind|rude|unfriendly|aggressive)\b.{0,70}\bstaff\b/i, /\b(?:bouncer|security|door team)\b.{0,70}\b(?:friendly|helpful|welcoming|professional|kind|rude|unfriendly|aggressive|discriminat)\b/i];

const actionEndings = [
  "Use a dated event post before setting out.", "Check the venue's latest update on the day.", "Confirm the current programme before travelling.",
  "Treat same-day official guidance as decisive.", "Recheck opening and event details shortly before arrival.", "Use the newest dated announcement for planning.",
  "Do not replace the missing evidence with an estimate.", "Allow flexibility until the venue publishes current guidance.",
];

function queueIntel(row, sources) {
  const checked = checkedSources(sources);
  if (!checked.length) return unavailableIntel(row, sources, "queue_wait");
  const match = checked.map((source) => ({ source, sentence: evidenceSentence(source.context, QUEUE_PATTERNS) })).find((item) => item.sentence);
  if (match) {
    const time = match.sentence.match(/\b(\d{1,3}(?:[–-]\d{1,3})?)\s*(minutes?|mins?|hours?|hrs?)\b/i);
    const early = /arriv(?:e|ing) early/i.test(match.sentence);
    const long = /long (?:queue|line)|queue.{0,35}(?:hour|minute)|wait.{0,35}(?:hour|minute)/i.test(match.sentence);
    const fact = time && long
      ? `${labelFor(match.source.url)} reports an entry wait expressed as ${time[1]} ${time[2].toLowerCase()}; conditions can vary by date.`
      : early
        ? `${labelFor(match.source.url)} specifically recommends arriving early; it does not publish a dependable average wait.`
        : `${labelFor(match.source.url)} discusses the queue, door or capacity, but gives no stable average wait time.`;
    return { text: limit(`${row.name}: ${fact} ${pick(actionEndings, row, "queue_wait")}`), evidence: makeEvidence(match.source.kind === "review" ? "community_signal" : "verified", [match.source], match.sentence) };
  }
  return notPublishedIntel(row, checked, "queue_wait");
}

function bestIntel(row, sources) {
  const checked = checkedSources(sources);
  if (!checked.length) return unavailableIntel(row, sources, "best_nights");
  const match = checked.map((source) => ({ source, sentence: evidenceSentence(source.context, BEST_PATTERNS) })).find((item) => item.sentence);
  if (match) {
    const days = [...new Set((match.sentence.match(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?\b/gi) || []).map((day) => day.replace(/s$/i, "")))];
    const ranking = /best|busiest|most popular|peak/i.test(match.sentence);
    const timing = days.length
      ? `${labelFor(match.source.url)} publishes relevant activity for ${days.slice(0, 4).join(", ")}`
      : `${labelFor(match.source.url)} publishes a programme or timing cue`;
    const qualifier = ranking ? "; the source explicitly presents it as a stronger time to visit." : "; it does not independently rank one night as the best.";
    return { text: limit(`${row.name}: ${timing}${qualifier} ${pick(TOPIC_ACTIONS.best_nights, row, "best_nights", "verified_action")}`), evidence: makeEvidence(match.source.kind === "review" ? "community_signal" : "verified", [match.source], match.sentence) };
  }
  return notPublishedIntel(row, checked, "best_nights");
}

function crowdIntel(row, sources) {
  const checked = checkedSources(sources);
  if (!checked.length) return unavailableIntel(row, sources, "crowd_mix");
  const matches = checked.map((source) => ({ source, sentence: evidenceSentence(source.context, CROWD_PATTERNS) })).filter((item) => item.sentence);
  if (matches.length) {
    const joined = matches.map((item) => item.sentence).join(" ");
    const identities = [
      ["LGBTQ+", /\blgbtq?\+?\b/i], ["queer", /\bqueer\b/i], ["lesbian", /\blesbian\b/i], ["gay", /\bgay\b/i],
      ["trans", /\btrans(?:gender)?\b/i], ["non-binary", /\bnon.?binary\b/i], ["bear", /\bbears?\b/i],
      ["local", /\blocals?\b/i], ["visitor", /\btourists?|visitors?|international/i],
    ].filter(([, pattern]) => pattern.test(joined)).map(([label]) => label);
    const source = matches[0].source;
    const mix = identities.length ? humanList(identities.slice(0, 6)) : "an LGBTQ+ audience";
    const evidenceSources = matches.map((item) => item.source);
    const openers = [
      `${sourceJoin(evidenceSources)} describes ${row.name}'s audience with`, `${row.name}'s checked source profile includes`, `For ${row.name}, ${sourceJoin(evidenceSources)} explicitly signals`,
      `The published crowd description for ${row.name} points to`, `${sourceJoin(evidenceSources)} associates ${row.name} with`, `Source material for ${row.name} identifies`,
      `In the venue-specific copy, ${row.name} is framed around`, `The approved audience evidence for ${row.name} mentions`, `For its documented crowd, ${row.name} has`,
      `${row.name}'s accessible listing uses audience terms including`, `The source-backed clientele notes for ${row.name} include`, `Within the checked material, ${row.name} draws descriptions such as`,
    ];
    const ratioNotes = [
      "No approved source measures a local-to-visitor percentage.", "The resident and tourist shares are not quantified.", "That wording does not provide a demographic ratio.",
      "A numerical visitor split is still absent.", "The source gives identities, not residency percentages.", "No reliable local-versus-traveller count accompanies it.",
      "This supports audience labels but not a crowd census.", "The evidence cannot be converted into a tourist share.", "No measured resident/visitor breakdown is published.",
      "An exact local mix would go beyond the source.", "The available copy does not count locals separately.", "Percentages remain unsupported despite the qualitative description.",
    ];
    return {
      text: limit(`${pick(openers, row, "crowd_mix", "verified_opening")} ${mix}. ${pick(ratioNotes, row, "crowd_mix", "verified_ratio")}`),
      evidence: makeEvidence(source.kind === "review" ? "community_signal" : "verified", matches.map((item) => item.source), matches[0].sentence),
    };
  }
  return notPublishedIntel(row, checked, "crowd_mix");
}

function dressIntel(row, sources) {
  const checked = checkedSources(sources);
  if (!checked.length) return unavailableIntel(row, sources, "dress_code");
  const match = checked.map((source) => {
    const sentences = splitSentences(source.context).filter((sentence) => DRESS_PATTERNS.some((pattern) => pattern.test(sentence)));
    return { source, sentence: sentences[0] || "", sentences };
  }).find((item) => item.sentence);
  if (match) {
    const dressContext = match.sentences.join(" ");
    const terms = [
      ["fetishwear", /fetish\s*wear|fetishwear/i], ["leather", /\bleather\b/i], ["rubber", /\brubber\b/i],
      ["underwear", /\bunderwear\b/i], ["nudity", /\bnudity|\bnude\b/i], ["smart casual", /\bsmart casual\b/i], ["casual", /\bcasual\b/i],
    ].filter(([, pattern]) => pattern.test(dressContext)).map(([term]) => term);
    const detail = terms.length ? `specifically mentions ${humanList(terms)}` : "publishes dress guidance";
    const openings = [
      `${labelFor(match.source.url)} ${detail} for ${row.name}.`, `For ${row.name}, ${labelFor(match.source.url)} ${detail}.`, `${row.name}'s approved dress source ${detail}.`,
      `The published clothing guidance for ${row.name} ${detail}.`, `In its venue-specific copy, ${labelFor(match.source.url)} ${detail}.`, `The source-backed wardrobe note for ${row.name} ${detail}.`,
      `${row.name} has dated attire guidance in ${labelFor(match.source.url)}, which ${detail}.`, `According to ${labelFor(match.source.url)}, ${row.name} ${detail}.`,
    ];
    const endings = [
      "Check the exact event policy because themes can change the door rule.", "Use the current event notice for the final requirement.", "A one-off theme may still override this wording.",
      "Confirm the dated admission note before choosing an outfit.", "Treat the venue's newest instructions as decisive.", "Do not assume every event applies the same standard.",
      "Recheck promoter guidance for the night being visited.", "The cited terms should not be expanded beyond what the source states.",
    ];
    return { text: limit(`${pick(openings, row, "dress_code", "verified_opening")} ${pick(endings, row, "dress_code", "verified_ending")}`), evidence: makeEvidence(match.source.kind === "review" ? "community_signal" : "verified", [match.source], match.sentence) };
  }
  return notPublishedIntel(row, checked, "dress_code");
}

function staffIntel(row, sources) {
  const checked = checkedSources(sources);
  if (!checked.length) return unavailableIntel(row, sources, "staff_inclusivity");
  const matches = checked.map((source) => ({
    source,
    sentence: evidenceSentence(source.context, source.kind === "review" ? STAFF_REVIEW_PATTERNS : STAFF_POLICY_PATTERNS),
  })).filter((item) => item.sentence);
  if (matches.length) {
    const review = matches.find((item) => item.source.kind === "review");
    const policy = matches.find((item) => item.source.kind !== "review");
    if (review) {
      const positive = /friendly|helpful|welcoming|professional|kind|excellent service/i.test(review.sentence);
      const negative = /rude|unfriendly|aggressive|discriminat|poor service|bad service/i.test(review.sentence);
      const signal = positive && !negative ? "includes positive staff or welcome feedback" : negative && !positive ? "includes critical staff or door feedback" : "contains mixed or individual staff/service feedback";
      const endings = ["It is a community signal, not proof about every shift.", "Treat it as review evidence rather than a universal service guarantee.", "Another team or event may produce a different experience.", "The report should not be generalized to all staff interactions."];
      return { text: limit(`${row.name}: ${labelFor(review.source.url)} ${signal}. ${pick(endings, row, "staff_inclusivity", "review_ending")}`), evidence: makeEvidence("community_signal", [review.source], review.sentence) };
    }
    const policyOpeners = [
      `${labelFor(policy.source.url)} publishes inclusion or consent guidance for ${row.name}.`, `${row.name}'s approved source states a welcome, respect or inclusion policy.`,
      `The venue-specific material for ${row.name} includes an explicit inclusion or consent rule.`, `A policy signal for ${row.name} appears in ${labelFor(policy.source.url)}.`,
      `${labelFor(policy.source.url)} gives ${row.name} a documented inclusion, respect or consent statement.`, `For ${row.name}, the checked source contains a clear welcome or safety-policy signal.`,
      `The approved copy for ${row.name} sets out inclusion- or consent-related expectations.`, `${row.name}'s published house guidance includes an inclusion, welcome or consent statement.`,
    ];
    const policyEndings = [
      "That verifies the policy, not every staff interaction.", "It does not establish consistency across every shift.", "Individual service experiences still require community evidence.",
      "Policy wording and day-to-day delivery should be assessed separately.", "This is stronger than branding, but it is not a staff-performance guarantee.", "Recent guest reports remain useful for testing how the policy works in practice.",
      "The statement should not be expanded into a universal service rating.", "It supports the stated standard while leaving lived experience open.",
    ];
    return { text: limit(`${pick(policyOpeners, row, "staff_inclusivity", "policy_opening")} ${pick(policyEndings, row, "staff_inclusivity", "policy_ending")}`), evidence: makeEvidence("verified_policy", [policy.source], policy.sentence) };
  }
  return notPublishedIntel(row, checked, "staff_inclusivity");
}

const generators = { queue_wait: queueIntel, best_nights: bestIntel, crowd_mix: crowdIntel, dress_code: dressIntel, staff_inclusivity: staffIntel };

async function fetchAllPlaces() {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("places")
      .select("id,name,city,type,link,venue_intel")
      .order("id", { ascending: true }).range(offset, offset + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

async function loadCache() {
  if (refresh) return {};
  try { return JSON.parse(await readFile(CACHE_PATH, "utf8")); } catch { return {}; }
}

async function saveCache(cache) {
  await mkdir(".tmp", { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache), "utf8");
}

async function fetchOne(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "Mozilla/5.0 VenueResearchBot/1.0" } });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) return { ok: false, status: response.status, text: "" };
    const html = (await response.text()).slice(0, 2_000_000);
    return { ok: true, status: response.status, final_url: response.url, text: htmlToText(html).slice(0, 180000), fetched_at: CHECKED_AT };
  } catch (error) {
    return { ok: false, status: 0, error: error?.name || "fetch_error", text: "", fetched_at: CHECKED_AT };
  } finally { clearTimeout(timeout); }
}

async function fetchSources(urls, cache) {
  const pending = urls.filter((url) => !cache[url]);
  let cursor = 0;
  let completed = 0;
  async function worker() {
    while (cursor < pending.length) {
      const index = cursor++;
      const url = pending[index];
      cache[url] = await fetchOne(url);
      completed += 1;
      if (completed % 50 === 0 || completed === pending.length) {
        console.log(`source fetch ${completed}/${pending.length}`);
        await saveCache(cache);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(24, pending.length || 1) }, worker));
  await saveCache(cache);
}

const allRows = await fetchAllPlaces();
const selectedRows = allRows.slice(startAt, Math.min(endAt, allRows.length));
const sourceMap = new Map(selectedRows.map((row) => [row.id, approvedSources(row)]));
const uniqueUrls = [...new Set([...sourceMap.values()].flat().map((source) => source.url))];
const cache = await loadCache();
console.log(JSON.stringify({ mode: writeMode ? "write" : "dry-run", total_places: allRows.length, selected: selectedRows.length, approved_unique_urls: uniqueUrls.length, cached: uniqueUrls.filter((url) => cache[url]).length }));
await fetchSources(uniqueUrls, cache);

const updates = selectedRows.map((row) => {
  const approved = sourceMap.get(row.id);
  const sources = approved.map((source) => ({ ...source, ...(cache[source.url] || {}), context: venueContext(row, { ...source, ...(cache[source.url] || {}) }) }));
  const venueIntel = { ...(row.venue_intel || {}) };
  const topicEvidence = { ...(venueIntel.topic_evidence || {}) };
  for (const field of FIELDS) {
    const generated = generators[field](row, sources);
    venueIntel[field] = generated.text;
    topicEvidence[field] = generated.evidence;
  }
  venueIntel.topic_evidence = topicEvidence;
  venueIntel.source_urls = [...new Set([
    ...(Array.isArray(row.venue_intel?.source_urls) ? row.venue_intel.source_urls : []),
    ...approved.map((source) => source.url),
  ])];
  venueIntel.research_status = approved.length ? "approved_sources_topic_checked" : "approved_source_needed";
  venueIntel.updated_at = CHECKED_AT;
  return { id: row.id, name: row.name, venue_intel: venueIntel };
});

const statusCounts = {};
for (const update of updates) {
  for (const field of FIELDS) {
    const status = update.venue_intel.topic_evidence[field].status;
    statusCounts[field] ||= {};
    statusCounts[field][status] = (statusCounts[field][status] || 0) + 1;
    if (!update.venue_intel[field] || update.venue_intel[field].length > 320) throw new Error(`Invalid ${field} for ${update.id} ${update.name}`);
  }
}

function structuralKey(row, field) {
  return clean(row.venue_intel?.[field]).toLowerCase()
    .replaceAll(clean(row.name).toLowerCase(), "{venue}")
    .replace(/\b\d+(?:[.:–-]\d+)*\b/g, "{n}")
    .replace(/[^a-z{}]+/g, " ").replace(/\s+/g, " ").trim();
}

const structuralDuplicates = Object.fromEntries(FIELDS.map((field) => {
  const groups = new Map();
  for (const row of updates) {
    const key = structuralKey(row, field);
    const group = groups.get(key) || [];
    group.push(row.name);
    groups.set(key, group);
  }
  const duplicates = [...groups.entries()].filter(([, names]) => names.length > 1).sort((a, b) => b[1].length - a[1].length);
  return [field, {
    groups: duplicates.length,
    affected: duplicates.reduce((sum, [, names]) => sum + names.length, 0),
    largest: duplicates[0]?.[1].length || 0,
    largest_example: duplicates[0] ? { text: duplicates[0][0], venues: duplicates[0][1].slice(0, 8) } : null,
  }];
}));

if (writeMode) {
  let written = 0;
  for (let offset = 0; offset < updates.length; offset += 10) {
    const chunk = updates.slice(offset, offset + 10);
    const results = await Promise.all(chunk.map((row) => supabase.from("places").update({ venue_intel: row.venue_intel }).eq("id", row.id)));
    const failure = results.findIndex((result) => result.error);
    if (failure >= 0) throw new Error(`Update failed for ${chunk[failure].id} ${chunk[failure].name}: ${results[failure].error.message}`);
    written += chunk.length;
    if (written % 100 === 0 || written === updates.length) console.log(`database update ${written}/${updates.length}`);
  }
}

console.log(JSON.stringify({ mode: writeMode ? "write" : "dry-run", updated: writeMode ? updates.length : 0, would_update: updates.length, topic_statuses: statusCounts, structural_duplicates: structuralDuplicates, sample: updates.slice(0, 8).map((row) => ({ id: row.id, name: row.name, venue_intel: row.venue_intel })) }, null, 2));
