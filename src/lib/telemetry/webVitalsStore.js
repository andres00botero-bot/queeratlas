const STORAGE_KEY = "qa_seo_web_vitals_v1";
const MAX_SAMPLES = 500;
const VITAL_NAMES = new Set(["LCP", "INP", "CLS", "TTFB", "FCP"]);

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStoredSamples(rawValue) {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readSamples() {
  if (!isBrowser()) return [];
  return parseStoredSamples(window.localStorage.getItem(STORAGE_KEY));
}

function writeSamples(samples) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(samples.slice(-MAX_SAMPLES)));
}

function sanitizeSample(sample = {}) {
  const vitalName = String(sample.name || "").toUpperCase();
  if (!VITAL_NAMES.has(vitalName)) return null;

  return {
    id: String(sample.id || ""),
    name: vitalName,
    value: Number(sample.value || 0),
    rating: String(sample.rating || ""),
    route: String(sample.route || ""),
    href: String(sample.href || ""),
    ts: String(sample.ts || new Date().toISOString()),
  };
}

export function appendWebVitalSample(sample) {
  const sanitized = sanitizeSample(sample);
  if (!sanitized || !isBrowser()) return null;
  const current = readSamples();
  current.push(sanitized);
  writeSamples(current);
  return sanitized;
}

export function readWebVitalSamples() {
  return readSamples();
}

export function clearWebVitalSamples() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function summarizeWebVitalSamples(samples = []) {
  const rowsByRoute = new Map();

  for (const sample of samples) {
    const route = String(sample.route || "/");
    if (!rowsByRoute.has(route)) {
      rowsByRoute.set(route, {
        route,
        samples: 0,
        LCP: [],
        INP: [],
        CLS: [],
        TTFB: [],
        FCP: [],
      });
    }
    const row = rowsByRoute.get(route);
    row.samples += 1;
    if (Array.isArray(row[sample.name])) {
      row[sample.name].push(Number(sample.value || 0));
    }
  }

  const p75 = (values) => {
    if (!values || values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.75) - 1));
    return sorted[index];
  };

  return [...rowsByRoute.values()]
    .map((row) => ({
      route: row.route,
      samples: row.samples,
      lcpP75: p75(row.LCP),
      inpP75: p75(row.INP),
      clsP75: p75(row.CLS),
      ttfbP75: p75(row.TTFB),
      fcpP75: p75(row.FCP),
    }))
    .sort((a, b) => b.samples - a.samples);
}
