export const QA_SITE_URL = "https://www.queeratlas.app";

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isoDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function alternateLinks(languages = {}) {
  return Object.entries(languages)
    .filter(([, url]) => Boolean(url))
    .map(([language, url]) => `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(url)}"/>`)
    .join("");
}

export function buildUrlSetXml(entries = []) {
  const urls = entries.map((entry) => {
    const lastModified = isoDate(entry?.lastModified);
    const parts = [`<loc>${escapeXml(entry?.url)}</loc>`];
    if (entry?.languages) parts.push(alternateLinks(entry.languages));
    if (lastModified) parts.push(`<lastmod>${lastModified}</lastmod>`);
    if (entry?.changeFrequency) parts.push(`<changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`);
    if (Number.isFinite(Number(entry?.priority))) parts.push(`<priority>${Number(entry.priority).toFixed(2)}</priority>`);
    return `<url>${parts.join("")}</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>`;
}

export function buildSitemapIndexXml(paths = []) {
  const entries = paths.map((path) => `<sitemap><loc>${escapeXml(`${QA_SITE_URL}${path}`)}</loc></sitemap>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</sitemapindex>`;
}

export function xmlResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=86400",
    },
  });
}

export function sitemapUnavailableResponse() {
  return new Response("Sitemap source is temporarily unavailable.", {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60",
      "Retry-After": "300",
    },
  });
}
