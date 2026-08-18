import { normalizeQariProfile } from "./qari.js";

// Phase 0 editorial pilot. Scores express traveller risk (0 lower, 100 extreme),
// not how "queer-friendly" a population is. Database rows may supersede these
// reviewed baselines after the matching methodology version is published.
const RAW_PILOT_PROFILES = [
  {
    destinationKey: "country:spain",
    scopeType: "country",
    country: "Spain",
    legalRisk: 12,
    socialRisk: 18,
    digitalRisk: 8,
    qariScore: 13,
    confidence: "high",
    summary: "Strong legal protection and broad urban visibility make Spain a lower-risk baseline, while ordinary nightlife and hate-incident awareness still matters.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "ILGA-Europe · Spain 2026", url: "https://rainbowmap.ilga-europe.org/countries/spain/" },
      { axis: "social", label: "ILGA-Europe annual review", url: "https://www.ilga-europe.org/report/annual-review-2026/" },
      { axis: "digital", label: "ILGA World legal database", url: "https://database.ilga.org/" },
    ],
  },
  {
    destinationKey: "country:canada",
    scopeType: "country",
    country: "Canada",
    legalRisk: 9,
    socialRisk: 23,
    digitalRisk: 8,
    qariScore: 14,
    confidence: "high",
    summary: "Canada combines strong equality law with highly visible queer life; rising reported hate and event-security pressure keep the score above zero.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "Government of Canada · LGBTI rights", url: "https://www.canada.ca/en/canadian-heritage/services/rights-lgbti-persons.html" },
      { axis: "social", label: "Canada · community safety support", url: "https://www.canada.ca/en/women-gender-equality/news/2026/06/federal-government-strengthens-support-to-keep-2slgbtqi-communities-safe-this-pride-season.html" },
      { axis: "digital", label: "ILGA World legal database", url: "https://database.ilga.org/" },
    ],
  },
  {
    destinationKey: "country:germany",
    scopeType: "country",
    country: "Germany",
    legalRisk: 12,
    socialRisk: 24,
    digitalRisk: 8,
    qariScore: 16,
    confidence: "high",
    summary: "Strong rights and deeply established queer city life make Germany a lower-risk baseline, while rising hate incidents still call for ordinary situational awareness.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "ILGA-Europe · Germany 2026", url: "https://rainbowmap.ilga-europe.org/countries/germany/" },
      { axis: "social", label: "ILGA-Europe · Germany annual review", url: "https://rainbowmap.ilga-europe.org/countries/germany/" },
      { axis: "digital", label: "ILGA World legal database", url: "https://database.ilga.org/" },
    ],
  },
  {
    destinationKey: "country:brazil",
    scopeType: "country",
    country: "Brazil",
    legalRisk: 16,
    socialRisk: 48,
    digitalRisk: 34,
    qariScore: 33,
    confidence: "medium",
    summary: "Equal rights and huge queer city life coexist with documented violence, harassment and dating-app robberies; urban context and meeting plans matter.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "ILGA World legal database", url: "https://database.ilga.org/" },
      { axis: "social", label: "UK travel advice · Brazil", url: "https://www.gov.uk/foreign-travel-advice/brazil/safety-and-security" },
      { axis: "digital", label: "UK travel advice · dating-app crime", url: "https://www.gov.uk/foreign-travel-advice/brazil/safety-and-security" },
    ],
  },
  {
    destinationKey: "country:namibia",
    scopeType: "country",
    country: "Namibia",
    legalRisk: 52,
    socialRisk: 55,
    digitalRisk: 30,
    qariScore: 48,
    confidence: "medium",
    summary: "Decriminalisation was a major legal shift, but limited protection and conservative attitudes mean discretion can still be useful outside trusted spaces.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "ILGA World · 2025 legal update", url: "https://ilga.org/news/pride-month-2025-lgbti-data-maps/" },
      { axis: "social", label: "UK travel advice · Namibia", url: "https://www.gov.uk/foreign-travel-advice/namibia/safety-and-security" },
      { axis: "digital", label: "UK country policy note · Namibia", url: "https://www.gov.uk/government/publications/namibia-country-policy-and-information-notes/country-information-and-guidance-sexual-orientation-and-gender-identity-and-expression-in-namibia-accessible-version" },
    ],
  },
  {
    destinationKey: "country:turkey",
    scopeType: "country",
    country: "Turkey",
    legalRisk: 68,
    socialRisk: 64,
    digitalRisk: 70,
    qariScore: 67,
    confidence: "medium",
    summary: "Same-sex relations are legal, yet weak protection, restrictions on public queer organising and enforcement uncertainty make careful planning important.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "ILGA-Europe · Turkey", url: "https://rainbowmap.ilga-europe.org/countries/turkey/" },
      { axis: "social", label: "ILGA-Europe annual review", url: "https://www.ilga-europe.org/report/annual-review-2026/" },
      { axis: "digital", label: "UK travel advice · Turkey", url: "https://www.gov.uk/foreign-travel-advice/turkey/safety-and-security" },
    ],
  },
  {
    destinationKey: "country:egypt",
    scopeType: "country",
    country: "Egypt",
    legalRisk: 86,
    socialRisk: 85,
    digitalRisk: 92,
    riskFloor: 72,
    qariScore: 87,
    confidence: "high",
    summary: "De facto criminalisation, arrests under morality laws and documented online entrapment make identity exposure and digital traces serious practical risks.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "ILGA World · Laws on Us", url: "https://ilga.org/laws-on-us-report/" },
      { axis: "social", label: "UK travel advice · Egypt", url: "https://www.gov.uk/foreign-travel-advice/egypt/safety-and-security" },
      { axis: "digital", label: "UK travel advice · social media risk", url: "https://www.gov.uk/foreign-travel-advice/egypt/safety-and-security" },
    ],
  },
  {
    destinationKey: "country:russia",
    scopeType: "country",
    country: "Russia",
    legalRisk: 92,
    socialRisk: 90,
    digitalRisk: 96,
    riskFloor: 80,
    qariScore: 92,
    confidence: "high",
    summary: "Extremism and so-called propaganda rules create severe legal, public-expression and digital exposure risks, including detention and prosecution.",
    reviewedAt: "2026-08-18",
    sources: [
      { axis: "legal", label: "ILGA World legal database", url: "https://database.ilga.org/" },
      { axis: "social", label: "UK country policy note · Russia", url: "https://www.gov.uk/government/publications/russia-country-policy-and-information-notes/country-policy-and-information-note-sexual-orientation-and-gender-identity-and-expression-june-2025-accessible" },
      { axis: "digital", label: "UK travel advice · Russia", url: "https://www.gov.uk/foreign-travel-advice/russia/safety-and-security" },
    ],
  },
];

export const QARI_PILOT_PROFILES = RAW_PILOT_PROFILES.map((profile) =>
  normalizeQariProfile({ ...profile, methodologyVersion: "1.0" }),
).filter(Boolean);

export function getPilotQariProfileForCountry(country = "") {
  const normalized = String(country || "").trim().toLowerCase();
  return QARI_PILOT_PROFILES.find((profile) => profile.country.toLowerCase() === normalized) || null;
}
