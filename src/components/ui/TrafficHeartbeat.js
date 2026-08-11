"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageVisit } from "@/lib/trafficAnalytics";

export default function TrafficHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    const route = String(pathname || "/");
    trackPageVisit({ pathname: route }).catch(() => {
      // Tracking errors should never block UI behavior.
    });
  }, [pathname]);

  return null;
}
