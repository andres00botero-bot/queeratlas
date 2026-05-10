"use client";

import { useEffect, useState } from "react";

const MAPBOX_STYLESHEET_ID = "qa-mapbox-gl-stylesheet";
const MAPBOX_STYLESHEET_HREF = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";

export function useMapboxStylesheet() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const existing = document.getElementById(MAPBOX_STYLESHEET_ID);
    if (existing && existing.tagName === "LINK") {
      if (existing.sheet) {
        queueMicrotask(() => setIsReady(true));
        return;
      }

      const markReady = () => setIsReady(true);
      existing.addEventListener("load", markReady, { once: true });
      existing.addEventListener("error", markReady, { once: true });
      return () => {
        existing.removeEventListener("load", markReady);
        existing.removeEventListener("error", markReady);
      };
    }

    const link = document.createElement("link");
    link.id = MAPBOX_STYLESHEET_ID;
    link.rel = "stylesheet";
    link.href = MAPBOX_STYLESHEET_HREF;

    const markReady = () => setIsReady(true);
    link.addEventListener("load", markReady, { once: true });
    link.addEventListener("error", markReady, { once: true });
    document.head.appendChild(link);

    return () => {
      link.removeEventListener("load", markReady);
      link.removeEventListener("error", markReady);
    };
  }, []);

  return isReady;
}
