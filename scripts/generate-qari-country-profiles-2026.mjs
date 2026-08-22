import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cityCoreConfig } from "../src/lib/cityCore.js";
import { calculateQari, getQariTier, QARI_RISK_FLOORS } from "../src/lib/qari.js";
import { QARI_PILOT_PROFILES } from "../src/lib/qariPilotProfiles.js";
import freedomHouseSnapshot from "../src/lib/qariFreedomHouse2026.json" with { type: "json" };
import { getGlobalQueerMultiSourceEvidence } from "../src/lib/seo/globalQueerMultiSourceEvidence2026.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REVIEW_DATE = "2026-08-22";
const METHODOLOGY_VERSION = "1.1";
const ILGA_CRIMINALISATION_URL = "https://database.ilga.org/criminalisation-consensual-same-sex-sexual-acts";

// Floors are deliberately limited to current ILGA categories that require a
// minimum under the published QARI method. The eight pilot rows retain their
// separately reviewed floors and are never regenerated here.
const REVIEWED_RISK_FLOORS = Object.freeze({
  Indonesia: {
    value: QARI_RISK_FLOORS.active_criminalisation,
    reason: "Active imprisonment-based criminalisation applies in parts of the country and requires the QARI minimum.",
  },
  Lebanon: {
    value: QARI_RISK_FLOORS.de_facto_criminalisation,
    reason: "Documented de facto criminalisation through morality provisions requires the QARI minimum.",
  },
  Malaysia: {
    value: QARI_RISK_FLOORS.active_criminalisation,
    reason: "Active imprisonment-based criminalisation requires the QARI minimum.",
  },
  Morocco: {
    value: QARI_RISK_FLOORS.active_criminalisation,
    reason: "Active imprisonment-based criminalisation requires the QARI minimum.",
  },
});

const countries = [...new Set(Object.values(cityCoreConfig).map((city) => city.country))].sort();
const pilots = new Set(QARI_PILOT_PROFILES.map((profile) => profile.country));
const freedomByCountry = new Map(freedomHouseSnapshot.records.map((record) => [record.country, record]));

const slugify = (value) => String(value).toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
const riskFromComposite = (value) => Math.round(100 - Number(value));
const sqlText = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlDate = (value) => value ? `date ${sqlText(value)}` : "null";

function describeAxis(value, axis) {
  if (axis === "legal") {
    if (value <= 20) return "a comparatively strong legal-rights baseline";
    if (value <= 45) return "meaningful legal protection alongside remaining gaps";
    if (value <= 70) return "substantial gaps in legal protection";
    return "severe legal exposure or very limited protection";
  }
  if (axis === "social") {
    if (value <= 20) return "broad social acceptance";
    if (value <= 45) return "generally positive acceptance with uneven lived experience";
    if (value <= 70) return "a mixed or restrictive lived-experience climate";
    return "a highly restrictive lived-experience climate";
  }
  if (value <= 20) return "relatively open civic and online conditions";
  if (value <= 45) return "some civic or online constraints";
  if (value <= 70) return "material civic and online constraints";
  return "severe civic, enforcement and online constraints";
}

function buildSummary(country, legalRisk, socialRisk, digitalRisk, riskFloor, digitalBasis) {
  const axes = [
    { key: "legal", value: legalRisk },
    { key: "social", value: socialRisk },
    { key: "digital", value: digitalRisk },
  ].sort((a, b) => b.value - a.value);
  const strongest = axes.at(-1);
  const main = axes[0];
  const floorNote = riskFloor
    ? ` An evidence-based legal floor sets the published minimum at ${riskFloor}.`
    : "";
  return `${country} combines ${describeAxis(strongest.value, strongest.key)} with ${describeAxis(main.value, main.key)}. The digital axis uses ${digitalBasis}; local conditions can still vary by city and identity.${floorNote}`;
}

function mapSource(input, axis, country) {
  const sourceType = input.id?.startsWith("equaldex") ? "legal_database" : "ngo_report";
  return {
    axis,
    sourceType,
    label: input.label,
    url: input.url,
    supportsClaim: `${input.label} contributes a verified ${axis} input for ${country}.`,
    publishedAt: null,
    checkedAt: REVIEW_DATE,
  };
}

