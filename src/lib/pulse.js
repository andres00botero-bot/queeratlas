export const PULSE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "rising_spot", label: "Rising spots" },
  { key: "rights_safety", label: "Rights & safety" },
  { key: "nightlife_change", label: "Openings / closures" },
  { key: "major_event", label: "Major events" },
  { key: "culture_tip", label: "Culture tips" },
];

export const EDITORIAL_PULSE_ITEMS = [
  {
    id: "pulse-rights-eu-travel-01",
    category: "rights_safety",
    title: "Before you land: verify legal climate, not just nightlife",
    city: "Multi-city",
    country: "Global",
    date: "2026-04-09",
    summary:
      "Queer travelers are increasingly cross-checking legal and social conditions before booking trips, especially for trans and non-binary safety.",
    whyItMatters:
      "A city can be party-friendly while still having legal or social friction. A quick rights/safety check can completely change route choices.",
    sourceName: "Queer Atlas editorial",
  },
  {
    id: "pulse-culture-nightflow-01",
    category: "culture_tip",
    title: "Best city strategy right now: soft start, hard finish",
    city: "Multi-city",
    country: "Global",
    date: "2026-04-06",
    summary:
      "High-signal members are using two-step nights: early social venue to read crowd energy, then one deliberate late move.",
    whyItMatters:
      "This lowers bad-night risk, improves safety, and usually leads to better social outcomes than random hopping.",
    sourceName: "Queer Atlas community",
  },
  {
    id: "pulse-major-pride-cycle-01",
    category: "major_event",
    title: "Pride-season planning windows are opening earlier",
    city: "Europe / North America",
    country: "Regional",
    date: "2026-04-08",
    summary:
      "Members are locking accommodation and key tickets earlier than previous years in top destinations.",
    whyItMatters:
      "Late decisions now cost more and reduce choice quality. Early planning keeps freedom high and stress low.",
    sourceName: "Atlas planning signals",
  },
];

const GERMAN_PULSE_COPY = {
  "pulse-rights-eu-travel-01": { title: "Vor der Anreise: Rechtslage prüfen, nicht nur das Nachtleben", city: "Mehrere Städte", country: "Weltweit", summary: "Queere Reisende prüfen vor einer Buchung zunehmend rechtliche und gesellschaftliche Bedingungen – besonders mit Blick auf die Sicherheit von trans und nichtbinären Menschen.", whyItMatters: "Eine Stadt kann partyfreundlich sein und trotzdem rechtliche oder soziale Hürden haben. Ein kurzer Rechte- und Sicherheitscheck kann die gesamte Routenplanung verändern.", sourceName: "Queer-Atlas-Redaktion" },
  "pulse-culture-nightflow-01": { title: "Die beste Strategie für die Nacht: ruhig anfangen, bewusst enden", city: "Mehrere Städte", country: "Weltweit", summary: "Mitglieder mit gutem Ortsgefühl setzen auf Abende in zwei Schritten: erst ein sozialer Ort, um die Stimmung zu lesen, danach ein gezielter später Wechsel.", whyItMatters: "Das senkt das Risiko eines schlechten Abends, erhöht die Sicherheit und führt meist zu besseren sozialen Begegnungen als planloses Weiterziehen.", sourceName: "Queer-Atlas-Community" },
  "pulse-major-pride-cycle-01": { title: "Die Planungsfenster für die Pride-Saison öffnen früher", city: "Europa / Nordamerika", country: "Regional", summary: "Mitglieder buchen Unterkünfte und wichtige Tickets in den gefragtesten Zielen früher als in den Vorjahren.", whyItMatters: "Späte Entscheidungen kosten inzwischen mehr und lassen weniger Auswahl. Früh zu planen erhält Freiheit und senkt Stress.", sourceName: "Atlas-Planungssignale" },
};

export function getPulseCategories(locale) {
  if (locale !== "de") return PULSE_CATEGORIES;
  const labels = { all: "Alle", rising_spot: "Aufstrebende Orte", rights_safety: "Rechte & Sicherheit", nightlife_change: "Eröffnungen / Schließungen", major_event: "Große Events", culture_tip: "Kultur & Lifestyle" };
  return PULSE_CATEGORIES.map((category) => ({ ...category, label: labels[category.key] || category.label }));
}

export function getEditorialPulseItems(locale) {
  if (locale !== "de") return EDITORIAL_PULSE_ITEMS;
  return EDITORIAL_PULSE_ITEMS.map((item) => ({ ...item, ...(GERMAN_PULSE_COPY[item.id] || {}) }));
}

