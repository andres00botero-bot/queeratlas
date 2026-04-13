# SEO Indexing Playbook (Queer Atlas)

This is the practical runbook to move from "indexed sometimes" to stable discoverability.

## 1) Search Console weekly rhythm

1. Open Google Search Console and review:
- Indexing > Pages
- Performance > Search results
- Sitemaps
2. For "Duplicate without user-selected canonical":
- Inspect affected URL
- Confirm canonical points to the intended URL
- Click "Validate fix" after deploying corrections
3. For "Page with redirect":
- Confirm redirect is intentional (legacy route, slash normalization, etc.)
4. For "Crawled - currently not indexed":
- Improve uniqueness/content depth and internal links, then request recrawl for priority pages.

## 2) Sitemap and canonical hygiene

1. Keep sitemap URL as:
- `https://queeratlas.app/sitemap.xml`
2. Ensure every indexable page has a canonical to itself.
3. Keep gated/private pages non-indexed:
- `/favorites`
- `/contribute`
- `/community`

## 3) Content-to-index actions (high impact)

1. Publish at least 2-3 meaningful updates weekly:
- city guide improvements
- event updates
- world news updates
2. Ensure each city page has:
- unique hero summary
- unique quick guide depth
- fresh venue/event descriptions
3. Add internal links from Home/Now to city pages and guide landers.

## 4) Expectation window

- Major SEO improvements usually need 1-3 weeks after:
  - deploy
  - recrawl
  - validation cycle

Treat Search Console as a cycle, not a one-time task.
