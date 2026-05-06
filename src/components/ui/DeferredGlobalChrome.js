"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const FloatingHomeButton = dynamic(() => import("@/components/ui/FloatingHomeButton"), {
  ssr: false,
});
const MessageAlertGate = dynamic(() => import("@/components/messaging/MessageAlertGate"), {
  ssr: false,
});
const PwaInstallGate = dynamic(() => import("@/components/pwa/PwaInstallGate"), {
  ssr: false,
});
const TrafficHeartbeat = dynamic(() => import("@/components/ui/TrafficHeartbeat"), {
  ssr: false,
});

export default function DeferredGlobalChrome() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(() => setIsReady(true), { timeout: 1200 });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setIsReady(true), 220);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isReady) return null;

  return (
    <>
      <FloatingHomeButton />
      <MessageAlertGate />
      <PwaInstallGate />
      <TrafficHeartbeat />
    </>
  );
}
