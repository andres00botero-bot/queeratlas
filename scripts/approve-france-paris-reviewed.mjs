import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const APPLY = process.argv.includes("--apply");
const ids = [3312, 3313, 3314, 3315];
for (const id of ids) {
  if (!APPLY) { console.log(`Would approve ${id}`); continue; }
  const { error } = await supabase.from("places").update({ seo_quality_status: "approved", seo_indexable: true }).eq("id", id);
  if (error) throw error;
  console.log(`Approved ${id}`);
}
