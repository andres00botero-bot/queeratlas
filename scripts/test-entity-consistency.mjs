import { listCityClusterTopics } from "../src/lib/seo/cityClusters.js";
import { listTopicHubs } from "../src/lib/seo/topicHubs.js";
import { listSeoReports } from "../src/lib/seo/reportsIndex.js";
import { listCitationRules, listSourceTaxonomy } from "../src/lib/seo/entityConsistency.js";

function fail(message) {
  throw new Error(message);
}

const topics = listCityClusterTopics();
const topicKeys = new Set(topics.map((topic) => topic.key));

const hubs = listTopicHubs();
const missingHubTopics = [];
for (const hub of hubs) {
  const clusterKeys = Array.isArray(hub.clusterKeys) ? hub.clusterKeys : [];
  for (const key of clusterKeys) {
    if (!topicKeys.has(key)) {
      missingHubTopics.push({ hub: hub.key, topicKey: key });
    }
  }
}
if (missingHubTopics.length > 0) {
  fail(`[entity-consistency] Missing topic keys in hubs: ${JSON.stringify(missingHubTopics)}`);
}

const reports = listSeoReports();
const seenSlugs = new Set();
for (const report of reports) {
  if (!report.slug || !report.title) {
    fail(`[entity-consistency] Report missing slug/title: ${JSON.stringify(report)}`);
  }
  if (seenSlugs.has(report.slug)) {
    fail(`[entity-consistency] Duplicate report slug: ${report.slug}`);
  }
  seenSlugs.add(report.slug);
  if (!Array.isArray(report.keyphrases) || report.keyphrases.length < 2) {
    fail(`[entity-consistency] Report keyphrases too weak: ${report.slug}`);
  }
}

const taxonomy = listSourceTaxonomy();
if (!Array.isArray(taxonomy) || taxonomy.length < 3) {
  fail("[entity-consistency] Source taxonomy is incomplete.");
}
for (const item of taxonomy) {
  if (!item.key || !item.label || !item.description) {
    fail(`[entity-consistency] Invalid taxonomy item: ${JSON.stringify(item)}`);
  }
}

const citationRules = listCitationRules();
if (!Array.isArray(citationRules) || citationRules.length < 3) {
  fail("[entity-consistency] Citation rules are incomplete.");
}

console.log("[entity-consistency] PASSED", {
  topicCount: topics.length,
  hubCount: hubs.length,
  reportCount: reports.length,
  taxonomyCount: taxonomy.length,
  citationRuleCount: citationRules.length,
});

