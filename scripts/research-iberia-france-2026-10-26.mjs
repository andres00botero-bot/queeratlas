import { readFile, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { cityCoreConfig } from '../src/lib/cityCore.js';
import { STANDARD_VIBE_TAGS } from '../src/lib/vibeTaxonomy.js';

const apply = process.argv.includes('--apply');
const offline = process.argv.includes('--offline');
const { default: batch } = await import('./researched-iberia-france-2026-10-26.mjs');
const tags = new Set(STANDARD_VIBE_TAGS.map(x => x.key));
const fields = ['entry_wait', 'best_arrival', 'crowd_mix', 'dress_code', 'host_inclusivity'];
const norm = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const tokens = value => new Set(norm(value).split(' ').filter(x => x.length > 2 && !/^(2026|2027|2028|the|with|edition|festival|party)$/.test(x)));
const day = row => String(row.start_date || row.date || '').slice(0, 10);
function urlKey(value) { try { const u = new URL(value); return u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, ''); } catch { return ''; } }
function duplicate(a, b) {
  const sameDate = day(a) === day(b);
  const sameCity = norm(a.city) === norm(b.city);
  const linksA = [a.link, a.ticket_url].map(urlKey).filter(Boolean);
  const linksB = [b.link, b.ticket_url].map(urlKey).filter(Boolean);
  if (sameDate && linksA.some(x => linksB.includes(x))) return 'same date and source';
  if (!sameDate || (!sameCity && a.city && b.city)) return '';
  if (norm(a.name) === norm(b.name)) return 'same normalized name and date';
  const ta = tokens(a.name), tb = tokens(b.name);
  const overlap = [...ta].filter(x => tb.has(x)).length;
  if (Math.min(ta.size, tb.size) > 0 && overlap / Math.min(ta.size, tb.size) >= 0.75) return 'same date and overlapping event identity';
  return '';
}
for (const item of batch.events) {
  const r = item.row;
  if (!['events', 'global_events'].includes(item.table)) throw Error('Invalid table');
  if (item.table === 'events' && !cityCoreConfig[r.city]) throw Error(`Unknown city: ${r.city}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || r.start_date !== r.date || r.end_date < r.date || r.date < '2026-10-26' || r.end_date > '2028-12-31') throw Error(`Invalid dates: ${r.name}`);
  if (r.vibe_tags.some(x => !tags.has(x))) throw Error(`Invalid tags: ${r.name}`);
  if (fields.some(x => !r.event_intel[x] || r.event_intel[x].length < 24)) throw Error(`Incomplete intel: ${r.name}`);
  if (!r.event_intel.source_urls.length || r.event_intel.research_status !== 'verified_primary_sources') throw Error(`Missing evidence: ${r.name}`);
}
let client;
if (!offline) {
  client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY, { auth: { persistSession: false } });
}
async function fetchRows(table) {
  if (offline) return JSON.parse(await readFile(new URL(`../reports/iberia-france-${table === 'events' ? '' : 'global-'}existing-2026-10-26.json`, import.meta.url), 'utf8'));
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.from(table).select('*').range(offset, offset + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}
const existing = (await fetchRows('events')).map(row => ({ table: 'events', row })).concat((await fetchRows('global_events')).map(row => ({ table: 'global_events', row })));
const result = { mode: apply ? 'apply' : 'dry-run', checked_at: new Date().toISOString(), existing_count: existing.length, inserted: [], skipped: [], verified: [], existing_duplicates: [] };
for (let i = 0; i < existing.length; i++) {
  const a = existing[i];
  if (!/^(lisbon|porto|madrid|barcelona|sitges|gran_canaria|torremolinos|paris|lyon|toulouse|bordeaux|marseille|mallorca)$/.test(a.row.city || '') || day(a.row) < '2026-10-26') continue;
  for (const b of existing.slice(i + 1)) { const reason = duplicate(a.row, b.row); if (reason) result.existing_duplicates.push({ first: a.row.id, second: b.row.id, name: a.row.name, reason }); }
}
// Include seed-backed events in duplicate screening; never write seed rows to Supabase.
const { mergeSeedEvents } = await import('../src/lib/seedEventsContent.js');
const seeds = mergeSeedEvents([]).map(row => ({ table: 'seed', row }));
const screening = [...existing, ...seeds];
for (const item of batch.events) {
  const match = screening.find(x => duplicate(item.row, x.row));
  if (match) { result.skipped.push({ name: item.row.name, matched_name: match.row.name, id: match.row.id, table: match.table }); continue; }
  if (apply) {
    if (offline) throw Error('Offline apply forbidden');
    const { data, error } = await client.from(item.table).insert(item.row).select('*').single();
    if (error) throw error;
    result.inserted.push({ id: data.id, table: item.table, name: data.name, city: data.city, country: item.country, date: data.date });
    const { data: check, error: checkError } = await client.from(item.table).select('*').eq('id', data.id).single();
    if (checkError) throw checkError;
    if (check.start_date !== item.row.start_date || check.end_date !== item.row.end_date || check.city !== (item.row.city || null) || fields.some(x => check.event_intel[x] !== item.row.event_intel[x])) throw Error(`Read-back mismatch: ${data.name}`);
    result.verified.push(data.id);
  } else result.inserted.push({ name: item.row.name, table: item.table, country: item.country, date: item.row.date });
  screening.push(item);
}
await writeFile(new URL(`../reports/iberia-france-${apply ? 'applied' : 'dry-run'}-2026-10-26.json`, import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
