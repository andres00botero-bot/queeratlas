import { chromium } from "playwright";

const BASE_URL = String(process.env.BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
const CITY_CANDIDATES = String(
  process.env.EVENT_ENTITY_TEST_CITIES || "bilbao,tallinn,naples,cancun,phnom_penh"
)
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);
const MIN_PASSING_CITIES = Number(process.env.EVENT_ENTITY_TEST_MIN_PASSING || 3);

function asErrorMessage(error) {
  return String(error?.message || error || "Unknown error");
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

  await context.close();
  await browser.close();

  const passing = results.filter((row) => row.ok).length;
  const failingRows = results.filter((row) => !row.ok);

  if (passing < MIN_PASSING_CITIES || failingRows.length > 0) {
    console.error("Event entity E2E check failed.");
    console.error(
      JSON.stringify(
        {
          baseUrl: BASE_URL,
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
