# Release Gate Standard

## Purpose
`verify:release` is the required quality gate for merges to `main`.
It blocks releases when build, regression safety, performance budgets, or SEO contract checks fail.

## Command
```bash
npm run verify:release
```

## Current Gate Pipeline
The authoritative command is `verify:release` in `package.json`. It runs lint,
search, data, security-serialization, regression and SEO checks, followed by an
analyzed production build and the bundle and SEO gates. Run the isolated database
security test separately after `npm run setup:member-privacy-tests`:

```bash
npm run test:contact-cron-security
```

## Performance Budgets (client analyzer)
Defined in `scripts/verify-bundle-budget.mjs`.

- `maxTotalAssets <= 150`
- `maxEntrypointAssets <= 16`
- `maxEntrypointParsed <= 850_000`
- `maxEntrypointGzip <= 240_000`
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

## Failure Handling
1. Fix root cause (no temporary patching).
2. Re-run `npm run verify:release`.
3. Merge only when all checks pass.

## Security Note
If a GitHub token is exposed in logs/chat, revoke it immediately and create a new token.
