# Release Gate Standard

## Purpose
`verify:release` is the required quality gate for merges to `main`.
It blocks releases when build, regression safety, performance budgets, or SEO contract checks fail.

## Command
```bash
npm run verify:release
```

## Current Gate Pipeline
1. `npm run lint`
2. `npm run build`
3. `npm run test:smoke`
4. `npm run test:e2e-smoke`
5. `npm run test:regressions`
6. `npm run test:map-guard-smoke`
7. `npm run test:internal-link-depth`
8. `npm run test:entity-consistency`
9. `npm run analyze:bundle`
10. `node scripts/verify-bundle-budget.mjs`
11. `node scripts/verify-seo-gate.mjs`
12. `npm run seo:health-report`
13. `npm run seo:health-weekly-report`

## Performance Budgets (client analyzer)
Defined in `scripts/verify-bundle-budget.mjs`.

- `assetCount <= 90`
- `initialParsed <= 2_600_000`
- `initialGzip <= 750_000`
- `maxAssetParsed <= 1_100_000`
- `maxAssetGzip <= 300_000`

## SEO Contract Checks
Defined in `scripts/verify-seo-gate.mjs`.

- Global metadata baseline in `src/app/layout.js`
- Route metadata contract for indexed pages
- Dynamic city metadata contract
- Sitemap route coverage checks
- Robots baseline checks
- Structured data presence checks for city/news/guide surfaces

## SEO Observability Output
- `seo:health-report` provides current snapshot/crawler/CWV health summary.
- `seo:health-weekly-report` generates `reports/seo-health-weekly-latest.md` for trend tracking.
- If Supabase env vars are missing, both commands skip safely and do not fail release gate.
- Release Verify workflow uploads `reports/seo-health-weekly-latest.md` as artifact `seo-health-weekly-report` when available.
- Release Verify workflow also exports `reports/seo-health-latest.json` and uploads artifact `seo-health-json-snapshot`.

## Failure Handling
1. Fix root cause (no temporary patching).
2. Re-run `npm run verify:release`.
3. Merge only when all checks pass.

## Security Note
If a GitHub token is exposed in logs/chat, revoke it immediately and create a new token.
