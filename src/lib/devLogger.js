const isDev = process.env.NODE_ENV !== "production";

export function logDevError(...args) {
  if (isDev && typeof console !== "undefined") {
    console.error(...args);
  }
}
