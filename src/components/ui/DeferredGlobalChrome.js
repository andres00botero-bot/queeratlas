"use client";

import { useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import FloatingHomeButton from "@/components/ui/FloatingHomeButton";
import MessageAlertGate from "@/components/messaging/MessageAlertGate";
import PwaInstallGate from "@/components/pwa/PwaInstallGate";

function scheduleIdle(callback, timeout = 900) {
  if (typeof window === "undefined") return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout });
    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle);
      }
    };
  }

  const fallback = window.setTimeout(callback, Math.min(timeout, 450));
  return () => window.clearTimeout(fallback);
}

export default function DeferredGlobalChrome() {
  const [showUiChrome, setShowUiChrome] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const cleanupUi = scheduleIdle(() => {
      if (!mountedRef.current) return;
      setShowUiChrome(true);
    }, 800);

    const cleanupAnalytics = scheduleIdle(() => {
      if (!mountedRef.current) return;
      setShowAnalytics(true);
    }, 1800);

    return () => {
      mountedRef.current = false;
      cleanupUi();
      cleanupAnalytics();
    };
  }, []);

  return (
    <>
      {showUiChrome ? (
        <>
          <FloatingHomeButton />
          <MessageAlertGate />
          <PwaInstallGate />
        </>
      ) : null}
      {showAnalytics ? <Analytics /> : null}
    </>
  );
}
