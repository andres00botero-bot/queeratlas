// First Search Console cohort: 13 Aug–9 Sep 2026, high impressions and no clicks.
// Keep the rollout scoped so unrelated pages remain a useful comparison group.
const reviewedEntities = new Set([
  "venue:asuncion:926",
  "venue:asuncion:seed-place-asuncion-menstetic",
  "venue:tallinn:975",
  "venue:cyprus:1483",
  "venue:cyprus:seed-place-cyprus-lube-bar",
  "venue:glasgow:1359",
  "event:copenhagen:941",
  "event:puerto_vallarta:1049",
]);

const text = (value) => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

export function getEntitySearchCopy({ kind, city, cityName, entity }) {
  if (!entity || !reviewedEntities.has(`${kind}:${city}:${entity.id}`)) return null;
  const name = text(entity.name);
  const destination = text(cityName);
  if (!name || !destination) return null;

  const details = [];
  if (kind === "venue" && text(entity.hours)) details.push("listed opening hours");
  if (text(entity.location)) details.push("location details");
  details.push("visitor guidance");
  if (text(entity.link)) details.push("the official page");
  const list = details.length > 1
    ? `${details.slice(0, -1).join(", ")} and ${details.at(-1)}`
    : details[0];
  const date = kind === "event" ? text(entity.startDate) : "";
  const description = `${name} in ${destination}.${date ? ` Listed start date: ${date}.` : ""} Find ${list}.`;

  return {
    title: `${name}, ${destination} | Queer Atlas`,
    description,
  };
}
