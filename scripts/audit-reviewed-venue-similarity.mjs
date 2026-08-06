import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const focusArg = args.find((arg) => arg.startsWith("--focus="));
const focus = focusArg?.slice("--focus=".length).replaceAll("\\", "/");
const files = args.filter((arg) => !arg.startsWith("--focus="));

if (!focus || !files.length) {
  throw new Error("Usage: node audit-reviewed-venue-similarity.mjs --focus=<file> <all reviewed SQL files>");
}

const FIELD_PATTERN = /'(queue_wait|best_nights|crowd_mix|dress_code|staff_inclusivity)',\s*'((?:''|[^'])*)'/g;

function normalize(text) {
  return text
    .toLowerCase()
    .replaceAll("''", "'")
    .replace(/[’‘]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shingles(tokens, size = 4) {
  const result = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    result.add(tokens.slice(index, index + size).join(" "));
  }
  return result;
}

function jaccard(left, right) {
  let shared = 0;
  for (const value of left) if (right.has(value)) shared += 1;
  return shared / Math.max(1, left.size + right.size - shared);
}

function longestSharedRun(left, right) {
  let longest = 0;
  const previous = new Uint16Array(right.length + 1);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = new Uint16Array(right.length + 1);
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      if (left[leftIndex - 1] === right[rightIndex - 1]) {
        current[rightIndex] = previous[rightIndex - 1] + 1;
        longest = Math.max(longest, current[rightIndex]);
      }
    }
    previous.set(current);
  }
  return longest;
}

const topics = [];
for (const file of files) {
  const normalizedFile = file.replaceAll("\\", "/");
  const sql = await readFile(file, "utf8");
  const venueIds = [...sql.matchAll(/\((\d+)::bigint,\s*jsonb_build_object\(/g)].map((match) => Number(match[1]));
  const matches = [...sql.matchAll(FIELD_PATTERN)];
  for (const [index, match] of matches.entries()) {
    const text = match[2].replaceAll("''", "'");
    const tokens = normalize(text).split(" ").filter(Boolean);
    topics.push({
      file: normalizedFile,
      venue_id: venueIds[Math.floor(index / 5)],
      field: match[1],
      text,
      tokens,
      shingles: shingles(tokens),
    });
  }
}

const focused = topics.filter((topic) => topic.file === focus);
if (!focused.length) throw new Error(`Focus file was not found among inputs: ${focus}`);

const flagged = [];
let maxSimilarity = 0;
for (const left of focused) {
  for (const right of topics) {
    if (left === right || left.field !== right.field) continue;
    if (right.file === focus && right.venue_id < left.venue_id) continue;
    const similarity = jaccard(left.shingles, right.shingles);
    const sharedRun = longestSharedRun(left.tokens, right.tokens);
    maxSimilarity = Math.max(maxSimilarity, similarity);
    if (similarity >= 0.55 || sharedRun >= 12) {
      flagged.push({
        field: left.field,
        left: { file: left.file, venue_id: left.venue_id },
        right: { file: right.file, venue_id: right.venue_id },
        four_word_shingle_jaccard: Number(similarity.toFixed(3)),
        longest_shared_word_run: sharedRun,
      });
    }
  }
}

console.log(JSON.stringify({
  focus,
  focus_topics: focused.length,
  compared_topics: topics.length,
  highest_four_word_shingle_jaccard: Number(maxSimilarity.toFixed(3)),
  suspicious_pairs: flagged.length,
  examples: flagged.slice(0, 20),
}, null, 2));

if (flagged.length) process.exitCode = 1;
