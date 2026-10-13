import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const tables = ["events", "global_events"];

function has(text, pattern) {
  return pattern.test(text);
}

function classify(row) {
  const text = [row.name, row.vibe, row.description, row.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const tags = [];
  const add = (tag, pattern) => {
    if (tags.length < 3 && has(text, pattern) && !tags.includes(tag)) tags.push(tag);
  };

  // Specific programming comes first; broad format tags only fill remaining slots.
  add("drag", /\b(drag|cabaret|burlesque|drag queen)\b/);
  add("fetish", /\b(fetish|kink|leather|rubber|gear|darkroom)\b/);
  add("cruise", /\b(cruise|cruising)\b/);
  add("relax", /\b(sauna|steam room|spa|wellness|meditation|yoga)\b/);
  add("techno", /\b(techno|acid techno|ebm)\b/);
  add("electronic", /\b(electronic|electro|edm|house|disco|rave|dj set)\b/);
  add("pop", /\b(pop|hyperpop|mainstream)\b/);
  add("after", /\b(afterparty|after-party|afterhours|after hours|day party|day-party)\b/);
  add("industrial", /\b(industrial|warehouse)\b/);
  add("underground", /\b(underground|renegade|diy)\b/);
  add("massive", /\b(massive|large-scale|large scale|superclub|big room|parade|arena|stadium)\b/);
  add("luxury", /\b(luxury|premium|upscale|gala|black tie)\b/);
  add("festival", /\b(festival|pride|mardi gras|carnival)\b/);
  add("cozy", /\b(cozy|cosy|intimate|small room)\b/);
  add("social", /\b(social|community|meetup|networking|potluck|game night|trivia)\b/);
  add("cultural", /\b(cultural|culture|arts?|film|cinema|screening|exhibition|museum|theat(?:re|er)|choir)\b/);
  add("chill", /\b(chill|laid[- ]back|calm)\b/);
  return tags.length ? tags : ["mixed"];
}

function isGenericPrideMisclassification(row) {
  const current = Array.isArray(row.vibe_tags) ? row.vibe_tags : [];
  const name = String(row.name || "").toLowerCase();
  const vibe = String(row.vibe || "").trim().toLowerCase();
  return (
    current.length === 1 &&
    ["drag", "after", "techno", "relax", "fetish"].includes(current[0]) &&
    /\b(gay |rainbow )?pride\b/.test(name) &&
    /^(pride\s*[/|&-]?\s*(community|festival)|community\s*[/|&-]?\s*pride)$/i.test(vibe)
  );
}

async function readAll(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select("id,name,city,vibe,vibe_tags,description,location")
      .range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

const changes = [];
for (const table of tables) {
  const rows = await readAll(table);
  for (const row of rows) {
    const existing = Array.isArray(row.vibe_tags) ? row.vibe_tags : [];
    const next = existing.length === 0 ? classify(row) : isGenericPrideMisclassification(row) ? ["festival", "social"] : null;
    if (next) changes.push({ table, id: row.id, name: row.name, city: row.city, previous: existing, next });
  }
}

const summary = changes.reduce((acc, change) => {
  const key = `${change.table}:${change.previous.length ? "pride-correction" : change.next.join("+")}`;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", changes: changes.length, summary, sample: changes.slice(0, 20) }, null, 2));

if (apply) {
  for (const change of changes) {
    const { error } = await supabase.from(change.table).update({ vibe_tags: change.next }).eq("id", change.id);
    if (error) throw new Error(`${change.table}/${change.id}: ${error.message}`);
  }
  console.log(JSON.stringify({ applied: changes.length }, null, 2));
}
