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

function run() {
  checkNoMergeMarkers("package.json");
  checkNoMergeMarkers("src/lib/seedContent.js");
  checkNoMergeMarkers("src/lib/cities.js");
  checkNoMergeMarkers("src/app/events/page.js");
  checkNoMergeMarkers("src/app/[city]/page.js");

  checkNoTravelGay("src/lib/seedContent.js");
  checkNoTravelGay("scripts/verified-city-venues.json");

  checkNoDesktopMirrorFiles();

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
