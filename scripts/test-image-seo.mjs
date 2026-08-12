import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const publicRoot = join(root, "public");
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"]);
const errors = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = walk(sourceRoot).filter((path) => sourceExtensions.has(extname(path).toLowerCase()));
const sourceText = sourceFiles.map((path) => readFileSync(path, "utf8")).join("\n");

for (const path of sourceFiles) {
  const text = readFileSync(path, "utf8");
  const tags = text.match(/<(?:Image|img)\b[\s\S]*?\/>/g) || [];
  for (const tag of tags) {
    if (!/\balt\s*=/.test(tag)) {
      errors.push(`${relative(root, path)} contains an image without an alt attribute.`);
    }
    if (/alt=(?:"(?:image|photo|picture|graphic)"|'(?:image|photo|picture|graphic)')/i.test(tag)) {
      errors.push(`${relative(root, path)} contains a generic one-word alt text.`);
    }
  }
}

const ignoredPublicNames = new Set([
  "file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg",
  "icon-192.png", "icon-512.png", "qa-logo-192.png", "qa-logo-512.png",
]);

for (const path of walk(publicRoot).filter((entry) => imageExtensions.has(extname(entry).toLowerCase()))) {
  const fileName = path.split(/[\\/]/).at(-1);
  if (ignoredPublicNames.has(fileName)) continue;
  const publicPath = `/${relative(publicRoot, path).replaceAll("\\", "/")}`;
  const stem = fileName.replace(/\.[^.]+$/, "");
  if (stem.length < 8 || /^(?:bgc|image|photo|picture|hero|banner|img)(?:[-_]?\d+)?$/i.test(stem)) {
    errors.push(`${publicPath} needs a more descriptive filename.`);
  }
}

if (errors.length) {
  console.error(`Image SEO check failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Image SEO check passed: filenames are descriptive and every rendered image has an alt attribute.");
