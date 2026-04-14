import * as Sentry from "@sentry/nextjs";

function sanitizeContext(context = {}) {
  const next = {};
  Object.entries(context || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    next[key] = typeof value === "string" ? value.slice(0, 180) : value;
  });
  return next;
}

export function captureOperationalError(eventName, error, context = {}) {
  try {
    Sentry.withScope((scope) => {
      scope.setTag("qa_event", eventName);
      const safeContext = sanitizeContext(context);
      Object.entries(safeContext).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      scope.setLevel("error");
      Sentry.captureException(error || new Error(eventName));
    });
  } catch {
    // Keep app flow resilient even if monitoring is unavailable.
  }
}

export function captureOperationalMessage(eventName, message, context = {}) {
  try {
    Sentry.withScope((scope) => {
      scope.setTag("qa_event", eventName);
      const safeContext = sanitizeContext(context);
      Object.entries(safeContext).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      scope.setLevel("warning");
      Sentry.captureMessage(message || eventName);
    });
  } catch {
    // Keep app flow resilient even if monitoring is unavailable.
  }
}
