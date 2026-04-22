export function inviteStatusLabel(value) {
  const key = String(value || "").trim().toLowerCase();
  if (key === "accepted") return "Accepted";
  if (key === "declined") return "Declined";
  if (key === "cancelled") return "Cancelled";
  return "Requested";
}

export function cityHref(value) {
  const slug = String(value || "").trim().toLowerCase();
  if (!slug) return "/cities";
  return `/${slug}`;
}

export function formatInviteTimeline({ requestedAt, decidedAt, status }) {
  const requested = requestedAt ? new Date(requestedAt) : null;
  const decided = decidedAt ? new Date(decidedAt) : null;
  const statusKey = String(status || "").trim().toLowerCase();

  const requestedLabel = requested && !Number.isNaN(requested.getTime())
    ? requested.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "Unknown time";

  if (statusKey === "requested") {
    return `Requested ${requestedLabel}`;
  }

  const decidedLabel = decided && !Number.isNaN(decided.getTime())
    ? decided.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "updated recently";

  return `Requested ${requestedLabel} · Updated ${decidedLabel}`;
}

