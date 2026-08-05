import { mkdir, readFile, writeFile } from "node:fs/promises";

const WEB_CACHE_PATH = ".tmp/venue-web-research.json";
const PAGE_CACHE_PATH = ".tmp/venue-review-page-cache.json";
const workerCount = Number(process.argv.find((arg) => arg.startsWith("--workers="))?.split("=")[1] || 4);
const refresh = process.argv.includes("--refresh");

const REJECT_HOST = /(?:wikipedia\.org|wikihow\.com|pinterest\.|youtube\.|tiktok\.|spotify\.|musicbrainz\.|discogs\.|amazon\.)$/i;

function clean(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function hostname(url = "") {
  try { return new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; }
}

function htmlToText(html = "") {
  return clean(String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&ndash;/gi, "–").replace(/&mdash;/gi, "—")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number))));
}

async function readJson(filePath) {
  try { return JSON.parse(await readFile(filePath, "utf8")); } catch { return {}; }
}

async function saveCache(cache) {
  await mkdir(".tmp", { recursive: true });
  await writeFile(PAGE_CACHE_PATH, JSON.stringify(cache), "utf8");
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; QueerAtlasEditorialResearch/1.0)",
        "accept-language": "en-US,en;q=0.8",
      },
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
      return { ok: false, status: response.status, final_url: response.url, text: "", fetched_at: new Date().toISOString() };
    }
    const html = (await response.text()).slice(0, 2_000_000);
    return {
      ok: true,
      status: response.status,
      final_url: response.url,
      text: htmlToText(html).slice(0, 160000),
      fetched_at: new Date().toISOString(),
    };
  } catch (error) {
    return { ok: false, status: 0, error: error?.name || "fetch_error", text: "", fetched_at: new Date().toISOString() };
  } finally {
    clearTimeout(timeout);
  }
}

const [webCache, existing] = await Promise.all([readJson(WEB_CACHE_PATH), refresh ? {} : readJson(PAGE_CACHE_PATH)]);
const urls = [...new Set(Object.values(webCache).flatMap((item) => item?.results || []).map((result) => result.url))]
  .filter((url) => /^https?:\/\//i.test(url || "") && !REJECT_HOST.test(hostname(url)));
const pending = urls.filter((url) => !existing[url]);

console.log(JSON.stringify({ discovered_urls: urls.length, cached: urls.length - pending.length, pending: pending.length }));

let cursor = 0;
let completed = 0;
async function worker() {
  while (cursor < pending.length) {
    const url = pending[cursor++];
    existing[url] = await fetchPage(url);
    completed += 1;
    if (completed % 25 === 0 || completed === pending.length) {
      console.log(`review page fetch ${completed}/${pending.length}`);
      await saveCache(existing);
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
}

await Promise.all(Array.from({ length: Math.max(1, workerCount) }, worker));
await saveCache(existing);

const selected = urls.map((url) => existing[url]).filter(Boolean);
console.log(JSON.stringify({
  fetched: selected.length,
  readable: selected.filter((item) => item.ok && item.text).length,
  unavailable: selected.filter((item) => !item.ok || !item.text).length,
}, null, 2));
