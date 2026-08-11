import { cityCoreConfig } from "@/lib/cityCore";
import { supabase } from "@/lib/supabase";
import {
  inferTrafficCity,
  inferTrafficDevice,
  isLikelyTrafficBot,
  isTrackableTrafficPath,
  normalizeTrafficPath,
  normalizeTrafficReferrer,
} from "@/lib/trafficCore";

export const dynamic = "force-dynamic";

const validCities = new Set(Object.keys(cityCoreConfig));

function clean(value, maxLength = 160) {
  return String(value || "").trim().slice(0, maxLength);
}

function isMissingTrafficRpc(error) {
  const code = String(error?.code || "").toUpperCase();
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return code === "42883" || code === "PGRST202" || text.includes("qa_record_page_view");
}

export async function POST(request) {
  const startedAt = Date.now();
  const requestId = request.headers.get("x-vercel-id") || "local";
  const userAgent = request.headers.get("user-agent") || "";
  console.log(JSON.stringify({
    level: "info",
    message: "traffic_page_view_start",
    route: "/api/traffic/page-view",
    requestId,
  }));

  try {
    if (isLikelyTrafficBot(userAgent)) {
      return new Response(null, { status: 204 });
    }

    const body = await request.json();
    const route = normalizeTrafficPath(body?.route || "/");
    if (!isTrackableTrafficPath(route)) {
      return new Response(null, { status: 204 });
    }

    const eventId = clean(body?.eventId, 40);
    const visitorId = clean(body?.visitorId, 40);
    const sessionId = clean(body?.sessionId, 40);
    if (!eventId || !visitorId || !sessionId) {
      return Response.json({ ok: false, message: "Invalid traffic event." }, { status: 400 });
    }

    const countryCode = clean(request.headers.get("x-vercel-ip-country"), 2).toUpperCase();
    const regionCode = clean(request.headers.get("x-vercel-ip-country-region"), 100);
    const { data, error } = await supabase.rpc("qa_record_page_view", {
      p_event_id: eventId,
      p_route: route,
      p_city: inferTrafficCity(route, validCities) || null,
      p_visitor_id: visitorId,
      p_session_id: sessionId,
      p_referrer_host: normalizeTrafficReferrer(body?.referrer) || null,
      p_utm_source: clean(body?.utmSource) || null,
      p_utm_medium: clean(body?.utmMedium) || null,
      p_utm_campaign: clean(body?.utmCampaign, 200) || null,
      p_device_type: inferTrafficDevice(userAgent),
      p_country_code: /^[A-Z]{2}$/.test(countryCode) ? countryCode : null,
      p_region_code: regionCode || null,
      p_browser_language: clean(body?.language, 40) || null,
    });

    if (error) {
      const setupRequired = isMissingTrafficRpc(error);
      console.error(JSON.stringify({
        level: "error",
        message: "traffic_page_view_failed",
        route: "/api/traffic/page-view",
        requestId,
        error: String(error.message || "Traffic RPC failed."),
        setupRequired,
        durationMs: Date.now() - startedAt,
      }));
      return Response.json(
        { ok: false, setupRequired, message: setupRequired ? "Traffic v2 is not installed." : "Tracking failed." },
        { status: setupRequired ? 503 : 500 },
      );
    }

    console.log(JSON.stringify({
      level: "info",
      message: "traffic_page_view_done",
      route: "/api/traffic/page-view",
      requestId,
      recorded: Boolean(data),
      durationMs: Date.now() - startedAt,
    }));
    return Response.json({ ok: true, recorded: Boolean(data) }, { status: 202 });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "traffic_page_view_exception",
      route: "/api/traffic/page-view",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    }));
    return Response.json({ ok: false, message: "Invalid tracking request." }, { status: 400 });
  }
}
