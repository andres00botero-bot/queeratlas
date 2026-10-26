import { writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { cityCoreConfig } from '../src/lib/cityCore.js';
import { STANDARD_VIBE_TAGS } from '../src/lib/vibeTaxonomy.js';
const batchPath = process.argv.find((arg) => arg.startsWith('--batch='))?.slice('--batch='.length) || './researched-uk-nordics-2026-10-26.mjs';
const { default: batch } = await import(batchPath);

const apply = process.argv.includes('--apply');
const tags = new Set(STANDARD_VIBE_TAGS.map(({ key }) => key));
const fields = ['entry_wait', 'best_arrival', 'crowd_mix', 'dress_code', 'host_inclusivity'];
const norm = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const day = (row) => String(row.start_date || row.date || '').slice(0, 10);
const urlKey = (value) => { try { const url = new URL(value); return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`; } catch { return ''; } };
const tokenSet = (value) => new Set(norm(value).split(' ').filter((word) => word.length > 2 && !['2026','2027','2028','the','with','edition','festival','party'].includes(word)));
function duplicate(a, b) {
  if (day(a) !== day(b) || (a.city && b.city && norm(a.city) !== norm(b.city))) return '';
  const linksA = [a.link, a.ticket_url].map(urlKey).filter(Boolean), linksB = [b.link, b.ticket_url].map(urlKey).filter(Boolean);
  if (linksA.some((link) => linksB.includes(link))) return 'same date and source';
  if (norm(a.name) === norm(b.name)) return 'same normalized name and date';
  const left = tokenSet(a.name), right = tokenSet(b.name), overlap = [...left].filter((word) => right.has(word)).length;
  return Math.min(left.size, right.size) && overlap / Math.min(left.size, right.size) >= 0.75 ? 'same date and overlapping event identity' : '';
}
for (const { table, row } of batch.events) {
  if (!['events', 'global_events'].includes(table) || (table === 'events' && !cityCoreConfig[row.city])) throw Error(`Invalid target: ${row.name}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || row.start_date !== row.date || row.end_date < row.date || row.date < '2026-10-26' || row.end_date > '2028-12-31') throw Error(`Invalid date: ${row.name}`);
  if (row.vibe_tags.some((tag) => !tags.has(tag)) || fields.some((field) => String(row.event_intel[field] || '').length < 24) || !row.event_intel.source_urls.length) throw Error(`Invalid intelligence: ${row.name}`);
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY, { auth: { persistSession: false } });
const mapboxToken = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const hasCoordinates = (row) => Number.isFinite(Number(row?.lat)) && Number.isFinite(Number(row?.lng));
const hasGeocodableStreetAddress = (location) => /\b\d{1,5}\s+[A-Za-zÀ-ÿ]/.test(String(location || ''));
async function geocodeEventRow(row) {
  if (hasCoordinates(row) || !hasGeocodableStreetAddress(row.location) || !mapboxToken) return row;
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', row.location);
  url.searchParams.set('limit', '1');
  url.searchParams.set('access_token', mapboxToken);
  const response = await fetch(url);
  if (!response.ok) throw Error(`Event geocoding failed (${response.status}): ${row.name}`);
  const payload = await response.json();
  const coordinates = payload?.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) throw Error(`No map coordinates found: ${row.name}`);
  return { ...row, lng: coordinates[0], lat: coordinates[1] };
}
async function all(table) { const rows = []; for (let from = 0;; from += 1000) { const { data, error } = await db.from(table).select('*').range(from, from + 999); if (error) throw error; rows.push(...data); if (data.length < 1000) return rows; } }
const existing = [...(await all('events')).map((row) => ({ table: 'events', row })), ...(await all('global_events')).map((row) => ({ table: 'global_events', row }))];
const { mergeSeedEvents } = await import('../src/lib/seedEventsContent.js');
const screening = [...existing, ...mergeSeedEvents([]).map((row) => ({ table: 'seed', row }))];
const result = { mode: apply ? 'apply' : 'dry-run', checked_at: new Date().toISOString(), existing_count: existing.length, inserted: [], skipped: [], verified: [] };
for (const item of batch.events) {
  const match = screening.find(({ row }) => duplicate(item.row, row));
  if (match) { result.skipped.push({ name: item.row.name, matched_name: match.row.name, id: match.row.id, table: match.table }); continue; }
  if (!apply) { result.inserted.push({ name: item.row.name, city: item.row.city, date: item.row.date }); screening.push(item); continue; }
  const rowToInsert = item.table === 'events' ? await geocodeEventRow(item.row) : item.row;
  const { data, error } = await db.from(item.table).insert(rowToInsert).select('*').single();
  if (error) throw error;
  const { data: check, error: checkError } = await db.from(item.table).select('*').eq('id', data.id).single();
  if (checkError || check.start_date !== item.row.start_date || check.end_date !== item.row.end_date || fields.some((field) => check.event_intel[field] !== item.row.event_intel[field]) || (hasCoordinates(rowToInsert) && (!hasCoordinates(check) || check.lat !== rowToInsert.lat || check.lng !== rowToInsert.lng))) throw Error(`Read-back mismatch: ${item.row.name}`);
  result.inserted.push({ id: data.id, name: data.name, city: data.city, country: item.country, date: data.date }); result.verified.push(data.id); screening.push(item);
}
const reportKey = batchPath.replace(/^\.\//, '').replace(/^researched-/, '').replace(/\.mjs$/, '');
await writeFile(new URL(`../reports/${reportKey}-${apply ? 'applied' : 'dry-run'}.json`, import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
