import sharp from "sharp";
import { getAuthenticatedRequestContext, getTelemetryServiceClient } from "@/lib/telemetry/serverSupabase";
import { isPublishedEntity } from "@/lib/publicInventory";
import { isVenueAccessRestricted } from "@/lib/venueAccessPolicy";

const bucket = "venue-gallery-v1";
const limit = 3 * 1024 * 1024;
// Verified Auth user IDs for the owner's two editorial accounts. Gallery access only.
const galleryEditors = new Set(["dc8ccd70-b960-4a09-a003-1b0d19d19998", "9b16d8ef-0ba4-448e-be4e-911c83eb8c65"]);
const reply = (body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

async function handle(request, { params }) {
  const { id } = await params;
  const read = request.method === "GET";
  const slot = new URL(request.url).searchParams.get("slot");
  if (!/^\d{1,18}$/.test(id) && !/^seed-[\w-]{1,150}$/.test(id)) return reply({}, 404);
  if (!read && !/^[1-4]$/.test(slot || "")) return reply({}, 400);
  const auth = await getAuthenticatedRequestContext(request);
  if (!read && !auth) return reply({}, 401);
  const service = getTelemetryServiceClient();
  const venueResult = await service.from("places").select("*")
    .eq(id.startsWith("seed-") ? "legacy_seed_id" : "id", id).maybeSingle();
  if (venueResult.error) return reply({}, 503);
  const venue = venueResult.data;
  if (!venue) return reply({}, 404);
  const publicVenue = isPublishedEntity(venue) && !isVenueAccessRestricted(venue.city) && !venue.ambassador_protected && venue.type !== "cruising_area";
  let canEdit = false;
  if (auth) {
    canEdit = galleryEditors.has(auth.user.id) || (await auth.client.rpc("qa_is_admin")).data === true;
    if (!canEdit && publicVenue) {
      const { data, error } = await auth.client.from("qa_ambassador_assignments")
        .select("starts_at,ends_at,terms,paid_eur_cents,received_on")
        .eq("user_id", auth.user.id).eq("role", "venue").eq("city", venue.city)
        .eq("venue_id", venue.id).eq("status", "active").maybeSingle();
      if (error) return reply({}, 503);
      const now = Date.now();
      if (data && Date.parse(data.starts_at) <= now && (!data.ends_at || Date.parse(data.ends_at) > now)) {
        const anniversary = new Date(data.starts_at);
        anniversary.setUTCFullYear(anniversary.getUTCFullYear() + 1);
        canEdit = data.terms !== "annual" || Boolean(data.ends_at && data.received_on &&
          data.paid_eur_cents >= 1000 && now < anniversary.getTime());
      }
    }
  }
  if (!canEdit && !publicVenue) return reply({}, 404);
  if (!read && !canEdit) return reply({}, 403);
  const storage = service.storage.from(bucket);
  const folder = String(venue.id);
  const path = `${folder}/${slot}.webp`;
  if (request.method === "DELETE") {
    const { error } = await storage.remove([path]);
    return reply({}, error ? 503 : 200);
  }
  if (request.method === "PUT") {
    const length = Number(request.headers.get("content-length"));
    if (length > limit) return reply({}, 413);
    if (!request.body) return reply({}, 415);
    const chunks = [];
    let size = 0;
    for await (const chunk of request.body) {
      size += chunk.byteLength;
      if (size > limit) return reply({}, 413);
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks, size);
    let photo;
    try {
      const image = sharp(input, { limitInputPixels: 32000000 });
      if (!["jpeg", "png", "webp"].includes((await image.metadata()).format)) return reply({}, 415);
      photo = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 83 }).toBuffer();
    } catch { return reply({}, 415); }
    const { error } = await storage.upload(path, photo, { upsert: true, contentType: "image/webp", cacheControl: "0" });
    return reply({}, error ? 503 : 200);
  }
  const { data: files, error } = await storage.list(folder, { limit: 4, sortBy: { column: "name", order: "asc" } });
  if (error) return reply({}, 503);
  const paths = files.filter(file => /^[1-4]\.webp$/.test(file.name)).map(file => `${folder}/${file.name}`);
  if (!paths.length) return reply({ canEdit, photos: [] });
  const signed = await storage.createSignedUrls(paths, 3600);
  if (signed.error || signed.data.some(file => !file.signedUrl)) return reply({}, 503);
  return reply({ canEdit, photos: signed.data.map((file, i) => ({ slot: Number(paths[i].split("/")[1][0]), url: file.signedUrl })) });
}

export { handle as GET, handle as PUT, handle as DELETE };
