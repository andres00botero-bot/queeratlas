const isBrowser = () => typeof window !== "undefined" && !!window.sessionStorage;

export function readRuntimeCache(key, maxAgeMs) {
  if (!isBrowser()) return { hit: false, stale: true, data: null };

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return { hit: false, stale: true, data: null };
    const parsed = JSON.parse(raw);
    const updatedAt = Number(parsed?.updatedAt || 0);
    if (!updatedAt || !("data" in (parsed || {}))) {
      return { hit: false, stale: true, data: null };
    }

    const age = Date.now() - updatedAt;
    return {
      hit: true,
      stale: age > Number(maxAgeMs || 0),
      data: parsed.data,
      updatedAt,
    };
  } catch {
    return { hit: false, stale: true, data: null };
  }
}

export function writeRuntimeCache(key, data) {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        updatedAt: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore storage quota/unavailable errors; cache is best-effort only.
  }
}

