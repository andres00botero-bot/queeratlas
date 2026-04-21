const SIGNAL_WINDOW_HOURS = 6;
const SIGNAL_WINDOW_MS = SIGNAL_WINDOW_HOURS * 60 * 60 * 1000;

export const LIVE_VIBE_OPTIONS = [
  {
    key: "packed",
    emoji: "🔥",
    label: "Packed",
    shortLabel: "Busy right now",
    buttonClass:
      "border-rose-200/28 bg-rose-200/12 text-rose-100 hover:border-rose-200/48",
  },
  {
    key: "dancing",
    emoji: "💃",
    label: "Dancing",
    shortLabel: "Dance energy",
    buttonClass:
      "border-fuchsia-200/28 bg-fuchsia-200/12 text-fuchsia-100 hover:border-fuchsia-200/48",
  },
  {
    key: "dead",
    emoji: "🧊",
    label: "Quiet",
    shortLabel: "Quiet right now",
    buttonClass:
      "border-cyan-200/28 bg-cyan-200/12 text-cyan-100 hover:border-cyan-200/48",
  },
  {
    key: "off_vibe",
    emoji: "⚠️",
    label: "Off vibe",
    shortLabel: "Feels off",
    buttonClass:
      "border-amber-200/28 bg-amber-200/12 text-amber-100 hover:border-amber-200/48",
  },
];

export function isMissingTableError(error) {
  const code = String(error?.code || "");
  return code === "42P01" || code === "PGRST205";
}

function toTimestamp(value) {
  const ms = new Date(value || "").getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function summarizeLiveVibeSignals(rows) {
  const now = Date.now();
  const validKeys = new Set(LIVE_VIBE_OPTIONS.map((item) => item.key));
  const baseCounts = Object.fromEntries(LIVE_VIBE_OPTIONS.map((item) => [item.key, 0]));
  let latestTimestamp = null;

  for (const row of Array.isArray(rows) ? rows : []) {
    const key = String(row?.signal_key || "").trim();
    if (!validKeys.has(key)) continue;

    const timestamp = toTimestamp(row?.created_at);
    if (!timestamp) continue;
    if (timestamp < now - SIGNAL_WINDOW_MS) continue;

    baseCounts[key] += 1;
    if (!latestTimestamp || timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
    }
  }

  const ranked = LIVE_VIBE_OPTIONS
    .map((item) => ({
      ...item,
      count: baseCounts[item.key] || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const total = ranked.reduce((sum, item) => sum + item.count, 0);
  const top = ranked.filter((item) => item.count > 0).slice(0, 2);

  return {
    total,
    countsByKey: baseCounts,
    ranked,
    top,
    latestTimestamp,
    windowHours: SIGNAL_WINDOW_HOURS,
  };
}

export function formatLiveVibeUpdatedAt(timestamp) {
  if (!timestamp) return "";
  const diffMinutes = Math.max(0, Math.round((Date.now() - Number(timestamp)) / 60000));
  if (diffMinutes < 1) return "Updated just now";
  if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  return `Updated ${Math.round(diffHours / 24)}d ago`;
}

export function buildLiveVibeHeadline(summary) {
  if (!summary || !summary.total || !summary.top?.length) {
    return "Be the first to signal this venue now.";
  }
  const topA = summary.top[0];
  const topB = summary.top[1];
  if (!topB) {
    return `${topA.emoji} ${topA.shortLabel}`;
  }
  return `${topA.emoji} ${topA.shortLabel} · ${topB.emoji} ${topB.shortLabel}`;
}

export function getLiveVibePulse(summary) {
  const total = Number(summary?.total || 0);
  if (total >= 16) {
    return {
      label: "High pulse",
      className: "border-emerald-200/28 bg-emerald-200/12 text-emerald-100",
      hint: "Strong live confidence",
    };
  }
  if (total >= 8) {
    return {
      label: "Rising pulse",
      className: "border-cyan-200/28 bg-cyan-200/12 text-cyan-100",
      hint: "Momentum building now",
    };
  }
  if (total >= 3) {
    return {
      label: "Early pulse",
      className: "border-amber-200/28 bg-amber-200/12 text-amber-100",
      hint: "Still stabilizing",
    };
  }
  return {
    label: "Low pulse",
    className: "border-white/20 bg-white/8 text-white/80",
    hint: "Needs more taps",
  };
}

export function getLiveVibeConsensus(summary) {
  const topCount = Number(summary?.top?.[0]?.count || 0);
  const total = Number(summary?.total || 0);
  if (!total || !topCount) return 0;
  return Math.round((topCount / total) * 100);
}

export function getLiveVibeMemberMomentum(rows, userId) {
  const memberId = String(userId || "").trim();
  if (!memberId) {
    return {
      streakDays: 0,
      weekTaps: 0,
      todayTapped: false,
      lastTapLabel: "",
    };
  }

  const uniqueByDay = new Set();
  const now = Date.now();
  const todayKey = new Date(now).toISOString().slice(0, 10);
  let weekTaps = 0;
  let latestMs = null;

  for (const row of Array.isArray(rows) ? rows : []) {
    if (String(row?.user_id || "") !== memberId) continue;
    const ms = new Date(row?.created_at || "").getTime();
    if (!Number.isFinite(ms)) continue;

    const dayKey = new Date(ms).toISOString().slice(0, 10);
    uniqueByDay.add(dayKey);
    if (ms >= now - 7 * 24 * 60 * 60 * 1000) {
      weekTaps += 1;
    }
    if (!latestMs || ms > latestMs) {
      latestMs = ms;
    }
  }

  let streakDays = 0;
  for (let i = 0; i < 30; i += 1) {
    const day = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (!uniqueByDay.has(day)) break;
    streakDays += 1;
  }

  let lastTapLabel = "";
  if (latestMs) {
    const mins = Math.max(0, Math.round((now - latestMs) / 60000));
    if (mins < 1) {
      lastTapLabel = "Just now";
    } else if (mins < 60) {
      lastTapLabel = `${mins}m ago`;
    } else {
      const hours = Math.round(mins / 60);
      if (hours < 24) {
        lastTapLabel = `${hours}h ago`;
      } else {
        lastTapLabel = `${Math.round(hours / 24)}d ago`;
      }
    }
  }

  return {
    streakDays,
    weekTaps,
    todayTapped: uniqueByDay.has(todayKey),
    lastTapLabel,
  };
}
