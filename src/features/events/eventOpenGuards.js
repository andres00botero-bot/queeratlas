export function resolveEventOpenIntent(event) {
  const id = String(event?.id || "").trim();
  if (!id) return { kind: "none" };

  if (Boolean(event?.isGlobal)) {
    return { kind: "offgrid", id };
  }

  return {
    kind: "city",
    id,
    city: String(event?.city || ""),
  };
}
