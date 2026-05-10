function hasWebGlSupport(mapboxgl) {
  if (!mapboxgl || typeof mapboxgl.supported !== "function") return true;
  try {
    return mapboxgl.supported({ failIfMajorPerformanceCaveat: false });
  } catch {
    return false;
  }
}

export function evaluateMapInitReadiness({
  mapboxgl,
  isMapboxStylesReady,
  mapboxToken,
  container,
  mapInstance,
  requireWebGl = true,
} = {}) {
  if (!isMapboxStylesReady) {
    return { ready: false, reason: "stylesheet_not_ready" };
  }

  if (!mapboxToken) {
    return { ready: false, reason: "token_missing" };
  }

  if (!container) {
    return { ready: false, reason: "container_missing" };
  }

  if (mapInstance) {
    return { ready: false, reason: "already_initialized" };
  }

  if (requireWebGl && !hasWebGlSupport(mapboxgl)) {
    return { ready: false, reason: "webgl_unsupported" };
  }

  return { ready: true, reason: "ready" };
}

export function shouldTriggerMapFallback(reason = "") {
  const normalizedReason = String(reason || "").trim().toLowerCase();
  return normalizedReason === "webgl_unsupported" || normalizedReason === "token_missing";
}
