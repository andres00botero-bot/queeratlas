"use client";

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
  return (
    <>
      <FloatingHomeButton />
      <MessageAlertGate />
      <PwaInstallGate />
      <TrafficHeartbeat />
    </>
  );
}
