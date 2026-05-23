export function resolveQualityUpdate(action, fallbackSource = "", sourceInput = "") {
  const sourceDefaultByAction =
    action === "1"
      ? fallbackSource || "Community verified"
      : fallbackSource || "Community flagged: closed or moved";

  const sourceByAction = String(sourceInput || "").trim() || sourceDefaultByAction;
  const verified = action === "1";
  const lastChecked = action === "1" ? new Date().toISOString().slice(0, 10) : "";

  return {
    sourceByAction,
    verified,
    lastChecked,
  };
}

export function getQualityToastConfig(action) {
  if (action === "1") {
    return { message: "Trust status updated: verified.", tone: "ok", duration: 2000 };
  }

  return { message: "Trust status updated: closed or moved.", tone: "warn", duration: 2300 };
}
