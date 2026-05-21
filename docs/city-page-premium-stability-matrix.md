# City Page Premium Stability Matrix (Fas A)

Owner: `QUEERATLAS ZERO-CHAOS MODE`
Status: `Batch 1 baseline`

## Scope

This matrix defines the required stability gate before premium UI upgrades continue.
It covers existing city-page behavior and release-critical neighboring flows.

## Hard Gates

1. `npm run lint` must pass.
2. `npm run test:smoke` must pass.
3. `npm run test:e2e-smoke` must pass.
4. `npm run test:regressions` must pass.
5. `npm run build` must pass without post-compile runtime errors.

## Current Baseline (Batch 1)

1. `lint`: pass
2. `test:smoke`: pass
3. `test:e2e-smoke`: pass
4. `test:regressions`: pass
5. `build`: fail (`spawn EPERM` during Next.js "Running TypeScript..." step)

## Functional Regression Matrix (City Page)

### Navigation and Layout

1. Desktop 3-column layout remains top-aligned.
2. Left rail navigation swaps middle content section correctly (`home`, `guide`, `events`, `services`, `venues`).
3. Right map column remains sticky and interactive.
4. Mobile section navigation still scrolls to the correct section.

### Venue Filter Behavior

1. Selecting `Clubs` shows only `club` venues in middle column.
2. Selecting `Bars` shows only `bar` venues.
3. Selecting `Hotels` shows only `hotel` venues.
4. Selecting `Cafes and restaurants` shows only `cafe` and `restaurant` venues.
5. No non-selected venue types are rendered simultaneously.

### City Data Flows

1. Place detail opening/closing works from list and map.
2. Event detail opening/closing works from list and map.
3. Service detail opening/closing works from list and map.
4. Favorites toggling is persisted.
5. Existing admin edit panels still open and save.

### State Integrity

1. Venue filter state does not break map marker rendering.
2. Venue filter state does not break selected detail deep-link behavior (`placeId`, `eventId`, `serviceId`).
3. Hover highlighting does not stick indefinitely.

## Build Failure Triage Notes (`spawn EPERM`)

### Observed

1. `next build` compiles successfully.
2. `runAfterProductionCompile` completes successfully.
3. Failure occurs at `Running TypeScript...` with `Error: spawn EPERM`.

### Verified Local Checks

1. Basic Node child process spawn works (`spawn(process.execPath, ['-v'])`).
2. `npx tsc --noEmit` prints help because no `tsconfig.json` is present.
3. Existing script test suite runs successfully.
4. Direct spawn probes on Windows show script-shim incompatibility:
   - `spawn('node_modules/typescript/bin/tsc', ['--version'])` => `EPERM`
   - `spawn('node_modules/.bin/tsc', ['--version'])` => `EPERM`
   - `spawn('node_modules/.bin/tsc.cmd', ['--version'])` => `EINVAL` (without shell)
   - `spawn('node_modules/.bin/tsc.cmd', ['--version'], { shell: true })` works
5. Runtime version mismatch exists:
   - Project `package.json` engines: `node: 22.x`
   - Active runtime in this environment: `Node v24.14.1`
6. `next build` reaches TypeScript phase and then fails with `spawn EPERM`, consistent with shim spawn failure.

### Working Hypothesis

1. Primary hypothesis: Next's TypeScript phase is attempting to spawn a shim/script path that is not executable directly under current Windows + Node 24 process behavior.
2. The issue is environment/runtime-level and not application logic-level (compile succeeds before TypeScript worker spawn).
3. Node version drift from declared engine (`22.x`) increases risk of this exact subprocess edge case.

## Next Batch (Fas A, Batch 2)

1. Recommended fix path:
   - Align local runtime to Node `22.x` (project-declared engine) and rerun full gate.
2. Fallback path (temporary, lower confidence):
   - Keep Node 24 and bypass Next build type-check subprocess via controlled config workaround, then run script-based regression gates.
3. Do not proceed with premium UI expansion until one path yields deterministic green build.
