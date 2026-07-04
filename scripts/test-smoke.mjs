import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function readText(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function checkNoMergeMarkers(filePath) {
  const content = readText(filePath);
  const hasMarker =
    content.includes("<<<<<<< ") ||
    content.includes("=======") ||
    content.includes(">>>>>>> ");
  assert(!hasMarker, `${filePath}: contains merge conflict markers`);
}

function checkNoTravelGay(filePath) {
  const content = readText(filePath);
  assert(
    !/travelgay/i.test(content),
    `${filePath}: contains forbidden TravelGay reference`
  );
}

function checkNoDesktopMirrorFiles() {
  const mirroredPaths = [
    "Desktop/Websida/gay-guide/.qa_temp_clone/src/components/planner/TripPlannerV2.js",
    "Desktop/Websida/gay-guide/.qa_temp_clone/src/lib/cities.js",
    "Desktop/Websida/gay-guide/.qa_temp_clone/src/lib/seedContent.js",
    "Desktop/Websida/gay-guide/src/components/planner/TripPlannerV2.js",
    "Desktop/Websida/gay-guide/src/lib/cities.js",
    "Desktop/Websida/gay-guide/src/lib/seedContent.js",
  ];
  const mirrored = mirroredPaths.filter((p) => fs.existsSync(path.join(root, p)));
  assert(
    mirrored.length === 0,
    `workspace contains mirrored Desktop/* paths: ${mirrored.join(", ")}`
  );
}

function checkCanonicalDomainConfig() {
  const canonicalOrigin = "https://www.queeratlas.app";
  const nextConfig = readText("next.config.mjs");
  const entityAuthority = readText("src/lib/seo/entityAuthority.js");
  const robots = readText("src/app/robots.js");
  const sitemap = readText("src/app/sitemap.js");

  assert(
    !nextConfig.includes('type: "host"'),
    "next.config.mjs: host redirects must be managed by Vercel to avoid redirect loops"
  );
  assert(
    entityAuthority.includes(`QA_SITE_URL = "${canonicalOrigin}"`),
    "src/lib/seo/entityAuthority.js: canonical origin must use www"
  );
  assert(
    robots.includes(`host: "${canonicalOrigin}"`) &&
      robots.includes(`sitemap: "${canonicalOrigin}/sitemap.xml"`),
    "src/app/robots.js: host and sitemap must use the canonical www origin"
  );
  assert(
    sitemap.includes(`BASE_URL = "${canonicalOrigin}"`),
    "src/app/sitemap.js: sitemap URLs must use the canonical www origin"
  );
}

function checkCityEventsIndexRedirect() {
  const redirectRoute = readText("src/app/[city]/events/page.js");

  assert(
    redirectRoute.includes("permanentRedirect") &&
      redirectRoute.includes("?section=events"),
    "src/app/[city]/events/page.js: city events index URLs must permanently redirect to the city events section"
  );
}

function run() {
  checkNoMergeMarkers("package.json");
  checkNoMergeMarkers("src/lib/seedContent.js");
  checkNoMergeMarkers("src/lib/cities.js");
  checkNoMergeMarkers("src/app/events/page.js");
  checkNoMergeMarkers("src/app/[city]/page.js");

  checkNoTravelGay("src/lib/seedContent.js");
  checkNoTravelGay("scripts/verified-city-venues.json");

  checkNoDesktopMirrorFiles();
  checkCanonicalDomainConfig();
  checkCityEventsIndexRedirect();

  if (failures.length > 0) {
    console.error("Smoke test failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Smoke test passed.");
}

run();
