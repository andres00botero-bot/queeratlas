# SEO Observability Step 5

Purpose: run a fast, read-only SEO health report before/after SEO batches to catch crawl/index/CWV drift.

## Command

```bash
npm run seo:health-report
npm run seo:health-weekly-report
```

Optional flags:

```bash
node scripts/seo-health-report.mjs --json
node scripts/seo-health-report.mjs --max-snapshot-age-hours 24
node scripts/seo-health-report.mjs --strict
node scripts/seo-health-weekly-report.mjs --out reports/seo-health-weekly-custom.md
```

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (required for server-only telemetry writes and reports)
- `QA_SEO_TELEMETRY=1`
- `NEXT_PUBLIC_ENABLE_SEO_TELEMETRY=1`
- `QA_SEO_TELEMETRY_KEY` (required for trusted crawler capture)

Public Supabase keys are never used as a server fallback. Run both Step 5 SQL files before enabling telemetry.

## Expected Output

- `overall_status` (`pass` | `warn` | `fail`)
- Latest snapshot id/time/age + check counters
- Top check statuses
- CWV latest-day coverage and failing route count
- Crawler activity (last 7 days)

Crawler rows represent observed user-agent signals. They are useful for trends but are not proof that
the request originated from a search engine's verified IP range.

## Deployment Order

1. Run `supabase/seo-telemetry-v1.sql`.
2. Run `supabase/seo-health-snapshot-v1.sql`.
3. Deploy the app with all required environment variables.
4. Open `/admin/seo-observability` and create a fresh health snapshot.
5. Confirm the latest snapshot has no unexpected `fail` checks.

## Usage Pattern

1. Run report before SEO batch.
2. Apply one SEO batch.
3. Run report again.
4. Compare status + warnings and proceed only if no unexpected regressions.
5. Run weekly report for trend summary and archive in release notes.
