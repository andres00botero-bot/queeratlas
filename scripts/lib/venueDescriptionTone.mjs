export const TONE_TERMS = [
  "legendary", "ultimate", "absolute", "absolutely", "crown jewel",
  "fiercely", "pure", "iconic", "wonderland",
];

export function auditDescription(description, name = "") {
  // A venue's proper name (for example Iconic Bar) is not promotional copy.
  const text = String(description || "");
  const prose = name ? text.split(name).join("") : text;
  return {
    terms: TONE_TERMS.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(prose)),
    emoji: /[\p{Extended_Pictographic}\p{Regional_Indicator}\u20e3\uFE0F\u200D]/u.test(text),
  };
}

export async function readVenueDescriptions(db) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("places")
      .select("id,name,city,description,updated_at")
      .order("id").range(from, from + 999);
    if (error) throw new Error(`Reading venue descriptions: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

export function planDescriptionChanges(changes, rows, rollback = false) {
  const byId = new Map(rows.map((row) => [String(row.id), row]));
  const seen = new Set();
  const pending = [];
  const conflicts = [];
  let alreadyApplied = 0;
  for (const change of changes) {
    const key = String(change.id);
    if (seen.has(key)) throw new Error(`Duplicate change ID: ${key}`);
    seen.add(key);
    if (typeof change.before !== "string" || typeof change.after !== "string" || !change.after.trim()) {
      throw new Error(`Invalid description change: ${key}`);
    }
    const row = byId.get(key);
    const expected = rollback ? change.after : change.before;
    const next = rollback ? change.before : change.after;
    if (!row || row.name !== change.name || row.city !== change.city) {
      conflicts.push({ id: change.id, reason: "missing venue or changed identity" });
    } else if (row.description === next) {
      alreadyApplied += 1;
    } else if (row.description !== expected) {
      conflicts.push({ id: change.id, reason: "description edited since snapshot" });
    } else {
      pending.push({ row, next });
    }
  }
  return { pending, conflicts, alreadyApplied };
}
