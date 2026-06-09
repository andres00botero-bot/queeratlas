export async function notifyIndexNowUrls({
  urls = [],
  accessToken = "",
  source = "admin-publish",
} = {}) {
  const token = String(accessToken || "").trim();
  if (!token || !Array.isArray(urls) || urls.length === 0) {
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch("/api/admin/indexnow", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls, source }),
    });
    const result = await response.json().catch(() => null);
    return result || { ok: response.ok };
  } catch {
    return { ok: false, skipped: true };
  }
}
