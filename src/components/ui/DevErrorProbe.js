"use client";

import { useEffect } from "react";

const isDev = process.env.NODE_ENV !== "production";
const LOG_PREFIX = "[dev-error-probe]";
const STACK_PREVIEW_LINES = 6;

function buildErrorMeta() {
  if (typeof window === "undefined") {
    return {
      path: "",
      href: "",
      timestamp: new Date().toISOString(),
    };
  }

  return {
    path: String(window.location.pathname || ""),
    href: String(window.location.href || ""),
    timestamp: new Date().toISOString(),
  };
}

export default function DevErrorProbe() {
  useEffect(() => {
    if (!isDev || typeof window === "undefined" || typeof console === "undefined") {
      return;
    }

    const stackPreview = (rawStack = "") => {
      const stack = String(rawStack || "").trim();
      if (!stack) return "";
      return stack
        .split("\n")
        .slice(0, STACK_PREVIEW_LINES)
        .join("\n");
    };

    const onError = (event) => {
      const meta = buildErrorMeta();
      const error = event?.error;
      const message = String(error?.message || event?.message || "Unknown error");
      const stack = String(error?.stack || "");

      console.error(`${LOG_PREFIX} uncaughtError @ ${meta.path || "/"}`, {
        message,
        stackPreview: stackPreview(stack),
        stack,
        source: String(event?.filename || ""),
        line: Number(event?.lineno || 0) || null,
        column: Number(event?.colno || 0) || null,
        ...meta,
      });
    };

    const onUnhandledRejection = (event) => {
      const meta = buildErrorMeta();
      const reason = event?.reason;
      const message =
        typeof reason === "string"
          ? reason
          : String(reason?.message || "Unhandled promise rejection");
      const stack = String(reason?.stack || "");

      console.error(`${LOG_PREFIX} unhandledRejection @ ${meta.path || "/"}`, {
        message,
        stackPreview: stackPreview(stack),
        stack,
        ...meta,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
