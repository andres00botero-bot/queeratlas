function safeParseJson(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function getSupabaseErrorSignals(error) {
  const codes = new Set();
  const messages = [];

  const addCode = (value) => {
    const normalized = String(value || "").trim();
    if (normalized) codes.add(normalized);
  };

  const addMessage = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized) messages.push(normalized);
  };

  addCode(error?.code);
  addMessage(error?.message);
  addMessage(error?.details);
  addMessage(error?.hint);

  const parsedMessage = safeParseJson(error?.message);
  if (parsedMessage && typeof parsedMessage === "object") {
    addCode(parsedMessage.code);
    addMessage(parsedMessage.message);
    addMessage(parsedMessage.details);
    addMessage(parsedMessage.hint);
  }

  return { codes, messages };
}

export function isMissingPlacesWithStatsLocation(error) {
  const { codes, messages } = getSupabaseErrorSignals(error);
  const hasMissingLocationMessage = messages.some(
    (message) =>
      message.includes("places_with_stats.location") ||
      (message.includes("places_with_stats") && message.includes("location") && message.includes("does not exist"))
  );
  if (!hasMissingLocationMessage) return false;
  return codes.has("42703") || messages.some((message) => message.includes("42703"));
}
