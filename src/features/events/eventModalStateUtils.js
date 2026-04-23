export function createInitialReportDraft(defaultReasonKey = "safety") {
  return {
    targetId: "",
    title: "",
    city: "",
    reasonKey: defaultReasonKey,
    details: "",
  };
}

export function createReportDraftFromEvent(event, defaultReasonKey = "safety") {
  return {
    targetId: String(event?.id || ""),
    title: String(event?.name || "Reported event"),
    city: String(event?.city || "Global"),
    reasonKey: defaultReasonKey,
    details: "",
  };
}

export function createInitialQualityModal() {
  return {
    open: false,
    eventId: "",
    action: "1",
    sourceInput: "",
    fallbackSource: "",
    isGlobal: false,
  };
}

export function createQualityModalFromEvent(event, fallbackSource = "") {
  return {
    open: true,
    eventId: String(event?.id || ""),
    action: "1",
    sourceInput: String(fallbackSource || ""),
    fallbackSource: String(fallbackSource || ""),
    isGlobal: Boolean(event?.isGlobal),
  };
}
