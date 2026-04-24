import { spawn } from "node:child_process";

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", [command, ...args].join(" ")], { stdio: "inherit" })
      : spawn(command, args, { stdio: "inherit", shell: false });

    child.on("close", (code) => {
      resolve(Number(code || 0));
    });
    child.on("error", () => {
      resolve(1);
    });
  });
}

async function runStep(label, command, args, { retries = 0, retryDelayMs = 2500 } = {}) {
  let attempt = 0;
  const totalAttempts = retries + 1;

  while (attempt < totalAttempts) {
    attempt += 1;
    if (attempt > 1) {
      console.log(`[verify:release] Retrying ${label} (${attempt}/${totalAttempts})...`);
    } else {
      console.log(`[verify:release] Running ${label}...`);
    }

    const code = await runCommand(command, args);
    if (code === 0) {
      return;
    }

    if (attempt >= totalAttempts) {
      throw new Error(`${label} failed with exit code ${code}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }
}

async function main() {
  await runStep("lint", "npm", ["run", "lint"]);
  await runStep("smoke tests", "npm", ["run", "test:smoke"]);
  await runStep("production build", "npm", ["run", "build"], { retries: 2, retryDelayMs: 3000 });
  console.log("[verify:release] All checks passed.");
}

main().catch((error) => {
  console.error(`[verify:release] ${error.message}`);
  process.exit(1);
});
