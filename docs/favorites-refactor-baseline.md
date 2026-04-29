# Favorites Refactor Baseline

Created: 2026-04-29 12:17:00 +02:00  
Baseline commit: `ea1a534`

## Scope
This baseline covers `/favorites` behavior before modular refactor work.

## Functional Checklist
Validation mode for this step: automated logic + wiring checks (`scripts/test-favorites-baseline.mjs`) plus release test suite.

- [x] Map in check-in section can resolve saved markers directly from saved data.
- [x] Check-in create flow is wired.
- [x] Check-in edit flow is wired.
- [x] Check-in delete flow is wired.
- [x] Trip planner create/save flow is wired.
- [x] Trip planner remove flow is wired.
- [x] Saved places panel open/check-in/remove actions are wired.
- [x] Saved events panel open/check-in/remove actions are wired.
- [x] Remove favorite flow is wired for places/events.
- [x] Signal deck toggle wiring is present.
- [x] Trust network refresh wiring is present.
- [x] Follow/unfollow wiring is present.
- [x] "Saved by people you follow" add/save wiring is present.

## Automated Verification (completed)
- `npm run lint` passed
- `npm run test:smoke` passed
- `npm run test:e2e-smoke` passed
- `npm run test:regressions` passed
- `npm run verify:release` passed
- `node scripts/test-favorites-baseline.mjs` passed

## Performance Snapshot
- [ ] Lighthouse desktop run on `/favorites`
- [ ] Lighthouse mobile run on `/favorites`
- [ ] Record Performance/LCP/TBT/CLS

Status:
- Lighthouse CLI execution is blocked in this Windows environment by `EPERM` during Chrome temp cleanup.
- Command reached Lighthouse runtime, but report generation fails at temp folder teardown, so no trustworthy JSON report was produced.

## Notes
- This file is the reference checkpoint before modular refactor steps.
- Map logic remains on the stable pre-optimization flow.
