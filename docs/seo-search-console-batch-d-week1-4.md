# Queer Atlas SEO Batch D: Search Console Playbook (Week 1-4)

## Scope
- No UI changes.
- No content rewrites.
- No feature changes.
- Focus: query-to-landing monitoring, CTR uplift, indexation quality, and safe iteration.

## Source of truth
- Query clusters and landing pages are defined in:
  - `src/lib/seo/queryLandingMap.js`
- City intent expansion is defined in:
  - `getCityQuerySuggestions(city)`

## KPI targets (first 4 weeks)
- Coverage:
  - 100% of target landing pages indexed.
- CTR:
  - +15% CTR uplift on pages with baseline impressions >= 300.
- Average position:
  - +1.0 improvement on priority queries where rank is 6-20.
- Query-page match quality:
  - Reduce mismatched query impressions by 30%.

## Landing pages and priority query clusters
1. `/`
- `lgbtq travel`
- `gay travel`
- `queer travel`
- `queer vibe`
- `inclusive nightlife`

2. `/gay-guide`
- `gay travel guide`
- `queer traveler guide`
- `queer friendly places`
- `gay bars near me`

3. `/queer-guide`
- `safe queer nightlife`
- `queer safe spaces`
- `lgbtq travel safety`
- `lgbtq safety map`

4. `/cities`
- `gay friendly cities`
- `safest cities for gay travelers`
- `lgbtq friendly countries`

5. `/events`
- `lgbtq events`
- `lgbtq nightlife`
- `inclusive nightlife events`

6. `/now`
- `is berlin safe for lgbtq`
- `safe queer nightlife`
- `lgbtq travel safety`

7. `/{city}` pages (examples)
- `queer nightlife berlin`
- `best gay bars madrid`
- `lgbtq events barcelona`
- `techno clubs berlin queer`
- `lesbian bars amsterdam`
- `queer friendly cafes lisbon`

## Weekly execution
### Week 1: Baseline and indexing control
1. Open Google Search Console performance report (last 28 days).
2. Filter by each landing page above and export:
- clicks
- impressions
- CTR
- average position
3. In URL Inspection, verify indexing state for:
- `/`
- `/cities`
- `/events`
- `/now`
- `/gay-guide`
- `/queer-guide`
- `/hbtq-guide`
- top 10 city pages
4. Submit sitemap refresh if needed:
- `https://www.queeratlas.app/sitemap.xml`
5. Mark any page with `Excluded`/`Crawled - currently not indexed` as P1.

### Week 2: CTR tuning loop (metadata-only)
1. Identify pages with:
- impressions >= 300
- CTR below site median
2. For those pages:
- tune title + meta description variants only
- keep content/layout unchanged
3. Re-request indexing only for changed pages.
4. Track before/after in a simple sheet.

### Week 3: Query-page alignment and cannibalization control
1. For each priority query, confirm intended landing page gets most impressions.
2. If a wrong page dominates:
- adjust metadata emphasis on intended page
- reduce overlap terms in non-owner page metadata
3. Watch city-level overlap:
- avoid multiple city pages over-targeting the same phrase without city token.

### Week 4: Consolidation and scale
1. Freeze winning snippets (best CTR after 14+ days).
2. Expand to next 20 city pages using same pattern.
3. Re-check crawl/index for all changed URLs.
4. Publish monthly SEO report with:
- winners
- underperformers
- next month patch list

## Decision thresholds (safe rules)
- Keep: CTR up >= 10% with stable or better position.
- Revert: CTR down >= 10% for 14 days with no impression growth.
- Escalate: impressions high, position 8-20, CTR low -> snippet rewrite candidate.
- Do not touch: pages with low impressions (<100) until more data accumulates.

## Cannibalization guard
- One primary intent per landing page.
- Keep query ownership mapped to:
  - home intent -> `/`
  - guide intent -> `/gay-guide`
  - safety intent -> `/queer-guide` and `/now`
  - city discovery -> `/cities`
  - event intent -> `/events`
- City-intent phrases should resolve to `/{city}` pages first.

## QA checklist (every SEO patch)
- `npm run lint` passes.
- `npm run test:smoke` passes.
- `npm run test:regressions` passes.
- No UI diffs expected.
- Canonical remains correct.

## Monthly report template
1. Top 10 query gains (clicks, CTR, position delta).
2. Top 10 query drops (root cause + action).
3. Indexation issues count and resolved count.
4. Query-page mismatch list.
5. Next patch backlog (metadata-only first).

