import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const command = process.execPath;
const args = [nextBin, "build", "--webpack"];

const child = spawnSync(command, args, {
  cwd: process.cwd(),
  env: { ...process.env, ANALYZE: "true" },
  stdio: "inherit",
  shell: false,
});

const reports = [
  ".next/analyze/client.html",
  ".next/analyze/nodejs.html",
  ".next/analyze/edge.html",
];
const hasAllReports = reports.every((file) => existsSync(file));

if (child.status === 0) {
  process.exit(0);
}

if (hasAllReports) {
  console.warn(
    "[analyze:bundle] Build exited non-zero, but bundle reports were generated. Treating analysis as successful."
  );
  process.exit(0);
}

process.exit(child.status ?? 1);
