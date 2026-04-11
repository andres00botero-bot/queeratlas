"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useActionToast() {
  const [toast, setToast] = useState({ message: "", tone: "ok" });
  const timeoutRef = useRef(null);

  const clearToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast({ message: "", tone: "ok" });
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const { tone = "ok", duration = 2200 } = options;
    if (!message) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ message, tone });
    timeoutRef.current = setTimeout(() => {
      setToast({ message: "", tone: "ok" });
      timeoutRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toast, showToast, clearToast };
}
