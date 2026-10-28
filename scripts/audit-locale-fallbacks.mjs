import fs from "node:fs";
import path from "node:path";
import { getMessage } from "../src/lib/i18n/messages.js";

const locale = process.argv[2] || "fr";
const roots = ["src/app", "src/components", "src/features"];
const files = [];

function collectFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(filePath);
    else if (entry.name.endsWith(".js")) files.push(filePath);
  }
}

for (const root of roots) collectFiles(root);

const calls = /t\(\s*"([^"]+)"\s*,\s*"([^"]+)"/g;
const missing = [];

for (const filePath of files) {
  const source = fs.readFileSync(filePath, "utf8");
  let match;
  while ((match = calls.exec(source))) {
    const [, key, fallback] = match;
    if (/[A-Za-z]{3}/.test(fallback) && getMessage(locale, key, fallback) === fallback) {
      missing.push({ file: filePath.replaceAll("\\", "/"), key, fallback });
    }
  }
}

console.log(JSON.stringify({ locale, count: missing.length, missing }, null, 2));
