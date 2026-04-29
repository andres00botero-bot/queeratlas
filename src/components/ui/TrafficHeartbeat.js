"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { trackPageVisit } from "@/lib/trafficAnalytics";

export default function TrafficHeartbeat() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const route = String(pathname || "/");
    trackPageVisit({
      pathname: route,
      userId: user?.id || "",
    }).catch(() => {
      // Tracking errors should never block UI behavior.
    });
  }, [pathname, user?.id]);

  return null;
}
