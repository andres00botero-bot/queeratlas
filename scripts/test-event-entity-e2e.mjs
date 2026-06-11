import { chromium } from "playwright";

const BASE_URL = String(process.env.BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
const ROUTE_CANDIDATES = String(
  process.env.EVENT_ENTITY_TEST_PATHS ||
    "/bilbao/events/zinegoak-2026--seed-event-bilbao-zinegoak-2026,/tallinn/events/baltic-pride-tallinn-2026--seed-event-tallinn-baltic-pride-week-2026,/naples/events/napoli-pride-2026--seed-event-naples-pride-2026,/cancun/events/cancun-pride-march-2026--seed-event-cancun-pride-march-2026,/phnom_penh/events/pride-fest-cambodia-2026--seed-event-phnompenh-pride-fest-2026"
)
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
const CITY_CANDIDATES = String(
  process.env.EVENT_ENTITY_TEST_CITIES || "bilbao,tallinn,naples,cancun,phnom_penh"
)
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
const MIN_PASSING_CITIES = Number(process.env.EVENT_ENTITY_TEST_MIN_PASSING || 3);
const STRICT_ALL = String(process.env.EVENT_ENTITY_TEST_STRICT || "").toLowerCase() === "true";

function asErrorMessage(error) {
  return String(error?.message || error || "Unknown error");
}

function parseEventPath(pathname = "") {
  const raw = String(pathname || "");
  const marker = "/events/";
  const idx = raw.indexOf(marker);
  if (idx === -1) return { citySlug: "", nameSlug: "" };
  const citySlug = raw.slice(1, idx).replace(/^\/+|\/+$/g, "");
  const eventSlug = raw.slice(idx + marker.length).replace(/^\/+|\/+$/g, "");
  const dividerIndex = eventSlug.lastIndexOf("--");
  const nameSlug = dividerIndex === -1 ? eventSlug : eventSlug.slice(0, dividerIndex);
  return { citySlug, nameSlug };
}

function canonicalMatchesEventPath({ currentPath = "", canonicalHref = "" }) {
  const { citySlug, nameSlug } = parseEventPath(currentPath);
  if (!citySlug || !nameSlug) return false;

  let canonicalPath = "";
  try {
    canonicalPath = new URL(String(canonicalHref || ""), BASE_URL).pathname;
  } catch {
    canonicalPath = String(canonicalHref || "");
  }
  const normalizedCanonical = String(canonicalPath || "").replace(/\/+$/, "");
  const normalizedCurrent = String(currentPath || "").replace(/\/+$/, "");
  if (normalizedCanonical === normalizedCurrent) return true;

  const canonicalPrefix = `/${citySlug}/events/${nameSlug}--`;
  return normalizedCanonical.startsWith(canonicalPrefix);
}

async function waitForEventLinks(page, timeoutMs = 12000) {
  const start = Date.now();
  const links = page.getByRole("link", { name: "Event page" });
  while (Date.now() - start < timeoutMs) {
    const count = await links.count();
    if (count > 0) return count;
    await page.waitForTimeout(600);
  }
  return links.count();
}

async function verifyEventEntityByPath(page, path) {
  const eventUrl = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  await page.goto(eventUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(800);

  const currentUrl = new URL(page.url());
  const canonicalHref = await page.locator('link[rel="canonical"]').first().getAttribute("href");
  const hasEventJsonLd = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
    nodes.some((node) => {
      const raw = node.textContent || "";
      return raw.includes('"@type":"Event"') || raw.includes('"@type": "Event"');
    })
  );
  const hasH1 = (await page.locator("h1").count()) > 0;
  const canonicalOk = canonicalMatchesEventPath({
    currentPath: currentUrl.pathname,
    canonicalHref,
  });

  if (!canonicalOk || !hasEventJsonLd || !hasH1) {
    return {
      path,
      ok: false,
      reason: `Entity page validation failed (canonicalOk=${canonicalOk}, eventJsonLd=${hasEventJsonLd}, hasH1=${hasH1})`,
      currentPath: currentUrl.pathname,
      canonicalHref,
    };
  }

  return {
    path,
    ok: true,
    currentPath: currentUrl.pathname,
  };
}

async function verifyCityEventEntity(page, city) {
  const cityUrl = `${BASE_URL}/${city}`;
  await page.goto(cityUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(1000);

  const eventPageLinks = page.getByRole("link", { name: "Event page" });
  let linkCount = await waitForEventLinks(page, 7000);
  if (linkCount === 0) {
    const eventsButtons = page.getByRole("button", { name: /^Events$/i });
    const buttonCount = await eventsButtons.count();
    for (let i = 0; i < buttonCount; i += 1) {
      await eventsButtons
        .nth(i)
        .click({ timeout: 7000 })
        .catch(() => null);
      linkCount = await waitForEventLinks(page, 8000);
      if (linkCount > 0) break;
    }
  }

  if (linkCount === 0) {
    return {
      city,
      ok: false,
      reason: "No Event page link found in hydrated city view",
    };
  }

  const firstLink = eventPageLinks.first();
  const href = await firstLink.getAttribute("href");
  if (!href || !href.includes("/events/")) {
    return {
      city,
      ok: false,
      reason: `Invalid event detail href: ${String(href || "")}`,
    };
  }

  await firstLink.click({ timeout: 20000 });
  await page.waitForURL("**/events/**", { timeout: 20000 });

  const currentUrl = new URL(page.url());
  const canonicalHref = await page.locator('link[rel="canonical"]').first().getAttribute("href");
  const hasEventJsonLd = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
    nodes.some((node) => {
      const raw = node.textContent || "";
      return raw.includes('"@type":"Event"') || raw.includes('"@type": "Event"');
    })
  );
  const hasH1 = (await page.locator("h1").count()) > 0;

  const canonicalOk =
    typeof canonicalHref === "string" &&
    (canonicalHref.endsWith(currentUrl.pathname) || canonicalHref === currentUrl.pathname);

  if (!canonicalOk || !hasEventJsonLd || !hasH1) {
    return {
      city,
      ok: false,
      reason: `Entity page validation failed (canonicalOk=${canonicalOk}, eventJsonLd=${hasEventJsonLd}, hasH1=${hasH1})`,
      href,
      currentPath: currentUrl.pathname,
      canonicalHref,
    };
  }

  return {
    city,
    ok: true,
    href,
    currentPath: currentUrl.pathname,
  };
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  if (ROUTE_CANDIDATES.length > 0) {
    for (const path of ROUTE_CANDIDATES) {
      try {
        const result = await verifyEventEntityByPath(page, path);
        results.push(result);
      } catch (error) {
        results.push({
          path,
          ok: false,
          reason: asErrorMessage(error),
        });
      }
    }
  } else {
    for (const city of CITY_CANDIDATES) {
      try {
        const result = await verifyCityEventEntity(page, city);
        results.push(result);
      } catch (error) {
        results.push({
          city,
          ok: false,
          reason: asErrorMessage(error),
        });
      }
    }
  }

  await context.close();
  await browser.close();

  const passing = results.filter((row) => row.ok).length;
  const failingRows = results.filter((row) => !row.ok);

  const shouldFail = STRICT_ALL
    ? passing < MIN_PASSING_CITIES || failingRows.length > 0
    : passing < MIN_PASSING_CITIES;

  if (shouldFail) {
    console.error("Event entity E2E check failed.");
    console.error(
      JSON.stringify(
        {
          baseUrl: BASE_URL,
          strictAll: STRICT_ALL,
          minPassingCities: MIN_PASSING_CITIES,
          passing,
          total: results.length,
          results,
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl: BASE_URL,
        strictAll: STRICT_ALL,
        passing,
        total: results.length,
        results,
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error("Event entity E2E check crashed.");
  console.error(asErrorMessage(error));
  process.exit(1);
});
