export function createInitialCityReportDraft(defaultReasonKey = "safety") {
  return {
    targetType: "place",
    targetId: "",
    title: "",
    reasonKey: defaultReasonKey,
    details: "",
  };
}

export function createCityReportDraftFromTarget(target = {}, defaultReasonKey = "safety") {
  return {
    targetType: String(target.targetType || "place"),
    targetId: String(target.targetId || ""),
    title: String(target.title || "Reported item"),
    reasonKey: defaultReasonKey,
    details: "",
  };
}

export function createInitialCityQualityModal() {
  return {
    open: false,
    targetType: "place",
    targetId: "",
    action: "1",
    sourceInput: "",
    fallbackSource: "",
  };
}

export function createCityQualityModalFromTarget(target = {}, knownSource = "") {
  return {
    open: true,
    targetType: String(target.targetType || "place"),
    targetId: String(target.targetId || ""),
    action: "1",
    sourceInput: String(knownSource || ""),
    fallbackSource: String(knownSource || ""),
  };
}
