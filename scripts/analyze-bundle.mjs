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

process.exit(child.status ?? 1);
