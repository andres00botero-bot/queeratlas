import { createClient } from '@supabase/supabase-js';

const ids = [1490, 1491, 1492];
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
if (!token) throw Error('Missing Mapbox token');

async function geocode(location) {
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', location);
  url.searchParams.set('limit', '1');
  url.searchParams.set('access_token', token);
  const response = await fetch(url);
  if (!response.ok) throw Error(`Mapbox returned ${response.status}`);
  const payload = await response.json();
  const coordinates = payload?.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) throw Error(`No coordinates for ${location}`);
  return { lng: coordinates[0], lat: coordinates[1] };
}

const { data: rows, error } = await db.from('events').select('id,name,location').in('id', ids).order('id');
if (error) throw error;
const updated = [];
for (const row of rows) {
  const { lat, lng } = await geocode(row.location);
  const { data, error: updateError } = await db.from('events').update({ lat, lng }).eq('id', row.id).select('id,name,lat,lng,location').single();
  if (updateError) throw updateError;
  if (!Number.isFinite(Number(data.lat)) || !Number.isFinite(Number(data.lng))) throw Error(`Coordinate read-back failed for ${row.name}`);
  updated.push(data);
}
console.log(JSON.stringify({ updated, skipped: [{ id: 1489, reason: 'No verified street address published; not geocoded.' }] }, null, 2));
