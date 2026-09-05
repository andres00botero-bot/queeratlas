export function safeJsonLd(value) {
  return (JSON.stringify(value) || "null").replace(/</g, "\\u003c");
}
