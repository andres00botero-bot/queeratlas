"use client";

export function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeLocalJson(key, value) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function writeLocalValue(key, value) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}
