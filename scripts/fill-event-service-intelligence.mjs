import { createClient } from "@supabase/supabase-js";
import { buildEventIntelFallback, buildServiceIntelFallback } from "../src/lib/intelFallbacks.js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const eventFields = ["entry_wait", "best_arrival", "crowd_mix", "dress_code", "host_inclusivity"];
const serviceFields = ["booking_lead_time", "best_time", "client_mix", "preparation", "provider_inclusivity"];

async function fetchAll(table) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from(table).select("*").order("id", { ascending: true }).range(start, start + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

function validate(rows, intelKey, fields) {
  for (const row of rows) {
    const intel = row[intelKey];
    for (const key of fields) {
      const value = String(intel?.[key] || "").trim();
      if (!value) throw new Error(`Missing ${intelKey}.${key} for ${row.id} ${row.name}`);
      if (value.length > 320) throw new Error(`${intelKey}.${key} exceeds 320 characters for ${row.id} ${row.name}`);
    }
    for (const url of intel?.source_urls || []) new URL(url);
  }
}

async function writeRows(table, intelKey, rows) {
  let written = 0;
  for (let start = 0; start < rows.length; start += 10) {
    const chunk = rows.slice(start, start + 10);
    const results = await Promise.all(chunk.map((row) => supabase.from(table).update({ [intelKey]: row[intelKey] }).eq("id", row.id)));
    const failed = results.findIndex((result) => result.error);
    if (failed >= 0) throw new Error(`${table} update failed for ${chunk[failed].id}: ${results[failed].error.message}`);
    written += chunk.length;
  }
  return written;
}

const [events, services] = await Promise.all([fetchAll("events"), fetchAll("services")]);
const eventPayloads = events.map((event) => ({ ...event, event_intel: buildEventIntelFallback(event) }));
const servicePayloads = services.map((service) => ({ ...service, service_intel: buildServiceIntelFallback(service) }));
validate(eventPayloads, "event_intel", eventFields);
validate(servicePayloads, "service_intel", serviceFields);

const summary = {
  events: eventPayloads.length,
  services: servicePayloads.length,
  events_previously_complete: events.filter((row) => eventFields.every((key) => String(row.event_intel?.[key] || "").trim())).length,
  services_previously_complete: services.filter((row) => serviceFields.every((key) => String(row.service_intel?.[key] || "").trim())).length,
};

if (process.argv.includes("--dry-run")) {
  console.log(JSON.stringify({ mode: "dry-run", ...summary }, null, 2));
} else {
  const [eventsWritten, servicesWritten] = await Promise.all([
    writeRows("events", "event_intel", eventPayloads),
    writeRows("services", "service_intel", servicePayloads),
  ]);
  console.log(JSON.stringify({ ...summary, events_written: eventsWritten, services_written: servicesWritten }, null, 2));
}
