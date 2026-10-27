import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { cityCoreConfig } from '../src/lib/cityCore.js';

loadEnv({ path: '.env.local' });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
if (!token) throw Error('Missing Mapbox token');

const unsafeLocation = /(to be announced|venue details|venue to be confirmed|venues to be confirmed|ticket-holder|ticket holder|secret location|disclosed to attendees|final entry details|individual venues pending|individual .*sites|venues pending|multiple venues|and other venues|programme venue|programme pending|screening venues|final venue|location disclosed|exact venue details|private location|see the selected performance)/i;
const radiusKm = 120;

function distanceKm([lngA, latA], [lngB, latB]) {
  const radians = (value) => value * Math.PI / 180;
  const earth = 6371;
  const dLat = radians(latB - latA);
  const dLng = radians(lngB - lngA);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(latA)) * Math.cos(radians(latB)) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

async function geocode(location) {
  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', location);
  url.searchParams.set('limit', '1');
  url.searchParams.set('access_token', token);
  const response = await fetch(url);
  if (!response.ok) throw Error(`Mapbox returned ${response.status}`);
  const payload = await response.json();
  const feature = payload?.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) return null;
  return { lng: coordinates[0], lat: coordinates[1], label: feature.properties?.full_address || feature.place_name || '' };
}

const rows = [];
for (let from = 0;; from += 1000) {
  const { data, error } = await db.from('events').select('id,name,city,location,lat,lng').is('lat', null).is('lng', null).order('id').range(from, from + 999);
  if (error) throw error;
  rows.push(...data);
  if (data.length < 1000) break;
}
const result = { updated: [], skipped: [], failed: [] };
for (const row of rows) {
  const location = String(row.location || '').trim();
  const city = cityCoreConfig[row.city];
  if (!location || unsafeLocation.test(location)) {
    result.skipped.push({ id: row.id, name: row.name, reason: unsafeLocation.test(location) ? 'No single public venue address' : 'No location supplied' });
    continue;
  }
  try {
    const point = await geocode(location);
    if (!point) { result.failed.push({ id: row.id, name: row.name, reason: 'No Mapbox result' }); continue; }
    const distance = city ? distanceKm(city.center, [point.lng, point.lat]) : null;
    if (distance !== null && distance > radiusKm) { result.failed.push({ id: row.id, name: row.name, reason: `Geocoded point is ${Math.round(distance)} km from configured city` }); continue; }
    const { data, error: updateError } = await db.from('events').update({ lat: point.lat, lng: point.lng }).eq('id', row.id).select('id,name,city,location,lat,lng').single();
    if (updateError) throw updateError;
    if (!Number.isFinite(Number(data.lat)) || !Number.isFinite(Number(data.lng))) throw Error('Coordinate read-back failed');
    result.updated.push({ ...data, geocoder_label: point.label });
  } catch (caught) {
    result.failed.push({ id: row.id, name: row.name, reason: caught instanceof Error ? caught.message : String(caught) });
  }
}
console.log(JSON.stringify(result, null, 2));
