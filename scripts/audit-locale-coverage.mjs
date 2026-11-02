import { getClientMessages } from "../src/lib/i18n/messages.js";

const locale = String(process.argv[2] || "fr").trim().toLowerCase();
const source = getClientMessages("en");
const target = getClientMessages(locale);

function collectMissing(sourceValue, targetValue, path = "") {
  if (typeof sourceValue === "string" || typeof sourceValue === "number") {
    return typeof targetValue === "string" || typeof targetValue === "number" ? [] : [path];
  }
  if (!sourceValue || typeof sourceValue !== "object" || Array.isArray(sourceValue)) return [];
  return Object.entries(sourceValue).flatMap(([key, value]) => collectMissing(value, targetValue?.[key], path ? `${path}.${key}` : key));
}

const missing = collectMissing(source, target);
console.log(`${locale} UI coverage: ${Object.keys(source).length} top-level groups checked; ${missing.length} English keys missing.`);
if (missing.length) console.log(missing.join("\n"));
process.exitCode = missing.length ? 1 : 0;
