import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { persistSession: false } });
const apply = process.argv.includes("--apply");
const citySlugMap = {
  "new-york": "new_york",
  "los-angeles": "los_angeles",
  "palm-springs": "palm_springs",
};

const results = [];
for (const [from, to] of Object.entries(citySlugMap)) {
  const { count, error: countError } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("city", from);
  if (countError) throw countError;

  if (apply && count) {
    const { error } = await supabase.from("events").update({ city: to }).eq("city", from);
    if (error) throw error;
  }
  results.push({ from, to, count: count || 0 });
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", results }, null, 2));
