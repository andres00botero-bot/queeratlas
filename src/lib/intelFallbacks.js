const MAX_TEXT_LENGTH = 320;

function cleanText(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, MAX_TEXT_LENGTH);
}

function validHttpUrl(value = "") {
  try {
    const parsed = new URL(String(value || "").trim());
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function mergeIntel(fallback, existing = {}, sourceUrls = []) {
  const merged = { ...fallback };
  for (const key of Object.keys(fallback)) {
    const candidate = cleanText(existing?.[key]);
    if (candidate) merged[key] = candidate;
  }
  const urls = [
    ...(Array.isArray(existing?.source_urls) ? existing.source_urls : []),
    ...sourceUrls,
  ].map(validHttpUrl).filter((url, index, list) => url && list.indexOf(url) === index);
  if (urls.length) merged.source_urls = urls.slice(0, 12);
  merged.research_status = cleanText(existing?.research_status || "generated_practical_fallback").slice(0, 80);
  merged.updated_at = cleanText(existing?.updated_at || new Date().toISOString());
  return merged;
}

function eventSource(value = {}) {
  const nested = value?.event_intel;
  return nested && typeof nested === "object" && !Array.isArray(nested) ? nested : value || {};
}

export function buildEventIntelFallback(event = {}) {
  const source = eventSource(event);
  const haystack = `${event?.name || ""} ${event?.description || ""} ${event?.vibe || ""}`.toLowerCase();
  const isPride = /pride|orgullo|csd|marche des fiert|parade|march/.test(haystack);
  const isFestival = /festival|week|carnival|mardi gras|celebration|conference/.test(haystack);
  const isParty = /party|club|dance|circuit|night|rave|disco|ball/.test(haystack);
  const isShow = /show|drag|cabaret|performance|concert|theatre|theater/.test(haystack);
  const isFetish = /fetish|leather|rubber|bdsm|folsom|snax|bear/.test(haystack);
  const isWomen = /women|woman|lesbian|sapphic|dyke|wlw|sweetheat/.test(haystack);
  const isTrans = /trans|nonbinary|non-binary|gender diverse/.test(haystack);
  const isBlack = /black pride|afro|poc|people of colo/.test(haystack);
  const hasDate = Boolean(String(event?.date || event?.start_date || event?.startDate || "").trim());

  let bestArrival = "Check the current programme and arrive 30-60 minutes before the first activity you want to attend.";
  if (!hasDate) bestArrival = "Confirm the current date and programme first; arrive 30-60 minutes before the published start once announced.";
  else if (isPride) bestArrival = "Arrive 45-90 minutes before the published assembly or route start; access and transport become slower as crowds build.";
  else if (isParty) bestArrival = "Arrive before the late-night peak or within the first ticket window; same-day promoter guidance should take priority.";
  else if (isShow) bestArrival = "Arrive 30-45 minutes before showtime for ticket checks, seating and any cloakroom queue.";

  let crowdMix = "LGBTQ+ locals, friends, allies and visitors; the balance varies by host, city, ticket price and programme.";
  if (isWomen) crowdMix = "Queer women and sapphic communities are the clearest focus, with trans, nonbinary guests, friends and allies depending on the programme.";
  else if (isTrans) crowdMix = "Trans and gender-diverse communities are central, alongside broader LGBTQ+ guests, supporters and visitors.";
  else if (isBlack) crowdMix = "Black LGBTQ+ communities and diaspora audiences are central, alongside broader queer guests, friends and allies.";
  else if (isFetish) crowdMix = "Primarily LGBTQ+ fetish, leather or bear communities, with the exact gender and access mix set by each announced event.";
  else if (isPride || isFestival) crowdMix = "A broad LGBTQ+ community mix across ages and identities, plus local supporters and domestic or international visitors.";

  let dressCode = "Comfortable event-appropriate clothing and practical footwear are the safest choice; check the promoter for any theme or prohibited items.";
  if (isPride) dressCode = "Expressive Pride clothing is common; add weather protection, comfortable shoes and only items allowed by the published security policy.";
  else if (isFetish) dressCode = "Read the exact event rules: fetishwear, leather, rubber, sportswear or another themed look may be encouraged or required.";
  else if (isParty) dressCode = "Dance-ready casual or expressive clothing and photo ID are practical; the promoter may apply a theme or door policy.";

  const fallback = {
    entry_wait: isFestival || isPride
      ? "No dependable average wait is published. Ticket, bag and security checks can create queues at opening and headline periods, so allow extra time."
      : "No dependable average wait is published. Ticket checks and peak arrival periods can create a short queue, so earlier arrival is safer.",
    best_arrival: bestArrival,
    crowd_mix: crowdMix,
    dress_code: dressCode,
    host_inclusivity: "The LGBTQ+ positioning is explicit, but individual host, security and accessibility experiences can vary; check current policies and contact the organiser for specific needs.",
  };

  return mergeIntel(fallback, source, [event?.link, event?.ticket_url, event?.ticketUrl]);
}

function serviceSource(value = {}) {
  const nested = value?.service_intel;
  return nested && typeof nested === "object" && !Array.isArray(nested) ? nested : value || {};
}

export function buildServiceIntelFallback(service = {}) {
  const source = serviceSource(service);
  const type = String(service?.type || "").trim().toLowerCase();
  const haystack = `${service?.name || ""} ${service?.description || ""} ${type}`.toLowerCase();
  const isMassage = /massage|spa|wellness|therapy|therapist/.test(haystack);
  const isTour = /tour|guide|excursion|experience/.test(haystack);
  const isTransport = /transport|transfer|taxi|driver|ride/.test(haystack);
  const isSupport = /health|clinic|support|community|centre|center|hiv|legal|counsel/.test(haystack);
  const isShop = /shop|store|retail|boutique/.test(haystack) || type === "gay_store";
  const isEscort = /escort|companion/.test(haystack) || type === "escort";

  let bookingLeadTime = "Contact the provider at least 24-48 hours ahead; same-day availability is not guaranteed and no dependable public booking pattern is published.";
  let bestTime = "Choose the time confirmed directly by the provider; weekday or earlier appointments are often easier to coordinate than peak weekends.";
  let clientMix = "LGBTQ+ residents and visitors who need this service; no credible fixed local-versus-tourist or identity breakdown is published.";
  let preparation = "Confirm price, scope, address, cancellation terms, accessibility and payment method before travelling; bring any requested identification or documents.";

  if (isMassage) {
    bookingLeadTime = "Book 24-72 hours ahead for a preferred practitioner or evening slot; same-day appointments may exist but should not be assumed.";
    bestTime = "A quieter weekday or early appointment usually allows more flexibility; confirm treatment length and practitioner availability directly.";
    preparation = "Confirm treatment boundaries, price, duration and health considerations; arrive clean and disclose injuries, allergies or accessibility needs.";
  } else if (isTour) {
    bookingLeadTime = "Reserve several days ahead, and earlier for weekends, Pride periods or private-language requests; minimum group sizes may apply.";
    bestTime = "Use the provider's confirmed departure; daylight departures are the safest default when routes or meeting points are unfamiliar.";
    preparation = "Bring the booking confirmation, weather protection, water, comfortable footwear and any ID or ticket requested by the guide.";
  } else if (isTransport) {
    bookingLeadTime = "Pre-book once arrival details are fixed, especially for airports, late-night pickups or large events; reconfirm on the travel day.";
    bestTime = "Allow buffer around flights and event closing times; use the provider's confirmed pickup window rather than an informal estimate.";
    preparation = "Share the exact pickup point, passenger count and luggage needs; keep the booking reference and destination available offline.";
  } else if (isSupport) {
    bookingLeadTime = "Check current drop-in or appointment rules before visiting; urgent, testing and counselling services can use different intake systems.";
    bestTime = "Use the organisation's current service hours and arrive before the final intake window; contact them first for urgent or specialist needs.";
    clientMix = "LGBTQ+ community members and people seeking health, legal, social or peer support; eligibility can vary by programme.";
    preparation = "Bring only documents the organisation requests and ask about confidentiality, language, accessibility and fees before sharing sensitive information.";
  } else if (isShop) {
    bookingLeadTime = "Normally walk-in during published hours; contact ahead for specialist stock, fittings, discreet collection or a specific staff member.";
    bestTime = "Weekday daytime is generally quieter; verify current opening hours before a special journey.";
    preparation = "Check stock, sizing, returns, payment and privacy options in advance when the purchase is specialised or time-sensitive.";
  } else if (isEscort) {
    bookingLeadTime = "Discuss availability well ahead and never rely on an unverified same-day listing; confirm identity, boundaries, rate, duration and cancellation terms.";
    bestTime = "Use only a mutually confirmed time and safe meeting plan; avoid rushed arrangements and keep independent transport available.";
    clientMix = "Adults seeking a mutually agreed service; suitability depends on the provider's stated boundaries, legal context and consent.";
    preparation = "Agree boundaries, safer-sex expectations, price, duration, privacy and a check-in plan beforehand; do not send unnecessary identity or financial data.";
  }

  const fallback = {
    booking_lead_time: bookingLeadTime,
    best_time: bestTime,
    client_mix: clientMix,
    preparation,
    provider_inclusivity: "The service is listed for LGBTQ+ users, but independent evidence about staff training and inclusion is limited; confirm pronouns, privacy, accessibility and specific needs directly.",
  };

  return mergeIntel(fallback, source, [service?.link, service?.booking_link, service?.bookingLink]);
}
