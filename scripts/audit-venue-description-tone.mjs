import { createClient } from "@supabase/supabase-js";
import { auditDescription, readVenueDescriptions } from "./lib/venueDescriptionTone.mjs";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const rows = await readVenueDescriptions(db);
const flagged = rows.map((row) => ({ id: row.id, name: row.name, city: row.city, ...auditDescription(row.description, row.name) }))
  .filter((row) => row.terms.length || row.emoji);
console.log(JSON.stringify({ total: rows.length, flagged: flagged.length, venues: flagged }, null, 2));
if (flagged.length) process.exitCode = 1;
