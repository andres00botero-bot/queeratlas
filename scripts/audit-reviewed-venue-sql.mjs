import { readFile } from "node:fs/promises";

const files = process.argv.slice(2);
if (!files.length) {
  throw new Error("Pass one or more reviewed venue SQL files to audit.");
}

const FIELD_PATTERN = /'(queue_wait|best_nights|crowd_mix|dress_code|staff_inclusivity)',\s*'((?:''|[^'])*)'/g;
const SOURCE_NAMES = /\b(?:Tripadvisor|TravelGay|GayCities|Wanderlog|Trustpilot|Reddit|Time Out|Google reviews?)\b/i;
let failed = false;
const allTopics = [];
let totalExpectedTopics = 0;

for (const file of files) {
  const sql = await readFile(file, "utf8");
  const topics = [...sql.matchAll(FIELD_PATTERN)].map((match, index) => ({
    field: match[1],
    text: match[2].replaceAll("''", "'"),
    venue_ordinal: Math.floor(index / 5) + 1,
  }));
  const duplicates = topics.filter((topic, index) => topics.findIndex((other) => other.text === topic.text) !== index);
  const overLimit = topics.filter((topic) => topic.text.length > 320);
  const namedSources = topics.filter((topic) => SOURCE_NAMES.test(topic.text));
  const invalidBackslashApostrophes = sql.match(/\\'/g) || [];
  const expectedTopics = (sql.match(/::bigint,\s*jsonb_build_object\(/g) || []).length * 5;
  totalExpectedTopics += expectedTopics;
  allTopics.push(...topics.map((topic) => ({ ...topic, file })));
  const result = {
    file,
    topics: topics.length,
    expected_topics: expectedTopics,
    longest_topic: Math.max(0, ...topics.map((topic) => topic.text.length)),
    exact_duplicates: duplicates.length,
    over_320_characters: overLimit.length,
    over_limit_topics: overLimit.map((topic) => ({ venue_ordinal: topic.venue_ordinal, field: topic.field, characters: topic.text.length })),
    source_names_in_reader_copy: namedSources.length,
    invalid_sql_apostrophe_escapes: invalidBackslashApostrophes.length,
  };
  if (topics.length !== expectedTopics || duplicates.length || overLimit.length || namedSources.length || invalidBackslashApostrophes.length) failed = true;
  console.log(JSON.stringify(result));
}

if (files.length > 1) {
  const crossFileDuplicates = allTopics.filter((topic, index) =>
    allTopics.findIndex((other) => other.text === topic.text) !== index
  );
  const globalResult = {
    files: files.length,
    topics: allTopics.length,
    expected_topics: totalExpectedTopics,
    exact_duplicates_across_files: crossFileDuplicates.length,
  };
  if (allTopics.length !== totalExpectedTopics || crossFileDuplicates.length) failed = true;
  console.log(JSON.stringify({ global: globalResult }));
}

if (failed) process.exitCode = 1;