const generatedProfiles = countries.filter((country) => !pilots.has(country)).map((country) => {
  const evidence = getGlobalQueerMultiSourceEvidence(country);
  const freedom = freedomByCountry.get(country);
  if (evidence.legalComposite == null || evidence.livedComposite == null || !freedom) {
    throw new Error(`Incomplete evidence for ${country}`);
  }

  const legalRisk = riskFromComposite(evidence.legalComposite);
  const socialRisk = riskFromComposite(evidence.livedComposite);
  const externalFreedomScore = freedom.freedomNet2025 ?? freedom.freedomWorld2026;
  const externalFreedomRisk = 100 - externalFreedomScore;
  const digitalRisk = Math.round((externalFreedomRisk * 0.75) + (legalRisk * 0.25));
  const riskFloor = REVIEWED_RISK_FLOORS[country]?.value || 0;
  const digitalBasis = freedom.freedomNet2025 == null
    ? "Freedom in the World 2026 as a disclosed civic-freedom proxy"
    : "Freedom on the Net 2025";
  const confidence = freedom.freedomNet2025 != null
    && evidence.legalInputs.length >= 3
    && evidence.livedInputs.length >= 3
    ? "high"
    : "medium";
  const score = calculateQari({ legalRisk, socialRisk, digitalRisk, riskFloor });
  const sources = [
    ...evidence.legalInputs.map((input) => mapSource(input, "legal", country)),
    ...evidence.livedInputs.map((input) => mapSource(input, "social", country)),
    {
      axis: "digital",
      sourceType: "ngo_report",
      label: `${freedom.sourceCountry !== country ? `${freedom.sourceCountry} proxy · ` : ""}Freedom House · ${freedom.freedomNet2025 == null ? "Freedom in the World 2026" : "Freedom on the Net 2025"}`,
      url: freedom.countryUrl,
      supportsClaim: freedom.freedomNet2025 == null
        ? `Country-level civic freedom is the disclosed digital-risk proxy for ${country}; it is blended with the LGBTQ+ legal-risk input.`
        : `Country-level internet freedom informs digital and enforcement exposure for ${country}; it is blended with the LGBTQ+ legal-risk input.`,
      publishedAt: freedom.freedomNet2025 == null ? "2026-03-01" : "2025-11-13",
      checkedAt: REVIEW_DATE,
    },
  ];

  if (riskFloor) {
    sources.push({
      axis: "legal",
      sourceType: "legal_database",
      label: "ILGA World · Criminalisation of consensual same-sex sexual acts",
      url: ILGA_CRIMINALISATION_URL,
      supportsClaim: REVIEWED_RISK_FLOORS[country].reason,
      publishedAt: "2026-07-01",
      checkedAt: REVIEW_DATE,
    });
  }

  return {
    destinationKey: `country:${slugify(country)}`,
    scopeType: "country",
    country,
    cityKey: "",
    legalRisk,
    socialRisk,
    digitalRisk,
    riskFloor,
    score,
    tier: getQariTier(score),
    confidence,
    summary: buildSummary(country, legalRisk, socialRisk, digitalRisk, riskFloor, digitalBasis),
    methodologyVersion: METHODOLOGY_VERSION,
    reviewedBy: "Queer Atlas multi-source model",
    reviewedAt: REVIEW_DATE,
    sources,
  };
});

const output = {
  methodologyVersion: METHODOLOGY_VERSION,
  generatedAt: `${REVIEW_DATE}T00:00:00.000Z`,
  profileCount: generatedProfiles.length,
  profiles: generatedProfiles,
};

fs.writeFileSync(
  path.join(ROOT, "src/lib/qariCountryProfiles2026.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

const profileValues = generatedProfiles.map((profile) => `  (${[
  sqlText(profile.destinationKey), sqlText(profile.scopeType), sqlText(profile.country), "null",
  profile.legalRisk, profile.socialRisk, profile.digitalRisk, profile.riskFloor,
  sqlText(profile.confidence), sqlText(profile.summary), sqlText(profile.methodologyVersion),
  sqlText(profile.reviewedBy), sqlDate(profile.reviewedAt), "true",
].join(", ")})`).join(",\n");

const sourceValues = generatedProfiles.flatMap((profile) => profile.sources.map((source) => `  (${[
  sqlText(profile.destinationKey), sqlText(source.axis), sqlText(source.sourceType), sqlText(source.label),
  sqlText(source.url), sqlText(source.supportsClaim), sqlDate(source.publishedAt), sqlDate(source.checkedAt),
].join(", ")})`)).join(",\n");

const generatedKeys = generatedProfiles.map((profile) => `    ${sqlText(profile.destinationKey)}`).join(",\n");
const sql = `-- QARI country expansion 2026 · generated from reviewed multi-source inputs
-- Adds the 73 non-pilot Atlas country profiles. Safe to run more than once.
-- Requires supabase/qari-phase0-phase1-v1.sql first.

begin;

insert into public.qa_qari_profiles (
  destination_key, scope_type, country, city_key,
  legal_risk, social_risk, digital_risk, risk_floor,
  confidence, summary, methodology_version, reviewed_by, reviewed_at, is_published
)
values
${profileValues}
on conflict (destination_key) do update set
  scope_type = excluded.scope_type,
  country = excluded.country,
  city_key = excluded.city_key,
  legal_risk = excluded.legal_risk,
  social_risk = excluded.social_risk,
  digital_risk = excluded.digital_risk,
  risk_floor = excluded.risk_floor,
  confidence = excluded.confidence,
  summary = excluded.summary,
  methodology_version = excluded.methodology_version,
  reviewed_by = excluded.reviewed_by,
  reviewed_at = excluded.reviewed_at,
  is_published = excluded.is_published;

delete from public.qa_qari_sources
where destination_key in (
${generatedKeys}
);

insert into public.qa_qari_sources (
  destination_key, axis, source_type, label, url, supports_claim, published_at, checked_at
)
values
${sourceValues};

commit;

-- Expected after the Phase 0/1 pilot plus this expansion: 81 published profiles.
select
  (select count(*) from public.qa_qari_profiles where is_published = true) as published_profiles,
  (select count(*) from public.qa_qari_sources) as source_rows;
`;

fs.writeFileSync(path.join(ROOT, "supabase/qari-country-profiles-2026.sql"), sql);

console.log(JSON.stringify({
  generatedProfiles: generatedProfiles.length,
  totalProfilesWithPilots: generatedProfiles.length + QARI_PILOT_PROFILES.length,
  sourceRows: generatedProfiles.reduce((sum, profile) => sum + profile.sources.length, 0),
  highConfidenceProfiles: generatedProfiles.filter((profile) => profile.confidence === "high").length,
  mediumConfidenceProfiles: generatedProfiles.filter((profile) => profile.confidence === "medium").length,
}, null, 2));
