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
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for admin telemetry tables)

Fallback keys are supported, but service role is the stable option for admin-only tables.

## Expected Output

- `overall_status` (`pass` | `warn` | `fail`)
- Latest snapshot id/time/age + check counters
- Top check statuses
- CWV latest-day coverage and failing route count
- Crawler activity (last 7 days)

## Usage Pattern

1. Run report before SEO batch.
2. Apply one SEO batch.
3. Run report again.
4. Compare status + warnings and proceed only if no unexpected regressions.
5. Run weekly report for trend summary and archive in release notes.
